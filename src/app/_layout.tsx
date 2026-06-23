/**
 * Spendly — Root Layout
 *
 * Loads fonts, applies theme provider, handles splash screen.
 */

import { useSettingsStore } from '@/store/useSettingsStore';
import { useAccountStore } from '@/store/useAccountStore';
import { useTransactionStore } from '@/store/useTransactionStore';
import { useBudgetStore } from '@/store/useBudgetStore';
import { useSavingsStore } from '@/store/useSavingsStore';
import { ThemeProvider, useThemeContext } from '@/theme';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold,
  useFonts,
} from '@expo-google-fonts/inter';
import { Ionicons } from '@expo/vector-icons';
import * as LocalAuthentication from 'expo-local-authentication';
import { router, Stack, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { initializeAds } from '@/services/ads';

// @ts-ignore — Expo CSS modules
import '../global.css';

SplashScreen.preventAutoHideAsync();
initializeAds();

function BiometricLock({ onUnlock }: { onUnlock: () => void }) {
  const theme = useThemeContext();

  const handleAuth = async () => {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    
    if (!hasHardware || !isEnrolled) {
      onUnlock();
      return;
    }

    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Unlock Spendly',
      fallbackLabel: 'Use Passcode',
    });

    if (result.success) {
      onUnlock();
    }
  };

  useEffect(() => {
    handleAuth();
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.bg.primary, alignItems: 'center', justifyContent: 'center' }}>
      <Ionicons name="lock-closed-outline" size={64} color={theme.colors.accent.primary} />
      <Text style={{ marginTop: 24, fontSize: 20, color: theme.colors.text.primary, fontFamily: 'Inter_600SemiBold' }}>
        Spendly is Locked
      </Text>
      <Pressable
        onPress={handleAuth}
        style={{ marginTop: 40, backgroundColor: theme.colors.accent.primary, paddingHorizontal: 32, paddingVertical: 16, borderRadius: 32 }}
      >
        <Text style={{ color: '#fff', fontSize: 16, fontFamily: 'Inter_600SemiBold' }}>Unlock</Text>
      </Pressable>
    </View>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
  });

  const themeMode = useSettingsStore((s) => s.theme);
  const hasCompletedOnboarding = useSettingsStore((s) => s.hasCompletedOnboarding);
  const requireBiometrics = useSettingsStore((s) => s.requireBiometrics);
  const segments = useSegments();
  
  const [isUnlocked, setIsUnlocked] = React.useState(!requireBiometrics);

  useEffect(() => {
    if (!requireBiometrics) {
      setIsUnlocked(true);
    }
  }, [requireBiometrics]);

  useEffect(() => {
    if (!fontsLoaded) return;

    // Run migration / init main wallet
    const { currencyCode, currencySymbol } = useSettingsStore.getState();
    const mainWalletId = useAccountStore.getState()._initializeMainWallet(currencyCode, currencySymbol);
    useTransactionStore.getState()._assignToMainWallet(mainWalletId);
    useBudgetStore.getState()._assignToMainWallet(mainWalletId);
    useSavingsStore.getState()._assignToMainWallet(mainWalletId);

    const inOnboardingGroup = segments[0] === 'onboarding';

    if (!hasCompletedOnboarding && !inOnboardingGroup) {
      router.replace('/onboarding');
    } else if (hasCompletedOnboarding && inOnboardingGroup) {
      router.replace('/(tabs)');
    }

    setTimeout(() => {
      SplashScreen.hideAsync();
    }, 10);
  }, [fontsLoaded, hasCompletedOnboarding, segments]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <ThemeProvider themeMode={themeMode}>
        <StatusBar style={themeMode === 'light' ? 'dark' : 'light'} />
        {requireBiometrics && !isUnlocked ? (
          <BiometricLock onUnlock={() => setIsUnlocked(true)} />
        ) : (
        <Stack
          screenOptions={{
            headerShown: false,
            animation: 'slide_from_right',
            contentStyle: { backgroundColor: 'transparent' },
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="transaction/add"
            options={{
              presentation: 'modal',
              animation: 'slide_from_bottom',
            }}
          />
          <Stack.Screen
            name="budget/create"
            options={{
              presentation: 'modal',
              animation: 'slide_from_bottom',
            }}
          />
          <Stack.Screen
            name="savings/create"
            options={{
              presentation: 'modal',
              animation: 'slide_from_bottom',
            }}
          />
          <Stack.Screen
            name="onboarding"
            options={{ animation: 'fade' }}
          />
        </Stack>
        )}
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
