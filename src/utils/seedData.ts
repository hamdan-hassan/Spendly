/**
 * Spendly — Seed Data Generator
 *
 * Generates realistic sample data for 3 months to demonstrate the app.
 * Used during onboarding when user chooses to start with sample data.
 */

import { generateId } from './generateId';
import { format, subDays, subMonths, addDays } from 'date-fns';
import type { Transaction } from '../types/transaction';
import type { Budget } from '../types/budget';
import type { SavingsGoal } from '../types/savings';

const expenseCategoryWeights = [
  { id: 'food', min: 8, max: 35, frequency: 0.35 },
  { id: 'transport', min: 5, max: 25, frequency: 0.2 },
  { id: 'shopping', min: 15, max: 120, frequency: 0.12 },
  { id: 'entertainment', min: 10, max: 60, frequency: 0.1 },
  { id: 'bills', min: 30, max: 200, frequency: 0.08 },
  { id: 'health', min: 20, max: 100, frequency: 0.04 },
  { id: 'education', min: 25, max: 150, frequency: 0.03 },
  { id: 'groceries', min: 20, max: 80, frequency: 0.15 },
  { id: 'subscriptions', min: 5, max: 30, frequency: 0.05 },
  { id: 'fitness', min: 15, max: 50, frequency: 0.03 },
  { id: 'gifts', min: 20, max: 100, frequency: 0.02 },
  { id: 'other_expense', min: 5, max: 50, frequency: 0.03 },
];

const incomeTypes = [
  { id: 'salary', min: 2500, max: 5000, frequency: 1.0 },
  { id: 'freelancing', min: 200, max: 1500, frequency: 0.3 },
  { id: 'investments', min: 50, max: 500, frequency: 0.15 },
];

const paymentMethods = ['cash', 'card', 'bank_transfer', 'mobile_money'] as const;

const expenseNotes: Record<string, string[]> = {
  food: ['Lunch', 'Dinner', 'Coffee', 'Restaurant', 'Snacks', 'Breakfast'],
  transport: ['Uber', 'Bus fare', 'Gas', 'Parking', 'Metro'],
  shopping: ['Clothes', 'Electronics', 'Amazon', 'Home decor', 'Shoes'],
  entertainment: ['Netflix', 'Movie tickets', 'Concert', 'Games', 'Streaming'],
  bills: ['Electricity', 'Internet', 'Phone bill', 'Water bill', 'Insurance'],
  health: ['Pharmacy', 'Doctor visit', 'Dental', 'Vitamins'],
  education: ['Online course', 'Books', 'Workshop'],
  groceries: ['Weekly groceries', 'Farmer\'s market', 'Costco run'],
  subscriptions: ['Spotify', 'YouTube Premium', 'Cloud storage', 'App subscription'],
  fitness: ['Gym membership', 'Yoga class', 'Sports equipment'],
  gifts: ['Birthday gift', 'Anniversary', 'Holiday gift'],
  other_expense: ['Miscellaneous', 'Pet supplies', 'Dry cleaning'],
};

function randomBetween(min: number, max: number): number {
  return Math.round((Math.random() * (max - min) + min) * 100) / 100;
}

