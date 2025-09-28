import React from 'react';
import { cn } from '@/utils/cn';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(({ 
  className, 
  ...props 
}, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        'animate-shimmer rounded-md bg-muted',
        className
      )}
      {...props}
    />
  );
});

Skeleton.displayName = 'Skeleton';

// Preset skeleton components for common use cases
const SkeletonCard: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('space-y-3', className)}>
    <Skeleton className="h-4 w-3/4" />
    <Skeleton className="h-4 w-1/2" />
    <Skeleton className="h-20 w-full" />
  </div>
);

const SkeletonAvatar: React.FC<{ className?: string }> = ({ className }) => (
  <Skeleton className={cn('h-10 w-10 rounded-full', className)} />
);

const SkeletonButton: React.FC<{ className?: string }> = ({ className }) => (
  <Skeleton className={cn('h-10 w-24 rounded-md', className)} />
);

const SkeletonText: React.FC<{ lines?: number; className?: string }> = ({ 
  lines = 3, 
  className 
}) => (
  <div className={cn('space-y-2', className)}>
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton 
        key={i} 
        className={cn(
          'h-4',
          i === lines - 1 ? 'w-3/4' : 'w-full'
        )} 
      />
    ))}
  </div>
);

export { Skeleton, SkeletonCard, SkeletonAvatar, SkeletonButton, SkeletonText };