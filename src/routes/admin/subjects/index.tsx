import { createFileRoute } from '@tanstack/react-router'
import { useAuth } from '../../../providers'
import { Spinner, Card, CardBody } from '../../../components/ui'

export const Route = createFileRoute('/admin/subjects/')({
  component: AdminSubjectsPage,
})

function AdminSubjectsPage() {
  const { user, isAuthenticated, loading } = useAuth()

  // Show loading spinner while checking authentication
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

  // Check if user is authenticated and has admin role
  if (!isAuthenticated || user?.role !== 'admin') {
    window.location.href = '/'
    return null
  }

  return (
    <div style={{ padding: '1rem' }}>
      <Card>
        <CardBody>
          <h1>Manage Subjects</h1>
          <p>Here you can view and manage all subjects in the system.</p>
        </CardBody>
      </Card>
    </div>
  )
}
