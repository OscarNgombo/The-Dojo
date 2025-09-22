import React from 'react'
import styles from './TableActions.module.css'
import { FilterIcon, SortIcon, RefreshIcon } from '../../Icons'
import { Button } from '../Button'
import { Pill } from '../Pill/Pill'

interface TableActionsProps {
  leftActionsExtra?: React.ReactNode
  rightBadges?: React.ReactNode
  rightActionsExtra?: React.ReactNode
  showSortFilter?: boolean
  showSortButton?: boolean
  showFilterButton?: boolean
  filterActive?: { count: number; onClear: () => void }
  sortActive?: { count: number; onClear: () => void }
  onSort?: () => void
  onFilter?: () => void
  onRefresh?: () => void
}

export const TableActions: React.FC<TableActionsProps> = ({
  leftActionsExtra,
  rightBadges,
  rightActionsExtra,
  showSortFilter = true,
  showSortButton,
  showFilterButton,
  filterActive,
  sortActive,
  onSort,
  onFilter,
  onRefresh,
}) => {
  const canShowSort =
    typeof showSortButton === 'boolean' ? showSortButton : showSortFilter
  const canShowFilter =
    typeof showFilterButton === 'boolean' ? showFilterButton : showSortFilter
  return (
    <div className={styles.tableActions}>
      <div className={styles.leftActions}>
        {leftActionsExtra && (
          <div className={styles.fadeSlideIn} key="left-extra">
            {leftActionsExtra}
          </div>
        )}
      </div>
      <div className={styles.rightActions}>
        {(canShowSort || canShowFilter || sortActive || filterActive) && (
          <div
            style={{ display: 'flex', gap: '0.5rem' }}
            className={styles.fadeSlideIn}
            key="sf"
          >
            {sortActive ? (
              <Pill
                label="Sort"
                count={sortActive.count}
                onClear={sortActive.onClear}
                variant="info"
                clearAriaLabel="Clear sorting"
                onClick={onSort}
                clickableAriaLabel="Adjust sorting"
              />
            ) : (
              canShowSort && (
                <Button onClick={onSort} aria-label="Sort">
                  <SortIcon />
                </Button>
              )
            )}
            {filterActive ? (
              <Pill
                label="Filters"
                count={filterActive.count}
                onClear={filterActive.onClear}
                variant="info"
                clearAriaLabel="Clear filters"
                onClick={onFilter}
                clickableAriaLabel="Adjust filters"
              />
            ) : (
              canShowFilter && (
                <Button onClick={onFilter} aria-label="Filter">
                  <FilterIcon />
                </Button>
              )
            )}
          </div>
        )}
        {rightBadges && (
          <div className={styles.fadeSlideIn} key="badges">
            {rightBadges}
          </div>
        )}
        {rightActionsExtra && (
          <div className={styles.fadeSlideIn} key="extra">
            {rightActionsExtra}
          </div>
        )}
        <Button onClick={onRefresh} aria-label="Refresh" key="refresh">
          <RefreshIcon />
        </Button>
      </div>
    </div>
  )
}
