import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useAuth } from '../providers'
import { Spinner, Card, CardBody, Button } from '../shared/components/ui'
import { useEffect } from 'react';

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  const { user, isAuthenticated, loading } = useAuth()
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate({ to: '/auth/login' });
    }
  }, [isAuthenticated, loading, navigate]);

  // Show loading spinner while checking authentication
  if (loading || !isAuthenticated) {
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

  // If user is authenticated, show appropriate landing page based on role
  return (
    <div style={{ padding: '20px' }}>
      {user && (
        <Card>
          <CardBody>
            <h1>Welcome to The Dojo, {user.name}!</h1>

            {user.role === 'admin' ? (
              <div>
                <h2>Admin Dashboard</h2>
                <p>You have access to manage trainees, subjects, and tasks.</p>
                <div
                  style={{
                    display: 'flex',
                    gap: '10px',
                    marginTop: '20px',
                    flexWrap: 'wrap',
                  }}
                >
                  <Button
                    variant="primary"
                    onClick={() => navigate({ to: '/admin' })}
                  >
                    Admin Dashboard
                  </Button>
                </div>
              </div>
            ) : (
              <div>
                <h2>Trainee Dashboard</h2>
                <p>You can view your assigned subjects and tasks.</p>
                <div
                  style={{
                    display: 'flex',
                    gap: '10px',
                    marginTop: '20px',
                    flexWrap: 'wrap',
                  }}
                >
                  <Button
                    variant="primary"
                    onClick={() => navigate({ to: '/trainee' })}
                  >
                    Trainee Dashboard
                  </Button>
                </div>
              </div>
            )}
          </CardBody>
        </Card>
      )}
    </div>
  )
}
