import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, ListRenderItem } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useImpulses } from '@/hooks/useImpulses';
import { useStats } from '@/hooks/useStats';
import { useGoals } from '@/hooks/useGoals';
import { useAchievements } from '@/hooks/useAchievements';
import { usePatterns } from '@/hooks/usePatterns';
import { useTheme } from '@/contexts/ThemeContext';
import { StatsCard } from '@/components/StatsCard';
import { ImpulseCard } from '@/components/ImpulseCard';
import { WeeklyReviewCard } from '@/components/WeeklyReviewCard';
import { WeakCategoriesCard } from '@/components/WeakCategoriesCard';
import { WeakHoursCard } from '@/components/WeakHoursCard';
import { GoalsCard } from '@/components/GoalsCard';
import { AchievementCard } from '@/components/AchievementCard';
import { AchievementCelebration } from '@/components/AchievementCelebration';
import { PatternsCard } from '@/components/PatternsCard';
import { BudgetCard } from '@/components/BudgetCard';
import { MonthlyDashboardCard } from '@/components/MonthlyDashboardCard';
import { ImpulsesBreakdownCard } from '@/components/ImpulsesBreakdownCard';
import { InsightsCard } from '@/components/InsightsCard';
import { TerminalBackground } from '@/components/TerminalBackground';
import { TerminalGlow } from '@/components/TerminalGlow';
import { getLastWeekReview } from '@/utils/weeklyReview';
import { getCurrentMonthStats } from '@/utils/monthlyStats';
import { getWorstMoodTrigger } from '@/utils/moodTrigger';
import { getMostDangerousCategory } from '@/utils/categoryAnalysis';
import { useBudget } from '@/hooks/useBudget';
import { typography } from '@/constants/typography';
import { spacing } from '@/constants/spacing';

