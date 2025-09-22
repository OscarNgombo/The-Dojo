import React from 'react'
import {
  RouterProvider,
  createRouter,
  createRootRoute,
  createRoute,
} from '@tanstack/react-router'
import { initialRouterContext, type RouterContext } from '@/types/router'

interface TestRouterProviderProps {
  children: React.ReactNode
}

export const TestRouterProvider: React.FC<TestRouterProviderProps> = ({
  children,
}) => {
  const rootRoute = createRootRoute({ component: () => children })
  const indexRoute = createRoute({ getParentRoute: () => rootRoute, path: '/' })
  const routeTree = rootRoute.addChildren([indexRoute])
  const router = createRouter({
    routeTree,
    context: initialRouterContext as RouterContext,
  })
  return <RouterProvider router={router} />
}
