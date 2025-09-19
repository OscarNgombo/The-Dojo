import { useEffect } from 'react'
import { useAdminLayout } from '../providers'

interface UseAdminPageOptions {
  title: string
  breadcrumbs?: Array<{ label: string; path?: string }>
}

export const useAdminPage = ({ title, breadcrumbs }: UseAdminPageOptions) => {
  const { setCurrentPageTitle, setBreadcrumbs } = useAdminLayout()

  useEffect(() => {
    setCurrentPageTitle(title)
    if (breadcrumbs) {
      setBreadcrumbs(breadcrumbs)
    }
  }, [title, breadcrumbs, setCurrentPageTitle, setBreadcrumbs])
}