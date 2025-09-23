import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { AccessDenied } from '../components/ui'
import { useAuth } from '../providers/AuthProvider'
import { useEffect } from 'react'
import { navigateToRole } from '../utils/roleRedirect'
import { debugAuth } from '../utils/debug'

export const Route = createFileRoute('/unauthorized')({
  component: UnauthorizedPage,
})

function UnauthorizedPage() {
  const { user, isAuthenticated, loading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (loading) return
    if (isAuthenticated && user) {
      debugAuth('Unauthorized page -> user authorized, redirecting')
      const target = navigateToRole(user)
      navigate({ to: target, replace: true })
    }
  }, [loading, isAuthenticated, user, navigate])

  return (
    <AccessDenied
      title="Unauthorized"
      message="You do not have permission to view this page."
    />
  )
}
