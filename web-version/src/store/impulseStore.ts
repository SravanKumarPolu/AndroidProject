import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Impulse, ImpulseStatus, AppSettings } from '@/types/impulse';
import { SavingsGoal } from '@/types/goal';
import { loadImpulses, saveImpulses, loadSettings, saveSettings, loadGoals, saveGoals } from './db';
import { calculateReportMetrics, getWeekRange, getMonthRange } from '@/utils/reports';

interface ImpulseStore {
  impulses: Impulse[];
  settings: AppSettings;
  goals: SavingsGoal[];
  loading: boolean;
  
  // Actions
  addImpulse: (impulse: Omit<Impulse, 'id' | 'createdAt' | 'cooldownEndsAt' | 'status' | 'decisionAtEnd' | 'regretCheckAt' | 'regretScore' | 'notesAfterPurchase'>) => Promise<void>;
  updateImpulse: (id: string, updates: Partial<Impulse>) => Promise<void>;
  deleteImpulse: (id: string) => Promise<void>;
  makeDecision: (id: string, decision: 'skip' | 'buy' | 'save-later') => Promise<void>;
  
  // Goals
  addGoal: (goal: Omit<SavingsGoal, 'id' | 'createdAt'>) => Promise<void>;
  updateGoal: (id: string, updates: Partial<SavingsGoal>) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  
  // Settings
  updateSettings: (updates: Partial<AppSettings>) => Promise<void>;
  
  // Load/Save
  loadFromDB: () => Promise<void>;
  saveToDB: () => Promise<void>;
  saveGoalsToDB: () => Promise<void>;
  
  // Selectors for metrics
  getWeeklyMetrics: () => ReturnType<typeof calculateReportMetrics>;
  getMonthlyMetrics: () => ReturnType<typeof calculateReportMetrics>;
  getImpulsesNeedingRegretCheck: () => Impulse[];
}

const defaultSettings: AppSettings = {
  theme: 'dark',
  notifications: true,
  defaultCooldownHours: 24,
  reminderToLog: true,
  weeklyReportSummary: true,
  regretCheckReminders: true,
  cloudSyncEnabled: false,
  smartAlertsEnabled: true,
};

