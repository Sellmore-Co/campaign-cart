import { ProviderAdapter } from './ProviderAdapter';
import { DataLayerEvent } from '../types';

declare global {
    interface Window {
        dataLayer: any[];
    }
}
/**
 * Google Tag Manager adapter
 */
export declare class GTMAdapter extends ProviderAdapter {
    constructor();
    /**
     * Track event - called by DataLayerManager
     */
    trackEvent(event: DataLayerEvent): void;
    /**
     * Send event to Google Tag Manager
     */
    sendEvent(event: DataLayerEvent): void;
    /**
     * Transform event to GTM-specific format
     */
    private transformToGTMFormat;
    /**
     * Build ecommerce object structure for GTM
     */
    private buildEcommerceObject;
    /**
     * Format items array for GTM
     */
    private formatItems;
    /**
     * Check if event is an ecommerce event
     */
    private isEcommerceEvent;
    /**
     * Get standardized ecommerce event type
     */
    private getEcommerceEventType;
}
//# sourceMappingURL=GTMAdapter.d.ts.map