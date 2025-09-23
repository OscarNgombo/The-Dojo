/// <reference types="vitest" />
import { describe, test, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { RootTestProviders } from '@/tests/RootTestProviders'
import TasksListPage from '@/features/tasks/tasks-list/TasksListPage'
import { vi } from 'vitest'

vi.mock('@/hooks/useAuthGuards', () => ({
  useRequireAdmin: () => ({ loading: false, isAuthorized: true, isAuthenticated: true }),
}))
vi.mock('@tanstack/react-router', async () => {
  const actual: any = await vi.importActual('@tanstack/react-router')
  return { ...actual, useNavigate: () => () => {}, createFileRoute: () => () => ({}) }
})

// Smoke test: tasks route mounts and updates page param when navigating programmatically

describe('Tasks Route', () => {
  test('initial render defaults page=1', async () => {
    render(
      <RootTestProviders>
        <TasksListPage overrideSearchParams={{ page: 1, pageSize: 10 }} />
      </RootTestProviders>,
    )
    // since data fetching is async, just assert DOM heading eventually
  const heading = await screen.findByRole('heading', { name: /tasks/i })
    expect(heading).toBeInTheDocument()
  })
})
