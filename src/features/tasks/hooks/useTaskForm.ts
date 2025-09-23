import { useState, useCallback } from 'react'
import type { TaskFormData, Task } from '@/types'
import { useTasks } from '@/providers/TasksProvider'
import { taskService, normalizeTask } from '@/api/tasks'

interface UseTaskFormParams {
  taskId?: string
}

interface UseTaskFormResult {
  values: TaskFormData
  setValue: <K extends keyof TaskFormData>(key: K, value: TaskFormData[K]) => void
  submit: () => Promise<Task | null>
  loading: boolean
  error: string | null
  reset: (data?: Partial<TaskFormData>) => void
}

const emptyForm: TaskFormData = {
  subjectId: '',
  title: '',
  description: '',
  requirements: '',
  dueDate: '',
  maxScore: 0,
  isActive: true,
}

export const useTaskForm = ({ taskId }: UseTaskFormParams = {}): UseTaskFormResult => {
  const { actions } = useTasks()
  const [values, setValues] = useState<TaskFormData>(emptyForm)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const setValue: UseTaskFormResult['setValue'] = (key, value) => {
    setValues((prev) => ({ ...prev, [key]: value }))
  }

  const reset: UseTaskFormResult['reset'] = (data) => {
    setValues({ ...emptyForm, ...data })
  }

  const submit = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      if (taskId) {
        const resp = await taskService.updateTask(taskId, values)
        return normalizeTask(resp.data as any) // provider list will be updated by refetch if needed
      }
      const created = await actions.createTask(values)
      return created
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to save task'
      setError(message)
      return null
    } finally {
      setLoading(false)
    }
  }, [taskId, values, actions])

  return { values, setValue, submit, loading, error, reset }
}
