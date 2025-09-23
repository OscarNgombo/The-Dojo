import { useQueryState } from './useQueryState'

export interface TasksFiltersState {
  search: string
  subjectId: string
  activeFilter: 'all' | 'active' | 'inactive'
  page: number
  setSearch: (v: string) => void
  setSubjectId: (v: string) => void
  setActiveFilter: (v: 'all' | 'active' | 'inactive') => void
  setPage: (v: number) => void
  reset: () => void
}

// Hook managing task list filters via URL query params (server-side filtering alignment)
export const useTasksFilters = (): TasksFiltersState => {
  const [search, setSearch] = useQueryState<string, '/admin/tasks/'>({
    key: 'search',
    defaultValue: '',
    route: '/admin/tasks/',
    debounceMs: 400,
  })
  const [subjectId, setSubjectId] = useQueryState<string, '/admin/tasks/'>({
    key: 'subjectId',
    defaultValue: '',
    route: '/admin/tasks/',
  })
  const [activeFilter, setActiveFilter] = useQueryState<
    'all' | 'active' | 'inactive',
    '/admin/tasks/'
  >({
    key: 'active', // mirrors subjects pattern
    defaultValue: 'all',
    route: '/admin/tasks/',
  })
  const [page, setPage] = useQueryState<number, '/admin/tasks/'>({
    key: 'page',
    defaultValue: 1,
    route: '/admin/tasks/',
    parse: (raw) => (raw ? parseInt(raw, 10) || 1 : 1),
    serialize: (v) => (v > 1 ? String(v) : undefined),
  })

  const reset = () => {
    setSearch('')
    setSubjectId('')
    setActiveFilter('all')
    setPage(1)
  }

  return {
    search,
    subjectId,
    activeFilter,
    page,
    setSearch,
    setSubjectId,
    setActiveFilter,
    setPage,
    reset,
  }
}
