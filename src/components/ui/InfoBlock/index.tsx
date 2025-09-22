import React from 'react'

export interface InfoBlockProps {
  label: string
  value: string | number | null | undefined
  inlineStyles?: React.CSSProperties
}

export const InfoBlock: React.FC<InfoBlockProps> = ({ label, value, inlineStyles }) => (
  <div
    style={{
      background: '#fff',
      padding: '12px 16px',
      border: '1px solid var(--border-color)',
      borderRadius: 'var(--border-radius)',
      display: 'flex',
      flexDirection: 'column',
      gap: '4px',
      ...inlineStyles,
    }}
  >
    <span
      style={{
        fontSize: 'var(--small-font-size)',
        color: 'var(--secondary-color)',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
      }}
    >
      {label}
    </span>
    <span
      style={{
        fontSize: 'var(--text-font-size)',
        color: 'var(--dark-color)',
        fontWeight: 500,
        wordBreak: 'break-word',
      }}
    >
      {value === null || value === undefined || value === '' ? '—' : String(value)}
    </span>
  </div>
)

export default InfoBlock