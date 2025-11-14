import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useImpulses } from '@/hooks/useImpulses';
import { useSettings } from '@/hooks/useSettings';
import { useToast } from '@/contexts/ToastContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { SkipCelebration } from '@/components/SkipCelebration';
import { CountdownTimer } from '@/components/CountdownTimer';
import { TerminalBackground } from '@/components/TerminalBackground';
import { TerminalGlow } from '@/components/TerminalGlow';
import { typography } from '@/constants/typography';
import { spacing, borderRadius } from '@/constants/spacing';
import { CATEGORY_LABELS } from '@/constants/categories';
import { CategoryIcon } from '@/components/CategoryIcon';
import { formatCurrency } from '@/utils/currency';
import { getTimeRemaining, isTimePast, formatRelativeTime } from '@/utils/date';
import { getBestEquivalent, formatFunEquivalent, getFunEquivalents } from '@/utils/funEquivalents';
import { COOL_DOWN_LABELS } from '@/constants/coolDown';
import { Impulse } from '@/types/impulse';
import { getTerminalTextStyle } from '@/utils/terminalTypography';

export default function CooldownScreen() {
  const router = useRouter();
  const { colors, theme } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { impulses, cancelImpulse, executeImpulse } = useImpulses();
  const { isStrictMode } = useSettings();
  const { showError, showSuccess } = useToast();
  
  const impulse = impulses.find(i => i.id === id);
  const [loading, setLoading] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [savedAmount, setSavedAmount] = useState(0);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [skipNote, setSkipNote] = useState('');
  const [timeRemaining, setTimeRemaining] = useState(() => 
    impulse ? getTimeRemaining(impulse.reviewAt) : getTimeRemaining(Date.now())
  );

  // Update timer every second
  useEffect(() => {
    if (!impulse) return;
    
    const updateTimer = () => {
      const remaining = getTimeRemaining(impulse.reviewAt);
      setTimeRemaining(remaining);
    };

    updateTimer(); // Initial update

    if (!isTimePast(impulse.reviewAt)) {
      const interval = setInterval(updateTimer, 1000);
      return () => clearInterval(interval);
    }
  }, [impulse]);

  if (!impulse) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.error}>Impulse not found</Text>
        <Button title="Go Back" onPress={() => router.back()} />
      </SafeAreaView>
    );
  }

  const isReady = isTimePast(impulse.reviewAt);
  const funEquivalent = impulse.price ? getBestEquivalent(impulse.price) : null;
  const allEquivalents = impulse.price ? getFunEquivalents(impulse.price) : [];

  const handleSkip = async () => {
    if (!isReady && isStrictMode) {
      Alert.alert(
        'Still Locked',
        'This impulse is still in cool-down. Please wait until the timer ends.',
        [{ text: 'OK' }]
      );
      return;
    }

    const amount = impulse.price || 0;
    if (amount > 0) {
      setSavedAmount(amount);
      setShowNoteModal(true);
    } else {
      // No price, skip directly
      await performSkip();
    }
  };

  const performSkip = async (note?: string) => {
    setLoading(true);
    try {
      await cancelImpulse(impulse.id, 'RELIEVED', note);
      
      if (savedAmount > 0) {
        setShowCelebration(true);
      } else {
        showSuccess('Great decision! You saved money by avoiding this impulse.');
        router.replace('/(tabs)');
      }
    } catch (error) {
      console.error('Error cancelling impulse:', error);
      showError('Failed to cancel impulse. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCelebrationClose = () => {
    setShowCelebration(false);
    setShowNoteModal(false);
    showSuccess('Great decision! You saved money by avoiding this impulse.');
    router.replace('/(tabs)');
  };

  const handleStillBuying = async () => {
    if (!isReady) {
      Alert.alert(
        'Still Locked',
        'This impulse is still in cool-down. Please wait until the timer ends.',
        [{ text: 'OK' }]
      );
      return;
    }

    setLoading(true);
    try {
      await executeImpulse(impulse.id);
      showSuccess('Impulse executed. We\'ll check in with you in 24 hours to see how you feel about it.');
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Error executing impulse:', error);
      showError('Failed to execute impulse. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDecideLater = () => {
    router.back();
  };

  const formatTimeRemaining = () => {
    if (isReady) return 'Ready to decide';
    if (timeRemaining.hours > 0) {
      return `${timeRemaining.hours}h ${timeRemaining.minutes}m`;
    }
    if (timeRemaining.minutes > 0) {
      return `${timeRemaining.minutes}m ${timeRemaining.seconds}s`;
    }
    return `${timeRemaining.seconds}s`;
  };

  const dynamicStyles = {
    container: { backgroundColor: colors.background },
    title: { color: colors.text },
    subtitle: { color: colors.textLight },
    priceCard: { backgroundColor: colors.primary[50], borderColor: colors.primary[200] },
    priceAmount: { color: colors.primary[700] },
    saveAmount: { color: colors.success[700] },
    equivalentText: { color: colors.primary[700] },
  };

  const isTerminal = theme === 'terminal';
  const terminalStyle = getTerminalTextStyle(isTerminal);

  return (
    <TerminalBackground>
      <SafeAreaView style={[styles.container, dynamicStyles.container]} edges={['top', 'bottom']}>
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, dynamicStyles.title]}>
            Wait {COOL_DOWN_LABELS[impulse.coolDownPeriod].toLowerCase()} before you decide.
          </Text>
        </View>

        {/* Price Card */}
        {impulse.price && (
          <TerminalGlow color="success" intensity="medium">
            <Card variant="elevated" style={[styles.priceCard, dynamicStyles.priceCard]}>
              <Text style={[styles.priceAmount, terminalStyle, dynamicStyles.priceAmount]}>
                {formatCurrency(impulse.price)}
              </Text>
              <Text style={[styles.saveAmount, dynamicStyles.saveAmount]}>
                Skipping saves: {formatCurrency(impulse.price)}
              </Text>
              {funEquivalent && (
                <Text style={[styles.equivalentText, dynamicStyles.equivalentText]}>
                  {formatFunEquivalent(funEquivalent)}
                </Text>
              )}
              {allEquivalents.length > 1 && (
                <View style={styles.moreEquivalents}>
                  {allEquivalents.slice(1, 3).map((eq, idx) => (
                    <Text key={idx} style={[styles.moreEquivalentText, { color: colors.primary[600] || colors.text }]}>
                      {formatFunEquivalent(eq)}
                    </Text>
                  ))}
                </View>
              )}
            </Card>
          </TerminalGlow>
        )}

        {/* Timer */}
        <View style={styles.timerContainer}>
          <CountdownTimer
            targetTimestamp={impulse.reviewAt}
            onComplete={() => {
              setTimeRemaining(getTimeRemaining(impulse.reviewAt));
            }}
            size="lg"
          />
          <Text style={[styles.timerLabel, { color: colors.textLight }]}>
            {isReady ? 'You can now decide' : `Time remaining: ${formatTimeRemaining()}`}
          </Text>
        </View>

        {/* Impulse Info */}
        <Card variant="outlined" style={styles.impulseCard}>
          <View style={styles.impulseHeader}>
            <CategoryIcon category={impulse.category} size={24} />
            <Text style={[styles.impulseTitle, { color: colors.text }]}>{impulse.title}</Text>
          </View>
          <Text style={[styles.impulseCategory, { color: colors.textLight }]}>
            {CATEGORY_LABELS[impulse.category]}
          </Text>
        </Card>

        {/* Action Buttons */}
        <View style={styles.buttons}>
          <Button
            title="Skip this buy"
            onPress={handleSkip}
            variant="primary"
            size="lg"
            fullWidth
            loading={loading}
            style={styles.button}
            disabled={!isReady && isStrictMode}
          />
          <Button
            title="Still buying"
            onPress={handleStillBuying}
            variant="outline"
            size="lg"
            fullWidth
            loading={loading}
            style={styles.button}
            disabled={!isReady && isStrictMode}
          />
          <Button
            title="I'll decide later"
            onPress={handleDecideLater}
            variant="ghost"
            size="md"
            fullWidth
            style={styles.button}
          />
        </View>

        {!isReady && isStrictMode && (
          <Card variant="outlined" style={[styles.lockedCard, { borderColor: colors.warning[300] }]}>
            <Text style={[styles.lockedText, { color: colors.warning[700] }]}>
              🔒 Strict mode is active. Please wait until the cool-down ends.
            </Text>
          </Card>
        )}
        </ScrollView>

        {/* Note Modal */}
        <Modal
          visible={showNoteModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowNoteModal(false)}
        >
          <View style={styles.modalOverlay}>
            <Card variant="elevated" style={[styles.modalContent, { backgroundColor: colors.surface }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Add a note (optional)</Text>
              <Text style={[styles.modalDescription, { color: colors.textLight }]}>
                Did something else instead? Share what you did!
              </Text>
              <Input
                placeholder="e.g., Made coffee at home, Used my existing headphones..."
                value={skipNote}
                onChangeText={setSkipNote}
                multiline
                numberOfLines={3}
                style={styles.noteInput}
              />
              <View style={styles.modalButtons}>
                <Button
                  title="Skip"
                  variant="ghost"
                  onPress={() => {
                    setShowNoteModal(false);
                    performSkip();
                  }}
                  style={styles.modalButton}
                />
                <Button
                  title="Save"
                  onPress={() => {
                    setShowNoteModal(false);
                    performSkip(skipNote);
                  }}
                  style={styles.modalButton}
                />
              </View>
            </Card>
          </View>
        </Modal>

        {/* Skip Celebration Modal */}
        <SkipCelebration
          visible={showCelebration}
          amount={savedAmount}
          onClose={handleCelebrationClose}
        />
      </SafeAreaView>
    </TerminalBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.base,
  },
  header: {
    marginBottom: spacing.xl,
    alignItems: 'center',
  },
  title: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  priceCard: {
    marginBottom: spacing.xl,
    padding: spacing.xl,
    alignItems: 'center',
    borderWidth: 2,
  },
  priceAmount: {
    fontSize: typography.fontSize['4xl'],
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing.sm,
  },
  saveAmount: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing.sm,
  },
  equivalentText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    marginTop: spacing.xs,
  },
  moreEquivalents: {
    marginTop: spacing.sm,
    gap: spacing.xs,
    alignItems: 'center',
  },
  moreEquivalentText: {
    fontSize: typography.fontSize.sm,
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
    padding: spacing.xl,
  },
  timerLabel: {
    fontSize: typography.fontSize.base,
    marginTop: spacing.base,
  },
  impulseCard: {
    marginBottom: spacing.xl,
    padding: spacing.base,
  },
  impulseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  impulseTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    flex: 1,
  },
  impulseCategory: {
    fontSize: typography.fontSize.sm,
    marginTop: spacing.xs,
  },
  buttons: {
    gap: spacing.base,
    marginBottom: spacing.xl,
  },
  button: {
    marginBottom: spacing.sm,
  },
  lockedCard: {
    marginTop: spacing.base,
    padding: spacing.base,
  },
  lockedText: {
    fontSize: typography.fontSize.sm,
    textAlign: 'center',
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
    padding: spacing.xl,
    borderRadius: spacing.xl,
  },
  modalTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing.sm,
  },
  modalDescription: {
    fontSize: typography.fontSize.base,
    marginBottom: spacing.base,
  },
  noteInput: {
    marginBottom: spacing.base,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: spacing.base,
  },
  modalButton: {
    flex: 1,
  },
  error: {
    fontSize: typography.fontSize.base,
    textAlign: 'center',
    margin: spacing.xl,
  },
});

