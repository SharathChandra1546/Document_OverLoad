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

  const navigationItems: any[] = [];
  const adminItems: any[] = [];

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  if (!isAuthenticated) {
    return (
      <nav className={cn('bg-background border-b border-border', className)}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">DM</span>
              </div>
              <span className="text-xl font-bold text-foreground">DocuMind AI</span>
            </Link>

            {/* Theme Toggle */}
            <div className="flex items-center gap-4">
              <ThemeToggle size="sm" />
              <div className="flex items-center gap-2">
                <Link href="/login">
                  <Button variant="ghost" size="sm">Sign In</Button>
                </Link>
                <Link href="/signup">
                  <Button variant="default" size="sm">Sign Up</Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className={cn('bg-background border-b border-border shadow-sm', className)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">DM</span>
            </div>
            <span className="text-xl font-bold text-foreground">DocuMind AI</span>
          </Link>

          {/* Desktop Navigation - Removed duplicates, using sidebar instead */}
          <div className="hidden md:flex items-center gap-1">
            {/* Navigation moved to sidebar */}
          </div>

          {/* Right side - User menu and theme toggle */}
          <div className="flex items-center gap-3">
            <ThemeToggle size="sm" />
            
            {/* User Menu */}
            <div className="relative">
              <div className="flex items-center gap-3">
                <div className="hidden sm:block text-right">
                  <p className="text-sm font-medium text-foreground">{currentUser?.name}</p>
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-muted-foreground">{currentUser?.email}</p>
                    {currentUser?.role === 'admin' && (
                      <Badge variant="default" size="sm">Admin</Badge>
                    )}
                  </div>
                </div>
                
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-primary">
                    {currentUser?.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={logout}
                  className="text-muted-foreground hover:text-destructive"
                >
                  Sign Out
                </Button>
              </div>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              aria-label="Toggle mobile menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation - Removed, using sidebar for navigation */}
      </div>
    </nav>
  );
};

export default Navigation;