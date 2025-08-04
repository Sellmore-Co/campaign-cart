import { ProviderAdapter } from './ProviderAdapter';
import { DataLayerEvent } from '../types';
declare global {
    interface Window {
        fbq: (command: string, event: string, parameters?: any) => void;
    }
}
export declare class FacebookAdapter extends ProviderAdapter {
    private blockedEvents;
    private storeName?;
    private eventMapping;
    constructor(config?: any);
    trackEvent(event: DataLayerEvent): void;
    private isFbqLoaded;
    sendEvent(event: DataLayerEvent): void;
    private waitForFbq;
    private sendEventInternal;
    private mapEventName;
    private transformParameters;
    private buildViewContentParams;
    private buildAddToCartParams;
    private buildCheckoutParams;
    private buildPurchaseParams;
    private buildSearchParams;
    private buildRegistrationParams;
    private buildUpsellParams;
    private buildGenericParams;
}
//# sourceMappingURL=FacebookAdapter.d.ts.map