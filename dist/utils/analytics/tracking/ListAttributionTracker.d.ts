export declare class ListAttributionTracker {
    private static instance;
    private currentList;
    private constructor();
    static getInstance(): ListAttributionTracker;
    initialize(): void;
    setCurrentList(listId?: string, listName?: string): void;
    getCurrentList(): {
        listId?: string;
        listName?: string;
    } | null;
    clearCurrentList(): void;
    reset(): void;
    detectListFromUrl(url?: string): {
        listId?: string;
        listName?: string;
    } | null;
    private setupUrlTracking;
    private trackCurrentUrl;
    private isProductPage;
    private formatListName;
    private loadFromStorage;
    private saveToStorage;
    private removeFromStorage;
}
export declare const listAttributionTracker: ListAttributionTracker;
//# sourceMappingURL=ListAttributionTracker.d.ts.map