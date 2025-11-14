import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { typography } from '@/constants/typography';
import { spacing } from '@/constants/spacing';
import { Impulse } from '@/types/impulse';
import { formatCurrency } from '@/utils/currency';
import { CATEGORY_LABELS } from '@/constants/categories';

interface HistoryItemProps {
  impulse: Impulse;
  onPress: () => void;
}

export function HistoryItem({ impulse, onPress }: HistoryItemProps) {
  const { colors } = useTheme();

  const getStatusLabel = () => {
    if (impulse.status === 'CANCELLED') {
      return { label: 'Skipped', emoji: '✅', color: colors.success[700] };
    }
    if (impulse.status === 'EXECUTED') {
      if (impulse.regretRating) {
        if (impulse.regretRating >= 4) {
          return { label: 'Regret', emoji: '😭', color: colors.error[600] };
        } else if (impulse.regretRating <= 2) {
          return { label: 'No Regret', emoji: '😌', color: colors.success[600] };
        } else {
          return { label: 'Neutral', emoji: '😐', color: colors.textLight };
        }
      } else if (impulse.finalFeeling === 'REGRET') {
        return { label: 'Regret', emoji: '😭', color: colors.error[600] };
      } else if (impulse.finalFeeling === 'WORTH_IT') {
        return { label: 'No Regret', emoji: '😌', color: colors.success[600] };
      } else {
        return { label: 'Neutral', emoji: '😐', color: colors.textLight };
      }
    }
    return { label: 'Locked', emoji: '🔒', color: colors.textLight };
  };

  const getRegretRatingText = () => {
    if (impulse.status === 'EXECUTED' && impulse.regretRating) {
      return `Regret ${impulse.regretRating}/5`;
    }
    return null;
  };

  const statusInfo = getStatusLabel();
  const regretText = getRegretRatingText();

  return (
    <TouchableOpacity
      style={[styles.item, { backgroundColor: colors.surface, borderColor: colors.border }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.statusLabel, { color: statusInfo.color }]}>
            [{statusInfo.label} {statusInfo.emoji}]
          </Text>
        </View>
        <Text style={[styles.title, { color: colors.text }]}>{impulse.title}</Text>
        <View style={styles.meta}>
          {impulse.price && (
            <Text style={[styles.price, { color: colors.primary[600] }]}>
              {formatCurrency(impulse.price)}
            </Text>
          )}
          {impulse.status === 'CANCELLED' && (
            <Text style={[styles.savedLabel, { color: colors.success[700] }]}>Saved</Text>
          )}
          {regretText && (
            <Text style={[styles.regretRating, { color: colors.error[600] }]}>
              {regretText}
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  item: {
    padding: spacing.base,
    borderRadius: spacing.md,
    borderWidth: 1,
    marginBottom: spacing.sm,
  },
  content: {
    gap: spacing.xs,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
  },
  title: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  price: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
  },
  savedLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
  regretRating: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
});

