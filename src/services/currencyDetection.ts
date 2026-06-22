/**
 * Spendly — Currency Detection Service
 *
 * Auto-detects user's local currency based on IP geolocation.
 * Falls back to USD if detection fails.
 */

import { countryToCurrency, getCurrencyByCode } from '../constants/currencies';
import type { CurrencyInfo } from '../types/settings';

const FALLBACK_CURRENCY: CurrencyInfo = {
  code: 'USD',
  name: 'US Dollar',
  symbol: '$',
  locale: 'en-US',
  flag: '🇺🇸',
};

import * as Localization from 'expo-localization';

/**
 * Detect user's currency using best practices:
 * 1. Try device native locale settings (offline, instant, 100% reliable)
 * 2. Fallback to HTTPS IP API with a 3-second timeout
 * 3. Fallback to USD
 */
export async function detectUserCurrency(): Promise<CurrencyInfo> {
  // 1. Try Device Native Locale Settings
  try {
    const locales = Localization.getLocales();
    if (locales && locales.length > 0) {
      const region = locales[0].regionCode; // e.g. "US", "GB"
      if (region && countryToCurrency[region]) {
        const currencyCode = countryToCurrency[region];
        const info = getCurrencyByCode(currencyCode);
        if (info) return info;
      }
    }
  } catch (error) {
    console.warn('Failed to get device locale:', error);
  }

  // 2. Fallback to HTTPS IP API (with a strict 3-second timeout)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    // Using ipapi.co (supports HTTPS on free tier)
    const response = await fetch('https://ipapi.co/json/', {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      const countryCode = data.country_code as string; // e.g. "US"

      if (countryCode && countryToCurrency[countryCode]) {
        const currencyCode = countryToCurrency[countryCode];
        const info = getCurrencyByCode(currencyCode);
        if (info) return info;
      }
    }
  } catch (error) {
    console.warn('IP API fallback failed:', error);
  }

  // 3. Absolute Fallback
  return FALLBACK_CURRENCY;
}
