import { createContext, useContext, useState } from 'react'
import type { ReactNode } from 'react'

interface AdminLayoutContextType {
  sidebarCollapsed: boolean
  setSidebarCollapsed: (collapsed: boolean) => void
  currentPageTitle: string
  setCurrentPageTitle: (title: string) => void
  breadcrumbs: Array<{ label: string; path?: string }>
  setBreadcrumbs: (breadcrumbs: Array<{ label: string; path?: string }>) => void
}

const AdminLayoutContext = createContext<AdminLayoutContextType | undefined>(undefined)

interface AdminLayoutProviderProps {
  children: ReactNode
}

export const AdminLayoutProvider = ({ children }: AdminLayoutProviderProps) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [currentPageTitle, setCurrentPageTitle] = useState('Dashboard')
  const [breadcrumbs, setBreadcrumbs] = useState<Array<{ label: string; path?: string }>>([
    { label: 'Dashboard', path: '/admin' }
  ])

  const value: AdminLayoutContextType = {
    sidebarCollapsed,
    setSidebarCollapsed,
    currentPageTitle,
    setCurrentPageTitle,
    breadcrumbs,
    setBreadcrumbs,
  }

  return (
    <AdminLayoutContext.Provider value={value}>
      {children}
    </AdminLayoutContext.Provider>
  )
}

export const useAdminLayout = (): AdminLayoutContextType => {
  const context = useContext(AdminLayoutContext)
  if (!context) {
    throw new Error('useAdminLayout must be used within AdminLayoutProvider')
  }
  return context
}