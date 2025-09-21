/// <reference types="vitest" />
import { renderHook, act } from '@testing-library/react'
import { vi, describe, test, expect } from 'vitest'
vi.mock('@/components/ui/Toast', () => ({ Toast: () => null }))
vi.mock('../main', () => ({ router: { update: vi.fn(), navigate: vi.fn() } }))
import { AuthProvider, useAuth } from '../providers/AuthProvider'
import type { ReactNode } from 'react'
import * as api from '../api'

function wrapper({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>
}

describe('AuthProvider', () => {
  test('login sets user and isAuthenticated', async () => {
    const loginSpy = vi.spyOn(api.authService, 'login').mockResolvedValue({
      user: {
        user: {
          id: 'u1',
          name: 'Test User',
          email: 'test@example.com',
          role: 'admin',
          status: 'approved',
          created_at: '2025-09-20T00:00:00.000Z',
          updated_at: '2025-09-20T00:00:00.000Z',
        },
        token: 'fake-token',
      },
      success: true,
    } as any)

    const { result } = renderHook(() => useAuth(), { wrapper })

    await act(async () => {
      await result.current.login({ email: 'test@example.com', password: 'pw' })
    })

    expect(loginSpy).toHaveBeenCalled()
    expect(result.current.user?.email).toBe('test@example.com')
    expect(result.current.isAuthenticated).toBe(true)
  })
})