export const useImpulseStore = create<ImpulseStore>()(
  persist(
    (set, get) => ({
      impulses: [],
      settings: defaultSettings,
      goals: [],
      loading: false,

      addImpulse: async (data) => {
        const now = Date.now();
        const { settings } = get();
        const cooldownMs = settings.defaultCooldownHours * 60 * 60 * 1000;
        
        const newImpulse: Impulse = {
          id: `impulse-${now}-${Math.random().toString(36).substr(2, 9)}`,
          ...data,
          createdAt: now,
          cooldownEndsAt: now + cooldownMs,
          status: 'cooldown',
        };

        set((state) => ({
          impulses: [...state.impulses, newImpulse],
        }));

        await get().saveToDB();
        
        // Cloud sync if enabled
        const currentSettings = get().settings;
        if (currentSettings.cloudSyncEnabled && currentSettings.cloudSyncUrl && currentSettings.cloudSyncKey) {
          try {
            const { syncImpulsesToCloud, initCloudSync } = await import('@/services/cloudSync');
            initCloudSync({
              enabled: true,
              supabaseUrl: currentSettings.cloudSyncUrl!,
              supabaseKey: currentSettings.cloudSyncKey!,
              userId: 'user-' + (localStorage.getItem('userId') || Date.now().toString()),
            });
            await syncImpulsesToCloud(get().impulses);
          } catch (error) {
            console.warn('Cloud sync failed:', error);
          }
        }
      },

      updateImpulse: async (id, updates) => {
        set((state) => ({
          impulses: state.impulses.map((imp) =>
            imp.id === id ? { ...imp, ...updates } : imp
          ),
        }));

        await get().saveToDB();
        
        // Cloud sync if enabled
        const currentSettings = get().settings;
        if (currentSettings.cloudSyncEnabled && currentSettings.cloudSyncUrl && currentSettings.cloudSyncKey) {
          try {
            const { syncImpulsesToCloud, initCloudSync } = await import('@/services/cloudSync');
            initCloudSync({
              enabled: true,
              supabaseUrl: currentSettings.cloudSyncUrl!,
              supabaseKey: currentSettings.cloudSyncKey!,
              userId: 'user-' + (localStorage.getItem('userId') || Date.now().toString()),
            });
            await syncImpulsesToCloud(get().impulses);
          } catch (error) {
            console.warn('Cloud sync failed:', error);
          }
        }
      },

      deleteImpulse: async (id) => {
        set((state) => ({
          impulses: state.impulses.filter((imp) => imp.id !== id),
        }));

        await get().saveToDB();
        
        // Cloud sync if enabled
        const currentSettings = get().settings;
        if (currentSettings.cloudSyncEnabled && currentSettings.cloudSyncUrl && currentSettings.cloudSyncKey) {
          try {
            const { syncImpulsesToCloud, initCloudSync } = await import('@/services/cloudSync');
            initCloudSync({
              enabled: true,
              supabaseUrl: currentSettings.cloudSyncUrl!,
              supabaseKey: currentSettings.cloudSyncKey!,
              userId: 'user-' + (localStorage.getItem('userId') || Date.now().toString()),
            });
            await syncImpulsesToCloud(get().impulses);
          } catch (error) {
            console.warn('Cloud sync failed:', error);
          }
        }
      },

      makeDecision: async (id, decision) => {
        const now = Date.now();
        // For 'save-later', keep status as 'pending' so it can be reviewed later
        const status: ImpulseStatus = decision === 'skip' ? 'skipped' : decision === 'buy' ? 'bought' : 'pending';
        
        // Phase 2: Set decisionAtEnd and schedule regret check for bought items
        const decisionAtEnd = decision === 'skip' ? 'skipped' : decision === 'buy' ? 'bought' : 'saved_for_later';
        const regretCheckAt = decision === 'buy' ? now + (3 * 24 * 60 * 60 * 1000) : null; // 3 days later

        await get().updateImpulse(id, {
          status,
          finalDecision: decision,
          decisionAt: now,
          decisionAtEnd,
          regretCheckAt,
        });
      },

      addGoal: async (data) => {
        const now = Date.now();
        const newGoal: SavingsGoal = {
          id: `goal-${now}-${Math.random().toString(36).substr(2, 9)}`,
          ...data,
          createdAt: now,
        };

        set((state) => ({
          goals: [...state.goals, newGoal],
        }));

        await get().saveGoalsToDB();
        
        // Cloud sync if enabled
        const currentSettings = get().settings;
        if (currentSettings.cloudSyncEnabled && currentSettings.cloudSyncUrl && currentSettings.cloudSyncKey) {
          try {
            const { syncGoalsToCloud, initCloudSync } = await import('@/services/cloudSync');
            initCloudSync({
              enabled: true,
              supabaseUrl: currentSettings.cloudSyncUrl!,
              supabaseKey: currentSettings.cloudSyncKey!,
              userId: 'user-' + (localStorage.getItem('userId') || Date.now().toString()),
            });
            await syncGoalsToCloud(get().goals);
          } catch (error) {
            console.warn('Cloud sync failed:', error);
          }
        }
      },

      updateGoal: async (id, updates) => {
        set((state) => ({
          goals: state.goals.map((g) =>
            g.id === id ? { ...g, ...updates } : g
          ),
        }));

        await get().saveGoalsToDB();
        
        // Cloud sync if enabled
        const currentSettings = get().settings;
        if (currentSettings.cloudSyncEnabled && currentSettings.cloudSyncUrl && currentSettings.cloudSyncKey) {
          try {
            const { syncGoalsToCloud, initCloudSync } = await import('@/services/cloudSync');
            initCloudSync({
              enabled: true,
              supabaseUrl: currentSettings.cloudSyncUrl!,
              supabaseKey: currentSettings.cloudSyncKey!,
              userId: 'user-' + (localStorage.getItem('userId') || Date.now().toString()),
            });
            await syncGoalsToCloud(get().goals);
          } catch (error) {
            console.warn('Cloud sync failed:', error);
          }
        }
      },

      deleteGoal: async (id) => {
        set((state) => ({
          goals: state.goals.filter((g) => g.id !== id),
        }));

        await get().saveGoalsToDB();
        
        // Cloud sync if enabled
        const currentSettings = get().settings;
        if (currentSettings.cloudSyncEnabled && currentSettings.cloudSyncUrl && currentSettings.cloudSyncKey) {
          try {
            const { syncGoalsToCloud, initCloudSync } = await import('@/services/cloudSync');
            initCloudSync({
              enabled: true,
              supabaseUrl: currentSettings.cloudSyncUrl!,
              supabaseKey: currentSettings.cloudSyncKey!,
              userId: 'user-' + (localStorage.getItem('userId') || Date.now().toString()),
            });
            await syncGoalsToCloud(get().goals);
          } catch (error) {
            console.warn('Cloud sync failed:', error);
          }
        }
      },

      updateSettings: async (updates) => {
        set((state) => ({
          settings: { ...state.settings, ...updates },
        }));

        const { settings } = get();
        await saveSettings(settings);
        
        // Cloud sync settings if enabled
        if (settings.cloudSyncEnabled && settings.cloudSyncUrl && settings.cloudSyncKey) {
          try {
            const { syncSettingsToCloud, initCloudSync } = await import('@/services/cloudSync');
            initCloudSync({
              enabled: true,
              supabaseUrl: settings.cloudSyncUrl,
              supabaseKey: settings.cloudSyncKey,
              userId: 'user-' + (localStorage.getItem('userId') || Date.now().toString()),
            });
            await syncSettingsToCloud(settings);
          } catch (error) {
            console.warn('Cloud sync failed:', error);
          }
        }
      },

      loadFromDB: async () => {
        set({ loading: true });
        try {
          let impulses: Impulse[] = [];
          let goals: SavingsGoal[] = [];
          
          const settings = await loadSettings() || defaultSettings;
          
          // Try cloud sync first if enabled
          if (settings.cloudSyncEnabled && settings.cloudSyncUrl && settings.cloudSyncKey) {
            try {
              const { loadImpulsesFromCloud, loadGoalsFromCloud, initCloudSync } = await import('@/services/cloudSync');
              initCloudSync({
                enabled: true,
                supabaseUrl: settings.cloudSyncUrl,
                supabaseKey: settings.cloudSyncKey,
                userId: 'user-' + (localStorage.getItem('userId') || Date.now().toString()),
              });
              
              const cloudImpulses = await loadImpulsesFromCloud();
              const cloudGoals = await loadGoalsFromCloud();
              
              if (cloudImpulses.length > 0) impulses = cloudImpulses;
              if (cloudGoals.length > 0) goals = cloudGoals;
            } catch (error) {
              console.warn('Cloud sync failed, falling back to local:', error);
            }
          }
          
          // Fallback to local storage
          if (impulses.length === 0) impulses = await loadImpulses();
          if (goals.length === 0) goals = await loadGoals();

          // Update status based on current time
          const now = Date.now();
          const updatedImpulses = impulses.map((imp) => {
            if (imp.status === 'cooldown' && imp.cooldownEndsAt <= now) {
              return { ...imp, status: 'decision' };
            }
            return imp;
          });

          set({
            impulses: updatedImpulses,
            settings: settings,
            goals: goals || [],
            loading: false,
          });
        } catch (error) {
          console.error('Failed to load from DB:', error);
          set({ loading: false });
        }
      },

      saveGoalsToDB: async () => {
        try {
          const { goals } = get();
          await saveGoals(goals);
        } catch (error) {
          console.error('Failed to save goals to DB:', error);
        }
      },

      saveToDB: async () => {
        try {
          const { impulses } = get();
          await saveImpulses(impulses);
        } catch (error) {
          console.error('Failed to save to DB:', error);
        }
      },

      // Selectors for metrics
      getWeeklyMetrics: () => {
        const { impulses } = get();
        const weekRange = getWeekRange(0);
        return calculateReportMetrics(impulses, weekRange.start, weekRange.end);
      },

      getMonthlyMetrics: () => {
        const { impulses } = get();
        const monthRange = getMonthRange(0);
        return calculateReportMetrics(impulses, monthRange.start, monthRange.end);
      },

      getImpulsesNeedingRegretCheck: () => {
        const { impulses } = get();
        const now = Date.now();
        return impulses.filter(
          (imp) =>
            imp.decisionAtEnd === 'bought' &&
            imp.regretCheckAt !== null &&
            imp.regretCheckAt !== undefined &&
            imp.regretCheckAt <= now &&
            imp.regretScore === null
        );
      },
    }),
    {
      name: 'impulsevault-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ settings: state.settings }),
    }
  )
);

// Initialize store on load
if (typeof window !== 'undefined') {
  // Initialize userId if not exists
  if (!localStorage.getItem('userId')) {
    localStorage.setItem('userId', Date.now().toString());
  }
  
  useImpulseStore.getState().loadFromDB();
}

