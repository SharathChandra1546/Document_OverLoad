import React from 'react';
import { cn } from '@/utils/cn';

interface AlertProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  icon?: React.ReactNode;
  onClose?: () => void;
  closable?: boolean;
}

const Alert: React.FC<AlertProps> = ({
  children,
  variant = 'default',
  size = 'md',
  className = '',
  icon,
  onClose,
  closable = false
}) => {
  const baseClasses = [
    'relative rounded-lg border transition-all duration-200 ease-in-out',
    'flex items-start gap-3'
  ].join(' ');
  
  const variantClasses = {
    default: [
      'bg-secondary-50 border-secondary-200 text-secondary-800',
      'dark:bg-secondary-900/50 dark:border-secondary-700 dark:text-secondary-200'
    ].join(' '),
    
    success: [
      'bg-success-50 border-success-200 text-success-800',
      'dark:bg-success-900/50 dark:border-success-700 dark:text-success-200'
    ].join(' '),
    
    warning: [
      'bg-warning-50 border-warning-200 text-warning-800',
      'dark:bg-warning-900/50 dark:border-warning-700 dark:text-warning-200'
    ].join(' '),
    
    error: [
      'bg-error-50 border-error-200 text-error-800',
      'dark:bg-error-900/50 dark:border-error-700 dark:text-error-200'
    ].join(' '),
    
    info: [
      'bg-info-50 border-info-200 text-info-800',
      'dark:bg-info-900/50 dark:border-info-700 dark:text-info-200'
    ].join(' ')
  };
  
  const sizeClasses = {
    sm: 'p-3 text-sm',
    md: 'p-4 text-sm',
    lg: 'p-6 text-base'
  };
  
  const iconColorClasses = {
    default: 'text-secondary-600 dark:text-secondary-400',
    success: 'text-success-600 dark:text-success-400',
    warning: 'text-warning-600 dark:text-warning-400',
    error: 'text-error-600 dark:text-error-400',
    info: 'text-info-600 dark:text-info-400'
  };
  
  const defaultIcons = {
    success: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
    ),
    warning: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
      </svg>
    ),
    error: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
      </svg>
    ),
    info: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
      </svg>
    )
  };
  
  const alertClasses = cn(
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    className
  );
  
  const displayIcon = icon || (variant !== 'default' ? defaultIcons[variant as keyof typeof defaultIcons] : null);
  
  return (
    <div className={alertClasses} role="alert">
      {displayIcon && (
        <div className={cn('flex-shrink-0 mt-0.5', iconColorClasses[variant])}>
          {displayIcon}
        </div>
      )}
      
      <div className="flex-1 min-w-0">
        {children}
      </div>
      
      {(closable || onClose) && (
        <button
          type="button"
          onClick={onClose}
          className={cn(
            'flex-shrink-0 ml-2 p-1 rounded-md transition-colors duration-200',
            'hover:bg-black/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1',
            iconColorClasses[variant],
            'dark:hover:bg-white/5'
          )}
          aria-label="Close alert"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      )}
    </div>
  );
};

export default Alert;