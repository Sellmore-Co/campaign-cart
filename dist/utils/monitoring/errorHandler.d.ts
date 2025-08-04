declare class GlobalErrorHandler {
    private logger;
    private initialized;
    private isHandlingError;
    initialize(): void;
    handleError(error: Error | any, context?: Record<string, any>): void;
    captureMessage(_message: string, _level?: 'info' | 'warning' | 'error'): void;
    addBreadcrumb(_breadcrumb: {
        message: string;
        category?: string;
        level?: string;
        data?: Record<string, any>;
    }): void;
}
export declare const errorHandler: GlobalErrorHandler;
export {};
//# sourceMappingURL=errorHandler.d.ts.map