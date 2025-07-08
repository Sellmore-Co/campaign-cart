import { Campaign, Package } from '../types/global';

interface CampaignState {
    data: Campaign | null;
    packages: Package[];
    isLoading: boolean;
    error: string | null;
}
interface CampaignActions {
    loadCampaign: (apiKey: string) => Promise<void>;
    getPackage: (id: number) => Package | null;
    getProduct: (id: number) => Package | null;
    setError: (error: string | null) => void;
    reset: () => void;
    clearCache: () => void;
    getCacheInfo: () => {
        cached: boolean;
        expiresIn?: number;
        apiKey?: string;
    } | null;
}
export declare const campaignStore: import('zustand').UseBoundStore<import('zustand').StoreApi<CampaignState & CampaignActions>>;
export declare const useCampaignStore: import('zustand').UseBoundStore<import('zustand').StoreApi<CampaignState & CampaignActions>>;
export {};
//# sourceMappingURL=campaignStore.d.ts.map