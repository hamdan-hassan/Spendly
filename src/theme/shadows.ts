/**
 * Spendly Design System — Shadows
 *
 * Soft elevation shadows for cards and elevated surfaces.
 * React Native shadow properties (iOS + Android elevation).
 */

import { Platform, ViewStyle } from 'react-native';

export interface ShadowPreset {
  shadowColor: string;
  shadowOffset: { width: number; height: number };
  shadowOpacity: number;
  shadowRadius: number;
  elevation: number;
}

const createShadow = (
  offsetY: number,
  radius: number,
  opacity: number,
  elevation: number,
  color = '#000000',
): ShadowPreset => ({
  shadowColor: color,
  shadowOffset: { width: 0, height: offsetY },
  shadowOpacity: Platform.OS === 'ios' ? opacity : 0,
  shadowRadius: radius,
  elevation: Platform.OS === 'android' ? elevation : 0,
});

export const shadows = {
  /** No shadow */
  none: createShadow(0, 0, 0, 0),

  /** Subtle shadow for flat cards */
  xs: createShadow(1, 2, 0.05, 1),

  /** Light shadow for cards */
  sm: createShadow(2, 4, 0.06, 2),

  /** Medium shadow for elevated cards */
  md: createShadow(4, 8, 0.08, 4),

  /** Large shadow for modals, FABs */
  lg: createShadow(8, 16, 0.1, 8),

  /** Extra large shadow for floating elements */
  xl: createShadow(12, 24, 0.12, 12),

  /** Colored shadow for accent elements */
  accent: createShadow(4, 12, 0.3, 6, '#6366F1'),

  /** Income green glow */
  income: createShadow(4, 12, 0.2, 4, '#10B981'),

  /** Expense red glow */
  expense: createShadow(4, 12, 0.2, 4, '#F43F5E'),
} as const;

/** Helper to apply shadow as ViewStyle */
export const applyShadow = (preset: ShadowPreset): ViewStyle => ({
  ...preset,
});
