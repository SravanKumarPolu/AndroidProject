import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { colors } from '@/constants/colors';
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
  const isDisabled = disabled || loading;

  const variantStyles = {
    primary: {
      backgroundColor: colors.primary[500],
      borderWidth: 0,
    },
    secondary: {
      backgroundColor: colors.gray[100],
      borderWidth: 0,
    },
    outline: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: colors.primary[500],
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
    primary: colors.textDark,
    secondary: colors.text,
    outline: colors.primary[500],
    ghost: colors.primary[500],
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
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' ? colors.textDark : colors.primary[500]}
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

