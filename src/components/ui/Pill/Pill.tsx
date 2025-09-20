import React, { useState } from 'react'
import styles from './Pill.module.css'

export interface PillProps {
  label?: string
  count?: number
  onClear?: () => void
  variant?: 'primary' | 'info' | 'success' | 'danger' | 'warning' | 'neutral'
  clearAriaLabel?: string
  className?: string
  onClick?: () => void
  clickableAriaLabel?: string
}

export const Pill: React.FC<PillProps> = ({
  label,
  count,
  onClear,
  variant = 'info',
  clearAriaLabel = 'Clear',
  className,
  onClick,
  clickableAriaLabel,
}) => {
  const [exiting, setExiting] = useState(false)
  const handleClear = () => {
    if (!onClear) return
    setExiting(true)
    setTimeout(() => {
      onClear()
    }, 140)
  }
  const Tag: any = onClick ? 'button' : 'span'
  const tagProps: any = onClick
    ? {
        type: 'button',
        onClick,
        'aria-label': clickableAriaLabel || label,
      }
    : {}
  return (
    <Tag
      {...tagProps}
      className={[
        styles.pill,
        onClick ? styles.clickable : '',
        styles[variant],
        exiting ? styles.exit : '',
        className || '',
      ]
        .join(' ')
        .trim()}
    >
      {label && <span>{label}</span>}
      {typeof count === 'number' && (
        <span className={styles.count}>{count}</span>
      )}
      {onClear && (
        <button
          type="button"
          className={styles.actionBtn}
          aria-label={clearAriaLabel}
          onClick={(e) => {
            e.stopPropagation()
            handleClear()
          }}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M18.3 5.71a1 1 0 0 0-1.41 0L12 10.59 7.11 5.7A1 1 0 0 0 5.7 7.11L10.59 12l-4.9 4.89a1 1 0 1 0 1.41 1.42L12 13.41l4.89 4.9a1 1 0 0 0 1.42-1.41L13.41 12l4.9-4.89a1 1 0 0 0-.01-1.4z"
              fill="currentColor"
            />
          </svg>
        </button>
      )}
    </Tag>
  )
}
