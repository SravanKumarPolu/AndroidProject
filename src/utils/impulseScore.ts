/**
 * Impulse Control Score
 * Tracks user's ability to control impulses and shows improvement over time
 * 
 * Score calculation:
 * - Base score: 50
 * - +10 points for each cancelled impulse
 * - -5 points for each executed impulse
 * - -15 points for each regretted impulse
 * - Bonus points for streaks
 * - Score ranges from 0-100
 */

import { Impulse, UserStats } from '@/types/impulse';

export interface ImpulseScore {
  score: number; // 0-100
  previousScore: number; // Score from last calculation
  improvement: number; // Change from previous score
  trend: 'improving' | 'stable' | 'declining';
  level: 'excellent' | 'good' | 'fair' | 'needs_improvement';
  message: string;
  milestones: {
    nextMilestone: number;
    progressToNext: number;
  };
}

const BASE_SCORE = 50;
const CANCELLED_BONUS = 10;
const EXECUTED_PENALTY = -5;
const REGRET_PENALTY = -15;
const STREAK_BONUS_PER_DAY = 2; // +2 points per day of streak (max +20)

/**
 * Calculate impulse control score
 */
export function calculateImpulseScore(impulses: Impulse[], stats: UserStats): ImpulseScore {
  let score = BASE_SCORE;
  
  // Calculate from impulses
  const cancelled = impulses.filter(i => i.status === 'CANCELLED');
  const executed = impulses.filter(i => i.status === 'EXECUTED');
  const regretted = executed.filter(i => 
    i.finalFeeling === 'REGRET' || (i.regretRating !== undefined && i.regretRating >= 3)
  );
  
  // Add points for cancelled impulses
  score += cancelled.length * CANCELLED_BONUS;
  
  // Subtract points for executed impulses
  score += executed.length * EXECUTED_PENALTY;
  
  // Additional penalty for regretted impulses
  score += regretted.length * (REGRET_PENALTY - EXECUTED_PENALTY); // Already penalized above, so subtract difference
  
  // Streak bonus (capped at +20)
  const streakBonus = Math.min(20, stats.currentStreak * STREAK_BONUS_PER_DAY);
  score += streakBonus;
  
  // Clamp score between 0 and 100
  score = Math.max(0, Math.min(100, score));
  
  // Get previous score from storage (if available)
  // For now, we'll calculate improvement based on recent activity
  const recentImpulses = impulses.filter(i => 
    i.createdAt > Date.now() - 7 * 24 * 60 * 60 * 1000 // Last 7 days
  );
  const recentCancelled = recentImpulses.filter(i => i.status === 'CANCELLED').length;
  const recentExecutedImpulses = recentImpulses.filter(i => i.status === 'EXECUTED');
  const recentExecuted = recentExecutedImpulses.length;
  const recentRegretted = recentExecutedImpulses.filter(i => 
    i.finalFeeling === 'REGRET' || (i.regretRating !== undefined && i.regretRating >= 3)
  ).length;
  
  // Estimate previous score (simplified - in production, store actual previous score)
  const estimatedPrevious = Math.max(0, Math.min(100, 
    score - (recentCancelled * CANCELLED_BONUS) + (recentExecuted * Math.abs(EXECUTED_PENALTY)) + (recentRegretted * Math.abs(REGRET_PENALTY - EXECUTED_PENALTY))
  ));
  
  const improvement = score - estimatedPrevious;
  
  // Determine trend
  let trend: 'improving' | 'stable' | 'declining';
  if (improvement > 2) {
    trend = 'improving';
  } else if (improvement < -2) {
    trend = 'declining';
  } else {
    trend = 'stable';
  }
  
  // Determine level
  let level: 'excellent' | 'good' | 'fair' | 'needs_improvement';
  let message: string;
  
  if (score >= 80) {
    level = 'excellent';
    message = 'Outstanding control! You\'re making excellent decisions.';
  } else if (score >= 60) {
    level = 'good';
    message = 'Good progress! Keep up the great work.';
  } else if (score >= 40) {
    level = 'fair';
    message = 'You\'re on the right track. Every cancelled impulse helps!';
  } else {
    level = 'needs_improvement';
    message = 'Focus on the cool-down period. You can improve!';
  }
  
  // Calculate next milestone
  const milestones = [20, 40, 60, 80, 100];
  const nextMilestone = milestones.find(m => m > score) || 100;
  const progressToNext = nextMilestone > score 
    ? ((score - (nextMilestone - 20)) / 20) * 100 
    : 100;
  
  return {
    score: Math.round(score),
    previousScore: Math.round(estimatedPrevious),
    improvement: Math.round(improvement),
    trend,
    level,
    message,
    milestones: {
      nextMilestone,
      progressToNext: Math.max(0, Math.min(100, progressToNext)),
    },
  };
}

