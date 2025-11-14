import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { Card } from '@/components/ui/Card';
import { LocationStats } from '@/utils/locationInsights';
import { formatLocation } from '@/services/location';
import { useCurrency } from '@/contexts/CurrencyContext';
import { typography } from '@/constants/typography';
import { spacing } from '@/constants/spacing';

interface LocationInsightsCardProps {
  locationStats: LocationStats;
  onPress?: () => void;
}

export function LocationInsightsCard({ locationStats, onPress }: LocationInsightsCardProps) {
  const { colors } = useTheme();
  const { formatCurrency } = useCurrency();

  if (locationStats.totalLocations === 0) {
    return (
      <Card variant="elevated" style={styles.card}>
        <View style={styles.emptyContainer}>
          <Ionicons name="location-outline" size={32} color={colors.textLight} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>No Location Data</Text>
          <Text style={[styles.emptyText, { color: colors.textLight }]}>
            Enable location tracking to see where you make impulse purchases
          </Text>
        </View>
      </Card>
    );
  }

  return (
    <Card variant="elevated" style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="location" size={24} color={colors.primary[600]} />
          <Text style={[styles.title, { color: colors.text }]}>Location Insights</Text>
        </View>
        {onPress && (
          <TouchableOpacity onPress={onPress}>
            <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
          </TouchableOpacity>
        )}
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: colors.primary[600] }]}>
            {locationStats.uniqueLocations}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textLight }]}>Unique Locations</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: colors.success[600] }]}>
            {locationStats.totalLocations}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textLight }]}>Total Tracked</Text>
        </View>
      </View>

      {/* Most Frequent Location */}
      {locationStats.mostFrequentLocation && (
        <View style={[styles.insightBox, { backgroundColor: colors.primary[50] }]}>
          <View style={styles.insightHeader}>
            <Ionicons name="pin" size={16} color={colors.primary[600]} />
            <Text style={[styles.insightTitle, { color: colors.primary[700] }]}>
              Most Frequent
            </Text>
          </View>
          <Text style={[styles.insightLocation, { color: colors.text }]}>
            {locationStats.mostFrequentLocation.location}
          </Text>
          <Text style={[styles.insightMeta, { color: colors.textLight }]}>
            {locationStats.mostFrequentLocation.count} times
          </Text>
        </View>
      )}

      {/* Highest Spending Location */}
      {locationStats.highestSpendingLocation && (
        <View style={[styles.insightBox, { backgroundColor: colors.accent[50] }]}>
          <View style={styles.insightHeader}>
            <Ionicons name="cash" size={16} color={colors.accent[600]} />
            <Text style={[styles.insightTitle, { color: colors.accent[700] }]}>
              Highest Spending
            </Text>
          </View>
          <Text style={[styles.insightLocation, { color: colors.text }]}>
            {locationStats.highestSpendingLocation.location}
          </Text>
          <Text style={[styles.insightMeta, { color: colors.textLight }]}>
            {formatCurrency(locationStats.highestSpendingLocation.totalSpent)} total
          </Text>
        </View>
      )}

      {/* Top Locations */}
      {locationStats.locationInsights.length > 0 && (
        <View style={styles.topLocations}>
          <Text style={[styles.sectionLabel, { color: colors.text }]}>Top Locations</Text>
          {locationStats.locationInsights.slice(0, 3).map((insight, idx) => (
            <View key={idx} style={[styles.locationItem, { borderBottomColor: colors.border }]}>
              <View style={styles.locationLeft}>
                <View style={[styles.locationRank, { backgroundColor: colors.primary[100] }]}>
                  <Text style={[styles.locationRankText, { color: colors.primary[700] }]}>
                    {idx + 1}
                  </Text>
                </View>
                <View style={styles.locationInfo}>
                  <Text style={[styles.locationName, { color: colors.text }]} numberOfLines={1}>
                    {insight.location}
                  </Text>
                  <Text style={[styles.locationCount, { color: colors.textLight }]}>
                    {insight.count} times
                  </Text>
                </View>
              </View>
              {insight.totalSpent > 0 && (
                <Text style={[styles.locationSpent, { color: colors.text }]}>
                  {formatCurrency(insight.totalSpent)}
                </Text>
              )}
            </View>
          ))}
        </View>
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
  statsRow: {
    flexDirection: 'row',
    gap: spacing.base,
    marginBottom: spacing.base,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    padding: spacing.sm,
    borderRadius: spacing.md,
    backgroundColor: 'transparent',
  },
  statValue: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing.xs / 2,
  },
  statLabel: {
    fontSize: typography.fontSize.xs,
    textAlign: 'center',
  },
  insightBox: {
    padding: spacing.base,
    borderRadius: spacing.md,
    marginBottom: spacing.sm,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  insightTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
  },
  insightLocation: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    marginBottom: spacing.xs / 2,
  },
  insightMeta: {
    fontSize: typography.fontSize.xs,
  },
  topLocations: {
    marginTop: spacing.base,
  },
  sectionLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    marginBottom: spacing.sm,
  },
  locationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
  },
  locationLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: spacing.sm,
  },
  locationRank: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationRankText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
  },
  locationInfo: {
    flex: 1,
  },
  locationName: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    marginBottom: spacing.xs / 2,
  },
  locationCount: {
    fontSize: typography.fontSize.xs,
  },
  locationSpent: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
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
    paddingHorizontal: spacing.base,
  },
});



