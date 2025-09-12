/**
 * Campaign Store - Zustand store for campaign data management
 */

import { create } from 'zustand';
import type { Campaign, Package, Product, VariantAttribute } from '@/types/global';
import { sessionStorageManager, CAMPAIGN_STORAGE_KEY } from '@/utils/storage';
import { createLogger } from '@/utils/logger';

// Cache expiry time: 5 minutes (300,000 milliseconds)
const CACHE_EXPIRY_MS = 5 * 60 * 1000;

const logger = createLogger('CampaignStore');

interface CachedCampaignData {
  campaign: Campaign;
  timestamp: number;
  apiKey: string; // Ensure cache is tied to specific API key
}

interface CampaignState {
  data: Campaign | null;
  packages: Package[];
  isLoading: boolean;
  error: string | null;
}

interface PricingTier {
  packageRefId: number;
  name: string;
  price: string;
  retailPrice?: string;
  quantity: number;
  tierType?: string; // e.g., "Buy 1", "Buy 2", "Subscription"
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
  attributeTypes: string[]; // e.g., ['color', 'size']
}

interface ProductVariantGroup {
  productId: number;
  productName: string;
  attributeTypes: string[]; // e.g., ['color', 'size']
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
  getCacheInfo: () => { cached: boolean; expiresIn?: number; apiKey?: string } | null;
  
  // New variant-related methods
  getVariantsByProductId: (productId: number) => VariantGroup | null;
  getAvailableVariantAttributes: (productId: number, attributeCode: string) => string[];
  getPackageByVariantSelection: (productId: number, selectedAttributes: Record<string, string>) => Package | null;
  processPackagesWithVariants: (packages: Package[]) => Package[];
  
  // Enhanced methods for pricing tiers
  getProductVariantsWithPricing: (productId: number) => ProductVariantGroup | null;
  getVariantPricingTiers: (productId: number, variantKey: string) => PricingTier[];
  getLowestPriceForVariant: (productId: number, variantKey: string) => PricingTier | null;
}

const initialState: CampaignState = {
  data: null,
  packages: [],
  isLoading: false,
  error: null,
};

