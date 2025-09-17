import { AttributeScanner } from './AttributeScanner';
export declare class SDKInitializer {
    private static logger;
    private static initialized;
    private static attributeScanner;
    private static retryAttempts;
    private static maxRetries;
    private static initStartTime;
    private static campaignLoadStartTime;
    private static campaignLoadTime;
    private static campaignFromCache;
    static initialize(): Promise<void>;
    private static captureUrlParameters;
    private static initializeLocationAndCurrency;
    private static loadConfiguration;
    private static loadCampaignData;
    private static processForcePackageId;
    private static processProfileParameter;
    private static processForceShippingId;
    private static initializeAttribution;
    private static setupAttributionListeners;
    private static initializeAnalytics;
    private static initializeErrorHandler;
    private static checkAndLoadOrder;
    private static scanAndEnhanceDOM;
    private static setupReadyCallbacks;
    private static initializeDebugMode;
    private static setupGlobalDebugUtils;
    static isInitialized(): boolean;
    static reinitialize(): Promise<void>;
    private static waitForDOM;
    private static waitForStoreRehydration;
    private static emitInitializedEvent;
    static getAttributeScanner(): AttributeScanner | null;
    static getInitializationStats(): {
        initialized: boolean;
        retryAttempts: number;
        scannerStats?: ReturnType<AttributeScanner['getStats']>;
    };
    private static clearAllStorage;
}
//# sourceMappingURL=SDKInitializer.d.ts.map