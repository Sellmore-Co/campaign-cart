/**
 * Sentry Logger Wrapper
 * Provides a typed interface for Sentry's structured logging
 * as per error-rules.md guidelines
 */

import { sentryManager } from './SentryManager';

class SentryLogger {
  private getSentry(): any {
    const sentry = sentryManager.getLogger();
    if (!sentry) {
      // Fallback to console if Sentry isn't initialized
      return {
        logger: {
          trace: console.trace.bind(console),
          debug: console.debug.bind(console),
          info: console.info.bind(console),
          warn: console.warn.bind(console),
          error: console.error.bind(console),
          fatal: console.error.bind(console),
          fmt: (strings: TemplateStringsArray, ...values: any[]) => {
            return strings.reduce((acc, str, i) => {
              return acc + str + (values[i] || '');
            }, '');
          }
        }
      };
    }
    return sentry;
  }

  trace(message: string, extra?: Record<string, any>): void {
    const { logger } = this.getSentry();
    logger.trace(message, extra);
  }

  debug(message: string | TemplateStringsArray, ...values: any[]): void {
    const { logger } = this.getSentry();
    if (typeof message === 'string') {
      logger.debug(message, values[0]);
    } else {
      // Using fmt template literal
      logger.debug(logger.fmt(message, ...values));
    }
  }

  info(message: string, extra?: Record<string, any>): void {
    const { logger } = this.getSentry();
    logger.info(message, extra);
  }

  warn(message: string, extra?: Record<string, any>): void {
    const { logger } = this.getSentry();
    logger.warn(message, extra);
  }

  error(message: string, extra?: Record<string, any>): void {
    const { logger } = this.getSentry();
    logger.error(message, extra);
  }

  fatal(message: string, extra?: Record<string, any>): void {
    const { logger } = this.getSentry();
    logger.fatal(message, extra);
  }

  /**
   * Template literal function for structured logging
   * Usage: sentryLogger.fmt`Cache miss for user: ${userId}`
   */
  fmt(strings: TemplateStringsArray, ...values: any[]): string {
    const { logger } = this.getSentry();
    return logger.fmt(strings, ...values);
  }
}

export const sentryLogger = new SentryLogger();