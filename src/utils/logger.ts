/**
 * Logger utility
 * Replaces console.* with structured logging
 * - Disables logs in production (except errors)
 * - Supports log levels
 * - Integrates with Sentry for crash reporting
 */

const isDev = __DEV__;

// Lazy load Sentry to avoid issues if not configured
let Sentry: any = null;
try {
  // Only import if available (will be installed via expo install sentry-expo)
  Sentry = require('sentry-expo');
} catch {
  // Sentry not installed, will gracefully degrade
}

interface LogContext {
  [key: string]: any;
}

/**
 * Logger with different log levels
 */
export const logger = {
  /**
   * Debug logs - only in development
   */
  debug: (...args: any[]) => {
    if (isDev) {
      console.log('[DEBUG]', ...args);
    }
  },

  /**
   * Info logs - only in development
   */
  info: (...args: any[]) => {
    if (isDev) {
      console.info('[INFO]', ...args);
    }
  },

  /**
   * Warning logs - always shown
   */
  warn: (...args: any[]) => {
    console.warn('[WARN]', ...args);
  },

  /**
   * Error logs - always shown
   * In production, sends to Sentry for crash reporting
   */
  error: (message: string, error?: Error | unknown, context?: LogContext) => {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;

    console.error('[ERROR]', message, {
      error: errorMessage,
      stack: errorStack,
      context,
    });

    // Send to Sentry in production
    if (Sentry && !isDev) {
      if (error instanceof Error) {
        Sentry.Native.captureException(error, {
          tags: context,
          extra: { message, ...context },
        });
      } else {
        Sentry.Native.captureMessage(message, {
          level: 'error',
          extra: { error: errorMessage, ...context },
        });
      }
    }
  },

  /**
   * Log with context (structured logging)
   */
  log: (level: 'debug' | 'info' | 'warn' | 'error', message: string, context?: LogContext) => {
    const logMessage = context ? { message, ...context } : message;

    switch (level) {
      case 'debug':
        logger.debug(logMessage);
        break;
      case 'info':
        logger.info(logMessage);
        break;
      case 'warn':
        logger.warn(logMessage);
        break;
      case 'error':
        logger.error(message, undefined, context);
        break;
    }
  },
};

/**
 * Create a scoped logger for a specific module
 */
export function createLogger(module: string) {
  return {
    debug: (...args: any[]) => logger.debug(`[${module}]`, ...args),
    info: (...args: any[]) => logger.info(`[${module}]`, ...args),
    warn: (...args: any[]) => logger.warn(`[${module}]`, ...args),
    error: (message: string, error?: Error | unknown, context?: LogContext) =>
      logger.error(`[${module}] ${message}`, error, context),
  };
}

