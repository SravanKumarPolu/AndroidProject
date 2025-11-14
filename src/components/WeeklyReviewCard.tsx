import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from './ui/Card';
import { colors } from '@/constants/colors';
import { typography } from '@/constants/typography';
import { spacing } from '@/constants/spacing';
import { formatCurrency } from '@/utils/currency';
import { formatDate } from '@/utils/date';
import { WeeklyReview } from '@/utils/weeklyReview';

interface WeeklyReviewCardProps {
  review: WeeklyReview;
  onPress?: () => void;
}

export function WeeklyReviewCard({ review, onPress }: WeeklyReviewCardProps) {
  const content = (
    <View>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <View style={styles.iconContainer}>
            <Ionicons name="calendar" size={20} color={colors.primary[600]} />
          </View>
          <Text style={styles.title}>Weekly Review</Text>
        </View>
        <Text style={styles.date}>
          {formatDate(review.weekStart)} - {formatDate(review.weekEnd)}
        </Text>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{formatCurrency(review.moneySaved)}</Text>
          <Text style={styles.statLabel}>Saved</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{review.totalCancelled}</Text>
          <Text style={styles.statLabel}>Avoided</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{review.streak}</Text>
          <Text style={styles.statLabel}>Day Streak</Text>
        </View>
      </View>

      {review.totalExecuted > 0 && (
        <View style={styles.regretRow}>
          <Text style={styles.regretText}>
            {review.totalRegretted} of {review.totalExecuted} executed were regretted ({review.regretRate.toFixed(0)}%)
          </Text>
        </View>
      )}

      {review.moneySaved > 0 && (
        <View style={styles.celebration}>
          <Ionicons name="trophy" size={20} color={colors.success[700]} />
          <Text style={styles.celebrationText}>
            You saved {formatCurrency(review.moneySaved)} this week!
          </Text>
        </View>
      )}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
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
  date: {
    fontSize: typography.fontSize.sm,
    color: colors.textLight,
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
});

