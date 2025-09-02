/**
 * Campaign Store - Zustand store for campaign data management
 */

import { create } from 'zustand';
import type { Campaign, Package } from '@/types/global';
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

interface CampaignActions {
  loadCampaign: (apiKey: string) => Promise<void>;
  getPackage: (id: number) => Package | null;
  getProduct: (id: number) => Package | null;
  setError: (error: string | null) => void;
  reset: () => void;
  clearCache: () => void;
  getCacheInfo: () => { cached: boolean; expiresIn?: number; apiKey?: string } | null;
}

const initialState: CampaignState = {
  data: null,
  packages: [],
  isLoading: false,
  error: null,
};

const campaignStoreInstance = create<CampaignState & CampaignActions>((set, get) => ({
  ...initialState,

  loadCampaign: async (apiKey: string) => {
    set({ isLoading: true, error: null });
    
    try {
      // Get the selected currency from config store
      const { useConfigStore } = await import('./configStore');
      const configStore = useConfigStore.getState();
      const currency = configStore.selectedCurrency || configStore.detectedCurrency || 'USD';
      
      // Create cache key that includes currency
      const cacheKey = `${CAMPAIGN_STORAGE_KEY}_${currency}`;
      
      // Check for cached data first
      const cachedData = sessionStorageManager.get<CachedCampaignData>(cacheKey);
      const now = Date.now();
      
      // Use cache if it exists, is for the same API key and currency, and hasn't expired
      if (cachedData && 
          cachedData.apiKey === apiKey && 
          (now - cachedData.timestamp) < CACHE_EXPIRY_MS) {
        
        logger.info(`🎯 Using cached campaign data for ${currency} (expires in ` + 
          Math.round((CACHE_EXPIRY_MS - (now - cachedData.timestamp)) / 1000) + ' seconds)');
        
        // Update config store with payment_env_key from cached data
        if (cachedData.campaign.payment_env_key) {
          configStore.setSpreedlyEnvironmentKey(cachedData.campaign.payment_env_key);
        }
        
        set({
          data: cachedData.campaign,
          packages: cachedData.campaign.packages,
          isLoading: false,
          error: null,
        });
        return;
      }
      
      // Cache miss or expired - fetch from API
      logger.info(`🌐 Fetching fresh campaign data from API with currency: ${currency}...`);
      const { ApiClient } = await import('@/api/client');
      const client = new ApiClient(apiKey);
      
      const campaign = await client.getCampaigns(currency);
      
      if (!campaign) {
        throw new Error('Campaign data not found');
      }
      
      // Update config store with payment_env_key from fresh data
      if (campaign.payment_env_key) {
        configStore.setSpreedlyEnvironmentKey(campaign.payment_env_key);
        logger.info('💳 Spreedly environment key updated from campaign API: ' + campaign.payment_env_key);
      }
      
      // Cache the fresh data with currency-specific key
      const cacheData: CachedCampaignData = {
        campaign,
        timestamp: now,
        apiKey
      };
      
      sessionStorageManager.set(cacheKey, cacheData);
      logger.info(`💾 Campaign data cached for ${currency} (5 minutes)`);

      set({
        data: campaign,
        packages: campaign.packages,
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
    // Clear ALL campaign caches by removing any key that starts with the campaign storage prefix
    // This is more robust than maintaining a list of currencies
    try {
      const storage = window.sessionStorage;
      const keysToRemove: string[] = [];
      
      // Find all keys that start with our campaign storage prefix
      for (let i = 0; i < storage.length; i++) {
        const key = storage.key(i);
        if (key && (key.startsWith(CAMPAIGN_STORAGE_KEY) || key === CAMPAIGN_STORAGE_KEY)) {
          keysToRemove.push(key);
        }
      }
      
      // Remove all found keys
      keysToRemove.forEach(key => {
        sessionStorageManager.remove(key);
        logger.debug(`Removed cache: ${key}`);
      });
      
      logger.info(`🗑️ Campaign cache cleared (${keysToRemove.length} entries removed)`);
    } catch (error) {
      logger.error('Failed to clear campaign cache:', error);
      // Fallback to clearing known currencies
      const currencies = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'BRL', 'MXN', 'INR'];
      currencies.forEach(currency => {
        sessionStorageManager.remove(`${CAMPAIGN_STORAGE_KEY}_${currency}`);
      });
      sessionStorageManager.remove(CAMPAIGN_STORAGE_KEY);
    }
  },

  getCacheInfo: () => {
    // Get current currency from config
    const { useConfigStore } = require('./configStore');
    const configStore = useConfigStore.getState();
    const currency = configStore.selectedCurrency || configStore.detectedCurrency || 'USD';
    const cacheKey = `${CAMPAIGN_STORAGE_KEY}_${currency}`;
    
    const cachedData = sessionStorageManager.get<CachedCampaignData>(cacheKey);
    if (!cachedData) {
      return { cached: false };
    }
    
    const now = Date.now();
    const timeLeft = CACHE_EXPIRY_MS - (now - cachedData.timestamp);
    
    return {
      cached: true,
      expiresIn: Math.max(0, Math.round(timeLeft / 1000)), // seconds until expiry
      apiKey: cachedData.apiKey,
      currency: currency
    };
  },
}));

export const campaignStore = campaignStoreInstance;
export const useCampaignStore = campaignStoreInstance;