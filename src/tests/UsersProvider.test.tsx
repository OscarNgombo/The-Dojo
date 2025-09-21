/// <reference types="vitest" />
import { renderHook, act, waitFor } from '@testing-library/react'
import { vi, describe, test, expect } from 'vitest'
import { UsersProvider, useUsers } from '../providers/UsersProvider'
import type { ReactNode } from 'react'
import * as api from '../api'

function wrapper({ children }: { children: ReactNode }) {
  return <UsersProvider>{children}</UsersProvider>
}

describe('UsersProvider', () => {
  test('fetchUsers updates state with records', async () => {
    const spy = vi.spyOn(api.usersApi, 'getUsers').mockResolvedValue({
      records: [
        {
          id: '1',
          name: 'Alice',
          email: 'alice@example.com',
          role: 'admin',
          status: 'approved',
          created_at: '2025-09-20T00:00:00.000Z',
          updated_at: '2025-09-20T00:00:00.000Z',
        },
      ],
      current_page: 1,
      last_page: 1,
      total_count: 1,
    } as any)

    const { result } = renderHook(() => useUsers(), { wrapper })

    await act(async () => {
      await result.current.actions.fetchUsers(1, 10)
    })

    await waitFor(() => {
      expect(result.current.state.users).toHaveLength(1)
    })
    expect(result.current.state.users[0].name).toBe('Alice')
    expect(spy).toHaveBeenCalled()
  })
})
