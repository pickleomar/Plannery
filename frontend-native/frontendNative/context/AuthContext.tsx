import React, { createContext, useState, useEffect, useCallback, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import authService from '../services/authService';

interface User {
  id: number;
  username: string;
  email: string;
  // Add other user properties as needed
}

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  error: string | null;
  register: (userData: any) => Promise<any>;
  login: (credentials: any) => Promise<any>;
  logout: () => Promise<void>;
  clearError: () => void;
  isAuthenticated: () => Promise<boolean>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  useEffect(() => {
    const loadUser = async () => {
      try {
        setLoading(true);
        // Check if there's user data in AsyncStorage
        if (await authService.isAuthenticated()) {
          // Load the user profile
          const userData = await authService.getCurrentUser();
          setCurrentUser(userData);
        }
      } catch (err) {
        console.error('Failed to load user:', err);
        // Clear any invalid user data
        await AsyncStorage.removeItem('user');
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const register = async (userData: any) => {
    try {
      setLoading(true);
      setError(null);
      const response = await authService.register(userData);
      setCurrentUser(response.user);
      return response;
    } catch (err: any) {
      setError(err.message || 'Registration failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials: any) => {
    try {
      setLoading(true);
      setError(null);
      const response = await authService.login(credentials);
      setCurrentUser(response.user);
      return response;
    } catch (err: any) {
      setError(err.message || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      setError(null);
      await authService.logout();
      setCurrentUser(null);
    } catch (err: any) {
      setError(err.message || 'Logout failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        loading,
        error,
        register,
        login,
        logout,
        clearError,
        isAuthenticated: authService.isAuthenticated
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
