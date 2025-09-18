import { Outlet, createRootRoute } from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanstackDevtools } from '@tanstack/react-devtools'
import { AppProvider, AuthProvider, ToastProvider } from '../providers'
import { Toast } from '@/shared/components/ui/Toast'

// Check if we're in development mode
const isDevelopment = import.meta.env.MODE === 'development'

export const Route = createRootRoute({
  component: () => (
    <AppProvider>
      <ToastProvider>
        <AuthProvider>
          <main className="main-content">
            <Outlet />
          </main>
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
        </AuthProvider>
      </ToastProvider>
    </AppProvider>
  ),
})
