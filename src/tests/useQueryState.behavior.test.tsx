import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'

// Mock router hooks before importing hook under test
const navigateSpy = vi.fn()
const stableSearch: Record<string, string> = {}
vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => navigateSpy,
  useSearch: () => stableSearch,
}))

import { useQueryState } from '../hooks/useQueryState'

describe('useQueryState (deferred navigation)', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    navigateSpy.mockReset()
  })

  it('debounces and calls navigate only after delay', () => {
    const { result } = renderHook(() =>
      useQueryState<string, '/'>({
        key: 'search',
        defaultValue: '',
        route: '/',
        debounceMs: 40,
      }),
    )

    const setSearch = result.current[1]
    act(() => {
      setSearch('a')
      setSearch('ab')
      setSearch('abc')
    })
    expect(navigateSpy).toHaveBeenCalledTimes(0)
    act(() => {
      vi.advanceTimersByTime(20)
    })
    expect(navigateSpy).toHaveBeenCalledTimes(0)
    act(() => {
      vi.advanceTimersByTime(25)
    })
    expect(navigateSpy).toHaveBeenCalledTimes(1)
    // Latest value reflected
    expect(result.current[0]).toBe('abc')
  })

  it('immediate commit when no debounce', () => {
    const { result } = renderHook(() =>
      useQueryState<string, '/'>({
        key: 'search',
        defaultValue: '',
        route: '/',
      }),
    )
    const setSearch = result.current[1]
    act(() => setSearch('hello'))
    act(() => {
      vi.runAllTimers()
    })
    expect(navigateSpy).toHaveBeenCalledTimes(1)
    expect(result.current[0]).toBe('hello')
  })
})
