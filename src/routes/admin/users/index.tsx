import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'
import { useUsers } from '../../../providers'
import { useToast } from '../../../providers'
import {
  DataTable,
  Spinner,
  Badge,
  RowActions,
  RoleToggle,
} from '../../../components/ui'
import type { ColumnDef } from '../../../types/dataTable'
import type { User } from '../../../types'
import { formatDate } from '../../../utils/dateUtils'

export const Route = createFileRoute('/admin/users/')({
  component: UserManagementPage,
})

function UserManagementPage() {
  const { state, actions } = useUsers()
  const { addToast } = useToast()
  const { users, loading, error, currentPage, totalPages, totalCount } = state
  const navigate = useNavigate()

  useEffect(() => {
    actions.fetchAllUsers(1, 10)
  }, [])

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
    {
      accessorKey: 'id',
      header: 'User ID',
    },
    {
      accessorKey: 'name',
      header: 'Name',
    },
    {
      accessorKey: 'email',
      header: 'Email',
    },
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
    actions.fetchAllUsers(page, 10) // Fetch all users without filters
  }

  if (loading && users.length === 0) {
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
        data={users}
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
      />
    </div>
  )
}
