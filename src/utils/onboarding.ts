import AsyncStorage from '@react-native-async-storage/async-storage';

const ONBOARDING_KEY = '@impulsevault:onboarding_complete';

/**
 * Onboarding utility functions
 * Centralized onboarding state management
 */

export const onboarding = {
  /**
   * Check if onboarding has been completed
   */
  async isComplete(): Promise<boolean> {
    try {
      const completed = await AsyncStorage.getItem(ONBOARDING_KEY);
      return completed === 'true';
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      return false; // Default to not complete on error
    }
  },

  /**
   * Mark onboarding as complete
   */
  async markComplete(): Promise<void> {
    try {
      await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
    } catch (error) {
      console.error('Error marking onboarding as complete:', error);
      throw error;
    }
  },

  /**
   * Reset onboarding (useful for testing or re-onboarding)
   */
  async reset(): Promise<void> {
    try {
      await AsyncStorage.removeItem(ONBOARDING_KEY);
    } catch (error) {
      console.error('Error resetting onboarding:', error);
      throw error;
    }
  },
};

