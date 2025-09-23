import { Outlet, createRootRoute } from '@tanstack/react-router'
import { ErrorBoundary } from '../components/ErrorBoundary'
import { useAuth } from '../providers/AuthProvider'
import { useEffect } from 'react'
import type { User } from '../types'
import { router } from '../main'
import type { RouterContext } from '../types/router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanstackDevtools } from '@tanstack/react-devtools'
import {
  AppProvider,
  AuthProvider,
  ToastProvider,
  UsersProvider,
  SubjectsProvider,
  TasksProvider,
} from '../providers'
import { Toast } from '@/components/ui/Toast'

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
            <SubjectsProvider>
              <TasksProvider>
              <ErrorBoundary>
                <AuthSync />
                <div className="main-content">
                  <Outlet />
                </div>
                <Toast />
              </ErrorBoundary>
              </TasksProvider>
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
            </SubjectsProvider>
          </UsersProvider>
        </AuthProvider>
      </ToastProvider>
    </AppProvider>
  ),
  notFoundComponent: NotFoundComponent,
})

function AuthSync() {
  const { user, isAuthenticated, loading } = useAuth()
  useEffect(() => {
    console.log('[AuthSync] syncing to router context', {
      userId: user?.id,
      role: user?.role,
      isAuthenticated,
      loadingAuth: loading,
      ts: Date.now(),
    })
    router.update({
      context: (prev: RouterContext) => ({
        ...prev,
        user: user as User | null,
        isAuthenticated,
        loadingAuth: loading,
      }),
    })
  }, [user, isAuthenticated, loading])
  return null
}
