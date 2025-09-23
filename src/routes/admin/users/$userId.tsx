import { createFileRoute } from '@tanstack/react-router'
import { lazy, Suspense } from 'react'
import { CenteredPageSpinner } from '@/components/ui'
import { parseEditMode } from '@/utils/searchParams'

const UserDetailPage = lazy(() => import('@/features/users/UserDetailPage'))

export const Route = createFileRoute('/admin/users/$userId')({
  validateSearch: (search: Record<string, unknown>) => parseEditMode(search),
  component: () => {
    const { userId } = Route.useParams()
    Route.useSearch() as ReturnType<typeof parseEditMode>
    return (
      <Suspense fallback={<CenteredPageSpinner />}>
        <UserDetailPage userIdParam={userId} />
      </Suspense>
    )
  },
})
