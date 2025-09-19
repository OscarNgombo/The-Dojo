import { createFileRoute } from '@tanstack/react-router'
import { UsersIcon, ReportsIcon, SettingsIcon } from '../../components/Icons'
import styles from '../../components/layout/AdminLayout.module.css'

export const Route = createFileRoute('/admin/')({
  component: AdminDashboardPage,
})

function AdminDashboardPage() {
  return (
    <div className={styles.welcomeContent}>
      <h1>Admin Dashboard</h1>
      <p>
        Welcome to The Dojo admin dashboard. Use the navigation menu to manage
        users, subjects, and tasks.
      </p>
      <div className={styles.quickStats}>
        <div className={styles.statCard}>
          <span className={styles.statIcon} style={{ color: '#2563EB' }}>
            <UsersIcon />
          </span>
          <div>
            <h3>User Management</h3>
            <p>Manage all users in the system</p>
          </div>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statIcon} style={{ color: '#7C3AED' }}>
            <ReportsIcon />
          </span>
          <div>
            <h3>Subjects</h3>
            <p>Manage training subjects and curriculum</p>
          </div>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statIcon} style={{ color: '#EA580C' }}>
            <SettingsIcon />
          </span>
          <div>
            <h3>Tasks</h3>
            <p>Create and manage assignments</p>
          </div>
        </div>
      </div>
    </div>
  )
}
