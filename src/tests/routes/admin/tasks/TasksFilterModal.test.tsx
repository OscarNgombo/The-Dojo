import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { TasksListPage } from '../../../../features/tasks/tasks-list/TasksListPage'

// Mock router hooks used inside TasksListPage
vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => vi.fn(),
  useRouter: () => ({}),
  createFileRoute: () => () => ({
    useSearch: () => ({}),
  }),
}))

// Mock Tasks provider + hook dependencies
vi.mock('@/providers/TasksProvider', () => ({
  TasksProvider: ({ children }: any) => <div>{children}</div>,
  useTasks: () => ({
    state: {
      tasks: [],
      loading: false,
      error: null,
      currentPage: 1,
      totalPages: 1,
      totalCount: 0,
    },
    actions: { fetchTasks: vi.fn(), refetch: vi.fn(), deleteTask: vi.fn() },
  }),
}))

vi.mock('@/features/tasks/hooks/useTasksList', () => ({
  useTasksList: () => ({
    tasks: [],
    loading: false,
    error: null,
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
  }),
}))

describe('Tasks Filter Modal', () => {
  it('renders filter options (search, subject id, status)', () => {
    render(<TasksListPage overrideSearchParams={{ page: 1, pageSize: 10 }} />)
    // Open filter modal via button with aria-label Filter
    const filterBtn = screen.getByRole('button', { name: /filter/i })
    fireEvent.click(filterBtn)

    // Search input inside modal (first labeled 'Search' inside dialog)
    const searchInputs = screen.getAllByLabelText(/search/i)
    expect(searchInputs[0]).toBeInTheDocument()
    // Subject ID input (disambiguate - there is one in header and one in modal). Use modal one by id attribute.
    const subjectIdInputs = screen.getAllByLabelText(/subject id/i)
    // pick the one that has the modal-specific id attribute if present
    const modalSubjectInput =
      subjectIdInputs.find(
        (el) => el.getAttribute('id') === 'tasks-filter-subject-id',
      ) || subjectIdInputs[0]
    expect(modalSubjectInput).toBeInTheDocument()
    // Status select
    expect(screen.getByLabelText(/status/i)).toBeInTheDocument()
  })
})
