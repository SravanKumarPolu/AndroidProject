/**
 * Achievement & Gamification Types
 * Efficient, event-driven achievement system
 */

export type AchievementCategory = 
  | 'STREAK' 
  | 'SAVINGS' 
  | 'CANCELLATIONS' 
  | 'CATEGORY' 
  | 'TIME' 
  | 'SPECIAL';

export type AchievementRarity = 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  category: AchievementCategory;
  rarity: AchievementRarity;
  icon: string; // Emoji or icon name
  threshold: number; // Value needed to unlock
  xpReward: number; // XP points awarded
  unlockedAt?: number; // Timestamp when unlocked
  progress?: number; // Current progress (0-100)
}

export interface AchievementProgress {
  achievement: Achievement;
  current: number; // Current value
  target: number; // Target value
  progress: number; // 0-100 percentage
  isUnlocked: boolean;
  unlockedAt?: number;
}

export interface UserLevel {
  level: number;
  currentXP: number;
  xpForNextLevel: number;
  totalXP: number;
  progress: number; // 0-100 percentage to next level
}

export interface GamificationStats {
  totalXP: number;
  level: number;
  achievementsUnlocked: number;
  achievementsTotal: number;
  recentAchievements: Achievement[]; // Last 5 unlocked
}

/**
 * Achievement definitions
 * These are the templates - actual achievements are created from these
 */
export interface AchievementDefinition {
  id: string;
  title: string;
  description: string;
  category: AchievementCategory;
  rarity: AchievementRarity;
  icon: string;
  threshold: number;
  xpReward: number;
  checkCondition: (stats: any, impulses: any[], categoryStats?: any[]) => number; // Returns current progress value
}

