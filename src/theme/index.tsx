/**
 * Spendly Design System — Theme Provider
 *
 * Provides theme context with light/dark mode switching.
 * Exports the useThemeContext() hook for consuming theme values.
 */

import React, { createContext, useContext, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { darkColors, lightColors, type ThemeColors } from './colors';
import { premiumThemes } from './premiumThemes';
import { textStyles, fontFamily, fontSize, lineHeight } from './typography';
import { spacing, screenPadding, sectionGap, cardPadding, listItemGap } from './spacing';
import { shadows, applyShadow } from './shadows';
import { borderRadius } from './borderRadius';

export type ThemeMode = 'light' | 'dark' | 'system' | (string & {});

export interface Theme {
  mode: ThemeMode;
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

  const resolvedMode = useMemo(() => {
    if (themeMode === 'system') {
      return systemColorScheme === 'dark' ? 'dark' : 'light';
    }
    return themeMode;
  }, [themeMode, systemColorScheme]);

  const theme: Theme = useMemo(
    () => {
      let resolvedColors = lightColors;
      let isDarkTheme = false;

      if (resolvedMode === 'dark') {
        resolvedColors = darkColors;
        isDarkTheme = true;
      } else {
        const premiumMatch = premiumThemes.find(t => t.id === resolvedMode);
        if (premiumMatch) {
          isDarkTheme = premiumMatch.isDark;
          const base = isDarkTheme ? darkColors : lightColors;
          const pColors = premiumMatch.colors as any;
          
          resolvedColors = {
            ...base,
            bg: { ...base.bg, ...pColors.bg },
            text: { ...base.text, ...pColors.text },
            border: { ...base.border, ...pColors.border },
            accent: { 
              ...base.accent, 
              primary: pColors.accent?.primary || base.accent.primary,
              secondary: pColors.accent?.secondary || base.accent.secondary,
            },
            semantic: {
              ...base.semantic,
              income: pColors.accent?.success || base.semantic.income,
              expense: pColors.accent?.danger || base.semantic.expense,
              warning: pColors.accent?.warning || base.semantic.warning,
            }
          };
        }
      }

      return {
        mode: resolvedMode,
        colors: resolvedColors,
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
      isDark: isDarkTheme,
      };
    },
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

export { darkColors, lightColors, type ThemeColors } from './colors';
export { premiumThemes, type PremiumThemeDef } from './premiumThemes';
export { palette, categoryColors, gradients } from './colors';
export { textStyles, fontFamily, fontSize, lineHeight } from './typography';
export { spacing, screenPadding, sectionGap, cardPadding, listItemGap } from './spacing';
export { shadows, applyShadow } from './shadows';
export { borderRadius } from './borderRadius';
