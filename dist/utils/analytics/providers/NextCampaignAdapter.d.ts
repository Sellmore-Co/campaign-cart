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
export declare class NextCampaignAdapter extends ProviderAdapter {
    private logger;
    private scriptLoaded;
    private scriptLoading;
    private loadPromise;
    private apiKey;
    constructor();
    initialize(config?: any): Promise<void>;
    trackEvent(event: DataLayerEvent): void;
    sendEvent(event: DataLayerEvent): Promise<void>;
    private loadScript;
    private performLoad;
    private fireInitialPageView;
    private sendPageView;
    private waitForNextCampaign;
    private mapEvent;
}
//# sourceMappingURL=NextCampaignAdapter.d.ts.map