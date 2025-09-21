import { createContext, useContext, useState, useMemo, useEffect } from 'react'
import type { ReactNode } from 'react'
import { initializeGoogleAuth, debugGoogleSignIn } from '../utils/googleAuth'

interface AppState {
  loading: boolean
  error: string | null
}

interface AppActions {
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

interface AppContextType {
  state: AppState
  actions: AppActions
}

const AppContext = createContext<AppContextType | undefined>(undefined)

const initialState: AppState = {
  loading: false,
  error: null,
}

interface AppProviderProps {
  children: ReactNode
}

export const AppProvider = ({ children }: AppProviderProps) => {
  const [state, setState] = useState<AppState>(initialState)

  useEffect(() => {
    initializeGoogleAuth()
      .then(() => {
        if (import.meta.env.MODE !== 'production') {
          debugGoogleSignIn()
        }
      })
      .catch((error) => {
        console.warn('Failed to initialize Google Auth:', error)
      })
  }, [])

  const actions = useMemo<AppActions>(
    () => ({
      setLoading: (loading: boolean) =>
        setState((prev) => ({ ...prev, loading })),
      setError: (error: string | null) =>
        setState((prev) => ({ ...prev, error })),
    }),
    [],
  )

  return (
    <AppContext.Provider value={{ state, actions }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = (): AppContextType => {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}
