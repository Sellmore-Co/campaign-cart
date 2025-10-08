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
import { CART_STORAGE_KEY } from '@/utils/storage';
import { CountryService, Country, LocationData } from '@/utils/countryService';
import * as AmplitudeAnalytics from '@/utils/analytics/amplitude';

export class SDKInitializer {
  private static logger = createLogger('SDKInitializer');
  private static initialized = false;
  private static attributeScanner: AttributeScanner | null = null;
  private static retryAttempts = 0;
  private static maxRetries = 3;
  private static initStartTime = 0;
  private static campaignLoadStartTime = 0;
  private static campaignLoadTime = 0;
  private static campaignFromCache = false;

  public static async initialize(): Promise<void> {
    if (this.initialized) {
      this.logger.warn('SDK already initialized');
      return;
    }

    try {
      this.logger.info('Initializing 29Next Campaign Cart SDK v2...');
      this.initStartTime = Date.now();
      
      // Track page view first
      queueMicrotask(() => AmplitudeAnalytics.trackPageView());

      // Wait for DOM to be ready
      await this.waitForDOM();

      // Load configuration
      await this.loadConfiguration();

      // NEW: Initialize location and currency detection EARLY (before campaign data)
      await this.initializeLocationAndCurrency();

      // Initialize attribution store
      await this.initializeAttribution();

      // Load campaign data (will now use the detected/selected currency)
      await this.loadCampaignData();

      // Initialize analytics after campaign data is loaded
      await this.initializeAnalytics();
      
      // IMPORTANT: Wait for cart store to fully rehydrate from storage
      // This prevents race conditions where display enhancers initialize with empty cart state
      await this.waitForStoreRehydration();
      
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
      const initTime = Date.now() - this.initStartTime;
      this.logger.info('SDK initialization complete ✅');
      
      // Track successful initialization
      const configStore = useConfigStore.getState();
      const stats = this.attributeScanner?.getStats();
      queueMicrotask(() => {
        AmplitudeAnalytics.trackSDKInitialized({
          initializationTime: initTime,
          campaignLoadTime: this.campaignLoadTime,
          fromCache: this.campaignFromCache,
          retryAttempts: this.retryAttempts,
          elementsEnhanced: stats?.enhancedElements || 0,
          debugMode: configStore.debug || false,
          forcePackageId: (window as any)._nextForcePackageId || null,
          forceShippingId: (window as any)._nextForceShippingId || null
        });
      });
      
      this.retryAttempts = 0;
      
      // Emit initialization event
      this.emitInitializedEvent();
      
    } catch (error) {
      this.logger.error('SDK initialization failed:', error);
      
      // Track initialization failure
      let errorStage: 'config_load' | 'campaign_load' | 'dom_scan' | 'attribution' = 'config_load';
      if (this.campaignLoadStartTime > 0) errorStage = 'campaign_load';
      if (this.attributeScanner) errorStage = 'dom_scan';
      
      queueMicrotask(() => {
        AmplitudeAnalytics.trackSDKInitializationFailed({
          errorMessage: error instanceof Error ? error.message : String(error),
          errorStage,
          retryAttempt: this.retryAttempts
        });
      });
      
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

  private static async captureUrlParameters(urlParams: URLSearchParams): Promise<void> {
    try {
      // Import parameter store
      const { useParameterStore } = await import('@/stores/parameterStore');
      const paramStore = useParameterStore.getState();

      // Get existing stored parameters
      const existingParams = { ...paramStore.params };

      // Capture all current URL parameters
      const currentParams: Record<string, string> = {};
      urlParams.forEach((value, key) => {
        currentParams[key] = value;
      });

      // Merge with existing parameters (new URL params override stored ones)
      const mergedParams = { ...existingParams, ...currentParams };

      // Update the store with merged parameters
      if (Object.keys(mergedParams).length > 0) {
        paramStore.updateParams(mergedParams);
        this.logger.debug(`Captured ${Object.keys(currentParams).length} URL parameters, total stored: ${Object.keys(mergedParams).length}`);

        // Log special parameters we're interested in for visibility control
        const visibilityParams = ['seen', 'timer', 'reviews', 'loading', 'banner', 'exit'];
        const relevantParams = Object.keys(mergedParams).filter(key => visibilityParams.includes(key));
        if (relevantParams.length > 0) {
          this.logger.info('Visibility control parameters detected:', relevantParams.map(k => `${k}=${mergedParams[k]}`).join(', '));
        }
      }
    } catch (error) {
      this.logger.warn('Failed to capture URL parameters:', error);
      // Non-critical error, continue with initialization
    }
  }

  private static async initializeLocationAndCurrency(): Promise<void> {
    try {
      const configStore = useConfigStore.getState();

      // Only initialize if currencyBehavior is explicitly set to 'auto'
      if (!configStore.currencyBehavior || configStore.currencyBehavior !== 'auto') {
        this.logger.info('Skipping location/currency detection (currencyBehavior is not set to auto)');
        return;
      }

      this.logger.info('Initializing location and currency detection...');

      // Initialize country service early
      const countryService = CountryService.getInstance();
      
      // Check for country override in URL or session
      const urlParams = new URLSearchParams(window.location.search);
      const countryOverride = urlParams.get('country');
      const savedCountry = sessionStorage.getItem('next_selected_country');
      
      // Priority: URL param > saved preference > auto-detection
      const forcedCountry = countryOverride || savedCountry;
      
      let locationData: LocationData | null = null;
      
      if (forcedCountry) {
        // Use forced country instead of detection
        this.logger.info(`Using forced country: ${forcedCountry} (source: ${countryOverride ? 'URL' : 'session'})`);
        
        try {
          const response = await fetch(`https://cdn-countries.muddy-wind-c7ca.workers.dev/countries/${forcedCountry.toUpperCase()}/states`);
          
          if (response.ok) {
            const data = await response.json();
            
            // Format response to match location detection structure
            locationData = {
              detectedCountryCode: forcedCountry.toUpperCase(),
              detectedCountryConfig: data.countryConfig || {
                currencyCode: 'USD',
                currencySymbol: '$',
                stateLabel: 'State / Province',
                stateRequired: true,
                postcodeLabel: 'Postcode / ZIP',
                postcodeMinLength: 2,
                postcodeMaxLength: 20
              },
              detectedStates: data.states || [],
              countries: [] as Country[]
            };
            
            // Save to session if from URL
            if (countryOverride) {
              sessionStorage.setItem('next_selected_country', countryOverride.toUpperCase());
            }
            
            this.logger.info('Country config loaded:', {
              country: locationData?.detectedCountryCode,
              currency: locationData?.detectedCountryConfig.currencyCode
            });
          } else {
            this.logger.warn(`Failed to fetch country config for ${forcedCountry}, falling back to detection`);
          }
        } catch (error) {
          this.logger.error('Error fetching country config:', error);
        }
      }
      
      // If no forced country or fetch failed, use normal detection
      if (!locationData) {
        // Apply address config if available
        if (configStore.addressConfig) {
          countryService.setConfig(configStore.addressConfig);
        }
        
        // Fetch location data with timeout to prevent blocking
        const locationDataPromise = countryService.getLocationData();
        const timeoutPromise = new Promise<null>((_, reject) => 
          setTimeout(() => reject(new Error('Location detection timeout')), 3000)
        );
        
        try {
          locationData = await Promise.race([locationDataPromise, timeoutPromise]);
        } catch (error) {
          this.logger.warn('Location detection failed or timed out, using defaults:', error);
          // Use fallback data
          locationData = {
            detectedCountryCode: 'US',
            detectedCountryConfig: {
              stateLabel: 'State',
              stateRequired: true,
              postcodeLabel: 'ZIP Code',
              postcodeRegex: '^\\d{5}(-\\d{4})?$',
              postcodeMinLength: 5,
              postcodeMaxLength: 10,
              postcodeExample: '12345',
              currencyCode: 'USD',
              currencySymbol: '$'
            },
            detectedStates: [],
            countries: [] as Country[]
          };
        }
      } else if (locationData && !locationData.countries?.length) {
        // If we have forced country data but no countries list, fetch just the countries
        try {
          const countriesData = await countryService.getLocationData();
          locationData.countries = countriesData.countries || [];
        } catch (error) {
          this.logger.warn('Failed to fetch countries list:', error);
        }
      }
      
      if (locationData) {
        this.logger.info('User location detected:', {
          country: locationData.detectedCountryCode,
          currency: locationData.detectedCountryConfig.currencyCode,
          currencySymbol: locationData.detectedCountryConfig.currencySymbol
        });
        
        // Store in config for global access
        configStore.updateConfig({
          detectedCountry: locationData.detectedCountryCode,
          detectedCurrency: locationData.detectedCountryConfig.currencyCode,
          locationData: locationData // Cache the entire response
        });
        
        // Determine selected currency with proper priority:
        // 1. URL parameter (highest priority - immediate override)
        // 2. Previously saved user selection (from session)
        // 3. Detected currency from location (default)
        
        const urlParams = new URLSearchParams(window.location.search);
        const urlCurrency = urlParams.get('currency');
        const savedCurrency = sessionStorage.getItem('next_selected_currency');
        const detectedCurrency = locationData.detectedCountryConfig.currencyCode;
        
        let selectedCurrency: string;
        
        if (urlCurrency) {
          // URL parameter has highest priority
          selectedCurrency = urlCurrency.toUpperCase();
          this.logger.info('Currency override from URL:', selectedCurrency);
          // Save to session for persistence
          sessionStorage.setItem('next_selected_currency', selectedCurrency);
        } else if (savedCurrency) {
          // Use previously saved selection
          selectedCurrency = savedCurrency;
          this.logger.info('Using saved currency preference:', selectedCurrency);
        } else {
          // Use detected currency as default
          selectedCurrency = detectedCurrency;
          this.logger.info('Using detected currency:', selectedCurrency);
        }
        
        configStore.updateConfig({
          selectedCurrency
        });
        
        this.logger.debug('Location and currency initialized:', {
          detectedCountry: configStore.detectedCountry,
          detectedCurrency: configStore.detectedCurrency,
          selectedCurrency: configStore.selectedCurrency
        });
      }
      
    } catch (error) {
      this.logger.warn('Failed to initialize location/currency, using defaults:', error);
      
      // Check for saved currency even in fallback case
      const savedCurrency = sessionStorage.getItem('next_selected_currency');
      const urlParams = new URLSearchParams(window.location.search);
      const urlCurrency = urlParams.get('currency');
      
      // Determine fallback currency with priority
      let fallbackCurrency = 'USD';
      if (urlCurrency) {
        fallbackCurrency = urlCurrency.toUpperCase();
        sessionStorage.setItem('next_selected_currency', fallbackCurrency);
      } else if (savedCurrency) {
        fallbackCurrency = savedCurrency;
      }
      
      const configStore = useConfigStore.getState();
      configStore.updateConfig({
        detectedCountry: 'US',
        detectedCurrency: 'USD',
        selectedCurrency: fallbackCurrency
      });
    }
  }

  private static async loadConfiguration(): Promise<void> {
    const configStore = useConfigStore.getState();

    // Check for reset parameter first
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('reset') === 'true') {
      await this.clearAllStorage();
      // Remove the reset parameter from URL to avoid infinite loop
      urlParams.delete('reset');
      const newUrl = window.location.pathname + (urlParams.toString() ? '?' + urlParams.toString() : '');
      window.history.replaceState({}, '', newUrl);
    }

    // NEW: Capture ALL URL parameters for session use
    await this.captureUrlParameters(urlParams);

    // Check URL parameters for debug mode, forcePackageId, and forceShippingId
    const debugMode = urlParams.get('debugger') === 'true';
    const forcePackageId = urlParams.get('forcePackageId');
    const forceShippingId = urlParams.get('forceShippingId');
    
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
    
    // Handle forceShippingId parameter
    if (forceShippingId) {
      this.logger.info('forceShippingId parameter detected:', forceShippingId);
      // Store for later processing after campaign data is loaded
      (window as any)._nextForceShippingId = forceShippingId;
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

    this.campaignLoadStartTime = Date.now();
    await campaignStore.loadCampaign(configStore.apiKey);
    this.campaignLoadTime = Date.now() - this.campaignLoadStartTime;
    this.campaignFromCache = campaignStore.isFromCache || false;
    
    // Track campaign loaded event
    if (campaignStore.data) {
      queueMicrotask(() => {
        const trackData: any = {
          loadTime: this.campaignLoadTime,
          fromCache: this.campaignFromCache,
          packageCount: campaignStore.data?.packages?.length || 0,
          shippingMethodsCount: campaignStore.data?.shipping_methods?.length || 0,
          currency: campaignStore.data?.currency || 'USD'
        };
        if (campaignStore.cacheAge !== undefined) {
          trackData.cacheAge = campaignStore.cacheAge;
        }
        AmplitudeAnalytics.trackCampaignLoaded(trackData);
      });
    }
    
    this.logger.debug('Campaign data loaded');
    
    // Process forcePackageId parameter after campaign data is available
    await this.processForcePackageId();
    
    // Process forceShippingId parameter after campaign data is available
    await this.processForceShippingId();
    
    // Process profile parameter after campaign data is available
    await this.processProfileParameter();
    
    // Emit event to notify enhancers that URL parameters have been processed
    // This allows enhancers to re-evaluate their conditions after profiles are applied
    const eventBus = EventBus.getInstance();
    eventBus.emit('sdk:url-parameters-processed', {});
    this.logger.debug('Emitted sdk:url-parameters-processed event');
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

  private static async processProfileParameter(): Promise<void> {
    const urlParams = new URLSearchParams(window.location.search);
    const profileParam = urlParams.get('profile') ||
                        urlParams.get('forceProfile') ||
                        urlParams.get('packageProfile');

    // First, register all profiles from config
    const configStore = useConfigStore.getState();
    if (configStore.profiles && Object.keys(configStore.profiles).length > 0) {
      const { useProfileStore } = await import('@/stores/profileStore');
      const profileStore = useProfileStore.getState();

      Object.entries(configStore.profiles).forEach(([id, config]) => {
        profileStore.registerProfile({
          id,
          name: config.name,
          description: config.description || '',
          packageMappings: config.packageMappings,
        });
      });
      this.logger.debug(`Registered ${Object.keys(configStore.profiles).length} profiles from config`);
    }

    if (profileParam) {
      this.logger.info('Profile parameter detected:', profileParam);

      try {
        const { ProfileManager } = await import('@/core/ProfileManager');
        const profileManager = ProfileManager.getInstance();
        const clearCart = urlParams.get('forceProfile') !== null;

        await profileManager.applyProfile(profileParam, { clearCart });
        this.logger.info(`Profile "${profileParam}" applied successfully from URL`);
      } catch (error) {
        this.logger.error('Failed to apply profile from URL:', error);
        // Don't throw - this shouldn't break SDK initialization
      }
      return; // URL param takes precedence
    }

    // Check for persisted active profile (from previous session)
    const { useProfileStore } = await import('@/stores/profileStore');
    const profileStore = useProfileStore.getState();

    if (profileStore.activeProfileId &&
        profileStore.activeProfileId !== 'default' &&
        profileStore.activeProfileId !== 'regular') {
      try {
        this.logger.info('Restoring persisted profile:', profileStore.activeProfileId);
        const { ProfileManager } = await import('@/core/ProfileManager');
        const profileManager = ProfileManager.getInstance();

        // Re-apply the persisted profile
        await profileManager.applyProfile(profileStore.activeProfileId, {
          clearCart: false, // Don't clear cart when restoring
          preserveQuantities: true
        });
        this.logger.info(`Restored profile "${profileStore.activeProfileId}" from previous session`);
        return;
      } catch (error) {
        this.logger.error('Failed to restore persisted profile:', error);
        // Continue to default profile logic if restoration fails
      }
    }

    // Finally, check for default profile in config (only if no URL param or persisted profile)
    if (configStore.defaultProfile && !profileStore.activeProfileId) {
      try {
        this.logger.info('Applying default profile:', configStore.defaultProfile);
        const { ProfileManager } = await import('@/core/ProfileManager');
        const profileManager = ProfileManager.getInstance();
        await profileManager.applyProfile(configStore.defaultProfile);
      } catch (error) {
        this.logger.error('Failed to apply default profile:', error);
        // Don't throw - this shouldn't break SDK initialization
      }
    }
  }

  private static async processForceShippingId(): Promise<void> {
    const forceShippingId = (window as any)._nextForceShippingId;
    
    if (!forceShippingId) {
      return;
    }
    
    try {
      this.logger.info('Processing forceShippingId parameter:', forceShippingId);
      
      const cartStore = useCartStore.getState();
      const campaignStore = useCampaignStore.getState();
      
      // Parse the shipping ID (should be a number)
      const shippingId = parseInt(forceShippingId, 10);
      
      if (isNaN(shippingId) || shippingId <= 0) {
        throw new Error(`Invalid shipping ID: ${forceShippingId}`);
      }
      
      // Verify the shipping method exists in campaign data
      const campaignData = campaignStore.data;
      if (!campaignData?.shipping_methods) {
        this.logger.warn('No shipping methods available in campaign data');
        return;
      }
      
      const shippingMethod = campaignData.shipping_methods.find(
        method => method.ref_id === shippingId
      );
      
      if (!shippingMethod) {
        this.logger.warn(`Shipping method ${shippingId} not found in campaign data`);
        this.logger.debug('Available shipping methods:', 
          campaignData.shipping_methods.map(m => ({ id: m.ref_id, code: m.code, price: m.price }))
        );
        return;
      }
      
      // Set the shipping method
      await cartStore.setShippingMethod(shippingId);
      
      this.logger.info(`Successfully set shipping method: ${shippingMethod.code} (ID: ${shippingId}, Price: $${shippingMethod.price})`);
      
      // Clean up the temporary storage
      delete (window as any)._nextForceShippingId;
      
    } catch (error) {
      this.logger.error('Error processing forceShippingId parameter:', error);
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
    // Check if there's a ref_id or order_ref_id parameter in the URL
    const urlParams = new URLSearchParams(window.location.search);
    const refId = urlParams.get('ref_id') || urlParams.get('order_ref_id');

    if (refId) {
      const paramName = urlParams.get('ref_id') ? 'ref_id' : 'order_ref_id';
      this.logger.info(`Page loaded with ${paramName} parameter, auto-loading order:`, refId);

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

  private static async waitForStoreRehydration(): Promise<void> {
    // Wait for cart store to rehydrate from session storage
    // This is crucial to prevent display enhancers from initializing with empty state
    const cartStore = useCartStore.getState();
    
    // Check if there's data in sessionStorage that needs to be rehydrated
    // Using the shared constant from storage.ts ensures consistency
    const storedData = sessionStorage.getItem(CART_STORAGE_KEY);
    
    if (storedData) {
      this.logger.debug('Waiting for cart store rehydration...');
      const rehydrationStartTime = Date.now();
      
      // Give the store time to rehydrate and recalculate totals
      // The store's onRehydrateStorage callback calls calculateTotals()
      // We need to wait for that to complete
      await new Promise(resolve => {
        // Use a small timeout to ensure the rehydration process completes
        // This includes the async calculateTotals() call in the store
        setTimeout(resolve, 50);
      });
      
      // Force a recalculation to ensure everything is up to date
      await cartStore.calculateTotals();
      
      const rehydrationTime = Date.now() - rehydrationStartTime;
      
      this.logger.debug('Cart store rehydration complete', {
        itemCount: cartStore.items.length,
        total: cartStore.total,
        isEmpty: cartStore.isEmpty
      });
      
      // Track cart loaded event
      queueMicrotask(() => {
        AmplitudeAnalytics.trackCartLoaded({
          itemsCount: cartStore.items.length,
          cartValue: cartStore.total,
          loadTime: rehydrationTime,
          fromStorage: true
        });
      });
    } else {
      this.logger.debug('No cart data to rehydrate');
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

  private static async clearAllStorage(): Promise<void> {
    this.logger.info('Clearing all Next Campaign Cart storage...');
    
    // Clear sessionStorage items
    const sessionKeys = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key && (key.startsWith('next-') || key.startsWith('_next'))) {
        sessionKeys.push(key);
      }
    }
    sessionKeys.forEach(key => sessionStorage.removeItem(key));
    
    // Clear localStorage items
    const localKeys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith('next-') || key.startsWith('_next'))) {
        localKeys.push(key);
      }
    }
    localKeys.forEach(key => localStorage.removeItem(key));
    
    // Clear cookies (only those we can access)
    document.cookie.split(';').forEach(cookie => {
      const eqPos = cookie.indexOf('=');
      const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
      if (name.startsWith('next_') || name.startsWith('_next')) {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`;
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${window.location.hostname};`;
      }
    });
    
    this.logger.info(`Cleared ${sessionKeys.length} sessionStorage items, ${localKeys.length} localStorage items`);
  }
}