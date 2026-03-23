import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../../store';
import { USERS } from '../../data/generator';
import { Status, Priority } from '../../types';
import { useHasActiveFilters } from '../../hooks/useURLSync';

type OpenDropdown = 'status' | 'priority' | 'assignee' | null;

// ✅ Properly typed arrays
const STATUSES: Status[] = ['todo', 'in-progress', 'in-review', 'done'];
const PRIORITIES: Priority[] = ['critical', 'high', 'medium', 'low'];

export default function FilterBar() {
  const { filters, setFilters, clearFilters } = useStore((s) => ({
    filters: s.filters,
    setFilters: s.setFilters,
    clearFilters: s.clearFilters,
  }));

  const hasActive = useHasActiveFilters();
  const [open, setOpen] = useState<OpenDropdown>(null);

  // ✅ Fix ref typing
  const ref = useRef<HTMLDivElement | null>(null);

  // ✅ Fix outside click handler
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () =>
      document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ✅ Proper typing
  const toggle = (dropdown: OpenDropdown) => {
    setOpen(open === dropdown ? null : dropdown);
  };

  const toggleStatus = (v: Status) => {
    const cur = filters.status;
    setFilters({
      status: cur.includes(v)
        ? cur.filter((s) => s !== v)
        : [...cur, v],
    });
  };

  const togglePriority = (v: Priority) => {
    const cur = filters.priority;
    setFilters({
      priority: cur.includes(v)
        ? cur.filter((p) => p !== v)
        : [...cur, v],
    });
  };

  const toggleAssignee = (id: string) => {
    const cur = filters.assigneeIds;
    setFilters({
      assigneeIds: cur.includes(id)
        ? cur.filter((a) => a !== id)
        : [...cur, id],
    });
  };

  return (
    <div className="filter-bar" ref={ref}>
      <div className="filter-group">

        {/* STATUS */}
        <div className="filter-dropdown-wrap">
          <button
            className={`filter-btn ${filters.status.length ? 'active' : ''}`}
            onClick={() => toggle('status')}
          >
            Status {filters.status.length ? `(${filters.status.length})` : ''} ▾
          </button>

          {open === 'status' && (
            <div className="filter-menu">
              {STATUSES.map((s) => (
                <label key={s} className="filter-option">
                  <input
                    type="checkbox"
                    checked={filters.status.includes(s)}
                    onChange={() => toggleStatus(s)}
                  />
                  {s}
                </label>
              ))}
            </div>
          )}
        </div>

        {/* PRIORITY */}
        <div className="filter-dropdown-wrap">
          <button
            className={`filter-btn ${filters.priority.length ? 'active' : ''}`}
            onClick={() => toggle('priority')}
          >
            Priority {filters.priority.length ? `(${filters.priority.length})` : ''} ▾
          </button>

          {open === 'priority' && (
            <div className="filter-menu">
              {PRIORITIES.map((p) => (
                <label key={p} className="filter-option">
                  <input
                    type="checkbox"
                    checked={filters.priority.includes(p)}
                    onChange={() => togglePriority(p)}
                  />
                  {p}
                </label>
              ))}
            </div>
          )}
        </div>

        {/* ASSIGNEE */}
        <div className="filter-dropdown-wrap">
          <button
            className={`filter-btn ${filters.assigneeIds.length ? 'active' : ''}`}
            onClick={() => toggle('assignee')}
          >
            Assignee {filters.assigneeIds.length ? `(${filters.assigneeIds.length})` : ''} ▾
          </button>

          {open === 'assignee' && (
            <div className="filter-menu">
              {USERS.map((u) => (
                <label key={u.id} className="filter-option">
                  <input
                    type="checkbox"
                    checked={filters.assigneeIds.includes(u.id)}
                    onChange={() => toggleAssignee(u.id)}
                  />
                  <div
                    className="assignee-dot"
                    style={{ background: u.color }}
                  >
                    {u.initials}
                  </div>
                  {u.name}
                </label>
              ))}
            </div>
          )}
        </div>

        {/* DATE FILTER */}
        <div className="date-range-group">
          <input
            type="date"
            className="date-input"
            value={filters.dueDateFrom}
            onChange={(e) =>
              setFilters({ dueDateFrom: e.target.value })
            }
          />
          <span className="date-sep">→</span>
          <input
            type="date"
            className="date-input"
            value={filters.dueDateTo}
            onChange={(e) =>
              setFilters({ dueDateTo: e.target.value })
            }
          />
        </div>
      </div>

      {hasActive && (
        <button className="clear-btn" onClick={clearFilters}>
          ✕ Clear all
        </button>
      )}
    </div>
  );
}