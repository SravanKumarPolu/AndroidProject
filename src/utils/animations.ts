/**
 * Enhanced Animation Utilities
 * Reusable animation configurations using react-native-reanimated
 */

import { withTiming, withSpring, Easing, SharedValue, runOnJS } from 'react-native-reanimated';

export const ANIMATION_CONFIG = {
  fast: { duration: 200 },
  normal: { duration: 300 },
  slow: { duration: 500 },
  spring: {
    damping: 15,
    stiffness: 150,
    mass: 1,
  },
};

/**
 * Fade in animation
 */
export const fadeIn = (opacity: SharedValue<number>, duration = 300) => {
  'worklet';
  return withTiming(1, { duration }, () => {
    opacity.value = 1;
  });
};

/**
 * Fade out animation
 */
export const fadeOut = (opacity: SharedValue<number>, duration = 300) => {
  'worklet';
  return withTiming(0, { duration }, () => {
    opacity.value = 0;
  });
};

/**
 * Scale animation
 */
export const scale = (scale: SharedValue<number>, to: number, duration = 300) => {
  'worklet';
  return withSpring(to, ANIMATION_CONFIG.spring);
};

/**
 * Slide animation
 */
export const slide = (translateX: SharedValue<number>, to: number, duration = 300) => {
  'worklet';
  return withSpring(to, ANIMATION_CONFIG.spring);
};

/**
 * Bounce animation
 */
export const bounce = (scale: SharedValue<number>) => {
  'worklet';
  return withSpring(1.1, { damping: 3, stiffness: 300 }, () => {
    scale.value = withSpring(1, ANIMATION_CONFIG.spring);
  });
};

/**
 * Pulse animation
 */
export const pulse = (scale: SharedValue<number>) => {
  'worklet';
  return withTiming(1.05, { duration: 200 }, () => {
    scale.value = withTiming(1, { duration: 200 });
  });
};

/**
 * Shake animation
 */
export const shake = (translateX: SharedValue<number>) => {
  'worklet';
  const shakeAmount = 10;
  return withTiming(shakeAmount, { duration: 50 }, () => {
    translateX.value = withTiming(-shakeAmount, { duration: 50 }, () => {
      translateX.value = withTiming(shakeAmount, { duration: 50 }, () => {
        translateX.value = withTiming(0, { duration: 50 });
      });
    });
  });
};



