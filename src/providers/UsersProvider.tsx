import {
  createContext,
  useContext,
  useState,
  useMemo,
  type ReactNode,
  useRef,
} from 'react'
import { usersApi } from '@/api'
import type { User } from '@/types'
import { useApiCall } from '@/hooks/useApiCall'
import { useMutate } from '@/hooks/useMutate'
import { refetchUsers } from '@/utils/refetchRollback'

interface UsersState {
  users: User[]
  loading: boolean
  error: string | null
  currentPage: number
  totalPages: number
  totalCount: number
}

interface FetchUsersOptions {
  role?: 'admin' | 'trainee'
  status?: 'approved' | 'pending' | 'rejected'
  search?: string
}

interface UsersActions {
  fetchUsers: (
    page: number,
    pageSize?: number,
    options?: FetchUsersOptions,
  ) => Promise<void>
  updateUserStatus: (
    userId: string,
    status: 'approved' | 'pending' | 'rejected',
  ) => Promise<void>
  updateUserRole: (userId: string, role: 'admin' | 'trainee') => Promise<void>
  deleteUser: (userId: string) => Promise<void>
}

interface UsersContextType {
  state: UsersState
  actions: UsersActions
}

const UsersContext = createContext<UsersContextType | undefined>(undefined)

const initialState: UsersState = {
  users: [],
  loading: false,
  error: null,
  currentPage: 1,
  totalPages: 1,
  totalCount: 0,
}

export const UsersProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<UsersState>(initialState)
  const lastQueryRef = useRef<{
    page: number
    pageSize: number
    options?: FetchUsersOptions
  }>({ page: 1, pageSize: 10 })

  const usersCall = useApiCall<{
    records: User[]
    current_page: number
    last_page: number
    total_count: number
  }>()

  const updateStatusMut = useMutate<
    { id: string; status: 'approved' | 'pending' | 'rejected' },
    { user: User; message?: string }
  >({
    mutateFn: ({ id, status }) => usersApi.updateUserStatus(id, status),
    optimisticUpdate: ({ id, status }) => {
      setState((prev) => ({
        ...prev,
        users: prev.users.map((u) => (u.id === id ? { ...u, status } : u)),
      }))
    },
    rollback: () => {
      void refetchUsers(usersCall.execute, lastQueryRef.current)
    },
    autoToast: { success: true, error: true },
    messages: { success: (_, { status }) => `Status updated to ${status}` },
  })

  const updateRoleMut = useMutate<
    { id: string; role: 'admin' | 'trainee' },
    { user: User; message?: string }
  >({
    mutateFn: ({ id, role }) => usersApi.updateUserRole(id, role),
    optimisticUpdate: ({ id, role }) => {
      setState((prev) => ({
        ...prev,
        users: prev.users.map((u) => (u.id === id ? { ...u, role } : u)),
      }))
    },
    rollback: () => {
      void refetchUsers(usersCall.execute, lastQueryRef.current)
    },
    autoToast: { success: true, error: true },
    messages: { success: (_, { role }) => `Role updated to ${role}` },
  })

  const deleteUserMut = useMutate<{ id: string }, { message?: string }>({
    mutateFn: ({ id }) => usersApi.deleteUser(id),
    optimisticUpdate: ({ id }) => {
      setState((prev) => ({
        ...prev,
        users: prev.users.filter((u) => u.id !== id),
        totalCount: prev.totalCount > 0 ? prev.totalCount - 1 : 0,
      }))
    },
    rollback: () => {
      void refetchUsers(usersCall.execute, lastQueryRef.current)
    },
    autoToast: { success: true, error: true },
    messages: { success: 'User deleted' },
  })

  const actions = useMemo<UsersActions>(
    () => ({
      fetchUsers: async (page, pageSize = 10, options) => {
        lastQueryRef.current = { page, pageSize, options }
        const data = await usersCall.execute(async () => {
          const raw = await usersApi.getUsers(
            page,
            pageSize,
            options?.role,
            options?.status,
            options?.search,
          )
          return { success: true, data: raw }
        })
        setState((prev) => ({
          ...prev,
          loading: usersCall.loading,
          error: usersCall.error,
          users: Array.isArray(data?.records) ? data!.records : [],
          currentPage: data?.current_page ?? prev.currentPage,
          totalPages: data?.last_page ?? prev.totalPages,
          totalCount: data?.total_count ?? prev.totalCount,
        }))
      },
      updateUserStatus: async (userId, status) => {
        await updateStatusMut.mutate({ id: userId, status })
      },
      updateUserRole: async (userId, role) => {
        await updateRoleMut.mutate({ id: userId, role })
      },
      deleteUser: async (userId) => {
        await deleteUserMut.mutate({ id: userId })
      },
    }),
    [usersCall, updateStatusMut, updateRoleMut, deleteUserMut],
  )

  const contextValue = useMemo(
    () => ({
      state,
      actions,
    }),
    [state, actions],
  )

  return (
    <UsersContext.Provider value={contextValue}>
      {children}
    </UsersContext.Provider>
  )
}

export const useUsers = (): UsersContextType => {
  const context = useContext(UsersContext)
  if (!context) {
    throw new Error('useUsers must be used within a UsersProvider')
  }
  return context
}
