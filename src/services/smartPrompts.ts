import { Impulse } from '@/types/impulse';
import { getWeakHours } from '@/utils/timePatterns';
import { formatHour } from '@/utils/timePatterns';
import * as Notifications from 'expo-notifications';
import { requestPermissions } from './notifications';
import { logger } from '@/utils/logger';

/**
 * Smart Prompts Service
 * Contextual notifications based on user behavior patterns
 */

interface PromptContext {
  currentHour: number;
  impulses: Impulse[];
  recentRegrets: Impulse[];
  weakHours: number[];
}

/**
 * Analyze user patterns and generate smart prompts
 */
export function analyzePatterns(impulses: Impulse[]): PromptContext {
  const now = new Date();
  const currentHour = now.getHours();
  
  const recentRegrets = impulses
    .filter(i => i.finalFeeling === 'REGRET')
    .sort((a, b) => b.executedAt! - a.executedAt!)
    .slice(0, 5);

  const { highFrequency } = getWeakHours(impulses);
  const weakHours = highFrequency.map(p => p.hour);

  return {
    currentHour,
    impulses,
    recentRegrets,
    weakHours,
  };
}

/**
 * Check if user is in a weak hour
 */
function isWeakHour(context: PromptContext): boolean {
  return context.weakHours.includes(context.currentHour);
}

/**
 * Check if user has similar recent regrets
 */
function hasSimilarRegrets(context: PromptContext, category: string): boolean {
  return context.recentRegrets.some(r => r.category === category);
}

/**
 * Generate contextual prompt based on patterns
 */
export async function sendSmartPrompt(
  context: PromptContext,
  trigger: 'time_based' | 'pattern_based' | 'reminder'
): Promise<void> {
  const hasPermission = await requestPermissions();
  if (!hasPermission) {
    return;
  }

  let title = '';
  let body = '';

  switch (trigger) {
    case 'time_based':
      if (isWeakHour(context)) {
        title = '⏰ Weak Hour Alert';
        body = `You usually make impulsive decisions around ${formatHour(context.currentHour)}. Think twice before buying!`;
      }
      break;

    case 'pattern_based':
      if (context.recentRegrets.length >= 3) {
        const topCategory = context.recentRegrets[0].category;
        title = '💡 Pattern Alert';
        body = `You've regretted ${context.recentRegrets.length} purchases recently. Consider logging before buying ${topCategory.toLowerCase()} items.`;
      }
      break;

    case 'reminder':
      const activeImpulses = context.impulses.filter(i => i.status === 'LOCKED');
      if (activeImpulses.length > 0) {
        title = '🔒 Active Impulses';
        body = `You have ${activeImpulses.length} impulse${activeImpulses.length > 1 ? 's' : ''} in cool-down. Check them out!`;
      }
      break;
  }

  if (title && body) {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: { type: 'smart_prompt', trigger },
          sound: false, // Less intrusive
        },
        trigger: {
          seconds: 1, // Send immediately
        },
      });
    } catch (error) {
      logger.error('Error sending smart prompt', error instanceof Error ? error : new Error(String(error)));
    }
  }
}

/**
 * Schedule daily smart prompts
 * Schedules recurring notifications based on user patterns
 */
