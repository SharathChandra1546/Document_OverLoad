import React from 'react';
import { cn } from '@/utils/cn';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  variant?: 'default' | 'filled' | 'outlined';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  resize?: 'none' | 'vertical' | 'horizontal' | 'both';
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({
  label,
  error,
  helperText,
  variant = 'default',
  size = 'md',
  fullWidth = false,
  resize = 'vertical',
  className = '',
  id,
  ...props
}, ref) => {
  const textareaId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;
  
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
    sm: 'px-3 py-2 text-sm rounded-md min-h-[80px]',
    md: 'px-4 py-2.5 text-sm rounded-lg min-h-[100px]',
    lg: 'px-4 py-3 text-base rounded-lg min-h-[120px]'
  };
  
  const resizeClasses = {
    none: 'resize-none',
    vertical: 'resize-y',
    horizontal: 'resize-x',
    both: 'resize'
  };
  
  const textareaClasses = cn(
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    resizeClasses[resize],
    className
  );
  
  return (
    <div className={cn('relative', fullWidth && 'w-full')}>
      {label && (
        <label 
          htmlFor={textareaId}
          className={cn(
            'block text-sm font-medium mb-2',
            error ? 'text-error-600 dark:text-error-400' : 'text-text-primary'
          )}
        >
          {label}
        </label>
      )}
      
      <textarea
        ref={ref}
        id={textareaId}
        className={textareaClasses}
        {...props}
      />
      
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

Textarea.displayName = 'Textarea';

export default Textarea;