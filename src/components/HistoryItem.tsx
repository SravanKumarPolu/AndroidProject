import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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
      return { label: 'Skipped', icon: 'checkmark-circle', color: colors.success[700] as string };
    }
    if (impulse.status === 'EXECUTED') {
      if (impulse.regretRating) {
        if (impulse.regretRating >= 4) {
          return { label: 'Regret', icon: 'sad-outline', color: colors.error[600] as string };
        } else if (impulse.regretRating <= 2) {
          return { label: 'No Regret', icon: 'happy-outline', color: colors.success[600] as string };
        } else {
          return { label: 'Neutral', icon: 'remove-circle-outline', color: colors.textLight as string };
        }
      } else if (impulse.finalFeeling === 'REGRET') {
        return { label: 'Regret', icon: 'sad-outline', color: colors.error[600] as string };
      } else if (impulse.finalFeeling === 'WORTH_IT') {
        return { label: 'No Regret', icon: 'happy-outline', color: colors.success[600] as string };
      } else {
        return { label: 'Neutral', icon: 'remove-circle-outline', color: colors.textLight as string };
      }
    }
    return { label: 'Locked', icon: 'lock-closed-outline', color: colors.textLight as string };
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
      accessibilityRole="button"
      accessibilityLabel={`${impulse.title}, ${impulse.status.toLowerCase()}${impulse.price ? `, ${formatCurrency(impulse.price)}` : ''}`}
      accessibilityHint="Opens impulse details"
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.statusPill}>
            <Ionicons name={statusInfo.icon as any} size={14} color={statusInfo.color} />
            <Text style={[styles.statusLabel, { color: statusInfo.color }]}>
              {statusInfo.label}
            </Text>
          </View>
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
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
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

