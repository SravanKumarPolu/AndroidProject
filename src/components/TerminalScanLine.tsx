import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

interface TerminalScanLineProps {
  style?: any;
}

/**
 * Terminal scan line effect - subtle animated line that moves down
 */
export function TerminalScanLine({ style }: TerminalScanLineProps) {
  const { theme, colors } = useTheme();
  const scanLineAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (theme !== 'terminal') return;

    const animate = () => {
      Animated.sequence([
        Animated.timing(scanLineAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(scanLineAnim, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Add random delay before next scan
        setTimeout(animate, Math.random() * 2000 + 1000);
      });
    };

    animate();
  }, [theme, scanLineAnim]);

  if (theme !== 'terminal') return null;

  const translateY = scanLineAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['-100%', '100%'],
  });

  return (
    <View style={[StyleSheet.absoluteFill, style]} pointerEvents="none">
      <Animated.View
        style={[
          styles.scanLine,
          {
            transform: [{ translateY }],
            backgroundColor: (colors as any).scanLine || 'rgba(0, 255, 65, 0.1)',
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  scanLine: {
    width: '100%',
    height: 2,
  },
});

