/**
 * Modern typography system
 * Clean, readable, friendly
 */

export const typography = {
  // Font families
  fontFamily: {
    regular: 'System',
    medium: 'System',
    bold: 'System',
    mono: 'Courier', // Monospace for terminal theme
  },

  // Font sizes
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
  },

  // Line heights
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },

  // Font weights
  fontWeight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },

  // Text styles (predefined combinations)
  textStyles: {
    h1: {
      fontSize: 30,
      fontWeight: '700' as const,
      lineHeight: 1.2,
    },
    h2: {
      fontSize: 24,
      fontWeight: '700' as const,
      lineHeight: 1.3,
    },
    h3: {
      fontSize: 20,
      fontWeight: '600' as const,
      lineHeight: 1.4,
    },
    body: {
      fontSize: 16,
      fontWeight: '400' as const,
      lineHeight: 1.5,
    },
    bodyBold: {
      fontSize: 16,
      fontWeight: '600' as const,
      lineHeight: 1.5,
    },
    caption: {
      fontSize: 14,
      fontWeight: '400' as const,
      lineHeight: 1.5,
    },
    small: {
      fontSize: 12,
      fontWeight: '400' as const,
      lineHeight: 1.4,
    },
  },
} as const;

