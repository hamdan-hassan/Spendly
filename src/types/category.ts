/**
 * Spendly Types — Category
 */

export type CategoryType = 'expense' | 'income';

export interface Category {
  id: string;
  name: string;
  icon: string;       // Ionicon name
  color: string;      // hex color
  type: CategoryType;
  isCustom: boolean;
}
