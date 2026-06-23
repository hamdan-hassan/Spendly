import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { useThemeContext } from '@/theme';
import { useGamificationStore } from '@/store/useGamificationStore';
import { achievements as allAchievements } from '@/constants/achievements';
import { useHaptics } from '@/hooks/useHaptics';

export default function AchievementsScreen() {
  const theme = useThemeContext();
  const insets = useSafeAreaInsets();
  const haptics = useHaptics();

  const userAchievements = useGamificationStore((s) => s.achievements);
  const xp = useGamificationStore((s) => s.xp);

  const renderBadge = (achievementId: string, index: number) => {
    const achDef = allAchievements.find((a) => a.id === achievementId);
    const userAch = userAchievements.find((a) => a.achievementId === achievementId);

    if (!achDef || !userAch) return null;

    const isUnlocked = userAch.isUnlocked;
    const progressText = `${userAch.currentValue}/${achDef.requiredValue}`;

    return (
      <Animated.View
        key={achDef.id}
        entering={FadeInDown.delay(index * 50).duration(500)}
        style={{ width: '31%', marginBottom: 20 }}
      >
        <Pressable
          onPress={() => {
            haptics.selection();
            if (isUnlocked) {
              Alert.alert(achDef.name, `Unlocked on ${new Date(userAch.unlockedAt!).toLocaleDateString()}\n\n${achDef.description}`);
            } else {
              Alert.alert('Locked', `${achDef.description}\n\nProgress: ${progressText}`);
            }
          }}
          style={({ pressed }) => [
            styles.badgeContainer,
            {
              backgroundColor: isUnlocked ? achDef.color + '20' : theme.colors.bg.secondary,
              borderColor: isUnlocked ? achDef.color : theme.colors.border.default,
              opacity: pressed ? 0.8 : 1,
            },
          ]}
        >
          <Ionicons
            name={achDef.icon as any}
            size={36}
            color={isUnlocked ? achDef.color : theme.colors.text.tertiary}
            style={{ opacity: isUnlocked ? 1 : 0.4 }}
          />
        </Pressable>
        <Text
          style={[
            styles.badgeName,
            { color: isUnlocked ? theme.colors.text.primary : theme.colors.text.tertiary, fontFamily: 'Inter_600SemiBold' }
          ]}
          numberOfLines={2}
        >
          {achDef.name}
        </Text>
      </Animated.View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.bg.primary }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12, backgroundColor: theme.colors.bg.primary }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text.primary} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: theme.colors.text.primary, fontFamily: 'Inter_700Bold' }]}>
          Trophy Room
        </Text>
        <View style={styles.xpBadge}>
          <Text style={{ color: theme.colors.accent.primary, fontFamily: 'Inter_700Bold', fontSize: 14 }}>
            {xp} XP
          </Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]}
      >
        <Text style={[styles.sectionTitle, { color: theme.colors.text.tertiary, fontFamily: 'Inter_600SemiBold' }]}>
          TRACKING BADGES
        </Text>
        <View style={styles.grid}>
          {allAchievements.filter(a => a.category === 'tracking').map((a, i) => renderBadge(a.id, i))}
        </View>

        <Text style={[styles.sectionTitle, { color: theme.colors.text.tertiary, fontFamily: 'Inter_600SemiBold', marginTop: 24 }]}>
          BUDGETING BADGES
        </Text>
        <View style={styles.grid}>
          {allAchievements.filter(a => a.category === 'budgeting').map((a, i) => renderBadge(a.id, i))}
        </View>

        <Text style={[styles.sectionTitle, { color: theme.colors.text.tertiary, fontFamily: 'Inter_600SemiBold', marginTop: 24 }]}>
          SAVINGS BADGES
        </Text>
        <View style={styles.grid}>
          {allAchievements.filter(a => a.category === 'saving').map((a, i) => renderBadge(a.id, i))}
        </View>

        <Text style={[styles.sectionTitle, { color: theme.colors.text.tertiary, fontFamily: 'Inter_600SemiBold', marginTop: 24 }]}>
          MILESTONES & SECRETS
        </Text>
        <View style={styles.grid}>
          {allAchievements.filter(a => a.category === 'milestone').map((a, i) => renderBadge(a.id, i))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(150,150,150,0.2)',
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18 },
  xpBadge: {
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  content: { padding: 20 },
  sectionTitle: { fontSize: 13, letterSpacing: 1.5, marginBottom: 16 },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    gap: 10,
  },
  badgeContainer: {
    aspectRatio: 1,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    marginBottom: 8,
  },
  badgeName: {
    fontSize: 12,
    textAlign: 'center',
  },
});
