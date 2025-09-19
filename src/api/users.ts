import { apiService } from './base'
import type { User, PaginatedResponse } from '../types'

/**
 * Fetches a paginated list of users.
 * @param page - The page number to retrieve.
 * @param pageSize - The number of users per page.
 * @param role - Optional role to filter users by.
 * @param status - Optional status to filter users by.
 * @returns A promise that resolves to a paginated response of users.
 */
const getUsers = (
  page: number,
  pageSize: number,
  role?: 'admin' | 'trainee',
  status?: 'approved' | 'pending' | 'rejected',
) => {
  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  })
  if (role) {
    params.append('role', role)
  }
  if (status) {
    params.append('status', status)
  }
  return apiService.get<PaginatedResponse<User>>(
    `/admin/users?${params.toString()}`,
  )
}

/**
 * Fetches a single user by their ID.
 * @param userId - The ID of the user to retrieve.
 * @returns A promise that resolves to the user object.
 */
const getUserById = (userId: string) => {
  return apiService.get<{ user: User }>(`/admin/users/${userId}`)
}

/**
 * Updates the status of a user.
 * @param userId - The ID of the user to update.
 * @param status - The new status for the user.
 * @returns A promise that resolves when the status is updated.
 */
const updateUserStatus = (
  userId: string,
  status: 'approved' | 'pending' | 'rejected',
) => {
  return apiService.put<{ user: User; message: string }>(
    `/admin/users/${userId}/status`,
    { status },
  )
}

/**
 * Updates the role of a user.
 * @param userId - The ID of the user to update.
 * @param role - The new role for the user.
 * @returns A promise that resolves when the role is updated.
 */
const updateUserRole = (userId: string, role: 'admin' | 'trainee') => {
  return apiService.put<{ user: User; message: string }>(
    `/admin/users/${userId}/role`,
    { role },
  )
}

/**
 * Deletes a user by their ID.
 * @param userId - The ID of the user to delete.
 * @returns A promise that resolves when the user is deleted.
 */
const deleteUser = (userId: string) => {
  return apiService.delete<{ message: string }>(`/admin/users/${userId}`)
}

export const usersApi = {
  getUsers,
  getUserById,
  updateUserStatus,
  updateUserRole,
  deleteUser,
}
