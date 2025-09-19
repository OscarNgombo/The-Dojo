import type { ColumnDef, ActionItem } from '../../../types/dataTable'
import styles from './TableRows.module.css'
import { Button } from '../Button'

interface TableRowsProps<T> {
  data: T[]
  columns: ColumnDef<T>[]
  rowActions?: ActionItem<T>[]
  isClickable?: boolean
  onRowClick?: (item: T) => void
}

export const TableRows = <T extends object>({
  data,
  columns,
  rowActions,
  isClickable = false,
  onRowClick,
}: TableRowsProps<T>) => {
  return (
    <tbody>
      {data.map(item => (
        <tr
          key={(item as any).id || Math.random()}
          className={`${styles.tableRow} ${
            isClickable ? styles.clickable : ''
          }`}
          onClick={() => isClickable && onRowClick?.(item)}
        >
          {columns.map(column => (
            <td key={(column.accessorKey || column.id) as string}>
              {column.cell
                ? column.cell({ row: { original: item } })
                : (item[
                    column.accessorKey as keyof T
                  ] as React.ReactNode)}
            </td>
          ))}
          {rowActions && (
            <td className={styles.actionsCell}>
              {rowActions.map(action => (
                <Button
                  key={action.label}
                  variant="icon"
                  onClick={() => action.onClick(item)}
                  aria-label={action.label}
                >
                  {action.icon}
                </Button>
              ))}
            </td>
          )}
        </tr>
      ))}
    </tbody>
  )
}
