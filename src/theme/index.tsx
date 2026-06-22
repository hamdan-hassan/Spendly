/**
 * Spendly Design System — Theme Provider
 *
 * Provides theme context with light/dark mode switching.
 * Exports the useThemeContext() hook for consuming theme values.
 */

import React, { createContext, useContext, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { darkColors, lightColors, type ThemeColors } from './colors';
import { textStyles, fontFamily, fontSize, lineHeight } from './typography';
import { spacing, screenPadding, sectionGap, cardPadding, listItemGap } from './spacing';
import { shadows, applyShadow } from './shadows';
import { borderRadius } from './borderRadius';

export type ThemeMode = 'light' | 'dark' | 'system';

export interface Theme {
  mode: 'light' | 'dark';
  colors: ThemeColors;
  typography: typeof textStyles;
  fontFamily: typeof fontFamily;
  fontSize: typeof fontSize;
  lineHeight: typeof lineHeight;
  spacing: typeof spacing;
  screenPadding: number;
  sectionGap: number;
  cardPadding: number;
  listItemGap: number;
  shadows: typeof shadows;
  applyShadow: typeof applyShadow;
  borderRadius: typeof borderRadius;
  isDark: boolean;
}

const ThemeContext = createContext<Theme | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
  themeMode: ThemeMode;
}

export function ThemeProvider({ children, themeMode }: ThemeProviderProps) {
  const systemColorScheme = useColorScheme();

  const resolvedMode: 'light' | 'dark' = useMemo(() => {
    if (themeMode === 'system') {
      return systemColorScheme === 'dark' ? 'dark' : 'light';
    }
    return themeMode;
  }, [themeMode, systemColorScheme]);

  const theme: Theme = useMemo(
    () => ({
      mode: resolvedMode,
      colors: resolvedMode === 'dark' ? darkColors : lightColors,
      typography: textStyles,
      fontFamily,
      fontSize,
      lineHeight,
      spacing,
      screenPadding,
      sectionGap,
      cardPadding,
      listItemGap,
      shadows,
      applyShadow,
      borderRadius,
      isDark: resolvedMode === 'dark',
    }),
    [resolvedMode],
  );

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * Hook to access the current theme.
 * Must be used within a ThemeProvider.
 */
export function useThemeContext(): Theme {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useThemeContext must be used within a ThemeProvider');
  }
  return ctx;
}

// Re-export everything for convenience
export { darkColors, lightColors, type ThemeColors } from './colors';
export { palette, categoryColors, gradients } from './colors';
export { textStyles, fontFamily, fontSize, lineHeight } from './typography';
export { spacing, screenPadding, sectionGap, cardPadding, listItemGap } from './spacing';
export { shadows, applyShadow } from './shadows';
export { borderRadius } from './borderRadius';
