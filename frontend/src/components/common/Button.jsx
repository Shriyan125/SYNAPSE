import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '../../utils/cn.js';
import { Loader2 } from 'lucide-react';

export const Button = React.forwardRef(
  (
    {
      to,
      as: Component,
      children,
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      disabled = false,
      fullWidth = false,
      type = 'button',
      leftIcon,
      rightIcon,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium transition-all duration-150 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]';

    const variants = {
      primary:
        'bg-primary-600 hover:bg-primary-700 text-white shadow-sm shadow-primary-500/20 focus:ring-primary-500 dark:bg-primary-500 dark:hover:bg-primary-600',
      secondary:
        'bg-slate-100 hover:bg-slate-200 text-slate-800 focus:ring-slate-400 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-100',
      outline:
        'border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 focus:ring-slate-400',
      danger:
        'bg-rose-600 hover:bg-rose-700 text-white shadow-sm shadow-rose-500/20 focus:ring-rose-500',
      ghost:
        'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 focus:ring-slate-400',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-xs gap-1.5',
      md: 'px-4 py-2 text-sm gap-2',
      lg: 'px-5 py-2.5 text-base gap-2.5',
    };

    const classes = cn(
      baseStyles,
      variants[variant],
      sizes[size],
      fullWidth && 'w-full',
      className
    );

    const innerContent = (
      <>
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin shrink-0" />
        ) : (
          leftIcon && <span className="shrink-0">{leftIcon}</span>
        )}
        <span>{children}</span>
        {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </>
    );

    if (to) {
      return (
        <Link ref={ref} to={to} className={classes} {...props}>
          {innerContent}
        </Link>
      );
    }

    if (Component) {
      const Tag = Component;
      return (
        <Tag ref={ref} className={classes} {...props}>
          {innerContent}
        </Tag>
      );
    }

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        className={classes}
        {...props}
      >
        {innerContent}
      </button>
    );
  }
);

Button.displayName = 'Button';
