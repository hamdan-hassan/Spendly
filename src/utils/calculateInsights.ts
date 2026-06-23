/**
 * Spendly — Insight Generator
 *
 * Generates intelligent financial insights locally by comparing
 * current vs previous period spending patterns.
 */

import type { FinancialInsight, CategorySpending } from '../types/analytics';
import type { Transaction } from '../types/transaction';
import { getCategoryById } from '../constants/categories';
import { generateId } from './generateId';

interface InsightInput {
  currentMonthTransactions: Transaction[];
  previousMonthTransactions: Transaction[];
  currentMonthIncome: number;
  previousMonthIncome: number;
  currentMonthExpenses: number;
  previousMonthExpenses: number;
  budgetTotal: number;
  budgetSpent: number;
  currentCategorySpending: CategorySpending[];
  previousCategorySpending: CategorySpending[];
}

export function generateInsights(input: InsightInput): FinancialInsight[] {
  const insights: FinancialInsight[] = [];
  const {
    currentMonthIncome,
    previousMonthIncome,
    currentMonthExpenses,
    previousMonthExpenses,
    budgetTotal,
    budgetSpent,
    currentCategorySpending,
    previousCategorySpending,
  } = input;

  // 1. Spending comparison
  if (previousMonthExpenses > 0) {
    const changePercent = ((currentMonthExpenses - previousMonthExpenses) / previousMonthExpenses) * 100;
    if (changePercent > 15) {
      insights.push({
        id: generateId(),
        type: 'negative',
        icon: 'trending-up-outline',
        message: `Spending increased ${Math.round(changePercent)}% vs last month`,
        detail: `You've spent more this month compared to last month. Consider reviewing discretionary expenses.`,
      });
    } else if (changePercent < -10) {
      insights.push({
        id: generateId(),
        type: 'positive',
        icon: 'trending-down-outline',
        message: `Spending decreased ${Math.round(Math.abs(changePercent))}% vs last month`,
        detail: `Great job! You're spending less this month compared to last month.`,
      });
    }
  }

  // 2. Savings insight
  const currentSavings = currentMonthIncome - currentMonthExpenses;
  const previousSavings = previousMonthIncome - previousMonthExpenses;
  if (currentSavings > previousSavings && previousMonthIncome > 0) {
    insights.push({
      id: generateId(),
      type: 'positive',
      icon: 'wallet-outline',
      message: 'You\'re saving more than last month!',
      detail: `Net savings improved. Keep up the momentum!`,
    });
  } else if (currentSavings < 0) {
    insights.push({
      id: generateId(),
      type: 'negative',
      icon: 'warning-outline',
      message: 'You\'re spending more than you earn',
      detail: `Your expenses exceed income this month. Consider cutting non-essential spending.`,
    });
  }

  // 3. Category-specific insights
  for (const current of currentCategorySpending) {
    const previous = previousCategorySpending.find(
      (p) => p.categoryId === current.categoryId,
    );
    if (previous && previous.amount > 0) {
      const changePercent = ((current.amount - previous.amount) / previous.amount) * 100;
      const category = getCategoryById(current.categoryId);
      const categoryName = category?.name ?? current.categoryName;

      if (changePercent > 25 && current.amount > currentMonthExpenses * 0.1) {
        insights.push({
          id: generateId(),
          type: 'negative',
          icon: 'arrow-up-outline',
          message: `${categoryName} spending up ${Math.round(changePercent)}%`,
          detail: `${categoryName} spending increased significantly compared to last month.`,
        });
      } else if (changePercent < -25 && previous.amount > previousMonthExpenses * 0.1) {
        insights.push({
          id: generateId(),
          type: 'positive',
          icon: 'arrow-down-outline',
          message: `${categoryName} spending down ${Math.round(Math.abs(changePercent))}%`,
          detail: `You've reduced ${categoryName} spending compared to last month.`,
        });
      }
    }
  }

  // 4. Top spending category
  if (currentCategorySpending.length > 0) {
    const top = currentCategorySpending[0];
    if (top.percentage > 35) {
      insights.push({
        id: generateId(),
        type: 'neutral',
        icon: 'pie-chart-outline',
        message: `${top.categoryName} is ${Math.round(top.percentage)}% of your spending`,
        detail: `Consider diversifying your spending or finding savings opportunities in this category.`,
      });
    }
  }

  // 5. Budget insight
  if (budgetTotal > 0) {
    const utilization = budgetSpent / budgetTotal;
    if (utilization > 0.9 && utilization <= 1) {
      insights.push({
        id: generateId(),
        type: 'negative',
        icon: 'alert-circle-outline',
        message: 'Approaching budget limit',
        detail: `You've used ${Math.round(utilization * 100)}% of your monthly budget. Spend carefully for the rest of the month.`,
      });
    } else if (utilization > 1) {
      insights.push({
        id: generateId(),
        type: 'negative',
        icon: 'close-circle-outline',
        message: 'Budget exceeded!',
        detail: `You've exceeded your monthly budget by ${Math.round((utilization - 1) * 100)}%. Consider adjusting your limits.`,
      });
    } else if (utilization <= 0.5) {
      insights.push({
        id: generateId(),
        type: 'positive',
        icon: 'checkmark-circle-outline',
        message: 'Great budget discipline!',
        detail: `You've only used ${Math.round(utilization * 100)}% of your budget. You're on track!`,
      });
    }
  }

  // 6. Income insight
  if (previousMonthIncome > 0 && currentMonthIncome > previousMonthIncome) {
    const incomeChange = ((currentMonthIncome - previousMonthIncome) / previousMonthIncome) * 100;
    if (incomeChange > 10) {
      insights.push({
        id: generateId(),
        type: 'positive',
        icon: 'cash-outline',
        message: `Income increased ${Math.round(incomeChange)}%`,
        detail: `Your income grew this month. Consider putting the extra towards savings.`,
      });
    }
  }

  return insights.slice(0, 6); // Limit to 6 most relevant insights
}
