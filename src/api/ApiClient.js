/**
 * ApiClient - Handles API requests to the 29next API
 * 
 * This class is responsible for making API requests to the 29next API,
 * including fetching campaign data, creating carts, and processing orders.
 */

export class ApiClient {
  #app;
  #apiKey;
  #baseUrl = 'https://campaigns.apps.29next.com/api/v1';
  #logger;

  constructor(app) {
    this.#app = app;
    this.#logger = app.logger.createModuleLogger('API');
  }

  init() {
    this.#logger.info('Initializing ApiClient');
    
    this.#apiKey = this.#app.config.apiKey;
    
    if (this.#apiKey) {
      this.#logger.info('API key is set');
    } else {
      const apiKeyMeta = document.querySelector('meta[name="os-api-key"]');
      this.#apiKey = apiKeyMeta?.getAttribute('content');
      this.#logger.info(this.#apiKey ? 'API key retrieved from meta tag' : 'API key is not set');
    }
    
    const proxyMeta = document.querySelector('meta[name="os-proxy-url"]');
    const proxyUrl = proxyMeta?.getAttribute('content');
    if (proxyUrl) {
      this.#baseUrl = proxyUrl;
      this.#logger.info(`Using proxy URL: ${proxyUrl}`);
    }
  }

  #buildUrl(endpoint) {
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
    return `${this.#baseUrl}/${cleanEndpoint}`;
  }

  async #request(endpoint, method = 'GET', data = null) {
    if (!this.#apiKey) {
      this.#logger.warn('API key is not set');
      if (endpoint === 'campaigns/') {
        this.#logger.info('Returning mock campaign data since API key is not set');
        return [{
          name: 'Mock Campaign',
          id: 'mock-campaign',
          currency: 'USD',
          locale: 'en-US',
          packages: [],
          products: []
        }];
      }
      throw new Error('API key is required');
    }

    const url = this.#buildUrl(endpoint);
    const options = {
      method,
      mode: 'cors',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': this.#apiKey
      }
    };

    if (method !== 'GET' && data) options.body = JSON.stringify(data);

    this.#logger.debug(`Making ${method} request to ${url}`, method !== 'GET' ? { requestData: data } : {});

    try {
      const response = await fetch(url, options);
      this.#logger.debug(`Received response from ${url} with status ${response.status}`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        this.#logger.error(`API error response from ${url}:`, errorData);
        throw new Error(JSON.stringify(errorData));
      }

      const responseData = await response.json();
      this.#logger.debug(`Successfully processed response from ${url}`);
      return responseData;
    } catch (error) {
      this.#logger.error(`API request failed: ${endpoint}`, error);
      if (error.message?.match(/NetworkError|Failed to fetch|Network request failed/)) {
        this.#logger.warn('This appears to be a CORS issue. Make sure the API endpoint allows cross-origin requests.');
      }
      throw error;
    }
  }

  async getCampaign() {
    try {
      const campaignsData = await this.#request('campaigns/');
      this.#logger.debug('Campaign data received');

      if (Array.isArray(campaignsData) && campaignsData.length > 0) return campaignsData[0];
      if (campaignsData?.name) return campaignsData;

      throw new Error('No valid campaign data found');
    } catch (error) {
      this.#logger.error('Error fetching campaign:', error);
      this.#logger.warn('Using fallback empty campaign object');
      return {
        name: 'Default Campaign',
        currency: 'USD',
        packages: [],
        formatPrice: price => `$${Number.parseFloat(price).toFixed(2)}`
      };
    }
  }

  /**
   * Get attribution data from the app instance
   * @returns {Object} Attribution data
   */
  #getAttributionData() {
    // Try to get from AttributionManager first
    if (this.#app.attribution) {
      // Use getAttributionForApi() which formats data correctly for the API
      if (typeof this.#app.attribution.getAttributionForApi === 'function') {
        return this.#app.attribution.getAttributionForApi();
      }
      return this.#app.attribution.getAttributionData();
    }
    
    // Fall back to state if AttributionManager is not available
    if (this.#app.state) {
      // Try to get the API-formatted attribution data first
      const apiFormatted = this.#app.state.getState('attribution');
      if (apiFormatted) {
        return apiFormatted;
      }
      // Fall back to the complete attribution data if necessary
      return this.#app.state.getState('cart.attribution') || {};
    }
    
    return {};
  }

  /**
   * Create a cart via the API
   * @param {Object} cartData - The cart data
   * @returns {Promise<Object>} The created cart
   */
  async createCart(cartData) {
    this.#logger.debug('Creating cart', cartData);
    
    // Ensure attribution data is included
    if (!cartData.attribution) {
      cartData.attribution = this.#getAttributionData();
      this.#logger.debug('Added attribution data to cart:', cartData.attribution);
    } else {
      this.#logger.debug('Cart already has attribution data:', cartData.attribution);
    }
    
    try {
      const response = await this.#request('carts/', 'POST', cartData);
      this.#logger.info('Cart created successfully', response);
      return response;
    } catch (error) {
      this.#logger.error('Error creating cart', error);
      throw error;
    }
  }

  /**
   * Create an order via the API
   * @param {Object} orderData - The order data
   * @returns {Promise<Object>} The created order
   */
  async createOrder(orderData) {
    this.#logger.debug('Creating order', orderData);
    
    // Ensure attribution data is included
    if (!orderData.attribution) {
      orderData.attribution = this.#getAttributionData();
      this.#logger.debug('Added attribution data to order:', orderData.attribution);
    } else {
      this.#logger.debug('Order already has attribution data:', orderData.attribution);
    }
    
    // Check if this is a test order with test_card token
    if (orderData.payment_token === 'test_card' || 
        (orderData.payment_detail && orderData.payment_detail.card_token === 'test_card')) {
      
      this.#logger.debug('Using test card token for order');
      
      // Ensure payment_detail is properly formatted for test card
      orderData.payment_detail = orderData.payment_detail || {};
      orderData.payment_detail.payment_method = 'card_token';
      orderData.payment_detail.card_token = 'test_card';
      
      // If there was a payment_token at the root level, move it to payment_detail
      if (orderData.payment_token) {
        delete orderData.payment_token;
      }
    }
    
    try {
      const response = await this.#request('orders/', 'POST', orderData);
      this.#logger.info('Order created successfully', response);
      
      // Store order reference ID in sessionStorage
      if (response.ref_id) {
        sessionStorage.setItem('order_ref_id', response.ref_id);
        this.#logger.debug(`Order reference ID stored: ${response.ref_id}`);
      }
      
      return response;
    } catch (error) {
      this.#logger.error('Error creating order', error);
      throw error;
    }
  }

  async getOrder(orderRef) {
    if (!orderRef) throw new Error('Order reference is required');
    this.#logger.debug(`Fetching order with ref: ${orderRef}`);
    return this.#request(`orders/${orderRef}/`);
  }

  /**
   * Add an upsell to an existing order
   * @param {string} orderRef - Order reference ID
   * @param {Object} upsellData - The upsell data including package_id and quantity
   * @returns {Promise<Object>} The updated order
   */
  async createOrderUpsell(orderRef, upsellData) {
    if (!orderRef) throw new Error('Order reference is required');
    this.#logger.debug(`Adding upsell to order ref: ${orderRef}`, upsellData);
    
    // Format the upsell data properly
    const formattedData = {
      lines: Array.isArray(upsellData.lines) ? upsellData.lines : [
        {
          package_id: upsellData.package_id,
          quantity: upsellData.quantity || 1
        }
      ]
    };
    
    // Add payment detail if provided
    if (upsellData.payment_detail) {
      formattedData.payment_detail = upsellData.payment_detail;
    }
    
    try {
      const response = await this.#request(`orders/${orderRef}/upsells/`, 'POST', formattedData);
      this.#logger.info('Upsell added successfully', response);
      return response;
    } catch (error) {
      this.#logger.error('Error adding upsell to order', error);
      throw error;
    }
  }

  async processPayment(orderData, paymentMethod) {
    this.#logger.debug(`Processing ${paymentMethod} payment for order`);

    const paymentMethodMap = {
      'credit': 'card_token',
      'paypal': 'paypal',
      'apple_pay': 'apple_pay',
      'google_pay': 'google_pay'
    };

    orderData.payment_detail = orderData.payment_detail ?? {};
    orderData.payment_detail.payment_method = paymentMethodMap[paymentMethod] ?? paymentMethod;

    if (paymentMethod === 'credit' && !orderData.payment_detail.card_token) {
      throw new Error('Credit card payment requires a card token');
    }
    if (paymentMethod !== 'credit') delete orderData.payment_detail.card_token;

    return this.createOrder(orderData);
  }

  getNextUrlFromOrderResponse(orderResponse, defaultPath = '/checkout/complete') {
    this.#logger.debug('Getting next URL for redirect');

    const refId = orderResponse.ref_id;
    const nextPageMeta = document.querySelector('meta[name="os-next-page"]');
    let defaultUrl = defaultPath;

    if (nextPageMeta?.getAttribute('content')) {
      const nextPagePath = nextPageMeta.getAttribute('content');
      this.#logger.debug(`Found meta tag with next page URL: ${nextPagePath}`);

      const redirectUrl = nextPagePath.startsWith('http') ? 
        new URL(nextPagePath) : 
        new URL(nextPagePath, `${location.protocol}//${location.host}`);
      
      if (refId) redirectUrl.searchParams.append('ref_id', refId);
      return redirectUrl.href;
    }

    if (orderResponse.payment_complete_url) return orderResponse.payment_complete_url;
    if (orderResponse.order_status_url) return orderResponse.order_status_url;

    const currentPath = location.pathname.split("/");
    const basePath = currentPath.slice(0, -1).join("/");
    const defaultFullUrl = new URL(`${basePath}${defaultUrl}`, `${location.protocol}//${location.host}`);
    
    if (refId) defaultFullUrl.searchParams.append('ref_id', refId);
    return defaultFullUrl.href;
  }
}