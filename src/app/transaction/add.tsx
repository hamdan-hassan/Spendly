/**
 * Spendly — Add/Edit Transaction Modal
 *
 * Full transaction form with category picker, date picker, and amount input.
 */

import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, Pressable, TextInput, ScrollView, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { useThemeContext } from '@/theme';
import { useTransactionStore } from '@/store/useTransactionStore';
import { useGamificationStore } from '@/store/useGamificationStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useHaptics } from '@/hooks/useHaptics';
import { getCategoriesByType } from '@/constants/categories';
import type { TransactionType, PaymentMethod } from '@/types/transaction';

export default function AddTransactionScreen() {
  const theme = useThemeContext();
  const insets = useSafeAreaInsets();
  const haptics = useHaptics();
  const params = useLocalSearchParams<{ type?: string }>();

  const [type, setType] = useState<TransactionType>(
    (params.type as TransactionType) || 'expense',
  );
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [note, setNote] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');

  const addTransaction = useTransactionStore((s) => s.addTransaction);
  const onExpenseLogged = useGamificationStore((s) => s.onExpenseLogged);
  const onIncomeLogged = useGamificationStore((s) => s.onIncomeLogged);
  const currencySymbol = useSettingsStore((s) => s.currencySymbol);

  const categories = useMemo(() => getCategoriesByType(type), [type]);

  const paymentMethods: { value: PaymentMethod; label: string; icon: string }[] = [
    { value: 'cash', label: 'Cash', icon: 'cash-outline' },
    { value: 'card', label: 'Card', icon: 'card-outline' },
    { value: 'bank_transfer', label: 'Bank', icon: 'business-outline' },
    { value: 'mobile_money', label: 'Mobile', icon: 'phone-portrait-outline' },
  ];

  const handleSubmit = () => {
    const parsedAmount = parseFloat(amount);
    if (!parsedAmount || parsedAmount <= 0) return;
    if (!categoryId) return;

    haptics.success();

    addTransaction({
      type,
      amount: parsedAmount,
      categoryId,
      note,
      date: new Date().toISOString(),
      paymentMethod,
    });

    if (type === 'expense') {
      onExpenseLogged();
    } else {
      onIncomeLogged();
    }

    router.back();
  };

  const isValid = parseFloat(amount) > 0 && categoryId !== '';

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.container, { backgroundColor: theme.colors.bg.primary }]}>
        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
          <Pressable onPress={() => router.back()} style={styles.closeBtn}>
            <Ionicons name="close" size={24} color={theme.colors.text.primary} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: theme.colors.text.primary, fontFamily: 'Inter_600SemiBold' }]}>
            Add {type === 'expense' ? 'Expense' : 'Income'}
          </Text>
          <View style={{ width: 36 }} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          {/* Type Toggle */}
          <Animated.View entering={FadeInDown.delay(100).duration(500)} style={styles.typeToggle}>
            {(['expense', 'income'] as TransactionType[]).map((t) => (
              <Pressable
                key={t}
                onPress={() => { haptics.selection(); setType(t); setCategoryId(''); }}
                style={[
                  styles.typeBtn,
                  {
                    backgroundColor:
                      type === t
                        ? t === 'expense' ? theme.colors.semantic.expense : theme.colors.semantic.income
                        : theme.colors.bg.secondary,
                  },
                ]}
              >
                <Ionicons
                  name={t === 'expense' ? 'arrow-up-outline' : 'arrow-down-outline'}
                  size={18}
                  color={type === t ? '#FFFFFF' : theme.colors.text.secondary}
                />
                <Text
                  style={[
                    styles.typeBtnText,
                    {
                      color: type === t ? '#FFFFFF' : theme.colors.text.secondary,
                      fontFamily: 'Inter_600SemiBold',
                    },
                  ]}
                >
                  {t === 'expense' ? 'Expense' : 'Income'}
                </Text>
              </Pressable>
            ))}
          </Animated.View>

          {/* Amount Input */}
          <Animated.View entering={FadeInDown.delay(150).duration(500)} style={styles.amountSection}>
            <Text style={[styles.amountCurrency, { color: theme.colors.text.tertiary, fontFamily: 'Inter_700Bold' }]}>
              {currencySymbol}
            </Text>
            <TextInput
              style={[styles.amountInput, { color: theme.colors.text.primary, fontFamily: 'Inter_700Bold' }]}
              placeholder="0.00"
              placeholderTextColor={theme.colors.text.tertiary}
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
              autoFocus
            />
          </Animated.View>

          {/* Note */}
          <Animated.View entering={FadeInDown.delay(200).duration(500)}>
            <Text style={[styles.label, { color: theme.colors.text.secondary, fontFamily: 'Inter_500Medium' }]}>
              Note
            </Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.colors.bg.secondary, color: theme.colors.text.primary, fontFamily: 'Inter_400Regular' }]}
              placeholder="What was this for?"
              placeholderTextColor={theme.colors.text.tertiary}
              value={note}
              onChangeText={setNote}
            />
          </Animated.View>

          {/* Category */}
          <Animated.View entering={FadeInDown.delay(250).duration(500)}>
            <Text style={[styles.label, { color: theme.colors.text.secondary, fontFamily: 'Inter_500Medium' }]}>
              Category
            </Text>
            <View style={styles.categoryGrid}>
              {categories.map((cat) => (
                <Pressable
                  key={cat.id}
                  onPress={() => { haptics.selection(); setCategoryId(cat.id); }}
                  style={[
                    styles.categoryBtn,
                    {
                      backgroundColor: categoryId === cat.id ? cat.color + '20' : theme.colors.bg.secondary,
                      borderColor: categoryId === cat.id ? cat.color : 'transparent',
                      borderWidth: 1.5,
                    },
                  ]}
                >
                  <View style={[styles.categoryIcon, { backgroundColor: cat.color + '15' }]}>
                    <Ionicons name={cat.icon as any} size={20} color={cat.color} />
                  </View>
                  <Text
                    style={[
                      styles.categoryLabel,
                      { color: categoryId === cat.id ? cat.color : theme.colors.text.secondary, fontFamily: 'Inter_500Medium' },
                    ]}
                    numberOfLines={1}
                  >
                    {cat.name}
                  </Text>
                </Pressable>
              ))}
            </View>
          </Animated.View>

          {/* Payment Method (Expense only) */}
          {type === 'expense' && (
            <Animated.View entering={FadeInDown.delay(300).duration(500)}>
              <Text style={[styles.label, { color: theme.colors.text.secondary, fontFamily: 'Inter_500Medium' }]}>
                Payment Method
              </Text>
              <View style={styles.paymentRow}>
                {paymentMethods.map((pm) => (
                  <Pressable
                    key={pm.value}
                    onPress={() => { haptics.selection(); setPaymentMethod(pm.value); }}
                    style={[
                      styles.paymentBtn,
                      {
                        backgroundColor: paymentMethod === pm.value ? theme.colors.accent.primaryMuted : theme.colors.bg.secondary,
                        borderColor: paymentMethod === pm.value ? theme.colors.accent.primary : 'transparent',
                        borderWidth: 1,
                      },
                    ]}
                  >
                    <Ionicons
                      name={pm.icon as any}
                      size={18}
                      color={paymentMethod === pm.value ? theme.colors.accent.primary : theme.colors.text.tertiary}
                    />
                    <Text
                      style={[
                        styles.paymentLabel,
                        {
                          color: paymentMethod === pm.value ? theme.colors.accent.primary : theme.colors.text.secondary,
                          fontFamily: 'Inter_500Medium',
                        },
                      ]}
                    >
                      {pm.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </Animated.View>
          )}

          {/* Submit Button */}
          <Animated.View entering={FadeInDown.delay(350).duration(500)} style={styles.submitSection}>
            <Pressable
              onPress={handleSubmit}
              disabled={!isValid}
              style={[
                styles.submitBtn,
                {
                  backgroundColor: isValid ? theme.colors.accent.primary : theme.colors.bg.tertiary,
                  opacity: isValid ? 1 : 0.5,
                },
              ]}
            >
              <Ionicons name="checkmark" size={22} color="#FFFFFF" />
              <Text style={[styles.submitText, { fontFamily: 'Inter_600SemiBold' }]}>
                Add {type === 'expense' ? 'Expense' : 'Income'}
              </Text>
            </Pressable>
          </Animated.View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  closeBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 17 },
  content: { paddingHorizontal: 20, paddingBottom: 40 },

  // Type Toggle
  typeToggle: { flexDirection: 'row', gap: 8, marginBottom: 24 },
  typeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
  },
  typeBtnText: { fontSize: 14 },

  // Amount
  amountSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
    gap: 4,
  },
  amountCurrency: { fontSize: 32 },
  amountInput: { fontSize: 48, minWidth: 100, textAlign: 'center' },

  // Form
  label: { fontSize: 14, marginBottom: 8, marginTop: 16 },
  input: { borderRadius: 12, padding: 14, fontSize: 15 },

  // Categories
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  categoryBtn: {
    width: '30%',
    flexGrow: 1,
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 6,
    borderRadius: 12,
    gap: 6,
  },
  categoryIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  categoryLabel: { fontSize: 11, textAlign: 'center' },

  // Payment
  paymentRow: { flexDirection: 'row', gap: 8 },
  paymentBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 4,
  },
  paymentLabel: { fontSize: 11 },

  // Submit
  submitSection: { marginTop: 28 },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 14,
  },
  submitText: { color: '#FFFFFF', fontSize: 16 },
});
