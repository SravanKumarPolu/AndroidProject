import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
  interpolate,
  Extrapolate,
  runOnJS,
} from 'react-native-reanimated';
import { Button } from '@/components/ui/Button';
import { useTheme } from '@/contexts/ThemeContext';
import { typography } from '@/constants/typography';
import { spacing } from '@/constants/spacing';
import { requestPermissions } from '@/services/notifications';
import { useToast } from '@/contexts/ToastContext';
import { onboarding } from '@/utils/onboarding';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface OnboardingSlide {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  color: string;
  illustration?: string;
}

const slides: OnboardingSlide[] = [
  {
    icon: 'lock-closed',
    title: 'Lock Your Impulses',
    description: 'Before you buy, log it. We\'ll help you think twice with a cool-down period that gives you time to reflect.',
    color: '#6366F1',
    illustration: '🔒',
  },
  {
    icon: 'time',
    title: 'Cool-Down Period',
    description: 'Wait 24 hours before buying. Time to reflect and make better decisions. Most regrets happen in the heat of the moment.',
    color: '#F59E0B',
    illustration: '⏰',
  },
  {
    icon: 'trending-down',
    title: 'Track Your Regrets',
    description: 'See which purchases you regretted and how much money you\'ve saved. Learn from your patterns and make smarter choices.',
    color: '#10B981',
    illustration: '📊',
  },
  {
    icon: 'notifications',
    title: 'Smart Reminders',
    description: 'Get notified when your cool-down ends and when to check in on purchases. Never miss an opportunity to save.',
    color: '#EF4444',
    illustration: '🔔',
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  // Format currency for display (using INR as default for onboarding)
  const formatCurrency = (amount: number) => `₹${amount.toLocaleString('en-IN')}`;
  const { showError, showInfo } = useToast();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [requestingPermissions, setRequestingPermissions] = useState(false);

  const scrollX = useSharedValue(0);
  const iconScale = useSharedValue(1);
  const iconRotation = useSharedValue(0);

  const scrollViewRef = useRef<ScrollView>(null);

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      const nextSlide = currentSlide + 1;
      scrollViewRef.current?.scrollTo({
        x: nextSlide * SCREEN_WIDTH,
        animated: true,
      });
      setCurrentSlide(nextSlide);
      
      // Animate icon
      iconScale.value = withSequence(
        withSpring(1.2),
        withSpring(1)
      );
      iconRotation.value = withSpring(iconRotation.value + 360);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentSlide > 0) {
      const prevSlide = currentSlide - 1;
      scrollViewRef.current?.scrollTo({
        x: prevSlide * SCREEN_WIDTH,
        animated: true,
      });
      setCurrentSlide(prevSlide);
      
      // Animate icon
      iconScale.value = withSequence(
        withSpring(1.2),
        withSpring(1)
      );
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleComplete = async () => {
    try {
      await onboarding.markComplete();
      
      setRequestingPermissions(true);
      try {
        const granted = await requestPermissions();
        if (granted) {
          showInfo('Notifications enabled! You\'ll be reminded when impulses are ready to review.');
        } else {
          showInfo('You can enable notifications later in settings.');
        }
      } catch (permError) {
        console.error('Error requesting permissions:', permError);
        showInfo('You can enable notifications later in settings.');
      } finally {
        setRequestingPermissions(false);
      }
      
      setTimeout(() => {
        router.replace('/(tabs)');
      }, 500);
    } catch (error) {
      console.error('Error completing onboarding:', error);
      showError('Failed to complete setup. Please try again.');
      setTimeout(() => {
        router.replace('/(tabs)');
      }, 1000);
    }
  };

  const handleScroll = (event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    scrollX.value = offsetX;
    const newSlide = Math.round(offsetX / SCREEN_WIDTH);
    if (newSlide !== currentSlide) {
      setCurrentSlide(newSlide);
      iconScale.value = withSequence(
        withSpring(1.2),
        withSpring(1)
      );
    }
  };

  const current = slides[currentSlide];

  // Animated styles
  const iconAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: iconScale.value },
        { rotate: `${iconRotation.value}deg` },
      ],
    };
  });

  const indicatorAnimatedStyle = (index: number) => {
    return useAnimatedStyle(() => {
      const inputRange = [
        (index - 1) * SCREEN_WIDTH,
        index * SCREEN_WIDTH,
        (index + 1) * SCREEN_WIDTH,
      ];
      
      const width = interpolate(
        scrollX.value,
        inputRange,
        [8, 24, 8],
        Extrapolate.CLAMP
      );
      
      const opacity = interpolate(
        scrollX.value,
        inputRange,
        [0.3, 1, 0.3],
        Extrapolate.CLAMP
      );

      return {
        width,
        opacity,
      };
    });
  };

  const dynamicStyles = {
    container: { backgroundColor: colors.background },
    title: { color: colors.text },
    description: { color: colors.textLight },
    skipText: { color: colors.textLight },
  };

  return (
    <SafeAreaView style={[styles.container, dynamicStyles.container]} edges={['top', 'bottom']}>
      {/* Skip Button */}
      {currentSlide < slides.length - 1 && (
        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <Text style={[styles.skipText, dynamicStyles.skipText]}>Skip</Text>
        </TouchableOpacity>
      )}

      {/* Scrollable Slides */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        style={styles.scrollView}
      >
        {slides.map((slide, index) => {
          const slideAnimatedStyle = useAnimatedStyle(() => {
            const inputRange = [
              (index - 1) * SCREEN_WIDTH,
              index * SCREEN_WIDTH,
              (index + 1) * SCREEN_WIDTH,
            ];
            
            const opacity = interpolate(
              scrollX.value,
              inputRange,
              [0, 1, 0],
              Extrapolate.CLAMP
            );
            
            const translateY = interpolate(
              scrollX.value,
              inputRange,
              [50, 0, 50],
              Extrapolate.CLAMP
            );

            return {
              opacity,
              transform: [{ translateY }],
            };
          });

          return (
            <View key={index} style={[styles.slide, { width: SCREEN_WIDTH }]}>
              <Animated.View style={[styles.slideContent, slideAnimatedStyle]}>
                {/* Icon Container */}
                <View style={[styles.iconContainer, { backgroundColor: `${slide.color}15` }]}>
                  {index === currentSlide && (
                    <Animated.View style={iconAnimatedStyle}>
                      <Ionicons name={slide.icon} size={80} color={slide.color} />
                    </Animated.View>
                  )}
                  {index !== currentSlide && (
                    <Ionicons name={slide.icon} size={80} color={slide.color} />
                  )}
                </View>

                {/* Title */}
                <Text style={[styles.title, dynamicStyles.title]}>{slide.title}</Text>

                {/* Description */}
                <Text style={[styles.description, dynamicStyles.description]}>
                  {slide.description}
                </Text>

                {/* Example Stats (for engagement) */}
                {index === 2 && (
                  <View style={[styles.statsPreview, { backgroundColor: colors.surface }]}>
                    <View style={styles.statItem}>
                      <Text style={[styles.statValue, { color: colors.success[600] }]}>
                        {formatCurrency(12500)}
                      </Text>
                      <Text style={[styles.statLabel, { color: colors.textLight }]}>Saved</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Text style={[styles.statValue, { color: colors.primary[600] }]}>23</Text>
                      <Text style={[styles.statLabel, { color: colors.textLight }]}>Avoided</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Text style={[styles.statValue, { color: colors.accent[600] }]}>7 days</Text>
                      <Text style={[styles.statLabel, { color: colors.textLight }]}>Streak</Text>
                    </View>
                  </View>
                )}
              </Animated.View>
            </View>
          );
        })}
      </ScrollView>

      {/* Indicators */}
      <View style={styles.indicators}>
        {slides.map((slide, index) => (
          <Animated.View
            key={index}
            style={[
              styles.indicator,
              { backgroundColor: slide.color },
              indicatorAnimatedStyle(index),
            ]}
          />
        ))}
      </View>

      {/* Action Buttons */}
      <View style={styles.actions}>
        {currentSlide > 0 && (
          <Button
            variant="outline"
            title="Back"
            onPress={handleBack}
            style={styles.backButton}
          />
        )}
        <Button
          title={currentSlide === slides.length - 1 ? 'Get Started' : 'Next'}
          onPress={handleNext}
          loading={requestingPermissions}
          style={styles.nextButton}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  skipButton: {
    alignSelf: 'flex-end',
    padding: spacing.base,
    zIndex: 10,
  },
  skipText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
  },
  scrollView: {
    flex: 1,
  },
  slide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  slideContent: {
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing['5xl'],
  },
  iconContainer: {
    width: 160,
    height: 160,
    borderRadius: 80,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing['3xl'],
  },
  title: {
    fontSize: typography.fontSize['4xl'],
    fontWeight: typography.fontWeight.bold,
    textAlign: 'center',
    marginBottom: spacing.base,
    paddingHorizontal: spacing.base,
  },
  description: {
    fontSize: typography.fontSize.lg,
    textAlign: 'center',
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.lg,
    paddingHorizontal: spacing.xl,
    marginBottom: spacing['2xl'],
  },
  statsPreview: {
    flexDirection: 'row',
    padding: spacing.base,
    borderRadius: spacing.lg,
    marginTop: spacing.xl,
    gap: spacing.base,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing.xs,
  },
  statLabel: {
    fontSize: typography.fontSize.sm,
  },
  indicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.base,
  },
  indicator: {
    height: 8,
    borderRadius: 4,
  },
  actions: {
    flexDirection: 'row',
    padding: spacing.base,
    gap: spacing.base,
  },
  backButton: {
    flex: 1,
  },
  nextButton: {
    flex: 2,
  },
});
