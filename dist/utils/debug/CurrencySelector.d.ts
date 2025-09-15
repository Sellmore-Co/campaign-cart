export declare class CurrencySelector {
    private static instance;
    private container;
    private shadowRoot;
    private logger;
    private isChanging;
    private listenersAttached;
    private renderDebounceTimer;
    private hasInitiallyRendered;
    static getInstance(): CurrencySelector;
    private constructor();
    initialize(): void;
    private setupStoreSubscriptions;
    private createContainer;
    private getAvailableCurrencies;
    private render;
    private doRender;
    private setupEventListeners;
    private handleCurrencyChange;
    private showSuccessFeedback;
    private showErrorFeedback;
    destroy(): void;
    hide(): void;
    show(): void;
}
export declare const currencySelector: CurrencySelector;
//# sourceMappingURL=CurrencySelector.d.ts.map