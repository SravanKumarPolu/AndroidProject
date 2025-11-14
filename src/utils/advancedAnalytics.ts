import { Impulse, CategoryStats } from '@/types/impulse';
import { formatCurrency } from './currency';
import { formatDate } from './date';

/**
 * Advanced analytics utilities
 * Provides deeper insights and trends
 */

export interface TrendAnalysis {
  period: string;
  value: number;
  change: number; // Percentage change from previous period
  trend: 'up' | 'down' | 'stable';
}

export interface SpendingTrend {
  period: string;
  totalSpent: number;
  totalSaved: number;
  impulsesLogged: number;
  impulsesCancelled: number;
  impulsesExecuted: number;
  regretRate: number;
}

export interface CategoryTrend {
  category: string;
  currentPeriod: number;
  previousPeriod: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
}

export interface Insight {
  type: 'success' | 'warning' | 'info' | 'achievement';
  title: string;
  message: string;
  action?: string;
}

/**
 * Calculate monthly spending trends
 */
export function calculateMonthlyTrends(impulses: Impulse[], months: number = 6): SpendingTrend[] {
  const trends: SpendingTrend[] = [];
  const now = new Date();
  
  for (let i = months - 1; i >= 0; i--) {
    const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);
    
    const monthImpulses = impulses.filter(
      i => i.createdAt >= monthStart.getTime() && i.createdAt <= monthEnd.getTime()
    );
    
    const cancelled = monthImpulses.filter(i => i.status === 'CANCELLED');
    const executed = monthImpulses.filter(i => i.status === 'EXECUTED');
    const regretted = executed.filter(i => i.finalFeeling === 'REGRET');
    
    const totalSpent = executed.reduce((sum, i) => sum + (i.price || 0), 0);
    const totalSaved = cancelled.reduce((sum, i) => sum + (i.price || 0), 0);
    const regretRate = executed.length > 0 ? (regretted.length / executed.length) * 100 : 0;
    
    trends.push({
      period: `${monthStart.toLocaleString('default', { month: 'short' })} ${monthStart.getFullYear()}`,
      totalSpent,
      totalSaved,
      impulsesLogged: monthImpulses.length,
      impulsesCancelled: cancelled.length,
      impulsesExecuted: executed.length,
      regretRate: Math.round(regretRate * 10) / 10,
    });
  }
  
  return trends;
}

/**
 * Calculate category trends
 */
export function calculateCategoryTrends(impulses: Impulse[]): CategoryTrend[] {
  const now = new Date();
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
  
  const currentMonthImpulses = impulses.filter(
    i => i.createdAt >= currentMonthStart.getTime()
  );
  const previousMonthImpulses = impulses.filter(
    i => i.createdAt >= previousMonthStart.getTime() && i.createdAt <= previousMonthEnd.getTime()
  );
  
  const categories = new Set([
    ...currentMonthImpulses.map(i => i.category),
    ...previousMonthImpulses.map(i => i.category),
  ]);
  
  return Array.from(categories).map(category => {
    const currentSpent = currentMonthImpulses
      .filter(i => i.category === category && i.status === 'EXECUTED')
      .reduce((sum, i) => sum + (i.price || 0), 0);
    
    const previousSpent = previousMonthImpulses
      .filter(i => i.category === category && i.status === 'EXECUTED')
      .reduce((sum, i) => sum + (i.price || 0), 0);
    
    const change = previousSpent > 0 
      ? ((currentSpent - previousSpent) / previousSpent) * 100 
      : currentSpent > 0 ? 100 : 0;
    
    let trend: 'up' | 'down' | 'stable' = 'stable';
    if (Math.abs(change) > 10) {
      trend = change > 0 ? 'up' : 'down';
    }
    
    return {
      category,
      currentPeriod: currentSpent,
      previousPeriod: previousSpent,
      change: Math.round(change * 10) / 10,
      trend,
    };
  }).filter(trend => trend.currentPeriod > 0 || trend.previousPeriod > 0);
}

/**
 * Generate personalized insights
 */
