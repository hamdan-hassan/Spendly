/**
 * Spendly — Notification Service
 *
 * Local notification scheduling for daily reminders, budget alerts, etc.
 */

import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Request notification permissions.
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    return false;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Default',
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 250, 250, 250],
    });
  }

  return true;
}

/**
 * Schedule a daily expense reminder.
 */
export async function scheduleDailyReminder(hour: number = 8, minute: number = 0) {
  // Cancel existing daily reminders
  await cancelNotificationsByTag('daily-reminder');

  await Notifications.scheduleNotificationAsync({
    content: {
      title: '💰 Spendly Reminder',
      body: 'Don\'t forget to log your expenses today!',
      data: { type: 'daily-reminder' },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
    },
  });
}

/**
 * Schedule a budget warning notification.
 */
export async function sendBudgetWarning(budgetName: string, percentage: number) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: '⚠️ Budget Alert',
      body: `You've used ${percentage}% of your ${budgetName} budget. Spend carefully!`,
      data: { type: 'budget-warning' },
    },
    trigger: null, // Send immediately
  });
}

/**
 * Schedule a savings goal reminder.
 */
export async function sendSavingsReminder(goalName: string, remaining: number, currencySymbol: string) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: '🎯 Savings Goal',
      body: `You're ${currencySymbol}${remaining.toFixed(2)} away from "${goalName}". Keep going!`,
      data: { type: 'savings-reminder' },
    },
    trigger: null,
  });
}

/**
 * Cancel notifications by identifier tag.
 */
export async function cancelNotificationsByTag(tag: string) {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  for (const notification of scheduled) {
    if (notification.content.data?.type === tag) {
      await Notifications.cancelScheduledNotificationAsync(notification.identifier);
    }
  }
}

/**
 * Cancel all scheduled notifications.
 */
export async function cancelAllNotifications() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}
