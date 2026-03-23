import { Priority, Status, Task } from '../types';
import { USERS } from '../data/generator';

export const PRIORITY_COLORS: Record<Priority, string> = {
  critical: '#ef4444',
  high: '#f97316',
  medium: '#eab308',
  low: '#22c55e',
};

export const PRIORITY_BG: Record<Priority, string> = {
  critical: 'bg-red-500/20 text-red-400 border-red-500/30',
  high: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  low: 'bg-green-500/20 text-green-400 border-green-500/30',
};

export const PRIORITY_ORDER: Record<Priority, number> = {
  critical: 0, high: 1, medium: 2, low: 3,
};

export const STATUS_LABELS: Record<Status, string> = {
  'todo': 'To Do',
  'in-progress': 'In Progress',
  'in-review': 'In Review',
  'done': 'Done',
};

export const STATUS_COLORS: Record<Status, string> = {
  'todo': '#6b7280',
  'in-progress': '#6366f1',
  'in-review': '#f59e0b',
  'done': '#10b981',
};

export function getUserById(id: string) {
  return USERS.find((u) => u.id === id);
}

export function getDueDateLabel(dueDate: string): { label: string; overdue: boolean; dueTodayFlag: boolean } {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);

  const diffMs = due.getTime() - today.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return { label: 'Due Today', overdue: false, dueTodayFlag: true };
  if (diffDays < -7) return { label: `${Math.abs(diffDays)}d overdue`, overdue: true, dueTodayFlag: false };
  if (diffDays < 0) return { label: `${Math.abs(diffDays)}d ago`, overdue: true, dueTodayFlag: false };
  return {
    label: due.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    overdue: false,
    dueTodayFlag: false,
  };
}

export function sortTasks(tasks: Task[], field: string, direction: 'asc' | 'desc'): Task[] {
  return [...tasks].sort((a, b) => {
    let cmp = 0;
    if (field === 'title') cmp = a.title.localeCompare(b.title);
    else if (field === 'priority') cmp = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
    else if (field === 'dueDate') cmp = a.dueDate.localeCompare(b.dueDate);
    return direction === 'asc' ? cmp : -cmp;
  });
}
