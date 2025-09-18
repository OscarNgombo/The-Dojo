import { apiService } from './base';
import type { 
  ApiResponse, 
  PaginatedResponse, 
  Task, 
  TaskFormData 
} from '../types';

/**
 * Task-related API services
 */
export const taskService = {
  /**
   * Get all tasks with pagination
   */
  getTasks: async (page = 1, pageSize = 10, subjectId?: string): Promise<ApiResponse<PaginatedResponse<Task>>> => {
    let endpoint = `/admin/tasks/?page=${page}&pageSize=${pageSize}`;
    if (subjectId) {
      endpoint += `&subjectId=${subjectId}`;
    }
    return apiService.get<PaginatedResponse<Task>>(endpoint);
  },

  /**
   * Get a single task by ID
   */
  getTaskById: async (taskId: string): Promise<ApiResponse<Task>> => {
    return apiService.get<Task>(`/admin/tasks/${taskId}`);
  },

  /**
   * Create a new task
   */
  createTask: async (taskData: TaskFormData): Promise<ApiResponse<Task>> => {
    return apiService.post<Task>('/admin/tasks/', taskData);
  },

  /**
   * Update an existing task
   */
  updateTask: async (taskId: string, taskData: TaskFormData): Promise<ApiResponse<Task>> => {
    return apiService.put<Task>(`/admin/tasks/${taskId}`, taskData);
  },

  /**
   * Delete a task
   */
  deleteTask: async (taskId: string): Promise<ApiResponse<{ success: boolean }>> => {
    return apiService.delete<{ success: boolean }>(`/admin/tasks/${taskId}`);
  },
};