import type { HTMLAttributes } from 'react';
import styles from './Badge.module.css';

type BadgeVariant = 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info';
type BadgeSize = 'small' | 'medium' | 'large';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  withDot?: boolean;
  children: React.ReactNode;
}

export const Badge = ({
  variant = 'primary',
  size = 'medium',
  withDot = false,
  children,
  className,
  ...props
}: BadgeProps) => {
  return (
    <span
      className={`
        ${styles.badge}
        ${styles[variant]}
        ${styles[size]}
        ${withDot ? styles.withDot : ''}
        ${className || ''}
      `}
      {...props}
    >
      {withDot && <span className={styles.dot}></span>}
      {children}
    </span>
  );
};