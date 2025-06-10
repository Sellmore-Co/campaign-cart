/**
 * TwentyNineNext - Core class for 29next client
 * 
 * This is a streamlined version focused primarily on checkout functionality.
 */

import { ApiClient } from '../api/ApiClient.js';
import { Logger } from '../utils/Logger.js';
import { CheckoutPage } from '../managers/CheckoutManager.js';
import { CampaignHelper } from '../helpers/CampaignHelper.js';
import { StateManager } from '../managers/StateManager.js';
import { CartManager } from '../managers/CartManager.js';
import { SelectorManager } from '../managers/SelectorManager.js';
import { ToggleManager } from '../managers/ToggleManager.js';
import { DebugManager } from '../managers/DebugManager.js';
import { TimerManager } from '../managers/TimerManager.js';
import { DisplayManager } from '../managers/DisplayManager.js';
import { CartDisplayManager } from '../managers/CartDisplayManager.js';
import { AttributionManager } from '../managers/AttributionManager.js';
import { EventManager } from '../managers/EventManager.js';
import { TooltipManager } from '../managers/TooltipManager.js';
import { UpsellManager } from '../managers/UpsellManager.js';
import { DiscountManager } from '../managers/DiscountManager.js';
import { CountryCampaignManager } from '../managers/CountryCampaignManager.js';
import { ProductProfileManager } from '../managers/ProductProfileManager.js';
import { CurrencyService } from '../services/CurrencyService.js';
import { initPBAccordion } from '../utils/PBAccordion.js';
import { initUtmTransfer } from '../utils/UtmTransfer.js';

export class TwentyNineNext {
  #isInitialized = false;
  #isCheckoutPage = false;
  #campaignData = null;
  #localizationData = null;

  constructor(options = {}) {
    // Get Google Maps config from window.osConfig if available
    const googleMapsConfig = window.osConfig?.googleMaps || {};
    
    this.options = {
      debug: false,
      autoInit: true,
      googleMapsApiKey: googleMapsConfig.apiKey || 'YOUR_API_KEY_HERE',
      googleMapsRegion: googleMapsConfig.region || 'US',
      enableGoogleMapsAutocomplete: googleMapsConfig.enableAutocomplete !== false,
      ...options
    };
    this.logger = new Logger(this.options.debug);
    this.coreLogger = this.logger.createModuleLogger('CORE');
    this.api = new ApiClient(this);
    this.config = this.#loadConfig();
    
    // Initialize country campaign manager (no longer requires countryCampaigns config)
    // It now handles country detection and currency display without campaign switching
    this.coreLogger.info('Initializing CountryCampaignManager for country detection');
    this.countryCampaign = new CountryCampaignManager(this);
    
    // Initialize product profile manager (after country campaign manager)
    this.profiles = new ProductProfileManager(this);
    
    // Initialize currency service conditionally (after country campaign manager)
    const multiCurrencyConfig = window.osConfig?.multiCurrency;
    const isMultiCurrencyEnabled = multiCurrencyConfig?.enabled !== false; // Default enabled for backward compatibility
    
    if (isMultiCurrencyEnabled) {
      this.coreLogger.info('Initializing CurrencyService (multi-currency enabled)');
      this.currency = new CurrencyService(this);
    } else {
      this.coreLogger.info('Multi-currency disabled, skipping CurrencyService initialization');
      // Create basic currency service for backward compatibility
      this.currency = {
        getCurrencySymbol: () => '$',
        getCurrencyCode: () => 'USD',
        formatPrice: (price) => `$${parseFloat(price || 0).toFixed(2)}`,
        convertPrice: (amount) => amount,
        getBaseCurrencyCode: () => 'USD',
        initializeExchangeRates: () => Promise.resolve(true),
        forceRefreshCurrency: () => Promise.resolve()
      };
    }
    
    this.state = new StateManager(this);
    this.attribution = new AttributionManager(this);
    this.discount = new DiscountManager(this);
    this.cart = new CartManager(this);
    this.campaign = new CampaignHelper(this);
    this.upsell = new UpsellManager(this);

    // After all essential managers (especially discount) are instantiated,
    // tell StateManager to perform its full initial calculation and update.
    if (this.state && typeof this.state.finalizeInitializationAndRecalculate === 'function') {
      this.state.finalizeInitializationAndRecalculate();
    } else {
      this.coreLogger.error('[TwentyNineNext Constructor] StateManager not ready or finalizeInitializationAndRecalculate not found!');
    }

    // Unified event system
    this.events = {
      on: (event, callback) => this.on(event, callback),
      once: (event, callback) => this.once(event, callback),
      off: (event, callback) => this.off(event, callback),
      trigger: (event, data) => this.triggerEvent(event, data),
    };

    if (this.options.autoInit) this.init();
  }

