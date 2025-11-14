import { Impulse } from '@/types/impulse';

/**
 * Calculate monthly statistics
 */

export interface MonthlyStats {
  monthStart: number;
  monthEnd: number;
  totalSaved: number;
  totalLogged: number;
  totalCancelled: number;
  totalExecuted: number;
  totalRegretted: number;
  regretRate: number;
}

/**
 * Get current month's statistics
 */
export function getCurrentMonthStats(impulses: Impulse[]): MonthlyStats {
  const now = Date.now();
  const date = new Date(now);
  const monthStart = new Date(date.getFullYear(), date.getMonth(), 1).getTime();
  const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999).getTime();

  const monthImpulses = impulses.filter(
    i => i.createdAt >= monthStart && i.createdAt <= monthEnd
  );

  const cancelled = monthImpulses.filter(i => i.status === 'CANCELLED');
  const executed = monthImpulses.filter(i => i.status === 'EXECUTED');
  // Count regrets: finalFeeling === 'REGRET' OR regretRating >= 3
  const regretted = executed.filter(i => 
    i.finalFeeling === 'REGRET' || (i.regretRating !== undefined && i.regretRating >= 3)
  );

  const totalSaved = cancelled.reduce((sum, i) => sum + (i.price || 0), 0);
  const regretRate = executed.length > 0 
    ? (regretted.length / executed.length) * 100 
    : 0;

  return {
    monthStart,
    monthEnd,
    totalSaved,
    totalLogged: monthImpulses.length,
    totalCancelled: cancelled.length,
    totalExecuted: executed.length,
    totalRegretted: regretted.length,
    regretRate: Math.round(regretRate * 10) / 10,
  };
}

