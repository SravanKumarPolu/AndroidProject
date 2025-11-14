import { useEffect } from 'react';
import { Stack, useRouter, usePathname } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Linking from 'expo-linking';
import { checkAndSendContextualPrompt } from '@/services/smartPrompts';
import { useImpulses } from '@/hooks/useImpulses';
import { ToastProvider, useToast } from '@/contexts/ToastContext';
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';
import { CurrencyProvider } from '@/contexts/CurrencyContext';
import { Toast } from '@/components/ui/Toast';
import { ErrorBoundary } from '@/components/ErrorBoundary';

function RootLayoutContent() {
  const router = useRouter();
  const pathname = usePathname();
  const { impulses } = useImpulses();
  const { toast, hideToast } = useToast();
  const { colors, theme } = useTheme();

  // Handle notification taps
  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data;
      
      if (data?.impulseId) {
        if (data.type === 'review' || data.type === 'regret_check') {
          // Navigate to review screen when notification is tapped
          router.push(`/review-impulse/${data.impulseId}`);
        }
      } else if (data?.type === 'smart_prompt') {
        // Navigate to home when smart prompt is tapped
        router.push('/(tabs)');
      }
    });

    return () => subscription.remove();
  }, [router]);

  // Handle deep links (Android shortcuts)
  useEffect(() => {
    const handleDeepLink = (url: string) => {
      try {
        const { path, queryParams } = Linking.parse(url);
        console.log('Deep link received:', { url, path, queryParams });
        
        if (path === 'quick-add' || path === '/quick-add') {
          router.push('/quick-add');
        } else if (path?.startsWith('review-impulse/')) {
          // Handle review deep links (from notifications)
          const impulseId = path.split('/').pop();
          if (impulseId) {
            router.push(`/review-impulse/${impulseId}`);
          }
        } else {
          // Default to home
          router.push('/(tabs)');
        }
      } catch (error) {
        console.error('Error handling deep link:', error);
      }
    };

    // Handle initial URL (app opened via shortcut)
    Linking.getInitialURL()
      .then(url => {
        if (url) {
          console.log('Initial URL:', url);
          handleDeepLink(url);
        }
      })
      .catch(err => console.error('Error getting initial URL:', err));

    // Handle subsequent URLs (when app is already running)
    const subscription = Linking.addEventListener('url', ({ url }) => {
      console.log('URL event received:', url);
      handleDeepLink(url);
    });

    return () => subscription.remove();
  }, [router]);

  // Send smart prompts when app opens
  useEffect(() => {
    if (pathname === '/(tabs)' && impulses.length >= 5) {
      // Small delay to ensure app is ready
      setTimeout(() => {
        checkAndSendContextualPrompt(impulses);
      }, 2000);
    }
  }, [pathname, impulses.length]);

  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: colors.background },
            }}
          >
            <Stack.Screen name="index" />
            <Stack.Screen name="onboarding" options={{ presentation: 'fullScreenModal' }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="new-impulse" options={{ presentation: 'modal' }} />
            <Stack.Screen name="quick-add" options={{ presentation: 'modal' }} />
            <Stack.Screen name="review-impulse/[id]" />
            <Stack.Screen name="goals" options={{ presentation: 'card' }} />
            <Stack.Screen name="achievements" options={{ presentation: 'card' }} />
            <Stack.Screen name="patterns" options={{ presentation: 'card' }} />
          </Stack>
          <Toast
            message={toast.message}
            type={toast.type}
            visible={toast.visible}
            onHide={hideToast}
          />
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <CurrencyProvider>
        <ToastProvider>
          <RootLayoutContent />
        </ToastProvider>
      </CurrencyProvider>
    </ThemeProvider>
  );
}

