import { Campaign } from '../types/global';
import { Package, VariantAttribute } from '../types/campaign';
interface CampaignState {
    data: Campaign | null;
    packages: Package[];
    isLoading: boolean;
    error: string | null;
    isFromCache?: boolean;
    cacheAge?: number;
}
interface PricingTier {
    packageRefId: number;
    name: string;
    price: string;
    retailPrice?: string;
    quantity: number;
    tierType?: string;
}
interface VariantGroup {
    productId: number;
    productName: string;
    variants: Array<{
        variantId: number;
        variantName: string;
        packageRefId: number;
        attributes: VariantAttribute[];
        sku?: string | null;
        price: string;
        availability: {
            purchase: string;
            inventory: string;
        };
    }>;
    attributeTypes: string[];
}
interface ProductVariantGroup {
    productId: number;
    productName: string;
    attributeTypes: string[];
    variants: Map<string, {
        variantId: number;
        variantName: string;
        attributes: VariantAttribute[];
        sku?: string | null;
        availability: {
            purchase: string;
            inventory: string;
        };
        pricingTiers: PricingTier[];
    }>;
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
    getVariantsByProductId: (productId: number) => VariantGroup | null;
    getAvailableVariantAttributes: (productId: number, attributeCode: string) => string[];
    getPackageByVariantSelection: (productId: number, selectedAttributes: Record<string, string>) => Package | null;
    processPackagesWithVariants: (packages: Package[]) => Package[];
    getProductVariantsWithPricing: (productId: number) => ProductVariantGroup | null;
    getVariantPricingTiers: (productId: number, variantKey: string) => PricingTier[];
    getLowestPriceForVariant: (productId: number, variantKey: string) => PricingTier | null;
}
export declare const campaignStore: import('zustand').UseBoundStore<import('zustand').StoreApi<CampaignState & CampaignActions>>;
export declare const useCampaignStore: import('zustand').UseBoundStore<import('zustand').StoreApi<CampaignState & CampaignActions>>;
export {};
//# sourceMappingURL=campaignStore.d.ts.map