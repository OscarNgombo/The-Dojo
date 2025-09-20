import { Outlet, createRootRoute } from '@tanstack/react-router'
import { useAuth } from '../providers'
import { useEffect } from 'react'
import type { User } from '../types'
import { router } from '../main'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanstackDevtools } from '@tanstack/react-devtools'
import {
  AppProvider,
  AuthProvider,
  ToastProvider,
  UsersProvider,
} from '../providers'
import { Toast } from '@/components/ui/Toast'

// Check if we're in development mode
const isDevelopment = import.meta.env.MODE === 'development'

const NotFoundComponent = () => {
  return (
    <div
      style={{
        textAlign: 'center',
        marginTop: '2rem',
        fontSize: '1.5rem',
        color: '#555',
        fontWeight: 'bold',
      }}
    >
      404 - Page Not Found
    </div>
  )
}

export const Route = createRootRoute({
  component: () => (
    <AppProvider>
      <ToastProvider>
        <AuthProvider>
          <UsersProvider>
            <AuthSync />
            <div className="main-content">
              <Outlet />
            </div>
            <Toast />
            {isDevelopment && (
              <TanstackDevtools
                config={{
                  position: 'bottom-left',
                }}
                plugins={[
                  {
                    name: 'Tanstack Router',
                    render: <TanStackRouterDevtoolsPanel />,
                  },
                ]}
              />
            )}
          </UsersProvider>
        </AuthProvider>
      </ToastProvider>
    </AppProvider>
  ),
  notFoundComponent: NotFoundComponent,
})

// Sync auth state into router context (must be inside AuthProvider scope)
function AuthSync() {
  const { user, isAuthenticated, loading } = useAuth()
  useEffect(() => {
    // TEMP DEBUG LOG
    // eslint-disable-next-line no-console
    console.log('[AuthSync] syncing to router context', {
      userId: user?.id,
      role: user?.role,
      isAuthenticated,
      loadingAuth: loading,
      ts: Date.now(),
    })
    router.update({
      context: (prev: any) => ({
        ...prev,
        user: user as User | null,
        isAuthenticated,
        loadingAuth: loading,
      }),
    })
  }, [user, isAuthenticated, loading])
  return null
}

