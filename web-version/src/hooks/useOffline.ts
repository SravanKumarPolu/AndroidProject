import { useEffect, useState } from 'react';
import { showToast, hideToast } from '@/components/ui/Toast';

let offlineToastId: string | null = null;

export function useOffline() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (offlineToastId) {
        hideToast(offlineToastId);
        offlineToastId = null;
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      if (!offlineToastId) {
        offlineToastId = showToast(
          'Offline – your data is safe locally.',
          'offline',
          0 // Don't auto-dismiss
        );
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check initial state
    if (!navigator.onLine) {
      handleOffline();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}

