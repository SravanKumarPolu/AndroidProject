import { useEffect } from 'react';
import { useImpulseStore } from '@/store/impulseStore';

export function useTheme() {
  const { settings, updateSettings } = useImpulseStore();

  useEffect(() => {
    const root = document.documentElement;
    if (settings.theme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
      
      // Listen for system theme changes
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (e: MediaQueryListEvent) => {
        root.setAttribute('data-theme', e.matches ? 'dark' : 'light');
      };
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } else {
      root.setAttribute('data-theme', settings.theme);
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

