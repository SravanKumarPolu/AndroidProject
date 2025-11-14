import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { typography } from '@/constants/typography';
import { borderRadius, spacing } from '@/constants/spacing';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  style,
}: ButtonProps) {
  const { colors } = useTheme();
  const isDisabled = disabled || loading;

  // Type-safe access to button colors with fallbacks
  // Both light and dark colors have the same structure, so we can safely access these properties
  const buttonPrimaryBg = (colors as any).buttonPrimaryBg || colors.primary[700];
  const buttonSecondaryBg = (colors as any).buttonSecondaryBg || colors.gray[100];
  const buttonPrimaryText = (colors as any).buttonPrimaryText || '#FFFFFF';
  const buttonSecondaryText = (colors as any).buttonSecondaryText || colors.text;

  const variantStyles = {
    primary: {
      backgroundColor: buttonPrimaryBg,
      borderWidth: 0,
    },
    secondary: {
      backgroundColor: buttonSecondaryBg,
      borderWidth: 0,
    },
    outline: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: colors.primary[600],
    },
    ghost: {
      backgroundColor: 'transparent',
      borderWidth: 0,
    },
  };

  const sizeStyles = {
    sm: {
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.base,
      fontSize: typography.fontSize.sm,
    },
    md: {
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
      fontSize: typography.fontSize.base,
    },
    lg: {
      paddingVertical: spacing.base,
      paddingHorizontal: spacing.xl,
      fontSize: typography.fontSize.lg,
    },
  };

  const textColor = {
    primary: buttonPrimaryText,
    secondary: buttonSecondaryText,
    outline: colors.primary[600],
    ghost: colors.primary[600],
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        variantStyles[variant],
        sizeStyles[size],
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityHint={isDisabled ? 'Button is disabled' : undefined}
      accessibilityState={{ disabled: isDisabled }}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' ? buttonPrimaryText : colors.primary[600]}
        />
      ) : (
        <Text
          style={[
            styles.text,
            { color: textColor[variant] },
            { fontSize: sizeStyles[size].fontSize },
          ]}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  text: {
    fontWeight: typography.fontWeight.semibold,
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },
});

