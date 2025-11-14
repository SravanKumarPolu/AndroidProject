import { useMemo } from 'react';
import { Impulse, UserStats, CategoryStats } from '@/types/impulse';
import { computeStats, computeCategoryStats } from '@/utils/stats';

/**
 * Custom hook for computing statistics
 * Efficient, memoized calculations
 */

export function useStats(impulses: Impulse[]) {
  const stats = useMemo<UserStats>(() => {
    return computeStats(impulses);
  }, [impulses]);

  const categoryStats = useMemo<CategoryStats[]>(() => {
    return computeCategoryStats(impulses);
  }, [impulses]);

  const activeImpulses = useMemo(() => {
    return impulses.filter(i => i.status === 'LOCKED');
  }, [impulses]);

  const readyToReview = useMemo(() => {
    const now = Date.now();
    return activeImpulses.filter(i => i.reviewAt <= now);
  }, [activeImpulses]);

  return {
    stats,
    categoryStats,
    activeImpulses,
    readyToReview,
  };
}

