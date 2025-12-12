'use client';

import { useEffect, useState } from 'react';
import { useReminders, Reminder } from '@/app/lib/hooks/useReminders';
import { notificationService } from '@/app/lib/notificationService';
import { isNotificationDismissed } from '@/app/lib/hooks/useReminders';

/**
 * Component to handle reminder notifications and animations
 */
export default function ReminderNotificationProvider() {
  const { reminders } = useReminders();
  const [triggeredReminder, setTriggeredReminder] = useState<Reminder | null>(null);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const [showPermissionPrompt, setShowPermissionPrompt] = useState(false);

  // Check notification permission on mount
  useEffect(() => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return;
    }

    setNotificationPermission(Notification.permission);

    // Only show prompt if permission is default and not dismissed forever
    if (Notification.permission === 'default' && !isNotificationDismissed()) {
      // Delay showing prompt to avoid being too aggressive
      const timer = setTimeout(() => {
        setShowPermissionPrompt(true);
      }, 5000); // Show after 5 seconds

      return () => clearTimeout(timer);
    }
  }, []);

  // Handle reminder triggered callback for animation
  const handleReminderTriggered = (reminder: Reminder) => {
    setTriggeredReminder(reminder);
    
    // Remove animation state after animation completes
    setTimeout(() => {
      setTriggeredReminder(null);
    }, 2000);
  };

  // Start checking for reminders
  useEffect(() => {
    notificationService.startChecking(reminders, handleReminderTriggered);

    return () => {
      notificationService.stopChecking();
    };
  }, [reminders]);

  // Request notification permission
  const handleRequestPermission = async () => {
    const permission = await notificationService.requestPermission();
    setNotificationPermission(permission);
    setShowPermissionPrompt(false);
  };

  // Dismiss permission prompt forever
  const handleDismissPermission = () => {
    notificationService.dismissPermission();
    setShowPermissionPrompt(false);
  };

  return (
    <>
      {/* Permission Prompt */}
      {showPermissionPrompt && notificationPermission === 'default' && (
        <div className="fixed bottom-4 right-4 z-50 max-w-sm bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg shadow-lg p-4 animate-slide-up">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-accent-100 dark:bg-accent-900 rounded-full flex items-center justify-center">
                <span className="text-xl">🔔</span>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-neutral-900 dark:text-white mb-1">
                Enable Notifications?
              </h3>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-3">
                Get notified when it's time to watch your scheduled movies.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleRequestPermission}
                  className="px-3 py-1.5 text-xs font-medium bg-accent-500 text-white rounded-md hover:bg-accent-600 transition-colors"
                >
                  Enable
                </button>
                <button
                  onClick={handleDismissPermission}
                  className="px-3 py-1.5 text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
                >
                  Dismiss
                </button>
              </div>
            </div>
            <button
              onClick={handleDismissPermission}
              className="flex-shrink-0 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
              aria-label="Close"
            >
              <span className="text-lg">×</span>
            </button>
          </div>
        </div>
      )}

      {/* Reminder Triggered Animation */}
      {triggeredReminder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
          <div className="bg-accent-500/90 backdrop-blur-sm rounded-lg p-6 shadow-2xl animate-reminder-pulse max-w-sm mx-4">
            <div className="text-center text-white">
              <div className="text-4xl mb-2 animate-bounce">⏰</div>
              <h3 className="text-xl font-bold mb-1">Time to watch!</h3>
              <p className="text-lg">{triggeredReminder.movieTitle}</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
