/**
 * Results Dashboard Component
 * Shows 30-60 day impact metrics to demonstrate psychological and financial results
 */

import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { Card } from './ui/Card';
import { TerminalGlow } from './TerminalGlow';
import { typography } from '@/constants/typography';
import { spacing } from '@/constants/spacing';
import { formatCurrency } from '@/utils/currency';
import { Impulse } from '@/types/impulse';
import { useStats } from '@/hooks/useStats';
import { useGoals } from '@/hooks/useGoals';
import { getWorstMoodTrigger } from '@/utils/moodTrigger';
import { Ionicons } from '@expo/vector-icons';

interface ResultsDashboardProps {
  impulses: Impulse[];
}

interface ImpactMetrics {
  // Spending reduction
  spendingReduction: number; // Percentage reduction in impulsive spending
  monthlySavings: number; // Amount saved this month
  savingsPercentage: number; // Percentage of expenses saved (10-40% target)
  
  // Financial discipline
  currentStreak: number; // Days without impulsive purchase
  longestStreak: number;
  disciplineScore: number; // 0-100 score
  
  // Regret avoidance
  regretRate: number; // Current regret rate
  regretImprovement: number; // Percentage improvement in regret rate
  avoidedRegrets: number; // Number of regrets avoided
  
  // Goal progress
  goalProgress: number; // Percentage of goals achieved
  totalGoalContributions: number; // Amount contributed to goals
  
  // Emotional awareness
  triggerAwareness: number; // Number of triggers identified
  worstTrigger?: {
    emotion: string;
    timeOfDay: string;
    regretRate: number;
  };
}

