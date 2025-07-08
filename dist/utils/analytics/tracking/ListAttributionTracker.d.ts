/**
 * ListAttributionTracker - Tracks current list/collection page for attribution
 * Stores list context in sessionStorage for proper item attribution
 */
export declare class ListAttributionTracker {
    private static instance;
    private currentList;
    private constructor();
    static getInstance(): ListAttributionTracker;
    /**
     * Initialize the tracker (called by NextAnalytics)
     */
    initialize(): void;
    /**
     * Set the current list context
     */
    setCurrentList(listId?: string, listName?: string): void;
    /**
     * Get the current list context if still valid
     */
    getCurrentList(): {
        listId?: string;
        listName?: string;
    } | null;
    /**
     * Clear the current list context
     */
    clearCurrentList(): void;
    /**
     * Reset the tracker (called by NextAnalytics)
     */
    reset(): void;
    /**
     * Detect list from URL patterns
     */
    detectListFromUrl(url?: string): {
        listId?: string;
        listName?: string;
    } | null;
    /**
     * Automatically track list changes based on URL
     */
    private setupUrlTracking;
    /**
     * Track the current URL for list context
     */
    private trackCurrentUrl;
    /**
     * Check if URL is a product page (should preserve list context)
     */
    private isProductPage;
    /**
     * Format list name from ID
     */
    private formatListName;
    /**
     * Load list context from storage
     */
    private loadFromStorage;
    /**
     * Save list context to storage
     */
    private saveToStorage;
    /**
     * Remove list context from storage
     */
    private removeFromStorage;
}
export declare const listAttributionTracker: ListAttributionTracker;
//# sourceMappingURL=ListAttributionTracker.d.ts.map