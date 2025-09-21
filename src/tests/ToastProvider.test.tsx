/// <reference types="vitest" />
import { renderHook, act } from '@testing-library/react'
import { vi, describe, test, expect } from 'vitest'
import { ToastProvider, useToast } from '../providers/ToastProvider'
import type { ReactNode } from 'react'

function wrapper({ children }: { children: ReactNode }) {
  return <ToastProvider>{children}</ToastProvider>
}

describe('ToastProvider', () => {
  test('adds and auto-removes a toast', () => {
    vi.useFakeTimers()
    const { result } = renderHook(() => useToast(), { wrapper })

    act(() => {
      result.current.addToast({ message: 'Hello', type: 'info', duration: 1000 })
    })

    expect(result.current.toasts).toHaveLength(1)
    expect(result.current.toasts[0].message).toBe('Hello')

    act(() => {
      vi.advanceTimersByTime(1100)
    })

    expect(result.current.toasts).toHaveLength(0)
    vi.useRealTimers()
  })
})
