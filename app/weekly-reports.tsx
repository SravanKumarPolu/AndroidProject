import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useImpulses } from '@/hooks/useImpulses';
import { useTheme } from '@/contexts/ThemeContext';
import { WeeklyReviewCard } from '@/components/WeeklyReviewCard';
import { Card } from '@/components/ui/Card';
import { getCurrentWeekReview, getLastWeekReview, getWeeklyReview, WeeklyReview } from '@/utils/weeklyReview';
import { formatDate } from '@/utils/date';
import { typography } from '@/constants/typography';
import { spacing } from '@/constants/spacing';

export default function WeeklyReportsScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { impulses } = useImpulses();

  // Get all weekly reviews (last 8 weeks)
  const weeklyReviews = useMemo(() => {
    const reviews: WeeklyReview[] = [];
    const now = Date.now();
    const today = new Date(now);
    const dayOfWeek = today.getDay();
    
    // Start from last week
    for (let i = 1; i <= 8; i++) {
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - dayOfWeek - (i * 7));
      weekStart.setHours(0, 0, 0, 0);
      
      const review = getWeeklyReview(impulses, weekStart.getTime());
      if (review.totalLogged > 0) {
        reviews.push(review);
      }
    }
    
    return reviews;
  }, [impulses]);

  const currentWeek = getCurrentWeekReview(impulses);
  const lastWeek = getLastWeekReview(impulses);

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
            <Text style={[styles.title, dynamicStyles.title]}>Weekly Reports</Text>
            <Text style={[styles.subtitle, dynamicStyles.subtitle]}>
              Track your progress over time
            </Text>
          </View>
        </View>

        {/* Current Week */}
        {currentWeek.totalLogged > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>This Week</Text>
            <WeeklyReviewCard review={currentWeek} />
          </View>
        )}

        {/* Last Week */}
        {lastWeek.totalLogged > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>Last Week</Text>
            <WeeklyReviewCard review={lastWeek} />
          </View>
        )}

        {/* Monthly Reports Link */}
        <View style={styles.section}>
          <TouchableOpacity
            onPress={() => router.push('/monthly-reports')}
            style={styles.monthlyLink}
          >
            <View style={styles.monthlyLinkLeft}>
              <Ionicons name="calendar-outline" size={24} color={colors.primary[600]} />
              <View style={styles.monthlyLinkText}>
                <Text style={[styles.monthlyLinkTitle, { color: colors.text }]}>Monthly Reports</Text>
                <Text style={[styles.monthlyLinkSubtitle, { color: colors.textLight }]}>
                  View detailed monthly statistics and trends
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
          </TouchableOpacity>
        </View>

        {/* Historical Weeks */}
        {weeklyReviews.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>Previous Weeks</Text>
            {weeklyReviews.map((review, index) => (
              <WeeklyReviewCard key={index} review={review} />
            ))}
          </View>
        )}

        {/* Empty State */}
        {weeklyReviews.length === 0 && currentWeek.totalLogged === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📊</Text>
            <Text style={[styles.emptyTitle, dynamicStyles.title]}>No weekly data yet</Text>
            <Text style={[styles.emptyText, dynamicStyles.subtitle]}>
              Start logging impulses to see your weekly progress and insights.
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
  monthlyLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.base,
    borderRadius: spacing.lg,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  monthlyLinkLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: spacing.base,
  },
  monthlyLinkText: {
    flex: 1,
  },
  monthlyLinkTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    marginBottom: spacing.xs / 2,
  },
  monthlyLinkSubtitle: {
    fontSize: typography.fontSize.sm,
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.sm,
  },
});

