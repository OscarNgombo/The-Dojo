import { createFileRoute, Outlet, useNavigate } from '@tanstack/react-router'
import { useAuth } from '../providers'
import { Spinner, Card, CardBody, Button } from '../components/ui'
import { useEffect } from 'react'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  const { user, isAuthenticated, loading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate({ to: '/auth/login' })
    }
  }, [isAuthenticated, loading, navigate])

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

  return (
    <div style={{ padding: '1rem' }}>
      {user && (
        <Card>
          <CardBody>
            <h1 style={{ color: 'blue', fontWeight: 'bold' }}>
              Welcome to The Dojo, {user.name}!
            </h1>

            {user.role === 'admin' ? (
              <div>
                <br />
                <h2>Admin Dashboard</h2>
                <p>You can manage users, subjects, and tasks.</p>
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
                <Outlet />
              </div>
            ) : (
              <div>
                <br />
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

                  <Outlet />
                </div>
              </div>
            )}
          </CardBody>
        </Card>
      )}
    </div>
  )
}
