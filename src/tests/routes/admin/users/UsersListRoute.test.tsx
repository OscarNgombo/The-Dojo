import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import UsersList from '@/features/users/UsersList'
import React from 'react'
import {
  AppProvider,
  AuthProvider,
  ToastProvider,
  UsersProvider,
} from '@/providers'

vi.mock('@/hooks/useAuthGuards', () => ({
  useRequireAdmin: () => ({
    loading: false,
    isAuthorized: true,
    isAuthenticated: true,
  }),
}))

vi.mock('@/hooks/useQueryState', () => {
  return {
    useQueryState: <T, _R extends string>(config: any) => {
      const ReactImport = React as typeof import('react')
      const [value, setValue] = ReactImport.useState<T>(config.defaultValue)
      return [value, setValue] as const
    },
  }
})

const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AppProvider>
    <ToastProvider>
      <AuthProvider>
        <UsersProvider>{children}</UsersProvider>
      </AuthProvider>
    </ToastProvider>
  </AppProvider>
)

describe('UsersList (isolated)', () => {
  it('renders heading', async () => {
    render(<UsersList />, { wrapper: Wrapper })
    expect(
      await screen.findByRole('heading', { name: /user management/i }),
    ).toBeInTheDocument()
  })

  it('opens filter modal', async () => {
    render(<UsersList />, { wrapper: Wrapper })
    const filterBtn = await screen.findByRole('button', { name: /filter/i })
    fireEvent.click(filterBtn)
    expect(
      await screen.findByRole('dialog', { name: /filter users/i }),
    ).toBeInTheDocument()
  })
})
