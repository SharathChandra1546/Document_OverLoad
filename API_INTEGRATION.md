# API Integration Guide (Updated)

This app currently runs fully client-side for uploads, recent documents, and search. There is no backend persistence. Endpoints listed below are future-facing REST-style names to standardize integration.

Planned REST endpoints:

- GET /api/documents
- POST /api/documents
- GET /api/documents/{id}
- DELETE /api/documents/{id}
- GET /api/search?query=...

Payloads

- POST /api/documents
  - Content-Type: multipart/form-data
  - Fields:
    - file: binary
    - metadata (optional): JSON string with fields like title, tags, expiryDate

- GET /api/documents response item shape
  - id: string
  - title: string
  - uploadedAt: string (ISO)
  - fileType: string
  - size: string
  - status: string

Note: Until a backend exists, the UI uses localStorage-backed Recent Documents and client-side search.

This document outlines how to replace the mock data and functionality with real API integrations for the DocuMind AI document management platform.

## Overview

The current implementation uses mock data and simulated API calls. To integrate with real backend services, you'll need to replace the mock implementations with actual API calls.

## File Structure

```
src/
├── data/
│   └── mockData.ts          # Replace with API service calls
├── contexts/
│   └── UserContext.tsx      # Update with real authentication
├── components/
│   ├── auth/
│   │   └── LoginForm.tsx    # Replace with real auth API
│   ├── dashboard/
│   │   └── Dashboard.tsx    # Replace with real data fetching
│   ├── upload/
│   │   └── UploadPage.tsx   # Replace with real file upload API
│   ├── search/
│   │   └── SearchPage.tsx   # Replace with real search API
│   ├── document/
│   │   └── DocumentPreview.tsx # Replace with real document API
│   ├── compliance/
│   │   └── ComplianceTracker.tsx # Replace with real compliance API
│   └── admin/
│       └── AdminManagement.tsx # Replace with real user management API
```

## API Endpoints to Implement

### Authentication
```
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me
POST /api/auth/refresh
```

### Documents
```
GET    /api/documents
POST   /api/documents
GET    /api/documents/:id
PUT    /api/documents/:id
DELETE /api/documents/:id
POST   /api/documents/upload
GET    /api/documents/:id/ocr
```

### Search
```
GET /api/search?q={query}&filters={filters}
POST /api/search/advanced
```

### Compliance
```
GET    /api/compliance
POST   /api/compliance
GET    /api/compliance/:id
PUT    /api/compliance/:id
DELETE /api/compliance/:id
```

### Users (Admin only)
```
GET    /api/users
POST   /api/users
GET    /api/users/:id
PUT    /api/users/:id
DELETE /api/users/:id
PUT    /api/users/:id/role
```

## Step-by-Step Integration

### 1. Create API Service Layer

Create `src/services/api.ts`:

```typescript
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

class ApiService {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.token = localStorage.getItem('auth_token');
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers,
      },
    };

    const response = await fetch(url, config);
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // Authentication methods
  async login(credentials: { email: string; password: string }) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async logout() {
    return this.request('/auth/logout', { method: 'POST' });
  }

  async getCurrentUser() {
    return this.request('/auth/me');
  }

  // Document methods
  async getDocuments(params?: { page?: number; limit?: number }) {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());
    
    return this.request(`/documents?${query}`);
  }

  async uploadDocument(file: File, metadata: any) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('metadata', JSON.stringify(metadata));

    return this.request('/documents/upload', {
      method: 'POST',
      headers: {}, // Remove Content-Type header for FormData
      body: formData,
    });
  }

  async getDocument(id: string) {
    return this.request(`/documents/${id}`);
  }

  // Search methods
  async searchDocuments(query: string, filters?: any) {
    const params = new URLSearchParams({ q: query });
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        params.append(key, value.toString());
      });
    }
    
    return this.request(`/search?${params}`);
  }

  // Compliance methods
  async getComplianceItems(params?: any) {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        query.append(key, value.toString());
      });
    }
    
    return this.request(`/compliance?${query}`);
  }

  async updateComplianceItem(id: string, updates: any) {
    return this.request(`/compliance/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  // User management methods
  async getUsers(params?: any) {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        query.append(key, value.toString());
      });
    }
    
    return this.request(`/users?${query}`);
  }

  async updateUserRole(id: string, role: string) {
    return this.request(`/users/${id}/role`, {
      method: 'PUT',
      body: JSON.stringify({ role }),
    });
  }
}

export const apiService = new ApiService(API_BASE_URL);
```

### 2. Update User Context

Replace the mock authentication in `src/contexts/UserContext.tsx`:

```typescript
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiService } from '@/services/api';

