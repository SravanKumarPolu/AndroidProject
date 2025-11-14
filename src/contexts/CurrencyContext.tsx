import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Currency, CURRENCIES, DEFAULT_CURRENCY } from '@/constants/currencies';

type CurrencyCode = keyof typeof CURRENCIES;

interface CurrencyContextType {
  currency: Currency;
  currencyCode: CurrencyCode;
  setCurrency: (code: CurrencyCode) => Promise<void>;
  formatCurrency: (amount: number) => string;
  formatCurrencyCompact: (amount: number) => string;
  parseCurrency: (value: string) => number | null;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);
const CURRENCY_STORAGE_KEY = '@impulsevault:currency';

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currencyCode, setCurrencyCodeState] = useState<CurrencyCode>(DEFAULT_CURRENCY);

  useEffect(() => {
    const loadCurrency = async () => {
      try {
        const stored = await AsyncStorage.getItem(CURRENCY_STORAGE_KEY);
        if (stored && CURRENCIES[stored as CurrencyCode]) {
          setCurrencyCodeState(stored as CurrencyCode);
        }
      } catch (error) {
        console.error('Failed to load currency from storage', error);
      }
    };
    loadCurrency();
  }, []);

  const setCurrency = useCallback(async (code: CurrencyCode) => {
    setCurrencyCodeState(code);
    try {
      await AsyncStorage.setItem(CURRENCY_STORAGE_KEY, code);
    } catch (error) {
      console.error('Failed to save currency to storage', error);
    }
  }, []);

  const currency = CURRENCIES[currencyCode];

  const formatCurrency = useCallback(
    (amount: number): string => {
      const formatted = amount.toLocaleString(currency.locale, {
        minimumFractionDigits: currency.decimalPlaces,
        maximumFractionDigits: currency.decimalPlaces,
      });

      if (currency.symbolPosition === 'before') {
        return `${currency.symbol}${formatted}`;
      }
      return `${formatted} ${currency.symbol}`;
    },
    [currency]
  );

  const formatCurrencyCompact = useCallback(
    (amount: number): string => {
      if (amount >= 1000000) {
        const millions = amount / 1000000;
        const formatted = millions.toFixed(1);
        return currency.symbolPosition === 'before'
          ? `${currency.symbol}${formatted}M`
          : `${formatted}M ${currency.symbol}`;
      }
      if (amount >= 1000) {
        const thousands = amount / 1000;
        const formatted = thousands.toFixed(1);
        return currency.symbolPosition === 'before'
          ? `${currency.symbol}${formatted}K`
          : `${formatted}K ${currency.symbol}`;
      }
      return formatCurrency(amount);
    },
    [currency, formatCurrency]
  );

  const parseCurrency = useCallback(
    (value: string): number | null => {
      // Remove currency symbols and spaces
      const cleaned = value
        .replace(new RegExp(`[${currency.symbol.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')},\\s]`, 'g'), '')
        .replace(currency.decimalSeparator, '.');
      const parsed = parseFloat(cleaned);
      return isNaN(parsed) ? null : parsed;
    },
    [currency]
  );

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        currencyCode,
        setCurrency,
        formatCurrency,
        formatCurrencyCompact,
        parseCurrency,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}



