/**
 * Platform Utility
 * Provides consistent platform detection and platform-specific helpers
 */

import { Platform } from 'react-native';

/**
 * Platform detection helpers
 */
export const isWeb = Platform.OS === 'web';
export const isIOS = Platform.OS === 'ios';
export const isAndroid = Platform.OS === 'android';
export const isNative = Platform.OS !== 'web';

/**
 * Get current platform name
 */
export function getPlatform(): 'web' | 'ios' | 'android' {
  const platform = Platform.OS;
  // Filter to only supported platforms
  if (platform === 'web' || platform === 'ios' || platform === 'android') {
    return platform;
  }
  // Default to web for unsupported platforms (windows, macos)
  return 'web';
}

/**
 * Check if a feature is available on current platform
 */
export function isFeatureAvailable(feature: 'notifications' | 'camera' | 'location' | 'fileSystem' | 'sharing'): boolean {
  switch (feature) {
    case 'notifications':
      // Web notifications are available but limited
      return true;
    case 'camera':
      // Camera is available on native, limited on web
      return isNative || (isWeb && typeof navigator !== 'undefined' && 'mediaDevices' in navigator);
    case 'location':
      // Location is available on all platforms
      return true;
    case 'fileSystem':
      // File system is available on native, limited on web
      return isNative;
    case 'sharing':
      // Sharing is available on native, limited on web
      return isNative || (isWeb && typeof navigator !== 'undefined' && 'share' in navigator);
    default:
      return false;
  }
}

/**
 * Get platform-specific value
 * Similar to Platform.select but with better TypeScript support
 */
export function platformSelect<T>(values: {
  web?: T;
  ios?: T;
  android?: T;
  default?: T;
}): T | undefined {
  if (isWeb && values.web !== undefined) {
    return values.web;
  }
  if (isIOS && values.ios !== undefined) {
    return values.ios;
  }
  if (isAndroid && values.android !== undefined) {
    return values.android;
  }
  return values.default;
}

/**
 * Execute function only on specific platform
 */
export function onPlatform<T>(
  platform: 'web' | 'ios' | 'android' | 'native',
  fn: () => T,
  fallback?: () => T
): T | undefined {
  const shouldExecute =
    platform === 'web' ? isWeb :
    platform === 'ios' ? isIOS :
    platform === 'android' ? isAndroid :
    platform === 'native' ? isNative :
    false;

  if (shouldExecute) {
    return fn();
  }
  if (fallback) {
    return fallback();
  }
  return undefined;
}

/**
 * Get platform-specific user agent or device info
 */
export function getPlatformInfo(): {
  platform: string;
  version?: string;
  isWeb: boolean;
  isNative: boolean;
} {
  return {
    platform: Platform.OS,
    version: Platform.Version?.toString(),
    isWeb,
    isNative,
  };
}

