import { createFileRoute } from '@tanstack/react-router'
import { lazy, Suspense } from 'react'
import { CenteredPageSpinner } from '@/components/ui'
import { parseEditMode, isEditMode } from '@/utils/searchParams'

const SubjectDetailPage = lazy(() => import('@/features/subjects/SubjectDetailPage'))

export const Route = createFileRoute('/admin/subjects/$subjectId')({
  validateSearch: (search: Record<string, unknown>) => parseEditMode(search),
  component: () => {
    const { subjectId } = Route.useParams()
    const search = Route.useSearch() as ReturnType<typeof parseEditMode>
    return (
      <Suspense
        fallback={<CenteredPageSpinner />}
      >
        <SubjectDetailPage subjectIdParam={subjectId} initialEdit={isEditMode(search)} />
      </Suspense>
    )
  },
})
