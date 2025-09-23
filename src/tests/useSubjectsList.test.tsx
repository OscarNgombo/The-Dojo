import { renderHook, act, waitFor } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import React from 'react'
import { RootTestProviders } from './RootTestProviders'
import { subjectService } from '../api/subjects'
import { useSubjectsList } from '../hooks/useSubjectsList'

// Mock useSubjectFilters to avoid dependency on TanStack Router search state.
// This gives us simple local state setters so we can trigger the effect.
vi.mock('@/hooks/useSubjectFilters', () => {
  return {
    useSubjectFilters: () => {
      const [search, setSearch] = React.useState('')
      const [activeFilter, setActiveFilter] = React.useState<
        'all' | 'active' | 'inactive'
      >('all')
      const [page, setPage] = React.useState(1)
      return {
        search,
        activeFilter,
        page,
        setSearch,
        setActiveFilter,
        setPage,
        reset: () => {
          setSearch('')
          setActiveFilter('all')
          setPage(1)
        },
      }
    },
  }
})

vi.mock('@/api/subjects', async (orig) => {
  const actualMod: any = await orig()
  return {
    ...actualMod,
    subjectService: {
      ...actualMod.subjectService,
      getSubjects: vi.fn(),
    },
  }
})

const mockPage = (records: any[] = [], overrides: Partial<any> = {}) => ({
  success: true,
  data: {
    records,
    current_page: 1,
    last_page: 1,
    total_count: records.length,
    ...overrides,
  },
})

describe('useSubjectsList regression', () => {
  beforeEach(() => {
    ;(subjectService.getSubjects as any).mockReset()
  })

  it('calls getSubjects exactly once on initial mount', async () => {
    ;(subjectService.getSubjects as any).mockResolvedValueOnce(
      mockPage([
        {
          id: '1',
          name: 'S1',
          description: 'D',
          isActive: true,
          createdBy: '1',
          createdAt: '2025-09-01T00:00:00Z',
          updatedAt: '2025-09-01T00:00:00Z',
          createdByName: 'Admin',
        },
      ]),
    )

    const { result } = renderHook(() => useSubjectsList(), {
      wrapper: RootTestProviders,
    })

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(subjectService.getSubjects).toHaveBeenCalledTimes(1)
  })

  it('fires again when search filter changes (debounced)', async () => {
    ;(subjectService.getSubjects as any)
      .mockResolvedValueOnce(mockPage())
      .mockResolvedValueOnce(mockPage())

    const { result, rerender } = renderHook(() => useSubjectsList(), {
      wrapper: RootTestProviders,
    })

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(subjectService.getSubjects).toHaveBeenCalledTimes(1)

    await act(async () => {
      result.current.filters.setSearch('abc')
    })

    await waitFor(() =>
      expect(subjectService.getSubjects).toHaveBeenCalledTimes(2),
    )
    rerender()
    expect(subjectService.getSubjects).toHaveBeenCalledTimes(2)
  })
})
