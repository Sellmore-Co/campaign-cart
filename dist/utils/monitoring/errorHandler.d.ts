declare class GlobalErrorHandler {
    private logger;
    private initialized;
    private isHandlingError;
    initialize(): void;
    handleError(error: Error | any, context?: Record<string, any>): void;
    captureMessage(message: string, level?: 'info' | 'warning' | 'error'): void;
    addBreadcrumb(breadcrumb: {
        message: string;
        category?: string;
        level?: string;
        data?: Record<string, any>;
    }): void;
}
export declare const errorHandler: GlobalErrorHandler;
export {};
//# sourceMappingURL=errorHandler.d.ts.map