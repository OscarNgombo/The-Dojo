/// <reference types="vitest" />
import { describe, test, expect, vi } from 'vitest'
import { render, waitFor } from '@testing-library/react'
import { RootTestProviders } from '../tests/RootTestProviders'
import TasksListPage from '../features/tasks/tasks-list/TasksListPage'
import { taskService } from '../api/tasks'

// Mock route module & navigation since we rely on overrideSearchParams only
vi.mock('@/routes/admin/tasks/', () => ({
  Route: { useSearch: () => ({ page: 1, pageSize: 10 }) },
}))
vi.mock('@tanstack/react-router', async () => {
  const actual: any = await vi.importActual('@tanstack/react-router')
  return { ...actual, useNavigate: () => () => {} }
})

describe('Tasks sorting does not refetch', () => {
  test('changing sort params does not trigger new fetch', async () => {
    const spy = vi.spyOn(taskService, 'getTasks').mockResolvedValue({
      data: {
        current_page: 1,
        last_page: 1,
        total_count: 0,
        records: [],
      },
      success: true,
    } as any)

    const { rerender } = render(
      <RootTestProviders>
        <TasksListPage overrideSearchParams={{ page: 1, pageSize: 10 }} />
      </RootTestProviders>,
    )

    await waitFor(() => expect(spy).toHaveBeenCalledTimes(1))

    // Rerender with only client-side sort params; provider fetch dependencies unchanged
    rerender(
      <RootTestProviders>
        <TasksListPage
          overrideSearchParams={{
            page: 1,
            pageSize: 10,
            sort: 'title',
            dir: 'asc',
          }}
        />
      </RootTestProviders>,
    )

    // Ensure no additional fetch
    await new Promise((r) => setTimeout(r, 50))
    expect(spy).toHaveBeenCalledTimes(1)
  })
})
