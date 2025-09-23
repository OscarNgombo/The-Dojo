import { apiService } from './base'
import type {
  ApiResponse,
  PaginatedResponse,
  Subject,
  SubjectFormData,
  RawSubject,
} from '../types'

export const normalizeSubject = (raw: RawSubject): Subject => ({
  id: String(raw.id),
  name: raw.name,
  description: raw.description,
  isActive: raw.is_active,
  createdBy: String(raw.created_by),
  createdAt: raw.created_at,
  updatedAt: raw.updated_at,
  createdByName: raw.created_by_name,
})

export const subjectService = {
  getSubjects: async (
    page = 1,
    pageSize = 10,
    params?: { search?: string; isActive?: boolean },
  ): Promise<ApiResponse<PaginatedResponse<Subject>>> => {
    const qp = new URLSearchParams()
    qp.set('page', String(page))
    qp.set('pageSize', String(pageSize))
    if (params?.search) qp.set('search', params.search)
    if (typeof params?.isActive === 'boolean') {
      qp.set('isActive', String(params.isActive))
    }
    return apiService.get<PaginatedResponse<Subject>>(
      `/admin/subjects/?${qp.toString()}`,
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
