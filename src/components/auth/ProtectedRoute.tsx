'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Shield, AlertTriangle } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'staff' | 'manager' | 'admin' | 'auditor';
  allowedRoles?: ('staff' | 'manager' | 'admin' | 'auditor')[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole,
  allowedRoles 
}) => {
  const { currentUser, isAuthenticated, isLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }

    if (!isLoading && isAuthenticated && currentUser) {
      // Check role-based access
      if (requiredRole && currentUser.role !== requiredRole) {
        router.push('/dashboard'); // Redirect to dashboard if wrong role
        return;
      }

      if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
        router.push('/dashboard'); // Redirect to dashboard if role not allowed
        return;
      }
    }
  }, [isLoading, isAuthenticated, currentUser, requiredRole, allowedRoles, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center space-y-6">
          <div className="relative">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl mx-auto flex items-center justify-center shadow-lg">
              <Shield className="w-10 h-10 text-white animate-pulse" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur-xl opacity-30 animate-pulse"></div>
          </div>
          <div className="space-y-3">
            <LoadingSpinner size="lg" />
            <p className="text-gray-600 dark:text-gray-400 font-medium">
              Verifying your access...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  // Check role access
  if (currentUser) {
    if (requiredRole && currentUser.role !== requiredRole) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-100 dark:from-gray-900 dark:to-gray-800">
          <div className="text-center space-y-6 max-w-md mx-auto p-8">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-r from-red-500 to-pink-600 rounded-2xl mx-auto flex items-center justify-center shadow-lg">
                <AlertTriangle className="w-10 h-10 text-white" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-pink-600 rounded-2xl blur-xl opacity-30"></div>
            </div>
            <div className="space-y-3">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Access Denied</h2>
              <p className="text-gray-600 dark:text-gray-400">
                You don't have the required permissions to access this page.
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500">
                Required role: <span className="font-medium text-red-600 dark:text-red-400">{requiredRole}</span>
              </p>
            </div>
            <button
              onClick={() => router.push('/dashboard')}
              className="mt-6 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:-translate-y-0.5 shadow-lg hover:shadow-xl"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      );
    }

    if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-100 dark:from_gray-900 dark:to-gray-800">
          <div className="text-center space-y-6 max-w-md mx-auto p-8">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-r from-red-500 to-pink-600 rounded-2xl mx-auto flex items-center justify-center shadow-lg">
                <AlertTriangle className="w-10 h-10 text-white" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-pink-600 rounded-2xl blur-xl opacity-30"></div>
            </div>
            <div className="space-y-3">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Access Denied</h2>
              <p className="text-gray-600 dark:text-gray-400">
                You don't have the required permissions to access this page.
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500">
                Allowed roles: <span className="font-medium text-red-600 dark:text-red-400">{allowedRoles.join(', ')}</span>
              </p>
            </div>
            <button
              onClick={() => router.push('/dashboard')}
              className="mt-6 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:-translate-y-0.5 shadow-lg hover:shadow-xl"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      );
    }
  }

  return <>{children}</>;
};