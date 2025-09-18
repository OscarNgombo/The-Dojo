import { createContext, useContext, useState, useMemo, useEffect } from 'react';
import type { ReactNode } from 'react';
import { initializeGoogleAuth, debugGoogleSignIn } from '../utils/googleAuth';

interface AppState {
  loading: boolean;
  error: string | null;
}

interface AppActions {
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

interface AppContextType {
  state: AppState;
  actions: AppActions;
}

// Create context with undefined as initial value
const AppContext = createContext<AppContextType | undefined>(undefined);

// Initial state
const initialState: AppState = {
  loading: false,
  error: null,
};

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider = ({ children }: AppProviderProps) => {
  const [state, setState] = useState<AppState>(initialState);

  // Initialize Google Auth when the app starts
  useEffect(() => {
    initializeGoogleAuth()
      .then(() => {
        console.log('Google Identity Services initialized successfully');
        if (import.meta.env.MODE !== 'production') {
          debugGoogleSignIn();
        }
      })
      .catch((error) => {
        console.warn('Failed to initialize Google Auth:', error);
      });
  }, []);

  // Memoize actions to prevent unnecessary re-renders
  const actions = useMemo<AppActions>(
    () => ({
      setLoading: (loading: boolean) => setState((prev) => ({ ...prev, loading })),
      setError: (error: string | null) => setState((prev) => ({ ...prev, error })),
    }),
    []
  );

  // Provide the app context to children components
  return (
    <AppContext.Provider value={{ state, actions }}>
      {children}
    </AppContext.Provider>
  );
};

/**
 * Custom hook to use the app context
 */
export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};