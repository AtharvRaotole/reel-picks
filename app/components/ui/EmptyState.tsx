'use client';

import { HTMLAttributes, ReactNode } from 'react';
import { clsx } from 'clsx';
import { Search, Film, AlertCircle, Heart, Info } from 'lucide-react';
import Button from './Button';

export interface EmptyStateProps extends HTMLAttributes<HTMLDivElement> {
  icon?: ReactNode | 'search' | 'film' | 'alert' | 'heart' | 'info';
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  variant?: 'default' | 'minimal';
}

const iconMap = {
  search: Search,
  film: Film,
  alert: AlertCircle,
  heart: Heart,
  info: Info,
} as const;

export default function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  variant = 'default',
  className,
  ...props
}: EmptyStateProps) {
  const renderIcon = () => {
    if (!icon) return null;

    if (typeof icon === 'string' && icon in iconMap) {
      const IconComponent = iconMap[icon as keyof typeof iconMap];
      return <IconComponent className="h-12 w-12 text-neutral-400" />;
    }

    if (typeof icon === 'object' && 'type' in icon) {
      return icon;
    }

    return null;
  };

  const iconElement = renderIcon();

  return (
    <div
      className={clsx(
        'flex flex-col items-center justify-center text-center py-12 px-4',
        variant === 'default' && 'rounded-lg bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800',
        className
      )}
      {...props}
    >
      {iconElement && (
        <div
          className={clsx(
            'mb-4 rounded-full p-3',
            variant === 'default'
              ? 'bg-white dark:bg-neutral-800 text-neutral-400 dark:text-neutral-500'
              : 'text-neutral-400 dark:text-neutral-500'
          )}
          aria-hidden="true"
        >
          {iconElement}
        </div>
      )}

      <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-2 font-sans">{title}</h3>

      {description && (
        <p className="text-sm text-neutral-700 dark:text-neutral-300 max-w-md mb-6 font-sans leading-relaxed">{description}</p>
      )}

      {actionLabel && onAction && (
        <Button variant="primary" onClick={onAction} size="sm">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
