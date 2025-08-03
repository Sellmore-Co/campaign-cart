import { ProviderAdapter } from './ProviderAdapter';
import { DataLayerEvent } from '../types';
declare global {
    interface Window {
        fbq: (command: string, event: string, parameters?: any) => void;
    }
}
/**
 * Facebook Pixel adapter
 */
export declare class FacebookAdapter extends ProviderAdapter {
    private blockedEvents;
    private eventMapping;
    constructor(config?: any);
    /**
     * Track event - called by DataLayerManager
     */
    trackEvent(event: DataLayerEvent): void;
    /**
     * Check if Facebook Pixel is loaded
     */
    private isFbqLoaded;
    /**
     * Send event to Facebook Pixel
     */
    sendEvent(event: DataLayerEvent): void;
    /**
     * Wait for Facebook Pixel to be loaded
     */
    private waitForFbq;
    /**
     * Internal method to send event after fbq is confirmed loaded
     */
    private sendEventInternal;
    /**
     * Map data layer event name to Facebook event name
     */
    private mapEventName;
    /**
     * Transform event parameters for Facebook Pixel
     */
    private transformParameters;
    /**
     * Build ViewContent parameters
     */
    private buildViewContentParams;
    /**
     * Build AddToCart/RemoveFromCart parameters
     */
    private buildAddToCartParams;
    /**
     * Build InitiateCheckout parameters
     */
    private buildCheckoutParams;
    /**
     * Build Purchase parameters
     */
    private buildPurchaseParams;
    /**
     * Build Search parameters
     */
    private buildSearchParams;
    /**
     * Build Registration parameters
     */
    private buildRegistrationParams;
    /**
     * Build Upsell parameters
     */
    private buildUpsellParams;
    /**
     * Build generic parameters for other events
     */
    private buildGenericParams;
}
//# sourceMappingURL=FacebookAdapter.d.ts.map