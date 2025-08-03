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
    /**
     * Get current context
     */
    getContext(): EventContext;
    private constructor();
    /**
     * Get singleton instance
     */
    static getInstance(config?: Partial<DataLayerConfig>): DataLayerManager;
    /**
     * Initialize window.NextDataLayer array
     */
    private initializeDataLayer;
    /**
     * Push event to data layer with validation
     */
    push(event: DataLayerEvent): void;
    /**
     * Enable/disable debug mode
     */
    setDebugMode(enabled: boolean, options?: Partial<DebugOptions>): void;
    /**
     * Get current debug mode status
     */
    isDebugMode(): boolean;
    /**
     * Invalidate context (for route changes)
     */
    invalidateContext(): void;
    /**
     * Update user properties
     */
    setUserProperties(properties: Record<string, any>): void;
    /**
     * Get stored user properties
     */
    getUserProperties(): Record<string, any> | null;
    /**
     * Clear all data
     */
    clear(): void;
    /**
     * Validate event structure
     */
    private validateEvent;
    /**
     * Enrich event with metadata and context
     */
    private enrichEvent;
    /**
     * Enrich context information
     */
    private enrichContext;
    /**
     * Get or create session ID
     */
    private getOrCreateSessionId;
    /**
     * Load debug mode from localStorage
     */
    private loadDebugMode;
    /**
     * Notify analytics providers
     */
    private notifyProviders;
    /**
     * Generate unique event ID
     */
    private generateEventId;
    /**
     * Generate session ID
     */
    private generateSessionId;
    /**
     * Get nested value from object
     */
    private getNestedValue;
    /**
     * Debug logging
     */
    private debug;
    /**
     * Error logging
     */
    private error;
    /**
     * Initialize the data layer (called by tracking components)
     */
    initialize(): void;
    /**
     * Add a provider to receive events
     */
    addProvider(provider: any): void;
    /**
     * Set transform function
     */
    setTransformFunction(fn: DataLayerTransformFn): void;
    /**
     * Get event count for statistics
     */
    getEventCount(): number;
    /**
     * Format an ecommerce event
     */
    formatEcommerceEvent(eventName: string, data: any): DataLayerEvent;
    /**
     * Format a user data event
     */
    formatUserDataEvent(userData: any): DataLayerEvent;
}
export declare const dataLayer: DataLayerManager;
//# sourceMappingURL=DataLayerManager.d.ts.map