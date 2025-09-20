import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import type { User } from './types'
import './styles/main.css'
import reportWebVitals from './reportWebVitals.ts'
import { routeTree } from './routeTree.gen.ts'

// Create a new router instance
interface RouterContext {
  user: User | null
  isAuthenticated: boolean
  loadingAuth: boolean
}

export const router = createRouter({
  routeTree,
  context: {
    user: null,
    isAuthenticated: false,
    loadingAuth: true,
  } as RouterContext,
  defaultPreload: 'intent',
  scrollRestoration: true,
  defaultStructuralSharing: true,
  defaultPreloadStaleTime: 0,
})

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
  interface RouteContext extends RouterContext {}
}


// Render the app
const rootElement = document.getElementById('app')
if (rootElement && !rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(
    <StrictMode>
      <RouterProvider router={router} />
    </StrictMode>,
  )
}
reportWebVitals()
