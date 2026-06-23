/**
 * Spendly — Settings Store
 *
 * Zustand store for app settings with MMKV persistence.
 * Handles theme, currency, notifications, and onboarding state.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { zustandMMKVStorage } from '../services/storage';
import type { AppSettings, NotificationSettings } from '../types/settings';
import type { ThemeMode } from '../theme';

interface SettingsState extends AppSettings {
  aiPersonality: boolean;
  setAIPersonality: (enabled: boolean) => void;
  // Actions
  setTheme: (theme: ThemeMode) => void;
  setCurrency: (code: string, symbol: string, locale: string) => void;
  setNotifications: (settings: Partial<NotificationSettings>) => void;
  setOnboardingComplete: () => void;
  setUserName: (name: string) => void;
  setRequireBiometrics: (require: boolean) => void;
  resetSettings: () => void;
}

const defaultSettings: AppSettings & { aiPersonality: boolean } = {
  theme: 'dark',
  currencyCode: 'USD',
  currencySymbol: '$',
  currencyLocale: 'en-US',
  notifications: {
    dailyReminder: false,
    dailyReminderTime: '08:00',
    budgetAlerts: false,
    budgetAlertThreshold: 80,
    savingsReminders: false,
    weeklyReport: false,
  },
  hasCompletedOnboarding: false,
  userName: '',
  isFirstLaunch: true,
  requireBiometrics: false,
  aiPersonality: true,
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...defaultSettings,

      setTheme: (theme) => set({ theme }),

      setAIPersonality: (enabled) => set({ aiPersonality: enabled }),

      setCurrency: (code, symbol, locale) =>
        set({ currencyCode: code, currencySymbol: symbol, currencyLocale: locale }),

      setNotifications: (settings) =>
        set((state) => ({
          notifications: { ...state.notifications, ...settings },
        })),

      setOnboardingComplete: () =>
        set({ hasCompletedOnboarding: true, isFirstLaunch: false }),

      setUserName: (name) => set({ userName: name }),

      setRequireBiometrics: (require) => set({ requireBiometrics: require }),

      resetSettings: () => set(defaultSettings),
    }),
    {
      name: 'spendly-settings',
      storage: createJSONStorage(() => zustandMMKVStorage),
    }
  )
);
