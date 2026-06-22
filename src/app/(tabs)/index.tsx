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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { BarChart } from 'react-native-gifted-charts';

import { useThemeContext, gradients } from '@/theme';
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

const { width } = Dimensions.get('window');

export default function DashboardScreen() {
  const theme = useThemeContext();
  const insets = useSafeAreaInsets();
  const haptics = useHaptics();
  const [refreshing, setRefreshing] = React.useState(false);

  const currencySymbol = useSettingsStore((s) => s.currencySymbol);
  const userName = useSettingsStore((s) => s.userName);
  const hasCompletedOnboarding = useSettingsStore((s) => s.hasCompletedOnboarding);

  const currentMonth = getCurrentMonth();
  const getMonthlyTotal = useTransactionStore((s) => s.getMonthlyTotal);
  const getRecentTransactions = useTransactionStore((s) => s.getRecentTransactions);
  const getDailySpending = useTransactionStore((s) => s.getDailySpending);

  const getCurrentMonthBudgets = useBudgetStore((s) => s.getCurrentMonthBudgets);
  const getTotalSaved = useSavingsStore((s) => s.getTotalSaved);

  const xp = useGamificationStore((s) => s.xp);
  const level = useGamificationStore((s) => s.level);
  const streaks = useGamificationStore((s) => s.streaks);

  const monthlyIncome = useMemo(() => getMonthlyTotal('income', currentMonth), [currentMonth]);
  const monthlyExpenses = useMemo(() => getMonthlyTotal('expense', currentMonth), [currentMonth]);
  const balance = monthlyIncome - monthlyExpenses;
  const recentTransactions = useMemo(() => getRecentTransactions(5), []);
  const budgets = useMemo(() => getCurrentMonthBudgets(), []);
  const totalSaved = useMemo(() => getTotalSaved(), []);
  const currentLevel = useMemo(() => getLevelForXP(xp), [xp]);

  const dailySpending = useMemo(() => {
    const data = getDailySpending(currentMonth);
    return data.slice(-7).map((d) => ({
      value: d.amount,
      label: formatShortDate(d.date).split(' ')[1] || '',
      frontColor: theme.colors.accent.primary,
      topLabelComponent: () => null,
    }));
  }, [currentMonth]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 500);
  }, []);

  // Redirect to onboarding if first launch
  React.useEffect(() => {
    if (!hasCompletedOnboarding) {
      router.replace('/onboarding');
    }
  }, [hasCompletedOnboarding]);

  const totalBudgeted = budgets.reduce((s, b) => s + b.amount, 0);
  const totalBudgetSpent = budgets.reduce((s, b) => s + b.spent, 0);
  const budgetPercentage = totalBudgeted > 0 ? Math.min(1, totalBudgetSpent / totalBudgeted) : 0;

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
            <Text style={[styles.headerTitle, { color: theme.colors.text.primary, fontFamily: 'Inter_700Bold' }]}>
              Dashboard
            </Text>
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

        {/* Balance Card */}
        <Animated.View entering={FadeInDown.delay(200).duration(600)}>
          <LinearGradient
            colors={gradients.brand as [string, string]}
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
            ].map((action, i) => (
              <Pressable
                key={i}
                onPress={() => { haptics.light(); router.push(action.route as any); }}
                style={[styles.quickActionBtn, { backgroundColor: theme.colors.bg.secondary }]}
              >
                <View style={[styles.quickActionIcon, { backgroundColor: action.color + '15' }]}>
                  <Ionicons name={action.icon} size={24} color={action.color} />
                </View>
                <Text style={[styles.quickActionLabel, { color: theme.colors.text.secondary, fontFamily: 'Inter_500Medium' }]}>
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

        {/* Weekly Spending Chart */}
        {dailySpending.length > 0 && (
          <Animated.View entering={FadeInDown.delay(500).duration(600)} style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text.primary, fontFamily: 'Inter_600SemiBold' }]}>
              This Week
            </Text>
            <View style={[styles.card, { backgroundColor: theme.colors.bg.secondary }]}>
              <BarChart
                data={dailySpending}
                barWidth={28}
                spacing={16}
                roundedTop
                roundedBottom
                noOfSections={4}
                yAxisThickness={0}
                xAxisThickness={0}
                yAxisTextStyle={{ color: theme.colors.text.tertiary, fontSize: 10, fontFamily: 'Inter_400Regular' }}
                xAxisLabelTextStyle={{ color: theme.colors.text.tertiary, fontSize: 10, fontFamily: 'Inter_400Regular' }}
                hideRules
                barBorderRadius={6}
                frontColor={theme.colors.accent.primary}
                height={120}
                width={width - 80}
                isAnimated
                animationDuration={800}
              />
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
                <Text style={[styles.emptyBtnText, { fontFamily: 'Inter_600SemiBold' }]}>
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
                          },
                        ]}
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
  quickActionLabel: { fontSize: 12 },

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