function randomItem<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function generateSeedTransactions(): Transaction[] {
  const transactions: Transaction[] = [];
  const now = new Date();

  // Generate 3 months of data
  for (let monthOffset = 0; monthOffset < 3; monthOffset++) {
    const monthDate = subMonths(now, monthOffset);
    const daysInMonth = new Date(
      monthDate.getFullYear(),
      monthDate.getMonth() + 1,
      0,
    ).getDate();

    // Generate expenses
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(monthDate.getFullYear(), monthDate.getMonth(), day);
      if (date > now) break;

      // 2-5 expenses per day
      const expensesPerDay = Math.floor(Math.random() * 4) + 2;
      for (let e = 0; e < expensesPerDay; e++) {
        const category =
          expenseCategoryWeights[
            Math.floor(Math.random() * expenseCategoryWeights.length)
          ];

        if (Math.random() > category.frequency * 3) continue;

        const notes = expenseNotes[category.id] || ['Expense'];
        const txnDate = new Date(date);
        txnDate.setHours(
          Math.floor(Math.random() * 14) + 8,
          Math.floor(Math.random() * 60),
        );

        transactions.push({
          id: generateId(),
          type: 'expense',
          amount: randomBetween(category.min, category.max),
          categoryId: category.id,
          note: randomItem(notes),
          date: txnDate.toISOString(),
          paymentMethod: randomItem(paymentMethods),
          createdAt: txnDate.toISOString(),
          updatedAt: txnDate.toISOString(),
        });
      }
    }

    // Generate income (1-3 per month)
    for (const income of incomeTypes) {
      if (Math.random() > income.frequency) continue;

      const day = income.id === 'salary' ? 1 : Math.floor(Math.random() * 28) + 1;
      const date = new Date(monthDate.getFullYear(), monthDate.getMonth(), day);
      if (date > now) continue;

      const noteMap: Record<string, string> = {
        salary: 'Monthly Salary',
        freelancing: 'Freelance Project',
        investments: 'Dividend Income',
      };

      transactions.push({
        id: generateId(),
        type: 'income',
        amount: randomBetween(income.min, income.max),
        categoryId: income.id,
        note: noteMap[income.id] || 'Income',
        date: date.toISOString(),
        paymentMethod: 'bank_transfer',
        createdAt: date.toISOString(),
        updatedAt: date.toISOString(),
      });
    }
  }

  return transactions.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
}

export function generateSeedBudgets(): Budget[] {
  const month = format(new Date(), 'yyyy-MM');
  const now = new Date().toISOString();

  return [
    {
      id: generateId(),
      name: 'Food & Dining',
      categoryId: 'food',
      amount: 500,
      spent: randomBetween(320, 480),
      period: 'monthly',
      month,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: generateId(),
      name: 'Transport',
      categoryId: 'transport',
      amount: 200,
      spent: randomBetween(120, 190),
      period: 'monthly',
      month,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: generateId(),
      name: 'Entertainment',
      categoryId: 'entertainment',
      amount: 150,
      spent: randomBetween(80, 160),
      period: 'monthly',
      month,
      createdAt: now,
      updatedAt: now,
    },
  ];
}

export function generateSeedSavingsGoals(): SavingsGoal[] {
  const now = new Date();

  return [
    {
      id: generateId(),
      name: 'Emergency Fund',
      targetAmount: 5000,
      currentAmount: randomBetween(3800, 4500),
      deadline: addDays(now, 45).toISOString(),
      icon: 'shield-checkmark-outline',
      color: '#10B981',
      contributions: [
        { id: generateId(), amount: 500, date: subDays(now, 60).toISOString(), note: 'Initial' },
        { id: generateId(), amount: 1000, date: subDays(now, 45).toISOString(), note: 'Monthly' },
        { id: generateId(), amount: 1000, date: subDays(now, 30).toISOString(), note: 'Monthly' },
        { id: generateId(), amount: 1000, date: subDays(now, 15).toISOString(), note: 'Monthly' },
      ],
      isCompleted: false,
      completedAt: null,
      createdAt: subDays(now, 90).toISOString(),
      updatedAt: now.toISOString(),
    },
    {
      id: generateId(),
      name: 'New Laptop',
      targetAmount: 1500,
      currentAmount: randomBetween(600, 900),
      deadline: addDays(now, 90).toISOString(),
      icon: 'laptop-outline',
      color: '#6366F1',
      contributions: [
        { id: generateId(), amount: 300, date: subDays(now, 30).toISOString(), note: 'Savings' },
        { id: generateId(), amount: 300, date: subDays(now, 15).toISOString(), note: 'Savings' },
      ],
      isCompleted: false,
      completedAt: null,
      createdAt: subDays(now, 60).toISOString(),
      updatedAt: now.toISOString(),
    },
  ];
}
