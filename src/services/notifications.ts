import * as Notifications from 'expo-notifications';
import { Impulse } from '@/types/impulse';
import { logger } from '@/utils/logger';

/**
 * Notification service
 * Handles push notifications for cool-downs and regret checks
 */

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/**
 * Request notification permissions
 */
export async function requestPermissions(): Promise<boolean> {
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
 * Schedule notification for regret check (24h after execution)
 */
export async function scheduleRegretCheckNotification(impulse: Impulse): Promise<string | null> {
  const hasPermission = await requestPermissions();
  if (!hasPermission) {
    return null;
  }

  if (!impulse.executedAt) {
    return null;
  }

  const regretCheckTime = impulse.executedAt + 24 * 60 * 60 * 1000; // 24 hours later
  const now = Date.now();
  const delay = Math.max(0, regretCheckTime - now);

  if (delay <= 0) {
    return null;
  }

  try {
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: '💭 How do you feel?',
        body: `You bought ${impulse.title} yesterday. Was it worth it?`,
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
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (error) {
    logger.error('Error canceling all notifications', error instanceof Error ? error : new Error(String(error)));
  }
}

/**
 * Get all scheduled notifications
 */
export async function getAllScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
  try {
    return await Notifications.getAllScheduledNotificationsAsync();
  } catch (error) {
    logger.error('Error getting scheduled notifications', error instanceof Error ? error : new Error(String(error)));
    return [];
  }
}

