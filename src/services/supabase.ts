import { createClient, SupabaseClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Impulse } from '@/types/impulse';
import { AppSettings } from './settings';

/**
 * Supabase Client Setup
 * 
 * To use cloud sync:
 * 1. Create a free Supabase project at https://supabase.com
 * 2. Get your project URL and anon key from Settings > API
 * 3. Add them to your .env file (see .env.example)
 * 4. Enable sync in Settings
 */

// Get Supabase credentials from environment or use defaults
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

let supabaseClient: SupabaseClient | null = null;

/**
 * Initialize Supabase client
 */
export function initSupabase(): SupabaseClient | null {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.warn('Supabase credentials not configured. Cloud sync will be disabled.');
    return null;
  }

  if (!supabaseClient) {
    supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    });
  }

  return supabaseClient;
}

/**
 * Get Supabase client (initializes if needed)
 */
export function getSupabaseClient(): SupabaseClient | null {
  if (!supabaseClient) {
    return initSupabase();
  }
  return supabaseClient;
}

/**
 * Check if Supabase is configured
 */
export function isSupabaseConfigured(): boolean {
  return !!(SUPABASE_URL && SUPABASE_ANON_KEY);
}

