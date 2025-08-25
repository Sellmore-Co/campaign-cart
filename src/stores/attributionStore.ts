/**
 * Attribution Store - Zustand store for tracking marketing attribution data
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Attribution } from '@/types/api';

export interface AttributionMetadata {
  landing_page: string;
  referrer: string;
  device: string;
  device_type: 'mobile' | 'desktop';
  domain: string;
  timestamp: number;
  conversion_timestamp?: number;
  sdk_version?: string;  // SDK version detected at runtime
  
  // Generic click tracking
  clickid?: string;
  
  // Facebook tracking
  fb_fbp?: string;
  fb_fbc?: string;
  fb_pixel_id?: string;
  fbclid?: string;
  
  // Everflow tracking
  everflow_transaction_id?: string;
  sg_evclid?: string;
  
  // Custom tracking tags
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

const initialState: AttributionState = {
  // Attribution fields
  affiliate: '',
  funnel: '',
  gclid: '',
  utm_source: '',
  utm_medium: '',
  utm_campaign: '',
  utm_content: '',
  utm_term: '',
  subaffiliate1: '',
  subaffiliate2: '',
  subaffiliate3: '',
  subaffiliate4: '',
  subaffiliate5: '',
  
  // Metadata
  metadata: {
    landing_page: '',
    referrer: '',
    device: '',
    device_type: 'desktop',
    domain: '',
    timestamp: Date.now()
  },
  
  // Timestamps
  first_visit_timestamp: Date.now(),
  current_visit_timestamp: Date.now()
};

export const useAttributionStore = create<AttributionState & AttributionActions>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      initialize: async () => {
        try {
          // Import collector dynamically to avoid circular dependencies
          const { AttributionCollector } = await import('@/utils/attribution/AttributionCollector');
          const collector = new AttributionCollector();
          const data = await collector.collect();
          
          set((state) => ({
            ...state,
            ...data,
            // Merge metadata to preserve custom fields
            metadata: {
              ...state.metadata,  // Preserve existing custom fields
              ...data.metadata    // Update with new collected data
            },
            // Preserve first visit timestamp if it exists
            first_visit_timestamp: state.first_visit_timestamp || data.first_visit_timestamp
          }));
        } catch (error) {
          console.error('[AttributionStore] Error initializing attribution:', error);
        }
      },
      
      updateAttribution: (data) => {
        set((state) => ({
          ...state,
          ...data,
          metadata: data.metadata ? { ...state.metadata, ...data.metadata } : state.metadata,
          current_visit_timestamp: Date.now()
        }));
      },
      
      setFunnelName: (funnel) => {
        if (!funnel) {
          console.warn('[AttributionStore] Cannot set empty funnel name');
          return;
        }
        
        const currentState = get();
        
        // Check if funnel is already set
        if (currentState.funnel) {
          console.info(`[AttributionStore] Funnel already set to: ${currentState.funnel}, ignoring new value: ${funnel}`);
          return;
        }
        
        // Also check persisted funnel
        const persistedFunnel = localStorage.getItem('next_funnel_name') || sessionStorage.getItem('next_funnel_name');
        if (persistedFunnel) {
          console.info(`[AttributionStore] Funnel already persisted as: ${persistedFunnel}, ignoring new value: ${funnel}`);
          // Update state to match persisted value
          set({ funnel: persistedFunnel });
          return;
        }
        
        // Set the new funnel
        set({ funnel });
        
        // Persist it
        try {
          sessionStorage.setItem('next_funnel_name', funnel);
          localStorage.setItem('next_funnel_name', funnel);
          console.info(`[AttributionStore] Funnel name set and persisted: ${funnel}`);
        } catch (error) {
          console.error('[AttributionStore] Error persisting funnel name:', error);
        }
      },
      
      setEverflowClickId: (evclid) => {
        if (!evclid) {
          console.warn('[AttributionStore] Cannot set empty Everflow click ID');
          return;
        }
        
        // Store in local/session storage
        localStorage.setItem('evclid', evclid);
        sessionStorage.setItem('evclid', evclid);
        
        // Update metadata
        set((state) => ({
          ...state,
          metadata: {
            ...state.metadata,
            everflow_transaction_id: evclid
          }
        }));
        
        console.info(`[AttributionStore] Everflow click ID set to: ${evclid}`);
      },
      
      getAttributionForApi: (): Attribution => {
        const state = get();
        
        // Return only the fields needed for API (exclude empty strings)
        const attribution: Attribution = {};
        
        if (state.affiliate && state.affiliate !== '') attribution.affiliate = state.affiliate;
        if (state.funnel && state.funnel !== '') attribution.funnel = state.funnel;
        if (state.gclid && state.gclid !== '') attribution.gclid = state.gclid;
        if (state.metadata !== undefined) attribution.metadata = state.metadata;
        if (state.utm_source && state.utm_source !== '') attribution.utm_source = state.utm_source;
        if (state.utm_medium && state.utm_medium !== '') attribution.utm_medium = state.utm_medium;
        if (state.utm_campaign && state.utm_campaign !== '') attribution.utm_campaign = state.utm_campaign;
        if (state.utm_content && state.utm_content !== '') attribution.utm_content = state.utm_content;
        if (state.utm_term && state.utm_term !== '') attribution.utm_term = state.utm_term;
        if (state.subaffiliate1 && state.subaffiliate1 !== '') attribution.subaffiliate1 = state.subaffiliate1;
        if (state.subaffiliate2 && state.subaffiliate2 !== '') attribution.subaffiliate2 = state.subaffiliate2;
        if (state.subaffiliate3 && state.subaffiliate3 !== '') attribution.subaffiliate3 = state.subaffiliate3;
        if (state.subaffiliate4 && state.subaffiliate4 !== '') attribution.subaffiliate4 = state.subaffiliate4;
        if (state.subaffiliate5 && state.subaffiliate5 !== '') attribution.subaffiliate5 = state.subaffiliate5;
        
        // Include everflow_transaction_id at root level if it exists
        if (state.metadata.everflow_transaction_id) {
          attribution.everflow_transaction_id = state.metadata.everflow_transaction_id;
        }
        
        return attribution;
      },
      
      debug: () => {
        const state = get();
        
        console.group('🔍 Attribution Debug Info');
        
        // Key attribution values
        console.log('📊 Key Attribution Values:');
        console.log('- Affiliate:', state.affiliate || '(not set)');
        console.log('- Funnel:', state.funnel || '(not set)');
        console.log('- GCLID:', state.gclid || '(not set)');
        
        // UTM parameters
        console.log('\n📈 UTM Parameters:');
        console.log('- Source:', state.utm_source || '(not set)');
        console.log('- Medium:', state.utm_medium || '(not set)');
        console.log('- Campaign:', state.utm_campaign || '(not set)');
        console.log('- Content:', state.utm_content || '(not set)');
        console.log('- Term:', state.utm_term || '(not set)');
        
        // Subaffiliates
        console.log('\n👥 Subaffiliates:');
        for (let i = 1; i <= 5; i++) {
          const key = `subaffiliate${i}` as keyof AttributionState;
          console.log(`- Subaffiliate ${i}:`, state[key] || '(not set)');
        }
        
        // Everflow
        console.log('\n🔄 Everflow:');
        console.log('- Transaction ID:', state.metadata.everflow_transaction_id || '(not set)');
        console.log('- SG EVCLID:', state.metadata.sg_evclid || '(not set)');
        console.log('- localStorage evclid:', localStorage.getItem('evclid') || '(not set)');
        console.log('- sessionStorage evclid:', sessionStorage.getItem('evclid') || '(not set)');
        
        // Facebook
        console.log('\n📘 Facebook:');
        console.log('- fbclid:', state.metadata.fbclid || '(not set)');
        console.log('- fb_fbp:', state.metadata.fb_fbp || '(not set)');
        console.log('- fb_fbc:', state.metadata.fb_fbc || '(not set)');
        console.log('- fb_pixel_id:', state.metadata.fb_pixel_id || '(not set)');
        
        // Generic Click ID
        console.log('\n🔗 Click Tracking:');
        console.log('- Click ID (metadata):', state.metadata.clickid || '(not set)');
        
        // Metadata
        console.log('\n📋 Metadata:');
        console.log('- SDK Version:', state.metadata.sdk_version || '(not set)');
        console.log('- Landing Page:', state.metadata.landing_page);
        console.log('- Referrer:', state.metadata.referrer || '(direct)');
        console.log('- Domain:', state.metadata.domain);
        console.log('- Device Type:', state.metadata.device_type);
        console.log('- First Visit:', new Date(state.first_visit_timestamp).toLocaleString());
        console.log('- Current Visit:', new Date(state.current_visit_timestamp).toLocaleString());
        if (state.metadata.conversion_timestamp) {
          console.log('- Conversion Time:', new Date(state.metadata.conversion_timestamp).toLocaleString());
        }
        
        // API format
        console.log('\n📤 API Format:');
        console.log(JSON.stringify(get().getAttributionForApi(), null, 2));
        
        // Current URL params
        console.log('\n🔗 Current URL Parameters:');
        console.log(window.location.search || '(none)');
        
        console.groupEnd();
        
        return 'Attribution debug info logged to console.';
      },
      
      reset: () => {
        set(initialState);
      },
      
      clearPersistedFunnel: () => {
        try {
          localStorage.removeItem('next_funnel_name');
          sessionStorage.removeItem('next_funnel_name');
          set({ funnel: '' });
          console.info('[AttributionStore] Cleared persisted funnel name');
        } catch (error) {
          console.error('[AttributionStore] Error clearing persisted funnel:', error);
        }
      }
    }),
    {
      name: 'next-attribution',
      storage: {
        getItem: (name) => {
          const str = sessionStorage.getItem(name);
          return str ? JSON.parse(str) : null;
        },
        setItem: (name, value) => {
          sessionStorage.setItem(name, JSON.stringify(value));
        },
        removeItem: (name) => {
          sessionStorage.removeItem(name);
        }
      }
    }
  )
);