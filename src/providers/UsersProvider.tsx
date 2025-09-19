import {
  createContext,
  useContext,
  useState,
  useMemo,
  type ReactNode,
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

interface UsersActions {
  fetchUsers: (
    page: number,
    pageSize?: number,
    role?: 'admin' | 'trainee',
    status?: 'approved' | 'pending' | 'rejected',
  ) => Promise<void>
  fetchAllUsers: (page: number, pageSize?: number) => Promise<void>
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

  const actions = useMemo<UsersActions>(
    () => ({
      fetchUsers: async (page, pageSize = 10, role, status) => {
        setState((prev) => ({ ...prev, loading: true, error: null }))
        try {
          const response = (await usersApi.getUsers(
            page,
            pageSize,
            role,
            status,
          )) as unknown as PaginatedResponse<User>
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
      fetchAllUsers: async (page, pageSize = 10) => {
        setState((prev) => ({ ...prev, loading: true, error: null }))
        try {
          const response = (await usersApi.getUsers(
            page,
            pageSize,
          )) as unknown as PaginatedResponse<User>
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
          // Re-fetch the current page after update
          const currentPage = state.currentPage
          setState((prev) => ({ ...prev, loading: true, error: null }))
          const response = (await usersApi.getUsers(
            currentPage,
            10,
          )) as unknown as PaginatedResponse<User>
          setState(prev => ({
            ...prev,
            loading: false,
            users: response.records,
            currentPage: response.current_page,
            totalPages: response.last_page,
            totalCount: response.total_count,
          }))
        } catch (error) {
          console.error('Failed to update user status:', error)
        }
      },
      updateUserRole: async (userId, role) => {
        try {
          await usersApi.updateUserRole(userId, role)
          // Re-fetch the current page after update
          const currentPage = state.currentPage
          setState((prev) => ({ ...prev, loading: true, error: null }))
          const response = (await usersApi.getUsers(
            currentPage,
            10,
          )) as unknown as PaginatedResponse<User>
          setState(prev => ({
            ...prev,
            loading: false,
            users: response.records,
            currentPage: response.current_page,
            totalPages: response.last_page,
            totalCount: response.total_count,
          }))
        } catch (error) {
          console.error('Failed to update user role:', error)
        }
      },
      deleteUser: async (userId) => {
        try {
          await usersApi.deleteUser(userId)
          // Re-fetch the current page after delete
          const currentPage = state.currentPage
          setState((prev) => ({ ...prev, loading: true, error: null }))
          const response = (await usersApi.getUsers(
            currentPage,
            10,
          )) as unknown as PaginatedResponse<User>
          setState(prev => ({
            ...prev,
            loading: false,
            users: response.records,
            currentPage: response.current_page,
            totalPages: response.last_page,
            totalCount: response.total_count,
          }))
        } catch (error) {
          console.error('Failed to delete user:', error)
        }
      },
    }),
    [], // Remove the dependency on state.currentPage to prevent re-creation
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
