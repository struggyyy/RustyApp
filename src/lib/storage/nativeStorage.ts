/**
 * Native Storage Adapter for Supabase
 * 
 * This provides a storage mechanism for native mobile platforms.
 * It implements a compatible interface for Supabase auth storage.
 */

import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

// SecureStore adapter for secure storage on native platforms
export const secureStoreAdapter = {
  getItem: (key: string): Promise<string | null> => {
    try {
      return SecureStore.getItemAsync(key);
    } catch (error) {
      console.error('SecureStore getItem error:', error);
      return Promise.resolve(null);
    }
  },
  
  setItem: (key: string, value: string): Promise<void> => {
    try {
      return SecureStore.setItemAsync(key, value);
    } catch (error) {
      console.error('SecureStore setItem error:', error);
      return Promise.resolve();
    }
  },
  
  removeItem: (key: string): Promise<void> => {
    try {
      return SecureStore.deleteItemAsync(key);
    } catch (error) {
      console.error('SecureStore removeItem error:', error);
      return Promise.resolve();
    }
  },
};

// AsyncStorage adapter as a fallback
export const asyncStorageAdapter = {
  getItem: async (key: string): Promise<string | null> => {
    try {
      return AsyncStorage.getItem(key);
    } catch (error) {
      console.error('AsyncStorage getItem error:', error);
      return null;
    }
  },
  
  setItem: async (key: string, value: string): Promise<void> => {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      console.error('AsyncStorage setItem error:', error);
    }
  },
  
  removeItem: async (key: string): Promise<void> => {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('AsyncStorage removeItem error:', error);
    }
  },
};

// Combined adapter that tries SecureStore first, then falls back to AsyncStorage
export const nativeStorageAdapter = {
  getItem: async (key: string): Promise<string | null> => {
    try {
      const value = await secureStoreAdapter.getItem(key);
      if (value !== null) return value;
      
      // Fall back to AsyncStorage if SecureStore returns null
      return asyncStorageAdapter.getItem(key);
    } catch (error) {
      return asyncStorageAdapter.getItem(key);
    }
  },
  
  setItem: async (key: string, value: string): Promise<void> => {
    try {
      await secureStoreAdapter.setItem(key, value);
    } catch (error) {
      await asyncStorageAdapter.setItem(key, value);
    }
  },
  
  removeItem: async (key: string): Promise<void> => {
    try {
      await secureStoreAdapter.removeItem(key);
      // Also remove from AsyncStorage to ensure it's completely gone
      await asyncStorageAdapter.removeItem(key);
    } catch (error) {
      await asyncStorageAdapter.removeItem(key);
    }
  },
};

export default nativeStorageAdapter; 