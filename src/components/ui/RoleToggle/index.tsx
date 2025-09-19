import { useState } from 'react'
import styles from './RoleToggle.module.css'

interface RoleToggleProps {
  currentRole: 'admin' | 'trainee'
  onRoleChange: (newRole: 'admin' | 'trainee') => Promise<void>
  disabled?: boolean
}

export const RoleToggle: React.FC<RoleToggleProps> = ({
  currentRole,
  onRoleChange,
  disabled = false,
}) => {
  const [isLoading, setIsLoading] = useState(false)

  const handleToggle = async (e?: React.ChangeEvent<HTMLInputElement>) => {
    if (e) {
      e.stopPropagation()
    }
    if (disabled || isLoading) return

    const newRole = currentRole === 'admin' ? 'trainee' : 'admin'
    setIsLoading(true)
    
    try {
      await onRoleChange(newRole)
    } catch (error) {
      console.error('Failed to change role:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={styles.container}>
      <label className={styles.switch}>
        <input
          type="checkbox"
          checked={currentRole === 'admin'}
          onChange={(e) => handleToggle(e)}
          disabled={disabled || isLoading}
          className={styles.input}
        />
        <span className={`${styles.slider} ${isLoading ? styles.loading : ''}`}>
          <span
            className={`${styles.sliderText} ${
              currentRole === 'admin' ? styles.padRight : styles.padLeft
            }`}
          >
            {isLoading ? '...' : currentRole === 'admin' ? 'ADMIN' : 'TRAINEE'}
          </span>
        </span>
      </label>
    </div>
  )
}