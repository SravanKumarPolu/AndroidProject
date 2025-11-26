import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useImpulses } from '@/hooks/useImpulses';
import { useTheme } from '@/contexts/ThemeContext';
import { DailySummaryCard } from '@/components/DailySummaryCard';
import { Card } from '@/components/ui/Card';
import { getTodaySummary, getYesterdaySummary, getDailySummary, DailySummary } from '@/utils/dailySummary';
import { formatDate, isToday } from '@/utils/date';
import { typography } from '@/constants/typography';
import { spacing } from '@/constants/spacing';
import { ImpulseCard } from '@/components/ImpulseCard';

export default function DailySummaryScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { impulses } = useImpulses();

  // Get today's and yesterday's summaries
  const todaySummary = getTodaySummary(impulses);
  const yesterdaySummary = getYesterdaySummary(impulses);

  // Get all daily summaries (last 7 days)
  const dailySummaries = useMemo(() => {
    const summaries: DailySummary[] = [];
    const now = Date.now();
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);
    
    // Start from yesterday (today is already shown separately)
    for (let i = 1; i <= 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const summary = getDailySummary(impulses, date.getTime());
      if (summary.totalLogged > 0) {
        summaries.push(summary);
      }
    }
    
    return summaries;
  }, [impulses]);

  // Get today's impulses for detailed view
  const todayImpulses = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayEnd = new Date(today);
    todayEnd.setHours(23, 59, 59, 999);
    
    return impulses.filter(
      i => i.createdAt >= today.getTime() && i.createdAt <= todayEnd.getTime()
    ).sort((a, b) => b.createdAt - a.createdAt);
  }, [impulses]);

  const dynamicStyles = {
    container: { backgroundColor: colors.background },
    title: { color: colors.text },
    subtitle: { color: colors.textLight },
    sectionTitle: { color: colors.text },
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
            <Text style={[styles.title, dynamicStyles.title]}>Daily Summary</Text>
            <Text style={[styles.subtitle, dynamicStyles.subtitle]}>
              Track your daily progress
            </Text>
          </View>
        </View>

        {/* Today's Summary */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>Today</Text>
          <DailySummaryCard summary={todaySummary} />
        </View>

        {/* Today's Impulses */}
        {todayImpulses.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>Today's Impulses</Text>
            {todayImpulses.map(impulse => (
              <ImpulseCard
                key={impulse.id}
                impulse={impulse}
                onPress={() => {
                  if (impulse.status === 'LOCKED') {
                    router.push(`/cooldown/${impulse.id}`);
                  } else {
                    router.push(`/review-impulse/${impulse.id}`);
                  }
                }}
              />
            ))}
          </View>
        )}

        {/* Yesterday's Summary */}
        {yesterdaySummary.totalLogged > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>Yesterday</Text>
            <DailySummaryCard summary={yesterdaySummary} />
          </View>
        )}

        {/* Historical Days */}
        {dailySummaries.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>Previous Days</Text>
            {dailySummaries.map((summary, index) => (
              <DailySummaryCard key={index} summary={summary} />
            ))}
          </View>
        )}

        {/* Empty State */}
        {todaySummary.totalLogged === 0 && yesterdaySummary.totalLogged === 0 && dailySummaries.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>☀️</Text>
            <Text style={[styles.emptyTitle, dynamicStyles.title]}>No daily data yet</Text>
            <Text style={[styles.emptyText, dynamicStyles.subtitle]}>
              Start logging impulses to see your daily progress and insights.
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

