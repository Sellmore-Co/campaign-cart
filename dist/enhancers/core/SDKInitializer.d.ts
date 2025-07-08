import { AttributeScanner } from './AttributeScanner';

export declare class SDKInitializer {
    private static logger;
    private static initialized;
    private static attributeScanner;
    private static retryAttempts;
    private static maxRetries;
    static initialize(): Promise<void>;
    private static loadConfiguration;
    private static loadCampaignData;
    private static processForcePackageId;
    private static initializeAttribution;
    private static setupAttributionListeners;
    private static initializeAnalytics;
    private static initializeSentry;
    private static initializeErrorHandler;
    private static checkAndLoadOrder;
    private static scanAndEnhanceDOM;
    private static setupReadyCallbacks;
    private static initializeDebugMode;
    private static setupGlobalDebugUtils;
    static isInitialized(): boolean;
    static reinitialize(): Promise<void>;
    private static waitForDOM;
    private static emitInitializedEvent;
    static getAttributeScanner(): AttributeScanner | null;
    static getInitializationStats(): {
        initialized: boolean;
        retryAttempts: number;
        scannerStats?: ReturnType<AttributeScanner['getStats']>;
    };
}
//# sourceMappingURL=SDKInitializer.d.ts.map