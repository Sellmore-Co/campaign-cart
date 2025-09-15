export declare class CountrySelector {
    private static instance;
    private container;
    private shadowRoot;
    private logger;
    private isChanging;
    private listenersAttached;
    private renderDebounceTimer;
    private hasInitiallyRendered;
    private countries;
    static getInstance(): CountrySelector;
    private constructor();
    initialize(): Promise<void>;
    private loadCountries;
    private createContainer;
    private render;
    private doRender;
    private setupEventListeners;
    private handleCountryChange;
    private showSuccessFeedback;
    private showErrorFeedback;
    destroy(): void;
    hide(): void;
    show(): void;
}
export declare const countrySelector: CountrySelector;
//# sourceMappingURL=CountrySelector.d.ts.map