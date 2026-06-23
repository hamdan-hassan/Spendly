/**
 * Spendly — Budget Store
 *
 * Zustand store for managing budgets with MMKV persistence.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { zustandMMKVStorage } from '../services/storage';
import type { Budget } from '../types/budget';
import { generateId } from '../utils/generateId';
import { getCurrentMonth } from '../utils/formatDate';

interface BudgetState {
  budgets: Budget[];

  // Actions
  addBudget: (data: {
    accountId: string;
    name: string;
    categoryId: string | null;
    amount: number;
    period: 'monthly' | 'weekly';
  }) => Budget;
  updateBudget: (id: string, data: Partial<Budget>) => void;
  deleteBudget: (id: string) => void;
  updateBudgetSpending: (budgetId: string, spent: number) => void;

  // Multi-Account Support
  convertCurrency: (accountId: string, multiplier: number) => void;
  _assignToMainWallet: (mainWalletId: string) => void;

  // Queries
  getBudgetById: (id: string) => Budget | undefined;
  getBudgetsByMonth: (month: string) => Budget[];
  getCurrentMonthBudgets: () => Budget[];
  getBudgetForCategory: (categoryId: string, month: string) => Budget | undefined;

  // Computed
  getTotalBudgeted: (month: string) => number;
  getTotalSpent: (month: string) => number;
  getOverspentBudgets: (month: string) => Budget[];
}

export const useBudgetStore = create<BudgetState>()(
  persist(
    (set, get) => ({
      budgets: [],

      addBudget: (data) => {
        const now = new Date().toISOString();
        const budget: Budget = {
          id: generateId(),
          ...data,
          spent: 0,
          month: getCurrentMonth(),
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({
          budgets: [budget, ...state.budgets],
        }));
        return budget;
      },

      updateBudget: (id, data) => {
        set((state) => ({
          budgets: state.budgets.map((b) =>
            b.id === id ? { ...b, ...data, updatedAt: new Date().toISOString() } : b,
          ),
        }));
      },

      deleteBudget: (id) => {
        set((state) => ({
          budgets: state.budgets.filter((b) => b.id !== id),
        }));
      },

      updateBudgetSpending: (budgetId, spent) => {
        set((state) => ({
          budgets: state.budgets.map((b) =>
            b.id === budgetId ? { ...b, spent, updatedAt: new Date().toISOString() } : b,
          ),
        }));
      },

      convertCurrency: (accountId, multiplier) => {
        set((state) => ({
          budgets: state.budgets.map((b) =>
            b.accountId === accountId
              ? { ...b, amount: b.amount * multiplier, spent: b.spent * multiplier }
              : b
          ),
        }));
      },

      _assignToMainWallet: (mainWalletId) => {
        set((state) => {
          let modified = false;
          const updated = state.budgets.map((b) => {
            if (!b.accountId) {
              modified = true;
              return { ...b, accountId: mainWalletId };
            }
            return b;
          });
          return modified ? { budgets: updated } : state;
        });
      },

      getBudgetById: (id) => get().budgets.find((b) => b.id === id),

      getBudgetsByMonth: (month) =>
        get().budgets.filter((b) => b.month === month),

      getCurrentMonthBudgets: () =>
        get().budgets.filter((b) => b.month === getCurrentMonth()),

      getBudgetForCategory: (categoryId, month) =>
        get().budgets.find(
          (b) => b.categoryId === categoryId && b.month === month,
        ),

      getTotalBudgeted: (month) =>
        get()
          .getBudgetsByMonth(month)
          .reduce((sum, b) => sum + b.amount, 0),

      getTotalSpent: (month) =>
        get()
          .getBudgetsByMonth(month)
          .reduce((sum, b) => sum + b.spent, 0),

      getOverspentBudgets: (month) =>
        get()
          .getBudgetsByMonth(month)
          .filter((b) => b.spent > b.amount),
    }),
    {
      name: 'spendly-budgets',
      storage: createJSONStorage(() => zustandMMKVStorage),
    },
  ),
);
