import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Task, Status } from '../../types';
import { useStore } from '../../store';
import { STATUS_LABELS, STATUS_COLORS, PRIORITY_BG, getDueDateLabel, getUserById } from '../../utils';
import CollabAvatars from '../collaboration/CollabAvatars';

const STATUSES: Status[] = ['todo', 'in-progress', 'in-review', 'done'];

interface DragState {
  taskId: string;
  sourceStatus: Status;
  originIndex: number;
  cursorX: number;
  cursorY: number;
  cardW: number;
  cardH: number;
}

interface KanbanBoardProps {
  tasks: Task[];
}

export default function KanbanBoard({ tasks }: KanbanBoardProps) {
  const moveTask = useStore((s) => s.moveTask);
  const collaborators = useStore((s) => s.collaborators);

  const [drag, setDrag] = useState<DragState | null>(null);
  const [dragPos, setDragPos] = useState({ x: 0, y: 0 });
  const [overColumn, setOverColumn] = useState<Status | null>(null);
  const [snapBack, setSnapBack] = useState(false);

  const ghostRef = useRef<HTMLDivElement>(null);
  const columnRefs = useRef<Record<Status, HTMLDivElement | null>>({} as any);

  const tasksByStatus = STATUSES.reduce((acc, s) => {
    acc[s] = tasks.filter((t) => t.status === s);
    return acc;
  }, {} as Record<Status, Task[]>);

  const getCollabsForTask = useCallback((taskId: string) => {
    return collaborators.filter((c) => c.currentTaskId === taskId);
  }, [collaborators]);

  const onPointerDown = useCallback((e: React.PointerEvent, task: Task, idx: number) => {
    e.preventDefault();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setDrag({
      taskId: task.id,
      sourceStatus: task.status,
      originIndex: idx,
      cursorX: e.clientX - rect.left,
      cursorY: e.clientY - rect.top,
      cardW: rect.width,
      cardH: rect.height,
    });
    setDragPos({ x: rect.left, y: rect.top });
    setSnapBack(false);
  }, []);

  useEffect(() => {
    if (!drag) return;

    const onMove = (e: PointerEvent) => {
      setDragPos({ x: e.clientX - drag.cursorX, y: e.clientY - drag.cursorY });

      let found: Status | null = null;
      for (const s of STATUSES) {
        const col = columnRefs.current[s];
        if (!col) continue;
        const r = col.getBoundingClientRect();
        if (e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom) {
          found = s;
          break;
        }
      }
      setOverColumn(found);
    };

    const onUp = (e: PointerEvent) => {
      if (overColumn && overColumn !== drag.sourceStatus) {
        moveTask(drag.taskId, overColumn);
      } else if (!overColumn) {
        // Snap back
        setSnapBack(true);
        setTimeout(() => {
          setDrag(null);
          setSnapBack(false);
        }, 300);
        return;
      }
      setDrag(null);
      setOverColumn(null);
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
  }, [drag, overColumn, moveTask]);

  const draggingTask = drag ? tasks.find((t) => t.id === drag.taskId) : null;

  return (
    <div className="kanban-board">
      {STATUSES.map((status) => {
        const colTasks = tasksByStatus[status];
        const isOver = overColumn === status;

        return (
          <div
            key={status}
            className={`kanban-column ${isOver ? 'drag-over' : ''}`}
            ref={(el) => { columnRefs.current[status] = el; }}
          >
            <div className="kanban-col-header">
              <div className="col-indicator" style={{ background: STATUS_COLORS[status] }} />
              <span className="col-title">{STATUS_LABELS[status]}</span>
              <span className="col-count">{colTasks.length}</span>
            </div>

            <div className="kanban-cards">
              {colTasks.length === 0 && (
                <div className="empty-column">
                  <div className="empty-icon">📋</div>
                  <p>No tasks here</p>
                  <span>Drag a card to add</span>
                </div>
              )}

              {colTasks.map((task, idx) => {
                const isDragging = drag?.taskId === task.id;
                const collabs = getCollabsForTask(task.id);
                const { label, overdue, dueTodayFlag } = getDueDateLabel(task.dueDate);
                const user = getUserById(task.assigneeId);

                return (
                  <div key={task.id} className="card-wrapper">
                    {isDragging && (
                      <div
                        className="drag-placeholder"
                        style={{ height: drag.cardH }}
                      />
                    )}
                    {!isDragging && (
                      <div
                        className="task-card"
                        onPointerDown={(e) => onPointerDown(e, task, idx)}
                        style={{ touchAction: 'none' }}
                      >
                        <div className="card-top">
                          <span className={`priority-badge ${PRIORITY_BG[task.priority]}`}>
                            {task.priority}
                          </span>
                          {collabs.length > 0 && <CollabAvatars collabs={collabs} />}
                        </div>
                        <p className="card-title">{task.title}</p>
                        <div className="card-footer">
                          <div className="assignee-avatar" style={{ background: user?.color }}>
                            {user?.initials}
                          </div>
                          <span className={`due-label ${overdue ? 'overdue' : ''} ${dueTodayFlag ? 'due-today' : ''}`}>
                            {label}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Ghost card following cursor */}
      {drag && draggingTask && (
        <div
          ref={ghostRef}
          className={`ghost-card ${snapBack ? 'snap-back' : ''}`}
          style={{
            width: drag.cardW,
            height: drag.cardH,
            transform: `translate(${dragPos.x}px, ${dragPos.y}px)`,
          }}
        >
          <div className="card-top">
            <span className={`priority-badge ${PRIORITY_BG[draggingTask.priority]}`}>
              {draggingTask.priority}
            </span>
          </div>
          <p className="card-title">{draggingTask.title}</p>
        </div>
      )}
    </div>
  );
}
