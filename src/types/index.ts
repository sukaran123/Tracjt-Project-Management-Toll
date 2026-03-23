export type Priority = 'critical' | 'high' | 'medium' | 'low';
export type Status = 'todo' | 'in-progress' | 'in-review' | 'done';

export interface User {
  id: string;
  name: string;
  color: string;
  initials: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: Status;
  priority: Priority;
  assigneeId: string;
  startDate?: string; // ISO string
  dueDate: string;    // ISO string
  createdAt: string;
}

export type ViewType = 'kanban' | 'list' | 'timeline';

export type SortField = 'title' | 'priority' | 'dueDate';
export type SortDirection = 'asc' | 'desc';

export interface SortConfig {
  field: SortField;
  direction: SortDirection;
}

export interface FilterState {
  status: Status[];
  priority: Priority[];
  assigneeIds: string[];
  dueDateFrom: string;
  dueDateTo: string;
}

export interface CollaborationUser {
  user: User;
  currentTaskId: string | null;
  action: 'viewing' | 'editing';
}
