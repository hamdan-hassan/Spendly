/**
 * Spendly Types — Settings
 */

import type { ThemeMode } from '../theme';

export interface AppSettings {
  theme: ThemeMode;
  currencyCode: string;      // ISO 4217 (e.g. 'USD', 'GHS', 'NGN')
  currencySymbol: string;    // e.g. '$', '₵', '₦'
  currencyLocale: string;    // e.g. 'en-US', 'en-GH'
  notifications: NotificationSettings;
  hasCompletedOnboarding: boolean;
  userName: string;
  isFirstLaunch: boolean;
}

export interface NotificationSettings {
  dailyReminder: boolean;
  dailyReminderTime: string;  // HH:mm format
  budgetAlerts: boolean;
  savingsReminders: boolean;
  weeklyReport: boolean;
}

export interface CurrencyInfo {
  code: string;
  name: string;
  symbol: string;
  locale: string;
  flag: string;  // emoji flag
}
