import { Outlet, Link } from '@tanstack/react-router'
import { useState } from 'react'
import styles from './AdminLayout.module.css'
import {
  DashboardIcon,
  UsersIcon,
  LogoIcon,
  LogoutIcon,
  NotificationIcon,
  TasksManageIcon,
  SubjectsIcon,
  SideMenuIcon,
} from '../Icons'
import { useAuth } from '../../providers/AuthProvider'

export const AdminLayout = () => {
  const { user, logout } = useAuth()
  const [isCollapsed, setIsCollapsed] = useState(false)

  const navigationItems = [
    {
      path: '/admin',
      label: 'Dashboard',
      icon: <DashboardIcon />,
      color: '#5856D6',
    },
    {
      path: '/admin/users',
      label: 'User Management',
      icon: <UsersIcon />,
      color: '#2563EB',
    },
    {
      path: '/admin/subjects',
      label: 'Manage Subjects',
      icon: <SubjectsIcon />,
      color: '#7C3AED',
    },
    {
      path: '/admin/tasks',
      label: 'Manage Tasks',
      icon: <TasksManageIcon />,
      color: '#EA580C',
    },
  ]

  return (
    <div
      className={`${styles.adminLayout} ${isCollapsed ? styles.collapsed : ''}`}
    >
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.logo}>
            <LogoIcon />
            {!isCollapsed && <span className={styles.logoText}>The Dojo</span>}
          </div>
        </div>
        <div className={styles.headerRight}>
          <button className={styles.notificationBtn}>
            <NotificationIcon />
          </button>
          <div className={styles.userInfo}>
            <span>{user?.name || 'Admin'}</span>
            <button className={styles.logoutBtn} onClick={() => logout()}>
              <LogoutIcon />
            </button>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <ul className={styles.navigation}>
          {navigationItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={styles.navLink}
                activeProps={{ className: styles.activeNavLink }}
                activeOptions={{ exact: item.path === '/admin' }}
              >
                <span className={styles.navIcon} style={{ color: item.color }}>
                  {item.icon}
                </span>
                <span className={styles.navLabel}>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
        <button
          className={styles.menuButton}
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          <SideMenuIcon />
        </button>
      </aside>

      {/* Main Content */}
      <main className={styles.mainContent}>
        <Outlet />
      </main>
    </div>
  )
}