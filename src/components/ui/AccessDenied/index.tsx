import React from 'react'

export interface AccessDeniedProps {
  title?: string
  message?: string
  style?: React.CSSProperties
}

export const AccessDenied: React.FC<AccessDeniedProps> = ({
  title = 'Access Denied',
  message = 'You do not have permission to view this area.',
  style,
}) => {
  return (
    <div
      role="alert"
      aria-live="assertive"
      style={{
        padding: '2rem',
        textAlign: 'center',
        maxWidth: '720px',
        margin: '4rem auto 0',
        background: 'var(--light-color)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--border-radius)',
        boxShadow: 'var(--box-shadow)',
        ...style,
      }}
   >
      <h2 style={{ marginBottom: '0.75rem', fontSize: '1.75rem' }}>{title}</h2>
      <p style={{ color: 'var(--secondary-color)', lineHeight: 1.5 }}>{message}</p>
    </div>
  )
}

AccessDenied.displayName = 'AccessDenied'
