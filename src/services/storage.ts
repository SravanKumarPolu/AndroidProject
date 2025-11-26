import AsyncStorage from '@react-native-async-storage/async-storage';
import { Impulse } from '@/types/impulse';
import { logger } from '@/utils/logger';
import { safeStorageOperation, recoverCorruptedData } from '@/utils/errorRecovery';

const IMPULSES_KEY = '@impulsevault:impulses';
const SETTINGS_KEY = '@impulsevault:settings';

/**
 * Storage service
 * Clean, type-safe local storage wrapper
 */

export const storage = {
  // Impulses
  async getImpulses(): Promise<Impulse[]> {
    return recoverCorruptedData<Impulse[]>(
      IMPULSES_KEY,
      [],
      (data): data is Impulse[] => Array.isArray(data)
    ).then(result => {
      if (result.recovered) {
        logger.warn('Recovered corrupted impulses data');
      }
      return result.data || [];
    });
  },

  async saveImpulses(impulses: Impulse[]): Promise<void> {
    try {
      await AsyncStorage.setItem(IMPULSES_KEY, JSON.stringify(impulses));
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      
      // Check if it's a quota error and try recovery
      const isQuotaError = 
        err.message.includes('quota') ||
        err.message.includes('QuotaExceeded') ||
        err.message.includes('NS_ERROR_DOM_QUOTA_REACHED');
      
      if (isQuotaError) {
        logger.warn('Storage quota exceeded, attempting cleanup...');
        try {
          // Clear old backup data
          const keys = await AsyncStorage.getAllKeys();
          const backupKeys = keys.filter(k => k.includes('_corrupted_backup_'));
          if (backupKeys.length > 3) {
            const oldBackups = backupKeys.sort().slice(0, backupKeys.length - 3);
            await AsyncStorage.multiRemove(oldBackups);
          }
          
          // Retry
          await AsyncStorage.setItem(IMPULSES_KEY, JSON.stringify(impulses));
          logger.info('Successfully saved after quota recovery');
          return;
        } catch (retryError) {
          logger.error('Error saving impulses after recovery', retryError instanceof Error ? retryError : new Error(String(retryError)));
          throw retryError;
        }
      }
      
      logger.error('Error saving impulses', err);
      throw error;
    }
  },

  async addImpulse(impulse: Impulse): Promise<void> {
    const impulses = await this.getImpulses();
    impulses.push(impulse);
    await this.saveImpulses(impulses);
  },

  async updateImpulse(id: string, updates: Partial<Impulse>): Promise<void> {
    const impulses = await this.getImpulses();
    const index = impulses.findIndex(i => i.id === id);
    if (index !== -1) {
      impulses[index] = { ...impulses[index], ...updates };
      await this.saveImpulses(impulses);
    }
  },

  async deleteImpulse(id: string): Promise<void> {
    const impulses = await this.getImpulses();
    const filtered = impulses.filter(i => i.id !== id);
    await this.saveImpulses(filtered);
  },

  async clearAll(): Promise<void> {
    try {
      await AsyncStorage.removeItem(IMPULSES_KEY);
    } catch (error) {
      logger.error('Error clearing impulses', error instanceof Error ? error : new Error(String(error)));
    }
  },

  // Settings (for future use)
  async getSettings(): Promise<Record<string, any>> {
    try {
      const data = await AsyncStorage.getItem(SETTINGS_KEY);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      logger.error('Error getting settings', error instanceof Error ? error : new Error(String(error)));
      return {};
    }
  },

  async saveSettings(settings: Record<string, any>): Promise<void> {
    try {
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (error) {
      logger.error('Error saving settings', error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  },
};

