import { usersApi } from '@/api'
import { subjectService } from '@/api/subjects'
import { taskService } from '@/api/tasks'

export interface LastQuery<TOptions> {
  page: number
  pageSize: number
  options?: TOptions
}

type ExecuteFn = (apiCall: () => Promise<any>) => Promise<any>

export const refetchUsers = async (
  exec: ExecuteFn,
  last: LastQuery<{
    role?: 'admin' | 'trainee'
    status?: 'approved' | 'pending' | 'rejected'
    search?: string
    sortField?: 'id' | 'name' | 'email' | 'created_at'
    sortDirection?: 'asc' | 'desc'
  }>,
) => {
  const { page, pageSize, options } = last
  await exec(async () => {
    // usersApi.getUsers currently supports (page, pageSize, role?, status?, search?)
    const raw = await usersApi.getUsers(
      page,
      pageSize,
      options?.role,
      options?.status,
      options?.search,
    )
    return { success: true, data: raw }
  })
}

export const refetchSubjects = async (
  exec: ExecuteFn,
  last: LastQuery<{
    search?: string
    isActive?: boolean
    sortField?: 'id' | 'name' | 'createdAt'
    sortDirection?: 'asc' | 'desc'
  }>,
) => {
  const { page, pageSize } = last
  await exec(async () => {
    const raw = await subjectService.getSubjects(page, pageSize)
    return { success: true, data: raw.data }
  })
}

export const refetchTasks = async (
  exec: ExecuteFn,
  last: LastQuery<{
    subjectId?: string | number
    isActive?: boolean
    search?: string
    sortField?: 'id' | 'title' | 'dueDate' | 'maxScore' | 'createdAt'
    sortDirection?: 'asc' | 'desc'
  }>,
) => {
  const { page, pageSize, options } = last
  await exec(async () => {
    const raw = await taskService.getTasks({
      page,
      pageSize,
      subjectId: options?.subjectId,
      isActive: options?.isActive,
    })
    return { success: true, data: raw.data }
  })
}
