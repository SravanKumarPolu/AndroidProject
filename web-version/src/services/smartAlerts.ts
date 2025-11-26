/**
 * Smart Alerts Service
 * Context-aware and predictive notifications based on user behavior patterns
 */

import { Impulse, EmotionAtImpulse } from '@/types/impulse';

export interface SmartAlert {
  type: 'predictive' | 'contextual' | 'behavioral' | 'achievement';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high';
  actionUrl?: string;
  timestamp: number;
}

/**
 * Analyze patterns and generate smart alerts
 */
export function generateSmartAlerts(impulses: Impulse[]): SmartAlert[] {
  const alerts: SmartAlert[] = [];

  // 1. Predictive: High-risk time patterns
  const timeBasedAlert = detectTimeBasedPattern(impulses);
  if (timeBasedAlert) alerts.push(timeBasedAlert);

  // 2. Contextual: Emotional trigger warnings
  const emotionAlert = detectEmotionalPattern(impulses);
  if (emotionAlert) alerts.push(emotionAlert);

  // 3. Behavioral: Spending trend warnings
  const spendingAlert = detectSpendingTrend(impulses);
  if (spendingAlert) alerts.push(spendingAlert);

  // 4. Achievement: Milestone celebrations
  const achievementAlerts = detectAchievements(impulses);
  alerts.push(...achievementAlerts);

  // 5. Predictive: Category risk warnings
  const categoryAlert = detectCategoryRisk(impulses);
  if (categoryAlert) alerts.push(categoryAlert);

  return alerts.sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    return priorityOrder[b.priority] - priorityOrder[a.priority];
  });
}

/**
 * Detect if user tends to make impulse purchases at certain times
 */
