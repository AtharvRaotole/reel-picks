import { HTMLAttributes, forwardRef } from 'react';
import { clsx } from 'clsx';
import { Loader2 } from 'lucide-react';

export interface LoadingSpinnerProps extends HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'primary' | 'secondary' | 'accent';
  text?: string;
  fullScreen?: boolean;
}

const LoadingSpinner = forwardRef<HTMLDivElement, LoadingSpinnerProps>(
  (
    {
      className,
      size = 'md',
      variant = 'primary',
      text,
      fullScreen = false,
      ...props
    },
    ref
  ) => {
    const sizes = {
      sm: 'h-4 w-4',
      md: 'h-6 w-6',
      lg: 'h-8 w-8',
      xl: 'h-12 w-12',
    };

    const variants = {
      default: 'text-neutral-400',
      primary: 'text-primary-500',
      secondary: 'text-secondary-500',
      accent: 'text-accent-500',
    };

    const spinner = (
      <div
        ref={ref}
        className={clsx(
          'flex flex-col items-center justify-center gap-3',
          fullScreen && 'min-h-screen',
          className
        )}
        {...props}
      >
        <Loader2
          className={clsx(
            'animate-spin',
            sizes[size],
            variants[variant]
          )}
          aria-hidden="true"
        />
        {text && (
          <p className="text-sm font-medium text-neutral-400">{text}</p>
        )}
      </div>
    );

    if (fullScreen) {
      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/80 backdrop-blur-sm">
          {spinner}
        </div>
      );
    }

    return spinner;
  }
);

LoadingSpinner.displayName = 'LoadingSpinner';

export default LoadingSpinner;

