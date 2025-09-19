import type { HTMLAttributes } from 'react';
import styles from './Avatar.module.css';

type AvatarSize = 'small' | 'medium' | 'large' | 'xlarge';
type AvatarStatus = 'online' | 'away' | 'offline' | 'busy';

interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  name?: string;
  size?: AvatarSize;
  status?: AvatarStatus;
  withBorder?: boolean;
}

export const Avatar = ({
  src,
  alt = 'User avatar',
  name,
  size = 'medium',
  status,
  withBorder = false,
  className,
  ...props
}: AvatarProps) => {
  // Generate initials from name
  const getInitials = (name: string): string => {
    if (!name) return '';
    
    const names = name.split(' ');
    if (names.length === 1) {
      return names[0].charAt(0).toUpperCase();
    }
    
    return `${names[0].charAt(0)}${names[names.length - 1].charAt(0)}`.toUpperCase();
  };

  return (
    <div
      className={`
        ${styles.avatar}
        ${styles[size]}
        ${withBorder ? styles.withBorder : ''}
        ${status ? styles.status : ''}
        ${className || ''}
      `}
      {...props}
    >
      {src ? (
        <img src={src} alt={alt} />
      ) : name ? (
        getInitials(name)
      ) : (
        'U'
      )}
      
      {status && (
        <span className={`${styles.statusIndicator} ${styles[status]}`}></span>
      )}
    </div>
  );
};