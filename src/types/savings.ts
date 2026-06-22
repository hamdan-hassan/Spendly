/**
 * Spendly Types — Savings Goal
 */

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string; // ISO 8601 date
  icon: string; // Ionicon name
  color: string; // hex color
  contributions: SavingsContribution[];
  isCompleted: boolean;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SavingsContribution {
  id: string;
  amount: number;
  date: string;
  note: string;
}

export interface SavingsFormData {
  name: string;
  targetAmount: string;
  deadline: Date;
  icon: string;
  color: string;
}
