import AsyncStorage from '@react-native-async-storage/async-storage';
import { storage } from '../storage';
import { Impulse } from '@/types/impulse';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

describe('storage service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getImpulses', () => {
    it('should return empty array when no data exists', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
      
      const result = await storage.getImpulses();
      expect(result).toEqual([]);
    });

    it('should return parsed impulses when data exists', async () => {
      const mockImpulses: Impulse[] = [
        {
          id: '1',
          title: 'Test',
          category: 'FOOD',
          urgency: 'IMPULSE',
          coolDownPeriod: '24H',
          createdAt: Date.now(),
          reviewAt: Date.now(),
          status: 'LOCKED',
        },
      ];

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(mockImpulses));
      
      const result = await storage.getImpulses();
      expect(result).toEqual(mockImpulses);
    });

    it('should return empty array on error', async () => {
      (AsyncStorage.getItem as jest.Mock).mockRejectedValue(new Error('Storage error'));
      
      const result = await storage.getImpulses();
      expect(result).toEqual([]);
    });
  });

  describe('saveImpulses', () => {
    it('should save impulses to storage', async () => {
      const impulses: Impulse[] = [
        {
          id: '1',
          title: 'Test',
          category: 'FOOD',
          urgency: 'IMPULSE',
          coolDownPeriod: '24H',
          createdAt: Date.now(),
          reviewAt: Date.now(),
          status: 'LOCKED',
        },
      ];

      await storage.saveImpulses(impulses);
      
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        '@impulsevault:impulses',
        JSON.stringify(impulses)
      );
    });
  });

  describe('addImpulse', () => {
    it('should add impulse to existing list', async () => {
      const existing: Impulse[] = [
        {
          id: '1',
          title: 'Existing',
          category: 'FOOD',
          urgency: 'IMPULSE',
          coolDownPeriod: '24H',
          createdAt: Date.now(),
          reviewAt: Date.now(),
          status: 'LOCKED',
        },
      ];

      const newImpulse: Impulse = {
        id: '2',
        title: 'New',
        category: 'SHOPPING',
        urgency: 'IMPULSE',
        coolDownPeriod: '24H',
        createdAt: Date.now(),
        reviewAt: Date.now(),
        status: 'LOCKED',
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(existing));
      
      await storage.addImpulse(newImpulse);
      
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        '@impulsevault:impulses',
        JSON.stringify([...existing, newImpulse])
      );
    });
  });

  describe('updateImpulse', () => {
    it('should update existing impulse', async () => {
      const impulses: Impulse[] = [
        {
          id: '1',
          title: 'Original',
          category: 'FOOD',
          urgency: 'IMPULSE',
          coolDownPeriod: '24H',
          createdAt: Date.now(),
          reviewAt: Date.now(),
          status: 'LOCKED',
        },
      ];

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(impulses));
      
      await storage.updateImpulse('1', { status: 'CANCELLED' });
      
      const updatedImpulses = [
        { ...impulses[0], status: 'CANCELLED' },
      ];
      
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        '@impulsevault:impulses',
        JSON.stringify(updatedImpulses)
      );
    });

    it('should not update if impulse not found', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify([]));
      
      await storage.updateImpulse('nonexistent', { status: 'CANCELLED' });
      
      expect(AsyncStorage.setItem).not.toHaveBeenCalled();
    });
  });

  describe('deleteImpulse', () => {
    it('should delete impulse from list', async () => {
      const impulses: Impulse[] = [
        {
          id: '1',
          title: 'Keep',
          category: 'FOOD',
          urgency: 'IMPULSE',
          coolDownPeriod: '24H',
          createdAt: Date.now(),
          reviewAt: Date.now(),
          status: 'LOCKED',
        },
        {
          id: '2',
          title: 'Delete',
          category: 'FOOD',
          urgency: 'IMPULSE',
          coolDownPeriod: '24H',
          createdAt: Date.now(),
          reviewAt: Date.now(),
          status: 'LOCKED',
        },
      ];

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(impulses));
      
      await storage.deleteImpulse('2');
      
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        '@impulsevault:impulses',
        JSON.stringify([impulses[0]])
      );
    });
  });
});

