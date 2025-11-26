import { useState, useEffect, useCallback } from 'react';
import { Impulse, CoolDownPeriod } from '@/types/impulse';
import { storage } from '@/services/storage';
import { scheduleCoolDownNotification, scheduleRegretCheckNotification } from '@/services/notifications';
import { addHours } from '@/utils/date';
import { coolDownPeriodToMs, getDefaultCoolDownSync } from '@/constants/coolDown';
import { settings } from '@/services/settings';
import { autoSync, syncFromCloud } from '@/services/cloudSync';
import { trackPositiveAction } from '@/services/rating';

/**
 * Custom hook for managing impulses
 * Clean, reactive state management
 */

export function useImpulses() {
  const [impulses, setImpulses] = useState<Impulse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Load impulses on mount
  useEffect(() => {
    loadImpulses();
  }, []);

  const loadImpulses = useCallback(async () => {
    try {
      setLoading(true);
      
      // Try to sync from cloud first
      const cloudData = await syncFromCloud();
      if (cloudData && cloudData.length > 0) {
        // Cloud data exists, use it and save locally
        await storage.saveImpulses(cloudData);
        setImpulses(cloudData);
        setError(null);
        setLoading(false);
        return;
      }
      
      // Fallback to local storage
      const data = await storage.getImpulses();
      // Migrate old impulses (add coolDownPeriod if missing)
      const migrated = data.map(impulse => {
        if (!('coolDownPeriod' in impulse) || !impulse.coolDownPeriod) {
          return {
            ...impulse,
            coolDownPeriod: '24H' as const, // Default for old impulses
          } as Impulse;
        }
        return impulse;
      });
      if (migrated.some((imp, idx) => imp !== data[idx])) {
        // Save migrated data
        await storage.saveImpulses(migrated);
      }
      setImpulses(migrated);
      
      // Auto-sync to cloud
      if (migrated.length > 0) {
        autoSync(migrated).catch(async err => {
          const { logger } = await import('@/utils/logger');
          logger.error('Auto-sync error', err instanceof Error ? err : new Error(String(err)));
        });
      }
      
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load impulses'));
    } finally {
      setLoading(false);
    }
  }, []);

  const createImpulse = useCallback(async (formData: {
    title: string;
    category: Impulse['category'];
    price?: number;
    emotion?: Impulse['emotion'];
    urgency: Impulse['urgency'];
    coolDownPeriod?: Impulse['coolDownPeriod'];
    photoUri?: string;
    location?: Impulse['location'];
    sourceApp?: string;
  }) => {
    try {
      const now = Date.now();
      // Get user's preferred default or use urgency-based default
      let defaultPeriod: CoolDownPeriod;
      try {
        defaultPeriod = await settings.getDefaultCoolDown();
        // For essentials, use shorter period if user default is longer
        if (formData.urgency === 'ESSENTIAL' && ['1H', '6H', '24H', '3D'].includes(defaultPeriod)) {
          defaultPeriod = '30M';
        }
      } catch {
        defaultPeriod = getDefaultCoolDownSync(formData.urgency);
      }
      const coolDownPeriod = formData.coolDownPeriod || defaultPeriod;
      // Use milliseconds for precision with shorter cooldown periods
      const reviewAt = now + coolDownPeriodToMs(coolDownPeriod);

      const newImpulse: Impulse = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        title: formData.title,
        category: formData.category,
        price: formData.price,
        emotion: formData.emotion,
        urgency: formData.urgency,
        coolDownPeriod,
        createdAt: now,
        reviewAt,
        status: 'LOCKED',
        photoUri: formData.photoUri,
        location: formData.location,
        sourceApp: formData.sourceApp,
      };

      await storage.addImpulse(newImpulse);
      await scheduleCoolDownNotification(newImpulse);
      
      setImpulses(prev => {
        const updated = [...prev, newImpulse];
        // Auto-sync to cloud
        autoSync(updated).catch(err => console.error('Auto-sync error:', err));
        return updated;
      });
      return newImpulse;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to create impulse'));
      throw err;
    }
  }, []);

  const updateImpulse = useCallback(async (id: string, updates: Partial<Impulse>) => {
    try {
      await storage.updateImpulse(id, updates);
      setImpulses(prev =>
        prev.map(impulse =>
          impulse.id === id ? { ...impulse, ...updates } : impulse
        )
      );

      // If executing, schedule regret check
      if (updates.status === 'EXECUTED' && !updates.executedAt) {
        const impulse = impulses.find(i => i.id === id);
        if (impulse) {
          const executedImpulse = { ...impulse, ...updates, executedAt: Date.now() };
          await scheduleRegretCheckNotification(executedImpulse);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update impulse'));
      throw err;
    }
  }, [impulses]);

  const deleteImpulse = useCallback(async (id: string) => {
    try {
      // Delete associated photo if exists
      const impulse = impulses.find(i => i.id === id);
      if (impulse?.photoUri) {
        const { photos } = await import('@/services/photos');
        await photos.deletePhoto(impulse.photoUri);
      }
      
      await storage.deleteImpulse(id);
      setImpulses(prev => prev.filter(impulse => impulse.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to delete impulse'));
      throw err;
    }
  }, [impulses]);

  const cancelImpulse = useCallback(async (id: string, feeling: Impulse['skippedFeeling'], note?: string) => {
    await updateImpulse(id, {
      status: 'CANCELLED',
      skippedFeeling: feeling,
      notes: note,
    });
    // Track positive action for rating prompts
    await trackPositiveAction();
  }, [updateImpulse]);

  const executeImpulse = useCallback(async (id: string) => {
    await updateImpulse(id, {
      status: 'EXECUTED',
      executedAt: Date.now(),
    });
  }, [updateImpulse]);

  const markRegret = useCallback(async (id: string, feeling: Impulse['finalFeeling'], rating?: number) => {
    await updateImpulse(id, {
      finalFeeling: feeling,
      regretRating: rating,
    });
  }, [updateImpulse]);

  return {
    impulses,
    loading,
    error,
    loadImpulses,
    createImpulse,
    updateImpulse,
    deleteImpulse,
    cancelImpulse,
    executeImpulse,
    markRegret,
  };
}

