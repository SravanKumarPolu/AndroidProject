import { useState, useEffect, useCallback } from 'react';
import { settings, AppSettings } from '@/services/settings';

/**
 * Custom hook for managing app settings
 */
export function useSettings() {
  const [appSettings, setAppSettings] = useState<AppSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = useCallback(async () => {
    try {
      const data = await settings.getSettings();
      setAppSettings(data);
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateStrictMode = useCallback(async (enabled: boolean) => {
    try {
      await settings.updateStrictMode(enabled);
      await loadSettings();
    } catch (error) {
      console.error('Error updating strict mode:', error);
    }
  }, [loadSettings]);

  return {
    settings: appSettings,
    loading,
    isStrictMode: appSettings?.strictMode ?? false,
    updateStrictMode,
    reload: loadSettings,
  };
}

