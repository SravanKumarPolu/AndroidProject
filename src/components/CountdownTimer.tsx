import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { typography } from '@/constants/typography';
import { spacing } from '@/constants/spacing';
import { getTimeRemaining, isTimePast } from '@/utils/date';
import { getTerminalTextStyle } from '@/utils/terminalTypography';

interface CountdownTimerProps {
  targetTimestamp: number;
  onComplete?: () => void;
  size?: 'sm' | 'md' | 'lg';
}

export function CountdownTimer({ targetTimestamp, onComplete, size = 'md' }: CountdownTimerProps) {
  const { colors, theme } = useTheme();
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
  const isTerminal = theme === 'terminal';
  const terminalStyle = getTerminalTextStyle(isTerminal);

  const sizeStyles = {
    sm: { fontSize: typography.fontSize.sm },
    md: { fontSize: typography.fontSize.base },
    lg: { fontSize: typography.fontSize['3xl'], fontWeight: typography.fontWeight.bold },
  };

  if (isComplete) {
    return (
      <View style={styles.container}>
        <Text style={[
          styles.text, 
          styles.complete, 
          sizeStyles[size], 
          terminalStyle,
          { color: colors.success[700] || colors.text }
        ]}>
          Ready to review
        </Text>
      </View>
    );
  }

  const formatTime = () => {
    if (timeRemaining.hours > 0) {
      return `${String(timeRemaining.hours).padStart(2, '0')}:${String(timeRemaining.minutes).padStart(2, '0')}:${String(timeRemaining.seconds).padStart(2, '0')}`;
    }
    return `${String(timeRemaining.minutes).padStart(2, '0')}:${String(timeRemaining.seconds).padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      <Text style={[
        styles.text, 
        sizeStyles[size], 
        terminalStyle,
        { color: colors.primary[700] || colors.text }
      ]}>
        {formatTime()}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.base,
  },
  text: {
    fontWeight: typography.fontWeight.medium,
    fontVariant: ['tabular-nums'],
  },
  complete: {
    fontWeight: typography.fontWeight.bold,
  },
});

