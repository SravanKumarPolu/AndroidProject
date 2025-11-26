/**
 * App Initialization Service
 * Initializes all services at app startup
 */

import { analytics } from './analytics';
import { i18n } from '@/i18n';
import { performanceMonitor } from '@/utils/performance';
import { logger } from '@/utils/logger';
import { Platform } from 'react-native';

/**
 * Get device locale (fallback if expo-localization not available)
 */
function getDeviceLocale(): string {
  try {
    // Try to use expo-localization if available
    const Localization = require('expo-localization');
    return Localization.getLocales()[0]?.languageCode || 'en';
  } catch {
    // Fallback to browser/system locale
    if (Platform.OS === 'web' && typeof navigator !== 'undefined') {
      return navigator.language.split('-')[0] || 'en';
    }
    // Default to English
    return 'en';
  }
}

/**
 * Initialize all app services
 */
export async function initializeApp(): Promise<void> {
  try {
    // Initialize performance monitoring
    performanceMonitor.setEnabled(true);
    performanceMonitor.start('app_initialization');
    
    // Initialize analytics
    await analytics.initialize();
    analytics.track('app_started', {
      platform: Platform.OS,
      version: require('../../app.json').expo.version,
    });
    
    // Initialize i18n with device locale
    const deviceLocale = getDeviceLocale();
    const supportedLocales: ('en' | 'es' | 'fr' | 'de' | 'hi' | 'ja')[] = ['en', 'es', 'fr', 'de', 'hi', 'ja'];
    const locale = supportedLocales.includes(deviceLocale as any) ? deviceLocale as any : 'en';
    i18n.setLocale(locale);
    
    // Track memory usage
    performanceMonitor.trackMemory();
    
    // End initialization tracking
    const initTime = performanceMonitor.end('app_initialization');
    
    if (initTime && initTime > 1000) {
      logger.warn(`Slow app initialization: ${initTime.toFixed(2)}ms`);
    }
    
    logger.debug('App services initialized', {
      locale,
      analyticsEnabled: true,
      performanceEnabled: true,
    });
  } catch (error) {
    logger.error('Error initializing app services', error instanceof Error ? error : new Error(String(error)));
    // Don't throw - allow app to continue even if initialization fails
  }
}

/**
 * Cleanup on app shutdown
 */
export function cleanupApp(): void {
  try {
    performanceMonitor.clear();
    logger.debug('App services cleaned up');
  } catch (error) {
    logger.error('Error cleaning up app services', error instanceof Error ? error : new Error(String(error)));
  }
}