interface User {
  id: string;
  name: string;
  email: string;
  department: string;
  role: string;
}

interface UserContextType {
  currentUser: User | null;
  login: (email: string, password: string) => Promise<void>;
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
    // Check for stored authentication on mount
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        if (token) {
          const user = await apiService.getCurrentUser();
          setCurrentUser(user);
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error);
        apiService.clearToken();
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await apiService.login({ email, password });
      apiService.setToken(response.token);
      setCurrentUser(response.user);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await apiService.logout();
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      apiService.clearToken();
      setCurrentUser(null);
    }
  };

  const value: UserContextType = {
    currentUser,
    login,
    logout,
    isAuthenticated: !!currentUser,
    isLoading
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};
```

### 3. Update Login Form

Replace the role selection with real login in `src/components/auth/LoginForm.tsx`:

```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';
import Button from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login } = useUser();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (error) {
      setError('Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm">{error}</div>
          )}

          <Button
            type="submit"
            isLoading={isLoading}
            disabled={!email || !password}
            className="w-full"
          >
            Login
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default LoginForm;
```

### 4. Update Components with Real Data

For each component, replace mock data calls with API service calls:

#### Dashboard Component
```typescript
// Replace mock data imports
import { apiService } from '@/services/api';

// In the component, use useEffect to fetch data
useEffect(() => {
  const fetchDashboardData = async () => {
    try {
      const [documents, complianceItems] = await Promise.all([
        apiService.getDocuments({ limit: 3 }),
        apiService.getComplianceItems({ status: 'pending', limit: 3 })
      ]);
      setRecentDocuments(documents);
      setPendingCompliance(complianceItems);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    }
  };

  fetchDashboardData();
}, []);
```

#### Upload Component
```typescript
const handleFileUpload = async (file: File, metadata: any) => {
  setIsProcessing(true);
  try {
    const response = await apiService.uploadDocument(file, metadata);
    setUploadedFile(response);
  } catch (error) {
    console.error('Upload failed:', error);
    setError('Upload failed. Please try again.');
  } finally {
    setIsProcessing(false);
  }
};
```

#### Search Component
```typescript
const handleSearch = async () => {
  if (!query.trim()) return;

  setIsSearching(true);
  try {
    const results = await apiService.searchDocuments(query, {
      language: selectedLanguage,
      dateRange: selectedDateRange
    });
    setSearchResults(results);
  } catch (error) {
    console.error('Search failed:', error);
    setError('Search failed. Please try again.');
  } finally {
    setIsSearching(false);
  }
};
```

## Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_APP_ENV=development
```

## Error Handling

Implement proper error handling throughout the application:

```typescript
// Create src/utils/errorHandler.ts
export const handleApiError = (error: any) => {
  if (error.response?.status === 401) {
    // Redirect to login
    window.location.href = '/';
  } else if (error.response?.status === 403) {
    // Show permission denied message
    return 'You do not have permission to perform this action';
  } else if (error.response?.status >= 500) {
    // Show server error message
    return 'Server error. Please try again later.';
  } else {
    // Show generic error message
    return 'An unexpected error occurred';
  }
};
```

## Loading States

Add loading states to improve user experience:

```typescript
const [isLoading, setIsLoading] = useState(false);

// In components
{isLoading ? (
  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
) : (
  // Your content
)}
```

## Testing

Create API integration tests:

```typescript
// src/__tests__/api.test.ts
import { apiService } from '@/services/api';

describe('API Service', () => {
  test('should login successfully', async () => {
    const credentials = { email: 'test@example.com', password: 'password' };
    const response = await apiService.login(credentials);
    expect(response.token).toBeDefined();
    expect(response.user).toBeDefined();
  });
});
```

## Deployment Considerations

1. **CORS Configuration**: Ensure your backend allows requests from your frontend domain
2. **Environment Variables**: Set production API URLs in your deployment environment
3. **Error Monitoring**: Integrate with services like Sentry for error tracking
4. **Performance**: Implement caching strategies for frequently accessed data
5. **Security**: Ensure all API endpoints use HTTPS in production

## Migration Checklist

- [ ] Replace mock data imports with API service calls
- [ ] Update authentication flow with real login/logout
- [ ] Implement proper error handling
- [ ] Add loading states to all data-fetching components
- [ ] Update file upload to use real backend
- [ ] Replace search functionality with real search API
- [ ] Update compliance tracking with real data
- [ ] Implement real user management for admin
- [ ] Add environment variable configuration
- [ ] Test all API integrations
- [ ] Deploy with proper CORS and security settings

This guide provides a comprehensive roadmap for replacing the mock implementation with real API integrations while maintaining the existing UI and user experience.
