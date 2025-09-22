import React from "react";

export interface ColumnDef<T> {
  accessorKey?: keyof T
  header: string
  cell?: (item: { row: { original: T } }) => React.ReactNode
  id?: string
}

export interface ActionItem<T> {
  label: string
  icon?: React.ReactNode
  onClick: (item: T) => void
}

export interface DataTableProps<T> {
  data: T[]
  columns: ColumnDef<T>[]
  rowActions?: ActionItem<T>[]
  isClickable?: boolean
  onRowClick?: (item: T) => void
  ariaLabel?: string
  caption?: string
  emptyState?: React.ReactNode
  getRowId?: (item: T, index: number) => string | number
  showDefaultRightActions?: boolean
  showSortButton?: boolean
  showFilterButton?: boolean
  filterActive?: { count: number; onClear: () => void }
  sortActive?: { count: number; onClear: () => void }
  onSort?: () => void
  onFilter?: () => void
  onRefresh?: () => void
  rightBadges?: React.ReactNode
  rightActionsExtra?: React.ReactNode
  leftActionsExtra?: React.ReactNode
  showFooter?: boolean
  totalPages?: number
  currentPage?: number
  onPageChange?: (page: number) => void
  totalCount?: number
  pageSize?: number
}
