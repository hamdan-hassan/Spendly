/**
 * Spendly — AI Personality Engine
 * 
 * Generates highly contextual roasts and hype messages using combinatorial logic
 * to create thousands of unique offline interactions.
 */

import type { Transaction } from '@/types/transaction';
import { formatCurrency } from '@/utils/formatCurrency';

// ============================================================================
// EXPENSE ROASTS (Mean & Snarky)
// ============================================================================

const expenseHooks = [
  "Oh look, another {amount} gone.",
  "Wow, you actually spent {amount} on {category}?",
  "I see {amount} just vanished.",
  "Swiping that card for {amount} again, huh?",
  "Did you really need to drop {amount} on {category}?",
  "Ah yes, the essential {amount} purchase.",
  "Another day, another {amount} down the drain.",
  "I felt a disturbance in your wallet... {amount} just left.",
];

const expenseMiddle = [
  "Your savings account is literally crying right now.",
  "I guess we're never retiring.",
  "Your future self hates you for this.",
  "Are you allergic to saving money?",
  "Do you think money grows on trees?",
  "At this rate, you'll be living in a cardboard box by 2030.",
  "I hope that {category} was worth it.",
  "Warren Buffett just shed a single tear.",
];

const expensePunchlines = [
  "Maybe try cooking for once?",
  "Put the credit card down and walk away.",
  "Just delete the app at this point.",
  "I'm judging you. Hard.",
  "Please, for the love of compounding interest, stop.",
  "Good luck explaining that to your budget.",
  "Try not to look at your bank balance.",
];

// ============================================================================
// LATE NIGHT EXPENSES (Special Context)
// ============================================================================

const lateNightRoasts = [
  "Nothing good ever happens after 10 PM. Case in point: spending {amount} on {category}.",
  "Late night impulse buying? Really? {amount} down the drain.",
  "Go to sleep. Your wallet can't handle you being awake right now.",
  "Midnight snacking on your budget? Put the phone away."
];

// ============================================================================
// INCOME HYPE (Positive & Supportive)
// ============================================================================

const incomeHooks = [
  "Look who just got paid {amount}!",
  "A massive {amount} just dropped in.",
  "Cha-ching! {amount} incoming.",
  "Your net worth just went up by {amount}.",
  "Alert! We have {amount} of fresh capital.",
];

const incomeMiddle = [
  "Your wallet is looking thicker than a dictionary.",
  "You're basically the next Elon Musk.",
  "We are so back.",
  "Your savings account is doing a happy dance.",
  "The economy is healing.",
];

const incomePunchlines = [
  "Don't spend it all in one place.",
  "Now act like you're still broke and save it.",
  "Keep this energy going!",
  "Absolute legend.",
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getRandomElement(arr: string[]): string {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function generateTransactionRoast(transaction: Transaction, currencySymbol: string = '$'): string {
  const formattedAmount = formatCurrency(transaction.amount, currencySymbol);
  const categoryName = transaction.categoryId === 'unknown' ? 'something random' : transaction.categoryId;

  let template = "";

  // Check context
  const hour = new Date(transaction.date).getHours();
  const isLateNight = hour >= 22 || hour <= 4;

  if (transaction.type === 'expense') {
    if (isLateNight && Math.random() > 0.5) {
      template = getRandomElement(lateNightRoasts);
    } else {
      template = `${getRandomElement(expenseHooks)} ${getRandomElement(expenseMiddle)} ${getRandomElement(expensePunchlines)}`;
    }
  } else {
    // Income
    template = `${getRandomElement(incomeHooks)} ${getRandomElement(incomeMiddle)} ${getRandomElement(incomePunchlines)}`;
  }

  // Replace tokens
  return template
    .replace(/{amount}/g, formattedAmount)
    .replace(/{category}/g, categoryName.toLowerCase());
}

// ============================================================================
// DASHBOARD GREETINGS
// ============================================================================

const dashboardBroke = [
  "Welcome back. Try not to spend anything today.",
  "You're looking a little broke today. Let's fix that.",
  "Your budget is screaming. Be careful.",
];

const dashboardRich = [
  "Look at all that money. Keep stacking it.",
  "You're doing great. Stay focused.",
  "Your finances are looking solid today.",
];

export function generateDashboardGreeting(balance: number, budgetPercentage: number): string {
  if (budgetPercentage > 0.9 || balance < 100) {
    return getRandomElement(dashboardBroke);
  } else if (balance > 1000 && budgetPercentage < 0.5) {
    return getRandomElement(dashboardRich);
  }
  return "You're doing great! Keep logging your daily expenses to build your streak.";
}
