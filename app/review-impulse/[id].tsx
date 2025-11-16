import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useImpulses } from '@/hooks/useImpulses';
import { useSettings } from '@/hooks/useSettings';
import { useToast } from '@/contexts/ToastContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { PhotoViewer } from '@/components/PhotoViewer';
import { SkipCelebration } from '@/components/SkipCelebration';
import { RegretRatingSelector } from '@/components/RegretRatingSelector';
import { typography } from '@/constants/typography';
import { spacing, borderRadius } from '@/constants/spacing';
import { CATEGORY_LABELS } from '@/constants/categories';
import { CategoryIcon } from '@/components/CategoryIcon';
import { formatCurrency } from '@/utils/currency';
import { formatDateTime, isTimePast } from '@/utils/date';
import { getFunEquivalents, formatFunEquivalent } from '@/utils/funEquivalents';
import { Impulse, SkippedFeeling, FinalFeeling } from '@/types/impulse';
import { trackPositiveAction, promptRatingIfAppropriate } from '@/services/rating';

export default function ReviewImpulseScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { impulses, cancelImpulse, executeImpulse, markRegret, updateImpulse } = useImpulses();
  const { isStrictMode } = useSettings();
  const { showError, showSuccess } = useToast();
  
  const impulse = impulses.find(i => i.id === id);
  const [loading, setLoading] = useState(false);
  const [showFeeling, setShowFeeling] = useState(false);
  const [showReason, setShowReason] = useState(false);
  const [skipReason, setSkipReason] = useState('');
  const [showExecuteReason, setShowExecuteReason] = useState(false);
  const [executeReason, setExecuteReason] = useState('');
  const [selectedFeeling, setSelectedFeeling] = useState<SkippedFeeling | FinalFeeling | null>(null);
  const [selectedRegretRating, setSelectedRegretRating] = useState<number | undefined>(undefined);
  const [skipForNowVisible, setSkipForNowVisible] = useState(false);
  const [skipForNowReason, setSkipForNowReason] = useState('');
  const [showPhotoViewer, setShowPhotoViewer] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [savedAmount, setSavedAmount] = useState(0);

  // Get past regrets for same category
  const pastRegrets = impulse ? impulses.filter(
    i => i.category === impulse.category && 
    i.finalFeeling === 'REGRET' && 
    i.id !== impulse.id
  ).slice(0, 3) : [];

  if (!impulse) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.error}>Impulse not found</Text>
        <Button title="Go Back" onPress={() => router.back()} />
      </SafeAreaView>
    );
  }

  const handleSkip = async (feeling: SkippedFeeling) => {
    // Check if cool-down has ended
    if (impulse && !isTimePast(impulse.reviewAt)) {
      Alert.alert(
        'Still Locked',
        'This impulse is still in cool-down. Please wait until the timer ends.',
        [{ text: 'OK' }]
      );
      return;
    }

    // In strict mode, require reason before skipping
    if (isStrictMode && !skipReason.trim()) {
      setShowReason(true);
      return;
    }

    setLoading(true);
    try {
      const amount = impulse.price || 0;
      await cancelImpulse(impulse.id, feeling);
      
      // Positive milestone → rating nudge
      try {
        await trackPositiveAction();
        await promptRatingIfAppropriate();
      } catch {}

      // Show celebration if there's a price
      if (amount > 0) {
        setSavedAmount(amount);
        setShowCelebration(true);
      } else {
      showSuccess('Great decision! You saved money by avoiding this impulse.');
      router.back();
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
    showSuccess('Great decision! You saved money by avoiding this impulse.');
    router.back();
  };

  const handleExecute = async () => {
    setLoading(true);
    try {
      await executeImpulse(impulse.id);
      showSuccess('Impulse executed. We\'ll check in with you in 24 hours to see how you feel about it.');
      router.back();
    } catch (error) {
      console.error('Error executing impulse:', error);
      showError('Failed to execute impulse. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const dynamicStyles = {
    container: { backgroundColor: colors.background },
    title: { color: colors.text },
    subtitle: { color: colors.textLight },
    categoryLabel: { color: colors.textLight },
    impulseTitle: { color: colors.text },
    impulsePrice: { color: colors.primary[600] },
    feelingQuestion: { color: colors.text },
    error: { color: colors.error[500] },
    warningCard: { backgroundColor: colors.accent[50], borderColor: colors.accent[300] },
    warningTitle: { color: colors.accent[800] },
    warningText: { color: colors.accent[700] },
    lockedCard: { backgroundColor: colors.gray[50], borderColor: colors.gray[300] },
    lockedText: { color: colors.gray[700] },
    reasonQuestion: { color: colors.text },
    reasonHint: { color: colors.textLight },
  };

  // If already executed, show regret check
  if (impulse.status === 'EXECUTED' && !impulse.finalFeeling) {
    return (
    <SafeAreaView style={[styles.container, dynamicStyles.container]} edges={['top', 'bottom']}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.title, dynamicStyles.title]}>How do you feel?</Text>
          <Text style={[styles.subtitle, dynamicStyles.subtitle]}>
            You bought this {formatDateTime(impulse.executedAt || impulse.createdAt)}. Was it worth it?
          </Text>
        </View>

          <Card variant="elevated" style={styles.impulseCard}>
            <Text style={[styles.impulseTitle, { color: colors.text }]}>{impulse.title}</Text>
            {impulse.photoUri && (
              <TouchableOpacity
                onPress={() => setShowPhotoViewer(true)}
                style={[styles.photoContainer, { borderColor: colors.border }]}
              >
                <Image
                  source={{ uri: impulse.photoUri }}
                  style={styles.photo}
                  resizeMode="cover"
                />
              </TouchableOpacity>
            )}
            {impulse.price && (
              <Text style={[styles.impulsePrice, { color: colors.primary[600] }]}>{formatCurrency(impulse.price)}</Text>
            )}
          </Card>

          {impulse.photoUri && (
            <PhotoViewer
              uri={impulse.photoUri}
              visible={showPhotoViewer}
              onClose={() => setShowPhotoViewer(false)}
            />
          )}

          <View style={styles.buttons}>
            <RegretRatingSelector
              onRatingSelect={setSelectedRegretRating}
              selectedRating={selectedRegretRating}
            />

            <Button
              title="Save Rating"
              onPress={async () => {
                if (!selectedRegretRating) {
                  showError('Please select a regret rating');
                  return;
                }
                setLoading(true);
                try {
                  // Map rating to feeling for backward compatibility
                  let feeling: FinalFeeling;
                  if (selectedRegretRating <= 2) {
                    feeling = 'WORTH_IT';
                  } else if (selectedRegretRating >= 4) {
                    feeling = 'REGRET';
                  } else {
                    feeling = 'NEUTRAL';
                  }
                  
                  await markRegret(impulse.id, feeling, selectedRegretRating);
                  showSuccess('Thanks for the feedback!');
                  router.back();
                } catch (error) {
                  console.error('Error marking regret:', error);
                  showError('Failed to save feedback. Please try again.');
                } finally {
                  setLoading(false);
                }
              }}
              variant="primary"
              size="lg"
              fullWidth
              loading={loading}
              style={styles.button}
              disabled={!selectedRegretRating}
            />
            <Button
              title={skipForNowVisible ? 'Skip for now — Save' : 'Skip for now'}
              onPress={async () => {
                if (!skipForNowVisible) {
                  setSkipForNowVisible(true);
                  return;
                }
                setLoading(true);
                try {
                  await updateImpulse(impulse.id, {
                    regretSkipReason: skipForNowReason || undefined,
                    regretPromptDismissedAt: Date.now(),
                  });
                  showSuccess('No problem — we’ll remind you later.');
                  router.back();
                } catch (e) {
                  showError('Couldn’t skip right now. Please try again.');
                } finally {
                  setLoading(false);
                }
              }}
              variant="outline"
              size="md"
              fullWidth
            />
            {skipForNowVisible && (
              <Input
                placeholder="Reason (optional)"
                value={skipForNowReason}
                onChangeText={setSkipForNowReason}
                style={styles.reasonInput}
              />
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Normal review flow
  return (
    <SafeAreaView style={[styles.container, dynamicStyles.container]} edges={['top', 'bottom']}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.title, dynamicStyles.title]}>Time to Review</Text>
          <Text style={[styles.subtitle, dynamicStyles.subtitle]}>
            You logged this {formatDateTime(impulse.createdAt)}. Still want it?
          </Text>
        </View>

        <Card variant="elevated" style={styles.impulseCard}>
          <View style={styles.categoryRow}>
            <CategoryIcon category={impulse.category} size={24} />
            <Text style={[styles.categoryLabel, { color: colors.textLight }]}>{CATEGORY_LABELS[impulse.category]}</Text>
          </View>
          <Text style={[styles.impulseTitle, { color: colors.text }]}>{impulse.title}</Text>
          
          {/* Photo Display */}
          {impulse.photoUri && (
            <TouchableOpacity
              onPress={() => setShowPhotoViewer(true)}
              style={[styles.photoContainer, { borderColor: colors.border }]}
            >
              <Image
                source={{ uri: impulse.photoUri }}
                style={styles.photo}
                resizeMode="cover"
              />
              <View style={[styles.photoOverlay, { backgroundColor: 'rgba(0,0,0,0.1)' }]}>
                <Text style={[styles.photoHint, { color: colors.textDark }]}>Tap to view full size</Text>
              </View>
            </TouchableOpacity>
          )}
          {impulse.price && (
            <>
            <Text style={[styles.impulsePrice, { color: colors.primary[600] }]}>{formatCurrency(impulse.price)}</Text>
              {/* Show fun equivalents */}
              {(() => {
                const equivalents = getFunEquivalents(impulse.price);
                if (equivalents.length > 0) {
                  return (
                    <View style={[styles.equivalentsContainer, { backgroundColor: colors.primary[50] }]}>
                      <Text style={[styles.equivalentsTitle, { color: colors.primary[700] }]}>
                        If you skip this, you keep {formatCurrency(impulse.price)}
                      </Text>
                      <View style={styles.equivalentsList}>
                        {equivalents.slice(0, 2).map((eq, idx) => (
                          <Text key={idx} style={[styles.equivalentItem, { color: colors.primary[700] }]}>
                            {formatFunEquivalent(eq)}
                          </Text>
                        ))}
                      </View>
                    </View>
                  );
                }
                return null;
              })()}
            </>
          )}
        </Card>

        {/* Photo Viewer Modal */}
        {impulse.photoUri && (
          <PhotoViewer
            uri={impulse.photoUri}
            visible={showPhotoViewer}
            onClose={() => setShowPhotoViewer(false)}
          />
        )}

        {/* Show past regrets warning */}
        {pastRegrets.length > 0 && (
          <Card variant="outlined" style={styles.warningCard}>
            <Text style={styles.warningTitle}>⚠️ Past Regrets</Text>
            <Text style={styles.warningText}>
              You've regretted {pastRegrets.length} similar {CATEGORY_LABELS[impulse.category].toLowerCase()} purchase{pastRegrets.length > 1 ? 's' : ''} before. Think carefully!
            </Text>
          </Card>
        )}

        {/* Check if cool-down has ended */}
        {impulse && !isTimePast(impulse.reviewAt) && (
          <Card variant="outlined" style={styles.lockedCard}>
            <Text style={styles.lockedText}>
              🔒 This impulse is still locked. Please wait until the cool-down ends.
            </Text>
          </Card>
        )}

        {!showFeeling && !showReason ? (
          <View style={styles.buttons}>
            <Button
              title="Skip this purchase"
              onPress={() => {
                if (isStrictMode) {
                  setShowReason(true);
                } else {
                  setShowFeeling(true);
                }
              }}
              variant="primary"
              size="lg"
              fullWidth
              style={styles.button}
              disabled={impulse && !isTimePast(impulse.reviewAt)}
            />
            <Button
              title="Still buying"
              onPress={() => {
                if (isStrictMode && impulse && !isTimePast(impulse.reviewAt)) {
                  setShowExecuteReason(true);
                } else {
                  handleExecute();
                }
              }}
              variant="outline"
              size="lg"
              fullWidth
              loading={loading}
              style={styles.button}
              disabled={!isStrictMode && impulse && !isTimePast(impulse.reviewAt)}
            />
          </View>
        ) : showReason ? (
          <View style={styles.buttons}>
            <Text style={styles.reasonQuestion}>
              {isStrictMode ? 'Strict Mode Active' : ''}
            </Text>
            <Text style={styles.reasonHint}>
              Why do you want to skip this? (Required in strict mode)
            </Text>
            <Input
              placeholder="e.g., I already have something similar, I don't need it anymore..."
              value={skipReason}
              onChangeText={setSkipReason}
              multiline
              numberOfLines={3}
              style={styles.reasonInput}
            />
            <Button
              title="Continue"
              onPress={() => {
                if (skipReason.trim()) {
                  setShowReason(false);
                  setShowFeeling(true);
                }
              }}
              variant="primary"
              size="lg"
              fullWidth
              disabled={!skipReason.trim()}
              style={styles.button}
            />
            <Button
              title="Cancel"
              onPress={() => {
                setShowReason(false);
                setSkipReason('');
              }}
              variant="ghost"
              size="md"
              fullWidth
            />
          </View>
        ) : showExecuteReason ? (
          <View style={styles.buttons}>
            <Text style={styles.reasonQuestion}>
              {isStrictMode ? 'Strict Mode: Bypass Cool-down' : ''}
            </Text>
            <Text style={styles.reasonHint}>
              Share your reason to buy before the timer ends. Reflect on past regrets below.
            </Text>
            {pastRegrets.length > 0 && (
              <Card variant="outlined" style={styles.warningCard}>
                <Text style={styles.warningTitle}>⚠️ Past Regrets</Text>
                <Text style={styles.warningText}>
                  You've regretted {pastRegrets.length} similar {CATEGORY_LABELS[impulse.category].toLowerCase()} purchase{pastRegrets.length > 1 ? 's' : ''} before.
                </Text>
              </Card>
            )}
            <Input
              placeholder="e.g., Urgent need, discount ends, must-have for work..."
              value={executeReason}
              onChangeText={setExecuteReason}
              multiline
              numberOfLines={3}
              style={styles.reasonInput}
            />
            <Button
              title="Proceed to buy"
              onPress={() => {
                if (executeReason.trim()) {
                  setShowExecuteReason(false);
                  handleExecute();
                }
              }}
              variant="outline"
              size="lg"
              fullWidth
              disabled={!executeReason.trim()}
              style={styles.button}
            />
            <Button
              title="Cancel"
              onPress={() => {
                setShowExecuteReason(false);
                setExecuteReason('');
              }}
              variant="ghost"
              size="md"
              fullWidth
            />
          </View>
        ) : (
          <View style={styles.buttons}>
            <Text style={styles.feelingQuestion}>How do you feel about skipping this?</Text>
            <Button
              title="😌 Relieved"
              onPress={() => handleSkip('RELIEVED')}
              variant="primary"
              size="lg"
              fullWidth
              loading={loading}
              style={styles.button}
            />
            <Button
              title="😐 Neutral"
              onPress={() => handleSkip('NEUTRAL')}
              variant="outline"
              size="lg"
              fullWidth
              loading={loading}
              style={styles.button}
            />
            <Button
              title="😩 Still craving it"
              onPress={() => handleSkip('STILL_CRAVING')}
              variant="ghost"
              size="lg"
              fullWidth
              loading={loading}
              style={styles.button}
            />
          </View>
        )}
      </ScrollView>

      {/* Skip Celebration Modal */}
      <SkipCelebration
        visible={showCelebration}
        amount={savedAmount}
        onClose={handleCelebrationClose}
      />
    </SafeAreaView>
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
  },
  title: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.fontSize.base,
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.base,
  },
  impulseCard: {
    marginBottom: spacing.xl,
    padding: spacing.lg,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    gap: spacing.xs,
  },
  categoryLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
  impulseTitle: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing.sm,
  },
  impulsePrice: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
  },
  photoContainer: {
    width: '100%',
    height: 250,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    marginBottom: spacing.base,
    marginTop: spacing.base,
    borderWidth: 1,
    position: 'relative',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  photoOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.sm,
    alignItems: 'flex-end',
  },
  photoHint: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
  },
  buttons: {
    gap: spacing.base,
  },
  button: {
    marginBottom: spacing.sm,
  },
  feelingQuestion: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    textAlign: 'center',
    marginBottom: spacing.base,
  },
  error: {
    fontSize: typography.fontSize.base,
    textAlign: 'center',
    margin: spacing.xl,
  },
  warningCard: {
    marginBottom: spacing.base,
  },
  warningTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing.xs,
  },
  warningText: {
    fontSize: typography.fontSize.sm,
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.sm,
  },
  lockedCard: {
    marginBottom: spacing.base,
  },
  lockedText: {
    fontSize: typography.fontSize.sm,
    textAlign: 'center',
  },
  reasonQuestion: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  reasonHint: {
    fontSize: typography.fontSize.sm,
    marginBottom: spacing.base,
    textAlign: 'center',
  },
  reasonInput: {
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: spacing.base,
  },
  equivalentsContainer: {
    marginTop: spacing.base,
    padding: spacing.base,
    borderRadius: borderRadius.md,
  },
  equivalentsTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  equivalentsList: {
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  equivalentItem: {
    fontSize: typography.fontSize.sm,
    textAlign: 'center',
  },
});

