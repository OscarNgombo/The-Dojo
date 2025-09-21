import { useState, useCallback } from 'react'
import type { ApiResponse, ApiErrorShape, RequestConfig } from '../types'

interface UseApiCallState<T> {
  data: T | null
  loading: boolean
  error: string | null
}

interface ExecuteOptions extends RequestConfig {}

export const useApiCall = <T>() => {
  const [state, setState] = useState<UseApiCallState<T>>({
    data: null,
    loading: false,
    error: null,
  })

  const execute = useCallback(
    async (
      apiCall: (config?: RequestConfig) => Promise<ApiResponse<T>>,
      options?: ExecuteOptions,
    ) => {
      setState((prev) => ({ ...prev, loading: true, error: null }))

      try {
        const response = await apiCall(options)

        if (response.success === false) {
          throw new Error(response.message || 'API call failed')
        }

        const responseData =
          (response as any).user ??
          (response as any).data?.user ??
          (response as any).records ??
          (response as any).data ??
          null

        if (responseData) {
          setState({ data: responseData, loading: false, error: null })
          return responseData
        }

        if (response.success === true) {
          setState({ data: null, loading: false, error: null })
          return null
        }

        throw new Error(
          response.message || 'API call failed: Unexpected response structure',
        )
      } catch (error: unknown) {
        const apiError = error as Partial<ApiErrorShape> & { message?: string }
        const errorMessage = apiError?.message || 'Unknown error'
        setState({ data: null, loading: false, error: errorMessage })
        throw error
      }
    },
    [],
  )

  return { ...state, execute }
}
