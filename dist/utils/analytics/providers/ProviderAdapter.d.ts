import { DataLayerEvent } from '../types';
export declare abstract class ProviderAdapter {
    protected name: string;
    protected enabled: boolean;
    constructor(name: string);
    setEnabled(enabled: boolean): void;
    isEnabled(): boolean;
    trackEvent(event: DataLayerEvent): void;
    abstract sendEvent(event: DataLayerEvent): void;
    protected transformEvent(event: DataLayerEvent): any;
    protected debug(message: string, data?: any): void;
    protected isBrowser(): boolean;
    protected getNestedProperty(obj: any, path: string): any;
    protected formatCurrency(value: number): string;
    protected extractEcommerceData(event: DataLayerEvent): any;
}
//# sourceMappingURL=ProviderAdapter.d.ts.map