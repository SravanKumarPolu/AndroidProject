import { useState, useEffect, useCallback } from 'react';
import { premium, PremiumStatus } from '@/services/premium';

/**
 * Hook for premium status
 */
export function usePremium() {
  const [isPremium, setIsPremium] = useState(false);
  const [premiumStatus, setPremiumStatus] = useState<PremiumStatus>({
    isPremium: false,
    isLifetime: false,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPremiumStatus();
  }, []);

  const loadPremiumStatus = useCallback(async () => {
    try {
      setLoading(true);
      const status = await premium.getPremiumStatus();
      const isPremiumUser = await premium.isPremium();
      
      setPremiumStatus(status);
      setIsPremium(isPremiumUser);
    } catch (error) {
      console.error('Error loading premium status:', error);
      setIsPremium(false);
    } finally {
      setLoading(false);
    }
  }, []);

  const canUseFeature = useCallback(async (feature: string) => {
    return await premium.canUseFeature(feature as any);
  }, []);

  return {
    isPremium,
    premiumStatus,
    loading,
    refresh: loadPremiumStatus,
    canUseFeature,
  };
}

