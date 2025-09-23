import { useState, useCallback, useEffect, useRef } from 'react'
import type { ApiResponse, ApiErrorShape, RequestConfig } from '../types'

export interface UseApiCallOptions<T> {
  auto?: boolean
  deps?: React.DependencyList
  keepPreviousData?: boolean
  transform?: (data: T | null) => T | null
  onSuccess?: (data: T | null) => void
  onError?: (error: string) => void
  apiCall?: (config?: RequestConfig) => Promise<ApiResponse<T>>
  requestConfig?: RequestConfig
}

interface UseApiCallState<T> {
  data: T | null
  loading: boolean
  refreshing: boolean
  error: string | null
}

interface ExecuteOptions extends RequestConfig {}

export const useApiCall = <T>(options?: UseApiCallOptions<T>) => {
  const {
    auto = false,
    deps = [],
    keepPreviousData = true,
    transform,
    onSuccess,
    onError,
    apiCall: providedApiCall,
    requestConfig,
  } = options || {}

  const [state, setState] = useState<UseApiCallState<T>>({
    data: null,
    loading: !!auto,
    refreshing: false,
    error: null,
  })

  const abortRef = useRef<AbortController | null>(null)

  const run = useCallback(
    async (
      apiCall: (config?: RequestConfig) => Promise<ApiResponse<T>>,
      execConfig?: ExecuteOptions,
    ) => {
      if (abortRef.current) {
        abortRef.current.abort()
      }
      const controller = new AbortController()
      abortRef.current = controller
      const mergedConfig: RequestConfig = {
        ...(execConfig || {}),
        signal: controller.signal,
      }
      setState((prev) => ({
        ...prev,
        loading: !prev.data || !keepPreviousData,
        refreshing: !!prev.data && keepPreviousData,
        error: null,
      }))
      try {
        const response = await apiCall(mergedConfig)
        if (response.success === false) {
          throw new Error(response.message || 'API call failed')
        }
        const responseData =
          (response as any).user ??
          (response as any).data?.user ??
          (response as any).records ??
          (response as any).data ??
          null
        const finalData = transform ? transform(responseData) : responseData
        setState({
          data: finalData,
          loading: false,
          refreshing: false,
          error: null,
        })
        onSuccess?.(finalData)
        return finalData
      } catch (error: unknown) {
        if ((error as any)?.name === 'AbortError') return null
        const apiError = error as Partial<ApiErrorShape> & { message?: string }
        const errorMessage = apiError?.message || 'Unknown error'
        setState({
          data: keepPreviousData ? state.data : null,
          loading: false,
          refreshing: false,
          error: errorMessage,
        })
        onError?.(errorMessage)
        return null
      }
    },
    [keepPreviousData, onError, onSuccess, transform, state.data],
  )

  const execute = useCallback(
    async (
      apiCallArg?: (config?: RequestConfig) => Promise<ApiResponse<T>>,
      execConfig?: ExecuteOptions,
    ) => {
      const target = apiCallArg || providedApiCall
      if (!target) throw new Error('No apiCall provided to execute')
      return run(target, execConfig)
    },
    [providedApiCall, run],
  )

  useEffect(() => {
    if (!auto || !providedApiCall) return
    void execute(undefined, requestConfig)
  }, deps)

  useEffect(
    () => () => {
      abortRef.current?.abort()
    },
    [],
  )

  return { ...state, execute }
}
