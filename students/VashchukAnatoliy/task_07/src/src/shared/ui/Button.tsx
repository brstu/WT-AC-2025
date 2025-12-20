import React, { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '../lib/utils';

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  asChild?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      loading = false,
      disabled,
      children,
      asChild = false,
      type = 'button',
      ...props
    },
    ref
  ) => {
    const base =
      'inline-flex items-center justify-center gap-2 rounded-lg font-medium border ' +
      'transition-[transform,background-color,border-color,box-shadow] duration-150 ease-out ' +
      'hover:-translate-y-[1px] hover:shadow-md ' +
      'active:translate-y-0 active:scale-[0.98] ' +
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ' +
      'disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none disabled:transform-none';

    const variants = {
      primary:
        'bg-primary text-primary-foreground border-primary/40 ' +
        'hover:bg-primary/90 hover:border-primary',

      secondary:
        'bg-secondary text-secondary-foreground border-border ' +
        'hover:bg-secondary/80',

      outline:
        'bg-background text-foreground border-border ' +
        'hover:bg-accent hover:text-accent-foreground',

      ghost:
        'bg-transparent text-foreground border-transparent ' +
        'hover:bg-accent hover:border-border',

      destructive:
        'bg-destructive text-destructive-foreground border-destructive/40 ' +
        'hover:bg-destructive/90 hover:border-destructive',
    };

    const sizes = {
      sm: 'h-8 px-3 text-xs',
      md: 'h-9 px-4 text-sm',
      lg: 'h-10 px-6 text-base',
    };

    const buttonClassName = cn(
      base,
      variants[variant],
      sizes[size],
      className
    );

    if (
      asChild &&
      React.isValidElement<{ className?: string }>(children)
    ) {
      return React.cloneElement(children, {
        className: cn(buttonClassName, children.props.className),
      });
    }

    return (
      <button
        ref={ref}
        type={type}
        className={buttonClassName}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
export { Button };
