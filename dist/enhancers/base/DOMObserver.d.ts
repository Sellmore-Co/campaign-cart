/**
 * DOM Observer
 * Performance-optimized MutationObserver for dynamic content and attribute changes
 */
export interface DOMObserverConfig {
    childList?: boolean;
    subtree?: boolean;
    attributes?: boolean;
    attributeFilter?: string[];
    attributeOldValue?: boolean;
    characterData?: boolean;
    characterDataOldValue?: boolean;
}
export interface DOMChangeEvent {
    type: 'added' | 'removed' | 'attributeChanged';
    element: HTMLElement;
    attributeName?: string | undefined;
    oldValue?: string | undefined;
    newValue?: string | undefined;
}
export type DOMChangeHandler = (event: DOMChangeEvent) => void;
export declare class DOMObserver {
    private logger;
    private observer;
    private handlers;
    private isObserving;
    private config;
    private throttleTimeout;
    private pendingChanges;
    constructor(config?: DOMObserverConfig);
    /**
     * Add a change handler
     */
    addHandler(handler: DOMChangeHandler): void;
    /**
     * Remove a change handler
     */
    removeHandler(handler: DOMChangeHandler): void;
    /**
     * Start observing DOM changes
     */
    start(target?: Element): void;
    /**
     * Stop observing DOM changes
     */
    stop(): void;
    /**
     * Temporarily pause observation
     */
    pause(): void;
    /**
     * Resume observation after pause
     */
    resume(target?: Element): void;
    /**
     * Check if currently observing
     */
    isActive(): boolean;
    /**
     * Handle mutation records from MutationObserver
     */
    private handleMutations;
    /**
     * Check if a mutation is relevant to our data attributes
     */
    private isRelevantMutation;
    /**
     * Check if a NodeList contains relevant elements
     */
    private hasRelevantNodes;
    /**
     * Check if an element has relevant data attributes
     */
    private hasRelevantAttributes;
    /**
     * Check if an element has descendants with relevant attributes
     */
    private hasRelevantDescendants;
    /**
     * Process a single mutation record
     */
    private processMutation;
    /**
     * Process child list mutations (added/removed nodes)
     */
    private processChildListMutation;
    /**
     * Process attribute mutations
     */
    private processAttributeMutation;
    /**
     * Add an element to the pending changes queue
     */
    private addElementForProcessing;
    /**
     * Throttle notifications to avoid excessive processing
     */
    private throttleNotifications;
    /**
     * Process all pending changes
     */
    private processePendingChanges;
    /**
     * Notify all handlers of a change
     */
    private notifyHandlers;
    /**
     * Clear throttle timeout
     */
    private clearThrottle;
    /**
     * Cleanup and destroy observer
     */
    destroy(): void;
    /**
     * Get current configuration
     */
    getConfig(): DOMObserverConfig;
    /**
     * Update configuration (requires restart)
     */
    updateConfig(newConfig: Partial<DOMObserverConfig>): void;
}
//# sourceMappingURL=DOMObserver.d.ts.map