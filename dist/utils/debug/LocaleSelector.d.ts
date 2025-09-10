export declare class LocaleSelector {
    private static instance;
    private container;
    private shadowRoot;
    private logger;
    private isChanging;
    private listenersAttached;
    private renderDebounceTimer;
    private hasInitiallyRendered;
    private locales;
    static getInstance(): LocaleSelector;
    private constructor();
    initialize(): void;
    private createContainer;
    private getCurrentLocale;
    private render;
    private doRender;
    private setupEventListeners;
    private handleLocaleChange;
    private refreshAllCurrencyDisplays;
    private logFormatExamples;
    private showSuccessFeedback;
    private showErrorFeedback;
    destroy(): void;
    hide(): void;
    show(): void;
}
export declare const localeSelector: LocaleSelector;
//# sourceMappingURL=LocaleSelector.d.ts.map