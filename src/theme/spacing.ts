/**
 * Spendly Design System — Spacing
 *
 * 4px base unit spacing scale for consistent rhythm.
 */

export const spacing = {
  /** 2px */
  xxs: 2,
  /** 4px */
  xs: 4,
  /** 6px */
  sm: 6,
  /** 8px */
  s: 8,
  /** 12px */
  m: 12,
  /** 16px */
  md: 16,
  /** 20px */
  lg: 20,
  /** 24px */
  xl: 24,
  /** 32px */
  xxl: 32,
  /** 40px */
  xxxl: 40,
  /** 48px */
  huge: 48,
  /** 64px */
  massive: 64,
} as const;

/** Screen horizontal padding */
export const screenPadding = spacing.lg;

/** Section vertical gap */
export const sectionGap = spacing.xl;

/** Card internal padding */
export const cardPadding = spacing.md;

/** List item vertical spacing */
export const listItemGap = spacing.s;
