import { useEffect } from 'react'
import { useTasks } from '@/providers/TasksProvider'

interface UseTasksListParams {
  page: number
  pageSize: number
  subjectId?: string | number
  isActive?: boolean
  search?: string
  // Sorting handled client-side only
}

export const useTasksList = (params: UseTasksListParams) => {
  const { state, actions } = useTasks()
  useEffect(() => {
    actions.fetchTasks(params.page, params.pageSize, {
      subjectId: params.subjectId,
      isActive: params.isActive,
      search: params.search,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.page, params.pageSize, params.subjectId, params.isActive, params.search])
  return state
}
