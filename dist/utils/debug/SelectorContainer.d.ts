export declare class SelectorContainer {
    private static instance;
    private container;
    static getInstance(): SelectorContainer;
    private constructor();
    initialize(): void;
    private createContainer;
    private moveSelectorsToContainer;
    private setupPanelListener;
    private updatePosition;
    destroy(): void;
}
export declare const selectorContainer: SelectorContainer;
//# sourceMappingURL=SelectorContainer.d.ts.map