/**
 * Custom hook for authentication state management
 * Provides login, signup, logout, and auth state to components
 */

'use client';

import { useState, useCallback, useEffect } from 'react';
import { login as apiLogin, signup as apiSignup, setAuthToken } from '@/lib/api';
import {
  saveToken,
  getToken,
  saveUserEmail,
  saveCampaigns,
  logout as clearAuth,
  getCurrentUser,
} from '@/lib/auth';

interface User {
  email: string;
  campaigns: any[];
}

interface UseAuthReturn {
  isLoggedIn: boolean;
  isLoading: boolean;
  user: User | null;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

export const useAuth = (): UseAuthReturn => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Initialize auth state from localStorage on mount
  useEffect(() => {
    const token = getToken();
    const currentUser = getCurrentUser();

    if (token && currentUser) {
      setAuthToken(token);
      setUser(currentUser);
      setIsLoggedIn(true);
    }

    setIsLoading(false);
  }, []);

  const login = useCallback(
    async (email: string, password: string): Promise<void> => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await apiLogin({ email, password });

        // Save auth data
        saveToken(response.user_id);
        saveUserEmail(response.email);
        saveCampaigns(response.campaigns);

        // Set auth token in API client
        setAuthToken(response.user_id);

        // Update state
        setUser({
          email: response.email,
          campaigns: response.campaigns,
        });
        setIsLoggedIn(true);
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.detail || 'Login failed. Please try again.';
        setError(errorMessage);
        setIsLoggedIn(false);
        throw new Error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const signup = useCallback(
    async (email: string, password: string): Promise<void> => {
      setIsLoading(true);
      setError(null);

      try {
        await apiSignup({ email, password });

        // After successful signup, automatically log in
        await login(email, password);
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.detail || 'Signup failed. Please try again.';
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [login]
  );

  const logout = useCallback((): void => {
    clearAuth();
    setAuthToken(null);
    setUser(null);
    setIsLoggedIn(false);
    setError(null);
  }, []);

  const clearError = useCallback((): void => {
    setError(null);
  }, []);

  return {
    isLoggedIn,
    isLoading,
    user,
    error,
    login,
    signup,
    logout,
    clearError,
  };
};
