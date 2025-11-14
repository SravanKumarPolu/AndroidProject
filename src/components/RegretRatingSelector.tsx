import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { typography } from '@/constants/typography';
import { spacing } from '@/constants/spacing';

interface RegretRatingSelectorProps {
  onRatingSelect: (rating: number) => void;
  selectedRating?: number;
}

export function RegretRatingSelector({ onRatingSelect, selectedRating }: RegretRatingSelectorProps) {
  const { colors } = useTheme();
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);

  const getRatingLabel = (rating: number) => {
    switch (rating) {
      case 1: return 'No regret';
      case 2: return 'Slight regret';
      case 3: return 'Moderate regret';
      case 4: return 'High regret';
      case 5: return 'Very high regret';
      default: return '';
    }
  };

  const getRatingEmoji = (rating: number) => {
    switch (rating) {
      case 1: return '😌';
      case 2: return '😐';
      case 3: return '😕';
      case 4: return '😔';
      case 5: return '😭';
      default: return '';
    }
  };

  const getRatingColor = (rating: number) => {
    if (rating <= 2) return colors.success[500];
    if (rating === 3) return colors.warning[500];
    return colors.error[500];
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.text }]}>Rate your regret (1-5)</Text>
      <View style={styles.ratingContainer}>
        {[1, 2, 3, 4, 5].map((rating) => {
          const isSelected = selectedRating === rating;
          const isHovered = hoveredRating === rating;
          const shouldHighlight = isSelected || isHovered;
          const color = getRatingColor(rating);

          return (
            <TouchableOpacity
              key={rating}
              style={[
                styles.ratingButton,
                {
                  backgroundColor: shouldHighlight ? color : colors.surface,
                  borderColor: shouldHighlight ? color : colors.border,
                  borderWidth: 2,
                },
              ]}
              onPress={() => onRatingSelect(rating)}
              onPressIn={() => setHoveredRating(rating)}
              onPressOut={() => setHoveredRating(null)}
              activeOpacity={0.7}
            >
              <Text style={[styles.ratingNumber, { color: shouldHighlight ? colors.textDark : colors.text }]}>
                {rating}
              </Text>
              <Text style={[styles.ratingEmoji, { color: shouldHighlight ? colors.textDark : colors.text }]}>
                {getRatingEmoji(rating)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
      {selectedRating && (
        <Text style={[styles.selectedLabel, { color: getRatingColor(selectedRating) }]}>
          {getRatingEmoji(selectedRating)} {getRatingLabel(selectedRating)}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.base,
  },
  label: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  ratingButton: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.sm,
  },
  ratingNumber: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing.xs,
  },
  ratingEmoji: {
    fontSize: typography.fontSize.lg,
  },
  selectedLabel: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
});

