'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, SignupRequest } from '@/lib/api/auth';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'staff' | 'manager' | 'admin' | 'auditor';
  department: string;
}

interface UserContextType {
  currentUser: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (userData: SignupRequest) => Promise<boolean>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored JWT token on mount
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('userData');
    
    if (token && userData) {
      try {
        const user = JSON.parse(userData);
        setCurrentUser(user);
      } catch (error) {
        // Clear invalid stored data
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await authAPI.login({ email, password });
      
      if (response.success && response.data) {
        const { user, token } = response.data;
        
        // Store token and user data
        localStorage.setItem('authToken', token);
        localStorage.setItem('userData', JSON.stringify(user));
        
        // Ensure role is properly typed
        const typedUser: User = {
          ...user,
          role: user.role as 'staff' | 'manager' | 'admin' | 'auditor'
        };
        setCurrentUser(typedUser);
        return true;
      }
      
      throw new Error(response.error || 'Login failed');
    } catch (error: any) {
      throw new Error(error.message || 'Login failed');
    }
  };

  const signup = async (userData: SignupRequest): Promise<boolean> => {
    try {
      const response = await authAPI.signup(userData);
      
      if (response.success && response.data) {
        const { user, token } = response.data;
        
        // Store token and user data
        localStorage.setItem('authToken', token);
        localStorage.setItem('userData', JSON.stringify(user));
        
        // Ensure role is properly typed
        const typedUser: User = {
          ...user,
          role: user.role as 'staff' | 'manager' | 'admin' | 'auditor'
        };
        setCurrentUser(typedUser);
        return true;
      }
      
      throw new Error(response.error || 'Signup failed');
    } catch (error: any) {
      throw new Error(error.message || 'Signup failed');
    }
  };

  const logout = async (): Promise<void> => {
    try {
      const token = localStorage.getItem('authToken');
      
      if (token) {
        // Call logout API to invalidate token on server
        await authAPI.logout(token);
      }
    } catch (error) {
      // Continue with logout even if API call fails
      console.error('Logout API error:', error);
    } finally {
      // Clear local storage and state
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      setCurrentUser(null);
    }
  };

  const value: UserContextType = {
    currentUser,
    login,
    signup,
    logout,
    isAuthenticated: !!currentUser,
    isLoading
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};
