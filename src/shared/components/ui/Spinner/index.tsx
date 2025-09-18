import type { HTMLAttributes } from 'react';
import styles from './Spinner.module.css';

type SpinnerSize = 'small' | 'medium' | 'large';
type SpinnerColor = 'primary' | 'secondary' | 'light' | 'dark';

interface SpinnerProps extends HTMLAttributes<HTMLDivElement> {
  size?: SpinnerSize;
  color?: SpinnerColor;
  fullPage?: boolean;
}

export const Spinner = ({ 
  size = 'medium', 
  color = 'primary',
  fullPage = false,
  className, 
  ...props 
}: SpinnerProps) => {
  const spinnerElement = (
    <div 
      className={`
        ${styles.spinner} 
        ${styles[size]} 
        ${styles[color]} 
        ${className || ''}
      `} 
      {...props}
    >
      <div></div>
      <div></div>
      <div></div>
      <div></div>
    </div>
  );

  if (fullPage) {
    return (
      <div className={styles.fullPage}>
        {spinnerElement}
      </div>
    );
  }

  return spinnerElement;
};