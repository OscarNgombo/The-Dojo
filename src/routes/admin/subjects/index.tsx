import { createFileRoute } from '@tanstack/react-router'
import { SubjectsList } from '@/features/subjects/SubjectsList'

export const Route = createFileRoute('/admin/subjects/')({
  component: () => <SubjectsList />,
})

if ((import.meta as unknown as { vitest?: boolean }).vitest) {
  ;(globalThis as unknown as Record<string, unknown>)['SubjectsList'] =
    SubjectsList
}
