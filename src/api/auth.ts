import { apiService } from './base'
import type {
  ApiResponse,
  LoginCredentials,
  PaginatedResponse,
  RegisterCredentials,
  User,
} from '../types'

export const authService = {
  login: async (
    credentials: LoginCredentials,
  ): Promise<ApiResponse<{ user: User; token: string }>> => {
    return apiService.post<{ user: User; token: string }>(
      '/auth/login',
      credentials,
    )
  },

  register: async (
    credentials: RegisterCredentials,
  ): Promise<ApiResponse<{ user: User; token: string }>> => {
    return apiService.post<{ user: User; token: string }>(
      '/auth/register',
      credentials,
    )
  },

  loginWithGoogle: async (
    token: string,
  ): Promise<ApiResponse<{ user: User; token: string }>> => {
    return apiService.post<{ user: User; token: string }>('/auth/google', {
      token,
    })
  },

  getCurrentUser: async (): Promise<{ user: User }> => {
    const raw = await apiService.get<{ user: User }>('/admin/users/profile')
    const container: any = (raw as any).data || raw
    const user = container.user
    if (!user) {
      throw new Error('Profile response missing user field')
    }
    return { user }
  },

  logout: (): void => {
    localStorage.removeItem('auth_token')
  },

  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('auth_token')
  },

  setToken: (token: string): void => {
    localStorage.setItem('auth_token', token)
  },
}

export const userService = {
  getUsers: async (
    page = 1,
    pageSize = 10,
    role?: 'admin' | 'trainee',
  ): Promise<ApiResponse<PaginatedResponse<User>>> => {
    let endpoint = `/admin/users/?page=${page}&pageSize=${pageSize}`
    if (role) {
      endpoint += `&role=${role}`
    }
    return apiService.get<PaginatedResponse<User>>(endpoint)
  },

  getPendingTrainees: async (
    page = 1,
    pageSize = 10,
  ): Promise<ApiResponse<PaginatedResponse<User>>> => {
    return apiService.get<PaginatedResponse<User>>(
      `/admin/users/pending?page=${page}&pageSize=${pageSize}`,
    )
  },

  getUserById: async (userId: string): Promise<ApiResponse<User>> => {
    return apiService.get<User>(`/admin/users/${userId}`)
  },

  updateUserStatus: async (
    userId: string,
    status: 'approved' | 'rejected',
  ): Promise<ApiResponse<User>> => {
    return apiService.put<User>(`/admin/users/${userId}/status`, { status })
  },

  updateUserRole: async (
    userId: string,
    role: 'admin' | 'trainee',
  ): Promise<ApiResponse<User>> => {
    return apiService.put<User>(`/admin/users/${userId}/role`, { role })
  },

  deleteUser: async (
    userId: string,
  ): Promise<ApiResponse<{ success: boolean }>> => {
    return apiService.delete<{ success: boolean }>(`/admin/users/${userId}`)
  },

  getUserProfile: async (userId: string): Promise<ApiResponse<User>> => {
    return apiService.get<User>(`/admin/users/${userId}/profile`)
  },
}
