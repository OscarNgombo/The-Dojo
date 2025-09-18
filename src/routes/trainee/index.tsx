import { createFileRoute } from '@tanstack/react-router'
import { useAuth } from '../../providers'
import { Spinner, Card, CardBody } from '../../shared/components/ui'

export const Route = createFileRoute('/trainee/')({
  component: TraineePage,
})

function TraineePage() {
  const { user, isAuthenticated, loading } = useAuth()

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <Spinner size="large" color="primary" />
      </div>
    )
  }

  // Check if user is authenticated and has trainee role
  if (!isAuthenticated || user?.role !== 'trainee') {
    window.location.href = '/'
    return null
  }

  return (
    <div style={{ padding: '20px' }}>
      <Card>
        <CardBody>
          <h1>Trainee Dashboard</h1>
          <p>Welcome to your trainee dashboard. Here you can view your assigned subjects and tasks.</p>
        </CardBody>
      </Card>
    </div>
  )
}
