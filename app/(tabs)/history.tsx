import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useImpulses } from '@/hooks/useImpulses';
import { ImpulseCard } from '@/components/ImpulseCard';
import { SearchBar } from '@/components/SearchBar';
import { FilterPanel } from '@/components/FilterPanel';
import { useTheme } from '@/contexts/ThemeContext';
import { searchImpulses, SearchFilters, getQuickFilters } from '@/utils/search';
import { typography } from '@/constants/typography';
import { spacing } from '@/constants/spacing';

type FilterType = 'ALL' | 'CANCELLED' | 'EXECUTED' | 'REGRETTED';

export default function HistoryScreen() {
  const { colors } = useTheme();
  const { impulses, loading, loadImpulses } = useImpulses();
  const [filter, setFilter] = useState<FilterType>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState<SearchFilters>({});
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadImpulses();
    setRefreshing(false);
  }, [loadImpulses]);

  // Combine basic filter with search and advanced filters
  const filteredImpulses = React.useMemo(() => {
    let result = impulses;

    // Apply basic status filter
    if (filter !== 'ALL') {
      if (filter === 'REGRETTED') {
        result = result.filter(impulse => impulse.finalFeeling === 'REGRET');
      } else {
        result = result.filter(impulse => impulse.status === filter);
      }
    }

    // Apply search and advanced filters
    const searchFilters: SearchFilters = {
      ...advancedFilters,
      query: searchQuery,
      status: filter === 'ALL' ? undefined : filter,
    };

    return searchImpulses(result, searchFilters);
  }, [impulses, filter, searchQuery, advancedFilters]);

  const quickFilters = getQuickFilters();

  const filters: { label: string; value: FilterType }[] = [
    { label: 'All', value: 'ALL' },
    { label: 'Saved', value: 'CANCELLED' },
    { label: 'Executed', value: 'EXECUTED' },
    { label: 'Regretted', value: 'REGRETTED' },
  ];

  const hasActiveFilters = 
    searchQuery.length > 0 ||
    (advancedFilters.categories && advancedFilters.categories.length > 0) ||
    (advancedFilters.emotions && advancedFilters.emotions.length > 0) ||
    (advancedFilters.urgency && advancedFilters.urgency.length > 0) ||
    advancedFilters.minPrice !== undefined ||
    advancedFilters.maxPrice !== undefined;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>History</Text>
        <Text style={[styles.subtitle, { color: colors.textLight }]}>
          {filteredImpulses.length} impulse{filteredImpulses.length !== 1 ? 's' : ''}
        </Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search by title, category, or notes..."
        />
        <TouchableOpacity
          style={[
            styles.filterButton,
            {
              backgroundColor: hasActiveFilters ? colors.primary[500] : colors.surface,
              borderColor: colors.border,
            },
          ]}
          onPress={() => setShowFilterPanel(true)}
        >
          <Ionicons
            name="options"
            size={20}
            color={hasActiveFilters ? colors.textDark : colors.text}
          />
          {hasActiveFilters && (
            <View style={[styles.filterBadge, { backgroundColor: colors.error[500] }]} />
          )}
        </TouchableOpacity>
      </View>

      {/* Quick Filters */}
      {searchQuery.length === 0 && !hasActiveFilters && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.quickFiltersContainer}
          contentContainerStyle={styles.quickFiltersContent}
        >
          {quickFilters.map((quickFilter, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.quickFilterButton,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
              onPress={() => {
                setAdvancedFilters(quickFilter.filters);
                setShowFilterPanel(true);
              }}
            >
              <Text style={[styles.quickFilterText, { color: colors.text }]}>
                {quickFilter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Filter Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
        contentContainerStyle={styles.filterContent}
      >
        {filters.map(({ label, value }) => (
          <TouchableOpacity
            key={value}
            style={[
              styles.filterTab,
              {
                backgroundColor: filter === value ? colors.primary[500] : colors.gray[100],
              },
            ]}
            onPress={() => setFilter(value)}
          >
            <Text
              style={[
                styles.filterText,
                {
                  color: filter === value ? colors.textDark : colors.text,
                },
              ]}
            >
              {label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Impulses List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {filteredImpulses.length > 0 ? (
          filteredImpulses.map(impulse => (
            <ImpulseCard
              key={impulse.id}
              impulse={impulse}
              showCountdown={false}
            />
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📜</Text>
            <Text style={styles.emptyTitle}>No impulses found</Text>
            <Text style={styles.emptyText}>
              {filter === 'ALL'
                ? 'Start logging impulses to see your history here.'
                : `No ${filter.toLowerCase()} impulses yet.`}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Filter Panel */}
      <FilterPanel
        visible={showFilterPanel}
        onClose={() => setShowFilterPanel(false)}
        filters={advancedFilters}
        onApplyFilters={setAdvancedFilters}
        onReset={() => {
          setAdvancedFilters({});
          setSearchQuery('');
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: spacing.base,
    paddingBottom: spacing.sm,
  },
  title: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.fontSize.base,
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.base,
    paddingBottom: spacing.sm,
    gap: spacing.sm,
    alignItems: 'center',
  },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: spacing.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  filterBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  quickFiltersContainer: {
    maxHeight: 50,
    marginBottom: spacing.sm,
  },
  quickFiltersContent: {
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  quickFilterButton: {
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.xs,
    borderRadius: spacing.md,
    borderWidth: 1,
    marginRight: spacing.sm,
  },
  quickFilterText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
  filterContainer: {
    maxHeight: 50,
  },
  filterContent: {
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
  },
  filterTab: {
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.xs,
    marginRight: spacing.sm,
    borderRadius: 20,
  },
  filterText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.base,
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

