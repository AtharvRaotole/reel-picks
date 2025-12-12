'use client';

import { Reminder, isNotificationDismissed, dismissNotificationPermission } from './hooks/useReminders';

/**
 * Notification service for handling browser notifications
 */
class NotificationService {
  private checkInterval: NodeJS.Timeout | null = null;
  private triggeredReminders: Set<string> = new Set();
  private onReminderTriggered?: (reminder: Reminder) => void;

  /**
   * Request notification permission from user
   */
  async requestPermission(): Promise<NotificationPermission> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'denied';
    }

    // Check if user previously dismissed forever
    if (isNotificationDismissed()) {
      return 'denied';
    }

    if (Notification.permission === 'default') {
      try {
        const permission = await Notification.requestPermission();
        if (permission === 'denied') {
          // User denied, but don't mark as dismissed forever yet
          // They might want to enable it later
        }
        return permission;
      } catch (error) {
        console.error('Error requesting notification permission:', error);
        return 'denied';
      }
    }

    return Notification.permission;
  }

  /**
   * Show a notification
   */
  private showNotification(reminder: Reminder): void {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return;
    }

    if (Notification.permission !== 'granted') {
      return;
    }

    try {
      const notification = new Notification(`⏰ Time to watch!`, {
        body: `Don't forget: ${reminder.movieTitle}`,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: `reminder-${reminder.movieId}`,
        requireInteraction: false,
      });

      // Auto-close after 5 seconds
      setTimeout(() => {
        notification.close();
      }, 5000);

      // Track that we've shown this reminder
      this.triggeredReminders.add(String(reminder.movieId));

      // Call callback for animation
      if (this.onReminderTriggered) {
        this.onReminderTriggered(reminder);
      }
    } catch (error) {
      console.error('Error showing notification:', error);
    }
  }

  /**
   * Check for reminders that should trigger
   */
  private checkReminders(reminders: Reminder[]): void {
    const now = Date.now();
    
    reminders.forEach((reminder) => {
      const reminderKey = String(reminder.movieId);
      
      // Check if reminder time has passed and we haven't triggered it yet
      if (reminder.reminderTime <= now && !this.triggeredReminders.has(reminderKey)) {
        this.showNotification(reminder);
      }
    });
  }

  /**
   * Start checking for reminders periodically
   */
  startChecking(reminders: Reminder[], onTriggered?: (reminder: Reminder) => void): void {
    this.onReminderTriggered = onTriggered;
    
    // Clear existing interval
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }

    // Check immediately
    this.checkReminders(reminders);

    // Check every 30 seconds
    this.checkInterval = setInterval(() => {
      this.checkReminders(reminders);
    }, 30000);
  }

  /**
   * Stop checking for reminders
   */
  stopChecking(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  /**
   * Clear triggered reminders (useful when reminders are updated)
   */
  clearTriggered(): void {
    this.triggeredReminders.clear();
  }

  /**
   * Mark notification permission as dismissed forever
   */
  dismissPermission(): void {
    dismissNotificationPermission();
  }
}

// Export singleton instance
export const notificationService = new NotificationService();
