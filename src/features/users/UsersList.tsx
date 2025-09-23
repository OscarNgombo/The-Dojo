import { useCallback, useEffect, useMemo, useState } from 'react'
import { useUsers, useToast } from '@/providers'
import { usePagination } from '@/hooks/usePagination'
import { filterAndSortUsers } from '@/utils/listUtils'
import { useNavigate } from '@tanstack/react-router'
import { encodeId } from '@/utils/idCodec'
import { formatDate } from '@/utils/dateUtils'
import type { User } from '@/types'
import type { ColumnDef } from '@/types/dataTable'
import { useUsersFilters } from '@/hooks/useUsersFilters'
import {
  Avatar,
  Badge,
  Button,
  DataTable,
  Modal,
  RoleToggle,
  RowActions,
  Spinner,
} from '@/components/ui'

const UsersList: React.FC = () => {
  const { state, actions } = useUsers()
  const { addToast } = useToast()
  const navigate = useNavigate()
  const { users, loading, error, currentPage, totalPages, totalCount } = state

  const filters = useUsersFilters()
  const {
    role: filterRole,
    status: filterStatus,
    search: searchTerm,
    sortField,
    sortDirection,
    page,
    setRole: setFilterRole,
    setStatus: setFilterStatus,
    setSortField,
    setSortDirection,
    setPage,
    resetFilters,
    resetSort,
    resetAll,
  } = filters

  const [isFilterOpen, setFilterOpen] = useState(false)
  const [isSortOpen, setSortOpen] = useState(false)

  const applyFetch = useCallback(
    (pg: number = 1) => {
      actions.fetchUsers(pg, 10, {
        role: filterRole !== 'all' ? filterRole : undefined,
        status: filterStatus !== 'all' ? filterStatus : undefined,
        search: searchTerm || undefined,
      })
    },
    [filterRole, filterStatus, searchTerm, actions],
  )

  useEffect(() => {
    applyFetch(page)
  }, [page, filterRole, filterStatus, searchTerm])

  useEffect(() => {
    if (currentPage && currentPage !== page) setPage(currentPage)
  }, [currentPage])

  const displayedUsers = useMemo(() => {
    return filterAndSortUsers(users, {
      sortField: sortField || undefined,
      sortDirection: sortDirection,
    })
  }, [users, sortField, sortDirection])

  const filterCount = useMemo(
    () =>
      [filterRole !== 'all', filterStatus !== 'all', !!searchTerm].filter(
        Boolean,
      ).length,
    [filterRole, filterStatus, searchTerm],
  )
  const sortCount = useMemo(() => (sortField ? 1 : 0), [sortField])
  const multipleActive = filterCount > 1 || (filterCount && sortCount)

  const pagination = usePagination({
    totalItems: totalCount || 0,
    initialPage: currentPage || 1,
    pageSize: 10,
  })

  const handlePageChange = (next: number) => {
    pagination.goToPage(next)
    setPage(next)
    applyFetch(next)
  }
  const handleRefresh = () => applyFetch(currentPage || 1)

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
    } catch {
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
    } catch {
      addToast({ message: `Failed to approve ${userName}`, type: 'error' })
    }
  }
  const handleReject = async (userId: string | number, userName: string) => {
    try {
      await actions.updateUserStatus(String(userId), 'rejected')
      addToast({ message: `${userName} has been rejected`, type: 'warning' })
    } catch {
      addToast({ message: `Failed to reject ${userName}`, type: 'error' })
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
        addToast({ message: `${userName} has been deleted`, type: 'info' })
      } catch {
        addToast({ message: `Failed to delete ${userName}`, type: 'error' })
      }
    }
  }

  const columns: ColumnDef<User>[] = [
    {
      accessorKey: 'avatar_url',
      header: 'Avatar',
      cell: ({ row }) => (
        <Avatar
          name={row.original.name}
          src={row.original.avatar_url}
          size="small"
          aria-label={`${row.original.name} avatar`}
        />
      ),
    },
    { accessorKey: 'name', header: 'Name' },
    { accessorKey: 'email', header: 'Email' },
    {
      accessorKey: 'role',
      header: 'Role',
      cell: ({ row }) => (
        <RoleToggle
          currentRole={row.original.role}
          onRoleChange={(r) =>
            handleRoleChange(row.original.id, r, row.original.name)
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

  const handleResetAll = () => {
    resetAll()
    applyFetch(1)
  }

  if (loading && users.length === 0)
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
  if (error)
    return (
      <div style={{ padding: '1rem', color: 'red' }}>
        <h2>Error</h2>
        <p>{error}</p>
      </div>
    )

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
        onRowClick={(user) =>
          navigate({
            to: '/admin/users/$userId',
            params: { userId: encodeId(String((user as User).id)) },
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
                },
              }
            : undefined
        }
        filterActive={
          filterCount
            ? {
                count: filterCount,
                onClear: () => {
                  resetFilters()
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

export default UsersList
