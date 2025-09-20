import { createFileRoute } from '@tanstack/react-router'
import { useRequireAdmin } from '../../../hooks/useAuthGuards'
import { Spinner, AccessDenied } from '../../../components/ui'

export const Route = createFileRoute('/admin/subjects/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { loading, isAuthorized, isAuthenticated } = useRequireAdmin()
  if (loading) {
    return (
      <div style={{display:'flex',justifyContent:'center',alignItems:'center',height:'80vh'}}>
        <Spinner size="large" color="primary" />
      </div>
    )
  }
  if (!isAuthenticated || !isAuthorized) {
    return <AccessDenied />
  }
  return <div>Hello "/admin/subjects/"!</div>
}
