import { Impulse } from '@/types/impulse';
import { getWeakHours } from '@/utils/timePatterns';
import { formatHour } from '@/utils/timePatterns';
import * as Notifications from 'expo-notifications';
import { requestPermissions } from './notifications';

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
      console.error('Error sending smart prompt:', error);
    }
  }
}

/**
 * Schedule daily smart prompts
 */
export async function scheduleDailySmartPrompts(impulses: Impulse[]): Promise<void> {
  const context = analyzePatterns(impulses);
  
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
          seconds: Math.floor(delay / 1000),
          repeats: true,
          hour: weakHour,
          minute: 0,
        },
      });
    } catch (error) {
      console.error('Error scheduling daily prompt:', error);
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

  // Check if current hour is weak hour
  if (isWeakHour(context)) {
    await sendSmartPrompt(context, 'time_based');
  }

  // Check if user has pattern of regrets
  if (context.recentRegrets.length >= 3) {
    await sendSmartPrompt(context, 'pattern_based');
  }
}

