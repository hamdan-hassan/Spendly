/**
 * Spendly — Savings Store
 *
 * Zustand store for managing savings goals with MMKV persistence.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { zustandMMKVStorage } from '../services/storage';
import type { SavingsGoal, SavingsContribution } from '../types/savings';
import { generateId } from '../utils/generateId';

interface SavingsState {
  goals: SavingsGoal[];

  // Actions
  addGoal: (data: {
    accountId: string;
    name: string;
    targetAmount: number;
    deadline: string;
    icon: string;
    color: string;
  }) => SavingsGoal;
  updateGoal: (id: string, data: Partial<SavingsGoal>) => void;
  deleteGoal: (id: string) => void;
  addContribution: (goalId: string, amount: number, note?: string) => void;
  markCompleted: (id: string) => void;

  // Multi-Account Support
  convertCurrency: (accountId: string, multiplier: number) => void;
  _assignToMainWallet: (mainWalletId: string) => void;

  // Queries
  getGoalById: (id: string) => SavingsGoal | undefined;
  getActiveGoals: () => SavingsGoal[];
  getCompletedGoals: () => SavingsGoal[];

  // Computed
  getTotalSaved: () => number;
  getTotalTarget: () => number;
}

export const useSavingsStore = create<SavingsState>()(
  persist(
    (set, get) => ({
      goals: [],

      addGoal: (data) => {
        const now = new Date().toISOString();
        const goal: SavingsGoal = {
          id: generateId(),
          ...data,
          currentAmount: 0,
          contributions: [],
          isCompleted: false,
          completedAt: null,
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({
          goals: [goal, ...state.goals],
        }));
        return goal;
      },

      updateGoal: (id, data) => {
        set((state) => ({
          goals: state.goals.map((g) =>
            g.id === id ? { ...g, ...data, updatedAt: new Date().toISOString() } : g,
          ),
        }));
      },

      deleteGoal: (id) => {
        set((state) => ({
          goals: state.goals.filter((g) => g.id !== id),
        }));
      },

      addContribution: (goalId, amount, note = '') => {
        const contribution: SavingsContribution = {
          id: generateId(),
          amount,
          date: new Date().toISOString(),
          note,
        };
        set((state) => ({
          goals: state.goals.map((g) => {
            if (g.id !== goalId) return g;
            const newAmount = g.currentAmount + amount;
            const isCompleted = newAmount >= g.targetAmount;
            return {
              ...g,
              currentAmount: newAmount,
              contributions: [...g.contributions, contribution],
              isCompleted,
              completedAt: isCompleted && !g.isCompleted ? new Date().toISOString() : g.completedAt,
              updatedAt: new Date().toISOString(),
            };
          }),
        }));
      },

      markCompleted: (id) => {
        set((state) => ({
          goals: state.goals.map((g) =>
            g.id === id
              ? { ...g, isCompleted: true, completedAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
              : g,
          ),
        }));
      },

      convertCurrency: (accountId, multiplier) => {
        set((state) => ({
          goals: state.goals.map((g) =>
            g.accountId === accountId
              ? {
                  ...g,
                  targetAmount: g.targetAmount * multiplier,
                  currentAmount: g.currentAmount * multiplier,
                  contributions: g.contributions.map((c) => ({
                    ...c,
                    amount: c.amount * multiplier,
                  })),
                }
              : g
          ),
        }));
      },

      _assignToMainWallet: (mainWalletId) => {
        set((state) => {
          let modified = false;
          const updated = state.goals.map((g) => {
            if (!g.accountId) {
              modified = true;
              return { ...g, accountId: mainWalletId };
            }
            return g;
          });
          return modified ? { goals: updated } : state;
        });
      },

      getGoalById: (id) => get().goals.find((g) => g.id === id),

      getActiveGoals: () => get().goals.filter((g) => !g.isCompleted),

      getCompletedGoals: () => get().goals.filter((g) => g.isCompleted),

      getTotalSaved: () =>
        get().goals.reduce((sum, g) => sum + g.currentAmount, 0),

      getTotalTarget: () =>
        get().goals.reduce((sum, g) => sum + g.targetAmount, 0),
    }),
    {
      name: 'spendly-savings',
      storage: createJSONStorage(() => zustandMMKVStorage),
    },
  ),
);
