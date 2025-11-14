import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/constants/colors';
import { typography } from '@/constants/typography';
import { getTimeRemaining, isTimePast } from '@/utils/date';

interface CountdownTimerProps {
  targetTimestamp: number;
  onComplete?: () => void;
  size?: 'sm' | 'md' | 'lg';
}

export function CountdownTimer({ targetTimestamp, onComplete, size = 'md' }: CountdownTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState(getTimeRemaining(targetTimestamp));

  useEffect(() => {
    const interval = setInterval(() => {
      const remaining = getTimeRemaining(targetTimestamp);
      setTimeRemaining(remaining);

      if (remaining.totalSeconds <= 0 && onComplete) {
        onComplete();
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [targetTimestamp, onComplete]);

  const isComplete = isTimePast(targetTimestamp);

  const sizeStyles = {
    sm: { fontSize: typography.fontSize.sm },
    md: { fontSize: typography.fontSize.base },
    lg: { fontSize: typography.fontSize.lg },
  };

  if (isComplete) {
    return (
      <View style={styles.container}>
        <Text style={[styles.text, styles.complete, sizeStyles[size]]}>
          Ready to review
        </Text>
      </View>
    );
  }

  const formatTime = () => {
    if (timeRemaining.hours > 0) {
      return `${timeRemaining.hours}h ${timeRemaining.minutes}m`;
    }
    return `${timeRemaining.minutes}m ${timeRemaining.seconds}s`;
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.text, sizeStyles[size]]}>
        {formatTime()} remaining
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  text: {
    fontWeight: typography.fontWeight.medium,
    color: colors.textLight,
  },
  complete: {
    color: colors.primary[600],
    fontWeight: typography.fontWeight.bold,
  },
});

