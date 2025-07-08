/**
 * Storage utilities for persistent state management
 */

import { Logger, createLogger } from './logger';

export interface StorageOptions {
  key: string;
  storage?: Storage;
  serialize?: (value: any) => string;
  deserialize?: (value: string) => any;
}

export class StorageManager {
  private logger: Logger;
  private storage: Storage;
  private serialize: (value: any) => string;
  private deserialize: (value: string) => any;

  constructor(options: Partial<StorageOptions> = {}) {
    this.logger = createLogger('StorageManager');
    this.storage = options.storage ?? sessionStorage;
    this.serialize = options.serialize ?? JSON.stringify;
    this.deserialize = options.deserialize ?? JSON.parse;
  }

  public set<T>(key: string, value: T): boolean {
    try {
      const serialized = this.serialize(value);
      this.storage.setItem(key, serialized);
      this.logger.debug(`Stored value for key: ${key}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to store value for key ${key}:`, error);
      return false;
    }
  }

  public get<T>(key: string, defaultValue?: T): T | undefined {
    try {
      const item = this.storage.getItem(key);
      if (item === null) {
        this.logger.debug(`No value found for key: ${key}`);
        return defaultValue;
      }
      
      const deserialized = this.deserialize(item);
      this.logger.debug(`Retrieved value for key: ${key}`);
      return deserialized;
    } catch (error) {
      this.logger.error(`Failed to retrieve value for key ${key}:`, error);
      return defaultValue;
    }
  }

  public remove(key: string): boolean {
    try {
      this.storage.removeItem(key);
      this.logger.debug(`Removed value for key: ${key}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to remove value for key ${key}:`, error);
      return false;
    }
  }

  public clear(): boolean {
    try {
      this.storage.clear();
      this.logger.debug('Cleared all storage');
      return true;
    } catch (error) {
      this.logger.error('Failed to clear storage:', error);
      return false;
    }
  }

  public has(key: string): boolean {
    return this.storage.getItem(key) !== null;
  }

  public keys(): string[] {
    const keys: string[] = [];
    for (let i = 0; i < this.storage.length; i++) {
      const key = this.storage.key(i);
      if (key !== null) {
        keys.push(key);
      }
    }
    return keys;
  }

  public size(): number {
    let total = 0;
    for (let i = 0; i < this.storage.length; i++) {
      const key = this.storage.key(i);
      if (key !== null) {
        const value = this.storage.getItem(key);
        if (value !== null) {
          total += key.length + value.length;
        }
      }
    }
    return total;
  }
}

// Singleton instances
export const sessionStorageManager = new StorageManager({
  storage: sessionStorage,
});

export const localStorageManager = new StorageManager({
  storage: localStorage,
});

/**
 * Zustand persistence middleware helper
 */
export const createStoragePersist = <T>(
  storageManager: StorageManager,
  key: string,
  partialize?: (state: T) => Partial<T>
) => ({
  name: key,
  storage: {
    getItem: (name: string) => {
      const value = storageManager.get<T>(name);
      return value ? JSON.stringify(value) : null;
    },
    setItem: (name: string, value: string) => {
      const parsed = JSON.parse(value);
      const toStore = partialize ? partialize(parsed) : parsed;
      storageManager.set(name, toStore);
    },
    removeItem: (name: string) => {
      storageManager.remove(name);
    },
  },
});

/**
 * Cart-specific storage helpers - KEEP EXACT SAME EXPORTS
 */
export const CART_STORAGE_KEY = 'next-cart-state';
export const CONFIG_STORAGE_KEY = 'next-config-state';
export const CAMPAIGN_STORAGE_KEY = 'next-campaign-cache';

/**
 * Timer persistence helpers
 */
export const TIMER_STORAGE_PREFIX = 'next-timer-';

export const getTimerKey = (persistenceId: string): string => 
  `${TIMER_STORAGE_PREFIX}${persistenceId}`;

export const saveTimerState = (persistenceId: string, endTime: number): void => {
  sessionStorageManager.set(getTimerKey(persistenceId), endTime);
};

export const loadTimerState = (persistenceId: string): number | null => {
  return sessionStorageManager.get<number>(getTimerKey(persistenceId)) ?? null;
};

export const clearTimerState = (persistenceId: string): void => {
  sessionStorageManager.remove(getTimerKey(persistenceId));
};

/**
 * Storage quota helpers
 */
export const getStorageQuota = async (): Promise<{ quota: number; usage: number } | null> => {
  if ('navigator' in globalThis && 'storage' in navigator && 'estimate' in navigator.storage) {
    try {
      const estimate = await navigator.storage.estimate();
      return {
        quota: estimate.quota ?? 0,
        usage: estimate.usage ?? 0,
      };
    } catch (error) {
      console.warn('Failed to estimate storage quota:', error);
    }
  }
  return null;
};

/**
 * Storage event listener for cross-tab synchronization
 */
export const onStorageChange = (
  callback: (event: { key: string; oldValue: any; newValue: any }) => void
): (() => void) => {
  const handler = (event: StorageEvent) => {
    if (event.key && event.storageArea === sessionStorage) {
      let oldValue, newValue;
      
      try {
        oldValue = event.oldValue ? JSON.parse(event.oldValue) : null;
      } catch {
        oldValue = event.oldValue;
      }
      
      try {
        newValue = event.newValue ? JSON.parse(event.newValue) : null;
      } catch {
        newValue = event.newValue;
      }
      
      callback({
        key: event.key,
        oldValue,
        newValue,
      });
    }
  };

  window.addEventListener('storage', handler);
  
  return () => {
    window.removeEventListener('storage', handler);
  };
};