/// <reference types="vitest" />
import { renderHook, act, waitFor } from '@testing-library/react'
import { vi, describe, test, expect } from 'vitest'
import { TasksProvider } from '../providers/TasksProvider'
import { ToastProvider } from '../providers/ToastProvider'
import { useTasks } from '../providers/TasksProvider'
import type { ReactNode } from 'react'
import * as api from '../api/tasks'

function wrapper({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <TasksProvider>{children}</TasksProvider>
    </ToastProvider>
  )
}

describe('TasksProvider', () => {
  test('fetchTasks updates state with records', async () => {
    const spy = vi.spyOn(api.taskService, 'getTasks').mockResolvedValue({
      data: {
        domain: 'subject_tasks',
        current_page: 1,
        last_page: 1,
        page_size: 10,
        total_count: 1,
        records: [
          {
            id: 1,
            subject_id: 2,
            title: 'Test Task',
            description: 'Desc',
            requirements: 'Req',
            due_date: '2025-09-22T00:00:00.000Z',
            max_score: 10,
            is_active: true,
            created_by: 1,
            created_at: '2025-09-22T00:00:00.000Z',
            updated_at: '2025-09-22T00:00:00.000Z',
            created_by_name: 'Admin User',
            subject_name: 'React',
          },
        ],
      },
      success: true,
    } as any)

    const { result } = renderHook(() => useTasks(), { wrapper })

    await act(async () => {
      await result.current.actions.fetchTasks(1, 10)
    })

    await waitFor(() => {
      expect(result.current.state.tasks).toHaveLength(1)
    })
    expect(result.current.state.tasks[0].title).toBe('Test Task')
    expect(spy).toHaveBeenCalled()
  })

  test('fetchTasks passes filtering params to service', async () => {
    const spy = vi.spyOn(api.taskService, 'getTasks').mockResolvedValue({
      data: {
        domain: 'subject_tasks',
        current_page: 1,
        last_page: 1,
        page_size: 10,
        total_count: 0,
        records: [],
      },
      success: true,
    } as any)

    const { result } = renderHook(() => useTasks(), { wrapper })

    await act(async () => {
      await result.current.actions.fetchTasks(2, 25, {
        subjectId: '55',
        isActive: false,
        search: 'abc',
      })
    })

    expect(spy).toHaveBeenCalledTimes(1)
    expect(spy.mock.calls[0][0]).toMatchObject({
      page: 2,
      pageSize: 25,
      subjectId: '55',
      isActive: false,
    })
  })
})
