import { createFileRoute } from '@tanstack/react-router'
import { useAuth } from '../../../providers'
import { Spinner, Card, CardBody } from '../../../components/ui'

export const Route = createFileRoute('/trainee/subjects/')({
  component: TraineeSubjectsPage,
})

function TraineeSubjectsPage() {
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

  // Check if user is authenticated and has trainee role
  if (!isAuthenticated || user?.role !== 'trainee') {
    window.location.href = '/'
    return null
  }

  return (
    <div style={{ padding: '1rem' }}>
      <Card>
        <CardBody>
          <h1>My Subjects</h1>
          <p>Here you can view all your assigned subjects.</p>
        </CardBody>
      </Card>
    </div>
  )
}
