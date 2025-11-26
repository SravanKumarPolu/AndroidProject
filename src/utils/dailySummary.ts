import { Impulse } from '@/types/impulse';
import { formatCurrency } from './currency';
import { formatDate } from './date';

export interface DailySummary {
  date: number; // Start of day timestamp
  totalLogged: number;
  totalCancelled: number;
  totalExecuted: number;
  totalRegretted: number;
  moneySaved: number;
  moneyRegretted: number;
  regretRate: number;
  narrative?: string;
}

/**
 * Get daily summary data for a specific day
 */
export function getDailySummary(impulses: Impulse[], date: number): DailySummary {
  const dayStart = new Date(date);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(dayStart);
  dayEnd.setHours(23, 59, 59, 999);
  
  const dayImpulses = impulses.filter(
    i => i.createdAt >= dayStart.getTime() && i.createdAt <= dayEnd.getTime()
  );

  const cancelled = dayImpulses.filter(i => i.status === 'CANCELLED');
  const executed = dayImpulses.filter(i => i.status === 'EXECUTED');
  // Count regrets: finalFeeling === 'REGRET' OR regretRating >= 3
  const regretted = executed.filter(i => 
    i.finalFeeling === 'REGRET' || (i.regretRating !== undefined && i.regretRating >= 3)
  );

  const moneySaved = cancelled.reduce((sum, i) => sum + (i.price || 0), 0);
  const moneyRegretted = regretted.reduce((sum, i) => sum + (i.price || 0), 0);
  const regretRate = executed.length > 0 
    ? (regretted.length / executed.length) * 100 
    : 0;

  // Narrative summary
  let narrative: string | undefined;
  try {
    const { CATEGORY_LABELS } = require('@/constants/categories');
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
      if (cancelled.length === 1) {
        narrative = `Saved ${formatCurrency(moneySaved)} by avoiding 1 impulse`;
      } else if (categoryLabel) {
        narrative = `Saved ${formatCurrency(moneySaved)} on ${categoryLabel.toLowerCase()}`;
      } else {
        narrative = `Saved ${formatCurrency(moneySaved)} by skipping ${cancelled.length} impulses`;
      }
    } else if (dayImpulses.length > 0 && cancelled.length === 0) {
      narrative = `Logged ${dayImpulses.length} impulse${dayImpulses.length !== 1 ? 's' : ''} today`;
    }
  } catch {
    // Best-effort narrative; ignore errors
  }

  return {
    date: dayStart.getTime(),
    totalLogged: dayImpulses.length,
    totalCancelled: cancelled.length,
    totalExecuted: executed.length,
    totalRegretted: regretted.length,
    moneySaved,
    moneyRegretted,
    regretRate: Math.round(regretRate * 10) / 10,
    narrative,
  };
}

/**
 * Get today's summary
 */
export function getTodaySummary(impulses: Impulse[]): DailySummary {
  const now = Date.now();
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  
  return getDailySummary(impulses, today.getTime());
}

/**
 * Get yesterday's summary
 */
export function getYesterdaySummary(impulses: Impulse[]): DailySummary {
  const now = Date.now();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(0, 0, 0, 0);
  
  return getDailySummary(impulses, yesterday.getTime());
}

/**
 * Format daily summary for display
 */
export function formatDailySummary(summary: DailySummary): string {
  const dateLabel = summary.date === new Date().setHours(0, 0, 0, 0) 
    ? 'Today' 
    : formatDate(summary.date);
  
  return `${dateLabel}:
• ${summary.totalLogged} impulse${summary.totalLogged !== 1 ? 's' : ''} logged
• ${summary.totalCancelled} avoided (saved ${formatCurrency(summary.moneySaved)})
• ${summary.totalExecuted} executed
${summary.totalExecuted > 0 ? `• ${summary.totalRegretted} regretted (${summary.regretRate.toFixed(0)}% regret rate)` : ''}`;
}

