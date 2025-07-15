import { ProviderAdapter } from './ProviderAdapter';
import { DataLayerEvent } from '../types';

declare global {
    interface Window {
        rudderanalytics: {
            track: (event: string, properties?: any, options?: any) => void;
            page: (category?: string, name?: string, properties?: any, options?: any) => void;
            identify: (userId: string, traits?: any, options?: any) => void;
            reset: () => void;
            ready: (callback: () => void) => void;
        };
    }
}
/**
 * RudderStack Analytics adapter
 * Maps SDK events to RudderStack events matching the old integration format
 */
export declare class RudderStackAdapter extends ProviderAdapter {
    private pageViewSent;
    constructor();
    /**
     * Track event - called by DataLayerManager
     */
    trackEvent(event: DataLayerEvent): void;
    /**
     * Check if RudderStack is loaded
     */
    private isRudderStackLoaded;
    /**
     * Send event to RudderStack
     */
    sendEvent(event: DataLayerEvent): void;
    /**
     * Wait for RudderStack to be loaded
     */
    private waitForRudderStack;
    /**
     * Internal method to send event after RudderStack is confirmed loaded
     */
    private sendEventInternal;
    /**
     * Handle page view events
     */
    private handlePageView;
    /**
     * Handle user data events for identification
     */
    private handleUserData;
    /**
     * Map data layer event names to RudderStack event names
     */
    private mapEventName;
    /**
     * Build event properties based on event type
     */
    private buildEventProperties;
    /**
     * Build Product Viewed properties
     */
    private buildProductViewedProps;
    /**
     * Build Product List Viewed properties
     */
    private buildProductListViewedProps;
    /**
     * Build Product Added/Removed properties
     */
    private buildProductAddedRemovedProps;
    /**
     * Build Cart Viewed properties
     */
    private buildCartViewedProps;
    /**
     * Build Checkout Started properties
     */
    private buildCheckoutStartedProps;
    /**
     * Build Order Completed properties
     */
    private buildOrderCompletedProps;
    /**
     * Build Upsell properties
     */
    private buildUpsellProps;
    /**
     * Format products array to match old integration format
     */
    private formatProducts;
    /**
     * Get page metadata
     */
    private getPageMetadata;
    /**
     * Get campaign data from event or SDK
     */
    private getCampaignData;
}
//# sourceMappingURL=RudderStackAdapter.d.ts.map