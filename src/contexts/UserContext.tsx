'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '@/data/mockData';

interface UserContextType {
  currentUser: User | null;
  login: (role: UserRole) => void;
  logout: () => void;
  isAuthenticated: boolean;
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

  useEffect(() => {
    // Check for stored user session on mount
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
  }, []);

  const login = (role: UserRole) => {
    // Mock login - in real app, this would be an API call
    const mockUser: User = {
      id: '1',
      name: `Mock ${role}`,
      email: `mock.${role.toLowerCase()}@company.com`,
      department: role === 'Admin' ? 'IT' : role === 'Engineer' ? 'Engineering' : 'Operations',
      role: role
    };
    
    setCurrentUser(mockUser);
    localStorage.setItem('currentUser', JSON.stringify(mockUser));
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
  };

  const value: UserContextType = {
    currentUser,
    login,
    logout,
    isAuthenticated: !!currentUser
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};
