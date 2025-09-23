import { useEffect } from 'react'
import { useSubjects } from '@/providers'
import { useClientSort } from './useClientSort'
import { useSubjectFilters } from './useSubjectFilters'

export const useSubjectsList = () => {
  const { state, actions } = useSubjects()
  const filters = useSubjectFilters()

  // NOTE: We intentionally exclude `actions` (stable via useMemo in provider) from deps
  // to prevent a re-created (non referentially stable) actions object from triggering
  // a perpetual fetch -> state update -> effect loop in StrictMode double-invoke.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    actions.fetchSubjects(filters.page, 10, {
      search: filters.search || undefined,
      isActive:
        filters.activeFilter === 'all'
          ? undefined
          : filters.activeFilter === 'active',
    })
  }, [filters.search, filters.activeFilter, filters.page])

  // No default sort so tables appear in API order unless user applies one
  const sort = useClientSort(state.subjects)

  return {
    subjects: sort.sorted,
    sortState: sort.sortState,
  setSort: sort.setSort,
  setSortCustom: sort.setSortCustom,
    clearSort: sort.clearSort,
    filters,
    pagination: {
      currentPage: state.currentPage,
      totalPages: state.totalPages,
      totalCount: state.totalCount,
    },
    loading: state.loading,
    error: state.error,
    refresh: () => actions.refetch(),
    deleteSubject: actions.deleteSubject,
  }
}
