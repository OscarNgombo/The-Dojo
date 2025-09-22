import type { ColumnDef, ActionItem } from '@/types/dataTable.ts'
import styles from './TableColumns.module.css'

interface TableColumnsProps<T> {
  columns: ColumnDef<T>[]
  rowActions?: ActionItem<T>[]
}

export const TableColumns = <T extends object>({
  columns,
  rowActions,
}: TableColumnsProps<T>) => {
  return (
    <thead className={styles.tableHeader}>
      <tr>
        {columns.map(column => (
          <th key={(column.accessorKey || column.id) as string}>
            {column.header}
          </th>
        ))}
        {rowActions && <th>Actions</th>}
      </tr>
    </thead>
  )
}
