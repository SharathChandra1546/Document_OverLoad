import React from 'react';
import { cn } from '@/utils/cn';

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  helperText?: string;
  variant?: 'default' | 'filled' | 'outlined';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  helperText,
  variant = 'default',
  size = 'md',
  fullWidth = false,
  startIcon,
  endIcon,
  className = '',
  id,
  ...props
}, ref) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
  
  const baseClasses = [
    'transition-all duration-200 ease-in-out',
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    'placeholder:text-text-muted',
    fullWidth && 'w-full'
  ].filter(Boolean).join(' ');
  
  const variantClasses = {
    default: [
      'border border-border-primary bg-background-primary text-text-primary',
      'hover:border-border-secondary',
      'focus-visible:border-primary-500 focus-visible:ring-primary-500/20',
      error && 'border-error-500 focus-visible:border-error-500 focus-visible:ring-error-500/20',
      'dark:border-border-primary dark:bg-background-primary dark:text-text-primary'
    ].filter(Boolean).join(' '),
    
    filled: [
      'border-0 bg-background-secondary text-text-primary',
      'hover:bg-background-tertiary',
      'focus-visible:bg-background-primary focus-visible:ring-primary-500/20',
      error && 'bg-error-50 focus-visible:ring-error-500/20',
      'dark:bg-background-secondary dark:text-text-primary',
      'dark:hover:bg-background-tertiary'
    ].filter(Boolean).join(' '),
    
    outlined: [
      'border-2 border-border-primary bg-transparent text-text-primary',
      'hover:border-border-secondary',
      'focus-visible:border-primary-500 focus-visible:ring-primary-500/20',
      error && 'border-error-500 focus-visible:border-error-500 focus-visible:ring-error-500/20',
      'dark:border-border-primary dark:text-text-primary'
    ].filter(Boolean).join(' ')
  };
  
  const sizeClasses = {
    sm: 'px-3 py-2 text-sm rounded-md',
    md: 'px-4 py-2.5 text-sm rounded-lg',
    lg: 'px-4 py-3 text-base rounded-lg'
  };
  
  const iconPadding = {
    sm: {
      start: startIcon ? 'pl-9' : '',
      end: endIcon ? 'pr-9' : ''
    },
    md: {
      start: startIcon ? 'pl-10' : '',
      end: endIcon ? 'pr-10' : ''
    },
    lg: {
      start: startIcon ? 'pl-12' : '',
      end: endIcon ? 'pr-12' : ''
    }
  };
  
  const iconSizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };
  
  const iconPositionClasses = {
    sm: {
      start: 'left-3',
      end: 'right-3'
    },
    md: {
      start: 'left-3',
      end: 'right-3'
    },
    lg: {
      start: 'left-4',
      end: 'right-4'
    }
  };
  
  const inputClasses = cn(
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    iconPadding[size].start,
    iconPadding[size].end,
    className
  );
  
  return (
    <div className={cn('relative', fullWidth && 'w-full')}>
      {label && (
        <label 
          htmlFor={inputId}
          className={cn(
            'block text-sm font-medium mb-2',
            error ? 'text-error-600 dark:text-error-400' : 'text-text-primary'
          )}
        >
          {label}
        </label>
      )}
      
      <div className="relative">
        {startIcon && (
          <div className={cn(
            'absolute top-1/2 -translate-y-1/2 text-text-muted pointer-events-none',
            iconPositionClasses[size].start
          )}>
            <div className={iconSizeClasses[size]}>
              {startIcon}
            </div>
          </div>
        )}
        
        <input
          ref={ref}
          id={inputId}
          className={inputClasses}
          {...props}
        />
        
        {endIcon && (
          <div className={cn(
            'absolute top-1/2 -translate-y-1/2 text-text-muted pointer-events-none',
            iconPositionClasses[size].end
          )}>
            <div className={iconSizeClasses[size]}>
              {endIcon}
            </div>
          </div>
        )}
      </div>
      
      {(error || helperText) && (
        <p className={cn(
          'mt-2 text-sm',
          error ? 'text-error-600 dark:text-error-400' : 'text-text-muted'
        )}>
          {error || helperText}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;