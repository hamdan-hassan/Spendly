/**
 * Spendly Design System — Color Tokens
 *
 * Premium fintech palette inspired by Revolut, Monzo, and Linear.
 * All colors use HSL-derived hex values for harmonic consistency.
 */

export const palette = {
  // Indigo / Brand
  indigo50: '#EEF2FF',
  indigo100: '#E0E7FF',
  indigo200: '#C7D2FE',
  indigo300: '#A5B4FC',
  indigo400: '#818CF8',
  indigo500: '#6366F1',
  indigo600: '#4F46E5',
  indigo700: '#4338CA',
  indigo800: '#3730A3',
  indigo900: '#312E81',

  // Emerald / Income & Success
  emerald50: '#ECFDF5',
  emerald100: '#D1FAE5',
  emerald200: '#A7F3D0',
  emerald300: '#6EE7B7',
  emerald400: '#34D399',
  emerald500: '#10B981',
  emerald600: '#059669',
  emerald700: '#047857',
  emerald800: '#065F46',
  emerald900: '#064E3B',

  // Rose / Expense & Error
  rose50: '#FFF1F2',
  rose100: '#FFE4E6',
  rose200: '#FECDD3',
  rose300: '#FDA4AF',
  rose400: '#FB7185',
  rose500: '#F43F5E',
  rose600: '#E11D48',
  rose700: '#BE123C',
  rose800: '#9F1239',
  rose900: '#881337',

  // Amber / Warning
  amber50: '#FFFBEB',
  amber100: '#FEF3C7',
  amber200: '#FDE68A',
  amber300: '#FCD34D',
  amber400: '#FBBF24',
  amber500: '#F59E0B',
  amber600: '#D97706',
  amber700: '#B45309',
  amber800: '#92400E',
  amber900: '#78350F',

  // Blue / Info
  blue50: '#EFF6FF',
  blue100: '#DBEAFE',
  blue200: '#BFDBFE',
  blue300: '#93C5FD',
  blue400: '#60A5FA',
  blue500: '#3B82F6',
  blue600: '#2563EB',
  blue700: '#1D4ED8',
  blue800: '#1E40AF',
  blue900: '#1E3A8A',

  // Violet
  violet50: '#F5F3FF',
  violet400: '#A78BFA',
  violet500: '#8B5CF6',
  violet600: '#7C3AED',

  // Cyan
  cyan400: '#22D3EE',
  cyan500: '#06B6D4',

  // Gray / Neutral
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray600: '#4B5563',
  gray700: '#374151',
  gray800: '#1F2937',
  gray900: '#111827',
  gray950: '#0A0E1A',

  // Pure
  white: '#FFFFFF',
  black: '#000000',
} as const;

/** Category colors — curated for visual harmony */
export const categoryColors = {
  food: '#F97316',       // Orange
  transport: '#3B82F6',  // Blue
  shopping: '#EC4899',   // Pink
  entertainment: '#8B5CF6', // Violet
  bills: '#EF4444',      // Red
  health: '#10B981',     // Emerald
  education: '#06B6D4',  // Cyan
  rent: '#F59E0B',       // Amber
  travel: '#14B8A6',     // Teal
  groceries: '#84CC16',  // Lime
  subscriptions: '#6366F1', // Indigo
  fitness: '#F43F5E',    // Rose
  gifts: '#D946EF',      // Fuchsia
  savings: '#22D3EE',    // Cyan
  other: '#6B7280',      // Gray
} as const;

/** Gradient presets for cards and backgrounds */
export const gradients = {
  brand: ['#6366F1', '#8B5CF6'] as const,
  income: ['#10B981', '#34D399'] as const,
  expense: ['#F43F5E', '#FB7185'] as const,
  premium: ['#6366F1', '#EC4899'] as const,
  ocean: ['#3B82F6', '#06B6D4'] as const,
  sunset: ['#F97316', '#F43F5E'] as const,
  aurora: ['#6366F1', '#22D3EE'] as const,
  card: ['#1F2937', '#111827'] as const,
} as const;