function detectTimeBasedPattern(impulses: Impulse[]): SmartAlert | null {
  if (impulses.length < 5) return null;

  const now = new Date();
  const currentHour = now.getHours();
  
  // Check if current time matches high-risk pattern
  const recentImpulses = impulses
    .filter((imp) => imp.createdAt > Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
    .filter((imp) => {
      const hour = new Date(imp.createdAt).getHours();
      return hour >= currentHour - 1 && hour <= currentHour + 1; // Within 1 hour
    });

  if (recentImpulses.length >= 3) {
    const boughtCount = recentImpulses.filter(
      (imp) => imp.decisionAtEnd === 'bought' || imp.status === 'bought'
    ).length;

    if (boughtCount >= 2) {
      return {
        type: 'predictive',
        title: '⏰ High-Risk Time Alert',
        message: `You've made ${boughtCount} purchases around this time recently. Consider waiting before your next impulse.`,
        priority: 'high',
        timestamp: Date.now(),
      };
    }
  }

  return null;
}

/**
 * Detect emotional trigger patterns
 */
function detectEmotionalPattern(impulses: Impulse[]): SmartAlert | null {
  if (impulses.length < 3) return null;

  const emotionMap = new Map<EmotionAtImpulse, number>();
  impulses.forEach((imp) => {
    const emotion = imp.emotionAtImpulse || 'neutral';
    emotionMap.set(emotion, (emotionMap.get(emotion) || 0) + 1);
  });

  // Find most common emotion
  let maxCount = 0;
  let dominantEmotion: EmotionAtImpulse | null = null;
  emotionMap.forEach((count, emotion) => {
    if (count > maxCount && emotion !== 'neutral') {
      maxCount = count;
      dominantEmotion = emotion;
    }
  });

  if (dominantEmotion && maxCount >= 3) {
    const highRiskEmotions: EmotionAtImpulse[] = ['stressed', 'sad', 'fomo', 'bored'];
    if (highRiskEmotions.includes(dominantEmotion)) {
      const emotionLabels: Record<EmotionAtImpulse, string> = {
        stressed: 'stressed',
        sad: 'sad',
        fomo: 'FOMO',
        bored: 'bored',
        hungry: 'hungry',
        excited: 'excited',
        tired: 'tired',
        neutral: 'neutral',
      };

      return {
        type: 'contextual',
        title: '💭 Emotional Pattern Detected',
        message: `You've logged ${maxCount} impulses when feeling ${emotionLabels[dominantEmotion]}. This emotion often leads to regret. Be mindful!`,
        priority: 'medium',
        timestamp: Date.now(),
      };
    }
  }

  return null;
}

/**
 * Detect spending trend warnings
 */
function detectSpendingTrend(impulses: Impulse[]): SmartAlert | null {
  if (impulses.length < 10) return null;

  const now = Date.now();
  const lastWeek = impulses.filter(
    (imp) => imp.createdAt >= now - 7 * 24 * 60 * 60 * 1000 &&
    (imp.decisionAtEnd === 'bought' || imp.status === 'bought')
  );
  const previousWeek = impulses.filter(
    (imp) =>
      imp.createdAt >= now - 14 * 24 * 60 * 60 * 1000 &&
      imp.createdAt < now - 7 * 24 * 60 * 60 * 1000 &&
      (imp.decisionAtEnd === 'bought' || imp.status === 'bought')
  );

  const lastWeekSpent = lastWeek.reduce((sum, imp) => sum + imp.price, 0);
  const previousWeekSpent = previousWeek.reduce((sum, imp) => sum + imp.price, 0);

  if (previousWeekSpent > 0 && lastWeekSpent > previousWeekSpent * 1.5) {
    return {
      type: 'behavioral',
      title: '📈 Spending Trend Alert',
      message: `Your spending increased ${((lastWeekSpent / previousWeekSpent - 1) * 100).toFixed(0)}% this week. Consider reviewing your impulses.`,
      priority: 'high',
      actionUrl: '/reports',
      timestamp: Date.now(),
    };
  }

  return null;
}

/**
 * Detect achievements and milestones
 */
function detectAchievements(impulses: Impulse[]): SmartAlert[] {
  const alerts: SmartAlert[] = [];

  const skipped = impulses.filter(
    (imp) => imp.decisionAtEnd === 'skipped' || imp.status === 'skipped'
  ).length;
  const totalSaved = impulses
    .filter((imp) => imp.decisionAtEnd === 'skipped' || imp.status === 'skipped')
    .reduce((sum, imp) => sum + imp.price, 0);

  // Milestone: 10 skipped impulses
  if (skipped === 10 || skipped === 25 || skipped === 50 || skipped === 100) {
    alerts.push({
      type: 'achievement',
      title: '🎉 Milestone Achieved!',
      message: `You've skipped ${skipped} impulses! That's amazing self-control!`,
      priority: 'low',
      timestamp: Date.now(),
    });
  }

  // Milestone: $100, $500, $1000 saved
  const milestones = [100, 500, 1000, 5000];
  for (const milestone of milestones) {
    if (totalSaved >= milestone && totalSaved < milestone + 50) {
      alerts.push({
        type: 'achievement',
        title: '💰 Savings Milestone!',
        message: `You've saved $${milestone.toLocaleString()} by skipping impulses! Keep it up!`,
        priority: 'low',
        actionUrl: '/stats',
        timestamp: Date.now(),
      });
      break;
    }
  }

  // Streak detection
  const streak = calculateSkipStreak(impulses);
  if (streak >= 3 && streak % 3 === 0) {
    alerts.push({
      type: 'achievement',
      title: '🔥 Streak Alert!',
      message: `You're on a ${streak}-impulse skip streak! Amazing willpower!`,
      priority: 'low',
      timestamp: Date.now(),
    });
  }

  return alerts;
}

/**
 * Detect category-specific risk
 */
function detectCategoryRisk(impulses: Impulse[]): SmartAlert | null {
  if (impulses.length < 5) return null;

  const categoryRegretMap = new Map<string, { total: number; regretted: number }>();
  
  impulses.forEach((imp) => {
    if (imp.decisionAtEnd === 'bought' || imp.status === 'bought') {
      const entry = categoryRegretMap.get(imp.category) || { total: 0, regretted: 0 };
      entry.total++;
      if (imp.regretScore !== null && imp.regretScore > 60) {
        entry.regretted++;
      }
      categoryRegretMap.set(imp.category, entry);
    }
  });

  // Find category with high regret rate
  for (const [category, data] of categoryRegretMap.entries()) {
    if (data.total >= 3 && data.regretted / data.total >= 0.6) {
      return {
        type: 'predictive',
        title: '⚠️ Category Risk Warning',
        message: `You've regretted ${data.regretted} out of ${data.total} purchases in the "${category}" category. Be extra careful with this category!`,
        priority: 'medium',
        timestamp: Date.now(),
      };
    }
  }

  return null;
}

/**
 * Calculate current skip streak
 */
function calculateSkipStreak(impulses: Impulse[]): number {
  const sorted = [...impulses].sort((a, b) => b.createdAt - a.createdAt);
  let streak = 0;

  for (const imp of sorted) {
    if (imp.decisionAtEnd === 'skipped' || imp.status === 'skipped') {
      streak++;
    } else if (imp.decisionAtEnd === 'bought' || imp.status === 'bought') {
      break;
    }
  }

  return streak;
}

/**
 * Get contextual alert based on current situation
 */
export function getContextualAlert(impulses: Impulse[], currentEmotion?: EmotionAtImpulse): SmartAlert | null {
  if (!currentEmotion) return null;

  const highRiskEmotions: EmotionAtImpulse[] = ['stressed', 'sad', 'fomo'];
  if (highRiskEmotions.includes(currentEmotion)) {
    const similarImpulses = impulses.filter(
      (imp) => imp.emotionAtImpulse === currentEmotion &&
      (imp.decisionAtEnd === 'bought' || imp.status === 'bought')
    );

    if (similarImpulses.length > 0) {
      const avgRegret = similarImpulses
        .map((imp) => imp.regretScore)
        .filter((score): score is number => score !== null)
        .reduce((sum, score, _, arr) => sum + score / arr.length, 0);

      if (avgRegret > 50) {
        return {
          type: 'contextual',
          title: '🧠 Mindful Moment',
          message: `When you feel ${currentEmotion}, your past purchases had an average regret score of ${avgRegret.toFixed(0)}. Take a deep breath before deciding.`,
          priority: 'high',
          timestamp: Date.now(),
        };
      }
    }
  }

  return null;
}

