import {
  createContext,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { taskService, normalizeTask } from '@/api/tasks'
import { refetchTasks } from '@/utils/refetchRollback'
import type { Task, TaskFormData, RawTask } from '@/types'
import { useToast } from './ToastProvider'
import { useApiCall } from '@/hooks/useApiCall'
import { useMutate } from '@/hooks/useMutate'

interface TasksState {
  tasks: Task[]
  loading: boolean
  error: string | null
  currentPage: number
  totalPages: number
  totalCount: number
}

interface FetchTasksOptions {
  subjectId?: string | number
  isActive?: boolean
  search?: string
  // Sorting is handled client-side only.
}

interface TasksActions {
  fetchTasks: (
    page: number,
    pageSize?: number,
    options?: FetchTasksOptions,
  ) => Promise<void>
  createTask: (data: TaskFormData) => Promise<Task | null>
  updateTask: (id: string, data: TaskFormData) => Promise<Task | null>
  deleteTask: (id: string) => Promise<void>
  refetch: () => Promise<void>
}

interface TasksContextType {
  state: TasksState
  actions: TasksActions
}

const TasksContext = createContext<TasksContextType | undefined>(undefined)

const initialState: TasksState = {
  tasks: [],
  loading: false,
  error: null,
  currentPage: 1,
  totalPages: 1,
  totalCount: 0,
}

export const TasksProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<TasksState>(initialState)
  const lastQueryRef = useRef<{
    page: number
    pageSize: number
    options?: FetchTasksOptions
  }>({ page: 1, pageSize: 10 })
  useToast()
  const tasksCall = useApiCall<{
    records: RawTask[]
    current_page: number
    last_page: number
    total_count: number
  }>()

  const createMut = useMutate<TaskFormData, RawTask>({
    mutateFn: async (form) => (await taskService.createTask(form)).data,
    optimisticUpdate: (form) => {
      const temp: Task = {
        id: `temp-${Date.now()}`,
        subjectId: String(form.subjectId),
        title: form.title,
        description: form.description,
        requirements: form.requirements,
        dueDate: form.dueDate,
        maxScore: form.maxScore,
        isActive: form.isActive,
        createdBy: 'me',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      setState((prev) => ({
        ...prev,
        tasks: [temp, ...prev.tasks],
        totalCount: prev.totalCount + 1,
      }))
    },
    rollback: () => {
      void refetchTasks(tasksCall.execute, lastQueryRef.current)
    },
    onSuccess: (raw) => {
      const task = normalizeTask(raw)
      setState((prev) => ({
        ...prev,
        tasks: prev.tasks.map((t) => (t.id.startsWith('temp-') ? task : t)),
      }))
    },
    autoToast: { success: true, error: true },
    messages: { success: 'Task created' },
  })

  const updateMut = useMutate<{ id: string; data: TaskFormData }, RawTask>({
    mutateFn: async ({ id, data }) =>
      (await taskService.updateTask(id, data)).data,
    optimisticUpdate: ({ id, data }) => {
      setState((prev) => ({
        ...prev,
        tasks: prev.tasks.map((t) =>
          t.id === id
            ? {
                ...t,
                ...data,
                subjectId: String(data.subjectId),
                updatedAt: new Date().toISOString(),
              }
            : t,
        ),
      }))
    },
    rollback: () => {
      void refetchTasks(tasksCall.execute, lastQueryRef.current)
    },
    onSuccess: (raw, { id }) => {
      const task = normalizeTask(raw)
      setState((prev) => ({
        ...prev,
        tasks: prev.tasks.map((t) => (t.id === id ? task : t)),
      }))
    },
    autoToast: { success: true, error: true },
    messages: { success: 'Task updated' },
  })

  const deleteMut = useMutate<{ id: string }, { success: boolean }>({
    mutateFn: async ({ id }) => (await taskService.deleteTask(id)).data,
    optimisticUpdate: ({ id }) => {
      setState((prev) => ({
        ...prev,
        tasks: prev.tasks.filter((t) => t.id !== id),
        totalCount: prev.totalCount > 0 ? prev.totalCount - 1 : 0,
      }))
    },
    rollback: () => {
      void refetchTasks(tasksCall.execute, lastQueryRef.current)
    },
    autoToast: { success: true, error: true },
    messages: { success: 'Task deleted' },
  })

  const actions = useMemo<TasksActions>(() => {
    const fetchTasks: TasksActions['fetchTasks'] = async (
      page,
      pageSize = 10,
      options,
    ) => {
      lastQueryRef.current = { page, pageSize, options }
      const data = await tasksCall.execute(async () => {
        const raw = await taskService.getTasks({
          page,
          pageSize,
          subjectId: options?.subjectId,
          isActive: options?.isActive,
        })
        return { success: true, data: raw.data }
      })
      if (data) {
        const records = Array.isArray(data.records)
          ? data.records.map((r: RawTask) => normalizeTask(r as RawTask))
          : []
        setState((prev) => ({
          ...prev,
          loading: tasksCall.loading,
          error: tasksCall.error,
          tasks: records,
          currentPage: (data as any).current_page,
          totalPages: (data as any).last_page,
          totalCount: (data as any).total_count,
        }))
      } else {
        setState((prev) => ({
          ...prev,
          loading: tasksCall.loading,
          error: tasksCall.error,
        }))
      }
    }
    const refetch: TasksActions['refetch'] = async () => {
      const { page, pageSize, options } = lastQueryRef.current
      await fetchTasks(page, pageSize, options)
    }
    const createTask: TasksActions['createTask'] = async (form) => {
      const res = await createMut.mutate(form)
      return res ? normalizeTask(res) : null
    }
    const updateTask: TasksActions['updateTask'] = async (id, form) => {
      const res = await updateMut.mutate({ id, data: form })
      return res ? normalizeTask(res) : null
    }
    const deleteTask: TasksActions['deleteTask'] = async (id) => {
      await deleteMut.mutate({ id })
    }
    return { fetchTasks, createTask, updateTask, deleteTask, refetch }
  }, [tasksCall, createMut, updateMut, deleteMut])

  const value = useMemo(() => ({ state, actions }), [state, actions])

  return <TasksContext.Provider value={value}>{children}</TasksContext.Provider>
}

export const useTasks = (): TasksContextType => {
  const ctx = useContext(TasksContext)
  if (!ctx) throw new Error('useTasks must be used within TasksProvider')
  return ctx
}