export interface ThemeColors {
  bg: {
    primary: string;
    secondary: string;
    tertiary: string;
    elevated: string;
    inverse: string;
  };
  accent: {
    primary: string;
    primaryMuted: string;
    secondary: string;
  };
  semantic: {
    income: string;
    incomeMuted: string;
    expense: string;
    expenseMuted: string;
    warning: string;
    warningMuted: string;
    info: string;
    infoMuted: string;
    success: string;
    successMuted: string;
  };
  text: {
    primary: string;
    secondary: string;
    tertiary: string;
    inverse: string;
    onAccent: string;
  };
  border: {
    default: string;
    muted: string;
    accent: string;
  };
  overlay: string;
  skeleton: string;
  tabBar: string;
  card: string;
  inputBg: string;
}

export const darkColors: ThemeColors = {
  bg: {
    primary: palette.gray950,
    secondary: palette.gray900,
    tertiary: palette.gray800,
    elevated: '#161B2E',
    inverse: palette.white,
  },
  accent: {
    primary: palette.indigo500,
    primaryMuted: 'rgba(99, 102, 241, 0.15)',
    secondary: palette.indigo400,
  },
  semantic: {
    income: palette.emerald500,
    incomeMuted: 'rgba(16, 185, 129, 0.15)',
    expense: palette.rose500,
    expenseMuted: 'rgba(244, 63, 94, 0.15)',
    warning: palette.amber500,
    warningMuted: 'rgba(245, 158, 11, 0.15)',
    info: palette.blue500,
    infoMuted: 'rgba(59, 130, 246, 0.15)',
    success: palette.emerald500,
    successMuted: 'rgba(16, 185, 129, 0.15)',
  },
  text: {
    primary: palette.gray50,
    secondary: palette.gray400,
    tertiary: palette.gray500,
    inverse: palette.gray950,
    onAccent: palette.white,
  },
  border: {
    default: 'rgba(255, 255, 255, 0.08)',
    muted: 'rgba(255, 255, 255, 0.04)',
    accent: 'rgba(99, 102, 241, 0.3)',
  },
  overlay: 'rgba(0, 0, 0, 0.6)',
  skeleton: 'rgba(255, 255, 255, 0.06)',
  tabBar: 'rgba(10, 14, 26, 0.95)',
  card: palette.gray900,
  inputBg: palette.gray800,
};

export const lightColors: ThemeColors = {
  bg: {
    primary: '#F8FAFC',
    secondary: palette.white,
    tertiary: palette.gray100,
    elevated: palette.white,
    inverse: palette.gray950,
  },
  accent: {
    primary: palette.indigo600,
    primaryMuted: 'rgba(79, 70, 229, 0.08)',
    secondary: palette.indigo500,
  },
  semantic: {
    income: palette.emerald600,
    incomeMuted: 'rgba(5, 150, 105, 0.08)',
    expense: palette.rose600,
    expenseMuted: 'rgba(225, 29, 72, 0.08)',
    warning: palette.amber600,
    warningMuted: 'rgba(217, 119, 6, 0.08)',
    info: palette.blue600,
    infoMuted: 'rgba(37, 99, 235, 0.08)',
    success: palette.emerald600,
    successMuted: 'rgba(5, 150, 105, 0.08)',
  },
  text: {
    primary: palette.gray900,
    secondary: palette.gray600,
    tertiary: palette.gray400,
    inverse: palette.white,
    onAccent: palette.white,
  },
  border: {
    default: 'rgba(0, 0, 0, 0.08)',
    muted: 'rgba(0, 0, 0, 0.04)',
    accent: 'rgba(79, 70, 229, 0.2)',
  },
  overlay: 'rgba(0, 0, 0, 0.4)',
  skeleton: 'rgba(0, 0, 0, 0.06)',
  tabBar: 'rgba(255, 255, 255, 0.95)',
  card: palette.white,
  inputBg: palette.gray100,
};
