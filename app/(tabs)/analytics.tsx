import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useImpulses } from '@/hooks/useImpulses';
import { AnalyticsChart } from '@/components/AnalyticsChart';
import { Card } from '@/components/ui/Card';
import { colors } from '@/constants/colors';
import { typography } from '@/constants/typography';
import { spacing } from '@/constants/spacing';

type ChartType = 'spending' | 'category' | 'regret';

export default function AnalyticsScreen() {
  const { impulses } = useImpulses();
  const [selectedChart, setSelectedChart] = useState<ChartType>('spending');

  const chartTypes: { type: ChartType; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    { type: 'spending', label: 'Spending', icon: 'trending-up' },
    { type: 'category', label: 'Categories', icon: 'pie-chart' },
    { type: 'regret', label: 'Regret Rate', icon: 'alert-circle' },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerIcon}>
            <Ionicons name="analytics" size={28} color={colors.primary[600]} />
          </View>
          <Text style={styles.title}>Analytics</Text>
          <Text style={styles.subtitle}>Visual insights into your spending patterns</Text>
        </View>

        {/* Chart Type Selector */}
        <View style={styles.selectorContainer}>
          {chartTypes.map(({ type, label, icon }) => (
            <TouchableOpacity
              key={type}
              style={[
                styles.selectorButton,
                selectedChart === type && styles.selectorButtonActive,
              ]}
              onPress={() => setSelectedChart(type)}
            >
              <Ionicons
                name={icon}
                size={20}
                color={selectedChart === type ? colors.primary[600] : colors.textLight}
              />
              <Text
                style={[
                  styles.selectorText,
                  selectedChart === type && styles.selectorTextActive,
                ]}
              >
                {label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Chart */}
        <Card variant="elevated" style={styles.chartCard}>
          <AnalyticsChart impulses={impulses} type={selectedChart} />
        </Card>

        {/* Insights */}
        <Card variant="elevated" style={styles.insightsCard}>
          <Text style={styles.insightsTitle}>Key Insights</Text>
          <View style={styles.insightItem}>
            <Ionicons name="bulb-outline" size={20} color={colors.primary[600]} />
            <Text style={styles.insightText}>
              {impulses.filter(i => i.finalFeeling === 'REGRET').length} regretted purchases
            </Text>
          </View>
          <View style={styles.insightItem}>
            <Ionicons name="trending-down-outline" size={20} color={colors.success[600]} />
            <Text style={styles.insightText}>
              {impulses.filter(i => i.status === 'CANCELLED').length} impulses avoided
            </Text>
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.base,
  },
  header: {
    marginBottom: spacing.xl,
  },
  headerIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.base,
  },
  title: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.fontSize.base,
    color: colors.textLight,
  },
  selectorContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.base,
  },
  selectorButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.sm,
    borderRadius: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    gap: spacing.xs,
  },
  selectorButtonActive: {
    borderColor: colors.primary[500],
    backgroundColor: colors.primary[50],
  },
  selectorText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.textLight,
  },
  selectorTextActive: {
    color: colors.primary[700],
    fontWeight: typography.fontWeight.semibold,
  },
  chartCard: {
    marginBottom: spacing.base,
    padding: spacing.base,
  },
  insightsCard: {
    marginBottom: spacing.base,
  },
  insightsTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.base,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  insightText: {
    flex: 1,
    fontSize: typography.fontSize.base,
    color: colors.text,
  },
});

