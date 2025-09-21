import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import type { RouterContext } from './types/router'
import { initialRouterContext } from './types/router'
import './styles/main.css'
import reportWebVitals from './reportWebVitals.ts'
import { routeTree } from './routeTree.gen.ts'

export const router = createRouter({
  routeTree,
  context: initialRouterContext as RouterContext,
  defaultPreload: 'intent',
  scrollRestoration: true,
  defaultStructuralSharing: true,
  defaultPreloadStaleTime: 0,
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
  interface RouteContext extends RouterContext {}
}

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
