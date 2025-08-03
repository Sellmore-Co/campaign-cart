export interface UtmTransferConfig {
    enabled: boolean;
    applyToExternalLinks?: boolean;
    excludedDomains?: string[];
    paramsToCopy?: string[];
    debug?: boolean;
}
export declare class UtmTransfer {
    private config;
    private paramsToApply;
    constructor(config?: Partial<UtmTransferConfig>);
    init(): void;
    private prepareParameters;
    private enhanceLinks;
    private addClickListener;
    applyParamsToLink(linkElement: HTMLAnchorElement): void;
    private shouldSkipLink;
    private isExternalLink;
    private isExcludedDomain;
    private observeNewLinks;
    getConfig(): UtmTransferConfig;
    updateConfig(config: Partial<UtmTransferConfig>): void;
}
//# sourceMappingURL=UtmTransfer.d.ts.map