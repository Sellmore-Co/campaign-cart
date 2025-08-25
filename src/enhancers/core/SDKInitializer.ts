/**
 * SDK Initializer
 * Handles auto-initialization, configuration loading, and setup
 */

import { createLogger, Logger, LogLevel } from '@/utils/logger';
import { useConfigStore } from '@/stores/configStore';
import { useCampaignStore } from '@/stores/campaignStore';
import { useCheckoutStore } from '@/stores/checkoutStore';
import { useCartStore } from '@/stores/cartStore';
import { useOrderStore } from '@/stores/orderStore';
import { useAttributionStore } from '@/stores/attributionStore';
import { AttributeScanner } from './AttributeScanner';
import { NextCommerce } from '@/core/NextCommerce';
// Debug overlay imported dynamically when needed
import { testModeManager } from '@/utils/testMode';
import { EventBus } from '@/utils/events';
import { ApiClient } from '@/api/client';

export class SDKInitializer {
  private static logger = createLogger('SDKInitializer');
  private static initialized = false;
  private static attributeScanner: AttributeScanner | null = null;
  private static retryAttempts = 0;
  private static maxRetries = 3;

  public static async initialize(): Promise<void> {
    if (this.initialized) {
      this.logger.warn('SDK already initialized');
      return;
    }

    try {
      this.logger.info('Initializing 29Next Campaign Cart SDK v2...');

      // Wait for DOM to be ready
      await this.waitForDOM();

      // Load configuration
      await this.loadConfiguration();

      // Initialize attribution store
      await this.initializeAttribution();

      // Load campaign data
      await this.loadCampaignData();

      // Initialize analytics after campaign data is loaded
      await this.initializeAnalytics();
      
      
      // Initialize global error handler
      this.initializeErrorHandler();

      // Check if there's a ref_id parameter and load order if found
      await this.checkAndLoadOrder();

      // Scan DOM for data attributes
      await this.scanAndEnhanceDOM();

      // Set up ready callback system
      this.setupReadyCallbacks();

      // Initialize debug utilities if debug mode is enabled
      await this.initializeDebugMode();

      this.initialized = true;
      this.retryAttempts = 0;
      this.logger.info('SDK initialization complete ✅');
      
      // Emit initialization event
      this.emitInitializedEvent();
      
    } catch (error) {
      this.logger.error('SDK initialization failed:', error);
      
      // Retry logic
      if (this.retryAttempts < this.maxRetries) {
        this.retryAttempts++;
        this.logger.warn(`Retrying initialization (attempt ${this.retryAttempts}/${this.maxRetries})...`);
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 1000 * this.retryAttempts));
        return this.initialize();
      }
      
