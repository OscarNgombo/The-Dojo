import React from 'react'
import styles from './TasksAside.module.css'
import { Button, Spinner } from '@/components/ui'
import { formatDate } from '@/utils/dateUtils'
import type { Task } from '@/types'

interface TasksAsideProps {
  tasks: Task[]
  loading: boolean
  error: string | null
  onRetry: () => void
  onCreate?: () => void
}

export const TasksAside: React.FC<TasksAsideProps> = ({
  tasks,
  loading,
  error,
  onRetry,
  onCreate,
}) => {
  return (
    <aside className={`${styles.container} sticky`} aria-label="Subject Tasks">
      <div className={styles.headerRow}>
        <h3 className={styles.title}>Tasks</h3>
        {onCreate && (
          <Button variant="ghost" onClick={onCreate} style={{ fontSize: 12 }}>
            + New
          </Button>
        )}
      </div>
      {loading && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 12 }}>
          <Spinner size="small" />
        </div>
      )}
      {!loading && error && (
        <div className={styles.error} role="alert">
          <div style={{ marginBottom: 6 }}>{error}</div>
          <Button variant="secondary" onClick={onRetry} size="small">
            Retry
          </Button>
        </div>
      )}
      {!loading && !error && tasks.length === 0 && (
        <div className={styles.empty}>No tasks for this subject yet.</div>
      )}
      {!loading && !error && tasks.length > 0 && (
        <ul className={styles.list}>
          {tasks.map((t) => {
            const isOverdue = Date.parse(t.dueDate) < Date.now()
            return (
              <li key={t.id} className={styles.item}>
                <div className={styles.itemHeader}>
                  <h4 className={styles.itemTitle} title={t.title}>
                    {t.title}
                  </h4>
                  <span
                    className={`${styles.badge} ${!t.isActive ? styles.inactive : ''}`}
                    title={t.isActive ? 'Active' : 'Inactive'}
                  >
                    {t.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className={styles.meta}>
                  <span style={{ color: isOverdue ? 'var(--danger-color)' : undefined }}>
                    {formatDate(t.dueDate)}
                  </span>
                  <span style={{ fontWeight: 600 }}>{t.maxScore}</span>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </aside>
  )
}

export default TasksAside