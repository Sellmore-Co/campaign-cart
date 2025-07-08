/**
 * AutoEventListener - Listens to EventBus and maps internal events to data layer events
 * Handles cart events, upsell events, and other SDK events
 */
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
    /**
     * Initialize the auto event listener
     */
    initialize(): void;
    /**
     * Check if event should be processed based on debounce
     */
    private shouldProcessEvent;
    /**
     * Set up cart event listeners
     */
    private setupCartEventListeners;
    /**
     * Set up upsell event listeners
     */
    private setupUpsellEventListeners;
    /**
     * Set up checkout event listeners
     */
    private setupCheckoutEventListeners;
    /**
     * Set up page event listeners
     */
    private setupPageEventListeners;
    /**
     * Get current cart data
     */
    private getCartData;
    /**
     * Reset the auto event listener (called by NextAnalytics)
     */
    reset(): void;
    /**
     * Clean up the auto event listener
     */
    destroy(): void;
    /**
     * Get listener status
     */
    getStatus(): {
        initialized: boolean;
        listenersCount: number;
        debounceConfig: EventDebounceConfig;
    };
    /**
     * Update debounce configuration
     */
    setDebounceConfig(config: Partial<EventDebounceConfig>): void;
}
export declare const autoEventListener: AutoEventListener;
export {};
//# sourceMappingURL=AutoEventListener.d.ts.map