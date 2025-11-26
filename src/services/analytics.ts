/**
 * Analytics Service
 * Provides analytics tracking for user actions and app events
 * Supports multiple analytics providers (optional)
 */

import { logger } from '@/utils/logger';
import { performanceMonitor } from '@/utils/performance';

// Import React for the hook
import React from 'react';

export type AnalyticsEvent = 
  | 'app_started'
  | 'impulse_created'
  | 'impulse_cancelled'
  | 'impulse_executed'
  | 'impulse_regretted'
  | 'screen_view'
  | 'feature_used'
  | 'error_occurred'
  | 'sync_completed'
  | 'sync_failed'
  | 'achievement_unlocked'
  | 'goal_completed'
  | 'budget_exceeded';

interface AnalyticsProperties {
  [key: string]: string | number | boolean | undefined;
}

class AnalyticsService {
  private enabled: boolean = false;
  private userId?: string;
  private sessionId: string = this.generateSessionId();

  /**
   * Initialize analytics service
   */
  async initialize(userId?: string): Promise<void> {
    this.userId = userId;
    this.enabled = true;
    
    // In production, initialize analytics providers here
    // Example: Firebase Analytics, Mixpanel, etc.
    
    logger.debug('Analytics service initialized');
  }

  /**
   * Track an event
   */
  track(event: AnalyticsEvent, properties?: AnalyticsProperties): void {
    if (!this.enabled) return;

    const eventData = {
      event,
      properties: {
        ...properties,
        sessionId: this.sessionId,
        timestamp: Date.now(),
        userId: this.userId,
      },
    };

    // Log in development
    if (__DEV__) {
      logger.debug(`Analytics: ${event}`, undefined, eventData.properties);
    }

    // In production, send to analytics provider
    // Example: Firebase Analytics
    // if (typeof firebase !== 'undefined') {
    //   firebase.analytics().logEvent(event, eventData.properties);
    // }
  }

  /**
   * Track screen view
   */
  trackScreenView(screenName: string, properties?: AnalyticsProperties): void {
    this.track('screen_view', {
      screen_name: screenName,
      ...properties,
    });
  }

  /**
   * Track user property
   */
  setUserProperty(name: string, value: string | number | boolean): void {
    if (!this.enabled) return;

    // In production, set user property in analytics provider
    logger.debug(`Analytics: Set user property ${name} = ${value}`);
  }

  /**
   * Track error
   */
  trackError(error: Error, context?: AnalyticsProperties): void {
    this.track('error_occurred', {
      error_message: error.message,
      error_name: error.name,
      error_stack: error.stack?.substring(0, 500), // Limit stack trace length
      ...context,
    });
  }

  /**
   * Track performance metric
   */
  trackPerformance(metricName: string, duration: number, metadata?: AnalyticsProperties): void {
    if (duration > 1000) {
      this.track('feature_used', {
        feature: 'performance',
        metric_name: metricName,
        duration_ms: duration,
        ...metadata,
      });
    }
  }

  /**
   * Generate session ID
   */
  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Reset session (for testing)
   */
  resetSession(): void {
    this.sessionId = this.generateSessionId();
  }
}

export const analytics = new AnalyticsService();

/**
 * React hook for tracking screen views
 */
export function useAnalytics() {
  const trackScreenView = React.useCallback((screenName: string, properties?: AnalyticsProperties) => {
    analytics.trackScreenView(screenName, properties);
  }, []);

  const trackEvent = React.useCallback((event: AnalyticsEvent, properties?: AnalyticsProperties) => {
    analytics.track(event, properties);
  }, []);

  return {
    trackScreenView,
    trackEvent,
    analytics,
  };
}

