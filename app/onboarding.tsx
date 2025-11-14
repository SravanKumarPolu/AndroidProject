import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Modal } from 'react-native';
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
import { useGoals } from '@/hooks/useGoals';
import { formatCurrency } from '@/utils/currency';
import { Input } from '@/components/ui/Input';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface OnboardingSlide {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  color: string;
  illustration?: string;
}

// Simplified 2-screen onboarding
const ONBOARDING_SCREENS = {
  WELCOME: 0,
  GOAL: 1,
} as const;

type OnboardingScreenType = typeof ONBOARDING_SCREENS[keyof typeof ONBOARDING_SCREENS];

export default function OnboardingScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { showError, showInfo } = useToast();
  const { createGoal } = useGoals();
  const [currentScreen, setCurrentScreen] = useState<OnboardingScreenType>(ONBOARDING_SCREENS.WELCOME);
  const [requestingPermissions, setRequestingPermissions] = useState(false);
  const [monthlyGoal, setMonthlyGoal] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  const handleNext = () => {
    if (currentScreen === ONBOARDING_SCREENS.WELCOME) {
      setCurrentScreen(ONBOARDING_SCREENS.GOAL);
    }
  };

  const handleBack = () => {
    if (currentScreen === ONBOARDING_SCREENS.GOAL) {
      setCurrentScreen(ONBOARDING_SCREENS.WELCOME);
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleComplete = async () => {
    try {
      // Create monthly goal if selected
      if (monthlyGoal && monthlyGoal > 0) {
        try {
          await createGoal({
            title: 'Monthly Savings Goal',
            targetAmount: monthlyGoal,
            description: 'Track your monthly savings from skipped impulses',
          });
        } catch (goalError) {
          console.error('Error creating monthly goal:', goalError);
          // Continue even if goal creation fails
        }
      }

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


  const dynamicStyles = {
    container: { backgroundColor: colors.background },
    title: { color: colors.text },
    description: { color: colors.textLight },
    skipText: { color: colors.textLight },
  };

  // Render Welcome Screen
  const renderWelcomeScreen = () => (
    <View style={styles.screen}>
      <View style={styles.welcomeContent}>
        <Text style={[styles.welcomeTitle, dynamicStyles.title]}>
          Stop regret buys. Start saving.
        </Text>
        
        <View style={styles.bullets}>
          <View style={styles.bulletItem}>
            <Text style={styles.bulletIcon}>✓</Text>
            <Text style={[styles.bulletText, dynamicStyles.description]}>
              Catch yourself before paying.
            </Text>
          </View>
          <View style={styles.bulletItem}>
            <Text style={styles.bulletIcon}>✓</Text>
            <Text style={[styles.bulletText, dynamicStyles.description]}>
              Wait a bit, then decide smart.
            </Text>
          </View>
          <View style={styles.bulletItem}>
            <Text style={styles.bulletIcon}>✓</Text>
            <Text style={[styles.bulletText, dynamicStyles.description]}>
              Watch your saved money grow.
            </Text>
          </View>
        </View>
      </View>
      
      <View style={styles.welcomeActions}>
        <Button
          title="Set My Goal"
          onPress={handleNext}
          style={styles.welcomeButton}
          fullWidth
        />
      </View>
    </View>
  );

  // Render Goal Screen
  const renderGoalScreen = () => (
    <View style={styles.screen}>
      <View style={styles.goalContent}>
        <Text style={[styles.goalTitle, dynamicStyles.title]}>Set Your Monthly Savings Goal</Text>
        <Text style={[styles.goalDescription, dynamicStyles.description]}>
          Pick a monthly savings goal to track your progress. You can change this later.
        </Text>
        
        <View style={styles.goalOptions}>
          {[2000, 5000, 10000].map((amount) => (
            <TouchableOpacity
              key={amount}
              style={[
                styles.goalOption,
                monthlyGoal === amount && { backgroundColor: colors.primary[500], borderColor: colors.primary[500] },
                { borderColor: colors.border },
              ]}
              onPress={() => {
                setMonthlyGoal(amount);
                setShowCustomInput(false);
                setCustomAmount('');
              }}
            >
              <Text
                style={[
                  styles.goalOptionText,
                  { color: monthlyGoal === amount ? colors.textDark : colors.text },
                ]}
              >
                {formatCurrency(amount)}
              </Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            style={[
              styles.goalOption,
              showCustomInput && { backgroundColor: colors.primary[500], borderColor: colors.primary[500] },
              { borderColor: colors.border },
            ]}
            onPress={() => {
              setShowCustomInput(true);
              setMonthlyGoal(null);
            }}
          >
            <Text
              style={[
                styles.goalOptionText,
                { color: showCustomInput ? colors.textDark : colors.text },
              ]}
            >
              Custom
            </Text>
          </TouchableOpacity>
        </View>

        {showCustomInput && (
          <View style={styles.customInputContainer}>
            <Input
              label="Enter custom amount"
              placeholder="₹0"
              value={customAmount}
              onChangeText={(text) => {
                setCustomAmount(text);
                const numValue = parseFloat(text.replace(/[₹,\s]/g, ''));
                if (!isNaN(numValue) && numValue > 0) {
                  setMonthlyGoal(numValue);
                } else {
                  setMonthlyGoal(null);
                }
              }}
              keyboardType="numeric"
              style={styles.customInput}
            />
          </View>
        )}
      </View>
      
      <View style={styles.goalActions}>
        <Button
          title="Back"
          variant="outline"
          onPress={handleBack}
          style={styles.goalBackButton}
        />
        <Button
          title="Continue"
          onPress={handleComplete}
          loading={requestingPermissions}
          style={styles.goalContinueButton}
          disabled={!monthlyGoal}
        />
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, dynamicStyles.container]} edges={['top', 'bottom']}>
      {currentScreen === ONBOARDING_SCREENS.WELCOME && renderWelcomeScreen()}
      {currentScreen === ONBOARDING_SCREENS.GOAL && renderGoalScreen()}
      
      {/* Monthly Goal Picker Modal (kept for backward compatibility, but not used in new flow) */}
      <Modal
        visible={false}
        transparent
        animationType="fade"
        onRequestClose={() => {
          handleComplete();
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Set Your Monthly Savings Goal</Text>
            <Text style={[styles.modalDescription, { color: colors.textLight }]}>
              Pick a monthly savings goal to track your progress. You can change this later.
            </Text>
            
            <View style={styles.goalOptions}>
              {[2000, 5000, 10000].map((amount) => (
                <TouchableOpacity
                  key={amount}
                  style={[
                    styles.goalOption,
                    monthlyGoal === amount && { backgroundColor: colors.primary[500], borderColor: colors.primary[500] },
                    { borderColor: colors.border },
                  ]}
                  onPress={() => {
                    setMonthlyGoal(amount);
                    setShowCustomInput(false);
                    setCustomAmount('');
                  }}
                >
                  <Text
                    style={[
                      styles.goalOptionText,
                      { color: monthlyGoal === amount ? colors.textDark : colors.text },
                    ]}
                  >
                    {formatCurrency(amount)}
                  </Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                style={[
                  styles.goalOption,
                  showCustomInput && { backgroundColor: colors.primary[500], borderColor: colors.primary[500] },
                  { borderColor: colors.border },
                ]}
                onPress={() => {
                  setShowCustomInput(true);
                  setMonthlyGoal(null);
                }}
              >
                <Text
                  style={[
                    styles.goalOptionText,
                    { color: showCustomInput ? colors.textDark : colors.text },
                  ]}
                >
                  Custom
                </Text>
              </TouchableOpacity>
            </View>

            {showCustomInput && (
              <View style={styles.customInputContainer}>
                <Input
                  label="Enter custom amount"
                  placeholder="₹0"
                  value={customAmount}
                  onChangeText={(text) => {
                    setCustomAmount(text);
                    const numValue = parseFloat(text.replace(/[₹,\s]/g, ''));
                    if (!isNaN(numValue) && numValue > 0) {
                      setMonthlyGoal(numValue);
                    } else {
                      setMonthlyGoal(null);
                    }
                  }}
                  keyboardType="numeric"
                  style={styles.customInput}
                />
              </View>
            )}

            <View style={styles.modalActions}>
              <Button
                title="Skip"
                variant="ghost"
                onPress={() => {
                  handleComplete();
                }}
                style={styles.modalButton}
              />
              <Button
                title="Continue"
                onPress={() => {
                  handleComplete();
                }}
                style={styles.modalButton}
                disabled={!monthlyGoal}
              />
            </View>
          </View>
        </View>
      </Modal>
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.base,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    borderRadius: spacing.xl,
    padding: spacing.xl,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  modalTitle: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  modalDescription: {
    fontSize: typography.fontSize.base,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.base,
  },
  goalOptions: {
    gap: spacing.base,
    marginBottom: spacing.xl,
  },
  goalOption: {
    padding: spacing.lg,
    borderRadius: spacing.md,
    borderWidth: 2,
    alignItems: 'center',
  },
  goalOptionText: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing.base,
  },
  modalButton: {
    flex: 1,
  },
  customInputContainer: {
    marginTop: spacing.base,
  },
  customInput: {
    marginBottom: 0,
  },
  screen: {
    flex: 1,
    padding: spacing.xl,
    justifyContent: 'space-between',
  },
  welcomeContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcomeTitle: {
    fontSize: typography.fontSize['4xl'],
    fontWeight: typography.fontWeight.bold,
    textAlign: 'center',
    marginBottom: spacing['2xl'],
  },
  bullets: {
    gap: spacing.lg,
    width: '100%',
  },
  bulletItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.base,
  },
  bulletIcon: {
    fontSize: typography.fontSize.xl,
    color: '#10B981',
    fontWeight: typography.fontWeight.bold,
  },
  bulletText: {
    fontSize: typography.fontSize.lg,
    flex: 1,
  },
  welcomeActions: {
    paddingBottom: spacing.xl,
  },
  welcomeButton: {
    marginTop: spacing.base,
  },
  goalContent: {
    flex: 1,
    justifyContent: 'center',
  },
  goalTitle: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
    textAlign: 'center',
    marginBottom: spacing.base,
  },
  goalDescription: {
    fontSize: typography.fontSize.base,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.base,
  },
  goalActions: {
    flexDirection: 'row',
    gap: spacing.base,
    paddingBottom: spacing.xl,
  },
  goalBackButton: {
    flex: 1,
  },
  goalContinueButton: {
    flex: 2,
  },
});
