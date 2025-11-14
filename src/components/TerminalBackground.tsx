import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { TerminalScanLine } from './TerminalScanLine';

interface TerminalBackgroundProps {
  children: React.ReactNode;
  style?: any;
}

/**
 * Terminal background wrapper with scan line effect
 */
export function TerminalBackground({ children, style }: TerminalBackgroundProps) {
  const { theme, colors } = useTheme();

  if (theme !== 'terminal') {
    return <View style={style}>{children}</View>;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }, style]}>
      <TerminalScanLine />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
  },
});

