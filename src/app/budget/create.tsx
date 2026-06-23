/**
 * Spendly — Create Budget Modal
 */

import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { useThemeContext } from '@/theme';
import { useAccountStore } from '@/store/useAccountStore';
import { useBudgetStore } from '@/store/useBudgetStore';
import { useGamificationStore } from '@/store/useGamificationStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useHaptics } from '@/hooks/useHaptics';
import { expenseCategories } from '@/constants/categories';

export default function CreateBudgetScreen() {
  const theme = useThemeContext();
  const insets = useSafeAreaInsets();
  const haptics = useHaptics();

  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState<string>('');

  const accountStore = useAccountStore();
  const activeAccount = accountStore.accounts.find(a => a.id === accountStore.activeAccountId);
  const currencySymbol = activeAccount?.currencySymbol || useSettingsStore((s) => s.currencySymbol);

  const addBudget = useBudgetStore((s) => s.addBudget);
  const onBudgetCreated = useGamificationStore((s) => s.onBudgetCreated);

  const handleSubmit = () => {
    const parsedAmount = parseFloat(amount);
    if (!parsedAmount || parsedAmount <= 0) return;
    if (!categoryId) return;

    haptics.success();

    const cat = expenseCategories.find((c) => c.id === categoryId);
    addBudget({
      name: name || cat?.name || 'Budget',
      categoryId,
      amount: parsedAmount,
      period: 'monthly',
      accountId: accountStore.activeAccountId || '',
    });

    onBudgetCreated();
    router.back();
  };

  const isValid = parseFloat(amount) > 0 && categoryId !== '';

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={[styles.container, { backgroundColor: theme.colors.bg.primary }]}>
        <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
          <Pressable onPress={() => router.back()} style={styles.closeBtn}>
            <Ionicons name="close" size={24} color={theme.colors.text.primary} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: theme.colors.text.primary, fontFamily: 'Inter_600SemiBold' }]}>
            Create Budget
          </Text>
          <View style={{ width: 36 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          {/* Amount */}
          <Animated.View entering={FadeInDown.delay(100).duration(500)} style={styles.amountSection}>
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

          {/* Name */}
          <Animated.View entering={FadeInDown.delay(150).duration(500)}>
            <Text style={[styles.label, { color: theme.colors.text.secondary, fontFamily: 'Inter_500Medium' }]}>
              Budget Name (optional)
            </Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.colors.bg.secondary, color: theme.colors.text.primary, fontFamily: 'Inter_400Regular' }]}
              placeholder="e.g. Food Budget"
              placeholderTextColor={theme.colors.text.tertiary}
              value={name}
              onChangeText={setName}
            />
          </Animated.View>

          {/* Category */}
          <Animated.View entering={FadeInDown.delay(200).duration(500)}>
            <Text style={[styles.label, { color: theme.colors.text.secondary, fontFamily: 'Inter_500Medium' }]}>
              Category
            </Text>
            <View style={styles.categoryGrid}>
              {expenseCategories.map((cat) => (
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
                  <Ionicons name={cat.icon as any} size={20} color={cat.color} />
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

          {/* Submit */}
          <Animated.View entering={FadeInDown.delay(300).duration(500)} style={styles.submitSection}>
            <Pressable
              onPress={handleSubmit}
              disabled={!isValid}
              style={[
                styles.submitBtn,
                { backgroundColor: isValid ? theme.colors.accent.primary : theme.colors.bg.tertiary, opacity: isValid ? 1 : 0.5 },
              ]}
            >
              <Ionicons name="checkmark" size={22} color="#FFFFFF" />
              <Text style={[styles.submitText, { fontFamily: 'Inter_600SemiBold' }]}>Create Budget</Text>
            </Pressable>
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
  amountSection: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 28, gap: 4 },
  amountCurrency: { fontSize: 32 },
  amountInput: { fontSize: 48, minWidth: 100, textAlign: 'center' },
  label: { fontSize: 14, marginBottom: 8, marginTop: 16 },
  input: { borderRadius: 12, padding: 14, fontSize: 15 },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  categoryBtn: { width: '30%', flexGrow: 1, flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 10, borderRadius: 12, gap: 8 },
  categoryLabel: { fontSize: 12, flex: 1 },
  submitSection: { marginTop: 28 },
  submitBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 16, borderRadius: 14 },
  submitText: { color: '#FFFFFF', fontSize: 16 },
});
