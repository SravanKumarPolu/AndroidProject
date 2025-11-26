import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Card } from './ui/Card';
import { colors } from '@/constants/colors';
import { typography } from '@/constants/typography';
import { spacing } from '@/constants/spacing';
import { formatCurrency } from '@/utils/currency';
import { formatDate, isToday } from '@/utils/date';
import { DailySummary } from '@/utils/dailySummary';
import { createDailySummaryShareContent, shareContent } from '@/utils/share';

interface DailySummaryCardProps {
  summary: DailySummary;
  onPress?: () => void;
}

export function DailySummaryCard({ summary, onPress }: DailySummaryCardProps) {
  const handleShare = async () => {
    try {
      const shareData = createDailySummaryShareContent(
        summary.moneySaved,
        summary.totalCancelled,
        summary.totalLogged
      );
      await shareContent(shareData);
    } catch (error) {
      const { logger } = require('@/utils/logger');
      logger.error('Error sharing daily summary', error instanceof Error ? error : new Error(String(error)));
      Alert.alert('Error', 'Failed to share daily summary. Please try again.');
    }
  };

  const dateLabel = isToday(summary.date) ? 'Today' : formatDate(summary.date);
  const hasData = summary.totalLogged > 0;

  const content = (
    <View>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <View style={styles.iconContainer}>
            <Ionicons name="sunny" size={20} color={colors.primary[600]} />
          </View>
          <Text style={styles.title}>Daily Summary</Text>
        </View>
        <View style={styles.headerRight}>
          <Text style={styles.date}>{dateLabel}</Text>
          {hasData && (
            <TouchableOpacity
              onPress={handleShare}
              style={styles.shareButton}
              accessibilityRole="button"
              accessibilityLabel="Share daily summary"
              accessibilityHint="Opens system share sheet with your daily summary"
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="share-outline" size={18} color={colors.primary[600]} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {hasData ? (
        <>
          {/* Narrative summary */}
          {summary.narrative && (
            <View style={styles.narrativeRow}>
              <Ionicons name="sparkles-outline" size={16} color={colors.accent[600]} />
              <Text style={styles.narrativeText}>{summary.narrative}</Text>
            </View>
          )}
          
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{summary.totalLogged}</Text>
              <Text style={styles.statLabel}>Logged</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{formatCurrency(summary.moneySaved)}</Text>
              <Text style={styles.statLabel}>Saved</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{summary.totalCancelled}</Text>
              <Text style={styles.statLabel}>Avoided</Text>
            </View>
          </View>

          {summary.totalExecuted > 0 && (
            <View style={styles.regretRow}>
              <Text style={styles.regretText}>
                {summary.totalRegretted} of {summary.totalExecuted} executed were regretted ({summary.regretRate.toFixed(0)}%)
              </Text>
            </View>
          )}

          {summary.moneySaved > 0 && (
            <Animated.View
              entering={FadeInDown.springify().damping(16)}
              style={styles.celebration}
              accessibilityRole="text"
              accessibilityLabel={`You saved ${formatCurrency(summary.moneySaved)} today`}
            >
              <Ionicons name="trophy" size={20} color={colors.success[700]} />
              <Text style={styles.celebrationText}>
                You saved {formatCurrency(summary.moneySaved)} today!
              </Text>
            </Animated.View>
          )}
        </>
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>
            {isToday(summary.date) 
              ? "No impulses logged today yet. Start tracking to see your daily summary!"
              : "No impulses logged on this day."}
          </Text>
        </View>
      )}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel="Open daily summary"
        accessibilityHint="Shows detailed daily summary"
      >
        <Card variant="elevated" style={styles.card}>
          {content}
        </Card>
      </TouchableOpacity>
    );
  }

  return (
    <Card variant="elevated" style={styles.card}>
      {content}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.base,
  },
  header: {
    marginBottom: spacing.base,
  },
  narrativeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    marginBottom: spacing.base,
  },
  narrativeText: {
    fontSize: typography.fontSize.sm,
    color: colors.text,
    textAlign: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
    gap: spacing.sm,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  date: {
    fontSize: typography.fontSize.sm,
    color: colors.textLight,
  },
  shareButton: {
    padding: spacing.xs / 2,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.base,
    paddingTop: spacing.base,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.primary[600],
    marginBottom: spacing.xs,
  },
  statLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.textLight,
  },
  regretRow: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  regretText: {
    fontSize: typography.fontSize.sm,
    color: colors.textLight,
    textAlign: 'center',
  },
  celebration: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.base,
    padding: spacing.base,
    backgroundColor: colors.success[50],
    borderRadius: spacing.md,
    gap: spacing.sm,
  },
  celebrationText: {
    flex: 1,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.success[700],
    textAlign: 'center',
  },
  emptyState: {
    paddingVertical: spacing.base,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: typography.fontSize.sm,
    color: colors.textLight,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

