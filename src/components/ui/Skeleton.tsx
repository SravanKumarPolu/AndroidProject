import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Animated, { LinearTransition } from 'react-native-reanimated';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  style?: ViewStyle | ViewStyle[];
  radius?: number;
}

export function Skeleton({ width = '100%', height = 14, style, radius = 8 }: SkeletonProps) {
  return (
    <Animated.View
      layout={LinearTransition.duration(150)}
      style={[
        styles.base,
        { width, height, borderRadius: radius } as any,
        style as any,
      ] as any}
      accessibilityRole="progressbar"
      accessibilityLabel="Loading"
      accessible
    />
  );
}

export function SkeletonBlock({
  lines = 3,
  lineHeight = 14,
  gap = 10,
  radius = 8,
}: {
  lines?: number;
  lineHeight?: number;
  gap?: number;
  radius?: number;
}) {
  return (
    <View style={{ gap }}>
      {Array.from({ length: lines }).map((_, idx) => (
        <Skeleton
          key={idx}
          width={idx === lines - 1 ? '80%' : '100%'}
          height={lineHeight}
          radius={radius}
        />
      ))}
    </View>
  );
}

export function CardSkeleton() {
  return (
    <View style={styles.card}>
      <Skeleton width={120} height={14} />
      <View style={{ height: 10 }} />
      <SkeletonBlock lines={3} />
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: 'rgba(125, 125, 125, 0.15)',
    overflow: 'hidden',
  },
  card: {
    width: '100%',
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(125, 125, 125, 0.08)',
  },
});


