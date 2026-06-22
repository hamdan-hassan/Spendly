/**
 * Spendly Types — Analytics
 */

export interface AnalyticsSummary {
  totalIncome: number;
  totalExpenses: number;
  netSavings: number;
  topCategory: { id: string; name: string; amount: number } | null;
  categoryBreakdown: CategorySpending[];
  dailySpending: DailySpending[];
  monthlyComparison: MonthlyComparison[];
}

export interface CategorySpending {
  categoryId: string;
  categoryName: string;
  amount: number;
  percentage: number;
  color: string;
  icon: string;
}

export interface DailySpending {
  date: string;     // YYYY-MM-DD
  amount: number;
  income: number;
}

export interface MonthlyComparison {
  month: string;    // YYYY-MM
  income: number;
  expenses: number;
  savings: number;
}

export interface FinancialInsight {
  id: string;
  type: 'positive' | 'negative' | 'neutral';
  icon: string;
  message: string;
  detail: string;
}

export interface HealthScoreData {
  score: number;
  trend: 'up' | 'down' | 'stable';
  previousScore: number;
  breakdown: {
    savingsHabit: number;      // 0-33
    spendingControl: number;   // 0-34
    budgetAdherence: number;   // 0-33
  };
  recommendations: string[];
}
