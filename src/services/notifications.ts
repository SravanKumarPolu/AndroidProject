import { Platform } from 'react-native';
import { Impulse } from '@/types/impulse';
import { logger } from '@/utils/logger';

/**
 * Notification service
 * Handles push notifications for cool-downs and regret checks
 */

// Conditionally import expo-notifications only on native platforms
let Notifications: typeof import('expo-notifications') | null = null;
if (Platform.OS !== 'web') {
  try {
    Notifications = require('expo-notifications');
    // Configure notification behavior
    if (Notifications) {
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: true,
        }),
      });
    }
  } catch (error) {
    console.warn('expo-notifications not available:', error);
  }
}

/**
 * Request notification permissions
 */
export async function requestPermissions(): Promise<boolean> {
  if (Platform.OS === 'web') {
    // Web notifications require user interaction
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return false;
    }
    if (Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return Notification.permission === 'granted';
  }

  if (!Notifications) {
    return false;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  return finalStatus === 'granted';
}

/**
 * Schedule notification for when cool-down ends
 */
export async function scheduleCoolDownNotification(impulse: Impulse): Promise<string | null> {
  if (Platform.OS === 'web') {
    // On web, use setTimeout with browser notifications
    const hasPermission = await requestPermissions();
    if (!hasPermission) {
      logger.warn('Notification permissions not granted');
      return null;
    }

    const now = Date.now();
    const reviewTime = impulse.reviewAt;
    const delay = Math.max(0, reviewTime - now);

    if (delay <= 0) {
      return null; // Already past review time
    }

    const timeoutId = setTimeout(() => {
      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
        try {
        new Notification('⏰ Time to Review', {
          body: `${impulse.title} - ${impulse.price ? `₹${impulse.price}` : 'No price set'}. Still want it?`,
          icon: '/favicon.png',
          tag: `review-${impulse.id}`,
        });
        } catch (error) {
          logger.error('Error showing web notification', error instanceof Error ? error : new Error(String(error)));
        }
      }
    }, delay);

    // Return timeout ID as string (web doesn't have persistent notification IDs)
    return `web-${timeoutId}`;
  }

  if (!Notifications) {
    return null;
  }

  const hasPermission = await requestPermissions();
  if (!hasPermission) {
    logger.warn('Notification permissions not granted');
    return null;
  }

  const now = Date.now();
  const reviewTime = impulse.reviewAt;
  const delay = Math.max(0, reviewTime - now);

  if (delay <= 0) {
    return null; // Already past review time
  }

  try {
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: '⏰ Time to Review',
        body: `${impulse.title} - ${impulse.price ? `₹${impulse.price}` : 'No price set'}. Still want it?`,
        data: { impulseId: impulse.id, type: 'review' },
        sound: true,
      },
      trigger: {
        seconds: Math.floor(delay / 1000),
      },
    });

    return notificationId;
  } catch (error) {
    logger.error('Error scheduling notification', error instanceof Error ? error : new Error(String(error)));
    return null;
  }
}

/**
 * Schedule notification for regret check (3 days after execution)
 */
export async function scheduleRegretCheckNotification(impulse: Impulse): Promise<string | null> {
  if (Platform.OS === 'web') {
    const hasPermission = await requestPermissions();
    if (!hasPermission) {
      return null;
    }

    if (!impulse.executedAt) {
      return null;
    }

    const regretCheckTime = impulse.executedAt + 3 * 24 * 60 * 60 * 1000; // 3 days later
    const now = Date.now();
    const delay = Math.max(0, regretCheckTime - now);

    if (delay <= 0) {
      return null;
    }

    const timeoutId = setTimeout(() => {
      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
        try {
        new Notification('💭 How do you feel?', {
          body: `You bought ${impulse.title} 3 days ago. Was it worth it?`,
          icon: '/favicon.png',
          tag: `regret-${impulse.id}`,
        });
        } catch (error) {
          logger.error('Error showing web notification', error instanceof Error ? error : new Error(String(error)));
        }
      }
    }, delay);

    // Schedule reminder (optional - 1 day after initial check)
    const reminderDelay = delay + 24 * 60 * 60 * 1000;
    setTimeout(() => {
      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
        try {
        new Notification('👀 Quick check-in', {
          body: `About ${impulse.title}. Was it worth it?`,
          icon: '/favicon.png',
          tag: `regret-reminder-${impulse.id}`,
        });
        } catch (error) {
          logger.error('Error showing web notification', error instanceof Error ? error : new Error(String(error)));
        }
      }
    }, reminderDelay);

    return `web-${timeoutId}`;
  }

  if (!Notifications) {
    return null;
  }

  const hasPermission = await requestPermissions();
  if (!hasPermission) {
    return null;
  }

  if (!impulse.executedAt) {
    return null;
  }

  const regretCheckTime = impulse.executedAt + 3 * 24 * 60 * 60 * 1000; // 3 days later
  const now = Date.now();
  const delay = Math.max(0, regretCheckTime - now);

  if (delay <= 0) {
    return null;
  }

  try {
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: '💭 How do you feel?',
        body: `You bought ${impulse.title} 3 days ago. Was it worth it?`,
        data: { impulseId: impulse.id, type: 'regret_check' },
        sound: true,
      },
      trigger: {
        seconds: Math.floor(delay / 1000),
      },
    });

    // Also schedule one gentle re-prompt 24h later if user hasn't responded yet
    // (best-effort; if user already responded, the screen will simply show status)
    const reminderDelay = delay + 24 * 60 * 60 * 1000;
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '👀 Quick check-in',
        body: `About ${impulse.title}. Was it worth it?`,
        data: { impulseId: impulse.id, type: 'regret_check' },
        sound: false,
      },
      trigger: {
        seconds: Math.floor(reminderDelay / 1000),
      },
    });

    return notificationId;
  } catch (error) {
    logger.error('Error scheduling regret check', error instanceof Error ? error : new Error(String(error)));
    return null;
  }
}

/**
 * Cancel a scheduled notification
 */
export async function cancelNotification(notificationId: string): Promise<void> {
  if (Platform.OS === 'web') {
    // On web, clearTimeout if it's a web notification
    if (notificationId.startsWith('web-')) {
      const timeoutId = parseInt(notificationId.replace('web-', ''), 10);
      clearTimeout(timeoutId);
    }
    return;
  }

  if (!Notifications) {
    return;
  }

  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  } catch (error) {
    logger.error('Error canceling notification', error instanceof Error ? error : new Error(String(error)));
  }
}

/**
 * Cancel all notifications
 */
export async function cancelAllNotifications(): Promise<void> {
  if (Platform.OS === 'web') {
    // Web notifications are cleared automatically when page closes
    // For persistent cancellation, we'd need to track all timeout IDs
    return;
  }

  if (!Notifications) {
    return;
  }

  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (error) {
    logger.error('Error canceling all notifications', error instanceof Error ? error : new Error(String(error)));
  }
}

/**
 * Get all scheduled notifications
 */
export async function getAllScheduledNotifications(): Promise<any[]> {
  if (Platform.OS === 'web') {
    // Web doesn't have a way to list scheduled notifications
    return [];
  }

  if (!Notifications) {
    return [];
  }

  try {
    return await Notifications.getAllScheduledNotificationsAsync();
  } catch (error) {
    logger.error('Error getting scheduled notifications', error instanceof Error ? error : new Error(String(error)));
    return [];
  }
}

