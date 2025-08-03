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
    static wrap<T>(fn: () => T, fallback: T, context?: ErrorContext): T;
    static wrapAsync<T>(fn: () => Promise<T>, fallback: T, context?: ErrorContext): Promise<T>;
    static tryStrategies<T>(strategies: Array<() => T>, fallback: T, context?: ErrorContext): T;
    static addErrorHandler(handler: ErrorHandler): void;
    static removeErrorHandler(handler: ErrorHandler): void;
    private static handleError;
    static clearErrorCache(): void;
    static getErrorStats(): Map<string, {
        count: number;
        lastError: Date;
    }>;
}
export declare function withErrorBoundary<T>(fallback: T): (target: any, propertyKey: string, descriptor: PropertyDescriptor) => PropertyDescriptor;
export declare function safeGet<T>(obj: any, path: string, fallback: T): T;
//# sourceMappingURL=DisplayErrorBoundary.d.ts.map