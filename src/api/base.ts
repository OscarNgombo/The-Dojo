import type { ApiResponse, ApiErrorShape, RequestConfig } from '../types'

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'

class ApiService {
  private getToken(): string | null {
    const isAuthenticated = !!localStorage.getItem('auth_token')
    if (isAuthenticated) {
      return import.meta.env.VITE_ADMIN_BEARER_TOKEN
    }
    return null
  }

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

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    config: RequestConfig = {},
  ): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`
    const method = (options.method || 'GET').toUpperCase()
    const controller = new AbortController()
    const externalSignal = config.signal
    let timeoutId: number | undefined
    if (config.timeoutMs && config.timeoutMs > 0) {
      timeoutId = window.setTimeout(() => controller.abort(), config.timeoutMs)
    }
    if (externalSignal) {
      externalSignal.addEventListener('abort', () => controller.abort())
    }

    const requestOptions: RequestInit = {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...(options.headers || {}),
        ...(config.headers || {}),
      },
      signal: controller.signal,
    }

    try {
      const response = await fetch(url, requestOptions)
      let data: any = null
      const text = await response.text()
      if (text) {
        try {
          data = JSON.parse(text)
        } catch {
          data = text
        }
      }

      if (!response.ok) {
        const apiError: ApiErrorShape = {
          name: 'ApiError',
          message:
            (data && (data.message || data.error || data.detail)) ||
            `Request failed with status ${response.status}`,
          status: response.status,
          url,
          method,
          details: data,
        }
        throw apiError
      }

      if (data && typeof data === 'object' && 'success' in data) {
        return data as ApiResponse<T>
      }
      return { data: data as T, success: true } as ApiResponse<T>
    } catch (error: unknown) {
      if ((error as any)?.name === 'ApiError') {
        throw error
      }
      const aborted =
        error instanceof DOMException && error.name === 'AbortError'
      const apiError: ApiErrorShape = {
        name: 'ApiError',
        message: aborted
          ? 'Request was aborted'
          : error instanceof Error
            ? error.message
            : 'Unknown network error',
        status: undefined,
        url,
        method,
        aborted,
        network: !aborted,
      }
      throw apiError
    } finally {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }
  }

  async get<T>(
    endpoint: string,
    config?: RequestConfig,
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' }, config)
  }

  async post<T>(
    endpoint: string,
    data: unknown,
    config?: RequestConfig,
  ): Promise<ApiResponse<T>> {
    return this.request<T>(
      endpoint,
      {
        method: 'POST',
        body: JSON.stringify(data),
      },
      config,
    )
  }

  async put<T>(
    endpoint: string,
    data: unknown,
    config?: RequestConfig,
  ): Promise<ApiResponse<T>> {
    return this.request<T>(
      endpoint,
      {
        method: 'PUT',
        body: JSON.stringify(data),
      },
      config,
    )
  }

  async delete<T>(
    endpoint: string,
    config?: RequestConfig,
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' }, config)
  }
}

export const apiService = new ApiService()
