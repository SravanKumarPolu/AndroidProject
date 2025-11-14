import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { Card } from '@/components/ui/Card';
import { GoalProgress } from '@/types/goal';
import { typography } from '@/constants/typography';
import { spacing } from '@/constants/spacing';
import { formatCurrency } from '@/utils/currency';
import { createGoalShareContent, shareContent } from '@/utils/share';

interface GoalsCardProps {
  goals: GoalProgress[];
  onPress?: () => void;
  maxDisplay?: number;
}

export function GoalsCard({ goals, onPress, maxDisplay = 3 }: GoalsCardProps) {
  const { colors } = useTheme();

  const handleShareGoal = async (goalProgress: GoalProgress) => {
    try {
      const shareData = createGoalShareContent(
        goalProgress.goal.title,
        goalProgress.progress,
        goalProgress.goal.currentAmount,
        goalProgress.goal.targetAmount
      );
      await shareContent(shareData);
    } catch (error) {
      const { logger } = await import('@/utils/logger');
      logger.error('Error sharing goal', error instanceof Error ? error : new Error(String(error)));
      Alert.alert('Error', 'Failed to share goal. Please try again.');
    }
  };

  if (goals.length === 0) {
    return (
      <Card variant="elevated" style={styles.card}>
        <View style={styles.emptyContainer}>
          <Ionicons name="flag-outline" size={32} color={colors.textLight} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>No Savings Goals</Text>
          <Text style={[styles.emptyText, { color: colors.textLight }]}>
            Create a goal to track your savings progress
          </Text>
          {onPress && (
            <TouchableOpacity
              style={[styles.createButton, { backgroundColor: colors.primary[500] }]}
              onPress={onPress}
            >
              <Text style={[styles.createButtonText, { color: colors.textDark }]}>
                Create Goal
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </Card>
    );
  }

  const displayGoals = goals.slice(0, maxDisplay);
  const remainingCount = goals.length - displayGoals.length;

  return (
    <Card variant="elevated" style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="flag" size={24} color={colors.primary[600]} />
          <Text style={[styles.title, { color: colors.text }]}>Savings Goals</Text>
        </View>
        {onPress && (
          <TouchableOpacity onPress={onPress}>
            <Ionicons name="add-circle" size={24} color={colors.primary[600]} />
          </TouchableOpacity>
        )}
      </View>

      {displayGoals.map((goalProgress) => {
        const { goal, progress, remaining, daysRemaining, onTrack } = goalProgress;
        const isCompleted = goal.isCompleted;

        return (
          <View key={goal.id} style={styles.goalItem}>
            <View style={styles.goalHeader}>
              <View style={styles.goalTitleRow}>
                {goal.color && (
                  <View
                    style={[
                      styles.colorIndicator,
                      { backgroundColor: goal.color },
                    ]}
                  />
                )}
                <Text style={[styles.goalTitle, { color: colors.text }]} numberOfLines={1}>
                  {goal.title}
                </Text>
                {isCompleted && (
                  <Ionicons name="checkmark-circle" size={20} color={colors.success[500]} />
                )}
              </View>
              <View style={styles.goalHeaderRight}>
                <Text style={[styles.goalAmount, { color: colors.text }]}>
                  {formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}
                </Text>
                <TouchableOpacity
                  onPress={() => handleShareGoal(goalProgress)}
                  style={styles.shareButton}
                >
                  <Ionicons name="share-outline" size={18} color={colors.primary[600]} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Progress Bar */}
            <View style={[styles.progressBarContainer, { backgroundColor: colors.borderLight }]}>
              <View
                style={[
                  styles.progressBar,
                  {
                    width: `${Math.min(100, progress)}%`,
                    backgroundColor: isCompleted
                      ? colors.success[500]
                      : onTrack
                      ? colors.primary[500]
                      : colors.warning[500],
                  },
                ]}
              />
            </View>

            <View style={styles.goalFooter}>
              <Text style={[styles.progressText, { color: colors.textLight }]}>
                {progress.toFixed(1)}% complete
              </Text>
              {!isCompleted && (
                <>
                  <Text style={[styles.separator, { color: colors.textLight }]}>•</Text>
                  <Text style={[styles.remainingText, { color: colors.textLight }]}>
                    {formatCurrency(remaining)} remaining
                  </Text>
                  {daysRemaining !== undefined && daysRemaining > 0 && (
                    <>
                      <Text style={[styles.separator, { color: colors.textLight }]}>•</Text>
                      <Text
                        style={[
                          styles.daysText,
                          { color: onTrack ? colors.success[600] : colors.warning[600] },
                        ]}
                      >
                        {daysRemaining} days left
                      </Text>
                    </>
                  )}
                </>
              )}
            </View>
          </View>
        );
      })}

      {remainingCount > 0 && (
        <TouchableOpacity
          style={styles.viewAllButton}
          onPress={onPress}
        >
          <Text style={[styles.viewAllText, { color: colors.primary[600] }]}>
            View all {goals.length} goals
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
  goalItem: {
    marginBottom: spacing.base,
    paddingBottom: spacing.base,
    borderBottomWidth: 1,
  },
  goalHeader: {
    marginBottom: spacing.sm,
  },
  goalHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: spacing.xs,
    marginTop: spacing.xs / 2,
  },
  shareButton: {
    padding: spacing.xs / 2,
  },
  goalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs / 2,
  },
  colorIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  goalTitle: {
    flex: 1,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
  },
  goalAmount: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
  progressBarContainer: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: spacing.xs,
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  goalFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  progressText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
  },
  separator: {
    fontSize: typography.fontSize.xs,
  },
  remainingText: {
    fontSize: typography.fontSize.xs,
  },
  daysText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
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
    marginBottom: spacing.base,
  },
  createButton: {
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    borderRadius: spacing.md,
    marginTop: spacing.sm,
  },
  createButtonText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
  },
});

