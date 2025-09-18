import { apiService } from './base';
import type { 
  ApiResponse, 
  LoginCredentials, 
  PaginatedResponse, 
  RegisterCredentials, 
  User 
} from '../types';

/**
 * User and authentication related API services
 */
export const authService = {
  /**
   * Login user with credentials
   */
  login: async (credentials: LoginCredentials): Promise<ApiResponse<{ user: User; token: string }>> => {
    return apiService.post<{ user: User; token: string }>('/auth/login', credentials);
  },

  /**
   * Register a new user
   */
  register: async (credentials: RegisterCredentials): Promise<ApiResponse<{ user: User; token: string }>> => {
    return apiService.post<{ user: User; token: string }>('/auth/register', credentials);
  },

  /**
   * Get the current authenticated user's profile
   */
  getCurrentUser: async (): Promise<ApiResponse<User>> => {
    return apiService.get<User>('/auth/me');
  },

  /**
   * Log out the current user
   */
  logout: (): void => {
    localStorage.removeItem('auth_token');
  },

  /**
   * Check if there's a stored token
   */
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('auth_token');
  },

  /**
   * Store authentication token
   */
  setToken: (token: string): void => {
    localStorage.setItem('auth_token', token);
  },
};

/**
 * Admin-specific user management API services
 */
export const userService = {
  /**
   * Get all users with pagination
   */
  getUsers: async (page = 1, pageSize = 10, role?: 'admin' | 'trainee'): Promise<ApiResponse<PaginatedResponse<User>>> => {
    let endpoint = `/admin/users/?page=${page}&pageSize=${pageSize}`;
    if (role) {
      endpoint += `&role=${role}`;
    }
    return apiService.get<PaginatedResponse<User>>(endpoint);
  },

  /**
   * Get pending trainees
   */
  getPendingTrainees: async (page = 1, pageSize = 10): Promise<ApiResponse<PaginatedResponse<User>>> => {
    return apiService.get<PaginatedResponse<User>>(`/admin/users/pending?page=${page}&pageSize=${pageSize}`);
  },

  /**
   * Get a single user by ID
   */
  getUserById: async (userId: string): Promise<ApiResponse<User>> => {
    return apiService.get<User>(`/admin/users/${userId}`);
  },

  /**
   * Update user status (approve, reject)
   */
  updateUserStatus: async (userId: string, status: 'approved' | 'rejected'): Promise<ApiResponse<User>> => {
    return apiService.put<User>(`/admin/users/${userId}/status`, { status });
  },

  /**
   * Update user role
   */
  updateUserRole: async (userId: string, role: 'admin' | 'trainee'): Promise<ApiResponse<User>> => {
    return apiService.put<User>(`/admin/users/${userId}/role`, { role });
  },

  /**
   * Delete user
   */
  deleteUser: async (userId: string): Promise<ApiResponse<{ success: boolean }>> => {
    return apiService.delete<{ success: boolean }>(`/admin/users/${userId}`);
  },

  /**
   * Get user profile
   */
  getUserProfile: async (userId: string): Promise<ApiResponse<User>> => {
    return apiService.get<User>(`/admin/users/${userId}/profile`);
  },
};