/**
 * Spendly — Analytics Screen
 *
 * Charts, insights, and financial health score.
 */

import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { PieChart, BarChart, LineChart } from 'react-native-gifted-charts';

import { useThemeContext } from '@/theme';
import { useTransactionStore } from '@/store/useTransactionStore';
import { useBudgetStore } from '@/store/useBudgetStore';
import { useSavingsStore } from '@/store/useSavingsStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useGamificationStore } from '@/store/useGamificationStore';
import { useHaptics } from '@/hooks/useHaptics';
import { formatCurrency } from '@/utils/formatCurrency';
import { getCurrentMonth, getPreviousMonth, getMonthLabel } from '@/utils/formatDate';
import { getCategoryById, expenseCategories } from '@/constants/categories';
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

  const currencySymbol = useSettingsStore((s) => s.currencySymbol);
  const currentMonth = getCurrentMonth();
  const previousMonth = getPreviousMonth(currentMonth);

  const getMonthlyTotal = useTransactionStore((s) => s.getMonthlyTotal);
  const getTransactionsByType = useTransactionStore((s) => s.getTransactionsByType);
  const getDailySpending = useTransactionStore((s) => s.getDailySpending);
  const totalBudgeted = useBudgetStore((s) => s.getTotalBudgeted(currentMonth));
  const totalBudgetSpent = useBudgetStore((s) => s.getTotalSpent(currentMonth));
  const savingsProgress = useSavingsStore((s) => {
    const total = s.getTotalTarget();
    return total > 0 ? s.getTotalSaved() / total : 0;
  });

  const currentIncome = getMonthlyTotal('income', currentMonth);
  const currentExpenses = getMonthlyTotal('expense', currentMonth);
  const prevIncome = getMonthlyTotal('income', previousMonth);
  const prevExpenses = getMonthlyTotal('expense', previousMonth);

  // Category spending breakdown
  const categorySpending = useMemo((): CategorySpending[] => {
    const expenses = getTransactionsByType('expense', currentMonth);
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
  }, [currentMonth]);

  // Previous month category spending for insights
  const prevCategorySpending = useMemo((): CategorySpending[] => {
    const expenses = getTransactionsByType('expense', previousMonth);
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
    });
  }, [previousMonth]);

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
    currentMonthTransactions: getTransactionsByType('expense', currentMonth),
    previousMonthTransactions: getTransactionsByType('expense', previousMonth),
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
    const daily = getDailySpending(currentMonth);
    return daily.map((d) => ({
      value: d.amount,
      dataPointText: '',
      label: d.date.split('-')[2],
    }));
  }, [currentMonth]);

  // Income vs Expense bar chart
  const comparisonData = useMemo(() => [
    { value: prevIncome, label: 'Prev', frontColor: theme.colors.semantic.income, spacing: 4 },
    { value: prevExpenses, frontColor: theme.colors.semantic.expense },
    { value: currentIncome, label: 'Current', frontColor: theme.colors.semantic.income, spacing: 4 },
    { value: currentExpenses, frontColor: theme.colors.semantic.expense },
  ], [prevIncome, prevExpenses, currentIncome, currentExpenses, theme]);

  const scoreColor = healthScore.score >= 70
    ? theme.colors.semantic.income
    : healthScore.score >= 40
    ? theme.colors.semantic.warning
    : theme.colors.semantic.expense;

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
                  centerLabelComponent={() => (
                    <View style={styles.pieCenter}>
                      <Text style={[styles.pieCenterAmount, { color: theme.colors.text.primary, fontFamily: 'Inter_700Bold' }]}>
                        {formatCurrency(currentExpenses, currencySymbol, true)}
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
                      {formatCurrency(cs.amount, currencySymbol, true)}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </Animated.View>
        )}

        {/* Income vs Expenses */}
        {comparisonData.some((d) => d.value > 0) && (
          <Animated.View entering={FadeInDown.delay(300).duration(600)} style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text.primary, fontFamily: 'Inter_600SemiBold' }]}>
              Income vs Expenses
            </Text>
            <View style={[styles.card, { backgroundColor: theme.colors.bg.secondary }]}>
              <BarChart
                data={comparisonData}
                barWidth={24}
                spacing={20}
                roundedTop
                roundedBottom
                noOfSections={4}
                yAxisThickness={0}
                xAxisThickness={0}
                yAxisTextStyle={{ color: theme.colors.text.tertiary, fontSize: 10, fontFamily: 'Inter_400Regular' }}
                xAxisLabelTextStyle={{ color: theme.colors.text.tertiary, fontSize: 10, fontFamily: 'Inter_400Regular' }}
                hideRules
                barBorderRadius={6}
                height={140}
                width={width - 100}
                isAnimated
                animationDuration={800}
              />
              <View style={styles.chartLegend}>
                <View style={styles.chartLegendItem}>
                  <View style={[styles.legendDot, { backgroundColor: theme.colors.semantic.income }]} />
                  <Text style={[styles.chartLegendText, { color: theme.colors.text.secondary, fontFamily: 'Inter_400Regular' }]}>Income</Text>
                </View>
                <View style={styles.chartLegendItem}>
                  <View style={[styles.legendDot, { backgroundColor: theme.colors.semantic.expense }]} />
                  <Text style={[styles.chartLegendText, { color: theme.colors.text.secondary, fontFamily: 'Inter_400Regular' }]}>Expenses</Text>
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

        <View style={{ height: 100 }} />
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
});
