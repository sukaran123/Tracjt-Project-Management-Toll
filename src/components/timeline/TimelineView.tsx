import React, { useMemo, useRef } from 'react';
import { Task } from '../../types';
import { PRIORITY_COLORS, getDueDateLabel } from '../../utils';

interface TimelineViewProps {
  tasks: Task[];
}

export default function TimelineView({ tasks }: TimelineViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Show current month ± buffer
  const startOfMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 2, 0);

  const totalDays = Math.ceil((endOfMonth.getTime() - startOfMonth.getTime()) / 86400000) + 1;
  const DAY_W = 32;
  const ROW_H = 44;
  const LABEL_W = 220;

  const days: Date[] = useMemo(() => {
    const arr: Date[] = [];
    for (let i = 0; i < totalDays; i++) {
      const d = new Date(startOfMonth);
      d.setDate(startOfMonth.getDate() + i);
      arr.push(d);
    }
    return arr;
  }, [totalDays, startOfMonth]);

  const todayOffset = Math.floor((today.getTime() - startOfMonth.getTime()) / 86400000);

  const taskRows = useMemo(() => {
    return tasks.slice(0, 100).map((task) => {
      const due = new Date(task.dueDate);
      due.setHours(0, 0, 0, 0);
      const start = task.startDate ? new Date(task.startDate) : due;
      start.setHours(0, 0, 0, 0);

      const startOff = Math.max(0, Math.floor((start.getTime() - startOfMonth.getTime()) / 86400000));
      const endOff = Math.max(startOff, Math.floor((due.getTime() - startOfMonth.getTime()) / 86400000));
      const width = Math.max(1, endOff - startOff + 1) * DAY_W - 4;
      const left = startOff * DAY_W;
      const isSingleDay = !task.startDate;

      return { task, startOff, endOff, width, left, isSingleDay };
    });
  }, [tasks, startOfMonth]);

  // Group days by month for header
  const months: { label: string; days: number; startDay: number }[] = useMemo(() => {
    const map: Record<string, { days: number; startDay: number }> = {};
    days.forEach((d, i) => {
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      if (!map[key]) map[key] = { days: 0, startDay: i };
      map[key].days++;
    });
    return Object.entries(map).map(([key, val]) => {
      const [y, m] = key.split('-').map(Number);
      return {
        label: new Date(y, m, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        ...val,
      };
    });
  }, [days]);

  if (tasks.length === 0) {
    return (
      <div className="empty-list">
        <div className="empty-icon-lg">📅</div>
        <h3>No tasks to display</h3>
        <p>Try adjusting your filters</p>
      </div>
    );
  }

  return (
    <div className="timeline-view">
      <div className="timeline-scroll" ref={containerRef}>
        <div style={{ minWidth: LABEL_W + totalDays * DAY_W }}>
          {/* Month headers */}
          <div className="tl-month-row" style={{ paddingLeft: LABEL_W }}>
            {months.map((m) => (
              <div
                key={m.label}
                className="tl-month"
                style={{ width: m.days * DAY_W }}
              >
                {m.label}
              </div>
            ))}
          </div>

          {/* Day headers */}
          <div className="tl-day-row" style={{ paddingLeft: LABEL_W }}>
            {days.map((d, i) => {
              const isToday = i === todayOffset;
              const isWeekend = d.getDay() === 0 || d.getDay() === 6;
              return (
                <div
                  key={i}
                  className={`tl-day ${isToday ? 'today' : ''} ${isWeekend ? 'weekend' : ''}`}
                  style={{ width: DAY_W }}
                >
                  {d.getDate()}
                </div>
              );
            })}
          </div>

          {/* Task rows */}
          <div className="tl-body">
            {taskRows.map(({ task, left, width, isSingleDay }, rowIdx) => {
              const { overdue } = getDueDateLabel(task.dueDate);
              return (
                <div key={task.id} className="tl-row" style={{ height: ROW_H }}>
                  {/* Label */}
                  <div className="tl-label" style={{ width: LABEL_W }}>
                    <span className="tl-task-name" title={task.title}>{task.title}</span>
                  </div>

                  {/* Grid background */}
                  <div className="tl-grid" style={{ width: totalDays * DAY_W }}>
                    {/* Today line */}
                    <div
                      className="today-line"
                      style={{ left: todayOffset * DAY_W + DAY_W / 2 }}
                    />

                    {/* Zebra stripes for weekends */}
                    {days.map((d, i) => (
                      (d.getDay() === 0 || d.getDay() === 6) ? (
                        <div
                          key={i}
                          className="weekend-stripe"
                          style={{ left: i * DAY_W, width: DAY_W }}
                        />
                      ) : null
                    ))}

                    {/* Task bar */}
                    <div
                      className={`tl-bar ${isSingleDay ? 'single-day' : ''} ${overdue ? 'overdue-bar' : ''}`}
                      style={{
                        left,
                        width,
                        background: PRIORITY_COLORS[task.priority],
                        top: (ROW_H - 20) / 2,
                      }}
                      title={`${task.title} — ${task.priority} priority`}
                    >
                      {!isSingleDay && width > 60 && (
                        <span className="bar-label">{task.title.substring(0, 15)}…</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      {tasks.length > 100 && (
        <div className="timeline-note">Showing first 100 of {tasks.length} tasks</div>
      )}
    </div>
  );
}
