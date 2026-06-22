/**
 * Spendly Constants — Gamification Levels
 *
 * 5-tier level system with XP thresholds.
 */

import type { LevelDefinition, UserLevel } from '../types/achievement';

export const levels: LevelDefinition[] = [
  {
    level: 'beginner_saver',
    name: 'Beginner Saver',
    minXP: 0,
    maxXP: 499,
    icon: 'leaf-outline',
    color: '#10B981',
  },
  {
    level: 'smart_budgeter',
    name: 'Smart Budgeter',
    minXP: 500,
    maxXP: 1499,
    icon: 'calculator-outline',
    color: '#3B82F6',
  },
  {
    level: 'finance_explorer',
    name: 'Finance Explorer',
    minXP: 1500,
    maxXP: 3499,
    icon: 'compass-outline',
    color: '#8B5CF6',
  },
  {
    level: 'wealth_builder',
    name: 'Wealth Builder',
    minXP: 3500,
    maxXP: 6999,
    icon: 'trending-up-outline',
    color: '#F59E0B',
  },
  {
    level: 'money_master',
    name: 'Money Master',
    minXP: 7000,
    maxXP: Infinity,
    icon: 'diamond-outline',
    color: '#F43F5E',
  },
];

/** XP rewards for various actions */
export const xpRewards = {
  logExpense: 10,
  logIncome: 10,
  createBudget: 25,
  createSavingsGoal: 25,
  completeSavingsGoal: 100,
  stayUnderBudget: 15,      // per day
  dailyLogging: 5,          // bonus for daily streak
  unlockAchievement: 50,
} as const;

/** Get level definition for a given XP amount */
export function getLevelForXP(xp: number): LevelDefinition {
  for (let i = levels.length - 1; i >= 0; i--) {
    if (xp >= levels[i].minXP) {
      return levels[i];
    }
  }
  return levels[0];
}

/** Get level by name */
export function getLevelDefinition(level: UserLevel): LevelDefinition {
  return levels.find((l) => l.level === level) ?? levels[0];
}

/** Calculate progress within current level (0-1) */
export function getLevelProgress(xp: number): number {
  const currentLevel = getLevelForXP(xp);
  if (currentLevel.maxXP === Infinity) return 1;
  const levelRange = currentLevel.maxXP - currentLevel.minXP + 1;
  const progress = (xp - currentLevel.minXP) / levelRange;
  return Math.min(1, Math.max(0, progress));
}
