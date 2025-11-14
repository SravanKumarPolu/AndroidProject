import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useImpulses } from '@/hooks/useImpulses';
import { useStats } from '@/hooks/useStats';
import { AnalyticsChart } from '@/components/AnalyticsChart';
import { Card } from '@/components/ui/Card';
import { colors } from '@/constants/colors';
import { typography } from '@/constants/typography';
import { spacing } from '@/constants/spacing';
import {
  calculateMonthlyTrends,
  calculateCategoryTrends,
  generateInsights,
  calculateSavingsVelocity,
  getTopSpendingCategories,
  calculateAverageDecisionTime,
} from '@/utils/advancedAnalytics';
import { formatCurrency } from '@/utils/currency';
import { CATEGORY_LABELS } from '@/constants/categories';

type ChartType = 'spending' | 'category' | 'regret';

export default function AnalyticsScreen() {
  const { impulses } = useImpulses();
  const { stats, categoryStats } = useStats(impulses);
  const [selectedChart, setSelectedChart] = useState<ChartType>('spending');
  
  // Advanced analytics
  const monthlyTrends = useMemo(() => calculateMonthlyTrends(impulses, 6), [impulses]);
  const categoryTrends = useMemo(() => calculateCategoryTrends(impulses), [impulses]);
  const insights = useMemo(() => generateInsights(impulses, stats, categoryStats), [impulses, stats, categoryStats]);
  const savingsVelocity = useMemo(() => calculateSavingsVelocity(impulses), [impulses]);
  const topCategories = useMemo(() => getTopSpendingCategories(impulses, 5), [impulses]);
  const avgDecisionTime = useMemo(() => calculateAverageDecisionTime(impulses), [impulses]);

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

        {/* Advanced Metrics */}
        <Card variant="elevated" style={styles.insightsCard}>
          <Text style={styles.insightsTitle}>Advanced Metrics</Text>
          
          {savingsVelocity > 0 && (
            <View style={styles.metricItem}>
              <Ionicons name="speedometer-outline" size={20} color={colors.primary[600]} />
              <View style={styles.metricContent}>
                <Text style={styles.metricLabel}>Savings Velocity</Text>
                <Text style={styles.metricValue}>
                  {formatCurrency(savingsVelocity)}/day
                </Text>
              </View>
            </View>
          )}
          
          {avgDecisionTime > 0 && (
            <View style={styles.metricItem}>
              <Ionicons name="time-outline" size={20} color={colors.primary[600]} />
              <View style={styles.metricContent}>
                <Text style={styles.metricLabel}>Avg Decision Time</Text>
                <Text style={styles.metricValue}>
                  {Math.round(avgDecisionTime / (60 * 60 * 1000))} hours
                </Text>
              </View>
            </View>
          )}
          
          {topCategories.length > 0 && (
            <View style={styles.metricItem}>
              <Ionicons name="podium-outline" size={20} color={colors.primary[600]} />
              <View style={styles.metricContent}>
                <Text style={styles.metricLabel}>Top Spending Category</Text>
                <Text style={styles.metricValue}>
                  {CATEGORY_LABELS[topCategories[0].category as keyof typeof CATEGORY_LABELS]} ({formatCurrency(topCategories[0].total)})
                </Text>
              </View>
            </View>
          )}
        </Card>

        {/* Monthly Trends */}
        {monthlyTrends.length > 0 && (
          <Card variant="elevated" style={styles.insightsCard}>
            <Text style={styles.insightsTitle}>Monthly Trends</Text>
            {monthlyTrends.slice(-3).map((trend, index) => (
              <View key={index} style={styles.trendItem}>
                <Text style={styles.trendPeriod}>{trend.period}</Text>
                <View style={styles.trendRow}>
                  <View style={styles.trendStat}>
                    <Text style={styles.trendLabel}>Spent</Text>
                    <Text style={[styles.trendValue, { color: colors.error[600] }]}>
                      {formatCurrency(trend.totalSpent)}
                    </Text>
                  </View>
                  <View style={styles.trendStat}>
                    <Text style={styles.trendLabel}>Saved</Text>
                    <Text style={[styles.trendValue, { color: colors.success[600] }]}>
                      {formatCurrency(trend.totalSaved)}
                    </Text>
                  </View>
                  <View style={styles.trendStat}>
                    <Text style={styles.trendLabel}>Regret</Text>
                    <Text style={styles.trendValue}>
                      {trend.regretRate.toFixed(0)}%
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </Card>
        )}

        {/* Category Trends */}
        {categoryTrends.length > 0 && (
          <Card variant="elevated" style={styles.insightsCard}>
            <Text style={styles.insightsTitle}>Category Trends</Text>
            {categoryTrends.slice(0, 5).map((trend, index) => (
              <View key={index} style={styles.categoryTrendItem}>
                <View style={styles.categoryTrendLeft}>
                  <Text style={styles.categoryTrendName}>
                    {CATEGORY_LABELS[trend.category as keyof typeof CATEGORY_LABELS]}
                  </Text>
                  <Text style={styles.categoryTrendChange}>
                    {trend.change > 0 ? '+' : ''}{trend.change.toFixed(0)}% vs last month
                  </Text>
                </View>
                <Ionicons
                  name={trend.trend === 'up' ? 'trending-up' : trend.trend === 'down' ? 'trending-down' : 'remove'}
                  size={20}
                  color={
                    trend.trend === 'up' ? colors.error[600] :
                    trend.trend === 'down' ? colors.success[600] :
                    colors.textLight
                  }
                />
              </View>
            ))}
          </Card>
        )}

        {/* Personalized Insights */}
        {insights.length > 0 && (
          <Card variant="elevated" style={styles.insightsCard}>
            <Text style={styles.insightsTitle}>Personalized Insights</Text>
            {insights.map((insight, index) => (
              <View
                key={index}
                style={[
                  styles.insightItem,
                  {
                    backgroundColor:
                      insight.type === 'success' ? colors.success[50] :
                      insight.type === 'warning' ? colors.warning[50] :
                      insight.type === 'achievement' ? colors.primary[50] :
                      colors.gray[50],
                  },
                ]}
              >
                <Ionicons
                  name={
                    insight.type === 'success' ? 'checkmark-circle' :
                    insight.type === 'warning' ? 'warning' :
                    insight.type === 'achievement' ? 'trophy' :
                    'information-circle'
                  }
                  size={20}
                  color={
                    insight.type === 'success' ? colors.success[600] :
                    insight.type === 'warning' ? colors.warning[600] :
                    insight.type === 'achievement' ? colors.primary[600] :
                    colors.primary[600]
                  }
                />
                <View style={styles.insightContent}>
                  <Text style={styles.insightTitle}>{insight.title}</Text>
                  <Text style={styles.insightText}>{insight.message}</Text>
                </View>
              </View>
            ))}
          </Card>
        )}
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
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginBottom: spacing.sm,
    padding: spacing.sm,
    borderRadius: spacing.md,
  },
  insightContent: {
    flex: 1,
  },
  insightTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.xs / 2,
  },
  insightText: {
    fontSize: typography.fontSize.sm,
    color: colors.text,
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.sm,
  },
  metricItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.base,
    paddingBottom: spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  metricContent: {
    flex: 1,
  },
  metricLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.textLight,
    marginBottom: spacing.xs / 2,
  },
  metricValue: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  trendItem: {
    marginBottom: spacing.base,
    paddingBottom: spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  trendPeriod: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  trendRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  trendStat: {
    alignItems: 'center',
  },
  trendLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.textLight,
    marginBottom: spacing.xs / 2,
  },
  trendValue: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  categoryTrendItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.base,
    paddingBottom: spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  categoryTrendLeft: {
    flex: 1,
  },
  categoryTrendName: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.text,
    marginBottom: spacing.xs / 2,
  },
  categoryTrendChange: {
    fontSize: typography.fontSize.sm,
    color: colors.textLight,
  },
});

