/**
 * Spendly — Dashboard Screen
 *
 * The hero screen showing balance, spending summary, quick actions,
 * budget progress, and recent transactions.
 */

import React, { useMemo, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Dimensions,
  RefreshControl,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemeIcon } from '@/components/ThemeIcon';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { BarChart, LineChart } from 'react-native-gifted-charts';

import { useThemeContext, gradients } from '@/theme';
import { useAccountStore } from '@/store/useAccountStore';
import { useTransactionStore } from '@/store/useTransactionStore';
import { useBudgetStore } from '@/store/useBudgetStore';
import { useSavingsStore } from '@/store/useSavingsStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useGamificationStore } from '@/store/useGamificationStore';
import { useHaptics } from '@/hooks/useHaptics';
import { formatCurrency } from '@/utils/formatCurrency';
import { getCurrentMonth, formatRelativeDate, formatShortDate } from '@/utils/formatDate';
import { getCategoryById } from '@/constants/categories';
import { getLevelForXP } from '@/constants/levels';
import { exportDataAsPDF } from '@/services/export';
import { generateDashboardGreeting } from '@/services/roastEngine';

const { width } = Dimensions.get('window');

export default function DashboardScreen() {
  const theme = useThemeContext();
  const insets = useSafeAreaInsets();
  const haptics = useHaptics();
  const [refreshing, setRefreshing] = React.useState(false);

  const accountStore = useAccountStore();
  const activeAccount = accountStore.accounts.find(a => a.id === accountStore.activeAccountId);
  const currencySymbol = activeAccount?.currencySymbol || useSettingsStore((s) => s.currencySymbol);
  const [showAccountSwitcher, setShowAccountSwitcher] = React.useState(false);

  const userName = useSettingsStore((s) => s.userName);
  const hasCompletedOnboarding = useSettingsStore((s) => s.hasCompletedOnboarding);

  const currentMonth = getCurrentMonth();
  const rawTransactions = useTransactionStore((s) => s.transactions);
  const rawBudgets = useBudgetStore((s) => s.budgets);
  const rawGoals = useSavingsStore((s) => s.goals);

  // Filter all data by active account
  const allTransactions = useMemo(() => rawTransactions.filter(t => t.accountId === accountStore.activeAccountId), [rawTransactions, accountStore.activeAccountId]);
  const allBudgets = useMemo(() => rawBudgets.filter(b => b.accountId === accountStore.activeAccountId), [rawBudgets, accountStore.activeAccountId]);
  const allGoals = useMemo(() => rawGoals.filter(g => g.accountId === accountStore.activeAccountId), [rawGoals, accountStore.activeAccountId]);

  const xp = useGamificationStore((s) => s.xp);
  const level = useGamificationStore((s) => s.level);
  const streaks = useGamificationStore((s) => s.streaks);

  const monthlyTransactions = useMemo(() => 
    allTransactions.filter((t) => t.date.startsWith(currentMonth)), 
  [allTransactions, currentMonth]);

  const monthlyIncome = useMemo(() => 
    monthlyTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0), 
  [monthlyTransactions]);
  
  const monthlyExpenses = useMemo(() => 
    monthlyTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0), 
  [monthlyTransactions]);

  const balance = monthlyIncome - monthlyExpenses;
  
  const recentTransactions = useMemo(() => allTransactions.slice(0, 5), [allTransactions]);
  
  const budgets = useMemo(() =>
    allBudgets
      .filter((b) => b.month === currentMonth)
      .map((budget) => {
        // Dynamically calculate spent from actual transactions (same logic as budgets.tsx)
        const spent = monthlyTransactions
          .filter(t => t.type === 'expense' && t.categoryId === budget.categoryId)
          .reduce((sum, t) => sum + t.amount, 0);
        return { ...budget, spent };
      }),
  [allBudgets, currentMonth, monthlyTransactions]);
  
  const totalSaved = useMemo(() => allGoals.reduce((sum, g) => sum + g.currentAmount, 0), [allGoals]);
  
  const currentLevel = useMemo(() => getLevelForXP(xp), [xp]);

  const [chartType, setChartType] = React.useState<'line' | 'bar'>('line');
  const [chartPeriod, setChartPeriod] = React.useState<'week' | 'month'>('week');

  const chartData = useMemo(() => {
    const dailyMap = new Map<string, number>();
    const now = new Date();
    
    if (chartPeriod === 'week') {
      const transactionsToUse = allTransactions.filter(t => new Date(t.date).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000);
      transactionsToUse
        .filter(t => t.type === 'expense')
        .forEach(t => {
          const d = new Date(t.date);
          const day = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
          dailyMap.set(day, (dailyMap.get(day) || 0) + t.amount);
        });

      const data = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        const amount = dailyMap.get(dateStr) || 0;
        const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
        data.push({
          value: amount,
          label: dayName.slice(0, 2),
          frontColor: amount > 0 ? theme.colors.accent.primary : theme.colors.bg.tertiary,
          gradientColor: theme.colors.accent.primary + '80',
        });
      }
      return data;
    } else {
      // This Month
      monthlyTransactions
        .filter(t => t.type === 'expense')
        .forEach(t => {
          const d = new Date(t.date);
          const day = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
          dailyMap.set(day, (dailyMap.get(day) || 0) + t.amount);
        });

      const data = [];
      const daysToDraw = now.getDate();
      
      for (let i = 1; i <= daysToDraw; i++) {
        const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
        const amount = dailyMap.get(dateStr) || 0;
        data.push({
          value: amount,
          label: (i === 1 || i % 5 === 0 || i === daysToDraw) ? String(i) : '',
          frontColor: amount > 0 ? theme.colors.accent.primary : theme.colors.bg.tertiary,
          gradientColor: theme.colors.accent.primary + '80',
        });
      }
      return data;
    }
  }, [allTransactions, monthlyTransactions, chartPeriod, theme]);

  // Summary stats derived from chartData
  const chartStats = useMemo(() => {
    const nonZero = chartData.filter(d => d.value > 0);
    const total = chartData.reduce((s, d) => s + d.value, 0);
    const avg = nonZero.length > 0 ? total / nonZero.length : 0;
    const peak = Math.max(...chartData.map(d => d.value), 0);
    return { total, avg, peak };
  }, [chartData]);

  // Nice round Y-axis max
  const chartMaxValue = useMemo(() => {
    const maxVal = Math.max(...chartData.map(d => d.value), 1);
    const magnitude = Math.pow(10, Math.floor(Math.log10(maxVal)));
    for (const step of [1, 2, 2.5, 5, 10]) {
      const candidate = Math.ceil(maxVal / (magnitude * step)) * (magnitude * step);
      if (candidate >= maxVal) return candidate;
    }
    return Math.ceil(maxVal / magnitude) * magnitude;
  }, [chartData]);

  const yAxisFormatter = (label: string) => {
    const val = Number(label);
    if (isNaN(val) || val === 0) return '0';
    if (val >= 1_000_000_000) return `${Math.round(val / 1_000_000_000)}B`;
    if (val >= 1_000_000) return `${Math.round(val / 1_000_000)}M`;
    if (val >= 1_000) return `${Math.round(val / 1_000)}K`;
    return Math.round(val).toString();
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 500);
  }, []);

  const totalBudgeted = budgets.reduce((s, b) => s + b.amount, 0);
  const totalBudgetSpent = budgets.reduce((s, b) => s + b.spent, 0);
  const budgetPercentage = totalBudgeted > 0 ? Math.min(1, totalBudgetSpent / totalBudgeted) : 0;

  const aiPersonality = useSettingsStore((s) => s.aiPersonality);
  
  const smartInsight = useMemo(() => {
    if (aiPersonality) {
      return generateDashboardGreeting(balance, budgetPercentage);
    }
    
    if (monthlyExpenses === 0 && monthlyIncome === 0) {
      return "Welcome to Spendly! Log your first transaction to get started.";
    }
    if (monthlyExpenses > monthlyIncome && monthlyIncome > 0) {
      return `Warning: You have spent ${Math.round(((monthlyExpenses - monthlyIncome) / monthlyIncome) * 100)}% more than your income this month.`;
    }
    if (budgetPercentage > 0.9) {
      return `Careful! You have used ${Math.round(budgetPercentage * 100)}% of your total budget.`;
    }
    if (totalSaved > 0) {
      return `Incredible! You are actively tracking ${formatCurrency(totalSaved, currencySymbol)} in savings.`;
    }
    return `You're doing great! Keep logging your daily expenses to build your streak.`;
  }, [monthlyExpenses, monthlyIncome, budgetPercentage, totalSaved, currencySymbol, balance, aiPersonality]);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.bg.primary }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 16 }]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.accent.primary} />
        }
      >
        {/* Header */}
        <Animated.View entering={FadeInDown.delay(100).duration(600)} style={styles.header}>
          <View>
            <Text style={[styles.greeting, { color: theme.colors.text.secondary, fontFamily: 'Inter_400Regular' }]}>
              {getGreeting()}{userName ? `, ${userName}` : ''}
            </Text>
            <Pressable onPress={() => setShowAccountSwitcher(true)} style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
              <Text style={[styles.headerTitle, { color: theme.colors.text.primary, fontFamily: 'Inter_700Bold' }]}>
                {activeAccount?.name || 'Dashboard'}
              </Text>
              <Ionicons name="chevron-down" size={20} color={theme.colors.text.tertiary} />
            </Pressable>
          </View>
          <Pressable
            onPress={() => { haptics.light(); router.push('/settings' as any); }}
            style={[styles.levelBadge, { backgroundColor: currentLevel.color + '20' }]}
          >
            <Ionicons name={currentLevel.icon as any} size={16} color={currentLevel.color} />
            <Text style={[styles.levelText, { color: currentLevel.color, fontFamily: 'Inter_600SemiBold' }]}>
              Lv {xp}
            </Text>
          </Pressable>
        </Animated.View>

        {/* Smart Insights Engine */}
        <Animated.View entering={FadeInDown.delay(150).duration(600)} style={{ marginBottom: 20, padding: 16, backgroundColor: theme.colors.bg.secondary, borderRadius: 16, flexDirection: 'row', alignItems: 'center' }}>
          <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: theme.colors.accent.primary + '20', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
            <Ionicons name="sparkles-outline" size={20} color={theme.colors.accent.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 12, color: theme.colors.accent.primary, fontFamily: 'Inter_700Bold', textTransform: 'uppercase', marginBottom: 2 }}>Smart Insight</Text>
            <Text style={{ fontSize: 14, color: theme.colors.text.primary, fontFamily: 'Inter_500Medium', lineHeight: 20 }}>{smartInsight}</Text>
          </View>
        </Animated.View>

        {/* Spendly Wrapped Recap Button */}
        {monthlyTransactions.length > 0 && (
          <Animated.View entering={FadeInDown.delay(175).duration(600)} style={{ marginBottom: 20 }}>
            <Pressable
              onPress={() => { haptics.light(); router.push(`/wrapped/${currentMonth}` as any); }}
              style={({ pressed }) => [
                {
                  backgroundColor: theme.colors.accent.primary,
                  borderRadius: 16,
                  padding: 16,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  opacity: pressed ? 0.9 : 1,
                  shadowColor: theme.colors.accent.primary,
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 5,
                }
              ]}
            >
              <Ionicons name="film-outline" size={20} color="#FFFFFF" />
              <Text style={{ color: '#FFFFFF', fontFamily: 'Inter_700Bold', fontSize: 16 }}>
                View {new Date(currentMonth + '-01').toLocaleString('default', { month: 'long' })} Recap ✨
              </Text>
            </Pressable>
          </Animated.View>
        )}

        {/* Balance Card */}
        <Animated.View entering={FadeInDown.delay(200).duration(600)}>
          <LinearGradient
            colors={[theme.colors.accent.primary, theme.colors.accent.secondary] as [string, string]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.balanceCard}
          >
            <Text style={styles.balanceLabel}>Total Balance</Text>
            <Text style={styles.balanceAmount}>
              {formatCurrency(balance, currencySymbol)}
            </Text>
            <View style={styles.balanceRow}>
              <View style={styles.balanceStat}>
                <View style={styles.balanceStatIcon}>
                  <Ionicons name="arrow-down" size={14} color="#10B981" />
                </View>
                <View>
                  <Text style={styles.balanceStatLabel}>Income</Text>
                  <Text style={styles.balanceStatValue}>
                    {formatCurrency(monthlyIncome, currencySymbol, true)}
                  </Text>
                </View>
              </View>
              <View style={styles.balanceDivider} />
              <View style={styles.balanceStat}>
                <View style={[styles.balanceStatIcon, { backgroundColor: 'rgba(244,63,94,0.2)' }]}>
                  <Ionicons name="arrow-up" size={14} color="#F43F5E" />
                </View>
                <View>
                  <Text style={styles.balanceStatLabel}>Expenses</Text>
                  <Text style={styles.balanceStatValue}>
                    {formatCurrency(monthlyExpenses, currencySymbol, true)}
                  </Text>
                </View>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Quick Actions */}
        <Animated.View entering={FadeInDown.delay(300).duration(600)} style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text.primary, fontFamily: 'Inter_600SemiBold' }]}>
            Quick Actions
          </Text>
          <View style={styles.quickActions}>
            {[
              { icon: 'add-circle-outline' as const, label: 'Expense', color: theme.colors.semantic.expense, route: '/transaction/add?type=expense' },
              { icon: 'arrow-down-circle-outline' as const, label: 'Income', color: theme.colors.semantic.income, route: '/transaction/add?type=income' },
              { icon: 'wallet-outline' as const, label: 'Budget', color: theme.colors.accent.primary, route: '/budget/create' },
              { icon: 'flag-outline' as const, label: 'Goal', color: '#F59E0B', route: '/savings/create' },
              { icon: 'document-text-outline' as const, label: 'Report', color: '#8B5CF6', onPress: exportDataAsPDF },
            ].map((action, i) => (
              <Pressable
                key={i}
                onPress={() => { 
                  haptics.light(); 
                  if (action.onPress) {
                    action.onPress();
                  } else {
                    router.push(action.route as any); 
                  }
                }}
                style={[styles.quickActionBtn, { backgroundColor: theme.colors.bg.secondary }]}
              >
                <View style={[styles.quickActionIcon, { backgroundColor: action.color + '15' }]}>
                  <ThemeIcon name={action.icon} size={24} color={action.color} />
                </View>
                <Text
                  style={[styles.quickActionLabel, { color: theme.colors.text.secondary, fontFamily: 'Inter_500Medium' }]}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                >
                  {action.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </Animated.View>

        {/* Budget Progress */}
        {budgets.length > 0 && (
          <Animated.View entering={FadeInDown.delay(400).duration(600)} style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text.primary, fontFamily: 'Inter_600SemiBold' }]}>
              Budget Progress
            </Text>
            <View style={[styles.card, { backgroundColor: theme.colors.bg.secondary }]}>
              <View style={styles.budgetHeader}>
                <Text style={[styles.budgetSpent, { color: theme.colors.text.primary, fontFamily: 'Inter_600SemiBold' }]}>
                  {formatCurrency(totalBudgetSpent, currencySymbol)}
                </Text>
                <Text style={[styles.budgetTotal, { color: theme.colors.text.tertiary, fontFamily: 'Inter_400Regular' }]}>
                  / {formatCurrency(totalBudgeted, currencySymbol)}
                </Text>
              </View>
              <View style={[styles.progressBar, { backgroundColor: theme.colors.bg.tertiary }]}>
                <Animated.View
                  style={[
                    styles.progressFill,
                    {
                      width: `${budgetPercentage * 100}%`,
                      backgroundColor:
                        budgetPercentage > 0.9
                          ? theme.colors.semantic.expense
                          : budgetPercentage > 0.7
                          ? theme.colors.semantic.warning
                          : theme.colors.semantic.income,
                    },
                  ]}
                />
              </View>
              <Text style={[styles.budgetSubtext, { color: theme.colors.text.tertiary, fontFamily: 'Inter_400Regular' }]}>
                {Math.round(budgetPercentage * 100)}% used
                {budgetPercentage > 0.9 ? ' ⚠️ Almost exceeded!' : ''}
              </Text>
            </View>
          </Animated.View>
        )}

        {/* ── Spending Trend ────────────────────────────────── */}
        {chartData.length > 0 && (
          <Animated.View entering={FadeInDown.delay(500).duration(600)} style={styles.section}>
            {/* Section header */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text.primary, fontFamily: 'Inter_700Bold', marginBottom: 0 }]}>
                Spending Trend
              </Text>
              {/* Chart type toggle */}
              <View style={{ flexDirection: 'row', backgroundColor: theme.colors.bg.secondary, borderRadius: 10, padding: 3, gap: 2 }}>
                <Pressable
                  onPress={() => setChartType('line')}
                  style={{ paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, backgroundColor: chartType === 'line' ? theme.colors.accent.primary : 'transparent' }}
                >
                  <Ionicons name="analytics" size={14} color={chartType === 'line' ? '#FFF' : theme.colors.text.tertiary} />
                </Pressable>
                <Pressable
                  onPress={() => setChartType('bar')}
                  style={{ paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, backgroundColor: chartType === 'bar' ? theme.colors.accent.primary : 'transparent' }}
                >
                  <Ionicons name="bar-chart" size={14} color={chartType === 'bar' ? '#FFF' : theme.colors.text.tertiary} />
                </Pressable>
              </View>
            </View>

            {/* Period pill tabs */}
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 14 }}>
              {(['week', 'month'] as const).map((p) => (
                <Pressable
                  key={p}
                  onPress={() => setChartPeriod(p)}
                  style={{
                    paddingHorizontal: 16, paddingVertical: 7, borderRadius: 20,
                    backgroundColor: chartPeriod === p ? theme.colors.accent.primary : theme.colors.bg.secondary,
                  }}
                >
                  <Text style={{ fontSize: 13, fontFamily: 'Inter_600SemiBold', color: chartPeriod === p ? '#FFF' : theme.colors.text.tertiary }}>
                    {p === 'week' ? 'This Week' : 'This Month'}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Summary stats row */}
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 14 }}>
              {[
                { label: 'Total', value: formatCurrency(chartStats.total, currencySymbol, true) },
                { label: 'Daily Avg', value: formatCurrency(chartStats.avg, currencySymbol, true) },
                { label: 'Peak Day', value: formatCurrency(chartStats.peak, currencySymbol, true) },
              ].map((stat) => (
                <View key={stat.label} style={{ flex: 1, backgroundColor: theme.colors.bg.secondary, borderRadius: 12, padding: 10, alignItems: 'center' }}>
                  <Text style={{ color: theme.colors.text.tertiary, fontSize: 10, fontFamily: 'Inter_500Medium', textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 4 }}>
                    {stat.label}
                  </Text>
                  <Text style={{ color: theme.colors.text.primary, fontSize: 14, fontFamily: 'Inter_700Bold' }} numberOfLines={1} adjustsFontSizeToFit>
                    {stat.value}
                  </Text>
                </View>
              ))}
            </View>

            {/* Chart card */}
            <View style={[styles.card, { backgroundColor: theme.colors.bg.secondary, paddingRight: 0, paddingTop: 16, paddingBottom: 8 }]}>
              {chartType === 'bar' ? (
                <BarChart
                  data={chartData}
                  barWidth={chartPeriod === 'week' ? 26 : 7}
                  spacing={chartPeriod === 'week' ? 18 : 4}
                  roundedTop
                  noOfSections={4}
                  maxValue={chartMaxValue}
                  yAxisThickness={0}
                  xAxisThickness={1}
                  xAxisColor={theme.colors.bg.tertiary}
                  yAxisTextStyle={{ color: theme.colors.text.tertiary, fontSize: 10, fontFamily: 'Inter_400Regular' }}
                  xAxisLabelTextStyle={{ color: theme.colors.text.tertiary, fontSize: 10, fontFamily: 'Inter_500Medium' }}
                  rulesType="solid"
                  rulesColor={theme.colors.bg.tertiary + '80'}
                  barBorderRadius={5}
                  frontColor={theme.colors.accent.primary}
                  gradientColor={theme.colors.accent.primary + '50'}
                  showGradient
                  height={160}
                  width={width - 72}
                  isAnimated
                  animationDuration={800}
                  formatYLabel={yAxisFormatter}
                />
              ) : (
                <LineChart
                  data={chartData}
                  thickness={2.5}
                  color={theme.colors.accent.primary}
                  noOfSections={4}
                  maxValue={chartMaxValue}
                  yAxisThickness={0}
                  xAxisThickness={1}
                  xAxisColor={theme.colors.bg.tertiary}
                  yAxisTextStyle={{ color: theme.colors.text.tertiary, fontSize: 10, fontFamily: 'Inter_400Regular' }}
                  xAxisLabelTextStyle={{ color: theme.colors.text.tertiary, fontSize: 10, fontFamily: 'Inter_500Medium' }}
                  rulesType="solid"
                  rulesColor={theme.colors.bg.tertiary + '80'}
                  height={160}
                  width={width - 72}
                  isAnimated
                  animationDuration={800}
                  curved
                  hideDataPoints={chartPeriod === 'month'}
                  dataPointsColor={theme.colors.accent.primary}
                  dataPointsRadius={4}
                  startFillColor={theme.colors.accent.primary + '50'}
                  endFillColor={theme.colors.accent.primary + '00'}
                  startOpacity={0.5}
                  endOpacity={0}
                  areaChart
                  formatYLabel={yAxisFormatter}
                />
              )}
            </View>
          </Animated.View>
        )}

        {/* Savings & Streaks Row */}
        <Animated.View entering={FadeInDown.delay(600).duration(600)} style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: theme.colors.bg.secondary }]}>
            <View style={[styles.statIcon, { backgroundColor: theme.colors.semantic.incomeMuted }]}>
              <Ionicons name="trending-up" size={20} color={theme.colors.semantic.income} />
            </View>
            <Text style={[styles.statValue, { color: theme.colors.text.primary, fontFamily: 'Inter_700Bold' }]}>
              {formatCurrency(totalSaved, currencySymbol, true)}
            </Text>
            <Text style={[styles.statLabel, { color: theme.colors.text.tertiary, fontFamily: 'Inter_400Regular' }]}>
              Total Saved
            </Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: theme.colors.bg.secondary }]}>
            <View style={[styles.statIcon, { backgroundColor: 'rgba(249,115,22,0.15)' }]}>
              <Ionicons name="flame" size={20} color="#F97316" />
            </View>
            <Text style={[styles.statValue, { color: theme.colors.text.primary, fontFamily: 'Inter_700Bold' }]}>
              {streaks.dailyLogging}
            </Text>
            <Text style={[styles.statLabel, { color: theme.colors.text.tertiary, fontFamily: 'Inter_400Regular' }]}>
              Day Streak 🔥
            </Text>
          </View>
        </Animated.View>

        {/* Recent Transactions */}
        <Animated.View entering={FadeInDown.delay(700).duration(600)} style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text.primary, fontFamily: 'Inter_600SemiBold' }]}>
              Recent Transactions
            </Text>
            <Pressable onPress={() => router.push('/(tabs)/transactions')}>
              <Text style={[styles.seeAll, { color: theme.colors.accent.primary, fontFamily: 'Inter_500Medium' }]}>
                See All
              </Text>
            </Pressable>
          </View>
          {recentTransactions.length === 0 ? (
            <View style={[styles.emptyCard, { backgroundColor: theme.colors.bg.secondary }]}>
              <Ionicons name="receipt-outline" size={40} color={theme.colors.text.tertiary} />
              <Text style={[styles.emptyText, { color: theme.colors.text.tertiary, fontFamily: 'Inter_400Regular' }]}>
                No transactions yet
              </Text>
              <Pressable
                onPress={() => router.push('/transaction/add?type=expense' as any)}
                style={[styles.emptyBtn, { backgroundColor: theme.colors.accent.primary }]}
              >
                <Text style={[styles.emptyBtnText, { fontFamily: 'Inter_600SemiBold', color: theme.mode === 'frutiger-aero' ? theme.colors.text.primary : '#FFFFFF' }]}>
                  Add Your First Expense
                </Text>
              </Pressable>
            </View>
          ) : (
            <View style={[styles.transactionList, { backgroundColor: theme.colors.bg.secondary }]}>
              {recentTransactions.map((txn, i) => {
                const category = getCategoryById(txn.categoryId);
                const isExpense = txn.type === 'expense';
                return (
                  <View key={txn.id}>
                    <Pressable style={styles.transactionItem}>
                      <View style={[styles.txnIcon, { backgroundColor: (category?.color ?? '#6B7280') + '15' }]}>
                        <Ionicons
                          name={(category?.icon as any) ?? 'ellipse-outline'}
                          size={20}
                          color={category?.color ?? '#6B7280'}
                        />
                      </View>
                      <View style={styles.txnInfo}>
                        <Text style={[styles.txnNote, { color: theme.colors.text.primary, fontFamily: 'Inter_500Medium' }]}>
                          {txn.note || category?.name || 'Transaction'}
                        </Text>
                        <Text style={[styles.txnDate, { color: theme.colors.text.tertiary, fontFamily: 'Inter_400Regular' }]}>
                          {formatRelativeDate(txn.date)}
                        </Text>
                      </View>
                      <Text
                        style={[
                          styles.txnAmount,
                          {
                            color: isExpense ? theme.colors.semantic.expense : theme.colors.semantic.income,
                            fontFamily: 'Inter_600SemiBold',
                            maxWidth: '40%',
                          },
                        ]}
                        adjustsFontSizeToFit
                        minimumFontScale={0.5}
                        numberOfLines={1}
                      >
                        {isExpense ? '-' : '+'}{formatCurrency(txn.amount, currencySymbol)}
                      </Text>
                    </Pressable>
                    {i < recentTransactions.length - 1 && (
                      <View style={[styles.txnDivider, { backgroundColor: theme.colors.border.muted }]} />
                    )}
                  </View>
                );
              })}
            </View>
          )}
        </Animated.View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Account Switcher Modal */}
      <Modal visible={showAccountSwitcher} transparent animationType="fade">
        <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }} onPress={() => setShowAccountSwitcher(false)}>
          <View style={{ backgroundColor: theme.colors.bg.primary, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 }}>
            <Text style={{ fontSize: 18, fontFamily: 'Inter_700Bold', color: theme.colors.text.primary, marginBottom: 16 }}>Switch Account</Text>
            {accountStore.accounts.map(acc => (
              <Pressable 
                key={acc.id} 
                onPress={() => {
                   accountStore.setActiveAccount(acc.id);
                   setShowAccountSwitcher(false);
                }}
                style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: theme.colors.bg.tertiary }}
              >
                <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: acc.color + '20', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                  <Ionicons name={acc.icon as any} size={20} color={acc.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 16, fontFamily: 'Inter_600SemiBold', color: theme.colors.text.primary }}>{acc.name}</Text>
                  <Text style={{ fontSize: 14, fontFamily: 'Inter_400Regular', color: theme.colors.text.tertiary }}>{acc.currencyCode} - {acc.currencySymbol}</Text>
                </View>
                {acc.id === accountStore.activeAccountId && (
                  <Ionicons name="checkmark-circle" size={24} color={theme.colors.accent.primary} />
                )}
              </Pressable>
            ))}
            <Pressable 
               onPress={() => {
                 setShowAccountSwitcher(false);
                 router.push('/settings');
               }}
               style={{ marginTop: 16, padding: 16, alignItems: 'center', backgroundColor: theme.colors.bg.secondary, borderRadius: 12 }}
            >
              <Text style={{ color: theme.colors.text.primary, fontFamily: 'Inter_600SemiBold' }}>+ Manage Accounts in Settings</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 20 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  greeting: { fontSize: 14, marginBottom: 2 },
  headerTitle: { fontSize: 28, letterSpacing: -0.5 },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  levelText: { fontSize: 12 },

  // Balance Card
  balanceCard: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
  },
  balanceLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    marginBottom: 4,
  },
  balanceAmount: {
    color: '#FFFFFF',
    fontSize: 36,
    fontFamily: 'Inter_700Bold',
    letterSpacing: -1,
    marginBottom: 20,
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  balanceStat: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  balanceStatIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(16,185,129,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  balanceStatLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
  },
  balanceStatValue: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
  },
  balanceDivider: {
    width: 1,
    height: 36,
    backgroundColor: 'rgba(255,255,255,0.15)',
    marginHorizontal: 16,
  },

  // Sections
  section: { marginBottom: 24 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 18, marginBottom: 12 },
  seeAll: { fontSize: 14 },

  // Quick Actions
  quickActions: {
    flexDirection: 'row',
    gap: 10,
  },
  quickActionBtn: {
    flex: 1,
    alignItems: 'center',
    borderRadius: 16,
    padding: 14,
    gap: 8,
  },
  quickActionIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionLabel: { fontSize: 11, textAlign: 'center' },

  // Card
  card: {
    borderRadius: 16,
    padding: 16,
  },

  // Budget Progress
  budgetHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
    marginBottom: 12,
  },
  budgetSpent: { fontSize: 20 },
  budgetTotal: { fontSize: 14 },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  budgetSubtext: { fontSize: 12 },

  // Stats Row
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    gap: 8,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: { fontSize: 20 },
  statLabel: { fontSize: 12 },

  // Empty State
  emptyCard: {
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    gap: 12,
  },
  emptyText: { fontSize: 14, textAlign: 'center' },
  emptyBtn: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 4,
  },
  emptyBtnText: { color: '#FFFFFF', fontSize: 14 },

  // Transaction List
  transactionList: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  txnIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  txnInfo: { flex: 1 },
  txnNote: { fontSize: 15, marginBottom: 2 },
  txnDate: { fontSize: 12 },
  txnAmount: { fontSize: 15 },
  txnDivider: { height: StyleSheet.hairlineWidth, marginLeft: 66 },
});
