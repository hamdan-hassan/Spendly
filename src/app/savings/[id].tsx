/**
 * Spendly — Savings Goal Details
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { useThemeContext } from '@/theme';
import { useSavingsStore } from '@/store/useSavingsStore';
import { useTransactionStore } from '@/store/useTransactionStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useHaptics } from '@/hooks/useHaptics';
import { formatCurrency } from '@/utils/formatCurrency';
import { formatRelativeDate, getDaysRemaining } from '@/utils/formatDate';
import { sendSavingsReminder } from '@/services/notifications';

export default function SavingsGoalDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useThemeContext();
  const insets = useSafeAreaInsets();
  const haptics = useHaptics();

  const getGoalById = useSavingsStore((s) => s.getGoalById);
  const addContribution = useSavingsStore((s) => s.addContribution);
  const addTransaction = useTransactionStore((s) => s.addTransaction);
  const currencySymbol = useSettingsStore((s) => s.currencySymbol);

  const goal = getGoalById(id || '');

  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');

  if (!goal) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.bg.primary, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: theme.colors.text.primary }}>Goal not found</Text>
        <Pressable onPress={() => router.back()} style={{ marginTop: 20 }}>
          <Text style={{ color: theme.colors.accent.primary }}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  const progress = goal.targetAmount > 0 ? goal.currentAmount / goal.targetAmount : 0;
  const daysLeft = getDaysRemaining(goal.deadline);

  const handleContribute = () => {
    const parsed = parseFloat(amount);
    if (!parsed || parsed <= 0) return;

    if (parsed + goal.currentAmount > goal.targetAmount) {
      Alert.alert('Whoa there!', 'This contribution exceeds your target amount. Do you want to adjust the target?');
    }

    haptics.success();
    addContribution(goal.id, parsed, note);
    addTransaction({
      type: 'expense',
      amount: parsed,
      categoryId: 'savings',
      note: note ? `Savings: ${note}` : `Contribution to ${goal.name}`,
      date: new Date().toISOString(),
      paymentMethod: 'card',
      accountId: goal.accountId || '',
    });
    
    // Check savings reminder
    const settings = useSettingsStore.getState();
    if ((settings.notifications as any)?.savingsReminders) {
      const newCurrentAmount = goal.currentAmount + parsed;
      const remaining = goal.targetAmount - newCurrentAmount;
      if (remaining > 0 && remaining <= goal.targetAmount * 0.1) {
        sendSavingsReminder(goal.name, remaining, currencySymbol);
      }
    }

    setAmount('');
    setNote('');
  };

  const isValid = parseFloat(amount) > 0;

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={[styles.container, { backgroundColor: theme.colors.bg.primary }]}>
        <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
          <Pressable onPress={() => router.back()} style={styles.closeBtn}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.text.primary} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: theme.colors.text.primary, fontFamily: 'Inter_600SemiBold' }]}>
            Goal Details
          </Text>
          <View style={{ width: 36 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          
          {/* Header Card */}
          <Animated.View entering={FadeInDown.delay(100).duration(500)} style={[styles.card, { backgroundColor: theme.colors.bg.secondary }]}>
            <View style={styles.cardTop}>
              <View style={[styles.iconBox, { backgroundColor: goal.color + '20' }]}>
                <Ionicons name={goal.icon as any} size={32} color={goal.color} />
              </View>
              <View style={styles.cardInfo}>
                <Text style={[styles.goalName, { color: theme.colors.text.primary, fontFamily: 'Inter_600SemiBold' }]}>
                  {goal.name}
                </Text>
                <Text style={[styles.goalDeadline, { color: theme.colors.text.tertiary, fontFamily: 'Inter_400Regular' }]}>
                  {daysLeft > 0 ? `${daysLeft} days remaining` : 'Overdue'}
                </Text>
              </View>
              <Text style={[styles.percent, { color: goal.color, fontFamily: 'Inter_700Bold' }]}>
                {Math.round(progress * 100)}%
              </Text>
            </View>

            <View style={styles.amounts}>
              <Text style={[styles.savedAmount, { color: theme.colors.text.primary, fontFamily: 'Inter_700Bold' }]}>
                {formatCurrency(goal.currentAmount, currencySymbol)}
              </Text>
              <Text style={[styles.targetAmount, { color: theme.colors.text.tertiary, fontFamily: 'Inter_500Medium' }]}>
                / {formatCurrency(goal.targetAmount, currencySymbol)}
              </Text>
            </View>

            <View style={[styles.barBg, { backgroundColor: theme.colors.bg.tertiary }]}>
              <View style={[styles.barFill, { width: `${Math.min(100, progress * 100)}%`, backgroundColor: goal.color }]} />
            </View>
          </Animated.View>

          {/* Add Contribution */}
          {!goal.isCompleted && (
            <Animated.View entering={FadeInDown.delay(150).duration(500)} style={[styles.card, { backgroundColor: theme.colors.bg.secondary }]}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text.secondary, fontFamily: 'Inter_600SemiBold' }]}>
                Add Contribution
              </Text>
              
              <View style={[styles.inputRow, { backgroundColor: theme.colors.bg.tertiary }]}>
                <Text style={[styles.currencySymbol, { color: theme.colors.text.tertiary, fontFamily: 'Inter_600SemiBold' }]}>
                  {currencySymbol}
                </Text>
                <TextInput
                  style={[styles.amountInput, { color: theme.colors.text.primary, fontFamily: 'Inter_600SemiBold' }]}
                  placeholder="0.00"
                  placeholderTextColor={theme.colors.text.tertiary}
                  keyboardType="decimal-pad"
                  value={amount}
                  onChangeText={setAmount}
                />
              </View>

              <TextInput
                style={[styles.noteInput, { backgroundColor: theme.colors.bg.tertiary, color: theme.colors.text.primary, fontFamily: 'Inter_400Regular' }]}
                placeholder="Optional Note"
                placeholderTextColor={theme.colors.text.tertiary}
                value={note}
                onChangeText={setNote}
              />

              <Pressable
                onPress={handleContribute}
                disabled={!isValid}
                style={[
                  styles.contributeBtn,
                  { backgroundColor: isValid ? goal.color : theme.colors.bg.tertiary, opacity: isValid ? 1 : 0.5 }
                ]}
              >
                <Text style={[styles.contributeText, { fontFamily: 'Inter_600SemiBold' }]}>Contribute</Text>
              </Pressable>
            </Animated.View>
          )}

          {/* History */}
          <Animated.View entering={FadeInDown.delay(200).duration(500)}>
            <Text style={[styles.historyTitle, { color: theme.colors.text.primary, fontFamily: 'Inter_600SemiBold' }]}>
              Contribution History
            </Text>
            
            {goal.contributions.length === 0 ? (
              <Text style={[styles.emptyHistory, { color: theme.colors.text.tertiary, fontFamily: 'Inter_400Regular' }]}>
                No contributions yet. Start saving!
              </Text>
            ) : (
              goal.contributions.slice().reverse().map((c) => (
                <View key={c.id} style={[styles.historyItem, { backgroundColor: theme.colors.bg.secondary }]}>
                  <View style={styles.historyLeft}>
                    <Text style={[styles.historyDate, { color: theme.colors.text.secondary, fontFamily: 'Inter_500Medium' }]}>
                      {formatRelativeDate(c.date)}
                    </Text>
                    {c.note ? (
                      <Text style={[styles.historyNote, { color: theme.colors.text.tertiary, fontFamily: 'Inter_400Regular' }]}>
                        {c.note}
                      </Text>
                    ) : null}
                  </View>
                  <Text style={[styles.historyAmount, { color: goal.color, fontFamily: 'Inter_600SemiBold' }]}>
                    +{formatCurrency(c.amount, currencySymbol)}
                  </Text>
                </View>
              ))
            )}
          </Animated.View>

        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 12 },
  closeBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 17 },
  content: { paddingHorizontal: 20, paddingBottom: 40 },

  card: { padding: 20, borderRadius: 24, marginBottom: 20 },
  cardTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  iconBox: { width: 56, height: 56, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  cardInfo: { flex: 1 },
  goalName: { fontSize: 18, marginBottom: 4 },
  goalDeadline: { fontSize: 13 },
  percent: { fontSize: 20 },

  amounts: { flexDirection: 'row', alignItems: 'baseline', marginBottom: 12 },
  savedAmount: { fontSize: 28 },
  targetAmount: { fontSize: 16, marginLeft: 4 },

  barBg: { height: 10, borderRadius: 5, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 5 },

  sectionTitle: { fontSize: 15, marginBottom: 16 },
  inputRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, borderRadius: 16, marginBottom: 12 },
  currencySymbol: { fontSize: 20, marginRight: 8 },
  amountInput: { flex: 1, fontSize: 24, paddingVertical: 16 },
  noteInput: { padding: 16, borderRadius: 16, fontSize: 15, marginBottom: 16 },
  contributeBtn: { paddingVertical: 16, borderRadius: 16, alignItems: 'center' },
  contributeText: { color: '#FFFFFF', fontSize: 16 },

  historyTitle: { fontSize: 18, marginBottom: 16, marginTop: 8 },
  emptyHistory: { fontSize: 14, textAlign: 'center', marginTop: 20 },
  historyItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderRadius: 16, marginBottom: 8 },
  historyLeft: { flex: 1 },
  historyDate: { fontSize: 15, marginBottom: 2 },
  historyNote: { fontSize: 13 },
  historyAmount: { fontSize: 16 },
});
