export declare class AnalyticsManager {
    private static instance;
    private loaded;
    private loading;
    private loadPromise;
    private constructor();
    static getInstance(): AnalyticsManager;
    loadAnalyticsSDK(): Promise<void>;
    private performLoad;
    private loadScript;
    trackEvent(eventName: string, eventData?: Record<string, any>): Promise<void>;
    trackPageView(): Promise<void>;
    isLoaded(): boolean;
    isLoading(): boolean;
}
export declare const analyticsManager: AnalyticsManager;
//# sourceMappingURL=analytics.d.ts.map