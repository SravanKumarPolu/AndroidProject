import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from './ui/Card';
import { BudgetProgress, BudgetAlert } from '@/types/budget';
import { useTheme } from '@/contexts/ThemeContext';
import { formatCurrency } from '@/utils/currency';
import { typography } from '@/constants/typography';
import { spacing, borderRadius } from '@/constants/spacing';

interface BudgetCardProps {
  progress: BudgetProgress;
  alert?: BudgetAlert;
  onPress?: () => void;
}

export function BudgetCard({ progress, alert, onPress }: BudgetCardProps) {
  const { colors } = useTheme();
  const { budget, spent, remaining, percentageUsed, isOverBudget, daysRemaining } = progress;

  const getProgressColor = () => {
    if (isOverBudget) return colors.error[500];
    if (percentageUsed >= 90) return colors.error[400];
    if (percentageUsed >= 75) return colors.warning[500];
    return colors.success[500];
  };

  const getPeriodLabel = () => {
    switch (budget.period) {
      case 'WEEKLY': return 'Week';
      case 'MONTHLY': return 'Month';
      case 'YEARLY': return 'Year';
    }
  };

  const getCategoryLabel = () => {
    if (budget.type === 'TOTAL') return 'Total Budget';
    // Import category labels
    const { CATEGORY_LABELS } = require('@/constants/categories');
    return `${CATEGORY_LABELS[budget.category as keyof typeof CATEGORY_LABELS] || budget.category} Budget`;
  };

  const content = (
    <View>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={[styles.iconContainer, { backgroundColor: colors.primary[50] }]}>
            <Ionicons name="wallet" size={20} color={colors.primary[600]} />
          </View>
          <View style={styles.headerText}>
            <Text style={[styles.title, { color: colors.text }]}>{getCategoryLabel()}</Text>
            <Text style={[styles.period, { color: colors.textLight }]}>
              {getPeriodLabel()} • {daysRemaining} days left
            </Text>
          </View>
        </View>
        {alert && (
          <View style={[
            styles.alertBadge,
            {
              backgroundColor: alert.type === 'EXCEEDED' ? colors.error[100] :
                               alert.type === 'CRITICAL' ? colors.error[50] :
                               colors.warning[50],
            }
          ]}>
            <Ionicons
              name={alert.type === 'EXCEEDED' ? 'alert-circle' : 'warning'}
              size={16}
              color={alert.type === 'EXCEEDED' ? colors.error[600] : colors.warning[600]}
            />
          </View>
        )}
      </View>

      {/* Amounts */}
      <View style={styles.amountsRow}>
        <View style={styles.amountItem}>
          <Text style={[styles.amountLabel, { color: colors.textLight }]}>Budget</Text>
          <Text style={[styles.amountValue, { color: colors.text }]}>
            {formatCurrency(budget.amount)}
          </Text>
        </View>
        <View style={styles.amountItem}>
          <Text style={[styles.amountLabel, { color: colors.textLight }]}>Spent</Text>
          <Text style={[
            styles.amountValue,
            { color: isOverBudget ? colors.error[600] : colors.text }
          ]}>
            {formatCurrency(spent)}
          </Text>
        </View>
        <View style={styles.amountItem}>
          <Text style={[styles.amountLabel, { color: colors.textLight }]}>Remaining</Text>
          <Text style={[
            styles.amountValue,
            { color: remaining > 0 ? colors.success[600] : colors.error[600] }
          ]}>
            {formatCurrency(remaining)}
          </Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={[styles.progressBar, { backgroundColor: colors.gray[200] }]}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${Math.min(100, percentageUsed)}%`,
                backgroundColor: getProgressColor(),
              },
            ]}
          />
        </View>
        <Text style={[styles.progressText, { color: colors.textLight }]}>
          {percentageUsed.toFixed(0)}% used
        </Text>
      </View>

      {/* Alert Message */}
      {alert && (
        <View style={[
          styles.alertContainer,
          {
            backgroundColor: alert.type === 'EXCEEDED' ? colors.error[50] :
                             alert.type === 'CRITICAL' ? colors.error[50] :
                             colors.warning[50],
            borderColor: alert.type === 'EXCEEDED' ? colors.error[200] :
                        alert.type === 'CRITICAL' ? colors.error[200] :
                        colors.warning[200],
          }
        ]}>
          <Ionicons
            name={alert.type === 'EXCEEDED' ? 'alert-circle' : 'warning'}
            size={16}
            color={alert.type === 'EXCEEDED' ? colors.error[700] : colors.warning[700]}
          />
          <Text style={[
            styles.alertText,
            {
              color: alert.type === 'EXCEEDED' ? colors.error[700] : colors.warning[700],
            }
          ]}>
            {alert.message}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.base,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: spacing.sm,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    marginBottom: spacing.xs / 2,
  },
  period: {
    fontSize: typography.fontSize.sm,
  },
  alertBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  amountsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.base,
    paddingTop: spacing.base,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  amountItem: {
    alignItems: 'center',
  },
  amountLabel: {
    fontSize: typography.fontSize.xs,
    marginBottom: spacing.xs / 2,
  },
  amountValue: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
  },
  progressContainer: {
    marginBottom: spacing.sm,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: spacing.xs,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: typography.fontSize.xs,
    textAlign: 'right',
  },
  alertContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    gap: spacing.xs,
  },
  alertText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
});

