export declare class UserDataTracker {
    private static instance;
    private eventBus;
    private lastTrackTime;
    private trackDebounceMs;
    private isInitialized;
    private unsubscribers;
    private hasTrackedInitial;
    private constructor();
    static getInstance(): UserDataTracker;
    initialize(): void;
    trackUserData(): void;
    private collectUserData;
    private getCheckoutData;
    private setupListeners;
    forceTrack(): void;
    reset(): void;
    destroy(): void;
    getStatus(): {
        initialized: boolean;
        lastTrackTime: number;
        listenersCount: number;
    };
}
export declare const userDataTracker: UserDataTracker;
//# sourceMappingURL=UserDataTracker.d.ts.map