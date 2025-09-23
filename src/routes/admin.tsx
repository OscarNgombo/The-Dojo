import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'
import { Spinner, AccessDenied } from '../components/ui'
import { AdminLayout } from '../components/layout/AdminLayout'
import { useAuth } from '../providers/AuthProvider'

export const Route = createFileRoute('/admin')({
  component: AdminGate,
})

function AdminGate() {
  const { user, isAuthenticated, loading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (loading) return
    if (!isAuthenticated) {
      navigate({ to: '/auth/login', replace: true })
    }
  }, [loading, isAuthenticated, navigate])

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

  if (!isAuthenticated) {
    return null
  }

  if (user?.role !== 'admin') {
    return <AccessDenied />
  }

  return <AdminLayout />
}
