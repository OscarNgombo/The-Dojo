import type { ColumnDef, ActionItem } from '@/types/dataTable.ts'
import styles from './TableRows.module.css'
import { Button } from '../Button'
import React from "react";

interface TableRowsProps<T> {
  data: T[]
  columns: ColumnDef<T>[]
  rowActions?: ActionItem<T>[]
  isClickable?: boolean
  onRowClick?: (item: T) => void
  emptyState?: React.ReactNode
  getRowId?: (item: T, index: number) => string | number
}

export const TableRows = <T extends object>({
  data,
  columns,
  rowActions,
  isClickable = false,
  onRowClick,
  emptyState,
  getRowId,
}: TableRowsProps<T>) => {
  if (!data.length) {
    return (
      <tbody>
        <tr>
          <td
            colSpan={columns.length + (rowActions ? 1 : 0)}
            style={{ textAlign: 'center', padding: '16px' }}
          >
            {emptyState || 'No records found'}
          </td>
        </tr>
      </tbody>
    )
  }
  return (
    <tbody>
      {data.map((item, index) => {
        const rowId =
          (getRowId && getRowId(item, index)) || (item as any).id || index
        return (
          <tr
            key={rowId}
            className={`${styles.tableRow} ${
              isClickable ? styles.clickable : ''
            }`}
            role={isClickable ? 'button' : 'row'}
            tabIndex={isClickable ? 0 : -1}
            aria-label={isClickable ? 'View details' : undefined}
            onClick={() => isClickable && onRowClick?.(item)}
            onKeyDown={(e) => {
              if (!isClickable) return
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onRowClick?.(item)
              }
            }}
          >
            {columns.map((column) => (
              <td key={(column.accessorKey || column.id) as string}>
                {column.cell
                  ? column.cell({ row: { original: item } })
                  : (item[column.accessorKey as keyof T] as React.ReactNode)}
              </td>
            ))}
            {rowActions && (
              <td className={styles.actionsCell}>
                {rowActions.map((action) => (
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
        )
      })}
    </tbody>
  )
}
