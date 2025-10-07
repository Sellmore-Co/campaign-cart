interface EventDebounceConfig {
    [eventName: string]: number;
}
export declare class AutoEventListener {
    private static instance;
    private eventBus;
    private isInitialized;
    private eventHandlers;
    private lastEventTimes;
    private debounceConfig;
    private constructor();
    static getInstance(): AutoEventListener;
    initialize(): void;
    private shouldProcessEvent;
    private setupCartEventListeners;
    private setupUpsellEventListeners;
    private setupCheckoutEventListeners;
    private setupPageEventListeners;
    private setupExitIntentEventListeners;
    private getCartData;
    reset(): void;
    destroy(): void;
    getStatus(): {
        initialized: boolean;
        listenersCount: number;
        debounceConfig: EventDebounceConfig;
    };
    setDebounceConfig(config: Partial<EventDebounceConfig>): void;
}
export declare const autoEventListener: AutoEventListener;
export {};
//# sourceMappingURL=AutoEventListener.d.ts.map