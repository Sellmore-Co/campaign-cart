import { ProviderAdapter } from './ProviderAdapter';
import { DataLayerEvent } from '../types';
interface CustomAdapterConfig {
    endpoint?: string;
    headers?: Record<string, string>;
    batchSize?: number;
    batchIntervalMs?: number;
    maxRetries?: number;
    retryDelayMs?: number;
    transformFunction?: (event: DataLayerEvent) => any;
}
/**
 * Custom adapter for sending events to webhooks or custom APIs
 */
export declare class CustomAdapter extends ProviderAdapter {
    private config;
    private eventQueue;
    private batchTimer;
    private retryQueue;
    constructor(config?: CustomAdapterConfig);
    /**
     * Update configuration
     */
    updateConfig(config: Partial<CustomAdapterConfig>): void;
    /**
     * Send event to custom endpoint
     */
    sendEvent(event: DataLayerEvent): void;
    /**
     * Schedule batch sending
     */
    private scheduleBatch;
    /**
     * Send batch of events
     */
    private sendBatch;
    /**
     * Send HTTP request with retry logic
     */
    private sendRequest;
    /**
     * Add event to retry queue
     */
    private addToRetryQueue;
    /**
     * Schedule retry for a specific event
     */
    private scheduleRetry;
    /**
     * Delay helper
     */
    private delay;
    /**
     * Force send all queued events immediately
     */
    flush(): Promise<void>;
    /**
     * Get current queue size
     */
    getQueueSize(): number;
    /**
     * Get retry queue size
     */
    getRetryQueueSize(): number;
    /**
     * Clear all queued events
     */
    clearQueue(): void;
}
export {};
//# sourceMappingURL=CustomAdapter.d.ts.map