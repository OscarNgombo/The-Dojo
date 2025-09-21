import React, { useCallback, useEffect, useRef } from 'react'
import styles from './Modal.module.css'
import { CancelIcon } from '../../Icons'

export interface ModalAction {
  label: string
  onClick: () => void | Promise<void>
  type?: 'primary' | 'secondary' | 'danger'
  disabled?: boolean
  autoFocus?: boolean
}

export interface ModalProps {
  open: boolean
  title?: string
  onClose: () => void
  primaryAction?: ModalAction
  secondaryAction?: ModalAction
  closeOnOverlay?: boolean
  children: React.ReactNode
  ariaLabel?: string
  initialFocusRef?: React.RefObject<HTMLElement>
}

export const Modal: React.FC<ModalProps> = ({
  open,
  title,
  onClose,
  primaryAction,
  secondaryAction,
  closeOnOverlay = true,
  children,
  ariaLabel,
  initialFocusRef,
}) => {
  const overlayRef = useRef<HTMLDivElement | null>(null)
  const dialogRef = useRef<HTMLDivElement | null>(null)
  const lastFocusedElementRef = useRef<Element | null>(null)

  useEffect(() => {
    if (open) {
      lastFocusedElementRef.current = document.activeElement
    }
  }, [open])

  useEffect(() => {
    if (!open) return

    const focusTarget =
      initialFocusRef?.current ||
      dialogRef.current?.querySelector('[data-autofocus="true"]') ||
      dialogRef.current
    if (focusTarget instanceof HTMLElement) {
      focusTarget.focus()
    }
  }, [open, initialFocusRef])

  useEffect(() => {
    if (!open) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
      if (e.key === 'Tab') {
        const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        )
        if (!focusable || focusable.length === 0) return
        const first = focusable[0]
        const last = focusable[focusable.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [open, onClose])

  useEffect(() => {
    if (!open && lastFocusedElementRef.current instanceof HTMLElement) {
      lastFocusedElementRef.current.focus()
    }
  }, [open])

  const handleOverlayClick = useCallback(
    (e: React.MouseEvent) => {
      if (!closeOnOverlay) return
      if (e.target === overlayRef.current) {
        onClose()
      }
    },
    [closeOnOverlay, onClose],
  )

  if (!open) return null

  const titleId = title
    ? 'modal-title-' + Math.random().toString(36).slice(2)
    : undefined

  return (
    <div
      className={styles.overlay}
      role="presentation"
      ref={overlayRef}
      onMouseDown={handleOverlayClick}
    >
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-label={!title ? ariaLabel : undefined}
        ref={dialogRef}
      >
        <div className={styles.header}>
          {title && (
            <h2 id={titleId} className={styles.headerTitle}>
              {title}
            </h2>
          )}
          <button
            type="button"
            className={styles.closeBtn}
            aria-label="Close dialog"
            onClick={onClose}
          >
            <CancelIcon />
          </button>
        </div>
        <div className={styles.body}>{children}</div>
        {(primaryAction || secondaryAction) && (
          <div className={styles.footer}>
            {secondaryAction && (
              <button
                type="button"
                onClick={secondaryAction.onClick}
                disabled={secondaryAction.disabled}
                className={styles.secondaryBtn}
                data-autofocus={secondaryAction.autoFocus ? 'true' : undefined}
              >
                {secondaryAction.label}
              </button>
            )}
            {primaryAction && (
              <button
                type="button"
                onClick={primaryAction.onClick}
                disabled={primaryAction.disabled}
                className={`${styles.primaryBtn} ${primaryAction.type === 'danger' ? styles.danger : ''}`}
                data-autofocus={primaryAction.autoFocus ? 'true' : undefined}
              >
                {primaryAction.label}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default Modal
