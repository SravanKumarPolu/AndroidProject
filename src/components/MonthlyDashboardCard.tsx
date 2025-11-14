import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from './ui/Card';
import { useTheme } from '@/contexts/ThemeContext';
import { typography } from '@/constants/typography';
import { spacing } from '@/constants/spacing';
import { formatCurrency } from '@/utils/currency';
import { MonthlyStats } from '@/utils/monthlyStats';
import { SavingsGoal } from '@/types/goal';
import { getTerminalTextStyle } from '@/utils/terminalTypography';

interface MonthlyDashboardCardProps {
  monthlyStats: MonthlyStats;
  goal?: SavingsGoal;
}

export function MonthlyDashboardCard({ monthlyStats, goal }: MonthlyDashboardCardProps) {
  const { colors, theme } = useTheme();
  const isTerminal = theme === 'terminal';
  const terminalStyle = getTerminalTextStyle(isTerminal);
  
  const goalAmount = goal?.targetAmount || 0;
  const progress = goalAmount > 0 
    ? Math.min(100, (monthlyStats.totalSaved / goalAmount) * 100)
    : 0;

  return (
    <Card variant="elevated" style={styles.card}>
      <Text style={[styles.savedAmount, terminalStyle, { color: colors.success[700] || colors.text }]}>
        Saved this month: {formatCurrency(monthlyStats.totalSaved)}
      </Text>
      {goal && goalAmount > 0 && (
        <>
          <Text style={[styles.goalText, { color: colors.textLight }]}>
            Goal: {formatCurrency(goalAmount)}
          </Text>
          <View style={[styles.progressBarContainer, { backgroundColor: colors.gray[200] || colors.border }]}>
            <View
              style={[
                styles.progressBar,
                {
                  width: `${progress}%`,
                  backgroundColor: colors.success[500] || colors.text,
                },
              ]}
            />
          </View>
        </>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: spacing.xl,
    marginBottom: spacing.base,
  },
  savedAmount: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing.xs,
  },
  goalText: {
    fontSize: typography.fontSize.base,
    marginBottom: spacing.sm,
  },
  progressBarContainer: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
});

