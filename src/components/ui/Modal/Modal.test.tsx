import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'
import { Modal } from './index'

// Helper to open modal
const renderOpen = (props: Partial<React.ComponentProps<typeof Modal>> = {}) => {
  const onClose = vi.fn()
  render(
    <Modal
      open
      title="Test Dialog"
      description="Dialog description"
      primaryAction={{ label: 'Primary', onClick: () => {} }}
      secondaryAction={{ label: 'Secondary', onClick: () => {} }}
      onClose={onClose}
      {...props}
    >
      <div>Modal Content</div>
    </Modal>,
  )
  return { onClose }
}

describe('Modal', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })

  it('renders title and description with proper aria', () => {
    renderOpen()
    const dialog = screen.getByRole('dialog')
    expect(dialog).toBeInTheDocument()
    const title = screen.getByRole('heading', { name: 'Test Dialog' })
    expect(title.id).toBeTruthy()
    expect(dialog).toHaveAttribute('aria-labelledby', title.id)
    const description = screen.getByText('Dialog description')
    expect(dialog).toHaveAttribute('aria-describedby', description.id)
  })

  it('calls onClose when Escape pressed', () => {
    const { onClose } = renderOpen()
    const dialog = screen.getByRole('dialog')
    dialog.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    expect(onClose).toHaveBeenCalled()
  })

  it('traps tab focus within modal', () => {
    renderOpen()
    const buttons = screen.getAllByRole('button')
    // Focus last button then press Tab
    buttons[buttons.length - 1].focus()
    fireEvent.keyDown(document, { key: 'Tab' })
    expect(document.activeElement).toBe(buttons[0])
  })
})
