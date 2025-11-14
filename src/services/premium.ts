import AsyncStorage from '@react-native-async-storage/async-storage';

const PREMIUM_KEY = '@impulsevault:premium';
const PREMIUM_EXPIRY_KEY = '@impulsevault:premiumExpiry';

export type PremiumStatus = {
  isPremium: boolean;
  expiryDate?: number;
  isLifetime: boolean;
};

/**
 * Premium Service
 * Manages premium subscription status
 * 
 * Note: For production, integrate with:
 * - RevenueCat (recommended)
 * - react-native-purchases
 * - Or your own payment system
 */

export const premium = {
  /**
   * Check if user has premium
   */
  async isPremium(): Promise<boolean> {
    try {
      const status = await this.getPremiumStatus();
      if (!status.isPremium) return false;

      // Check if expired (for subscriptions)
      if (!status.isLifetime && status.expiryDate) {
        if (Date.now() > status.expiryDate) {
          // Expired, remove premium
          await this.removePremium();
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error('Error checking premium status:', error);
      return false;
    }
  },

  /**
   * Get premium status
   */
  async getPremiumStatus(): Promise<PremiumStatus> {
    try {
      const data = await AsyncStorage.getItem(PREMIUM_KEY);
      const expiryData = await AsyncStorage.getItem(PREMIUM_EXPIRY_KEY);
      
      if (!data) {
        return { isPremium: false, isLifetime: false };
      }

      const isPremium = data === 'true';
      const expiryDate = expiryData ? parseInt(expiryData, 10) : undefined;
      const isLifetime = !expiryDate;

      return {
        isPremium,
        expiryDate,
        isLifetime,
      };
    } catch (error) {
      console.error('Error getting premium status:', error);
      return { isPremium: false, isLifetime: false };
    }
  },

  /**
   * Grant premium (for testing or after purchase)
   */
  async grantPremium(isLifetime: boolean = false, expiryDate?: number): Promise<void> {
    try {
      await AsyncStorage.setItem(PREMIUM_KEY, 'true');
      if (!isLifetime && expiryDate) {
        await AsyncStorage.setItem(PREMIUM_EXPIRY_KEY, expiryDate.toString());
      } else {
        await AsyncStorage.removeItem(PREMIUM_EXPIRY_KEY);
      }
    } catch (error) {
      console.error('Error granting premium:', error);
      throw error;
    }
  },

  /**
   * Remove premium
   */
  async removePremium(): Promise<void> {
    try {
      await AsyncStorage.removeItem(PREMIUM_KEY);
      await AsyncStorage.removeItem(PREMIUM_EXPIRY_KEY);
    } catch (error) {
      console.error('Error removing premium:', error);
    }
  },

  /**
   * Check if feature is available (premium or free)
   */
  async canUseFeature(feature: PremiumFeature): Promise<boolean> {
    const freeFeatures: PremiumFeature[] = [
      'BASIC_TRACKING',
      'ONE_GOAL',
      'BASIC_ANALYTICS',
      'LOCAL_STORAGE',
    ];

    if (freeFeatures.includes(feature)) {
      return true;
    }

    return await this.isPremium();
  },
};

export type PremiumFeature =
  | 'BASIC_TRACKING'
  | 'ONE_GOAL'
  | 'BASIC_ANALYTICS'
  | 'LOCAL_STORAGE'
  | 'UNLIMITED_GOALS'
  | 'ADVANCED_ANALYTICS'
  | 'CLOUD_SYNC'
  | 'PDF_REPORTS'
  | 'CUSTOM_THEMES'
  | 'PRIORITY_SUPPORT'
  | 'AD_FREE';

/**
 * Premium feature limits
 */
export const PREMIUM_LIMITS = {
  FREE_MAX_GOALS: 1,
  PREMIUM_MAX_GOALS: Infinity,
} as const;

