import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from './ui/Card';
import { colors } from '@/constants/colors';
import { typography } from '@/constants/typography';
import { spacing } from '@/constants/spacing';
import { formatCurrency, formatCurrencyCompact } from '@/utils/currency';
import { UserStats } from '@/types/impulse';
import { createStatsShareContent, shareContent } from '@/utils/share';

interface StatsCardProps {
  stats: UserStats;
  variant?: 'default' | 'compact';
}

export function StatsCard({ stats, variant = 'default' }: StatsCardProps) {
  const handleShare = async () => {
    try {
      const shareData = createStatsShareContent(stats);
      await shareContent(shareData);
    } catch (error) {
      const { logger } = await import('@/utils/logger');
      logger.error('Error sharing stats', error instanceof Error ? error : new Error(String(error)));
      Alert.alert('Error', 'Failed to share stats. Please try again.');
    }
  };

  if (variant === 'compact') {
    return (
      <Card variant="elevated">
        <View style={styles.compactContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{formatCurrencyCompact(stats.totalSaved)}</Text>
            <Text style={styles.statLabel}>Saved</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.currentStreak}</Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.totalCancelled}</Text>
            <Text style={styles.statLabel}>Avoided</Text>
          </View>
        </View>
      </Card>
    );
  }

  return (
    <Card variant="elevated">
      <View style={styles.header}>
        <Text style={styles.title}>Your Progress</Text>
        <TouchableOpacity onPress={handleShare} style={styles.shareButton}>
          <Ionicons name="share-outline" size={20} color={colors.primary[600]} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.mainStat}>
        <Text style={styles.mainValue}>{formatCurrency(stats.totalSaved)}</Text>
        <Text style={styles.mainLabel}>Total money saved</Text>
      </View>

      <View style={styles.statsGrid}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.currentStreak}</Text>
          <Text style={styles.statLabel}>Day streak</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.totalCancelled}</Text>
          <Text style={styles.statLabel}>Impulses avoided</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.totalExecuted}</Text>
          <Text style={styles.statLabel}>Executed</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, stats.regretRate > 50 && styles.regretValue]}>
            {stats.regretRate.toFixed(0)}%
          </Text>
          <Text style={styles.statLabel}>Regret rate</Text>
        </View>
      </View>

      {stats.todaySaved > 0 && (
        <View style={styles.todayStat}>
          <Text style={styles.todayLabel}>Today: {formatCurrency(stats.todaySaved)} saved</Text>
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.base,
  },
  title: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    flex: 1,
  },
  shareButton: {
    padding: spacing.xs,
  },
  mainStat: {
    alignItems: 'center',
    marginBottom: spacing.lg,
    paddingBottom: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  mainValue: {
    fontSize: 36,
    fontWeight: typography.fontWeight.bold,
    color: colors.success[600],
    marginBottom: spacing.xs,
  },
  mainLabel: {
    fontSize: typography.fontSize.base,
    color: colors.textLight,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    width: '48%',
    marginBottom: spacing.base,
  },
  statValue: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  statLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.textLight,
  },
  regretValue: {
    color: colors.error[600],
  },
  todayStat: {
    marginTop: spacing.base,
    paddingTop: spacing.base,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  todayLabel: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.success[600],
    textAlign: 'center',
  },
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.border,
  },
});

