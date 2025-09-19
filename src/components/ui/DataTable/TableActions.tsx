import React from 'react'
import styles from './TableActions.module.css'
import { FilterIcon, SortIcon, RefreshIcon } from '../../Icons'
import { Button } from '../Button'

interface TableActionsProps {
  leftActions?: React.ReactNode
  showDefaultRightActions?: boolean
  customRightAction?: React.ReactNode
  onSort?: () => void
  onFilter?: () => void
  onRefresh?: () => void
}

export const TableActions: React.FC<TableActionsProps> = ({
  leftActions,
  showDefaultRightActions = true,
  customRightAction,
  onSort,
  onFilter,
  onRefresh,
}) => {
  return (
    <div className={styles.tableActions}>
      <div className={styles.leftActions}>{leftActions}</div>
      <div className={styles.rightActions}>
        {showDefaultRightActions && (
          <>
            <Button variant="icon" onClick={onSort} aria-label="Sort">
              <SortIcon />
            </Button>
            <Button variant="icon" onClick={onFilter} aria-label="Filter">
              <FilterIcon />
            </Button>
            <Button variant="icon" onClick={onRefresh} aria-label="Refresh">
              <RefreshIcon />
            </Button>
          </>
        )}
        {customRightAction}
      </div>
    </div>
  )
}
