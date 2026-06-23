/**
 * Spendly — Storage Service
 *
 * High-performance synchronous MMKV local storage.
 */

import { createMMKV } from 'react-native-mmkv';
import { StateStorage } from 'zustand/middleware';

export const mmkvStorage = createMMKV({ id: 'spendly-storage' });

/**
 * Zustand-compatible storage adapter for MMKV.
 * Provides completely synchronous get/set/delete operations.
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
    mmkvStorage.remove(name);
  },
};

export function storeJSON<T>(key: string, value: T): void {
  mmkvStorage.set(key, JSON.stringify(value));
}

export function getJSON<T>(key: string): T | null {
  const value = mmkvStorage.getString(key);
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

export function clearAllData(): void {
  mmkvStorage.clearAll();
}
