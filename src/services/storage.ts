import AsyncStorage from '@react-native-async-storage/async-storage';
import { Impulse } from '@/types/impulse';
import { logger } from '@/utils/logger';

const IMPULSES_KEY = '@impulsevault:impulses';
const SETTINGS_KEY = '@impulsevault:settings';

/**
 * Storage service
 * Clean, type-safe local storage wrapper
 */

export const storage = {
  // Impulses
  async getImpulses(): Promise<Impulse[]> {
    try {
      const data = await AsyncStorage.getItem(IMPULSES_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      logger.error('Error getting impulses', error instanceof Error ? error : new Error(String(error)));
      return [];
    }
  },

  async saveImpulses(impulses: Impulse[]): Promise<void> {
    try {
      await AsyncStorage.setItem(IMPULSES_KEY, JSON.stringify(impulses));
    } catch (error) {
      logger.error('Error saving impulses', error instanceof Error ? error : new Error(String(error)));
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

