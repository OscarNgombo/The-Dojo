import { useEffect } from 'react'
import { useSubjects } from '@/providers'
import { useClientSort } from './useClientSort'
import { useSubjectFilters } from './useSubjectFilters'

export const useSubjectsList = () => {
  const { state, actions } = useSubjects()
  const filters = useSubjectFilters()

  useEffect(() => {
    actions.fetchSubjects(filters.page, 10, {
      search: filters.search || undefined,
      isActive: filters.activeFilter === 'all' ? undefined : filters.activeFilter === 'active',
    })
  }, [filters.search, filters.activeFilter, filters.page])

  const sort = useClientSort(state.subjects, { initialKey: 'id', initialDirection: 'asc' })

  return {
    subjects: sort.sorted,
    sortState: sort.sortState,
    setSort: sort.setSort,
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
