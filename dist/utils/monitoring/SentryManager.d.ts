import { ConfigState } from '../../types/global';

declare class SentryManager {
    private static instance;
    private initialized;
    private sentryLib;
    private logger;
    static getInstance(): SentryManager;
    initialize(config: ConfigState): Promise<void>;
    captureException(error: Error, context?: Record<string, any>): void;
    captureMessage(message: string, level?: 'info' | 'warning' | 'error'): void;
    addBreadcrumb(breadcrumb: {
        message: string;
        category?: string;
        level?: string;
        data?: Record<string, any>;
    }): void;
    setUserContext(config: ConfigState): void;
    startSpan<T>(options: {
        op: string;
        name: string;
        attributes?: Record<string, any>;
    }, callback: (span: any) => T | Promise<T>): T | Promise<T>;
    getLogger(): any;
    private detectPageType;
    private getLoadedEnhancers;
}
export declare const sentryManager: SentryManager;
export {};
//# sourceMappingURL=SentryManager.d.ts.map