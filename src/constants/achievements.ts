import { AchievementDefinition } from '@/types/achievement';
import { UserStats, CategoryStats } from '@/types/impulse';
import { Impulse, ImpulseCategory } from '@/types/impulse';

/**
 * Achievement Definitions
 * Efficient checking - only evaluates when needed
 */
export const ACHIEVEMENT_DEFINITIONS: AchievementDefinition[] = [
  // Streak Achievements
  {
    id: 'streak_3',
    title: 'Getting Started',
    description: 'Maintain a 3-day streak',
    category: 'STREAK',
    rarity: 'COMMON',
    icon: '🔥',
    threshold: 3,
    xpReward: 50,
    checkCondition: (stats: UserStats) => stats.currentStreak,
  },
  {
    id: 'streak_7',
    title: 'Week Warrior',
    description: 'Maintain a 7-day streak',
    category: 'STREAK',
    rarity: 'RARE',
    icon: '⚡',
    threshold: 7,
    xpReward: 150,
    checkCondition: (stats: UserStats) => stats.currentStreak,
  },
  {
    id: 'streak_14',
    title: 'Two Week Champion',
    description: 'Maintain a 14-day streak',
    category: 'STREAK',
    rarity: 'RARE',
    icon: '💪',
    threshold: 14,
    xpReward: 300,
    checkCondition: (stats: UserStats) => stats.currentStreak,
  },
  {
    id: 'streak_30',
    title: 'Monthly Master',
    description: 'Maintain a 30-day streak',
    category: 'STREAK',
    rarity: 'EPIC',
    icon: '👑',
    threshold: 30,
    xpReward: 750,
    checkCondition: (stats: UserStats) => stats.currentStreak,
  },
  {
    id: 'streak_100',
    title: 'Centurion',
    description: 'Maintain a 100-day streak',
    category: 'STREAK',
    rarity: 'LEGENDARY',
    icon: '🏆',
    threshold: 100,
    xpReward: 2500,
    checkCondition: (stats: UserStats) => stats.currentStreak,
  },
  {
    id: 'longest_streak_30',
    title: 'Best Streak',
    description: 'Achieve a 30-day longest streak',
    category: 'STREAK',
    rarity: 'EPIC',
    icon: '⭐',
    threshold: 30,
    xpReward: 500,
    checkCondition: (stats: UserStats) => stats.longestStreak,
  },

  // Savings Achievements
  {
    id: 'saved_1000',
    title: 'First Thousand',
    description: 'Save ₹1,000 total',
    category: 'SAVINGS',
    rarity: 'COMMON',
    icon: '💰',
    threshold: 1000,
    xpReward: 100,
    checkCondition: (stats: UserStats) => stats.totalSaved,
  },
  {
    id: 'saved_5000',
    title: 'Five Grand',
    description: 'Save ₹5,000 total',
    category: 'SAVINGS',
    rarity: 'RARE',
    icon: '💵',
    threshold: 5000,
    xpReward: 300,
    checkCondition: (stats: UserStats) => stats.totalSaved,
  },
  {
    id: 'saved_10000',
    title: 'Ten Thousand Club',
    description: 'Save ₹10,000 total',
    category: 'SAVINGS',
    rarity: 'RARE',
    icon: '💎',
    threshold: 10000,
    xpReward: 500,
    checkCondition: (stats: UserStats) => stats.totalSaved,
  },
  {
    id: 'saved_50000',
    title: 'Fifty Grand',
    description: 'Save ₹50,000 total',
    category: 'SAVINGS',
    rarity: 'EPIC',
    icon: '🏦',
    threshold: 50000,
    xpReward: 1500,
    checkCondition: (stats: UserStats) => stats.totalSaved,
  },
  {
    id: 'saved_100000',
    title: 'Lakh Saver',
    description: 'Save ₹1,00,000 total',
    category: 'SAVINGS',
    rarity: 'LEGENDARY',
    icon: '💸',
    threshold: 100000,
    xpReward: 5000,
    checkCondition: (stats: UserStats) => stats.totalSaved,
  },
  {
    id: 'saved_today_500',
    title: 'Daily Saver',
    description: 'Save ₹500 in a single day',
    category: 'SAVINGS',
    rarity: 'COMMON',
    icon: '📅',
    threshold: 500,
    xpReward: 75,
    checkCondition: (stats: UserStats) => stats.todaySaved,
  },

  // Cancellation Achievements
  {
    id: 'cancelled_10',
    title: 'Ten Cancellations',
    description: 'Cancel 10 impulses',
    category: 'CANCELLATIONS',
    rarity: 'COMMON',
    icon: '✅',
    threshold: 10,
    xpReward: 100,
    checkCondition: (stats: UserStats) => stats.totalCancelled,
  },
  {
    id: 'cancelled_50',
    title: 'Fifty Cancellations',
    description: 'Cancel 50 impulses',
    category: 'CANCELLATIONS',
    rarity: 'RARE',
    icon: '🎯',
    threshold: 50,
    xpReward: 400,
    checkCondition: (stats: UserStats) => stats.totalCancelled,
  },
  {
    id: 'cancelled_100',
    title: 'Century',
    description: 'Cancel 100 impulses',
    category: 'CANCELLATIONS',
    rarity: 'EPIC',
    icon: '💯',
    threshold: 100,
    xpReward: 1000,
    checkCondition: (stats: UserStats) => stats.totalCancelled,
  },
  {
    id: 'cancelled_500',
    title: 'Half Millennium',
    description: 'Cancel 500 impulses',
    category: 'CANCELLATIONS',
    rarity: 'LEGENDARY',
    icon: '🌟',
    threshold: 500,
    xpReward: 3000,
    checkCondition: (stats: UserStats) => stats.totalCancelled,
  },

  // Category Achievements
  {
    id: 'category_food_10',
    title: 'Food Fighter',
    description: 'Cancel 10 food impulses',
    category: 'CATEGORY',
    rarity: 'COMMON',
    icon: '🍔',
    threshold: 10,
    xpReward: 75,
    checkCondition: (stats: UserStats, impulses: Impulse[], categoryStats?: CategoryStats[]) => {
      if (!categoryStats) return 0;
      const foodStat = categoryStats.find(c => c.category === 'FOOD');
      return foodStat?.totalCancelled || 0;
    },
  },
  {
    id: 'category_shopping_10',
    title: 'Shopping Stopper',
    description: 'Cancel 10 shopping impulses',
    category: 'CATEGORY',
    rarity: 'COMMON',
    icon: '🛍️',
    threshold: 10,
    xpReward: 75,
    checkCondition: (stats: UserStats, impulses: Impulse[], categoryStats?: CategoryStats[]) => {
      if (!categoryStats) return 0;
      const shoppingStat = categoryStats.find(c => c.category === 'SHOPPING');
      return shoppingStat?.totalCancelled || 0;
    },
  },
  {
    id: 'category_trading_5',
    title: 'Trading Discipline',
    description: 'Cancel 5 trading impulses',
    category: 'CATEGORY',
    rarity: 'RARE',
    icon: '📈',
    threshold: 5,
    xpReward: 200,
    checkCondition: (stats: UserStats, impulses: Impulse[], categoryStats?: CategoryStats[]) => {
      if (!categoryStats) return 0;
      const tradingStat = categoryStats.find(c => c.category === 'TRADING');
      return tradingStat?.totalCancelled || 0;
    },
  },

  // Time-Based Achievements
  {
    id: 'first_week',
    title: 'First Week',
    description: 'Use the app for 7 days',
    category: 'TIME',
    rarity: 'COMMON',
    icon: '📆',
    threshold: 7,
    xpReward: 100,
    checkCondition: (stats: UserStats, impulses: Impulse[]) => {
      if (impulses.length === 0) return 0;
      const firstImpulse = impulses.sort((a, b) => a.createdAt - b.createdAt)[0];
      const daysSinceFirst = Math.floor((Date.now() - firstImpulse.createdAt) / (24 * 60 * 60 * 1000));
      return daysSinceFirst;
    },
  },
  {
    id: 'first_month',
    title: 'First Month',
    description: 'Use the app for 30 days',
    category: 'TIME',
    rarity: 'RARE',
    icon: '🗓️',
    threshold: 30,
    xpReward: 300,
    checkCondition: (stats: UserStats, impulses: Impulse[]) => {
      if (impulses.length === 0) return 0;
      const firstImpulse = impulses.sort((a, b) => a.createdAt - b.createdAt)[0];
      const daysSinceFirst = Math.floor((Date.now() - firstImpulse.createdAt) / (24 * 60 * 60 * 1000));
      return daysSinceFirst;
    },
  },
  {
    id: 'logged_100',
    title: 'Hundred Logs',
    description: 'Log 100 impulses total',
    category: 'TIME',
    rarity: 'RARE',
    icon: '📝',
    threshold: 100,
    xpReward: 400,
    checkCondition: (stats: UserStats, impulses: Impulse[]) => impulses.length,
  },

  // Special Achievements
  {
    id: 'perfect_week',
    title: 'Perfect Week',
    description: 'Cancel all impulses in a week (no regrets)',
    category: 'SPECIAL',
    rarity: 'EPIC',
    icon: '✨',
    threshold: 1,
    xpReward: 500,
    checkCondition: (stats: UserStats, impulses: Impulse[]) => {
      // Check if last week had all cancelled, no executed
      const now = Date.now();
      const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
      const weekImpulses = impulses.filter(i => i.createdAt >= weekAgo);
      if (weekImpulses.length === 0) return 0;
      const allCancelled = weekImpulses.every(i => i.status === 'CANCELLED');
      return allCancelled ? 1 : 0;
    },
  },
  {
    id: 'no_regrets',
    title: 'No Regrets',
    description: 'Have 0% regret rate with 10+ executed impulses',
    category: 'SPECIAL',
    rarity: 'EPIC',
    icon: '😊',
    threshold: 1,
    xpReward: 750,
    checkCondition: (stats: UserStats) => {
      return stats.totalExecuted >= 10 && stats.regretRate === 0 ? 1 : 0;
    },
  },
  {
    id: 'first_impulse',
    title: 'First Step',
    description: 'Log your first impulse',
    category: 'SPECIAL',
    rarity: 'COMMON',
    icon: '🎉',
    threshold: 1,
    xpReward: 25,
    checkCondition: (stats: UserStats, impulses: Impulse[]) => impulses.length >= 1 ? 1 : 0,
  },
];

