import { CategoryStats } from '@/types/impulse';

/**
 * Find the most dangerous category (highest regret rate or highest spending)
 */
export function getMostDangerousCategory(categoryStats: CategoryStats[]): CategoryStats | undefined {
  if (categoryStats.length === 0) return undefined;

  // Sort by regret rate first, then by total logged
  const sorted = [...categoryStats].sort((a, b) => {
    // Prioritize categories with high regret rate and high execution count
    const aScore = a.regretRate * (a.totalLogged - a.totalCancelled); // regret rate * executed count
    const bScore = b.regretRate * (b.totalLogged - b.totalCancelled);
    
    if (bScore !== aScore) {
      return bScore - aScore;
    }
    // If scores are equal, prefer higher regret rate
    if (b.regretRate !== a.regretRate) {
      return b.regretRate - a.regretRate;
    }
    // Finally, prefer more logged
    return b.totalLogged - a.totalLogged;
  });

  return sorted[0];
}

