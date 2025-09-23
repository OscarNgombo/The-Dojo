import { useCallback, useEffect, useRef, useState } from 'react'
import { taskService, normalizeTask } from '@/api/tasks'
import type { Task } from '@/types'

interface UseSubjectTasksResult {
  tasks: Task[]
  loading: boolean
  error: string | null
  refetch: () => void
}

export const useSubjectTasks = (
  subjectId: string | number | null | undefined,
): UseSubjectTasksResult => {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const ref = useRef({ mounted: true })

  useEffect(() => {
    ref.current.mounted = true
    return () => {
      ref.current.mounted = false
    }
  }, [])

  const fetchTasks = useCallback(async () => {
    if (subjectId === null || subjectId === undefined || subjectId === '') return
    setLoading(true)
    setError(null)
    try {
      const resp = await taskService.getTasks({ subjectId, pageSize: 50 })
      const root: any = resp.data
      const records = root?.records || []
      const normalized = records.map(normalizeTask)
      if (ref.current.mounted) {
        setTasks(normalized)
      }
    } catch (e: any) {
      if (ref.current.mounted) {
        setError(e?.message || 'Failed to load tasks')
      }
    } finally {
      if (ref.current.mounted) setLoading(false)
    }
  }, [subjectId])

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  return { tasks, loading, error, refetch: fetchTasks }
}

export default useSubjectTasks