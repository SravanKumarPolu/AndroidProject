import AsyncStorage from '@react-native-async-storage/async-storage';
import { Impulse } from '@/types/impulse';
import { AppSettings } from './settings';
import { getSupabaseClient, isSupabaseConfigured } from './supabase';

/**
 * Cloud Sync Service
 * Handles syncing data to cloud (Firebase/Supabase)
 * Gracefully degrades if cloud is not configured
 */

const SYNC_ENABLED_KEY = '@impulsevault:sync_enabled';
const LAST_SYNC_KEY = '@impulsevault:last_sync';
const SYNC_PENDING_KEY = '@impulsevault:sync_pending';

interface CloudConfig {
  enabled: boolean;
  provider?: 'firebase' | 'supabase';
  endpoint?: string;
  apiKey?: string;
}

/**
 * Check if cloud sync is configured
 */
export async function isCloudSyncEnabled(): Promise<boolean> {
  try {
    const enabled = await AsyncStorage.getItem(SYNC_ENABLED_KEY);
    return enabled === 'true';
  } catch {
    return false;
  }
}

/**
 * Enable/disable cloud sync
 */
export async function setCloudSyncEnabled(enabled: boolean): Promise<void> {
  try {
    await AsyncStorage.setItem(SYNC_ENABLED_KEY, enabled.toString());
  } catch (error) {
    console.error('Error setting sync enabled:', error);
  }
}

/**
 * Get last sync timestamp
 */
export async function getLastSyncTime(): Promise<number | null> {
  try {
    const timestamp = await AsyncStorage.getItem(LAST_SYNC_KEY);
    return timestamp ? parseInt(timestamp, 10) : null;
  } catch {
    return null;
  }
}

/**
 * Set last sync timestamp
 */
async function setLastSyncTime(timestamp: number): Promise<void> {
  try {
    await AsyncStorage.setItem(LAST_SYNC_KEY, timestamp.toString());
  } catch (error) {
    console.error('Error setting last sync time:', error);
  }
}

/**
 * Mark data as pending sync
 */
export async function markPendingSync(impulses: Impulse[]): Promise<void> {
  try {
    await AsyncStorage.setItem(SYNC_PENDING_KEY, JSON.stringify(impulses));
  } catch (error) {
    console.error('Error marking pending sync:', error);
  }
}

/**
 * Get pending sync data
 */
export async function getPendingSync(): Promise<Impulse[] | null> {
  try {
    const data = await AsyncStorage.getItem(SYNC_PENDING_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

/**
 * Clear pending sync
 */
async function clearPendingSync(): Promise<void> {
  try {
    await AsyncStorage.removeItem(SYNC_PENDING_KEY);
  } catch (error) {
    console.error('Error clearing pending sync:', error);
  }
}

/**
 * Sync impulses to cloud (Supabase)
 */
export async function syncToCloud(impulses: Impulse[]): Promise<boolean> {
  const enabled = await isCloudSyncEnabled();
  if (!enabled) {
    return false;
  }

  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured. Please add credentials to .env file.');
    return false;
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    return false;
  }

  try {
    // Get user ID (or create anonymous user)
    let { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      // Create anonymous session for sync
      const { data: anonData, error: anonError } = await supabase.auth.signInAnonymously();
      if (anonError) {
        console.error('Error creating anonymous session:', anonError);
        await markPendingSync(impulses);
        return false;
      }
      // Get user from anonymous sign-in response
      user = anonData?.user || null;
    }

    if (!user?.id) {
      throw new Error('No user ID available');
    }

    const userId = user.id;

    // Upsert impulses (insert or update)
    const { error } = await supabase
      .from('impulses')
      .upsert(
        impulses.map(impulse => ({
          ...impulse,
          user_id: userId,
          updated_at: new Date().toISOString(),
        })),
        {
          onConflict: 'id',
        }
      );

    if (error) {
      throw error;
    }

    await setLastSyncTime(Date.now());
    await clearPendingSync();
    
    return true;
  } catch (error) {
    console.error('Error syncing to cloud:', error);
    // Mark as pending for retry
    await markPendingSync(impulses);
    return false;
  }
}

/**
 * Sync settings to cloud (Supabase)
 */
export async function syncSettingsToCloud(settings: AppSettings): Promise<boolean> {
  const enabled = await isCloudSyncEnabled();
  if (!enabled) {
    return false;
  }

  if (!isSupabaseConfigured()) {
    return false;
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    return false;
  }

  try {
    let { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      // Try to create anonymous session
      const { data: anonData, error: anonError } = await supabase.auth.signInAnonymously();
      if (anonError || !anonData?.user) {
        return false;
      }
      user = anonData.user;
    }

    const { error } = await supabase
      .from('settings')
      .upsert(
        {
          user_id: user.id,
          settings: settings,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'user_id',
        }
      );

    if (error) {
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Error syncing settings:', error);
    return false;
  }
}

/**
 * Sync from cloud (Supabase)
 */
export async function syncFromCloud(): Promise<Impulse[] | null> {
  const enabled = await isCloudSyncEnabled();
  if (!enabled) {
    return null;
  }

  if (!isSupabaseConfigured()) {
    return null;
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    return null;
  }

  try {
    let { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      // Try to create anonymous session
      const { data: anonData, error: anonError } = await supabase.auth.signInAnonymously();
      if (anonError || !anonData?.user) {
        return null;
      }
      user = anonData.user;
    }

    const { data, error } = await supabase
      .from('impulses')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    // Remove user_id from response (not part of Impulse type)
    return data?.map(({ user_id, ...impulse }) => impulse as Impulse) || null;
  } catch (error) {
    console.error('Error syncing from cloud:', error);
    return null;
  }
}

/**
 * Auto-sync (called periodically)
 */
export async function autoSync(impulses: Impulse[]): Promise<void> {
  const enabled = await isCloudSyncEnabled();
  if (!enabled) {
    return;
  }

  const lastSync = await getLastSyncTime();
  const now = Date.now();
  
  // Sync if last sync was more than 5 minutes ago
  if (!lastSync || (now - lastSync) > 5 * 60 * 1000) {
    await syncToCloud(impulses);
  }
}

