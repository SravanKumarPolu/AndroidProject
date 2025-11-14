import { Impulse, UserStats, CategoryStats } from '@/types/impulse';
import { ImpulseCategory } from '@/types/impulse';

/**
 * Statistics computation utilities
 * Efficient, on-the-fly calculations
 */

export const computeStats = (impulses: Impulse[]): UserStats => {
  const now = Date.now();
  const todayStart = new Date().setHours(0, 0, 0, 0);

  const cancelled = impulses.filter(i => i.status === 'CANCELLED');
  const executed = impulses.filter(i => i.status === 'EXECUTED');
  // Count regrets: finalFeeling === 'REGRET' OR regretRating >= 3
  const regretted = executed.filter(i => 
    i.finalFeeling === 'REGRET' || (i.regretRating !== undefined && i.regretRating >= 3)
  );

  const totalSaved = cancelled.reduce((sum, i) => sum + (i.price || 0), 0);
  const totalRegretted = regretted.reduce((sum, i) => sum + (i.price || 0), 0);
  const totalExecuted = executed.length;
  const totalCancelled = cancelled.length;

  const regretRate = totalExecuted > 0 
    ? (regretted.length / totalExecuted) * 100 
    : 0;

  // Calculate streak (days without executing an impulse)
  const executedSorted = executed
    .filter(i => i.executedAt)
    .sort((a, b) => (b.executedAt || 0) - (a.executedAt || 0));

  let currentStreak = 0;
  if (executedSorted.length === 0) {
    // If no executed impulses, streak = days since first logged impulse
    const firstImpulse = impulses.sort((a, b) => a.createdAt - b.createdAt)[0];
    if (firstImpulse) {
      const daysSinceFirst = Math.floor((now - firstImpulse.createdAt) / (24 * 60 * 60 * 1000));
      currentStreak = daysSinceFirst;
    }
  } else {
    const lastExecuted = executedSorted[0].executedAt || 0;
    const daysSinceLast = Math.floor((now - lastExecuted) / (24 * 60 * 60 * 1000));
    currentStreak = daysSinceLast;
  }

  // Calculate longest streak
  let longestStreak = 0;
  let tempStreak = 0;
  const allImpulsesSorted = impulses.sort((a, b) => a.createdAt - b.createdAt);
  
  for (let i = 0; i < allImpulsesSorted.length; i++) {
    const impulse = allImpulsesSorted[i];
    if (impulse.status === 'CANCELLED') {
      tempStreak++;
      longestStreak = Math.max(longestStreak, tempStreak);
    } else if (impulse.status === 'EXECUTED') {
      tempStreak = 0;
    }
  }

  // Today's stats
  const todayImpulses = impulses.filter(i => i.createdAt >= todayStart);
  const todayCancelled = todayImpulses.filter(i => i.status === 'CANCELLED');
  const todaySaved = todayCancelled.reduce((sum, i) => sum + (i.price || 0), 0);

  return {
    totalSaved,
    totalRegretted,
    totalExecuted,
    totalCancelled,
    regretRate: Math.round(regretRate * 10) / 10,
    currentStreak,
    longestStreak,
    todaySaved,
    todayLogged: todayImpulses.length,
  };
};

export const computeCategoryStats = (impulses: Impulse[]): CategoryStats[] => {
  const categories: ImpulseCategory[] = [
    'FOOD',
    'SHOPPING',
    'ENTERTAINMENT',
    'TRADING',
    'CRYPTO',
    'COURSE',
    'SUBSCRIPTION',
    'OTHER',
  ];

  return categories.map(category => {
    const categoryImpulses = impulses.filter(i => i.category === category);
    const cancelled = categoryImpulses.filter(i => i.status === 'CANCELLED');
    const executed = categoryImpulses.filter(i => i.status === 'EXECUTED');
    // Count regrets: finalFeeling === 'REGRET' OR regretRating >= 3
    const regretted = executed.filter(i => 
      i.finalFeeling === 'REGRET' || (i.regretRating !== undefined && i.regretRating >= 3)
    );

    const totalPrice = categoryImpulses
      .filter(i => i.price)
      .reduce((sum, i) => sum + (i.price || 0), 0);
    const avgPrice = categoryImpulses.length > 0 
      ? totalPrice / categoryImpulses.length 
      : 0;

    const regretRate = executed.length > 0 
      ? (regretted.length / executed.length) * 100 
      : 0;

    return {
      category,
      totalLogged: categoryImpulses.length,
      totalCancelled: cancelled.length,
      totalRegretted: regretted.length,
      avgPrice: Math.round(avgPrice),
      regretRate: Math.round(regretRate * 10) / 10,
    };
  }).filter(stat => stat.totalLogged > 0);
};

