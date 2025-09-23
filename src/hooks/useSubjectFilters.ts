import { useQueryState } from './useQueryState'

export interface SubjectFiltersState {
  search: string
  activeFilter: 'all' | 'active' | 'inactive'
  page: number
  setSearch: (v: string) => void
  setActiveFilter: (v: 'all' | 'active' | 'inactive') => void
  setPage: (v: number) => void
  reset: () => void
}

export const useSubjectFilters = (): SubjectFiltersState => {
  const [search, setSearch] = useQueryState<string, '/admin/subjects/'>({
    key: 'search',
    defaultValue: '',
    route: '/admin/subjects/',
    debounceMs: 400,
  })
  const [activeFilter, setActiveFilter] = useQueryState<
    'all' | 'active' | 'inactive',
    '/admin/subjects/'
  >({
    key: 'active',
    defaultValue: 'all',
    route: '/admin/subjects/',
  })
  const [page, setPage] = useQueryState<number, '/admin/subjects/'>({
    key: 'page',
    defaultValue: 1,
    route: '/admin/subjects/',
    parse: (raw) => (raw ? parseInt(raw, 10) || 1 : 1),
    serialize: (v) => (v > 1 ? String(v) : undefined),
  })

  const reset = () => {
    setSearch('')
    setActiveFilter('all')
    setPage(1)
  }

  return {
    search,
    activeFilter,
    page,
    setSearch,
    setActiveFilter,
    setPage,
    reset,
  }
}
