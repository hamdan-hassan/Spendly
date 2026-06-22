/**
 * Spendly Constants — Achievements
 *
 * Achievement definitions for the gamification system.
 */

import type { Achievement } from '../types/achievement';

export const achievements: Achievement[] = [
  // Tracking achievements
  {
    id: 'first_expense',
    name: 'First Step',
    description: 'Log your first expense',
    icon: 'footsteps-outline',
    color: '#6366F1',
    requiredValue: 1,
    category: 'tracking',
  },
  {
    id: 'expense_10',
    name: 'Getting Started',
    description: 'Log 10 expenses',
    icon: 'list-outline',
    color: '#3B82F6',
    requiredValue: 10,
    category: 'tracking',
  },
  {
    id: 'expense_50',
    name: 'Expense Tracker',
    description: 'Log 50 expenses',
    icon: 'analytics-outline',
    color: '#8B5CF6',
    requiredValue: 50,
    category: 'tracking',
  },
  {
    id: 'expense_100',
    name: 'Diligent Recorder',
    description: 'Log 100 expenses',
    icon: 'medal-outline',
    color: '#EC4899',
    requiredValue: 100,
    category: 'tracking',
  },
  {
    id: 'daily_streak_7',
    name: 'Week Warrior',
    description: 'Log expenses for 7 days straight',
    icon: 'flame-outline',
    color: '#F97316',
    requiredValue: 7,
    category: 'tracking',
  },
  {
    id: 'daily_streak_14',
    name: 'Fortnight Force',
    description: 'Log expenses for 14 days straight',
    icon: 'flame-outline',
    color: '#EF4444',
    requiredValue: 14,
    category: 'tracking',
  },
  {
    id: 'daily_streak_30',
    name: 'Monthly Master',
    description: 'Log expenses for 30 days straight',
    icon: 'flame-outline',
    color: '#F43F5E',
    requiredValue: 30,
    category: 'tracking',
  },

  // Budgeting achievements
  {
    id: 'first_budget',
    name: 'Budget Beginner',
    description: 'Create your first budget',
    icon: 'wallet-outline',
    color: '#10B981',
    requiredValue: 1,
    category: 'budgeting',
  },
  {
    id: 'budget_streak_7',
    name: 'Budget Keeper',
    description: 'Stay under budget for 7 days',
    icon: 'shield-checkmark-outline',
    color: '#14B8A6',
    requiredValue: 7,
    category: 'budgeting',
  },
  {
    id: 'budget_streak_30',
    name: 'Budget Master',
    description: 'Stay under budget for 30 days',
    icon: 'trophy-outline',
    color: '#F59E0B',
    requiredValue: 30,
    category: 'budgeting',
  },

  // Saving achievements
  {
    id: 'first_goal',
    name: 'Goal Setter',
    description: 'Create your first savings goal',
    icon: 'flag-outline',
    color: '#06B6D4',
    requiredValue: 1,
    category: 'saving',
  },
  {
    id: 'goal_completed',
    name: 'Goal Crusher',
    description: 'Complete a savings goal',
    icon: 'star-outline',
    color: '#F59E0B',
    requiredValue: 1,
    category: 'saving',
  },
  {
    id: 'goals_completed_3',
    name: 'Savings Champion',
    description: 'Complete 3 savings goals',
    icon: 'ribbon-outline',
    color: '#8B5CF6',
    requiredValue: 3,
    category: 'saving',
  },

  // Milestone achievements
  {
    id: 'first_income',
    name: 'Income Tracker',
    description: 'Log your first income',
    icon: 'cash-outline',
    color: '#10B981',
    requiredValue: 1,
    category: 'milestone',
  },
  {
    id: 'all_categories',
    name: 'Well-Rounded',
    description: 'Use all expense categories',
    icon: 'color-palette-outline',
    color: '#D946EF',
    requiredValue: 14,
    category: 'milestone',
  },
  {
    id: 'health_score_80',
    name: 'Financial Fitness',
    description: 'Reach a health score of 80+',
    icon: 'fitness-outline',
    color: '#22D3EE',
    requiredValue: 80,
    category: 'milestone',
  },
];

/** Get achievement by ID */
export function getAchievementById(id: string): Achievement | undefined {
  return achievements.find((a) => a.id === id);
}
