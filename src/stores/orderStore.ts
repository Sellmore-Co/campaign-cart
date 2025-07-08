/**
 * Order Store
 * Manages order data and upsell functionality
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { Order, AddUpsellLine } from '@/types/api';
import { createLogger } from '@/utils/logger';

export interface OrderState {
  // Current order data
  order: Order | null;
  refId: string | null;
  orderLoadedAt: number | null; // Timestamp when order was loaded
  
  // Loading states
  isLoading: boolean;
  isProcessingUpsell: boolean;
  
  // Error handling
  error: string | null;
  upsellError: string | null;
  
  // Upsell tracking
  pendingUpsells: AddUpsellLine[];
  completedUpsells: string[]; // Array of package IDs that were successfully added (deprecated)
  completedUpsellPages: string[]; // Array of page paths where upsells were accepted
  viewedUpsells: string[]; // Array of package IDs that were viewed (deprecated)
  viewedUpsellPages: string[]; // Array of page paths that were viewed
  upsellJourney: Array<{ // Track the upsell journey
    packageId?: string;
    pagePath?: string;
    action: 'viewed' | 'accepted' | 'skipped';
    timestamp: number;
  }>;
}

export interface OrderActions {
  // Order management
  setOrder: (order: Order) => void;
  setRefId: (refId: string) => void;
  loadOrder: (refId: string, apiClient: any) => Promise<void>;
  clearOrder: () => void;
  isOrderExpired: () => boolean;
  
  // Upsell management
  addUpsell: (upsellData: AddUpsellLine, apiClient: any) => Promise<Order | null>;
  addPendingUpsell: (upsellData: AddUpsellLine) => void;
  removePendingUpsell: (index: number) => void;
  clearPendingUpsells: () => void;
  markUpsellCompleted: (packageId: string) => void;
  markUpsellViewed: (packageId: string) => void;
  markUpsellPageViewed: (pagePath: string) => void;
  markUpsellSkipped: (packageId: string, pagePath?: string) => void;
  
  // Error handling
  setError: (error: string | null) => void;
  setUpsellError: (error: string | null) => void;
  clearErrors: () => void;
  
  // Loading states
  setLoading: (loading: boolean) => void;
  setProcessingUpsell: (processing: boolean) => void;
  
  // Utility methods
  hasUpsellPageBeenCompleted: (pagePath: string) => boolean;
  hasUpsellBeenViewed: (packageId: string) => boolean;
  hasUpsellPageBeenViewed: (pagePath: string) => boolean;
  getOrderTotal: () => number;
  canAddUpsells: () => boolean;
  getUpsellJourney: () => any[];
  reset: () => void;
}

const logger = createLogger('OrderStore');

const initialState: OrderState = {
  order: null,
  refId: null,
  orderLoadedAt: null,
  isLoading: false,
  isProcessingUpsell: false,
  error: null,
  upsellError: null,
  pendingUpsells: [],
  completedUpsells: [],
  completedUpsellPages: [],
  viewedUpsells: [],
  viewedUpsellPages: [],
  upsellJourney: [],
};

export const useOrderStore = create<OrderState & OrderActions>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

      // Order management
      setOrder: (order) => {
        logger.debug('Setting order data:', order);
        set({ 
          order, 
          error: null,
          orderLoadedAt: Date.now() 
        });
      },

      setRefId: (refId) => {
        logger.debug('Setting ref ID:', refId);
        set({ refId });
      },

      loadOrder: async (refId, apiClient) => {
        const state = get();
        
        // Check if we already have this order and it's not expired
        if (state.order && state.refId === refId && !get().isOrderExpired()) {
          logger.info('Using cached order data:', refId);
          return;
        }
        
        if (state.isLoading) {
          logger.warn('Order loading already in progress');
          return;
        }

        logger.info('Loading order:', refId);
        set({ isLoading: true, error: null, refId });

        try {
          const order = await apiClient.getOrder(refId);
          logger.info('Order loaded successfully:', order);
          
          // Extract upsell package IDs from order lines
          const upsellPackageIds: string[] = [];
          if (order.lines && Array.isArray(order.lines)) {
            order.lines.forEach((line: any) => {
              if (line.is_upsell && line.product_sku) {
                // Try to extract package ID from product_sku
                // Common patterns: "package_123", "pkg_123", "123", etc.
                const skuMatch = line.product_sku.match(/(\d+)/);
                if (skuMatch) {
                  upsellPackageIds.push(skuMatch[1]);
                } else {
                  // Fallback: use the full SKU as identifier
                  upsellPackageIds.push(line.product_sku);
                }
                logger.debug('Detected upsell line:', { 
                  sku: line.product_sku, 
                  title: line.product_title,
                  extractedId: skuMatch ? skuMatch[1] : line.product_sku 
                });
              }
            });
          }
          
          set({ 
            order, 
            isLoading: false,
            isProcessingUpsell: false, // Reset processing state when loading order
            error: null,
            orderLoadedAt: Date.now(),
            completedUpsells: upsellPackageIds,
            // Reset journey when loading a new order
            upsellJourney: [],
            viewedUpsells: [],
            viewedUpsellPages: []
          });
          
          logger.debug('Populated completed upsells from order:', upsellPackageIds);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to load order';
          logger.error('Failed to load order:', error);
          
          set({ 
            isLoading: false, 
            error: errorMessage,
            order: null
          });
        }
      },

      clearOrder: () => {
        logger.debug('Clearing order data');
        set({ 
          order: null, 
          refId: null, 
          error: null,
          orderLoadedAt: null 
        });
      },
      
      isOrderExpired: () => {
        const state = get();
        if (!state.orderLoadedAt) return true;
        
        // Order expires after 15 minutes
        const EXPIRY_TIME = 15 * 60 * 1000; // 15 minutes in milliseconds
        const now = Date.now();
        const isExpired = (now - state.orderLoadedAt) > EXPIRY_TIME;
        
        if (isExpired) {
          logger.info('Order data has expired (>15 minutes old)');
        }
        
        return isExpired;
      },

      // Upsell management
      addUpsell: async (upsellData, apiClient) => {
        const state = get();
        
        if (!state.refId) {
          const error = 'No order reference ID available';
          logger.error(error);
          set({ upsellError: error });
          return null;
        }

        if (state.isProcessingUpsell) {
          logger.warn('Upsell processing already in progress');
          return null;
        }

        logger.info('Adding upsell to order:', state.refId, upsellData);
        set({ isProcessingUpsell: true, upsellError: null });

        try {
          const updatedOrder = await apiClient.addUpsell(state.refId, upsellData);
          logger.info('Upsell added successfully:', updatedOrder);
          
          // Track the current page as completed
          const currentPagePath = window.location.pathname;
          const packageIds = upsellData.lines.map(line => line.package_id.toString());
          
          // Add to journey
          const journeyEntries = packageIds.map(id => ({
            packageId: id,
            pagePath: currentPagePath,
            action: 'accepted' as const,
            timestamp: Date.now()
          }));
          
          set({ 
            order: updatedOrder,
            isProcessingUpsell: false,
            upsellError: null,
            orderLoadedAt: Date.now(), // Refresh the timestamp
            completedUpsells: [...state.completedUpsells, ...packageIds], // Keep for backward compatibility
            completedUpsellPages: state.completedUpsellPages.includes(currentPagePath) 
              ? state.completedUpsellPages 
              : [...state.completedUpsellPages, currentPagePath],
            upsellJourney: [...state.upsellJourney, ...journeyEntries]
          });

          return updatedOrder;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to add upsell';
          logger.error('Failed to add upsell:', error);
          
          set({ 
            isProcessingUpsell: false, 
            upsellError: errorMessage 
          });
          
          return null;
        }
      },

      addPendingUpsell: (upsellData) => {
        const state = get();
        logger.debug('Adding pending upsell:', upsellData);
        
        set({ 
          pendingUpsells: [...state.pendingUpsells, upsellData] 
        });
      },

      removePendingUpsell: (index) => {
        const state = get();
        const newPendingUpsells = [...state.pendingUpsells];
        newPendingUpsells.splice(index, 1);
        
        logger.debug('Removing pending upsell at index:', index);
        set({ pendingUpsells: newPendingUpsells });
      },

      clearPendingUpsells: () => {
        logger.debug('Clearing pending upsells');
        set({ pendingUpsells: [] });
      },

      markUpsellCompleted: (packageId) => {
        const state = get();
        if (!state.completedUpsells.includes(packageId)) {
          logger.debug('Marking upsell as completed:', packageId);
          set({ 
            completedUpsells: [...state.completedUpsells, packageId] 
          });
        }
      },
      
      markUpsellViewed: (packageId) => {
        const state = get();
        if (!state.viewedUpsells.includes(packageId)) {
          logger.debug('Marking upsell as viewed:', packageId);
          
          const journeyEntry = {
            packageId,
            action: 'viewed' as const,
            timestamp: Date.now()
          };
          
          set({ 
            viewedUpsells: [...state.viewedUpsells, packageId],
            upsellJourney: [...state.upsellJourney, journeyEntry]
          });
        }
      },
      
      markUpsellPageViewed: (pagePath) => {
        const state = get();
        if (!state.viewedUpsellPages.includes(pagePath)) {
          logger.debug('Marking upsell page as viewed:', pagePath);
          
          const journeyEntry = {
            pagePath,
            action: 'viewed' as const,
            timestamp: Date.now()
          };
          
          set({ 
            viewedUpsellPages: [...state.viewedUpsellPages, pagePath],
            upsellJourney: [...state.upsellJourney, journeyEntry],
            isProcessingUpsell: false, // Reset processing state when viewing new page
            upsellError: null // Clear any previous errors
          });
        }
      },
      
      markUpsellSkipped: (packageId, pagePath) => {
        const state = get();
        logger.debug('Marking upsell as skipped:', { packageId, pagePath });
        
        const journeyEntry: { packageId?: string; pagePath?: string; action: 'viewed' | 'accepted' | 'skipped'; timestamp: number } = {
          action: 'skipped' as const,
          timestamp: Date.now()
        };
        if (packageId !== undefined) journeyEntry.packageId = packageId;
        if (pagePath !== undefined) journeyEntry.pagePath = pagePath;
        
        set({ 
          upsellJourney: [...state.upsellJourney, journeyEntry],
          isProcessingUpsell: false, // Reset processing state when skipping
          upsellError: null // Clear any errors
        });
      },

      // Error handling
      setError: (error) => set({ error }),
      setUpsellError: (error) => set({ upsellError: error }),
      clearErrors: () => set({ error: null, upsellError: null }),

      // Loading states
      setLoading: (loading) => set({ isLoading: loading }),
      setProcessingUpsell: (processing) => set({ isProcessingUpsell: processing }),

      // Utility methods
      hasUpsellPageBeenCompleted: (pagePath) => {
        const state = get();
        return state.completedUpsellPages.includes(pagePath);
      },
      
      hasUpsellBeenViewed: (packageId) => {
        const state = get();
        return state.viewedUpsells.includes(packageId);
      },
      
      hasUpsellPageBeenViewed: (pagePath) => {
        const state = get();
        return state.viewedUpsellPages.includes(pagePath);
      },
      
      getUpsellJourney: () => {
        const state = get();
        return state.upsellJourney;
      },

      getOrderTotal: () => {
        const state = get();
        if (!state.order) return 0;
        
        // Parse the total_incl_tax field (it's a string in decimal format)
        return parseFloat(state.order.total_incl_tax || '0');
      },

      canAddUpsells: () => {
        const state = get();
        return !!(state.order && state.order.supports_post_purchase_upsells && !state.isProcessingUpsell);
      },

      reset: () => {
        logger.debug('Resetting order store');
        set(initialState);
      },
    }),
    {
      name: 'next-order',
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
  ),
  {
    name: 'order-store',
  })
);