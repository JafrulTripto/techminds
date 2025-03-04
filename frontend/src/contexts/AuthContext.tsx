import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthState } from '../types';
import authService from '../services/auth.service';
import userService from '../services/user.service';
import axios from 'axios';

// Define the context type
interface AuthContextType {
  authState: AuthState;
  login: (username: string, password: string) => Promise<void>;
  register: (phone: string, email: string, password: string, firstName: string, lastName: string) => Promise<void>;
  logout: () => void;
  loadUser: () => Promise<void>;
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Initial auth state
const initialAuthState: AuthState = {
  isAuthenticated: false,
  user: null,
  loading: true,
  error: null,
};

interface AuthProviderProps {
  children: ReactNode;
}

// Provider component
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>(initialAuthState);

  // Load user on mount
  useEffect(() => {
    const checkAuth = async () => {
      if (authService.isAuthenticated()) {
        try {
          await loadUser();
        } catch (error) {
          console.error('Failed to load user:', error);
          authService.logout();
          setAuthState({
            isAuthenticated: false,
            user: null,
            loading: false,
            error: 'Session expired. Please login again.',
          });
        }
      } else {
        setAuthState({
          ...initialAuthState,
          loading: false,
        });
      }
    };

    checkAuth();
  }, []);

  // Load user data
  const loadUser = async (): Promise<void> => {
    try {
      setAuthState(prev => ({ ...prev, loading: true }));
      const res = await userService.getCurrentUser();
      const user = res.data;
      console.log('User:', user);
      
      setAuthState({
        isAuthenticated: true,
        user,
        loading: false,
        error: null,
      });
    } catch (error) {
      setAuthState({
        isAuthenticated: false,
        user: null,
        loading: false,
        error: 'Failed to load user data',
      });
      throw error;
    }
  };

  // Login user
  const login = async (username: string, password: string): Promise<void> => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      await authService.login({ username, password });
      await loadUser();
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        setAuthState({
          isAuthenticated: false,
          user: null,
          loading: false,
          error: error.response?.data?.message || 'Login failed',
        });
      } else {
        setAuthState({
          isAuthenticated: false,
          user: null,
          loading: false,
          error: 'An unexpected error occurred',
        });
      }
      throw error;
    }
  };

  // Register user
  const register = async (phone: string, email: string, password: string, firstName: string, lastName: string): Promise<void> => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      await authService.register({ phone, email, password, firstName, lastName });
      setAuthState(prev => ({ ...prev, loading: false }));
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: 'Registration failed',
      }));
      throw error;
    }
  };

  // Logout user
  const logout = (): void => {
    authService.logout();
    setAuthState({
      isAuthenticated: false,
      user: null,
      loading: false,
      error: null,
    });
  };

  return (
    <AuthContext.Provider
      value={{
        authState,
        login,
        register,
        logout,
        loadUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
