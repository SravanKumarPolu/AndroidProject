/**
 * Cloud Sync Service
 * Syncs impulses and goals to Supabase (optional cloud storage)
 * Falls back to local-only if not configured
 */

export interface CloudSyncConfig {
  enabled: boolean;
  supabaseUrl?: string;
  supabaseKey?: string;
  userId?: string;
}

let syncConfig: CloudSyncConfig = {
  enabled: false,
};

// Initialize cloud sync (call this from Settings or App initialization)
export function initCloudSync(config: CloudSyncConfig) {
  syncConfig = config;
}

// Check if cloud sync is enabled
export function isCloudSyncEnabled(): boolean {
  return syncConfig.enabled && !!syncConfig.supabaseUrl && !!syncConfig.supabaseKey;
}

// Sync impulses to cloud
export async function syncImpulsesToCloud(impulses: any[]): Promise<void> {
  if (!isCloudSyncEnabled()) {
    return; // Silently fail if not configured
  }

  try {
    // Dynamic import to avoid bundle size if not using Supabase
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(syncConfig.supabaseUrl!, syncConfig.supabaseKey!);

    // Upsert all impulses
    const { error } = await supabase
      .from('impulses')
      .upsert(
        impulses.map((imp) => ({
          id: imp.id,
          user_id: syncConfig.userId,
          ...imp,
          updated_at: new Date().toISOString(),
        })),
        { onConflict: 'id' }
      );

    if (error) {
      console.error('Failed to sync impulses:', error);
      throw error;
    }
  } catch (error) {
    console.error('Cloud sync error:', error);
    // Don't throw - allow app to continue with local storage
  }
}

// Sync goals to cloud
export async function syncGoalsToCloud(goals: any[]): Promise<void> {
  if (!isCloudSyncEnabled()) {
    return;
  }

  try {
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(syncConfig.supabaseUrl!, syncConfig.supabaseKey!);

    const { error } = await supabase
      .from('goals')
      .upsert(
        goals.map((goal) => ({
          id: goal.id,
          user_id: syncConfig.userId,
          ...goal,
          updated_at: new Date().toISOString(),
        })),
        { onConflict: 'id' }
      );

    if (error) {
      console.error('Failed to sync goals:', error);
      throw error;
    }
  } catch (error) {
    console.error('Cloud sync error:', error);
  }
}

// Load impulses from cloud
export async function loadImpulsesFromCloud(): Promise<any[]> {
  if (!isCloudSyncEnabled()) {
    return [];
  }

  try {
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(syncConfig.supabaseUrl!, syncConfig.supabaseKey!);

    const { data, error } = await supabase
      .from('impulses')
      .select('*')
      .eq('user_id', syncConfig.userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to load impulses:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Cloud load error:', error);
    return [];
  }
}

// Load goals from cloud
export async function loadGoalsFromCloud(): Promise<any[]> {
  if (!isCloudSyncEnabled()) {
    return [];
  }

  try {
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(syncConfig.supabaseUrl!, syncConfig.supabaseKey!);

    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', syncConfig.userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to load goals:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Cloud load error:', error);
    return [];
  }
}

// Sync settings to cloud
export async function syncSettingsToCloud(settings: any): Promise<void> {
  if (!isCloudSyncEnabled()) {
    return;
  }

  try {
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(syncConfig.supabaseUrl!, syncConfig.supabaseKey!);

    const { error } = await supabase
      .from('user_settings')
      .upsert(
        {
          user_id: syncConfig.userId,
          settings: settings,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      );

    if (error) {
      console.error('Failed to sync settings:', error);
    }
  } catch (error) {
    console.error('Cloud sync error:', error);
  }
}

// Get sync status
export function getSyncStatus(): {
  enabled: boolean;
  lastSync?: number;
  error?: string;
} {
  const lastSync = localStorage.getItem('lastCloudSync');
  return {
    enabled: isCloudSyncEnabled(),
    lastSync: lastSync ? parseInt(lastSync) : undefined,
  };
}

// Mark last sync time
export function markLastSync() {
  localStorage.setItem('lastCloudSync', Date.now().toString());
}

