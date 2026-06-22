/**
 * Spendly — Settings Screen
 *
 * Theme selection, currency, notifications, data management, achievements.
 */

import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, Alert, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { useThemeContext, type ThemeMode } from '@/theme';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useTransactionStore } from '@/store/useTransactionStore';
import { useBudgetStore } from '@/store/useBudgetStore';
import { useSavingsStore } from '@/store/useSavingsStore';
import { useGamificationStore } from '@/store/useGamificationStore';
import { useHaptics } from '@/hooks/useHaptics';
import { getLevelForXP, getLevelProgress } from '@/constants/levels';
import { achievements as allAchievements } from '@/constants/achievements';
import { currencies } from '@/constants/currencies';
import { clearAllData } from '@/services/storage';

export default function SettingsScreen() {
  const theme = useThemeContext();
  const insets = useSafeAreaInsets();
  const haptics = useHaptics();

  const settings = useSettingsStore();
  const xp = useGamificationStore((s) => s.xp);
  const level = useGamificationStore((s) => s.level);
  const streaks = useGamificationStore((s) => s.streaks);
  const unlockedAchievements = useGamificationStore((s) => s.getUnlockedAchievements());
  const transactions = useTransactionStore((s) => s.transactions);

  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false);
  const [currencySearch, setCurrencySearch] = useState('');

  const currentLevel = getLevelForXP(xp);
  const levelProgress = getLevelProgress(xp);

  const filteredCurrencies = currencySearch
    ? currencies.filter((c) =>
        c.code.toLowerCase().includes(currencySearch.toLowerCase()) ||
        c.name.toLowerCase().includes(currencySearch.toLowerCase()),
      )
    : currencies;

  const handleExportJSON = () => {
    Alert.alert('Export Data', 'Your data will be exported as JSON.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Export', onPress: () => haptics.success() },
    ]);
  };

  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'This will permanently delete all your transactions, budgets, goals, and achievements. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Everything',
          style: 'destructive',
          onPress: () => {
            haptics.error();
            clearAllData();
            Alert.alert('Done', 'All data has been cleared. Restart the app to begin fresh.');
          },
        },
      ],
    );
  };

  const themeOptions: { label: string; value: ThemeMode; icon: string }[] = [
    { label: 'Dark', value: 'dark', icon: 'moon-outline' },
    { label: 'Light', value: 'light', icon: 'sunny-outline' },
    { label: 'System', value: 'system', icon: 'phone-portrait-outline' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.bg.primary }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 16 }]}
      >
        <Text style={[styles.title, { color: theme.colors.text.primary, fontFamily: 'Inter_700Bold' }]}>
          Settings
        </Text>

        {/* Profile / Level Card */}
        <Animated.View entering={FadeInDown.delay(100).duration(600)}>
          <View style={[styles.profileCard, { backgroundColor: theme.colors.bg.secondary }]}>
            <View style={[styles.profileIcon, { backgroundColor: currentLevel.color + '20' }]}>
              <Ionicons name={currentLevel.icon as any} size={28} color={currentLevel.color} />
            </View>
            <View style={styles.profileInfo}>
              <Text style={[styles.profileName, { color: theme.colors.text.primary, fontFamily: 'Inter_600SemiBold' }]}>
                {settings.userName || 'Spendly User'}
              </Text>
              <Text style={[styles.profileLevel, { color: currentLevel.color, fontFamily: 'Inter_500Medium' }]}>
                {currentLevel.name}
              </Text>
              <View style={styles.xpRow}>
                <View style={[styles.xpBar, { backgroundColor: theme.colors.bg.tertiary }]}>
                  <View style={[styles.xpBarFill, { width: `${levelProgress * 100}%`, backgroundColor: currentLevel.color }]} />
                </View>
                <Text style={[styles.xpText, { color: theme.colors.text.tertiary, fontFamily: 'Inter_400Regular' }]}>
                  {xp} XP
                </Text>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Stats Row */}
        <Animated.View entering={FadeInDown.delay(150).duration(600)} style={styles.statsRow}>
          <View style={[styles.statBox, { backgroundColor: theme.colors.bg.secondary }]}>
            <Text style={[styles.statNumber, { color: theme.colors.text.primary, fontFamily: 'Inter_700Bold' }]}>
              {transactions.length}
            </Text>
            <Text style={[styles.statLabel, { color: theme.colors.text.tertiary, fontFamily: 'Inter_400Regular' }]}>
              Transactions
            </Text>
          </View>
          <View style={[styles.statBox, { backgroundColor: theme.colors.bg.secondary }]}>
            <Text style={[styles.statNumber, { color: theme.colors.text.primary, fontFamily: 'Inter_700Bold' }]}>
              {streaks.dailyLogging}
            </Text>
            <Text style={[styles.statLabel, { color: theme.colors.text.tertiary, fontFamily: 'Inter_400Regular' }]}>
              Day Streak
            </Text>
          </View>
          <View style={[styles.statBox, { backgroundColor: theme.colors.bg.secondary }]}>
            <Text style={[styles.statNumber, { color: theme.colors.text.primary, fontFamily: 'Inter_700Bold' }]}>
              {unlockedAchievements.length}/{allAchievements.length}
            </Text>
            <Text style={[styles.statLabel, { color: theme.colors.text.tertiary, fontFamily: 'Inter_400Regular' }]}>
              Badges
            </Text>
          </View>
        </Animated.View>

        {/* Appearance */}
        <Animated.View entering={FadeInDown.delay(200).duration(600)} style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text.tertiary, fontFamily: 'Inter_600SemiBold' }]}>
            APPEARANCE
          </Text>
          <View style={styles.themeRow}>
            {themeOptions.map((opt) => (
              <Pressable
                key={opt.value}
                onPress={() => { haptics.selection(); settings.setTheme(opt.value); }}
                style={[
                  styles.themeBtn,
                  {
                    backgroundColor: settings.theme === opt.value ? theme.colors.accent.primary : theme.colors.bg.secondary,
                  },
                ]}
              >
                <Ionicons
                  name={opt.icon as any}
                  size={20}
                  color={settings.theme === opt.value ? '#FFFFFF' : theme.colors.text.secondary}
                />
                <Text
                  style={[
                    styles.themeBtnText,
                    {
                      color: settings.theme === opt.value ? '#FFFFFF' : theme.colors.text.secondary,
                      fontFamily: 'Inter_500Medium',
                    },
                  ]}
                >
                  {opt.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </Animated.View>

        {/* Currency */}
        <Animated.View entering={FadeInDown.delay(250).duration(600)} style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text.tertiary, fontFamily: 'Inter_600SemiBold' }]}>
            CURRENCY
          </Text>
          <Pressable
            onPress={() => setShowCurrencyPicker(!showCurrencyPicker)}
            style={[styles.settingRow, { backgroundColor: theme.colors.bg.secondary }]}
          >
            <View style={styles.settingLeft}>
              <Ionicons name="cash-outline" size={20} color={theme.colors.accent.primary} />
              <Text style={[styles.settingLabel, { color: theme.colors.text.primary, fontFamily: 'Inter_500Medium' }]}>
                Currency
              </Text>
            </View>
            <View style={styles.settingRight}>
              <Text style={[styles.settingValue, { color: theme.colors.text.secondary, fontFamily: 'Inter_400Regular' }]}>
                {settings.currencySymbol} {settings.currencyCode}
              </Text>
              <Ionicons name="chevron-forward" size={18} color={theme.colors.text.tertiary} />
            </View>
          </Pressable>
          {showCurrencyPicker && (
            <View style={[styles.pickerList, { backgroundColor: theme.colors.bg.secondary }]}>
              {filteredCurrencies.slice(0, 20).map((c) => (
                <Pressable
                  key={c.code}
                  onPress={() => {
                    haptics.selection();
                    settings.setCurrency(c.code, c.symbol, c.locale);
                    setShowCurrencyPicker(false);
                  }}
                  style={[
                    styles.pickerItem,
                    c.code === settings.currencyCode && { backgroundColor: theme.colors.accent.primaryMuted },
                  ]}
                >
                  <Text style={styles.pickerFlag}>{c.flag}</Text>
                  <Text style={[styles.pickerCode, { color: theme.colors.text.primary, fontFamily: 'Inter_500Medium' }]}>
                    {c.code}
                  </Text>
                  <Text style={[styles.pickerName, { color: theme.colors.text.secondary, fontFamily: 'Inter_400Regular' }]}>
                    {c.name}
                  </Text>
                  <Text style={[styles.pickerSymbol, { color: theme.colors.text.tertiary, fontFamily: 'Inter_500Medium' }]}>
                    {c.symbol}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}
        </Animated.View>

        {/* Notifications */}
        <Animated.View entering={FadeInDown.delay(300).duration(600)} style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text.tertiary, fontFamily: 'Inter_600SemiBold' }]}>
            NOTIFICATIONS
          </Text>
          {[
            { key: 'dailyReminder', label: 'Daily Reminder', icon: 'alarm-outline' },
            { key: 'budgetAlerts', label: 'Budget Alerts', icon: 'warning-outline' },
            { key: 'savingsReminders', label: 'Savings Reminders', icon: 'flag-outline' },
            { key: 'weeklyReport', label: 'Weekly Report', icon: 'document-text-outline' },
          ].map((item) => (
            <View key={item.key} style={[styles.settingRow, { backgroundColor: theme.colors.bg.secondary }]}>
              <View style={styles.settingLeft}>
                <Ionicons name={item.icon as any} size={20} color={theme.colors.accent.primary} />
                <Text style={[styles.settingLabel, { color: theme.colors.text.primary, fontFamily: 'Inter_500Medium' }]}>
                  {item.label}
                </Text>
              </View>
              <Switch
                value={(settings.notifications as any)[item.key]}
                onValueChange={(v) => {
                  haptics.selection();
                  settings.setNotifications({ [item.key]: v });
                }}
                trackColor={{ false: theme.colors.bg.tertiary, true: theme.colors.accent.primary }}
                thumbColor="#FFFFFF"
              />
            </View>
          ))}
        </Animated.View>

        {/* Data Management */}
        <Animated.View entering={FadeInDown.delay(350).duration(600)} style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text.tertiary, fontFamily: 'Inter_600SemiBold' }]}>
            DATA
          </Text>
          {[
            { label: 'Export as JSON', icon: 'download-outline', color: theme.colors.accent.primary, onPress: handleExportJSON },
            { label: 'Clear All Data', icon: 'trash-outline', color: theme.colors.semantic.expense, onPress: handleClearData },
          ].map((item) => (
            <Pressable
              key={item.label}
              onPress={item.onPress}
              style={[styles.settingRow, { backgroundColor: theme.colors.bg.secondary }]}
            >
              <View style={styles.settingLeft}>
                <Ionicons name={item.icon as any} size={20} color={item.color} />
                <Text style={[styles.settingLabel, { color: theme.colors.text.primary, fontFamily: 'Inter_500Medium' }]}>
                  {item.label}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={theme.colors.text.tertiary} />
            </Pressable>
          ))}
        </Animated.View>

        {/* About */}
        <Animated.View entering={FadeInDown.delay(400).duration(600)} style={styles.section}>
          <View style={styles.about}>
            <Text style={[styles.appName, { color: theme.colors.text.primary, fontFamily: 'Inter_700Bold' }]}>
              Spendly
            </Text>
            <Text style={[styles.version, { color: theme.colors.text.tertiary, fontFamily: 'Inter_400Regular' }]}>
              Version 1.0.0
            </Text>
            <Text style={[styles.aboutText, { color: theme.colors.text.tertiary, fontFamily: 'Inter_400Regular' }]}>
              Your premium personal finance companion
            </Text>
          </View>
        </Animated.View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 20 },
  title: { fontSize: 28, letterSpacing: -0.5, marginBottom: 20 },

  // Profile
  profileCard: { flexDirection: 'row', borderRadius: 16, padding: 16, gap: 14, marginBottom: 16, alignItems: 'center' },
  profileIcon: { width: 56, height: 56, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  profileInfo: { flex: 1 },
  profileName: { fontSize: 17, marginBottom: 2 },
  profileLevel: { fontSize: 13, marginBottom: 8 },
  xpRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  xpBar: { flex: 1, height: 6, borderRadius: 3, overflow: 'hidden' },
  xpBarFill: { height: '100%', borderRadius: 3 },
  xpText: { fontSize: 11 },

  // Stats
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  statBox: { flex: 1, borderRadius: 14, padding: 14, alignItems: 'center', gap: 4 },
  statNumber: { fontSize: 20 },
  statLabel: { fontSize: 11 },

  // Section
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 12, letterSpacing: 1, marginBottom: 10 },

  // Theme Row
  themeRow: { flexDirection: 'row', gap: 8 },
  themeBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 12, borderRadius: 12 },
  themeBtnText: { fontSize: 13 },

  // Setting Row
  settingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderRadius: 14, padding: 14, marginBottom: 6 },
  settingLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  settingRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  settingLabel: { fontSize: 15 },
  settingValue: { fontSize: 14 },

  // Currency Picker
  pickerList: { borderRadius: 14, marginTop: 4, overflow: 'hidden' },
  pickerItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 12, gap: 10 },
  pickerFlag: { fontSize: 20 },
  pickerCode: { fontSize: 14, width: 40 },
  pickerName: { flex: 1, fontSize: 13 },
  pickerSymbol: { fontSize: 14 },

  // About
  about: { alignItems: 'center', paddingVertical: 24, gap: 4 },
  appName: { fontSize: 20 },
  version: { fontSize: 13 },
  aboutText: { fontSize: 13, marginTop: 4 },
});
