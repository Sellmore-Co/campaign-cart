/**
 * EventManager - Manages platform-specific events
 * 
 * This class provides a centralized system for firing events to different platforms
 * such as Google Tag Manager, Facebook Pixel, etc. It handles ecommerce events
 * like view_item_list, add_to_cart, purchase, etc.
 */

export class EventManager {
  #app;
  #logger;
  #isInitialized = false;
  #platforms = {
    gtm: { enabled: false, initialized: false },
    fbPixel: { enabled: false, initialized: false },
    ga4: { enabled: false, initialized: false }
  };
  #debugMode = false;
  #processedOrderIds = new Set(); // Track processed order IDs to prevent duplicates

  constructor(app) {
    this.#app = app;
    this.#logger = app.logger.createModuleLogger('EVENT');
    this.#debugMode = app.options?.debug || false;
    
    // Initialize the event manager
    this.init();
  }

  /**
   * Initialize the event manager
   */
  init() {
    this.#logger.info('Initializing EventManager');
    
    // Detect available platforms
    this.#detectPlatforms();
    
    // Subscribe to relevant app events
    this.#setupEventListeners();
    
    // Load processed order IDs from sessionStorage to prevent duplicates across page loads
    this.#loadProcessedOrderIds();
    
    this.#isInitialized = true;
    this.#logger.info('EventManager initialized');
  }

  /**
   * Load processed order IDs from sessionStorage
   */
  #loadProcessedOrderIds() {
    try {
      const storedIds = sessionStorage.getItem('os_processed_order_ids');
      if (storedIds) {
        const parsedIds = JSON.parse(storedIds);
        if (Array.isArray(parsedIds)) {
          parsedIds.forEach(id => this.#processedOrderIds.add(id));
          this.#logger.debug(`Loaded ${parsedIds.length} processed order IDs from sessionStorage`);
        }
      }
    } catch (error) {
      this.#logger.error('Error loading processed order IDs from sessionStorage:', error);
    }
  }

  /**
   * Save processed order IDs to sessionStorage
   */
  #saveProcessedOrderIds() {
    try {
      const idsArray = Array.from(this.#processedOrderIds);
      sessionStorage.setItem('os_processed_order_ids', JSON.stringify(idsArray));
      this.#logger.debug(`Saved ${idsArray.length} processed order IDs to sessionStorage`);
    } catch (error) {
      this.#logger.error('Error saving processed order IDs to sessionStorage:', error);
    }
  }

  /**
   * Detect which platforms are available
   */
  #detectPlatforms() {
    // Check for Google Tag Manager
    if (typeof window.dataLayer !== 'undefined') {
      this.#platforms.gtm.enabled = true;
      this.#platforms.gtm.initialized = true;
      this.#logger.info('Google Tag Manager detected');
    } else {
      this.#logger.info('Google Tag Manager not detected');
    }

    // Check for Facebook Pixel
    if (typeof window.fbq !== 'undefined') {
      this.#platforms.fbPixel.enabled = true;
      this.#platforms.fbPixel.initialized = true;
      this.#logger.info('Facebook Pixel detected');
    } else {
      this.#logger.info('Facebook Pixel not detected');
    }

    // Check for Google Analytics 4
    if (typeof window.gtag !== 'undefined') {
      this.#platforms.ga4.enabled = true;
      this.#platforms.ga4.initialized = true;
      this.#logger.info('Google Analytics 4 detected');
    } else {
      this.#logger.info('Google Analytics 4 not detected');
    }
  }

  /**
   * Setup event listeners for app events
   */
  #setupEventListeners() {
    // Listen for campaign loaded event
    this.#app.on('campaign.loaded', (data) => {
      this.#logger.debug('Campaign loaded event received, firing view_item_list');
      if (data && data.campaign) {
        this.viewItemList(data.campaign);
      } else {
        this.#logger.warn('Campaign loaded event received but no campaign data found');
      }
    });

    // Listen for cart updated event
    this.#app.on('cart.updated', (data) => {
      if (data.cart && data.cart.items && data.cart.items.length > 0) {
        this.addToCart(data.cart);
      }
    });

    // Listen for order created event
    // commented to trigger only on first page they load.
    
    // this.#app.on('order.created', (data) => {
    //   this.purchase(data);
    // });
    
    // Listen for order loaded event (for receipt page)
    this.#app.on('order.loaded', (data) => {
      if (data.order) {
        this.#logger.info('Order loaded on receipt page, checking if purchase event needed');
        this.purchase(data.order);
      }
    });
  }

  /**
   * Fire a view_item_list event
   * @param {Object} campaignData - The campaign data
   */
  viewItemList(campaignData) {
    this.#logger.debug('viewItemList called with campaign data:', campaignData ? 'present' : 'missing');
    
    if (!campaignData || !campaignData.packages || campaignData.packages.length === 0) {
      this.#logger.warn('Cannot fire view_item_list event: No packages found in campaign data');
      return;
    }

    this.#logger.debug(`Found ${campaignData.packages.length} packages in campaign data`);
    
    const items = campaignData.packages.map(pkg => ({
      item_id: pkg.external_id || pkg.ref_id,
      item_name: pkg.name,
      price: parseFloat(pkg.price) || 0,
      currency: campaignData.currency || 'USD',
      quantity: 1
    }));

    const eventData = {
      event: 'view_item_list',
      ecommerce: {
        currency: campaignData.currency || 'USD',
        items: items
      }
    };

    this.#logger.debug('Firing view_item_list event with data:', eventData);
    this.#fireEvent('view_item_list', eventData);
  }

  /**
   * Fire an add_to_cart event
   * @param {Object} cartData - The cart data or a single package object
   */
  addToCart(cartData) {
    // Check if this is a single package object rather than a cart
    const isSinglePackage = !cartData.items && !cartData.totals;
    
    let items = [];
    let currency = 'USD';
    let value = 0;
    
    if (isSinglePackage) {
      // Convert single package to cart format
      this.#logger.debug('addToCart called with single package, converting to cart format');
      
      if (!cartData) {
        this.#logger.warn('Cannot fire add_to_cart event: No package data provided');
        return;
      }
      
      // Extract package data
      const pkg = cartData;
      const item = {
        item_id: pkg.external_id || pkg.ref_id || pkg.id,
        item_name: pkg.name,
        price: parseFloat(pkg.price) || 0,
        currency: pkg.currency || this.#app.getCampaignData()?.currency || 'USD',
        quantity: pkg.quantity || 1
      };
      
      items = [item];
      currency = item.currency;
      value = item.price * item.quantity;
    } else {
      // Standard cart format
      if (!cartData || !cartData.items || cartData.items.length === 0) {
        this.#logger.warn('Cannot fire add_to_cart event: No items in cart');
        return;
      }
      
      items = cartData.items.map(item => ({
        item_id: item.external_id || item.id,
        item_name: item.name,
        price: parseFloat(item.price) || 0,
        currency: cartData.totals?.currency || 'USD',
        quantity: item.quantity || 1
      }));
      
      currency = cartData.totals?.currency || 'USD';
      value = cartData.totals?.total || 0;
    }

    const eventData = {
      event: 'add_to_cart',
      ecommerce: {
        currency: currency,
        value: value,
        items: items
      }
    };

    this.#fireEvent('add_to_cart', eventData);
  }

  /**
   * Fire a purchase event
   * @param {Object} orderData - The order data
   * @param {boolean} force - Whether to force firing the event even if the order ID has been processed
   */
  purchase(orderData, force = false) {
    if (!orderData || !orderData.lines || orderData.lines.length === 0) {
      this.#logger.warn('Cannot fire purchase event: No items in order');
      return;
    }

    // Check if this order has already been processed
    const orderId = orderData.number || orderData.ref_id;
    if (!force && orderId && this.#processedOrderIds.has(orderId)) {
      this.#logger.info(`Purchase event for order ${orderId} already fired, skipping`);
      return;
    }

    const items = orderData.lines.map(line => ({
      item_id: line.product_id || line.id,
      item_name: line.product_title || line.name,
      price: parseFloat(line.price_incl_tax || line.price) || 0,
      currency: orderData.currency || 'USD',
      quantity: line.quantity || 1
    }));

    // Get user data with privacy considerations
    const userData = this.#getUserDataForTracking(orderData);

    const eventData = {
      event: 'purchase',
      ecommerce: {
        transaction_id: orderId,
        value: parseFloat(orderData.total_incl_tax || orderData.total) || 0,
        tax: parseFloat(orderData.total_tax) || 0,
        shipping: parseFloat(orderData.shipping_incl_tax || orderData.shipping) || 0,
        currency: orderData.currency || 'USD',
        coupon: orderData.vouchers?.length > 0 ? orderData.vouchers[0].code : '',
        ...userData,
        items: items
      }
    };

    this.#fireEvent('purchase', eventData);

    // Mark this order as processed
    if (orderId) {
      this.#processedOrderIds.add(orderId);
      this.#saveProcessedOrderIds();
      this.#logger.debug(`Marked order ${orderId} as processed`);
    }
  }

  /**
   * Get user data for tracking with privacy considerations
   * @param {Object} orderData - The order data
   * @returns {Object} - User data for tracking
   */
  #getUserDataForTracking(orderData) {
    const userData = {};
    
    if (orderData.user) {
      // Only include non-PII data or hashed values
      if (orderData.user.first_name) userData.firstname = orderData.user.first_name;
      if (orderData.user.last_name) userData.lastname = orderData.user.last_name;
      
      // Hash email for privacy
      if (orderData.user.email) {
        userData.email_hash = this.#hashString(orderData.user.email);
      }
    }
    
    if (orderData.shipping_address) {
      userData.city = orderData.shipping_address.line4 || '';
      userData.state = orderData.shipping_address.state || '';
      userData.zipcode = orderData.shipping_address.postcode || '';
      userData.country = orderData.shipping_address.country || '';
    }
    
    return userData;
  }

  /**
   * Hash a string for privacy
   * @param {string} str - The string to hash
   * @returns {string} - The hashed string
   */
  #hashString(str) {
    let hash = 0;
    if (str.length === 0) return hash.toString();
    
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    
    return hash.toString();
  }

  /**
   * Fire an event to all enabled platforms
   * @param {string} eventName - The name of the event
   * @param {Object} eventData - The event data
   */
  #fireEvent(eventName, eventData) {
    this.#logger.debug(`Firing ${eventName} event`, eventData);

    // Clear previous ecommerce data for GTM
    if (this.#platforms.gtm.enabled) {
      window.dataLayer = window.dataLayer || [];
      this.#logger.debug('Clearing previous ecommerce data in dataLayer');
      window.dataLayer.push({ ecommerce: null });
      
      // Add a console log that's easy to spot
      console.log(`🔥 Firing ${eventName} event to dataLayer`);
      
      // this.#logger.debug('Pushing event data to dataLayer');
      window.dataLayer.push(eventData);
      

      this.#logger.debug(`${eventName} event fired to Google Tag Manager`);
    } else {
      this.#logger.warn(`Cannot fire ${eventName} event to GTM: GTM not enabled`);
      
      // Try to initialize dataLayer anyway
      console.log('GTM not detected, initializing dataLayer and pushing event');
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({ ecommerce: null });
      window.dataLayer.push(eventData);
    }

    // Fire event to Facebook Pixel
    if (this.#platforms.fbPixel.enabled) {
      switch (eventName) {
        case 'view_item_list':
          window.fbq('track', 'ViewContent', {
            content_type: 'product_group',
            content_ids: eventData.ecommerce.items.map(item => item.item_id),
            currency: eventData.ecommerce.currency
          });
          break;
        case 'add_to_cart':
          window.fbq('track', 'AddToCart', {
            content_type: 'product_group',
            content_ids: eventData.ecommerce.items.map(item => item.item_id),
            currency: eventData.ecommerce.currency,
            value: eventData.ecommerce.value
          });
          break;
        case 'purchase':
          window.fbq('track', 'Purchase', {
            content_type: 'product_group',
            content_ids: eventData.ecommerce.items.map(item => item.item_id),
            currency: eventData.ecommerce.currency,
            value: eventData.ecommerce.value
          });
          break;
      }
      this.#logger.debug(`${eventName} event fired to Facebook Pixel`);
    }

    // Fire event to Google Analytics 4
    if (this.#platforms.ga4.enabled) {
      window.gtag('event', eventName, {
        currency: eventData.ecommerce.currency,
        value: eventData.ecommerce.value,
        items: eventData.ecommerce.items
      });
      this.#logger.debug(`${eventName} event fired to Google Analytics 4`);
    }

    // Dispatch a DOM event for custom handlers
    const customEvent = new CustomEvent(`os:${eventName}`, {
      bubbles: true,
      detail: eventData
    });
    document.dispatchEvent(customEvent);
  }

  /**
   * Manually fire a view_item event
   * @param {Object} packageData - The package data
   */
  viewItem(packageData) {
    if (!packageData) {
      this.#logger.warn('Cannot fire view_item event: No package data provided');
      return;
    }

    const item = {
      item_id: packageData.ref_id || packageData.external_id || packageData.id,
      item_name: packageData.name,
      price: parseFloat(packageData.price) || 0,
      currency: packageData.currency || this.#app.getCampaignData()?.currency || 'USD',
      quantity: 1
    };

    const eventData = {
      event: 'view_item',
      ecommerce: {
        currency: item.currency,
        value: item.price,
        items: [item]
      }
    };

    this.#fireEvent('view_item', eventData);
  }

  /**
   * Manually fire a begin_checkout event
   */
  beginCheckout() {
    const cart = this.#app.state.getState('cart');
    
    if (!cart || !cart.items || cart.items.length === 0) {
      this.#logger.warn('Cannot fire begin_checkout event: No items in cart');
      return;
    }

    const items = cart.items.map(item => ({
      item_id: item.external_id || item.id,
      item_name: item.name,
      price: parseFloat(item.price) || 0,
      currency: cart.totals?.currency || 'USD',
      quantity: item.quantity || 1
    }));

    const eventData = {
      event: 'begin_checkout',
      ecommerce: {
        currency: cart.totals?.currency || 'USD',
        value: cart.totals?.total || 0,
        items: items
      }
    };

    this.#fireEvent('begin_checkout', eventData);
  }

  /**
   * Manually fire a custom event
   * @param {string} eventName - The name of the event
   * @param {Object} eventData - The event data
   */
  fireCustomEvent(eventName, eventData = {}) {
    if (!eventName) {
      this.#logger.warn('Cannot fire custom event: No event name provided');
      return;
    }

    const formattedEventData = {
      event: eventName,
      ...eventData
    };

    this.#logger.debug(`Firing custom event: ${eventName}`, formattedEventData);

    // Fire to Google Tag Manager
    if (this.#platforms.gtm.enabled) {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push(formattedEventData);
      this.#logger.debug(`Custom event ${eventName} fired to Google Tag Manager`);
    }

    // Fire to Facebook Pixel
    if (this.#platforms.fbPixel.enabled && typeof window.fbq === 'function') {
      window.fbq('trackCustom', eventName, eventData);
      this.#logger.debug(`Custom event ${eventName} fired to Facebook Pixel`);
    }

    // Fire to Google Analytics 4
    if (this.#platforms.ga4.enabled && typeof window.gtag === 'function') {
      window.gtag('event', eventName, eventData);
      this.#logger.debug(`Custom event ${eventName} fired to Google Analytics 4`);
    }

    // Dispatch a DOM event for custom handlers
    const customEvent = new CustomEvent(`os:${eventName}`, {
      bubbles: true,
      detail: formattedEventData
    });
    document.dispatchEvent(customEvent);
  }

  /**
   * Enable or disable a platform
   * @param {string} platform - The platform to enable/disable (gtm, fbPixel, ga4)
   * @param {boolean} enabled - Whether to enable or disable the platform
   */
  setPlatformEnabled(platform, enabled) {
    if (this.#platforms[platform]) {
      this.#platforms[platform].enabled = enabled;
      this.#logger.info(`${platform} ${enabled ? 'enabled' : 'disabled'}`);
    } else {
      this.#logger.warn(`Unknown platform: ${platform}`);
    }
  }

  /**
   * Get the status of all platforms
   * @returns {Object} - The status of all platforms
   */
  getPlatformStatus() {
    return { ...this.#platforms };
  }
} 