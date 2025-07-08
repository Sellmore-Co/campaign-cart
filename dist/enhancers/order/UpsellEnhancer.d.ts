import { BaseEnhancer } from '../base/BaseEnhancer';

export declare class UpsellEnhancer extends BaseEnhancer {
    private static pageViewTracked;
    private static currentPagePath;
    private apiClient;
    private packageId?;
    private quantity;
    private actionButtons;
    private clickHandler?;
    private isSelector;
    private selectorId?;
    private options;
    private selectedPackageId?;
    private currentPagePath?;
    initialize(): Promise<void>;
    private trackUpsellPageView;
    private initializeSelectorMode;
    private selectOption;
    private scanUpsellElements;
    private updateQuantityDisplay;
    private updateQuantityToggles;
    private setupEventHandlers;
    private handleActionClick;
    private addUpsellToOrder;
    private skipUpsell;
    /**
     * Navigate to a URL, preserving ref_id and debug parameters
     * @param url - The URL to navigate to
     * @param refId - Optional ref_id to preserve (defaults to current order ref_id)
     */
    private navigateToUrl;
    private handleOrderUpdate;
    private updateUpsellDisplay;
    private setProcessingState;
    private disableActions;
    private enableActions;
    private showUpsellOffer;
    private hideUpsellOffer;
    private showSuccess;
    private showError;
    update(): void;
    protected cleanupEventListeners(): void;
    destroy(): void;
}
//# sourceMappingURL=UpsellEnhancer.d.ts.map