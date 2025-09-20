import {
  createContext,
  useContext,
  useState,
  useMemo,
  type ReactNode,
  useRef,
} from 'react'
import { usersApi } from '../api'
import type { User, PaginatedResponse } from '../types'

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
  sortField?: 'name' | 'email' | 'created_at'
  sortDirection?: 'asc' | 'desc'
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
  // Persist the last successful query so that mutation operations can re-fetch with same parameters
  const lastQueryRef = useRef<{ page: number; pageSize: number; options?: FetchUsersOptions }>({ page: 1, pageSize: 10 })

  const actions = useMemo<UsersActions>(
    () => ({
      fetchUsers: async (page, pageSize = 10, options) => {
        setState((prev) => ({ ...prev, loading: true, error: null }))
        try {
          const response = (await usersApi.getUsers(
            page,
            pageSize,
            options?.role,
            options?.status,
            options?.search,
            options?.sortField,
            options?.sortDirection,
          )) as unknown as PaginatedResponse<User>
          lastQueryRef.current = { page, pageSize, options }
          setState(prev => ({
            ...prev,
            loading: false,
            users: response.records,
            currentPage: response.current_page,
            totalPages: response.last_page,
            totalCount: response.total_count,
          }))
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'An unknown error occurred'
          setState((prev) => ({ ...prev, loading: false, error: errorMessage }))
        }
      },
      updateUserStatus: async (userId, status) => {
        try {
          await usersApi.updateUserStatus(userId, status)
          const { page, pageSize, options } = lastQueryRef.current
          await actions.fetchUsers(page, pageSize, options)
        } catch (error) {
          console.error('Failed to update user status:', error)
        }
      },
      updateUserRole: async (userId, role) => {
        try {
          await usersApi.updateUserRole(userId, role)
          const { page, pageSize, options } = lastQueryRef.current
            await actions.fetchUsers(page, pageSize, options)
        } catch (error) {
          console.error('Failed to update user role:', error)
        }
      },
      deleteUser: async (userId) => {
        try {
          await usersApi.deleteUser(userId)
          const { page, pageSize, options } = lastQueryRef.current
          await actions.fetchUsers(page, pageSize, options)
        } catch (error) {
          console.error('Failed to delete user:', error)
        }
      },
    }),
    [], // static actions instance
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
