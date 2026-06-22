/**
 * Spendly — Export Service
 *
 * Export transaction data as JSON or CSV.
 */

import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-sharing';
import { useTransactionStore } from '../store/useTransactionStore';
import { useBudgetStore } from '../store/useBudgetStore';
import { useSavingsStore } from '../store/useSavingsStore';
import { getCategoryById } from '../constants/categories';
import { format } from 'date-fns';

interface ExportData {
  exportDate: string;
  version: string;
  transactions: any[];
  budgets: any[];
  savingsGoals: any[];
}

/**
 * Generate full JSON export of all app data.
 */
export function generateJSONExport(): string {
  const transactions = useTransactionStore.getState().transactions;
  const budgets = useBudgetStore.getState().budgets;
  const goals = useSavingsStore.getState().goals;

  const data: ExportData = {
    exportDate: new Date().toISOString(),
    version: '1.0.0',
    transactions,
    budgets,
    savingsGoals: goals,
  };

  return JSON.stringify(data, null, 2);
}

/**
 * Generate CSV export of transactions.
 */
export function generateCSVExport(): string {
  const transactions = useTransactionStore.getState().transactions;
  const headers = ['Date', 'Type', 'Category', 'Amount', 'Note', 'Payment Method'];
  const rows = transactions.map((t) => {
    const category = getCategoryById(t.categoryId);
    return [
      format(new Date(t.date), 'yyyy-MM-dd HH:mm'),
      t.type,
      category?.name ?? t.categoryId,
      t.amount.toFixed(2),
      `"${t.note.replace(/"/g, '""')}"`,
      t.paymentMethod,
    ].join(',');
  });

  return [headers.join(','), ...rows].join('\n');
}

/**
 * Generate monthly report data for PDF.
 */
export function generateMonthlyReportData(month: string) {
  const txnStore = useTransactionStore.getState();
  const budgetStore = useBudgetStore.getState();

  const monthTransactions = txnStore.getTransactionsByMonth(month);
  const income = monthTransactions
    .filter((t) => t.type === 'income')
    .reduce((s, t) => s + t.amount, 0);
  const expenses = monthTransactions
    .filter((t) => t.type === 'expense')
    .reduce((s, t) => s + t.amount, 0);

  // Category breakdown
  const categoryMap: Record<string, { name: string; amount: number; color: string }> = {};
  monthTransactions
    .filter((t) => t.type === 'expense')
    .forEach((t) => {
      const cat = getCategoryById(t.categoryId);
      const key = t.categoryId;
      if (!categoryMap[key]) {
        categoryMap[key] = { name: cat?.name ?? key, amount: 0, color: cat?.color ?? '#6B7280' };
      }
      categoryMap[key].amount += t.amount;
    });

  const categories = Object.values(categoryMap).sort((a, b) => b.amount - a.amount);
  const topCategory = categories[0] ?? null;

  const budgets = budgetStore.getBudgetsByMonth(month);
  const budgetAdherence = budgets.length > 0
    ? budgets.filter((b) => b.spent <= b.amount).length / budgets.length
    : 1;

  return {
    month,
    totalTransactions: monthTransactions.length,
    totalIncome: income,
    totalExpenses: expenses,
    netSavings: income - expenses,
    topCategory,
    categoryBreakdown: categories,
    budgetAdherence: Math.round(budgetAdherence * 100),
    budgets,
  };
}
