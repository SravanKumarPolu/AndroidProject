/**
 * App configuration constants
 * 
 * 🎨 BRANDING CUSTOMIZATION:
 * Update these values to customize your app branding.
 * See BRANDING_GUIDE.md for detailed instructions.
 * 
 * You can use environment variables for sensitive data:
 * - Create .env file with EXPO_PUBLIC_* variables
 * - Values will be replaced at build time
 */

export const appConfig = {
  // ============================================
  // APP IDENTITY (Update these for your brand)
  // ============================================
  
  /** Full app name (shown in app stores, max 30 chars) */
  name: process.env.EXPO_PUBLIC_APP_NAME || 'ImpulseVault – Stop Regret Buys',
  
  /** Short display name (shown in UI, app drawer) */
  displayName: process.env.EXPO_PUBLIC_DISPLAY_NAME || 'ImpulseVault',
  
  /** App version (follow semantic versioning: MAJOR.MINOR.PATCH) */
  version: '1.0.0',
  
  /** Android package name (e.g., com.yourcompany.yourapp)
   * ⚠️ WARNING: Cannot be changed after publishing! */
  packageName: process.env.EXPO_PUBLIC_PACKAGE_NAME || 'com.impulsevault.app',
  
  // ============================================
  // APP STORE LISTINGS
  // ============================================
  
  /** Short description (shown in app stores, ~80 chars) */
  shortDescription: process.env.EXPO_PUBLIC_SHORT_DESCRIPTION || 'Catch your impulses before you buy. Save money, skip regret.',
  
  /** Long description (for app store listings) */
  longDescription: process.env.EXPO_PUBLIC_LONG_DESCRIPTION || 
    'ImpulseVault helps you avoid impulsive purchases by enforcing a cool-down period. ' +
    'Log impulses before buying, wait for the timer, then decide. Track your regrets and save money.',
  
  // ============================================
  // LEGAL & SUPPORT
  // ============================================
  
  /** Privacy Policy URL (required for app stores)
   * Host your privacy policy and update this URL */
  privacyPolicyUrl: process.env.EXPO_PUBLIC_PRIVACY_POLICY_URL || 'https://yourdomain.com/privacy-policy.html',
  
  /** Terms of Service URL (optional) */
  termsOfServiceUrl: process.env.EXPO_PUBLIC_TERMS_URL || 'https://yourdomain.com/terms.html',
  
  /** Support email address */
  supportEmail: process.env.EXPO_PUBLIC_SUPPORT_EMAIL || 'support@impulsevault.com',
  
  /** Company/Developer website */
  website: process.env.EXPO_PUBLIC_WEBSITE_URL || 'https://impulsevault.com',
  
  // ============================================
  // APP STORE URLs (Update after publishing)
  // ============================================
  
  /** Google Play Store URL (update after publishing) */
  playStoreUrl: process.env.EXPO_PUBLIC_PLAY_STORE_URL || 
    'https://play.google.com/store/apps/details?id=com.impulsevault.app',
  
  /** Apple App Store URL (update after publishing) */
  appStoreUrl: process.env.EXPO_PUBLIC_APP_STORE_URL || 
    'https://apps.apple.com/app/impulsevault',
  
  // ============================================
  // BRANDING METADATA
  // ============================================
  
  /** App category (for app stores) */
  category: 'Finance' as const,
  
  /** Keywords for app store optimization (comma-separated) */
  keywords: 'impulse, spending, budget, savings, finance, money, regret, purchase',
  
  /** Developer/Company name */
  developerName: process.env.EXPO_PUBLIC_DEVELOPER_NAME || 'ImpulseVault Team',
} as const;

