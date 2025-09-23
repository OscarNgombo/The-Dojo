import React, { useState, useRef, useEffect, useCallback } from 'react'
import styles from './RowActions.module.css'
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
  const itemsRef = useRef<Array<HTMLButtonElement | null>>([])

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

  useEffect(() => {
    if (isOpen) {
      requestAnimationFrame(() => {
        itemsRef.current[0]?.focus()
      })
    }
  }, [isOpen])

  const closeMenu = useCallback(() => {
    setIsOpen(false)
    requestAnimationFrame(() => {
      ref.current?.querySelector<HTMLButtonElement>('button')?.focus()
    })
  }, [])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!isOpen) return
      const enabledItems = itemsRef.current.filter(Boolean)
      const currentIndex = enabledItems.findIndex(
        (el) => el === document.activeElement,
      )
      switch (e.key) {
        case 'Escape':
          e.preventDefault()
          closeMenu()
          break
        case 'ArrowDown':
          e.preventDefault()
          if (enabledItems.length) {
            const next = (currentIndex + 1) % enabledItems.length
            enabledItems[next]?.focus()
          }
          break
        case 'ArrowUp':
          e.preventDefault()
          if (enabledItems.length) {
            const prev =
              (currentIndex - 1 + enabledItems.length) % enabledItems.length
            enabledItems[prev]?.focus()
          }
          break
        case 'Home':
          e.preventDefault()
          enabledItems[0]?.focus()
          break
        case 'End':
          e.preventDefault()
          enabledItems[enabledItems.length - 1]?.focus()
          break
      }
    },
    [isOpen, closeMenu],
  )

  const visibleActions = actions.filter((action) => !action.hidden)

  if (visibleActions.length === 0) {
    return null
  }

  return (
    <div className={styles.rowActions} ref={ref} onKeyDown={handleKeyDown}>
      {/* Dedicated trigger button (keeps icon variant styles separate from dropdown items) */}
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label={isOpen ? 'Close row actions menu' : 'Open row actions menu'}
        className={styles.trigger}
        onClick={(e) => {
          e.stopPropagation()
          setIsOpen((o) => !o)
        }}
        onKeyDown={(e) => {
          if (
            (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') &&
            !isOpen
          ) {
            e.preventDefault()
            setIsOpen(true)
          }
        }}
      >
        <MoreHorizontalIcon />
      </button>
      {isOpen && (
        <div
          className={styles.dropdown}
          role="menu"
          aria-label="Row actions menu"
        >
          {visibleActions.map((action, idx) => {
            const isDanger = action.variant === 'danger'
            const prevIsDanger = idx > 0 && visibleActions[idx - 1].variant === 'danger'
            const needsDivider = isDanger && idx > 0 && !prevIsDanger
            return (
              <React.Fragment key={action.label}>
                {needsDivider && <div className={styles.divider} role="separator" />}
                <button
                  role="menuitem"
                  ref={(el) => {
                    itemsRef.current[idx] = el
                  }}
                  className={`${styles.dropdownItem} ${isDanger ? styles.danger : ''}`}
                  onClick={(e) => {
                    e.stopPropagation()
                    action.onClick()
                    closeMenu()
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Tab') {
                      closeMenu()
                    }
                  }}
                >
                  {action.label}
                </button>
              </React.Fragment>
            )
          })}
        </div>
      )}
    </div>
  )
}
