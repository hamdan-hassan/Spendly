/**
 * Spendly Design System — Typography
 *
 * Uses Inter font family for a modern, clean fintech look.
 * Complete type scale with semantic naming.
 */

export const fontFamily = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semiBold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
  extraBold: 'Inter_800ExtraBold',
} as const;

export const fontSize = {
  xs: 11,
  sm: 12,
  caption: 13,
  body2: 14,
  body: 16,
  subtitle: 17,
  title3: 18,
  title2: 20,
  title: 22,
  headline: 24,
  display3: 28,
  display2: 32,
  display: 40,
  hero: 48,
} as const;

export const lineHeight = {
  xs: 14,
  sm: 16,
  caption: 18,
  body2: 20,
  body: 24,
  subtitle: 24,
  title3: 26,
  title2: 28,
  title: 30,
  headline: 32,
  display3: 36,
  display2: 40,
  display: 48,
  hero: 56,
} as const;

export interface TextStyle {
  fontFamily: string;
  fontSize: number;
  lineHeight: number;
  letterSpacing?: number;
}

export const textStyles = {
  /** 48px — Large hero numbers */
  hero: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.hero,
    lineHeight: lineHeight.hero,
    letterSpacing: -1.5,
  },
  /** 40px — Primary balance display */
  display: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.display,
    lineHeight: lineHeight.display,
    letterSpacing: -1.2,
  },
  /** 32px — Large amounts */
  display2: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.display2,
    lineHeight: lineHeight.display2,
    letterSpacing: -0.8,
  },
  /** 28px — Section display */
  display3: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.display3,
    lineHeight: lineHeight.display3,
    letterSpacing: -0.5,
  },
  /** 24px — Section headers */
  headline: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.headline,
    lineHeight: lineHeight.headline,
    letterSpacing: -0.3,
  },
  /** 22px — Screen titles */
  title: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.title,
    lineHeight: lineHeight.title,
    letterSpacing: -0.2,
  },
  /** 20px — Card titles */
  title2: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.title2,
    lineHeight: lineHeight.title2,
    letterSpacing: -0.1,
  },
  /** 18px — Sub-titles */
  title3: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.title3,
    lineHeight: lineHeight.title3,
  },
  /** 17px — Prominent body */
  subtitle: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.subtitle,
    lineHeight: lineHeight.subtitle,
  },
  /** 16px — Default body text */
  body: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.body,
    lineHeight: lineHeight.body,
  },
  /** 16px — Emphasized body */
  bodyBold: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.body,
    lineHeight: lineHeight.body,
  },
  /** 14px — Secondary body */
  body2: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.body2,
    lineHeight: lineHeight.body2,
  },
  /** 14px — Emphasized secondary body */
  body2Bold: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.body2,
    lineHeight: lineHeight.body2,
  },
  /** 13px — Captions, timestamps */
  caption: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.caption,
    lineHeight: lineHeight.caption,
  },
  /** 13px — Emphasized captions */
  captionBold: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.caption,
    lineHeight: lineHeight.caption,
  },
  /** 12px — Small labels */
  small: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.sm,
    lineHeight: lineHeight.sm,
  },
  /** 11px — Overlines, badges */
  overline: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.xs,
    lineHeight: lineHeight.xs,
    letterSpacing: 0.8,
  },
} as const;
