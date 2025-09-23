import { useCallback, useRef, useState } from 'react'
import { useToast } from '@/providers/ToastProvider'
import type { RequestConfig } from '@/types'

export interface UseMutateOptions<TVars, TData> {
  mutateFn: (vars: TVars, config?: RequestConfig) => Promise<TData>
  onSuccess?: (data: TData, vars: TVars) => void
  onError?: (message: string, vars: TVars) => void
  onSettled?: (vars: TVars) => void
  optimisticUpdate?: (vars: TVars) => void
  rollback?: (vars: TVars) => void
  autoToast?: {
    success?: boolean
    error?: boolean
  }
  messages?: {
    success?: string | ((data: TData, vars: TVars) => string)
    error?: string | ((message: string, vars: TVars) => string)
  }
}

export interface UseMutateReturn<TVars, TData> {
  mutate: (vars: TVars, config?: RequestConfig) => Promise<TData | null>
  loading: boolean
  error: string | null
  lastVars: TVars | null
}

export function useMutate<TVars, TData>(
  options: UseMutateOptions<TVars, TData>,
): UseMutateReturn<TVars, TData> {
  const {
    mutateFn,
    onSuccess,
    onError,
    onSettled,
    optimisticUpdate,
    rollback,
    autoToast,
    messages,
  } = options
  const { addToast } = useToast()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const lastVarsRef = useRef<TVars | null>(null)
  const didOptimisticRef = useRef(false)

  const mutate = useCallback(
    async (vars: TVars, config?: RequestConfig) => {
      setLoading(true)
      setError(null)
      lastVarsRef.current = vars
      didOptimisticRef.current = false

      if (optimisticUpdate) {
        try {
          optimisticUpdate(vars)
          didOptimisticRef.current = true
        } catch (e) {
          didOptimisticRef.current = false
        }
      }

      try {
        const data = await mutateFn(vars, config)
        onSuccess?.(data, vars)
        if (autoToast?.success) {
          const msg = messages?.success
            ? typeof messages.success === 'function'
              ? messages.success(data, vars)
              : messages.success
            : 'Action completed'
          addToast({ message: msg, type: 'success' })
        }
        return data
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error'
        setError(message)
        if (didOptimisticRef.current && rollback) {
          try {
            rollback(vars)
          } catch {
            /* noop */
          }
        }
        onError?.(message, vars)
        if (autoToast?.error !== false) {
          const msg = messages?.error
            ? typeof messages.error === 'function'
              ? messages.error(message, vars)
              : messages.error
            : message
          addToast({ message: msg, type: 'error' })
        }
        return null
      } finally {
        setLoading(false)
        onSettled?.(vars)
        didOptimisticRef.current = false
      }
    },
    [
      mutateFn,
      onSuccess,
      onError,
      onSettled,
      optimisticUpdate,
      rollback,
      autoToast,
      messages,
      addToast,
    ],
  )

  return {
    mutate,
    loading,
    error,
    lastVars: lastVarsRef.current,
  }
}
