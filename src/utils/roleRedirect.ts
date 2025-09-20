import type { User } from '../types'
import { router } from '../main'
import { debugAuth } from './debug'

export const roleTarget = (user: Pick<User, 'role'> | null | undefined): string => {
  if (!user) return '/auth/login'
  if (user.role === 'admin') return '/admin'
  if (user.role === 'trainee') return '/trainee'
  return '/unauthorized'
}

export const navigateToRole = (user: Pick<User, 'role'> | null | undefined) => {
  const target = roleTarget(user)
  debugAuth('navigateToRole', { role: user?.role, target })
  router.navigate({ to: target })
  return target
}