  // Event Listeners using DOM events
  on(event, callback) {
    const wrappedCallback = (e) => {
      try {
        callback(e.detail);
      } catch (error) {
        this.coreLogger.error(`Error in event callback for "${event}":`, error);
      }
    };
    document.addEventListener(`os:${event}`, wrappedCallback);
    this.coreLogger.debug(`Event listener registered for "${event}"`);
    return this;
  }

  once(event, callback) {
    const wrappedCallback = (e) => {
      try {
        callback(e.detail);
      } catch (error) {
        this.coreLogger.error(`Error in one-time event callback for "${event}":`, error);
      }
      document.removeEventListener(`os:${event}`, wrappedCallback);
    };
    document.addEventListener(`os:${event}`, wrappedCallback);
    this.coreLogger.debug(`One-time event listener registered for "${event}"`);
    return this;
  }

  off(event, callback) {
    document.removeEventListener(`os:${event}`, callback);
    return this;
  }

  #loadConfig() {
    const config = { apiKey: null, campaignId: null, debug: this.options.debug };
    
    // Check URL parameters for campaignId and store in sessionStorage if present
    const urlParams = new URLSearchParams(window.location.search);
    const urlCampaignId = urlParams.get('campaignId');
    if (urlCampaignId) {
      this.coreLogger.info(`Found campaignId in URL: ${urlCampaignId}`);
      sessionStorage.setItem('os-campaign-id', urlCampaignId);
      config.apiKey = urlCampaignId;
      config.campaignId = urlCampaignId;
      this.coreLogger.info('Saved campaignId to session storage and using as API key');
    } else {
      // Check sessionStorage for stored campaignId to use as API key
      const storedCampaignId = sessionStorage.getItem('os-campaign-id');
      if (storedCampaignId) {
        this.coreLogger.info(`Using campaign ID from session storage as API key: ${storedCampaignId}`);
        config.apiKey = storedCampaignId;
        config.campaignId = storedCampaignId;
      } else {
        // Fall back to meta tag for API key
        const apiKeyMeta = document.querySelector('meta[name="os-api-key"]');
        config.apiKey = apiKeyMeta?.getAttribute('content') ?? null;
        this.coreLogger.info(`API key from meta: ${config.apiKey ? '✓ Set' : '✗ Not set'}`);
        
        // Also check for campaign ID meta tag for reference
        const campaignIdMeta = document.querySelector('meta[name="os-campaign-id"]');
        config.campaignId = campaignIdMeta?.getAttribute('content') ?? null;
        this.coreLogger.info(`Campaign ID from meta: ${config.campaignId ? '✓ Set' : '✗ Not set'}`);
      }
    }

    const debugMeta = document.querySelector('meta[name="os-debug"]');
    if (debugMeta?.getAttribute('content') === 'true') {
      config.debug = true;
      this.logger.setDebug(true);
      this.coreLogger.info('Debug mode: ✓ Enabled');
    }
    
    // Initialize the spreedly configuration if present
    this.#initSpreedlyConfig();
    
