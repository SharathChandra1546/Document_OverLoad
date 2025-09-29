'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';

import { cn } from '@/utils/cn';
import ThemeToggle from '@/components/ui/ThemeToggle';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';

interface NavigationProps {
  className?: string;
}

const Navigation: React.FC<NavigationProps> = ({ className = '' }) => {
  const pathname = usePathname();
  const { currentUser, logout, isAuthenticated } = useUser();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (!isAuthenticated) {
    return (
      <nav className={cn('flex items-center justify-between p-4 bg-background border-b', className)}>
        {/* Logo */}
        <Link href="/" className="text-xl font-bold">
          DM
        </Link>
        <div className="flex items-center space-x-4">
          <ThemeToggle />
          <Link href="/signin">
            <Button variant="outline">Sign In</Button>
          </Link>
          <Link href="/signup">
            <Button>Sign Up</Button>
          </Link>
        </div>
      </nav>
    );
  }

  return (
    <nav className={cn('flex items-center justify-between p-4 bg-background border-b', className)}>
      {/* Logo */}
      <Link href="/" className="text-xl font-bold">
        DM
      </Link>
      
      <div className="flex items-center space-x-4">
        <ThemeToggle />
        
        {/* User menu */}
        <div className="relative">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="flex items-center rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            aria-label="Toggle user menu"
          >
            <span className="sr-only">Open user menu</span>
            <div className="w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold uppercase">
              {currentUser?.name?.charAt(0) || 'U'}
            </div>
          </button>

          {isMobileMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-card border border-border rounded-lg shadow-lg z-50">
              <div className="p-4 border-b border-border bg-card">
                <p className="text-sm font-semibold text-card-foreground">{currentUser?.name?.toUpperCase()}</p>
                <p className="text-xs font-medium text-muted-foreground">{currentUser?.email}</p>
                {currentUser?.role === 'admin' && (
                  <Badge variant="destructive" className="mt-2">
                    Admin
                  </Badge>
                )}
              </div>
              <div className="p-2 bg-card">
                <Button
                  onClick={logout}
                  variant="destructive"
                  className="w-full rounded-lg px-4 py-2 transition-transform duration-200 ease-in-out transform hover:scale-105 hover:brightness-110 hover:shadow-lg hover:shadow-red-500/50"
                >
                  Sign Out
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
