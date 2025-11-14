import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from './ui/Card';
import { colors } from '@/constants/colors';
import { typography } from '@/constants/typography';
import { spacing } from '@/constants/spacing';
import { getWeakHours, formatHour, getTimeOfDayLabel } from '@/utils/timePatterns';
import { Impulse } from '@/types/impulse';

interface WeakHoursCardProps {
  impulses: Impulse[];
}

export function WeakHoursCard({ impulses }: WeakHoursCardProps) {
  const { highFrequency, highRegret } = getWeakHours(impulses);

  if (highFrequency.length === 0 && highRegret.length === 0) {
    return null;
  }

  return (
    <Card variant="elevated" style={styles.card}>
      <Text style={styles.title}>Weak Hours</Text>
      <Text style={styles.subtitle}>
        Times when you're most likely to make impulsive decisions
      </Text>

      {highFrequency.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Most Active Hours</Text>
          {highFrequency.map((pattern) => (
            <View key={pattern.hour} style={styles.hourItem}>
              <View style={styles.hourLeft}>
                <Text style={styles.hourTime}>{formatHour(pattern.hour)}</Text>
                <Text style={styles.hourLabel}>{getTimeOfDayLabel(pattern.hour)}</Text>
              </View>
              <View style={styles.hourRight}>
                <Text style={styles.hourCount}>{pattern.impulseCount} impulses</Text>
                {pattern.regretRate > 0 && (
                  <Text style={styles.hourRegret}>
                    {pattern.regretRate.toFixed(0)}% regret rate
                  </Text>
                )}
              </View>
            </View>
          ))}
        </View>
      )}

      {highRegret.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Highest Regret Hours</Text>
          {highRegret.map((pattern) => (
            <View key={pattern.hour} style={styles.hourItem}>
              <View style={styles.hourLeft}>
                <Text style={styles.hourTime}>{formatHour(pattern.hour)}</Text>
                <Text style={styles.hourLabel}>{getTimeOfDayLabel(pattern.hour)}</Text>
              </View>
              <View style={styles.hourRight}>
                <Text style={[styles.hourRegret, styles.highRegret]}>
                  {pattern.regretRate.toFixed(0)}% regret
                </Text>
                <Text style={styles.hourCount}>
                  {pattern.impulseCount} impulses
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {highFrequency.length > 0 && (
        <View style={styles.tipBox}>
          <Text style={styles.tipText}>
            💡 Tip: Be extra careful during these hours. Consider logging impulses earlier in the day.
          </Text>
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.base,
  },
  title: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.textLight,
    marginBottom: spacing.base,
  },
  section: {
    marginBottom: spacing.base,
  },
  sectionTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  hourItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  hourLeft: {
    flex: 1,
  },
  hourTime: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.xs / 2,
  },
  hourLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.textLight,
  },
  hourRight: {
    alignItems: 'flex-end',
  },
  hourCount: {
    fontSize: typography.fontSize.sm,
    color: colors.textLight,
    marginBottom: spacing.xs / 2,
  },
  hourRegret: {
    fontSize: typography.fontSize.sm,
    color: colors.error[600],
    fontWeight: typography.fontWeight.medium,
  },
  highRegret: {
    color: colors.error[700],
    fontWeight: typography.fontWeight.bold,
  },
  tipBox: {
    marginTop: spacing.base,
    padding: spacing.sm,
    backgroundColor: colors.primary[50],
    borderRadius: spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary[500],
  },
  tipText: {
    fontSize: typography.fontSize.sm,
    color: colors.primary[800],
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.sm,
  },
});

