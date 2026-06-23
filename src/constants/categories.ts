/**
 * Spendly Constants — Categories
 *
 * Predefined expense and income categories with icons and colors.
 * Icons use Ionicons names from @expo/vector-icons.
 */

import type { Category } from '../types/category';
import { categoryColors } from '../theme/colors';

export const expenseCategories: Category[] = [
  { id: 'food', name: 'Food & Dining', icon: 'restaurant-outline', color: categoryColors.food, type: 'expense', isCustom: false },
  { id: 'transport', name: 'Transport', icon: 'car-outline', color: categoryColors.transport, type: 'expense', isCustom: false },
  { id: 'shopping', name: 'Shopping', icon: 'bag-handle-outline', color: categoryColors.shopping, type: 'expense', isCustom: false },
  { id: 'entertainment', name: 'Entertainment', icon: 'game-controller-outline', color: categoryColors.entertainment, type: 'expense', isCustom: false },
  { id: 'bills', name: 'Bills & Utilities', icon: 'receipt-outline', color: categoryColors.bills, type: 'expense', isCustom: false },
  { id: 'health', name: 'Health', icon: 'heart-outline', color: categoryColors.health, type: 'expense', isCustom: false },
  { id: 'education', name: 'Education', icon: 'school-outline', color: categoryColors.education, type: 'expense', isCustom: false },
  { id: 'rent', name: 'Rent & Housing', icon: 'home-outline', color: categoryColors.rent, type: 'expense', isCustom: false },
  { id: 'travel', name: 'Travel', icon: 'airplane-outline', color: categoryColors.travel, type: 'expense', isCustom: false },
  { id: 'groceries', name: 'Groceries', icon: 'cart-outline', color: categoryColors.groceries, type: 'expense', isCustom: false },
  { id: 'subscriptions', name: 'Subscriptions', icon: 'card-outline', color: categoryColors.subscriptions, type: 'expense', isCustom: false },
  { id: 'fitness', name: 'Fitness', icon: 'barbell-outline', color: categoryColors.fitness, type: 'expense', isCustom: false },
  { id: 'gifts', name: 'Gifts', icon: 'gift-outline', color: categoryColors.gifts, type: 'expense', isCustom: false },
  { id: 'savings', name: 'Savings & Investments', icon: 'wallet-outline', color: '#10B981', type: 'expense', isCustom: false },
  { id: 'other_expense', name: 'Other', icon: 'ellipsis-horizontal-circle-outline', color: categoryColors.other, type: 'expense', isCustom: false },
];

export const incomeCategories: Category[] = [
  { id: 'salary', name: 'Salary', icon: 'briefcase-outline', color: '#10B981', type: 'income', isCustom: false },
  { id: 'freelancing', name: 'Freelancing', icon: 'laptop-outline', color: '#3B82F6', type: 'income', isCustom: false },
  { id: 'business', name: 'Business', icon: 'storefront-outline', color: '#8B5CF6', type: 'income', isCustom: false },
  { id: 'investments', name: 'Investments', icon: 'trending-up-outline', color: '#F59E0B', type: 'income', isCustom: false },
  { id: 'gifts_income', name: 'Gifts', icon: 'gift-outline', color: '#EC4899', type: 'income', isCustom: false },
  { id: 'other_income', name: 'Other', icon: 'ellipsis-horizontal-circle-outline', color: '#6B7280', type: 'income', isCustom: false },
];

export const allCategories: Category[] = [...expenseCategories, ...incomeCategories];

/** Get a category by ID */
export function getCategoryById(id: string): Category | undefined {
  return allCategories.find((c) => c.id === id);
}

/** Get categories by type */
export function getCategoriesByType(type: 'expense' | 'income'): Category[] {
  return type === 'expense' ? expenseCategories : incomeCategories;
}
