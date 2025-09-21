import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useMemo, useState, useCallback } from 'react'
import { usePagination } from '../../../hooks/usePagination'
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
import { encodeId } from '../../../utils/idCodec'
import { useRequireAdmin } from '../../../hooks/useAuthGuards'
import { useQueryState } from '../../../hooks/useQueryState'

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

  const [isFilterOpen, setFilterOpen] = useState(false)
  const [isSortOpen, setSortOpen] = useState(false)

  const [filterRole, setFilterRole] = useQueryState<
    'all' | 'admin' | 'trainee',
    '/admin/users/'
  >({
    key: 'role',
    defaultValue: 'all',
    route: '/admin/users/',
  })
  const [filterStatus, setFilterStatus] = useQueryState<
    'all' | 'approved' | 'pending' | 'rejected',
    '/admin/users/'
  >({
    key: 'status',
    defaultValue: 'all',
    route: '/admin/users/',
  })
  const [searchTerm, setSearchTerm] = useQueryState<string, '/admin/users/'>({
    key: 'search',
    defaultValue: '',
    route: '/admin/users/',
    debounceMs: 400,
  })
  const [sortField, setSortField] = useQueryState<
    'name' | 'email' | 'created_at' | '',
    '/admin/users/'
  >({
    key: 'sortField',
    defaultValue: '',
    route: '/admin/users/',
  })
  const [sortDirection, setSortDirection] = useQueryState<
    'asc' | 'desc',
    '/admin/users/'
  >({
    key: 'sortDirection',
    defaultValue: 'asc',
    route: '/admin/users/',
  })
  const [page, setPage] = useQueryState<number, '/admin/users/'>({
    key: 'page',
    defaultValue: 1,
    route: '/admin/users/',
    parse: (raw) => (raw ? parseInt(raw, 10) || 1 : 1),
    serialize: (v) => (v > 1 ? String(v) : undefined),
  })

  const applyFetch = useCallback(
    (pg: number = 1) => {
      actions.fetchUsers(pg, 10, {
        role: filterRole !== 'all' ? filterRole : undefined,
        status: filterStatus !== 'all' ? filterStatus : undefined,
        search: searchTerm || undefined,
        sortField: 'id',
        sortDirection: 'asc',
      })
    },
    [filterRole, filterStatus, searchTerm],
  )

  useEffect(() => {
    applyFetch(page)
  }, [page, filterRole, filterStatus, searchTerm])

  useEffect(() => {
    if (currentPage && currentPage !== page) {
      setPage(currentPage)
    }
  }, [currentPage])

  const filterCount = useMemo(
    () =>
      [filterRole !== 'all', filterStatus !== 'all', !!searchTerm].filter(
        Boolean,
      ).length,
    [filterRole, filterStatus, searchTerm],
  )

  const sortCount = useMemo(() => (sortField ? 1 : 0), [sortField])

  const displayedUsers = useMemo(() => {
    if (!sortField) {
      return [...users].sort((a, b) => {
        const aId = Number(a.id)
        const bId = Number(b.id)
        if (Number.isNaN(aId) || Number.isNaN(bId)) return 0
        return aId - bId
      })
    }
    const sorted = [...users].sort((a: any, b: any) => {
      const aVal = a[sortField]
      const bVal = b[sortField]
      if (aVal == null && bVal == null) return 0
      if (aVal == null) return sortDirection === 'asc' ? -1 : 1
      if (bVal == null) return sortDirection === 'asc' ? 1 : -1
      if (sortField === 'created_at') {
        const aTime = new Date(aVal).getTime()
        const bTime = new Date(bVal).getTime()
        return sortDirection === 'asc' ? aTime - bTime : bTime - aTime
      }
      const aStr = String(aVal).toLowerCase()
      const bStr = String(bVal).toLowerCase()
      if (aStr < bStr) return sortDirection === 'asc' ? -1 : 1
      if (aStr > bStr) return sortDirection === 'asc' ? 1 : -1
      return 0
    })
    return sorted
  }, [users, sortField, sortDirection])

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

  const pagination = usePagination({
    totalItems: totalCount || 0,
    initialPage: currentPage || 1,
    pageSize: 10,
  })

  const handlePageChange = (page: number) => {
    pagination.goToPage(page)
    setPage(page)
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
        caption="Trainee and Admin Accounts overview table"
        ariaLabel="User accounts table with filtering, sorting, pagination"
        getRowId={(row: User) => String(row.id)}
        currentPage={pagination.currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        totalCount={totalCount}
        pageSize={10}
        isClickable
        onRowClick={(user) => {
          const rawId = String((user as User).id)
          navigate({
            to: '/admin/users/$userId',
            params: { userId: encodeId(rawId) },
          })
        }}
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
