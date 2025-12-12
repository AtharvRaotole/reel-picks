'use client';

import { useState, useEffect, useCallback } from 'react';
import { Movie } from '@/app/types/movie';

/**
 * Reminder data structure
 */
export interface Reminder {
  movieId: string | number;
  movieTitle: string;
  reminderTime: number; // Unix timestamp in milliseconds
  createdAt: number; // Unix timestamp when reminder was created
}

/**
 * Reminder option types
 */
export type ReminderOption = '1hour' | 'tonight' | 'tomorrow' | 'weekend' | 'custom';

/**
 * Return type for useReminders hook
 */
export interface UseRemindersReturn {
  reminders: Reminder[];
  isLoading: boolean;
  addReminder: (movieId: string | number, movieTitle: string, option: ReminderOption, customTime?: Date) => boolean;
  removeReminder: (movieId: string | number) => boolean;
  getReminder: (movieId: string | number) => Reminder | null;
  hasReminder: (movieId: string | number) => boolean;
  getUpcomingReminders: () => Reminder[];
  remindersCount: number;
}

/**
 * LocalStorage key for reminders
 */
const REMINDERS_STORAGE_KEY = 'movieReminders';
const NOTIFICATION_PERMISSION_KEY = 'notificationPermissionDismissed';

/**
 * Calculate reminder time based on option
 */
function calculateReminderTime(option: ReminderOption, customTime?: Date): number {
  const now = new Date();
  
  switch (option) {
    case '1hour':
      return now.getTime() + 60 * 60 * 1000; // 1 hour from now
    case 'tonight':
      const tonight = new Date(now);
      tonight.setHours(20, 0, 0, 0); // 8 PM
      if (tonight.getTime() <= now.getTime()) {
        tonight.setDate(tonight.getDate() + 1); // If past 8 PM, set for tomorrow
      }
      return tonight.getTime();
    case 'tomorrow':
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(20, 0, 0, 0); // 8 PM tomorrow
      return tomorrow.getTime();
    case 'weekend':
      const weekend = new Date(now);
      const dayOfWeek = weekend.getDay();
      const daysUntilSaturday = dayOfWeek === 0 ? 6 : 6 - dayOfWeek; // 0 = Sunday, 6 = Saturday
      weekend.setDate(weekend.getDate() + daysUntilSaturday);
      weekend.setHours(20, 0, 0, 0); // 8 PM Saturday
      return weekend.getTime();
    case 'custom':
      if (!customTime || customTime.getTime() <= now.getTime()) {
        throw new Error('Custom time must be in the future');
      }
      return customTime.getTime();
    default:
      throw new Error('Invalid reminder option');
  }
}

/**
 * Load reminders from localStorage
 */
function loadRemindersFromStorage(): Reminder[] {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const stored = localStorage.getItem(REMINDERS_STORAGE_KEY);
    if (!stored) {
      return [];
    }

    const parsed = JSON.parse(stored) as Reminder[];
    
    if (!Array.isArray(parsed)) {
      console.warn('Invalid reminders data in localStorage, resetting...');
      return [];
    }

    // Filter out expired reminders and validate structure
    const now = Date.now();
    const validReminders = parsed.filter((reminder) => {
      if (!reminder.movieId || !reminder.movieTitle || !reminder.reminderTime) {
        return false;
      }
      // Keep reminders that haven't passed yet (with 1 minute grace period)
      return reminder.reminderTime > now - 60000;
    });

    // If some reminders were invalid/expired, save the cleaned version
    if (validReminders.length !== parsed.length) {
      try {
        localStorage.setItem(REMINDERS_STORAGE_KEY, JSON.stringify(validReminders));
      } catch (error) {
        console.error('Failed to save cleaned reminders:', error);
      }
    }

    return validReminders;
  } catch (error) {
    console.error('Failed to load reminders from localStorage:', error);
    return [];
  }
}

/**
 * Save reminders to localStorage
 */
function saveRemindersToStorage(reminders: Reminder[]): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  try {
    localStorage.setItem(REMINDERS_STORAGE_KEY, JSON.stringify(reminders));
    
    // Dispatch custom event asynchronously
    setTimeout(() => {
      window.dispatchEvent(new Event('remindersUpdated'));
    }, 0);
    
    return true;
  } catch (error) {
    console.error('Failed to save reminders to localStorage:', error);
    return false;
  }
}