/**
 * Get score history (for charts/trends)
 */
export function getScoreHistory(impulses: Impulse[], days: number = 30): { date: number; score: number }[] {
  const history: { date: number; score: number }[] = [];
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;
  
  // Calculate score for each day
  for (let i = days - 1; i >= 0; i--) {
    const dayStart = now - (i * dayMs);
    const dayEnd = dayStart + dayMs;
    
    const dayImpulses = impulses.filter(i => 
      i.createdAt >= dayStart && i.createdAt < dayEnd
    );
    
    // Calculate stats for this day
    const cancelled = dayImpulses.filter(i => i.status === 'CANCELLED');
    const executed = dayImpulses.filter(i => i.status === 'EXECUTED');
    const regretted = executed.filter(i => 
      i.finalFeeling === 'REGRET' || (i.regretRating !== undefined && i.regretRating >= 3)
    );
    
    // Calculate cumulative score up to this point
    const allImpulsesUpToDay = impulses.filter(i => i.createdAt < dayEnd);
    const allCancelled = allImpulsesUpToDay.filter(i => i.status === 'CANCELLED');
    const allExecuted = allImpulsesUpToDay.filter(i => i.status === 'EXECUTED');
    const allRegretted = allExecuted.filter(i => 
      i.finalFeeling === 'REGRET' || (i.regretRating !== undefined && i.regretRating >= 3)
    );
    
    // Calculate streak up to this day
    const executedSorted = allExecuted
      .filter(i => i.executedAt)
      .sort((a, b) => (b.executedAt || 0) - (a.executedAt || 0));
    
    let currentStreak = 0;
    if (executedSorted.length === 0) {
      const firstImpulse = allImpulsesUpToDay.sort((a, b) => a.createdAt - b.createdAt)[0];
      if (firstImpulse) {
        const daysSinceFirst = Math.floor((dayEnd - firstImpulse.createdAt) / dayMs);
        currentStreak = daysSinceFirst;
      }
    } else {
      const lastExecuted = executedSorted[0].executedAt || 0;
      const daysSinceLast = Math.floor((dayEnd - lastExecuted) / dayMs);
      currentStreak = daysSinceLast;
    }
    
    let dayScore = BASE_SCORE;
    dayScore += allCancelled.length * CANCELLED_BONUS;
    dayScore += allExecuted.length * EXECUTED_PENALTY;
    dayScore += allRegretted.length * (REGRET_PENALTY - EXECUTED_PENALTY);
    dayScore += Math.min(20, currentStreak * STREAK_BONUS_PER_DAY);
    dayScore = Math.max(0, Math.min(100, dayScore));
    
    history.push({
      date: dayStart,
      score: Math.round(dayScore),
    });
  }
  
  return history;
}

/**
 * Get score insights
 */
export function getScoreInsights(score: ImpulseScore, stats: UserStats): string[] {
  const insights: string[] = [];
  
  if (score.trend === 'improving') {
    insights.push('Your impulse control is improving! 🎉');
  } else if (score.trend === 'declining') {
    insights.push('Try to use the cool-down period more. It helps!');
  }
  
  if (stats.currentStreak >= 7) {
    insights.push(`Amazing ${stats.currentStreak}-day streak! Keep it up!`);
  }
  
  if (stats.regretRate > 50) {
    insights.push('High regret rate. Consider longer cool-downs for similar impulses.');
  }
  
  if (score.score < 50 && stats.totalCancelled > 0) {
    insights.push('Every cancelled impulse improves your score. You\'re making progress!');
  }
  
  return insights;
}

