import type { InputHTMLAttributes } from 'react';
import styles from './Input.module.css';

type InputVariant = 'default' | 'filled';
type InputSize = 'small' | 'medium' | 'large';

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  helperText?: string;
  variant?: InputVariant;
  size?: InputSize;
  fullWidth?: boolean;
}

export const Input = ({
  label,
  error,
  helperText,
  variant = 'default',
  size = 'medium',
  fullWidth = true,
  className = '',
  ...props
}: InputProps) => {
  return (
    <div className={`${styles.inputWrapper} ${fullWidth ? 'w-full' : ''}`}>
      {label && <label className={styles.label}>{label}</label>}
      <input
        className={`
          ${styles.input}
          ${styles[variant]}
          ${styles[size]}
          ${error ? styles.error : ''}
          ${className}
        `}
        {...props}
      />
      {error && <div className={styles.errorMessage}>{error}</div>}
      {helperText && !error && <div className={styles.helperText}>{helperText}</div>}
    </div>
  );
};