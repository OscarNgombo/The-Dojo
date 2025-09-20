import { createFileRoute, useNavigate, useSearch } from '@tanstack/react-router'
import { useEffect, useMemo, useState, useCallback } from 'react'
import { useUsers } from '../../../providers'
import { useToast } from '../../../providers'
import {
  DataTable,
  Spinner,
  Badge,
  RowActions,
  RoleToggle,
  Modal,
  Button,
  AccessDenied,
} from '../../../components/ui'
import type { ColumnDef } from '../../../types/dataTable'
import type { User } from '../../../types'
import { formatDate } from '../../../utils/dateUtils'
import { useRequireAdmin } from '../../../hooks/useAuthGuards'

export const Route = createFileRoute('/admin/users/')({
  component: UserManagementPage,
})

function UserManagementPage() {
  const {
    loading: authLoading,
    isAuthorized,
    isAuthenticated,
  } = useRequireAdmin()
  if (authLoading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '80vh',
        }}
      >
        <Spinner size="large" color="primary" />
      </div>
    )
  }
  if (!isAuthenticated || !isAuthorized) {
    return <AccessDenied />
  }
  const { state, actions } = useUsers()
  const { addToast } = useToast()
  const {
    users,
    loading: usersLoading,
    error,
    currentPage,
    totalPages,
    totalCount,
  } = state
  const navigate = useNavigate()
  const search = useSearch({ from: '/admin/users/' }) as Record<string, string>

  // Filter/Sort UI state
  const [isFilterOpen, setFilterOpen] = useState(false)
  const [isSortOpen, setSortOpen] = useState(false)

  const [filterRole, setFilterRole] = useState<'all' | 'admin' | 'trainee'>(
    (search.role as any) || 'all',
  )
  const [filterStatus, setFilterStatus] = useState<
    'all' | 'approved' | 'pending' | 'rejected'
  >((search.status as any) || 'all')
  const [searchTerm, setSearchTerm] = useState(search.search || '')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(
    search.search || '',
  )
  const [sortField, setSortField] = useState<
    'name' | 'email' | 'created_at' | ''
  >((search.sortField as any) || '')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>(
    (search.sortDirection as any) || 'asc',
  )

  const applyFetch = useCallback(
    (page: number = 1) => {
      actions.fetchUsers(page, 10, {
        role: filterRole !== 'all' ? filterRole : undefined,
        status: filterStatus !== 'all' ? filterStatus : undefined,
        search: debouncedSearchTerm || undefined,
        sortField: sortField || undefined,
        sortDirection: sortField ? sortDirection : undefined,
      })
    },
    [filterRole, filterStatus, debouncedSearchTerm, sortField, sortDirection],
  )

  useEffect(() => {
    const pageParam = parseInt(search.page || '1', 10)
    applyFetch(Number.isNaN(pageParam) ? 1 : pageParam)
  }, [])

  useEffect(() => {
    const h = setTimeout(() => setDebouncedSearchTerm(searchTerm), 400)
    return () => clearTimeout(h)
  }, [searchTerm])

  // When filter/sort/debounced search inputs change, reset to page 1 and fetch
  useEffect(() => {
    applyFetch(1)
  }, [filterRole, filterStatus, debouncedSearchTerm, sortField, sortDirection])

  // Persist current state to URL (role,status,search,sortField,sortDirection,page)
  useEffect(() => {
    const params: Record<string, string> = {}
    if (filterRole !== 'all') params.role = filterRole
    if (filterStatus !== 'all') params.status = filterStatus
    if (debouncedSearchTerm) params.search = debouncedSearchTerm
    if (sortField) {
      params.sortField = sortField
      params.sortDirection = sortDirection
    }
    if (currentPage && currentPage > 1) params.page = String(currentPage)
    navigate({ to: '/admin/users', search: params as any, replace: true })
  }, [
    filterRole,
    filterStatus,
    debouncedSearchTerm,
    sortField,
    sortDirection,
    currentPage,
    sortDirection,
    navigate,
  ])

  const filterCount = useMemo(
    () =>
      [
        filterRole !== 'all',
        filterStatus !== 'all',
        !!debouncedSearchTerm,
      ].filter(Boolean).length,
    [filterRole, filterStatus, debouncedSearchTerm],
  )

  const sortCount = useMemo(() => (sortField ? 1 : 0), [sortField])

  // Replace filteredSortedUsers with server data directly
  const displayedUsers = users

  const handleRoleChange = async (
    userId: string | number,
    newRole: 'admin' | 'trainee',
    userName: string,
  ) => {
    try {
      await actions.updateUserRole(String(userId), newRole)
      addToast({
        message: `${userName} role updated to ${newRole} successfully`,
        type: 'success',
      })
    } catch (error) {
      addToast({
        message: `Failed to update ${userName}'s role`,
        type: 'error',
      })
    }
  }

  const handleApprove = async (userId: string | number, userName: string) => {
    try {
      await actions.updateUserStatus(String(userId), 'approved')
      addToast({
        message: `${userName} has been approved successfully`,
        type: 'success',
      })
    } catch (error) {
      addToast({
        message: `Failed to approve ${userName}`,
        type: 'error',
      })
    }
  }

  const handleReject = async (userId: string | number, userName: string) => {
    try {
      await actions.updateUserStatus(String(userId), 'rejected')
      addToast({
        message: `${userName} has been rejected`,
        type: 'warning',
      })
    } catch (error) {
      addToast({
        message: `Failed to reject ${userName}`,
        type: 'error',
      })
    }
  }

  const handleDelete = async (userId: string | number, userName: string) => {
    if (
      window.confirm(
        `Are you sure you want to delete ${userName}? This action cannot be undone.`,
      )
    ) {
      try {
        await actions.deleteUser(String(userId))
        addToast({
          message: `${userName} has been deleted`,
          type: 'info',
        })
      } catch (error) {
        addToast({
          message: `Failed to delete ${userName}`,
          type: 'error',
        })
      }
    }
  }

  const columns: ColumnDef<User>[] = [
    { accessorKey: 'id', header: 'User ID' },
    { accessorKey: 'name', header: 'Name' },
    { accessorKey: 'email', header: 'Email' },
    {
      accessorKey: 'role',
      header: 'Role',
      cell: ({ row }) => (
        <RoleToggle
          currentRole={row.original.role}
          onRoleChange={(newRole) =>
            handleRoleChange(row.original.id, newRole, row.original.name)
          }
        />
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        let variant: 'success' | 'warning' | 'danger' = 'warning'
        if (row.original.status === 'approved') variant = 'success'
        if (row.original.status === 'rejected') variant = 'danger'
        return <Badge variant={variant}>{row.original.status}</Badge>
      },
    },
    {
      accessorKey: 'created_at',
      header: 'Date Joined',
      cell: ({ row }) => formatDate(row.original.created_at),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <RowActions
          actions={[
            {
              label: 'Approve',
              onClick: () => handleApprove(row.original.id, row.original.name),
              hidden: row.original.status === 'approved',
            },
            {
              label: 'Reject',
              onClick: () => handleReject(row.original.id, row.original.name),
              hidden: row.original.status === 'rejected',
            },
            {
              label: 'Delete',
              onClick: () => handleDelete(row.original.id, row.original.name),
              variant: 'danger',
            },
          ]}
        />
      ),
    },
  ]

  const handlePageChange = (page: number) => {
    applyFetch(page)
  }

  const handleRefresh = () => {
    applyFetch(currentPage || 1)
  }

  const multipleActive = filterCount > 1 || (filterCount && sortCount)

  const handleResetAll = () => {
    setFilterRole('all')
    setFilterStatus('all')
    setSearchTerm('')
    setSortField('')
    setSortDirection('asc')
    applyFetch(1)
  }

  const resetFilters = () => {
    setFilterRole('all')
    setFilterStatus('all')
    setSearchTerm('')
  }

  const resetSort = () => {
    setSortField('')
    setSortDirection('asc')
  }

  if (usersLoading && users.length === 0) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '80vh',
        }}
      >
        <Spinner size="large" color="primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ padding: '1rem', color: 'red' }}>
        <h2>Error</h2>
        <p>{error}</p>
      </div>
    )
  }

  return (
    <div style={{ padding: '1rem' }}>
      <h1>User Management</h1>
      <DataTable
        columns={columns}
        data={displayedUsers}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        totalCount={totalCount}
        pageSize={10}
        isClickable
        onRowClick={(user) =>
          navigate({
            to: '/admin/users/$userId',
            params: { userId: String((user as User).id) },
          })
        }
        onFilter={() => setFilterOpen(true)}
        onSort={() => setSortOpen(true)}
        showSortButton={!sortCount}
        showFilterButton={!filterCount}
        onRefresh={handleRefresh}
        sortActive={
          sortCount
            ? {
                count: sortCount,
                onClear: () => {
                  setSortField('')
                  setSortDirection('asc')
                  applyFetch(1)
                },
              }
            : undefined
        }
        filterActive={
          filterCount
            ? {
                count: filterCount,
                onClear: () => {
                  setFilterRole('all')
                  setFilterStatus('all')
                  setSearchTerm('')
                  applyFetch(1)
                },
              }
            : undefined
        }
        rightBadges={
          multipleActive ? (
            <div style={{ display: 'flex', gap: '6px' }}>
              <span style={{ fontSize: 12, color: 'var(--secondary-color)' }}>
                {filterCount
                  ? `${filterCount} filter${filterCount > 1 ? 's' : ''}`
                  : ''}
                {sortCount ? (filterCount ? ' · ' : '') + '1 sort' : ''}
              </span>
              <Button
                variant="secondary"
                onClick={handleResetAll}
                aria-label="Reset all filters and sorting"
              >
                Reset All
              </Button>
            </div>
          ) : undefined
        }
      />

      {/* Filter Modal */}
      <Modal
        open={isFilterOpen}
        onClose={() => setFilterOpen(false)}
        title="Filter Users"
        primaryAction={{
          label: 'Apply',
          onClick: () => setFilterOpen(false),
          autoFocus: true,
        }}
        secondaryAction={{
          label: 'Reset',
          onClick: () => {
            resetFilters()
            setFilterOpen(false)
          },
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ flex: 1 }}>
              <label
                style={{ display: 'block', fontWeight: 600, marginBottom: 4 }}
              >
                Role
              </label>
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value as any)}
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: 4,
                  border: '1px solid var(--border-color)',
                }}
              >
                <option value="all">All</option>
                <option value="admin">Admin</option>
                <option value="trainee">Trainee</option>
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label
                style={{ display: 'block', fontWeight: 600, marginBottom: 4 }}
              >
                Status
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: 4,
                  border: '1px solid var(--border-color)',
                }}
              >
                <option value="all">All</option>
                <option value="approved">Approved</option>
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>
      </Modal>

      {/* Sort Modal */}
      <Modal
        open={isSortOpen}
        onClose={() => setSortOpen(false)}
        title="Sort Users"
        primaryAction={{
          label: 'Apply',
          onClick: () => setSortOpen(false),
          autoFocus: true,
        }}
        secondaryAction={{
          label: 'Reset',
          onClick: () => {
            resetSort()
            setSortOpen(false)
          },
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label
              style={{ display: 'block', fontWeight: 600, marginBottom: 4 }}
            >
              Field
            </label>
            <select
              value={sortField}
              onChange={(e) => setSortField(e.target.value as any)}
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: 4,
                border: '1px solid var(--border-color)',
              }}
            >
              <option value="">None</option>
              <option value="name">Name</option>
              <option value="email">Email</option>
              <option value="created_at">Date Joined</option>
            </select>
          </div>
          <div>
            <label
              style={{ display: 'block', fontWeight: 600, marginBottom: 4 }}
            >
              Direction
            </label>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <Button
                variant={sortDirection === 'asc' ? 'primary' : 'secondary'}
                onClick={() => setSortDirection('asc')}
              >
                Asc
              </Button>
              <Button
                variant={sortDirection === 'desc' ? 'primary' : 'secondary'}
                onClick={() => setSortDirection('desc')}
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
