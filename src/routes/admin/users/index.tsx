import { createFileRoute } from '@tanstack/react-router'
import { AccessDenied, Spinner } from '@/components/ui'
import UsersList from '@/features/users/UsersList'
import { useRequireAdmin } from '@/hooks/useAuthGuards'

export const Route = createFileRoute('/admin/users/')({
  component: UserManagementPage,
})

function UserManagementPage() {
  const { loading: authLoading, isAuthorized, isAuthenticated } = useRequireAdmin()
  if (authLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <Spinner size="large" color="primary" />
      </div>
    )
  }
  if (!isAuthenticated || !isAuthorized) return <AccessDenied />
  return <UsersList />
}

