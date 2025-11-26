/**
 * Error Recovery Strategies
 * Handles common failure scenarios with recovery mechanisms
 */

import { logger } from './logger';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface RecoveryResult<T> {
  success: boolean;
  data?: T;
  error?: Error;
  recovered: boolean;
}

/**
 * Network error recovery with exponential backoff
 */
export async function withNetworkRetry<T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 1000
): Promise<RecoveryResult<T>> {
  let lastError: Error | undefined;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const data = await operation();
      return {
        success: true,
        data,
        recovered: attempt > 0,
      };
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      // Check if error is network-related
      const isNetworkError = 
        lastError.message.includes('network') ||
        lastError.message.includes('fetch') ||
        lastError.message.includes('timeout') ||
        lastError.message.includes('ECONNREFUSED') ||
        lastError.message.includes('ENOTFOUND');
      
      if (!isNetworkError || attempt === maxRetries) {
        break;
      }
      
      // Exponential backoff
      const delay = baseDelay * Math.pow(2, attempt);
      logger.warn(`Network operation failed (attempt ${attempt + 1}/${maxRetries + 1}), retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  return {
    success: false,
    error: lastError,
    recovered: false,
  };
}

/**
 * Storage quota error recovery
 * Attempts to free up space by clearing old/cached data
 */
export async function handleStorageQuotaError<T>(
  operation: () => Promise<T>,
  cleanupFn?: () => Promise<void>
): Promise<RecoveryResult<T>> {
  try {
    const data = await operation();
    return {
      success: true,
      data,
      recovered: false,
    };
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    
    // Check if it's a quota error
    const isQuotaError = 
      err.message.includes('quota') ||
      err.message.includes('QuotaExceeded') ||
      err.message.includes('NS_ERROR_DOM_QUOTA_REACHED');
    
    if (!isQuotaError) {
      return {
        success: false,
        error: err,
        recovered: false,
      };
    }
    
    logger.warn('Storage quota exceeded, attempting cleanup...');
    
    try {
      // Try cleanup if provided
      if (cleanupFn) {
        await cleanupFn();
      } else {
        // Default cleanup: clear old cache data
        await clearOldCacheData();
      }
      
      // Retry operation
      const data = await operation();
      return {
        success: true,
        data,
        recovered: true,
      };
    } catch (retryError) {
      return {
        success: false,
        error: retryError instanceof Error ? retryError : new Error(String(retryError)),
        recovered: false,
      };
    }
  }
}

/**
 * Clear old cache data to free up storage
 */
async function clearOldCacheData(): Promise<void> {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const cacheKeys = keys.filter(key => 
      key.includes('cache') || 
      key.includes('temp') ||
      key.includes('_old')
    );
    
    if (cacheKeys.length > 0) {
      await AsyncStorage.multiRemove(cacheKeys);
      logger.info(`Cleared ${cacheKeys.length} cache keys to free storage`);
    }
  } catch (error) {
    logger.error('Error clearing cache data', error instanceof Error ? error : new Error(String(error)));
  }
}

/**
 * Corrupted data recovery
 * Attempts to recover from corrupted storage data
 */
export async function recoverCorruptedData<T>(
  key: string,
  defaultValue: T,
  validator: (data: unknown) => data is T
): Promise<RecoveryResult<T>> {
  try {
    const data = await AsyncStorage.getItem(key);
    
    if (!data) {
      return {
        success: true,
        data: defaultValue,
        recovered: false,
      };
    }
    
    try {
      const parsed = JSON.parse(data);
      
      if (validator(parsed)) {
        return {
          success: true,
          data: parsed,
          recovered: false,
        };
      } else {
        // Data exists but is invalid - use default and backup corrupted data
        logger.warn(`Corrupted data detected for key: ${key}, using default value`);
        await backupCorruptedData(key, data);
        await AsyncStorage.setItem(key, JSON.stringify(defaultValue));
        
        return {
          success: true,
          data: defaultValue,
          recovered: true,
        };
      }
    } catch (parseError) {
      // JSON parse error - data is corrupted
      logger.warn(`JSON parse error for key: ${key}, using default value`);
      await backupCorruptedData(key, data);
      await AsyncStorage.setItem(key, JSON.stringify(defaultValue));
      
      return {
        success: true,
        data: defaultValue,
        recovered: true,
      };
    }
  } catch (error) {
    logger.error(`Error recovering data for key: ${key}`, error instanceof Error ? error : new Error(String(error)));
    
    // Last resort: return default value
    try {
      await AsyncStorage.setItem(key, JSON.stringify(defaultValue));
    } catch {
      // If we can't even write default, something is seriously wrong
    }
    
    return {
      success: true,
      data: defaultValue,
      recovered: true,
    };
  }
}

/**
 * Backup corrupted data for potential recovery
 */
async function backupCorruptedData(key: string, data: string): Promise<void> {
  try {
    const backupKey = `${key}_corrupted_backup_${Date.now()}`;
    await AsyncStorage.setItem(backupKey, data);
    
    // Clean up old backups (keep only last 3)
    const keys = await AsyncStorage.getAllKeys();
    const backupKeys = keys
      .filter(k => k.startsWith(`${key}_corrupted_backup_`))
      .sort()
      .reverse()
      .slice(3);
    
    if (backupKeys.length > 0) {
      await AsyncStorage.multiRemove(backupKeys);
    }
  } catch (error) {
    // Silently fail backup - not critical
    logger.debug('Failed to backup corrupted data', error instanceof Error ? error : new Error(String(error)));
  }
}

/**
 * Safe storage operation with full error recovery
 */
export async function safeStorageOperation<T>(
  operation: () => Promise<T>,
  defaultValue: T,
  options?: {
    maxRetries?: number;
    cleanupFn?: () => Promise<void>;
  }
): Promise<T> {
  // First try: normal operation
  try {
    return await operation();
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    
    // Try quota recovery
    const quotaResult = await handleStorageQuotaError(operation, options?.cleanupFn);
    if (quotaResult.success && quotaResult.data !== undefined) {
      return quotaResult.data;
    }
    
    // Try network retry if it seems network-related
    const networkResult = await withNetworkRetry(operation, options?.maxRetries);
    if (networkResult.success && networkResult.data !== undefined) {
      return networkResult.data;
    }
    
    // All recovery attempts failed - log and return default
    logger.error('All recovery attempts failed, using default value', err);
    return defaultValue;
  }
}

