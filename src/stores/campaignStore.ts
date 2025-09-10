/**
 * Campaign Store - Zustand store for campaign data management
 */

import { create } from 'zustand';
import type { Campaign, Package } from '@/types/global';
import { sessionStorageManager, CAMPAIGN_STORAGE_KEY } from '@/utils/storage';
import { createLogger } from '@/utils/logger';

// Cache expiry time: 10 minutes (600,000 milliseconds)
const CACHE_EXPIRY_MS = 10 * 60 * 1000;

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
  isFromCache?: boolean;
  cacheAge?: number;
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
      const requestedCurrency = configStore.selectedCurrency || configStore.detectedCurrency || 'USD';
      
      const now = Date.now();
      
      // IMPROVED: Check cache for BOTH requested and potential fallback currencies
      const requestedCacheKey = `${CAMPAIGN_STORAGE_KEY}_${requestedCurrency}`;
      const fallbackCacheKey = `${CAMPAIGN_STORAGE_KEY}_USD`;
      
      // Check if URL parameter is forcing a specific currency
      const urlParams = new URLSearchParams(window.location.search);
      const urlCurrency = urlParams.get('currency');
      const isUrlCurrencyOverride = urlCurrency && urlCurrency === requestedCurrency;
      
      // Try requested currency cache first
      let cachedData = sessionStorageManager.get<CachedCampaignData>(requestedCacheKey);
      
      // If not found and requested isn't USD, check USD cache (common fallback)
      // BUT skip fallback if URL is explicitly requesting a currency
      if (!cachedData && requestedCurrency !== 'USD' && !isUrlCurrencyOverride) {
        cachedData = sessionStorageManager.get<CachedCampaignData>(fallbackCacheKey);
        
        if (cachedData) {
          logger.info(`No cache for ${requestedCurrency}, checking USD cache as potential fallback`);
        }
      }
      
      // Use cache if valid, but skip cache if URL is forcing a different currency
      if (cachedData && 
          cachedData.apiKey === apiKey && 
          (now - cachedData.timestamp) < CACHE_EXPIRY_MS &&
          (!isUrlCurrencyOverride || cachedData.campaign.currency === requestedCurrency)) {
        
        const cachedCurrency = cachedData.campaign.currency;
        logger.info(`🎯 Using cached campaign data for ${cachedCurrency} (expires in ` + 
          Math.round((CACHE_EXPIRY_MS - (now - cachedData.timestamp)) / 1000) + ' seconds)');
        
        // IMPORTANT: Sync config if cached currency differs from requested
        if (cachedCurrency !== requestedCurrency) {
          logger.warn(`⚠️ Requested ${requestedCurrency} but using cached ${cachedCurrency} (fallback)`);
          
          // Update config to reflect reality
          configStore.updateConfig({ 
            selectedCurrency: cachedCurrency,
            currencyFallbackOccurred: true 
          });
          
          // Update session storage to maintain consistency
          sessionStorage.setItem('next_selected_currency', cachedCurrency);
          
          // Emit event for UI notification
          const { EventBus } = await import('@/utils/events');
          EventBus.getInstance().emit('currency:fallback', {
            requested: requestedCurrency,
            actual: cachedCurrency,
            reason: 'cached'
          });
        }
        
        // Update payment key
        if (cachedData.campaign.payment_env_key) {
          configStore.setSpreedlyEnvironmentKey(cachedData.campaign.payment_env_key);
        }
        
        set({
          data: cachedData.campaign,
          packages: cachedData.campaign.packages,
          isLoading: false,
          error: null,
          isFromCache: true,
          cacheAge: now - cachedData.timestamp
        });
        return;
      }
      
      // If URL is forcing a currency, log it
      if (isUrlCurrencyOverride && cachedData?.campaign.currency !== requestedCurrency) {
        logger.info(`🔄 URL parameter forcing fresh fetch for currency: ${requestedCurrency} (cache had ${cachedData?.campaign.currency || 'none'})`);
      }
      
      // Cache miss or expired - fetch from API
      logger.info(`🌐 Fetching campaign data from API with currency: ${requestedCurrency}...`);
      const { ApiClient } = await import('@/api/client');
      const client = new ApiClient(apiKey);
      
      // API now handles currency fallback automatically
      const campaign = await client.getCampaigns(requestedCurrency);
      
      if (!campaign) {
        throw new Error('Campaign data not found');
      }
      
      // Check actual currency returned
      const actualCurrency = campaign.currency || requestedCurrency;
      
      // Handle fallback scenario
      if (actualCurrency !== requestedCurrency) {
        logger.warn(`⚠️ API Fallback: Requested ${requestedCurrency}, received ${actualCurrency}`);
        
        // Update config to reflect actual currency
        configStore.updateConfig({ 
          selectedCurrency: actualCurrency,
          currencyFallbackOccurred: true
        });
        
        // Update session storage to prevent confusion
        sessionStorage.setItem('next_selected_currency', actualCurrency);
        
        // Emit event for UI notification
        const { EventBus } = await import('@/utils/events');
        EventBus.getInstance().emit('currency:fallback', {
          requested: requestedCurrency,
          actual: actualCurrency,
          reason: 'api'
        });
      } else {
        // Clear fallback flag if currency matches
        configStore.updateConfig({ 
          currencyFallbackOccurred: false 
        });
      }
      
      // Update payment key
      if (campaign.payment_env_key) {
        configStore.setSpreedlyEnvironmentKey(campaign.payment_env_key);
        logger.info('💳 Spreedly environment key updated from campaign API: ' + campaign.payment_env_key);
      }
      
      // Cache with ACTUAL currency key
      const actualCacheKey = `${CAMPAIGN_STORAGE_KEY}_${actualCurrency}`;
      const cacheData: CachedCampaignData = {
        campaign,
        timestamp: now,
        apiKey
      };
      
      sessionStorageManager.set(actualCacheKey, cacheData);
      logger.info(`💾 Campaign data cached for ${actualCurrency} (10 minutes)`);
      
      // Also clear conflicting cache if fallback occurred
      if (actualCurrency !== requestedCurrency) {
        sessionStorage.removeItem(requestedCacheKey);
        logger.debug(`Cleared invalid cache for ${requestedCurrency}`);
      }
      
      set({
        data: campaign,
        packages: campaign.packages,
        isLoading: false,
        error: null,
        isFromCache: false,
        cacheAge: 0
      });
      
      // Check if cart needs price refresh due to currency change
      const { useCartStore } = await import('./cartStore');
      const cartStore = useCartStore.getState();
      if (!cartStore.isEmpty && cartStore.lastCurrency && cartStore.lastCurrency !== actualCurrency) {
        logger.info('Currency changed, refreshing cart prices...');
        await cartStore.refreshItemPrices();
        cartStore.setLastCurrency(actualCurrency);
      } else if (!cartStore.lastCurrency) {
        // Set initial currency
        cartStore.setLastCurrency(actualCurrency);
      }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load campaign';
      set({
        data: null,
        packages: [],
        isLoading: false,
        error: errorMessage,
      });
      logger.error('Campaign load failed:', error);
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