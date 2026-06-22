/**
 * Spendly Types — Transaction
 */

export type TransactionType = 'expense' | 'income';

export type PaymentMethod = 'cash' | 'card' | 'bank_transfer' | 'mobile_money' | 'other';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  categoryId: string;
  note: string;
  date: string; // ISO 8601
  paymentMethod: PaymentMethod;
  createdAt: string;
  updatedAt: string;
}

export interface TransactionFormData {
  type: TransactionType;
  amount: string;
  categoryId: string;
  note: string;
  date: Date;
  paymentMethod: PaymentMethod;
}
