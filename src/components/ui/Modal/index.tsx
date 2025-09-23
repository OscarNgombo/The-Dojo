import React, { useCallback, useEffect, useId, useRef } from 'react'
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
  description?: string
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
  description,
}) => {
  const overlayRef = useRef<HTMLDivElement | null>(null)
  const dialogRef = useRef<HTMLDivElement | null>(null)
  const lastFocusedElementRef = useRef<Element | null>(null)
  const internalId = useId()

  const titleId = title ? `modal-${internalId}-title` : undefined
  const descriptionId = description ? `modal-${internalId}-desc` : undefined

  useEffect(() => {
    if (open) {
      lastFocusedElementRef.current = document.activeElement
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const id = window.requestAnimationFrame(() => {
      const focusTarget =
        initialFocusRef?.current ||
        (dialogRef.current?.querySelector(
          '[data-autofocus="true"]',
        ) as HTMLElement | null) ||
        dialogRef.current
      if (focusTarget instanceof HTMLElement) {
        focusTarget.focus()
      }
    })
    return () => window.cancelAnimationFrame(id)
  }, [open, initialFocusRef])

  useEffect(() => {
    if (!open) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
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
    document.addEventListener('keydown', handleKey, { capture: true })
    return () =>
      document.removeEventListener('keydown', handleKey, {
        capture: true,
      } as any)
  }, [open, onClose])

  useEffect(() => {
    if (!open) return
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = originalOverflow
    }
  }, [open])

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
        aria-describedby={description ? descriptionId : undefined}
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
        {description && (
          <p
            id={descriptionId}
            className={styles.description}
            style={{ marginTop: 0 }}
          >
            {description}
          </p>
        )}
        <div className={styles.body}>{children}</div>
        {(primaryAction || secondaryAction) && (
          <div
            className={styles.footer}
            role="group"
            aria-label="Dialog actions"
          >
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
