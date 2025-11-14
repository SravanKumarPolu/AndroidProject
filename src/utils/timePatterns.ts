import { Impulse } from '@/types/impulse';

export interface TimePattern {
  hour: number; // 0-23
  impulseCount: number;
  regretCount: number;
  regretRate: number;
}

/**
 * Analyze impulse patterns by hour of day
 */
export function analyzeTimePatterns(impulses: Impulse[]): TimePattern[] {
  const hourData = new Map<number, { total: number; regrets: number }>();

  // Initialize all hours
  for (let i = 0; i < 24; i++) {
    hourData.set(i, { total: 0, regrets: 0 });
  }

  // Count impulses and regrets by hour
  impulses.forEach(impulse => {
    const date = new Date(impulse.createdAt);
    const hour = date.getHours();
    const data = hourData.get(hour)!;
    data.total++;

    if (impulse.finalFeeling === 'REGRET') {
      data.regrets++;
    }
  });

  // Convert to array and calculate regret rates
  return Array.from(hourData.entries())
    .map(([hour, data]) => ({
      hour,
      impulseCount: data.total,
      regretCount: data.regrets,
      regretRate: data.total > 0 ? (data.regrets / data.total) * 100 : 0,
    }))
    .filter(pattern => pattern.impulseCount > 0) // Only show hours with impulses
    .sort((a, b) => b.impulseCount - a.impulseCount); // Sort by frequency
}

/**
 * Get weak hours (high impulse count or high regret rate)
 */
export function getWeakHours(impulses: Impulse[]): {
  highFrequency: TimePattern[];
  highRegret: TimePattern[];
} {
  const patterns = analyzeTimePatterns(impulses);
  
  const avgFrequency = patterns.reduce((sum, p) => sum + p.impulseCount, 0) / patterns.length || 1;
  const avgRegretRate = patterns.reduce((sum, p) => sum + p.regretRate, 0) / patterns.length || 0;

  return {
    highFrequency: patterns
      .filter(p => p.impulseCount > avgFrequency * 1.5)
      .slice(0, 5),
    highRegret: patterns
      .filter(p => p.regretRate > avgRegretRate * 1.2 && p.impulseCount >= 2)
      .slice(0, 5),
  };
}

/**
 * Format hour for display
 */
export function formatHour(hour: number): string {
  if (hour === 0) return '12 AM';
  if (hour < 12) return `${hour} AM`;
  if (hour === 12) return '12 PM';
  return `${hour - 12} PM`;
}

/**
 * Get time of day label
 */
export function getTimeOfDayLabel(hour: number): string {
  if (hour >= 5 && hour < 12) return 'Morning';
  if (hour >= 12 && hour < 17) return 'Afternoon';
  if (hour >= 17 && hour < 21) return 'Evening';
  return 'Night';
}

