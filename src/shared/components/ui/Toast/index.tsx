import { useToast } from '../../../../providers';
import styles from './Toast.module.css';

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
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`${styles.toast} ${styles[toast.type]}`}
        >
          <div className={styles.message}>{toast.message}</div>
          <button
            onClick={() => removeToast(toast.id)}
            className={styles.closeButton}
            aria-label="Close notification"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
};