/**
 * Spendly — Gamification Store
 *
 * Zustand store for XP, levels, streaks, and achievements.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { zustandMMKVStorage } from '../services/storage';
import type { GamificationState, UserAchievement, UserLevel } from '../types/achievement';
import { achievements } from '../constants/achievements';
import { getLevelForXP, xpRewards } from '../constants/levels';
import { format } from 'date-fns';

interface GamificationActions {
  // XP
  addXP: (amount: number) => void;

  // Streaks
  logDailyActivity: () => void;
  logBudgetAdherence: () => void;
  resetStreak: (type: 'dailyLogging' | 'budgetAdherence') => void;

  // Achievements
  checkAndUnlockAchievement: (achievementId: string, currentValue: number) => boolean;
  getAchievement: (achievementId: string) => UserAchievement | undefined;
  getUnlockedAchievements: () => UserAchievement[];
  getLockedAchievements: () => UserAchievement[];

  // Combined actions
  onExpenseLogged: () => void;
  onIncomeLogged: () => void;
  onBudgetCreated: () => void;
  onSavingsGoalCreated: () => void;
  onSavingsGoalCompleted: () => void;
}

type GamificationStore = GamificationState & GamificationActions;

const initialAchievements: UserAchievement[] = achievements.map((a) => ({
  achievementId: a.id,
  currentValue: 0,
  isUnlocked: false,
  unlockedAt: null,
}));

export const useGamificationStore = create<GamificationStore>()(
  persist(
    (set, get) => ({
      xp: 0,
      level: 'beginner_saver' as UserLevel,
      streaks: {
        budgetAdherence: 0,
        dailyLogging: 0,
        lastLogDate: null,
        lastBudgetDate: null,
      },
      achievements: initialAchievements,

      addXP: (amount) => {
        set((state) => {
          const newXP = state.xp + amount;
          const newLevel = getLevelForXP(newXP);
          return { xp: newXP, level: newLevel.level };
        });
      },

      logDailyActivity: () => {
        const today = format(new Date(), 'yyyy-MM-dd');
        set((state) => {
          const yesterday = format(
            new Date(new Date().getTime() - 86400000),
            'yyyy-MM-dd',
          );
          const isConsecutive = state.streaks.lastLogDate === yesterday;
          const isSameDay = state.streaks.lastLogDate === today;

          if (isSameDay) return state;

          return {
            streaks: {
              ...state.streaks,
              dailyLogging: isConsecutive
                ? state.streaks.dailyLogging + 1
                : 1,
              lastLogDate: today,
            },
          };
        });
      },

      logBudgetAdherence: () => {
        const today = format(new Date(), 'yyyy-MM-dd');
        set((state) => {
          const yesterday = format(
            new Date(new Date().getTime() - 86400000),
            'yyyy-MM-dd',
          );
          const isConsecutive = state.streaks.lastBudgetDate === yesterday;
          const isSameDay = state.streaks.lastBudgetDate === today;

          if (isSameDay) return state;

          return {
            streaks: {
              ...state.streaks,
              budgetAdherence: isConsecutive
                ? state.streaks.budgetAdherence + 1
                : 1,
              lastBudgetDate: today,
            },
          };
        });
      },

      resetStreak: (type) => {
        set((state) => ({
          streaks: { ...state.streaks, [type]: 0 },
        }));
      },

      checkAndUnlockAchievement: (achievementId, currentValue) => {
        const achievement = achievements.find((a) => a.id === achievementId);
        if (!achievement) return false;

        const userAchievement = get().achievements.find(
          (a) => a.achievementId === achievementId,
        );
        if (!userAchievement || userAchievement.isUnlocked) return false;

        const shouldUnlock = currentValue >= achievement.requiredValue;

        set((state) => ({
          achievements: state.achievements.map((a) =>
            a.achievementId === achievementId
              ? {
                  ...a,
                  currentValue,
                  isUnlocked: shouldUnlock ? true : a.isUnlocked,
                  unlockedAt: shouldUnlock ? new Date().toISOString() : a.unlockedAt,
                }
              : a,
          ),
        }));

        if (shouldUnlock) {
          get().addXP(xpRewards.unlockAchievement);
        }

        return shouldUnlock;
      },

      getAchievement: (achievementId) =>
        get().achievements.find((a) => a.achievementId === achievementId),

      getUnlockedAchievements: () =>
        get().achievements.filter((a) => a.isUnlocked),

      getLockedAchievements: () =>
        get().achievements.filter((a) => !a.isUnlocked),

      onExpenseLogged: () => {
        const state = get();
        state.addXP(xpRewards.logExpense);
        state.logDailyActivity();

        // Check tracking achievements
        const totalExpenses = state.achievements.find(
          (a) => a.achievementId === 'first_expense',
        );
        const currentCount = (totalExpenses?.currentValue ?? 0) + 1;
        state.checkAndUnlockAchievement('first_expense', currentCount);
        state.checkAndUnlockAchievement('expense_10', currentCount);
        state.checkAndUnlockAchievement('expense_50', currentCount);
        state.checkAndUnlockAchievement('expense_100', currentCount);

        // Check streak achievements
        const dailyStreak = state.streaks.dailyLogging;
        state.checkAndUnlockAchievement('daily_streak_7', dailyStreak);
        state.checkAndUnlockAchievement('daily_streak_14', dailyStreak);
        state.checkAndUnlockAchievement('daily_streak_30', dailyStreak);
      },

      onIncomeLogged: () => {
        const state = get();
        state.addXP(xpRewards.logIncome);
        state.checkAndUnlockAchievement('first_income', 1);
      },

      onBudgetCreated: () => {
        const state = get();
        state.addXP(xpRewards.createBudget);
        state.checkAndUnlockAchievement('first_budget', 1);
      },

      onSavingsGoalCreated: () => {
        const state = get();
        state.addXP(xpRewards.createSavingsGoal);
        state.checkAndUnlockAchievement('first_goal', 1);
      },

      onSavingsGoalCompleted: () => {
        const state = get();
        state.addXP(xpRewards.completeSavingsGoal);
        const completedCount =
          state.achievements.find((a) => a.achievementId === 'goal_completed')
            ?.currentValue ?? 0;
        state.checkAndUnlockAchievement('goal_completed', completedCount + 1);
        state.checkAndUnlockAchievement('goals_completed_3', completedCount + 1);
      },
    }),
    {
      name: 'spendly-gamification',
      storage: createJSONStorage(() => zustandMMKVStorage),
    },
  ),
);
