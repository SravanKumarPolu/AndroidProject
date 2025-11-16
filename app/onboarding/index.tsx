import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import Animated, { FadeInRight, FadeOutLeft } from 'react-native-reanimated';
import { useTheme } from '@/contexts/ThemeContext';
import { spacing } from '@/constants/spacing';
import { typography } from '@/constants/typography';

const { width } = Dimensions.get('window');

export default function Onboarding() {
  const router = useRouter();
  const { colors } = useTheme();
  const [step, setStep] = useState(0);

  const next = () => setStep(s => Math.min(s + 1, 2));
  const back = () => setStep(s => Math.max(s - 1, 0));

  const requestNotifications = async () => {
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      // proceed regardless; we handle gracefully elsewhere
      next();
    } catch {
      next();
    }
  };

  const finish = () => {
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
      <View style={styles.content}>
        {step === 0 && (
          <Animated.View entering={FadeInRight} exiting={FadeOutLeft} style={styles.slide}>
            <View style={styles.iconWrap}>
              <Ionicons name="lock-closed-outline" size={40} color={colors.primary[600]} />
            </View>
            <Text style={[styles.title, { color: colors.text }]}>Log before buying</Text>
            <Text style={[styles.subtitle, { color: colors.textLight }]}>
              Capture the impulse, cool off for 24 hours, and make a better choice.
            </Text>
            <PrimaryButton text="Next" onPress={next} />
          </Animated.View>
        )}

        {step === 1 && (
          <Animated.View entering={FadeInRight} exiting={FadeOutLeft} style={styles.slide}>
            <View style={styles.iconWrap}>
              <Ionicons name="notifications-outline" size={40} color={colors.primary[600]} />
            </View>
            <Text style={[styles.title, { color: colors.text }]}>Enable reminders</Text>
            <Text style={[styles.subtitle, { color: colors.textLight }]}>
              Get a nudge when it’s time to review, and a quick check afterward.
            </Text>
            <PrimaryButton text="Enable notifications" onPress={requestNotifications} />
            <Pressable onPress={next} style={{ marginTop: spacing.sm }} accessibilityRole="button" accessibilityLabel="Skip notifications">
              <Text style={{ color: colors.textLight, fontSize: typography.fontSize.sm }}>Skip for now</Text>
            </Pressable>
            <SecondaryButton text="Back" onPress={back} />
          </Animated.View>
        )}

        {step === 2 && (
          <Animated.View entering={FadeInRight} exiting={FadeOutLeft} style={styles.slide}>
            <View style={styles.previewCard}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginBottom: spacing.xs }}>
                <Ionicons name="trophy-outline" size={18} color={colors.success[700]} />
                <Text style={{ color: colors.success[700], fontWeight: typography.fontWeight.semibold }}>Value preview</Text>
              </View>
              <Text style={[styles.previewLine, { color: colors.text }]}>• Save money by skipping low-value impulses</Text>
              <Text style={[styles.previewLine, { color: colors.text }]}>• Spot patterns and avoid regret</Text>
              <Text style={[styles.previewLine, { color: colors.text }]}>• Celebrate streaks and progress</Text>
            </View>
            <PrimaryButton text="Get started" onPress={finish} />
            <SecondaryButton text="Back" onPress={back} />
          </Animated.View>
        )}
      </View>
    </SafeAreaView>
  );
}

function PrimaryButton({ text, onPress }: { text: string; onPress: () => void }) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={text}
      style={{
        marginTop: spacing.lg,
        backgroundColor: colors.primary[600],
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.sm,
        borderRadius: spacing.md,
        alignSelf: 'center',
        minWidth: 180,
        alignItems: 'center',
      }}
    >
      <Text style={{ color: colors.textDark, fontWeight: typography.fontWeight.semibold, fontSize: typography.fontSize.base }}>{text}</Text>
    </Pressable>
  );
}

function SecondaryButton({ text, onPress }: { text: string; onPress: () => void }) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={text}
      style={{
        marginTop: spacing.sm,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.sm,
        borderRadius: spacing.md,
        alignSelf: 'center',
        minWidth: 180,
        alignItems: 'center',
        borderColor: colors.border,
        borderWidth: 1,
      }}
    >
      <Text style={{ color: colors.text, fontWeight: typography.fontWeight.medium, fontSize: typography.fontSize.base }}>{text}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slide: {
    width: '100%',
    maxWidth: 520,
    alignItems: 'center',
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.base,
    backgroundColor: 'rgba(125,125,125,0.08)',
  },
  title: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.fontSize.base,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  previewCard: {
    width: '100%',
    maxWidth: 520,
    borderRadius: spacing.lg,
    padding: spacing.lg,
    marginBottom: spacing.base,
    backgroundColor: 'rgba(125,125,125,0.06)',
  },
  previewLine: {
    fontSize: typography.fontSize.base,
    marginTop: spacing.xs,
  },
});


