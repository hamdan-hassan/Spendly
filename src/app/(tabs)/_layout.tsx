/**
 * Spendly — Tab Navigator Layout
 *
 * Custom bottom tab bar with 5 tabs: Dashboard, Transactions, Budgets, Analytics, Settings.
 */

import React from 'react';
import { Tabs, Redirect } from 'expo-router';
import { Platform, StyleSheet, View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemeIcon } from '@/components/ThemeIcon';
import { useThemeContext } from '@/theme';
import { useHaptics } from '@/hooks/useHaptics';
import { useSettingsStore } from '@/store/useSettingsStore';
import Animated, { useAnimatedStyle, withSpring, useSharedValue, withTiming } from 'react-native-reanimated';

type TabIconName = 'home' | 'swap-horizontal' | 'wallet' | 'bar-chart' | 'settings';

const TAB_ICONS: Record<string, TabIconName> = {
  index: 'home',
  transactions: 'swap-horizontal',
  budgets: 'wallet',
  analytics: 'bar-chart',
  settings: 'settings',
};

export default function TabLayout() {
  const theme = useThemeContext();
  const haptics = useHaptics();
  const hasCompletedOnboarding = useSettingsStore((s) => s.hasCompletedOnboarding);

  if (!hasCompletedOnboarding) {
    return <Redirect href="/onboarding" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.colors.tabBar,
          borderTopWidth: 0,
          height: 64,
          paddingBottom: 0,
          paddingTop: 0,
          position: 'absolute',
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 12,
          borderRadius: 32,
          left: 20,
          right: 20,
          bottom: Platform.OS === 'ios' ? 32 : 16,
        },
        tabBarActiveTintColor: theme.colors.accent.primary,
        tabBarInactiveTintColor: theme.colors.text.tertiary,
        tabBarLabelStyle: {
          fontFamily: 'Inter_500Medium',
          fontSize: 11,
          marginTop: 2,
        },
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <ThemeIcon name="home-outline" size={22} color={color} />
          ),
        }}
        listeners={{
          tabPress: () => haptics.selection(),
        }}
      />
      <Tabs.Screen
        name="transactions"
        options={{
          title: 'Transactions',
          tabBarIcon: ({ color, size }) => (
            <ThemeIcon name="swap-horizontal-outline" size={22} color={color} />
          ),
        }}
        listeners={{
          tabPress: () => haptics.selection(),
        }}
      />
      <Tabs.Screen
        name="budgets"
        options={{
          title: 'Budgets',
          tabBarIcon: ({ color, size }) => (
            <ThemeIcon name="wallet-outline" size={22} color={color} />
          ),
        }}
        listeners={{
          tabPress: () => haptics.selection(),
        }}
      />
      <Tabs.Screen
        name="analytics"
        options={{
          title: 'Analytics',
          tabBarIcon: ({ color, size }) => (
            <ThemeIcon name="bar-chart-outline" size={22} color={color} />
          ),
        }}
        listeners={{
          tabPress: () => haptics.selection(),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => (
            <ThemeIcon name="settings-outline" size={22} color={color} />
          ),
        }}
        listeners={{
          tabPress: () => haptics.selection(),
        }}
      />
    </Tabs>
  );
}
