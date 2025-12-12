'use client';

import { forwardRef, InputHTMLAttributes, ReactNode } from 'react';
import { clsx } from 'clsx';
import { X, Search } from 'lucide-react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  isLoading?: boolean;
  showClearButton?: boolean;
  onClear?: () => void;
  icon?: ReactNode | string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      label,
      error,
      isLoading = false,
      showClearButton = false,
      onClear,
      icon,
      type = 'text',
      ...props
    },
    ref
  ) => {
    const hasIcon = icon !== undefined;
    const defaultIcon = type === 'search' ? <Search className="h-4 w-4" /> : null;
    const iconToShow = icon || defaultIcon;

    const renderIcon = () => {
      if (!iconToShow) return null;
      if (typeof iconToShow === 'string') {
        return <span className="text-sm">{iconToShow}</span>;
      }
      return iconToShow;
    };

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={props.id}
            className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {hasIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-neutral-500 pointer-events-none">
              {renderIcon()}
            </div>
          )}
          <input
            ref={ref}
            type={type}
            className={clsx(
              'w-full rounded-lg border bg-white dark:bg-neutral-900 px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:border-accent-500',
              'transition-all duration-200',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'touch-manipulation',
              hasIcon && 'pl-9 sm:pl-10',
              showClearButton && props.value && 'pr-9 sm:pr-10',
              error
                ? 'border-error-500 focus-visible:ring-error-500'
                : 'border-neutral-300 dark:border-neutral-700 hover:border-neutral-400 dark:hover:border-neutral-600',
              className
            )}
            {...props}
          />
          {showClearButton && props.value && !isLoading && (
            <button
              type="button"
              onClick={onClear}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 rounded-sm min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Clear input"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        {error && (
          <p className="mt-1.5 text-sm text-error-500" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
