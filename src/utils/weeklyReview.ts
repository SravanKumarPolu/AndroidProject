import { Impulse } from '@/types/impulse';
import { formatCurrency } from './currency';
import { formatDate } from './date';

export interface WeeklyReview {
  weekStart: number;
  weekEnd: number;
  totalLogged: number;
  totalCancelled: number;
  totalExecuted: number;
  totalRegretted: number;
  moneySaved: number;
  moneyRegretted: number;
  regretRate: number;
  streak: number;
  narrative?: string;
}

/**
 * Get weekly review data for a specific week
 */
export function getWeeklyReview(impulses: Impulse[], weekStart: number): WeeklyReview {
  const weekEnd = weekStart + 7 * 24 * 60 * 60 * 1000; // 7 days later
  
  const weekImpulses = impulses.filter(
    i => i.createdAt >= weekStart && i.createdAt < weekEnd
  );

  const cancelled = weekImpulses.filter(i => i.status === 'CANCELLED');
  const executed = weekImpulses.filter(i => i.status === 'EXECUTED');
  // Count regrets: finalFeeling === 'REGRET' OR regretRating >= 3
  const regretted = executed.filter(i => 
    i.finalFeeling === 'REGRET' || (i.regretRating !== undefined && i.regretRating >= 3)
  );

  const moneySaved = cancelled.reduce((sum, i) => sum + (i.price || 0), 0);
  const moneyRegretted = regretted.reduce((sum, i) => sum + (i.price || 0), 0);
  const regretRate = executed.length > 0 
    ? (regretted.length / executed.length) * 100 
    : 0;

  // Calculate streak (consecutive days with at least one cancelled impulse)
  let streak = 0;
  const cancelledByDay = new Map<number, number>();
  cancelled.forEach(i => {
    const day = Math.floor(i.createdAt / (24 * 60 * 60 * 1000));
    cancelledByDay.set(day, (cancelledByDay.get(day) || 0) + 1);
  });

  const sortedDays = Array.from(cancelledByDay.keys()).sort((a, b) => b - a);
  for (let i = 0; i < sortedDays.length; i++) {
    if (i === 0 || sortedDays[i] === sortedDays[i - 1] - 1) {
      streak++;
    } else {
      break;
    }
  }

  // Narrative summary
  let narrative: string | undefined;
  try {
    const { getWeakHours, getTimeOfDayLabel } = require('./timePatterns');
    const { CATEGORY_LABELS } = require('@/constants/categories');
    const { highFrequency } = getWeakHours(weekImpulses);
    const topHour = highFrequency.length > 0 ? highFrequency[0].hour : undefined;
    const timeLabel = typeof topHour === 'number' ? getTimeOfDayLabel(topHour) : undefined;
    // Top cancelled category
    const cancelledByCategory = new Map<string, number>();
    cancelled.forEach(i => {
      const key = i.category;
      cancelledByCategory.set(key, (cancelledByCategory.get(key) || 0) + (i.price || 0));
    });
    const topCancelled = Array.from(cancelledByCategory.entries())
      .sort((a, b) => b[1] - a[1])[0]?.[0];
    const categoryLabel = topCancelled ? CATEGORY_LABELS[topCancelled] : undefined;
    if (moneySaved > 0) {
      if (timeLabel === 'Night' && topCancelled === 'FOOD') {
        narrative = `Saved ${formatCurrency(moneySaved)} from late-night orders`;
      } else if (timeLabel) {
        narrative = `Saved ${formatCurrency(moneySaved)} during ${timeLabel.toLowerCase()} urges`;
      } else if (categoryLabel) {
        narrative = `Saved ${formatCurrency(moneySaved)} on ${categoryLabel.toLowerCase()}`;
      } else {
        narrative = `Saved ${formatCurrency(moneySaved)} by skipping ${cancelled.length} impulse${cancelled.length !== 1 ? 's' : ''}`;
      }
    }
  } catch {
    // Best-effort narrative; ignore errors
  }

  return {
    weekStart,
    weekEnd,
    totalLogged: weekImpulses.length,
    totalCancelled: cancelled.length,
    totalExecuted: executed.length,
    totalRegretted: regretted.length,
    moneySaved,
    moneyRegretted,
    regretRate: Math.round(regretRate * 10) / 10,
    streak,
    narrative,
  };
}

/**
 * Get current week's review
 */
export function getCurrentWeekReview(impulses: Impulse[]): WeeklyReview {
  const now = Date.now();
  const today = new Date(now);
  const dayOfWeek = today.getDay();
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - dayOfWeek);
  weekStart.setHours(0, 0, 0, 0);
  
  return getWeeklyReview(impulses, weekStart.getTime());
}

/**
 * Get last week's review
 */
export function getLastWeekReview(impulses: Impulse[]): WeeklyReview {
  const now = Date.now();
  const today = new Date(now);
  const dayOfWeek = today.getDay();
  const lastWeekStart = new Date(today);
  lastWeekStart.setDate(today.getDate() - dayOfWeek - 7);
  lastWeekStart.setHours(0, 0, 0, 0);
  
  return getWeeklyReview(impulses, lastWeekStart.getTime());
}

/**
 * Format weekly review for display
 */
export function formatWeeklyReview(review: WeeklyReview): string {
  return `Week of ${formatDate(review.weekStart)}:
• ${review.totalLogged} impulses logged
• ${review.totalCancelled} avoided (saved ${formatCurrency(review.moneySaved)})
• ${review.totalExecuted} executed
• ${review.totalRegretted} regretted (${review.regretRate.toFixed(0)}% regret rate)
• ${review.streak}-day streak`;
}

