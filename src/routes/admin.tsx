import { createFileRoute } from '@tanstack/react-router'
import { useAuth } from '../providers'
import { Spinner } from '../components/ui'
import { AdminLayout } from '../components/layout/AdminLayout'

export const Route = createFileRoute('/admin')({
  component: AdminLayoutWrapper,
})

function AdminLayoutWrapper() {
  const { user, isAuthenticated, loading } = useAuth()

  if (loading) {
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

  if (!isAuthenticated || user?.role !== 'admin') {
    window.location.href = '/auth/login'
    return null
  }

  return <AdminLayout />
}
