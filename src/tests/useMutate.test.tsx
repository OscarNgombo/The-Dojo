/// <reference types="vitest" />
import { describe, test, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useMutate } from '@/hooks/useMutate'
import { ToastProvider } from '@/providers/ToastProvider'
import type { ReactNode } from 'react'

function wrapper({ children }: { children: ReactNode }) {
  return <ToastProvider>{children}</ToastProvider>
}

describe('useMutate', () => {
  test('successful mutation returns data and no error', async () => {
    const { result } = renderHook(
      () =>
        useMutate<{ value: number }, { doubled: number}>({
          mutateFn: async (vars) => ({ doubled: vars.value * 2 }),
          autoToast: { success: false, error: false },
        }),
      { wrapper },
    )

    let data: any
    await act(async () => {
      data = await result.current.mutate({ value: 5 })
    })

    expect(data.doubled).toBe(10)
    expect(result.current.error).toBeNull()
    expect(result.current.loading).toBe(false)
  })

  test('failed mutation sets error and rolls back', async () => {
    let optimisticallyApplied = false
    let rolledBack = false
    const { result } = renderHook(
      () =>
        useMutate<{ id: string }, { ok: boolean }>({
          mutateFn: async () => {
            throw new Error('Boom')
          },
          optimisticUpdate: () => { optimisticallyApplied = true },
          rollback: () => { rolledBack = true },
          autoToast: { success: false, error: false },
        }),
      { wrapper },
    )

    await act(async () => {
      const out = await result.current.mutate({ id: '1' })
      expect(out).toBeNull()
    })

    expect(optimisticallyApplied).toBe(true)
    expect(rolledBack).toBe(true)
    expect(result.current.error).toBe('Boom')
  })
})
