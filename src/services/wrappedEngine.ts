import type { Transaction } from '@/types/transaction';
import { getCategoryById } from '@/constants/categories';

export interface WrappedData {
  month: string;
  totalIncome: number;
  totalExpenses: number;
  topCategoryName: string;
  topCategoryAmount: number;
  biggestPurchase: Transaction | null;
  personaTitle: string;
  personaDescription: string;
  personaEmoji: string;
}

export function generateWrappedData(transactions: Transaction[], monthStr: string): WrappedData | null {
  const monthTransactions = transactions.filter(t => t.date.startsWith(monthStr));
  
  if (monthTransactions.length === 0) {
    return null;
  }

  let totalIncome = 0;
  let totalExpenses = 0;
  let biggestPurchase: Transaction | null = null;
  
  const categoryTotals: Record<string, number> = {};

  monthTransactions.forEach(t => {
    if (t.type === 'income') {
      totalIncome += t.amount;
    } else {
      totalExpenses += t.amount;
      
      categoryTotals[t.categoryId] = (categoryTotals[t.categoryId] || 0) + t.amount;
      
      if (!biggestPurchase || t.amount > biggestPurchase.amount) {
        biggestPurchase = t;
      }
    }
  });

  // Find top category
  let topCategoryId = '';
  let topCategoryAmount = 0;
  Object.entries(categoryTotals).forEach(([catId, amount]) => {
    if (amount > topCategoryAmount) {
      topCategoryAmount = amount;
      topCategoryId = catId;
    }
  });

  const topCategoryName = getCategoryById(topCategoryId)?.name || 'Unknown';

  // Determine Persona
  let personaTitle = "The Balanced Budgeter";
  let personaDescription = "You keep things steady. Nothing too crazy, just solid financial habits.";
  let personaEmoji = "⚖️";

  if (totalExpenses > totalIncome && totalIncome > 0) {
    personaTitle = "The High Roller";
    personaDescription = "You spent more than you earned this month. Living life in the fast lane!";
    personaEmoji = "🏎️";
  } else if (totalIncome > 0 && totalExpenses === 0) {
    personaTitle = "The Untouchable";
    personaDescription = "Did you even leave your house? Incredible saving.";
    personaEmoji = "🧘";
  } else if (totalIncome > 0 && totalExpenses < totalIncome * 0.3) {
    personaTitle = "The Frugal Master";
    personaDescription = "You saved over 70% of what you made. Warren Buffett is taking notes.";
    personaEmoji = "👑";
  } else if (topCategoryId === 'food' || topCategoryId === 'dining') {
    personaTitle = "The Foodie";
    personaDescription = "Your stomach dictates your wallet. Hope it was delicious!";
    personaEmoji = "🍔";
  } else if (topCategoryId === 'shopping') {
    personaTitle = "The Shopaholic";
    personaDescription = "Packages arriving every day. Retail therapy at its finest.";
    personaEmoji = "🛍️";
  } else if (topCategoryId === 'entertainment') {
    personaTitle = "The Entertainer";
    personaDescription = "You know how to have a good time, and you're not afraid to pay for it.";
    personaEmoji = "🎭";
  }

  return {
    month: monthStr,
    totalIncome,
    totalExpenses,
    topCategoryName,
    topCategoryAmount,
    biggestPurchase,
    personaTitle,
    personaDescription,
    personaEmoji,
  };
}
