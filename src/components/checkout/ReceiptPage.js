/**
 * ReceiptPage - Handles the receipt page functionality
 * 
 * This class is responsible for:
 * - Fetching order details using the ref_id from URL parameters
 * - Updating the DOM elements with order information
 * - Handling any receipt-specific interactions
 */

export class ReceiptPage {
  #apiClient;
  #logger;
  #app;
  #orderData = null;
  #orderFetched = false; // Flag to prevent duplicate API calls
  #initialized = false; // Flag to prevent duplicate initialization
  #debugMode = false;
  
  /**
   * Initialize the ReceiptPage
   * @param {Object} apiClient - The API client instance
   * @param {Object} logger - The logger instance
   * @param {Object} app - The main application instance
   */
  constructor(apiClient, logger, app) {
    this.#apiClient = apiClient;
    this.#logger = logger;
    this.#app = app;
    
    // Check for debug mode
    const debugMeta = document.querySelector('meta[name="os-debug"]');
    this.#debugMode = debugMeta?.getAttribute('content') === 'true';
    
    this.#safeLog('info', 'ReceiptPage component created');
    
    // Initialize immediately
    this.init();
  }
  
  // Safe logging method to handle potential missing logger methods
  #safeLog(level, message, ...args) {
    try {
      if (this.#logger && typeof this.#logger[level] === 'function') {
        this.#logger[level](message, ...args);
      } else if (console[level]) {
        console[level](message, ...args);
      } else {
        console.log(`[${level.toUpperCase()}] ${message}`, ...args);
      }
    } catch (error) {
      console.error('Error logging message:', error);
    }
  }
  
  /**
   * Initialize the receipt page
   */
  async init() {
    // Prevent duplicate initialization
    if (this.#initialized) {
      this.#safeLog('info', 'Receipt page already initialized, skipping');
      return;
    }
    
    this.#safeLog('info', 'Initializing Receipt Page');
    this.#initialized = true;
    
    // Get ref_id from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const refId = urlParams.get('ref_id');
    
    if (!refId) {
      this.#safeLog('error', 'No ref_id found in URL parameters');
      this.#showError('Order reference not found. Please check your URL.');
      return;
    }
    
    this.#safeLog('info', `Found ref_id in URL: ${refId}`);
    
    try {
      // Fetch order details
      await this.#fetchOrderDetails(refId);
      
      // Update the DOM with order details
      this.#updateReceiptContent();
    } catch (error) {
      this.#safeLog('error', 'Error initializing receipt page:', error);
      this.#showError('Failed to load order details. Please try again later.');
    }
  }
  
  /**
   * Fetch order details from the API
   * @param {string} refId - The order reference ID
   */
  async #fetchOrderDetails(refId) {
    this.#safeLog('info', `Fetching order details for ref_id: ${refId}`);
    
    // Check if we've already fetched this order to prevent duplicate requests
    if (this.#orderFetched && this.#orderData) {
      this.#safeLog('info', 'Order already fetched, using cached data');
      return this.#orderData;
    }
    
    try {
      // Check if API client is available
      if (!this.#apiClient) {
        throw new Error('API client not available');
      }
      
      // Fetch order details
      this.#safeLog('debug', 'Making API request to fetch order details');
      this.#orderData = await this.#apiClient.getOrder(refId);
      this.#orderFetched = true; // Set flag to prevent duplicate requests
      
      this.#safeLog('info', 'Order details fetched successfully');
      this.#safeLog('debug', 'Order data:', this.#orderData);
      
      return this.#orderData;
    } catch (error) {
      this.#safeLog('error', `Error fetching order details for ref_id ${refId}:`, error);
      throw error;
    }
  }
  
  /**
   * Update the receipt content with order details
   */
  #updateReceiptContent() {
    if (!this.#orderData) {
      this.#safeLog('error', 'No order data available to update receipt content');
      return;
    }
    
    this.#safeLog('info', 'Updating receipt content with order details');
    
    // Update customer name
    this.#updateElement('fname', this.#orderData.user?.first_name || '');
    
    // Update billing information
    if (this.#orderData.billing_address) {
      this.#updateElement('billing_fname', `${this.#orderData.billing_address.first_name} ${this.#orderData.billing_address.last_name}`);
      this.#updateElement('billing_address', this.#formatAddress(this.#orderData.billing_address));
      this.#updateElement('billing_location', this.#formatLocation(this.#orderData.billing_address));
      this.#updateElement('billing_country', this.#getCountryName(this.#orderData.billing_address.country) || '');
    }
    
    // Update shipping information
    if (this.#orderData.shipping_address) {
      this.#updateElement('shipping_fname', `${this.#orderData.shipping_address.first_name} ${this.#orderData.shipping_address.last_name}`);
      this.#updateElement('shipping_address', this.#formatAddress(this.#orderData.shipping_address));
      this.#updateElement('shipping_location', this.#formatLocation(this.#orderData.shipping_address));
      this.#updateElement('shipping_country', this.#getCountryName(this.#orderData.shipping_address.country) || '');
    }
    
    // Update payment method - determine from order data
    const paymentMethod = this.#determinePaymentMethod();
    this.#updateElement('payment_method', paymentMethod);
    
    // Update order lines
    this.#updateOrderLines();
    
    // Update shipping method - use both attribute names for compatibility
    const shippingMethod = this.#orderData.shipping_method || 'Standard Shipping';
    this.#updateElement('shipping-method', shippingMethod); // Hyphen version
    this.#updateElement('shipping_method', shippingMethod); // Underscore version
    
    // Update tax information - show only if taxes exist
    const taxContainer = document.querySelector('[data-os-receipt="tax-container"]');
    if (taxContainer) {
      const totalTax = parseFloat(this.#orderData.total_tax || 0);
      
      if (totalTax > 0) {
        // Show tax container and update tax amount
        taxContainer.style.display = 'flex';
        this.#updateElement('taxes', this.#formatCurrency(totalTax));
      } else {
        // Hide tax container if no taxes
        taxContainer.style.display = 'none';
      }
    }
    
    // Update total
    const total = this.#formatCurrency(parseFloat(this.#orderData.total_incl_tax) || 0);
    this.#updateElement('total', total);
    
    // Update order number
    this.#updateElement('order_number', this.#orderData.number || '');
    
    // Update order reference
    this.#updateElement('order_reference', this.#orderData.ref_id || '');
    
    this.#safeLog('info', 'Receipt content updated successfully');
  }
  
  /**
   * Determine payment method from order data
   * @returns {string} The formatted payment method
   */
  #determinePaymentMethod() {
    // Check if payment_detail exists in the order data
    if (this.#orderData.payment_detail && this.#orderData.payment_detail.payment_method) {
      return this.#formatPaymentMethod(this.#orderData.payment_detail.payment_method);
    }
    
    // If no payment_detail, try to determine from other fields
    if (this.#orderData.payment_method) {
      return this.#formatPaymentMethod(this.#orderData.payment_method);
    }
    
    // Default to Credit Card if we can't determine
    return 'Credit Card';
  }
  
  /**
   * Update order lines in the receipt
   */
  #updateOrderLines() {
    if (!this.#orderData.lines || !Array.isArray(this.#orderData.lines)) {
      this.#safeLog('warn', 'No order lines available');
      return;
    }
    
    const orderLinesContainer = document.querySelector('[data-os-receipt="order-lines"]');
    if (!orderLinesContainer) {
      this.#safeLog('warn', 'Order lines container not found in DOM');
      return;
    }
    
    // Clear existing content
    orderLinesContainer.innerHTML = '';
    
    // Template for a product line
    const lineTemplate = document.querySelector('[data-os-receipt="product-line"]');
    
    // If no template is found, create a simple one
    let template = lineTemplate ? lineTemplate.outerHTML : `
      <div data-os-receipt="product-line" class="cart-summary__line">
        <div class="cart-summary__line-item">
          <div data-os-receipt="line-title" class="cart-line__title"></div>
          <div data-os-receipt="line-saving" class="cart-line__discount"></div>
        </div>
        <div class="cart-summary__line-item">
          <p data-os-receipt="line-compare" class="pb-cart__line-price pb--compare"></p>
          <p data-os-receipt="line-subtotal" class="pb-cart__line-price"></p>
        </div>
      </div>
    `;
    
    // Add each order line
    this.#orderData.lines.forEach(line => {
      // Create a new line element
      const lineElement = document.createElement('div');
      lineElement.innerHTML = template;
      const newLine = lineElement.firstElementChild;
      
      // Update line details
      const productTitle = line.product_title || line.title || line.package_title || 'Product';
      this.#updateElementInNode(newLine, 'line-title', productTitle);
      
      // Calculate savings if compare price is available
      if (line.price_excl_tax_excl_discounts && 
          parseFloat(line.price_excl_tax_excl_discounts) > parseFloat(line.price_excl_tax)) {
        const originalPrice = parseFloat(line.price_excl_tax_excl_discounts);
        const currentPrice = parseFloat(line.price_excl_tax);
        const savingsPercent = Math.round((1 - currentPrice / originalPrice) * 100);
        
        this.#updateElementInNode(newLine, 'line-saving', `(${savingsPercent}% OFF)`);
        this.#updateElementInNode(newLine, 'line-compare', this.#formatCurrency(originalPrice));
      } else {
        // Hide savings elements if no compare price
        const savingElement = newLine.querySelector('[data-os-receipt="line-saving"]');
        const compareElement = newLine.querySelector('[data-os-receipt="line-compare"]');
        if (savingElement) savingElement.style.display = 'none';
        if (compareElement) compareElement.style.display = 'none';
      }
      
      // Update subtotal - use price excluding tax instead of price including tax
      const price = parseFloat(line.price_excl_tax) || 0;
      this.#updateElementInNode(newLine, 'line-subtotal', this.#formatCurrency(price));
      
      // Add the line to the container
      orderLinesContainer.appendChild(newLine);
    });
  }
  
  /**
   * Update an element with the given value
   * @param {string} attribute - The data-os-receipt attribute value
   * @param {string} value - The value to set
   */
  #updateElement(attribute, value) {
    const elements = document.querySelectorAll(`[data-os-receipt="${attribute}"]`);
    
    if (elements.length === 0) {
      this.#safeLog('debug', `No elements found with data-os-receipt="${attribute}"`);
      return;
    }
    
    elements.forEach(element => {
      element.textContent = value;
    });
  }
  
  /**
   * Update an element within a specific node
   * @param {HTMLElement} node - The parent node
   * @param {string} attribute - The data-os-receipt attribute value
   * @param {string} value - The value to set
   */
  #updateElementInNode(node, attribute, value) {
    const element = node.querySelector(`[data-os-receipt="${attribute}"]`);
    
    if (!element) {
      this.#safeLog('debug', `No element found with data-os-receipt="${attribute}" in node`);
      return;
    }
    
    element.textContent = value;
  }
  
  /**
   * Format an address for display
   * @param {Object} address - The address object
   * @returns {string} The formatted address
   */
  #formatAddress(address) {
    let formattedAddress = '';
    
    if (address.line1) {
      formattedAddress += address.line1;
    }
    
    if (address.line2) {
      formattedAddress += formattedAddress ? `, ${address.line2}` : address.line2;
    }
    
    return formattedAddress;
  }
  
  /**
   * Format location (city, state, zip) for display
   * @param {Object} address - The address object
   * @returns {string} The formatted location
   */
  #formatLocation(address) {
    let parts = [];
    
    if (address.line4) {
      parts.push(address.line4); // City is in line4
    }
    
    if (address.state) {
      parts.push(address.state);
    }
    
    if (address.postcode) {
      parts.push(address.postcode);
    }
    
    return parts.join(', ');
  }
  
  /**
   * Get country name from country code
   * @param {string} countryCode - The country code
   * @returns {string} The country name
   */
  #getCountryName(countryCode) {
    const countryMap = {
      'US': 'United States',
      'CA': 'Canada',
      'GB': 'United Kingdom',
      'AU': 'Australia',
      'NZ': 'New Zealand',
      // Add more countries as needed
    };
    
    return countryMap[countryCode] || countryCode;
  }
  
  /**
   * Format payment method for display
   * @param {string} method - The payment method
   * @returns {string} The formatted payment method
   */
  #formatPaymentMethod(method) {
    const methodMap = {
      'card_token': 'Credit Card',
      'paypal': 'PayPal',
      'apple_pay': 'Apple Pay',
      'google_pay': 'Google Pay',
      'credit': 'Credit Card',
      'card': 'Credit Card'
    };
    
    return methodMap[method] || method;
  }
  
  /**
   * Format currency for display
   * @param {number} amount - The amount
   * @returns {string} The formatted currency
   */
  #formatCurrency(amount) {
    const currency = this.#orderData.currency || 'USD';
    
    // Ensure amount is a number
    const numericAmount = parseFloat(amount);
    
    if (isNaN(numericAmount)) {
      this.#safeLog('warn', `Invalid amount for currency formatting: ${amount}`);
      return `$0.00 ${currency}`;
    }
    
    try {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency
      }).format(numericAmount);
    } catch (error) {
      this.#safeLog('error', `Error formatting currency: ${error}`);
      return `$${numericAmount.toFixed(2)} ${currency}`;
    }
  }
  
  /**
   * Show an error message on the page
   * @param {string} message - The error message
   */
  #showError(message) {
    this.#safeLog('error', `Displaying error message: ${message}`);
    
    // Find a container to show the error
    const container = document.querySelector('.receipt-content') || document.body;
    
    // Create error element
    const errorElement = document.createElement('div');
    errorElement.className = 'receipt-error';
    errorElement.style.color = 'red';
    errorElement.style.padding = '20px';
    errorElement.style.margin = '20px 0';
    errorElement.style.border = '1px solid red';
    errorElement.style.borderRadius = '5px';
    errorElement.style.backgroundColor = 'rgba(255, 0, 0, 0.1)';
    errorElement.textContent = message;
    
    // Add to the beginning of the container
    container.prepend(errorElement);
  }
} 