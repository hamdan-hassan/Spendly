/**
 * Spendly — Date Formatting
 *
 * Human-friendly date formatting with relative dates.
 */

import {
  format,
  isToday,
  isYesterday,
  isThisWeek,
  isThisMonth,
  isThisYear,
  differenceInDays,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  parseISO,
  isSameDay,
} from 'date-fns';

/**
 * Format a date string for transaction display.
 * Shows relative dates for recent items.
 */
export function formatRelativeDate(dateStr: string): string {
  const date = parseISO(dateStr);

  if (isToday(date)) return 'Today';
  if (isYesterday(date)) return 'Yesterday';
  if (isThisWeek(date, { weekStartsOn: 1 })) return format(date, 'EEEE');
  if (isThisYear(date)) return format(date, 'MMM d');
  return format(date, 'MMM d, yyyy');
}

/**
 * Format a date for section headers in transaction lists.
 */
export function formatSectionDate(dateStr: string): string {
  const date = parseISO(dateStr);

  if (isToday(date)) return 'Today';
  if (isYesterday(date)) return 'Yesterday';
  if (isThisWeek(date, { weekStartsOn: 1 })) return format(date, 'EEEE');
  if (isThisMonth(date)) return 'Earlier This Month';
  if (isThisYear(date)) return format(date, 'MMMM');
  return format(date, 'MMMM yyyy');
}

/**
 * Format a date for display in forms and details.
 */
export function formatFullDate(dateStr: string): string {
  return format(parseISO(dateStr), 'MMMM d, yyyy');
}

/**
 * Format a date for short display.
 */
export function formatShortDate(dateStr: string): string {
  return format(parseISO(dateStr), 'MMM d');
}

/**
 * Get current month in YYYY-MM format.
 */
export function getCurrentMonth(): string {
  return format(new Date(), 'yyyy-MM');
}

/**
 * Get month label from YYYY-MM format.
 */
export function getMonthLabel(month: string): string {
  const [year, m] = month.split('-');
  const date = new Date(parseInt(year), parseInt(m) - 1, 1);
  return format(date, 'MMMM yyyy');
}

/**
 * Get previous month in YYYY-MM format.
 */
export function getPreviousMonth(month: string): string {
  const [year, m] = month.split('-');
  const date = new Date(parseInt(year), parseInt(m) - 2, 1);
  return format(date, 'yyyy-MM');
}

/**
 * Get days remaining until a date.
 */
export function getDaysRemaining(dateStr: string): number {
  return differenceInDays(parseISO(dateStr), new Date());
}

/**
 * Get all days in a given month.
 */
export function getDaysInMonth(month: string): Date[] {
  const [year, m] = month.split('-');
  const start = startOfMonth(new Date(parseInt(year), parseInt(m) - 1, 1));
  const end = endOfMonth(start);
  return eachDayOfInterval({ start, end });
}

/**
 * Check if two date strings represent the same day.
 */
export function isSameDateDay(a: string, b: string): boolean {
  return isSameDay(parseISO(a), parseISO(b));
}

/**
 * Get the start and end of current week.
 */
export function getCurrentWeekRange(): { start: Date; end: Date } {
  const now = new Date();
  return {
    start: startOfWeek(now, { weekStartsOn: 1 }),
    end: endOfWeek(now, { weekStartsOn: 1 }),
  };
}

/**
 * Format a date as ISO string (date only).
 */
export function toDateString(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

/**
 * Format date as ISO datetime string.
 */
export function toISOString(date: Date): string {
  return date.toISOString();
}
