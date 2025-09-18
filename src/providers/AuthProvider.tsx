import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { User, LoginCredentials, RegisterCredentials } from '../types';
import { authService } from '../api';
import { useApiCall } from '../hooks/useApiCall';
import { decodeGoogleToken } from '../utils/googleAuth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  loginWithGoogle: (token: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

// Create the context with undefined as initial value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(authService.isAuthenticated());
  
  const { execute: executeApiCall } = useApiCall<{ user: User; token: string }>();
  const { execute: fetchUser } = useApiCall<User>();

  // Attempt to load user data when the provider mounts
  useEffect(() => {
    const loadUser = async () => {
      if (!authService.isAuthenticated()) {
        setLoading(false);
        return;
      }

      try {
        const userData = await fetchUser(() => authService.getCurrentUser());
        setUser(userData);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Failed to load user:', error);
        // If token is invalid, clear it
        authService.logout();
        setIsAuthenticated(false);
        setError(error instanceof Error ? error.message : 'Failed to authenticate');
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [fetchUser]);

  /**
   * Login user with email and password
   */
  const login = async (credentials: LoginCredentials) => {
    setLoading(true);
    setError(null);

    try {
      const { user, token } = await executeApiCall(() => authService.login(credentials));
      authService.setToken(token);
      setUser(user);
      setIsAuthenticated(true);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Login failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Register a new user
   */
  const register = async (credentials: RegisterCredentials) => {
    setLoading(true);
    setError(null);

    try {
      const { user, token } = await executeApiCall(() => authService.register(credentials));
      authService.setToken(token);
      setUser(user);
      setIsAuthenticated(true);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Registration failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Login with Google
   */
  const loginWithGoogle = async (token: string) => {
    setLoading(true);
    setError(null);

    try {
      // For now, we'll decode the token on the client and create a mock session
      const googleUser = decodeGoogleToken(token);

      // Create a mock user object
      const mockUser: User = {
        id: googleUser.sub,
        name: googleUser.name,
        email: googleUser.email,
        role: googleUser.email === 'oscartinga@gmail.com' ? 'admin' : 'trainee',
        status: 'approved',
        avatar: googleUser.picture,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Create a mock session token
      const mockToken = `mock_token_for_${googleUser.sub}`;
      
      authService.setToken(mockToken);
      setUser(mockUser);
      setIsAuthenticated(true);

      // Log the user's email to the console
      console.log('Logged in user email:', mockUser.email);

    } catch (error) {
      setError(error instanceof Error ? error.message : 'Google login failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Logout the current user
   */
  const logout = () => {
    authService.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  // Provide the auth context to children components
  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        register,
        loginWithGoogle,
        logout,
        isAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Custom hook to use the auth context
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};