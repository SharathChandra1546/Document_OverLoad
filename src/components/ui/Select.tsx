import React from 'react';
import { cn } from '@/utils/cn';

interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  label?: string;
  error?: string;
  helperText?: string;
  options: SelectOption[];
  placeholder?: string;
  variant?: 'default' | 'filled' | 'outlined';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(({
  label,
  error,
  helperText,
  options,
  placeholder,
  variant = 'default',
  size = 'md',
  fullWidth = false,
  className = '',
  id,
  ...props
}, ref) => {
  const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;
  
  const baseClasses = [
    'transition-all duration-200 ease-in-out',
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    'appearance-none cursor-pointer',
    'bg-no-repeat bg-right',
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
    sm: 'px-3 py-2 pr-8 text-sm rounded-md',
    md: 'px-4 py-2.5 pr-10 text-sm rounded-lg',
    lg: 'px-4 py-3 pr-12 text-base rounded-lg'
  };
  
  const selectClasses = cn(
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    className
  );
  
  // Chevron down icon as background image
  const chevronIcon = `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`;
  
  return (
    <div className={cn('relative', fullWidth && 'w-full')}>
      {label && (
        <label 
          htmlFor={selectId}
          className={cn(
            'block text-sm font-medium mb-2',
            error ? 'text-error-600 dark:text-error-400' : 'text-text-primary'
          )}
        >
          {label}
        </label>
      )}
      
      <div className="relative">
        <select
          ref={ref}
          id={selectId}
          className={selectClasses}
          style={{
            backgroundImage: chevronIcon,
            backgroundPosition: `right ${size === 'sm' ? '0.5rem' : size === 'md' ? '0.75rem' : '1rem'} center`,
            backgroundSize: '1.25rem 1.25rem'
          }}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option 
              key={option.value} 
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>
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

Select.displayName = 'Select';

export default Select;