import { useState, useMemo, useCallback } from 'react'

export type SortDirection = 'asc' | 'desc'

export interface SortState<T> {
  key: keyof T | null
  direction: SortDirection
}

export interface UseClientSortOptions<T> {
  initialKey?: keyof T
  initialDirection?: SortDirection
}

export interface UseClientSortResult<T> {
  sorted: T[]
  sortState: SortState<T>
  setSort: (key: keyof T) => void
  clearSort: () => void
  setSortCustom: (key: keyof T, direction: SortDirection) => void
}

export function useClientSort<T extends Record<string, any>>(
  data: T[],
  options?: UseClientSortOptions<T>,
): UseClientSortResult<T> {
  const [sortState, setSortState] = useState<SortState<T>>({
    key: options?.initialKey || null,
    direction: options?.initialDirection || 'asc',
  })

  const setSort = useCallback((key: keyof T) => {
    setSortState((prev) => {
      if (prev.key === key) {
        return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' }
      }
      return { key, direction: 'asc' }
    })
  }, [])

  const clearSort = useCallback(
    () => setSortState({ key: null, direction: 'asc' }),
    [],
  )

  const setSortCustom = useCallback(
    (key: keyof T, direction: SortDirection) => {
      setSortState({ key, direction })
    },
    [],
  )

  const sorted = useMemo(() => {
    if (!sortState.key) return data
    const arr = [...data]
    arr.sort((a, b) => {
      const av = a[sortState.key!]
      const bv = b[sortState.key!]
      if (av == null && bv == null) return 0
      if (av == null) return -1
      if (bv == null) return 1
      if (typeof av === 'number' && typeof bv === 'number') {
        return sortState.direction === 'asc' ? av - bv : bv - av
      }
      const as = String(av).toLowerCase()
      const bs = String(bv).toLowerCase()
      if (as < bs) return sortState.direction === 'asc' ? -1 : 1
      if (as > bs) return sortState.direction === 'asc' ? 1 : -1
      return 0
    })
    return arr
  }, [data, sortState])

  return { sorted, sortState, setSort, clearSort, setSortCustom }
}