export function generateInsights(impulses: Impulse[], stats: any, categoryStats: CategoryStats[]): Insight[] {
  const insights: Insight[] = [];
  
  // Savings insights
  if (stats.totalSaved > 0) {
    const avgSavedPerCancelled = stats.totalCancelled > 0 
      ? stats.totalSaved / stats.totalCancelled 
      : 0;
    
    if (avgSavedPerCancelled > 1000) {
      insights.push({
        type: 'success',
        title: 'High-Value Savings',
        message: `You're saving an average of ${formatCurrency(avgSavedPerCancelled)} per avoided impulse!`,
      });
    }
  }
  
  // Regret rate insights
  if (stats.regretRate > 50) {
    insights.push({
      type: 'warning',
      title: 'High Regret Rate',
      message: `Your regret rate is ${stats.regretRate.toFixed(0)}%. Consider longer cool-down periods for high-value items.`,
      action: 'Adjust cool-down settings',
    });
  } else if (stats.regretRate < 20 && stats.totalExecuted > 5) {
    insights.push({
      type: 'success',
      title: 'Great Decision Making',
      message: `Only ${stats.regretRate.toFixed(0)}% regret rate! You're making thoughtful purchases.`,
    });
  }
  
  // Category insights
  const highRegretCategory = categoryStats
    .filter(cs => cs.totalRegretted > 0)
    .sort((a, b) => b.regretRate - a.regretRate)[0];
  
  if (highRegretCategory && highRegretCategory.regretRate > 40) {
    const { CATEGORY_LABELS } = require('@/constants/categories');
    insights.push({
      type: 'warning',
      title: 'Weak Category',
      message: `${CATEGORY_LABELS[highRegretCategory.category]} has a ${highRegretCategory.regretRate.toFixed(0)}% regret rate. Be extra careful with this category.`,
    });
  }
  
  // Streak insights
  if (stats.currentStreak >= 7) {
    insights.push({
      type: 'achievement',
      title: 'Impressive Streak!',
      message: `You've avoided impulsive purchases for ${stats.currentStreak} days! Keep it up! 🔥`,
    });
  }
  
  // Savings goal insights
  const monthlySavings = calculateMonthlyTrends(impulses, 1)[0]?.totalSaved || 0;
  if (monthlySavings > 0) {
    const projectedYearly = monthlySavings * 12;
    insights.push({
      type: 'info',
      title: 'Projected Savings',
      message: `At this rate, you could save ${formatCurrency(projectedYearly)} this year!`,
    });
  }
  
  return insights;
}

/**
 * Calculate savings velocity (money saved per day)
 */
export function calculateSavingsVelocity(impulses: Impulse[]): number {
  if (impulses.length === 0) return 0;
  
  const cancelled = impulses.filter(i => i.status === 'CANCELLED');
  const totalSaved = cancelled.reduce((sum, i) => sum + (i.price || 0), 0);
  
  const firstImpulse = impulses.sort((a, b) => a.createdAt - b.createdAt)[0];
  const daysSinceFirst = Math.max(1, Math.floor((Date.now() - firstImpulse.createdAt) / (24 * 60 * 60 * 1000)));
  
  return totalSaved / daysSinceFirst;
}

/**
 * Get top spending categories
 */
export function getTopSpendingCategories(impulses: Impulse[], limit: number = 5): Array<{ category: string; total: number; count: number }> {
  const categoryTotals = new Map<string, { total: number; count: number }>();
  
  impulses
    .filter(i => i.status === 'EXECUTED' && i.price)
    .forEach(impulse => {
      const existing = categoryTotals.get(impulse.category) || { total: 0, count: 0 };
      categoryTotals.set(impulse.category, {
        total: existing.total + (impulse.price || 0),
        count: existing.count + 1,
      });
    });
  
  return Array.from(categoryTotals.entries())
    .map(([category, data]) => ({ category, ...data }))
    .sort((a, b) => b.total - a.total)
    .slice(0, limit);
}

/**
 * Calculate average time to decision
 */
export function calculateAverageDecisionTime(impulses: Impulse[]): number {
  const executed = impulses.filter(i => i.status === 'EXECUTED' && i.executedAt);
  
  if (executed.length === 0) return 0;
  
  const totalTime = executed.reduce((sum, i) => {
    return sum + (i.executedAt! - i.createdAt);
  }, 0);
  
  return totalTime / executed.length; // Average in milliseconds
}

