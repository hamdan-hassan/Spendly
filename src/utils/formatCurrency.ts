/**
 * Spendly — Currency Formatting
 *
 * Formats monetary values with proper locale support.
 */

/**
 * Format a number as currency.
 * @param amount The numeric amount
 * @param symbol The currency symbol (e.g. '$', '₦', '₵')
 * @param compact Whether to use compact notation for large numbers
 */
export function formatCurrency(
  amount: number,
  symbol: string = '$',
  compact: boolean = false,
): string {
  const absAmount = Math.abs(amount);
  const isNegative = amount < 0;
  const prefix = isNegative ? '-' : '';

  if (compact && absAmount >= 1_000_000_000) {
    const val = absAmount / 1_000_000_000;
    return `${prefix}${symbol}${val % 1 === 0 ? val.toFixed(0) : val.toFixed(1)}B`;
  }
  if (compact && absAmount >= 1_000_000) {
    const val = absAmount / 1_000_000;
    return `${prefix}${symbol}${val % 1 === 0 ? val.toFixed(0) : val.toFixed(1)}M`;
  }
  if (compact && absAmount >= 1_000) {
    const val = absAmount / 1_000;
    return `${prefix}${symbol}${val % 1 === 0 ? val.toFixed(0) : val.toFixed(1)}K`;
  }

  const formatted = absAmount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return `${prefix}${symbol}${formatted}`;
}

/**
 * Format an amount with sign indicator.
 * Positive amounts get '+', negative get '-'.
 */
export function formatSignedCurrency(
  amount: number,
  symbol: string = '$',
): string {
  const sign = amount >= 0 ? '+' : '';
  return `${sign}${formatCurrency(amount, symbol)}`;
}

/**
 * Parse a currency string back to a number.
 */
export function parseCurrencyInput(value: string): number {
  const cleaned = value.replace(/[^0-9.]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}
