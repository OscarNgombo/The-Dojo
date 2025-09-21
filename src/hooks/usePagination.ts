import { useCallback, useMemo, useState } from 'react'

export interface UsePaginationParams {
  totalItems: number
  initialPage?: number
  pageSize: number
}

export interface PaginationResult {
  currentPage: number
  totalPages: number
  pageSize: number
  hasNextPage: boolean
  hasPrevPage: boolean
  nextPage: () => void
  prevPage: () => void
  goToPage: (page: number) => void
  slice: <T>(items: T[]) => T[]
}

export const usePagination = ({
  totalItems,
  initialPage = 1,
  pageSize,
}: UsePaginationParams): PaginationResult => {
  const [currentPage, setCurrentPage] = useState<number>(initialPage)

  const totalPages = useMemo(() => {
    if (pageSize <= 0) return 0
    return Math.max(1, Math.ceil(totalItems / pageSize))
  }, [totalItems, pageSize])

  const hasNextPage = currentPage < totalPages
  const hasPrevPage = currentPage > 1

  const clamp = useCallback(
    (page: number) => Math.min(Math.max(page, 1), totalPages || 1),
    [totalPages],
  )

  const goToPage = useCallback(
    (page: number) => {
      setCurrentPage(clamp(page))
    },
    [clamp],
  )

  const nextPage = useCallback(() => {
    if (hasNextPage) setCurrentPage((p) => p + 1)
  }, [hasNextPage])

  const prevPage = useCallback(() => {
    if (hasPrevPage) setCurrentPage((p) => p - 1)
  }, [hasPrevPage])

  const slice = useCallback(
    <T,>(items: T[]): T[] => {
      const start = (currentPage - 1) * pageSize
      return items.slice(start, start + pageSize)
    },
    [currentPage, pageSize],
  )

  return {
    currentPage,
    totalPages,
    pageSize,
    hasNextPage,
    hasPrevPage,
    nextPage,
    prevPage,
    goToPage,
    slice,
  }
}
