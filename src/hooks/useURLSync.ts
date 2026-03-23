import { useEffect, useCallback } from 'react';
import { useStore, DEFAULT_FILTERS } from '../store';
import { FilterState, Status, Priority, ViewType } from '../types';

export function useURLSync() {
  const { filters, setFilters, view, setView } = useStore();

  // Read from URL on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    const urlView = params.get('view') as ViewType | null;
    if (urlView && ['kanban', 'list', 'timeline'].includes(urlView)) {
      setView(urlView);
    }

    const partial: Partial<FilterState> = {};
    const status = params.get('status');
    if (status) partial.status = status.split(',') as Status[];
    const priority = params.get('priority');
    if (priority) partial.priority = priority.split(',') as Priority[];
    const assigneeIds = params.get('assignees');
    if (assigneeIds) partial.assigneeIds = assigneeIds.split(',');
    const from = params.get('from');
    if (from) partial.dueDateFrom = from;
    const to = params.get('to');
    if (to) partial.dueDateTo = to;

    if (Object.keys(partial).length > 0) setFilters(partial);
  }, []); // eslint-disable-line

  // Write to URL when filters/view change
  useEffect(() => {
    const params = new URLSearchParams();
    params.set('view', view);
    if (filters.status.length) params.set('status', filters.status.join(','));
    if (filters.priority.length) params.set('priority', filters.priority.join(','));
    if (filters.assigneeIds.length) params.set('assignees', filters.assigneeIds.join(','));
    if (filters.dueDateFrom) params.set('from', filters.dueDateFrom);
    if (filters.dueDateTo) params.set('to', filters.dueDateTo);

    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState(null, '', newUrl);
  }, [filters, view]);
}

export function useHasActiveFilters(): boolean {
  const filters = useStore((s) => s.filters);
  return (
    filters.status.length > 0 ||
    filters.priority.length > 0 ||
    filters.assigneeIds.length > 0 ||
    !!filters.dueDateFrom ||
    !!filters.dueDateTo
  );
}
