import * as Sharing from 'expo-sharing';
import { Impulse, UserStats } from '@/types/impulse';
import { formatCurrency } from './currency';

export interface ShareContent {
  title: string;
  message: string;
  url?: string;
}

/**
 * Share achievements
 */
export function createAchievementShareContent(
  achievementTitle: string,
  level: number,
  totalXP: number
): ShareContent {
  return {
    title: 'Achievement Unlocked! 🏆',
    message: `I just unlocked "${achievementTitle}" in ImpulseVault! 🎉\n\nLevel ${level} | ${totalXP} XP\n\nStart saving money and avoiding regrets with ImpulseVault! 💰`,
  };
}

/**
 * Share stats
 */
export function createStatsShareContent(stats: UserStats): ShareContent {
  const savedText = stats.totalSaved > 0 
    ? `I've saved ${formatCurrency(stats.totalSaved)} by avoiding ${stats.totalCancelled} impulsive purchases!`
    : `I'm tracking my impulses with ImpulseVault!`;
  
  const streakText = stats.currentStreak > 0
    ? `\n\n🔥 ${stats.currentStreak} day streak!`
    : '';

  return {
    title: 'My ImpulseVault Stats 📊',
    message: `${savedText}${streakText}\n\nStart saving money and avoiding regrets with ImpulseVault! 💰`,
  };
}

/**
 * Share goal progress
 */
export function createGoalShareContent(
  goalTitle: string,
  progress: number,
  currentAmount: number,
  targetAmount: number
): ShareContent {
  const progressText = progress >= 100
    ? `I just completed my goal "${goalTitle}"! 🎉`
    : `I'm ${Math.round(progress)}% towards my goal "${goalTitle}"! 💪`;

  return {
    title: 'Goal Progress 🎯',
    message: `${progressText}\n\n${formatCurrency(currentAmount)} / ${formatCurrency(targetAmount)}\n\nTrack your savings goals with ImpulseVault! 💰`,
  };
}

/**
 * Share weekly summary
 */
export function createWeeklySummaryShareContent(
  moneySaved: number,
  impulsesAvoided: number,
  streak: number
): ShareContent {
  return {
    title: 'Weekly Summary 📅',
    message: `This week I saved ${formatCurrency(moneySaved)} by avoiding ${impulsesAvoided} impulsive purchases!${streak > 0 ? `\n\n🔥 ${streak} day streak!` : ''}\n\nTrack your spending with ImpulseVault! 💰`,
  };
}

/**
 * Share impulse (when cancelled)
 */
export function createImpulseShareContent(impulse: Impulse): ShareContent {
  const priceText = impulse.price ? ` worth ${formatCurrency(impulse.price)}` : '';
  return {
    title: 'Impulse Avoided! 🎉',
    message: `I just avoided buying "${impulse.title}"${priceText}!\n\nThanks to ImpulseVault's cool-down period, I made a better decision. 💪\n\nStart saving money with ImpulseVault! 💰`,
  };
}

/**
 * Share app (general)
 */
export function createAppShareContent(): ShareContent {
  return {
    title: 'ImpulseVault - Lock Your Impulses',
    message: `I'm using ImpulseVault to avoid impulsive purchases and save money! 💰\n\nIt helps me think twice before buying with a cool-down period. Try it out! 🔒`,
  };
}

/**
 * Share content using native share sheet
 */
export async function shareContent(content: ShareContent): Promise<boolean> {
  try {
    const { logger } = await import('./logger');
    const isAvailable = await Sharing.isAvailableAsync();
    if (!isAvailable) {
      logger.warn('Sharing is not available on this device');
      return false;
    }

    await Sharing.shareAsync(content.message, {
      dialogTitle: content.title,
    });

    return true;
  } catch (error) {
    const { logger } = await import('./logger');
    logger.error('Error sharing content', error instanceof Error ? error : new Error(String(error)));
    return false;
  }
}

/**
 * Copy text to clipboard (for sharing)
 * Note: Install @react-native-clipboard/clipboard for clipboard support
 * npm install @react-native-clipboard/clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    // Try to use expo-clipboard if available, otherwise fallback
    try {
      const Clipboard = await import('@react-native-clipboard/clipboard');
      await Clipboard.default.setString(text);
      return true;
    } catch {
      // Fallback: expo-clipboard or other clipboard solution
      const { logger } = await import('./logger');
      logger.warn('Clipboard not available. Install @react-native-clipboard/clipboard');
      return false;
    }
  } catch (error) {
    const { logger } = await import('./logger');
    logger.error('Error copying to clipboard', error instanceof Error ? error : new Error(String(error)));
    return false;
  }
}

