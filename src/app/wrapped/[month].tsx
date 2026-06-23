import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useHaptics } from '@/hooks/useHaptics';
import { generateWrappedData } from '@/services/wrappedEngine';
import { useAccountStore } from '@/store/useAccountStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useTransactionStore } from '@/store/useTransactionStore';
import { formatCurrency } from '@/utils/formatCurrency';

const { width, height } = Dimensions.get('window');
const SLIDE_DURATION = 5000;

export default function WrappedScreen() {
  const { month } = useLocalSearchParams<{ month: string }>();
  const insets = useSafeAreaInsets();
  const haptics = useHaptics();

  const allTransactions = useTransactionStore((s) => s.transactions);
  const accountStore = useAccountStore();
  const activeAccount = accountStore.accounts.find(a => a.id === accountStore.activeAccountId);
  const fallbackCurrencySymbol = useSettingsStore((s) => s.currencySymbol);
  const currencySymbol = activeAccount?.currencySymbol || fallbackCurrencySymbol;

  const [currentSlide, setCurrentSlide] = useState(0);

  const data = useMemo(() => {
    // Filter to just the active account
    const accountTransactions = allTransactions.filter(t => t.accountId === accountStore.activeAccountId);
    return generateWrappedData(accountTransactions, month || '');
  }, [allTransactions, accountStore.activeAccountId, month]);

  const totalSlides = 5; // Intro, Numbers, Guilty Pleasure, Persona, Outro

  useEffect(() => {
    if (!data) return;
    const timer = setTimeout(() => {
      if (currentSlide < totalSlides - 1) {
        setCurrentSlide(prev => prev + 1);
      } else {
        router.back();
      }
    }, SLIDE_DURATION);

    return () => clearTimeout(timer);
  }, [currentSlide, data]);

  const handleNext = () => {
    haptics.selection();
    if (currentSlide < totalSlides - 1) {
      setCurrentSlide(prev => prev + 1);
    } else {
      router.back();
    }
  };

  const handlePrev = () => {
    haptics.selection();
    if (currentSlide > 0) {
      setCurrentSlide(prev => prev - 1);
    }
  };

  if (!data) {
    return (
      <View style={[styles.container, { backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' }]}>
        <Stack.Screen options={{ headerShown: false, presentation: 'fullScreenModal' }} />
        <Text style={{ color: '#FFF', fontFamily: 'Inter_600SemiBold', fontSize: 18 }}>Not enough data for this month.</Text>
        <Pressable onPress={() => router.back()} style={{ marginTop: 20, padding: 12, backgroundColor: '#333', borderRadius: 8 }}>
          <Text style={{ color: '#FFF' }}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  const renderSlideContent = () => {
    switch (currentSlide) {
      case 0:
        return (
          <Animated.View entering={FadeInDown.delay(300)} style={styles.slideCenter}>
            <Text style={styles.superTitle}>ARE YOU READY?</Text>
            <Text style={styles.heroTitle}>Your {month} Wrapped is here.</Text>
            <Text style={styles.subText}>Let&apos;s see where your money went...</Text>
          </Animated.View>
        );
      case 1:
        return (
          <Animated.View entering={FadeInDown.delay(300)} style={styles.slideCenter}>
            <Text style={styles.superTitle}>THE BIG PICTURE</Text>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>You Earned</Text>
              <Text style={[styles.statValue, { color: '#10B981' }]}>{formatCurrency(data.totalIncome, currencySymbol)}</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>You Spent</Text>
              <Text style={[styles.statValue, { color: '#EF4444' }]}>{formatCurrency(data.totalExpenses, currencySymbol)}</Text>
            </View>
            <Text style={styles.subText}>
              {data.totalIncome > data.totalExpenses ? "Great job staying in the green!" : "A little heavy on the spending, huh?"}
            </Text>
          </Animated.View>
        );
      case 2:
        return (
          <Animated.View entering={FadeInDown.delay(300)} style={styles.slideCenter}>
            <Text style={styles.superTitle}>GUILTY PLEASURES</Text>
            <Text style={styles.heroTitle}>You loved {data.topCategoryName}.</Text>
            <Text style={styles.subText}>You spent {formatCurrency(data.topCategoryAmount, currencySymbol)} just on that!</Text>
            
            {data.biggestPurchase && (
              <View style={[styles.statBox, { marginTop: 40 }]}>
                <Text style={styles.statLabel}>Biggest Single Purchase</Text>
                <Text style={[styles.statValue, { color: '#F59E0B' }]}>{formatCurrency(data.biggestPurchase.amount, currencySymbol)}</Text>
                <Text style={styles.subText}>&quot;{data.biggestPurchase.note || 'No note'}&quot;</Text>
              </View>
            )}
          </Animated.View>
        );
      case 3:
        return (
          <Animated.View entering={FadeInDown.delay(300)} style={styles.slideCenter}>
            <Text style={styles.superTitle}>YOUR FINANCIAL PERSONA</Text>
            <Text style={{ fontSize: 80, marginBottom: 20 }}>{data.personaEmoji}</Text>
            <Text style={styles.heroTitle}>{data.personaTitle}</Text>
            <Text style={styles.subText}>{data.personaDescription}</Text>
          </Animated.View>
        );
      case 4:
        return (
          <Animated.View entering={FadeInDown.delay(300)} style={styles.slideCenter}>
            <Text style={styles.heroTitle}>That&apos;s a wrap!</Text>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>{month} Summary</Text>
              <Text style={styles.summaryRow}>Earned: {formatCurrency(data.totalIncome, currencySymbol)}</Text>
              <Text style={styles.summaryRow}>Spent: {formatCurrency(data.totalExpenses, currencySymbol)}</Text>
              <Text style={styles.summaryRow}>Persona: {data.personaEmoji} {data.personaTitle}</Text>
            </View>
            <Text style={styles.subText}>Take a screenshot to share!</Text>
          </Animated.View>
        );
      default:
        return null;
    }
  };

  const getGradientForSlide = (): readonly [string, string] => {
    switch(currentSlide) {
      case 0: return ['#6366F1', '#4F46E5'];
      case 1: return ['#10B981', '#059669'];
      case 2: return ['#F43F5E', '#E11D48'];
      case 3: return ['#8B5CF6', '#7C3AED'];
      case 4: return ['#F59E0B', '#D97706'];
      default: return ['#0A0E1A', '#0A0E1A'];
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false, presentation: 'fullScreenModal' }} />
      <LinearGradient colors={getGradientForSlide()} style={StyleSheet.absoluteFill} />
      
      {/* Progress Bars */}
      <View style={[styles.progressContainer, { top: insets.top + 10 }]}>
        {Array.from({ length: totalSlides }).map((_, i) => (
          <View key={i} style={styles.progressBarBg}>
            {i < currentSlide && <View style={[styles.progressBarFill, { width: '100%' }]} />}
            {i === currentSlide && (
              <Animated.View 
                entering={FadeIn.duration(SLIDE_DURATION)} 
                style={[styles.progressBarFill, { width: '100%' }]} 
              />
            )}
          </View>
        ))}
      </View>

      {/* Content */}
      <View style={styles.contentContainer}>
        {renderSlideContent()}
      </View>

      {/* Touch Zones */}
      <View style={styles.touchZones}>
        <Pressable style={styles.leftZone} onPress={handlePrev} />
        <Pressable style={styles.rightZone} onPress={handleNext} />
      </View>

      <Pressable onPress={() => router.back()} style={[styles.closeBtn, { top: insets.top + 24 }]}>
        <Ionicons name="close" size={28} color="#FFFFFF" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  progressContainer: {
    position: 'absolute',
    left: 10,
    right: 10,
    flexDirection: 'row',
    gap: 4,
    zIndex: 10,
  },
  progressBarBg: {
    flex: 1,
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
  },
  contentContainer: {
    flex: 1,
    padding: 30,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  touchZones: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    zIndex: 5,
  },
  leftZone: { flex: 1 },
  rightZone: { flex: 1 },
  closeBtn: {
    position: 'absolute',
    right: 20,
    zIndex: 20,
    padding: 8,
  },
  
  // Typography & Elements
  slideCenter: { alignItems: 'center', width: '100%' },
  superTitle: { color: 'rgba(255,255,255,0.7)', fontFamily: 'Inter_700Bold', fontSize: 14, letterSpacing: 2, marginBottom: 16 },
  heroTitle: { color: '#FFFFFF', fontFamily: 'Inter_700Bold', fontSize: 42, textAlign: 'center', lineHeight: 48, marginBottom: 20 },
  subText: { color: 'rgba(255,255,255,0.9)', fontFamily: 'Inter_500Medium', fontSize: 18, textAlign: 'center', lineHeight: 26 },
  
  statBox: { backgroundColor: 'rgba(0,0,0,0.2)', padding: 24, borderRadius: 20, width: '100%', alignItems: 'center', marginBottom: 16 },
  statLabel: { color: 'rgba(255,255,255,0.8)', fontFamily: 'Inter_600SemiBold', fontSize: 14, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 },
  statValue: { fontFamily: 'Inter_700Bold', fontSize: 40 },

  summaryCard: { backgroundColor: '#FFFFFF', padding: 24, borderRadius: 20, width: '100%', marginVertical: 30, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 20 },
  summaryTitle: { color: '#111827', fontFamily: 'Inter_700Bold', fontSize: 24, marginBottom: 16, textAlign: 'center' },
  summaryRow: { color: '#4B5563', fontFamily: 'Inter_600SemiBold', fontSize: 16, marginBottom: 10 },
});
