/**
 * App configuration constants
 * Update these values before publishing to Play Store
 */

export const appConfig = {
  // App Information
  name: 'ImpulseVault',
  version: '1.0.0',
  packageName: 'com.impulsevault.app',
  
  // Privacy Policy URL
  // TODO: Replace with your actual hosted privacy policy URL before publishing
  // Options:
  // - GitHub Pages: https://yourusername.github.io/repo/privacy-policy.html
  // - Firebase Hosting: https://yourproject.web.app/privacy-policy.html
  // - Your own domain: https://yourdomain.com/privacy-policy.html
  privacyPolicyUrl: process.env.EXPO_PUBLIC_PRIVACY_POLICY_URL || 'https://yourdomain.com/privacy-policy.html',
  
  // Support/Contact Information
  supportEmail: process.env.EXPO_PUBLIC_SUPPORT_EMAIL || 'support@impulsevault.com',
  website: process.env.EXPO_PUBLIC_WEBSITE_URL || 'https://impulsevault.com',
  
  // Play Store URLs (update after publishing)
  playStoreUrl: process.env.EXPO_PUBLIC_PLAY_STORE_URL || 'https://play.google.com/store/apps/details?id=com.impulsevault.app',
  appStoreUrl: process.env.EXPO_PUBLIC_APP_STORE_URL || 'https://apps.apple.com/app/impulsevault',
} as const;

