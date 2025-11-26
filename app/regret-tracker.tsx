import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useImpulses } from '@/hooks/useImpulses';
import { useTheme } from '@/contexts/ThemeContext';
import { Card } from '@/components/ui/Card';
import { ImpulseCard } from '@/components/ImpulseCard';
import { CategoryIcon } from '@/components/CategoryIcon';
import { formatCurrency } from '@/utils/currency';
import { formatDate, formatDateTime } from '@/utils/date';
import { ImpulseCategory } from '@/types/impulse';
import { CATEGORY_LABELS } from '@/constants/categories';
import { typography } from '@/constants/typography';
import { spacing } from '@/constants/spacing';
import { TerminalGlow } from '@/components/TerminalGlow';

export default function RegretTrackerScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { impulses } = useImpulses();
  const [filterCategory, setFilterCategory] = useState<ImpulseCategory | 'all'>('all');
  const [filterRating, setFilterRating] = useState<'all' | 'high' | 'medium' | 'low'>('all');

  // Get all regretted impulses
  const regrettedImpulses = useMemo(() => {
    return impulses.filter(i => {
      const isRegret = i.finalFeeling === 'REGRET' || (i.regretRating !== undefined && i.regretRating >= 3);
      if (!isRegret) return false;
      
      // Category filter
      if (filterCategory !== 'all' && i.category !== filterCategory) return false;
      
      // Rating filter
      if (filterRating !== 'all') {
        const regretRating = i.regretRating || (i.finalFeeling === 'REGRET' ? 5 : 0);
        if (filterRating === 'high' && regretRating < 4) return false;
        if (filterRating === 'medium' && (regretRating < 3 || regretRating >= 4)) return false;
        if (filterRating === 'low' && regretRating >= 3) return false;
      }
      
      return true;
    }).sort((a, b) => {
      // Sort by regret rating (highest first), then by date (newest first)
      const aRating = a.regretRating || (a.finalFeeling === 'REGRET' ? 5 : 0);
      const bRating = b.regretRating || (b.finalFeeling === 'REGRET' ? 5 : 0);
      if (bRating !== aRating) return bRating - aRating;
      return (b.executedAt || b.createdAt) - (a.executedAt || a.createdAt);
    });
  }, [impulses, filterCategory, filterRating]);

  // Calculate regret statistics
  const regretStats = useMemo(() => {
    const totalRegretted = regrettedImpulses.length;
    const totalWasted = regrettedImpulses.reduce((sum, i) => sum + (i.price || 0), 0);
    const avgRegretRating = regrettedImpulses.length > 0
      ? regrettedImpulses.reduce((sum, i) => sum + (i.regretRating || (i.finalFeeling === 'REGRET' ? 5 : 0)), 0) / regrettedImpulses.length
      : 0;
    
    // Category breakdown
    const categoryBreakdown = new Map<ImpulseCategory, { count: number; total: number }>();
    regrettedImpulses.forEach(i => {
      const existing = categoryBreakdown.get(i.category) || { count: 0, total: 0 };
      categoryBreakdown.set(i.category, {
        count: existing.count + 1,
        total: existing.total + (i.price || 0),
      });
    });

    return {
      totalRegretted,
      totalWasted,
      avgRegretRating: Math.round(avgRegretRating * 10) / 10,
      categoryBreakdown: Array.from(categoryBreakdown.entries())
        .map(([category, data]) => ({ category, ...data }))
        .sort((a, b) => b.total - a.total),
    };
  }, [regrettedImpulses]);

  const categories: ImpulseCategory[] = ['FOOD', 'SHOPPING', 'TRAVEL', 'DIGITAL', 'GAMING', 'ENTERTAINMENT', 'TRADING', 'CRYPTO', 'COURSE', 'SUBSCRIPTION', 'OTHER'];

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
            <Text style={[styles.title, dynamicStyles.title]}>Regret Tracker</Text>
            <Text style={[styles.subtitle, dynamicStyles.subtitle]}>
              Learn from your past decisions
            </Text>
          </View>
        </View>

        {/* Regret Statistics */}
        <TerminalGlow color="error" intensity="medium">
          <Card variant="elevated" style={styles.statsCard}>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors.error[600] }]}>
                  {regretStats.totalRegretted}
                </Text>
                <Text style={[styles.statLabel, { color: colors.textLight }]}>
                  Regretted Purchases
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors.error[600] }]}>
                  {formatCurrency(regretStats.totalWasted)}
                </Text>
                <Text style={[styles.statLabel, { color: colors.textLight }]}>
                  Total Wasted
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors.error[600] }]}>
                  {regretStats.avgRegretRating.toFixed(1)}/5
                </Text>
                <Text style={[styles.statLabel, { color: colors.textLight }]}>
                  Avg Regret Rating
                </Text>
              </View>
            </View>
          </Card>
        </TerminalGlow>

        {/* Category Breakdown */}
        {regretStats.categoryBreakdown.length > 0 && (
          <Card variant="elevated" style={styles.categoryCard}>
            <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>
              Wasted by Category
            </Text>
            <View style={styles.categoryList}>
              {regretStats.categoryBreakdown.map((item, index) => (
                <View key={index} style={styles.categoryItem}>
                  <View style={styles.categoryLeft}>
                    <CategoryIcon category={item.category} size={20} color={colors.primary[600]} />
                    <Text style={[styles.categoryName, { color: colors.text }]}>
                      {CATEGORY_LABELS[item.category]}
                    </Text>
                  </View>
                  <View style={styles.categoryRight}>
                    <Text style={[styles.categoryAmount, { color: colors.error[600] }]}>
                      {formatCurrency(item.total)}
                    </Text>
                    <Text style={[styles.categoryCount, { color: colors.textLight }]}>
                      {item.count} purchase{item.count !== 1 ? 's' : ''}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </Card>
        )}

        {/* Filters */}
        <Card variant="elevated" style={styles.filtersCard}>
          <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>Filters</Text>
          
          {/* Category Filter */}
          <View style={styles.filterSection}>
            <Text style={[styles.filterLabel, { color: colors.textLight }]}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
              <TouchableOpacity
                onPress={() => setFilterCategory('all')}
                style={[
                  styles.filterPill,
                  filterCategory === 'all' && { backgroundColor: colors.primary[600] },
                ]}
              >
                <Text style={[
                  styles.filterPillText,
                  filterCategory === 'all' && { color: '#fff' },
                  { color: colors.text },
                ]}>
                  All
                </Text>
              </TouchableOpacity>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  onPress={() => setFilterCategory(cat)}
                  style={[
                    styles.filterPill,
                    filterCategory === cat && { backgroundColor: colors.primary[600] },
                  ]}
                >
                  <Text style={[
                    styles.filterPillText,
                    filterCategory === cat && { color: '#fff' },
                    { color: colors.text },
                  ]}>
                    {CATEGORY_LABELS[cat]}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Rating Filter */}
          <View style={styles.filterSection}>
            <Text style={[styles.filterLabel, { color: colors.textLight }]}>Regret Rating</Text>
            <View style={styles.ratingFilters}>
              {(['all', 'high', 'medium', 'low'] as const).map((rating) => (
                <TouchableOpacity
                  key={rating}
                  onPress={() => setFilterRating(rating)}
                  style={[
                    styles.filterPill,
                    filterRating === rating && { backgroundColor: colors.primary[600] },
                  ]}
                >
                  <Text style={[
                    styles.filterPillText,
                    filterRating === rating && { color: '#fff' },
                    { color: colors.text },
                  ]}>
                    {rating === 'all' ? 'All' : rating === 'high' ? 'High (4-5)' : rating === 'medium' ? 'Medium (3)' : 'Low (1-2)'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </Card>

        {/* Regretted Impulses List */}
        <View style={styles.listSection}>
          <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>
            Regretted Purchases ({regrettedImpulses.length})
          </Text>
          {regrettedImpulses.length === 0 ? (
            <Card variant="elevated">
              <View style={styles.emptyState}>
                <Ionicons name="checkmark-circle" size={48} color={colors.success[600]} />
                <Text style={[styles.emptyTitle, dynamicStyles.title]}>
                  No Regrets Found
                </Text>
                <Text style={[styles.emptyText, dynamicStyles.subtitle]}>
                  {filterCategory !== 'all' || filterRating !== 'all'
                    ? 'Try adjusting your filters'
                    : 'Great job! You haven\'t regretted any purchases yet.'}
                </Text>
              </View>
            </Card>
          ) : (
            regrettedImpulses.map((impulse) => {
              const regretRating = impulse.regretRating || (impulse.finalFeeling === 'REGRET' ? 5 : 0);
              const daysAgo = impulse.executedAt
                ? Math.floor((Date.now() - impulse.executedAt) / (24 * 60 * 60 * 1000))
                : 0;

              return (
                <TerminalGlow key={impulse.id} color="error" intensity="low">
                  <Card
                    variant="elevated"
                    style={styles.impulseCard}
                    onPress={() => router.push(`/review-impulse/${impulse.id}`)}
                  >
                    <View style={styles.impulseHeader}>
                      <View style={styles.impulseLeft}>
                        <Text style={[styles.impulseTitle, { color: colors.text }]}>
                          {impulse.title}
                        </Text>
                        <View style={styles.impulseMeta}>
                          <CategoryIcon category={impulse.category} size={16} color={colors.primary[600]} />
                          <Text style={[styles.impulseDate, { color: colors.textLight }]}>
                            {CATEGORY_LABELS[impulse.category]} • {impulse.executedAt ? formatDate(impulse.executedAt) : formatDate(impulse.createdAt)}
                            {daysAgo > 0 && ` • ${daysAgo} day${daysAgo !== 1 ? 's' : ''} ago`}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.impulseRight}>
                        {impulse.price && (
                          <Text style={[styles.impulsePrice, { color: colors.error[600] }]}>
                            {formatCurrency(impulse.price)}
                          </Text>
                        )}
                        <View style={styles.ratingStars}>
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Ionicons
                              key={star}
                              name={star <= regretRating ? 'star' : 'star-outline'}
                              size={16}
                              color={star <= regretRating ? colors.error[600] : colors.gray[300]}
                            />
                          ))}
                        </View>
                      </View>
                    </View>
                    {impulse.reason && (
                      <Text style={[styles.impulseReason, { color: colors.textLight }]}>
                        "{impulse.reason}"
                      </Text>
                    )}
                  </Card>
                </TerminalGlow>
              );
            })
          )}
        </View>
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
  statsCard: {
    marginBottom: spacing.base,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: spacing.base,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing.xs,
  },
  statLabel: {
    fontSize: typography.fontSize.sm,
    textAlign: 'center',
  },
  categoryCard: {
    marginBottom: spacing.base,
  },
  sectionTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing.base,
  },
  categoryList: {
    gap: spacing.sm,
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  categoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  categoryName: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
  },
  categoryRight: {
    alignItems: 'flex-end',
  },
  categoryAmount: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
  },
  categoryCount: {
    fontSize: typography.fontSize.xs,
  },
  filtersCard: {
    marginBottom: spacing.base,
  },
  filterSection: {
    marginBottom: spacing.base,
  },
  filterLabel: {
    fontSize: typography.fontSize.sm,
    marginBottom: spacing.sm,
  },
  filterScroll: {
    marginHorizontal: -spacing.base,
    paddingHorizontal: spacing.base,
  },
  filterPill: {
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.xs,
    borderRadius: spacing.lg,
    marginRight: spacing.sm,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  filterPillText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
  ratingFilters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  listSection: {
    marginBottom: spacing.xl,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing['5xl'],
    paddingHorizontal: spacing.xl,
  },
  emptyTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    marginTop: spacing.base,
    marginBottom: spacing.sm,
  },
  emptyText: {
    fontSize: typography.fontSize.base,
    textAlign: 'center',
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.base,
  },
  impulseCard: {
    marginBottom: spacing.base,
  },
  impulseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  impulseLeft: {
    flex: 1,
    marginRight: spacing.base,
  },
  impulseTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    marginBottom: spacing.xs,
  },
  impulseMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  impulseDate: {
    fontSize: typography.fontSize.xs,
  },
  impulseRight: {
    alignItems: 'flex-end',
  },
  impulsePrice: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing.xs,
  },
  ratingStars: {
    flexDirection: 'row',
    gap: 2,
  },
  impulseReason: {
    fontSize: typography.fontSize.sm,
    fontStyle: 'italic',
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
});

