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
    addHandler(handler: DOMChangeHandler): void;
    removeHandler(handler: DOMChangeHandler): void;
    start(target?: Element): void;
    stop(): void;
    pause(): void;
    resume(target?: Element): void;
    isActive(): boolean;
    private handleMutations;
    private isRelevantMutation;
    private hasRelevantNodes;
    private hasRelevantAttributes;
    private hasRelevantDescendants;
    private processMutation;
    private processChildListMutation;
    private processAttributeMutation;
    private addElementForProcessing;
    private throttleNotifications;
    private processePendingChanges;
    private notifyHandlers;
    private clearThrottle;
    destroy(): void;
    getConfig(): DOMObserverConfig;
    updateConfig(newConfig: Partial<DOMObserverConfig>): void;
}
//# sourceMappingURL=DOMObserver.d.ts.map