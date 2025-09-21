import { apiService } from './base'
import type { User, PaginatedResponse } from '../types'

const getUsers = async (
  page: number,
  pageSize: number,
  role?: 'admin' | 'trainee',
  status?: 'approved' | 'pending' | 'rejected',
  search?: string,
  sortField?: 'id' | 'name' | 'email' | 'created_at',
  sortDirection?: 'asc' | 'desc',
): Promise<PaginatedResponse<User>> => {
  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  })
  if (role) params.append('role', role)
  if (status) params.append('status', status)
  if (search) params.append('search', search)
  if (sortField) params.append('sortField', sortField)
  if (sortDirection) params.append('sortDirection', sortDirection)
  const response = await apiService.get<PaginatedResponse<User>>(
    `/admin/users?${params.toString()}`,
  )
  // Support both wrapped and unwrapped
  const container: any = (response as any).data || response
  if (!container) {
    return {
      domain: 'users',
      current_page: page,
      last_page: 1,
      page_size: pageSize,
      total_count: 0,
      records: [],
    }
  }
  return container as PaginatedResponse<User>
}

const getUserById = async (userId: string) => {
  const response = await apiService.get<{ user: User }>(
    `/admin/users/${userId}`,
  )
  const container: any = (response as any).data || response
  return container as { user: User }
}

const updateUserStatus = async (
  userId: string,
  status: 'approved' | 'pending' | 'rejected',
) => {
  const response = await apiService.put<{ user: User; message: string }>(
    `/admin/users/${userId}/status`,
    { status },
  )
  return (response as any).data || response
}

const updateUserRole = async (userId: string, role: 'admin' | 'trainee') => {
  const response = await apiService.put<{ user: User; message: string }>(
    `/admin/users/${userId}/role`,
    { role },
  )
  return (response as any).data || response
}

const deleteUser = async (userId: string) => {
  const response = await apiService.delete<{ message: string }>(
    `/admin/users/${userId}`,
  )
  return (response as any).data || response
}

export const usersApi = {
  getUsers,
  getUserById,
  updateUserStatus,
  updateUserRole,
  deleteUser,
}
