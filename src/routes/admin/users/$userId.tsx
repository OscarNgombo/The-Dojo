import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { usersApi } from '../../../api'
import type { User } from '../../../types'
import {
  Avatar,
  Badge,
  Button,
  RoleToggle,
  Spinner,
} from '../../../components/ui'
import { formatDate } from '../../../utils/dateUtils'
import { useState } from 'react'
import { useToast } from '../../../providers'

interface LoaderData {
  user: User
}

export const Route = createFileRoute('/admin/users/$userId')({
  loader: async ({ params }) => {
    const { userId } = params
    try {
      const response = await usersApi.getUserById(userId)
      // Possible shapes: { data: { user } }, { data: User }, or { user }
      const raw = response as any
      const data = raw.data ?? raw
      const user: User | undefined =
        data.user ?? data.user?.user ?? (data.id ? data : undefined)
      if (!user) {
        throw new Error('User not found')
      }
      return { user } as LoaderData
    } catch (e) {
      // Let the router bubble the error for ErrorBoundary (could customize later)
      throw e
    }
  },
  component: UserDetailPage,
})

function UserDetailPage() {
  const { user } = Route.useLoaderData() as LoaderData
  const navigate = useNavigate()
  const { addToast } = useToast()
  const [currentUser, setCurrentUser] = useState<User>(user)
  const [isUpdatingRole, setIsUpdatingRole] = useState(false)
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)

  const updateRole = async (newRole: 'admin' | 'trainee') => {
    if (isUpdatingRole) return
    setIsUpdatingRole(true)
    const prev = currentUser
    setCurrentUser({ ...currentUser, role: newRole })
    try {
      await usersApi.updateUserRole(String(currentUser.id), newRole)
      addToast({ message: `Role updated to ${newRole}`, type: 'success' })
    } catch (e) {
      setCurrentUser(prev)
      addToast({ message: 'Failed to update role', type: 'error' })
    } finally {
      setIsUpdatingRole(false)
    }
  }

  const updateStatus = async (status: 'approved' | 'rejected') => {
    if (isUpdatingStatus) return
    setIsUpdatingStatus(true)
    const prev = currentUser
    setCurrentUser({ ...currentUser, status })
    try {
      await usersApi.updateUserStatus(String(currentUser.id), status)
      addToast({
        message: `User ${status}`,
        type: status === 'approved' ? 'success' : 'warning',
      })
    } catch (e) {
      setCurrentUser(prev)
      addToast({ message: 'Failed to update status', type: 'error' })
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  let statusVariant: 'success' | 'warning' | 'danger' = 'warning'
  if (currentUser.status === 'approved') statusVariant = 'success'
  if (currentUser.status === 'rejected') statusVariant = 'danger'

  return (
    <div
      style={{
        padding: '1rem',
        maxWidth: '860px',
        margin: '0 auto',
        background: 'var(--light-color)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--border-radius)',
        boxShadow: 'var(--box-shadow)',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: '16px',
        }}
      >
        <Button
          variant="text"
          onClick={() => navigate({ to: '/admin/users' })}
          style={{ padding: 0, color: 'var(--primary-color)' }}
        >
          ← Back to Users
        </Button>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <span
            style={{
              fontSize: 'var(--small-font-size)',
              color: 'var(--secondary-color)',
            }}
          >
            Role:
          </span>
          <RoleToggle
            currentRole={currentUser.role}
            onRoleChange={updateRole}
            disabled={isUpdatingRole}
          />
          {isUpdatingRole && <Spinner size="small" />}
        </div>
      </div>

      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        <Avatar
          name={currentUser.name}
          src={currentUser.avatar}
          size="large"
          withBorder
        />
        <div>
          <h1
            style={{
              margin: 0,
              fontSize: 'var(--header-font-size)',
              color: 'var(--dark-color)',
            }}
          >
            {currentUser.name}
          </h1>
          <p
            style={{
              margin: '4px 0 8px',
              color: 'var(--secondary-color)',
              fontSize: 'var(--small-font-size)',
            }}
          >
            {currentUser.email}
          </p>
          <Badge variant={statusVariant}>{currentUser.status}</Badge>
        </div>
      </header>

      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        <InfoBlock label="User ID" value={String(currentUser.id)} />
        <InfoBlock label="Joined" value={formatDate(currentUser.created_at)} />
        <InfoBlock
          label="Last Updated"
          value={formatDate(currentUser.updated_at)}
        />
        {currentUser.google_id && (
          <InfoBlock label="Google ID" value={currentUser.google_id} />
        )}
      </section>

      <div style={{ display: 'flex', gap: '12px' }}>
        <Button
          variant="success"
          disabled={currentUser.status === 'approved' || isUpdatingStatus}
          onClick={() => updateStatus('approved')}
        >
          {isUpdatingStatus && currentUser.status !== 'approved'
            ? 'Updating…'
            : 'Approve'}
        </Button>
        <Button
          variant="danger"
          disabled={currentUser.status === 'rejected' || isUpdatingStatus}
          onClick={() => updateStatus('rejected')}
        >
          {isUpdatingStatus && currentUser.status !== 'rejected'
            ? 'Updating…'
            : 'Reject'}
        </Button>
      </div>
    </div>
  )
}

interface InfoBlockProps {
  label: string
  value: string
}
const InfoBlock = ({ label, value }: InfoBlockProps) => (
  <div
    style={{
      background: '#fff',
      padding: '12px 16px',
      border: '1px solid var(--border-color)',
      borderRadius: 'var(--border-radius)',
      display: 'flex',
      flexDirection: 'column',
      gap: '4px',
    }}
  >
    <span
      style={{
        fontSize: 'var(--small-font-size)',
        color: 'var(--secondary-color)',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
      }}
    >
      {label}
    </span>
    <span
      style={{
        fontSize: 'var(--text-font-size)',
        color: 'var(--dark-color)',
        fontWeight: 500,
      }}
    >
      {value || '—'}
    </span>
  </div>
)
