import { apiService } from './base'
import type {
  ApiResponse,
  PaginatedResponse,
  Task,
  TaskFormData,
  RawTask,
} from '../types'

export const normalizeTask = (raw: RawTask): Task => ({
  id: String(raw.id),
  subjectId: String(raw.subject_id),
  title: raw.title,
  description: raw.description,
  requirements: raw.requirements,
  dueDate: raw.due_date,
  maxScore: raw.max_score,
  isActive: raw.is_active,
  createdBy: String(raw.created_by),
  createdAt: raw.created_at,
  updatedAt: raw.updated_at,
  createdByName: raw.created_by_name,
  subjectName: raw.subject_name,
})

interface GetTasksParams {
  page?: number
  pageSize?: number
  subjectId?: string | number
  isActive?: boolean
}

export const taskService = {
  getTasks: async ({
    page = 1,
    pageSize = 10,
    subjectId,
    isActive,
  }: GetTasksParams = {}): Promise<ApiResponse<PaginatedResponse<RawTask>>> => {
    const params = new URLSearchParams()
    params.set('page', String(page))
    params.set('page_size', String(pageSize))
    if (subjectId !== undefined && subjectId !== null && subjectId !== '') {
      params.set('subject_id', String(subjectId))
    }
    if (typeof isActive === 'boolean') {
      params.set('is_active', String(isActive))
    }
    return apiService.get<PaginatedResponse<RawTask>>(
      `/admin/tasks/?${params.toString()}`,
    )
  },

  getTaskById: async (taskId: string): Promise<ApiResponse<RawTask>> => {
    return apiService.get<RawTask>(`/admin/tasks/${taskId}`)
  },

  createTask: async (taskData: TaskFormData): Promise<ApiResponse<RawTask>> => {
    return apiService.post<RawTask>('/admin/tasks/', {
      subject_id: Number(taskData.subjectId),
      title: taskData.title,
      description: taskData.description,
      requirements: taskData.requirements,
      due_date: taskData.dueDate,
      max_score: taskData.maxScore,
      is_active: taskData.isActive,
    })
  },

  updateTask: async (
    taskId: string,
    taskData: TaskFormData,
  ): Promise<ApiResponse<RawTask>> => {
    return apiService.put<RawTask>(`/admin/tasks/${taskId}`, {
      subject_id: Number(taskData.subjectId),
      title: taskData.title,
      description: taskData.description,
      requirements: taskData.requirements,
      due_date: taskData.dueDate,
      max_score: taskData.maxScore,
      is_active: taskData.isActive,
    })
  },

  deleteTask: async (
    taskId: string,
  ): Promise<ApiResponse<{ success: boolean }>> => {
    return apiService.delete<{ success: boolean }>(`/admin/tasks/${taskId}`)
  },
}
