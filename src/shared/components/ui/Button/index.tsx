import { type ButtonHTMLAttributes } from 'react';
import styles from './Button.module.css';

// Button variant types
type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'success' | 'text';
type ButtonSize = 'small' | 'medium' | 'large';

// Button props
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  children: React.ReactNode;
}

/**
 * Button component with different variants and sizes
 */
export const Button = ({
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
  children,
  className,
  ...props
}: ButtonProps) => {
  return (
    <button
      className={`
        ${styles.button}
        ${styles[variant]}
        ${styles[size]}
        ${fullWidth ? styles.fullWidth : ''}
        ${className || ''}
      `}
      {...props}
    >
      {children}
    </button>
  );
};