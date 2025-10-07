import { ProviderAdapter } from './ProviderAdapter';
import { DataLayerEvent } from '../types';
declare global {
    interface Window {
        dataLayer: any[];
        ElevarDataLayer?: any[];
        ElevarInvalidateContext?: () => void;
    }
}
export declare class GTMAdapter extends ProviderAdapter {
    constructor();
    trackEvent(event: DataLayerEvent): void;
    sendEvent(event: DataLayerEvent): void;
    private transformToGTMFormat;
    private buildEcommerceObject;
    private formatItems;
    private isEcommerceEvent;
    private getEcommerceEventType;
}
//# sourceMappingURL=GTMAdapter.d.ts.map