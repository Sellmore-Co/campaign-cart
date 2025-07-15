/**
 * Display Error Boundary
 * Provides graceful error handling for display operations
 */

import { Logger } from '@/utils/logger';

export interface ErrorContext {
  operation: string;
  element?: HTMLElement;
  property?: string;
  value?: any;
  [key: string]: any;
}

export interface ErrorHandler {
  (error: Error, context: ErrorContext): void;
}

export class DisplayErrorBoundary {
  private static logger = new Logger('DisplayErrorBoundary');
  private static errorHandlers: ErrorHandler[] = [];
  private static errorCache = new Map<string, { count: number; lastError: Date }>();
  private static readonly ERROR_THRESHOLD = 5;
  private static readonly ERROR_WINDOW_MS = 60000; // 1 minute
  
  /**
   * Wrap a synchronous function with error handling
   */
  static wrap<T>(fn: () => T, fallback: T, context?: ErrorContext): T {
    try {
      return fn();
    } catch (error) {
      this.handleError(error as Error, context || { operation: 'unknown' });
      return fallback;
    }
  }
  
  /**
   * Wrap an async function with error handling
   */
  static async wrapAsync<T>(
    fn: () => Promise<T>, 
    fallback: T, 
    context?: ErrorContext
  ): Promise<T> {
    try {
      return await fn();
    } catch (error) {
      this.handleError(error as Error, context || { operation: 'unknown' });
      return fallback;
    }
  }
  
  /**
   * Try multiple strategies in order until one succeeds
   */
  static tryStrategies<T>(
    strategies: Array<() => T>, 
    fallback: T,
    context?: ErrorContext
  ): T {
    for (let i = 0; i < strategies.length; i++) {
      try {
        const strategy = strategies[i];
        if (strategy) {
          return strategy();
        }
      } catch (error) {
        if (i === strategies.length - 1) {
          this.handleError(error as Error, {
            ...context,
            operation: context?.operation || 'tryStrategies',
            strategy: i
          });
        }
      }
    }
    return fallback;
  }
  
  /**
   * Register a custom error handler
   */
  static addErrorHandler(handler: ErrorHandler): void {
    this.errorHandlers.push(handler);
  }
  
  /**
   * Remove a custom error handler
   */
  static removeErrorHandler(handler: ErrorHandler): void {
    const index = this.errorHandlers.indexOf(handler);
    if (index > -1) {
      this.errorHandlers.splice(index, 1);
    }
  }
  
  /**
   * Handle an error with context
   */
  private static handleError(error: Error, context: ErrorContext): void {
    // Create error key for rate limiting
    const errorKey = `${context.operation}:${error.message}`;
    const now = Date.now();
    
    // Check rate limiting
    const cached = this.errorCache.get(errorKey);
    if (cached) {
      if (now - cached.lastError.getTime() < this.ERROR_WINDOW_MS) {
        cached.count++;
        if (cached.count > this.ERROR_THRESHOLD) {
          // Don't log if we've exceeded threshold
          return;
        }
      } else {
        // Reset count after window expires
        cached.count = 1;
        cached.lastError = new Date(now);
      }
    } else {
      this.errorCache.set(errorKey, { count: 1, lastError: new Date(now) });
    }
    
    // Log error with context
    this.logger.error(`[Display Error] ${context.operation}:`, {
      error: error.message,
      stack: error.stack,
      context
    });
    
    // Call custom error handlers
    this.errorHandlers.forEach(handler => {
      try {
        handler(error, context);
      } catch (handlerError) {
        this.logger.error('Error in error handler:', handlerError);
      }
    });
    
    // Add visual indicator in development
    if (process.env.NODE_ENV === 'development' && context.element) {
      context.element.classList.add('display-error');
      context.element.setAttribute('data-error', error.message);
    }
  }
  
  /**
   * Clear error cache (useful for testing)
   */
  static clearErrorCache(): void {
    this.errorCache.clear();
  }
  
  /**
   * Get error statistics
   */
  static getErrorStats(): Map<string, { count: number; lastError: Date }> {
    return new Map(this.errorCache);
  }
}

/**
 * Decorator for wrapping class methods with error boundaries
 */
export function withErrorBoundary<T>(fallback: T) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    
    descriptor.value = async function (...args: any[]) {
      const context: ErrorContext = {
        operation: `${target.constructor.name}.${propertyKey}`
      };
      
      if (originalMethod.constructor.name === 'AsyncFunction') {
        return DisplayErrorBoundary.wrapAsync(
          () => originalMethod.apply(this, args),
          fallback,
          context
        );
      } else {
        return DisplayErrorBoundary.wrap(
          () => originalMethod.apply(this, args),
          fallback,
          context
        );
      }
    };
    
    return descriptor;
  };
}

/**
 * Create a safe getter that won't throw
 */
export function safeGet<T>(obj: any, path: string, fallback: T): T {
  return DisplayErrorBoundary.wrap(() => {
    const parts = path.split('.');
    let current = obj;
    
    for (const part of parts) {
      if (current == null) return fallback;
      current = current[part];
    }
    
    return current ?? fallback;
  }, fallback, { operation: 'safeGet', path });
}