import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from './ui/Card';
import { colors } from '@/constants/colors';
import { typography } from '@/constants/typography';
import { spacing } from '@/constants/spacing';
import { CategoryStats } from '@/types/impulse';
import { CATEGORY_LABELS } from '@/constants/categories';
import { CategoryIcon } from './CategoryIcon';
import { formatCurrency } from '@/utils/currency';

interface WeakCategoriesCardProps {
  categoryStats: CategoryStats[];
}

export function WeakCategoriesCard({ categoryStats }: WeakCategoriesCardProps) {
  // Sort by regret rate (highest first), then by total logged
  const sorted = [...categoryStats]
    .sort((a, b) => {
      if (b.regretRate !== a.regretRate) {
        return b.regretRate - a.regretRate;
      }
      return b.totalLogged - a.totalLogged;
    })
    .slice(0, 5); // Top 5

  if (sorted.length === 0) {
    return null;
  }

  const highestRegret = sorted[0];

  return (
    <Card variant="elevated" style={styles.card}>
      <Text style={styles.title}>Weak Categories</Text>
      <Text style={styles.subtitle}>
        Categories where you have the highest regret rate
      </Text>

      {highestRegret && highestRegret.regretRate > 0 && (
        <View style={styles.warningBox}>
          <Text style={styles.warningText}>
            ⚠️ {CATEGORY_LABELS[highestRegret.category]} has {highestRegret.regretRate.toFixed(0)}% regret rate
          </Text>
        </View>
      )}

      <View style={styles.list}>
        {sorted.map((stat) => (
          <View key={stat.category} style={styles.item}>
            <View style={styles.itemLeft}>
              <CategoryIcon category={stat.category} size={24} />
              <View style={styles.itemText}>
                <Text style={styles.categoryName}>
                  {CATEGORY_LABELS[stat.category]}
                </Text>
                <Text style={styles.categoryStats}>
                  {stat.totalLogged} logged • {stat.totalRegretted} regretted
                </Text>
              </View>
            </View>
            <View style={styles.itemRight}>
              {stat.regretRate > 0 ? (
                <Text style={[styles.regretRate, stat.regretRate > 50 && styles.highRegret]}>
                  {stat.regretRate.toFixed(0)}%
                </Text>
              ) : (
                <Text style={styles.noRegret}>No regrets</Text>
              )}
            </View>
          </View>
        ))}
      </View>
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
  warningBox: {
    backgroundColor: colors.accent[50],
    padding: spacing.sm,
    borderRadius: spacing.md,
    marginBottom: spacing.base,
    borderLeftWidth: 3,
    borderLeftColor: colors.accent[500],
  },
  warningText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.accent[800],
  },
  list: {
    gap: spacing.sm,
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: spacing.sm,
  },
  itemText: {
    flex: 1,
  },
  categoryName: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.text,
    marginBottom: spacing.xs / 2,
  },
  categoryStats: {
    fontSize: typography.fontSize.sm,
    color: colors.textLight,
  },
  itemRight: {
    alignItems: 'flex-end',
  },
  regretRate: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.error[600],
  },
  highRegret: {
    color: colors.error[700],
  },
  noRegret: {
    fontSize: typography.fontSize.sm,
    color: colors.success[600],
    fontWeight: typography.fontWeight.medium,
  },
});

