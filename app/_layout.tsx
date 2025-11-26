import { useEffect } from 'react';
import { Platform } from 'react-native';
import { Stack, useRouter, usePathname } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View } from 'react-native';
import * as Linking from 'expo-linking';
import { checkAndSendContextualPrompt } from '@/services/smartPrompts';
import { useImpulses } from '@/hooks/useImpulses';
import { ToastProvider, useToast } from '@/contexts/ToastContext';
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';
import { CurrencyProvider } from '@/contexts/CurrencyContext';
import { Toast } from '@/components/ui/Toast';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { logger } from '@/utils/logger';
import { validateAndLogEnv } from '@/utils/env';
import { initializeApp } from '@/services/initialization';

// Conditionally import expo-notifications only on native platforms
let Notifications: typeof import('expo-notifications') | null = null;
if (Platform.OS !== 'web') {
  try {
    Notifications = require('expo-notifications');
  } catch (error) {
    console.warn('expo-notifications not available:', error);
  }
}

// Validate environment variables at startup
validateAndLogEnv();

// Initialize app services
initializeApp().catch(err => {
  logger.error('Failed to initialize app services', err instanceof Error ? err : new Error(String(err)));
});

// Initialize Sentry if available
let Sentry: any = null;
try {
  Sentry = require('sentry-expo');
  if (Sentry && !__DEV__) {
    // Sentry will be initialized via app.json or expo config
    // This is just a fallback initialization
  }
} catch {
  // Sentry not installed, will gracefully degrade
  logger.debug('Sentry not available - error reporting will use logger only');
}

function RootLayoutContent() {
  const router = useRouter();
  const pathname = usePathname();
  const { impulses } = useImpulses();
  const { toast, hideToast } = useToast();
  const { colors, theme } = useTheme();

  // Handle notification taps
  useEffect(() => {
    if (Platform.OS === 'web' || !Notifications) {
      // On web, handle browser notifications differently if needed
      return;
    }

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
      } else if (data?.type === 'quick_add') {
        // One-tap quick add from notification
        router.push('/quick-add');
      }
    });

    return () => subscription.remove();
  }, [router]);

  // Handle deep links (Android shortcuts)
  useEffect(() => {
    const handleDeepLink = (url: string) => {
      try {
        const { path, queryParams } = Linking.parse(url);
        logger.debug('Deep link received:', { url, path, queryParams });
        
        if (path === 'quick-add' || path === '/quick-add') {
          // Forward query params to quick-add so fields can be prefilled
          router.push({ pathname: '/quick-add', params: queryParams || {} });
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
        logger.error('Error handling deep link', error instanceof Error ? error : new Error(String(error)));
      }
    };

    // Handle initial URL (app opened via shortcut)
    Linking.getInitialURL()
      .then(url => {
        if (url) {
          logger.debug('Initial URL:', url);
          handleDeepLink(url);
        }
      })
      .catch(err => logger.error('Error getting initial URL', err instanceof Error ? err : new Error(String(err))));

    // Handle subsequent URLs (when app is already running)
    const subscription = Linking.addEventListener('url', ({ url }) => {
      logger.debug('URL event received:', url);
      handleDeepLink(url);
    });

    return () => subscription.remove();
  }, [router]);

  // Inject favicon for web (fixes purple square issue in development)
  useEffect(() => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      // Remove existing favicon links
      const existingLinks = document.querySelectorAll('link[rel*="icon"]');
      existingLinks.forEach(link => link.remove());

      // Get the correct asset path
      // In Expo web, assets are served from the root or /assets/
      const getFaviconPath = () => {
        // Try to get from window location
        const baseUrl = window.location.origin;
        // Expo serves assets from root in dev mode
        return `${baseUrl}/assets/icon.png`;
      };

      // Add new favicon link
      const link = document.createElement('link');
      link.id = 'app-favicon';
      link.rel = 'icon';
      link.type = 'image/png';
      link.href = getFaviconPath();
      document.head.appendChild(link);

      // Also add as shortcut icon (for older browsers)
      const shortcutLink = document.createElement('link');
      shortcutLink.id = 'app-favicon-shortcut';
      shortcutLink.rel = 'shortcut icon';
      shortcutLink.type = 'image/png';
      shortcutLink.href = getFaviconPath();
      document.head.appendChild(shortcutLink);
    }
  }, []);

  // Send smart prompts when app opens and schedule daily prompts
  useEffect(() => {
    if (pathname === '/(tabs)' && impulses.length >= 5) {
      // Small delay to ensure app is ready
      setTimeout(async () => {
        const { checkAndSendContextualPrompt, scheduleDailySmartPrompts } = await import('@/services/smartPrompts');
        await checkAndSendContextualPrompt(impulses);
        await scheduleDailySmartPrompts(impulses);
      }, 2000);
    }
  }, [pathname, impulses.length]);

  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <StatusBar style={theme === 'dark' || theme === 'terminal' ? 'light' : 'dark'} />
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
            <Stack.Screen name="weekly-reports" options={{ presentation: 'card' }} />
            <Stack.Screen name="monthly-reports" options={{ presentation: 'card' }} />
            <Stack.Screen name="daily-summary" options={{ presentation: 'card' }} />
            <Stack.Screen name="regret-tracker" options={{ presentation: 'card' }} />
            <Stack.Screen name="budget" options={{ presentation: 'card' }} />
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

