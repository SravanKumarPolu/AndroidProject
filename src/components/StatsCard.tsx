import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from './ui/Card';
import { useTheme } from '@/contexts/ThemeContext';
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
  const { colors } = useTheme();
  
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
            <Text style={[styles.statValue, { color: colors.text }]}>{formatCurrencyCompact(stats.totalSaved)}</Text>
            <Text style={[styles.statLabel, { color: colors.textLight }]}>Saved</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.text }]}>{stats.currentStreak}</Text>
            <Text style={[styles.statLabel, { color: colors.textLight }]}>Day Streak</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.text }]}>{stats.totalCancelled}</Text>
            <Text style={[styles.statLabel, { color: colors.textLight }]}>Avoided</Text>
          </View>
        </View>
      </Card>
    );
  }

  return (
    <Card variant="elevated">
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Your Progress</Text>
        <TouchableOpacity onPress={handleShare} style={styles.shareButton}>
          <Ionicons name="share-outline" size={20} color={colors.primary[600]} />
        </TouchableOpacity>
      </View>
      
      <View style={[styles.mainStat, { borderBottomColor: colors.border }]}>
        <Text style={[styles.mainValue, { color: colors.success[700] }]}>{formatCurrency(stats.totalSaved)}</Text>
        <Text style={[styles.mainLabel, { color: colors.textLight }]}>Total money saved</Text>
      </View>

      <View style={styles.statsGrid}>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: colors.text }]}>{stats.currentStreak}</Text>
          <Text style={[styles.statLabel, { color: colors.textLight }]}>Day streak</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: colors.text }]}>{stats.totalCancelled}</Text>
          <Text style={[styles.statLabel, { color: colors.textLight }]}>Impulses avoided</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: colors.text }]}>{stats.totalExecuted}</Text>
          <Text style={[styles.statLabel, { color: colors.textLight }]}>Executed</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[
            styles.statValue,
            { color: colors.text },
            stats.regretRate > 50 && { color: colors.error[600] }
          ]}>
            {stats.regretRate.toFixed(0)}%
          </Text>
          <Text style={[styles.statLabel, { color: colors.textLight }]}>Regret rate</Text>
        </View>
      </View>

      {stats.todaySaved > 0 && (
        <View style={[styles.todayStat, { borderTopColor: colors.border }]}>
          <Text style={[styles.todayLabel, { color: colors.success[700] }]}>Today: {formatCurrency(stats.todaySaved)} saved</Text>
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
  },
  mainValue: {
    fontSize: 36,
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing.xs,
  },
  mainLabel: {
    fontSize: typography.fontSize.base,
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
    marginBottom: spacing.xs,
  },
  statLabel: {
    fontSize: typography.fontSize.sm,
  },
  regretValue: {
    // Color applied dynamically
  },
  todayStat: {
    marginTop: spacing.base,
    paddingTop: spacing.base,
    borderTopWidth: 1,
  },
  todayLabel: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
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
  },
});