/**
 * Format time remaining until reminder
 */
export function formatTimeRemaining(reminderTime: number): string {
  const now = Date.now();
  const diff = reminderTime - now;
  
  if (diff <= 0) {
    return 'Now';
  }
  
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) {
    return `${days}d ${hours % 24}h`;
  } else if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  } else {
    return `${minutes}m`;
  }
}

/**
 * Custom React hook for managing movie reminders
 */
export function useReminders(): UseRemindersReturn {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load reminders from localStorage on mount
  useEffect(() => {
    try {
      const loadedReminders = loadRemindersFromStorage();
      setReminders(loadedReminders);
    } catch (err) {
      console.error('Error loading reminders:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Listen for storage changes from other tabs/windows
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === REMINDERS_STORAGE_KEY) {
        try {
          const loadedReminders = loadRemindersFromStorage();
          setReminders(loadedReminders);
        } catch (err) {
          console.error('Failed to sync reminders:', err);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Listen for custom remindersUpdated event (same tab)
  useEffect(() => {
    const handleRemindersUpdated = () => {
      setTimeout(() => {
        try {
          const loadedReminders = loadRemindersFromStorage();
          setReminders(loadedReminders);
        } catch (err) {
          console.error('Failed to sync reminders:', err);
        }
      }, 0);
    };

    window.addEventListener('remindersUpdated', handleRemindersUpdated);
    return () => window.removeEventListener('remindersUpdated', handleRemindersUpdated);
  }, []);

  /**
   * Add a reminder
   */
  const addReminder = useCallback((
    movieId: string | number,
    movieTitle: string,
    option: ReminderOption,
    customTime?: Date
  ): boolean => {
    try {
      const reminderTime = calculateReminderTime(option, customTime);
      
      const newReminder: Reminder = {
        movieId,
        movieTitle,
        reminderTime,
        createdAt: Date.now(),
      };

      setReminders((currentReminders) => {
        // Remove existing reminder for this movie if any
        const filtered = currentReminders.filter(
          (rem) => String(rem.movieId) !== String(movieId)
        );
        
        const updated = [...filtered, newReminder];
        const saved = saveRemindersToStorage(updated);
        
        if (!saved) {
          console.error('Failed to save reminder to localStorage');
          return currentReminders;
        }
        
        return updated;
      });

      return true;
    } catch (error) {
      console.error('Failed to add reminder:', error);
      return false;
    }
  }, []);

  /**
   * Remove a reminder
   */
  const removeReminder = useCallback((movieId: string | number): boolean => {
    setReminders((currentReminders) => {
      const filtered = currentReminders.filter(
        (rem) => String(rem.movieId) !== String(movieId)
      );

      const saved = saveRemindersToStorage(filtered);
      
      if (!saved) {
        console.error('Failed to remove reminder from localStorage');
        return currentReminders;
      }

      return filtered;
    });

    return true;
  }, []);

  /**
   * Get a reminder by movie ID
   */
  const getReminder = useCallback(
    (movieId: string | number): Reminder | null => {
      return reminders.find((rem) => String(rem.movieId) === String(movieId)) || null;
    },
    [reminders]
  );

  /**
   * Check if a movie has a reminder
   */
  const hasReminder = useCallback(
    (movieId: string | number): boolean => {
      return reminders.some((rem) => String(rem.movieId) === String(movieId));
    },
    [reminders]
  );

  /**
   * Get upcoming reminders (not yet triggered)
   */
  const getUpcomingReminders = useCallback((): Reminder[] => {
    const now = Date.now();
    return reminders
      .filter((rem) => rem.reminderTime > now)
      .sort((a, b) => a.reminderTime - b.reminderTime);
  }, [reminders]);

  return {
    reminders,
    isLoading,
    addReminder,
    removeReminder,
    getReminder,
    hasReminder,
    getUpcomingReminders,
    remindersCount: reminders.length,
  };
}

/**
 * Check if notification permission was dismissed forever
 */
export function isNotificationDismissed(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(NOTIFICATION_PERMISSION_KEY) === 'true';
}

/**
 * Mark notification permission as dismissed forever
 */
export function dismissNotificationPermission(): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(NOTIFICATION_PERMISSION_KEY, 'true');
}
