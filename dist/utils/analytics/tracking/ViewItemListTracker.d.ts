/**
 * ViewItemListTracker - Automatically tracks product views on pages
 * Scans for elements with data-next-package-id and fires appropriate events
 */
export declare class ViewItemListTracker {
    private static instance;
    private observer;
    private trackedProducts;
    private lastScanTime;
    private scanDebounceMs;
    private isInitialized;
    private constructor();
    static getInstance(): ViewItemListTracker;
    /**
     * Initialize the tracker
     */
    initialize(): void;
    /**
     * Scan the page for products and fire appropriate events
     */
    scan(): void;
    /**
     * Rescan the page (public method for manual triggering)
     */
    rescan(): void;
    /**
     * Find all product elements on the page
     */
    private findProductElements;
    /**
     * Track a single product view
     */
    private trackViewItem;
    /**
     * Track multiple products view
     */
    private trackViewItemList;
    /**
     * Set up mutation observer for dynamic content
     */
    private setupObserver;
    /**
     * Reset the tracker (for route changes)
     */
    reset(): void;
    /**
     * Clean up the tracker
     */
    destroy(): void;
    /**
     * Get tracking status
     */
    getStatus(): {
        initialized: boolean;
        trackedCount: number;
        observing: boolean;
    };
}
export declare const viewItemListTracker: ViewItemListTracker;
//# sourceMappingURL=ViewItemListTracker.d.ts.map