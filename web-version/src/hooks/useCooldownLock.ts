import { useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { KeepAwake } from '@capacitor-community/keep-awake';

/**
 * Hook to lock screen during cooldown period (Android only)
 * Shows a "WAIT" timer that prevents screen from sleeping
 */
export function useCooldownLock(isActive: boolean, endTime: number) {
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isLocked, setIsLocked] = useState(false);

  useEffect(() => {
    if (!isActive) {
      setIsLocked(false);
      if (Capacitor.isNativePlatform()) {
        try {
          KeepAwake.allowSleep();
        } catch (error) {
          console.warn('KeepAwake not available:', error);
        }
      }
      return;
    }

    // Only lock on Android
    if (Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android') {
      try {
        setIsLocked(true);
        KeepAwake.keepAwake();
      } catch (error) {
        console.warn('KeepAwake not available:', error);
        setIsLocked(false);
      }
    }

    // Update timer
    const updateTimer = () => {
      const now = Date.now();
      const remaining = Math.max(0, endTime - now);
      setTimeRemaining(remaining);

      if (remaining === 0) {
        setIsLocked(false);
        if (Capacitor.isNativePlatform()) {
          try {
            KeepAwake.allowSleep();
          } catch (error) {
            console.warn('KeepAwake not available:', error);
          }
        }
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => {
      clearInterval(interval);
      if (Capacitor.isNativePlatform()) {
        try {
          KeepAwake.allowSleep();
        } catch (error) {
          console.warn('KeepAwake not available:', error);
        }
      }
    };
  }, [isActive, endTime]);

  const formatTime = (ms: number): string => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    }
    if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    }
    return `${seconds}s`;
  };

  return {
    isLocked,
    timeRemaining,
    formattedTime: formatTime(timeRemaining),
  };
}

