/**
 * Performance Monitoring Utilities
 * Tracks app performance metrics and screen load times
 */

import { logger } from './logger';

// Import React for the hook
import React from 'react';

interface PerformanceMetric {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  metadata?: Record<string, any>;
}

class PerformanceMonitor {
  private metrics: Map<string, PerformanceMetric> = new Map();
  private enabled: boolean = !__DEV__; // Enable in production by default

  /**
   * Enable or disable performance monitoring
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  /**
   * Start tracking a performance metric
   */
  start(name: string, metadata?: Record<string, any>): void {
    if (!this.enabled) return;

    this.metrics.set(name, {
      name,
      startTime: performance.now(),
      metadata,
    });
  }

  /**
   * End tracking a performance metric
   */
  end(name: string): number | null {
    if (!this.enabled) return null;

    const metric = this.metrics.get(name);
    if (!metric) {
      logger.warn(`Performance metric "${name}" not found`);
      return null;
    }

    const endTime = performance.now();
    const duration = endTime - metric.startTime;

    metric.endTime = endTime;
    metric.duration = duration;

    // Log slow operations
    if (duration > 1000) {
      logger.warn(`Slow operation detected: ${name} took ${duration.toFixed(2)}ms`, undefined, {
        duration,
        metadata: metric.metadata,
      });
    }

    // Send to analytics if available
    this.reportMetric(metric);

    return duration;
  }

  /**
   * Measure a function's execution time
   */
  async measure<T>(
    name: string,
    fn: () => Promise<T>,
    metadata?: Record<string, any>
  ): Promise<T> {
    this.start(name, metadata);
    try {
      const result = await fn();
      this.end(name);
      return result;
    } catch (error) {
      this.end(name);
      throw error;
    }
  }

  /**
   * Get all metrics
   */
  getMetrics(): PerformanceMetric[] {
    return Array.from(this.metrics.values());
  }

  /**
   * Clear all metrics
   */
  clear(): void {
    this.metrics.clear();
  }

  /**
   * Report metric to analytics (if available)
   */
  private reportMetric(metric: PerformanceMetric): void {
    // In production, this could send to analytics service
    if (metric.duration && metric.duration > 500) {
      // Log significant performance metrics
      logger.debug(`Performance: ${metric.name} - ${metric.duration.toFixed(2)}ms`, {
        metric: metric.name,
        duration: metric.duration,
        ...metric.metadata,
      });
    }
  }

  /**
   * Track screen load time
   */
  trackScreenLoad(screenName: string): () => void {
    const startTime = Date.now();
    this.start(`screen_load_${screenName}`, { screen: screenName });

    return () => {
      const loadTime = Date.now() - startTime;
      this.end(`screen_load_${screenName}`);
      
      if (loadTime > 2000) {
        logger.warn(`Slow screen load: ${screenName} took ${loadTime}ms`);
      }
    };
  }

  /**
   * Track memory usage (if available)
   */
  trackMemory(): void {
    if (typeof performance !== 'undefined' && 'memory' in performance) {
      const memory = (performance as any).memory;
      if (memory) {
        const usedMB = memory.usedJSHeapSize / 1048576;
        const totalMB = memory.totalJSHeapSize / 1048576;
        const limitMB = memory.jsHeapSizeLimit / 1048576;

        if (usedMB / limitMB > 0.8) {
          logger.warn('High memory usage detected', undefined, {
            usedMB: usedMB.toFixed(2),
            totalMB: totalMB.toFixed(2),
            limitMB: limitMB.toFixed(2),
            usagePercent: ((usedMB / limitMB) * 100).toFixed(2),
          });
        }
      }
    }
  }
}

export const performanceMonitor = new PerformanceMonitor();

/**
 * React hook for tracking screen performance
 */
export function useScreenPerformance(screenName: string) {
  React.useEffect(() => {
    const endTracking = performanceMonitor.trackScreenLoad(screenName);
    return () => {
      endTracking();
    };
  }, [screenName]);
}

