import { createFileRoute } from '@tanstack/react-router'
import { useAuth } from '../../providers'
import { Spinner, Card, CardBody } from '../../shared/components/ui'

export const Route = createFileRoute('/admin/')({
  component: AdminPage,
})

function AdminPage() {
  const { user, isAuthenticated, loading } = useAuth()

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <Spinner size="large" color="primary" />
      </div>
    )
  }

  // Check if user is authenticated and has admin role
  if (!isAuthenticated || user?.role !== 'admin') {
    window.location.href = '/'
    return null
  }

  return (
    <div style={{ padding: '20px' }}>
      <Card>
        <CardBody>
          <h1>Admin Dashboard</h1>
          <p>Welcome to the admin dashboard. Use the navigation to manage trainees, subjects, and tasks.</p>
        </CardBody>
      </Card>
    </div>
  )
}
