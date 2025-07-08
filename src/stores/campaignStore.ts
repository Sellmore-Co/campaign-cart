/**
 * Campaign Store - Zustand store for campaign data management
 */

import { create } from 'zustand';
import type { Campaign, Package } from '@/types/global';
import { sessionStorageManager, CAMPAIGN_STORAGE_KEY } from '@/utils/storage';

// Cache expiry time: 5 minutes (300,000 milliseconds)
const CACHE_EXPIRY_MS = 5 * 60 * 1000;

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
      // Check for cached data first
      const cachedData = sessionStorageManager.get<CachedCampaignData>(CAMPAIGN_STORAGE_KEY);
      const now = Date.now();
      
      // Use cache if it exists, is for the same API key, and hasn't expired
      if (cachedData && 
          cachedData.apiKey === apiKey && 
          (now - cachedData.timestamp) < CACHE_EXPIRY_MS) {
        
        console.log('🎯 Using cached campaign data (expires in', 
          Math.round((CACHE_EXPIRY_MS - (now - cachedData.timestamp)) / 1000), 'seconds)');
        
        // Update config store with payment_env_key from cached data
        const { useConfigStore } = await import('./configStore');
        if (cachedData.campaign.payment_env_key) {
          useConfigStore.getState().setSpreedlyEnvironmentKey(cachedData.campaign.payment_env_key);
          console.log('💳 Spreedly environment key updated from cached campaign data');
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
      console.log('🌐 Fetching fresh campaign data from API...');
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
        console.log('💳 Spreedly environment key updated from campaign API:', campaign.payment_env_key);
      }
      
      // Cache the fresh data
      const cacheData: CachedCampaignData = {
        campaign,
        timestamp: now,
        apiKey
      };
      
      sessionStorageManager.set(CAMPAIGN_STORAGE_KEY, cacheData);
      console.log('💾 Campaign data cached for 5 minutes');

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
    sessionStorageManager.remove(CAMPAIGN_STORAGE_KEY);
    console.log('🗑️ Campaign cache cleared');
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
}));

export const campaignStore = campaignStoreInstance;
export const useCampaignStore = campaignStoreInstance;