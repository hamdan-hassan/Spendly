/**
 * Spendly Types — Account
 */

export interface Account {
  id: string;
  name: string;
  currencyCode: string;   // ISO 4217 (e.g. 'USD', 'GHS')
  currencySymbol: string; // e.g. '$', '₵'
  color: string;
  icon: string;
  createdAt: string;
}