export async function scheduleDailySmartPrompts(impulses: Impulse[]): Promise<void> {
  const hasPermission = await requestPermissions();
  if (!hasPermission) {
    return;
  }

  const context = analyzePatterns(impulses);
  
  // Only schedule if user has enough data (5+ impulses)
  if (impulses.length < 5) {
    return;
  }
  
  // Cancel existing smart prompt notifications
  try {
    const allNotifications = await Notifications.getAllScheduledNotificationsAsync();
    const smartPrompts = allNotifications.filter(
      n => n.content.data?.type === 'smart_prompt'
    );
    for (const notification of smartPrompts) {
      await Notifications.cancelScheduledNotificationAsync(notification.identifier);
    }
  } catch (error) {
    logger.error('Error canceling existing smart prompts', error instanceof Error ? error : new Error(String(error)));
  }
  
  // Schedule time-based prompt for weak hours
  if (context.weakHours.length > 0) {
    const weakHour = context.weakHours[0]; // Use first weak hour
    const now = new Date();
    const targetTime = new Date();
    targetTime.setHours(weakHour, 0, 0, 0);
    
    // If target time is today and hasn't passed, schedule for today
    // Otherwise schedule for tomorrow
    if (targetTime <= now) {
      targetTime.setDate(targetTime.getDate() + 1);
    }

    const delay = targetTime.getTime() - now.getTime();

    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '⏰ Weak Hour Reminder',
          body: `You usually make impulsive decisions around ${formatHour(weakHour)}. Log before you buy!`,
          data: { type: 'smart_prompt', trigger: 'time_based' },
          sound: false,
        },
        trigger: {
          seconds: Math.max(1, Math.floor(delay / 1000)),
          repeats: true,
        },
      });
    } catch (error) {
      logger.error('Error scheduling daily prompt', error instanceof Error ? error : new Error(String(error)));
    }
  }

  // Schedule daily reminder for active impulses (if user has active impulses)
  const activeImpulses = impulses.filter(i => i.status === 'LOCKED');
  if (activeImpulses.length > 0) {
    const now = new Date();
    const reminderTime = new Date();
    reminderTime.setHours(20, 0, 0, 0); // 8 PM daily reminder
    
    if (reminderTime <= now) {
      reminderTime.setDate(reminderTime.getDate() + 1);
    }

    const delay = reminderTime.getTime() - now.getTime();

    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🔒 Daily Check-in',
          body: `You have ${activeImpulses.length} impulse${activeImpulses.length > 1 ? 's' : ''} in cool-down. Review them!`,
          data: { type: 'smart_prompt', trigger: 'reminder' },
          sound: false,
        },
        trigger: {
          seconds: Math.max(1, Math.floor(delay / 1000)),
          repeats: true,
        },
      });
    } catch (error) {
      logger.error('Error scheduling daily reminder', error instanceof Error ? error : new Error(String(error)));
    }
  }

  // Schedule a lightweight daily "Quick Add" nudge to reduce pre-purchase logging friction
  // This opens the quick-add screen directly on tap.
  {
    const now = new Date();
    const quickAddTime = new Date();
    // Prefer first weak hour if available; otherwise fallback to 6 PM
    const quickAddHour = context.weakHours.length > 0 ? context.weakHours[0] : 18;
    quickAddTime.setHours(quickAddHour, 0, 0, 0);
    if (quickAddTime <= now) {
      quickAddTime.setDate(quickAddTime.getDate() + 1);
    }
    const delay = quickAddTime.getTime() - now.getTime();
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '⚡ Log before you buy',
          body: 'Open Quick Add to lock the impulse in under 30 seconds.',
          data: { type: 'quick_add' },
          sound: false,
        },
        trigger: {
          seconds: Math.max(1, Math.floor(delay / 1000)),
          repeats: true,
        },
      });
    } catch (error) {
      logger.error('Error scheduling quick-add nudge', error instanceof Error ? error : new Error(String(error)));
    }
  }
}

/**
 * Send pattern-based prompt when user opens app during weak hour
 */
export async function checkAndSendContextualPrompt(impulses: Impulse[]): Promise<void> {
  const context = analyzePatterns(impulses);
  
  // Only send if user has enough data (5+ impulses)
  if (impulses.length < 5) {
    return;
  }

  // Check if current hour is weak hour (only send once per hour)
  if (isWeakHour(context)) {
    const lastPromptTime = await getLastSmartPromptTime();
    const now = Date.now();
    const oneHourAgo = now - 60 * 60 * 1000;
    
    if (!lastPromptTime || lastPromptTime < oneHourAgo) {
      await sendSmartPrompt(context, 'time_based');
      await setLastSmartPromptTime(now);
    }
  }

  // Check if user has pattern of regrets (only send once per day)
  if (context.recentRegrets.length >= 3) {
    const lastPatternPrompt = await getLastPatternPromptTime();
    const now = Date.now();
    const oneDayAgo = now - 24 * 60 * 60 * 1000;
    
    if (!lastPatternPrompt || lastPatternPrompt < oneDayAgo) {
      await sendSmartPrompt(context, 'pattern_based');
      await setLastPatternPromptTime(now);
    }
  }
}

/**
 * Get last smart prompt time from storage
 */
async function getLastSmartPromptTime(): Promise<number | null> {
  try {
    const { storage } = await import('@/services/storage');
    const settings = await storage.getSettings();
    return settings.lastSmartPromptTime || null;
  } catch {
    return null;
  }
}

/**
 * Set last smart prompt time
 */
async function setLastSmartPromptTime(timestamp: number): Promise<void> {
  try {
    const { storage } = await import('@/services/storage');
    const settings = await storage.getSettings();
    await storage.saveSettings({
      ...settings,
      lastSmartPromptTime: timestamp,
    });
  } catch (error) {
    logger.error('Error saving last smart prompt time', error instanceof Error ? error : new Error(String(error)));
  }
}

/**
 * Get last pattern prompt time
 */
async function getLastPatternPromptTime(): Promise<number | null> {
  try {
    const { storage } = await import('@/services/storage');
    const settings = await storage.getSettings();
    return settings.lastPatternPromptTime || null;
  } catch {
    return null;
  }
}

/**
 * Set last pattern prompt time
 */
async function setLastPatternPromptTime(timestamp: number): Promise<void> {
  try {
    const { storage } = await import('@/services/storage');
    const settings = await storage.getSettings();
    await storage.saveSettings({
      ...settings,
      lastPatternPromptTime: timestamp,
    });
  } catch (error) {
    logger.error('Error saving last pattern prompt time', error instanceof Error ? error : new Error(String(error)));
  }
}

