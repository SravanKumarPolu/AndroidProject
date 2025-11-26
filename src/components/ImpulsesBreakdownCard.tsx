import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from './ui/Card';
import { useTheme } from '@/contexts/ThemeContext';
import { typography } from '@/constants/typography';
import { spacing } from '@/constants/spacing';
import { MonthlyStats } from '@/utils/monthlyStats';
import { getTerminalTextStyle } from '@/utils/terminalTypography';

interface ImpulsesBreakdownCardProps {
  monthlyStats: MonthlyStats;
}

export function ImpulsesBreakdownCard({ monthlyStats }: ImpulsesBreakdownCardProps) {
  const { colors, theme } = useTheme();
  const isTerminal = theme === 'terminal';
  const terminalStyle = getTerminalTextStyle(isTerminal);

  return (
    <Card variant="outlined" style={styles.card}>
      <Text style={[styles.title, terminalStyle, { color: colors.text }]}>
        Impulses this month: {monthlyStats.totalLogged}
      </Text>
      <View style={styles.breakdown}>
        <Text style={[styles.breakdownText, terminalStyle, { color: colors.success[700] || colors.text }]}>
          Skipped: {monthlyStats.totalCancelled}
        </Text>
        <Text style={[styles.separator, { color: colors.textLight }]}>|</Text>
        <Text style={[styles.breakdownText, terminalStyle, { color: colors.text }]}>
          Bought: {monthlyStats.totalExecuted}
        </Text>
        <Text style={[styles.separator, { color: colors.textLight }]}>|</Text>
        <Text style={[styles.breakdownText, terminalStyle, { color: colors.error[600] || colors.text }]}>
          Regrets: {monthlyStats.totalRegretted}
        </Text>
      </View>
      {monthlyStats.totalLogged === 0 && (
        <Text style={[styles.hint, { color: colors.textLight }]}>
          Keep logging impulses to see insights
        </Text>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: spacing.base,
    marginBottom: spacing.base,
  },
  title: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    marginBottom: spacing.sm,
  },
  breakdown: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  breakdownText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
  },
  separator: {
    fontSize: typography.fontSize.base,
  },
  hint: {
    fontSize: typography.fontSize.sm,
    marginTop: spacing.sm,
    fontStyle: 'italic',
  },
});

