/**
 * Analytics Utility
 * Handles lazy loading of analytics SDK and event tracking
 */
export declare class AnalyticsManager {
    private static instance;
    private loaded;
    private loading;
    private loadPromise;
    private constructor();
    static getInstance(): AnalyticsManager;
    /**
     * Lazy loads the analytics SDK and initializes it with campaign data
     */
    loadAnalyticsSDK(): Promise<void>;
    private performLoad;
    private loadScript;
    /**
     * Tracks an analytics event
     */
    trackEvent(eventName: string, eventData?: Record<string, any>): Promise<void>;
    /**
     * Tracks a page view event
     */
    trackPageView(): Promise<void>;
    /**
     * Check if analytics SDK is loaded
     */
    isLoaded(): boolean;
    /**
     * Check if analytics SDK is currently loading
     */
    isLoading(): boolean;
}
export declare const analyticsManager: AnalyticsManager;
//# sourceMappingURL=analytics.d.ts.map