import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { usePatterns } from '@/hooks/usePatterns';
import { useImpulses } from '@/hooks/useImpulses';
import { useTheme } from '@/contexts/ThemeContext';
import { Card } from '@/components/ui/Card';
import { PatternCard } from '@/components/PatternCard';
import { RecurringPattern, PatternType } from '@/types/pattern';
import { typography } from '@/constants/typography';
import { spacing } from '@/constants/spacing';

const PATTERN_TYPE_LABELS: Record<PatternType, string> = {
  DAILY: 'Daily',
  WEEKLY: 'Weekly',
  MONTHLY: 'Monthly',
  FREQUENT: 'Frequent',
  TIME_BASED: 'Time-Based',
  CATEGORY: 'Category',
  PRICE: 'Price',
  SOURCE: 'Source',
};

export default function PatternsScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { impulses } = useImpulses();
  const {
    patterns,
    insights,
    strongestPatterns,
    highRegretPatterns,
    upcomingPatterns,
    patternsByType,
  } = usePatterns(impulses);

  const [selectedFilter, setSelectedFilter] = useState<'ALL' | 'STRONG' | 'UPCOMING' | 'REGRET'>('ALL');

  const getFilteredPatterns = (): RecurringPattern[] => {
    switch (selectedFilter) {
      case 'STRONG':
        return strongestPatterns;
      case 'UPCOMING':
        return upcomingPatterns;
      case 'REGRET':
        return highRegretPatterns;
      default:
        return patterns;
    }
  };

  const filteredPatterns = getFilteredPatterns();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={[styles.title, { color: colors.text }]}>Recurring Patterns</Text>
            <Text style={[styles.subtitle, { color: colors.textLight }]}>
              {patterns.length} pattern{patterns.length !== 1 ? 's' : ''} detected
            </Text>
          </View>
        </View>

        {/* Insights */}
        {insights.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Insights</Text>
            {insights.map((insight, idx) => (
              <Card
                key={idx}
                variant="elevated"
                style={[
                  styles.insightCard,
                  {
                    backgroundColor:
                      insight.type === 'WARNING'
                        ? colors.error[50]
                        : insight.type === 'SUCCESS'
                        ? colors.success[50]
                        : colors.primary[50],
                    borderColor:
                      insight.type === 'WARNING'
                        ? colors.error[200]
                        : insight.type === 'SUCCESS'
                        ? colors.success[200]
                        : colors.primary[200],
                  },
                ]}
              >
                <View style={styles.insightHeader}>
                  <Ionicons
                    name={
                      insight.type === 'WARNING'
                        ? 'warning'
                        : insight.type === 'SUCCESS'
                        ? 'checkmark-circle'
                        : 'information-circle'
                    }
                    size={20}
                    color={
                      insight.type === 'WARNING'
                        ? colors.error[600]
                        : insight.type === 'SUCCESS'
                        ? colors.success[600]
                        : colors.primary[600]
                    }
                  />
                  <Text
                    style={[
                      styles.insightTitle,
                      {
                        color:
                          insight.type === 'WARNING'
                            ? colors.error[700]
                            : insight.type === 'SUCCESS'
                            ? colors.success[700]
                            : colors.primary[700],
                      },
                    ]}
                  >
                    {insight.title}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.insightMessage,
                    {
                      color:
                        insight.type === 'WARNING'
                          ? colors.error[600]
                          : insight.type === 'SUCCESS'
                          ? colors.success[600]
                          : colors.primary[600],
                    },
                  ]}
                >
                  {insight.message}
                </Text>
                {insight.action && (
                  <TouchableOpacity
                    style={[
                      styles.actionButton,
                      {
                        backgroundColor:
                          insight.type === 'WARNING'
                            ? colors.error[100]
                            : insight.type === 'SUCCESS'
                            ? colors.success[100]
                            : colors.primary[100],
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.actionText,
                        {
                          color:
                            insight.type === 'WARNING'
                              ? colors.error[700]
                              : insight.type === 'SUCCESS'
                              ? colors.success[700]
                              : colors.primary[700],
                        },
                      ]}
                    >
                      {insight.action.label}
                    </Text>
                    <Ionicons
                      name="chevron-forward"
                      size={16}
                      color={
                        insight.type === 'WARNING'
                          ? colors.error[700]
                          : insight.type === 'SUCCESS'
                          ? colors.success[700]
                          : colors.primary[700]
                      }
                    />
                  </TouchableOpacity>
                )}
              </Card>
            ))}
          </View>
        )}

        {/* Filters */}
        <View style={styles.section}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filterScroll}
            contentContainerStyle={styles.filterContainer}
          >
            {(['ALL', 'STRONG', 'UPCOMING', 'REGRET'] as const).map((filter) => (
              <TouchableOpacity
                key={filter}
                style={[
                  styles.filterButton,
                  {
                    backgroundColor:
                      selectedFilter === filter ? colors.primary[500] : colors.surface,
                    borderColor: colors.border,
                  },
                ]}
                onPress={() => setSelectedFilter(filter)}
              >
                <Text
                  style={[
                    styles.filterText,
                    {
                      color:
                        selectedFilter === filter ? colors.textDark : colors.textLight,
                    },
                  ]}
                >
                  {filter === 'ALL'
                    ? 'All'
                    : filter === 'STRONG'
                    ? 'Strong'
                    : filter === 'UPCOMING'
                    ? 'Upcoming'
                    : 'High Regret'}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Patterns List */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {selectedFilter === 'ALL'
              ? 'All Patterns'
              : selectedFilter === 'STRONG'
              ? 'Strong Patterns'
              : selectedFilter === 'UPCOMING'
              ? 'Upcoming Patterns'
              : 'High Regret Patterns'}
          </Text>

          {filteredPatterns.length > 0 ? (
            <View style={styles.patternsList}>
              {filteredPatterns.map((pattern) => (
                <PatternCard key={pattern.id} pattern={pattern} showPrediction={true} />
              ))}
            </View>
          ) : (
            <Card variant="elevated" style={styles.emptyCard}>
              <Ionicons name="pulse-outline" size={48} color={colors.textLight} />
              <Text style={[styles.emptyTitle, { color: colors.text }]}>No Patterns</Text>
              <Text style={[styles.emptyText, { color: colors.textLight }]}>
                {selectedFilter === 'ALL'
                  ? 'Log more impulses to detect patterns'
                  : `No ${selectedFilter.toLowerCase()} patterns found`}
              </Text>
            </Card>
          )}
        </View>

        {/* Pattern Types */}
        {Object.keys(patternsByType).length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>By Type</Text>
            {Object.entries(patternsByType).map(([type, typePatterns]) => (
              <Card key={type} variant="elevated" style={styles.typeCard}>
                <View style={styles.typeHeader}>
                  <Text style={[styles.typeLabel, { color: colors.text }]}>
                    {PATTERN_TYPE_LABELS[type as PatternType]}
                  </Text>
                  <Text style={[styles.typeCount, { color: colors.textLight }]}>
                    {typePatterns.length}
                  </Text>
                </View>
                <View style={styles.typePatterns}>
                  {typePatterns.slice(0, 2).map((pattern) => (
                    <View key={pattern.id} style={styles.typePatternItem}>
                      {pattern.category && (
                        <Text style={[styles.typePatternText, { color: colors.textLight }]}>
                          {pattern.category} • {pattern.totalOccurrences} times
                        </Text>
                      )}
                    </View>
                  ))}
                </View>
              </Card>
            ))}
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
    marginTop: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing.base,
  },
  insightCard: {
    marginBottom: spacing.base,
    borderWidth: 1,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  insightTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
  },
  insightMessage: {
    fontSize: typography.fontSize.sm,
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.sm,
    marginBottom: spacing.sm,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.sm,
    borderRadius: spacing.md,
    marginTop: spacing.xs,
  },
  actionText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
  filterScroll: {
    marginBottom: spacing.base,
  },
  filterContainer: {
    gap: spacing.sm,
    paddingRight: spacing.base,
  },
  filterButton: {
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    borderRadius: spacing.md,
    borderWidth: 1,
  },
  filterText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
  patternsList: {
    gap: spacing.base,
  },
  emptyCard: {
    alignItems: 'center',
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
  typeCard: {
    marginBottom: spacing.base,
  },
  typeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  typeLabel: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
  },
  typeCount: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
  typePatterns: {
    gap: spacing.xs,
  },
  typePatternItem: {
    paddingVertical: spacing.xs,
  },
  typePatternText: {
    fontSize: typography.fontSize.sm,
  },
});

