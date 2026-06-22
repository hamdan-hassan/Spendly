/**
 * Spendly — Financial Health Score Calculator
 *
 * Generates a 0-100 health score based on:
 * - Savings habits (0-33 points)
 * - Spending control (0-34 points)
 * - Budget adherence (0-33 points)
 */

import type { HealthScoreData } from '../types/analytics';

interface HealthScoreInput {
  totalIncome: number;
  totalExpenses: number;
  budgetTotal: number;
  budgetSpent: number;
  savingsGoalProgress: number; // 0-1
  previousMonthIncome: number;
  previousMonthExpenses: number;
}

export function calculateHealthScore(input: HealthScoreInput): HealthScoreData {
  const {
    totalIncome,
    totalExpenses,
    budgetTotal,
    budgetSpent,
    savingsGoalProgress,
    previousMonthIncome,
    previousMonthExpenses,
  } = input;

  // 1. Savings Habit Score (0-33)
  let savingsHabit = 0;
  if (totalIncome > 0) {
    const savingsRate = (totalIncome - totalExpenses) / totalIncome;
    if (savingsRate >= 0.3) savingsHabit = 33;
    else if (savingsRate >= 0.2) savingsHabit = 28;
    else if (savingsRate >= 0.1) savingsHabit = 22;
    else if (savingsRate >= 0.05) savingsHabit = 15;
    else if (savingsRate >= 0) savingsHabit = 8;
    else savingsHabit = 0;
  }
  // Bonus for savings goal progress
  savingsHabit = Math.min(33, savingsHabit + Math.round(savingsGoalProgress * 5));

  // 2. Spending Control Score (0-34)
  let spendingControl = 17; // base score
  if (previousMonthIncome > 0 && totalIncome > 0) {
    const currentRatio = totalExpenses / totalIncome;
    const previousRatio = previousMonthExpenses / previousMonthIncome;

    if (currentRatio < previousRatio) {
      spendingControl += 10; // spending ratio improved
    } else if (currentRatio > previousRatio * 1.1) {
      spendingControl -= 8; // spending ratio worsened significantly
    }
  }
  if (totalIncome > 0) {
    const expenseRatio = totalExpenses / totalIncome;
    if (expenseRatio <= 0.5) spendingControl += 7;
    else if (expenseRatio <= 0.7) spendingControl += 4;
    else if (expenseRatio <= 0.9) spendingControl += 1;
    else spendingControl -= 5;
  }
  spendingControl = Math.max(0, Math.min(34, spendingControl));

  // 3. Budget Adherence Score (0-33)
  let budgetAdherence = 20; // base score if no budget
  if (budgetTotal > 0) {
    const budgetUtilization = budgetSpent / budgetTotal;
    if (budgetUtilization <= 0.7) budgetAdherence = 33;
    else if (budgetUtilization <= 0.85) budgetAdherence = 28;
    else if (budgetUtilization <= 1.0) budgetAdherence = 22;
    else if (budgetUtilization <= 1.15) budgetAdherence = 12;
    else budgetAdherence = 5;
  }

  const score = savingsHabit + spendingControl + budgetAdherence;

  // Calculate previous score for trend
  let previousScore = 50; // default
  if (previousMonthIncome > 0) {
    const prevSavingsRate = (previousMonthIncome - previousMonthExpenses) / previousMonthIncome;
    previousScore = Math.round(Math.max(0, Math.min(100, prevSavingsRate * 100 + 30)));
  }

  const trend: 'up' | 'down' | 'stable' =
    score > previousScore + 3 ? 'up' :
    score < previousScore - 3 ? 'down' : 'stable';

  // Generate recommendations
  const recommendations: string[] = [];
  if (savingsHabit < 15) {
    recommendations.push('Try to save at least 10% of your income each month');
  }
  if (spendingControl < 15) {
    recommendations.push('Your spending has increased — review discretionary expenses');
  }
  if (budgetAdherence < 15 && budgetTotal > 0) {
    recommendations.push('You\'re over budget — consider adjusting your spending limits');
  }
  if (score >= 80) {
    recommendations.push('Excellent! Keep up your great financial habits');
  }

  return {
    score: Math.max(0, Math.min(100, score)),
    trend,
    previousScore: Math.max(0, Math.min(100, previousScore)),
    breakdown: {
      savingsHabit,
      spendingControl,
      budgetAdherence,
    },
    recommendations,
  };
}
