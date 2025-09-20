import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'
import { Spinner } from '../components/ui'
import { useAuth } from '../providers'
import { roleTarget } from '../utils/roleRedirect'

/**
 * Root route: purely a redirect hub once auth status is known.
 * We intentionally do NOT use beforeLoad because it runs only once
 * and would capture a stale loadingAuth=true state, causing the
 * component to remain mounted showing a spinner with no redirect.
 * Instead, we wait for loadingAuth to settle, then navigate via effect.
 */
export const Route = createFileRoute('/')({
  component: HomeRedirect,
})

function HomeRedirect() {
  // Use AuthProvider (reactive) instead of mutable router context
  const { user, isAuthenticated, loading: loadingAuth } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (loadingAuth) return
    const target = roleTarget(isAuthenticated ? user : null)
    navigate({ to: target, replace: true })
  }, [loadingAuth, isAuthenticated, user, navigate])

  // While determining auth state, show centered spinner.
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

  // Brief empty placeholder while the effect performs navigation.
  return null
}
