/**
 * Sentry Logger Wrapper
 * Provides a typed interface for Sentry's structured logging
 * as per error-rules.md guidelines
 */
declare class SentryLogger {
    private getSentry;
    trace(message: string, extra?: Record<string, any>): void;
    debug(message: string | TemplateStringsArray, ...values: any[]): void;
    info(message: string, extra?: Record<string, any>): void;
    warn(message: string, extra?: Record<string, any>): void;
    error(message: string, extra?: Record<string, any>): void;
    fatal(message: string, extra?: Record<string, any>): void;
    /**
     * Template literal function for structured logging
     * Usage: sentryLogger.fmt`Cache miss for user: ${userId}`
     */
    fmt(strings: TemplateStringsArray, ...values: any[]): string;
}
export declare const sentryLogger: SentryLogger;
export {};
//# sourceMappingURL=sentryLogger.d.ts.map