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
export declare class CustomAdapter extends ProviderAdapter {
    private config;
    private eventQueue;
    private batchTimer;
    private retryQueue;
    constructor(config?: CustomAdapterConfig);
    updateConfig(config: Partial<CustomAdapterConfig>): void;
    sendEvent(event: DataLayerEvent): void;
    private scheduleBatch;
    private sendBatch;
    private sendRequest;
    private addToRetryQueue;
    private scheduleRetry;
    private delay;
    flush(): Promise<void>;
    getQueueSize(): number;
    getRetryQueueSize(): number;
    clearQueue(): void;
}
export {};
//# sourceMappingURL=CustomAdapter.d.ts.map