import { UserStats } from './gamification';

export interface PositiveMessage {
  emoji: string;
  title: string;
  message: string;
  type: 'achievement' | 'encouragement' | 'milestone' | 'reminder';
}

/**
 * Generate positive, Headspace-style messages based on user stats
 */
export function getPositiveMessages(stats: UserStats): PositiveMessage[] {
  const messages: PositiveMessage[] = [];

  // Streak messages
  if (stats.streak >= 7) {
    messages.push({
      emoji: '🔥',
      title: 'Week Warrior!',
      message: `You've maintained a ${stats.streak}-day streak! Your future self is proud.`,
      type: 'milestone',
    });
  } else if (stats.streak >= 3) {
    messages.push({
      emoji: '✨',
      title: 'Building Momentum',
      message: `${stats.streak} days strong! Keep up the amazing work.`,
      type: 'encouragement',
    });
  }

  // Level messages
  if (stats.level >= 10) {
    messages.push({
      emoji: '🏆',
      title: 'Master Level',
      message: `Level ${stats.level}! You're a true impulse control master.`,
      type: 'achievement',
    });
  } else if (stats.level >= 5) {
    messages.push({
      emoji: '⭐',
      title: 'Rising Star',
      message: `Level ${stats.level} achieved! You're making incredible progress.`,
      type: 'achievement',
    });
  }

  // Skip milestone messages
  if (stats.totalSkipped >= 100) {
    messages.push({
      emoji: '🎉',
      title: 'Century Club',
      message: `You've skipped ${stats.totalSkipped} impulses! That's incredible willpower.`,
      type: 'milestone',
    });
  } else if (stats.totalSkipped >= 50) {
    messages.push({
      emoji: '💪',
      title: 'Half Century',
      message: `${stats.totalSkipped} impulses skipped! You're building powerful habits.`,
      type: 'milestone',
    });
  } else if (stats.totalSkipped >= 10) {
    messages.push({
      emoji: '🌟',
      title: 'Double Digits',
      message: `You've skipped ${stats.totalSkipped} impulses! Every skip counts.`,
      type: 'achievement',
    });
  }

  // Savings milestone messages
  if (stats.totalSaved >= 10000) {
    messages.push({
      emoji: '💰',
      title: 'Savings Champion',
      message: `You've saved over $10,000! That's life-changing money.`,
      type: 'milestone',
    });
  } else if (stats.totalSaved >= 5000) {
    messages.push({
      emoji: '💎',
      title: 'Big Saver',
      message: `Over $5,000 saved! Your future is looking brighter.`,
      type: 'milestone',
    });
  } else if (stats.totalSaved >= 1000) {
    messages.push({
      emoji: '🎯',
      title: 'Thousand Club',
      message: `You've saved over $1,000! That's real progress.`,
      type: 'achievement',
    });
  }

  // Encouragement messages (if no specific achievements)
  if (messages.length === 0) {
    if (stats.totalSkipped > 0) {
      messages.push({
        emoji: '🌱',
        title: 'Growing Strong',
        message: 'Every impulse you skip is a step toward financial freedom. Keep going!',
        type: 'encouragement',
      });
    } else {
      messages.push({
        emoji: '💫',
        title: 'Ready to Start',
        message: 'Your journey to better impulse control begins with a single skip. You\'ve got this!',
        type: 'reminder',
      });
    }
  }

  return messages;
}

/**
 * Get a friendly nudge message for the user
 */
export function getFriendlyNudge(stats: UserStats, timeOfDay: 'morning' | 'afternoon' | 'evening' = 'afternoon'): PositiveMessage {
  const timeMessages = {
    morning: [
      { emoji: '🌅', message: 'Start your day with intention. Log your impulses to build awareness.' },
      { emoji: '☀️', message: 'Good morning! Today is a fresh opportunity to make mindful choices.' },
    ],
    afternoon: [
      { emoji: '🌤️', message: 'Midday check-in: How are your impulses today? Log them to stay aware.' },
      { emoji: '💭', message: 'Take a moment to reflect. Are you making decisions that align with your goals?' },
    ],
    evening: [
      { emoji: '🌙', message: 'Evening reflection: Review your impulses today. Every skip is progress.' },
      { emoji: '✨', message: 'End your day mindfully. Log any impulses before you rest.' },
    ],
  };

  const timeOptions = timeMessages[timeOfDay];
  const randomMessage = timeOptions[Math.floor(Math.random() * timeOptions.length)];

  return {
    emoji: randomMessage.emoji,
    title: 'Gentle Reminder',
    message: randomMessage.message,
    type: 'reminder',
  };
}

