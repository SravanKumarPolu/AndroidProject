import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { SearchFilters } from '@/utils/search';
import { ImpulseCategory, EmotionTag, UrgencyLevel } from '@/types/impulse';
import { CATEGORY_LABELS } from '@/constants/categories';
import { typography } from '@/constants/typography';
import { spacing } from '@/constants/spacing';

interface FilterPanelProps {
  visible: boolean;
  onClose: () => void;
  filters: SearchFilters;
  onApplyFilters: (filters: SearchFilters) => void;
  onReset: () => void;
}

const EMOTION_LABELS: Record<EmotionTag, string> = {
  HUNGER: 'Hunger',
  BORED: 'Boredom',
  STRESSED: 'Stress',
  FOMO: 'FOMO',
  SALE: 'Sale',
  PEER_INFLUENCE: 'Peer Influence',
  HAPPY: 'Happy',
  LONELY: 'Lonely',
  NONE: 'None',
};

const URGENCY_LABELS: Record<UrgencyLevel, string> = {
  ESSENTIAL: 'Essential',
  NICE_TO_HAVE: 'Nice to Have',
  IMPULSE: 'Impulse',
};

export function FilterPanel({ 
  visible, 
  onClose, 
  filters, 
  onApplyFilters, 
  onReset 
}: FilterPanelProps) {
  const { colors } = useTheme();
  const [localFilters, setLocalFilters] = useState<SearchFilters>(filters);

  const handleApply = () => {
    onApplyFilters(localFilters);
    onClose();
  };

  const handleReset = () => {
    const resetFilters: SearchFilters = {};
    setLocalFilters(resetFilters);
    onReset();
    onClose();
  };

  const toggleCategory = (category: ImpulseCategory) => {
    const categories = localFilters.categories || [];
    if (categories.includes(category)) {
      setLocalFilters({
        ...localFilters,
        categories: categories.filter(c => c !== category),
      });
    } else {
      setLocalFilters({
        ...localFilters,
        categories: [...categories, category],
      });
    }
  };

  const toggleEmotion = (emotion: EmotionTag) => {
    const emotions = localFilters.emotions || [];
    if (emotions.includes(emotion)) {
      setLocalFilters({
        ...localFilters,
        emotions: emotions.filter(e => e !== emotion),
      });
    } else {
      setLocalFilters({
        ...localFilters,
        emotions: [...emotions, emotion],
      });
    }
  };

  const toggleUrgency = (urgency: UrgencyLevel) => {
    const urgencies = localFilters.urgency || [];
    if (urgencies.includes(urgency)) {
      setLocalFilters({
        ...localFilters,
        urgency: urgencies.filter(u => u !== urgency),
      });
    } else {
      setLocalFilters({
        ...localFilters,
        urgency: [...urgencies, urgency],
      });
    }
  };

  const hasActiveFilters = 
    (localFilters.categories && localFilters.categories.length > 0) ||
    (localFilters.emotions && localFilters.emotions.length > 0) ||
    (localFilters.urgency && localFilters.urgency.length > 0) ||
    localFilters.minPrice !== undefined ||
    localFilters.maxPrice !== undefined ||
    localFilters.dateFrom !== undefined ||
    localFilters.dateTo !== undefined;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Card variant="elevated" style={[styles.panel, { backgroundColor: colors.surface }]}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>Filters</Text>
            <TouchableOpacity 
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Close filters"
              accessibilityHint="Closes the filter panel"
            >
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Categories */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Categories</Text>
              <View style={styles.chipContainer}>
                {(Object.keys(CATEGORY_LABELS) as ImpulseCategory[]).map(category => (
                  <TouchableOpacity
                    key={category}
                    style={[
                      styles.chip,
                      {
                        backgroundColor: localFilters.categories?.includes(category)
                          ? colors.primary[500]
                          : colors.gray[100],
                        borderColor: colors.border,
                      },
                    ]}
                    onPress={() => toggleCategory(category)}
                    accessibilityRole="button"
                    accessibilityLabel={`Filter by ${CATEGORY_LABELS[category]} category`}
                    accessibilityState={{ selected: localFilters.categories?.includes(category) || false }}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        {
                          color: localFilters.categories?.includes(category)
                            ? colors.textDark
                            : colors.text,
                        },
                      ]}
                    >
                      {CATEGORY_LABELS[category]}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Emotions */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Emotions</Text>
              <View style={styles.chipContainer}>
                {(Object.keys(EMOTION_LABELS) as EmotionTag[]).map(emotion => (
                  <TouchableOpacity
                    key={emotion}
                    style={[
                      styles.chip,
                      {
                        backgroundColor: localFilters.emotions?.includes(emotion)
                          ? colors.primary[500]
                          : colors.gray[100],
                        borderColor: colors.border,
                      },
                    ]}
                    onPress={() => toggleEmotion(emotion)}
                    accessibilityRole="button"
                    accessibilityLabel={`Filter by ${EMOTION_LABELS[emotion]} emotion`}
                    accessibilityState={{ selected: localFilters.emotions?.includes(emotion) || false }}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        {
                          color: localFilters.emotions?.includes(emotion)
                            ? colors.textDark
                            : colors.text,
                        },
                      ]}
                    >
                      {EMOTION_LABELS[emotion]}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Urgency */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Urgency</Text>
              <View style={styles.chipContainer}>
                {(Object.keys(URGENCY_LABELS) as UrgencyLevel[]).map(urgency => (
                  <TouchableOpacity
                    key={urgency}
                    style={[
                      styles.chip,
                      {
                        backgroundColor: localFilters.urgency?.includes(urgency)
                          ? colors.primary[500]
                          : colors.gray[100],
                        borderColor: colors.border,
                      },
                    ]}
                    onPress={() => toggleUrgency(urgency)}
                    accessibilityRole="button"
                    accessibilityLabel={`Filter by ${URGENCY_LABELS[urgency]} urgency`}
                    accessibilityState={{ selected: localFilters.urgency?.includes(urgency) || false }}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        {
                          color: localFilters.urgency?.includes(urgency)
                            ? colors.textDark
                            : colors.text,
                        },
                      ]}
                    >
                      {URGENCY_LABELS[urgency]}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>

          <View style={styles.footer}>
            {hasActiveFilters && (
              <Button
                title="Reset"
                variant="outline"
                onPress={handleReset}
                style={styles.resetButton}
              />
            )}
            <Button
              title="Apply Filters"
              variant="primary"
              onPress={handleApply}
              style={styles.applyButton}
            />
          </View>
        </Card>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  panel: {
    maxHeight: '80%',
    borderTopLeftRadius: spacing.xl,
    borderTopRightRadius: spacing.xl,
    padding: spacing.base,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.base,
  },
  title: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
  },
  content: {
    maxHeight: 400,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    marginBottom: spacing.base,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    borderRadius: spacing.md,
    borderWidth: 1,
  },
  chipText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
  footer: {
    flexDirection: 'row',
    gap: spacing.base,
    marginTop: spacing.base,
    paddingTop: spacing.base,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  resetButton: {
    flex: 1,
  },
  applyButton: {
    flex: 2,
  },
});

