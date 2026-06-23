/**
 * Spendly — Transactions Screen
 *
 * Full transaction list with search, filtering, and swipe-to-delete.
 */

import React, { useMemo, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, Pressable, TextInput, Alert, Platform,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { Ionicons } from '@expo/vector-icons';
import { ThemeIcon } from '@/components/ThemeIcon';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeIn, Layout } from 'react-native-reanimated';
import DateTimePicker from '@react-native-community/datetimepicker';

import { useThemeContext } from '@/theme';
import { useAccountStore } from '@/store/useAccountStore';
import { useTransactionStore } from '@/store/useTransactionStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useHaptics } from '@/hooks/useHaptics';
import { formatCurrency } from '@/utils/formatCurrency';
import { formatRelativeDate, formatSectionDate } from '@/utils/formatDate';
import { getCategoryById } from '@/constants/categories';
import type { Transaction, TransactionType } from '@/types/transaction';

type FilterType = 'all' | 'expense' | 'income';

export default function TransactionsScreen() {
  const theme = useThemeContext();
  const insets = useSafeAreaInsets();
  const haptics = useHaptics();

  const [filter, setFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [showPicker, setShowPicker] = useState<'start' | 'end' | null>(null);

  const accountStore = useAccountStore();
  const activeAccount = accountStore.accounts.find(a => a.id === accountStore.activeAccountId);
  const currencySymbol = activeAccount?.currencySymbol || useSettingsStore((s) => s.currencySymbol);

  const rawTransactions = useTransactionStore((s) => s.transactions);
  const transactions = useMemo(() => rawTransactions.filter(t => t.accountId === accountStore.activeAccountId), [rawTransactions, accountStore.activeAccountId]);
  
  const deleteTransaction = useTransactionStore((s) => s.deleteTransaction);

  const filteredTransactions = useMemo(() => {
    let txns = [...transactions];

    // Filter by type
    if (filter !== 'all') {
      txns = txns.filter((t) => t.type === filter);
    }

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      txns = txns.filter(
        (t) =>
          t.note.toLowerCase().includes(q) ||
          t.categoryId.toLowerCase().includes(q) ||
          t.amount.toString().includes(q),
      );
    }
    
    // Date Filters
    if (startDate) {
      txns = txns.filter(t => new Date(t.date).getTime() >= startDate.getTime());
    }
    if (endDate) {
      // Ensure the end date covers the whole day by adding 24 hours
      const endOfDay = new Date(endDate);
      endOfDay.setHours(23, 59, 59, 999);
      txns = txns.filter(t => new Date(t.date).getTime() <= endOfDay.getTime());
    }

    // Sort by date descending
    txns.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return txns;
  }, [transactions, filter, searchQuery]);

  const [page, setPage] = useState(1);
  const PAGE_SIZE = 50;

  // Group transactions by date sections
  const sections = useMemo(() => {
    const groups: { title: string; data: Transaction[] }[] = [];
    let currentGroup: { title: string; data: Transaction[] } | null = null;

    filteredTransactions.forEach((txn) => {
      const sectionTitle = formatSectionDate(txn.date);
      if (!currentGroup || currentGroup.title !== sectionTitle) {
        currentGroup = { title: sectionTitle, data: [] };
        groups.push(currentGroup);
      }
      currentGroup.data.push(txn);
    });

    // Flatten for FlashList with section headers
    const items: (Transaction | { type: 'header'; title: string })[] = [];
    groups.forEach((group) => {
      items.push({ type: 'header', title: group.title });
      items.push(...group.data);
    });

    return items;
  }, [filteredTransactions]);

  const paginatedSections = useMemo(() => {
    return sections.slice(0, page * PAGE_SIZE);
  }, [sections, page]);

  const loadMore = useCallback(() => {
    if (page * PAGE_SIZE < sections.length) {
      setPage((p) => p + 1);
    }
  }, [page, sections.length]);

  const handleDelete = useCallback(
    (id: string) => {
      Alert.alert('Delete Transaction', 'Are you sure?', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            haptics.medium();
            deleteTransaction(id);
          },
        },
      ]);
    },
    [deleteTransaction, haptics],
  );

  const renderItem = useCallback(
    ({ item }: { item: Transaction | { type: 'header'; title: string } }) => {
      if ('type' in item && item.type === 'header') {
        return (
          <Text style={[styles.sectionHeader, { color: theme.colors.text.tertiary, fontFamily: 'Inter_600SemiBold' }]}>
            {item.title}
          </Text>
        );
      }

      const txn = item as Transaction;
      const category = getCategoryById(txn.categoryId);
      const isExpense = txn.type === 'expense';

      return (
        <Pressable
          onPress={() => haptics.light()}
          onLongPress={() => handleDelete(txn.id)}
          style={[styles.txnItem, { backgroundColor: theme.colors.bg.secondary }]}
        >
          <View style={[styles.txnIcon, { backgroundColor: (category?.color ?? '#6B7280') + '15' }]}>
            <ThemeIcon
              name={(category?.icon as any) ?? 'ellipse-outline'}
              size={20}
              color={category?.color ?? '#6B7280'}
            />
          </View>
          <View style={styles.txnInfo}>
            <Text style={[styles.txnNote, { color: theme.colors.text.primary, fontFamily: 'Inter_500Medium' }]} numberOfLines={1}>
              {txn.note || category?.name || 'Transaction'}
            </Text>
            <Text style={[styles.txnCategory, { color: theme.colors.text.tertiary, fontFamily: 'Inter_400Regular' }]}>
              {category?.name ?? 'Unknown'} · {formatRelativeDate(txn.date)}
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
          <Pressable onPress={() => handleDelete(txn.id)} style={{ padding: 4, marginLeft: 4 }}>
            <Ionicons name="ellipsis-vertical" size={18} color={theme.colors.text.tertiary} />
          </Pressable>
        </Pressable>
      );
    },
    [theme, currencySymbol, handleDelete, haptics],
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.bg.primary }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Text style={[styles.title, { color: theme.colors.text.primary, fontFamily: 'Inter_700Bold' }]}>
          Transactions
        </Text>

        {/* Search Bar */}
        <View style={[styles.searchBar, { backgroundColor: theme.colors.bg.secondary }]}>
          <Ionicons name="search-outline" size={18} color={theme.colors.text.tertiary} />
          <TextInput
            style={[styles.searchInput, { color: theme.colors.text.primary, fontFamily: 'Inter_400Regular' }]}
            placeholder="Search transactions..."
            placeholderTextColor={theme.colors.text.tertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color={theme.colors.text.tertiary} />
            </Pressable>
          )}
        </View>

        {/* Date Filters */}
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
          <Pressable
            onPress={() => setShowPicker('start')}
            style={[styles.filterBtn, { backgroundColor: startDate ? theme.colors.accent.primary : theme.colors.bg.secondary, flex: 1, alignItems: 'center' }]}
          >
            <Text style={[styles.filterText, { color: startDate ? (theme.mode === 'frutiger-aero' ? theme.colors.text.primary : '#FFFFFF') : theme.colors.text.secondary }]}>
              {startDate ? `From: ${startDate.toLocaleDateString()}` : 'Start Date'}
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setShowPicker('end')}
            style={[styles.filterBtn, { backgroundColor: endDate ? theme.colors.accent.primary : theme.colors.bg.secondary, flex: 1, alignItems: 'center' }]}
          >
            <Text style={[styles.filterText, { color: endDate ? (theme.mode === 'frutiger-aero' ? theme.colors.text.primary : '#FFFFFF') : theme.colors.text.secondary }]}>
              {endDate ? `To: ${endDate.toLocaleDateString()}` : 'End Date'}
            </Text>
          </Pressable>
          {(startDate || endDate) && (
            <Pressable
              onPress={() => { setStartDate(null); setEndDate(null); }}
              style={[styles.filterBtn, { backgroundColor: theme.colors.semantic.expense, alignItems: 'center', justifyContent: 'center' }]}
            >
              <Ionicons name="close" size={16} color="#FFFFFF" />
            </Pressable>
          )}
        </View>

        {/* Filter Tabs */}
        <View style={styles.filterRow}>
          {(['all', 'expense', 'income'] as FilterType[]).map((f) => (
            <Pressable
              key={f}
              onPress={() => { haptics.selection(); setFilter(f); }}
              style={[
                styles.filterBtn,
                {
                  backgroundColor: filter === f ? theme.colors.accent.primary : theme.colors.bg.secondary,
                },
              ]}
            >
              <Text
                style={[
                  styles.filterText,
                  {
                    color: filter === f ? (theme.mode === 'frutiger-aero' ? theme.colors.text.primary : '#FFFFFF') : theme.colors.text.secondary,
                    fontFamily: 'Inter_500Medium',
                  },
                ]}
              >
                {f === 'all' ? 'All' : f === 'expense' ? 'Expenses' : 'Income'}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Transaction List */}
      <FlashList
        data={paginatedSections}
        renderItem={renderItem as any}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="receipt-outline" size={48} color={theme.colors.text.tertiary} />
            <Text style={[styles.emptyTitle, { color: theme.colors.text.secondary, fontFamily: 'Inter_600SemiBold' }]}>
              No transactions found
            </Text>
            <Text style={[styles.emptyText, { color: theme.colors.text.tertiary, fontFamily: 'Inter_400Regular' }]}>
              {searchQuery || startDate || endDate ? 'Try a different filter' : 'Add your first transaction'}
            </Text>
          </View>
        }
        getItemType={(item) => ('type' in item && item.type === 'header' ? 'header' : 'transaction')}
      />

      {/* Date Picker Modal */}
      {showPicker && (
        <DateTimePicker
          value={showPicker === 'start' ? (startDate || new Date()) : (endDate || new Date())}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowPicker(null);
            if (selectedDate) {
              if (showPicker === 'start') setStartDate(selectedDate);
              else setEndDate(selectedDate);
            }
          }}
        />
      )}

      {/* FAB */}
      <Pressable
        onPress={() => { haptics.medium(); router.push('/transaction/add' as any); }}
        style={[styles.fab, { backgroundColor: theme.colors.accent.primary, bottom: Platform.OS === 'ios' ? 100 : 80 }]}
      >
        <Ionicons name="add" size={28} color={theme.mode === 'frutiger-aero' ? theme.colors.text.primary : '#FFFFFF'} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 8 },
  title: { fontSize: 28, letterSpacing: -0.5, marginBottom: 16 },

  // Search
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 10,
    marginBottom: 12,
  },
  searchInput: { flex: 1, fontSize: 15, padding: 0 },

  // Filters
  filterRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  filterBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  filterText: { fontSize: 13 },

  // Section Header
  sectionHeader: {
    fontSize: 13,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginTop: 16,
    marginBottom: 8,
  },

  // Transaction Item
  txnItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    gap: 12,
    marginBottom: 6,
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
  txnCategory: { fontSize: 12 },
  txnAmount: { fontSize: 15 },

  // Empty
  empty: { alignItems: 'center', paddingTop: 80, gap: 8 },
  emptyTitle: { fontSize: 17, marginTop: 8 },
  emptyText: { fontSize: 14 },

  // FAB
  fab: {
    position: 'absolute',
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
});
