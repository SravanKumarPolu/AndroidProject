import { z } from 'zod';
import {
  createImpulseSchema,
  updateImpulseSchema,
  validateCreateImpulse,
  safeValidateCreateImpulse,
  getValidationErrors,
} from '../validation';

describe('validation', () => {
  describe('createImpulseSchema', () => {
    it('should validate valid impulse data', () => {
      const validData = {
        title: 'Test Impulse',
        category: 'FOOD',
        urgency: 'IMPULSE',
        price: 100,
        emotion: 'BORED',
        coolDownPeriod: '24H',
      };

      const result = createImpulseSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject empty title', () => {
      const invalidData = {
        title: '',
        category: 'FOOD',
        urgency: 'IMPULSE',
      };

      const result = createImpulseSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('required');
      }
    });

    it('should reject title that is too long', () => {
      const invalidData = {
        title: 'a'.repeat(201),
        category: 'FOOD',
        urgency: 'IMPULSE',
      };

      const result = createImpulseSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject negative price', () => {
      const invalidData = {
        title: 'Test',
        category: 'FOOD',
        urgency: 'IMPULSE',
        price: -100,
      };

      const result = createImpulseSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should accept optional fields', () => {
      const validData = {
        title: 'Test',
        category: 'FOOD',
        urgency: 'IMPULSE',
      };

      const result = createImpulseSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid category', () => {
      const invalidData = {
        title: 'Test',
        category: 'INVALID',
        urgency: 'IMPULSE',
      };

      const result = createImpulseSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('validateCreateImpulse', () => {
    it('should return validated data', () => {
      const data = {
        title: 'Test',
        category: 'FOOD',
        urgency: 'IMPULSE',
      };

      const result = validateCreateImpulse(data);
      expect(result.title).toBe('Test');
      expect(result.category).toBe('FOOD');
    });

    it('should throw on invalid data', () => {
      const invalidData = {
        title: '',
        category: 'FOOD',
        urgency: 'IMPULSE',
      };

      expect(() => validateCreateImpulse(invalidData)).toThrow();
    });
  });

  describe('safeValidateCreateImpulse', () => {
    it('should return success for valid data', () => {
      const data = {
        title: 'Test',
        category: 'FOOD',
        urgency: 'IMPULSE',
      };

      const result = safeValidateCreateImpulse(data);
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.errors).toBeUndefined();
    });

    it('should return errors for invalid data', () => {
      const invalidData = {
        title: '',
        category: 'FOOD',
        urgency: 'IMPULSE',
      };

      const result = safeValidateCreateImpulse(invalidData);
      expect(result.success).toBe(false);
      expect(result.data).toBeUndefined();
      expect(result.errors).toBeDefined();
    });
  });

  describe('getValidationErrors', () => {
    it('should format Zod errors correctly', () => {
      const schema = z.object({
        name: z.string().min(1, 'Name is required'),
        age: z.number().min(18, 'Must be 18+'),
      });

      const result = schema.safeParse({ name: '', age: 15 });
      if (!result.success) {
        const errors = getValidationErrors(result.error);
        expect(errors.length).toBeGreaterThan(0);
        expect(errors[0]).toContain('required');
      }
    });
  });
});

