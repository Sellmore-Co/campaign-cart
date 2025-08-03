/**
 * UTM Transfer Utility
 * Automatically adds current URL parameters to all links on the page
 */
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
    /**
     * Initialize the UTM transfer feature
     */
    init(): void;
    /**
     * Prepare parameters to apply based on configuration
     */
    private prepareParameters;
    /**
     * Enhance all existing links on the page
     */
    private enhanceLinks;
    /**
     * Add click listener to a link
     */
    private addClickListener;
    /**
     * Apply parameters to a specific link
     */
    applyParamsToLink(linkElement: HTMLAnchorElement): void;
    /**
     * Check if link should be skipped
     */
    private shouldSkipLink;
    /**
     * Check if link is external
     */
    private isExternalLink;
    /**
     * Check if domain is excluded
     */
    private isExcludedDomain;
    /**
     * Observe DOM for new links
     */
    private observeNewLinks;
    /**
     * Get current configuration
     */
    getConfig(): UtmTransferConfig;
    /**
     * Update configuration
     */
    updateConfig(config: Partial<UtmTransferConfig>): void;
}
//# sourceMappingURL=UtmTransfer.d.ts.map