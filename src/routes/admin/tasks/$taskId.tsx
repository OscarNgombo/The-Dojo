import { createFileRoute } from '@tanstack/react-router'
import { lazy, Suspense } from 'react'
import { CenteredPageSpinner } from '@/components/ui'

const TaskDetailPage = lazy(() => import('@/features/tasks/task-detail/TaskDetailPage'))

export const Route = createFileRoute('/admin/tasks/$taskId')({
  component: () => {
    const { taskId } = Route.useParams()
    return (
      <Suspense fallback={<CenteredPageSpinner />}> 
        <TaskDetailPage taskIdParam={taskId} />
      </Suspense>
    )
  },
})
