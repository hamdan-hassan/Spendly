/**
 * Spendly — Tab Navigator Layout
 *
 * Custom bottom tab bar with 5 tabs: Dashboard, Transactions, Budgets, Analytics, Settings.
 */

import React from 'react';
import { Tabs } from 'expo-router';
import { Platform, StyleSheet, View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeContext } from '@/theme';
import { useHaptics } from '@/hooks/useHaptics';
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

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.colors.tabBar,
          borderTopColor: theme.colors.border.default,
          borderTopWidth: StyleSheet.hairlineWidth,
          height: Platform.OS === 'ios' ? 88 : 64,
          paddingBottom: Platform.OS === 'ios' ? 28 : 8,
          paddingTop: 8,
          position: 'absolute',
          elevation: 0,
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
            <Ionicons name="home-outline" size={22} color={color} />
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
            <Ionicons name="swap-horizontal-outline" size={22} color={color} />
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
            <Ionicons name="wallet-outline" size={22} color={color} />
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
            <Ionicons name="bar-chart-outline" size={22} color={color} />
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
            <Ionicons name="settings-outline" size={22} color={color} />
          ),
        }}
        listeners={{
          tabPress: () => haptics.selection(),
        }}
      />
    </Tabs>
  );
}
