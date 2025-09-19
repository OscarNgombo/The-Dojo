import React, { useState, useRef, useEffect } from 'react'
import styles from './RowActions.module.css'
import { Button } from '../Button'
import { MoreHorizontalIcon } from '../../Icons'

interface Action {
  label: string
  onClick: () => void
  hidden?: boolean
  variant?: 'default' | 'danger'
}

interface RowActionsProps {
  actions: Action[]
}

export const RowActions: React.FC<RowActionsProps> = ({ actions }) => {
  const [isOpen, setIsOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const visibleActions = actions.filter(action => !action.hidden)

  if (visibleActions.length === 0) {
    return null
  }

  return (
    <div className={styles.rowActions} ref={ref}>
      <Button variant="icon" onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen) }}>
        <MoreHorizontalIcon />
      </Button>
      {isOpen && (
        <div className={styles.dropdown}>
          {visibleActions.map(action => (
            <button
              key={action.label}
              className={`${styles.dropdownItem} ${
                action.variant === 'danger' ? styles.danger : ''
              }`}
              onClick={(e) => {
                e.stopPropagation()
                action.onClick()
                setIsOpen(false)
              }}
            >
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
