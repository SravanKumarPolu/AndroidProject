/**
 * Source App Selector
 * Quick selection of common apps/platforms where users make impulse purchases
 * Helps identify where the impulse came from (Swiggy, Amazon, etc.)
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { SOURCE_APP_PRESETS, getPresetsForCategory, getPopularPresets, SourceAppPreset } from '@/constants/sourceApps';
import { ImpulseCategory } from '@/types/impulse';
import { typography } from '@/constants/typography';
import { spacing } from '@/constants/spacing';

interface SourceAppSelectorProps {
  category?: ImpulseCategory | null;
  selectedApp?: string;
  onSelect: (appName: string | undefined) => void;
  showLabel?: boolean;
}

export function SourceAppSelector({ 
  category, 
  selectedApp, 
  onSelect,
  showLabel = true 
}: SourceAppSelectorProps) {
  const { colors } = useTheme();
  const [showAll, setShowAll] = useState(false);
  
  // Get presets based on category or show popular ones
  const presets = category 
    ? getPresetsForCategory(category)
    : getPopularPresets();
  
  const allPresets = showAll ? SOURCE_APP_PRESETS : presets;
  
  const handleSelect = (preset: SourceAppPreset) => {
    if (selectedApp === preset.name) {
      // Deselect if already selected
      onSelect(undefined);
    } else {
      onSelect(preset.name);
      // Auto-update category if preset has one
      // Note: This would require passing a category setter, but for now we just select the app
    }
  };
  
  if (allPresets.length === 0) {
    return null;
  }
  
  return (
    <View style={styles.container}>
      {showLabel && (
        <View style={styles.header}>
          <Text style={[styles.label, { color: colors.text }]}>
            Where is this from? (optional)
          </Text>
          <Text style={[styles.hint, { color: colors.textLight }]}>
            Track which apps trigger your impulses
          </Text>
        </View>
      )}
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {allPresets.map((preset) => {
          const isSelected = selectedApp === preset.name;
          return (
            <TouchableOpacity
              key={preset.name}
              onPress={() => handleSelect(preset)}
              style={[
                styles.presetButton,
                {
                  backgroundColor: isSelected ? colors.primary[100] : colors.surface,
                  borderColor: isSelected ? colors.primary[600] : colors.gray[300],
                },
              ]}
            >
              <Text style={styles.presetIcon}>{preset.icon}</Text>
              <Text
                style={[
                  styles.presetName,
                  { color: isSelected ? colors.primary[700] : colors.text },
                ]}
              >
                {preset.name}
              </Text>
              {preset.description && (
                <Text
                  style={[
                    styles.presetDescription,
                    { color: colors.textLight },
                  ]}
                  numberOfLines={1}
                >
                  {preset.description}
                </Text>
              )}
            </TouchableOpacity>
          );
        })}
        
        {!showAll && SOURCE_APP_PRESETS.length > presets.length && (
          <TouchableOpacity
            onPress={() => setShowAll(true)}
            style={[
              styles.moreButton,
              {
                backgroundColor: colors.surface,
                borderColor: colors.gray[300],
              },
            ]}
          >
            <Text style={[styles.moreText, { color: colors.text }]}>
              More...
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.sm,
  },
  header: {
    marginBottom: spacing.xs,
  },
  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    marginBottom: spacing.xs / 2,
  },
  hint: {
    fontSize: typography.fontSize.xs,
  },
  scrollContent: {
    paddingRight: spacing.base,
  },
  presetButton: {
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    borderRadius: spacing.md,
    borderWidth: 1,
    marginRight: spacing.xs,
    alignItems: 'center',
    minWidth: 80,
  },
  presetIcon: {
    fontSize: 24,
    marginBottom: spacing.xs / 2,
  },
  presetName: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
    marginBottom: 2,
  },
  presetDescription: {
    fontSize: typography.fontSize.xs - 2,
    textAlign: 'center',
  },
  moreButton: {
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    borderRadius: spacing.md,
    borderWidth: 1,
    marginRight: spacing.xs,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 60,
  },
  moreText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
});

