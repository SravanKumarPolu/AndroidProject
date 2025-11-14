import AsyncStorage from '@react-native-async-storage/async-storage';
import { CoolDownPeriod } from '@/types/impulse';

const SETTINGS_KEY = '@impulsevault:settings';
const FIRST_USE_KEY = '@impulsevault:firstUse';

export interface AppSettings {
  strictMode: boolean;
  strictModeDays: number; // Days since first use to enforce strict mode
  defaultCoolDownPeriod?: CoolDownPeriod; // User's preferred default cooldown
  firstUseDate?: number;
}

const DEFAULT_SETTINGS: AppSettings = {
  strictMode: true, // Default to strict mode for first 7 days
  strictModeDays: 7,
  defaultCoolDownPeriod: '30M', // Default to 30 minutes (matches new concept)
};

/**
 * Settings service
 * Manages app settings including strict mode
 */
export const settings = {
  async getSettings(): Promise<AppSettings> {
    try {
      const data = await AsyncStorage.getItem(SETTINGS_KEY);
      if (data) {
        return JSON.parse(data);
      }
      
      // Check if first use
      const firstUse = await AsyncStorage.getItem(FIRST_USE_KEY);
      if (!firstUse) {
        // First time - set first use date and enable strict mode
        const now = Date.now();
        await AsyncStorage.setItem(FIRST_USE_KEY, now.toString());
        const settings: AppSettings = {
          ...DEFAULT_SETTINGS,
          firstUseDate: now,
        };
        await this.saveSettings(settings);
        return settings;
      }
      
      // Not first use, check if strict mode should be active
      const firstUseDate = parseInt(firstUse, 10);
      const daysSinceFirstUse = Math.floor((Date.now() - firstUseDate) / (24 * 60 * 60 * 1000));
      const strictMode = daysSinceFirstUse < DEFAULT_SETTINGS.strictModeDays;
      
      const settings: AppSettings = {
        ...DEFAULT_SETTINGS,
        firstUseDate,
        strictMode,
      };
      await this.saveSettings(settings);
      return settings;
    } catch (error) {
      console.error('Error getting settings:', error);
      return DEFAULT_SETTINGS;
    }
  },

  async saveSettings(settings: AppSettings): Promise<void> {
    try {
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving settings:', error);
      throw error;
    }
  },

  async updateStrictMode(enabled: boolean): Promise<void> {
    const current = await this.getSettings();
    await this.saveSettings({
      ...current,
      strictMode: enabled,
    });
  },

  async isStrictModeActive(): Promise<boolean> {
    const settings = await this.getSettings();
    return settings.strictMode;
  },

  async updateDefaultCoolDown(period: CoolDownPeriod): Promise<void> {
    const current = await this.getSettings();
    await this.saveSettings({
      ...current,
      defaultCoolDownPeriod: period,
    });
  },

  async getDefaultCoolDown(): Promise<CoolDownPeriod> {
    const settings = await this.getSettings();
    return settings.defaultCoolDownPeriod || '30M';
  },
};

