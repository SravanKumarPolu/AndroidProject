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
  const { colors, theme } = useTheme();
  const isTerminal = theme === 'terminal';
  
  const variantStyles = {
    default: {
      backgroundColor: colors.surface,
      ...shadows.sm,
      ...(isTerminal && {
        borderWidth: 1,
        borderColor: colors.border || 'rgba(0, 255, 65, 0.2)',
      }),
    },
    elevated: {
      backgroundColor: colors.surface,
      ...shadows.lg,
      ...(isTerminal && {
        borderWidth: 1,
        borderColor: (colors as any).borderGlow || 'rgba(0, 255, 65, 0.3)',
        shadowColor: (colors as any).glowSuccess || 'rgba(0, 255, 65, 0.2)',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1,
        shadowRadius: 8,
        elevation: 8,
      }),
    },
    outlined: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      ...(isTerminal && {
        borderColor: colors.border || 'rgba(0, 255, 65, 0.3)',
      }),
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

