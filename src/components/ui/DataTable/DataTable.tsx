import type { DataTableProps } from '@/types/dataTable.ts'
import styles from './DataTable.module.css'
import { TableActions } from './TableActions'
import { TableRows } from './TableRows'
import { TableFooter } from './TableFooter'
import { TableColumns } from './TableColumns'

export const DataTable = <T extends object>({
  data,
  columns,
  rowActions,
  isClickable = false,
  onRowClick,
  showSortButton,
  showFilterButton,
  filterActive,
  sortActive,
  onSort,
  onFilter,
  onRefresh,
  rightBadges,
  rightActionsExtra,
  leftActionsExtra,
  showFooter = true,
  totalPages,
  currentPage,
  onPageChange,
  totalCount,
  pageSize,
  caption,
  ariaLabel,
  emptyState,
  getRowId,
}: DataTableProps<T>) => {
  return (
    <div className={styles.dataTableWrapper}>
      <TableActions
        leftActionsExtra={leftActionsExtra}
        rightBadges={rightBadges}
        rightActionsExtra={rightActionsExtra}
        showSortButton={showSortButton}
        showFilterButton={showFilterButton}
        filterActive={filterActive}
        sortActive={sortActive}
        onSort={onSort}
        onFilter={onFilter}
        onRefresh={onRefresh}
      />
      <table
        className={styles.dataTable}
        aria-label={ariaLabel || caption || 'Data table'}
        role="table"
      >
        {caption && <caption className={styles.caption}>{caption}</caption>}
        <TableColumns columns={columns} rowActions={rowActions} />
        <TableRows
          data={data}
          columns={columns}
          rowActions={rowActions}
          isClickable={isClickable}
          onRowClick={onRowClick}
          emptyState={emptyState}
          getRowId={getRowId}
        />
      </table>
      {showFooter && totalPages && currentPage && onPageChange && (
        <TableFooter
          totalPages={totalPages}
          currentPage={currentPage}
          onPageChange={onPageChange}
          totalCount={totalCount}
          pageSize={pageSize}
        />
      )}
    </div>
  )
}
