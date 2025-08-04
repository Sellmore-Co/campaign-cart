export declare class AttributeScanner {
    private logger;
    private enhancers;
    private enhancerCount;
    private domObserver;
    private isScanning;
    private scanQueue;
    private enhancerStats;
    private isDebugMode;
    constructor();
    scanAndEnhance(root: Element): Promise<void>;
    private enhanceElement;
    private createEnhancer;
    private startObserving;
    private handleDOMChange;
    private queueElementForEnhancement;
    private processQueueDebounced;
    private processQueue;
    private debounce;
    private cleanupElement;
    destroy(): void;
    pause(): void;
    resume(root?: Element): void;
    private updateEnhancerStats;
    private showPerformanceReport;
    getStats(): {
        enhancedElements: number;
        queuedElements: number;
        isObserving: boolean;
        isScanning: boolean;
        performanceStats?: Record<string, {
            totalTime: number;
            averageTime: number;
            count: number;
        }>;
    };
}
//# sourceMappingURL=AttributeScanner.d.ts.map