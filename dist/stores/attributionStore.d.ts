import { Attribution } from '../types/api';
export interface AttributionMetadata {
    landing_page: string;
    referrer: string;
    device: string;
    device_type: 'mobile' | 'desktop';
    domain: string;
    timestamp: number;
    conversion_timestamp?: number;
    sdk_version?: string;
    clickid?: string;
    fb_fbp?: string;
    fb_fbc?: string;
    fb_pixel_id?: string;
    fbclid?: string;
    everflow_transaction_id?: string;
    sg_evclid?: string;
    [key: string]: any;
}
export interface AttributionState extends Attribution {
    metadata: AttributionMetadata;
    first_visit_timestamp: number;
    current_visit_timestamp: number;
}
interface AttributionActions {
    initialize: () => Promise<void>;
    updateAttribution: (data: Partial<AttributionState>) => void;
    setFunnelName: (funnel: string) => void;
    setEverflowClickId: (evclid: string) => void;
    getAttributionForApi: () => Attribution;
    debug: () => void;
    reset: () => void;
    clearPersistedFunnel: () => void;
}
export declare const useAttributionStore: import('zustand').UseBoundStore<Omit<import('zustand').StoreApi<AttributionState & AttributionActions>, "persist"> & {
    persist: {
        setOptions: (options: Partial<import('zustand/middleware').PersistOptions<AttributionState & AttributionActions, AttributionState & AttributionActions>>) => void;
        clearStorage: () => void;
        rehydrate: () => Promise<void> | void;
        hasHydrated: () => boolean;
        onHydrate: (fn: (state: AttributionState & AttributionActions) => void) => () => void;
        onFinishHydration: (fn: (state: AttributionState & AttributionActions) => void) => () => void;
        getOptions: () => Partial<import('zustand/middleware').PersistOptions<AttributionState & AttributionActions, AttributionState & AttributionActions>>;
    };
}>;
export {};
//# sourceMappingURL=attributionStore.d.ts.map