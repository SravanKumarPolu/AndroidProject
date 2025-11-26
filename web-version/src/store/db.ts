import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface ImpulseDB extends DBSchema {
  impulses: {
    key: string;
    value: {
      id: string;
      title: string;
      price: number;
      category: string;
      reason?: string;
      urgency: string;
      createdAt: number;
      cooldownEndsAt: number;
      status: string;
      decisionAt?: number;
      finalDecision?: string;
    };
    indexes: { 'by-createdAt': number; 'by-status': string };
  };
  settings: {
    key: string;
    value: any;
  };
  goals: {
    key: string;
    value: {
      id: string;
      title: string;
      targetAmount: number;
      description?: string;
      createdAt: number;
      achievedAt?: number | null;
    };
    indexes: { 'by-createdAt': number };
  };
}

let dbInstance: IDBPDatabase<ImpulseDB> | null = null;

export async function getDB(): Promise<IDBPDatabase<ImpulseDB>> {
  if (dbInstance) return dbInstance;

  dbInstance = await openDB<ImpulseDB>('impulsevault-db', 2, {
    upgrade(db, oldVersion) {
      // Version 1 -> 2: Add goals store
      if (oldVersion < 2) {
        if (!db.objectStoreNames.contains('goals')) {
          const goalStore = db.createObjectStore('goals', { keyPath: 'id' });
          goalStore.createIndex('by-createdAt', 'createdAt');
        }
      }
      
      // Always ensure all stores exist (for fresh installs)
      // Impulses store
      if (!db.objectStoreNames.contains('impulses')) {
        const impulseStore = db.createObjectStore('impulses', { keyPath: 'id' });
        impulseStore.createIndex('by-createdAt', 'createdAt');
        impulseStore.createIndex('by-status', 'status');
      }

      // Settings store
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings', { keyPath: 'key' });
      }

    },
  });

  return dbInstance;
}

export async function saveImpulses(impulses: any[]): Promise<void> {
  const db = await getDB();
  const tx = db.transaction('impulses', 'readwrite');
  await Promise.all(impulses.map(impulse => tx.store.put(impulse)));
  await tx.done;
}

export async function loadImpulses(): Promise<any[]> {
  const db = await getDB();
  return db.getAll('impulses');
}

export async function saveSettings(settings: any): Promise<void> {
  const db = await getDB();
  const tx = db.transaction('settings', 'readwrite');
  await tx.store.put({ key: 'app', value: settings });
  await tx.done;
}

export async function loadSettings(): Promise<any | null> {
  const db = await getDB();
  const result = await db.get('settings', 'app');
  return result?.value || null;
}

export async function saveGoals(goals: any[]): Promise<void> {
  const db = await getDB();
  const tx = db.transaction('goals', 'readwrite');
  await Promise.all(goals.map(goal => tx.store.put(goal)));
  await tx.done;
}

export async function loadGoals(): Promise<any[]> {
  const db = await getDB();
  return db.getAll('goals');
}

