import React from 'react';
import { cn } from '@/utils/cn';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  variant?: 'default' | 'elevated' | 'outlined' | 'ghost';
}

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(({ 
  children, 
  className = '', 
  hover = false, 
  variant = 'default',
  ...props
}, ref) => {
  const baseClasses = [
    'rounded-lg border bg-card text-card-foreground shadow-sm',
    'transition-shadow',
    hover && 'hover:shadow-md cursor-pointer'
  ].filter(Boolean).join(' ');
  
  const variantClasses = {
    default: 'bg-card border-border',
    elevated: 'bg-card shadow-lg border-border/50',
    outlined: 'bg-background border-2 border-border',
    ghost: 'bg-muted/50 border-transparent shadow-none'
  };
  
  const classes = cn(
    baseClasses,
    variantClasses[variant],
    className
  );
  
  return (
    <div 
      ref={ref} 
      className={classes} 
      {...props}
    >
      {children}
    </div>
  );
});

const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(({ 
  children, 
  className = '', 
  ...props
}, ref) => {
  const classes = cn(
    'flex flex-col space-y-1.5 p-6',
    className
  );
  
  return (
    <div 
      ref={ref} 
      className={classes} 
      {...props}
    >
      {children}
    </div>
  );
});

const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(({ 
  children, 
  className = '', 
  ...props
}, ref) => {
  const classes = cn(
    'text-2xl font-semibold leading-none tracking-tight',
    className
  );
  
  return (
    <h3 
      ref={ref} 
      className={classes} 
      {...props}
    >
      {children}
    </h3>
  );
});

const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(({ 
  children, 
  className = '', 
  ...props
}, ref) => {
  const classes = cn(
    'text-sm text-muted-foreground',
    className
  );
  
  return (
    <p 
      ref={ref} 
      className={classes} 
      {...props}
    >
      {children}
    </p>
  );
});

const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(({ 
  children, 
  className = '', 
  ...props
}, ref) => {
  const classes = cn(
    'p-6 pt-0',
    className
  );
  
  return (
    <div 
      ref={ref} 
      className={classes} 
      {...props}
    >
      {children}
    </div>
  );
});

const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(({ 
  children, 
  className = '', 
  ...props
}, ref) => {
  const classes = cn(
    'flex items-center p-6 pt-0',
    className
  );
  
  return (
    <div 
      ref={ref} 
      className={classes} 
      {...props}
    >
      {children}
    </div>
  );
});

Card.displayName = 'Card';
CardHeader.displayName = 'CardHeader';
CardTitle.displayName = 'CardTitle';
CardDescription.displayName = 'CardDescription';
CardContent.displayName = 'CardContent';
CardFooter.displayName = 'CardFooter';

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };
