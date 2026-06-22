/**
 * Spendly — Budgets & Savings Screen
 *
 * Shows active budgets with progress and savings goals.
 */

import React, { useMemo } from 'react';
import {
  View, Text, ScrollView, StyleSheet, Pressable, Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

import { useThemeContext, gradients } from '@/theme';
import { useBudgetStore } from '@/store/useBudgetStore';
import { useSavingsStore } from '@/store/useSavingsStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useHaptics } from '@/hooks/useHaptics';
import { formatCurrency } from '@/utils/formatCurrency';
import { getCurrentMonth } from '@/utils/formatDate';
import { getCategoryById } from '@/constants/categories';
import { getDaysRemaining } from '@/utils/formatDate';

export default function BudgetsScreen() {
  const theme = useThemeContext();
  const insets = useSafeAreaInsets();
  const haptics = useHaptics();

  const currencySymbol = useSettingsStore((s) => s.currencySymbol);
  const currentMonth = getCurrentMonth();
  const budgets = useBudgetStore((s) => s.getBudgetsByMonth(currentMonth));
  const totalBudgeted = useBudgetStore((s) => s.getTotalBudgeted(currentMonth));
  const totalSpent = useBudgetStore((s) => s.getTotalSpent(currentMonth));
  const activeGoals = useSavingsStore((s) => s.getActiveGoals());
  const completedGoals = useSavingsStore((s) => s.getCompletedGoals());

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.bg.primary }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 16 }]}
      >
        <Text style={[styles.title, { color: theme.colors.text.primary, fontFamily: 'Inter_700Bold' }]}>
          Budgets & Goals
        </Text>

        {/* Budget Summary Card */}
        <Animated.View entering={FadeInDown.delay(100).duration(600)}>
          <LinearGradient
            colors={gradients.ocean as [string, string]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.summaryCard}
          >
            <Text style={styles.summaryLabel}>Monthly Budget</Text>
            <Text style={styles.summaryAmount}>
              {formatCurrency(totalSpent, currencySymbol)} / {formatCurrency(totalBudgeted, currencySymbol)}
            </Text>
            <View style={styles.summaryBar}>
              <View
                style={[
                  styles.summaryBarFill,
                  {
                    width: `${Math.min(100, totalBudgeted > 0 ? (totalSpent / totalBudgeted) * 100 : 0)}%`,
                    backgroundColor: totalSpent > totalBudgeted ? '#F43F5E' : '#FFFFFF',
                  },
                ]}
              />
            </View>
            <Text style={styles.summarySubtext}>
              {totalBudgeted > 0
                ? `${formatCurrency(Math.max(0, totalBudgeted - totalSpent), currencySymbol)} remaining`
                : 'No budgets set'}
            </Text>
          </LinearGradient>
        </Animated.View>

        {/* Active Budgets */}
        <Animated.View entering={FadeInDown.delay(200).duration(600)} style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text.primary, fontFamily: 'Inter_600SemiBold' }]}>
              Active Budgets
            </Text>
            <Pressable
              onPress={() => { haptics.light(); router.push('/budget/create' as any); }}
              style={[styles.addBtn, { backgroundColor: theme.colors.accent.primaryMuted }]}
            >
              <Ionicons name="add" size={18} color={theme.colors.accent.primary} />
              <Text style={[styles.addBtnText, { color: theme.colors.accent.primary, fontFamily: 'Inter_500Medium' }]}>
                Add
              </Text>
            </Pressable>
          </View>

          {budgets.length === 0 ? (
            <View style={[styles.emptyCard, { backgroundColor: theme.colors.bg.secondary }]}>
              <Ionicons name="wallet-outline" size={40} color={theme.colors.text.tertiary} />
              <Text style={[styles.emptyText, { color: theme.colors.text.tertiary, fontFamily: 'Inter_400Regular' }]}>
                Create your first budget to start tracking spending
              </Text>
            </View>
          ) : (
            budgets.map((budget, i) => {
              const category = getCategoryById(budget.categoryId ?? '');
              const percentage = budget.amount > 0 ? budget.spent / budget.amount : 0;
              const isOver = percentage > 1;
              const color = isOver
                ? theme.colors.semantic.expense
                : percentage > 0.8
                ? theme.colors.semantic.warning
                : category?.color ?? theme.colors.accent.primary;

              return (
                <Animated.View
                  key={budget.id}
                  entering={FadeInDown.delay(250 + i * 50).duration(500)}
                  style={[styles.budgetCard, { backgroundColor: theme.colors.bg.secondary }]}
                >
                  <View style={styles.budgetRow}>
                    <View style={[styles.budgetIcon, { backgroundColor: (category?.color ?? '#6366F1') + '15' }]}>
                      <Ionicons
                        name={(category?.icon as any) ?? 'wallet-outline'}
                        size={20}
                        color={category?.color ?? '#6366F1'}
                      />
                    </View>
                    <View style={styles.budgetInfo}>
                      <Text style={[styles.budgetName, { color: theme.colors.text.primary, fontFamily: 'Inter_500Medium' }]}>
                        {budget.name}
                      </Text>
                      <Text style={[styles.budgetDetail, { color: theme.colors.text.tertiary, fontFamily: 'Inter_400Regular' }]}>
                        {formatCurrency(budget.spent, currencySymbol)} of {formatCurrency(budget.amount, currencySymbol)}
                      </Text>
                    </View>
                    <Text style={[styles.budgetPercent, { color, fontFamily: 'Inter_600SemiBold' }]}>
                      {Math.round(percentage * 100)}%
                    </Text>
                  </View>
                  <View style={[styles.budgetBar, { backgroundColor: theme.colors.bg.tertiary }]}>
                    <View
                      style={[
                        styles.budgetBarFill,
                        { width: `${Math.min(100, percentage * 100)}%`, backgroundColor: color },
                      ]}
                    />
                  </View>
                  {isOver && (
                    <Text style={[styles.overBudget, { color: theme.colors.semantic.expense, fontFamily: 'Inter_500Medium' }]}>
                      ⚠️ Over budget by {formatCurrency(budget.spent - budget.amount, currencySymbol)}
                    </Text>
                  )}
                </Animated.View>
              );
            })
          )}
        </Animated.View>

        {/* Savings Goals */}
        <Animated.View entering={FadeInDown.delay(400).duration(600)} style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text.primary, fontFamily: 'Inter_600SemiBold' }]}>
              Savings Goals
            </Text>
            <Pressable
              onPress={() => { haptics.light(); router.push('/savings/create' as any); }}
              style={[styles.addBtn, { backgroundColor: theme.colors.semantic.incomeMuted }]}
            >
              <Ionicons name="add" size={18} color={theme.colors.semantic.income} />
              <Text style={[styles.addBtnText, { color: theme.colors.semantic.income, fontFamily: 'Inter_500Medium' }]}>
                New Goal
              </Text>
            </Pressable>
          </View>

          {activeGoals.length === 0 && completedGoals.length === 0 ? (
            <View style={[styles.emptyCard, { backgroundColor: theme.colors.bg.secondary }]}>
              <Ionicons name="flag-outline" size={40} color={theme.colors.text.tertiary} />
              <Text style={[styles.emptyText, { color: theme.colors.text.tertiary, fontFamily: 'Inter_400Regular' }]}>
                Set a savings goal and start building towards it
              </Text>
            </View>
          ) : (
            <>
              {activeGoals.map((goal, i) => {
                const progress = goal.targetAmount > 0 ? goal.currentAmount / goal.targetAmount : 0;
                const daysLeft = getDaysRemaining(goal.deadline);

                return (
                  <Animated.View
                    key={goal.id}
                    entering={FadeInDown.delay(450 + i * 50).duration(500)}
                    style={[styles.goalCard, { backgroundColor: theme.colors.bg.secondary }]}
                  >
                    <View style={styles.goalHeader}>
                      <View style={[styles.goalIcon, { backgroundColor: goal.color + '15' }]}>
                        <Ionicons name={goal.icon as any} size={22} color={goal.color} />
                      </View>
                      <View style={styles.goalInfo}>
                        <Text style={[styles.goalName, { color: theme.colors.text.primary, fontFamily: 'Inter_600SemiBold' }]}>
                          {goal.name}
                        </Text>
                        <Text style={[styles.goalDeadline, { color: theme.colors.text.tertiary, fontFamily: 'Inter_400Regular' }]}>
                          {daysLeft > 0 ? `${daysLeft} days left` : 'Overdue'}
                        </Text>
                      </View>
                      <Text style={[styles.goalPercent, { color: goal.color, fontFamily: 'Inter_700Bold' }]}>
                        {Math.round(progress * 100)}%
                      </Text>
                    </View>
                    <View style={styles.goalAmounts}>
                      <Text style={[styles.goalSaved, { color: theme.colors.text.primary, fontFamily: 'Inter_600SemiBold' }]}>
                        {formatCurrency(goal.currentAmount, currencySymbol)}
                      </Text>
                      <Text style={[styles.goalTarget, { color: theme.colors.text.tertiary, fontFamily: 'Inter_400Regular' }]}>
                        / {formatCurrency(goal.targetAmount, currencySymbol)}
                      </Text>
                    </View>
                    <View style={[styles.goalBar, { backgroundColor: theme.colors.bg.tertiary }]}>
                      <View
                        style={[
                          styles.goalBarFill,
                          { width: `${Math.min(100, progress * 100)}%`, backgroundColor: goal.color },
                        ]}
                      />
                    </View>
                    <Text style={[styles.goalRemaining, { color: theme.colors.text.tertiary, fontFamily: 'Inter_400Regular' }]}>
                      {formatCurrency(Math.max(0, goal.targetAmount - goal.currentAmount), currencySymbol)} remaining
                    </Text>
                  </Animated.View>
                );
              })}

              {completedGoals.length > 0 && (
                <View style={styles.completedSection}>
                  <Text style={[styles.completedTitle, { color: theme.colors.text.secondary, fontFamily: 'Inter_500Medium' }]}>
                    🎉 Completed ({completedGoals.length})
                  </Text>
                  {completedGoals.map((goal) => (
                    <View
                      key={goal.id}
                      style={[styles.completedGoal, { backgroundColor: theme.colors.semantic.incomeMuted }]}
                    >
                      <Ionicons name="checkmark-circle" size={20} color={theme.colors.semantic.income} />
                      <Text style={[styles.completedGoalName, { color: theme.colors.semantic.income, fontFamily: 'Inter_500Medium' }]}>
                        {goal.name}
                      </Text>
                      <Text style={[styles.completedGoalAmount, { color: theme.colors.semantic.income, fontFamily: 'Inter_600SemiBold' }]}>
                        {formatCurrency(goal.targetAmount, currencySymbol)}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </>
          )}
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

  // Summary
  summaryCard: { borderRadius: 20, padding: 24, marginBottom: 24 },
  summaryLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 14, fontFamily: 'Inter_400Regular', marginBottom: 4 },
  summaryAmount: { color: '#FFFFFF', fontSize: 22, fontFamily: 'Inter_700Bold', marginBottom: 16 },
  summaryBar: { height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.2)', overflow: 'hidden', marginBottom: 8 },
  summaryBarFill: { height: '100%', borderRadius: 3 },
  summarySubtext: { color: 'rgba(255,255,255,0.7)', fontSize: 13, fontFamily: 'Inter_400Regular' },

  // Section
  section: { marginBottom: 24 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  sectionTitle: { fontSize: 18 },
  addBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, gap: 4 },
  addBtnText: { fontSize: 13 },

  // Empty
  emptyCard: { borderRadius: 16, padding: 32, alignItems: 'center', gap: 12 },
  emptyText: { fontSize: 14, textAlign: 'center', lineHeight: 20 },

  // Budget Card
  budgetCard: { borderRadius: 16, padding: 16, marginBottom: 10 },
  budgetRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  budgetIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  budgetInfo: { flex: 1 },
  budgetName: { fontSize: 15, marginBottom: 2 },
  budgetDetail: { fontSize: 12 },
  budgetPercent: { fontSize: 16 },
  budgetBar: { height: 6, borderRadius: 3, overflow: 'hidden', marginBottom: 6 },
  budgetBarFill: { height: '100%', borderRadius: 3 },
  overBudget: { fontSize: 12, marginTop: 4 },

  // Goal Card
  goalCard: { borderRadius: 16, padding: 16, marginBottom: 10 },
  goalHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  goalIcon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  goalInfo: { flex: 1 },
  goalName: { fontSize: 16, marginBottom: 2 },
  goalDeadline: { fontSize: 12 },
  goalPercent: { fontSize: 20 },
  goalAmounts: { flexDirection: 'row', alignItems: 'baseline', gap: 4, marginBottom: 10 },
  goalSaved: { fontSize: 18 },
  goalTarget: { fontSize: 14 },
  goalBar: { height: 8, borderRadius: 4, overflow: 'hidden', marginBottom: 8 },
  goalBarFill: { height: '100%', borderRadius: 4 },
  goalRemaining: { fontSize: 12 },

  // Completed
  completedSection: { marginTop: 16 },
  completedTitle: { fontSize: 14, marginBottom: 10 },
  completedGoal: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, padding: 12, gap: 10, marginBottom: 6 },
  completedGoalName: { flex: 1, fontSize: 14 },
  completedGoalAmount: { fontSize: 14 },
});
