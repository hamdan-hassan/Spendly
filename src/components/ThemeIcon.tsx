import React from 'react';
import { Image, View, StyleSheet, ColorValue } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeContext } from '@/theme';

// Map specific generic icon names to our local aero assets
const aeroAssets: Record<string, any> = {
  // Tabs
  'home-outline': require('../assets/icons/aero/tab_home.png'),
  'swap-horizontal-outline': require('../assets/icons/aero/tab_transactions.png'),
  'wallet-outline': require('../assets/icons/aero/tab_budgets.png'),
  'bar-chart-outline': require('../assets/icons/aero/tab_analytics.png'),
  'settings-outline': require('../assets/icons/aero/tab_settings.png'),
  
  // Quick Actions
  'add-circle-outline': require('../assets/icons/aero/action_expense.png'),
  'arrow-down-circle-outline': require('../assets/icons/aero/action_income.png'),
  'flag-outline': require('../assets/icons/aero/action_goal.png'),
  
  // Categories (Batch 1)
  'restaurant-outline': require('../assets/icons/aero/cat_food.png'),
  'car-outline': require('../assets/icons/aero/cat_transport.png'),
  'bag-handle-outline': require('../assets/icons/aero/cat_shopping.png'),
  'game-controller-outline': require('../assets/icons/aero/cat_entertainment.png'),

  // Categories (Batch 2)
  'receipt-outline': require('../assets/icons/aero/cat_bills.png'),
  'heart-outline': require('../assets/icons/aero/cat_health.png'),
  'school-outline': require('../assets/icons/aero/cat_education.png'),
  'airplane-outline': require('../assets/icons/aero/cat_travel.png'),
  'cart-outline': require('../assets/icons/aero/cat_groceries.png'),
  'card-outline': require('../assets/icons/aero/cat_subscriptions.png'),
  'barbell-outline': require('../assets/icons/aero/cat_fitness.png'),
  'gift-outline': require('../assets/icons/aero/cat_gifts.png'),
  'ellipsis-horizontal-circle-outline': require('../assets/icons/aero/cat_other.png'),
  
  // Income Categories
  'briefcase-outline': require('../assets/icons/aero/cat_salary.png'),
  'laptop-outline': require('../assets/icons/aero/cat_freelance.png'),
  'storefront-outline': require('../assets/icons/aero/cat_business.png'),
  'trending-up-outline': require('../assets/icons/aero/cat_investments.png'),
};

interface ThemeIconProps {
  name: React.ComponentProps<typeof Ionicons>['name'];
  size?: number;
  color?: string | ColorValue;
  style?: any;
}

export function ThemeIcon({ name, size = 24, color, style }: ThemeIconProps) {
  const theme = useThemeContext();

  // If we are using Frutiger Aero AND we have an image for this icon, use the image
  if (theme.mode === 'frutiger-aero' && aeroAssets[name]) {
    return (
      <Image 
        source={aeroAssets[name]} 
        style={[
          { width: size, height: size },
          style
        ]} 
        resizeMode="contain" 
      />
    );
  }

  // Fallback to standard vector icon
  return <Ionicons name={name} size={size} color={color} style={style} />;
}

const styles = StyleSheet.create({});
