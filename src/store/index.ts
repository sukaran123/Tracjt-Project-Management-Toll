import { create } from 'zustand';
import { Task, ViewType, SortConfig, FilterState, Status, CollaborationUser } from '../types';
import { INITIAL_TASKS } from '../data/generator';

export const DEFAULT_FILTERS: FilterState = {
  status: [],
  priority: [],
  assigneeIds: [],
  dueDateFrom: '',
  dueDateTo: '',
};

interface AppState {
  tasks: Task[];
  view: ViewType;
  sort: SortConfig;
  filters: FilterState;
  collaborators: CollaborationUser[];

  setView: (view: ViewType) => void;
  setSort: (sort: SortConfig) => void;
  setFilters: (filters: Partial<FilterState>) => void;
  clearFilters: () => void;
  moveTask: (taskId: string, newStatus: Status) => void;
  updateTaskStatus: (taskId: string, status: Status) => void;
  setCollaborators: (collaborators: any) => void;
  getFilteredTasks: () => Task[];
}

export const useStore = create<AppState>((set, get) => ({
  tasks: INITIAL_TASKS,
  view: 'kanban',
  sort: { field: 'dueDate', direction: 'asc' },
  filters: DEFAULT_FILTERS,
  collaborators: [],

  setView: (view) => set({ view }),
  setSort: (sort) => set({ sort }),

  setFilters: (partial) =>
    set((state) => ({
      filters: { ...state.filters, ...partial },
    })),

  clearFilters: () => set({ filters: DEFAULT_FILTERS }),

  moveTask: (taskId, newStatus) =>
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === taskId ? { ...t, status: newStatus } : t
      ),
    })),

  updateTaskStatus: (taskId, status) =>
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === taskId ? { ...t, status } : t
      ),
    })),

  setCollaborators: (collaborators) =>
    set({
      collaborators: Array.isArray(collaborators)
        ? collaborators
        : collaborators?.collaborators || [],
    }),

  // ✅ MAIN FIX: Proper filtering logic
  getFilteredTasks: () => {
    const { tasks, filters } = get();

    return tasks.filter((task) => {
      // Status filter
      if (
        filters.status.length > 0 &&
        !filters.status.includes(task.status)
      ) {
        return false;
      }

      // Priority filter
      if (
        filters.priority.length > 0 &&
        !filters.priority.includes(task.priority)
      ) {
        return false;
      }

      // Assignee filter
      if (
        filters.assigneeIds.length > 0 &&
        !filters.assigneeIds.includes(task.assigneeId)
      ) {
        return false;
      }

      // Date filters
      if (filters.dueDateFrom && task.dueDate < filters.dueDateFrom)
        return false;

      if (filters.dueDateTo && task.dueDate > filters.dueDateTo)
        return false;

      return true;
    });
  },
}));