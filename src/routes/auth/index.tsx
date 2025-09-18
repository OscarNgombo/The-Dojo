import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/auth/')({
  component: AuthLayout,
  beforeLoad: () => {
    const isAuthenticated = localStorage.getItem('auth_token')
    if (isAuthenticated) {
      throw redirect({
        to: '/',
      })
    }
    return {}
  },
})

function AuthLayout() {
  return (
    <div className="auth-layout">
      <Outlet />
    </div>
  )
}
