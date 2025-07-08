import { BaseDisplayEnhancer } from './DisplayEnhancerCore';

export declare class SelectionDisplayEnhancer extends BaseDisplayEnhancer {
    private selectorId?;
    private selectedItem;
    private packageData?;
    private campaignState?;
    private selectionChangeHandler;
    initialize(): Promise<void>;
    protected parseDisplayAttributes(): void;
    private findSelectorIdFromContext;
    private findAssociatedSelector;
    protected setupStoreSubscriptions(): void;
    private handleCampaignUpdate;
    private handleSelectionChange;
    private loadPackageData;
    protected getPropertyValue(): any;
    private getSelectionPrice;
    private getSelectionTotal;
    private getSelectionCompareTotal;
    private getSelectionMetrics;
    private getSelectionSavingsAmount;
    private getSelectionSavingsPercentageFormatted;
    private getSelectionHasSavings;
    private getSelectionUnitPrice;
    private getSelectionTotalUnits;
    private getSelectionMonthlyPrice;
    private getSelectionYearlyPrice;
    private getSelectionPricePerDay;
    private getSelectionSavingsPerUnit;
    private getSelectionDiscountAmount;
    private getSelectionIsBundle;
    private parseCalculatedField;
    protected performInitialUpdate(): Promise<void>;
    protected updateDisplay(): Promise<void>;
    destroy(): void;
}
//# sourceMappingURL=SelectionDisplayEnhancer.d.ts.map