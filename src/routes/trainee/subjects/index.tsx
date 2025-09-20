import { createFileRoute } from '@tanstack/react-router'
import { useRequireTrainee } from '../../../hooks/useAuthGuards'
import { Spinner, AccessDenied } from '../../../components/ui'

export const Route = createFileRoute('/trainee/subjects/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { loading, isAuthorized, isAuthenticated } = useRequireTrainee()
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
  return <div>Hello "/trainee/subjects/"!</div>
}
