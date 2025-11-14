import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { borderRadius, spacing, shadows } from '@/constants/spacing';

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  variant?: 'default' | 'elevated' | 'outlined';
}

export function Card({ children, style, variant = 'default' }: CardProps) {
  const { colors } = useTheme();
  
  const variantStyles = {
    default: {
      backgroundColor: colors.surface,
      ...shadows.sm,
    },
    elevated: {
      backgroundColor: colors.surface,
      ...shadows.lg,
    },
    outlined: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
  };

  return (
    <View style={[styles.card, variantStyles[variant], style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: borderRadius.lg,
    padding: spacing.base,
  },
});

