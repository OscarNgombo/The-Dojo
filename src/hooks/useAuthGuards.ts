import { useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useAuth } from '../providers'
import type { User } from '../types'

interface GuardOptions {
  redirectIfUnauthed?: string
  requireApproved?: boolean
}

interface GuardResult {
  user: User | null
  loading: boolean
  isAuthenticated: boolean
  isAuthorized: boolean
}

export const useRequireRole = (
  role: 'admin' | 'trainee',
  { redirectIfUnauthed = '/auth/login', requireApproved = false }: GuardOptions = {},
): GuardResult => {
  const { user, isAuthenticated, loading } = useAuth()
  const navigate = useNavigate()

  const isRole = !!user && user.role === role
  const approvedOk = !requireApproved || user?.status === 'approved'
  const isAuthorized = isRole && approvedOk

  useEffect(() => {
    if (loading) return
    if (!isAuthenticated) {
      navigate({ to: redirectIfUnauthed, replace: true })
    }
  }, [loading, isAuthenticated, navigate, redirectIfUnauthed])

  return { user, loading, isAuthenticated, isAuthorized }
}

export const useRequireAdmin = (opts?: GuardOptions) =>
  useRequireRole('admin', opts)

export const useRequireTrainee = (opts?: GuardOptions) =>
  useRequireRole('trainee', opts)
