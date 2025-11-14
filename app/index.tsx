import { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Redirect } from 'expo-router';
import { colors } from '@/constants/colors';
import { onboarding } from '@/utils/onboarding';

export default function Index() {
  const [isOnboardingComplete, setIsOnboardingComplete] = useState<boolean | null>(null);

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    try {
      const completed = await onboarding.isComplete();
      setIsOnboardingComplete(completed);
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      // On error, show onboarding to be safe (better UX than skipping)
      setIsOnboardingComplete(false);
    }
  };

  if (isOnboardingComplete === null) {
    // Show loading while checking
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary[600]} />
      </View>
    );
  }

  if (!isOnboardingComplete) {
    return <Redirect href="/onboarding" />;
  }

  return <Redirect href="/(tabs)" />;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
});