export function ResultsDashboard({ impulses }: ResultsDashboardProps) {
  const { colors } = useTheme();
  const { stats } = useStats(impulses);
  const { goals, activeGoals } = useGoals(impulses);
  const worstMoodTrigger = useMemo(() => getWorstMoodTrigger(impulses), [impulses]);
  
  // Calculate impact metrics
  const metrics = useMemo<ImpactMetrics>(() => {
    const now = Date.now();
    const thirtyDaysAgo = now - (30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = now - (60 * 24 * 60 * 60 * 1000);
    
    // Recent impulses (last 30 days)
    const recentImpulses = impulses.filter(i => i.createdAt >= thirtyDaysAgo);
    const recentExecuted = recentImpulses.filter(i => i.status === 'EXECUTED');
    const recentCancelled = recentImpulses.filter(i => i.status === 'CANCELLED');
    const recentSpent = recentExecuted.reduce((sum, i) => sum + (i.price || 0), 0);
    const recentSaved = recentCancelled.reduce((sum, i) => sum + (i.price || 0), 0);
    
    // Previous period (30-60 days ago)
    const previousImpulses = impulses.filter(
      i => i.createdAt >= sixtyDaysAgo && i.createdAt < thirtyDaysAgo
    );
    const previousExecuted = previousImpulses.filter(i => i.status === 'EXECUTED');
    const previousSpent = previousExecuted.reduce((sum, i) => sum + (i.price || 0), 0);
    
    // Spending reduction
    const spendingReduction = previousSpent > 0
      ? ((previousSpent - recentSpent) / previousSpent) * 100
      : recentSpent > 0 ? 0 : 100;
    
    // Monthly savings percentage (target: 10-40%)
    const totalMonthlySpending = recentSpent + recentSaved;
    const savingsPercentage = totalMonthlySpending > 0
      ? (recentSaved / totalMonthlySpending) * 100
      : 0;
    
    // Regret improvement
    const recentRegretted = recentExecuted.filter(i =>
      i.finalFeeling === 'REGRET' || (i.regretRating !== undefined && i.regretRating >= 3)
    );
    const previousRegretted = previousExecuted.filter(i =>
      i.finalFeeling === 'REGRET' || (i.regretRating !== undefined && i.regretRating >= 3)
    );
    
    const recentRegretRate = recentExecuted.length > 0
      ? (recentRegretted.length / recentExecuted.length) * 100
      : 0;
    const previousRegretRate = previousExecuted.length > 0
      ? (previousRegretted.length / previousExecuted.length) * 100
      : 0;
    
    const regretImprovement = previousRegretRate > 0
      ? ((previousRegretRate - recentRegretRate) / previousRegretRate) * 100
      : 0;
    
    // Avoided regrets (estimated based on regret rate)
    const avoidedRegrets = Math.max(0, Math.round(
      recentCancelled.length * (previousRegretRate / 100)
    ));
    
    // Goal progress
    const totalGoalContributions = goals.reduce((sum, g) => sum + g.currentAmount, 0);
    const goalProgress = goals.length > 0
      ? (goals.filter(g => g.isCompleted).length / goals.length) * 100
      : 0;
    
    // Discipline score (based on streak, cancellation rate, and consistency)
    const cancellationRate = impulses.length > 0
      ? (stats.totalCancelled / impulses.length) * 100
      : 0;
    const disciplineScore = Math.min(100, Math.round(
      (stats.currentStreak * 2) + // Streak contribution (max 60)
      (cancellationRate * 0.4) + // Cancellation rate (max 40)
      (Math.min(30, stats.longestStreak) * 0.5) // Longest streak bonus
    ));
    
    // Trigger awareness
    const uniqueEmotions = new Set(
      impulses.filter(i => i.emotion && i.emotion !== 'NONE').map(i => i.emotion)
    );
    
    return {
      spendingReduction: Math.max(0, Math.round(spendingReduction)),
      monthlySavings: recentSaved,
      savingsPercentage: Math.round(savingsPercentage * 10) / 10,
      currentStreak: stats.currentStreak,
      longestStreak: stats.longestStreak,
      disciplineScore,
      regretRate: Math.round(recentRegretRate * 10) / 10,
      regretImprovement: Math.round(regretImprovement * 10) / 10,
      avoidedRegrets,
      goalProgress: Math.round(goalProgress),
      totalGoalContributions,
      triggerAwareness: uniqueEmotions.size,
      worstTrigger: worstMoodTrigger ? {
        emotion: worstMoodTrigger.emotion,
        timeOfDay: worstMoodTrigger.timeOfDay,
        regretRate: Math.round(worstMoodTrigger.regretRate),
      } : undefined,
    };
  }, [impulses, stats, goals, worstMoodTrigger]);
  
  const getSavingsPercentageColor = (percentage: number) => {
    if (percentage >= 30) return colors.success[600];
    if (percentage >= 20) return colors.success[500];
    if (percentage >= 10) return colors.warning[600];
    return colors.textLight;
  };
  
  const getDisciplineScoreColor = (score: number) => {
    if (score >= 80) return colors.success[600];
    if (score >= 60) return colors.success[500];
    if (score >= 40) return colors.warning[600];
    return colors.error[600];
  };
  
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={[styles.title, { color: colors.text }]}>
        Your 30-60 Day Impact 🎯
      </Text>
      <Text style={[styles.subtitle, { color: colors.textLight }]}>
        Real psychological and financial results
      </Text>
      
      {/* Spending Reduction */}
      <TerminalGlow color="success" intensity="low">
        <Card variant="elevated" style={styles.metricCard}>
          <View style={styles.metricHeader}>
            <Ionicons name="trending-down-outline" size={24} color={colors.success[600]} />
            <Text style={[styles.metricTitle, { color: colors.text }]}>
              Reduced Impulsive Spending
            </Text>
          </View>
          <Text style={[styles.metricValue, { color: colors.success[600] }]}>
            {metrics.spendingReduction}%
          </Text>
          <Text style={[styles.metricDescription, { color: colors.textLight }]}>
            Less impulsive spending compared to previous period
          </Text>
        </Card>
      </TerminalGlow>
      
      {/* Monthly Savings Percentage */}
      <TerminalGlow 
        color={metrics.savingsPercentage >= 10 ? "success" : "warning"} 
        intensity="low"
      >
        <Card variant="elevated" style={styles.metricCard}>
          <View style={styles.metricHeader}>
            <Ionicons 
              name="wallet-outline" 
              size={24} 
              color={getSavingsPercentageColor(metrics.savingsPercentage)} 
            />
            <Text style={[styles.metricTitle, { color: colors.text }]}>
              Monthly Savings Rate
            </Text>
          </View>
          <Text style={[styles.metricValue, { color: getSavingsPercentageColor(metrics.savingsPercentage) }]}>
            {metrics.savingsPercentage}%
          </Text>
          <Text style={[styles.metricDescription, { color: colors.textLight }]}>
            {formatCurrency(metrics.monthlySavings)} saved this month
            {metrics.savingsPercentage >= 10 && metrics.savingsPercentage < 40 && (
              <Text style={{ color: colors.success[600] }}> • Target: 10-40% ✅</Text>
            )}
            {metrics.savingsPercentage >= 40 && (
              <Text style={{ color: colors.success[600] }}> • Exceeding target! 🎉</Text>
            )}
          </Text>
        </Card>
      </TerminalGlow>
      
      {/* Financial Discipline */}
      <TerminalGlow 
        color={metrics.disciplineScore >= 60 ? "success" : "warning"} 
        intensity="low"
      >
        <Card variant="elevated" style={styles.metricCard}>
          <View style={styles.metricHeader}>
            <Ionicons 
              name="shield-checkmark-outline" 
              size={24} 
              color={getDisciplineScoreColor(metrics.disciplineScore)} 
            />
            <Text style={[styles.metricTitle, { color: colors.text }]}>
              Financial Discipline Score
            </Text>
          </View>
          <Text style={[styles.metricValue, { color: getDisciplineScoreColor(metrics.disciplineScore) }]}>
            {metrics.disciplineScore}/100
          </Text>
          <Text style={[styles.metricDescription, { color: colors.textLight }]}>
            {metrics.currentStreak} day streak • Longest: {metrics.longestStreak} days
          </Text>
        </Card>
      </TerminalGlow>
      
      {/* Regret Avoidance */}
      <TerminalGlow color="success" intensity="low">
        <Card variant="elevated" style={styles.metricCard}>
          <View style={styles.metricHeader}>
            <Ionicons name="heart-outline" size={24} color={colors.success[600]} />
            <Text style={[styles.metricTitle, { color: colors.text }]}>
              Regret Avoidance
            </Text>
          </View>
          <Text style={[styles.metricValue, { color: colors.success[600] }]}>
            {metrics.regretRate}%
          </Text>
          <Text style={[styles.metricDescription, { color: colors.textLight }]}>
            Current regret rate
            {metrics.regretImprovement > 0 && (
              <Text style={{ color: colors.success[600] }}>
                {' '}• {metrics.regretImprovement}% improvement
              </Text>
            )}
          </Text>
          {metrics.avoidedRegrets > 0 && (
            <Text style={[styles.metricSubtext, { color: colors.success[600] }]}>
              ~{metrics.avoidedRegrets} regrets avoided
            </Text>
          )}
        </Card>
      </TerminalGlow>
      
      {/* Goal Progress */}
      {activeGoals.length > 0 && (
        <TerminalGlow color="primary" intensity="low">
          <Card variant="elevated" style={styles.metricCard}>
            <View style={styles.metricHeader}>
              <Ionicons name="flag-outline" size={24} color={colors.primary[600]} />
              <Text style={[styles.metricTitle, { color: colors.text }]}>
                Savings Goals Progress
              </Text>
            </View>
            <Text style={[styles.metricValue, { color: colors.primary[600] }]}>
              {formatCurrency(metrics.totalGoalContributions)}
            </Text>
            <Text style={[styles.metricDescription, { color: colors.textLight }]}>
              {activeGoals.length} active goal{activeGoals.length > 1 ? 's' : ''} • {metrics.goalProgress}% completed
            </Text>
          </Card>
        </TerminalGlow>
      )}
      
      {/* Emotional Trigger Awareness */}
      {metrics.worstTrigger && (
        <TerminalGlow color="warning" intensity="low">
          <Card variant="elevated" style={styles.metricCard}>
            <View style={styles.metricHeader}>
              <Ionicons name="bulb-outline" size={24} color={colors.warning[600]} />
              <Text style={[styles.metricTitle, { color: colors.text }]}>
                Emotional Trigger Awareness
              </Text>
            </View>
            <Text style={[styles.metricValue, { color: colors.warning[600] }]}>
              {metrics.triggerAwareness} triggers identified
            </Text>
            <Text style={[styles.metricDescription, { color: colors.textLight }]}>
              Worst trigger: {metrics.worstTrigger.emotion} ({metrics.worstTrigger.timeOfDay})
              {' '}• {metrics.worstTrigger.regretRate}% regret rate
            </Text>
          </Card>
        </TerminalGlow>
      )}
      
      {/* Impact Summary */}
      <Card variant="outlined" style={[styles.summaryCard, { borderColor: colors.primary[200] }]}>
        <Text style={[styles.summaryTitle, { color: colors.text }]}>
          💡 Psychological Impact
        </Text>
        <Text style={[styles.summaryText, { color: colors.textLight }]}>
          By logging impulses and using cool-down periods, you're building awareness of your spending patterns and emotional triggers. This app creates real behavioral change through:
        </Text>
        <View style={styles.bulletList}>
          <Text style={[styles.bulletItem, { color: colors.textLight }]}>
            • Pause before purchase (cool-down)
          </Text>
          <Text style={[styles.bulletItem, { color: colors.textLight }]}>
            • Reflection on needs vs wants
          </Text>
          <Text style={[styles.bulletItem, { color: colors.textLight }]}>
            • Pattern recognition (triggers, categories)
          </Text>
          <Text style={[styles.bulletItem, { color: colors.textLight }]}>
            • Goal-oriented decision making
          </Text>
        </View>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.base,
  },
  title: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.fontSize.base,
    marginBottom: spacing.lg,
  },
  metricCard: {
    padding: spacing.base,
    marginBottom: spacing.base,
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  metricTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    flex: 1,
  },
  metricValue: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing.xs,
  },
  metricDescription: {
    fontSize: typography.fontSize.sm,
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.sm,
  },
  metricSubtext: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    marginTop: spacing.xs,
  },
  summaryCard: {
    padding: spacing.base,
    marginTop: spacing.base,
    borderWidth: 1,
  },
  summaryTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing.sm,
  },
  summaryText: {
    fontSize: typography.fontSize.sm,
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.sm,
    marginBottom: spacing.sm,
  },
  bulletList: {
    gap: spacing.xs,
  },
  bulletItem: {
    fontSize: typography.fontSize.sm,
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.sm,
  },
});

