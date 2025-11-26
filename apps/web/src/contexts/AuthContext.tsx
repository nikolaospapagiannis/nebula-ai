'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/api';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  role: string;
  organizationId: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  organizationName?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      // First, immediately check localStorage to populate user state
      // This prevents flashing login screens during navigation
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        try {
          const cachedUser = JSON.parse(savedUser);
          setUser(cachedUser); // Set immediately from cache
        } catch (e) {
          localStorage.removeItem('user');
        }
      }

      // Then verify with API in the background
      const userInfo = apiClient.getUserInfo();

      if (userInfo || savedUser) {
        try {
          const currentUser = await apiClient.getCurrentUser();
          setUser(currentUser);
          localStorage.setItem('user', JSON.stringify(currentUser));
        } catch (error) {
          // Token invalid or expired, clear auth
          console.error('Token validation failed:', error);
          setUser(null);
          localStorage.removeItem('user');
        }
      } else {
        // No cached user and no cookie
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      // Don't clear user on network errors
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await apiClient.login(email, password);
      const userData = response.user;

      // Save user data
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));

      // Note: Do NOT redirect here - let the calling component handle the redirect
      // This allows more flexibility (e.g., redirect to onboarding, dashboard, etc.)
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const register = async (data: RegisterData) => {
    try {
      const response = await apiClient.register(data);
      const userData = response.user;

      // Save user data
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));

      // Note: Do NOT redirect here - let the calling component handle the redirect
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await apiClient.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      localStorage.removeItem('user');
      // Redirect to login after logout
      router.push('/login');
    }
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
