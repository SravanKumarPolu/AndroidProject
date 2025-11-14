import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';
import { colors } from '@/constants/colors';
import { typography } from '@/constants/typography';
import { spacing } from '@/constants/spacing';
import { Impulse } from '@/types/impulse';
import { formatCurrency } from '@/utils/currency';
import { formatDate } from '@/utils/date';

const screenWidth = Dimensions.get('window').width;

interface AnalyticsChartProps {
  impulses: Impulse[];
  type: 'spending' | 'category' | 'regret';
}

const chartConfig = {
  backgroundColor: colors.surface,
  backgroundGradientFrom: colors.surface,
  backgroundGradientTo: colors.surface,
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(99, 102, 241, ${opacity})`, // indigo
  labelColor: (opacity = 1) => `rgba(31, 41, 55, ${opacity})`,
  style: {
    borderRadius: spacing.md,
  },
  propsForDots: {
    r: '4',
    strokeWidth: '2',
    stroke: colors.primary[600],
  },
};

export function AnalyticsChart({ impulses, type }: AnalyticsChartProps) {
  if (impulses.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Not enough data to show analytics</Text>
      </View>
    );
  }

  switch (type) {
    case 'spending':
      return <SpendingChart impulses={impulses} />;
    case 'category':
      return <CategoryChart impulses={impulses} />;
    case 'regret':
      return <RegretChart impulses={impulses} />;
    default:
      return null;
  }
}

/**
 * Spending trend over time
 */
function SpendingChart({ impulses }: { impulses: Impulse[] }) {
  // Group by week
  const weeklyData = new Map<string, number>();
  
  impulses
    .filter(i => i.price && i.executedAt)
    .forEach(impulse => {
      const date = new Date(impulse.executedAt!);
      const weekKey = `${date.getFullYear()}-W${getWeekNumber(date)}`;
      weeklyData.set(weekKey, (weeklyData.get(weekKey) || 0) + (impulse.price || 0));
    });

  const labels = Array.from(weeklyData.keys()).slice(-8); // Last 8 weeks
  const data = labels.map(key => weeklyData.get(key) || 0);

  if (data.length === 0) {
    return <EmptyChart message="No spending data yet" />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Spending Trend</Text>
      <LineChart
        data={{
          labels: labels.map(l => l.split('-W')[1]), // Show week numbers
          datasets: [
            {
              data,
              color: (opacity = 1) => `rgba(99, 102, 241, ${opacity})`,
              strokeWidth: 2,
            },
          ],
        }}
        width={screenWidth - spacing.base * 2}
        height={220}
        chartConfig={chartConfig}
        bezier
        style={styles.chart}
        yAxisSuffix="₹"
        yAxisInterval={1}
      />
    </View>
  );
}

/**
 * Category breakdown
 */
function CategoryChart({ impulses }: { impulses: Impulse[] }) {
  const categoryTotals = new Map<string, number>();
  
  impulses
    .filter(i => i.price)
    .forEach(impulse => {
      const category = impulse.category;
      categoryTotals.set(category, (categoryTotals.get(category) || 0) + (impulse.price || 0));
    });

  const categories = Array.from(categoryTotals.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  if (categories.length === 0) {
    return <EmptyChart message="No category data yet" />;
  }

  const data = categories.map(([category, value]) => ({
    name: category.substring(0, 8), // Shorten for display
    amount: value,
    color: getCategoryColor(category),
    legendFontColor: colors.text,
    legendFontSize: 12,
  }));

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Spending by Category</Text>
      <PieChart
        data={data}
        width={screenWidth - spacing.base * 2}
        height={220}
        chartConfig={chartConfig}
        accessor="amount"
        backgroundColor="transparent"
        paddingLeft="15"
        style={styles.chart}
      />
    </View>
  );
}

/**
 * Regret rate over time
 */
function RegretChart({ impulses }: { impulses: Impulse[] }) {
  // Group by month
  const monthlyData = new Map<string, { total: number; regrets: number }>();
  
  impulses
    .filter(i => i.executedAt)
    .forEach(impulse => {
      const date = new Date(impulse.executedAt!);
      const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
      const existing = monthlyData.get(monthKey) || { total: 0, regrets: 0 };
      existing.total++;
      if (impulse.finalFeeling === 'REGRET') {
        existing.regrets++;
      }
      monthlyData.set(monthKey, existing);
    });

  const labels = Array.from(monthlyData.keys()).slice(-6); // Last 6 months
  const regretRates = labels.map(key => {
    const data = monthlyData.get(key)!;
    return data.total > 0 ? (data.regrets / data.total) * 100 : 0;
  });

  if (regretRates.length === 0) {
    return <EmptyChart message="No regret data yet" />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Regret Rate Trend</Text>
      <BarChart
        data={{
          labels: labels.map(l => {
            const [year, month] = l.split('-');
            return `${month}/${year.slice(2)}`;
          }),
          datasets: [
            {
              data: regretRates,
            },
          ],
        }}
        width={screenWidth - spacing.base * 2}
        height={220}
        chartConfig={chartConfig}
        style={styles.chart}
        yAxisLabel=""
        yAxisSuffix="%"
        yAxisInterval={10}
        showValuesOnTopOfBars
      />
    </View>
  );
}

function EmptyChart({ message }: { message: string }) {
  return (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>{message}</Text>
    </View>
  );
}

function getCategoryColor(category: string): string {
  const colors = [
    '#6366f1', // indigo
    '#8b5cf6', // purple
    '#ec4899', // pink
    '#f59e0b', // amber
    '#10b981', // emerald
    '#3b82f6', // blue
  ];
  return colors[category.charCodeAt(0) % colors.length];
}

function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.base,
  },
  title: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  chart: {
    marginVertical: spacing.sm,
    borderRadius: spacing.md,
  },
  emptyContainer: {
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
  },
  emptyText: {
    fontSize: typography.fontSize.base,
    color: colors.textLight,
    textAlign: 'center',
  },
});

