import { createFileRoute } from '@tanstack/react-router'
import { lazy, Suspense } from 'react'
import { Spinner } from '../../../components/ui'

const UserDetailPage = lazy(() => import('./UserDetailPage'))

export const Route = createFileRoute('/admin/users/$userId')({
  component: () => (
    <Suspense
      fallback={
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
      }
    >
      <UserDetailPage />
    </Suspense>
  ),
})
