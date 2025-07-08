/**
 * UserDataTracker - Tracks user data and cart contents
 * Fires dl_user_data event on page load and route changes
 */
export declare class UserDataTracker {
    private static instance;
    private eventBus;
    private lastTrackTime;
    private trackDebounceMs;
    private isInitialized;
    private unsubscribers;
    private constructor();
    static getInstance(): UserDataTracker;
    /**
     * Initialize the tracker
     */
    initialize(): void;
    /**
     * Track user data event
     */
    trackUserData(): void;
    /**
     * Collect user data from stores
     */
    private collectUserData;
    /**
     * Get checkout data from form fields if available
     */
    private getCheckoutData;
    /**
     * Set up event listeners
     */
    private setupListeners;
    /**
     * Force track user data (bypasses debounce)
     */
    forceTrack(): void;
    /**
     * Reset the tracker (called by NextAnalytics)
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
        lastTrackTime: number;
        listenersCount: number;
    };
}
export declare const userDataTracker: UserDataTracker;
//# sourceMappingURL=UserDataTracker.d.ts.map