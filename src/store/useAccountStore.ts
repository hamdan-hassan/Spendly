/**
 * Spendly — Account Store
 *
 * Zustand store for managing multiple accounts (wallets).
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { zustandMMKVStorage } from '../services/storage';
import type { Account } from '../types/account';
import { generateId } from '../utils/generateId';

interface AccountState {
  accounts: Account[];
  activeAccountId: string | null;

  // Actions
  addAccount: (data: Omit<Account, 'id' | 'createdAt'>) => Account;
  updateAccount: (id: string, data: Partial<Account>) => void;
  deleteAccount: (id: string) => void;
  setActiveAccount: (id: string) => void;

  // Migration Helper
  _initializeMainWallet: (currencyCode: string, currencySymbol: string) => string;
}

export const useAccountStore = create<AccountState>()(
  persist(
    (set, get) => ({
      accounts: [],
      activeAccountId: null,

      addAccount: (data) => {
        const account: Account = {
          id: generateId(),
          createdAt: new Date().toISOString(),
          ...data,
        };
        set((state) => ({
          accounts: [...state.accounts, account],
          // Auto-set as active if it's the first account
          activeAccountId: state.accounts.length === 0 ? account.id : state.activeAccountId,
        }));
        return account;
      },

      updateAccount: (id, data) => {
        set((state) => ({
          accounts: state.accounts.map((a) => (a.id === id ? { ...a, ...data } : a)),
        }));
      },

      deleteAccount: (id) => {
        set((state) => {
          const remaining = state.accounts.filter((a) => a.id !== id);
          return {
            accounts: remaining,
            // If active account was deleted, switch to the first available or null
            activeAccountId:
              state.activeAccountId === id
                ? remaining.length > 0
                  ? remaining[0].id
                  : null
                : state.activeAccountId,
          };
        });
      },

      setActiveAccount: (id) => set({ activeAccountId: id }),

      _initializeMainWallet: (currencyCode, currencySymbol) => {
        const state = get();
        if (state.accounts.length > 0) {
          // Already initialized
          return state.accounts[0].id;
        }

        const newId = generateId();
        set({
          accounts: [
            {
              id: newId,
              name: 'Main Wallet',
              currencyCode,
              currencySymbol,
              color: '#6366F1',
              icon: 'wallet',
              createdAt: new Date().toISOString(),
            },
          ],
          activeAccountId: newId,
        });
        return newId;
      },
    }),
    {
      name: 'spendly-accounts',
      storage: createJSONStorage(() => zustandMMKVStorage),
    }
  )
);
