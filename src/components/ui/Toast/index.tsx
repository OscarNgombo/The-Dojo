import { useToast } from '../../../providers';
import styles from './Toast.module.css';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

// Toast icons
const CheckIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M16.7 5.3L8.1 13.9L3.3 9.1L4.7 7.7L8.1 11.1L15.3 3.9L16.7 5.3Z" fill="currentColor"/>
  </svg>
);

const InfoIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18ZM9 8V9H11V8H9ZM9 11V15H11V11H9Z" fill="currentColor"/>
  </svg>
);

const WarningIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18ZM9 6H11V12H9V6ZM9 13H11V15H9V13Z" fill="currentColor"/>
  </svg>
);

const ErrorIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18ZM8.5 7.5L10 9L11.5 7.5L12.5 8.5L11 10L12.5 11.5L11.5 12.5L10 11L8.5 12.5L7.5 11.5L9 10L7.5 8.5L8.5 7.5Z" fill="currentColor"/>
  </svg>
);

const CloseIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const getToastIcon = (type: string) => {
  switch (type) {
    case 'success':
      return <CheckIcon />;
    case 'error':
      return <ErrorIcon />;
    case 'warning':
      return <WarningIcon />;
    case 'info':
      return <InfoIcon />;
    default:
      return <InfoIcon />;
  }
};

/**
 * Toast notification component that displays messages from the ToastProvider
 */
export const Toast = () => {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) {
    return null;
  }

  return (
    <div className={styles.toastContainer}>
      {toasts.map((toast: Toast) => (
        <div
          key={toast.id}
          className={`${styles.toast} ${styles[toast.type]}`}
        >
          <div className={styles.iconContainer}>
            {getToastIcon(toast.type)}
          </div>
          <div className={styles.content}>
            <div className={styles.title}>
              {toast.type === 'success' && 'Success'}
              {toast.type === 'error' && 'Error'}
              {toast.type === 'warning' && 'Warning'}
              {toast.type === 'info' && 'Information'}
            </div>
            <div className={styles.message}>{toast.message}</div>
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            className={styles.closeButton}
            aria-label="Close notification"
          >
            <CloseIcon />
          </button>
        </div>
      ))}
    </div>
  );
};