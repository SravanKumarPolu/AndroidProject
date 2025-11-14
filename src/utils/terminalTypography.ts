import { useTheme } from '@/contexts/ThemeContext';
import { typography } from '@/constants/typography';

/**
 * Get typography style for terminal theme
 * Uses monospace font for numbers and data in terminal mode
 */
export function useTerminalTypography() {
  const { theme } = useTheme();
  const isTerminal = theme === 'terminal';

  return {
    // Monospace for numbers/data in terminal mode
    mono: isTerminal ? { fontFamily: typography.fontFamily.mono } : {},
    // Regular font for text
    regular: {},
  };
}

/**
 * Get terminal-specific text style
 */
export function getTerminalTextStyle(isTerminal: boolean) {
  if (!isTerminal) return {};
  
  return {
    fontFamily: typography.fontFamily.mono,
    letterSpacing: 0.5,
  };
}

