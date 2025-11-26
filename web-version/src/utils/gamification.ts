import { Impulse } from '@/types/impulse';

export interface UserStats {
  xp: number;
  level: number;
  currentLevelXP: number;
  nextLevelXP: number;
  streak: number;
  longestStreak: number;
  totalSkipped: number;
  totalSaved: number;
}

const XP_PER_SKIP = 50;
const XP_PER_DAY_STREAK = 25;
const BASE_XP_FOR_LEVEL = 200;
const XP_MULTIPLIER = 1.2; // Each level requires 20% more XP

/**
 * Calculate XP needed for a specific level
 */
export function getXPForLevel(level: number): number {
  if (level === 1) return 0;
  return Math.floor(BASE_XP_FOR_LEVEL * Math.pow(XP_MULTIPLIER, level - 2));
}

/**
 * Calculate level from total XP
 */
export function getLevelFromXP(xp: number): number {
  if (xp < BASE_XP_FOR_LEVEL) return 1;
  
  let level = 1;
  let requiredXP = 0;
  
  while (requiredXP <= xp) {
    level++;
    requiredXP = getXPForLevel(level);
  }
  
  return level - 1;
}

/**
 * Calculate current streak (consecutive days with at least one skipped impulse)
 */
export function calculateStreak(impulses: Impulse[]): number {
  if (impulses.length === 0) return 0;
  
  const skippedImpulses = impulses
    .filter((imp) => imp.decisionAtEnd === 'skipped' || imp.status === 'skipped')
    .map((imp) => imp.decisionAt || imp.createdAt)
    .sort((a, b) => b - a);
  
  if (skippedImpulses.length === 0) return 0;
  
  // Group by day
  const daysWithSkips = new Set<number>();
  skippedImpulses.forEach((timestamp) => {
    const date = new Date(timestamp);
    const dayKey = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
    daysWithSkips.add(dayKey);
  });
  
  const sortedDays = Array.from(daysWithSkips).sort((a, b) => b - a);
  if (sortedDays.length === 0) return 0;
  
  // Check consecutive days
  let streak = 1;
  const today = new Date();
  const todayKey = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  
  // If today has a skip, start from today
  let currentDay = sortedDays[0];
  if (currentDay === todayKey) {
    for (let i = 1; i < sortedDays.length; i++) {
      const expectedDay = currentDay - (24 * 60 * 60 * 1000);
      if (sortedDays[i] === expectedDay) {
        streak++;
        currentDay = sortedDays[i];
      } else {
        break;
      }
    }
  } else {
    // If today doesn't have a skip, check if yesterday does
    const yesterday = todayKey - (24 * 60 * 60 * 1000);
    if (sortedDays[0] === yesterday) {
      streak = 1;
      currentDay = sortedDays[0];
      for (let i = 1; i < sortedDays.length; i++) {
        const expectedDay = currentDay - (24 * 60 * 60 * 1000);
        if (sortedDays[i] === expectedDay) {
          streak++;
          currentDay = sortedDays[i];
        } else {
          break;
        }
      }
    } else {
      return 0; // No recent streak
    }
  }
  
  return streak;
}

/**
 * Calculate longest streak ever
 */
export function calculateLongestStreak(impulses: Impulse[]): number {
  if (impulses.length === 0) return 0;
  
  const skippedImpulses = impulses
    .filter((imp) => imp.decisionAtEnd === 'skipped' || imp.status === 'skipped')
    .map((imp) => imp.decisionAt || imp.createdAt)
    .sort((a, b) => a - b); // Sort ascending
  
  if (skippedImpulses.length === 0) return 0;
  
  // Group by day
  const daysWithSkips = new Set<number>();
  skippedImpulses.forEach((timestamp) => {
    const date = new Date(timestamp);
    const dayKey = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
    daysWithSkips.add(dayKey);
  });
  
  const sortedDays = Array.from(daysWithSkips).sort((a, b) => a - b);
  if (sortedDays.length === 0) return 0;
  
  let longestStreak = 1;
  let currentStreak = 1;
  
  for (let i = 1; i < sortedDays.length; i++) {
    const expectedDay = sortedDays[i - 1] + (24 * 60 * 60 * 1000);
    if (sortedDays[i] === expectedDay) {
      currentStreak++;
    } else {
      longestStreak = Math.max(longestStreak, currentStreak);
      currentStreak = 1;
    }
  }
  
  return Math.max(longestStreak, currentStreak);
}

/**
 * Calculate total XP from all impulses
 */
export function calculateXP(impulses: Impulse[]): number {
  let xp = 0;
  
  // XP from skipped impulses
  const skippedCount = impulses.filter(
    (imp) => imp.decisionAtEnd === 'skipped' || imp.status === 'skipped'
  ).length;
  xp += skippedCount * XP_PER_SKIP;
  
  // XP from streak
  const streak = calculateStreak(impulses);
  xp += streak * XP_PER_DAY_STREAK;
  
  return xp;
}

/**
 * Get user stats (XP, level, streak, etc.)
 */
export function getUserStats(impulses: Impulse[]): UserStats {
  const xp = calculateXP(impulses);
  const level = getLevelFromXP(xp);
  const currentLevelXP = getXPForLevel(level);
  const nextLevelXP = getXPForLevel(level + 1);
  const streak = calculateStreak(impulses);
  const longestStreak = calculateLongestStreak(impulses);
  
  const totalSkipped = impulses.filter(
    (imp) => imp.decisionAtEnd === 'skipped' || imp.status === 'skipped'
  ).length;
  
  const totalSaved = impulses
    .filter((imp) => imp.decisionAtEnd === 'skipped' || imp.status === 'skipped')
    .reduce((sum, imp) => sum + imp.price, 0);
  
  return {
    xp,
    level,
    currentLevelXP,
    nextLevelXP,
    streak,
    longestStreak,
    totalSkipped,
    totalSaved,
  };
}

