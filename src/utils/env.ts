/**
 * Environment Variable Validation
 * Validates required and optional environment variables at app startup
 * Provides helpful error messages if configuration is missing
 */

import { logger } from './logger';

interface EnvConfig {
  required?: string[];
  optional?: string[];
  validate?: (env: Record<string, string | undefined>) => ValidationResult;
}

interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Environment variable definitions
 */
const ENV_CONFIG: EnvConfig = {
  // Required for cloud sync (optional feature)
  required: [],
  
  // Optional environment variables
  optional: [
    'EXPO_PUBLIC_SUPABASE_URL',
    'EXPO_PUBLIC_SUPABASE_ANON_KEY',
    'EXPO_PUBLIC_SENTRY_DSN',
    'EXPO_PUBLIC_APP_NAME',
    'EXPO_PUBLIC_DISPLAY_NAME',
    'EXPO_PUBLIC_PACKAGE_NAME',
  ],
  
  // Custom validation
  validate: (env) => {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    // Check Supabase configuration (required if cloud sync is enabled)
    const hasSupabaseUrl = !!env.EXPO_PUBLIC_SUPABASE_URL;
    const hasSupabaseKey = !!env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
    
    if (hasSupabaseUrl && !hasSupabaseKey) {
      warnings.push('EXPO_PUBLIC_SUPABASE_URL is set but EXPO_PUBLIC_SUPABASE_ANON_KEY is missing. Cloud sync will not work.');
    }
    if (hasSupabaseKey && !hasSupabaseUrl) {
      warnings.push('EXPO_PUBLIC_SUPABASE_ANON_KEY is set but EXPO_PUBLIC_SUPABASE_URL is missing. Cloud sync will not work.');
    }
    
    // Validate URL format if provided
    if (hasSupabaseUrl) {
      try {
        new URL(env.EXPO_PUBLIC_SUPABASE_URL!);
      } catch {
        errors.push('EXPO_PUBLIC_SUPABASE_URL is not a valid URL');
      }
    }
    
    // Validate Sentry DSN format if provided
    if (env.EXPO_PUBLIC_SENTRY_DSN && !env.EXPO_PUBLIC_SENTRY_DSN.startsWith('https://')) {
      warnings.push('EXPO_PUBLIC_SENTRY_DSN should be a valid Sentry DSN URL');
    }
    
    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  },
};

/**
 * Validate environment variables
 */
export function validateEnv(): ValidationResult {
  const env = process.env;
  const config = ENV_CONFIG;
  
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Check required variables
  if (config.required) {
    for (const key of config.required) {
      if (!env[key]) {
        errors.push(`Required environment variable ${key} is missing`);
      }
    }
  }
  
  // Run custom validation
  if (config.validate) {
    const result = config.validate(env);
    errors.push(...result.errors);
    warnings.push(...result.warnings);
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validate and log environment variables at startup
 * Call this early in app initialization (e.g., in app/_layout.tsx)
 */
export function validateAndLogEnv(): void {
  const result = validateEnv();
  
  if (result.errors.length > 0) {
    logger.error('Environment validation failed', new Error('Invalid environment configuration'), {
      errors: result.errors,
    });
    
    if (__DEV__) {
      console.error('❌ Environment Validation Errors:');
      result.errors.forEach(error => console.error(`  - ${error}`));
    }
  }
  
  if (result.warnings.length > 0) {
    result.warnings.forEach(warning => {
      logger.warn(`Environment warning: ${warning}`);
    });
    
    if (__DEV__) {
      console.warn('⚠️  Environment Validation Warnings:');
      result.warnings.forEach(warning => console.warn(`  - ${warning}`));
    }
  }
  
  if (result.valid && result.warnings.length === 0 && __DEV__) {
    logger.debug('Environment validation passed');
  }
}

/**
 * Get environment variable with validation
 */
export function getEnv(key: string, defaultValue?: string): string {
  const value = process.env[key] || defaultValue;
  
  if (!value && __DEV__) {
    logger.warn(`Environment variable ${key} is not set${defaultValue ? `, using default` : ''}`);
  }
  
  return value || '';
}

/**
 * Check if a feature is enabled via environment variable
 */
export function isFeatureEnabled(key: string, defaultValue = false): boolean {
  // Use bracket notation with type assertion for dynamic access
  const value = (process.env as Record<string, string | undefined>)[key];
  if (!value) return defaultValue;
  
  return value.toLowerCase() === 'true' || value === '1';
}

