/**
 * Spendly — AdMob Service
 *
 * Wraps react-native-google-mobile-ads for Banner, Interstitial, and Rewarded ads.
 * Uses official Google Test Ad Unit IDs.
 */

import { Platform } from 'react-native';
import mobileAds, { TestIds } from 'react-native-google-mobile-ads';

// Initialize the AdMob SDK
export async function initializeAds() {
  try {
    const status = await mobileAds().initialize();
    console.log('AdMob Initialized:', status);
  } catch (error) {
    console.error('AdMob Initialization failed:', error);
  }
}

// Test IDs are safe to use during development to prevent account bans.
// In a real production release, these would be replaced with your actual ad unit IDs.

export const BANNER_AD_UNIT_ID = __DEV__
  ? TestIds.BANNER
  : Platform.OS === 'ios' ? 'ca-app-pub-xxxxxxxxxxxx/yyyyyyy' : 'ca-app-pub-4478899815710413/7424873068';

export const INTERSTITIAL_AD_UNIT_ID = __DEV__
  ? TestIds.INTERSTITIAL
  : Platform.OS === 'ios' ? 'ca-app-pub-xxxxxxxxxxxx/yyyyyyy' : 'ca-app-pub-4478899815710413/3407516676';

export const REWARDED_AD_UNIT_ID = __DEV__
  ? TestIds.REWARDED
  : Platform.OS === 'ios' ? 'ca-app-pub-xxxxxxxxxxxx/yyyyyyy' : 'ca-app-pub-4478899815710413/3238216048';
