import { BaseEnhancer } from '../base/BaseEnhancer';
export declare class ScrollHintEnhancer extends BaseEnhancer {
    private scrollTarget?;
    private scrollThreshold;
    private activeClass;
    private scrollHandler?;
    private resizeHandler?;
    private mutationObserver?;
    private rafId?;
    initialize(): Promise<void>;
    private findScrollTarget;
    private observeContentChanges;
    private scheduleUpdate;
    private hasScrollableContent;
    private updateScrollHint;
    private throttle;
    private debounce;
    update(): void;
    destroy(): void;
}
//# sourceMappingURL=ScrollHintEnhancer.d.ts.map