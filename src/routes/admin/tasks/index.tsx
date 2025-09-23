import { createFileRoute } from '@tanstack/react-router'
import { lazy, Suspense } from 'react'
import { CenteredPageSpinner } from '@/components/ui'
import { TasksProvider } from '@/providers/TasksProvider'

const TasksListPage = lazy(
  () => import('@/features/tasks/tasks-list/TasksListPage'),
)

export const Route = createFileRoute('/admin/tasks/')({
  validateSearch: (raw: Record<string, unknown>) => {
    const page = Number(raw.page) > 0 ? Number(raw.page) : 1
    const pageSize = Number(raw.pageSize) > 0 ? Number(raw.pageSize) : 10
    const search = typeof raw.search === 'string' ? raw.search : undefined
    const subjectId =
      typeof raw.subjectId === 'string' ? raw.subjectId : undefined
    const isActive =
      raw.isActive === 'true'
        ? true
        : raw.isActive === 'false'
          ? false
          : undefined
    const sortField = typeof raw.sort === 'string' ? raw.sort : undefined
    const sortDirection =
      raw.dir === 'desc' ? 'desc' : raw.dir === 'asc' ? 'asc' : undefined
    return {
      page,
      pageSize,
      search,
      subjectId,
      isActive,
      sort: sortField,
      dir: sortDirection,
    }
  },
  component: () => (
    <TasksProvider>
      <Suspense fallback={<CenteredPageSpinner />}>
        <TasksListPage />
      </Suspense>
    </TasksProvider>
  ),
})
