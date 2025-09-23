import { renderHook, act, waitFor } from '@testing-library/react'
import { vi } from 'vitest'
import { useSubjectTasks } from '@/hooks/useSubjectTasks'
import { taskService } from '@/api/tasks'

vi.mock('@/api/tasks', async (orig) => {
  const actual = await orig()
  return {
    ...actual,
    taskService: {
      ...actual.taskService,
      getTasks: vi.fn(),
    },
  }
})

describe('useSubjectTasks', () => {
  it('fetches and normalizes tasks', async () => {
    const mockResp = {
      data: {
        records: [
          {
            id: 1,
            subject_id: 10,
            title: 'T1',
            description: 'Desc',
            requirements: 'Req',
            due_date: '2025-09-01T00:00:00Z',
            max_score: 100,
            is_active: true,
            created_by: 2,
            created_at: '2025-08-01T00:00:00Z',
            updated_at: '2025-08-01T00:00:00Z',
          },
        ],
      },
      success: true,
    }
    ;(taskService.getTasks as any).mockResolvedValueOnce(mockResp)

    const { result } = renderHook(() => useSubjectTasks(10))
    expect(result.current.loading).toBe(true)

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.error).toBeNull()
    expect(result.current.tasks).toHaveLength(1)
    expect(result.current.tasks[0].id).toBe('1')
    expect(result.current.tasks[0].subjectId).toBe('10')
  })

  it('handles error state', async () => {
    ;(taskService.getTasks as any).mockRejectedValueOnce(new Error('fail'))
    const { result } = renderHook(() => useSubjectTasks(99))
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    expect(result.current.error).toBe('fail')
    expect(result.current.tasks).toHaveLength(0)
  })

  it('refetch works', async () => {
    ;(taskService.getTasks as any).mockRejectedValueOnce(new Error('fail'))
    const { result } = renderHook(() => useSubjectTasks(50))
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    expect(result.current.error).toBe('fail')

    ;(taskService.getTasks as any).mockResolvedValueOnce({
      data: { records: [] },
      success: true,
    })

    await act(async () => {
      result.current.refetch()
    })

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    expect(result.current.error).toBeNull()
  })
})