    return config;
  }
  
  /**
   * Initialize Spreedly configuration from global config
   * This allows users to customize Spreedly iframe behavior
   */
  #initSpreedlyConfig() {
    // Ensure osConfig exists
    window.osConfig = window.osConfig || {};
    
    // If spreedlyConfig doesn't exist, create it with defaults
    if (!window.osConfig.spreedlyConfig) {
      this.coreLogger.debug('Initializing default Spreedly configuration');
      window.osConfig.spreedlyConfig = {
        fieldType: {
          number: 'text',
          cvv: 'text'
        },
        numberFormat: 'prettyFormat',
        placeholder: {
          number: 'Credit Card Number',
          cvv: 'CVV *'
        },
        labels: {
          number: 'Card Number',
          cvv: 'CVV'
        }
        // Other properties will use defaults from SpreedlyManager
      };
    } else {
      this.coreLogger.info('Found custom Spreedly configuration');
    }
  }

  async #loadGoogleMapsApi() {
    // Skip loading if autocomplete is disabled
    if (!this.options.enableGoogleMapsAutocomplete) {
      this.coreLogger.debug('Google Maps Autocomplete is disabled in configuration');
      return;
    }
    
    if (typeof google !== 'undefined' && typeof google.maps !== 'undefined') {
      this.coreLogger.debug('Google Maps API already loaded');
      return;
    }

    this.coreLogger.debug('Loading Google Maps API...');
    return new Promise((resolve) => {
      const script = document.createElement('script');
      
      // Use detected country as region if available, fallback to configured region
      const detectedCountry = this.countryCampaign?.getCurrentCountry();
      const regionToUse = detectedCountry || this.options.googleMapsRegion || 'US';
      const regionParam = `&region=${regionToUse}`;
      
      script.src = `https://maps.googleapis.com/maps/api/js?key=${this.options.googleMapsApiKey}&libraries=places${regionParam}`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        this.coreLogger.debug(`Google Maps API loaded successfully (region: ${regionToUse})`);
        resolve();
      };
      script.onerror = () => {
        this.coreLogger.error('Failed to load Google Maps API');
        resolve(); // Resolve to continue initialization
      };
      document.head.appendChild(script);
    });
  }

  /**
   * Load localization data first - this should be the very first thing we do
   */
  async #loadLocalizationData() {
    this.coreLogger.info('Loading localization data from Cloudflare Worker...');
    
    try {
      // Check for forceCountry parameter first
      const urlParams = new URLSearchParams(window.location.search);
      const forceCountry = urlParams.get('forceCountry');
      const multiCurrencyConfig = window.osConfig?.multiCurrency;
      const respectForceCountry = multiCurrencyConfig?.respectForceCountry !== false; // Default true
      
      if (forceCountry && respectForceCountry) {
        this.coreLogger.info(`ForceCountry parameter detected: ${forceCountry}, bypassing cache and fetching fresh data`);
        // Clear existing cache to ensure fresh data
        this.#clearLocalizationCache();
      } else {
        // Check cache first (24 hour TTL) only if no forceCountry
        const cached = this.#getLocalizationCache();
        if (cached) {
          this.#localizationData = cached;
          // CRITICAL: Make cached data globally available too!
          window.osLocalizationData = cached;
          this.coreLogger.info('Using cached localization data');
          return cached;
        }
      }

      // Load fresh data from worker
      const workerBaseUrl = 'https://cdn-countries.muddy-wind-c7ca.workers.dev';
      let url = `${workerBaseUrl}/location`;
      
      // Add forceCountry parameter if present and respected
      if (forceCountry && respectForceCountry) {
        url += `?forceCountry=${encodeURIComponent(forceCountry)}`;
        this.coreLogger.info(`Fetching localization data with forced country: ${forceCountry}`);
      }
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Store globally for all components to use
      this.#localizationData = {
        detectedCountryCode: data.detectedCountryCode,
        detectedCountryConfig: data.detectedCountryConfig,
        countries: data.countries || [],
        detectedStates: data.detectedStates || [],
        timestamp: Date.now()
      };
      
      // Cache the data
      this.#saveLocalizationCache(this.#localizationData);
      
      // Make globally available
      window.osLocalizationData = this.#localizationData;
      
      this.coreLogger.info(`Localization data loaded for country: ${data.detectedCountryCode}`);
      return this.#localizationData;
      
    } catch (error) {
      this.coreLogger.error('Failed to load localization data:', error);
      
      // Fallback to basic US data
      this.#localizationData = {
        detectedCountryCode: 'US',
        detectedCountryConfig: {
          currencyCode: 'USD',
          currencySymbol: '$'
        },
        countries: [],
        detectedStates: [],
        timestamp: Date.now()
      };
      
      window.osLocalizationData = this.#localizationData;
      return this.#localizationData;
    }
  }

  /**
   * Get cached localization data if valid
   */
  #getLocalizationCache() {
    try {
      const cached = localStorage.getItem('os_localization_cache');
      if (cached) {
        const data = JSON.parse(cached);
        const hoursSinceCached = (Date.now() - data.timestamp) / (1000 * 60 * 60);
        
        if (hoursSinceCached < 24) {
          this.coreLogger.debug(`Using cached localization data (${Math.round(hoursSinceCached)}h old)`);
          return data;
        } else {
          localStorage.removeItem('os_localization_cache');
          this.coreLogger.debug('Localization cache expired, will fetch fresh');
        }
      }
    } catch (error) {
      this.coreLogger.error('Error reading localization cache:', error);
      localStorage.removeItem('os_localization_cache');
    }
    return null;
  }

  /**
   * Save localization data to cache
   */
  #saveLocalizationCache(data) {
    try {
      localStorage.setItem('os_localization_cache', JSON.stringify(data));
      this.coreLogger.debug('Localization data cached');
    } catch (error) {
      this.coreLogger.error('Error caching localization data:', error);
    }
  }

  /**
   * Clear localization cache (used when forceCountry parameter is present)
   */
  #clearLocalizationCache() {
    try {
      localStorage.removeItem('os_localization_cache');
      this.coreLogger.debug('Localization cache cleared');
    } catch (error) {
      this.coreLogger.error('Error clearing localization cache:', error);
    }
  }

  async init() {
    this.coreLogger.info('Initializing 29next client (async init phase)');
    
    // LOAD LOCALIZATION DATA FIRST - before everything else
    await this.#loadLocalizationData();
    
    // Initialize country campaign system SECOND
    await this.#initCountryCampaignSystem();
    
    this.api.init();

    // Ensure window.on29NextReady is an array
    if (typeof window.on29NextReady !== 'undefined' && !Array.isArray(window.on29NextReady)) {
      this.coreLogger.warn('window.on29NextReady is not an array, resetting it');
      window.on29NextReady = [];
    }

    await this.#fetchCampaignData();
    await this.#loadGoogleMapsApi();
    
    // Initialize exchange rates for multi-currency support
    await this.#initializeExchangeRates();
    
    // Initialize managers early
    this.#initializeManagers();
    
    // Check for pending upsell purchases - needs to happen after EventManager is initialized
    await this.#checkForPendingUpsellPurchase();
    
    this.#isCheckoutPage = this.#detectCheckoutPage();
    if (this.#isCheckoutPage) {
      this.#initCheckoutPage();
      
      // Sync country selection on checkout pages with a small delay to ensure DOM elements are ready
      setTimeout(() => {
        if (this.countryCampaign && this.countryCampaign.isInitialized) {
          this.countryCampaign.syncCountrySelection();
        }
      }, 500);
    }

    this.#initUIUtilities();
    
    // Check for pending purchase events AFTER EventManager is initialized
    await this.#checkForPendingPurchaseEvents();

    this.#isInitialized = true;
    this.triggerEvent('initialized', { client: this });
    await this.#finalizeInitialization();
  }

  /**
   * Initialize exchange rates for multi-currency support
   */
  async #initializeExchangeRates() {
    try {
      // Check if multi-currency is enabled
      const multiCurrencyConfig = window.osConfig?.multiCurrency;
      const isMultiCurrencyEnabled = multiCurrencyConfig?.enabled !== false;
      const isExchangeRatesEnabled = multiCurrencyConfig?.enableExchangeRates !== false;
      
      if (!isMultiCurrencyEnabled) {
        this.coreLogger.info('💱 Multi-currency disabled, skipping exchange rates initialization');
        return;
      }
      
      if (!isExchangeRatesEnabled) {
        this.coreLogger.info('💱 Exchange rates disabled, skipping rates initialization');
        return;
      }
      
      this.coreLogger.info('🔄 Initializing exchange rates for multi-currency support...');
      this.coreLogger.info(`🔄 Currency service available: ${!!this.currency}`);
      
      if (!this.currency || typeof this.currency.initializeExchangeRates !== 'function') {
        this.coreLogger.error('❌ Currency service not available during exchange rates initialization');
        return;
      }
      
      const success = await this.currency.initializeExchangeRates();
      if (success) {
        this.coreLogger.info('✅ Exchange rates initialized successfully');
        
        // Test currency detection after rates are loaded
        const detectedCurrency = this.currency.getCurrencyCode();
        const baseCurrency = this.currency.getBaseCurrencyCode();
        this.coreLogger.info(`🔄 Post-init currency check - Detected: "${detectedCurrency}", Base: "${baseCurrency}"`);
      } else {
        this.coreLogger.warn('⚠️ Exchange rates initialization failed, will use fallback rates');
      }
    } catch (error) {
      this.coreLogger.error('❌ Failed to initialize exchange rates:', error);
    }
  }

  /**
   * Initialize the country campaign system
   */
  async #initCountryCampaignSystem() {
    try {
      this.coreLogger.info('Initializing country campaign system...');
      
      // Always make country campaign manager globally accessible first
      window.osCountryCampaignManager = this.countryCampaign;
      
      // Initialize the country campaign manager
      const result = await this.countryCampaign.init();
      
      if (result) {
        this.coreLogger.info(`Country campaign system initialized: ${result.country}`);
      } else {
        this.coreLogger.warn('Country campaign system initialization returned null, using fallback');
      }
      
      return result;
    } catch (error) {
      this.coreLogger.error('Failed to initialize country campaign system:', error);
      // Always ensure global access is set up even on error
      window.osCountryCampaignManager = this.countryCampaign;
      // Continue with normal initialization as fallback
      return null;
    }
  }

  async #fetchCampaignData() {
    try {
      this.coreLogger.info('Fetching campaign data...');
      this.#campaignData = await this.api.getCampaign();
      this.#campaignData = this.#campaignData || { packages: [] }; // Ensure packages array
      this.#campaignData.packages = this.#campaignData.packages || [];
      this.campaignData = this.#campaignData;

      this.coreLogger.info('Campaign data retrieved successfully');
      window.osConfig = window.osConfig || {};
      window.osConfig.campaign = this.#campaignData;
      window.dataLayer = window.dataLayer || [];
      
      // Set the funnel name using campaign data
      if (this.#campaignData.name && this.attribution) {
        // First check for meta tag (higher priority)
        const funnelMetaTag = document.querySelector('meta[name="os-tracking-tag"][data-tag-name="funnel_name"]');
        const funnelName = funnelMetaTag?.getAttribute('data-tag-value') || this.#campaignData.name;
        
        // Use our simplified method to set the funnel name
        this.attribution.setFunnelName(funnelName);
      }
      
      this.triggerEvent('campaign.loaded', { campaign: this.#campaignData });
    } catch (error) {
      this.coreLogger.error('Failed to retrieve campaign data:', error);
      this.#campaignData = {
        name: 'Default Campaign',
        packages: [],
        currency: 'USD',
        locale: 'en-US',
      };
      this.campaignData = this.#campaignData;
    }
  }

  #initializeManagers() {
    this.selector = new SelectorManager(this);
    this.toggle = new ToggleManager(this);
    this.timer = new TimerManager(this);
    this.display = new DisplayManager(this);
    this.eventManager = new EventManager(this);
    this.tooltip = new TooltipManager(this);

    if (
      this.#isCheckoutPage ||
      document.querySelector('[data-os-cart="line-display"]') ||
      document.querySelector('[os-cart="checkout-summary"]') ||
      document.querySelector('[data-os-cart-summary="grand-total"]')
    ) {
      this.coreLogger.info('Cart display elements detected, initializing CartDisplayManager');
      this.cartDisplay = new CartDisplayManager(this);
    }

    this.debug = new DebugManager(this);

    // Extend events with EventManager methods
    Object.assign(this.events, {
      emit: (event, data) => this.triggerEvent(event, data),
      viewItemList: (data) => this.eventManager.viewItemList(data || this.#campaignData),
      viewItem: (packageData) => this.eventManager.viewItem(packageData),
      addToCart: (cartData) => this.eventManager.addToCart(cartData),
      beginCheckout: () => this.eventManager.beginCheckout(),
      purchase: (orderData, force) => this.eventManager.purchase(orderData, force),
      fireCustomEvent: (eventName, eventData) => this.eventManager.fireCustomEvent(eventName, eventData),
    });
  }

  async #finalizeInitialization() {
    // Let SelectorManager handle view_item_list event
    // The #triggerViewItemList method in SelectorManager is now responsible for this
    await new Promise((resolve) => setTimeout(resolve, 800)); // Single delay for rendering
    this.#hidePreloader();
  }

  #hidePreloader() {
    const preloader = document.querySelector('div[os-element="preloader"]');
    if (preloader) {
      this.coreLogger.info('Hiding preloader element');
      preloader.style.transition = 'opacity 0.5s ease';
      preloader.style.opacity = '0';
      preloader.style.pointerEvents = 'none';
      this.coreLogger.debug('Preloader hidden');
    }
  }

  #detectCheckoutPage() {
    const pageTypeMeta = document.querySelector('meta[name="os-page-type"]');
    const pageType = pageTypeMeta?.getAttribute('content');
    if (pageType === 'checkout' || (!pageType && document.querySelector('form[os-checkout="form"]'))) {
      this.coreLogger.info('Checkout page detected');
      return true;
    }
    if (pageType === 'receipt') {
      this.coreLogger.info('Receipt page detected');
      this.#initReceiptPage();
    }
    if (pageType === 'upsell' || document.querySelector('[data-os-upsell]')) {
      this.coreLogger.info('Upsell page detected');
      this.#initUpsellPage();
    }
    return false;
  }

  #initCheckoutPage() {
    this.checkout = new CheckoutPage(this.api, this.coreLogger, this);
  }

  #initReceiptPage() {
    import('../managers/ReceiptManager.js')
      .then((module) => {
        const ReceiptPage = module.ReceiptPage;
        this.receipt = new ReceiptPage(this.api, this.coreLogger, this);
        this.coreLogger.info('Receipt page initialized');
        
        // No need to trigger order.loaded here anymore as it's handled globally
        // by the checkForPendingPurchaseEvents method
      })
      .catch((error) => this.coreLogger.error('Failed to load ReceiptPage module:', error));
  }

  #initUpsellPage() {
    this.coreLogger.info('Initializing upsell page');
    
    // Make sure the UpsellManager is initialized and available
    if (!this.upsell) {
      this.upsell = new UpsellManager(this);
      this.coreLogger.info('UpsellManager initialized for upsell page');
    }
    
    // Trigger upsell page events
    this.triggerEvent('upsell.pageview', {
      ref_id: new URLSearchParams(window.location.search).get('ref_id') || sessionStorage.getItem('order_ref_id')
    });
    
    // Check if we have a pending upsell purchase from previous page
    const hasPendingUpsell = sessionStorage.getItem('pending_upsell_purchase') === 'true';
    if (hasPendingUpsell) {
      this.coreLogger.info('Found pending upsell purchase, will be tracked by UpsellManager');
    }
  }

  #initUIUtilities() {
    this.coreLogger.info('Initializing UI utilities');
    try {
      const accordion = initPBAccordion();
      if (accordion) {
        this.pbAccordion = accordion;
        this.coreLogger.info('PBAccordion initialized');
      }
    } catch (error) {
      this.coreLogger.error('Failed to initialize PBAccordion:', error);
    }
    try {
      const utmTransfer = initUtmTransfer();
      if (utmTransfer) {
        this.utmTransfer = utmTransfer;
        this.coreLogger.info('UTM parameter transfer initialized');
      }
    } catch (error) {
      this.coreLogger.error('Failed to initialize UTM transfer:', error);
    }
  }

  triggerEvent(eventName, detail = {}) {
    this.coreLogger.debug(`Triggering event: ${eventName}`);
    const eventData = { ...detail, timestamp: Date.now(), client: this };
    
    // Debug log to see exact content of event data
    if (eventName === 'order.loaded') {
      this.coreLogger.debug('Event data for order.loaded:', JSON.stringify(eventData, null, 2));
    }
    
    const event = new CustomEvent(`os:${eventName}`, { bubbles: true, cancelable: true, detail: eventData });
    document.dispatchEvent(event);
    return event;
  }

  getCampaignData() {
    return this.#campaignData;
  }

  getLocalizationData() {
    return this.#localizationData;
  }

  /**
   * Get currency symbol from centralized currency service
   * @param {string} currencyCode - Optional currency code, defaults to detected currency
   * @returns {string} Currency symbol
   */
  getCurrencySymbol(currencyCode = null) {
    return this.currency.getCurrencySymbol(currencyCode);
  }

  /**
   * Get currency code from centralized currency service
   * @returns {string} Currency code
   */
  getCurrencyCode() {
    return this.currency.getCurrencyCode();
  }

  /**
   * Format a price with currency symbol from centralized currency service
   * @param {number} price - Price to format (in base currency)
   * @param {string} currencyCode - Optional currency code to convert to
   * @param {boolean} skipConversion - Skip currency conversion
   * @returns {string} Formatted price
   */
  formatPrice(price, currencyCode = null, skipConversion = false) {
    return this.currency.formatPrice(price, currencyCode, skipConversion);
  }

  /**
   * Convert price from one currency to another
   * @param {number} amount - Amount to convert
   * @param {string} fromCurrency - Source currency code
   * @param {string} toCurrency - Target currency code
   * @returns {number} Converted amount
   */
  convertPrice(amount, fromCurrency, toCurrency) {
    return this.currency.convertPrice(amount, fromCurrency, toCurrency);
  }

  /**
   * Get base currency code from campaign data
   * @returns {string} Base currency code
   */
  getBaseCurrencyCode() {
    return this.currency.getBaseCurrencyCode();
  }

  /**
   * Debug method to test currency service
   */
  debugCurrency() {
    console.log('🔧 [DEBUG] Testing CurrencyService...');
    console.log('🔧 Currency Service exists:', !!this.currency);
    console.log('🔧 Current Currency Code:', this.currency?.getCurrencyCode());
    console.log('🔧 Base Currency Code:', this.currency?.getBaseCurrencyCode());
    console.log('🔧 Currency Symbol:', this.currency?.getCurrencySymbol());
    console.log('🔧 Cache Status:', this.currency?.getCacheStatus());
    console.log('🔧 Localization Data:', window.osLocalizationData);
    console.log('🔧 Country Campaign Manager:', this.countryCampaign?.getCurrentCountry());
    return {
      currencyService: !!this.currency,
      currentCurrency: this.currency?.getCurrencyCode(),
      baseCurrency: this.currency?.getBaseCurrencyCode(),
      symbol: this.currency?.getCurrencySymbol(),
      country: this.countryCampaign?.getCurrentCountry()
    };
  }

  /**
   * Force refresh currency detection (for testing)
   */
  refreshCurrency() {
    return this.currency?.forceRefreshCurrency();
  }

  /**
   * Force refresh of localization data
   */
  async refreshLocalizationData() {
    this.coreLogger.info('Force refreshing localization data...');
    
    // Clear cache
    localStorage.removeItem('os_localization_cache');
    
    // Load fresh data
    await this.#loadLocalizationData();
    
    return this.#localizationData;
  }

  get isInitialized() {
    return this.#isInitialized;
  }

  get isCheckoutPage() {
    return this.#isCheckoutPage;
  }

  debugTriggerViewItemList() {
    console.log('🛠️ Manually triggering view_item_list event');
    if (!this.#campaignData) {
      console.error('❌ No campaign data available');
      return { success: false, message: 'No campaign data' };
    }
    if (!this.events.viewItemList) {
      console.error('❌ events.viewItemList not available');
      return { success: false, message: 'Event manager not initialized' };
    }
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ ecommerce: null });
    this.events.viewItemList(this.#campaignData);
    console.log('✅ view_item_list manually triggered');
    return { success: true, message: 'view_item_list event triggered', campaignData: this.#campaignData };
  }

  isReady() {
    return this.#isInitialized && this.#campaignData !== null && Array.isArray(this.#campaignData.packages);
  }

  onReady(callback) {
    if (!callback || typeof callback !== 'function') return this;
    if (this.isReady()) {
      try {
        callback(this);
      } catch (error) {
        this.coreLogger.error('Error in onReady callback:', error);
      }
    } else {
      this.once('initialized', () => {
        if (this.isReady()) callback(this);
      });
    }
    return this;
  }

  /**
   * Check for pending purchase events for orders with ref_id in URL
   */
  async #checkForPendingPurchaseEvents() {
    const refId = new URLSearchParams(window.location.search).get('ref_id');
    if (!refId) return;
    
    this.coreLogger.debug(`Checking for pending purchase events for ref_id: ${refId}`);
    
    // Check if this order has a pending purchase event
    const hasPendingEvent = sessionStorage.getItem(`pending_purchase_event_${refId}`) === 'true';
    
    if (hasPendingEvent) {
      this.coreLogger.info(`Found pending purchase event for order ${refId}`);
      
      // Check if EventManager is initialized before proceeding
      const isEventManagerReady = this.eventManager && this.eventManager.isInitialized;
      this.coreLogger.debug(`EventManager ready: ${isEventManagerReady}`);
      
      if (!isEventManagerReady) {
        this.coreLogger.warn('EventManager not ready yet, will not trigger order.loaded event');
        return;
      }
      
      try {
        const orderData = await this.api.getOrder(refId);
        if (orderData) {
          // Fix: Use the proper data structure expected by EventManager
          // EventManager expects data.order, not data.detail.order
          this.coreLogger.info(`Triggering order.loaded event for pending purchase ${refId}`);
          this.triggerEvent('order.loaded', { order: orderData });
          this.coreLogger.info(`Triggered order.loaded event for pending purchase ${refId}`);
          
          // Clear the pending flag
          sessionStorage.removeItem(`pending_purchase_event_${refId}`);
          this.coreLogger.debug(`Removed pending purchase flag for order ${refId}`);
        } else {
          this.coreLogger.warn(`Could not fetch order data for pending purchase ${refId}`);
        }
      } catch (error) {
        this.coreLogger.error(`Failed to load order data for pending purchase ${refId}:`, error);
      }
    } else {
      this.coreLogger.debug(`No pending purchase event for order ${refId}`);
    }
  }

  /**
   * Check for pending upsell purchases and track them
   * This runs on EVERY page load regardless of page type
   */
  async #checkForPendingUpsellPurchase() {
    try {
      const hasPendingUpsell = sessionStorage.getItem('pending_upsell_purchase') === 'true';
      
      if (hasPendingUpsell) {
        this.coreLogger.info('Found pending upsell purchase, processing tracking event');
        
        const upsellPurchaseData = sessionStorage.getItem('upsell_purchase_data');
        if (upsellPurchaseData) {
          // Parse the stored upsell purchase data
          const purchaseData = JSON.parse(upsellPurchaseData);
          
          // Send the purchase event through EventManager
          if (this.eventManager && typeof this.eventManager.purchase === 'function') {
            this.coreLogger.info('Triggering purchase event for upsell', purchaseData);
            // Force the purchase event to ensure it's tracked even if the main order was already tracked
            this.eventManager.purchase(purchaseData, true);
            
            // Also fire a custom os_accepted_upsell event for additional tracking
            if (typeof this.eventManager.fireCustomEvent === 'function') {
              // Create the custom event data
              const customEventData = {
                transaction_id: purchaseData.number,
                ref_id: purchaseData.ref_id,
                product_id: purchaseData.lines[0]?.product_id,
                product_name: purchaseData.lines[0]?.product_title,
                price: purchaseData.lines[0]?.price,
                quantity: purchaseData.lines[0]?.quantity,
                total: purchaseData.total,
                currency: purchaseData.currency
              };
              
              this.coreLogger.info('Triggering os_accepted_upsell custom event', customEventData);
              this.eventManager.fireCustomEvent('os_accepted_upsell', customEventData);
            }
          } else if (this.events && typeof this.events.purchase === 'function') {
            this.coreLogger.info('Triggering purchase event for upsell via events API', purchaseData);
            this.events.purchase(purchaseData, true);
            
            // Also fire a custom os_accepted_upsell event
            if (typeof this.events.fireCustomEvent === 'function') {
              // Create the custom event data
              const customEventData = {
                transaction_id: purchaseData.number,
                ref_id: purchaseData.ref_id,
                product_id: purchaseData.lines[0]?.product_id,
                product_name: purchaseData.lines[0]?.product_title,
                price: purchaseData.lines[0]?.price,
                quantity: purchaseData.lines[0]?.quantity,
                total: purchaseData.total,
                currency: purchaseData.currency
              };
              
              this.coreLogger.info('Triggering os_accepted_upsell custom event via events API', customEventData);
              this.events.fireCustomEvent('os_accepted_upsell', customEventData);
            }
          } else {
            this.coreLogger.warn('No method available to track upsell purchase');
          }
        }
        
        // Clear the pending upsell purchase flag regardless of tracking success
        sessionStorage.removeItem('pending_upsell_purchase');
        sessionStorage.removeItem('upsell_purchase_data');
        this.coreLogger.debug('Cleared pending upsell purchase data');
      }
    } catch (error) {
      this.coreLogger.error('Error checking for pending upsell purchase:', error);
    }
  }
}