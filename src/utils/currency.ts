/**
 * Currency formatting utilities
 * Legacy functions - use useCurrency hook from CurrencyContext instead
 * These are kept for backward compatibility
 */

export const formatCurrency = (amount: number): string => {
  return `₹${amount.toLocaleString('en-IN')}`;
};

export const formatCurrencyCompact = (amount: number): string => {
  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(1)}L`;
  }
  if (amount >= 1000) {
    return `₹${(amount / 1000).toFixed(1)}K`;
  }
  return formatCurrency(amount);
};

export const parseCurrency = (value: string): number | null => {
  // Remove currency symbols and spaces
  const cleaned = value.replace(/[₹,\s]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? null : parsed;
};

