/**
 * Spendly Constants — Gamification Levels
 *
 * Infinite, mathematically scaling progression system.
 */

import type { LevelDefinition } from '../types/achievement';

/** XP rewards for various actions (Boosted for premium feel) */
export const xpRewards = {
  logExpense: 50,
  logIncome: 50,
  createBudget: 100,
  createSavingsGoal: 100,
  completeSavingsGoal: 500,
  stayUnderBudget: 25,      // per day
  dailyLogging: 20,         // bonus for daily streak
  unlockAchievement: 150,
} as const;

/** 
 * Get level definition for a given XP amount using a mathematical scaling formula.
 * Formula: Level = floor(sqrt(xp / 100)) + 1
 */
export function getLevelForXP(xp: number): LevelDefinition {
  const levelNumber = Math.floor(Math.sqrt(xp / 100)) + 1;
  const minXP = Math.pow(levelNumber - 1, 2) * 100;
  const maxXP = Math.pow(levelNumber, 2) * 100 - 1;

  // Procedurally generate names, icons, and colors based on level tiers
  let name = '';
  let icon = 'leaf-outline';
  let color = '#10B981';

  if (levelNumber < 5) {
    name = `Bronze Saver ${levelNumber}`;
    icon = 'leaf-outline';
    color = '#10B981'; // Green
  } else if (levelNumber < 10) {
    name = `Silver Budgeter ${levelNumber - 4}`;
    icon = 'calculator-outline';
    color = '#3B82F6'; // Blue
  } else if (levelNumber < 20) {
    name = `Gold Explorer ${levelNumber - 9}`;
    icon = 'compass-outline';
    color = '#F59E0B'; // Gold
  } else if (levelNumber < 50) {
    name = `Diamond Builder ${levelNumber - 19}`;
    icon = 'diamond-outline';
    color = '#8B5CF6'; // Purple
  } else {
    name = `Titan Master ${levelNumber - 49}`;
    icon = 'flash-outline';
    color = '#EF4444'; // Red
  }

  return {
    level: `level_${levelNumber}`,
    name,
    minXP,
    maxXP,
    icon,
    color,
  };
}

/** Get level by generic ID (fallback if needed) */
export function getLevelDefinition(levelId: string): LevelDefinition {
  // If we just have a string ID, we'll try to extract the number, otherwise return Level 1.
  const numMatch = levelId.match(/level_(\d+)/);
  const num = numMatch ? parseInt(numMatch[1], 10) : 1;
  const xpEstimate = Math.pow(num - 1, 2) * 100;
  return getLevelForXP(xpEstimate);
}

/** Calculate progress within current level (0-1) */
export function getLevelProgress(xp: number): number {
  const currentLevel = getLevelForXP(xp);
  const levelRange = currentLevel.maxXP - currentLevel.minXP + 1;
  const progress = (xp - currentLevel.minXP) / levelRange;
  return Math.min(1, Math.max(0, progress));
}
