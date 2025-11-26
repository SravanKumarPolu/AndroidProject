import { useEffect } from 'react';
import { useImpulseStore } from '@/store/impulseStore';

export function useTheme() {
  const { settings, updateSettings } = useImpulseStore();

  useEffect(() => {
    const root = document.documentElement;
    if (settings.theme === 'dark') {
      root.setAttribute('data-theme', 'dark');
    } else {
      root.setAttribute('data-theme', 'light');
    }
  }, [settings.theme]);

  const toggleTheme = () => {
    updateSettings({ 
      theme: settings.theme === 'dark' ? 'light' : 'dark' 
    });
  };

  return {
    theme: settings.theme,
    toggleTheme,
  };
}

