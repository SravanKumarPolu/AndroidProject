import { Impulse } from '@/types/impulse';

export interface ReportMetrics {
  totalLogged: number;
  totalSkipped: number;
  totalBought: number;
  totalSaved: number;
  totalSpent: number;
  skipRate: number;
  avgRegretScore: number | null;
  topCategories: Array<{ category: string; count: number }>;
}

export function getWeekRange(weekOffset: number = 0): { start: number; end: number } {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - dayOfWeek - (weekOffset * 7));
  startOfWeek.setHours(0, 0, 0, 0);
  
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);
  
  return {
    start: startOfWeek.getTime(),
    end: endOfWeek.getTime(),
  };
}

export function getMonthRange(monthOffset: number = 0): { start: number; end: number } {
  const now = new Date();
  const date = new Date(now.getFullYear(), now.getMonth() - monthOffset, 1);
  const start = date.getTime();
  
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
  
  return {
    start,
    end: end.getTime(),
  };
}

export function calculateReportMetrics(
  impulses: Impulse[],
  startTime: number,
  endTime: number
): ReportMetrics {
  const filtered = impulses.filter(
    (imp) => imp.createdAt >= startTime && imp.createdAt <= endTime
  );

  const skipped = filtered.filter((imp) => imp.decisionAtEnd === 'skipped' || imp.status === 'skipped');
  const bought = filtered.filter((imp) => imp.decisionAtEnd === 'bought' || imp.status === 'bought');
  
  const totalSaved = skipped.reduce((sum, imp) => sum + imp.price, 0);
  const totalSpent = bought.reduce((sum, imp) => sum + imp.price, 0);
  
  const skipRate = filtered.length > 0 ? skipped.length / filtered.length : 0;
  
  const regretScores = bought
    .map((imp) => imp.regretScore)
    .filter((score): score is number => score !== null && score !== undefined);
  const avgRegretScore = regretScores.length > 0
    ? regretScores.reduce((sum, score) => sum + score, 0) / regretScores.length
    : null;

  // Top categories
  const categoryCounts = filtered.reduce((acc, imp) => {
    acc[imp.category] = (acc[imp.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topCategories = Object.entries(categoryCounts)
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);

  return {
    totalLogged: filtered.length,
    totalSkipped: skipped.length,
    totalBought: bought.length,
    totalSaved,
    totalSpent,
    skipRate,
    avgRegretScore,
    topCategories,
  };
}

export function getEmotionalTriggers(impulses: Impulse[]): Array<{
  emotion: string;
  count: number;
  avgRegret: number | null;
  skipRate: number;
  buyRate: number;
}> {
  const emotionMap = new Map<string, {
    count: number;
    regrets: number[];
    skipped: number;
    bought: number;
  }>();

  impulses.forEach((imp) => {
    const emotion = imp.emotionAtImpulse || 'neutral';
    const entry = emotionMap.get(emotion) || {
      count: 0,
      regrets: [],
      skipped: 0,
      bought: 0,
    };

    entry.count++;
    
    if (imp.regretScore !== null && imp.regretScore !== undefined) {
      entry.regrets.push(imp.regretScore);
    }
    
    if (imp.decisionAtEnd === 'skipped' || imp.status === 'skipped') {
      entry.skipped++;
    } else if (imp.decisionAtEnd === 'bought' || imp.status === 'bought') {
      entry.bought++;
    }

    emotionMap.set(emotion, entry);
  });

  return Array.from(emotionMap.entries())
    .map(([emotion, data]) => ({
      emotion,
      count: data.count,
      avgRegret: data.regrets.length > 0
        ? data.regrets.reduce((sum, r) => sum + r, 0) / data.regrets.length
        : null,
      skipRate: data.count > 0 ? data.skipped / data.count : 0,
      buyRate: data.count > 0 ? data.bought / data.count : 0,
    }))
    .sort((a, b) => b.count - a.count);
}

export function calculateImpulseScore(metrics: {
  skipRate: number; // 0-1
  avgRegret: number | null; // 0-100
  weeklyImpulseCount: number;
}): number {
  let score = 50; // Base score

  // Add points for high skip rate (up to +30 points)
  score += metrics.skipRate * 30;

  // Add points for low regret (up to +20 points)
  if (metrics.avgRegret !== null) {
    const regretBonus = (100 - metrics.avgRegret) / 100 * 20;
    score += regretBonus;
  }

  // Reduce points for too many impulses (penalty for frequency)
  // More impulses = lower score (up to -20 points)
  if (metrics.weeklyImpulseCount > 10) {
    score -= Math.min(20, (metrics.weeklyImpulseCount - 10) * 2);
  }

  // Clamp between 0 and 100
  return Math.max(0, Math.min(100, Math.round(score)));
}

