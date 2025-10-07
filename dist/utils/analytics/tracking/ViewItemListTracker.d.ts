export declare class ViewItemListTracker {
    private static instance;
    private observer;
    private trackedProducts;
    private lastScanTime;
    private scanDebounceMs;
    private isInitialized;
    private constructor();
    static getInstance(): ViewItemListTracker;
    initialize(): void;
    scan(): void;
    rescan(): void;
    private findProductElements;
    private trackSelectedItemInSelectors;
    private trackViewItemForSelected;
    private trackViewItem;
    private trackViewItemList;
    private setupObserver;
    reset(): void;
    destroy(): void;
    getStatus(): {
        initialized: boolean;
        trackedCount: number;
        observing: boolean;
    };
}
export declare const viewItemListTracker: ViewItemListTracker;
//# sourceMappingURL=ViewItemListTracker.d.ts.map