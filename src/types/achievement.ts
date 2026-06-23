/**
 * Spendly Types — Achievement & Gamification
 */

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  requiredValue: number;
  category: AchievementCategory;
}

export type AchievementCategory = 'tracking' | 'budgeting' | 'saving' | 'milestone';

export interface UserAchievement {
  achievementId: string;
  currentValue: number;
  isUnlocked: boolean;
  unlockedAt: string | null;
}

export type UserLevel = `level_${number}`;

export interface GamificationState {
  xp: number;
  level: UserLevel;
  streaks: {
    budgetAdherence: number;   // consecutive days under budget
    dailyLogging: number;       // consecutive days logging expenses
    lastLogDate: string | null;
    lastBudgetDate: string | null;
  };
  achievements: UserAchievement[];
  purchasedThemes: string[];
}

export interface LevelDefinition {
  level: UserLevel;
  name: string;
  minXP: number;
  maxXP: number;
  icon: string;
  color: string;
}