const campaignStoreInstance = create<CampaignState & CampaignActions>((set, get) => ({
  ...initialState,

  processPackagesWithVariants: (packages: Package[]): Package[] => {
    // Process packages to organize product data cleanly
    return packages.map(pkg => {
      // If the package has the new variant fields, organize them into the Product structure
      if (pkg.product_id && pkg.product_variant_id) {
        const product: Product = {
          id: pkg.product_id,
          name: pkg.product_name || '',
          variant: {
            id: pkg.product_variant_id,
            name: pkg.product_variant_name || '',
            attributes: pkg.product_variant_attribute_values || [],
            sku: pkg.product_sku
          },
          purchase_availability: pkg.product_purchase_availability || 'available',
          inventory_availability: pkg.product_inventory_availability || 'untracked'
        };
        
        return {
          ...pkg,
          product
        };
      }
      return pkg;
    });
  },

  loadCampaign: async (apiKey: string) => {
    set({ isLoading: true, error: null });
    
    try {
      // Check for cached data first
      const cachedData = sessionStorageManager.get<CachedCampaignData>(CAMPAIGN_STORAGE_KEY);
      const now = Date.now();
      
      // Use cache if it exists, is for the same API key, and hasn't expired
      if (cachedData && 
          cachedData.apiKey === apiKey && 
          (now - cachedData.timestamp) < CACHE_EXPIRY_MS) {
        
        logger.info('🎯 Using cached campaign data (expires in ' + 
          Math.round((CACHE_EXPIRY_MS - (now - cachedData.timestamp)) / 1000) + ' seconds)');
        
        // Update config store with payment_env_key from cached data
        const { useConfigStore } = await import('./configStore');
        if (cachedData.campaign.payment_env_key) {
          useConfigStore.getState().setSpreedlyEnvironmentKey(cachedData.campaign.payment_env_key);
        }
        
        // Process packages with variant organization
        const processedPackages = get().processPackagesWithVariants(cachedData.campaign.packages);
        
        set({
          data: { ...cachedData.campaign, packages: processedPackages },
          packages: processedPackages,
          isLoading: false,
          error: null,
        });
        return;
      }
      
      // Cache miss or expired - fetch from API
      logger.info('🌐 Fetching fresh campaign data from API...');
      const { ApiClient } = await import('@/api/client');
      const client = new ApiClient(apiKey);
      
      const campaign = await client.getCampaigns();
      
      if (!campaign) {
        throw new Error('Campaign data not found');
      }
      
      // Update config store with payment_env_key from fresh data
      const { useConfigStore } = await import('./configStore');
      if (campaign.payment_env_key) {
        useConfigStore.getState().setSpreedlyEnvironmentKey(campaign.payment_env_key);
        logger.info('💳 Spreedly environment key updated from campaign API: ' + campaign.payment_env_key);
      }
      
      // Process packages with variant organization
      const processedPackages = get().processPackagesWithVariants(campaign.packages);
      
      // Cache the fresh data
      const cacheData: CachedCampaignData = {
        campaign: { ...campaign, packages: processedPackages },
        timestamp: now,
        apiKey
      };
      
      sessionStorageManager.set(CAMPAIGN_STORAGE_KEY, cacheData);
      logger.info('💾 Campaign data cached for 5 minutes');

      set({
        data: { ...campaign, packages: processedPackages },
        packages: processedPackages,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load campaign';
      set({
        data: null,
        packages: [],
        isLoading: false,
        error: errorMessage,
      });
      throw error;
    }
  },

  getPackage: (id: number) => {
    const { packages } = get();
    return packages.find(pkg => pkg.ref_id === id) ?? null;
  },

  getProduct: (id: number) => {
    // Alias for getPackage
    return get().getPackage(id);
  },

  setError: (error: string | null) => {
    set({ error });
  },

  reset: () => {
    set(initialState);
  },

  clearCache: () => {
    sessionStorageManager.remove(CAMPAIGN_STORAGE_KEY);
    logger.info('🗑️ Campaign cache cleared');
  },

  getCacheInfo: () => {
    const cachedData = sessionStorageManager.get<CachedCampaignData>(CAMPAIGN_STORAGE_KEY);
    if (!cachedData) {
      return { cached: false };
    }
    
    const now = Date.now();
    const timeLeft = CACHE_EXPIRY_MS - (now - cachedData.timestamp);
    
    return {
      cached: true,
      expiresIn: Math.max(0, Math.round(timeLeft / 1000)), // seconds until expiry
      apiKey: cachedData.apiKey
    };
  },

  getVariantsByProductId: (productId: number): VariantGroup | null => {
    const { packages } = get();
    
    // Filter packages by product ID
    const productPackages = packages.filter(pkg => pkg.product_id === productId);
    
    if (productPackages.length === 0) {
      return null;
    }
    
    // Get unique attribute types
    const attributeTypes = new Set<string>();
    productPackages.forEach(pkg => {
      pkg.product_variant_attribute_values?.forEach(attr => {
        attributeTypes.add(attr.code);
      });
    });
    
    // Build variant group
    const firstPackage = productPackages[0];
    return {
      productId,
      productName: firstPackage.product_name || '',
      attributeTypes: Array.from(attributeTypes),
      variants: productPackages.map(pkg => ({
        variantId: pkg.product_variant_id || 0,
        variantName: pkg.product_variant_name || '',
        packageRefId: pkg.ref_id,
        attributes: pkg.product_variant_attribute_values || [],
        sku: pkg.product_sku,
        price: pkg.price,
        availability: {
          purchase: pkg.product_purchase_availability || 'available',
          inventory: pkg.product_inventory_availability || 'untracked'
        }
      }))
    };
  },

  getAvailableVariantAttributes: (productId: number, attributeCode: string): string[] => {
    const variantGroup = get().getVariantsByProductId(productId);
    
    if (!variantGroup) {
      return [];
    }
    
    const values = new Set<string>();
    variantGroup.variants.forEach(variant => {
      const attribute = variant.attributes.find(attr => attr.code === attributeCode);
      if (attribute) {
        values.add(attribute.value);
      }
    });
    
    return Array.from(values).sort();
  },

  getPackageByVariantSelection: (productId: number, selectedAttributes: Record<string, string>): Package | null => {
    const { packages } = get();
    
    // Find package that matches all selected attributes
    return packages.find(pkg => {
      if (pkg.product_id !== productId) {
        return false;
      }
      
      // Check if all selected attributes match
      for (const [code, value] of Object.entries(selectedAttributes)) {
        const hasMatch = pkg.product_variant_attribute_values?.some(
          attr => attr.code === code && attr.value === value
        );
        
        if (!hasMatch) {
          return false;
        }
      }
      
      return true;
    }) ?? null;
  },

  getProductVariantsWithPricing: (productId: number): ProductVariantGroup | null => {
    const { packages } = get();
    
    // Filter packages by product ID
    const productPackages = packages.filter(pkg => pkg.product_id === productId);
    
    if (productPackages.length === 0) {
      return null;
    }
    
    // Group packages by variant (using variant attributes as key)
    const variantsMap = new Map<string, any>();
    const attributeTypes = new Set<string>();
    
    productPackages.forEach(pkg => {
      // Create a key from variant attributes
      const variantKey = pkg.product_variant_attribute_values
        ?.map(attr => `${attr.code}:${attr.value}`)
        .sort()
        .join('|') || '';
      
      // Track attribute types
      pkg.product_variant_attribute_values?.forEach(attr => {
        attributeTypes.add(attr.code);
      });
      
      if (!variantsMap.has(variantKey)) {
        variantsMap.set(variantKey, {
          variantId: pkg.product_variant_id || 0,
          variantName: pkg.product_variant_name || '',
          attributes: pkg.product_variant_attribute_values || [],
          sku: pkg.product_sku,
          availability: {
            purchase: pkg.product_purchase_availability || 'available',
            inventory: pkg.product_inventory_availability || 'untracked'
          },
          pricingTiers: []
        });
      }
      
      // Extract tier type from package name (e.g., "Buy 1", "Buy 2")
      const tierMatch = pkg.name.match(/^(Buy \d+|Subscribe)/i);
      const tierType = tierMatch ? tierMatch[1] : 'Standard';
      
      // Add pricing tier
      variantsMap.get(variantKey).pricingTiers.push({
        packageRefId: pkg.ref_id,
        name: pkg.name,
        price: pkg.price,
        retailPrice: pkg.price_retail,
        quantity: pkg.qty,
        tierType
      });
    });
    
    // Sort pricing tiers by price
    variantsMap.forEach(variant => {
      variant.pricingTiers.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
    });
    
    const firstPackage = productPackages[0];
    return {
      productId,
      productName: firstPackage.product_name || '',
      attributeTypes: Array.from(attributeTypes),
      variants: variantsMap
    };
  },

  getVariantPricingTiers: (productId: number, variantKey: string): PricingTier[] => {
    const productGroup = get().getProductVariantsWithPricing(productId);
    
    if (!productGroup) {
      return [];
    }
    
    const variant = productGroup.variants.get(variantKey);
    return variant ? variant.pricingTiers : [];
  },

  getLowestPriceForVariant: (productId: number, variantKey: string): PricingTier | null => {
    const pricingTiers = get().getVariantPricingTiers(productId, variantKey);
    
    if (pricingTiers.length === 0) {
      return null;
    }
    
    // Return the tier with the lowest price
    return pricingTiers.reduce((lowest, current) => 
      parseFloat(current.price) < parseFloat(lowest.price) ? current : lowest
    );
  },
}));

export const campaignStore = campaignStoreInstance;
export const useCampaignStore = campaignStoreInstance;