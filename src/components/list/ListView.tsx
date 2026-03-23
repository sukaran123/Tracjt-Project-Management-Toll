import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { Task, SortField, SortDirection, Status } from '../../types';
import { useStore } from '../../store';
import { STATUS_LABELS, PRIORITY_BG, getDueDateLabel, getUserById, sortTasks, PRIORITY_ORDER } from '../../utils';
import CollabAvatars from '../collaboration/CollabAvatars';

const ROW_HEIGHT = 56;
const BUFFER = 5;

const STATUSES: Status[] = ['todo', 'in-progress', 'in-review', 'done'];

interface ListViewProps {
  tasks: Task[];
}

export default function ListView({ tasks }: ListViewProps) {
  const { sort, setSort } = useStore((s) => ({ sort: s.sort, setSort: s.setSort }));
  const collaborators = useStore((s) => s.collaborators);
  const updateTaskStatus = useStore((s) => s.updateTaskStatus);

  const [scrollTop, setScrollTop] = useState(0);
  const [containerH, setContainerH] = useState(600);
  const containerRef = useRef<HTMLDivElement>(null);

  const sorted = useMemo(() => sortTasks(tasks, sort.field, sort.direction), [tasks, sort]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setContainerH(el.clientHeight));
    ro.observe(el);
    setContainerH(el.clientHeight);
    return () => ro.disconnect();
  }, []);

  const onScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop((e.target as HTMLDivElement).scrollTop);
  }, []);

  const totalH = sorted.length * ROW_HEIGHT;
  const startIdx = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - BUFFER);
  const endIdx = Math.min(sorted.length - 1, Math.ceil((scrollTop + containerH) / ROW_HEIGHT) + BUFFER);
  const visibleTasks = sorted.slice(startIdx, endIdx + 1);

  const toggleSort = (field: SortField) => {
    if (sort.field === field) {
      setSort({ field, direction: sort.direction === 'asc' ? 'desc' : 'asc' });
    } else {
      setSort({ field, direction: 'asc' });
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sort.field !== field) return <span className="sort-icon neutral">⇅</span>;
    return <span className="sort-icon active">{sort.direction === 'asc' ? '↑' : '↓'}</span>;
  };

  if (sorted.length === 0) {
    return (
      <div className="empty-list">
        <div className="empty-icon-lg">🔍</div>
        <h3>No tasks found</h3>
        <p>Try adjusting your filters</p>
        <button className="btn-clear" onClick={() => useStore.getState().clearFilters()}>
          Clear Filters
        </button>
      </div>
    );
  }

  return (
    <div className="list-view">
      <div className="list-header">
        <div className="lh-check" />
        <div className="lh-title" onClick={() => toggleSort('title')}>
          Title {getSortIcon('title')}
        </div>
        <div className="lh-priority" onClick={() => toggleSort('priority')}>
          Priority {getSortIcon('priority')}
        </div>
        <div className="lh-status">Status</div>
        <div className="lh-assignee">Assignee</div>
        <div className="lh-due" onClick={() => toggleSort('dueDate')}>
          Due Date {getSortIcon('dueDate')}
        </div>
        <div className="lh-collab">Active</div>
      </div>

      <div
        ref={containerRef}
        className="list-scroll-container"
        onScroll={onScroll}
      >
        {/* Total height spacer */}
        <div style={{ height: totalH, position: 'relative' }}>
          {/* Visible rows */}
          <div style={{ transform: `translateY(${startIdx * ROW_HEIGHT}px)` }}>
            {visibleTasks.map((task) => {
              const user = getUserById(task.assigneeId);
              const { label, overdue, dueTodayFlag } = getDueDateLabel(task.dueDate);
              const collabs = collaborators.filter((c) => c.currentTaskId === task.id);

              return (
                <div key={task.id} className="list-row" style={{ height: ROW_HEIGHT }}>
                  <div className="lr-check">
                    <div className="checkbox" />
                  </div>
                  <div className="lr-title">{task.title}</div>
                  <div className="lr-priority">
                    <span className={`priority-badge ${PRIORITY_BG[task.priority]}`}>
                      {task.priority}
                    </span>
                  </div>
                  <div className="lr-status">
                    <select
                      className="status-select"
                      value={task.status}
                      onChange={(e) => updateTaskStatus(task.id, e.target.value as Status)}
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                      ))}
                    </select>
                  </div>
                  <div className="lr-assignee">
                    <div className="assignee-avatar sm" style={{ background: user?.color }}>
                      {user?.initials}
                    </div>
                    <span className="assignee-name">{user?.name.split(' ')[0]}</span>
                  </div>
                  <div className={`lr-due ${overdue ? 'overdue' : ''} ${dueTodayFlag ? 'due-today' : ''}`}>
                    {label}
                  </div>
                  <div className="lr-collab">
                    {collabs.length > 0 && <CollabAvatars collabs={collabs} small />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="list-footer">
        {sorted.length} tasks
      </div>
    </div>
  );
}
