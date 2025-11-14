import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from './ui/Card';
import { useTheme } from '@/contexts/ThemeContext';
import { typography } from '@/constants/typography';
import { spacing } from '@/constants/spacing';
import { CategoryStats } from '@/types/impulse';
import { CATEGORY_LABELS } from '@/constants/categories';
import { MoodTrigger, formatMoodTrigger } from '@/utils/moodTrigger';
import { getTerminalTextStyle } from '@/utils/terminalTypography';

interface InsightsCardProps {
  dangerousCategory?: CategoryStats;
  worstMoodTrigger?: MoodTrigger | null;
}

export function InsightsCard({ dangerousCategory, worstMoodTrigger }: InsightsCardProps) {
  const { colors, theme } = useTheme();
  const isTerminal = theme === 'terminal';
  const terminalStyle = getTerminalTextStyle(isTerminal);

  return (
    <Card variant="outlined" style={styles.card}>
      {dangerousCategory && (
        <View style={styles.insight}>
          <Text style={[styles.label, { color: colors.textLight }]}>
            Most dangerous category:
          </Text>
          <Text style={[styles.value, terminalStyle, { color: colors.error[700] || colors.text }]}>
            {CATEGORY_LABELS[dangerousCategory.category]}
          </Text>
        </View>
      )}
      {worstMoodTrigger && (
        <View style={styles.insight}>
          <Text style={[styles.label, { color: colors.textLight }]}>
            Worst mood trigger:
          </Text>
          <Text style={[styles.value, terminalStyle, { color: colors.warning[700] || colors.text }]}>
            {formatMoodTrigger(worstMoodTrigger)}
          </Text>
        </View>
      )}
      {!dangerousCategory && !worstMoodTrigger && (
        <Text style={[styles.emptyText, { color: colors.textLight }]}>
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
  insight: {
    marginBottom: spacing.sm,
  },
  label: {
    fontSize: typography.fontSize.sm,
    marginBottom: spacing.xs,
  },
  value: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
  },
  emptyText: {
    fontSize: typography.fontSize.sm,
    fontStyle: 'italic',
  },
});

