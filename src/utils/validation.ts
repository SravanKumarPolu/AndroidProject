import { z } from 'zod';
import { ImpulseCategory, EmotionTag, UrgencyLevel, CoolDownPeriod } from '@/types/impulse';

/**
 * Validation schemas using Zod
 * Ensures data integrity and type safety
 */

export const impulseCategorySchema = z.enum([
  'FOOD',
  'SHOPPING',
  'ENTERTAINMENT',
  'TRADING',
  'CRYPTO',
  'COURSE',
  'SUBSCRIPTION',
  'OTHER',
]);

export const emotionTagSchema = z.enum([
  'BORED',
  'STRESSED',
  'FOMO',
  'HAPPY',
  'LONELY',
  'NONE',
]);

export const urgencyLevelSchema = z.enum([
  'ESSENTIAL',
  'NICE_TO_HAVE',
  'IMPULSE',
]);

export const coolDownPeriodSchema = z.enum([
  '1H',
  '6H',
  '24H',
  '3D',
]);

export const impulseStatusSchema = z.enum([
  'LOCKED',
  'CANCELLED',
  'EXECUTED',
]);

export const finalFeelingSchema = z.enum([
  'WORTH_IT',
  'REGRET',
  'NEUTRAL',
]);

export const skippedFeelingSchema = z.enum([
  'RELIEVED',
  'NEUTRAL',
  'STILL_CRAVING',
]);

/**
 * Schema for creating a new impulse
 */
export const createImpulseSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title must be less than 200 characters')
    .trim(),
  category: impulseCategorySchema,
  price: z
    .number()
    .positive('Price must be positive')
    .optional()
    .nullable(),
  emotion: emotionTagSchema.optional().nullable(),
  urgency: urgencyLevelSchema,
  coolDownPeriod: coolDownPeriodSchema.optional(),
  notes: z
    .string()
    .max(1000, 'Notes must be less than 1000 characters')
    .optional()
    .nullable(),
  sourceApp: z
    .string()
    .max(100, 'Source app must be less than 100 characters')
    .optional()
    .nullable(),
});

/**
 * Schema for updating an impulse
 */
export const updateImpulseSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title must be less than 200 characters')
    .trim()
    .optional(),
  category: impulseCategorySchema.optional(),
  price: z
    .number()
    .positive('Price must be positive')
    .optional()
    .nullable(),
  emotion: emotionTagSchema.optional().nullable(),
  urgency: urgencyLevelSchema.optional(),
  coolDownPeriod: coolDownPeriodSchema.optional(),
  status: impulseStatusSchema.optional(),
  finalFeeling: finalFeelingSchema.optional().nullable(),
  skippedFeeling: skippedFeelingSchema.optional().nullable(),
  notes: z
    .string()
    .max(1000, 'Notes must be less than 1000 characters')
    .optional()
    .nullable(),
  sourceApp: z
    .string()
    .max(100, 'Source app must be less than 100 characters')
    .optional()
    .nullable(),
});

/**
 * Schema for validating a complete impulse
 */
export const impulseSchema = z.object({
  id: z.string().min(1, 'ID is required'),
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title must be less than 200 characters'),
  category: impulseCategorySchema,
  price: z.number().positive().optional().nullable(),
  emotion: emotionTagSchema.optional().nullable(),
  urgency: urgencyLevelSchema,
  coolDownPeriod: coolDownPeriodSchema,
  createdAt: z.number().positive(),
  reviewAt: z.number().positive(),
  status: impulseStatusSchema,
  executedAt: z.number().positive().optional().nullable(),
  finalFeeling: finalFeelingSchema.optional().nullable(),
  skippedFeeling: skippedFeelingSchema.optional().nullable(),
  notes: z.string().max(1000).optional().nullable(),
  sourceApp: z.string().max(100).optional().nullable(),
});

/**
 * Validate and sanitize input data
 */
export function validateCreateImpulse(data: unknown) {
  return createImpulseSchema.parse(data);
}

export function validateUpdateImpulse(data: unknown) {
  return updateImpulseSchema.parse(data);
}

export function validateImpulse(data: unknown) {
  return impulseSchema.parse(data);
}

/**
 * Safe validation that returns errors instead of throwing
 */
export function safeValidateCreateImpulse(data: unknown) {
  const result = createImpulseSchema.safeParse(data);
  return {
    success: result.success,
    data: result.success ? result.data : undefined,
    errors: result.success ? undefined : result.error.format(),
  };
}

export function safeValidateUpdateImpulse(data: unknown) {
  const result = updateImpulseSchema.safeParse(data);
  return {
    success: result.success,
    data: result.success ? result.data : undefined,
    errors: result.success ? undefined : result.error.format(),
  };
}

/**
 * Get user-friendly error messages from Zod errors
 */
export function getValidationErrors(error: z.ZodError): string[] {
  return error.errors.map(err => {
    const path = err.path.join('.');
    return path ? `${path}: ${err.message}` : err.message;
  });
}

