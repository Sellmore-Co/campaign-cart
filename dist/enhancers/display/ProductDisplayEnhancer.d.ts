import { BaseDisplayEnhancer } from './DisplayEnhancerCore';

export declare class ProductDisplayEnhancer extends BaseDisplayEnhancer {
    private campaignState?;
    private packageId?;
    private contextPackageId?;
    private packageData?;
    initialize(): Promise<void>;
    protected setupStoreSubscriptions(): void;
    private handleCampaignUpdate;
    private detectPackageContext;
    private loadPackageData;
    protected getPropertyValue(): any;
    protected updateElementContent(value: string): void;
    protected hideElement(): void;
    protected showElement(): void;
    update(data?: any): void;
    private getCalculatedProperty;
    private getPackageValue;
    private getCampaignProperty;
    getPackageProperty(property: string): any;
    setPackageContext(packageId: number): void;
}
//# sourceMappingURL=ProductDisplayEnhancer.d.ts.map