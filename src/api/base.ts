import type { ApiResponse } from '../types'

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'

/**
 * Base API service for handling HTTP requests
 */
class ApiService {
  /**
   * Get the authentication token from localStorage
   */
  private getToken(): string | null {
    // If there's an auth token in localStorage, it means the user is logged in.
    // For any logged-in user, we use the admin bearer token for API requests.
    const isAuthenticated = !!localStorage.getItem('auth_token')
    if (isAuthenticated) {
      return import.meta.env.VITE_ADMIN_BEARER_TOKEN
    }
    return null
  }

  /**
   * Add authorization header if token exists
   */
  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }

    const token = this.getToken()
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    return headers
  }

  /**
   * Generic request method with error handling
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${API_BASE_URL}${endpoint}`

      const requestOptions: RequestInit = {
        ...options,
        headers: {
          ...this.getHeaders(),
          ...(options.headers || {}),
        },
      }

      const response = await fetch(url, requestOptions)
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong')
      }

      return data as ApiResponse<T>
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message)
      }
      throw new Error('Unknown error occurred')
    }
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' })
  }

  /**
   * POST request
   */
  async post<T>(endpoint: string, data: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  /**
   * PUT request
   */
  async put<T>(endpoint: string, data: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' })
  }
}

// Create a singleton instance
export const apiService = new ApiService()
