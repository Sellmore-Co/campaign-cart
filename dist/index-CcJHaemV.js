import { c as createLogger, d as configStore, a as useCampaignStore, E as EventBus, u as useCartStore } from "./index-B40VgCtc.js";
const DEFAULT_DEBUG_CONFIG = {
  enabled: false,
  verbose: false,
  logEvents: true,
  logErrors: true,
  persistInLocalStorage: true
};
const DEFAULT_CONFIG = {
  debug: DEFAULT_DEBUG_CONFIG,
  providers: [],
  // transformFn: undefined, - omitted to avoid exactOptionalPropertyTypes issue
  enrichContext: true,
  sessionTimeout: 30 * 60 * 1e3,
  // 30 minutes
  eventValidation: true
};
const EVENT_VALIDATION_RULES = {
  // Required fields for all events
  required: ["event"],
  // Event-specific required fields
  eventSpecific: {
    purchase: ["ecommerce.transaction_id", "ecommerce.value", "ecommerce.items"],
    add_to_cart: ["ecommerce.items"],
    remove_from_cart: ["ecommerce.items"],
    view_item: ["ecommerce.items"],
    view_item_list: ["ecommerce.items"],
    begin_checkout: ["ecommerce.value"],
    add_payment_info: ["ecommerce.value"],
    add_shipping_info: ["ecommerce.value"]
  },
  // Field type validations
  fieldTypes: {
    "event": "string",
    "event_id": "string",
    "event_category": "string",
    "event_label": "string",
    "event_value": "number",
    "ecommerce.value": "number",
    "ecommerce.tax": "number",
    "ecommerce.shipping": "number",
    "ecommerce.discount": "number"
  }
};
const STORAGE_KEYS = {
  DEBUG_MODE: "nextDataLayer_debugMode",
  SESSION_ID: "nextDataLayer_sessionId",
  SESSION_START: "nextDataLayer_sessionStart",
  USER_PROPERTIES: "nextDataLayer_userProperties"
};
const logger$6 = createLogger("PendingEventsHandler");
const STORAGE_KEY$1 = "next_v2_pending_events";
class PendingEventsHandler {
  constructor() {
  }
  static getInstance() {
    if (!PendingEventsHandler.instance) {
      PendingEventsHandler.instance = new PendingEventsHandler();
    }
    return PendingEventsHandler.instance;
  }
  /**
   * Queue an event to be fired after redirect
   */
  queueEvent(event) {
    try {
      const pending = this.getPendingEvents();
      const pendingEvent = {
        event,
        timestamp: Date.now(),
        id: `${event.event}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      };
      pending.push(pendingEvent);
      sessionStorage.setItem(STORAGE_KEY$1, JSON.stringify(pending));
      logger$6.info(`Event queued for after redirect: ${event.event} (${pending.length} total queued)`);
    } catch (error) {
      logger$6.error("Failed to queue event:", error);
    }
  }
  /**
   * Get all pending events
   */
  getPendingEvents() {
    try {
      const data = sessionStorage.getItem(STORAGE_KEY$1);
      if (!data) return [];
      const events = JSON.parse(data);
      return Array.isArray(events) ? events : [];
    } catch (error) {
      logger$6.error("Failed to get pending events:", error);
      return [];
    }
  }
  /**
   * Process and fire all pending events
   */
  processPendingEvents() {
    const events = this.getPendingEvents();
    if (events.length === 0) {
      logger$6.debug("No pending analytics events to process");
      return;
    }
    logger$6.info(`Processing ${events.length} pending analytics events`);
    const processedIds = [];
    for (const pendingEvent of events) {
      try {
        if (Date.now() - pendingEvent.timestamp > 5 * 60 * 1e3) {
          logger$6.warn("Skipping stale event:", pendingEvent.event.event);
          processedIds.push(pendingEvent.id);
          continue;
        }
        dataLayer.push(pendingEvent.event);
        processedIds.push(pendingEvent.id);
        logger$6.debug("Processed pending event:", pendingEvent.event.event);
      } catch (error) {
        logger$6.error("Failed to process pending event:", pendingEvent.event.event, error);
      }
    }
    if (processedIds.length > 0) {
      const remaining = events.filter((e) => !processedIds.includes(e.id));
      if (remaining.length === 0) {
        sessionStorage.removeItem(STORAGE_KEY$1);
      } else {
        sessionStorage.setItem(STORAGE_KEY$1, JSON.stringify(remaining));
      }
      logger$6.debug("Removed processed events:", processedIds.length);
    }
  }
  /**
   * Clear all pending events
   */
  clearPendingEvents() {
    try {
      sessionStorage.removeItem(STORAGE_KEY$1);
      logger$6.debug("Cleared all pending events");
    } catch (error) {
      logger$6.error("Failed to clear pending events:", error);
    }
  }
  /**
   * Reset the handler (called by NextAnalytics)
   */
  reset() {
    this.clearPendingEvents();
    logger$6.debug("PendingEventsHandler reset");
  }
  /**
   * Initialize the handler (called by NextAnalytics)
   */
  initialize() {
    logger$6.debug("PendingEventsHandler initialized");
  }
}
const pendingEventsHandler = PendingEventsHandler.getInstance();
class DataLayerManager {
  constructor(config) {
    this.sequenceNumber = 0;
    this.debugMode = false;
    this.context = {};
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.initializeDataLayer();
    this.sessionId = this.getOrCreateSessionId();
    this.loadDebugMode();
    this.enrichContext();
  }
  /**
   * Get current context
   */
  getContext() {
    return this.context;
  }
  /**
   * Get singleton instance
   */
  static getInstance(config) {
    if (!DataLayerManager.instance) {
      DataLayerManager.instance = new DataLayerManager(config);
    }
    return DataLayerManager.instance;
  }
  /**
   * Initialize window.NextDataLayer array
   */
  initializeDataLayer() {
    if (typeof window === "undefined") return;
    if (!window.NextDataLayer) {
      window.NextDataLayer = [];
    }
    if (this.config.transformFn) {
      window.NextDataLayerTransformFn = this.config.transformFn;
    }
  }
  /**
   * Push event to data layer with validation
   */
  push(event) {
    try {
      if (this.config.eventValidation && !this.validateEvent(event)) {
        return;
      }
      const enrichedEvent = this.enrichEvent(event);
      let finalEvent = enrichedEvent;
      if (window.NextDataLayerTransformFn) {
        const transformed = window.NextDataLayerTransformFn(enrichedEvent);
        if (!transformed) {
          this.debug("Event filtered out by transform function", event);
          return;
        }
        finalEvent = transformed;
      }
      const willRedirect = finalEvent._willRedirect;
      this.debug(`Event ${finalEvent.event} has _willRedirect flag:`, willRedirect);
      delete finalEvent._willRedirect;
      if (willRedirect) {
        pendingEventsHandler.queueEvent(finalEvent);
        this.debug(`Event queued for after redirect: ${finalEvent.event}`, finalEvent);
        return;
      }
      window.NextDataLayer.push(finalEvent);
      this.debug("Event pushed to data layer", finalEvent);
      this.notifyProviders(finalEvent);
    } catch (error) {
      this.error("Error pushing event to data layer", error, event);
    }
  }
  /**
   * Enable/disable debug mode
   */
  setDebugMode(enabled, options) {
    this.debugMode = enabled;
    if (this.config.debug) {
      this.config.debug = { ...this.config.debug, enabled, ...options };
    }
    if (this.config.debug?.persistInLocalStorage) {
      try {
        localStorage.setItem(STORAGE_KEYS.DEBUG_MODE, JSON.stringify({ enabled, options }));
      } catch (e) {
        console.error("Failed to persist debug mode", e);
      }
    }
    this.debug(`Debug mode ${enabled ? "enabled" : "disabled"}`);
  }
  /**
   * Get current debug mode status
   */
  isDebugMode() {
    return this.debugMode;
  }
  /**
   * Invalidate context (for route changes)
   */
  invalidateContext() {
    this.context = {};
    this.enrichContext();
    this.debug("Context invalidated and re-enriched");
  }
  /**
   * Update user properties
   */
  setUserProperties(properties) {
    try {
      localStorage.setItem(STORAGE_KEYS.USER_PROPERTIES, JSON.stringify(properties));
      this.debug("User properties updated", properties);
    } catch (e) {
      this.error("Failed to save user properties", e);
    }
  }
  /**
   * Get stored user properties
   */
  getUserProperties() {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.USER_PROPERTIES);
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      this.error("Failed to load user properties", e);
      return null;
    }
  }
  /**
   * Clear all data
   */
  clear() {
    window.NextDataLayer = [];
    this.sequenceNumber = 0;
    this.context = {};
    this.enrichContext();
    this.debug("Data layer cleared");
  }
  /**
   * Validate event structure
   */
  validateEvent(event) {
    for (const field of EVENT_VALIDATION_RULES.required) {
      if (!this.getNestedValue(event, field)) {
        this.error(`Missing required field: ${field}`, null, event);
        return false;
      }
    }
    const eventRules = EVENT_VALIDATION_RULES.eventSpecific[event.event];
    if (eventRules) {
      for (const field of eventRules) {
        if (!this.getNestedValue(event, field)) {
          this.error(`Missing required field for ${event.event}: ${field}`, null, event);
          return false;
        }
      }
    }
    for (const [field, expectedType] of Object.entries(EVENT_VALIDATION_RULES.fieldTypes)) {
      const value = this.getNestedValue(event, field);
      if (value !== void 0 && typeof value !== expectedType) {
        this.error(`Invalid type for field ${field}: expected ${expectedType}, got ${typeof value}`, null, event);
        return false;
      }
    }
    return true;
  }
  /**
   * Enrich event with metadata and context
   */
  enrichEvent(event) {
    const metadata = {
      pushed_at: Date.now(),
      session_id: this.sessionId,
      sequence_number: ++this.sequenceNumber,
      debug_mode: this.debugMode,
      source: "NextDataLayer",
      version: "0.2.0"
    };
    const enrichedEvent = {
      ...event,
      _metadata: metadata
    };
    if (this.config.enrichContext) {
      enrichedEvent.event_time = enrichedEvent.event_time || (/* @__PURE__ */ new Date()).toISOString();
      enrichedEvent.event_id = enrichedEvent.event_id || this.generateEventId();
      const storedUserProperties = this.getUserProperties();
      if (storedUserProperties) {
        enrichedEvent.user_properties = {
          ...storedUserProperties,
          ...enrichedEvent.user_properties
        };
      }
    }
    return enrichedEvent;
  }
  /**
   * Enrich context information
   */
  enrichContext() {
    if (typeof window === "undefined") return;
    this.context = {
      page_location: window.location.href,
      page_title: document.title,
      page_referrer: document.referrer,
      user_agent: navigator.userAgent,
      screen_resolution: `${screen.width}x${screen.height}`,
      viewport_size: `${window.innerWidth}x${window.innerHeight}`,
      session_id: this.sessionId,
      timestamp: Date.now()
    };
  }
  /**
   * Get or create session ID
   */
  getOrCreateSessionId() {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SESSION_ID);
      const sessionStart = localStorage.getItem(STORAGE_KEYS.SESSION_START);
      const now = Date.now();
      const sessionTimeout = this.config.sessionTimeout || 30 * 60 * 1e3;
      if (stored && sessionStart && now - parseInt(sessionStart) < sessionTimeout) {
        localStorage.setItem(STORAGE_KEYS.SESSION_START, now.toString());
        return stored;
      }
      const newSessionId = this.generateSessionId();
      localStorage.setItem(STORAGE_KEYS.SESSION_ID, newSessionId);
      localStorage.setItem(STORAGE_KEYS.SESSION_START, now.toString());
      return newSessionId;
    } catch (e) {
      return this.generateSessionId();
    }
  }
  /**
   * Load debug mode from localStorage
   */
  loadDebugMode() {
    if (!this.config.debug?.persistInLocalStorage) return;
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.DEBUG_MODE);
      if (stored) {
        const { enabled, options } = JSON.parse(stored);
        this.debugMode = enabled;
        if (options && this.config.debug) {
          this.config.debug = { ...this.config.debug, ...options };
        }
      }
    } catch (e) {
    }
  }
  /**
   * Notify analytics providers
   */
  notifyProviders(event) {
    if (!this.config.providers) return;
    for (const provider of this.config.providers) {
      try {
        if (typeof provider.isEnabled === "function") {
          if (provider.isEnabled() && provider.trackEvent) {
            provider.trackEvent(event);
          }
        } else if (provider.enabled !== false && provider.trackEvent) {
          provider.trackEvent(event);
        }
      } catch (error) {
        this.error(`Error in provider ${provider.name || "unknown"}`, error, event);
      }
    }
  }
  /**
   * Generate unique event ID
   */
  generateEventId() {
    return `${this.sessionId}_${this.sequenceNumber}_${Date.now()}`;
  }
  /**
   * Generate session ID
   */
  generateSessionId() {
    return `${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }
  /**
   * Get nested value from object
   */
  getNestedValue(obj, path) {
    return path.split(".").reduce((current, key) => current?.[key], obj);
  }
  /**
   * Debug logging
   */
  debug(message, data) {
    if (!this.debugMode || !this.config.debug?.logEvents) return;
    const prefix = "[NextDataLayer]";
    if (this.config.debug?.verbose && data) {
      console.log(`${prefix} ${message}`, data);
    } else {
      console.log(`${prefix} ${message}`);
    }
  }
  /**
   * Error logging
   */
  error(message, error, data) {
    if (!this.config.debug?.logErrors) return;
    const prefix = "[NextDataLayer ERROR]";
    console.error(`${prefix} ${message}`, { error, data });
  }
  /**
   * Initialize the data layer (called by tracking components)
   */
  initialize() {
    this.initializeDataLayer();
    this.debug("Data layer initialized");
  }
  /**
   * Add a provider to receive events
   */
  addProvider(provider) {
    if (!this.config.providers) {
      this.config.providers = [];
    }
    this.config.providers.push(provider);
    this.debug(`Provider ${provider.name || "unknown"} added`);
  }
  /**
   * Set transform function
   */
  setTransformFunction(fn) {
    window.NextDataLayerTransformFn = fn;
    this.debug("Transform function set");
  }
  /**
   * Get event count for statistics
   */
  getEventCount() {
    return window.NextDataLayer?.length || 0;
  }
  /**
   * Format an ecommerce event
   */
  formatEcommerceEvent(eventName, data) {
    return {
      event: eventName,
      event_time: (/* @__PURE__ */ new Date()).toISOString(),
      data: data.data || data,
      ecommerce: data.ecommerce || data
    };
  }
  /**
   * Format a user data event
   */
  formatUserDataEvent(userData) {
    return {
      event: "dl_user_data",
      event_time: (/* @__PURE__ */ new Date()).toISOString(),
      user_properties: userData.user_properties || userData,
      cart_total: userData.cart_total,
      ecommerce: userData.ecommerce
    };
  }
}
const dataLayer = DataLayerManager.getInstance();
class ProviderAdapter {
  constructor(name) {
    this.enabled = true;
    this.name = name;
  }
  /**
   * Enable or disable the adapter
   */
  setEnabled(enabled) {
    this.enabled = enabled;
  }
  /**
   * Check if the adapter is enabled
   */
  isEnabled() {
    return this.enabled;
  }
  /**
   * Track event - called by DataLayerManager
   */
  trackEvent(event) {
    this.sendEvent(event);
  }
  /**
   * Transform event data to provider-specific format
   */
  transformEvent(event) {
    return {
      event: event.event,
      ...event.data
    };
  }
  /**
   * Log debug information
   */
  debug(message, data) {
    if (typeof window !== "undefined" && window.localStorage?.getItem("analytics_debug") === "true") {
      console.log(`[${this.name}]`, message, data || "");
    }
  }
  /**
   * Check if we're in a browser environment
   */
  isBrowser() {
    return typeof window !== "undefined";
  }
  /**
   * Safe property access helper
   */
  getNestedProperty(obj, path) {
    return path.split(".").reduce((current, key) => current?.[key], obj);
  }
  /**
   * Format currency values
   */
  formatCurrency(value) {
    return value.toFixed(2);
  }
  /**
   * Extract common ecommerce properties
   */
  extractEcommerceData(event) {
    const ecommerceData = event.ecommerce || event.data || {};
    return {
      currency: ecommerceData.currency || "USD",
      value: ecommerceData.value || ecommerceData.total || 0,
      items: ecommerceData.items || ecommerceData.products || [],
      transaction_id: ecommerceData.transaction_id || ecommerceData.order_id,
      coupon: ecommerceData.coupon || ecommerceData.discount_code,
      shipping: ecommerceData.shipping || 0,
      tax: ecommerceData.tax || 0
    };
  }
}
class GTMAdapter extends ProviderAdapter {
  constructor() {
    super("GTM");
  }
  /**
   * Track event - called by DataLayerManager
   */
  trackEvent(event) {
    this.sendEvent(event);
  }
  /**
   * Send event to Google Tag Manager
   */
  sendEvent(event) {
    if (!this.enabled || !this.isBrowser()) {
      return;
    }
    window.dataLayer = window.dataLayer || [];
    const gtmEvent = this.transformToGTMFormat(event);
    if (this.isEcommerceEvent(event.event)) {
      window.dataLayer.push({ ecommerce: null });
    }
    window.dataLayer.push(gtmEvent);
    this.debug("Event sent to GTM", gtmEvent);
  }
  /**
   * Transform event to GTM-specific format
   */
  transformToGTMFormat(event) {
    const baseEvent = {
      event: event.event,
      event_timestamp: event.timestamp,
      event_id: event.id
    };
    if (this.isEcommerceEvent(event.event)) {
      return {
        ...baseEvent,
        ecommerce: this.buildEcommerceObject(event)
      };
    }
    return {
      ...baseEvent,
      ...event.data
    };
  }
  /**
   * Build ecommerce object structure for GTM
   */
  buildEcommerceObject(event) {
    const ecommerceData = this.extractEcommerceData(event);
    const eventType = this.getEcommerceEventType(event.event);
    const ecommerceObject = {
      currency: ecommerceData.currency,
      value: parseFloat(this.formatCurrency(ecommerceData.value))
    };
    if (ecommerceData.items.length > 0) {
      ecommerceObject.items = this.formatItems(ecommerceData.items);
    }
    if (eventType === "purchase") {
      ecommerceObject.transaction_id = ecommerceData.transaction_id;
      ecommerceObject.affiliation = event.data?.affiliation || "Online Store";
      ecommerceObject.tax = ecommerceData.tax;
      ecommerceObject.shipping = ecommerceData.shipping;
      if (ecommerceData.coupon) {
        ecommerceObject.coupon = ecommerceData.coupon;
      }
    }
    if (eventType === "add_to_cart" && event.data?.cart_id) {
      ecommerceObject.cart_id = event.data.cart_id;
    }
    if (eventType === "view_item_list" && event.data?.item_list_name) {
      ecommerceObject.item_list_name = event.data.item_list_name;
      ecommerceObject.item_list_id = event.data.item_list_id;
    }
    return ecommerceObject;
  }
  /**
   * Format items array for GTM
   */
  formatItems(items) {
    return items.map((item, index) => ({
      item_id: item.item_id || item.id || item.product_id || item.sku,
      item_name: item.item_name || item.name || item.title,
      affiliation: item.affiliation || "Online Store",
      coupon: item.coupon || void 0,
      discount: item.discount || 0,
      index: item.index || index,
      item_brand: item.item_brand || item.brand,
      item_category: item.item_category || item.category,
      item_category2: item.item_category2 || item.category2,
      item_category3: item.item_category3 || item.category3,
      item_category4: item.item_category4 || item.category4,
      item_category5: item.item_category5 || item.category5,
      item_list_id: item.item_list_id || item.list_id,
      item_list_name: item.item_list_name || item.list_name,
      item_variant: item.item_variant || item.variant,
      location_id: item.location_id,
      price: parseFloat(this.formatCurrency(item.price || 0)),
      quantity: item.quantity || 1
    }));
  }
  /**
   * Check if event is an ecommerce event
   */
  isEcommerceEvent(eventName) {
    const ecommerceEvents = [
      "dl_add_to_cart",
      "dl_remove_from_cart",
      "dl_view_cart",
      "dl_begin_checkout",
      "dl_add_payment_info",
      "dl_add_shipping_info",
      "dl_purchase",
      "dl_view_item",
      "dl_view_item_list",
      "dl_select_item",
      "dl_select_promotion",
      "dl_view_promotion",
      // Standard GA4 ecommerce events
      "add_to_cart",
      "remove_from_cart",
      "view_cart",
      "begin_checkout",
      "add_payment_info",
      "add_shipping_info",
      "purchase",
      "view_item",
      "view_item_list",
      "select_item",
      "select_promotion",
      "view_promotion"
    ];
    return ecommerceEvents.includes(eventName);
  }
  /**
   * Get standardized ecommerce event type
   */
  getEcommerceEventType(eventName) {
    return eventName.replace(/^dl_/, "");
  }
}
class FacebookAdapter extends ProviderAdapter {
  constructor(config) {
    super("Facebook");
    this.blockedEvents = [];
    this.eventMapping = {
      // Data layer events to Facebook events
      "dl_page_view": "PageView",
      "dl_view_item": "ViewContent",
      "dl_add_to_cart": "AddToCart",
      "dl_remove_from_cart": "RemoveFromCart",
      "dl_begin_checkout": "InitiateCheckout",
      "dl_add_payment_info": "AddPaymentInfo",
      "dl_purchase": "Purchase",
      "dl_search": "Search",
      "dl_add_to_wishlist": "AddToWishlist",
      "dl_sign_up": "CompleteRegistration",
      "dl_login": "Login",
      "dl_subscribe": "Subscribe",
      "dl_start_trial": "StartTrial",
      "dl_view_cart": "ViewCart",
      // Upsell events - using custom events
      "dl_viewed_upsell": "ViewedUpsell",
      "dl_accepted_upsell": "AcceptedUpsell",
      "dl_skipped_upsell": "SkippedUpsell",
      // Standard event names
      "page_view": "PageView",
      "view_item": "ViewContent",
      "add_to_cart": "AddToCart",
      "remove_from_cart": "RemoveFromCart",
      "begin_checkout": "InitiateCheckout",
      "add_payment_info": "AddPaymentInfo",
      "purchase": "Purchase",
      "search": "Search",
      "add_to_wishlist": "AddToWishlist",
      "sign_up": "CompleteRegistration",
      "login": "Login",
      "subscribe": "Subscribe",
      "start_trial": "StartTrial",
      "view_cart": "ViewCart"
    };
    if (config?.blockedEvents) {
      this.blockedEvents = config.blockedEvents;
    }
  }
  /**
   * Track event - called by DataLayerManager
   */
  trackEvent(event) {
    this.sendEvent(event);
  }
  /**
   * Check if Facebook Pixel is loaded
   */
  isFbqLoaded() {
    return this.isBrowser() && typeof window.fbq === "function";
  }
  /**
   * Send event to Facebook Pixel
   */
  sendEvent(event) {
    if (!this.enabled) {
      this.debug("Facebook adapter disabled");
      return;
    }
    if (this.blockedEvents.includes(event.event)) {
      console.log(`[Analytics] Event "${event.event}" was blocked from being sent to Facebook`, {
        event: event.event,
        blockedEvents: this.blockedEvents,
        eventData: event
      });
      this.debug(`Event ${event.event} is blocked for Facebook`);
      return;
    }
    if (!this.isFbqLoaded()) {
      this.waitForFbq().then(() => {
        this.sendEventInternal(event);
      }).catch(() => {
        this.debug("Facebook Pixel failed to load, skipping event:", event.event);
      });
      return;
    }
    this.sendEventInternal(event);
  }
  /**
   * Wait for Facebook Pixel to be loaded
   */
  async waitForFbq(timeout = 5e3) {
    const start = Date.now();
    return new Promise((resolve, reject) => {
      const checkInterval = setInterval(() => {
        if (this.isFbqLoaded()) {
          clearInterval(checkInterval);
          resolve();
        } else if (Date.now() - start > timeout) {
          clearInterval(checkInterval);
          reject(new Error("Facebook Pixel load timeout"));
        }
      }, 100);
    });
  }
  /**
   * Internal method to send event after fbq is confirmed loaded
   */
  sendEventInternal(event) {
    const fbEventName = this.mapEventName(event.event);
    if (!fbEventName) {
      this.debug(`No Facebook mapping for event: ${event.event}`);
      return;
    }
    const parameters = this.transformParameters(event, fbEventName);
    try {
      if (window.fbq) {
        window.fbq("track", fbEventName, parameters);
        this.debug(`Event sent to Facebook: ${fbEventName}`, parameters);
      }
    } catch (error) {
      console.error("Error sending event to Facebook:", error);
    }
  }
  /**
   * Map data layer event name to Facebook event name
   */
  mapEventName(eventName) {
    return this.eventMapping[eventName] || null;
  }
  /**
   * Transform event parameters for Facebook Pixel
   */
  transformParameters(event, fbEventName) {
    if (event.data?.value) {
      parseFloat(this.formatCurrency(event.data.value));
    }
    if (event.data?.currency) {
      event.data.currency;
    }
    switch (fbEventName) {
      case "ViewContent":
        return this.buildViewContentParams(event);
      case "AddToCart":
      case "RemoveFromCart":
        return this.buildAddToCartParams(event);
      case "InitiateCheckout":
        return this.buildCheckoutParams(event);
      case "Purchase":
        return this.buildPurchaseParams(event);
      case "Search":
        return this.buildSearchParams(event);
      case "CompleteRegistration":
        return this.buildRegistrationParams(event);
      case "ViewedUpsell":
      case "AcceptedUpsell":
      case "SkippedUpsell":
        return this.buildUpsellParams(event, fbEventName);
      default:
        return this.buildGenericParams(event);
    }
  }
  /**
   * Build ViewContent parameters
   */
  buildViewContentParams(event) {
    const data = event.data || {};
    const items = data.items || data.products || [];
    const params = {
      content_type: "product",
      currency: data.currency || "USD",
      value: data.value || 0
    };
    if (items.length > 0) {
      params.content_ids = items.map(
        (item) => item.item_id || item.id || item.product_id || item.sku || item.external_id
      );
      params.contents = items.map((item) => ({
        id: item.item_id || item.id || item.product_id || item.sku || item.external_id,
        quantity: item.quantity || 1,
        item_price: item.price || item.item_price || 0
      }));
      params.content_name = items[0].item_name || items[0].name || items[0].title;
      params.content_category = items[0].item_category || items[0].category || "uncategorized";
    }
    return params;
  }
  /**
   * Build AddToCart/RemoveFromCart parameters
   */
  buildAddToCartParams(event) {
    const data = event.data || {};
    const items = data.items || data.products || [];
    const params = {
      content_type: "product",
      currency: data.currency || "USD",
      value: data.value || 0
    };
    if (items.length > 0) {
      params.content_ids = items.map(
        (item) => item.item_id || item.id || item.product_id || item.sku || item.external_id
      );
      const itemNames = items.map((item) => item.item_name || item.name || item.title).filter(Boolean);
      if (itemNames.length > 0) {
        params.content_name = itemNames.join(", ");
      }
      const firstItemCategory = items[0].item_category || items[0].category;
      if (firstItemCategory) {
        params.content_category = firstItemCategory;
      }
      const totalQuantity = items.reduce((sum, item) => sum + (item.quantity || 1), 0);
      params.num_items = totalQuantity;
      params.contents = items.map((item) => ({
        id: item.item_id || item.id || item.product_id || item.sku || item.external_id,
        quantity: item.quantity || 1,
        item_price: item.price || item.item_price || 0,
        // Include additional fields Facebook can use
        name: item.item_name || item.name,
        category: item.item_category || item.category || "uncategorized"
      }));
    }
    return params;
  }
  /**
   * Build InitiateCheckout parameters
   */
  buildCheckoutParams(event) {
    const data = event.data || {};
    const items = data.items || data.products || [];
    const params = {
      content_type: "product",
      currency: data.currency || "USD",
      value: data.value || data.total || 0,
      num_items: items.length
    };
    if (items.length > 0) {
      params.content_ids = items.map(
        (item) => item.item_id || item.id || item.product_id || item.sku || item.external_id
      );
      params.contents = items.map((item) => ({
        id: item.item_id || item.id || item.product_id || item.sku || item.external_id,
        quantity: item.quantity || 1,
        item_price: item.price || item.item_price || 0
      }));
    }
    if (data.coupon || data.discount_code) {
      params.coupon = data.coupon || data.discount_code;
    }
    return params;
  }
  /**
   * Build Purchase parameters
   */
  buildPurchaseParams(event) {
    const data = event.data || {};
    const items = data.items || data.products || [];
    const params = {
      content_type: "product",
      currency: data.currency || "USD",
      value: data.value || data.total || 0,
      num_items: items.length,
      order_id: data.transaction_id || data.order_id
    };
    if (items.length > 0) {
      params.content_ids = items.map(
        (item) => item.item_id || item.id || item.product_id || item.sku || item.external_id
      );
      params.contents = items.map((item) => ({
        id: item.item_id || item.id || item.product_id || item.sku || item.external_id,
        quantity: item.quantity || 1,
        item_price: item.price || item.item_price || 0
      }));
    }
    return params;
  }
  /**
   * Build Search parameters
   */
  buildSearchParams(event) {
    const data = event.data || {};
    return {
      search_string: data.search_term || data.query || "",
      content_category: data.category,
      content_ids: data.product_ids || []
    };
  }
  /**
   * Build Registration parameters
   */
  buildRegistrationParams(event) {
    const data = event.data || {};
    return {
      content_name: data.registration_method || "email",
      status: data.status || "completed",
      value: data.value || 0,
      currency: data.currency || "USD"
    };
  }
  /**
   * Build Upsell parameters
   */
  buildUpsellParams(event, fbEventName) {
    const params = {
      content_type: "product",
      order_id: event.order_id || event.data?.order_id,
      event_name: fbEventName
    };
    if (event.upsell) {
      params.content_ids = [event.upsell.package_id];
      params.content_name = event.upsell.package_name || `Package ${event.upsell.package_id}`;
      if (event.upsell.value !== void 0) {
        params.value = parseFloat(this.formatCurrency(event.upsell.value));
      }
      if (event.upsell.price !== void 0) {
        params.value = parseFloat(this.formatCurrency(event.upsell.price));
      }
      if (event.upsell.currency) {
        params.currency = event.upsell.currency;
      }
      if (event.upsell.quantity !== void 0) {
        params.num_items = event.upsell.quantity;
      }
    }
    return params;
  }
  /**
   * Build generic parameters for other events
   */
  buildGenericParams(event) {
    const data = event.data || {};
    const params = {};
    if (data.value !== void 0) {
      params.value = data.value;
    }
    if (data.currency) {
      params.currency = data.currency;
    }
    if (data.content_name) {
      params.content_name = data.content_name;
    }
    if (data.content_type) {
      params.content_type = data.content_type;
    }
    if (data.content_category) {
      params.content_category = data.content_category;
    }
    return params;
  }
}
const logger$5 = createLogger("RudderStack");
class RudderStackAdapter extends ProviderAdapter {
  constructor() {
    super("RudderStack");
    this.pageViewSent = false;
  }
  /**
   * Track event - called by DataLayerManager
   */
  trackEvent(event) {
    this.sendEvent(event);
  }
  /**
   * Check if RudderStack is loaded
   */
  isRudderStackLoaded() {
    return this.isBrowser() && typeof window.rudderanalytics === "object" && typeof window.rudderanalytics.track === "function";
  }
  /**
   * Send event to RudderStack
   */
  sendEvent(event) {
    if (!this.enabled) {
      this.debug("RudderStack adapter disabled");
      return;
    }
    logger$5.info(`Processing event "${event.event}"`, {
      eventName: event.event,
      eventData: event
    });
    if (!this.isRudderStackLoaded()) {
      this.waitForRudderStack().then(() => {
        this.sendEventInternal(event);
      }).catch(() => {
        this.debug("RudderStack failed to load, skipping event:", event.event);
      });
      return;
    }
    this.sendEventInternal(event);
  }
  /**
   * Wait for RudderStack to be loaded
   */
  async waitForRudderStack(timeout = 5e3) {
    const start = Date.now();
    return new Promise((resolve, reject) => {
      if (window.rudderanalytics?.ready) {
        window.rudderanalytics.ready(() => resolve());
        setTimeout(() => {
          if (this.isRudderStackLoaded()) {
            resolve();
          } else {
            reject(new Error("RudderStack ready timeout"));
          }
        }, timeout);
      } else {
        const checkInterval = setInterval(() => {
          if (this.isRudderStackLoaded()) {
            clearInterval(checkInterval);
            resolve();
          } else if (Date.now() - start > timeout) {
            clearInterval(checkInterval);
            reject(new Error("RudderStack load timeout"));
          }
        }, 100);
      }
    });
  }
  /**
   * Internal method to send event after RudderStack is confirmed loaded
   */
  sendEventInternal(event) {
    try {
      switch (event.event) {
        case "dl_page_view":
        case "page_view":
          this.handlePageView(event);
          break;
        case "dl_user_data":
        case "user_data":
          this.handleUserData(event);
          break;
        default:
          const rudderEventName = this.mapEventName(event.event);
          if (rudderEventName) {
            const properties = this.buildEventProperties(event, rudderEventName);
            window.rudderanalytics.track(rudderEventName, properties);
            this.debug(`Event sent to RudderStack: ${rudderEventName}`, properties);
          }
      }
    } catch (error) {
      console.error("Error sending event to RudderStack:", error);
    }
  }
  /**
   * Handle page view events
   */
  handlePageView(event) {
    if (this.pageViewSent) {
      this.debug("Page view already sent, skipping duplicate");
      return;
    }
    const data = event.data || {};
    const pageType = data.page_type || "unknown";
    const pageName = data.page_name || "unknown";
    const campaignData = this.getCampaignData(data);
    const properties = {
      path: data.page_location || window.location.pathname,
      url: data.page_location || window.location.href,
      title: data.page_title || document.title,
      referrer: data.page_referrer || document.referrer,
      campaignName: campaignData.campaignName,
      campaignApiKey: campaignData.campaignApiKey,
      campaignCurrency: campaignData.campaignCurrency,
      campaignLanguage: campaignData.campaignLanguage
    };
    window.rudderanalytics.page(pageType, pageName, properties);
    const pageTypeCapitalized = pageType.charAt(0).toUpperCase() + pageType.slice(1);
    const eventName = `${pageTypeCapitalized} Page View`;
    window.rudderanalytics.track(eventName, {
      pageName,
      ...properties
    });
    this.pageViewSent = true;
    this.debug("Page View tracked", { pageType, pageName, eventName });
  }
  /**
   * Handle user data events for identification
   */
  handleUserData(event) {
    const userData = event.user_properties || event.data || {};
    if (userData.customer_email || userData.email || userData.user_id) {
      const userId = userData.user_id || userData.customer_email || userData.email;
      const traits = {
        email: userData.customer_email || userData.email,
        firstName: userData.customer_first_name || userData.firstName || userData.first_name,
        lastName: userData.customer_last_name || userData.lastName || userData.last_name,
        phone: userData.customer_phone || userData.phone,
        city: userData.customer_city || userData.city,
        state: userData.customer_state || userData.state,
        country: userData.customer_country || userData.country,
        postalCode: userData.customer_zip || userData.postalCode || userData.postal_code,
        acceptsMarketing: userData.customer_accepts_marketing || userData.acceptsMarketing || userData.accepts_marketing
      };
      Object.keys(traits).forEach(
        (key) => traits[key] === void 0 && delete traits[key]
      );
      window.rudderanalytics.identify(userId, traits);
      this.debug("User Identified", { userId, traits });
    }
  }
  /**
   * Map data layer event names to RudderStack event names
   */
  mapEventName(eventName) {
    const eventMapping = {
      // Ecommerce events
      "dl_view_item": "Product Viewed",
      "dl_view_item_list": "Product List Viewed",
      "dl_add_to_cart": "Product Added",
      "dl_remove_from_cart": "Product Removed",
      "dl_view_cart": "Cart Viewed",
      "dl_cart_updated": "Cart Viewed",
      "dl_begin_checkout": "Checkout Started",
      "dl_purchase": "Order Completed",
      // Standard names
      "view_item": "Product Viewed",
      "view_item_list": "Product List Viewed",
      "add_to_cart": "Product Added",
      "remove_from_cart": "Product Removed",
      "view_cart": "Cart Viewed",
      "begin_checkout": "Checkout Started",
      "purchase": "Order Completed",
      // Upsell events
      "dl_viewed_upsell": "Upsell Viewed",
      "dl_accepted_upsell": "Upsell Accepted",
      "dl_skipped_upsell": "Upsell Skipped",
      // User events
      "dl_sign_up": "Signed Up",
      "dl_login": "Logged In",
      "sign_up": "Signed Up",
      "login": "Logged In"
    };
    return eventMapping[eventName] || null;
  }
  /**
   * Build event properties based on event type
   */
  buildEventProperties(event, rudderEventName) {
    const data = event.data || event.ecommerce || {};
    const pageMetadata = this.getPageMetadata();
    const campaignData = this.getCampaignData(data);
    const baseProps = {
      pageType: pageMetadata.pageType,
      pageName: pageMetadata.pageName,
      campaignName: campaignData.campaignName,
      campaignApiKey: campaignData.campaignApiKey
    };
    switch (rudderEventName) {
      case "Product Viewed":
        return this.buildProductViewedProps(data, baseProps);
      case "Product List Viewed":
        return this.buildProductListViewedProps(data, baseProps);
      case "Product Added":
      case "Product Removed":
        return this.buildProductAddedRemovedProps(data, baseProps);
      case "Cart Viewed":
        return this.buildCartViewedProps(data, baseProps);
      case "Checkout Started":
        return this.buildCheckoutStartedProps(data, baseProps);
      case "Order Completed":
        return this.buildOrderCompletedProps(data, baseProps);
      case "Upsell Viewed":
      case "Upsell Accepted":
      case "Upsell Skipped":
        return this.buildUpsellProps(event, rudderEventName, baseProps);
      default:
        return { ...data, ...baseProps };
    }
  }
  /**
   * Build Product Viewed properties
   */
  buildProductViewedProps(data, baseProps) {
    const items = data.items || [];
    const item = items[0] || {};
    return {
      product_id: item.item_id || "",
      sku: item.item_id || "",
      name: item.item_name || "",
      price: parseFloat(item.price) || 0,
      currency: data.currency || "USD",
      quantity: parseInt(item.quantity) || 1,
      position: item.position || 0,
      url: window.location.href,
      ...baseProps
    };
  }
  /**
   * Build Product List Viewed properties
   */
  buildProductListViewedProps(data, baseProps) {
    const products = this.formatProducts(data.items || []);
    return {
      list_id: data.list_id || "main-product-list",
      category: baseProps.pageType,
      products,
      currency: data.currency || "USD",
      ...baseProps
    };
  }
  /**
   * Build Product Added/Removed properties
   */
  buildProductAddedRemovedProps(data, baseProps) {
    const items = data.items || [];
    const item = items[0] || {};
    const campaignData = this.getCampaignData(data);
    return {
      cart_id: `cart-${Date.now()}`,
      product_id: item.item_id || "",
      sku: item.item_id || "",
      name: item.item_name || "",
      price: parseFloat(item.price) || 0,
      currency: data.currency || campaignData.campaignCurrency || "USD",
      quantity: parseInt(item.quantity) || 1,
      category: item.item_category || "",
      position: item.position || 0,
      url: window.location.href,
      ...baseProps
    };
  }
  /**
   * Build Cart Viewed properties
   */
  buildCartViewedProps(data, baseProps) {
    const products = this.formatProducts(data.items || []);
    const campaignData = this.getCampaignData(data);
    return {
      cart_id: `cart-${Date.now()}`,
      products,
      currency: data.currency || campaignData.campaignCurrency || "USD",
      value: parseFloat(data.value) || 0,
      ...baseProps
    };
  }
  /**
   * Build Checkout Started properties
   */
  buildCheckoutStartedProps(data, baseProps) {
    const products = this.formatProducts(data.items || []);
    const campaignData = this.getCampaignData(data);
    return {
      order_id: `pending-${Date.now()}`,
      value: parseFloat(data.value) || 0,
      revenue: parseFloat(data.value) || 0,
      currency: data.currency || campaignData.campaignCurrency || "USD",
      products,
      ...baseProps
    };
  }
  /**
   * Build Order Completed properties
   */
  buildOrderCompletedProps(data, baseProps) {
    const products = this.formatProducts(data.items || []);
    const campaignData = this.getCampaignData(data);
    const props = {
      checkout_id: `checkout-${Date.now()}`,
      order_id: data.transaction_id || "",
      affiliation: "Hanacure",
      total: parseFloat(data.value) || 0,
      revenue: parseFloat(data.value) || 0,
      shipping: parseFloat(data.shipping) || 0,
      tax: parseFloat(data.tax) || 0,
      discount: parseFloat(data.discount) || 0,
      coupon: data.coupon || "",
      currency: data.currency || campaignData.campaignCurrency || "USD",
      products,
      ...baseProps
    };
    if (data.email_hash || data.firstname) {
      const userId = data.email_hash || `user-${data.transaction_id}`;
      const traits = {
        firstName: data.firstname || "",
        lastName: data.lastname || "",
        city: data.city || "",
        state: data.state || "",
        postalCode: data.zipcode || "",
        country: data.country || ""
      };
      Object.keys(traits).forEach(
        (key) => traits[key] === "" && delete traits[key]
      );
      if (Object.keys(traits).length > 0) {
        window.rudderanalytics.identify(userId, traits);
        this.debug("User Identified on Purchase", { userId });
      }
    }
    return props;
  }
  /**
   * Build Upsell properties
   */
  buildUpsellProps(event, eventName, baseProps) {
    const data = event.data || event;
    const campaignData = this.getCampaignData(data);
    if (eventName === "Upsell Accepted") {
      const productProps = {
        cart_id: `cart-upsell-${Date.now()}`,
        product_id: data.upsell_id || "",
        sku: data.upsell_id || "",
        name: data.upsell_name || "",
        price: parseFloat(data.upsell_price) || 0,
        currency: data.currency || campaignData.campaignCurrency || "USD",
        quantity: 1,
        url: window.location.href,
        isUpsell: true,
        upsellRef: data.upsell_id || "",
        originalOrderId: data.order_id || data.transaction_id || "",
        ...baseProps
      };
      window.rudderanalytics.track("Product Added", productProps);
    }
    return {
      order_id: data.order_id || data.transaction_id || "",
      product_id: data.upsell_id || "",
      product_name: data.upsell_name || "",
      price: parseFloat(data.upsell_price) || 0,
      quantity: 1,
      total: parseFloat(data.value || data.upsell_price) || 0,
      currency: data.currency || campaignData.campaignCurrency || "USD",
      ref_id: data.upsell_id || "",
      ...baseProps
    };
  }
  /**
   * Format products array to match old integration format
   */
  formatProducts(items) {
    if (!items || !Array.isArray(items)) return [];
    return items.map((item) => ({
      product_id: item.item_id || item.id || "",
      sku: item.item_id || item.id || "",
      name: item.item_name || item.name || "",
      price: parseFloat(item.price) || 0,
      quantity: parseInt(item.quantity) || 1,
      category: item.item_category || item.category || "",
      brand: item.item_brand || "Hanacure",
      variant: item.item_variant || "",
      position: item.position || 0,
      url: window.location.href,
      image_url: item.image_url || ""
    }));
  }
  /**
   * Get page metadata
   */
  getPageMetadata() {
    const pageType = document.querySelector('meta[name="next-page-type"]')?.getAttribute("content") || "unknown";
    const pageName = document.querySelector('meta[name="next-page-name"]')?.getAttribute("content") || "unknown";
    return { pageType, pageName };
  }
  /**
   * Get campaign data from event or SDK
   */
  getCampaignData(data) {
    if (data.campaignName) {
      return {
        campaignName: data.campaignName,
        campaignApiKey: data.campaignApiKey || "",
        campaignCurrency: data.campaignCurrency || "USD",
        campaignLanguage: data.campaignLanguage || ""
      };
    }
    if (this.isBrowser() && window.next) {
      const sdk = window.next;
      const campaignData = sdk.getCampaignData?.();
      if (campaignData) {
        return {
          campaignName: campaignData.name || "",
          campaignApiKey: window.nextDebug?.stores?.config?.getState()?.apiKey || "",
          campaignCurrency: campaignData.currency || "USD",
          campaignLanguage: campaignData.language || ""
        };
      }
    }
    return {
      campaignName: "",
      campaignApiKey: "",
      campaignCurrency: "USD",
      campaignLanguage: ""
    };
  }
}
class NextCampaignAdapter extends ProviderAdapter {
  constructor() {
    super("NextCampaign");
    this.logger = createLogger("NextCampaignAdapter");
    this.scriptLoaded = false;
    this.scriptLoading = false;
    this.loadPromise = null;
    this.apiKey = "";
  }
  /**
   * Initialize the adapter with configuration
   */
  async initialize(config) {
    this.logger.info("NextCampaign adapter initializing...");
    if (config?.apiKey) {
      this.apiKey = config.apiKey;
      this.logger.info("API key provided via config parameter");
    } else {
      const configStore$1 = configStore.getState();
      this.apiKey = configStore$1.apiKey || "";
      this.logger.info(`API key from config store: ${this.apiKey ? "found" : "not found"}`);
    }
    if (!this.apiKey) {
      this.logger.warn("No API key available for NextCampaign initialization");
      return;
    }
    this.logger.info(`NextCampaign API key found: ${this.apiKey.substring(0, 8)}...${this.apiKey.substring(this.apiKey.length - 4)}`);
    await this.loadScript();
  }
  /**
   * Track event - called by DataLayerManager
   */
  trackEvent(event) {
    this.sendEvent(event);
  }
  /**
   * Send event to NextCampaign
   */
  async sendEvent(event) {
    if (!this.enabled) {
      this.debug("NextCampaign adapter disabled");
      return;
    }
    if (!this.scriptLoaded) {
      await this.loadScript();
    }
    const mappedEvent = this.mapEvent(event);
    if (mappedEvent) {
      try {
        if (window.nextCampaign) {
          window.nextCampaign.event(mappedEvent.name, mappedEvent.data);
          this.debug(`Event sent to NextCampaign: ${mappedEvent.name}`, mappedEvent.data);
        }
      } catch (error) {
        this.logger.error("Error sending event to NextCampaign:", error);
      }
    }
  }
  /**
   * Load the NextCampaign SDK script
   */
  async loadScript() {
    if (this.scriptLoaded) {
      return;
    }
    if (this.scriptLoading) {
      return this.loadPromise;
    }
    this.scriptLoading = true;
    this.loadPromise = this.performLoad();
    try {
      await this.loadPromise;
      this.scriptLoaded = true;
      this.logger.info("NextCampaign SDK loaded and initialized successfully ✅");
    } catch (error) {
      this.logger.error("Failed to load NextCampaign SDK:", error);
      throw error;
    } finally {
      this.scriptLoading = false;
    }
  }
  /**
   * Perform the actual script loading
   */
  async performLoad() {
    const scriptUrl = "https://campaigns.apps.29next.com/js/v1/campaign/";
    const existingScript = document.querySelector(`script[src="${scriptUrl}"]`);
    if (existingScript) {
      await this.waitForNextCampaign();
      return;
    }
    await new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.async = true;
      script.src = scriptUrl;
      script.onload = () => {
        this.logger.debug("NextCampaign script loaded");
        resolve();
      };
      script.onerror = () => {
        reject(new Error(`Failed to load NextCampaign script: ${scriptUrl}`));
      };
      document.head.appendChild(script);
    });
    await this.waitForNextCampaign();
    if (window.nextCampaign && this.apiKey) {
      window.nextCampaign.config({ apiKey: this.apiKey });
      this.logger.debug("NextCampaign configured with API key");
      this.fireInitialPageView();
    }
  }
  /**
   * Fire initial page view event on load
   */
  fireInitialPageView() {
    if (document.readyState === "complete") {
      this.sendPageView();
    } else {
      window.addEventListener("load", () => {
        this.sendPageView();
      });
    }
  }
  /**
   * Send page view event to NextCampaign
   */
  sendPageView() {
    try {
      if (window.nextCampaign) {
        window.nextCampaign.event("page_view", {
          title: document.title,
          url: window.location.href
        });
        this.logger.info("Initial page_view event sent to NextCampaign");
      }
    } catch (error) {
      this.logger.error("Error sending initial page view to NextCampaign:", error);
    }
  }
  /**
   * Wait for nextCampaign object to be available
   */
  async waitForNextCampaign(timeout = 5e3) {
    const start = Date.now();
    return new Promise((resolve, reject) => {
      const checkInterval = setInterval(() => {
        if (window.nextCampaign) {
          clearInterval(checkInterval);
          resolve();
        } else if (Date.now() - start > timeout) {
          clearInterval(checkInterval);
          reject(new Error("NextCampaign load timeout"));
        }
      }, 100);
    });
  }
  /**
   * Map DataLayer events to NextCampaign events
   * IMPORTANT: NextCampaign only tracks page_view events
   */
  mapEvent(event) {
    switch (event.event) {
      case "dl_page_view":
      case "page_view":
        return {
          name: "page_view",
          data: {
            title: document.title,
            url: window.location.href
          }
        };
      default:
        return null;
    }
  }
}
class CustomAdapter extends ProviderAdapter {
  constructor(config = {}) {
    super("Custom");
    this.eventQueue = [];
    this.batchTimer = null;
    this.retryQueue = /* @__PURE__ */ new Map();
    this.config = {
      endpoint: config.endpoint || "",
      headers: {
        "Content-Type": "application/json",
        ...config.headers
      },
      batchSize: config.batchSize || 10,
      batchIntervalMs: config.batchIntervalMs || 5e3,
      maxRetries: config.maxRetries || 3,
      retryDelayMs: config.retryDelayMs || 1e3,
      transformFunction: config.transformFunction || ((event) => event)
    };
  }
  /**
   * Update configuration
   */
  updateConfig(config) {
    this.config = { ...this.config, ...config };
    if (config.headers) {
      this.config.headers = { ...this.config.headers, ...config.headers };
    }
  }
  /**
   * Send event to custom endpoint
   */
  sendEvent(event) {
    if (!this.enabled || !this.config.endpoint) {
      this.debug("Custom adapter disabled or no endpoint configured");
      return;
    }
    this.eventQueue.push(event);
    this.debug(`Event queued. Queue size: ${this.eventQueue.length}`);
    if (this.eventQueue.length >= this.config.batchSize) {
      this.sendBatch();
    } else {
      this.scheduleBatch();
    }
  }
  /**
   * Schedule batch sending
   */
  scheduleBatch() {
    if (this.batchTimer) {
      return;
    }
    this.batchTimer = setTimeout(() => {
      this.sendBatch();
    }, this.config.batchIntervalMs);
  }
  /**
   * Send batch of events
   */
  async sendBatch() {
    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
      this.batchTimer = null;
    }
    const eventsToSend = this.eventQueue.splice(0, this.config.batchSize);
    if (eventsToSend.length === 0) {
      return;
    }
    this.debug(`Sending batch of ${eventsToSend.length} events`);
    try {
      const transformedEvents = eventsToSend.map(
        (event) => this.config.transformFunction(event)
      );
      const body = {
        events: transformedEvents,
        batch_info: {
          size: transformedEvents.length,
          timestamp: (/* @__PURE__ */ new Date()).toISOString(),
          source: "next-campaign-cart"
        }
      };
      const response = await this.sendRequest(body);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      this.debug(`Batch sent successfully`);
    } catch (error) {
      console.error("Error sending batch to custom endpoint:", error);
      eventsToSend.forEach((event) => {
        this.addToRetryQueue(event);
      });
    }
    if (this.eventQueue.length > 0) {
      this.scheduleBatch();
    }
  }
  /**
   * Send HTTP request with retry logic
   */
  async sendRequest(body, attempt = 1) {
    try {
      const response = await fetch(this.config.endpoint, {
        method: "POST",
        headers: this.config.headers,
        body: JSON.stringify(body)
      });
      return response;
    } catch (error) {
      if (attempt < this.config.maxRetries) {
        await this.delay(this.config.retryDelayMs * attempt);
        return this.sendRequest(body, attempt + 1);
      }
      throw error;
    }
  }
  /**
   * Add event to retry queue
   */
  addToRetryQueue(event) {
    const retryInfo = event.id ? this.retryQueue.get(event.id) : void 0;
    if (!retryInfo) {
      if (event.id) {
        this.retryQueue.set(event.id, { event, attempts: 1 });
        this.scheduleRetry(event.id);
      }
    } else if (retryInfo.attempts < this.config.maxRetries) {
      retryInfo.attempts++;
      if (event.id) {
        this.scheduleRetry(event.id);
      }
    } else {
      if (event.id) {
        this.retryQueue.delete(event.id);
      }
      console.error(`Failed to send event after ${this.config.maxRetries} attempts:`, event);
    }
  }
  /**
   * Schedule retry for a specific event
   */
  scheduleRetry(eventId) {
    const retryInfo = this.retryQueue.get(eventId);
    if (!retryInfo) return;
    const delay = this.config.retryDelayMs * retryInfo.attempts;
    setTimeout(() => {
      const info = this.retryQueue.get(eventId);
      if (info) {
        this.retryQueue.delete(eventId);
        this.sendEvent(info.event);
      }
    }, delay);
  }
  /**
   * Delay helper
   */
  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
  /**
   * Force send all queued events immediately
   */
  async flush() {
    this.debug("Flushing all queued events");
    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
      this.batchTimer = null;
    }
    while (this.eventQueue.length > 0) {
      await this.sendBatch();
    }
  }
  /**
   * Get current queue size
   */
  getQueueSize() {
    return this.eventQueue.length;
  }
  /**
   * Get retry queue size
   */
  getRetryQueueSize() {
    return this.retryQueue.size;
  }
  /**
   * Clear all queued events
   */
  clearQueue() {
    this.eventQueue = [];
    this.retryQueue.clear();
    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
      this.batchTimer = null;
    }
  }
}
const logger$4 = createLogger("ListAttributionTracker");
const STORAGE_KEY = "analytics_current_list";
const LIST_EXPIRY_MS = 30 * 60 * 1e3;
class ListAttributionTracker {
  constructor() {
    this.currentList = null;
    this.loadFromStorage();
    this.setupUrlTracking();
  }
  static getInstance() {
    if (!ListAttributionTracker.instance) {
      ListAttributionTracker.instance = new ListAttributionTracker();
    }
    return ListAttributionTracker.instance;
  }
  /**
   * Initialize the tracker (called by NextAnalytics)
   */
  initialize() {
    logger$4.debug("ListAttributionTracker initialized");
  }
  /**
   * Set the current list context
   */
  setCurrentList(listId, listName) {
    const context = {
      ...listId !== void 0 && { listId },
      ...listName !== void 0 && { listName },
      timestamp: Date.now(),
      url: window.location.href
    };
    this.currentList = context;
    this.saveToStorage();
    logger$4.debug("Set current list:", { listId, listName });
  }
  /**
   * Get the current list context if still valid
   */
  getCurrentList() {
    if (!this.currentList) {
      return null;
    }
    if (Date.now() - this.currentList.timestamp > LIST_EXPIRY_MS) {
      logger$4.debug("List context expired");
      this.clearCurrentList();
      return null;
    }
    return {
      ...this.currentList.listId !== void 0 && { listId: this.currentList.listId },
      ...this.currentList.listName !== void 0 && { listName: this.currentList.listName }
    };
  }
  /**
   * Clear the current list context
   */
  clearCurrentList() {
    this.currentList = null;
    this.removeFromStorage();
    logger$4.debug("Cleared current list");
  }
  /**
   * Reset the tracker (called by NextAnalytics)
   */
  reset() {
    this.clearCurrentList();
    logger$4.debug("ListAttributionTracker reset");
  }
  /**
   * Detect list from URL patterns
   */
  detectListFromUrl(url) {
    const targetUrl = url || window.location.href;
    const urlObj = new URL(targetUrl, window.location.origin);
    const pathname = urlObj.pathname.toLowerCase();
    const patterns = [
      // Collection pages
      { regex: /\/collections?\/([^\/]+)/, type: "collection" },
      // Category pages
      { regex: /\/category\/([^\/]+)/, type: "category" },
      { regex: /\/categories\/([^\/]+)/, type: "category" },
      // Product list pages
      { regex: /\/products\/?$/, type: "all_products" },
      { regex: /\/shop\/?$/, type: "shop" },
      { regex: /\/store\/?$/, type: "store" },
      // Search results
      { regex: /\/search/, type: "search" },
      // Tag pages
      { regex: /\/tag\/([^\/]+)/, type: "tag" },
      { regex: /\/tags\/([^\/]+)/, type: "tag" },
      // Brand pages
      { regex: /\/brand\/([^\/]+)/, type: "brand" },
      { regex: /\/brands\/([^\/]+)/, type: "brand" }
    ];
    for (const pattern of patterns) {
      const match = pathname.match(pattern.regex);
      if (match) {
        const listId = match[1] || pattern.type;
        const listName = this.formatListName(listId, pattern.type);
        logger$4.debug("Detected list from URL:", { listId, listName, type: pattern.type });
        return { listId, listName };
      }
    }
    const searchParams = urlObj.searchParams;
    if (searchParams.has("category")) {
      const category = searchParams.get("category");
      return {
        listId: category,
        listName: this.formatListName(category, "category")
      };
    }
    if (searchParams.has("collection")) {
      const collection = searchParams.get("collection");
      return {
        listId: collection,
        listName: this.formatListName(collection, "collection")
      };
    }
    if (searchParams.has("q") || searchParams.has("query") || searchParams.has("search")) {
      const query = searchParams.get("q") || searchParams.get("query") || searchParams.get("search") || "";
      return {
        listId: "search_results",
        listName: `Search Results: ${query}`
      };
    }
    return null;
  }
  /**
   * Automatically track list changes based on URL
   */
  setupUrlTracking() {
    if (typeof window === "undefined") {
      return;
    }
    this.trackCurrentUrl();
    window.addEventListener("popstate", () => {
      this.trackCurrentUrl();
    });
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;
    history.pushState = function(...args) {
      originalPushState.apply(history, args);
      setTimeout(() => ListAttributionTracker.getInstance().trackCurrentUrl(), 0);
    };
    history.replaceState = function(...args) {
      originalReplaceState.apply(history, args);
      setTimeout(() => ListAttributionTracker.getInstance().trackCurrentUrl(), 0);
    };
  }
  /**
   * Track the current URL for list context
   */
  trackCurrentUrl() {
    const detected = this.detectListFromUrl();
    if (detected) {
      this.setCurrentList(detected.listId, detected.listName);
    } else {
      const currentUrl = window.location.pathname.toLowerCase();
      if (!this.isProductPage(currentUrl)) {
        this.clearCurrentList();
      }
    }
  }
  /**
   * Check if URL is a product page (should preserve list context)
   */
  isProductPage(pathname) {
    const productPatterns = [
      /\/product\/[^\/]+/,
      /\/products\/[^\/]+/,
      /\/item\/[^\/]+/,
      /\/p\/[^\/]+/
    ];
    return productPatterns.some((pattern) => pattern.test(pathname));
  }
  /**
   * Format list name from ID
   */
  formatListName(listId, type) {
    const cleaned = listId.replace(/[-_]/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
    switch (type) {
      case "collection":
        return `${cleaned} Collection`;
      case "category":
        return `${cleaned} Category`;
      case "all_products":
        return "All Products";
      case "shop":
        return "Shop";
      case "store":
        return "Store";
      case "search":
        return "Search Results";
      case "tag":
        return `Tag: ${cleaned}`;
      case "brand":
        return `${cleaned} Brand`;
      default:
        return cleaned;
    }
  }
  /**
   * Load list context from storage
   */
  loadFromStorage() {
    if (typeof window === "undefined" || !window.sessionStorage) {
      return;
    }
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (stored) {
        const context = JSON.parse(stored);
        if (Date.now() - context.timestamp < LIST_EXPIRY_MS) {
          this.currentList = context;
          logger$4.debug("Loaded list context from storage:", context);
        } else {
          this.removeFromStorage();
        }
      }
    } catch (error) {
      logger$4.error("Error loading list context from storage:", error);
    }
  }
  /**
   * Save list context to storage
   */
  saveToStorage() {
    if (typeof window === "undefined" || !window.sessionStorage || !this.currentList) {
      return;
    }
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(this.currentList));
    } catch (error) {
      logger$4.error("Error saving list context to storage:", error);
    }
  }
  /**
   * Remove list context from storage
   */
  removeFromStorage() {
    if (typeof window === "undefined" || !window.sessionStorage) {
      return;
    }
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      logger$4.error("Error removing list context from storage:", error);
    }
  }
}
const listAttributionTracker = ListAttributionTracker.getInstance();
const logger$3 = createLogger("ViewItemListTracker");
class ViewItemListTracker {
  constructor() {
    this.observer = null;
    this.trackedProducts = /* @__PURE__ */ new Set();
    this.lastScanTime = 0;
    this.scanDebounceMs = 500;
    this.isInitialized = false;
  }
  static getInstance() {
    if (!ViewItemListTracker.instance) {
      ViewItemListTracker.instance = new ViewItemListTracker();
    }
    return ViewItemListTracker.instance;
  }
  /**
   * Initialize the tracker
   */
  initialize() {
    if (this.isInitialized || typeof window === "undefined") {
      return;
    }
    this.isInitialized = true;
    dataLayer.initialize();
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => this.scan());
    } else {
      setTimeout(() => this.scan(), 100);
    }
    this.setupObserver();
    logger$3.info("ViewItemListTracker initialized");
  }
  /**
   * Scan the page for products and fire appropriate events
   */
  scan() {
    const now = Date.now();
    if (now - this.lastScanTime < this.scanDebounceMs) {
      logger$3.debug("Scan debounced (too soon after last scan)");
      return;
    }
    this.lastScanTime = now;
    const products = this.findProductElements();
    if (products.length === 0) {
      logger$3.debug("No products found on page");
      return;
    }
    logger$3.debug(`Found ${products.length} products on page`);
    if (products.length === 1) {
      const product = products[0];
      if (product) {
        this.trackViewItem(product);
      }
    } else {
      this.trackViewItemList(products);
    }
  }
  /**
   * Rescan the page (public method for manual triggering)
   */
  rescan() {
    logger$3.debug("Manual rescan triggered");
    this.trackedProducts.clear();
    this.scan();
  }
  /**
   * Find all product elements on the page
   */
  findProductElements() {
    const elements = document.querySelectorAll("[data-next-package-id]");
    const products = [];
    const seen = /* @__PURE__ */ new Set();
    elements.forEach((element, index) => {
      const packageId = element.getAttribute("data-next-package-id");
      if (packageId && !seen.has(packageId)) {
        seen.add(packageId);
        products.push({
          packageId,
          element,
          index
        });
      }
    });
    return products;
  }
  /**
   * Track a single product view
   */
  trackViewItem(product) {
    if (this.trackedProducts.has(product.packageId)) {
      logger$3.debug("Product already tracked:", product.packageId);
      return;
    }
    const campaignStore = useCampaignStore.getState();
    if (!campaignStore.data || !campaignStore.packages || campaignStore.packages.length === 0) {
      logger$3.debug("Campaign data not yet loaded, deferring tracking");
      setTimeout(() => this.scan(), 1e3);
      return;
    }
    const packageIdNum = parseInt(product.packageId, 10);
    const packageData = !isNaN(packageIdNum) ? campaignStore.getPackage(packageIdNum) : null;
    if (!packageData) {
      logger$3.warn("Package not found in store:", product.packageId);
      return;
    }
    const listContext = listAttributionTracker.getCurrentList();
    const item = {
      item_id: packageData.external_id.toString(),
      // Use external_id for analytics
      item_name: packageData.name || `Package ${product.packageId}`,
      currency: campaignStore.data?.currency || "USD",
      price: parseFloat(packageData.price_total || "0"),
      // Use total package price
      quantity: 1,
      // Always 1 for package-based pricing
      item_category: "uncategorized",
      item_variant: void 0,
      ...listContext && {
        item_list_id: listContext.listId,
        item_list_name: listContext.listName
      }
    };
    const event = dataLayer.formatEcommerceEvent("dl_view_item", {
      currency: item.currency,
      value: item.price,
      items: [item]
    });
    dataLayer.push(event);
    this.trackedProducts.add(product.packageId);
    logger$3.debug("Tracked view_item:", product.packageId);
  }
  /**
   * Track multiple products view
   */
  trackViewItemList(products) {
    const campaignStore = useCampaignStore.getState();
    const items = [];
    let totalValue = 0;
    if (!campaignStore.data || !campaignStore.packages || campaignStore.packages.length === 0) {
      logger$3.debug("Campaign data not yet loaded, deferring tracking");
      setTimeout(() => this.scan(), 1e3);
      return;
    }
    const listContext = listAttributionTracker.getCurrentList() || listAttributionTracker.detectListFromUrl() || { listId: "product_list", listName: "Product List" };
    products.forEach((product, index) => {
      if (this.trackedProducts.has(product.packageId)) {
        return;
      }
      const packageIdNum = parseInt(product.packageId, 10);
      const packageData = !isNaN(packageIdNum) ? campaignStore.getPackage(packageIdNum) : null;
      if (!packageData) {
        logger$3.warn("Package not found in store:", product.packageId);
        return;
      }
      const price = parseFloat(packageData.price_total || "0");
      totalValue += price;
      items.push({
        item_id: packageData.external_id.toString(),
        // Use external_id for analytics
        item_name: packageData.name || `Package ${product.packageId}`,
        currency: campaignStore.data?.currency || "USD",
        price,
        quantity: 1,
        // Always 1 for package-based pricing
        item_category: "uncategorized",
        item_variant: void 0,
        item_list_id: listContext.listId,
        item_list_name: listContext.listName,
        index
      });
      this.trackedProducts.add(product.packageId);
    });
    if (items.length === 0) {
      logger$3.debug("No new products to track");
      return;
    }
    const event = dataLayer.formatEcommerceEvent("dl_view_item_list", {
      currency: campaignStore.data?.currency || "USD",
      value: totalValue,
      items,
      item_list_id: listContext.listId,
      item_list_name: listContext.listName
    });
    dataLayer.push(event);
    logger$3.debug(`Tracked view_item_list with ${items.length} items`);
  }
  /**
   * Set up mutation observer for dynamic content
   */
  setupObserver() {
    if (typeof window === "undefined" || !window.MutationObserver) {
      return;
    }
    this.observer = new MutationObserver((mutations) => {
      let hasRelevantChanges = false;
      for (const mutation of mutations) {
        if (mutation.type === "childList") {
          for (let i = 0; i < mutation.addedNodes.length; i++) {
            const node = mutation.addedNodes[i];
            if (node && node.nodeType === Node.ELEMENT_NODE) {
              const element = node;
              if (element.hasAttribute("data-next-package-id") || element.querySelector("[data-next-package-id]")) {
                hasRelevantChanges = true;
                break;
              }
            }
          }
        } else if (mutation.type === "attributes" && mutation.attributeName === "data-next-package-id") {
          hasRelevantChanges = true;
        }
        if (hasRelevantChanges) {
          break;
        }
      }
      if (hasRelevantChanges) {
        logger$3.debug("Detected DOM changes with products");
        this.scan();
      }
    });
    this.observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["data-next-package-id"]
    });
    logger$3.debug("Mutation observer set up");
  }
  /**
   * Reset the tracker (for route changes)
   */
  reset() {
    this.trackedProducts.clear();
    logger$3.debug("ViewItemListTracker reset");
    if (this.isInitialized) {
      this.scan();
    }
  }
  /**
   * Clean up the tracker
   */
  destroy() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
    this.trackedProducts.clear();
    this.isInitialized = false;
    logger$3.debug("ViewItemListTracker destroyed");
  }
  /**
   * Get tracking status
   */
  getStatus() {
    return {
      initialized: this.isInitialized,
      trackedCount: this.trackedProducts.size,
      observing: this.observer !== null
    };
  }
}
ViewItemListTracker.getInstance();
const logger$2 = createLogger("UserDataTracker");
class UserDataTracker {
  constructor() {
    this.eventBus = EventBus.getInstance();
    this.lastTrackTime = 0;
    this.trackDebounceMs = 1e3;
    this.isInitialized = false;
    this.unsubscribers = [];
  }
  static getInstance() {
    if (!UserDataTracker.instance) {
      UserDataTracker.instance = new UserDataTracker();
    }
    return UserDataTracker.instance;
  }
  /**
   * Initialize the tracker
   */
  initialize() {
    if (this.isInitialized || typeof window === "undefined") {
      return;
    }
    this.isInitialized = true;
    dataLayer.initialize();
    this.trackUserData();
    this.setupListeners();
    logger$2.info("UserDataTracker initialized");
  }
  /**
   * Track user data event
   */
  trackUserData() {
    const now = Date.now();
    if (now - this.lastTrackTime < this.trackDebounceMs) {
      logger$2.debug("User data tracking debounced");
      return;
    }
    this.lastTrackTime = now;
    const userData = this.collectUserData();
    if (!userData || Object.keys(userData).length === 0) {
      logger$2.debug("No user data to track");
      return;
    }
    const event = dataLayer.formatUserDataEvent(userData);
    dataLayer.push(event);
    logger$2.debug("Tracked user data:", {
      hasUserId: !!userData.userId,
      hasEmail: !!userData.email,
      cartValue: userData.cartValue,
      cartItems: userData.cartItems
    });
  }
  /**
   * Collect user data from stores
   */
  collectUserData() {
    const userData = {};
    try {
      const storedUser = sessionStorage.getItem("user_data");
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        userData.userId = parsedUser.id || parsedUser.userId;
        userData.email = parsedUser.email;
        userData.phone = parsedUser.phone;
        userData.firstName = parsedUser.firstName;
        userData.lastName = parsedUser.lastName;
      }
      const sessionId = sessionStorage.getItem("session_id");
      const visitorId = sessionStorage.getItem("visitor_id") || localStorage.getItem("visitor_id");
      if (sessionId) {
        userData.sessionId = sessionId;
      }
      if (visitorId) {
        userData.visitorId = visitorId;
      }
    } catch (error) {
      logger$2.debug("Error accessing user data from storage:", error);
    }
    try {
      const cartState = useCartStore.getState();
      if (cartState.items && cartState.items.length > 0) {
        userData.cartValue = cartState.total || cartState.subtotal || 0;
        userData.cartItems = cartState.totalQuantity || 0;
        userData.cartProducts = cartState.items.map(
          (item) => item.packageId?.toString() || "unknown"
        );
      } else {
        userData.cartValue = 0;
        userData.cartItems = 0;
        userData.cartProducts = [];
      }
    } catch (error) {
      logger$2.debug("Cart store not available or error accessing:", error);
    }
    try {
      const checkoutData = this.getCheckoutData();
      if (checkoutData) {
        Object.assign(userData, checkoutData);
      }
    } catch (error) {
      logger$2.debug("Error getting checkout data:", error);
    }
    return userData;
  }
  /**
   * Get checkout data from form fields if available
   */
  getCheckoutData() {
    if (typeof document === "undefined") {
      return null;
    }
    const checkoutData = {};
    const fieldMappings = [
      { selector: '[name="email"], #email, [type="email"]', key: "email" },
      { selector: '[name="phone"], #phone, [type="tel"]', key: "phone" },
      { selector: '[name="first_name"], [name="firstName"], #first-name', key: "firstName" },
      { selector: '[name="last_name"], [name="lastName"], #last-name', key: "lastName" },
      { selector: '[name="address"], [name="address1"], #address', key: "address" },
      { selector: '[name="city"], #city', key: "city" },
      { selector: '[name="state"], [name="province"], #state', key: "state" },
      { selector: '[name="zip"], [name="postal_code"], #zip', key: "postalCode" },
      { selector: '[name="country"], #country', key: "country" }
    ];
    fieldMappings.forEach(({ selector, key }) => {
      const element = document.querySelector(selector);
      if (element && element.value) {
        checkoutData[key] = element.value;
      }
    });
    return Object.keys(checkoutData).length > 0 ? checkoutData : null;
  }
  /**
   * Set up event listeners
   */
  setupListeners() {
    this.eventBus.on("route:changed", () => {
      logger$2.debug("Route changed, tracking user data");
      this.trackUserData();
    });
    this.eventBus.on("sdk:route-invalidated", () => {
      logger$2.debug("SDK route invalidated, tracking user data");
      this.trackUserData();
    });
    this.eventBus.on("user:logged-in", () => {
      logger$2.debug("User logged in, tracking user data");
      setTimeout(() => this.trackUserData(), 100);
    });
    this.eventBus.on("user:logged-out", () => {
      logger$2.debug("User logged out, tracking user data");
      setTimeout(() => this.trackUserData(), 100);
    });
    this.eventBus.on("cart:updated", () => {
      logger$2.debug("Cart updated, tracking user data");
      this.trackUserData();
    });
    const unsubscribeCart = useCartStore.subscribe(() => {
      logger$2.debug("Cart store changed, tracking user data");
      this.trackUserData();
    });
    this.unsubscribers.push(unsubscribeCart);
    if (typeof window !== "undefined") {
      window.addEventListener("popstate", () => {
        logger$2.debug("Browser navigation, tracking user data");
        this.trackUserData();
      });
      const originalPushState = history.pushState;
      const originalReplaceState = history.replaceState;
      history.pushState = function(...args) {
        originalPushState.apply(history, args);
        setTimeout(() => UserDataTracker.getInstance().trackUserData(), 0);
      };
      history.replaceState = function(...args) {
        originalReplaceState.apply(history, args);
        setTimeout(() => UserDataTracker.getInstance().trackUserData(), 0);
      };
    }
    logger$2.debug("User data tracking listeners set up");
  }
  /**
   * Force track user data (bypasses debounce)
   */
  forceTrack() {
    this.lastTrackTime = 0;
    this.trackUserData();
  }
  /**
   * Reset the tracker (called by NextAnalytics)
   */
  reset() {
    this.lastTrackTime = 0;
    this.trackUserData();
    logger$2.debug("UserDataTracker reset");
  }
  /**
   * Clean up the tracker
   */
  destroy() {
    this.unsubscribers.forEach((unsubscribe) => unsubscribe());
    this.unsubscribers = [];
    this.eventBus.removeAllListeners("route:changed");
    this.eventBus.removeAllListeners("sdk:route-invalidated");
    this.eventBus.removeAllListeners("user:logged-in");
    this.eventBus.removeAllListeners("user:logged-out");
    this.eventBus.removeAllListeners("cart:updated");
    this.isInitialized = false;
    logger$2.debug("UserDataTracker destroyed");
  }
  /**
   * Get tracking status
   */
  getStatus() {
    return {
      initialized: this.isInitialized,
      lastTrackTime: this.lastTrackTime,
      listenersCount: this.unsubscribers.length
    };
  }
}
UserDataTracker.getInstance();
const logger$1 = createLogger("AutoEventListener");
class AutoEventListener {
  constructor() {
    this.eventBus = EventBus.getInstance();
    this.isInitialized = false;
    this.eventHandlers = /* @__PURE__ */ new Map();
    this.lastEventTimes = /* @__PURE__ */ new Map();
    this.debounceConfig = {
      "cart:item-added": 1e3,
      "cart:item-removed": 500,
      "cart:quantity-changed": 500,
      "cart:updated": 1e3
    };
  }
  static getInstance() {
    if (!AutoEventListener.instance) {
      AutoEventListener.instance = new AutoEventListener();
    }
    return AutoEventListener.instance;
  }
  /**
   * Initialize the auto event listener
   */
  initialize() {
    if (this.isInitialized) {
      return;
    }
    this.isInitialized = true;
    dataLayer.initialize();
    this.setupCartEventListeners();
    this.setupUpsellEventListeners();
    this.setupCheckoutEventListeners();
    this.setupPageEventListeners();
    logger$1.info("AutoEventListener initialized");
  }
  /**
   * Check if event should be processed based on debounce
   */
  shouldProcessEvent(eventName) {
    const now = Date.now();
    const lastTime = this.lastEventTimes.get(eventName) || 0;
    const debounceTime = this.debounceConfig[eventName] || 0;
    if (now - lastTime < debounceTime) {
      logger$1.debug(`Event ${eventName} debounced`);
      return false;
    }
    this.lastEventTimes.set(eventName, now);
    return true;
  }
  /**
   * Set up cart event listeners
   */
  setupCartEventListeners() {
    const handleAddToCart = async (data) => {
      if (!this.shouldProcessEvent("cart:item-added")) {
        return;
      }
      const packageId = data.packageId;
      const quantity = data.quantity || 1;
      const campaignStore = useCampaignStore.getState();
      const packageData = campaignStore.getPackage(packageId);
      if (!packageData) {
        logger$1.warn("Package not found for add to cart:", packageId);
        return;
      }
      const listContext = listAttributionTracker.getCurrentList();
      const item = {
        item_id: packageData.external_id.toString(),
        // Use external_id for analytics
        item_name: packageData.name || `Package ${packageId}`,
        currency: campaignStore.data?.currency || "USD",
        price: parseFloat(packageData.price_total || "0"),
        // Use total package price
        quantity: 1,
        // Always 1 for package-based pricing
        item_category: "uncategorized",
        item_variant: void 0,
        ...listContext && {
          item_list_id: listContext.listId,
          item_list_name: listContext.listName
        }
      };
      const event = dataLayer.formatEcommerceEvent("dl_add_to_cart", {
        currency: item.currency,
        value: item.price * quantity,
        // Total value for all packages
        items: [item]
      });
      if (data.willRedirect) {
        event._willRedirect = true;
      }
      dataLayer.push(event);
      logger$1.debug("Tracked add to cart:", packageId);
    };
    this.eventBus.on("cart:item-added", handleAddToCart);
    this.eventHandlers.set("cart:item-added", handleAddToCart);
    const handleRemoveFromCart = async (data) => {
      if (!this.shouldProcessEvent("cart:item-removed")) {
        return;
      }
      const packageId = data.packageId;
      const quantity = data.quantity || 1;
      const campaignStore = useCampaignStore.getState();
      const packageData = campaignStore.getPackage(packageId);
      if (!packageData) {
        logger$1.warn("Package not found for remove from cart:", packageId);
        return;
      }
      const item = {
        item_id: packageData.external_id.toString(),
        // Use external_id for analytics
        item_name: packageData.name || `Package ${packageId}`,
        currency: campaignStore.data?.currency || "USD",
        price: parseFloat(packageData.price_total || "0"),
        // Use total package price
        quantity: 1,
        // Always 1 for package-based pricing
        item_category: "uncategorized",
        item_variant: void 0
      };
      const event = dataLayer.formatEcommerceEvent("dl_remove_from_cart", {
        currency: item.currency,
        value: item.price * quantity,
        items: [item]
      });
      dataLayer.push(event);
      logger$1.debug("Tracked remove from cart:", packageId);
    };
    this.eventBus.on("cart:item-removed", handleRemoveFromCart);
    this.eventHandlers.set("cart:item-removed", handleRemoveFromCart);
    const handleCartUpdated = async () => {
      if (!this.shouldProcessEvent("cart:updated")) {
        return;
      }
      dataLayer.push({
        event: "dl_cart_updated",
        cart: this.getCartData()
      });
    };
    this.eventBus.on("cart:updated", handleCartUpdated);
    this.eventHandlers.set("cart:updated", handleCartUpdated);
  }
  /**
   * Set up upsell event listeners
   */
  setupUpsellEventListeners() {
    const handleUpsellViewed = async (data) => {
      const orderId = data.orderId;
      const pagePath = data.pagePath;
      if (!data.packageId) {
        dataLayer.push({
          event: "dl_viewed_upsell",
          order_id: orderId,
          page_path: pagePath,
          // Generic upsell data when no specific package
          upsell: {
            package_id: "page_view",
            package_name: "Upsell Page View",
            currency: useCampaignStore.getState().data?.currency || "USD"
          }
        });
        logger$1.info("Tracked upsell page view:", pagePath);
        return;
      }
      const packageId = data.packageId;
      const campaignStore = useCampaignStore.getState();
      const packageData = campaignStore.getPackage(packageId);
      if (!packageData) {
        logger$1.warn("Package not found for upsell view:", packageId);
        return;
      }
      dataLayer.push({
        event: "dl_viewed_upsell",
        order_id: orderId,
        upsell: {
          package_id: packageId.toString(),
          package_name: packageData.name || `Package ${packageId}`,
          price: parseFloat(packageData.price || "0"),
          currency: campaignStore.data?.currency || "USD"
        }
      });
      logger$1.info("Tracked upsell view:", packageId);
    };
    this.eventBus.on("upsell:viewed", handleUpsellViewed);
    this.eventHandlers.set("upsell:viewed", handleUpsellViewed);
    const handleUpsellAccepted = async (data) => {
      const packageId = data.packageId;
      const quantity = data.quantity || 1;
      const orderId = data.orderId || data.order?.ref_id;
      let value = data.value;
      if (value === void 0) {
        const campaignStore = useCampaignStore.getState();
        const packageData = campaignStore.getPackage(packageId);
        if (packageData?.price) {
          value = parseFloat(packageData.price) * quantity;
        }
      }
      const acceptedUpsellEvent = {
        event: "dl_accepted_upsell",
        order_id: orderId,
        upsell: {
          package_id: packageId.toString(),
          package_name: data.packageName || `Package ${packageId}`,
          quantity,
          value: value || 0,
          currency: data.currency || "USD"
        }
      };
      logger$1.debug("Upsell accepted event data:", { willRedirect: data.willRedirect, data });
      if (data.willRedirect) {
        acceptedUpsellEvent._willRedirect = true;
        logger$1.debug("Marked upsell event for queueing due to redirect");
      }
      dataLayer.push(acceptedUpsellEvent);
      logger$1.info("Tracked upsell accepted:", packageId);
    };
    this.eventBus.on("upsell:accepted", handleUpsellAccepted);
    this.eventBus.on("upsell:added", handleUpsellAccepted);
    this.eventHandlers.set("upsell:accepted", handleUpsellAccepted);
    this.eventHandlers.set("upsell:added", handleUpsellAccepted);
    const handleUpsellSkipped = async (data) => {
      dataLayer.push({
        event: "dl_skipped_upsell",
        order_id: data.orderId,
        upsell: {
          package_id: data.packageId?.toString() || "unknown",
          package_name: data.packageName || "Unknown Package"
        }
      });
      logger$1.info("Tracked upsell skipped:", data.packageId);
    };
    this.eventBus.on("upsell:skipped", handleUpsellSkipped);
    this.eventHandlers.set("upsell:skipped", handleUpsellSkipped);
  }
  /**
   * Set up checkout event listeners
   */
  setupCheckoutEventListeners() {
    const handleCheckoutStarted = async (data) => {
      const cartStore = useCartStore.getState();
      const campaignStore = useCampaignStore.getState();
      const items = cartStore.items.map((item, index) => {
        const packageData = campaignStore.getPackage(item.packageId);
        return {
          item_id: packageData?.external_id?.toString() || item.packageId.toString(),
          // Use external_id for analytics
          item_name: packageData?.name || `Package ${item.packageId}`,
          currency: campaignStore.data?.currency || "USD",
          price: parseFloat(packageData?.price_total || "0"),
          // Use total package price
          quantity: item.quantity,
          // This is the number of packages in cart
          item_category: campaignStore.data?.name || "uncategorized",
          item_variant: void 0,
          index
        };
      });
      const event = dataLayer.formatEcommerceEvent("dl_begin_checkout", {
        currency: campaignStore.data?.currency || "USD",
        value: cartStore.total || cartStore.subtotal || 0,
        items,
        coupon: data.coupon
      });
      dataLayer.push(event);
      logger$1.info("Tracked checkout started");
    };
    this.eventBus.on("checkout:started", handleCheckoutStarted);
    this.eventHandlers.set("checkout:started", handleCheckoutStarted);
    const handleExpressCheckoutStarted = async (data) => {
      const cartStore = useCartStore.getState();
      const campaignStore = useCampaignStore.getState();
      const items = cartStore.items.map((item, index) => {
        const packageData = campaignStore.getPackage(item.packageId);
        return {
          item_id: packageData?.external_id?.toString() || item.packageId.toString(),
          item_name: packageData?.name || `Package ${item.packageId}`,
          currency: campaignStore.data?.currency || "USD",
          price: parseFloat(packageData?.price_total || "0"),
          quantity: item.quantity,
          item_category: campaignStore.data?.name || "uncategorized",
          item_variant: void 0,
          index
        };
      });
      const event = dataLayer.formatEcommerceEvent("dl_begin_checkout", {
        currency: campaignStore.data?.currency || "USD",
        value: cartStore.total || cartStore.subtotal || 0,
        items,
        coupon: cartStore.appliedCoupons?.[0]?.code,
        payment_type: data.method || "express"
      });
      dataLayer.push(event);
      logger$1.info("Tracked express checkout started", { method: data.method });
    };
    this.eventBus.on("express-checkout:started", handleExpressCheckoutStarted);
    this.eventHandlers.set("express-checkout:started", handleExpressCheckoutStarted);
    const handleOrderCompleted = async (order) => {
      const orderId = order.ref_id || order.number || order.order_id || order.transaction_id;
      const total = parseFloat(order.total_incl_tax || order.total || "0");
      let items = [];
      if (order.lines && Array.isArray(order.lines)) {
        const campaignStore = useCampaignStore.getState();
        items = order.lines.map((line, index) => ({
          item_id: line.product_sku || line.id?.toString() || `line_${index}`,
          item_name: line.product_title || line.product_description || `Item ${line.id}`,
          currency: order.currency || "USD",
          price: parseFloat(line.price_incl_tax || line.price || "0"),
          quantity: parseInt(line.quantity?.toString() || "1"),
          item_category: campaignStore.data?.name || "uncategorized",
          item_variant: line.variant_title,
          discount: parseFloat(line.price_incl_tax_excl_discounts || "0") - parseFloat(line.price_incl_tax || "0"),
          index
        }));
      } else {
        const cartStore = useCartStore.getState();
        const campaignStore = useCampaignStore.getState();
        items = cartStore.items.map((item, index) => {
          const packageData = campaignStore.getPackage(item.packageId);
          return {
            item_id: packageData?.external_id?.toString() || item.packageId.toString(),
            // Use external_id for analytics
            item_name: packageData?.name || `Package ${item.packageId}`,
            currency: campaignStore.data?.currency || "USD",
            price: parseFloat(packageData?.price_total || "0"),
            // Use total package price
            quantity: item.quantity,
            // This is the number of packages in cart
            item_category: campaignStore.data?.name || "uncategorized",
            index
          };
        });
      }
      const purchaseData = {
        transaction_id: orderId,
        currency: order.currency || "USD",
        value: total || 0,
        items,
        coupon: order.discounts?.[0]?.code || order.coupon_code || order.coupon,
        shipping: parseFloat(order.shipping_incl_tax || order.shipping || "0"),
        tax: parseFloat(order.total_tax || order.tax || "0")
      };
      const event = dataLayer.formatEcommerceEvent("dl_purchase", purchaseData);
      event._willRedirect = true;
      logger$1.debug("Marked purchase event for queueing with _willRedirect = true");
      dataLayer.push(event);
      logger$1.info("Tracked purchase:", orderId);
    };
    this.eventBus.on("order:completed", handleOrderCompleted);
    this.eventHandlers.set("order:completed", handleOrderCompleted);
  }
  /**
   * Set up page event listeners
   */
  setupPageEventListeners() {
    const handlePageView = async (data) => {
      dataLayer.push({
        event: "dl_page_view",
        page: {
          title: data.title || document.title,
          url: data.url || window.location.href,
          path: data.path || window.location.pathname,
          referrer: document.referrer
        }
      });
    };
    this.eventBus.on("page:viewed", handlePageView);
    this.eventHandlers.set("page:viewed", handlePageView);
    const handleRouteChanged = async (data) => {
      dataLayer.push({
        event: "dl_route_changed",
        route: {
          from: data.from,
          to: data.to,
          path: data.path || window.location.pathname
        }
      });
    };
    this.eventBus.on("route:changed", handleRouteChanged);
    this.eventHandlers.set("route:changed", handleRouteChanged);
  }
  /**
   * Get current cart data
   */
  getCartData() {
    try {
      const cartStore = useCartStore.getState();
      const campaignStore = useCampaignStore.getState();
      return {
        total_value: cartStore.total || cartStore.subtotal || 0,
        total_items: cartStore.totalQuantity || 0,
        currency: campaignStore.data?.currency || "USD",
        items: cartStore.items.map((item) => ({
          package_id: item.packageId,
          quantity: item.quantity,
          price: campaignStore.getPackage(item.packageId)?.price || 0
        }))
      };
    } catch (error) {
      logger$1.error("Error getting cart data:", error);
      return null;
    }
  }
  /**
   * Reset the auto event listener (called by NextAnalytics)
   */
  reset() {
    this.lastEventTimes.clear();
    logger$1.debug("AutoEventListener reset");
  }
  /**
   * Clean up the auto event listener
   */
  destroy() {
    this.eventHandlers.forEach((handler, eventName) => {
      this.eventBus.off(eventName, handler);
    });
    this.eventHandlers.clear();
    this.lastEventTimes.clear();
    this.isInitialized = false;
    logger$1.debug("AutoEventListener destroyed");
  }
  /**
   * Get listener status
   */
  getStatus() {
    return {
      initialized: this.isInitialized,
      listenersCount: this.eventHandlers.size,
      debounceConfig: { ...this.debounceConfig }
    };
  }
  /**
   * Update debounce configuration
   */
  setDebounceConfig(config) {
    Object.assign(this.debounceConfig, config);
    logger$1.debug("Updated debounce config:", this.debounceConfig);
  }
}
AutoEventListener.getInstance();
const userPropertiesFields = {
  visitor_type: { type: "string" },
  customer_id: { type: "string" },
  customer_email: { type: "string" },
  customer_phone: { type: "string" },
  customer_first_name: { type: "string" },
  customer_last_name: { type: "string" },
  customer_address_city: { type: "string" },
  customer_address_province: { type: "string" },
  customer_address_province_code: { type: "string" },
  customer_address_country: { type: "string" },
  customer_address_country_code: { type: "string" },
  customer_address_zip: { type: "string" },
  customer_order_count: { type: "number" },
  customer_total_spent: { type: "number" },
  customer_tags: { type: "string" }
};
const productFields = {
  item_id: { type: "string", required: true },
  item_name: { type: "string", required: true },
  affiliation: { type: "string" },
  coupon: { type: "string" },
  currency: { type: "string" },
  discount: { type: "number" },
  index: { type: "number" },
  item_brand: { type: "string" },
  item_category: { type: "string" },
  item_category2: { type: "string" },
  item_category3: { type: "string" },
  item_category4: { type: "string" },
  item_category5: { type: "string" },
  item_list_id: { type: "string" },
  item_list_name: { type: "string" },
  item_variant: { type: "string" },
  location_id: { type: "string" },
  price: { type: "number" },
  quantity: { type: "number" }
};
const ecommerceWithItemsFields = {
  currency: { type: "string" },
  value: { type: "number" },
  coupon: { type: "string" },
  items: {
    type: "array",
    items: {
      type: "object",
      properties: productFields
    }
  }
};
const ecommerceWithImpressionsFields = {
  currency: { type: "string" },
  value: { type: "number" },
  impressions: {
    type: "array",
    items: {
      type: "object",
      properties: productFields
    }
  }
};
const eventSchemas = {
  dl_user_data: {
    name: "dl_user_data",
    fields: {
      event: { type: "string", required: true },
      user_properties: {
        type: "object",
        required: true,
        properties: userPropertiesFields
      }
    }
  },
  dl_sign_up: {
    name: "dl_sign_up",
    fields: {
      event: { type: "string", required: true },
      user_properties: {
        type: "object",
        properties: userPropertiesFields
      },
      method: { type: "string" }
    }
  },
  dl_login: {
    name: "dl_login",
    fields: {
      event: { type: "string", required: true },
      user_properties: {
        type: "object",
        properties: userPropertiesFields
      },
      method: { type: "string" }
    }
  },
  dl_view_item_list: {
    name: "dl_view_item_list",
    fields: {
      event: { type: "string", required: true },
      ecommerce: {
        type: "object",
        required: true,
        properties: {
          ...ecommerceWithImpressionsFields,
          item_list_id: { type: "string" },
          item_list_name: { type: "string" }
        }
      },
      user_properties: {
        type: "object",
        properties: userPropertiesFields
      }
    }
  },
  dl_view_search_results: {
    name: "dl_view_search_results",
    fields: {
      event: { type: "string", required: true },
      search_term: { type: "string", required: true },
      ecommerce: {
        type: "object",
        properties: ecommerceWithImpressionsFields
      },
      user_properties: {
        type: "object",
        properties: userPropertiesFields
      }
    }
  },
  dl_select_item: {
    name: "dl_select_item",
    fields: {
      event: { type: "string", required: true },
      ecommerce: {
        type: "object",
        required: true,
        properties: {
          ...ecommerceWithItemsFields,
          item_list_id: { type: "string" },
          item_list_name: { type: "string" }
        }
      },
      user_properties: {
        type: "object",
        properties: userPropertiesFields
      }
    }
  },
  dl_view_item: {
    name: "dl_view_item",
    fields: {
      event: { type: "string", required: true },
      ecommerce: {
        type: "object",
        required: true,
        properties: ecommerceWithItemsFields
      },
      user_properties: {
        type: "object",
        properties: userPropertiesFields
      }
    }
  },
  dl_add_to_cart: {
    name: "dl_add_to_cart",
    fields: {
      event: { type: "string", required: true },
      ecommerce: {
        type: "object",
        required: true,
        properties: ecommerceWithItemsFields
      },
      user_properties: {
        type: "object",
        properties: userPropertiesFields
      }
    }
  },
  dl_remove_from_cart: {
    name: "dl_remove_from_cart",
    fields: {
      event: { type: "string", required: true },
      ecommerce: {
        type: "object",
        required: true,
        properties: ecommerceWithItemsFields
      },
      user_properties: {
        type: "object",
        properties: userPropertiesFields
      }
    }
  },
  dl_view_cart: {
    name: "dl_view_cart",
    fields: {
      event: { type: "string", required: true },
      ecommerce: {
        type: "object",
        required: true,
        properties: ecommerceWithItemsFields
      },
      user_properties: {
        type: "object",
        properties: userPropertiesFields
      }
    }
  },
  dl_begin_checkout: {
    name: "dl_begin_checkout",
    fields: {
      event: { type: "string", required: true },
      ecommerce: {
        type: "object",
        required: true,
        properties: {
          ...ecommerceWithItemsFields,
          checkout_id: { type: "string" },
          checkout_step: { type: "number" }
        }
      },
      user_properties: {
        type: "object",
        properties: userPropertiesFields
      }
    }
  },
  dl_purchase: {
    name: "dl_purchase",
    fields: {
      event: { type: "string", required: true },
      ecommerce: {
        type: "object",
        required: true,
        properties: {
          ...ecommerceWithItemsFields,
          transaction_id: { type: "string", required: true },
          affiliation: { type: "string" },
          tax: { type: "number" },
          shipping: { type: "number" },
          discount: { type: "number" }
        }
      },
      user_properties: {
        type: "object",
        properties: userPropertiesFields
      }
    }
  },
  dl_subscribe: {
    name: "dl_subscribe",
    fields: {
      event: { type: "string", required: true },
      ecommerce: {
        type: "object",
        properties: {
          ...ecommerceWithItemsFields,
          subscription_id: { type: "string" },
          subscription_status: { type: "string" }
        }
      },
      user_properties: {
        type: "object",
        properties: userPropertiesFields
      }
    }
  },
  // Upsell events
  dl_viewed_upsell: {
    name: "dl_viewed_upsell",
    fields: {
      event: { type: "string", required: true },
      order_id: { type: "string", required: true },
      upsell: {
        type: "object",
        required: true,
        properties: {
          package_id: { type: "string", required: true },
          package_name: { type: "string", required: true },
          price: { type: "number" },
          currency: { type: "string" }
        }
      }
    }
  },
  dl_accepted_upsell: {
    name: "dl_accepted_upsell",
    fields: {
      event: { type: "string", required: true },
      order_id: { type: "string", required: true },
      upsell: {
        type: "object",
        required: true,
        properties: {
          package_id: { type: "string", required: true },
          package_name: { type: "string" },
          quantity: { type: "number" },
          value: { type: "number", required: true },
          currency: { type: "string" }
        }
      }
    }
  },
  dl_skipped_upsell: {
    name: "dl_skipped_upsell",
    fields: {
      event: { type: "string", required: true },
      order_id: { type: "string", required: true },
      upsell: {
        type: "object",
        required: true,
        properties: {
          package_id: { type: "string" },
          package_name: { type: "string" }
        }
      }
    }
  }
};
function validateEventSchema(eventData, schema) {
  const errors = [];
  function validateField(value, fieldDef, path) {
    if (fieldDef.required && (value === void 0 || value === null)) {
      errors.push(`Missing required field: ${path}`);
      return;
    }
    if (value === void 0 || value === null) {
      return;
    }
    const actualType = Array.isArray(value) ? "array" : typeof value;
    if (actualType !== fieldDef.type) {
      errors.push(`Invalid type for ${path}: expected ${fieldDef.type}, got ${actualType}`);
      return;
    }
    if (fieldDef.enum && !fieldDef.enum.includes(value)) {
      errors.push(`Invalid value for ${path}: must be one of ${fieldDef.enum.join(", ")}`);
    }
    if (fieldDef.type === "object" && fieldDef.properties) {
      for (const [propName, propDef] of Object.entries(fieldDef.properties)) {
        validateField(value[propName], propDef, `${path}.${propName}`);
      }
    }
    if (fieldDef.type === "array" && fieldDef.items) {
      value.forEach((item, index) => {
        validateField(item, fieldDef.items, `${path}[${index}]`);
      });
    }
  }
  for (const [fieldName, fieldDef] of Object.entries(schema.fields)) {
    validateField(eventData[fieldName], fieldDef, fieldName);
  }
  return {
    valid: errors.length === 0,
    errors
  };
}
function getEventSchema(eventName) {
  return eventSchemas[eventName];
}
class EventValidator {
  constructor(debug = false) {
    this.debug = debug;
  }
  /**
   * Validates an event against its schema
   */
  validateEvent(eventData) {
    const result = {
      valid: true,
      errors: [],
      warnings: []
    };
    if (!eventData || typeof eventData !== "object") {
      result.valid = false;
      result.errors.push("Event data must be an object");
      return result;
    }
    if (!eventData.event) {
      result.valid = false;
      result.errors.push('Event must have an "event" field');
      return result;
    }
    const schema = getEventSchema(eventData.event);
    if (!schema) {
      result.warnings.push(`No schema defined for event: ${eventData.event}`);
      return result;
    }
    const schemaValidation = validateEventSchema(eventData, schema);
    result.valid = schemaValidation.valid;
    result.errors.push(...schemaValidation.errors);
    this.performAdditionalValidation(eventData, result);
    if (this.debug && !result.valid) {
      console.error(`[EventValidator] Validation failed for ${eventData.event}:`, result.errors);
    }
    return result;
  }
  /**
   * Performs additional validation beyond schema validation
   */
  performAdditionalValidation(eventData, result) {
    if (eventData.ecommerce) {
      if (eventData.ecommerce.currency && !this.isValidCurrency(eventData.ecommerce.currency)) {
        result.warnings.push(`Invalid currency format: ${eventData.ecommerce.currency}`);
      }
      if (eventData.ecommerce.value !== void 0 && eventData.ecommerce.value < 0) {
        result.warnings.push("Ecommerce value should not be negative");
      }
      if (eventData.ecommerce.items && Array.isArray(eventData.ecommerce.items)) {
        eventData.ecommerce.items.forEach((item, index) => {
          this.validateProduct(item, `ecommerce.items[${index}]`, result);
        });
      }
      if (eventData.ecommerce.impressions && Array.isArray(eventData.ecommerce.impressions)) {
        eventData.ecommerce.impressions.forEach((impression, index) => {
          this.validateProduct(impression, `ecommerce.impressions[${index}]`, result);
        });
      }
    }
    if (eventData.user_properties) {
      this.validateUserProperties(eventData.user_properties, result);
    }
    switch (eventData.event) {
      case "dl_purchase":
        if (!eventData.ecommerce?.transaction_id) {
          result.errors.push("dl_purchase event must have ecommerce.transaction_id");
          result.valid = false;
        }
        break;
      case "dl_view_search_results":
        if (!eventData.search_term) {
          result.errors.push("dl_view_search_results event must have search_term");
          result.valid = false;
        }
        break;
      case "dl_viewed_upsell":
      case "dl_accepted_upsell":
      case "dl_skipped_upsell":
        this.validateUpsellEvent(eventData, result);
        break;
    }
  }
  /**
   * Validates a product object
   */
  validateProduct(product, path, result) {
    if (!product || typeof product !== "object") {
      result.errors.push(`${path} must be an object`);
      result.valid = false;
      return;
    }
    if (!product.item_id) {
      result.errors.push(`${path}.item_id is required`);
      result.valid = false;
    }
    if (!product.item_name) {
      result.errors.push(`${path}.item_name is required`);
      result.valid = false;
    }
    const numericFields = ["price", "quantity", "discount", "index"];
    for (const field of numericFields) {
      if (product[field] !== void 0) {
        if (typeof product[field] !== "number") {
          result.errors.push(`${path}.${field} must be a number`);
          result.valid = false;
        } else if (field !== "discount" && product[field] < 0) {
          result.warnings.push(`${path}.${field} should not be negative`);
        }
      }
    }
    if (product.quantity !== void 0 && !Number.isInteger(product.quantity)) {
      result.warnings.push(`${path}.quantity should be an integer`);
    }
  }
  /**
   * Validates user properties
   */
  validateUserProperties(userProperties, result) {
    if (typeof userProperties !== "object") {
      result.errors.push("user_properties must be an object");
      result.valid = false;
      return;
    }
    if (userProperties.customer_email && !this.isValidEmail(userProperties.customer_email)) {
      result.warnings.push("customer_email is not a valid email address");
    }
    if (userProperties.customer_order_count !== void 0) {
      if (typeof userProperties.customer_order_count !== "number" || !Number.isInteger(userProperties.customer_order_count)) {
        result.warnings.push("customer_order_count should be an integer");
      }
    }
    if (userProperties.customer_total_spent !== void 0) {
      if (typeof userProperties.customer_total_spent !== "number") {
        result.warnings.push("customer_total_spent should be a number");
      }
    }
    if (userProperties.customer_address_country_code && userProperties.customer_address_country_code.length !== 2) {
      result.warnings.push("customer_address_country_code should be a 2-letter ISO code");
    }
    if (userProperties.customer_address_province_code && userProperties.customer_address_province_code.length > 3) {
      result.warnings.push("customer_address_province_code seems too long");
    }
  }
  /**
   * Checks if a currency code is valid (3-letter ISO code)
   */
  isValidCurrency(currency) {
    return /^[A-Z]{3}$/.test(currency);
  }
  /**
   * Basic email validation
   */
  isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
  /**
   * Validates upsell events
   */
  validateUpsellEvent(eventData, result) {
    if (!eventData.order_id) {
      result.errors.push(`${eventData.event} must have order_id`);
      result.valid = false;
    }
    if (!eventData.upsell || typeof eventData.upsell !== "object") {
      result.errors.push(`${eventData.event} must have upsell object`);
      result.valid = false;
      return;
    }
    if (!eventData.upsell.package_id) {
      result.errors.push(`${eventData.event}.upsell.package_id is required`);
      result.valid = false;
    }
    if (eventData.event === "dl_accepted_upsell" && eventData.upsell.value === void 0) {
      result.errors.push("dl_accepted_upsell.upsell.value is required");
      result.valid = false;
    }
    if (eventData.upsell.price !== void 0 && typeof eventData.upsell.price !== "number") {
      result.errors.push(`${eventData.event}.upsell.price must be a number`);
      result.valid = false;
    }
    if (eventData.upsell.quantity !== void 0 && typeof eventData.upsell.quantity !== "number") {
      result.errors.push(`${eventData.event}.upsell.quantity must be a number`);
      result.valid = false;
    }
    if (eventData.upsell.value !== void 0 && typeof eventData.upsell.value !== "number") {
      result.errors.push(`${eventData.event}.upsell.value must be a number`);
      result.valid = false;
    }
  }
  /**
   * Get all available event schemas
   */
  getAvailableSchemas() {
    return Object.keys(eventSchemas);
  }
  /**
   * Get schema details for a specific event
   */
  getSchemaDetails(eventName) {
    return getEventSchema(eventName);
  }
  /**
   * Generate a sample event based on schema
   */
  generateSampleEvent(eventName) {
    const schema = getEventSchema(eventName);
    if (!schema) {
      return null;
    }
    const sample = {
      event: eventName,
      event_id: "sample_" + Date.now(),
      timestamp: Date.now()
    };
    this.generateSampleFromSchema(schema.fields, sample);
    return sample;
  }
  /**
   * Helper to generate sample data from schema
   */
  generateSampleFromSchema(fields, target) {
    for (const [fieldName, fieldDef] of Object.entries(fields)) {
      if (fieldName === "event") continue;
      if (fieldDef.required || Math.random() > 0.5) {
        switch (fieldDef.type) {
          case "string":
            target[fieldName] = fieldDef.enum ? fieldDef.enum[0] : `sample_${fieldName}`;
            break;
          case "number":
            target[fieldName] = fieldName.includes("price") || fieldName.includes("value") ? 99.99 : 1;
            break;
          case "boolean":
            target[fieldName] = true;
            break;
          case "object":
            target[fieldName] = {};
            if (fieldDef.properties) {
              this.generateSampleFromSchema(fieldDef.properties, target[fieldName]);
            }
            break;
          case "array":
            target[fieldName] = [];
            if (fieldDef.items && fieldDef.items.type === "object" && fieldDef.items.properties) {
              const item = {};
              this.generateSampleFromSchema(fieldDef.items.properties, item);
              target[fieldName].push(item);
            }
            break;
        }
      }
    }
  }
}
class EventBuilder {
  /**
   * Create base event with standard properties
   */
  static createEvent(eventName, eventData = {}) {
    const event = {
      event: eventName,
      event_id: this.generateEventId(),
      event_time: (/* @__PURE__ */ new Date()).toISOString(),
      user_properties: this.getUserProperties(),
      ...this.getEventContext(),
      ...eventData,
      _metadata: this.getEventMetadata()
    };
    return event;
  }
  /**
   * Generate unique event ID
   */
  static generateEventId() {
    return `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }
  /**
   * Get user properties from stores
   */
  static getUserProperties() {
    const userProperties = {
      visitor_type: "guest"
      // Default to guest, can be overridden if we have customer data
    };
    try {
      if (typeof window !== "undefined") {
        const checkoutStore = window.checkoutStore;
        if (checkoutStore) {
          const checkoutState = checkoutStore.getState();
          if (checkoutState.billingAddress) {
            const billing = checkoutState.billingAddress;
            userProperties.customer_first_name = billing.first_name;
            userProperties.customer_last_name = billing.last_name;
            userProperties.customer_address_city = billing.city;
            userProperties.customer_address_province = billing.province;
            userProperties.customer_address_province_code = billing.province;
            userProperties.customer_address_zip = billing.postal;
            userProperties.customer_address_country = billing.country;
            userProperties.customer_phone = billing.phone;
          }
          if (checkoutState.formData?.email) {
            userProperties.customer_email = checkoutState.formData.email;
          }
          if (checkoutState.formData?.customerId) {
            userProperties.customer_id = String(checkoutState.formData.customerId);
            userProperties.visitor_type = "customer";
          }
        }
      }
    } catch (error) {
      console.warn("Could not access store state for user properties:", error);
    }
    return userProperties;
  }
  /**
   * Get event context (page info, session, etc.)
   */
  static getEventContext() {
    const context = {};
    if (typeof window !== "undefined") {
      context.page_location = window.location.href;
      context.page_title = document.title;
      context.page_referrer = document.referrer;
      context.user_agent = navigator.userAgent;
      context.screen_resolution = `${window.screen.width}x${window.screen.height}`;
      context.viewport_size = `${window.innerWidth}x${window.innerHeight}`;
      context.session_id = this.getSessionId();
      context.timestamp = Date.now();
    }
    return context;
  }
  /**
   * Get event metadata
   */
  static getEventMetadata() {
    return {
      pushed_at: Date.now(),
      debug_mode: false,
      // Can be controlled via config
      session_id: this.getSessionId(),
      sequence_number: this.getNextSequenceNumber(),
      source: "next-campaign-cart",
      version: "0.2.0"
    };
  }
  /**
   * Get or create session ID
   */
  static getSessionId() {
    if (typeof window !== "undefined") {
      let sessionId = sessionStorage.getItem("analytics_session_id");
      if (!sessionId) {
        sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        sessionStorage.setItem("analytics_session_id", sessionId);
      }
      return sessionId;
    }
    return `session_${Date.now()}`;
  }
  /**
   * Get next sequence number for event ordering
   */
  static getNextSequenceNumber() {
    if (typeof window !== "undefined") {
      const current = parseInt(sessionStorage.getItem("analytics_sequence") || "0", 10);
      const next = current + 1;
      sessionStorage.setItem("analytics_sequence", String(next));
      return next;
    }
    return 0;
  }
  /**
   * Get currency from campaign store
   */
  static getCurrency() {
    try {
      if (typeof window !== "undefined") {
        const campaignStore = window.campaignStore;
        if (campaignStore) {
          const campaign = campaignStore.getState().data;
          return campaign?.currency || "USD";
        }
      }
    } catch (error) {
      console.warn("Could not access campaign store for currency:", error);
    }
    return "USD";
  }
  /**
   * Format cart item to ecommerce item
   */
  static formatEcommerceItem(item, index, list) {
    const currency = this.getCurrency();
    let campaignName = "Campaign";
    try {
      if (typeof window !== "undefined") {
        const campaignStore = window.campaignStore;
        if (campaignStore) {
          const campaign = campaignStore.getState().data;
          campaignName = campaign?.name || "Campaign";
        }
      }
    } catch (error) {
      console.warn("Could not access campaign store for item formatting:", error);
    }
    const itemId = String(item.packageId || item.package_id || item.id);
    const itemName = item.product?.title || item.title || item.product_title || item.name || `Package ${itemId}`;
    let price = 0;
    if (item.price_incl_tax) {
      price = typeof item.price_incl_tax === "string" ? parseFloat(item.price_incl_tax) : item.price_incl_tax;
    } else if (item.price) {
      if (typeof item.price === "object" && "incl_tax" in item.price) {
        price = item.price.incl_tax.value;
      } else {
        price = typeof item.price === "string" ? parseFloat(item.price) : item.price;
      }
    }
    const quantity = item.quantity || 1;
    const ecommerceItem = {
      item_id: itemId,
      item_name: itemName,
      item_category: campaignName,
      price: typeof price === "string" ? parseFloat(price) : price,
      quantity,
      currency
    };
    if (item.package_profile || item.variant) {
      const variant = item.package_profile || item.variant;
      if (variant !== void 0) {
        ecommerceItem.item_variant = variant;
      }
    }
    if (index !== void 0) {
      ecommerceItem.index = index;
    }
    if (list?.id) {
      ecommerceItem.item_list_id = list.id;
    }
    if (list?.name) {
      ecommerceItem.item_list_name = list.name;
    }
    return ecommerceItem;
  }
  /**
   * Get list attribution from sessionStorage
   */
  static getListAttribution() {
    if (typeof window !== "undefined") {
      const listId = sessionStorage.getItem("analytics_list_id");
      const listName = sessionStorage.getItem("analytics_list_name");
      if (listId || listName) {
        const result = {};
        if (listId) result.id = listId;
        if (listName) result.name = listName;
        return result;
      }
    }
    return void 0;
  }
  /**
   * Set list attribution in sessionStorage
   */
  static setListAttribution(listId, listName) {
    if (typeof window !== "undefined") {
      if (listId) {
        sessionStorage.setItem("analytics_list_id", listId);
      }
      if (listName) {
        sessionStorage.setItem("analytics_list_name", listName);
      }
    }
  }
  /**
   * Clear list attribution
   */
  static clearListAttribution() {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("analytics_list_id");
      sessionStorage.removeItem("analytics_list_name");
    }
  }
}
class EcommerceEvents {
  /**
   * Create view_item_list event with impressions array
   */
  static createViewItemListEvent(items, listId, listName) {
    const currency = EventBuilder.getCurrency();
    const formattedItems = items.map(
      (item, index) => EventBuilder.formatEcommerceItem(item, index, listId !== void 0 || listName !== void 0 ? {
        ...listId !== void 0 && { id: listId },
        ...listName !== void 0 && { name: listName }
      } : void 0)
    );
    const totalValue = formattedItems.reduce(
      (sum, item) => sum + (item.price || 0) * (item.quantity || 1),
      0
    );
    EventBuilder.setListAttribution(listId, listName);
    const ecommerce = {
      currency,
      value: totalValue,
      items: formattedItems
    };
    return EventBuilder.createEvent("view_item_list", {
      ecommerce,
      event_category: "ecommerce",
      event_label: listName || "Product List"
    });
  }
  /**
   * Create view_item event
   */
  static createViewItemEvent(item) {
    const currency = EventBuilder.getCurrency();
    const formattedItem = EventBuilder.formatEcommerceItem(item);
    const ecommerce = {
      currency,
      value: (formattedItem.price || 0) * (formattedItem.quantity || 1),
      items: [formattedItem]
    };
    return EventBuilder.createEvent("view_item", {
      ecommerce,
      event_category: "ecommerce",
      event_label: formattedItem.item_name
    });
  }
  /**
   * Create add_to_cart event with list attribution
   */
  static createAddToCartEvent(item, listId, listName) {
    const currency = EventBuilder.getCurrency();
    const list = listId || listName ? {
      ...listId !== void 0 && { id: listId },
      ...listName !== void 0 && { name: listName }
    } : EventBuilder.getListAttribution();
    const formattedItem = EventBuilder.formatEcommerceItem(item, void 0, list);
    const ecommerce = {
      currency,
      value: (formattedItem.price || 0) * (formattedItem.quantity || 1),
      items: [formattedItem]
    };
    return EventBuilder.createEvent("add_to_cart", {
      ecommerce,
      event_category: "ecommerce",
      event_label: formattedItem.item_name,
      list: list?.id || list?.name ? list : void 0
    });
  }
  /**
   * Create remove_from_cart event
   */
  static createRemoveFromCartEvent(item) {
    const currency = EventBuilder.getCurrency();
    const formattedItem = EventBuilder.formatEcommerceItem(item);
    const ecommerce = {
      currency,
      value: (formattedItem.price || 0) * (formattedItem.quantity || 1),
      items: [formattedItem]
    };
    return EventBuilder.createEvent("remove_from_cart", {
      ecommerce,
      event_category: "ecommerce",
      event_label: formattedItem.item_name
    });
  }
  /**
   * Create select_item event (product click)
   */
  static createSelectItemEvent(item, listId, listName) {
    const currency = EventBuilder.getCurrency();
    const list = listId || listName ? {
      ...listId !== void 0 && { id: listId },
      ...listName !== void 0 && { name: listName }
    } : EventBuilder.getListAttribution();
    const formattedItem = EventBuilder.formatEcommerceItem(item, void 0, list);
    const ecommerce = {
      currency,
      value: (formattedItem.price || 0) * (formattedItem.quantity || 1),
      items: [formattedItem]
    };
    return EventBuilder.createEvent("select_item", {
      ecommerce,
      event_category: "ecommerce",
      event_label: formattedItem.item_name,
      list: list?.id || list?.name ? list : void 0
    });
  }
  /**
   * Create begin_checkout event
   */
  static createBeginCheckoutEvent() {
    const cartState = useCartStore.getState();
    const currency = EventBuilder.getCurrency();
    const formattedItems = cartState.enrichedItems.map(
      (item, index) => EventBuilder.formatEcommerceItem(item, index)
    );
    const ecommerce = {
      currency,
      value: cartState.totals.total.value,
      items: formattedItems
    };
    if (cartState.appliedCoupons?.[0]?.code) {
      ecommerce.coupon = cartState.appliedCoupons[0].code;
    }
    return EventBuilder.createEvent("begin_checkout", {
      ecommerce,
      event_category: "ecommerce",
      event_value: cartState.totals.total.value
    });
  }
  /**
   * Create purchase event
   */
  static createPurchaseEvent(orderData) {
    const cartState = useCartStore.getState();
    const currency = EventBuilder.getCurrency();
    const order = orderData.order || orderData;
    const orderId = order.ref_id || order.number || orderData.orderId || orderData.transactionId || `order_${Date.now()}`;
    const orderTotal = parseFloat(
      order.total_incl_tax || order.total || orderData.total || cartState.totals.total.value || 0
    );
    const orderTax = parseFloat(
      order.total_tax || orderData.tax || cartState.totals.tax.value || 0
    );
    const orderShipping = parseFloat(
      order.shipping_incl_tax || orderData.shipping || cartState.totals.shipping.value || 0
    );
    let formattedItems = [];
    if (order.lines && order.lines.length > 0) {
      formattedItems = order.lines.map((line, index) => ({
        item_id: String(line.package || line.product_id || line.id),
        item_name: line.product_title || line.name || "Unknown Product",
        item_category: line.campaign_name || "Campaign",
        item_variant: line.package_profile || line.variant,
        price: parseFloat(line.price_incl_tax || line.price || 0),
        quantity: line.quantity || 1,
        currency: order.currency || currency,
        index
      }));
    } else if (orderData.items || cartState.enrichedItems.length > 0) {
      formattedItems = (orderData.items || cartState.enrichedItems).map(
        (item, index) => EventBuilder.formatEcommerceItem(item, index)
      );
    }
    const ecommerce = {
      transaction_id: orderId,
      currency: order.currency || currency,
      value: orderTotal,
      items: formattedItems,
      tax: orderTax,
      shipping: orderShipping
    };
    const coupon = order.vouchers?.[0]?.code || orderData.coupon || cartState.appliedCoupons?.[0]?.code;
    if (coupon) {
      ecommerce.coupon = coupon;
    }
    EventBuilder.clearListAttribution();
    return EventBuilder.createEvent("purchase", {
      ecommerce,
      event_category: "ecommerce",
      event_value: orderTotal
    });
  }
  /**
   * Create view_cart event
   */
  static createViewCartEvent() {
    const cartState = useCartStore.getState();
    const currency = EventBuilder.getCurrency();
    const formattedItems = cartState.enrichedItems.map(
      (item, index) => EventBuilder.formatEcommerceItem(item, index, { id: "cart", name: "Shopping Cart" })
    );
    const ecommerce = {
      currency,
      value: cartState.totals.total.value,
      items: formattedItems
    };
    if (cartState.appliedCoupons?.[0]?.code) {
      ecommerce.coupon = cartState.appliedCoupons[0].code;
    }
    return EventBuilder.createEvent("view_cart", {
      ecommerce,
      event_category: "ecommerce",
      event_value: cartState.totals.total.value
    });
  }
}
class UserEvents {
  /**
   * Create base user data event
   * This is the foundation for all user-related events
   */
  static createUserDataEvent(eventName, userData, additionalData) {
    const userProperties = {
      ...EventBuilder.getUserProperties(),
      ...userData
    };
    return EventBuilder.createEvent(eventName, {
      user_properties: userProperties,
      event_category: "user",
      ...additionalData
    });
  }
  /**
   * Create sign_up event
   */
  static createSignUpEvent(method = "email", userData) {
    return this.createUserDataEvent("sign_up", userData, {
      event_label: method,
      custom_properties: {
        method,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      }
    });
  }
  /**
   * Create login event
   */
  static createLoginEvent(method = "email", userData) {
    const enrichedUserData = {
      ...userData,
      visitor_type: userData?.customer_id ? "returning_customer" : "guest"
    };
    return this.createUserDataEvent("login", enrichedUserData, {
      event_label: method,
      custom_properties: {
        method,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      }
    });
  }
  /**
   * Create subscribe event (for email/SMS subscriptions)
   */
  static createSubscribeEvent(channel = "email", subscriptionData, userData) {
    return this.createUserDataEvent("subscribe", userData, {
      event_label: channel,
      custom_properties: {
        channel,
        subscription_details: subscriptionData,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      }
    });
  }
  /**
   * Create user profile update event
   */
  static createProfileUpdateEvent(updatedFields, userData) {
    return this.createUserDataEvent("profile_update", userData, {
      event_label: `Updated: ${updatedFields.join(", ")}`,
      custom_properties: {
        updated_fields: updatedFields,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      }
    });
  }
  /**
   * Create email verification event
   */
  static createEmailVerificationEvent(status, userData) {
    return this.createUserDataEvent("email_verification", userData, {
      event_label: status,
      custom_properties: {
        verification_status: status,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      }
    });
  }
  /**
   * Create account deletion event
   */
  static createAccountDeletionEvent(reason, userData) {
    return this.createUserDataEvent("account_deletion", userData, {
      event_label: reason || "user_initiated",
      custom_properties: {
        deletion_reason: reason,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      }
    });
  }
  /**
   * Create password reset event
   */
  static createPasswordResetEvent(step, userData) {
    return this.createUserDataEvent("password_reset", userData, {
      event_label: step,
      custom_properties: {
        reset_step: step,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      }
    });
  }
  /**
   * Create user consent event (for GDPR/privacy)
   */
  static createConsentEvent(consentType, granted, userData) {
    return this.createUserDataEvent("user_consent", userData, {
      event_label: `${consentType}_${granted ? "granted" : "denied"}`,
      custom_properties: {
        consent_type: consentType,
        consent_granted: granted,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      }
    });
  }
}
const logger = createLogger("NextAnalytics");
class NextAnalytics {
  constructor() {
    this.initialized = false;
    this.providers = /* @__PURE__ */ new Map();
    this.validator = new EventValidator();
    this.listTracker = ListAttributionTracker.getInstance();
    this.viewTracker = ViewItemListTracker.getInstance();
    this.userTracker = UserDataTracker.getInstance();
    this.autoListener = AutoEventListener.getInstance();
    if (typeof window !== "undefined") {
      window.NextDataLayerTransformFn = null;
    }
  }
  static getInstance() {
    if (!NextAnalytics.instance) {
      NextAnalytics.instance = new NextAnalytics();
    }
    return NextAnalytics.instance;
  }
  /**
   * Initialize the analytics system
   */
  async initialize() {
    if (this.initialized) {
      logger.debug("Analytics already initialized");
      return;
    }
    try {
      const config = configStore.getState();
      if (!config.analytics?.enabled) {
        logger.info("Analytics disabled in configuration");
        return;
      }
      dataLayer.initialize();
      if (config.analytics.debug) {
        dataLayer.setDebugMode(true);
      }
      await this.initializeProviders(config.analytics);
      PendingEventsHandler.getInstance().processPendingEvents();
      if (config.analytics.mode === "auto") {
        this.initializeAutoTracking();
      }
      this.initialized = true;
      logger.info("NextAnalytics initialized successfully", {
        providers: Array.from(this.providers.keys()),
        mode: config.analytics.mode
      });
      this.track(UserEvents.createUserDataEvent("dl_user_data"));
    } catch (error) {
      logger.error("Failed to initialize analytics:", error);
      throw error;
    }
  }
  /**
   * Initialize analytics providers
   */
  async initializeProviders(config) {
    if (config.providers?.nextCampaign?.enabled) {
      const nextCampaignAdapter = new NextCampaignAdapter();
      await nextCampaignAdapter.initialize();
      this.providers.set("nextCampaign", nextCampaignAdapter);
      dataLayer.addProvider(nextCampaignAdapter);
      logger.info("NextCampaign adapter initialized");
    }
    if (config.providers?.gtm?.enabled) {
      const gtmAdapter = new GTMAdapter();
      this.providers.set("gtm", gtmAdapter);
      dataLayer.addProvider(gtmAdapter);
      logger.info("GTM adapter initialized");
    }
    if (config.providers?.facebook?.enabled && config.providers.facebook.settings?.pixelId) {
      const fbAdapter = new FacebookAdapter(config.providers.facebook);
      this.providers.set("facebook", fbAdapter);
      dataLayer.addProvider(fbAdapter);
      logger.info("Facebook Pixel adapter initialized", {
        blockedEvents: config.providers.facebook.blockedEvents || []
      });
    }
    if (config.providers?.rudderstack?.enabled) {
      const rudderAdapter = new RudderStackAdapter();
      this.providers.set("rudderstack", rudderAdapter);
      dataLayer.addProvider(rudderAdapter);
      logger.info("RudderStack adapter initialized");
    }
    if (config.providers?.custom?.enabled && config.providers.custom.settings?.endpoint) {
      const customAdapter = new CustomAdapter(config.providers.custom.settings);
      this.providers.set("custom", customAdapter);
      dataLayer.addProvider(customAdapter);
      logger.info("Custom adapter initialized");
    }
  }
  /**
   * Initialize automatic tracking features
   */
  initializeAutoTracking() {
    this.listTracker.initialize();
    this.viewTracker.initialize();
    this.userTracker.initialize();
    this.autoListener.initialize();
    logger.info("Auto-tracking initialized");
  }
  /**
   * Track an event
   */
  track(event) {
    if (!this.initialized) {
      logger.warn("Analytics not initialized, queuing event:", event.event);
    }
    if (dataLayer.isDebugMode()) {
      const validation = this.validator.validateEvent(event);
      if (!validation.valid) {
        logger.error("Event validation failed:", validation.errors);
        if (validation.warnings.length > 0) {
          logger.warn("Event validation warnings:", validation.warnings);
        }
      }
    }
    dataLayer.push(event);
  }
  /**
   * Enable/disable debug mode
   */
  setDebugMode(enabled) {
    dataLayer.setDebugMode(enabled);
    logger.info(`Debug mode ${enabled ? "enabled" : "disabled"}`);
  }
  /**
   * Set transform function for events
   */
  setTransformFunction(fn) {
    dataLayer.setTransformFunction(fn);
  }
  /**
   * Handle route changes (for SPAs)
   */
  invalidateContext() {
    dataLayer.invalidateContext();
    this.viewTracker.reset();
    this.track(UserEvents.createUserDataEvent("dl_user_data"));
  }
  /**
   * Get analytics status
   */
  getStatus() {
    return {
      initialized: this.initialized,
      debugMode: dataLayer.isDebugMode(),
      providers: Array.from(this.providers.keys()),
      eventsTracked: dataLayer.getEventCount()
    };
  }
  /**
   * Convenience methods for common events
   */
  trackViewItemList(items, listId, listName) {
    this.track(EcommerceEvents.createViewItemListEvent(items, listId, listName));
  }
  trackViewItem(item) {
    this.track(EcommerceEvents.createViewItemEvent(item));
  }
  trackAddToCart(item, listId, listName) {
    this.track(EcommerceEvents.createAddToCartEvent(item, listId, listName));
  }
  trackBeginCheckout() {
    this.track(EcommerceEvents.createBeginCheckoutEvent());
  }
  trackPurchase(orderData) {
    this.track(EcommerceEvents.createPurchaseEvent(orderData));
  }
  trackSignUp(email) {
    const userData = email ? { customer_email: email } : void 0;
    this.track(UserEvents.createSignUpEvent("email", userData));
  }
  trackLogin(email) {
    const userData = email ? { customer_email: email } : void 0;
    this.track(UserEvents.createLoginEvent("email", userData));
  }
}
const nextAnalytics = NextAnalytics.getInstance();
if (typeof window !== "undefined") {
  window.NextAnalytics = nextAnalytics;
  window.NextDataLayerManager = dataLayer;
  window.NextInvalidateContext = () => {
    nextAnalytics.invalidateContext();
  };
}
export {
  EcommerceEvents,
  EventValidator,
  NextAnalytics,
  UserEvents,
  dataLayer,
  nextAnalytics
};
