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
import { initPBAccordion } from '../utils/PBAccordion.js';
import { initUtmTransfer } from '../utils/UtmTransfer.js';

export class TwentyNineNext {
  #isInitialized = false;
  #isCheckoutPage = false;
  #campaignData = null;

  constructor(options = {}) {
    this.options = {
      debug: false,
      autoInit: true,
      googleMapsApiKey: 'YOUR_API_KEY_HERE', // Replace with configurable key
      ...options
    };
    this.logger = new Logger(this.options.debug);
    this.coreLogger = this.logger.createModuleLogger('CORE');
    this.api = new ApiClient(this);
    this.config = this.#loadConfig();
    this.state = new StateManager(this);
    this.attribution = new AttributionManager(this);
    this.cart = new CartManager(this);
    this.campaign = new CampaignHelper(this);

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
    const apiKeyMeta = document.querySelector('meta[name="os-api-key"]');
    config.apiKey = apiKeyMeta?.getAttribute('content') ?? null;
    this.coreLogger.info(`API key: ${config.apiKey ? '✓ Set' : '✗ Not set'}`);

    const campaignIdMeta = document.querySelector('meta[name="os-campaign-id"]');
    config.campaignId = campaignIdMeta?.getAttribute('content') ?? null;
    this.coreLogger.info(`Campaign ID: ${config.campaignId ? '✓ Set' : '✗ Not set'}`);

    const debugMeta = document.querySelector('meta[name="os-debug"]');
    if (debugMeta?.getAttribute('content') === 'true') {
      config.debug = true;
      this.logger.setDebug(true);
      this.coreLogger.info('Debug mode: ✓ Enabled');
    }
    return config;
  }

  async #loadGoogleMapsApi() {
    if (typeof google !== 'undefined' && typeof google.maps !== 'undefined') {
      this.coreLogger.debug('Google Maps API already loaded');
      return;
    }

    this.coreLogger.debug('Loading Google Maps API...');
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${this.options.googleMapsApiKey}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        this.coreLogger.debug('Google Maps API loaded successfully');
        resolve();
      };
      script.onerror = () => {
        this.coreLogger.error('Failed to load Google Maps API');
        resolve(); // Resolve to continue initialization
      };
      document.head.appendChild(script);
    });
  }

  async init() {
    this.coreLogger.info('Initializing 29next client');
    this.api.init();

    // Ensure window.on29NextReady is an array
    if (typeof window.on29NextReady !== 'undefined' && !Array.isArray(window.on29NextReady)) {
      this.coreLogger.warn('window.on29NextReady is not an array, resetting it');
      window.on29NextReady = [];
    }

    await this.#fetchCampaignData();
    await this.#loadGoogleMapsApi();
    this.#isCheckoutPage = this.#detectCheckoutPage();
    if (this.#isCheckoutPage) this.#initCheckoutPage();

    this.#initializeManagers();
    this.#initUIUtilities();

    this.#isInitialized = true;
    this.triggerEvent('initialized', { client: this });
    await this.#finalizeInitialization();
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
    this.events.viewItemList(this.#campaignData);
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
    return false;
  }

  #initCheckoutPage() {
    this.checkout = new CheckoutPage(this.api, this.coreLogger, this);
  }

  #initReceiptPage() {
    import('../components/checkout/ReceiptPage.js')
      .then((module) => {
        const ReceiptPage = module.ReceiptPage;
        this.receipt = new ReceiptPage(this.api, this.coreLogger, this);
        this.coreLogger.info('Receipt page initialized');

        const refId = new URLSearchParams(window.location.search).get('ref_id');
        if (refId) {
          this.api.getOrder(refId)
            .then((orderData) => {
              if (orderData) this.triggerEvent('order.loaded', { order: orderData });
            })
            .catch((error) => this.coreLogger.error('Failed to load order data:', error));
        }
      })
      .catch((error) => this.coreLogger.error('Failed to load ReceiptPage module:', error));
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
    const event = new CustomEvent(`os:${eventName}`, { bubbles: true, cancelable: true, detail: eventData });
    document.dispatchEvent(event);
    return event;
  }

  getCampaignData() {
    return this.#campaignData;
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
}