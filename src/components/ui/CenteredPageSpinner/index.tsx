import React from 'react';
import { Spinner } from '../Spinner';

interface CenteredPageSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: 'primary' | 'secondary' | 'light' | 'dark';
  minHeight?: string; // allow override if page shorter
}

/**
 * Full-page centered loading indicator used as a Suspense fallback.
 * Consolidates layout duplication across route wrappers.
 */
const CenteredPageSpinner: React.FC<CenteredPageSpinnerProps> = ({
  size = 'large',
  color = 'primary',
  minHeight = '80vh',
}) => {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight,
        width: '100%',
      }}
      role="status"
      aria-label="Loading content"
    >
      <Spinner size={size} color={color} />
    </div>
  );
};

export default CenteredPageSpinner;
