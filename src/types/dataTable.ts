export interface ColumnDef<T> {
  accessorKey?: keyof T;
  header: string;
  /**
   * Optional custom renderer for the cell.
   * If not provided, the component will display the raw value from `accessorKey`.
   * @param item - The data object for the current row.
   * @returns A React.ReactNode to render in the cell.
   */
  cell?: (item: { row: { original: T } }) => React.ReactNode;
  id?: string;
}

/**
 * Defines a single action item for a table row (e.g., Edit, Delete).
 * @template T - The type of the data object for a row.
 */
export interface ActionItem<T> {
  label: string
  icon?: React.ReactNode
  onClick: (item: T) => void
}

/**
 * Props for the main DataTable component.
 * @template T - The type of the data object for a row.
 */
export interface DataTableProps<T> {
  data: T[]
  columns: ColumnDef<T>[]
  rowActions?: ActionItem<T>[]
  isClickable?: boolean
  onRowClick?: (item: T) => void
  leftActions?: React.ReactNode
  customRightAction?: React.ReactNode
  showDefaultRightActions?: boolean
  onSort?: () => void
  onFilter?: () => void
  onRefresh?: () => void
  showFooter?: boolean
  totalPages?: number
  currentPage?: number
  onPageChange?: (page: number) => void
  totalCount?: number
  pageSize?: number
}
