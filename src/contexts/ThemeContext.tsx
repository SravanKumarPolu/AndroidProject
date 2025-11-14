import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, darkColors, type ThemeColors } from '@/constants/colors';
import { terminalColors, type TerminalColors } from '@/constants/terminalColors';

export type ThemeMode = 'light' | 'dark' | 'system' | 'terminal';

interface ThemeContextType {
  theme: 'light' | 'dark' | 'terminal';
  themeMode: ThemeMode;
  colors: ThemeColors | TerminalColors;
  setThemeMode: (mode: ThemeMode) => Promise<void>;
}

const THEME_STORAGE_KEY = '@impulsevault:themeMode';

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>('system');
  const [theme, setTheme] = useState<'light' | 'dark' | 'terminal'>(systemColorScheme === 'dark' ? 'dark' : 'light');

  // Load saved theme preference
  useEffect(() => {
    loadThemeMode();
  }, []);

  // Update theme when system preference or theme mode changes
  useEffect(() => {
    if (themeMode === 'system') {
      setTheme(systemColorScheme === 'dark' ? 'dark' : 'light');
    } else if (themeMode === 'terminal') {
      setTheme('terminal');
    } else {
      setTheme(themeMode);
    }
  }, [themeMode, systemColorScheme]);

  const loadThemeMode = useCallback(async () => {
    try {
      const saved = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (saved && (saved === 'light' || saved === 'dark' || saved === 'system' || saved === 'terminal')) {
        setThemeModeState(saved as ThemeMode);
      }
    } catch (error) {
      console.error('Error loading theme mode:', error);
    }
  }, []);

  const setThemeMode = useCallback(async (mode: ThemeMode) => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
      setThemeModeState(mode);
    } catch (error) {
      console.error('Error saving theme mode:', error);
    }
  }, []);

  const themeColors = theme === 'terminal' 
    ? terminalColors 
    : theme === 'dark' 
      ? darkColors 
      : colors;

  return (
    <ThemeContext.Provider
      value={{
        theme,
        themeMode,
        colors: themeColors,
        setThemeMode,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

