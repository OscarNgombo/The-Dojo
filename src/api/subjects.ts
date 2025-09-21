import { apiService } from './base'
import type {
  ApiResponse,
  PaginatedResponse,
  Subject,
  SubjectFormData,
} from '../types'

export const subjectService = {
  getSubjects: async (
    page = 1,
    pageSize = 10,
  ): Promise<ApiResponse<PaginatedResponse<Subject>>> => {
    return apiService.get<PaginatedResponse<Subject>>(
      `/admin/subjects/?page=${page}&pageSize=${pageSize}`,
    )
  },

  getSubjectById: async (subjectId: string): Promise<ApiResponse<Subject>> => {
    return apiService.get<Subject>(`/admin/subjects/${subjectId}`)
  },

  createSubject: async (
    subjectData: SubjectFormData,
  ): Promise<ApiResponse<Subject>> => {
    return apiService.post<Subject>('/admin/subjects/', subjectData)
  },

  updateSubject: async (
    subjectId: string,
    subjectData: SubjectFormData,
  ): Promise<ApiResponse<Subject>> => {
    return apiService.put<Subject>(`/admin/subjects/${subjectId}`, subjectData)
  },

  deleteSubject: async (
    subjectId: string,
  ): Promise<ApiResponse<{ success: boolean }>> => {
    return apiService.delete<{ success: boolean }>(
      `/admin/subjects/${subjectId}`,
    )
  },
}
