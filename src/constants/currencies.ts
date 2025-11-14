/**
 * Multi-Currency Support
 * Comprehensive currency definitions with symbols and formatting
 */

export interface Currency {
  code: string;
  name: string;
  symbol: string;
  symbolPosition: 'before' | 'after';
  decimalPlaces: number;
  thousandsSeparator: string;
  decimalSeparator: string;
  locale: string;
}

export const CURRENCIES: Record<string, Currency> = {
  INR: {
    code: 'INR',
    name: 'Indian Rupee',
    symbol: '₹',
    symbolPosition: 'before',
    decimalPlaces: 0,
    thousandsSeparator: ',',
    decimalSeparator: '.',
    locale: 'en-IN',
  },
  USD: {
    code: 'USD',
    name: 'US Dollar',
    symbol: '$',
    symbolPosition: 'before',
    decimalPlaces: 2,
    thousandsSeparator: ',',
    decimalSeparator: '.',
    locale: 'en-US',
  },
  EUR: {
    code: 'EUR',
    name: 'Euro',
    symbol: '€',
    symbolPosition: 'before',
    decimalPlaces: 2,
    thousandsSeparator: '.',
    decimalSeparator: ',',
    locale: 'de-DE',
  },
  GBP: {
    code: 'GBP',
    name: 'British Pound',
    symbol: '£',
    symbolPosition: 'before',
    decimalPlaces: 2,
    thousandsSeparator: ',',
    decimalSeparator: '.',
    locale: 'en-GB',
  },
  JPY: {
    code: 'JPY',
    name: 'Japanese Yen',
    symbol: '¥',
    symbolPosition: 'before',
    decimalPlaces: 0,
    thousandsSeparator: ',',
    decimalSeparator: '.',
    locale: 'ja-JP',
  },
  AUD: {
    code: 'AUD',
    name: 'Australian Dollar',
    symbol: '$',
    symbolPosition: 'before',
    decimalPlaces: 2,
    thousandsSeparator: ',',
    decimalSeparator: '.',
    locale: 'en-AU',
  },
  CAD: {
    code: 'CAD',
    name: 'Canadian Dollar',
    symbol: '$',
    symbolPosition: 'before',
    decimalPlaces: 2,
    thousandsSeparator: ',',
    decimalSeparator: '.',
    locale: 'en-CA',
  },
  SGD: {
    code: 'SGD',
    name: 'Singapore Dollar',
    symbol: 'S$',
    symbolPosition: 'before',
    decimalPlaces: 2,
    thousandsSeparator: ',',
    decimalSeparator: '.',
    locale: 'en-SG',
  },
  AED: {
    code: 'AED',
    name: 'UAE Dirham',
    symbol: 'د.إ',
    symbolPosition: 'before',
    decimalPlaces: 2,
    thousandsSeparator: ',',
    decimalSeparator: '.',
    locale: 'ar-AE',
  },
  SAR: {
    code: 'SAR',
    name: 'Saudi Riyal',
    symbol: '﷼',
    symbolPosition: 'before',
    decimalPlaces: 2,
    thousandsSeparator: ',',
    decimalSeparator: '.',
    locale: 'ar-SA',
  },
};

export const DEFAULT_CURRENCY = 'INR';

export const CURRENCY_LIST = Object.values(CURRENCIES);



