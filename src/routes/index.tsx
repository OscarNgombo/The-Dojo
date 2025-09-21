import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'
import { Spinner } from '../components/ui'
import { useAuth } from '../providers'
import { roleTarget } from '../utils/roleRedirect'

export const Route = createFileRoute('/')({
  component: HomeRedirect,
})

function HomeRedirect() {
  const { user, isAuthenticated, loading: loadingAuth } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (loadingAuth) return
    const target = roleTarget(isAuthenticated ? user : null)
    navigate({ to: target, replace: true })
  }, [loadingAuth, isAuthenticated, user, navigate])

  if (loadingAuth) {
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

  return null
}
