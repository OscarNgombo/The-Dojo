import { useCallback, useMemo, useRef, useState } from 'react'
import { Route } from '@/routes/admin/tasks/'
import { useNavigate } from '@tanstack/react-router'
import { useTasksList } from '../hooks/useTasksList'
import { useTasks } from '@/providers/TasksProvider'
import { DataTable, Spinner, RowActions, Modal, Badge, Button } from '@/components/ui'
import type { ColumnDef } from '@/types/dataTable'
import type { Task } from '@/types'
import { formatDate } from '@/utils/dateUtils'
import { SearchIcon } from '@/components/Icons'

export interface TasksListPageProps {
  overrideSearchParams?: {
    page: number
    pageSize: number
    search?: string
    subjectId?: string
    isActive?: boolean
    sort?: string
    dir?: 'asc' | 'desc'
  }
}

export const TasksListPage: React.FC<TasksListPageProps> = ({
  overrideSearchParams,
}) => {
  const routeSearch = Route.useSearch?.() as {
    page: number
    pageSize: number
    search?: string
    subjectId?: string
    isActive?: boolean
    sort?: string
    dir?: 'asc' | 'desc'
  }
  const searchParams = overrideSearchParams ?? routeSearch
  const navigate = useNavigate()
  const { actions } = useTasks()
  const [isFilterOpen, setFilterOpen] = useState(false)
  const [isSortOpen, setSortOpen] = useState(false)
  const [showSearchBar, setShowSearchBar] = useState(!!searchParams.search)
  const [subjectIdInput, setSubjectIdInput] = useState(searchParams.subjectId || '')
  const searchInputRef = useRef<HTMLInputElement | null>(null)

  const state = useTasksList({
    page: searchParams.page,
    pageSize: searchParams.pageSize,
    search: searchParams.search,
    subjectId: searchParams.subjectId,
    isActive: searchParams.isActive,
  })

  const updateSearch = useCallback(
    (patch: Partial<typeof searchParams>) => {
      navigate({
        to: '/admin/tasks',
        // Provide a reducer function accepted by TanStack Router types
        search: (prev) => ({ ...(prev as any), ...searchParams, ...patch }),
        replace: true,
      })
    },
    [navigate, searchParams],
  )

  const columns: ColumnDef<Task>[] = useMemo(
    () => [
      { accessorKey: 'title', header: 'Title' },
      {
        accessorKey: 'subjectName',
        header: 'Subject',
        cell: ({ row }) => row.original.subjectName || row.original.subjectId,
      },
      {
        accessorKey: 'dueDate',
        header: 'Due Date',
        cell: ({ row }) => (
          <span style={{ fontSize: 12 }}>
            {formatDate(row.original.dueDate)}
          </span>
        ),
      },
      {
        accessorKey: 'maxScore',
        header: 'Max Score',
        cell: ({ row }) => <span>{row.original.maxScore}</span>,
      },
      {
        accessorKey: 'isActive',
        header: 'Status',
        cell: ({ row }) => (
          <Badge variant={row.original.isActive ? 'success' : 'danger'}>
            {row.original.isActive ? 'Active' : 'Inactive'}
          </Badge>
        ),
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <RowActions
            actions={[
              {
                label: 'View',
                onClick: () =>
                  navigate({
                    to: '/admin/tasks/$taskId',
                    // send raw id (avoid base64 encode causing 400)
                    params: { taskId: row.original.id },
                  }),
              },
              {
                label: 'Update',
                onClick: () =>
                  navigate({
                    to: '/admin/tasks/$taskId',
                    params: { taskId: row.original.id },
                    search: { mode: 'edit' },
                  }),
              },
              {
                label: 'Delete',
                variant: 'danger',
                onClick: () => {
                  if (
                    window.confirm(
                      `Delete task "${row.original.title}"? This action cannot be undone.`,
                    )
                  ) {
                    void actions.deleteTask?.(row.original.id)
                  }
                },
              },
            ]}
          />
        ),
      },
    ],
    [navigate, actions],
  )

  // Client-side sort (persist key + dir in URL search params for shareability)
  const displayedTasks = useMemo(() => {
    const key = searchParams.sort as keyof Task | undefined
    const dir = (searchParams.dir as 'asc' | 'desc' | undefined) || 'asc'
    if (!key) return state.tasks
    // Use explicit custom sort when key exists
    return [...state.tasks].sort((a: any, b: any) => {
      const av = a[key]
      const bv = b[key]
      if (av == null && bv == null) return 0
      if (av == null) return dir === 'asc' ? -1 : 1
      if (bv == null) return dir === 'asc' ? 1 : -1
      if (typeof av === 'number' && typeof bv === 'number')
        return dir === 'asc' ? av - bv : bv - av
      const as = String(av).toLowerCase()
      const bs = String(bv).toLowerCase()
      if (as < bs) return dir === 'asc' ? -1 : 1
      if (as > bs) return dir === 'asc' ? 1 : -1
      return 0
    })
  }, [state.tasks, searchParams.sort, searchParams.dir])

  const sortActiveCount = searchParams.sort ? 1 : 0
  const filterCount = useMemo(
    () => [!!searchParams.search, !!searchParams.subjectId, searchParams.isActive !== undefined].filter(Boolean).length,
    [searchParams.search, searchParams.subjectId, searchParams.isActive],
  )

  const onPageChange = (next: number) => {
    updateSearch({ page: next })
  }
  return (
    <div style={{ padding: '1rem' }}>
      <h1 style={{ marginBottom: 12 }}>Tasks</h1>
      {state.loading && state.tasks.length === 0 && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '60vh',
          }}
        >
          <Spinner size="large" color="primary" />
        </div>
      )}
      {!state.loading && state.error && (
        <div style={{ color: 'red', padding: '0.5rem 0' }}>{state.error}</div>
      )}
      <DataTable
        columns={columns as any}
        data={displayedTasks}
        caption="List of tasks"
        ariaLabel="Tasks table with filtering and pagination"
        getRowId={(row: Task) => row.id}
        currentPage={state.currentPage}
        totalPages={state.totalPages}
        onPageChange={(p) => onPageChange(p)}
        totalCount={state.totalCount}
        pageSize={searchParams.pageSize}
        showFilterButton={!filterCount}
        showSortButton={!sortActiveCount}
        filterActive={
          filterCount
            ? { count: filterCount, onClear: () => updateSearch({ search: undefined, subjectId: undefined, isActive: undefined }) }
            : undefined
        }
        sortActive={
          sortActiveCount
            ? { count: 1, onClear: () => updateSearch({ sort: undefined, dir: undefined }) }
            : undefined
        }
        onFilter={() => setFilterOpen(true)}
        onSort={() => setSortOpen(true)}
        onRefresh={() => actions.refetch()}
        headerStart={
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'nowrap' }}>
            <button
              type="button"
              onClick={() => {
                setShowSearchBar((s) => !s)
                // if revealing search, focus next tick
                setTimeout(() => {
                  if (!showSearchBar) searchInputRef.current?.focus()
                }, 0)
                // if hiding search clear it
                if (showSearchBar && searchParams.search) {
                  updateSearch({ search: undefined, page: 1 })
                }
              }}
              aria-label={showSearchBar ? 'Hide search' : 'Show search'}
              style={{
                background: '#1d7dd7',
                border: 'none',
                padding: 6,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 4,
                cursor: 'pointer',
                color: '#fff',
              }}
            >
              <SearchIcon />
            </button>
            {showSearchBar && (
              <input
                ref={searchInputRef}
                id="tasks-search"
                type="text"
                value={searchParams.search || ''}
                onChange={(e) => updateSearch({ search: e.target.value, page: 1 })}
                placeholder="Search tasks..."
                style={{
                  flex: 1,
                  minWidth: 160,
                  padding: '8px',
                  borderRadius: 4,
                  border: '1px solid var(--border-color)',
                }}
                aria-label="Search tasks"
              />
            )}
            <input
              type="text"
              placeholder="Subject ID"
              value={subjectIdInput}
              onChange={(e) => {
                setSubjectIdInput(e.target.value)
              }}
              onBlur={() => updateSearch({ subjectId: subjectIdInput || undefined, page: 1 })}
              style={{
                width: 140,
                padding: '8px',
                borderRadius: 4,
                border: '1px solid var(--border-color)',
              }}
              aria-label="Filter by subject id"
            />
          </div>
        }
        emptyState={
          <div style={{ padding: '1rem', textAlign: 'center' }}>
            <p style={{ fontWeight: 600 }}>No tasks found</p>
            <p style={{ fontSize: 12, color: 'var(--secondary-color)' }}>
              Try adjusting your search criteria to find tasks.
            </p>
          </div>
        }
      />
      <Modal
        open={isFilterOpen}
        onClose={() => setFilterOpen(false)}
        title="Filter Tasks"
        primaryAction={{
          label: 'Apply',
          onClick: () => {
            setFilterOpen(false)
          },
          autoFocus: true,
        }}
        secondaryAction={{
          label: 'Reset',
          onClick: () => {
            updateSearch({ search: undefined, subjectId: undefined, isActive: undefined, page: 1 })
            setSubjectIdInput('')
            setFilterOpen(false)
          },
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: 4 }} htmlFor="tasks-filter-search">Search</label>
            <input
              id="tasks-filter-search"
              type="text"
              value={searchParams.search || ''}
              onChange={(e) => updateSearch({ search: e.target.value || undefined, page: 1 })}
              placeholder="Search tasks..."
              style={{ width: '100%', padding: '8px', borderRadius: 4, border: '1px solid var(--border-color)' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: 4 }} htmlFor="tasks-filter-subject-id">Subject ID</label>
            <input
              id="tasks-filter-subject-id"
              type="text"
              value={subjectIdInput}
              onChange={(e) => setSubjectIdInput(e.target.value)}
              onBlur={() => updateSearch({ subjectId: subjectIdInput || undefined, page: 1 })}
              placeholder="Enter subject id"
              style={{ width: '100%', padding: '8px', borderRadius: 4, border: '1px solid var(--border-color)' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: 4 }} htmlFor="tasks-filter-status">Status</label>
            <select
              id="tasks-filter-status"
              value={searchParams.isActive === undefined ? 'all' : searchParams.isActive ? 'active' : 'inactive'}
              onChange={(e) => {
                const v = e.target.value
                updateSearch({ isActive: v === 'all' ? undefined : v === 'active', page: 1 })
              }}
              style={{ width: '100%', padding: '8px', borderRadius: 4, border: '1px solid var(--border-color)' }}
            >
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </Modal>
      <Modal
        open={isSortOpen}
        onClose={() => setSortOpen(false)}
        title="Sort Tasks"
        primaryAction={{
          label: 'Apply',
          onClick: () => setSortOpen(false),
          autoFocus: true,
        }}
        secondaryAction={{
          label: 'Reset',
          onClick: () => {
            updateSearch({ sort: undefined, dir: undefined })
            setSortOpen(false)
          },
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: 4 }}>
              Field
            </label>
            <select
              value={searchParams.sort || ''}
              onChange={(e) => updateSearch({ sort: e.target.value || undefined, dir: searchParams.dir || 'asc' })}
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: 4,
                border: '1px solid var(--border-color)',
              }}
            >
              <option value="">None</option>
              <option value="title">Title</option>
              <option value="dueDate">Due Date</option>
              <option value="maxScore">Max Score</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: 4 }}>
              Direction
            </label>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <Button
                variant={searchParams.dir === 'asc' || !searchParams.dir ? 'primary' : 'secondary'}
                onClick={() => updateSearch({ dir: 'asc' })}
              >
                Asc
              </Button>
              <Button
                variant={searchParams.dir === 'desc' ? 'primary' : 'secondary'}
                onClick={() => updateSearch({ dir: 'desc' })}
              >
                Desc
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default TasksListPage
