/**
 * Spendly — Analytics Screen
 *
 * Charts, insights, and financial health score.
 */

import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, Dimensions, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { PieChart, BarChart, LineChart } from 'react-native-gifted-charts';

import { useThemeContext } from '@/theme';
import { useAccountStore } from '@/store/useAccountStore';
import { useTransactionStore } from '@/store/useTransactionStore';
import { useBudgetStore } from '@/store/useBudgetStore';
import { useSavingsStore } from '@/store/useSavingsStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useGamificationStore } from '@/store/useGamificationStore';
import { useHaptics } from '@/hooks/useHaptics';
import { formatCurrency } from '@/utils/formatCurrency';
import { getCurrentMonth, getPreviousMonth, getMonthLabel } from '@/utils/formatDate';
import { getCategoryById, expenseCategories } from '@/constants/categories';
import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';
import { BANNER_AD_UNIT_ID } from '@/services/ads';
import { calculateHealthScore } from '@/utils/calculateHealthScore';
import { generateInsights } from '@/utils/calculateInsights';
import type { CategorySpending, FinancialInsight } from '@/types/analytics';

const { width } = Dimensions.get('window');

type Period = 'week' | 'month' | 'year';

export default function AnalyticsScreen() {
  const theme = useThemeContext();
  const insets = useSafeAreaInsets();
  const haptics = useHaptics();
  const [period, setPeriod] = useState<Period>('month');

  const accountStore = useAccountStore();
  const activeAccount = accountStore.accounts.find(a => a.id === accountStore.activeAccountId);
  const currencySymbol = activeAccount?.currencySymbol || useSettingsStore((s) => s.currencySymbol);
  const currentMonth = getCurrentMonth();
  const previousMonth = getPreviousMonth(currentMonth);

  const rawTransactions = useTransactionStore((s) => s.transactions);
  const rawBudgets = useBudgetStore((s) => s.budgets);
  const rawGoals = useSavingsStore((s) => s.goals);

  // Filter all data by active account
  const allTransactions = useMemo(() => rawTransactions.filter(t => t.accountId === accountStore.activeAccountId), [rawTransactions, accountStore.activeAccountId]);
  const allBudgets = useMemo(() => rawBudgets.filter(b => b.accountId === accountStore.activeAccountId), [rawBudgets, accountStore.activeAccountId]);
  const allGoals = useMemo(() => rawGoals.filter(g => g.accountId === accountStore.activeAccountId), [rawGoals, accountStore.activeAccountId]);

  const currentMonthTransactions = useMemo(() => allTransactions.filter(t => t.date.startsWith(currentMonth)), [allTransactions, currentMonth]);
  const previousMonthTransactions = useMemo(() => allTransactions.filter(t => t.date.startsWith(previousMonth)), [allTransactions, previousMonth]);

  const currentIncome = useMemo(() => currentMonthTransactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0), [currentMonthTransactions]);
  const currentExpenses = useMemo(() => currentMonthTransactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0), [currentMonthTransactions]);

  const prevIncome = useMemo(() => previousMonthTransactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0), [previousMonthTransactions]);
  const prevExpenses = useMemo(() => previousMonthTransactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0), [previousMonthTransactions]);

  const currentMonthBudgets = useMemo(() => allBudgets.filter(b => b.month === currentMonth), [allBudgets, currentMonth]);
  const totalBudgeted = useMemo(() => currentMonthBudgets.reduce((s, b) => s + b.amount, 0), [currentMonthBudgets]);
  const totalBudgetSpent = useMemo(() => currentMonthBudgets.reduce((s, b) => s + b.spent, 0), [currentMonthBudgets]);

  const savingsProgress = useMemo(() => {
    const totalTarget = allGoals.reduce((sum, g) => sum + g.targetAmount, 0);
    const totalSaved = allGoals.reduce((sum, g) => sum + g.currentAmount, 0);
    return totalTarget > 0 ? totalSaved / totalTarget : 0;
  }, [allGoals]);

  // Category spending breakdown
  const categorySpending = useMemo((): CategorySpending[] => {
    const expenses = currentMonthTransactions.filter(t => t.type === 'expense');
    const map: Record<string, number> = {};
    expenses.forEach((t) => { map[t.categoryId] = (map[t.categoryId] || 0) + t.amount; });

    const total = Object.values(map).reduce((s, v) => s + v, 0);
    return Object.entries(map)
      .map(([categoryId, amount]) => {
        const cat = getCategoryById(categoryId);
        return {
          categoryId,
          categoryName: cat?.name ?? categoryId,
          amount,
          percentage: total > 0 ? (amount / total) * 100 : 0,
          color: cat?.color ?? '#6B7280',
          icon: cat?.icon ?? 'ellipse-outline',
        };
      })
      .sort((a, b) => b.amount - a.amount);
  }, [currentMonthTransactions]);

  // Previous month category spending for insights
  const prevCategorySpending = useMemo((): CategorySpending[] => {
    const expenses = previousMonthTransactions.filter(t => t.type === 'expense');
    const map: Record<string, number> = {};
    expenses.forEach((t) => { map[t.categoryId] = (map[t.categoryId] || 0) + t.amount; });
    const total = Object.values(map).reduce((s, v) => s + v, 0);
    return Object.entries(map).map(([categoryId, amount]) => {
      const cat = getCategoryById(categoryId);
      return {
        categoryId, categoryName: cat?.name ?? categoryId, amount,
        percentage: total > 0 ? (amount / total) * 100 : 0,
        color: cat?.color ?? '#6B7280', icon: cat?.icon ?? 'ellipse-outline',
      };
    }).sort((a, b) => b.amount - a.amount);
  }, [previousMonthTransactions]);

  // Health Score
  const healthScore = useMemo(() => calculateHealthScore({
    totalIncome: currentIncome,
    totalExpenses: currentExpenses,
    budgetTotal: totalBudgeted,
    budgetSpent: totalBudgetSpent,
    savingsGoalProgress: savingsProgress,
    previousMonthIncome: prevIncome,
    previousMonthExpenses: prevExpenses,
  }), [currentIncome, currentExpenses, totalBudgeted, totalBudgetSpent, savingsProgress, prevIncome, prevExpenses]);

  // Insights
  const insights = useMemo(() => generateInsights({
    currentMonthTransactions: currentMonthTransactions.filter(t => t.type === 'expense'),
    previousMonthTransactions: previousMonthTransactions.filter(t => t.type === 'expense'),
    currentMonthIncome: currentIncome,
    previousMonthIncome: prevIncome,
    currentMonthExpenses: currentExpenses,
    previousMonthExpenses: prevExpenses,
    budgetTotal: totalBudgeted,
    budgetSpent: totalBudgetSpent,
    currentCategorySpending: categorySpending,
    previousCategorySpending: prevCategorySpending,
  }), [currentMonth, previousMonth, currentIncome, prevIncome, currentExpenses, prevExpenses]);

  // Pie chart data
  const pieData = useMemo(() =>
    categorySpending.slice(0, 6).map((cs) => ({
      value: cs.amount,
      color: cs.color,
      text: `${Math.round(cs.percentage)}%`,
      textColor: theme.colors.text.primary,
    })),
  [categorySpending, theme]);

  // Daily spending for line chart
  const lineData = useMemo(() => {
    const dailyMap = new Map<string, number>();
    currentMonthTransactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        const day = t.date.split('T')[0];
        dailyMap.set(day, (dailyMap.get(day) || 0) + t.amount);
      });

    const sortedDays = Array.from(dailyMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]));

    return sortedDays.map(([dateStr, amount]) => ({
      value: amount,
      dataPointText: '',
      label: dateStr.split('-')[2],
    }));
  }, [currentMonthTransactions]);

  const comparisonData = useMemo(() => [
    {
      value: prevIncome || 0.1,
      label: 'Prev',
      frontColor: theme.colors.semantic.income,
      spacing: 6,
      barBorderTopLeftRadius: 6,
      barBorderTopRightRadius: 6,
    },
    {
      value: prevExpenses || 0.1,
      frontColor: theme.colors.semantic.expense,
      spacing: 24,
      barBorderTopLeftRadius: 6,
      barBorderTopRightRadius: 6,
    },
    {
      value: currentIncome || 0.1,
      label: 'This Month',
      frontColor: theme.colors.semantic.income,
      spacing: 6,
      barBorderTopLeftRadius: 6,
      barBorderTopRightRadius: 6,
    },
    {
      value: currentExpenses || 0.1,
      frontColor: theme.colors.semantic.expense,
      barBorderTopLeftRadius: 6,
      barBorderTopRightRadius: 6,
    },
  ], [prevIncome, prevExpenses, currentIncome, currentExpenses, theme]);

  const comparisonMaxValue = useMemo(() => {
    const maxVal = Math.max(prevIncome, prevExpenses, currentIncome, currentExpenses, 100);
    const magnitude = Math.pow(10, Math.floor(Math.log10(maxVal)));
    for (const step of [1, 2, 2.5, 5, 10]) {
      const candidate = Math.ceil(maxVal / (magnitude * step)) * (magnitude * step);
      if (candidate >= maxVal && isFinite(candidate)) return candidate;
    }
    return isFinite(maxVal) ? maxVal : 100;
  }, [prevIncome, prevExpenses, currentIncome, currentExpenses]);

  const incomeChange = prevIncome > 0 ? ((currentIncome - prevIncome) / prevIncome) * 100 : 0;
  const expenseChange = prevExpenses > 0 ? ((currentExpenses - prevExpenses) / prevExpenses) * 100 : 0;
  const netSavings = currentIncome - currentExpenses;


  const scoreColor = healthScore.score >= 70
    ? theme.colors.semantic.income
    : healthScore.score >= 40
    ? theme.colors.semantic.warning
    : theme.colors.semantic.expense;

  if (allTransactions.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.bg.primary, justifyContent: 'center', alignItems: 'center', padding: 32 }]}>
        <Animated.View entering={FadeInDown.duration(600)} style={{ alignItems: 'center' }}>
          <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: theme.colors.bg.secondary, justifyContent: 'center', alignItems: 'center', marginBottom: 20 }}>
            <Ionicons name="bar-chart" size={40} color={theme.colors.accent.primary} />
          </View>
          <Text style={{ fontSize: 22, color: theme.colors.text.primary, fontFamily: 'Inter_700Bold', marginBottom: 12, textAlign: 'center' }}>
            Not enough data yet
          </Text>
          <Text style={{ fontSize: 15, color: theme.colors.text.secondary, fontFamily: 'Inter_400Regular', textAlign: 'center', lineHeight: 22 }}>
            Start logging your income and expenses to unlock powerful insights and your personalized financial health score.
          </Text>
        </Animated.View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.bg.primary }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 16 }]}
      >
        <Text style={[styles.title, { color: theme.colors.text.primary, fontFamily: 'Inter_700Bold' }]}>
          Analytics
        </Text>

        {/* Health Score */}
        <Animated.View entering={FadeInDown.delay(100).duration(600)}>
          <View style={[styles.scoreCard, { backgroundColor: theme.colors.bg.secondary }]}>
            <View style={styles.scoreHeader}>
              <Text style={[styles.scoreTitle, { color: theme.colors.text.primary, fontFamily: 'Inter_600SemiBold' }]}>
                Financial Health
              </Text>
              <View style={[styles.scoreTrend, { backgroundColor: scoreColor + '15' }]}>
                <Ionicons
                  name={healthScore.trend === 'up' ? 'arrow-up' : healthScore.trend === 'down' ? 'arrow-down' : 'remove'}
                  size={14}
                  color={scoreColor}
                />
                <Text style={[styles.scoreTrendText, { color: scoreColor, fontFamily: 'Inter_500Medium' }]}>
                  {healthScore.trend === 'up' ? 'Improving' : healthScore.trend === 'down' ? 'Declining' : 'Stable'}
                </Text>
              </View>
            </View>
            <View style={styles.scoreValue}>
              <Text style={[styles.scoreNumber, { color: scoreColor, fontFamily: 'Inter_700Bold' }]}>
                {healthScore.score}
              </Text>
              <Text style={[styles.scoreMax, { color: theme.colors.text.tertiary, fontFamily: 'Inter_400Regular' }]}>
                /100
              </Text>
            </View>
            <View style={[styles.scoreBar, { backgroundColor: theme.colors.bg.tertiary }]}>
              <View style={[styles.scoreBarFill, { width: `${healthScore.score}%`, backgroundColor: scoreColor }]} />
            </View>
            <View style={styles.scoreBreakdown}>
              {[
                { label: 'Savings', value: healthScore.breakdown.savingsHabit, max: 33 },
                { label: 'Spending', value: healthScore.breakdown.spendingControl, max: 34 },
                { label: 'Budget', value: healthScore.breakdown.budgetAdherence, max: 33 },
              ].map((item) => (
                <View key={item.label} style={styles.breakdownItem}>
                  <Text style={[styles.breakdownLabel, { color: theme.colors.text.tertiary, fontFamily: 'Inter_400Regular' }]}>
                    {item.label}
                  </Text>
                  <Text style={[styles.breakdownValue, { color: theme.colors.text.primary, fontFamily: 'Inter_600SemiBold' }]}>
                    {item.value}/{item.max}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </Animated.View>

        {/* Spending Breakdown Pie Chart */}
        {pieData.length > 0 && (
          <Animated.View entering={FadeInDown.delay(200).duration(600)} style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text.primary, fontFamily: 'Inter_600SemiBold' }]}>
              Spending Breakdown
            </Text>
            <View style={[styles.card, { backgroundColor: theme.colors.bg.secondary }]}>
              <View style={styles.pieContainer}>
                <PieChart
                  data={pieData}
                  donut
                  radius={80}
                  innerRadius={55}
                  innerCircleColor={theme.colors.bg.secondary}
                  centerLabelComponent={() => (
                    <View style={styles.pieCenter}>
                      <Text style={[styles.pieCenterAmount, { color: theme.colors.text.primary, fontFamily: 'Inter_700Bold' }]}>
                        {formatCurrency(currentExpenses, currencySymbol)}
                      </Text>
                      <Text style={[styles.pieCenterLabel, { color: theme.colors.text.tertiary, fontFamily: 'Inter_400Regular' }]}>
                        Total
                      </Text>
                    </View>
                  )}
                />
              </View>
              {/* Category Legend */}
              <View style={styles.legend}>
                {categorySpending.slice(0, 6).map((cs) => (
                  <View key={cs.categoryId} style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: cs.color }]} />
                    <Text style={[styles.legendLabel, { color: theme.colors.text.secondary, fontFamily: 'Inter_400Regular' }]}>
                      {cs.categoryName}
                    </Text>
                    <Text style={[styles.legendValue, { color: theme.colors.text.primary, fontFamily: 'Inter_500Medium' }]}>
                      {formatCurrency(cs.amount, currencySymbol)}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </Animated.View>
        )}
        {/* Income vs Expenses — World-class comparison section */}
        {(currentIncome > 0 || currentExpenses > 0 || prevIncome > 0 || prevExpenses > 0) && (
          <Animated.View entering={FadeInDown.delay(300).duration(600)} style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text.primary, fontFamily: 'Inter_600SemiBold' }]}>
              Income vs Expenses
            </Text>

            {/* Summary Stat Cards */}
            <View style={{ flexDirection: 'row', gap: 10, marginBottom: 12 }}>
              {/* Income Card */}
              <View style={[styles.statChip, { backgroundColor: theme.colors.bg.secondary, flex: 1 }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: theme.colors.semantic.income }} />
                  <Text style={{ color: theme.colors.text.tertiary, fontSize: 11, fontFamily: 'Inter_500Medium', textTransform: 'uppercase', letterSpacing: 0.5 }}>Income</Text>
                </View>
                <Text style={{ color: theme.colors.text.primary, fontFamily: 'Inter_700Bold', fontSize: 16 }} numberOfLines={1} adjustsFontSizeToFit>
                  {formatCurrency(currentIncome, currencySymbol, true)}
                </Text>
                {prevIncome > 0 && (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 2 }}>
                    <Ionicons
                      name={incomeChange >= 0 ? 'arrow-up' : 'arrow-down'}
                      size={10}
                      color={incomeChange >= 0 ? theme.colors.semantic.income : theme.colors.semantic.expense}
                    />
                    <Text style={{ fontSize: 11, fontFamily: 'Inter_500Medium', color: incomeChange >= 0 ? theme.colors.semantic.income : theme.colors.semantic.expense }}>
                      {Math.abs(incomeChange).toFixed(1)}% vs last
                    </Text>
                  </View>
                )}
              </View>

              {/* Expenses Card */}
              <View style={[styles.statChip, { backgroundColor: theme.colors.bg.secondary, flex: 1 }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: theme.colors.semantic.expense }} />
                  <Text style={{ color: theme.colors.text.tertiary, fontSize: 11, fontFamily: 'Inter_500Medium', textTransform: 'uppercase', letterSpacing: 0.5 }}>Expenses</Text>
                </View>
                <Text style={{ color: theme.colors.text.primary, fontFamily: 'Inter_700Bold', fontSize: 16 }} numberOfLines={1} adjustsFontSizeToFit>
                  {formatCurrency(currentExpenses, currencySymbol, true)}
                </Text>
                {prevExpenses > 0 && (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 2 }}>
                    <Ionicons
                      name={expenseChange > 0 ? 'arrow-up' : 'arrow-down'}
                      size={10}
                      color={expenseChange > 0 ? theme.colors.semantic.expense : theme.colors.semantic.income}
                    />
                    <Text style={{ fontSize: 11, fontFamily: 'Inter_500Medium', color: expenseChange > 0 ? theme.colors.semantic.expense : theme.colors.semantic.income }}>
                      {Math.abs(expenseChange).toFixed(1)}% vs last
                    </Text>
                  </View>
                )}
              </View>

              {/* Net Savings Card */}
              <View style={[styles.statChip, { backgroundColor: netSavings >= 0 ? theme.colors.semantic.income + '15' : theme.colors.semantic.expense + '15', flex: 1 }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: netSavings >= 0 ? theme.colors.semantic.income : theme.colors.semantic.expense }} />
                  <Text style={{ color: theme.colors.text.tertiary, fontSize: 11, fontFamily: 'Inter_500Medium', textTransform: 'uppercase', letterSpacing: 0.5 }}>Net</Text>
                </View>
                <Text style={{ color: netSavings >= 0 ? theme.colors.semantic.income : theme.colors.semantic.expense, fontFamily: 'Inter_700Bold', fontSize: 16 }} numberOfLines={1} adjustsFontSizeToFit>
                  {netSavings >= 0 ? '+' : ''}{formatCurrency(netSavings, currencySymbol, true)}
                </Text>
                <Text style={{ fontSize: 11, fontFamily: 'Inter_400Regular', color: theme.colors.text.tertiary, marginTop: 2 }}>
                  {netSavings >= 0 ? 'Saved' : 'Deficit'}
                </Text>
              </View>
            </View>

            {/* Comparison Bar Chart */}
            <View style={[styles.card, { backgroundColor: theme.colors.bg.secondary }]}>
              <BarChart
                data={comparisonData}
                maxValue={comparisonMaxValue}
                barWidth={22}
                spacing={4}
                initialSpacing={16}
                noOfSections={4}
                yAxisThickness={0}
                xAxisThickness={1}
                xAxisColor={theme.colors.bg.tertiary}
                yAxisTextStyle={{ color: theme.colors.text.tertiary, fontSize: 10, fontFamily: 'Inter_400Regular' }}
                xAxisLabelTextStyle={{ color: theme.colors.text.tertiary, fontSize: 10, fontFamily: 'Inter_500Medium' }}
                rulesType="solid"
                rulesColor={theme.colors.bg.tertiary}
                formatYLabel={(label: string) => {
                  const val = Number(label);
                  if (isNaN(val) || val === 0) return '0';
                  if (val >= 1_000_000_000) return `${Math.round(val / 1_000_000_000)}B`;
                  if (val >= 1_000_000) return `${Math.round(val / 1_000_000)}M`;
                  if (val >= 1_000) return `${Math.round(val / 1_000)}K`;
                  return Math.round(val).toString();
                }}
                height={160}
                width={width - 100}
                isAnimated
                animationDuration={900}
                showFractionalValues={false}
              />
              {/* Chart Legend */}
              <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 24, marginTop: 16, paddingTop: 12, borderTopWidth: 1, borderTopColor: theme.colors.bg.tertiary }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <View style={{ width: 12, height: 4, borderRadius: 2, backgroundColor: theme.colors.semantic.income }} />
                  <Text style={{ color: theme.colors.text.secondary, fontSize: 12, fontFamily: 'Inter_500Medium' }}>Income</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <View style={{ width: 12, height: 4, borderRadius: 2, backgroundColor: theme.colors.semantic.expense }} />
                  <Text style={{ color: theme.colors.text.secondary, fontSize: 12, fontFamily: 'Inter_500Medium' }}>Expenses</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Text style={{ color: theme.colors.text.tertiary, fontSize: 11, fontFamily: 'Inter_400Regular' }}>Left = Previous · Right = Current</Text>
                </View>
              </View>
            </View>
          </Animated.View>
        )}

        {/* Insights */}
        {insights.length > 0 && (
          <Animated.View entering={FadeInDown.delay(400).duration(600)} style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text.primary, fontFamily: 'Inter_600SemiBold' }]}>
              💡 Insights
            </Text>
            {insights.map((insight) => (
              <View
                key={insight.id}
                style={[
                  styles.insightCard,
                  {
                    backgroundColor: theme.colors.bg.secondary,
                    borderLeftColor:
                      insight.type === 'positive' ? theme.colors.semantic.income
                      : insight.type === 'negative' ? theme.colors.semantic.expense
                      : theme.colors.accent.primary,
                  },
                ]}
              >
                <Ionicons
                  name={insight.icon as any}
                  size={20}
                  color={
                    insight.type === 'positive' ? theme.colors.semantic.income
                    : insight.type === 'negative' ? theme.colors.semantic.expense
                    : theme.colors.accent.primary
                  }
                />
                <View style={styles.insightText}>
                  <Text style={[styles.insightMessage, { color: theme.colors.text.primary, fontFamily: 'Inter_500Medium' }]}>
                    {insight.message}
                  </Text>
                  <Text style={[styles.insightDetail, { color: theme.colors.text.tertiary, fontFamily: 'Inter_400Regular' }]} numberOfLines={2}>
                    {insight.detail}
                  </Text>
                </View>
              </View>
            ))}
          </Animated.View>
        )}

        {/* Recommendations */}
        {healthScore.recommendations.length > 0 && (
          <Animated.View entering={FadeInDown.delay(500).duration(600)} style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text.primary, fontFamily: 'Inter_600SemiBold' }]}>
              📋 Recommendations
            </Text>
            {healthScore.recommendations.map((rec, i) => (
              <View key={i} style={[styles.recCard, { backgroundColor: theme.colors.bg.secondary }]}>
                <Ionicons name="bulb-outline" size={18} color={theme.colors.semantic.warning} />
                <Text style={[styles.recText, { color: theme.colors.text.secondary, fontFamily: 'Inter_400Regular' }]}>
                  {rec}
                </Text>
              </View>
            ))}
          </Animated.View>
        )}

        {/* AdMob Banner - Inline */}
        <View style={{ alignItems: 'center', marginTop: 12, marginBottom: 40 }}>
          <BannerAd 
            unitId={BANNER_AD_UNIT_ID} 
            size={BannerAdSize.MEDIUM_RECTANGLE} 
            requestOptions={{ requestNonPersonalizedAdsOnly: true }} 
          />
        </View>

        <View style={{ height: Platform.OS === 'ios' ? 100 : 80 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 20 },
  title: { fontSize: 28, letterSpacing: -0.5, marginBottom: 20 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 18, marginBottom: 12 },
  card: { borderRadius: 16, padding: 16 },

  // Score
  scoreCard: { borderRadius: 16, padding: 20, marginBottom: 24 },
  scoreHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  scoreTitle: { fontSize: 16 },
  scoreTrend: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, gap: 4 },
  scoreTrendText: { fontSize: 12 },
  scoreValue: { flexDirection: 'row', alignItems: 'baseline', gap: 2, marginBottom: 12 },
  scoreNumber: { fontSize: 48 },
  scoreMax: { fontSize: 18 },
  scoreBar: { height: 8, borderRadius: 4, overflow: 'hidden', marginBottom: 16 },
  scoreBarFill: { height: '100%', borderRadius: 4 },
  scoreBreakdown: { flexDirection: 'row', justifyContent: 'space-between' },
  breakdownItem: { alignItems: 'center', gap: 4 },
  breakdownLabel: { fontSize: 12 },
  breakdownValue: { fontSize: 14 },

  // Pie
  pieContainer: { alignItems: 'center', marginBottom: 16 },
  pieCenter: { alignItems: 'center' },
  pieCenterAmount: { fontSize: 16 },
  pieCenterLabel: { fontSize: 11 },

  // Legend
  legend: { gap: 8 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendLabel: { flex: 1, fontSize: 13 },
  legendValue: { fontSize: 13 },

  // Chart Legend
  chartLegend: { flexDirection: 'row', justifyContent: 'center', gap: 20, marginTop: 12 },
  chartLegendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  chartLegendText: { fontSize: 12 },

  // Insights
  insightCard: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 14,
    gap: 12,
    marginBottom: 8,
    borderLeftWidth: 3,
    alignItems: 'flex-start',
  },
  insightText: { flex: 1, gap: 2 },
  insightMessage: { fontSize: 14 },
  insightDetail: { fontSize: 12, lineHeight: 18 },

  // Recommendations
  recCard: { flexDirection: 'row', borderRadius: 12, padding: 14, gap: 10, marginBottom: 6, alignItems: 'center' },
  recText: { flex: 1, fontSize: 13, lineHeight: 19 },

  // Stat chips for comparison section
  statChip: { borderRadius: 14, padding: 12 },
});
