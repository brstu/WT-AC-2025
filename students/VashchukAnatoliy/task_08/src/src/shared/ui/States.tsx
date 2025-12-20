import { forwardRef, type ReactNode, type HTMLAttributes } from 'react';
import { cn } from '../lib/utils';
import { Button } from './Button';

/* =====================
   Loading Spinner
===================== */

interface LoadingSpinnerProps extends HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg';
}

const LoadingSpinner = forwardRef<HTMLDivElement, LoadingSpinnerProps>(
  ({ size = 'md', className, ...props }, ref) => {
    const sizes = {
      sm: 'h-4 w-4',
      md: 'h-8 w-8',
      lg: 'h-12 w-12',
    };

    return (
      <div
        ref={ref}
        role="status"
        aria-live="polite"
        className={cn('flex items-center justify-center', className)}
        {...props}
      >
        <svg
          aria-hidden="true"
          className={cn('animate-spin text-primary', sizes[size])}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      </div>
    );
  }
);
LoadingSpinner.displayName = 'LoadingSpinner';

/* =====================
   Loading State
===================== */

interface LoadingStateProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
}

const LoadingState = forwardRef<HTMLDivElement, LoadingStateProps>(
  ({ children, className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'flex flex-col items-center justify-center p-8 text-muted-foreground',
        className
      )}
      {...props}
    >
      <LoadingSpinner size="lg" />
      {children && <p className="mt-4 text-sm">{children}</p>}
    </div>
  )
);
LoadingState.displayName = 'LoadingState';

/* =====================
   Error State
===================== */

interface ErrorStateProps extends HTMLAttributes<HTMLDivElement> {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

const ErrorState = forwardRef<HTMLDivElement, ErrorStateProps>(
  (
    {
      title = 'Something went wrong',
      message,
      onRetry,
      className,
      ...props
    },
    ref
  ) => (
    <div
      ref={ref}
      className={cn(
        'flex flex-col items-center justify-center p-8 text-center',
        className
      )}
      {...props}
    >
      <div className="mb-4 rounded-full bg-destructive/10 p-3">
        <svg
          aria-hidden="true"
          className="h-6 w-6 text-destructive"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>

      <h3 className="mb-2 text-lg font-semibold text-foreground">
        {title}
      </h3>

      {message && (
        <p className="mb-4 text-muted-foreground">{message}</p>
      )}

      {onRetry && (
        <Button variant="outline" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  )
);
ErrorState.displayName = 'ErrorState';

/* =====================
   Empty State
===================== */

interface EmptyStateProps extends HTMLAttributes<HTMLDivElement> {
  title?: string;
  message?: string;
  action?: ReactNode;
}

const EmptyState = forwardRef<HTMLDivElement, EmptyStateProps>(
  (
    {
      title = 'No data found',
      message,
      action,
      className,
      ...props
    },
    ref
  ) => (
    <div
      ref={ref}
      className={cn(
        'flex flex-col items-center justify-center p-8 text-center',
        className
      )}
      {...props}
    >
      <div className="mb-4 rounded-full bg-muted p-3">
        <svg
          aria-hidden="true"
          className="h-6 w-6 text-muted-foreground"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
          />
        </svg>
      </div>

      <h3 className="mb-2 text-lg font-semibold text-foreground">
        {title}
      </h3>

      {message && (
        <p className="mb-4 text-muted-foreground">{message}</p>
      )}

      {action && action}
    </div>
  )
);
EmptyState.displayName = 'EmptyState';

export {
  LoadingSpinner,
  LoadingState,
  ErrorState,
  EmptyState,
};