      throw error;
    }
  }

  private static async loadConfiguration(): Promise<void> {
    const configStore = useConfigStore.getState();
    
    // Check URL parameters for debug mode and forcePackageId
    const urlParams = new URLSearchParams(window.location.search);
    const debugMode = urlParams.get('debugger') === 'true';
    const forcePackageId = urlParams.get('forcePackageId');
    
    // Load from window.nextConfig first (as defaults)
    configStore.loadFromWindow();
    
    // Load from meta tags second (will override window.nextConfig if metatags exist)
    configStore.loadFromMeta();
    
    // Override debug mode from URL if present
    if (debugMode) {
      configStore.updateConfig({ debug: true });
    }
    
    // Handle forcePackageId parameter
    if (forcePackageId) {
      this.logger.info('forcePackageId parameter detected:', forcePackageId);
      // Store for later processing after campaign data is loaded
      (window as any)._nextForcePackageId = forcePackageId;
    }
    
    this.logger.debug('Configuration loaded (metatags have priority):', configStore);
  }

  private static async loadCampaignData(): Promise<void> {
    const configStore = useConfigStore.getState();
    const campaignStore = useCampaignStore.getState();
    
    if (!configStore.apiKey) {
      throw new Error('API key not found. Please set next-api-key meta tag or window.nextConfig.apiKey');
    }

    // Campaign ID is deprecated and not used by the API - only the API key is needed
    // No need to check or warn about it anymore

    await campaignStore.loadCampaign(configStore.apiKey);
    this.logger.debug('Campaign data loaded');
    
    // Process forcePackageId parameter after campaign data is available
    await this.processForcePackageId();
  }

  private static async processForcePackageId(): Promise<void> {
    const forcePackageId = (window as any)._nextForcePackageId;
    
    if (!forcePackageId) {
      return;
    }
    
    try {
      this.logger.info('Processing forcePackageId parameter:', forcePackageId);
      
      const cartStore = useCartStore.getState();
      const campaignStore = useCampaignStore.getState();
      
      // Clear existing cart
      await cartStore.clear();
      this.logger.debug('Cart cleared for forcePackageId');
      
      // Parse the format: x:2,y:1 -> [{id: x, quantity: 2}, {id: y, quantity: 1}]
      const packageSpecs = forcePackageId.split(',').map((spec: string) => {
        const [idStr, quantityStr] = spec.trim().split(':');
        const packageId = parseInt(idStr || '', 10);
        const quantity = quantityStr ? parseInt(quantityStr, 10) : 1;
        
        if (isNaN(packageId) || packageId <= 0) {
          throw new Error(`Invalid package ID: ${idStr}`);
        }
        
        if (isNaN(quantity) || quantity <= 0) {
          throw new Error(`Invalid quantity: ${quantityStr}`);
        }
        
        return { packageId, quantity };
      });
      
      this.logger.debug('Parsed package specifications:', packageSpecs);
      
      // Add each package to cart
      for (const spec of packageSpecs) {
        const packageData = campaignStore.getPackage(spec.packageId);
        
        if (!packageData) {
          this.logger.warn(`Package ${spec.packageId} not found in campaign data, skipping`);
          continue;
        }
        
        await cartStore.addItem({
          packageId: spec.packageId,
          quantity: spec.quantity,
          isUpsell: false
        });
        
        this.logger.debug(`Added package ${spec.packageId} with quantity ${spec.quantity} to cart`);
      }
      
      this.logger.info(`Successfully processed forcePackageId: added ${packageSpecs.length} package(s) to cart`);
      
      // Clean up the temporary storage
      delete (window as any)._nextForcePackageId;
      
    } catch (error) {
      this.logger.error('Error processing forcePackageId parameter:', error);
      // Don't throw - this shouldn't break SDK initialization
    }
  }

  private static async initializeAttribution(): Promise<void> {
    try {
      this.logger.info('Initializing attribution...');
      
      const attributionStore = useAttributionStore.getState();
      const configStore = useConfigStore.getState();
      
      // Initialize attribution data collection
      await attributionStore.initialize();
      
      // Add SDK version to metadata
      const sdkVersion = typeof window !== 'undefined' && window.__NEXT_SDK_VERSION__ 
        ? window.__NEXT_SDK_VERSION__ 
        : 'unknown';
      
      attributionStore.updateAttribution({
        metadata: {
          ...attributionStore.metadata,
          sdk_version: sdkVersion
        }
      });
      
      this.logger.debug(`Added SDK version to attribution metadata: ${sdkVersion}`);
      
      // Set up event listeners for attribution updates
      this.setupAttributionListeners();
      
      // Initialize UTM transfer if enabled
      if (configStore.utmTransfer?.enabled) {
        const { UtmTransfer } = await import('@/utils/attribution/UtmTransfer');
        const utmTransfer = new UtmTransfer(configStore.utmTransfer);
        utmTransfer.init();
        this.logger.debug('UTM transfer initialized');
      }
      
      this.logger.debug('Attribution initialized');
    } catch (error) {
      this.logger.error('Attribution initialization failed:', error);
      // Continue with initialization - attribution failure shouldn't break SDK
    }
  }

  private static setupAttributionListeners(): void {
    const eventBus = EventBus.getInstance();
    const attributionStore = useAttributionStore.getState();
    
    // Update funnel when campaign loads
    eventBus.on('campaign:loaded', (campaign) => {
      if (campaign?.name && !attributionStore.funnel) {
        attributionStore.setFunnelName(campaign.name);
        this.logger.debug('Set funnel name from campaign:', campaign.name);
      }
    });
    
    // Track conversion timestamp on cart creation
    eventBus.on('cart:updated', () => {
      attributionStore.updateAttribution({
        metadata: {
          ...attributionStore.metadata,
          conversion_timestamp: Date.now()
        }
      });
      this.logger.debug('Updated attribution with conversion timestamp');
    });
    
    // Listen for page changes to update landing page
    window.addEventListener('popstate', () => {
      attributionStore.updateAttribution({
        metadata: {
          ...attributionStore.metadata,
          landing_page: window.location.href
        }
      });
    });
  }

  private static async initializeAnalytics(): Promise<void> {
    // Schedule analytics initialization to run after SDK is ready
    // This ensures analytics doesn't block core functionality
    setTimeout(async () => {
      try {
        this.logger.info('Initializing analytics v2 (lazy)...');
        
        // Dynamically import new analytics v2 to avoid loading it during initial bundle
        const { nextAnalytics } = await import('@/utils/analytics/index');
        await nextAnalytics.initialize();
        
        this.logger.debug('Analytics v2 initialized successfully (lazy)');
      } catch (error) {
        this.logger.warn('Analytics v2 initialization failed (non-critical):', error);
        // Don't throw - analytics failure shouldn't break SDK initialization
      }
    }, 0); // Run on next tick after SDK initialization completes
  }
  
  
  private static initializeErrorHandler(): void {
    try {
      // Import and initialize error handler
      import('@/utils/monitoring/errorHandler').then(({ errorHandler }) => {
        errorHandler.initialize();
        this.logger.debug('Error handler initialized');
      });
    } catch (error) {
      this.logger.warn('Error handler initialization failed:', error);
    }
  }

  private static async checkAndLoadOrder(): Promise<void> {
    // Check if there's a ref_id parameter in the URL
    const urlParams = new URLSearchParams(window.location.search);
    const refId = urlParams.get('ref_id');
    
    if (refId) {
      this.logger.info('Page loaded with ref_id parameter, auto-loading order:', refId);
      
      try {
        const configStore = useConfigStore.getState();
        const orderStore = useOrderStore.getState();
        const apiClient = new ApiClient(configStore.apiKey);
        
        await orderStore.loadOrder(refId, apiClient);
        this.logger.info('Order loaded successfully:', orderStore.order);
        
        // Log whether the order supports upsells
        if (orderStore.order) {
          this.logger.info('Order supports upsells:', orderStore.order.supports_post_purchase_upsells);
        }
      } catch (error) {
        this.logger.error('Failed to auto-load order:', error);
        // Don't throw - this shouldn't break SDK initialization
      }
    }
  }

  private static async scanAndEnhanceDOM(): Promise<void> {
    if (this.attributeScanner) {
      this.attributeScanner.destroy();
    }
    
    this.attributeScanner = new AttributeScanner();
    await this.attributeScanner.scanAndEnhance(document.body);
    
    const stats = this.attributeScanner.getStats();
    this.logger.info('DOM scanning and enhancement complete', stats);
  }

  private static setupReadyCallbacks(): void {
    const sdk = NextCommerce.getInstance();
    
    if (typeof window !== 'undefined') {
      // Execute any queued ready callbacks if they exist
      if (Array.isArray((window as any).nextReady)) {
        const readyQueue = (window as any).nextReady;
        readyQueue.forEach((callback: (sdk: NextCommerce) => void) => {
          try {
            callback(sdk);
          } catch (error) {
            this.logger.error('Ready callback error:', error);
          }
        });
      }
      
      // Set up public API as window.next
      (window as any).next = sdk;
      
      // Always set up nextReady for future callbacks (whether it existed before or not)
      (window as any).nextReady = {
        push: (callback: (sdk: NextCommerce) => void) => {
          try {
            callback(sdk);
          } catch (error) {
            this.logger.error('Ready callback error:', error);
          }
        }
      };
      
      this.logger.debug('nextReady callback system and window.next API initialized');
    }
  }

  private static async initializeDebugMode(): Promise<void> {
    const configStore = useConfigStore.getState();
    
    if (configStore.debug) {
      this.logger.info('Debug mode enabled - initializing debug utilities');
      
      // Set logger to DEBUG level when debug mode is enabled
      Logger.setLogLevel(LogLevel.DEBUG);
      this.logger.info('Logger level set to DEBUG');
      
      // Initialize debug overlay only in debug mode
      const { debugOverlay } = await import('@/utils/debug/DebugOverlay');
      debugOverlay.initialize();
      
      // Initialize test mode manager
      // Removed test mode indicator - using debug overlay instead
      // testModeManager.addTestModeIndicator();
      
      // Set up global debug utilities
      this.setupGlobalDebugUtils();
      
      // Log debug info
      this.logger.info('Debug utilities initialized ✅');
    }
  }

  private static setupGlobalDebugUtils(): void {
    if (typeof window !== 'undefined') {
      // Add global debug utilities to window for console access
      (window as any).nextDebug = {
        overlay: () => import('@/utils/debug/DebugOverlay').then(m => m.debugOverlay),
        testMode: testModeManager,
        stores: {
          cart: useCartStore,
          campaign: useCampaignStore,
          config: useConfigStore,
          checkout: useCheckoutStore,
          order: useOrderStore,
          attribution: useAttributionStore
        },
        sdk: NextCommerce.getInstance(),
        reinitialize: () => this.reinitialize(),
        getStats: () => this.getInitializationStats(),
        
        // Enhanced cart methods
        addToCart: (packageId: number, quantity: number = 1) => {
          const cartStore = useCartStore.getState();
          const campaignStore = useCampaignStore.getState();
          const packageData = campaignStore.getPackage(packageId);
          
          if (packageData) {
            cartStore.addItem({
              packageId,
              quantity,
              price: parseFloat(packageData.price),
              title: packageData.name,
              isUpsell: false
            });
          }
        },
        
        removeFromCart: (packageId: number) => {
          useCartStore.getState().removeItem(packageId);
        },
        
        updateQuantity: (packageId: number, quantity: number) => {
          useCartStore.getState().updateQuantity(packageId, quantity);
        },
        
        // Analytics methods (removed - will be combined with analytics below)
        
        // Campaign methods
        loadCampaign: () => {
          const configStore = useConfigStore.getState();
          return useCampaignStore.getState().loadCampaign(configStore.apiKey);
        },
        
        clearCampaignCache: () => {
          useCampaignStore.getState().clearCache();
        },
        
        getCacheInfo: () => {
          const info = useCampaignStore.getState().getCacheInfo();
          console.table(info);
          return info;
        },
        
        inspectPackage: (packageId: number) => {
          const campaignStore = useCampaignStore.getState();
          const packageData = campaignStore.getPackage(packageId);
          console.group(`📦 Package ${packageId} Details`);
          console.table(packageData);
          console.groupEnd();
        },
        
        testShippingMethod: async (methodId: number) => {
          console.log(`🚚 Testing shipping method ${methodId}`);
          try {
            const cartStore = useCartStore.getState();
            await cartStore.setShippingMethod(methodId);
            console.log(`✅ Shipping method ${methodId} set successfully`);
            
            // Get the updated cart state to show the shipping cost
            const state = cartStore;
            const shippingMethod = state.shippingMethod;
            if (shippingMethod) {
              console.log(`📦 Shipping: ${shippingMethod.code} - $${shippingMethod.price}`);
            }
            
            // Trigger UI update
            document.dispatchEvent(new CustomEvent('debug:update-content'));
          } catch (error) {
            console.error(`❌ Failed to set shipping method ${methodId}:`, error);
          }
        },
        
        sortPackages: (sortBy: string) => {
          console.log(`🔄 Sorting packages by ${sortBy}`);
          // Trigger panel update with sorted packages
          document.dispatchEvent(new CustomEvent('debug:update-content'));
        },
        
        // Analytics utilities - lazy loaded to avoid blocking
        analytics: {
          getStatus: async () => {
            const { nextAnalytics } = await import('@/utils/analytics/index');
            return nextAnalytics.getStatus();
          },
          getProviders: async () => {
            const { nextAnalytics } = await import('@/utils/analytics/index');
            return nextAnalytics.getStatus().providers;
          },
          track: async (name: string, data: any) => {
            const { nextAnalytics } = await import('@/utils/analytics/index');
            return nextAnalytics.track({ event: name, ...data });
          },
          setDebugMode: async (enabled: boolean) => {
            const { nextAnalytics } = await import('@/utils/analytics/index');
            return nextAnalytics.setDebugMode(enabled);
          },
          invalidateContext: async () => {
            const { nextAnalytics } = await import('@/utils/analytics/index');
            return nextAnalytics.invalidateContext();
          }
        },
        
        // Attribution utilities
        attribution: {
          debug: () => useAttributionStore.getState().debug(),
          get: () => useAttributionStore.getState().getAttributionForApi(),
          setFunnel: (funnel: string) => useAttributionStore.getState().setFunnelName(funnel),
          setEvclid: (evclid: string) => useAttributionStore.getState().setEverflowClickId(evclid),
          clearFunnel: () => useAttributionStore.getState().clearPersistedFunnel(),
          getFunnel: () => {
            const state = useAttributionStore.getState();
            const persisted = localStorage.getItem('next_funnel_name') || sessionStorage.getItem('next_funnel_name');
            console.log('Current funnel:', state.funnel);
            console.log('Persisted funnel:', persisted);
            return state.funnel || persisted || '(not set)';
          }
        },
        
        // Element highlighting
        highlightElement: (selector: string) => {
          this.logger.debug(`🎯 Highlighting element: ${selector}`);
          // TODO: Implement element highlighting in DebugOverlay
        },
        
        addTestItems: () => {
          const cartStore = useCartStore.getState();
          [2, 7, 9].forEach(packageId => {
            cartStore.addItem({
              packageId,
              quantity: 1,
              price: 19.99,
              title: `Test Package ${packageId}`,
              isUpsell: false
            });
          });
        },
        
        // Accordion utilities
        accordion: {
          open: (id: string) => {
            document.dispatchEvent(new CustomEvent('next:accordion-open', { detail: { id } }));
          },
          close: (id: string) => {
            document.dispatchEvent(new CustomEvent('next:accordion-close', { detail: { id } }));
          },
          toggle: (id: string) => {
            document.dispatchEvent(new CustomEvent('next:accordion-toggle', { detail: { id } }));
          }
        },
        
        // Order and upsell utilities
        order: {
          getJourney: () => {
            const orderStore = useOrderStore.getState();
            const journey = orderStore.getUpsellJourney();
            console.table(journey);
            return journey;
          },
          isExpired: () => useOrderStore.getState().isOrderExpired(),
          clearCache: () => {
            useOrderStore.getState().clearOrder();
            console.log('Order cache cleared');
          },
          getStats: () => {
            const orderStore = useOrderStore.getState();
            return {
              hasOrder: !!orderStore.order,
              refId: orderStore.refId,
              orderAge: orderStore.orderLoadedAt ? 
                `${Math.floor((Date.now() - orderStore.orderLoadedAt) / 1000 / 60)} minutes` : 
                'N/A',
              viewedUpsells: orderStore.viewedUpsells,
              viewedUpsellPages: orderStore.viewedUpsellPages,
              completedUpsells: orderStore.completedUpsells,
              journeyLength: orderStore.upsellJourney.length
            };
          }
        }
      };
    
    }
  }

  public static isInitialized(): boolean {
    return this.initialized;
  }

  public static async reinitialize(): Promise<void> {
    this.logger.info('Reinitializing SDK...');
    
    // Cleanup existing resources
    if (this.attributeScanner) {
      this.attributeScanner.destroy();
      this.attributeScanner = null;
    }
    
    this.initialized = false;
    this.retryAttempts = 0;
    
    await this.initialize();
  }

  private static async waitForDOM(): Promise<void> {
    if (document.readyState === 'loading') {
      return new Promise((resolve) => {
        const onReady = () => {
          document.removeEventListener('DOMContentLoaded', onReady);
          document.removeEventListener('readystatechange', onReady);
          resolve();
        };
        
        document.addEventListener('DOMContentLoaded', onReady);
        document.addEventListener('readystatechange', onReady);
      });
    }
  }

  private static emitInitializedEvent(): void {
    if (typeof window !== 'undefined') {
      const event = new CustomEvent('next:initialized', {
        detail: {
          version: '0.2.0',
          timestamp: Date.now(),
          stats: this.attributeScanner?.getStats()
        }
      });
      
      window.dispatchEvent(event);
    }
  }

  public static getAttributeScanner(): AttributeScanner | null {
    return this.attributeScanner;
  }

  public static getInitializationStats(): {
    initialized: boolean;
    retryAttempts: number;
    scannerStats?: ReturnType<AttributeScanner['getStats']>;
  } {
    return {
      initialized: this.initialized,
      retryAttempts: this.retryAttempts,
      ...(this.attributeScanner && { scannerStats: this.attributeScanner.getStats() })
    };
  }
}