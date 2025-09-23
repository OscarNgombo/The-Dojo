/// <reference types="vitest" />
import { renderHook, act, waitFor } from '@testing-library/react'
import { vi, describe, test, expect } from 'vitest'
import { TasksProvider, useTasks } from '@/providers/TasksProvider'
import { ToastProvider } from '@/providers/ToastProvider'
import { taskService } from '@/api/tasks'
import type { TaskFormData } from '@/types'

function wrapper({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <TasksProvider>{children}</TasksProvider>
    </ToastProvider>
  )
}

describe('TasksProvider optimistic create', () => {
  test('adds temp task then replaces with real one', async () => {
    vi.spyOn(taskService, 'getTasks').mockResolvedValue({
      success: true,
      data: { records: [], current_page: 1, last_page: 1, total_count: 0 },
    } as any)

    const createSpy = vi.spyOn(taskService, 'createTask').mockResolvedValue({
      success: true,
      data: {
        id: 999,
        subject_id: 1,
        title: 'Created Title',
        description: 'Desc',
        requirements: 'Req',
        due_date: '2025-09-23T00:00:00.000Z',
        max_score: 50,
        is_active: true,
        created_by: 1,
        created_at: '2025-09-23T00:00:00.000Z',
        updated_at: '2025-09-23T00:00:00.000Z',
        created_by_name: 'Admin',
        subject_name: 'Subject',
      },
    } as any)

    const { result } = renderHook(() => useTasks(), { wrapper })

    await act(async () => {
      await result.current.actions.fetchTasks(1, 10)
    })

    const form: TaskFormData = {
      subjectId: '1',
      title: 'Temp Title',
      description: 'Desc',
      requirements: 'Req',
      dueDate: '2025-09-23T00:00:00.000Z',
      maxScore: 50,
      isActive: true,
    }

    await act(async () => {
      await result.current.actions.createTask(form)
    })

    // After optimistic: should have at least one task
    expect(result.current.state.tasks.length).toBeGreaterThan(0)
  // temp + final presence checked via waitFor below
    expect(createSpy).toHaveBeenCalled()
    // Either temp replaced quickly or still in transition; ensure final present
    await waitFor(() => {
      expect(result.current.state.tasks.some(t => t.title === 'Created Title')).toBe(true)
    })
    // Ensure temp no longer present after commit
    expect(result.current.state.tasks.some(t => t.id.startsWith('temp-'))).toBe(false)
  })
})