export default function HomeScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { impulses, loading } = useImpulses();
  const { stats, activeImpulses, readyToReview, categoryStats } = useStats(impulses);
  const { goals, getGoalProgress } = useGoals(impulses);
  const { userLevel, newlyUnlocked, achievementProgress } = useAchievements();
  const { patterns, insights, strongestPatterns } = usePatterns(impulses);
  const { budgetProgresses, budgetAlerts } = useBudget(impulses);
  
  // Get goal progresses for display
  const goalProgresses = goals.map(goal => getGoalProgress(goal));
  
  // Get monthly stats
  const monthlyStats = React.useMemo(() => getCurrentMonthStats(impulses), [impulses]);
  
  // Get monthly goal (first active goal or first goal)
  const monthlyGoal = React.useMemo(() => {
    const activeGoals = goals.filter(g => !g.isCompleted);
    return activeGoals.length > 0 ? activeGoals[0] : (goals.length > 0 ? goals[0] : undefined);
  }, [goals]);
  
  // Get most dangerous category
  const dangerousCategory = React.useMemo(() => 
    getMostDangerousCategory(categoryStats), 
    [categoryStats]
  );
  
  // Get worst mood trigger
  const worstMoodTrigger = React.useMemo(() => 
    getWorstMoodTrigger(impulses), 
    [impulses]
  );
  
  // Get recent achievements for display
  const recentAchievements = achievementProgress
    .filter(ap => ap.isUnlocked)
    .sort((a, b) => (b.unlockedAt || 0) - (a.unlockedAt || 0))
    .slice(0, 3);
  
  // Track which achievement is currently being celebrated
  const [celebratingAchievement, setCelebratingAchievement] = React.useState<typeof newlyUnlocked[0] | null>(null);
  
  // Show celebration when new achievement is unlocked
  React.useEffect(() => {
    if (newlyUnlocked.length > 0) {
      setCelebratingAchievement(newlyUnlocked[0]);
    }
  }, [newlyUnlocked]);

  const dynamicStyles = {
    container: { backgroundColor: colors.background },
    title: { color: colors.text },
    subtitle: { color: colors.textLight },
    sectionTitle: { color: colors.text },
    emptyTitle: { color: colors.text },
    emptyText: { color: colors.textLight },
    loadingText: { color: colors.textLight },
    fab: { backgroundColor: colors.primary[500] },
    fabSecondary: { backgroundColor: colors.accent[500] },
    fabIcon: { color: colors.textDark },
  };

  return (
    <TerminalBackground>
      <SafeAreaView style={[styles.container, dynamicStyles.container]} edges={['top']}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, dynamicStyles.title]}>ImpulseVault</Text>
          <Text style={[styles.subtitle, dynamicStyles.subtitle]}>Lock your impulses. Free your future.</Text>
        </View>

        {/* Monthly Savings Card */}
        <TerminalGlow color="success" intensity="low">
          <MonthlyDashboardCard 
            monthlyStats={monthlyStats} 
            goal={monthlyGoal}
          />
        </TerminalGlow>

        {/* Impulses Breakdown */}
        <TerminalGlow color="primary" intensity="low">
          <ImpulsesBreakdownCard monthlyStats={monthlyStats} />
        </TerminalGlow>

        {/* Insights */}
        <TerminalGlow color="warning" intensity="low">
          <InsightsCard 
            dangerousCategory={dangerousCategory}
            worstMoodTrigger={worstMoodTrigger}
          />
        </TerminalGlow>

        {/* Stats Card (keep for backward compatibility, can be hidden if needed) */}
        {/* <StatsCard stats={stats} /> */}

        {/* Achievements Card */}
        {userLevel && (
          <AchievementCard
            level={userLevel}
            recentAchievements={recentAchievements}
            onPress={() => router.push('/achievements')}
          />
        )}

        {/* Recurring Patterns */}
        {(patterns.length > 0 || insights.length > 0) && (
          <PatternsCard
            patterns={strongestPatterns}
            insights={insights}
            onPress={() => router.push('/patterns')}
            maxDisplay={1}
          />
        )}

        {/* Savings Goals */}
        {goalProgresses.length > 0 && (
          <GoalsCard
            goals={goalProgresses}
            onPress={() => router.push('/goals')}
            maxDisplay={2}
          />
        )}

        {/* Weekly Review */}
        {impulses.length > 0 && (
          <WeeklyReviewCard 
            review={getLastWeekReview(impulses)}
            onPress={() => router.push('/weekly-reports')}
          />
        )}

        {/* Weak Categories */}
        {categoryStats.length > 0 && (
          <WeakCategoriesCard categoryStats={categoryStats} />
        )}

        {/* Weak Hours */}
        {impulses.length >= 5 && (
          <WeakHoursCard impulses={impulses} />
        )}

        {/* Budget Tracking */}
        {budgetProgresses.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>Budget Tracking</Text>
              <TouchableOpacity
                onPress={() => router.push('/budget')}
                accessibilityRole="button"
                accessibilityLabel="View all budgets"
              >
                <Text style={[styles.viewAll, { color: colors.primary[600] }]}>View All</Text>
              </TouchableOpacity>
            </View>
            {budgetProgresses.slice(0, 2).map(progress => {
              const alert = budgetAlerts.find(a => a.budgetId === progress.budget.id);
              return (
                <BudgetCard
                  key={progress.budget.id}
                  progress={progress}
                  alert={alert}
                  onPress={() => router.push('/budget')}
                />
              );
            })}
          </View>
        )}

        {/* Active Impulses */}
        {activeImpulses.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>
              Active Impulses {readyToReview.length > 0 && `(${readyToReview.length} ready)`}
            </Text>
            {activeImpulses.map(impulse => (
              <ImpulseCard
                key={impulse.id}
                impulse={impulse}
                onPress={() => {
                  if (readyToReview.some(r => r.id === impulse.id)) {
                    router.push(`/review-impulse/${impulse.id}`);
                  }
                }}
              />
            ))}
          </View>
        )}

        {/* Empty State */}
        {activeImpulses.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🔒</Text>
            <Text style={[styles.emptyTitle, dynamicStyles.emptyTitle]}>No active impulses</Text>
            <Text style={[styles.emptyText, dynamicStyles.emptyText]}>
              Log an impulse before you buy to start saving money and avoiding regrets.
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Floating Action Buttons */}
      <View style={styles.fabContainer}>
        <TouchableOpacity
          style={[styles.fab, styles.fabSecondary, dynamicStyles.fabSecondary]}
          onPress={() => router.push('/quick-add')}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Quick add impulse"
          accessibilityHint="Opens quick add form to quickly log an impulse"
        >
          <Text style={styles.fabIconSmall}>⚡</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.fab, dynamicStyles.fab]}
          onPress={() => router.push('/new-impulse')}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Add new impulse"
          accessibilityHint="Opens form to log a new impulse purchase"
        >
          <Text style={[styles.fabIcon, dynamicStyles.fabIcon]}>+</Text>
          </TouchableOpacity>
        </View>

        {/* Achievement Celebration Modal */}
        {celebratingAchievement && (
          <AchievementCelebration
            achievement={celebratingAchievement}
            visible={!!celebratingAchievement}
            onClose={() => setCelebratingAchievement(null)}
          />
        )}
      </SafeAreaView>
    </TerminalBackground>
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
    paddingBottom: 100,
  },
  header: {
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: typography.fontSize['4xl'],
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.fontSize.base,
  },
  section: {
    marginTop: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.base,
  },
  sectionTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
  },
  viewAll: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
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
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: typography.fontSize.base,
  },
  fabContainer: {
    position: 'absolute',
    right: spacing.base,
    bottom: spacing.xl,
    alignItems: 'flex-end',
    gap: spacing.sm,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  fabSecondary: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  fabIcon: {
    fontSize: 32,
    fontWeight: typography.fontWeight.bold,
  },
  fabIconSmall: {
    fontSize: 24,
  },
});

