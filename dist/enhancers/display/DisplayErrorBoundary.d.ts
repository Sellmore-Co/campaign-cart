/**
 * Display Error Boundary
 * Provides graceful error handling for display operations
 */
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
export declare class DisplayErrorBoundary {
    private static logger;
    private static errorHandlers;
    private static errorCache;
    private static readonly ERROR_THRESHOLD;
    private static readonly ERROR_WINDOW_MS;
    /**
     * Wrap a synchronous function with error handling
     */
    static wrap<T>(fn: () => T, fallback: T, context?: ErrorContext): T;
    /**
     * Wrap an async function with error handling
     */
    static wrapAsync<T>(fn: () => Promise<T>, fallback: T, context?: ErrorContext): Promise<T>;
    /**
     * Try multiple strategies in order until one succeeds
     */
    static tryStrategies<T>(strategies: Array<() => T>, fallback: T, context?: ErrorContext): T;
    /**
     * Register a custom error handler
     */
    static addErrorHandler(handler: ErrorHandler): void;
    /**
     * Remove a custom error handler
     */
    static removeErrorHandler(handler: ErrorHandler): void;
    /**
     * Handle an error with context
     */
    private static handleError;
    /**
     * Clear error cache (useful for testing)
     */
    static clearErrorCache(): void;
    /**
     * Get error statistics
     */
    static getErrorStats(): Map<string, {
        count: number;
        lastError: Date;
    }>;
}
/**
 * Decorator for wrapping class methods with error boundaries
 */
export declare function withErrorBoundary<T>(fallback: T): (target: any, propertyKey: string, descriptor: PropertyDescriptor) => PropertyDescriptor;
/**
 * Create a safe getter that won't throw
 */
export declare function safeGet<T>(obj: any, path: string, fallback: T): T;
//# sourceMappingURL=DisplayErrorBoundary.d.ts.map