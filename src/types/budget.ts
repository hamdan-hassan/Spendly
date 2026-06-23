/**
 * Spendly Types — Budget
 */

export interface Budget {
  id: string;
  accountId?: string; // Optional for backward compatibility before migration
  name: string;
  categoryId: string | null; // null = overall budget
  amount: number;
  spent: number;
  period: 'monthly' | 'weekly';
  month: string; // 'YYYY-MM' format
  createdAt: string;
  updatedAt: string;
}

export interface BudgetFormData {
  name: string;
  categoryId: string | null;
  amount: string;
  period: 'monthly' | 'weekly';
}
