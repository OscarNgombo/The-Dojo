import type { FormHTMLAttributes, HTMLAttributes } from 'react';
import styles from './Form.module.css';

interface FormProps extends FormHTMLAttributes<HTMLFormElement> {
  children: React.ReactNode;
  onSubmit?: (e: React.FormEvent<HTMLFormElement>) => void;
}

export const Form = ({ children, onSubmit, className, ...props }: FormProps) => {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit(e);
    }
  };

  return (
    <form 
      className={`${styles.form} ${className || ''}`} 
      onSubmit={handleSubmit} 
      {...props}
    >
      {children}
    </form>
  );
};

interface FormGroupProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const FormGroup = ({ children, className, ...props }: FormGroupProps) => {
  return (
    <div className={`${styles.formGroup} ${className || ''}`} {...props}>
      {children}
    </div>
  );
};

interface FormLabelProps extends HTMLAttributes<HTMLLabelElement> {
  children: React.ReactNode;
  htmlFor?: string;
}

export const FormLabel = ({ children, className, ...props }: FormLabelProps) => {
  return (
    <label className={`${styles.formLabel} ${className || ''}`} {...props}>
      {children}
    </label>
  );
};

interface FormActionsProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const FormActions = ({ children, className, ...props }: FormActionsProps) => {
  return (
    <div className={`${styles.formActions} ${className || ''}`} {...props}>
      {children}
    </div>
  );
};