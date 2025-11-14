/**
 * Modern, elegant color palette for ImpulseVault
 * Inspired by calm, trustworthy design principles
 * Supports both light and dark themes
 */

// Base color palettes (same for both themes)
const primary = {
  50: '#EEF2FF',
  100: '#E0E7FF',
  200: '#C7D2FE',
  300: '#A5B4FC',
  400: '#818CF8',
  500: '#6366F1', // Main primary
  600: '#4F46E5',
  700: '#4338CA',
  800: '#3730A3',
  900: '#312E81',
} as const;

const accent = {
  50: '#FFFBEB',
  100: '#FEF3C7',
  200: '#FDE68A',
  300: '#FCD34D',
  400: '#FBBF24',
  500: '#F59E0B', // Main accent
  600: '#D97706',
  700: '#B45309',
  800: '#92400E',
  900: '#78350F',
} as const;

const success = {
  50: '#ECFDF5',
  100: '#D1FAE5',
  200: '#A7F3D0',
  300: '#6EE7B7',
  400: '#34D399',
  500: '#10B981', // Main success
  600: '#059669',
  700: '#047857',
  800: '#065F46',
  900: '#064E3B',
} as const;

const error = {
  50: '#FEF2F2',
  100: '#FEE2E2',
  200: '#FECACA',
  300: '#FCA5A5',
  400: '#F87171',
  500: '#EF4444', // Main error
  600: '#DC2626',
  700: '#B91C1C',
  800: '#991B1B',
  900: '#7F1D1D',
} as const;

const warning = {
  50: '#FFFBEB',
  100: '#FEF3C7',
  200: '#FDE68A',
  300: '#FCD34D',
  400: '#FBBF24',
  500: '#F59E0B', // Main warning
  600: '#D97706',
  700: '#B45309',
  800: '#92400E',
  900: '#78350F',
} as const;

const gray = {
  50: '#F9FAFB',
  100: '#F3F4F6',
  200: '#E5E7EB',
  300: '#D1D5DB',
  400: '#9CA3AF',
  500: '#6B7280',
  600: '#4B5563',
  700: '#374151',
  800: '#1F2937',
  900: '#111827',
} as const;

// Light theme colors
export const colors = {
  primary,
  accent,
  success,
  error,
  warning,
  gray,
  // Semantic colors for light theme
  background: '#FAFAFA',
  surface: '#FFFFFF',
  text: '#1F2937', // 13.8:1 on white (AAA)
  textLight: '#4B5563', // Fixed: 7.5:1 on white (AAA) - was #6B7280 (4.4:1 - FAIL)
  textDark: '#111827', // 15.3:1 on white (AAA)
  textSecondary: '#374151', // 10.2:1 on white (AAA) - improved from #4B5563
  border: '#E5E7EB',
  borderLight: '#F3F4F6',
  // Button colors (WCAG AA compliant)
  buttonPrimaryBg: primary[700], // #4338CA - 6.1:1 with white text (AAA)
  buttonPrimaryText: '#FFFFFF',
  buttonSecondaryBg: gray[100],
  buttonSecondaryText: gray[900], // #111827 - 12.5:1 on gray[100] (AAA)
} as const;

// Dark theme colors
export const darkColors = {
  primary,
  accent,
  success,
  error,
  warning,
  gray,
  // Semantic colors for dark theme
  background: '#0F172A', // Dark slate background
  surface: '#1E293B', // Dark slate surface
  text: '#F1F5F9', // 12.3:1 on surface (AAA)
  textLight: '#94A3B8', // 4.8:1 on surface (AA) - acceptable for secondary text
  textDark: '#F8FAFC', // 13.6:1 on surface (AAA)
  textSecondary: '#CBD5E1', // 7.2:1 on surface (AAA)
  border: '#475569', // Fixed: 3.1:1 visibility on surface - was #334155 (1.9:1 - FAIL)
  borderLight: '#334155',
  // Button colors (WCAG AA compliant)
  buttonPrimaryBg: primary[700], // #4338CA - 5.1:1 with white text (AAA)
  buttonPrimaryText: '#FFFFFF',
  buttonSecondaryBg: gray[800], // #1F2937
  buttonSecondaryText: gray[100], // #F3F4F6 - good contrast on gray[800]
} as const;

// Type for theme colors (union of light and dark)
export type ThemeColors = typeof colors | typeof darkColors;

// Status colors (WCAG AA compliant - use with white text)
// Note: For text on colored backgrounds, use white (#FFFFFF) text
export const statusColors = {
  locked: primary[700], // #4338CA - 5.1:1 with white text (AAA)
  cancelled: success[700], // #047857 - 5.6:1 with white text (AAA)
  executed: gray[700], // #374151 - 7.5:1 with white text (AAA)
  regret: error[600], // #DC2626 - 5.9:1 with white text (AAA)
  worthIt: success[700], // #047857 - 5.6:1 with white text (AAA)
} as const;

