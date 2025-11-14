import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { Card } from '@/components/ui/Card';
import { PatternCard } from './PatternCard';
import { RecurringPattern, PatternInsight } from '@/types/pattern';
import { typography } from '@/constants/typography';
import { spacing } from '@/constants/spacing';

interface PatternsCardProps {
  patterns: RecurringPattern[];
  insights?: PatternInsight[];
  onPress?: () => void;
  maxDisplay?: number;
}

export function PatternsCard({ patterns, insights = [], onPress, maxDisplay = 2 }: PatternsCardProps) {
  const { colors } = useTheme();

  if (patterns.length === 0 && insights.length === 0) {
    return (
      <Card variant="elevated" style={styles.card}>
        <View style={styles.emptyContainer}>
          <Ionicons name="pulse-outline" size={32} color={colors.textLight} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>No Patterns Detected</Text>
          <Text style={[styles.emptyText, { color: colors.textLight }]}>
            Log more impulses to identify recurring patterns and habits
          </Text>
        </View>
      </Card>
    );
  }

  const displayPatterns = patterns.slice(0, maxDisplay);
  const displayInsights = insights.slice(0, 2);
  const remainingCount = patterns.length - displayPatterns.length;

  return (
    <Card variant="elevated" style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="pulse" size={24} color={colors.primary[600]} />
          <Text style={[styles.title, { color: colors.text }]}>Recurring Patterns</Text>
        </View>
        {onPress && (
          <TouchableOpacity onPress={onPress}>
            <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
          </TouchableOpacity>
        )}
      </View>

      {/* Insights */}
      {displayInsights.length > 0 && (
        <View style={styles.insightsSection}>
          {displayInsights.map((insight, idx) => (
            <View
              key={idx}
              style={[
                styles.insightCard,
                {
                  backgroundColor:
                    insight.type === 'WARNING'
                      ? colors.error[50]
                      : insight.type === 'SUCCESS'
                      ? colors.success[50]
                      : colors.primary[50],
                  borderColor:
                    insight.type === 'WARNING'
                      ? colors.error[200]
                      : insight.type === 'SUCCESS'
                      ? colors.success[200]
                      : colors.primary[200],
                },
              ]}
            >
              <Ionicons
                name={
                  insight.type === 'WARNING'
                    ? 'warning'
                    : insight.type === 'SUCCESS'
                    ? 'checkmark-circle'
                    : 'information-circle'
                }
                size={18}
                color={
                  insight.type === 'WARNING'
                    ? colors.error[600]
                    : insight.type === 'SUCCESS'
                    ? colors.success[600]
                    : colors.primary[600]
                }
              />
              <View style={styles.insightContent}>
                <Text
                  style={[
                    styles.insightTitle,
                    {
                      color:
                        insight.type === 'WARNING'
                          ? colors.error[700]
                          : insight.type === 'SUCCESS'
                          ? colors.success[700]
                          : colors.primary[700],
                    },
                  ]}
                >
                  {insight.title}
                </Text>
                <Text
                  style={[
                    styles.insightMessage,
                    {
                      color:
                        insight.type === 'WARNING'
                          ? colors.error[600]
                          : insight.type === 'SUCCESS'
                          ? colors.success[600]
                          : colors.primary[600],
                    },
                  ]}
                >
                  {insight.message}
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Patterns */}
      {displayPatterns.length > 0 && (
        <View style={styles.patternsList}>
          {displayPatterns.map((pattern) => (
            <PatternCard key={pattern.id} pattern={pattern} showPrediction={true} />
          ))}
        </View>
      )}

      {/* View All */}
      {remainingCount > 0 && onPress && (
        <TouchableOpacity
          style={[styles.viewAllButton, { borderColor: colors.border }]}
          onPress={onPress}
        >
          <Text style={[styles.viewAllText, { color: colors.primary[600] }]}>
            View all {patterns.length} patterns
          </Text>
          <Ionicons name="chevron-forward" size={20} color={colors.primary[600]} />
        </TouchableOpacity>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.base,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.base,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  title: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
  },
  insightsSection: {
    gap: spacing.sm,
    marginBottom: spacing.base,
  },
  insightCard: {
    flexDirection: 'row',
    padding: spacing.sm,
    borderRadius: spacing.md,
    borderWidth: 1,
    gap: spacing.sm,
  },
  insightContent: {
    flex: 1,
    gap: spacing.xs / 2,
  },
  insightTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
  },
  insightMessage: {
    fontSize: typography.fontSize.xs,
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.xs,
  },
  patternsList: {
    gap: spacing.sm,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    marginTop: spacing.base,
    borderTopWidth: 1,
    gap: spacing.xs,
  },
  viewAllText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  emptyTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    marginTop: spacing.base,
    marginBottom: spacing.xs,
  },
  emptyText: {
    fontSize: typography.fontSize.sm,
    textAlign: 'center',
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.sm,
  },
});

