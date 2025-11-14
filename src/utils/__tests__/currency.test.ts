import { formatCurrency } from '../currency';

// @ts-ignore - Jest globals
describe('currency utilities', () => {
  describe('formatCurrency', () => {
    it('should format positive numbers', () => {
      expect(formatCurrency(1000)).toBe('₹1,000');
      expect(formatCurrency(500)).toBe('₹500');
      expect(formatCurrency(1234567)).toBe('₹12,34,567');
    });

    it('should handle zero', () => {
      expect(formatCurrency(0)).toBe('₹0');
    });

    it('should handle decimals', () => {
      expect(formatCurrency(1000.5)).toBe('₹1,000');
    });

    it('should handle undefined', () => {
      expect(formatCurrency(undefined)).toBe('₹0');
    });
  });
});

