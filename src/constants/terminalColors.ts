/**
 * Terminal/Radar Theme Colors for 2025 Dev Aesthetics
 * Dark theme with terminal green/cyan accents, scan lines, and glow effects
 */

// Terminal color palette
const terminalGreen = {
  50: '#F0FFF4',
  100: '#C6F6D5',
  200: '#9AE6B4',
  300: '#68D391',
  400: '#48BB78',
  500: '#38A169', // Main terminal green
  600: '#2F855A',
  700: '#276749',
  800: '#22543D',
  900: '#1C4532',
} as const;

const terminalCyan = {
  50: '#ECFEFF',
  100: '#C6F6FF',
  200: '#9EE3FF',
  300: '#76D1FF',
  400: '#4EBEFF',
  500: '#26ABFF', // Main terminal cyan
  600: '#1E8ACC',
  700: '#176999',
  800: '#0F4766',
  900: '#082533',
} as const;

const terminalAmber = {
  50: '#FFFBEB',
  100: '#FEF3C7',
  200: '#FDE68A',
  300: '#FCD34D',
  400: '#FBBF24',
  500: '#F59E0B', // Terminal amber
  600: '#D97706',
  700: '#B45309',
  800: '#92400E',
  900: '#78350F',
} as const;

const terminalRed = {
  50: '#FEF2F2',
  100: '#FEE2E2',
  200: '#FECACA',
  300: '#FCA5A5',
  400: '#F87171',
  500: '#EF4444', // Terminal red
  600: '#DC2626',
  700: '#B91C1C',
  800: '#991B1B',
  900: '#7F1D1D',
} as const;

// Dark terminal grays (more contrast)
const terminalGray = {
  50: '#1A1A1A',
  100: '#2A2A2A',
  200: '#3A3A3A',
  300: '#4A4A4A',
  400: '#5A5A5A',
  500: '#6A6A6A',
  600: '#7A7A7A',
  700: '#8A8A8A',
  800: '#9A9A9A',
  900: '#AAAAAA',
} as const;

// Terminal theme colors (radar/terminal aesthetic)
export const terminalColors = {
  // Terminal accent colors
  terminalGreen,
  terminalCyan,
  terminalAmber,
  terminalRed,
  terminalGray,
  
  // Use terminal colors as primary/accent
  primary: terminalCyan,
  accent: terminalAmber,
  success: terminalGreen,
  error: terminalRed,
  warning: terminalAmber,
  gray: terminalGray,
  
  // Semantic colors for terminal theme
  background: '#0A0A0A', // Deep black background
  surface: '#121212', // Slightly lighter black for cards
  surfaceElevated: '#1A1A1A', // Elevated surfaces
  text: '#00FF41', // Terminal green text (classic terminal)
  textLight: '#00D936', // Lighter green for secondary text
  textDark: '#00FF88', // Bright green for emphasis
  textSecondary: '#00B82E', // Darker green for tertiary text
  textMuted: '#4A9A5C', // Muted green for disabled text
  
  // Terminal-style borders
  border: '#1A3A1A', // Dark green border
  borderLight: '#0F2A0F', // Very dark green border
  borderGlow: '#00FF41', // Glowing green border
  
  // Scan line effect
  scanLine: 'rgba(0, 255, 65, 0.1)', // Subtle scan line overlay
  
  // Glow effects
  glowPrimary: 'rgba(38, 171, 255, 0.3)', // Cyan glow
  glowSuccess: 'rgba(0, 255, 65, 0.3)', // Green glow
  glowWarning: 'rgba(245, 158, 11, 0.3)', // Amber glow
  glowError: 'rgba(239, 68, 68, 0.3)', // Red glow
  
  // Button colors
  buttonPrimaryBg: terminalCyan[600],
  buttonPrimaryText: '#000000', // Black text on cyan
  buttonSecondaryBg: terminalGray[200],
  buttonSecondaryText: terminalGreen[500], // Green text on dark gray
  
  // Status colors
  locked: terminalCyan[500],
  cancelled: terminalGreen[500],
  executed: terminalGray[500],
  regret: terminalRed[500],
  worthIt: terminalGreen[500],
} as const;

// Type for terminal theme
export type TerminalColors = typeof terminalColors;

