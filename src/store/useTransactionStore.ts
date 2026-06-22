/**
 * Spendly — Transaction Store
 *
 * Zustand store for managing transactions with MMKV persistence.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { zustandMMKVStorage } from '../services/storage';
import type { Transaction, TransactionType, PaymentMethod } from '../types/transaction';
import { generateId } from '../utils/generateId';
import { format, parseISO, isWithinInterval, startOfMonth, endOfMonth } from 'date-fns';

interface TransactionState {
  transactions: Transaction[];

  // Actions
  addTransaction: (data: {
    type: TransactionType;
    amount: number;
    categoryId: string;
    note: string;
    date: string;
    paymentMethod: PaymentMethod;
  }) => Transaction;
  updateTransaction: (id: string, data: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  duplicateTransaction: (id: string) => Transaction | null;

  // Queries
  getTransactionById: (id: string) => Transaction | undefined;
  getTransactionsByMonth: (month: string) => Transaction[];
  getTransactionsByType: (type: TransactionType, month?: string) => Transaction[];
  getTransactionsByCategory: (categoryId: string, month?: string) => Transaction[];
  getRecentTransactions: (limit: number) => Transaction[];
  searchTransactions: (query: string) => Transaction[];

  // Computed
  getMonthlyTotal: (type: TransactionType, month: string) => number;
  getDailySpending: (month: string) => { date: string; amount: number }[];
}

export const useTransactionStore = create<TransactionState>()(
  persist(
    (set, get) => ({
      transactions: [],

      addTransaction: (data) => {
        const now = new Date().toISOString();
        const transaction: Transaction = {
          id: generateId(),
          ...data,
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({
          transactions: [transaction, ...state.transactions],
        }));
        return transaction;
      },

      updateTransaction: (id, data) => {
        set((state) => ({
          transactions: state.transactions.map((t) =>
            t.id === id ? { ...t, ...data, updatedAt: new Date().toISOString() } : t,
          ),
        }));
      },

      deleteTransaction: (id) => {
        set((state) => ({
          transactions: state.transactions.filter((t) => t.id !== id),
        }));
      },

      duplicateTransaction: (id) => {
        const original = get().transactions.find((t) => t.id === id);
        if (!original) return null;
        const now = new Date().toISOString();
        const duplicate: Transaction = {
          ...original,
          id: generateId(),
          date: new Date().toISOString(),
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({
          transactions: [duplicate, ...state.transactions],
        }));
        return duplicate;
      },

      getTransactionById: (id) => {
        return get().transactions.find((t) => t.id === id);
      },

      getTransactionsByMonth: (month) => {
        const [year, m] = month.split('-');
        const start = startOfMonth(new Date(parseInt(year), parseInt(m) - 1, 1));
        const end = endOfMonth(start);
        return get().transactions.filter((t) => {
          const date = parseISO(t.date);
          return isWithinInterval(date, { start, end });
        });
      },

      getTransactionsByType: (type, month) => {
        let txns = get().transactions.filter((t) => t.type === type);
        if (month) {
          const [year, m] = month.split('-');
          const start = startOfMonth(new Date(parseInt(year), parseInt(m) - 1, 1));
          const end = endOfMonth(start);
          txns = txns.filter((t) => {
            const date = parseISO(t.date);
            return isWithinInterval(date, { start, end });
          });
        }
        return txns;
      },

      getTransactionsByCategory: (categoryId, month) => {
        let txns = get().transactions.filter((t) => t.categoryId === categoryId);
        if (month) {
          const [year, m] = month.split('-');
          const start = startOfMonth(new Date(parseInt(year), parseInt(m) - 1, 1));
          const end = endOfMonth(start);
          txns = txns.filter((t) => {
            const date = parseISO(t.date);
            return isWithinInterval(date, { start, end });
          });
        }
        return txns;
      },

      getRecentTransactions: (limit) => {
        return [...get().transactions]
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .slice(0, limit);
      },

      searchTransactions: (query) => {
        const q = query.toLowerCase();
        return get().transactions.filter(
          (t) =>
            t.note.toLowerCase().includes(q) ||
            t.categoryId.toLowerCase().includes(q) ||
            t.amount.toString().includes(q),
        );
      },

      getMonthlyTotal: (type, month) => {
        return get()
          .getTransactionsByType(type, month)
          .reduce((sum, t) => sum + t.amount, 0);
      },

      getDailySpending: (month) => {
        const expenses = get().getTransactionsByType('expense', month);
        const dailyMap: Record<string, number> = {};

        expenses.forEach((t) => {
          const day = format(parseISO(t.date), 'yyyy-MM-dd');
          dailyMap[day] = (dailyMap[day] || 0) + t.amount;
        });

        return Object.entries(dailyMap)
          .map(([date, amount]) => ({ date, amount }))
          .sort((a, b) => a.date.localeCompare(b.date));
      },
    }),
    {
      name: 'spendly-transactions',
      storage: createJSONStorage(() => zustandMMKVStorage),
    },
  ),
);
