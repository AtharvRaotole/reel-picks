'use client';

import { useEffect, useState, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { clsx } from 'clsx';

/**
 * Toast types
 */
export type ToastType = 'success' | 'error' | 'info' | 'warning';

/**
 * Toast data structure
 */
export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number; // Auto-dismiss duration in ms (default: 3000)
}

/**
 * Toast Component Props
 */
interface ToastProps {
  toast: Toast;
  onDismiss: (id: string) => void;
}

/**
 * Individual Toast Component
 */
function ToastItem({ toast, onDismiss }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  /**
   * Handles dismissing the toast with exit animation
   */
  const handleDismiss = useCallback(() => {
    setIsExiting(true);
    // Wait for exit animation before removing
    setTimeout(() => {
      onDismiss(toast.id);
    }, 300);
  }, [toast.id, onDismiss]);

  useEffect(() => {
    // Trigger slide-in animation
    requestAnimationFrame(() => {
      setIsVisible(true);
    });

    // Auto-dismiss after specified duration
    const duration = toast.duration ?? 3000;
    const timer = setTimeout(() => {
      handleDismiss();
    }, duration);

    return () => clearTimeout(timer);
  }, [toast.duration, handleDismiss]);

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle className="h-5 w-5" />;
      case 'error':
        return <AlertCircle className="h-5 w-5" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5" />;
      case 'info':
      default:
        return <Info className="h-5 w-5" />;
    }
  };

  const getStyles = () => {
    switch (toast.type) {
      case 'success':
        return {
          bg: 'bg-success-500/10 border-success-500/30',
          text: 'text-neutral-900',
          icon: 'text-success-600',
        };
      case 'error':
        return {
          bg: 'bg-error-500/10 border-error-500/30',
          text: 'text-neutral-900',
          icon: 'text-error-600',
        };
      case 'warning':
        return {
          bg: 'bg-amber-500/10 border-amber-500/30',
          text: 'text-neutral-900',
          icon: 'text-amber-600',
        };
      case 'info':
      default:
        return {
          bg: 'bg-accent-500/10 border-accent-500/30',
          text: 'text-neutral-900',
          icon: 'text-accent-600',
        };
    }
  };

  const styles = getStyles();

  return (
    <div
      className={clsx(
        'flex items-start gap-2 sm:gap-3 p-3 sm:p-4 rounded-lg border backdrop-blur-sm',
        'w-[calc(100vw-2rem)] sm:min-w-[300px] sm:max-w-md',
        'transform transition-all duration-300 ease-out',
        styles.bg,
        isVisible && !isExiting
          ? 'translate-y-0 opacity-100'
          : 'translate-y-[-100%] opacity-0',
        isExiting && 'translate-y-[-100%] opacity-0'
      )}
      role="alert"
      aria-live="polite"
    >
      {/* Icon */}
      <div className={clsx('flex-shrink-0', styles.icon)}>{getIcon()}</div>

      {/* Message */}
      <p className={clsx('flex-1 text-xs sm:text-sm font-medium leading-relaxed text-neutral-900', styles.text)}>
        {toast.message}
      </p>

      {/* Close Button */}
      <button
        onClick={handleDismiss}
        className={clsx(
          'flex-shrink-0 rounded-sm p-1.5 sm:p-1 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center',
          'hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent',
          styles.text,
          'focus:ring-accent-500 touch-manipulation'
        )}
        aria-label="Dismiss notification"
      >
        <X className="h-4 w-4 sm:h-5 sm:w-5" />
      </button>
    </div>
  );
}

/**
 * Toast Container Component
 */
export interface ToastContainerProps {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed top-2 sm:top-4 left-1/2 -translate-x-1/2 z-[1500] flex flex-col gap-2 pointer-events-none w-full max-w-[calc(100vw-1rem)] sm:max-w-none px-2 sm:px-0"
      aria-live="polite"
      aria-label="Notifications"
    >
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <ToastItem toast={toast} onDismiss={onDismiss} />
        </div>
      ))}
    </div>
  );
}

