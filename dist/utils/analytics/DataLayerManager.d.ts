import { DataLayerEvent, DataLayerConfig, EventContext, DataLayerTransformFn, DebugOptions } from './types';
declare global {
    interface Window {
        NextDataLayer: DataLayerEvent[];
        NextDataLayerTransformFn?: DataLayerTransformFn;
    }
}
export declare class DataLayerManager {
    private static instance;
    private config;
    private sessionId;
    private sequenceNumber;
    private debugMode;
    private context;
    getContext(): EventContext;
    private constructor();
    static getInstance(config?: Partial<DataLayerConfig>): DataLayerManager;
    private initializeDataLayer;
    push(event: DataLayerEvent): void;
    setDebugMode(enabled: boolean, options?: Partial<DebugOptions>): void;
    isDebugMode(): boolean;
    invalidateContext(): void;
    setUserProperties(properties: Record<string, any>): void;
    getUserProperties(): Record<string, any> | null;
    clear(): void;
    private validateEvent;
    private enrichEvent;
    private enrichContext;
    private getOrCreateSessionId;
    private loadDebugMode;
    private notifyProviders;
    private generateEventId;
    private generateSessionId;
    private getNestedValue;
    private debug;
    private error;
    initialize(): void;
    addProvider(provider: any): void;
    setTransformFunction(fn: DataLayerTransformFn): void;
    getEventCount(): number;
    formatEcommerceEvent(eventName: string, data: any): DataLayerEvent;
    formatUserDataEvent(userData: any): DataLayerEvent;
}
export declare const dataLayer: DataLayerManager;
//# sourceMappingURL=DataLayerManager.d.ts.map