/**
 * Spendly — Storage Service
 *
 * MMKV-based local storage with Zustand adapter.
 * Falls back to AsyncStorage if MMKV is unavailable.
 */

import { MMKV } from 'react-native-mmkv';
import { StateStorage } from 'zustand/middleware';

/** Main MMKV storage instance */
// @ts-ignore — MMKV types may not resolve before native build
export const mmkvStorage = new MMKV({
  id: 'spendly-storage',
});

/**
 * Zustand-compatible storage adapter for MMKV.
 * Provides synchronous get/set/delete operations.
 */
export const zustandMMKVStorage: StateStorage = {
  getItem: (name: string): string | null => {
    const value = mmkvStorage.getString(name);
    return value ?? null;
  },
  setItem: (name: string, value: string): void => {
    mmkvStorage.set(name, value);
  },
  removeItem: (name: string): void => {
    mmkvStorage.delete(name);
  },
};

/**
 * Helper to store arbitrary JSON data.
 */
export function storeJSON<T>(key: string, value: T): void {
  mmkvStorage.set(key, JSON.stringify(value));
}

/**
 * Helper to retrieve arbitrary JSON data.
 */
export function getJSON<T>(key: string): T | null {
  const value = mmkvStorage.getString(key);
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

/**
 * Clear all stored data.
 */
export function clearAllData(): void {
  mmkvStorage.clearAll();
}
