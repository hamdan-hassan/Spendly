/**
 * Spendly — Onboarding Flow
 *
 * Premium 3-step onboarding: Welcome → Features → Setup (currency + name).
 * Industry standard: brief value-prop slides, then a minimal setup step.
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, Pressable, TextInput, Dimensions, FlatList, NativeSyntheticEvent, NativeScrollEvent,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';

import { useThemeContext, gradients } from '@/theme';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useTransactionStore } from '@/store/useTransactionStore';
import { useBudgetStore } from '@/store/useBudgetStore';
import { useSavingsStore } from '@/store/useSavingsStore';
import { useHaptics } from '@/hooks/useHaptics';
import { detectUserCurrency } from '@/services/currencyDetection';
import { currencies } from '@/constants/currencies';
import { generateSeedTransactions, generateSeedBudgets, generateSeedSavingsGoals } from '@/utils/seedData';
import type { CurrencyInfo } from '@/types/settings';

const { width, height } = Dimensions.get('window');

interface OnboardingSlide {
  title: string;
  description: string;
  icon: string;
  gradient: readonly [string, string];
}

const slides: OnboardingSlide[] = [
  {
    title: 'Welcome to\nSpendly',
    description: 'Your premium personal finance companion. Track spending, build budgets, and achieve your financial goals.',
    icon: 'wallet',
    gradient: gradients.brand,
  },
  {
    title: 'Smart\nInsights',
    description: 'Understand your spending habits with beautiful charts, AI insights, and a financial health score.',
    icon: 'analytics',
    gradient: gradients.ocean,
  },
  {
    title: 'Achieve\nYour Goals',
    description: 'Set savings goals, earn achievements, and level up your financial journey. Everything works offline.',
    icon: 'trophy',
    gradient: gradients.premium,
  },
];

export default function OnboardingScreen() {
  const theme = useThemeContext();
  const insets = useSafeAreaInsets();
  const haptics = useHaptics();
  const flatListRef = useRef<FlatList>(null);

  const [currentPage, setCurrentPage] = useState(0);
  const [showSetup, setShowSetup] = useState(false);
  const [userName, setUserName] = useState('');
  const [detectedCurrency, setDetectedCurrency] = useState<CurrencyInfo | null>(null);
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyInfo | null>(null);
  const [loadingSeedData, setLoadingSeedData] = useState(false);

  const setOnboardingComplete = useSettingsStore((s) => s.setOnboardingComplete);
  const setUserNameStore = useSettingsStore((s) => s.setUserName);
  const setCurrency = useSettingsStore((s) => s.setCurrency);

  // Auto-detect currency on mount
  useEffect(() => {
    detectUserCurrency().then((currency) => {
      setDetectedCurrency(currency);
      setSelectedCurrency(currency);
    });
  }, []);

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const page = Math.round(e.nativeEvent.contentOffset.x / width);
    setCurrentPage(page);
  };

  const handleNext = () => {
    haptics.light();
    if (currentPage < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentPage + 1, animated: true });
    } else {
      setShowSetup(true);
    }
  };

  const handleComplete = async (withSeedData: boolean) => {
    haptics.success();

    if (userName.trim()) {
      setUserNameStore(userName.trim());
    }

    if (selectedCurrency) {
      setCurrency(selectedCurrency.code, selectedCurrency.symbol, selectedCurrency.locale);
    }

    if (withSeedData) {
      setLoadingSeedData(true);
      // Generate and load seed data
      const seedTxns = generateSeedTransactions();
      const seedBudgets = generateSeedBudgets();
      const seedGoals = generateSeedSavingsGoals();

      const txnStore = useTransactionStore.getState();
      seedTxns.forEach((t) => {
        txnStore.addTransaction({
          type: t.type,
          amount: t.amount,
          categoryId: t.categoryId,
          note: t.note,
          date: t.date,
          paymentMethod: t.paymentMethod,
        });
      });

      const budgetStore = useBudgetStore.getState();
      seedBudgets.forEach((b) => {
        const created = budgetStore.addBudget({
          name: b.name,
          categoryId: b.categoryId,
          amount: b.amount,
          period: b.period,
        });
        budgetStore.updateBudgetSpending(created.id, b.spent);
      });

      const savingsStore = useSavingsStore.getState();
      seedGoals.forEach((g) => {
        const created = savingsStore.addGoal({
          name: g.name,
          targetAmount: g.targetAmount,
          deadline: g.deadline,
          icon: g.icon,
          color: g.color,
        });
        g.contributions.forEach((c) => {
          savingsStore.addContribution(created.id, c.amount, c.note);
        });
      });

      setLoadingSeedData(false);
    }

    setOnboardingComplete();
    router.replace('/(tabs)');
  };

  if (showSetup) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.bg.primary }]}>
        <View style={[styles.setupContent, { paddingTop: insets.top + 40 }]}>
          <Animated.View entering={FadeInDown.delay(100).duration(600)}>
            <Text style={[styles.setupTitle, { color: theme.colors.text.primary, fontFamily: 'Inter_700Bold' }]}>
              Let's get started
            </Text>
            <Text style={[styles.setupSubtitle, { color: theme.colors.text.secondary, fontFamily: 'Inter_400Regular' }]}>
              Just a couple of things to personalize your experience
            </Text>
          </Animated.View>

          {/* Name Input */}
          <Animated.View entering={FadeInDown.delay(200).duration(600)} style={styles.setupField}>
            <Text style={[styles.setupLabel, { color: theme.colors.text.secondary, fontFamily: 'Inter_500Medium' }]}>
              Your Name (optional)
            </Text>
            <TextInput
              style={[styles.setupInput, { backgroundColor: theme.colors.bg.secondary, color: theme.colors.text.primary, fontFamily: 'Inter_400Regular' }]}
              placeholder="What should we call you?"
              placeholderTextColor={theme.colors.text.tertiary}
              value={userName}
              onChangeText={setUserName}
              autoFocus
            />
          </Animated.View>

          {/* Currency */}
          <Animated.View entering={FadeInDown.delay(300).duration(600)} style={styles.setupField}>
            <Text style={[styles.setupLabel, { color: theme.colors.text.secondary, fontFamily: 'Inter_500Medium' }]}>
              Your Currency
            </Text>
            {detectedCurrency && (
              <View style={[styles.detectedCard, { backgroundColor: theme.colors.accent.primaryMuted }]}>
                <Ionicons name="location-outline" size={16} color={theme.colors.accent.primary} />
                <Text style={[styles.detectedText, { color: theme.colors.accent.primary, fontFamily: 'Inter_500Medium' }]}>
                  Detected: {detectedCurrency.flag} {detectedCurrency.name} ({detectedCurrency.symbol})
                </Text>
              </View>
            )}
            <View style={styles.currencyGrid}>
              {(detectedCurrency
                ? [detectedCurrency, ...currencies.filter((c) => c.code !== detectedCurrency.code).slice(0, 11)]
                : currencies.slice(0, 12)
              ).map((c) => (
                <Pressable
                  key={c.code}
                  onPress={() => { haptics.selection(); setSelectedCurrency(c); }}
                  style={[
                    styles.currencyBtn,
                    {
                      backgroundColor: selectedCurrency?.code === c.code ? theme.colors.accent.primaryMuted : theme.colors.bg.secondary,
                      borderColor: selectedCurrency?.code === c.code ? theme.colors.accent.primary : 'transparent',
                      borderWidth: 1.5,
                    },
                  ]}
                >
                  <Text style={styles.currencyFlag}>{c.flag}</Text>
                  <Text style={[styles.currencyCode, { color: theme.colors.text.primary, fontFamily: 'Inter_600SemiBold' }]}>
                    {c.code}
                  </Text>
                  <Text style={[styles.currencySymbol, { color: theme.colors.text.tertiary, fontFamily: 'Inter_400Regular' }]}>
                    {c.symbol}
                  </Text>
                </Pressable>
              ))}
            </View>
          </Animated.View>

          {/* Action Buttons */}
          <Animated.View entering={FadeInDown.delay(400).duration(600)} style={styles.actionSection}>
            <Pressable
              onPress={() => handleComplete(true)}
              style={[styles.primaryBtn, { backgroundColor: theme.colors.accent.primary }]}
              disabled={loadingSeedData}
            >
              <Ionicons name="sparkles" size={20} color="#FFFFFF" />
              <Text style={[styles.primaryBtnText, { fontFamily: 'Inter_600SemiBold' }]}>
                {loadingSeedData ? 'Loading...' : 'Start with Sample Data'}
              </Text>
            </Pressable>
            <Pressable
              onPress={() => handleComplete(false)}
              style={[styles.secondaryBtn, { backgroundColor: theme.colors.bg.secondary }]}
            >
              <Text style={[styles.secondaryBtnText, { color: theme.colors.text.secondary, fontFamily: 'Inter_500Medium' }]}>
                Start Fresh
              </Text>
            </Pressable>
          </Animated.View>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.bg.primary }]}>
      <FlatList
        ref={flatListRef}
        data={slides}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        renderItem={({ item, index }) => (
          <View style={[styles.slide, { width }]}>
            <LinearGradient
              colors={item.gradient as [string, string]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.slideGradient}
            >
              <View style={[styles.slideIconBg, { marginTop: insets.top + 60 }]}>
                <Ionicons name={item.icon as any} size={64} color="rgba(255,255,255,0.9)" />
              </View>
            </LinearGradient>
            <View style={styles.slideContent}>
              <Animated.Text
                entering={FadeInDown.delay(200).duration(600)}
                style={[styles.slideTitle, { color: theme.colors.text.primary, fontFamily: 'Inter_700Bold' }]}
              >
                {item.title}
              </Animated.Text>
              <Animated.Text
                entering={FadeInDown.delay(300).duration(600)}
                style={[styles.slideDescription, { color: theme.colors.text.secondary, fontFamily: 'Inter_400Regular' }]}
              >
                {item.description}
              </Animated.Text>
            </View>
          </View>
        )}
        keyExtractor={(_, i) => String(i)}
      />

      {/* Pagination & Button */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
        <View style={styles.pagination}>
          {slides.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                {
                  backgroundColor: i === currentPage ? theme.colors.accent.primary : theme.colors.bg.tertiary,
                  width: i === currentPage ? 24 : 8,
                },
              ]}
            />
          ))}
        </View>
        <Pressable onPress={handleNext} style={[styles.nextBtn, { backgroundColor: theme.colors.accent.primary }]}>
          <Text style={[styles.nextBtnText, { fontFamily: 'Inter_600SemiBold' }]}>
            {currentPage === slides.length - 1 ? 'Get Started' : 'Next'}
          </Text>
          <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  // Slides
  slide: { flex: 1 },
  slideGradient: {
    height: height * 0.45,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  slideIconBg: {
    width: 120,
    height: 120,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  slideContent: {
    flex: 1,
    paddingHorizontal: 32,
    paddingTop: 32,
  },
  slideTitle: { fontSize: 34, letterSpacing: -0.8, lineHeight: 42, marginBottom: 14 },
  slideDescription: { fontSize: 16, lineHeight: 24 },

  // Footer
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    gap: 24,
  },
  pagination: { flexDirection: 'row', justifyContent: 'center', gap: 6, alignItems: 'center' },
  dot: { height: 8, borderRadius: 4 },
  nextBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 14,
  },
  nextBtnText: { color: '#FFFFFF', fontSize: 16 },

  // Setup
  setupContent: { flex: 1, paddingHorizontal: 24 },
  setupTitle: { fontSize: 28, letterSpacing: -0.5, marginBottom: 8 },
  setupSubtitle: { fontSize: 15, lineHeight: 22, marginBottom: 32 },
  setupField: { marginBottom: 24 },
  setupLabel: { fontSize: 14, marginBottom: 8 },
  setupInput: { borderRadius: 12, padding: 14, fontSize: 16 },

  detectedCard: { flexDirection: 'row', alignItems: 'center', gap: 6, padding: 10, borderRadius: 10, marginBottom: 12 },
  detectedText: { fontSize: 13 },

  currencyGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  currencyBtn: {
    width: '30%',
    flexGrow: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 10,
    gap: 6,
  },
  currencyFlag: { fontSize: 18 },
  currencyCode: { fontSize: 13 },
  currencySymbol: { fontSize: 13 },

  actionSection: { marginTop: 'auto', paddingBottom: 20, gap: 10 },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 14,
  },
  primaryBtnText: { color: '#FFFFFF', fontSize: 16 },
  secondaryBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
  },
  secondaryBtnText: { fontSize: 15 },
});
