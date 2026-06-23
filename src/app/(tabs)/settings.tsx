/**
 * Spendly — Settings Screen
 *
 * Theme selection, currency, notifications, data management, achievements.
 */

import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, Alert, Switch, TextInput, Platform, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { useThemeContext, premiumThemes, type ThemeMode } from '@/theme';
import ConfettiCannon from 'react-native-confetti-cannon';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useAccountStore } from '@/store/useAccountStore';
import { useTransactionStore } from '@/store/useTransactionStore';
import { useBudgetStore } from '@/store/useBudgetStore';
import { useSavingsStore } from '@/store/useSavingsStore';
import { useGamificationStore } from '@/store/useGamificationStore';
import { useHaptics } from '@/hooks/useHaptics';
import { getLevelForXP, getLevelProgress } from '@/constants/levels';
import { achievements as allAchievements } from '@/constants/achievements';
import { currencies, searchCurrencies } from '@/constants/currencies';
import { clearAllData } from '@/services/storage';
import { requestNotificationPermissions, scheduleDailyReminder, cancelNotificationsByTag } from '@/services/notifications';
import { exportDataAsJSON, exportDataAsPDF, importDataFromJSON } from '@/services/export';
import { BannerAd, BannerAdSize, useRewardedAd, RewardedAdEventType } from 'react-native-google-mobile-ads';
import { BANNER_AD_UNIT_ID, REWARDED_AD_UNIT_ID } from '@/services/ads';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function SettingsScreen() {
  const theme = useThemeContext();
  const insets = useSafeAreaInsets();
  const haptics = useHaptics();

  const settings = useSettingsStore();
  const accountStore = useAccountStore();
  const activeAccount = accountStore.accounts.find(a => a.id === accountStore.activeAccountId);
  
  const currentCurrencyCode = activeAccount?.currencyCode || settings.currencyCode;
  const currentCurrencySymbol = activeAccount?.currencySymbol || settings.currencySymbol;

  const xp = useGamificationStore((s) => s.xp);
  const level = useGamificationStore((s) => s.level);
  const streaks = useGamificationStore((s) => s.streaks);
  const allGamificationAchievements = useGamificationStore((s) => s.achievements);
  const unlockedAchievements = useMemo(() => allGamificationAchievements.filter((a) => a.isUnlocked), [allGamificationAchievements]);
  
  // Filter transactions for stats
  const allTransactions = useTransactionStore((s) => s.transactions);
  const transactions = useMemo(() => allTransactions.filter(t => t.accountId === accountStore.activeAccountId), [allTransactions, accountStore.activeAccountId]);
  
  const addXP = useGamificationStore((s) => s.addXP);

  const { isLoaded, isClosed, isEarnedReward, load, show } = useRewardedAd(REWARDED_AD_UNIT_ID, {
    requestNonPersonalizedAdsOnly: true,
  });

  React.useEffect(() => {
    load();
  }, [load, isClosed]);

  React.useEffect(() => {
    if (isEarnedReward) {
      addXP(200);
      Alert.alert("Reward Earned!", "You've earned +200 XP for watching an ad.");
    }
  }, [isEarnedReward, addXP]);

  const handleWatchAdForXP = () => {
    if (isLoaded) {
      show();
    } else {
      Alert.alert("Ad Not Ready", "Please wait a moment for the ad to load.");
    }
  };

  const [showConfetti, setShowConfetti] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editNameValue, setEditNameValue] = useState('');

  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false);
  const [currencySearch, setCurrencySearch] = useState('');
  
  const [showTimePicker, setShowTimePicker] = useState(false);
  const timePickerDate = useMemo(() => {
    const d = new Date();
    const [h, m] = ((settings.notifications as any).dailyReminderTime || '08:00').split(':');
    d.setHours(parseInt(h, 10));
    d.setMinutes(parseInt(m, 10));
    return d;
  }, [settings.notifications]);

  const currentLevel = getLevelForXP(xp);
  const levelProgress = getLevelProgress(xp);

  const filteredCurrencies = currencySearch ? searchCurrencies(currencySearch) : currencies;

  const handleCurrencySelect = (c: typeof currencies[0]) => {
    Alert.alert(
      `Change Currency to ${c.code}`,
      'What would you like to do?',
      [
        {
          text: 'Just Change Currency',
          onPress: () => {
            if (activeAccount) {
               accountStore.updateAccount(activeAccount.id, { currencyCode: c.code, currencySymbol: c.symbol });
            }
            settings.setCurrency(c.code, c.symbol, c.locale);
            setShowCurrencyPicker(false);
          }
        },
        {
          text: 'Change & Convert Amounts',
          onPress: async () => {
            try {
               const res = await fetch(`https://api.exchangerate-api.com/v4/latest/${currentCurrencyCode}`);
               const data = await res.json();
               const rate = data.rates[c.code];
               if (!rate) throw new Error('Rate not found');
               
               if (activeAccount) {
                 accountStore.updateAccount(activeAccount.id, { currencyCode: c.code, currencySymbol: c.symbol });
                 useTransactionStore.getState().convertCurrency(activeAccount.id, rate);
                 useBudgetStore.getState().convertCurrency(activeAccount.id, rate);
                 useSavingsStore.getState().convertCurrency(activeAccount.id, rate);
               }
               settings.setCurrency(c.code, c.symbol, c.locale);
               setShowCurrencyPicker(false);
               Alert.alert('Success', `Currency and all amounts have been converted to ${c.code}.`);
            } catch (e) {
               Alert.alert('Conversion Failed', 'Could not fetch live exchange rates. Check your internet connection.');
            }
          }
        },
        {
          text: 'Create New Account',
          onPress: () => {
            const newAcc = accountStore.addAccount({
              name: `${c.code} Wallet`,
              currencyCode: c.code,
              currencySymbol: c.symbol,
              color: '#10B981',
              icon: 'wallet',
            });
            accountStore.setActiveAccount(newAcc.id);
            settings.setCurrency(c.code, c.symbol, c.locale);
            setShowCurrencyPicker(false);
            Alert.alert('Account Created', `Created a new ${c.code} Wallet and switched to it.`);
          }
        },
        {
          text: 'Cancel',
          style: 'cancel'
        }
      ]
    );
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

  const purchasedThemes = useGamificationStore((s) => s.purchasedThemes);
  const purchaseTheme = useGamificationStore((s) => s.purchaseTheme);

  const themeOptions = useMemo(() => {
    const baseOptions: { label: string; value: string; icon: string; premium?: boolean; cost?: number }[] = [
      { label: 'Dark', value: 'dark', icon: 'moon-outline' },
      { label: 'Light', value: 'light', icon: 'sunny-outline' },
      { label: 'System', value: 'system', icon: 'phone-portrait-outline' },
    ];
    
    const pThemes = premiumThemes.map(t => ({
      label: t.name,
      value: t.id,
      icon: t.icon,
      premium: true,
      cost: t.cost,
    }));
    
    return [...baseOptions, ...pThemes];
  }, []);

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
              {isEditingName ? (
                <TextInput
                  style={[styles.profileName, { color: theme.colors.text.primary, fontFamily: 'Inter_600SemiBold', borderBottomWidth: 1, borderBottomColor: theme.colors.bg.tertiary, paddingVertical: 0, paddingHorizontal: 0, marginBottom: 0 }]}
                  value={editNameValue}
                  onChangeText={setEditNameValue}
                  autoFocus
                  onBlur={() => {
                    settings.setUserName(editNameValue.trim());
                    setIsEditingName(false);
                  }}
                  onSubmitEditing={() => {
                    settings.setUserName(editNameValue.trim());
                    setIsEditingName(false);
                  }}
                  returnKeyType="done"
                />
              ) : (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                  <Text style={[styles.profileName, { color: theme.colors.text.primary, fontFamily: 'Inter_600SemiBold', marginBottom: 0 }]}>
                    {settings.userName || 'Spendly User'}
                  </Text>
                  <Pressable hitSlop={10} onPress={() => { setIsEditingName(true); setEditNameValue(settings.userName || ''); }}>
                    <Ionicons name="pencil" size={14} color={theme.colors.text.tertiary} />
                  </Pressable>
                </View>
              )}
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

        {/* Free XP Reward */}
        <Animated.View entering={FadeInDown.delay(125).duration(600)} style={styles.section}>
          <Pressable
            onPress={handleWatchAdForXP}
            style={[styles.settingRow, { backgroundColor: theme.colors.accent.primary, paddingVertical: 18 }]}
          >
            <View style={styles.settingLeft}>
              <Ionicons name="play-circle" size={24} color="#FFFFFF" />
              <View>
                <Text style={[styles.settingLabel, { color: '#FFFFFF', fontFamily: 'Inter_700Bold' }]}>
                  Watch Ad for +200 XP
                </Text>
                <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12, fontFamily: 'Inter_400Regular' }}>
                  Level up faster and unlock achievements
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.8)" />
          </Pressable>

          <Pressable
            onPress={() => { haptics.selection(); router.push('/achievements'); }}
            style={[styles.settingRow, { backgroundColor: theme.colors.bg.secondary, marginTop: 12, paddingVertical: 18 }]}
          >
            <View style={styles.settingLeft}>
              <View style={[styles.settingIcon, { backgroundColor: '#F59E0B' + '20' }]}>
                <Ionicons name="trophy" size={20} color="#F59E0B" />
              </View>
              <View>
                <Text style={[styles.settingLabel, { color: theme.colors.text.primary, fontFamily: 'Inter_600SemiBold' }]}>
                  Trophy Room
                </Text>
                <Text style={{ color: theme.colors.text.tertiary, fontSize: 12, fontFamily: 'Inter_400Regular' }}>
                  View your unlocked badges and goals
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.text.tertiary} />
          </Pressable>
        </Animated.View>

        {/* Appearance */}
        <Animated.View entering={FadeInDown.delay(150).duration(600)} style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text.tertiary, fontFamily: 'Inter_600SemiBold' }]}>
            APPEARANCE
          </Text>
          <View style={[styles.themeRow, { flexWrap: 'wrap' }]}>
            {themeOptions.map((opt) => {
              const isUnlocked = !opt.premium || purchasedThemes.includes(opt.value);
              const isSelected = settings.theme === opt.value;
              return (
                <Pressable
                  key={opt.value}
                  onPress={() => { 
                    haptics.selection(); 
                    if (isUnlocked) {
                      settings.setTheme(opt.value);
                    } else {
                      Alert.alert(
                        `Unlock ${opt.label}?`,
                        `This premium theme costs ${opt.cost} XP. You currently have ${xp} XP.`,
                        [
                          { text: 'Cancel', style: 'cancel' },
                          {
                            text: `Unlock (${opt.cost} XP)`,
                            onPress: () => {
                              if (purchaseTheme(opt.value, opt.cost!)) {
                                haptics.success();
                                setShowConfetti(false); // reset
                                setTimeout(() => setShowConfetti(true), 100);
                                settings.setTheme(opt.value);
                              } else {
                                haptics.error();
                                Alert.alert('Not enough XP', 'Keep logging transactions and completing goals to earn more XP!');
                              }
                            }
                          }
                        ]
                      );
                    }
                  }}
                  style={[
                    styles.themeBtn,
                    {
                      width: '48%',
                      marginBottom: 8,
                      backgroundColor: isSelected ? theme.colors.accent.primary : theme.colors.bg.secondary,
                      opacity: isUnlocked ? 1 : 0.6,
                    },
                  ]}
                >
                  <Ionicons
                    name={isUnlocked ? opt.icon as any : 'lock-closed'}
                    size={20}
                    color={isSelected ? '#FFFFFF' : theme.colors.text.secondary}
                  />
                  <Text
                    style={[
                      styles.themeBtnText,
                      {
                        color: isSelected ? '#FFFFFF' : theme.colors.text.secondary,
                        fontFamily: 'Inter_500Medium',
                      },
                    ]}
                  >
                    {opt.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </Animated.View>

        {/* AI Personality */}
        <Animated.View entering={FadeInDown.delay(175).duration(600)} style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text.tertiary, fontFamily: 'Inter_600SemiBold' }]}>
            AI ASSISTANT
          </Text>
          <View style={[styles.settingRow, { backgroundColor: theme.colors.bg.secondary, paddingVertical: 12 }]}>
            <View style={styles.settingLeft}>
              <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#F59E0B20', alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontSize: 18 }}>🦉</Text>
              </View>
              <View>
                <Text style={[styles.settingLabel, { color: theme.colors.text.primary, fontFamily: 'Inter_600SemiBold' }]}>
                  Nova
                </Text>
                <Text style={{ color: theme.colors.text.tertiary, fontSize: 12, fontFamily: 'Inter_400Regular' }}>
                  Your AI Financial Advisor
                </Text>
              </View>
            </View>
            <Switch
              value={settings.aiPersonality}
              onValueChange={(val) => {
                haptics.selection();
                settings.setAIPersonality(val);
              }}
              trackColor={{ false: theme.colors.bg.tertiary, true: '#F59E0B' }}
              thumbColor="#FFFFFF"
            />
          </View>
        </Animated.View>

        {/* Security */}
        <Animated.View entering={FadeInDown.delay(225).duration(600)} style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text.tertiary, fontFamily: 'Inter_600SemiBold' }]}>
            SECURITY
          </Text>
          <View style={[styles.settingRow, { backgroundColor: theme.colors.bg.secondary }]}>
            <View style={styles.settingLeft}>
              <Ionicons name="lock-closed-outline" size={20} color={theme.colors.accent.primary} />
              <Text style={[styles.settingLabel, { color: theme.colors.text.primary, fontFamily: 'Inter_500Medium' }]}>
                Biometric App Lock
              </Text>
            </View>
            <Switch
              value={settings.requireBiometrics}
              onValueChange={(val) => {
                haptics.selection();
                settings.setRequireBiometrics(val);
              }}
              trackColor={{ false: theme.colors.bg.tertiary, true: theme.colors.accent.primary }}
              thumbColor="#FFFFFF"
            />
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
                {currentCurrencySymbol} {currentCurrencyCode}
              </Text>
              <Ionicons name="chevron-forward" size={18} color={theme.colors.text.tertiary} />
            </View>
          </Pressable>
          {showCurrencyPicker && (
            <View style={[styles.pickerList, { backgroundColor: theme.colors.bg.secondary }]}>
              <TextInput
                style={{ 
                  padding: 12, 
                  color: theme.colors.text.primary, 
                  borderBottomWidth: 1, 
                  borderBottomColor: theme.colors.bg.tertiary,
                  fontFamily: 'Inter_400Regular'
                }}
                placeholder="Search currency..."
                placeholderTextColor={theme.colors.text.tertiary}
                value={currencySearch}
                onChangeText={setCurrencySearch}
              />
              {filteredCurrencies.slice(0, 20).map((c) => (
                <Pressable
                  key={c.code}
                  onPress={() => {
                    haptics.selection();
                    handleCurrencySelect(c);
                  }}
                  style={[
                    styles.pickerItem,
                    c.code === currentCurrencyCode && { backgroundColor: theme.colors.accent.primaryMuted },
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
            <View key={item.key}>
              <View style={[styles.settingRow, { backgroundColor: theme.colors.bg.secondary }]}>
                <View style={styles.settingLeft}>
                  <Ionicons name={item.icon as any} size={20} color={theme.colors.accent.primary} />
                  <Text style={[styles.settingLabel, { color: theme.colors.text.primary, fontFamily: 'Inter_500Medium' }]}>
                    {item.label}
                  </Text>
                </View>
                <View style={styles.settingRight}>
                  {item.key === 'dailyReminder' && (settings.notifications as any)[item.key] && (
                    <Pressable 
                      onPress={() => setShowTimePicker(true)}
                      style={{ marginRight: 12, backgroundColor: theme.colors.bg.tertiary, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 }}
                    >
                      <Text style={{ color: theme.colors.text.primary, fontFamily: 'Inter_600SemiBold' }}>
                        {(settings.notifications as any).dailyReminderTime || '08:00'}
                      </Text>
                    </Pressable>
                  )}
                  <Switch
                    value={(settings.notifications as any)[item.key]}
                    onValueChange={async (v) => {
                      haptics.selection();
                      
                      if (v) {
                        const granted = await requestNotificationPermissions();
                        if (!granted) {
                          Alert.alert('Permission Required', 'Please enable notifications for Spendly in your device settings.');
                          settings.setNotifications({ [item.key]: false });
                          return;
                        }
                      }

                      settings.setNotifications({ [item.key]: v });

                      if (item.key === 'dailyReminder') {
                        if (v) {
                          const timeStr = (settings.notifications as any).dailyReminderTime || '08:00';
                          const [hour, min] = timeStr.split(':').map(Number);
                          await scheduleDailyReminder(hour, min);
                        } else {
                          await cancelNotificationsByTag('daily-reminder');
                        }
                      }
                    }}
                    trackColor={{ false: theme.colors.bg.tertiary, true: theme.colors.accent.primary }}
                    thumbColor="#FFFFFF"
                  />
                </View>
              </View>
              
              {item.key === 'dailyReminder' && showTimePicker && (
                <DateTimePicker
                  value={timePickerDate}
                  mode="time"
                  is24Hour={false}
                  display="default"
                  onChange={async (event, selectedDate) => {
                    if (Platform.OS === 'android') setShowTimePicker(false);
                    if (selectedDate) {
                      const h = selectedDate.getHours().toString().padStart(2, '0');
                      const m = selectedDate.getMinutes().toString().padStart(2, '0');
                      const timeStr = `${h}:${m}`;
                      settings.setNotifications({ dailyReminderTime: timeStr });
                      await scheduleDailyReminder(selectedDate.getHours(), selectedDate.getMinutes());
                    }
                  }}
                />
              )}
            </View>
          ))}
        </Animated.View>

        {/* Data Management */}
        <Animated.View entering={FadeInDown.delay(350).duration(600)} style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text.tertiary, fontFamily: 'Inter_600SemiBold' }]}>
            DATA
          </Text>
          {[
            { label: 'Import from JSON', icon: 'cloud-upload-outline', color: theme.colors.accent.primary, onPress: importDataFromJSON },
            { label: 'Export as JSON', icon: 'download-outline', color: theme.colors.accent.primary, onPress: exportDataAsJSON },
            { label: 'Export Monthly Report (PDF)', icon: 'document-text-outline', color: theme.colors.semantic.income, onPress: exportDataAsPDF },
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

        {/* AdMob Banner - Inline */}
        <View style={{ alignItems: 'center', marginTop: 12, marginBottom: 40 }}>
          <BannerAd 
            unitId={BANNER_AD_UNIT_ID} 
            size={BannerAdSize.MEDIUM_RECTANGLE} 
            requestOptions={{ requestNonPersonalizedAdsOnly: true }} 
          />
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>

      {showConfetti && (
        <View pointerEvents="none" style={StyleSheet.absoluteFill}>
          <ConfettiCannon
            count={100}
            origin={{ x: width / 2, y: -20 }}
            autoStart={true}
            fadeOut={true}
            fallSpeed={3000}
            explosionSpeed={350}
          />
        </View>
      )}
    </View>
  );
}

const { width } = Dimensions.get('window');

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
  themeRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  themeBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 12, borderRadius: 12 },
  themeBtnText: { fontSize: 13 },

  // Setting Row
  settingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderRadius: 14, padding: 14, marginBottom: 6 },
  settingLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  settingRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  settingLabel: { fontSize: 15 },
  settingValue: { fontSize: 14 },
  settingIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },

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
