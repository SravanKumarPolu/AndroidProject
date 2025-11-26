import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useImpulses } from '@/hooks/useImpulses';
import { useTheme } from '@/contexts/ThemeContext';
import { Card } from '@/components/ui/Card';
import { getCurrentMonthStats, MonthlyStats } from '@/utils/monthlyStats';
import { formatCurrency } from '@/utils/currency';
import { formatDate } from '@/utils/date';
import { typography } from '@/constants/typography';
import { spacing } from '@/constants/spacing';
import { TerminalGlow } from '@/components/TerminalGlow';

export default function MonthlyReportsScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { impulses } = useImpulses();

  // Get monthly reports (last 6 months)
  const monthlyReports = useMemo(() => {
    const reports: MonthlyStats[] = [];
    const now = Date.now();
    const today = new Date(now);
    
    // Start from current month, go back 6 months
    for (let i = 0; i < 6; i++) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthStart = date.getTime();
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999).getTime();
      
      const monthImpulses = impulses.filter(
        i => i.createdAt >= monthStart && i.createdAt <= monthEnd
      );

      if (monthImpulses.length > 0) {
        const cancelled = monthImpulses.filter(i => i.status === 'CANCELLED');
        const executed = monthImpulses.filter(i => i.status === 'EXECUTED');
        const regretted = executed.filter(i => 
          i.finalFeeling === 'REGRET' || (i.regretRating !== undefined && i.regretRating >= 3)
        );

        const totalSaved = cancelled.reduce((sum, i) => sum + (i.price || 0), 0);
        const regretRate = executed.length > 0 
          ? (regretted.length / executed.length) * 100 
          : 0;

        reports.push({
          monthStart,
          monthEnd,
          totalSaved,
          totalLogged: monthImpulses.length,
          totalCancelled: cancelled.length,
          totalExecuted: executed.length,
          totalRegretted: regretted.length,
          regretRate: Math.round(regretRate * 10) / 10,
        });
      }
    }
    
    return reports;
  }, [impulses]);

  const currentMonth = getCurrentMonthStats(impulses);

  const dynamicStyles = {
    container: { backgroundColor: colors.background },
    title: { color: colors.text },
    subtitle: { color: colors.textLight },
    sectionTitle: { color: colors.text },
  };

  const getMonthLabel = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  return (
    <SafeAreaView style={[styles.container, dynamicStyles.container]} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={[styles.title, dynamicStyles.title]}>Monthly Reports</Text>
            <Text style={[styles.subtitle, dynamicStyles.subtitle]}>
              Track your monthly progress
            </Text>
          </View>
        </View>

        {/* Current Month */}
        {currentMonth.totalLogged > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>This Month</Text>
            <TerminalGlow color="success" intensity="medium">
              <Card variant="elevated" style={styles.monthCard}>
                <View style={styles.monthHeader}>
                  <Text style={[styles.monthLabel, { color: colors.text }]}>
                    {getMonthLabel(currentMonth.monthStart)}
                  </Text>
                </View>
                <View style={styles.monthStats}>
                  <View style={styles.monthStatItem}>
                    <Text style={[styles.monthStatValue, { color: colors.success[600] }]}>
                      {formatCurrency(currentMonth.totalSaved)}
                    </Text>
                    <Text style={[styles.monthStatLabel, { color: colors.textLight }]}>Saved</Text>
                  </View>
                  <View style={styles.monthStatItem}>
                    <Text style={[styles.monthStatValue, { color: colors.text }]}>
                      {currentMonth.totalLogged}
                    </Text>
                    <Text style={[styles.monthStatLabel, { color: colors.textLight }]}>Logged</Text>
                  </View>
                  <View style={styles.monthStatItem}>
                    <Text style={[styles.monthStatValue, { color: colors.primary[600] }]}>
                      {currentMonth.totalCancelled}
                    </Text>
                    <Text style={[styles.monthStatLabel, { color: colors.textLight }]}>Avoided</Text>
                  </View>
                  <View style={styles.monthStatItem}>
                    <Text style={[styles.monthStatValue, { color: colors.error[600] }]}>
                      {currentMonth.totalExecuted}
                    </Text>
                    <Text style={[styles.monthStatLabel, { color: colors.textLight }]}>Bought</Text>
                  </View>
                </View>
                {currentMonth.totalExecuted > 0 && (
                  <View style={styles.regretRow}>
                    <Text style={[styles.regretText, { color: colors.textLight }]}>
                      {currentMonth.totalRegretted} of {currentMonth.totalExecuted} were regretted ({currentMonth.regretRate.toFixed(0)}%)
                    </Text>
                  </View>
                )}
              </Card>
            </TerminalGlow>
          </View>
        )}

        {/* Historical Months */}
        {monthlyReports.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>Previous Months</Text>
            {monthlyReports.map((report, index) => (
              <TerminalGlow key={index} color="primary" intensity="low">
                <Card variant="elevated" style={styles.monthCard}>
                  <View style={styles.monthHeader}>
                    <Text style={[styles.monthLabel, { color: colors.text }]}>
                      {getMonthLabel(report.monthStart)}
                    </Text>
                  </View>
                  <View style={styles.monthStats}>
                    <View style={styles.monthStatItem}>
                      <Text style={[styles.monthStatValue, { color: colors.success[600] }]}>
                        {formatCurrency(report.totalSaved)}
                      </Text>
                      <Text style={[styles.monthStatLabel, { color: colors.textLight }]}>Saved</Text>
                    </View>
                    <View style={styles.monthStatItem}>
                      <Text style={[styles.monthStatValue, { color: colors.text }]}>
                        {report.totalLogged}
                      </Text>
                      <Text style={[styles.monthStatLabel, { color: colors.textLight }]}>Logged</Text>
                    </View>
                    <View style={styles.monthStatItem}>
                      <Text style={[styles.monthStatValue, { color: colors.primary[600] }]}>
                        {report.totalCancelled}
                      </Text>
                      <Text style={[styles.monthStatLabel, { color: colors.textLight }]}>Avoided</Text>
                    </View>
                    <View style={styles.monthStatItem}>
                      <Text style={[styles.monthStatValue, { color: colors.error[600] }]}>
                        {report.totalExecuted}
                      </Text>
                      <Text style={[styles.monthStatLabel, { color: colors.textLight }]}>Bought</Text>
                    </View>
                  </View>
                  {report.totalExecuted > 0 && (
                    <View style={styles.regretRow}>
                      <Text style={[styles.regretText, { color: colors.textLight }]}>
                        {report.totalRegretted} of {report.totalExecuted} were regretted ({report.regretRate.toFixed(0)}%)
                      </Text>
                    </View>
                  )}
                </Card>
              </TerminalGlow>
            ))}
          </View>
        )}

        {/* Empty State */}
        {monthlyReports.length === 0 && currentMonth.totalLogged === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📊</Text>
            <Text style={[styles.emptyTitle, dynamicStyles.title]}>No monthly data yet</Text>
            <Text style={[styles.emptyText, dynamicStyles.subtitle]}>
              Start logging impulses to see your monthly progress and insights.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.base,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  backButton: {
    marginRight: spacing.base,
    padding: spacing.xs,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.fontSize.base,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing.base,
  },
  monthCard: {
    marginBottom: spacing.base,
    padding: spacing.base,
  },
  monthHeader: {
    marginBottom: spacing.base,
  },
  monthLabel: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
  },
  monthStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: spacing.base,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  monthStatItem: {
    alignItems: 'center',
  },
  monthStatValue: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing.xs,
  },
  monthStatLabel: {
    fontSize: typography.fontSize.xs,
  },
  regretRow: {
    marginTop: spacing.base,
    paddingTop: spacing.base,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  regretText: {
    fontSize: typography.fontSize.sm,
    textAlign: 'center',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing['5xl'],
    paddingHorizontal: spacing.xl,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: spacing.base,
  },
  emptyTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing.sm,
  },
  emptyText: {
    fontSize: typography.fontSize.base,
    textAlign: 'center',
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.base,
  },
});

