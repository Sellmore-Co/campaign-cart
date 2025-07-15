import { ProviderAdapter } from './ProviderAdapter';
import { DataLayerEvent } from '../types';

declare global {
    interface Window {
        nextCampaign: {
            config: (options: {
                apiKey: string;
            }) => void;
            event: (eventName: string, eventData?: any) => void;
        };
    }
}
/**
 * NextCampaign Analytics adapter
 * Integrates with 29Next's campaign analytics platform
 */
export declare class NextCampaignAdapter extends ProviderAdapter {
    private logger;
    private scriptLoaded;
    private scriptLoading;
    private loadPromise;
    private apiKey;
    constructor();
    /**
     * Initialize the adapter with configuration
     */
    initialize(config?: any): Promise<void>;
    /**
     * Track event - called by DataLayerManager
     */
    trackEvent(event: DataLayerEvent): void;
    /**
     * Send event to NextCampaign
     */
    sendEvent(event: DataLayerEvent): Promise<void>;
    /**
     * Load the NextCampaign SDK script
     */
    private loadScript;
    /**
     * Perform the actual script loading
     */
    private performLoad;
    /**
     * Fire initial page view event on load
     */
    private fireInitialPageView;
    /**
     * Send page view event to NextCampaign
     */
    private sendPageView;
    /**
     * Wait for nextCampaign object to be available
     */
    private waitForNextCampaign;
    /**
     * Map DataLayer events to NextCampaign events
     * IMPORTANT: NextCampaign only tracks page_view events
     */
    private mapEvent;
}
//# sourceMappingURL=NextCampaignAdapter.d.ts.map