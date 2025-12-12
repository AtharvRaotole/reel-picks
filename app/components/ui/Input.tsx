import { InputHTMLAttributes, forwardRef } from 'react';
import { clsx } from 'clsx';
import { Search, Loader2, X } from 'lucide-react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  isLoading?: boolean;
  showClearButton?: boolean;
  onClear?: () => void;
  icon?: React.ReactNode;
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
    const hasIcon = icon || type === 'search';

    const renderIcon = () => {
      if (isLoading) {
        return <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />;
      }
      if (type === 'search') {
        return <Search className="h-5 w-5" />;
      }
      if (icon) {
        return icon;
      }
      return null;
    };

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={props.id}
            className="block text-sm font-medium text-neutral-300 mb-2"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {hasIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none">
              {renderIcon()}
            </div>
          )}
          <input
            ref={ref}
            type={type}
            className={clsx(
              'w-full rounded-lg border bg-neutral-900 px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base text-white placeholder:text-neutral-500',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:border-transparent',
              'transition-all duration-200',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'touch-manipulation',
              hasIcon && 'pl-9 sm:pl-10',
              showClearButton && props.value && 'pr-9 sm:pr-10',
              error
                ? 'border-error-500 focus-visible:ring-error-500'
                : 'border-neutral-700 hover:border-neutral-600',
              className
            )}
            {...props}
          />
          {showClearButton && props.value && !isLoading && (
            <button
              type="button"
              onClick={onClear}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-accent-500 rounded-sm"
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

