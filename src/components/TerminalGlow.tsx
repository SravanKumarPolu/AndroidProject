import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

interface TerminalGlowProps {
  children: React.ReactNode;
  color?: 'primary' | 'success' | 'warning' | 'error';
  intensity?: 'low' | 'medium' | 'high';
  style?: any;
}

/**
 * Terminal glow effect wrapper - adds subtle pulsing glow around content
 */
export function TerminalGlow({ children, color = 'primary', intensity = 'medium', style }: TerminalGlowProps) {
  const { theme, colors } = useTheme();
  const glowAnim = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    if (theme !== 'terminal') return;

    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0.5,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [theme, glowAnim]);

  if (theme !== 'terminal') {
    return <>{children}</>;
  }

  const glowColorMap = {
    primary: (colors as any).glowPrimary || 'rgba(38, 171, 255, 0.3)',
    success: (colors as any).glowSuccess || 'rgba(0, 255, 65, 0.3)',
    warning: (colors as any).glowWarning || 'rgba(245, 158, 11, 0.3)',
    error: (colors as any).glowError || 'rgba(239, 68, 68, 0.3)',
  };

  const intensityMap = {
    low: 0.2,
    medium: 0.4,
    high: 0.6,
  };

  const opacity = glowAnim.interpolate({
    inputRange: [0.5, 1],
    outputRange: [intensityMap[intensity] * 0.5, intensityMap[intensity]],
  });

  return (
    <View style={style}>
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          {
            opacity,
            backgroundColor: glowColorMap[color],
            borderRadius: 8,
            shadowColor: glowColorMap[color],
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 1,
            shadowRadius: 10,
            elevation: 5,
          },
        ]}
        pointerEvents="none"
      />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
});

