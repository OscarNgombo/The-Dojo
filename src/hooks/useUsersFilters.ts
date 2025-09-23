import { useQueryState } from './useQueryState'

export interface UsersFiltersState {
  role: 'all' | 'admin' | 'trainee'
  status: 'all' | 'approved' | 'pending' | 'rejected'
  search: string
  sortField: '' | 'name' | 'email' | 'created_at'
  sortDirection: 'asc' | 'desc'
  page: number
  setRole: (v: UsersFiltersState['role']) => void
  setStatus: (v: UsersFiltersState['status']) => void
  setSearch: (v: string) => void
  setSortField: (v: UsersFiltersState['sortField']) => void
  setSortDirection: (v: UsersFiltersState['sortDirection']) => void
  setPage: (v: number) => void
  resetFilters: () => void
  resetSort: () => void
  resetAll: () => void
}

export const useUsersFilters = (): UsersFiltersState => {
  const [role, setRole] = useQueryState<
    'all' | 'admin' | 'trainee',
    '/admin/users/'
  >({
    key: 'role',
    defaultValue: 'all',
    route: '/admin/users/',
  })
  const [status, setStatus] = useQueryState<
    'all' | 'approved' | 'pending' | 'rejected',
    '/admin/users/'
  >({
    key: 'status',
    defaultValue: 'all',
    route: '/admin/users/',
  })
  const [search, setSearch] = useQueryState<string, '/admin/users/'>({
    key: 'search',
    defaultValue: '',
    route: '/admin/users/',
    debounceMs: 400,
  })
  const [sortField, setSortField] = useQueryState<
    '' | 'name' | 'email' | 'created_at',
    '/admin/users/'
  >({
    key: 'sortField',
    defaultValue: '',
    route: '/admin/users/',
  })
  const [sortDirection, setSortDirection] = useQueryState<
    'asc' | 'desc',
    '/admin/users/'
  >({
    key: 'sortDirection',
    defaultValue: 'asc',
    route: '/admin/users/',
  })
  const [page, setPage] = useQueryState<number, '/admin/users/'>({
    key: 'page',
    defaultValue: 1,
    route: '/admin/users/',
    parse: (raw) => (raw ? parseInt(raw, 10) || 1 : 1),
    serialize: (v) => (v > 1 ? String(v) : undefined),
  })

  const resetFilters = () => {
    setRole('all')
    setStatus('all')
    setSearch('')
    setPage(1)
  }
  const resetSort = () => {
    setSortField('')
    setSortDirection('asc')
  }
  const resetAll = () => {
    resetFilters()
    resetSort()
  }

  return {
    role,
    status,
    search,
    sortField,
    sortDirection,
    page,
    setRole,
    setStatus,
    setSearch,
    setSortField,
    setSortDirection,
    setPage,
    resetFilters,
    resetSort,
    resetAll,
  }
}
