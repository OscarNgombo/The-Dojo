import React from 'react'
import styles from './ActiveBadge.module.css'
import { Pill } from '../Pill/Pill'

interface ActiveBadgeItemBase {
  onClear: () => void
}

interface ActiveBadgeGroupProps {
  filters?: ActiveBadgeItemBase & { count: number }
  sorts?: ActiveBadgeItemBase & { count: number }
}

// Renders consolidated badges: "Filters {count}" and "Sort {count}".
// Previous behavior listed parameter labels; now we just show total active counts.
export const ActiveBadgeGroup: React.FC<ActiveBadgeGroupProps> = ({
  filters,
  sorts,
}) => {
  if (!filters && !sorts) return null
  return (
    <div
      className={styles.activeBadgeWrapper}
      aria-label="Active filters and sorts"
    >
      {filters && filters.count > 0 && (
        <Pill
          label="Filters"
          count={filters.count}
          onClear={filters.onClear}
          variant="danger"
          clearAriaLabel="Clear all filters"
        />
      )}
      {sorts && sorts.count > 0 && (
        <Pill
          label="Sort"
          count={sorts.count}
          onClear={sorts.onClear}
          variant="danger"
          clearAriaLabel="Clear sorting"
        />
      )}
    </div>
  )
}
