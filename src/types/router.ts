import type { User } from './index'

export interface RouterContext {
  user: User | null
  isAuthenticated: boolean
  loadingAuth: boolean
}

export const initialRouterContext: RouterContext = {
  user: null,
  isAuthenticated: false,
  loadingAuth: true,
}

export type RouterContextUpdater = (prev: RouterContext) => RouterContext