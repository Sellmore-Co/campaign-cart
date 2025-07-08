/**
 * Config Store - Zustand store for SDK configuration management
 */

import { create } from 'zustand';
import type { 
  ConfigState, 
  PageType, 
  PaymentConfig, 
  GoogleMapsConfig,
  AddressConfig,
  DiscountDefinition
} from '../types/global.js';

interface ConfigActions {
  loadFromMeta: () => void;
  loadFromWindow: () => void;
  updateConfig: (config: Partial<ConfigState>) => void;
  setSpreedlyEnvironmentKey: (key: string) => void;
  reset: () => void;
}

const initialState: ConfigState = {
  apiKey: '',
  campaignId: '',
  debug: false,
  pageType: 'product',
  // spreedlyEnvironmentKey: undefined, - omitted to avoid exactOptionalPropertyTypes issue
  paymentConfig: {},
  googleMapsConfig: {},
  addressConfig: {},
  
  // Additional configuration with enterprise defaults
  autoInit: true,
  rateLimit: 4,
  cacheTtl: 300,
  retryAttempts: 3,
  timeout: 10000,
  testMode: false,
  
  // API and performance settings
  maxRetries: 3,
  requestTimeout: 30000,
  enableAnalytics: true,
  enableDebugMode: false,
  
  // Environment and deployment settings
  environment: 'production',
  // version: undefined, - omitted
  // buildTimestamp: undefined, - omitted
  
  // Discount system
  discounts: {},
  
  // Attribution
  // utmTransfer: undefined, - omitted
  
  // Tracking configuration
  tracking: 'auto', // 'auto', 'manual', 'disabled'
  
  // Monitoring configuration (not set by default)
  // monitoring: undefined - omitted,
};

export const configStore = create<ConfigState & ConfigActions>((set, _get) => ({
  ...initialState as ConfigState,

  loadFromMeta: () => {
    if (typeof document === 'undefined') return;
    
    const updates: Partial<ConfigState> = {};
    
    // Load API key
    const apiKeyMeta = document.querySelector('meta[name="next-api-key"]');
    if (apiKeyMeta) {
      updates.apiKey = apiKeyMeta.getAttribute('content') ?? '';
    }
    
    // Load campaign ID
    const campaignIdMeta = document.querySelector('meta[name="next-campaign-id"]');
    if (campaignIdMeta) {
      updates.campaignId = campaignIdMeta.getAttribute('content') ?? '';
    }
    
    // Load debug flag
    const debugMeta = document.querySelector('meta[name="next-debug"]');
    if (debugMeta) {
      updates.debug = debugMeta.getAttribute('content') === 'true';
    }
    
    // Load page type
    const pageTypeMeta = document.querySelector('meta[name="next-page-type"]');
    if (pageTypeMeta) {
      updates.pageType = pageTypeMeta.getAttribute('content') as PageType;
    }
    
    // Load Spreedly environment key (fallback - campaign data takes precedence)
    const spreedlyKeyMeta = document.querySelector('meta[name="next-spreedly-key"]') || 
                           document.querySelector('meta[name="next-payment-env-key"]');
    if (spreedlyKeyMeta) {
      const spreedlyKey = spreedlyKeyMeta.getAttribute('content');
      if (spreedlyKey) {
        updates.spreedlyEnvironmentKey = spreedlyKey;
      }
    }
    
    
    if (Object.keys(updates).length > 0) {
      set(updates);
    }
  },

  loadFromWindow: () => {
    if (typeof window === 'undefined') return;
    
    const windowConfig = (window as any).nextConfig;
    if (!windowConfig || typeof windowConfig !== 'object') return;
    
    const updates: Partial<ConfigState> = {};
    
    if (typeof windowConfig.apiKey === 'string') {
      updates.apiKey = windowConfig.apiKey;
    }
    
    if (typeof windowConfig.campaignId === 'string') {
      updates.campaignId = windowConfig.campaignId;
    }
    
    if (typeof windowConfig.debug === 'boolean') {
      updates.debug = windowConfig.debug;
    }
    
    if (typeof windowConfig.pageType === 'string') {
      updates.pageType = windowConfig.pageType as PageType;
    }
    
    if (typeof windowConfig.spreedlyEnvironmentKey === 'string') {
      updates.spreedlyEnvironmentKey = windowConfig.spreedlyEnvironmentKey;
    }
    
    if (windowConfig.payment && typeof windowConfig.payment === 'object') {
      updates.paymentConfig = windowConfig.payment as PaymentConfig;
    }
    
    // Support both payment and paymentConfig for backwards compatibility
    if (windowConfig.paymentConfig && typeof windowConfig.paymentConfig === 'object') {
      updates.paymentConfig = windowConfig.paymentConfig as PaymentConfig;
    }
    
    if (windowConfig.googleMaps && typeof windowConfig.googleMaps === 'object') {
      updates.googleMapsConfig = windowConfig.googleMaps as GoogleMapsConfig;
    }
    
    // Load address config from window config
    if (windowConfig.addressConfig && typeof windowConfig.addressConfig === 'object') {
      updates.addressConfig = windowConfig.addressConfig as AddressConfig;
    }
    
    
    // Load discount definitions from window config
    if (windowConfig.discounts && typeof windowConfig.discounts === 'object') {
      updates.discounts = windowConfig.discounts as Record<string, DiscountDefinition>;
    }
    
    // Load tracking mode
    if (typeof windowConfig.tracking === 'string') {
      updates.tracking = windowConfig.tracking as 'auto' | 'manual' | 'disabled';
    }
    
    // Load analytics configuration
    if (windowConfig.analytics && typeof windowConfig.analytics === 'object') {
      updates.analytics = windowConfig.analytics;
    }
    
    // Load monitoring configuration (including Sentry)
    if (windowConfig.monitoring && typeof windowConfig.monitoring === 'object') {
      updates.monitoring = windowConfig.monitoring;
    }
    
    // Load UTM transfer configuration
    if (windowConfig.utmTransfer && typeof windowConfig.utmTransfer === 'object') {
      updates.utmTransfer = windowConfig.utmTransfer;
    }
    
    if (Object.keys(updates).length > 0) {
      set(updates);
    }
  },

  updateConfig: (config: Partial<ConfigState>) => {
    set(state => ({ ...state, ...config }));
  },


  setSpreedlyEnvironmentKey: (key: string) => {
    set({ spreedlyEnvironmentKey: key });
  },

  reset: () => {
    set(initialState);
  },
}));

export { configStore as useConfigStore };