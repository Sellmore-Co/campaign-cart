import { BaseDisplayEnhancer } from './DisplayEnhancerCore';
export declare class ShippingDisplayEnhancer extends BaseDisplayEnhancer {
    private shippingId?;
    private shippingMethod?;
    initialize(): Promise<void>;
    protected setupStoreSubscriptions(): void;
    private handleCampaignUpdate;
    private detectShippingContext;
    private loadShippingMethod;
    protected getPropertyValue(): any;
    private getCalculatedProperty;
    update(): void;
}
//# sourceMappingURL=ShippingDisplayEnhancer.d.ts.map