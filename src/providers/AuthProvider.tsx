import { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import type { User, LoginCredentials, RegisterCredentials } from '../types'
import { authService } from '../api'
import { router } from '../main'
import type { RouterContext } from '../types/router'
import { useApiCall } from '../hooks/useApiCall'
import { decodeGoogleToken } from '../utils/googleAuth'
import { debugAuth } from '../utils/debug'
import { navigateToRole } from '../utils/roleRedirect'

interface AuthContextType {
  user: User | null
  loading: boolean
  error: string | null
  login: (credentials: LoginCredentials) => Promise<void>
  register: (credentials: RegisterCredentials) => Promise<void>
  loginWithGoogle: (token: string) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(
    authService.isAuthenticated(),
  )

  const { execute: executeApiCall } = useApiCall<{
    user: User
    token: string
  }>()
  const { execute: fetchUser } = useApiCall<User>()

  useEffect(() => {
    const loadUser = async () => {
      if (!authService.isAuthenticated()) {
        debugAuth('No auth token present. Skipping profile fetch.')
        setLoading(false)
        return
      }

      try {
        debugAuth('Fetching current user profile...')
        const profileWrapper = await authService.getCurrentUser()
        setUser(profileWrapper.user)
        setIsAuthenticated(true)
        debugAuth('Profile loaded', {
          id: profileWrapper.user.id,
          role: profileWrapper.user.role,
        })
        router.update({
          context: (prev: RouterContext) => ({
            ...prev,
            user: profileWrapper.user,
            isAuthenticated: true,
            loadingAuth: false,
          }),
        })
      } catch (error) {
        authService.logout()
        setIsAuthenticated(false)
        setError(
          error instanceof Error ? error.message : 'Failed to authenticate',
        )
      } finally {
        debugAuth('loadUser finished -> loading=false')
        setLoading(false)
      }
    }

    loadUser()
  }, [fetchUser])

  /**
   * Login user with email and password
   */
  const login = async (credentials: LoginCredentials) => {
    setLoading(true)
    setError(null)

    debugAuth('login() start', { email: credentials.email })

    try {
      const { user, token } = await executeApiCall(() =>
        authService.login(credentials),
      )
      authService.setToken(token)
      setUser(user)
      setIsAuthenticated(true)

      debugAuth('login() success', { id: user.id, role: user.role })
      router.update({
        context: (prev: RouterContext) => ({
          ...prev,
          user,
          isAuthenticated: true,
          loadingAuth: false,
        }),
      })

      navigateToRole(user)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Login failed')
      console.error('[AuthProvider] login() error', error)
      throw error
    } finally {
      debugAuth('login() finished -> loading=false')
      setLoading(false)
    }
  }

  /**
   * Register a new user
   */
  const register = async (credentials: RegisterCredentials) => {
    setLoading(true)
    setError(null)

    debugAuth('register() start', { email: credentials.email })

    try {
      const { user, token } = await executeApiCall(() =>
        authService.register(credentials),
      )
      authService.setToken(token)
      setUser(user)
      setIsAuthenticated(true)

      debugAuth('register() success', { id: user.id, role: user.role })
      router.update({
        context: (prev: RouterContext) => ({
          ...prev,
          user,
          isAuthenticated: true,
          loadingAuth: false,
        }),
      })
      navigateToRole(user)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Registration failed')
      console.error('[AuthProvider] register() error', error)
      throw error
    } finally {
      debugAuth('register() finished -> loading=false')
      setLoading(false)
    }
  }

  /**
   * Login with Google
   */
  const loginWithGoogle = async (token: string) => {
    setLoading(true)
    setError(null)

    debugAuth('loginWithGoogle() start')

    try {
      // For now, we'll decode the token on the client and create a mock session
      const googleUser = decodeGoogleToken(token)

      // Create a mock user object
      const mockUser: User = {
        id: googleUser.sub,
        name: googleUser.name,
        email: googleUser.email,
        role: googleUser.email === 'oscartinga@gmail.com' ? 'admin' : 'trainee',
        status: 'approved',
        avatar: googleUser.picture,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      // Create a mock session token
      const mockToken = `mock_token_for_${googleUser.sub}`

      authService.setToken(mockToken)
      sessionStorage.setItem('user_role', mockUser.role)
      setUser(mockUser)
      setIsAuthenticated(true)
      router.update({
        context: (prev: RouterContext) => ({
          ...prev,
          user: mockUser,
          isAuthenticated: true,
          loadingAuth: false,
        }),
      })
      navigateToRole(mockUser)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Google login failed')
      console.error('[AuthProvider] loginWithGoogle() error', error)
      throw error
    } finally {
      debugAuth('loginWithGoogle() finished -> loading=false')
      setLoading(false)
    }
  }

  /**
   * Logout the current user
   */
  const logout = () => {
    authService.logout()
    setUser(null)
    setIsAuthenticated(false)
    debugAuth('logout() executed. Cleared user and auth state.')
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        register,
        loginWithGoogle,
        logout,
        isAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
