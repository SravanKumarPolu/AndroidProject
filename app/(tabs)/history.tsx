import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, FlatList, SectionList } from 'react-native';
import Animated, { FadeInUp, FadeOutDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useImpulses } from '@/hooks/useImpulses';
import { HistoryItem } from '@/components/HistoryItem';
import { ImpulseDetailSheet } from '@/components/ImpulseDetailSheet';
import { SearchBar } from '@/components/SearchBar';
import { FilterPanel } from '@/components/FilterPanel';
import { useTheme } from '@/contexts/ThemeContext';
import { searchImpulses, SearchFilters, getQuickFilters } from '@/utils/search';
import { groupImpulsesByDate, GroupedImpulse } from '@/utils/dateGrouping';
import { Impulse } from '@/types/impulse';
import { typography } from '@/constants/typography';
import { spacing } from '@/constants/spacing';

type FilterType = 'ALL' | 'CANCELLED' | 'EXECUTED' | 'REGRETTED';

export default function HistoryScreen() {
  const { colors } = useTheme();
  const { impulses, loading, error, loadImpulses } = useImpulses();
  const [filter, setFilter] = useState<FilterType>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState<SearchFilters>({});
  const [refreshing, setRefreshing] = useState(false);
  const [selectedImpulse, setSelectedImpulse] = useState<Impulse | null>(null);
  const [showDetailSheet, setShowDetailSheet] = useState(false);

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
        result = result.filter(impulse => impulse.finalFeeling === 'REGRET' || (impulse.regretRating && impulse.regretRating >= 4));
      } else {
        result = result.filter(impulse => impulse.status === filter);
      }
    }

    // Apply search and advanced filters
    const searchFilters: SearchFilters = {
      ...advancedFilters,
      query: searchQuery,
      status: filter === 'ALL' ? undefined : (filter === 'REGRETTED' ? filter : filter),
    };

    return searchImpulses(result, searchFilters);
  }, [impulses, filter, searchQuery, advancedFilters]);

  // Group by date
  const groupedData = React.useMemo(() => {
    const grouped = groupImpulsesByDate(filteredImpulses);
    return grouped.map(group => ({
      title: group.date,
      data: group.impulses,
    }));
  }, [filteredImpulses]);

  const handleItemPress = (impulse: Impulse) => {
    setSelectedImpulse(impulse);
    setShowDetailSheet(true);
  };

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
            accessibilityRole="button"
            accessibilityLabel={`Filter ${label}`}
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

      {/* Error state with retry */}
      {!!error && (
        <View style={[styles.content, { padding: spacing.base }]}>
          <View style={{ padding: spacing.base, borderRadius: spacing.lg, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.error[50] }}>
            <Text style={{ color: colors.error[700], marginBottom: spacing.sm }}>Couldn’t load your history.</Text>
            <TouchableOpacity onPress={onRefresh} accessibilityRole="button" accessibilityLabel="Try again" style={{ alignSelf: 'flex-start', paddingHorizontal: spacing.base, paddingVertical: spacing.xs, borderRadius: spacing.md, backgroundColor: colors.error[100] }}>
              <Text style={{ color: colors.error[800], fontWeight: typography.fontWeight.semibold }}>Try again</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Impulses List - Grouped by Date */}
      <SectionList
        sections={groupedData}
        keyExtractor={(item) => item.id}
        renderItem={({ item: impulse }) => (
          <Animated.View entering={FadeInUp.springify().damping(14)} exiting={FadeOutDown}>
            <HistoryItem
              impulse={impulse}
              onPress={() => handleItemPress(impulse)}
            />
          </Animated.View>
        )}
        renderSectionHeader={({ section: { title } }) => (
          <View style={[styles.sectionHeader, { backgroundColor: colors.background }]}>
            <Text style={[styles.sectionHeaderText, { color: colors.text }]}>{title}</Text>
          </View>
        )}
        contentContainerStyle={
          filteredImpulses.length === 0 ? styles.emptyStateContainer : styles.content
        }
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          loading ? (
            <View style={[styles.content, { gap: spacing.sm }]}>
              {/* Skeleton rows */}
              {/* @ts-ignore */}
              <View style={{ padding: spacing.base, borderRadius: spacing.md, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}>
                {/* @ts-ignore */}
                <View style={{ height: 12, width: 100, backgroundColor: 'rgba(125,125,125,0.15)', borderRadius: 8, marginBottom: spacing.sm }} />
                {/* @ts-ignore */}
                <View style={{ height: 14, width: '100%', backgroundColor: 'rgba(125,125,125,0.15)', borderRadius: 8, marginBottom: spacing.xs }} />
                {/* @ts-ignore */}
                <View style={{ height: 14, width: '70%', backgroundColor: 'rgba(125,125,125,0.15)', borderRadius: 8 }} />
              </View>
              {/* @ts-ignore */}
              <View style={{ padding: spacing.base, borderRadius: spacing.md, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}>
                {/* @ts-ignore */}
                <View style={{ height: 12, width: 120, backgroundColor: 'rgba(125,125,125,0.15)', borderRadius: 8, marginBottom: spacing.sm }} />
                {/* @ts-ignore */}
                <View style={{ height: 14, width: '100%', backgroundColor: 'rgba(125,125,125,0.15)', borderRadius: 8, marginBottom: spacing.xs }} />
                {/* @ts-ignore */}
                <View style={{ height: 14, width: '60%', backgroundColor: 'rgba(125,125,125,0.15)', borderRadius: 8 }} />
              </View>
              {/* @ts-ignore */}
              <View style={{ padding: spacing.base, borderRadius: spacing.md, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}>
                {/* @ts-ignore */}
                <View style={{ height: 12, width: 90, backgroundColor: 'rgba(125,125,125,0.15)', borderRadius: 8, marginBottom: spacing.sm }} />
                {/* @ts-ignore */}
                <View style={{ height: 14, width: '100%', backgroundColor: 'rgba(125,125,125,0.15)', borderRadius: 8, marginBottom: spacing.xs }} />
                {/* @ts-ignore */}
                <View style={{ height: 14, width: '80%', backgroundColor: 'rgba(125,125,125,0.15)', borderRadius: 8 }} />
              </View>
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="time-outline" size={56} color={colors.textLight} accessibilityElementsHidden importantForAccessibility="no" />
              <Text style={styles.emptyTitle}>No impulses found</Text>
              <Text style={styles.emptyText}>
                {filter === 'ALL'
                  ? 'Start logging impulses to see your history here.'
                  : `No ${filter.toLowerCase()} impulses yet.`}
              </Text>
            </View>
          )
        }
        stickySectionHeadersEnabled={false}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={10}
        removeClippedSubviews={true}
      />

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

      {/* Detail Bottom Sheet */}
      <ImpulseDetailSheet
        visible={showDetailSheet}
        impulse={selectedImpulse}
        onClose={() => {
          setShowDetailSheet(false);
          setSelectedImpulse(null);
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
  content: {
    padding: spacing.base,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  sectionHeader: {
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    paddingTop: spacing.base,
  },
  sectionHeaderText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
  },
});

