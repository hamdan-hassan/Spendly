/**
 * Spendly — Create Savings Goal Modal
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { useThemeContext } from '@/theme';
import { useAccountStore } from '@/store/useAccountStore';
import { useSavingsStore } from '@/store/useSavingsStore';
import { useGamificationStore } from '@/store/useGamificationStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useHaptics } from '@/hooks/useHaptics';

const goalIcons = [
  { icon: 'car-outline', label: 'Car' },
  { icon: 'home-outline', label: 'Home' },
  { icon: 'airplane-outline', label: 'Travel' },
  { icon: 'laptop-outline', label: 'Tech' },
  { icon: 'school-outline', label: 'Education' },
  { icon: 'shield-checkmark-outline', label: 'Emergency' },
  { icon: 'diamond-outline', label: 'Luxury' },
  { icon: 'gift-outline', label: 'Gift' },
  { icon: 'fitness-outline', label: 'Health' },
  { icon: 'business-outline', label: 'Business' },
  { icon: 'phone-portrait-outline', label: 'Phone' },
  { icon: 'heart-outline', label: 'Wedding' },
];

const goalColors = [
  '#6366F1', '#10B981', '#F59E0B', '#3B82F6',
  '#EC4899', '#8B5CF6', '#14B8A6', '#F43F5E',
  '#F97316', '#06B6D4', '#84CC16', '#D946EF',
];

export default function CreateSavingsGoalScreen() {
  const theme = useThemeContext();
  const insets = useSafeAreaInsets();
  const haptics = useHaptics();

  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('shield-checkmark-outline');
  const [selectedColor, setSelectedColor] = useState('#6366F1');
  const [deadlineMonths, setDeadlineMonths] = useState(3);

  const accountStore = useAccountStore();
  const activeAccount = accountStore.accounts.find(a => a.id === accountStore.activeAccountId);
  const currencySymbol = activeAccount?.currencySymbol || useSettingsStore((s) => s.currencySymbol);

  const addGoal = useSavingsStore((s) => s.addGoal);
  const onSavingsGoalCreated = useGamificationStore((s) => s.onSavingsGoalCreated);

  const handleSubmit = () => {
    const parsed = parseFloat(targetAmount);
    if (!parsed || parsed <= 0 || !name.trim()) return;

    haptics.success();

    // Calculate deadline based on selected months
    const deadline = new Date();
    deadline.setMonth(deadline.getMonth() + deadlineMonths);

    addGoal({
      name: name.trim(),
      targetAmount: parsed,
      deadline: deadline.toISOString(),
      icon: selectedIcon,
      color: selectedColor,
      accountId: accountStore.activeAccountId || '',
    });

    onSavingsGoalCreated();
    router.back();
  };

  const isValid = parseFloat(targetAmount) > 0 && name.trim().length > 0;

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={[styles.container, { backgroundColor: theme.colors.bg.primary }]}>
        <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
          <Pressable onPress={() => router.back()} style={styles.closeBtn}>
            <Ionicons name="close" size={24} color={theme.colors.text.primary} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: theme.colors.text.primary, fontFamily: 'Inter_600SemiBold' }]}>
            New Savings Goal
          </Text>
          <View style={{ width: 36 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          {/* Preview */}
          <Animated.View entering={FadeInDown.delay(100).duration(500)} style={styles.preview}>
            <View style={[styles.previewIcon, { backgroundColor: selectedColor + '20' }]}>
              <Ionicons name={selectedIcon as any} size={32} color={selectedColor} />
            </View>
            <Text style={[styles.previewName, { color: theme.colors.text.primary, fontFamily: 'Inter_600SemiBold' }]}>
              {name || 'Your Goal'}
            </Text>
            <Text style={[styles.previewAmount, { color: theme.colors.text.tertiary, fontFamily: 'Inter_400Regular' }]}>
              Target: {currencySymbol}{targetAmount || '0.00'}
            </Text>
          </Animated.View>

          {/* Name */}
          <Animated.View entering={FadeInDown.delay(150).duration(500)}>
            <Text style={[styles.label, { color: theme.colors.text.secondary, fontFamily: 'Inter_500Medium' }]}>
              Goal Name
            </Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.colors.bg.secondary, color: theme.colors.text.primary, fontFamily: 'Inter_400Regular' }]}
              placeholder="e.g. Emergency Fund"
              placeholderTextColor={theme.colors.text.tertiary}
              value={name}
              onChangeText={setName}
            />
          </Animated.View>

          {/* Amount */}
          <Animated.View entering={FadeInDown.delay(200).duration(500)}>
            <Text style={[styles.label, { color: theme.colors.text.secondary, fontFamily: 'Inter_500Medium' }]}>
              Target Amount
            </Text>
            <View style={[styles.amountRow, { backgroundColor: theme.colors.bg.secondary }]}>
              <Text style={[styles.amountSymbol, { color: theme.colors.text.tertiary, fontFamily: 'Inter_600SemiBold' }]}>
                {currencySymbol}
              </Text>
              <TextInput
                style={[styles.amountInput, { color: theme.colors.text.primary, fontFamily: 'Inter_600SemiBold' }]}
                placeholder="0.00"
                placeholderTextColor={theme.colors.text.tertiary}
                value={targetAmount}
                onChangeText={setTargetAmount}
                keyboardType="decimal-pad"
              />
            </View>
          </Animated.View>

          {/* Deadline Picker */}
          <Animated.View entering={FadeInDown.delay(225).duration(500)}>
            <Text style={[styles.label, { color: theme.colors.text.secondary, fontFamily: 'Inter_500Medium' }]}>
              Target Deadline
            </Text>
            <View style={styles.deadlineGrid}>
              {[
                { label: '1 Month', value: 1 },
                { label: '3 Months', value: 3 },
                { label: '6 Months', value: 6 },
                { label: '1 Year', value: 12 },
              ].map((opt) => (
                <Pressable
                  key={opt.value}
                  onPress={() => { haptics.selection(); setDeadlineMonths(opt.value); }}
                  style={[
                    styles.deadlineBtn,
                    {
                      backgroundColor: deadlineMonths === opt.value ? theme.colors.accent.primary : theme.colors.bg.secondary,
                    },
                  ]}
                >
                  <Text style={{ color: deadlineMonths === opt.value ? '#FFFFFF' : theme.colors.text.secondary, fontFamily: 'Inter_500Medium', fontSize: 14 }}>
                    {opt.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </Animated.View>

          {/* Icon Picker */}
          <Animated.View entering={FadeInDown.delay(250).duration(500)}>
            <Text style={[styles.label, { color: theme.colors.text.secondary, fontFamily: 'Inter_500Medium' }]}>
              Icon
            </Text>
            <View style={styles.iconGrid}>
              {goalIcons.map((gi) => (
                <Pressable
                  key={gi.icon}
                  onPress={() => { haptics.selection(); setSelectedIcon(gi.icon); }}
                  style={[
                    styles.iconBtn,
                    {
                      backgroundColor: selectedIcon === gi.icon ? selectedColor + '20' : theme.colors.bg.secondary,
                      borderColor: selectedIcon === gi.icon ? selectedColor : 'transparent',
                      borderWidth: 1.5,
                    },
                  ]}
                >
                  <Ionicons name={gi.icon as any} size={22} color={selectedIcon === gi.icon ? selectedColor : theme.colors.text.tertiary} />
                </Pressable>
              ))}
            </View>
          </Animated.View>

          {/* Color Picker */}
          <Animated.View entering={FadeInDown.delay(300).duration(500)}>
            <Text style={[styles.label, { color: theme.colors.text.secondary, fontFamily: 'Inter_500Medium' }]}>
              Color
            </Text>
            <View style={styles.colorRow}>
              {goalColors.map((color) => (
                <Pressable
                  key={color}
                  onPress={() => { haptics.selection(); setSelectedColor(color); }}
                  style={[
                    styles.colorBtn,
                    {
                      backgroundColor: color,
                      borderColor: selectedColor === color ? '#FFFFFF' : 'transparent',
                      borderWidth: 2,
                      transform: [{ scale: selectedColor === color ? 1.15 : 1 }],
                    },
                  ]}
                />
              ))}
            </View>
          </Animated.View>

          {/* Submit */}
          <Animated.View entering={FadeInDown.delay(350).duration(500)} style={styles.submitSection}>
            <Pressable
              onPress={handleSubmit}
              disabled={!isValid}
              style={[
                styles.submitBtn,
                { backgroundColor: isValid ? selectedColor : theme.colors.bg.tertiary, opacity: isValid ? 1 : 0.5 },
              ]}
            >
              <Ionicons name="flag" size={20} color="#FFFFFF" />
              <Text style={[styles.submitText, { fontFamily: 'Inter_600SemiBold' }]}>Create Goal</Text>
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

  preview: { alignItems: 'center', marginVertical: 20, gap: 8 },
  previewIcon: { width: 72, height: 72, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  previewName: { fontSize: 20 },
  previewAmount: { fontSize: 14 },

  label: { fontSize: 14, marginBottom: 8, marginTop: 16 },
  input: { borderRadius: 12, padding: 14, fontSize: 15 },

  amountRow: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, paddingHorizontal: 14, gap: 4 },
  amountSymbol: { fontSize: 20 },
  amountInput: { flex: 1, fontSize: 20, paddingVertical: 14 },

  iconGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  iconBtn: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },

  deadlineGrid: { flexDirection: 'row', gap: 8 },
  deadlineBtn: { flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },

  colorRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  colorBtn: { width: 36, height: 36, borderRadius: 18 },

  submitSection: { marginTop: 28 },
  submitBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 16, borderRadius: 14 },
  submitText: { color: '#FFFFFF', fontSize: 16 },
});
