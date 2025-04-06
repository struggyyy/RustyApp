/**
 * Web Storage Adapter for Supabase
 * 
 * This provides a fallback storage mechanism for web browsers.
 * It implements a compatible interface for Supabase auth storage.
 */

// Debug flag to enable verbose logging
const DEBUG = true;

// Basic localStorage adapter with error handling
export const localStorageAdapter = {
  getItem: (key: string): Promise<string | null> => {
    try {
      const value = localStorage.getItem(key);
      if (DEBUG) console.log(`[WebStorage] getItem: ${key}`, value ? 'has value' : 'null');
      return Promise.resolve(value);
    } catch (error) {
      console.error('localStorage getItem error:', error);
      return Promise.resolve(null);
    }
  },
  
  setItem: (key: string, value: string): Promise<void> => {
    try {
      if (DEBUG) console.log(`[WebStorage] setItem: ${key}`, value.substring(0, 20) + '...');
      localStorage.setItem(key, value);
      return Promise.resolve();
    } catch (error) {
      console.error('localStorage setItem error:', error);
      return Promise.resolve();
    }
  },
  
  removeItem: (key: string): Promise<void> => {
    try {
      if (DEBUG) console.log(`[WebStorage] removeItem: ${key}`);
      localStorage.removeItem(key);
      return Promise.resolve();
    } catch (error) {
      console.error('localStorage removeItem error:', error);
      return Promise.resolve();
    }
  },
};

// Memory storage fallback if localStorage fails
let memoryStorage: Record<string, string> = {};

export const memoryStorageAdapter = {
  getItem: (key: string): Promise<string | null> => {
    if (DEBUG) console.log(`[MemoryStorage] getItem: ${key}`, memoryStorage[key] ? 'has value' : 'null');
    return Promise.resolve(memoryStorage[key] || null);
  },
  
  setItem: (key: string, value: string): Promise<void> => {
    if (DEBUG) console.log(`[MemoryStorage] setItem: ${key}`, value.substring(0, 20) + '...');
    memoryStorage[key] = value;
    return Promise.resolve();
  },
  
  removeItem: (key: string): Promise<void> => {
    if (DEBUG) console.log(`[MemoryStorage] removeItem: ${key}`);
    delete memoryStorage[key];
    return Promise.resolve();
  },
};

// Combined adapter that tries localStorage first, then falls back to memory
export const webStorageAdapter = {
  getItem: async (key: string): Promise<string | null> => {
    try {
      const value = await localStorageAdapter.getItem(key);
      if (value === null && DEBUG) {
        console.log(`[WebStorage] Key not found in localStorage: ${key}, trying memory storage`);
        return memoryStorageAdapter.getItem(key);
      }
      return value;
    } catch (error) {
      console.error('[WebStorage] Error in getItem, falling back to memory storage:', error);
      return memoryStorageAdapter.getItem(key);
    }
  },
  
  setItem: async (key: string, value: string): Promise<void> => {
    try {
      await localStorageAdapter.setItem(key, value);
      // Also store in memory for redundancy
      await memoryStorageAdapter.setItem(key, value);
    } catch (error) {
      console.error('[WebStorage] Error in setItem, storing only in memory:', error);
      await memoryStorageAdapter.setItem(key, value);
    }
  },
  
  removeItem: async (key: string): Promise<void> => {
    try {
      await localStorageAdapter.removeItem(key);
      // Also remove from memory storage
      await memoryStorageAdapter.removeItem(key);
    } catch (error) {
      console.error('[WebStorage] Error in removeItem:', error);
      await memoryStorageAdapter.removeItem(key);
    }
  },
};

export default webStorageAdapter; 