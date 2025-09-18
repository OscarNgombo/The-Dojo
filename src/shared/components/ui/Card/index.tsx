import type { HTMLAttributes } from 'react';
import styles from './Card.module.css';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: 'default' | 'outline' | 'ghost';
  padding?: 'none' | 'small' | 'medium' | 'large';
}

export const Card = ({
  children,
  variant = 'default',
  padding = 'medium',
  className,
  ...props
}: CardProps) => {
  return (
    <div
      className={`
        ${styles.card}
        ${styles[variant]}
        ${styles['padding-' + padding]}
        ${className || ''}
      `}
      {...props}
    >
      {children}
    </div>
  );
};

interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const CardHeader = ({ children, className, ...props }: CardHeaderProps) => {
  return (
    <div className={`${styles.cardHeader} ${className || ''}`} {...props}>
      {children}
    </div>
  );
};

interface CardBodyProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const CardBody = ({ children, className, ...props }: CardBodyProps) => {
  return (
    <div className={`${styles.cardBody} ${className || ''}`} {...props}>
      {children}
    </div>
  );
};

interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const CardFooter = ({ children, className, ...props }: CardFooterProps) => {
  return (
    <div className={`${styles.cardFooter} ${className || ''}`} {...props}>
      {children}
    </div>
  );
};