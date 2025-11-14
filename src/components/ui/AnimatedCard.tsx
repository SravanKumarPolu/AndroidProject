import React, { useEffect, useRef } from 'react';
import { Animated, ViewStyle, StyleProp } from 'react-native';
import { Card } from './Card';

interface AnimatedCardProps {
  children?: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined';
  style?: StyleProp<ViewStyle>;
  delay?: number;
  duration?: number;
}

export function AnimatedCard({ delay = 0, duration = 300, style, ...props }: AnimatedCardProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration,
        delay,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        delay,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }),
    ]).start();
  }, []);

  const animatedStyle = {
    opacity: fadeAnim,
    transform: [{ translateY: slideAnim }],
  };

  return (
    <Animated.View style={animatedStyle}>
      <Card variant={props.variant} style={style || undefined}>
        {props.children}
      </Card>
    </Animated.View>
  );
}