// XP required for each level (exponential growth)
export const XP_PER_LEVEL = [
  0,    // Level 1 (starting level)
  100,  // Level 2
  250,  // Level 3
  500,  // Level 4
  1000, // Level 5
  2000, // Level 6
  3500, // Level 7
  5500, // Level 8
  8000, // Level 9
  12000, // Level 10
  17000, // Level 11
  25000, // Level 12
  35000, // Level 13
  50000, // Level 14
  70000, // Level 15
  100000, // Level 16+
];

export function getXPForLevel(level: number): number {
  if (level <= 1) return 0;
  if (level <= XP_PER_LEVEL.length) {
    return XP_PER_LEVEL[level - 1];
  }
  // Exponential growth for higher levels
  const baseXP = XP_PER_LEVEL[XP_PER_LEVEL.length - 1];
  const levelsOver = level - XP_PER_LEVEL.length;
  return baseXP + (levelsOver * 50000);
}

export type UserLevel = {
  level: number;
  currentXP: number;
  xpForNextLevel: number;
  totalXP: number;
  progress: number;
};

export function calculateLevel(totalXP: number): UserLevel {
  let level = 1;
  let currentXP = totalXP;
  let xpForNextLevel = getXPForLevel(level + 1);

  while (currentXP >= xpForNextLevel && level < 100) {
    currentXP -= xpForNextLevel;
    level++;
    xpForNextLevel = getXPForLevel(level + 1);
  }

  const progress = xpForNextLevel > 0 
    ? (currentXP / xpForNextLevel) * 100 
    : 100;

  return {
    level,
    currentXP,
    xpForNextLevel,
    totalXP,
    progress: Math.min(100, Math.max(0, progress)),
  };
}

