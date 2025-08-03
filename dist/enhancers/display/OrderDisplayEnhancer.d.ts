import { BaseDisplayEnhancer } from './DisplayEnhancerCore';
export declare class OrderDisplayEnhancer extends BaseDisplayEnhancer {
    private apiClient?;
    private orderState;
    initialize(): Promise<void>;
    protected setupStoreSubscriptions(): void;
    protected getPropertyValue(): any;
    update(data?: any): void;
    private checkAndLoadOrderFromUrl;
    private handleOrderUpdate;
    protected updateElementContent(value: string): void;
    private getDisplayValue;
    private getOrderUserProperty;
    private getOrderAddressProperty;
    private getOrderLinesProperty;
    private getOrderLineProperty;
    private getOrderAttributionProperty;
    private formatAddress;
    private isComplexOrderProperty;
    private getCalculatedProperty;
}
//# sourceMappingURL=OrderDisplayEnhancer.d.ts.map