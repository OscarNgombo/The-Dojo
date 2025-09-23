/// <reference types="vitest" />
import { renderHook, act, waitFor } from '@testing-library/react'
import { describe, test, expect, vi } from 'vitest'
import { SubjectsProvider, useSubjects } from '@/providers/SubjectsProvider'
import { ToastProvider } from '@/providers/ToastProvider'
import { subjectService } from '@/api/subjects'
import type { Subject } from '@/types'

// Minimal mock raw subject data shape
const makeSubject = (id: string, name = `Subject ${id}`): Subject => ({
  id,
  name,
  description: 'Desc',
  isActive: true,
  createdBy: '1',
  createdAt: '2025-09-20T00:00:00.000Z',
  updatedAt: '2025-09-20T00:00:00.000Z',
  createdByName: 'Admin',
})

function wrapper({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <SubjectsProvider>{children}</SubjectsProvider>
    </ToastProvider>
  )
}

describe('SubjectsProvider (refactored)', () => {
  test('fetchSubjects loads and normalizes data', async () => {
    const spy = vi.spyOn(subjectService, 'getSubjects').mockResolvedValue({
      success: true,
      data: {
        records: [makeSubject('1')],
        current_page: 1,
        last_page: 1,
        total_count: 1,
      },
    } as any)

    const { result } = renderHook(() => useSubjects(), { wrapper })

    await act(async () => {
      await result.current.actions.fetchSubjects(1, 10)
    })

    await waitFor(() => {
      expect(result.current.state.subjects).toHaveLength(1)
    })
    expect(result.current.state.subjects[0].name).toBe('Subject 1')
    expect(spy).toHaveBeenCalled()
  })

  test('createSubject optimistic then commit', async () => {
    vi.spyOn(subjectService, 'getSubjects').mockResolvedValue({
      success: true,
      data: { records: [], current_page: 1, last_page: 1, total_count: 0 },
    } as any)

    const createSpy = vi.spyOn(subjectService, 'createSubject').mockResolvedValue({
      success: true,
      data: makeSubject('10', 'New Subject'),
    } as any)

    const { result } = renderHook(() => useSubjects(), { wrapper })

    await act(async () => {
      await result.current.actions.fetchSubjects(1, 10)
    })

    const before = result.current.state.totalCount

    await act(async () => {
      await result.current.actions.createSubject({ name: 'New Subject', description: 'Desc', isActive: true })
    })

    // After optimistic + commit
    expect(result.current.state.totalCount).toBe(before + 1)
    expect(result.current.state.subjects.some(s => s.name === 'New Subject')).toBe(true)
    expect(createSpy).toHaveBeenCalled()
  })
})
