import type { ButtonHTMLAttributes } from 'react'
import styles from './GoogleButton.module.css'
import { GoogleIcon } from '../../Icons'

interface GoogleButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'small' | 'default' | 'large'
  label?: string
}

export const GoogleButton = ({
  variant = 'default',
  label = 'Sign in with Google',
  className = '',
  ...props
}: GoogleButtonProps) => {
  return (
    <button
      className={`${styles.googleButton} ${variant === 'small' ? styles.small : variant === 'large' ? styles.large : ''} ${className}`}
      {...props}
    >
      <GoogleIcon />
      {label}
    </button>
  )
}
