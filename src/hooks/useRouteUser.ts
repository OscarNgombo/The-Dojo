import { useRouter } from '@tanstack/react-router'
import type { User } from '../types'

export interface RouteAuthState {
  user: User | null
  isAuthenticated: boolean
  loadingAuth: boolean
}

export const useRouteUser = (): RouteAuthState => {
  const router = useRouter()
  const ctx = router.options.context as any
  const user = ctx.user as User | null
  const isAuthenticated = ctx.isAuthenticated as boolean
  const loadingAuth = ctx.loadingAuth as boolean
  return { user, isAuthenticated, loadingAuth }
}

export const getRouteUser = (context: unknown) => {
  const ctx = context as Partial<RouteAuthState>
  return {
    user: (ctx as any).user as User | null,
    isAuthenticated: (ctx as any).isAuthenticated as boolean,
    loadingAuth: (ctx as any).loadingAuth as boolean,
  }
}

export const ensureAdmin = (context: unknown) => {
  const { user, loadingAuth, isAuthenticated } = getRouteUser(context) as any
  if (loadingAuth) return { defer: true }
  if (isAuthenticated && !user) return { defer: true }
  if (!user || user.role !== 'admin') return { unauthorized: true }
  return { ok: true }
}

export const ensureTrainee = (context: unknown) => {
  const { user, loadingAuth, isAuthenticated } = getRouteUser(context) as any
  if (loadingAuth) return { defer: true }
  if (isAuthenticated && !user) return { defer: true }
  if (!user || user.role !== 'trainee') return { unauthorized: true }
  return { ok: true }
}
