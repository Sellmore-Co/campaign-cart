"use strict";
var TwentyNineNext = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __esm = (fn, res) => function __init() {
    return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
  };
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
  var __accessCheck = (obj, member, msg) => {
    if (!member.has(obj))
      throw TypeError("Cannot " + msg);
  };
  var __privateGet = (obj, member, getter) => {
    __accessCheck(obj, member, "read from private field");
    return getter ? getter.call(obj) : member.get(obj);
  };
  var __privateAdd = (obj, member, value) => {
    if (member.has(obj))
      throw TypeError("Cannot add the same private member more than once");
    member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
  };
  var __privateSet = (obj, member, value, setter) => {
    __accessCheck(obj, member, "write to private field");
    setter ? setter.call(obj, value) : member.set(obj, value);
    return value;
  };
  var __privateWrapper = (obj, member, setter, getter) => ({
    set _(value) {
      __privateSet(obj, member, value, setter);
    },
    get _() {
      return __privateGet(obj, member, getter);
    }
  });
  var __privateMethod = (obj, member, method) => {
    __accessCheck(obj, member, "access private method");
    return method;
  };

  // src/components/checkout/ReceiptPage.js
  var ReceiptPage_exports = {};
  __export(ReceiptPage_exports, {
    ReceiptPage: () => ReceiptPage
  });
  var _apiClient3, _logger25, _app20, _orderData, _orderFetched, _initialized4, _debugMode5, _safeLog3, safeLog_fn3, _fetchOrderDetails, fetchOrderDetails_fn, _updateReceiptContent, updateReceiptContent_fn, _determinePaymentMethod, determinePaymentMethod_fn, _updateOrderLines, updateOrderLines_fn, _updateElement, updateElement_fn, _updateElementInNode, updateElementInNode_fn, _formatAddress2, formatAddress_fn2, _formatLocation, formatLocation_fn, _getCountryName, getCountryName_fn, _formatPaymentMethod, formatPaymentMethod_fn, _formatCurrency, formatCurrency_fn, _showError3, showError_fn3, ReceiptPage;
  var init_ReceiptPage = __esm({
    "src/components/checkout/ReceiptPage.js"() {
      "use strict";
      ReceiptPage = class {
        /**
         * Initialize the ReceiptPage
         * @param {Object} apiClient - The API client instance
         * @param {Object} logger - The logger instance
         * @param {Object} app - The main application instance
         */
        constructor(apiClient, logger, app) {
          // Safe logging method to handle potential missing logger methods
          __privateAdd(this, _safeLog3);
          /**
           * Fetch order details from the API
           * @param {string} refId - The order reference ID
           */
          __privateAdd(this, _fetchOrderDetails);
          /**
           * Update the receipt content with order details
           */
          __privateAdd(this, _updateReceiptContent);
          /**
           * Determine payment method from order data
           * @returns {string} The formatted payment method
           */
          __privateAdd(this, _determinePaymentMethod);
          /**
           * Update order lines in the receipt
           */
          __privateAdd(this, _updateOrderLines);
          /**
           * Update an element with the given value
           * @param {string} attribute - The data-os-receipt attribute value
           * @param {string} value - The value to set
           */
          __privateAdd(this, _updateElement);
          /**
           * Update an element within a specific node
           * @param {HTMLElement} node - The parent node
           * @param {string} attribute - The data-os-receipt attribute value
           * @param {string} value - The value to set
           */
          __privateAdd(this, _updateElementInNode);
          /**
           * Format an address for display
           * @param {Object} address - The address object
           * @returns {string} The formatted address
           */
          __privateAdd(this, _formatAddress2);
          /**
           * Format location (city, state, zip) for display
           * @param {Object} address - The address object
           * @returns {string} The formatted location
           */
          __privateAdd(this, _formatLocation);
          /**
           * Get country name from country code
           * @param {string} countryCode - The country code
           * @returns {string} The country name
           */
          __privateAdd(this, _getCountryName);
          /**
           * Format payment method for display
           * @param {string} method - The payment method
           * @returns {string} The formatted payment method
           */
          __privateAdd(this, _formatPaymentMethod);
          /**
           * Format currency for display
           * @param {number} amount - The amount
           * @returns {string} The formatted currency
           */
          __privateAdd(this, _formatCurrency);
          /**
           * Show an error message on the page
           * @param {string} message - The error message
           */
          __privateAdd(this, _showError3);
          __privateAdd(this, _apiClient3, void 0);
          __privateAdd(this, _logger25, void 0);
          __privateAdd(this, _app20, void 0);
          __privateAdd(this, _orderData, null);
          __privateAdd(this, _orderFetched, false);
          // Flag to prevent duplicate API calls
          __privateAdd(this, _initialized4, false);
          // Flag to prevent duplicate initialization
          __privateAdd(this, _debugMode5, false);
          __privateSet(this, _apiClient3, apiClient);
          __privateSet(this, _logger25, logger);
          __privateSet(this, _app20, app);
          const debugMeta = document.querySelector('meta[name="os-debug"]');
          __privateSet(this, _debugMode5, debugMeta?.getAttribute("content") === "true");
          __privateMethod(this, _safeLog3, safeLog_fn3).call(this, "info", "ReceiptPage component created");
          this.init();
        }
        /**
         * Initialize the receipt page
         */
        async init() {
          if (__privateGet(this, _initialized4)) {
            __privateMethod(this, _safeLog3, safeLog_fn3).call(this, "info", "Receipt page already initialized, skipping");
            return;
          }
          __privateMethod(this, _safeLog3, safeLog_fn3).call(this, "info", "Initializing Receipt Page");
          __privateSet(this, _initialized4, true);
          const urlParams = new URLSearchParams(window.location.search);
          const refId = urlParams.get("ref_id");
          if (!refId) {
            __privateMethod(this, _safeLog3, safeLog_fn3).call(this, "error", "No ref_id found in URL parameters");
            __privateMethod(this, _showError3, showError_fn3).call(this, "Order reference not found. Please check your URL.");
            return;
          }
          __privateMethod(this, _safeLog3, safeLog_fn3).call(this, "info", `Found ref_id in URL: ${refId}`);
          try {
            await __privateMethod(this, _fetchOrderDetails, fetchOrderDetails_fn).call(this, refId);
            __privateMethod(this, _updateReceiptContent, updateReceiptContent_fn).call(this);
          } catch (error) {
            __privateMethod(this, _safeLog3, safeLog_fn3).call(this, "error", "Error initializing receipt page:", error);
            __privateMethod(this, _showError3, showError_fn3).call(this, "Failed to load order details. Please try again later.");
          }
        }
      };
      _apiClient3 = new WeakMap();
      _logger25 = new WeakMap();
      _app20 = new WeakMap();
      _orderData = new WeakMap();
      _orderFetched = new WeakMap();
      _initialized4 = new WeakMap();
      _debugMode5 = new WeakMap();
      _safeLog3 = new WeakSet();
      safeLog_fn3 = function(level, message, ...args) {
        try {
          if (__privateGet(this, _logger25) && typeof __privateGet(this, _logger25)[level] === "function") {
            __privateGet(this, _logger25)[level](message, ...args);
          } else if (console[level]) {
            console[level](message, ...args);
          } else {
            /* @__PURE__ */ console.log(`[${level.toUpperCase()}] ${message}`, ...args);
          }
        } catch (error) {
          console.error("Error logging message:", error);
        }
      };
      _fetchOrderDetails = new WeakSet();
      fetchOrderDetails_fn = async function(refId) {
        __privateMethod(this, _safeLog3, safeLog_fn3).call(this, "info", `Fetching order details for ref_id: ${refId}`);
        if (__privateGet(this, _orderFetched) && __privateGet(this, _orderData)) {
          __privateMethod(this, _safeLog3, safeLog_fn3).call(this, "info", "Order already fetched, using cached data");
          return __privateGet(this, _orderData);
        }
        try {
          if (!__privateGet(this, _apiClient3)) {
            throw new Error("API client not available");
          }
          __privateMethod(this, _safeLog3, safeLog_fn3).call(this, "debug", "Making API request to fetch order details");
          __privateSet(this, _orderData, await __privateGet(this, _apiClient3).getOrder(refId));
          __privateSet(this, _orderFetched, true);
          __privateMethod(this, _safeLog3, safeLog_fn3).call(this, "info", "Order details fetched successfully");
          __privateMethod(this, _safeLog3, safeLog_fn3).call(this, "debug", "Order data:", __privateGet(this, _orderData));
          return __privateGet(this, _orderData);
        } catch (error) {
          __privateMethod(this, _safeLog3, safeLog_fn3).call(this, "error", `Error fetching order details for ref_id ${refId}:`, error);
          throw error;
        }
      };
      _updateReceiptContent = new WeakSet();
      updateReceiptContent_fn = function() {
        if (!__privateGet(this, _orderData)) {
          __privateMethod(this, _safeLog3, safeLog_fn3).call(this, "error", "No order data available to update receipt content");
          return;
        }
        __privateMethod(this, _safeLog3, safeLog_fn3).call(this, "info", "Updating receipt content with order details");
        __privateMethod(this, _updateElement, updateElement_fn).call(this, "fname", __privateGet(this, _orderData).user?.first_name || "");
        if (__privateGet(this, _orderData).billing_address) {
          __privateMethod(this, _updateElement, updateElement_fn).call(this, "billing_fname", `${__privateGet(this, _orderData).billing_address.first_name} ${__privateGet(this, _orderData).billing_address.last_name}`);
          __privateMethod(this, _updateElement, updateElement_fn).call(this, "billing_address", __privateMethod(this, _formatAddress2, formatAddress_fn2).call(this, __privateGet(this, _orderData).billing_address));
          __privateMethod(this, _updateElement, updateElement_fn).call(this, "billing_location", __privateMethod(this, _formatLocation, formatLocation_fn).call(this, __privateGet(this, _orderData).billing_address));
          __privateMethod(this, _updateElement, updateElement_fn).call(this, "billing_country", __privateMethod(this, _getCountryName, getCountryName_fn).call(this, __privateGet(this, _orderData).billing_address.country) || "");
        }
        if (__privateGet(this, _orderData).shipping_address) {
          __privateMethod(this, _updateElement, updateElement_fn).call(this, "shipping_fname", `${__privateGet(this, _orderData).shipping_address.first_name} ${__privateGet(this, _orderData).shipping_address.last_name}`);
          __privateMethod(this, _updateElement, updateElement_fn).call(this, "shipping_address", __privateMethod(this, _formatAddress2, formatAddress_fn2).call(this, __privateGet(this, _orderData).shipping_address));
          __privateMethod(this, _updateElement, updateElement_fn).call(this, "shipping_location", __privateMethod(this, _formatLocation, formatLocation_fn).call(this, __privateGet(this, _orderData).shipping_address));
          __privateMethod(this, _updateElement, updateElement_fn).call(this, "shipping_country", __privateMethod(this, _getCountryName, getCountryName_fn).call(this, __privateGet(this, _orderData).shipping_address.country) || "");
        }
        const paymentMethod = __privateMethod(this, _determinePaymentMethod, determinePaymentMethod_fn).call(this);
        __privateMethod(this, _updateElement, updateElement_fn).call(this, "payment_method", paymentMethod);
        __privateMethod(this, _updateOrderLines, updateOrderLines_fn).call(this);
        const shippingMethod = __privateGet(this, _orderData).shipping_method || "Standard Shipping";
        __privateMethod(this, _updateElement, updateElement_fn).call(this, "shipping-method", shippingMethod);
        __privateMethod(this, _updateElement, updateElement_fn).call(this, "shipping_method", shippingMethod);
        const total = __privateMethod(this, _formatCurrency, formatCurrency_fn).call(this, parseFloat(__privateGet(this, _orderData).total_incl_tax) || 0);
        __privateMethod(this, _updateElement, updateElement_fn).call(this, "total", total);
        __privateMethod(this, _updateElement, updateElement_fn).call(this, "order_number", __privateGet(this, _orderData).number || "");
        __privateMethod(this, _updateElement, updateElement_fn).call(this, "order_reference", __privateGet(this, _orderData).ref_id || "");
        __privateMethod(this, _safeLog3, safeLog_fn3).call(this, "info", "Receipt content updated successfully");
      };
      _determinePaymentMethod = new WeakSet();
      determinePaymentMethod_fn = function() {
        if (__privateGet(this, _orderData).payment_detail && __privateGet(this, _orderData).payment_detail.payment_method) {
          return __privateMethod(this, _formatPaymentMethod, formatPaymentMethod_fn).call(this, __privateGet(this, _orderData).payment_detail.payment_method);
        }
        if (__privateGet(this, _orderData).payment_method) {
          return __privateMethod(this, _formatPaymentMethod, formatPaymentMethod_fn).call(this, __privateGet(this, _orderData).payment_method);
        }
        return "Credit Card";
      };
      _updateOrderLines = new WeakSet();
      updateOrderLines_fn = function() {
        if (!__privateGet(this, _orderData).lines || !Array.isArray(__privateGet(this, _orderData).lines)) {
          __privateMethod(this, _safeLog3, safeLog_fn3).call(this, "warn", "No order lines available");
          return;
        }
        const orderLinesContainer = document.querySelector('[data-os-receipt="order-lines"]');
        if (!orderLinesContainer) {
          __privateMethod(this, _safeLog3, safeLog_fn3).call(this, "warn", "Order lines container not found in DOM");
          return;
        }
        orderLinesContainer.innerHTML = "";
        const lineTemplate = document.querySelector('[data-os-receipt="product-line"]');
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
        __privateGet(this, _orderData).lines.forEach((line) => {
          const lineElement = document.createElement("div");
          lineElement.innerHTML = template;
          const newLine = lineElement.firstElementChild;
          const productTitle = line.product_title || line.title || line.package_title || "Product";
          __privateMethod(this, _updateElementInNode, updateElementInNode_fn).call(this, newLine, "line-title", productTitle);
          if (line.price_excl_tax_excl_discounts && parseFloat(line.price_excl_tax_excl_discounts) > parseFloat(line.price_excl_tax)) {
            const originalPrice = parseFloat(line.price_excl_tax_excl_discounts);
            const currentPrice = parseFloat(line.price_excl_tax);
            const savingsPercent = Math.round((1 - currentPrice / originalPrice) * 100);
            __privateMethod(this, _updateElementInNode, updateElementInNode_fn).call(this, newLine, "line-saving", `(${savingsPercent}% OFF)`);
            __privateMethod(this, _updateElementInNode, updateElementInNode_fn).call(this, newLine, "line-compare", __privateMethod(this, _formatCurrency, formatCurrency_fn).call(this, originalPrice));
          } else {
            const savingElement = newLine.querySelector('[data-os-receipt="line-saving"]');
            const compareElement = newLine.querySelector('[data-os-receipt="line-compare"]');
            if (savingElement)
              savingElement.style.display = "none";
            if (compareElement)
              compareElement.style.display = "none";
          }
          const price = parseFloat(line.price_incl_tax) || parseFloat(line.price_excl_tax) || 0;
          __privateMethod(this, _updateElementInNode, updateElementInNode_fn).call(this, newLine, "line-subtotal", __privateMethod(this, _formatCurrency, formatCurrency_fn).call(this, price));
          orderLinesContainer.appendChild(newLine);
        });
      };
      _updateElement = new WeakSet();
      updateElement_fn = function(attribute, value) {
        const elements = document.querySelectorAll(`[data-os-receipt="${attribute}"]`);
        if (elements.length === 0) {
          __privateMethod(this, _safeLog3, safeLog_fn3).call(this, "debug", `No elements found with data-os-receipt="${attribute}"`);
          return;
        }
        elements.forEach((element) => {
          element.textContent = value;
        });
      };
      _updateElementInNode = new WeakSet();
      updateElementInNode_fn = function(node, attribute, value) {
        const element = node.querySelector(`[data-os-receipt="${attribute}"]`);
        if (!element) {
          __privateMethod(this, _safeLog3, safeLog_fn3).call(this, "debug", `No element found with data-os-receipt="${attribute}" in node`);
          return;
        }
        element.textContent = value;
      };
      _formatAddress2 = new WeakSet();
      formatAddress_fn2 = function(address) {
        let formattedAddress = "";
        if (address.line1) {
          formattedAddress += address.line1;
        }
        if (address.line2) {
          formattedAddress += formattedAddress ? `, ${address.line2}` : address.line2;
        }
        return formattedAddress;
      };
      _formatLocation = new WeakSet();
      formatLocation_fn = function(address) {
        let parts = [];
        if (address.line4) {
          parts.push(address.line4);
        }
        if (address.state) {
          parts.push(address.state);
        }
        if (address.postcode) {
          parts.push(address.postcode);
        }
        return parts.join(", ");
      };
      _getCountryName = new WeakSet();
      getCountryName_fn = function(countryCode) {
        const countryMap = {
          "US": "United States",
          "CA": "Canada",
          "GB": "United Kingdom",
          "AU": "Australia",
          "NZ": "New Zealand"
          // Add more countries as needed
        };
        return countryMap[countryCode] || countryCode;
      };
      _formatPaymentMethod = new WeakSet();
      formatPaymentMethod_fn = function(method) {
        const methodMap = {
          "card_token": "Credit Card",
          "paypal": "PayPal",
          "apple_pay": "Apple Pay",
          "google_pay": "Google Pay",
          "credit": "Credit Card",
          "card": "Credit Card"
        };
        return methodMap[method] || method;
      };
      _formatCurrency = new WeakSet();
      formatCurrency_fn = function(amount) {
        const currency = __privateGet(this, _orderData).currency || "USD";
        const numericAmount = parseFloat(amount);
        if (isNaN(numericAmount)) {
          __privateMethod(this, _safeLog3, safeLog_fn3).call(this, "warn", `Invalid amount for currency formatting: ${amount}`);
          return `$0.00 ${currency}`;
        }
        try {
          return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency
          }).format(numericAmount);
        } catch (error) {
          __privateMethod(this, _safeLog3, safeLog_fn3).call(this, "error", `Error formatting currency: ${error}`);
          return `$${numericAmount.toFixed(2)} ${currency}`;
        }
      };
      _showError3 = new WeakSet();
      showError_fn3 = function(message) {
        __privateMethod(this, _safeLog3, safeLog_fn3).call(this, "error", `Displaying error message: ${message}`);
        const container = document.querySelector(".receipt-content") || document.body;
        const errorElement = document.createElement("div");
        errorElement.className = "receipt-error";
        errorElement.style.color = "red";
        errorElement.style.padding = "20px";
        errorElement.style.margin = "20px 0";
        errorElement.style.border = "1px solid red";
        errorElement.style.borderRadius = "5px";
        errorElement.style.backgroundColor = "rgba(255, 0, 0, 0.1)";
        errorElement.textContent = message;
        container.prepend(errorElement);
      };
    }
  });

  // src/index.js
  var src_exports = {};
  __export(src_exports, {
    TwentyNineNext: () => TwentyNineNext
  });

  // src/api/ApiClient.js
  var _app, _apiKey, _baseUrl, _logger, _buildUrl, buildUrl_fn, _request, request_fn, _getAttributionData, getAttributionData_fn;
  var ApiClient = class {
    constructor(app) {
      __privateAdd(this, _buildUrl);
      __privateAdd(this, _request);
      /**
       * Get attribution data from the app instance
       * @returns {Object} Attribution data
       */
      __privateAdd(this, _getAttributionData);
      __privateAdd(this, _app, void 0);
      __privateAdd(this, _apiKey, void 0);
      __privateAdd(this, _baseUrl, "https://campaigns.apps.29next.com/api/v1");
      __privateAdd(this, _logger, void 0);
      __privateSet(this, _app, app);
      __privateSet(this, _logger, app.logger.createModuleLogger("API"));
    }
    init() {
      __privateGet(this, _logger).info("Initializing ApiClient");
      __privateSet(this, _apiKey, __privateGet(this, _app).config.apiKey);
      if (__privateGet(this, _apiKey)) {
        __privateGet(this, _logger).info("API key is set");
      } else {
        const apiKeyMeta = document.querySelector('meta[name="os-api-key"]');
        __privateSet(this, _apiKey, apiKeyMeta?.getAttribute("content"));
        __privateGet(this, _logger).info(__privateGet(this, _apiKey) ? "API key retrieved from meta tag" : "API key is not set");
      }
      const proxyMeta = document.querySelector('meta[name="os-proxy-url"]');
      const proxyUrl = proxyMeta?.getAttribute("content");
      if (proxyUrl) {
        __privateSet(this, _baseUrl, proxyUrl);
        __privateGet(this, _logger).info(`Using proxy URL: ${proxyUrl}`);
      }
    }
    async getCampaign() {
      try {
        const campaignsData = await __privateMethod(this, _request, request_fn).call(this, "campaigns/");
        __privateGet(this, _logger).debug("Campaign data received");
        if (Array.isArray(campaignsData) && campaignsData.length > 0)
          return campaignsData[0];
        if (campaignsData?.name)
          return campaignsData;
        throw new Error("No valid campaign data found");
      } catch (error) {
        __privateGet(this, _logger).error("Error fetching campaign:", error);
        __privateGet(this, _logger).warn("Using fallback empty campaign object");
        return {
          name: "Default Campaign",
          currency: "USD",
          packages: [],
          formatPrice: (price) => `$${Number.parseFloat(price).toFixed(2)}`
        };
      }
    }
    /**
     * Create a cart via the API
     * @param {Object} cartData - The cart data
     * @returns {Promise<Object>} The created cart
     */
    async createCart(cartData) {
      __privateGet(this, _logger).debug("Creating cart", cartData);
      if (!cartData.attribution) {
        cartData.attribution = __privateMethod(this, _getAttributionData, getAttributionData_fn).call(this);
        __privateGet(this, _logger).debug("Added attribution data to cart:", cartData.attribution);
      } else {
        __privateGet(this, _logger).debug("Cart already has attribution data:", cartData.attribution);
      }
      try {
        const response = await __privateMethod(this, _request, request_fn).call(this, "carts/", "POST", cartData);
        __privateGet(this, _logger).info("Cart created successfully", response);
        return response;
      } catch (error) {
        __privateGet(this, _logger).error("Error creating cart", error);
        throw error;
      }
    }
    /**
     * Create an order via the API
     * @param {Object} orderData - The order data
     * @returns {Promise<Object>} The created order
     */
    async createOrder(orderData) {
      __privateGet(this, _logger).debug("Creating order", orderData);
      if (!orderData.attribution) {
        orderData.attribution = __privateMethod(this, _getAttributionData, getAttributionData_fn).call(this);
        __privateGet(this, _logger).debug("Added attribution data to order:", orderData.attribution);
      } else {
        __privateGet(this, _logger).debug("Order already has attribution data:", orderData.attribution);
      }
      if (orderData.payment_token === "test_card" || orderData.payment_detail && orderData.payment_detail.card_token === "test_card") {
        __privateGet(this, _logger).debug("Using test card token for order");
        orderData.payment_detail = orderData.payment_detail || {};
        orderData.payment_detail.payment_method = "card_token";
        orderData.payment_detail.card_token = "test_card";
        if (orderData.payment_token) {
          delete orderData.payment_token;
        }
      }
      try {
        const response = await __privateMethod(this, _request, request_fn).call(this, "orders/", "POST", orderData);
        __privateGet(this, _logger).info("Order created successfully", response);
        if (response.ref_id) {
          sessionStorage.setItem("order_ref_id", response.ref_id);
          __privateGet(this, _logger).debug(`Order reference ID stored: ${response.ref_id}`);
        }
        return response;
      } catch (error) {
        __privateGet(this, _logger).error("Error creating order", error);
        throw error;
      }
    }
    async getOrder(orderRef) {
      if (!orderRef)
        throw new Error("Order reference is required");
      __privateGet(this, _logger).debug(`Fetching order with ref: ${orderRef}`);
      return __privateMethod(this, _request, request_fn).call(this, `orders/${orderRef}/`);
    }
    /**
     * Add an upsell to an existing order
     * @param {string} orderRef - Order reference ID
     * @param {Object} upsellData - The upsell data including package_id and quantity
     * @returns {Promise<Object>} The updated order
     */
    async createOrderUpsell(orderRef, upsellData) {
      if (!orderRef)
        throw new Error("Order reference is required");
      __privateGet(this, _logger).debug(`Adding upsell to order ref: ${orderRef}`, upsellData);
      const formattedData = {
        lines: Array.isArray(upsellData.lines) ? upsellData.lines : [
          {
            package_id: upsellData.package_id,
            quantity: upsellData.quantity || 1
          }
        ]
      };
      if (upsellData.payment_detail) {
        formattedData.payment_detail = upsellData.payment_detail;
      }
      try {
        const response = await __privateMethod(this, _request, request_fn).call(this, `orders/${orderRef}/upsells/`, "POST", formattedData);
        __privateGet(this, _logger).info("Upsell added successfully", response);
        return response;
      } catch (error) {
        __privateGet(this, _logger).error("Error adding upsell to order", error);
        throw error;
      }
    }
    /**
     * Get the next page URL from the meta tag
     * @param {string} refId - Optional reference ID to append to the URL
     * @returns {string|null} Formatted next page URL or null if meta tag not found
     */
    getNextPageUrlFromMeta(refId = null) {
      const nextPageMeta = document.querySelector('meta[name="os-next-page"]');
      if (!nextPageMeta || !nextPageMeta.getAttribute("content")) {
        __privateGet(this, _logger).debug("No meta tag found for next page URL");
        return null;
      }
      const nextPagePath = nextPageMeta.getAttribute("content");
      __privateGet(this, _logger).debug(`Found meta tag with next page URL: ${nextPagePath}`);
      const redirectUrl = nextPagePath.startsWith("http") ? new URL(nextPagePath) : new URL(nextPagePath, `${location.protocol}//${location.host}`);
      if (refId) {
        redirectUrl.searchParams.append("ref_id", refId);
      }
      return redirectUrl.href;
    }
    async processPayment(orderData, paymentMethod) {
      __privateGet(this, _logger).debug(`Processing ${paymentMethod} payment for order`);
      const paymentMethodMap = {
        "credit": "card_token",
        "paypal": "paypal",
        "apple_pay": "apple_pay",
        "google_pay": "google_pay"
      };
      orderData.payment_detail = orderData.payment_detail ?? {};
      orderData.payment_detail.payment_method = paymentMethodMap[paymentMethod] ?? paymentMethod;
      if (paymentMethod === "credit" && !orderData.payment_detail.card_token) {
        throw new Error("Credit card payment requires a card token");
      }
      if (paymentMethod !== "credit")
        delete orderData.payment_detail.card_token;
      if (!orderData.success_url) {
        const nextPageUrl = this.getNextPageUrlFromMeta(orderData.ref_id);
        if (nextPageUrl) {
          orderData.success_url = nextPageUrl;
          __privateGet(this, _logger).debug(`Set success_url from meta tag: ${orderData.success_url}`);
        } else {
          __privateGet(this, _logger).debug("No meta tag found for success_url, API will use order_status_url as fallback");
        }
      }
      if (!orderData.payment_failed_url) {
        const currentUrl = new URL(window.location.href);
        currentUrl.searchParams.set("payment_failed", "true");
        currentUrl.searchParams.set("payment_method", paymentMethod);
        orderData.payment_failed_url = currentUrl.href;
        __privateGet(this, _logger).debug(`Set payment_failed_url to: ${orderData.payment_failed_url}`);
      }
      return this.createOrder(orderData);
    }
    getNextUrlFromOrderResponse(orderResponse) {
      __privateGet(this, _logger).debug("Getting next URL for redirect");
      const refId = orderResponse.ref_id;
      if (orderResponse.payment_complete_url) {
        __privateGet(this, _logger).debug(`Using payment complete URL from API: ${orderResponse.payment_complete_url}`);
        return orderResponse.payment_complete_url;
      }
      const nextPageUrl = this.getNextPageUrlFromMeta(refId);
      if (nextPageUrl) {
        return nextPageUrl;
      }
      if (orderResponse.order_status_url) {
        __privateGet(this, _logger).debug(`Using order status URL from API: ${orderResponse.order_status_url}`);
        return orderResponse.order_status_url;
      }
      __privateGet(this, _logger).warn("No order_status_url found in API response - using fallback URL");
      return `${window.location.origin}/checkout/confirmation/?ref_id=${refId || ""}`;
    }
  };
  _app = new WeakMap();
  _apiKey = new WeakMap();
  _baseUrl = new WeakMap();
  _logger = new WeakMap();
  _buildUrl = new WeakSet();
  buildUrl_fn = function(endpoint) {
    const cleanEndpoint = endpoint.startsWith("/") ? endpoint.slice(1) : endpoint;
    return `${__privateGet(this, _baseUrl)}/${cleanEndpoint}`;
  };
  _request = new WeakSet();
  request_fn = async function(endpoint, method = "GET", data = null) {
    if (!__privateGet(this, _apiKey)) {
      __privateGet(this, _logger).warn("API key is not set");
      if (endpoint === "campaigns/") {
        __privateGet(this, _logger).info("Returning mock campaign data since API key is not set");
        return [{
          name: "Mock Campaign",
          id: "mock-campaign",
          currency: "USD",
          locale: "en-US",
          packages: [],
          products: []
        }];
      }
      throw new Error("API key is required");
    }
    const url = __privateMethod(this, _buildUrl, buildUrl_fn).call(this, endpoint);
    const options = {
      method,
      mode: "cors",
      credentials: "same-origin",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": __privateGet(this, _apiKey)
      }
    };
    if (method !== "GET" && data)
      options.body = JSON.stringify(data);
    __privateGet(this, _logger).debug(`Making ${method} request to ${url}`, method !== "GET" ? { requestData: data } : {});
    try {
      const response = await fetch(url, options);
      __privateGet(this, _logger).debug(`Received response from ${url} with status ${response.status}`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        __privateGet(this, _logger).error(`API error response from ${url}:`, errorData);
        throw new Error(JSON.stringify(errorData));
      }
      const responseData = await response.json();
      __privateGet(this, _logger).debug(`Successfully processed response from ${url}`);
      return responseData;
    } catch (error) {
      __privateGet(this, _logger).error(`API request failed: ${endpoint}`, error);
      if (error.message?.match(/NetworkError|Failed to fetch|Network request failed/)) {
        __privateGet(this, _logger).warn("This appears to be a CORS issue. Make sure the API endpoint allows cross-origin requests.");
      }
      throw error;
    }
  };
  _getAttributionData = new WeakSet();
  getAttributionData_fn = function() {
    if (__privateGet(this, _app).attribution) {
      if (typeof __privateGet(this, _app).attribution.getAttributionForApi === "function") {
        return __privateGet(this, _app).attribution.getAttributionForApi();
      }
      return __privateGet(this, _app).attribution.getAttributionData();
    }
    if (__privateGet(this, _app).state) {
      const apiFormatted = __privateGet(this, _app).state.getState("attribution");
      if (apiFormatted) {
        return apiFormatted;
      }
      return __privateGet(this, _app).state.getState("cart.attribution") || {};
    }
    return {};
  };

  // src/utils/Logger.js
  var _debug, _prefix, _startupTime, _info, info_fn, _warn, warn_fn, _error, error_fn, _debugLog, debugLog_fn, _infoWithTime, infoWithTime_fn, _warnWithTime, warnWithTime_fn, _errorWithTime, errorWithTime_fn, _debugLogWithTime, debugLogWithTime_fn;
  var Logger = class {
    constructor(debug = false) {
      __privateAdd(this, _info);
      __privateAdd(this, _warn);
      __privateAdd(this, _error);
      __privateAdd(this, _debugLog);
      // New methods with timing information
      __privateAdd(this, _infoWithTime);
      __privateAdd(this, _warnWithTime);
      __privateAdd(this, _errorWithTime);
      __privateAdd(this, _debugLogWithTime);
      __privateAdd(this, _debug, void 0);
      __privateAdd(this, _prefix, "29next");
      __privateAdd(this, _startupTime, 0);
      __privateSet(this, _debug, debug);
      this.setStartupTime();
    }
    setDebug(debug) {
      __privateSet(this, _debug, debug);
    }
    /**
     * Sets the startup time to the current timestamp
     */
    setStartupTime() {
      __privateSet(this, _startupTime, +/* @__PURE__ */ new Date());
      window.twentyNineNextStartupTime = __privateGet(this, _startupTime);
    }
    /**
     * Gets the elapsed time since startup in milliseconds
     */
    getElapsedTime() {
      return +/* @__PURE__ */ new Date() - __privateGet(this, _startupTime);
    }
    createModuleLogger(moduleName) {
      const modulePrefix = `${__privateGet(this, _prefix)} [${moduleName}]`;
      return {
        debug: (...args) => __privateMethod(this, _debugLog, debugLog_fn).call(this, modulePrefix, ...args),
        info: (...args) => __privateMethod(this, _info, info_fn).call(this, modulePrefix, ...args),
        warn: (...args) => __privateMethod(this, _warn, warn_fn).call(this, modulePrefix, ...args),
        error: (...args) => __privateMethod(this, _error, error_fn).call(this, modulePrefix, ...args),
        // Add timing methods to module loggers
        debugWithTime: (...args) => __privateMethod(this, _debugLogWithTime, debugLogWithTime_fn).call(this, modulePrefix, ...args),
        infoWithTime: (...args) => __privateMethod(this, _infoWithTime, infoWithTime_fn).call(this, modulePrefix, ...args),
        warnWithTime: (...args) => __privateMethod(this, _warnWithTime, warnWithTime_fn).call(this, modulePrefix, ...args),
        errorWithTime: (...args) => __privateMethod(this, _errorWithTime, errorWithTime_fn).call(this, modulePrefix, ...args)
      };
    }
    // Standalone timing log methods
    logWithTime(message, ...args) {
      const diff = this.getElapsedTime();
      /* @__PURE__ */ console.log(`%c${__privateGet(this, _prefix)} +${diff}ms%c ${message}`, "color: #0066cc; font-weight: bold;", "color: inherit;", ...args);
    }
    warnWithTime(message, ...args) {
      const diff = this.getElapsedTime();
      console.warn(`%c${__privateGet(this, _prefix)} +${diff}ms%c ${message}`, "color: #ff9900; font-weight: bold;", "color: inherit;", ...args);
    }
    errorWithTime(message, ...args) {
      const diff = this.getElapsedTime();
      console.error(`%c${__privateGet(this, _prefix)} +${diff}ms%c ${message}`, "color: #cc0000; font-weight: bold;", "color: inherit;", ...args);
    }
    debugWithTime(message, ...args) {
      if (__privateGet(this, _debug)) {
        const diff = this.getElapsedTime();
        console.debug(`%c${__privateGet(this, _prefix)}:debug +${diff}ms%c ${message}`, "color: #666666; font-weight: bold;", "color: inherit;", ...args);
      }
    }
  };
  _debug = new WeakMap();
  _prefix = new WeakMap();
  _startupTime = new WeakMap();
  _info = new WeakSet();
  info_fn = function(prefix, message, ...args) {
    /* @__PURE__ */ console.info(`%c${prefix}%c ${message}`, "color: #0066cc; font-weight: bold;", "color: inherit;", ...args);
  };
  _warn = new WeakSet();
  warn_fn = function(prefix, message, ...args) {
    console.warn(`%c${prefix}%c ${message}`, "color: #ff9900; font-weight: bold;", "color: inherit;", ...args);
  };
  _error = new WeakSet();
  error_fn = function(prefix, message, ...args) {
    console.error(`%c${prefix}%c ${message}`, "color: #cc0000; font-weight: bold;", "color: inherit;", ...args);
  };
  _debugLog = new WeakSet();
  debugLog_fn = function(prefix, message, ...args) {
    if (__privateGet(this, _debug)) {
      console.debug(`%c${prefix}:debug%c ${message}`, "color: #666666; font-weight: bold;", "color: inherit;", ...args);
    }
  };
  _infoWithTime = new WeakSet();
  infoWithTime_fn = function(prefix, message, ...args) {
    const diff = this.getElapsedTime();
    /* @__PURE__ */ console.info(`%c${prefix} +${diff}ms%c ${message}`, "color: #0066cc; font-weight: bold;", "color: inherit;", ...args);
  };
  _warnWithTime = new WeakSet();
  warnWithTime_fn = function(prefix, message, ...args) {
    const diff = this.getElapsedTime();
    console.warn(`%c${prefix} +${diff}ms%c ${message}`, "color: #ff9900; font-weight: bold;", "color: inherit;", ...args);
  };
  _errorWithTime = new WeakSet();
  errorWithTime_fn = function(prefix, message, ...args) {
    const diff = this.getElapsedTime();
    console.error(`%c${prefix} +${diff}ms%c ${message}`, "color: #cc0000; font-weight: bold;", "color: inherit;", ...args);
  };
  _debugLogWithTime = new WeakSet();
  debugLogWithTime_fn = function(prefix, message, ...args) {
    if (__privateGet(this, _debug)) {
      const diff = this.getElapsedTime();
      console.debug(`%c${prefix}:debug +${diff}ms%c ${message}`, "color: #666666; font-weight: bold;", "color: inherit;", ...args);
    }
  };

  // src/components/checkout/AddressHandler.js
  var _form, _logger2, _addressConfig, _countries, _states, _elements, _init, init_fn, _getAddressConfig, getAddressConfig_fn, _initCountrySelect, initCountrySelect_fn, _setupCountryChangeListeners, setupCountryChangeListeners_fn, _updateStateSelect, updateStateSelect_fn, _populateStateSelect, populateStateSelect_fn, _loadCachedData, loadCachedData_fn, _saveCache, saveCache_fn, _loadCountriesAndStates, loadCountriesAndStates_fn, _loadStates, loadStates_fn, _detectUserCountry, detectUserCountry_fn, _setupAutocompleteDetection, setupAutocompleteDetection_fn, _preloadCommonStates, preloadCommonStates_fn;
  var AddressHandler = class {
    constructor(form, logger) {
      __privateAdd(this, _init);
      __privateAdd(this, _getAddressConfig);
      __privateAdd(this, _initCountrySelect);
      __privateAdd(this, _setupCountryChangeListeners);
      __privateAdd(this, _updateStateSelect);
      __privateAdd(this, _populateStateSelect);
      __privateAdd(this, _loadCachedData);
      __privateAdd(this, _saveCache);
      __privateAdd(this, _loadCountriesAndStates);
      __privateAdd(this, _loadStates);
      __privateAdd(this, _detectUserCountry);
      __privateAdd(this, _setupAutocompleteDetection);
      __privateAdd(this, _preloadCommonStates);
      __privateAdd(this, _form, void 0);
      __privateAdd(this, _logger2, void 0);
      __privateAdd(this, _addressConfig, void 0);
      __privateAdd(this, _countries, []);
      __privateAdd(this, _states, {});
      __privateAdd(this, _elements, void 0);
      __privateSet(this, _form, form);
      __privateSet(this, _logger2, logger);
      __privateSet(this, _addressConfig, __privateMethod(this, _getAddressConfig, getAddressConfig_fn).call(this));
      __privateSet(this, _elements, {
        shippingCountry: document.querySelector('[os-checkout-field="country"]'),
        shippingState: document.querySelector('[os-checkout-field="province"]'),
        billingCountry: document.querySelector('[os-checkout-field="billing-country"]'),
        billingState: document.querySelector('[os-checkout-field="billing-province"]')
      });
      __privateMethod(this, _loadCachedData, loadCachedData_fn).call(this);
      if (__privateGet(this, _elements).shippingCountry || __privateGet(this, _elements).billingCountry) {
        __privateGet(this, _logger2).info("AddressHandler initialized");
        __privateMethod(this, _init, init_fn).call(this);
      } else {
        __privateGet(this, _logger2).warn("No country selects found");
      }
    }
  };
  _form = new WeakMap();
  _logger2 = new WeakMap();
  _addressConfig = new WeakMap();
  _countries = new WeakMap();
  _states = new WeakMap();
  _elements = new WeakMap();
  _init = new WeakSet();
  init_fn = async function() {
    await __privateMethod(this, _loadCountriesAndStates, loadCountriesAndStates_fn).call(this);
    await Promise.all([
      __privateGet(this, _elements).shippingCountry && __privateMethod(this, _initCountrySelect, initCountrySelect_fn).call(this, __privateGet(this, _elements).shippingCountry, __privateGet(this, _elements).shippingState),
      __privateGet(this, _elements).billingCountry && __privateMethod(this, _initCountrySelect, initCountrySelect_fn).call(this, __privateGet(this, _elements).billingCountry, __privateGet(this, _elements).billingState)
    ]);
    __privateMethod(this, _setupCountryChangeListeners, setupCountryChangeListeners_fn).call(this);
    __privateMethod(this, _detectUserCountry, detectUserCountry_fn).call(this);
    __privateMethod(this, _setupAutocompleteDetection, setupAutocompleteDetection_fn).call(this);
  };
  _getAddressConfig = new WeakSet();
  getAddressConfig_fn = function() {
    return {
      defaultCountry: window.osConfig?.addressConfig?.defaultCountry ?? document.querySelector('meta[name="os-address-default-country"]')?.content ?? "US",
      showCountries: window.osConfig?.addressConfig?.showCountries ?? document.querySelector('meta[name="os-address-show-countries"]')?.content?.split(",").map((c) => c.trim()) ?? [],
      dontShowStates: window.osConfig?.addressConfig?.dontShowStates ?? document.querySelector('meta[name="os-address-dont-show-states"]')?.content?.split(",").map((s) => s.trim()) ?? [],
      countries: window.osConfig?.addressConfig?.countries ?? []
    };
  };
  _initCountrySelect = new WeakSet();
  initCountrySelect_fn = async function(countrySelect, stateSelect) {
    countrySelect.innerHTML = '<option value="">Select Country</option>' + __privateGet(this, _countries).map((c) => `<option value="${c.iso2}">${c.name}</option>`).join("");
    countrySelect.value = __privateGet(this, _addressConfig).defaultCountry;
    if (stateSelect && countrySelect.value)
      await __privateMethod(this, _updateStateSelect, updateStateSelect_fn).call(this, stateSelect, countrySelect.value);
    __privateGet(this, _logger2).debug(`Country select initialized with default ${__privateGet(this, _addressConfig).defaultCountry}`);
  };
  _setupCountryChangeListeners = new WeakSet();
  setupCountryChangeListeners_fn = function() {
    const pairs = [
      [__privateGet(this, _elements).shippingCountry, __privateGet(this, _elements).shippingState],
      [__privateGet(this, _elements).billingCountry, __privateGet(this, _elements).billingState]
    ];
    pairs.forEach(([country, state]) => {
      country?.addEventListener("change", () => state && __privateMethod(this, _updateStateSelect, updateStateSelect_fn).call(this, state, country.value));
    });
  };
  _updateStateSelect = new WeakSet();
  updateStateSelect_fn = async function(stateSelect, countryCode, isPriority = false) {
    if (!countryCode)
      return stateSelect.innerHTML = '<option value="">Select State/Province</option>';
    const states = __privateGet(this, _states)[countryCode] || await __privateMethod(this, _loadStates, loadStates_fn).call(this, countryCode);
    if (isPriority)
      await states;
    __privateMethod(this, _populateStateSelect, populateStateSelect_fn).call(this, stateSelect, states);
    __privateGet(this, _logger2).debug(`State select updated for ${countryCode}`);
  };
  _populateStateSelect = new WeakSet();
  populateStateSelect_fn = function(stateSelect, states) {
    const currentValue = stateSelect.value || stateSelect.getAttribute("data-pending-state") || "";
    stateSelect.innerHTML = '<option value="">Select State/Province</option>' + states.map((s) => `<option value="${s.iso2}">${s.name}</option>`).join("");
    stateSelect.parentElement.style.display = states.length ? "" : "none";
    if (currentValue && Array.from(stateSelect.options).some((o) => o.value === currentValue))
      stateSelect.value = currentValue;
  };
  _loadCachedData = new WeakSet();
  loadCachedData_fn = function() {
    const loadCache = (key) => {
      const data = JSON.parse(localStorage.getItem(key) ?? "{}");
      return Date.now() - (data.timestamp ?? 0) < 24 * 60 * 60 * 1e3 ? data : {};
    };
    __privateSet(this, _countries, loadCache("os_countries_cache").countries ?? []);
    if (__privateGet(this, _countries).length && __privateGet(this, _addressConfig).showCountries.length) {
      __privateSet(this, _countries, __privateGet(this, _countries).filter((c) => __privateGet(this, _addressConfig).showCountries.includes(c.iso2)));
      __privateGet(this, _logger2).debug(`Filtered cached countries to: ${__privateGet(this, _addressConfig).showCountries.join(", ")}`);
    }
    __privateSet(this, _states, loadCache("os_states_cache").states ?? {});
    __privateGet(this, _logger2).debug(`Loaded cached data: ${__privateGet(this, _countries).length} countries, ${Object.keys(__privateGet(this, _states)).length} state sets`);
  };
  _saveCache = new WeakSet();
  saveCache_fn = function(key, data) {
    localStorage.setItem(key, JSON.stringify({ ...data, timestamp: Date.now() }));
  };
  _loadCountriesAndStates = new WeakSet();
  loadCountriesAndStates_fn = async function() {
    if (__privateGet(this, _countries).length)
      return;
    __privateSet(this, _countries, __privateGet(this, _addressConfig).countries.length ? __privateGet(this, _addressConfig).countries.map((c) => ({ iso2: c.iso2 || c.code, name: c.name })) : (await (await fetch("https://api.countrystatecity.in/v1/countries", {
      headers: { "X-CSCAPI-KEY": "c2R3MzNhYmpvYUJPdmhkUlE5TUJWYUtJUGs2TTlNU3cyRmxmVW9wVQ==" }
    })).json()).filter((c) => !__privateGet(this, _addressConfig).showCountries.length || __privateGet(this, _addressConfig).showCountries.includes(c.iso2)));
    __privateGet(this, _countries).sort((a, b) => a.name.localeCompare(b.name));
    __privateMethod(this, _saveCache, saveCache_fn).call(this, "os_countries_cache", { countries: __privateGet(this, _countries) });
    __privateGet(this, _logger2).info(`Loaded ${__privateGet(this, _countries).length} countries`);
  };
  _loadStates = new WeakSet();
  loadStates_fn = async function(countryCode) {
    if (__privateGet(this, _states)[countryCode])
      return __privateGet(this, _states)[countryCode];
    try {
      const states = (await (await fetch(`https://api.countrystatecity.in/v1/countries/${countryCode}/states`, {
        headers: { "X-CSCAPI-KEY": "c2R3MzNhYmpvYUJPdmhkUlE5TUJWYUtJUGs2TTlNU3cyRmxmVW9wVQ==" }
      })).json()).filter((s) => !__privateGet(this, _addressConfig).dontShowStates.includes(s.iso2));
      __privateGet(this, _states)[countryCode] = states;
      __privateMethod(this, _saveCache, saveCache_fn).call(this, "os_states_cache", { states: __privateGet(this, _states) });
      __privateGet(this, _logger2).debug(`Loaded ${states.length} states for ${countryCode}`);
      return states;
    } catch (error) {
      __privateGet(this, _logger2).error(`Failed to load states for ${countryCode}:`, error);
      __privateGet(this, _states)[countryCode] = countryCode === "US" ? (
        /* US states list */
        []
      ) : [];
      return __privateGet(this, _states)[countryCode];
    }
  };
  _detectUserCountry = new WeakSet();
  detectUserCountry_fn = async function() {
    if (__privateGet(this, _elements).shippingCountry?.value || __privateGet(this, _elements).billingCountry?.value)
      return;
    const countryCode = __privateGet(this, _addressConfig).defaultCountry || (await Promise.any(["https://ipapi.co/json/", "https://ipinfo.io/json"].map((u) => fetch(u).then((r) => r.json()))))?.country_code;
    [__privateGet(this, _elements).shippingCountry, __privateGet(this, _elements).billingCountry].forEach((c) => {
      if (c) {
        c.value = countryCode;
        c.dispatchEvent(new Event("change"));
      }
    });
    __privateGet(this, _logger2).debug(`User country detected/set to ${countryCode}`);
  };
  _setupAutocompleteDetection = new WeakSet();
  setupAutocompleteDetection_fn = function() {
    const fields = Object.values(__privateGet(this, _elements)).filter(Boolean);
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((m) => {
        if (m.attributeName === "value" && m.target.value) {
          const state = m.target === __privateGet(this, _elements).shippingCountry ? __privateGet(this, _elements).shippingState : __privateGet(this, _elements).billingState;
          state && __privateMethod(this, _updateStateSelect, updateStateSelect_fn).call(this, state, m.target.value, true);
          __privateGet(this, _logger2).debug(`Autocomplete detected on ${m.target.getAttribute("os-checkout-field")}`);
        }
      });
    });
    fields.forEach((f) => observer.observe(f, { attributes: true, attributeFilter: ["value"] }));
    __privateMethod(this, _preloadCommonStates, preloadCommonStates_fn).call(this);
    __privateGet(this, _logger2).debug("Autocomplete detection set up");
  };
  _preloadCommonStates = new WeakSet();
  preloadCommonStates_fn = function() {
    const countries = __privateGet(this, _addressConfig).showCountries.length ? __privateGet(this, _addressConfig).showCountries : ["US", "CA", "GB", "AU"];
    countries.forEach((c) => !__privateGet(this, _states)[c] && __privateMethod(this, _loadStates, loadStates_fn).call(this, c));
    __privateGet(this, _logger2).debug(`Preloading states for ${countries.join(", ")}`);
  };

  // src/components/checkout/FormValidator.js
  var _logger3, _form2, _validationErrors, _debugMode, _spreedlyEnabled, _spreedlyFieldsValid, _spreedlyReady, _getFormElement, getFormElement_fn, _safeLog, safeLog_fn, _setupListeners, setupListeners_fn, _setupSpreedlyListeners, setupSpreedlyListeners_fn, _getSpreedlyFieldErrorMessage, getSpreedlyFieldErrorMessage_fn, _handleSpreedlyError, handleSpreedlyError_fn, _handleSubmit, handleSubmit_fn, _logValidationStart, logValidationStart_fn, _validateFields, validateFields_fn, _shouldSkipField, shouldSkipField_fn, _validateCreditCardExpiryFields, validateCreditCardExpiryFields_fn, _getExpiryFields, getExpiryFields_fn, _validateExpiryField, validateExpiryField_fn, _clearSpreedlyErrors, clearSpreedlyErrors_fn, _validateField, validateField_fn, _getReadableFieldLabel, getReadableFieldLabel_fn, _getFieldValidation, getFieldValidation_fn, _validateCity, validateCity_fn, _validateZipCode, validateZipCode_fn, _showError, showError_fn, _getOrCreateErrorElement, getOrCreateErrorElement_fn, _scrollToError, scrollToError_fn, _isValidEmail, isValidEmail_fn, _validatePhoneFields, validatePhoneFields_fn, _setupZipCodeFormatting, setupZipCodeFormatting_fn, _formatZipCode, formatZipCode_fn;
  var FormValidator = class {
    constructor(options = {}) {
      __privateAdd(this, _getFormElement);
      __privateAdd(this, _safeLog);
      __privateAdd(this, _setupListeners);
      __privateAdd(this, _setupSpreedlyListeners);
      __privateAdd(this, _getSpreedlyFieldErrorMessage);
      __privateAdd(this, _handleSpreedlyError);
      __privateAdd(this, _handleSubmit);
      __privateAdd(this, _logValidationStart);
      __privateAdd(this, _validateFields);
      __privateAdd(this, _shouldSkipField);
      __privateAdd(this, _validateCreditCardExpiryFields);
      __privateAdd(this, _getExpiryFields);
      __privateAdd(this, _validateExpiryField);
      __privateAdd(this, _clearSpreedlyErrors);
      __privateAdd(this, _validateField);
      __privateAdd(this, _getReadableFieldLabel);
      __privateAdd(this, _getFieldValidation);
      __privateAdd(this, _validateCity);
      /**
       * Validate a US ZIP code (5 digits or ZIP+4 format)
       * @param {string} value - ZIP code to validate
       * @param {string} fieldName - Name of the field for error message
       * @returns {Object} Validation result with isValid and errorMessage
       */
      __privateAdd(this, _validateZipCode);
      __privateAdd(this, _showError);
      __privateAdd(this, _getOrCreateErrorElement);
      __privateAdd(this, _scrollToError);
      __privateAdd(this, _isValidEmail);
      __privateAdd(this, _validatePhoneFields);
      /**
       * Set up auto-formatting for ZIP code fields
       */
      __privateAdd(this, _setupZipCodeFormatting);
      /**
       * Format ZIP code as user types: 
       * - Allow only numbers and hyphen
       * - Automatically add hyphen after 5 digits if the user is entering more
       * @param {Event} event - Input event
       */
      __privateAdd(this, _formatZipCode);
      __privateAdd(this, _logger3, void 0);
      __privateAdd(this, _form2, void 0);
      __privateAdd(this, _validationErrors, {});
      __privateAdd(this, _debugMode, false);
      __privateAdd(this, _spreedlyEnabled, false);
      __privateAdd(this, _spreedlyFieldsValid, false);
      __privateAdd(this, _spreedlyReady, false);
      __privateSet(this, _debugMode, options.debugMode || false);
      __privateSet(this, _logger3, options.logger || console);
      __privateSet(this, _form2, __privateMethod(this, _getFormElement, getFormElement_fn).call(this));
      __privateSet(this, _spreedlyEnabled, typeof Spreedly !== "undefined");
      if (!__privateGet(this, _form2))
        return;
      __privateMethod(this, _setupListeners, setupListeners_fn).call(this);
    }
    validateAllFields(selectedPaymentMethod = this.getSelectedPaymentMethod()) {
      __privateGet(this, _debugMode) && __privateMethod(this, _logValidationStart, logValidationStart_fn).call(this, selectedPaymentMethod);
      const isCreditCard = ["credit", "credit-card"].includes(selectedPaymentMethod);
      let isValid = true;
      const requiredFields = Array.from(document.querySelectorAll('[os-checkout-validate="required"]'));
      const firstErrorField = __privateMethod(this, _validateFields, validateFields_fn).call(this, requiredFields, isCreditCard);
      let ccValid = true;
      if (isCreditCard) {
        ccValid = this.validateCreditCard();
      }
      const phoneError = __privateMethod(this, _validatePhoneFields, validatePhoneFields_fn).call(this);
      if (firstErrorField) {
        __privateMethod(this, _scrollToError, scrollToError_fn).call(this, firstErrorField);
        isValid = false;
      } else if (phoneError) {
        isValid = false;
      } else if (!ccValid) {
        isValid = false;
      }
      return isValid;
    }
    clearErrorForField(field) {
      if (!field)
        return;
      field.classList.remove("error");
      const wrapper = field.closest(".frm-flds") || field.closest(".form-group") || field.parentElement;
      wrapper?.querySelector(".pb-input-error")?.remove();
      const fieldName = field.getAttribute("os-checkout-field");
      if (["cc-number", "cvv"].includes(fieldName)) {
        const spreedlyId = `spreedly-${fieldName === "cc-number" ? "number" : "cvv"}`;
        const spreedlyContainer = document.getElementById(spreedlyId);
        if (spreedlyContainer) {
          spreedlyContainer.classList.remove("error");
          spreedlyContainer.closest(".frm-flds")?.querySelector(".pb-input-error")?.remove();
        }
      }
    }
    clearAllErrors() {
      __privateSet(this, _validationErrors, {});
      document.querySelectorAll(".error").forEach((el) => el.classList.remove("error"));
      document.querySelectorAll(".pb-input-error").forEach((el) => el.remove());
      __privateMethod(this, _clearSpreedlyErrors, clearSpreedlyErrors_fn).call(this);
    }
    isSameAsShipping() {
      const checkbox = document.querySelector('[os-checkout-field="same-as-shipping"] input[type="checkbox"]') || document.querySelector('[os-input-field="use-shipping-address"] input[type="checkbox"]') || document.querySelector("#use_shipping_address");
      return checkbox ? checkbox.checked : true;
    }
    getSelectedPaymentMethod() {
      return document.querySelector('input[name="payment_method"]:checked')?.value || document.querySelector('input[name="combo_mode"]:checked')?.value || "credit";
    }
    getFormValues() {
      const values = {};
      __privateGet(this, _form2).querySelectorAll("input, select, textarea").forEach((field) => {
        if (["button", "submit"].includes(field.type) || field.disabled || !field.name)
          return;
        const fieldName = field.getAttribute("os-checkout-field") || field.name;
        if (field.type === "checkbox") {
          values[fieldName] = field.checked;
        } else if (field.type === "radio") {
          if (field.checked)
            values[fieldName] = field.value;
        } else if (fieldName.includes(".")) {
          const [parent, child] = fieldName.split(".");
          values[parent] = values[parent] || {};
          values[parent][child] = field.value;
        } else {
          values[fieldName] = field.value;
        }
      });
      return values;
    }
    validateCreditCard() {
      let isValid = true;
      const [monthField, yearField] = __privateMethod(this, _getExpiryFields, getExpiryFields_fn).call(this);
      if (!__privateMethod(this, _validateExpiryField, validateExpiryField_fn).call(this, monthField, "month"))
        isValid = false;
      if (!__privateMethod(this, _validateExpiryField, validateExpiryField_fn).call(this, yearField, "year"))
        isValid = false;
      if (__privateGet(this, _spreedlyEnabled) && typeof Spreedly.validate === "function") {
        const numberContainer = document.getElementById("spreedly-number");
        const cvvContainer = document.getElementById("spreedly-cvv");
        let numberValid = numberContainer?.classList.contains("spreedly-valid");
        let cvvValid = cvvContainer?.classList.contains("spreedly-valid");
        Spreedly.validate();
        if (!numberValid && numberContainer) {
          __privateMethod(this, _showError, showError_fn).call(this, numberContainer, "Please enter a valid credit card number");
          isValid = false;
        }
        if (!cvvValid && cvvContainer) {
          __privateMethod(this, _showError, showError_fn).call(this, cvvContainer, "Please enter a valid security code (CVV)");
          isValid = false;
        }
      } else {
        const ccNumber = document.querySelector('[os-checkout-field="cc-number"]');
        const cvv = document.querySelector('[os-checkout-field="cvv"]');
        if (!ccNumber?.value.trim()) {
          __privateMethod(this, _showError, showError_fn).call(this, ccNumber, "Please enter a credit card number");
          isValid = false;
        }
        if (!cvv?.value.trim()) {
          __privateMethod(this, _showError, showError_fn).call(this, cvv, "Please enter a security code (CVV)");
          isValid = false;
        }
      }
      return isValid;
    }
  };
  _logger3 = new WeakMap();
  _form2 = new WeakMap();
  _validationErrors = new WeakMap();
  _debugMode = new WeakMap();
  _spreedlyEnabled = new WeakMap();
  _spreedlyFieldsValid = new WeakMap();
  _spreedlyReady = new WeakMap();
  _getFormElement = new WeakSet();
  getFormElement_fn = function() {
    const form = document.querySelector('form[os-checkout="form"]') || document.querySelector("form#combo_form");
    if (!form)
      __privateMethod(this, _safeLog, safeLog_fn).call(this, "warn", "No checkout form found");
    return form;
  };
  _safeLog = new WeakSet();
  safeLog_fn = function(level, message, ...args) {
    try {
      const logFn = __privateGet(this, _logger3)?.[level] || console[level] || console.log;
      logFn.call(console, `[${level.toUpperCase()}] ${message}`, ...args);
    } catch (error) {
      console.error("Error logging:", error);
    }
  };
  _setupListeners = new WeakSet();
  setupListeners_fn = function() {
    __privateGet(this, _form2).addEventListener("submit", (e) => __privateMethod(this, _handleSubmit, handleSubmit_fn).call(this, e));
    document.querySelector('[os-checkout-payment="combo"]')?.addEventListener("click", () => {
      if (this.validateAllFields())
        __privateGet(this, _form2).submit();
    });
    document.addEventListener("payment-method-changed", () => this.clearAllErrors());
    if (__privateGet(this, _spreedlyEnabled) && typeof Spreedly.on === "function") {
      __privateMethod(this, _setupSpreedlyListeners, setupSpreedlyListeners_fn).call(this);
    }
    __privateMethod(this, _setupZipCodeFormatting, setupZipCodeFormatting_fn).call(this);
  };
  _setupSpreedlyListeners = new WeakSet();
  setupSpreedlyListeners_fn = function() {
    const listeners = {
      "ready": () => {
        __privateSet(this, _spreedlyReady, true);
        __privateMethod(this, _safeLog, safeLog_fn).call(this, "debug", "Spreedly is ready");
      },
      "paymentMethod": (token, pmData) => {
        __privateSet(this, _spreedlyFieldsValid, true);
        __privateMethod(this, _safeLog, safeLog_fn).call(this, "debug", "Spreedly payment method created");
        __privateMethod(this, _clearSpreedlyErrors, clearSpreedlyErrors_fn).call(this);
      },
      "validation": (result) => {
        __privateMethod(this, _safeLog, safeLog_fn).call(this, "debug", `Spreedly field validation: ${result.fieldType} ${result.valid ? "valid" : "invalid"}`);
        const field = document.getElementById(`spreedly-${result.fieldType}`);
        if (field) {
          field.classList.toggle("spreedly-valid", result.valid);
          field.classList.toggle("error", !result.valid);
        }
        if (result.valid) {
          this.clearErrorForField(field);
        } else {
          const errorMessage = __privateMethod(this, _getSpreedlyFieldErrorMessage, getSpreedlyFieldErrorMessage_fn).call(this, result.fieldType);
          __privateMethod(this, _handleSpreedlyError, handleSpreedlyError_fn).call(this, { attribute: result.fieldType, message: errorMessage });
        }
      },
      "errors": (errors) => {
        __privateSet(this, _spreedlyFieldsValid, false);
        __privateMethod(this, _safeLog, safeLog_fn).call(this, "debug", "Spreedly validation errors:", errors);
        errors.forEach((error) => __privateMethod(this, _handleSpreedlyError, handleSpreedlyError_fn).call(this, error));
      },
      "fieldEvent": (name, event, activeElement, inputData) => {
        const field = document.getElementById(`spreedly-${name}`);
        if (event === "input" && field) {
          const isValid = name === "number" ? inputData.validNumber : inputData.validCvv;
          field.classList.toggle("spreedly-valid", isValid);
          field.classList.toggle("error", !isValid);
          if (isValid) {
            this.clearErrorForField(field);
          } else {
            const errorMessage = __privateMethod(this, _getSpreedlyFieldErrorMessage, getSpreedlyFieldErrorMessage_fn).call(this, name);
            __privateMethod(this, _showError, showError_fn).call(this, field, errorMessage);
          }
        }
      }
    };
    Object.entries(listeners).forEach(([event, handler]) => Spreedly.on(event, handler));
  };
  _getSpreedlyFieldErrorMessage = new WeakSet();
  getSpreedlyFieldErrorMessage_fn = function(fieldType) {
    const errorMessages = {
      "number": "Please enter a valid credit card number",
      "cvv": "Please enter a valid security code (CVV)"
    };
    return errorMessages[fieldType] || `Invalid ${fieldType}`;
  };
  _handleSpreedlyError = new WeakSet();
  handleSpreedlyError_fn = function(error) {
    const fieldMap = {
      "number": "spreedly-number",
      "card_number": "spreedly-number",
      "cvv": "spreedly-cvv",
      "month": "cc-month",
      "year": "cc-year",
      "full_name": "cc-name",
      "first_name": "cc-name",
      "last_name": "cc-name"
    };
    const container = document.getElementById(fieldMap[error.attribute]) || document.querySelector(`[os-checkout-field="${fieldMap[error.attribute]}"]`);
    if (container)
      __privateMethod(this, _showError, showError_fn).call(this, container, error.message);
  };
  _handleSubmit = new WeakSet();
  handleSubmit_fn = function(event) {
    if (!this.validateAllFields()) {
      event.preventDefault();
      __privateMethod(this, _safeLog, safeLog_fn).call(this, "warn", "Form validation failed");
    }
  };
  _logValidationStart = new WeakSet();
  logValidationStart_fn = function(method) {
    __privateMethod(this, _safeLog, safeLog_fn).call(this, "debug", "Starting field validation for payment method:", method);
    __privateMethod(this, _safeLog, safeLog_fn).call(this, "debug", "Same as shipping:", this.isSameAsShipping());
    __privateMethod(this, _safeLog, safeLog_fn).call(this, "debug", "Spreedly enabled:", __privateGet(this, _spreedlyEnabled));
    __privateMethod(this, _safeLog, safeLog_fn).call(this, "debug", "Spreedly ready:", __privateGet(this, _spreedlyReady));
  };
  _validateFields = new WeakSet();
  validateFields_fn = function(fields, isCreditCard) {
    let firstErrorField = null;
    for (const field of fields) {
      const fieldName = field.getAttribute("os-checkout-field");
      if (__privateMethod(this, _shouldSkipField, shouldSkipField_fn).call(this, fieldName, isCreditCard)) {
        this.clearErrorForField(field);
        continue;
      }
      const label = field.previousElementSibling?.textContent || fieldName || field.placeholder;
      if (!__privateMethod(this, _validateField, validateField_fn).call(this, field, label)) {
        firstErrorField = firstErrorField || field;
      }
    }
    return firstErrorField;
  };
  _shouldSkipField = new WeakSet();
  shouldSkipField_fn = function(fieldName, isCreditCard) {
    return this.isSameAsShipping() && fieldName?.startsWith("billing-") || isCreditCard && ["cc-number", "cvv"].includes(fieldName);
  };
  _validateCreditCardExpiryFields = new WeakSet();
  validateCreditCardExpiryFields_fn = function() {
    const [monthField, yearField] = __privateMethod(this, _getExpiryFields, getExpiryFields_fn).call(this);
    return __privateMethod(this, _validateExpiryField, validateExpiryField_fn).call(this, monthField, "month") && __privateMethod(this, _validateExpiryField, validateExpiryField_fn).call(this, yearField, "year");
  };
  _getExpiryFields = new WeakSet();
  getExpiryFields_fn = function() {
    const monthSelectors = ['[os-checkout-field="cc-month"]', '[os-checkout-field="exp-month"]', "#credit_card_exp_month"];
    const yearSelectors = ['[os-checkout-field="cc-year"]', '[os-checkout-field="exp-year"]', "#credit_card_exp_year"];
    return [
      monthSelectors.map((s) => document.querySelector(s)).find(Boolean),
      yearSelectors.map((s) => document.querySelector(s)).find(Boolean)
    ];
  };
  _validateExpiryField = new WeakSet();
  validateExpiryField_fn = function(field, type) {
    if (!field || !field.value) {
      __privateMethod(this, _safeLog, safeLog_fn).call(this, "error", `${type} field is empty`);
      __privateMethod(this, _showError, showError_fn).call(this, field, `Please select an expiration ${type}`);
      return false;
    }
    return true;
  };
  _clearSpreedlyErrors = new WeakSet();
  clearSpreedlyErrors_fn = function() {
    ["cc-number", "cvv"].forEach((name) => this.clearErrorForField(document.querySelector(`[os-checkout-field="${name}"]`)));
    ["spreedly-number", "spreedly-cvv"].forEach((id) => this.clearErrorForField(document.getElementById(id)));
  };
  _validateField = new WeakSet();
  validateField_fn = function(field, label) {
    if (!field)
      return true;
    const value = field.value.trim();
    const validation = __privateMethod(this, _getFieldValidation, getFieldValidation_fn).call(this, field, value, __privateMethod(this, _getReadableFieldLabel, getReadableFieldLabel_fn).call(this, field, label));
    if (!validation.isValid) {
      __privateMethod(this, _showError, showError_fn).call(this, field, validation.errorMessage);
    } else {
      this.clearErrorForField(field);
    }
    return validation.isValid;
  };
  _getReadableFieldLabel = new WeakSet();
  getReadableFieldLabel_fn = function(field, fallbackLabel) {
    const fieldName = field.getAttribute("os-checkout-field") || field.name;
    const labelMap = {
      "fname": "First Name",
      "lname": "Last Name",
      "email": "Email",
      "phone": "Phone Number",
      "address1": "Address",
      "address2": "Apartment or Suite",
      "city": "City",
      "province": "State/Province",
      "postal": "ZIP/Postal Code",
      "country": "Country",
      "cc-number": "Credit Card Number",
      "cvv": "Security Code",
      "cc-month": "Expiration Month",
      "cc-year": "Expiration Year",
      "cc-name": "Name on Card",
      "exp-month": "Expiration Month",
      "exp-year": "Expiration Year",
      "billing-fname": "Billing First Name",
      "billing-lname": "Billing Last Name",
      "billing-address1": "Billing Address",
      "billing-address2": "Billing Apartment or Suite",
      "billing-city": "Billing City",
      "billing-province": "Billing State/Province",
      "billing-postal": "Billing ZIP/Postal Code",
      "billing-country": "Billing Country",
      "billing-phone": "Billing Phone Number"
    };
    return labelMap[fieldName] || fallbackLabel || fieldName;
  };
  _getFieldValidation = new WeakSet();
  getFieldValidation_fn = function(field, value, label) {
    const tag = field.tagName.toLowerCase();
    const fieldName = field.getAttribute("os-checkout-field") || field.name;
    if (tag === "select")
      return {
        isValid: !!value,
        errorMessage: `Please select a ${label}`
      };
    if (field.type === "tel" && field.iti) {
      if (!value.trim()) {
        return { isValid: true, errorMessage: "" };
      }
      const isValid = field.iti.isValidNumber();
      return {
        isValid,
        errorMessage: `Please enter a valid US phone number (e.g. 555-555-5555)`
      };
    }
    if (!value)
      return { isValid: false, errorMessage: `Please enter your ${label}` };
    if (fieldName && (fieldName.includes("city") || fieldName.endsWith("-city"))) {
      return __privateMethod(this, _validateCity, validateCity_fn).call(this, value, label);
    }
    if (fieldName && (fieldName.includes("zip") || fieldName.includes("postal") || fieldName.endsWith("-zip"))) {
      return __privateMethod(this, _validateZipCode, validateZipCode_fn).call(this, value, fieldName);
    }
    if (field.type === "email")
      return {
        isValid: __privateMethod(this, _isValidEmail, isValidEmail_fn).call(this, value),
        errorMessage: `Please enter a valid email address`
      };
    return { isValid: true, errorMessage: "" };
  };
  _validateCity = new WeakSet();
  validateCity_fn = function(value, label) {
    const cityRegex = /^[a-zA-Z\s]{2,24}$/;
    return {
      isValid: cityRegex.test(value),
      errorMessage: `Please enter a valid city name (2-24 letters, no numbers or special characters)`
    };
  };
  _validateZipCode = new WeakSet();
  validateZipCode_fn = function(value, fieldName = "Zip") {
    const zipPattern = /(^\d{5}$)|(^\d{5}-\d{4}$)/;
    const isValid = zipPattern.test(value);
    return {
      isValid,
      errorMessage: isValid ? "" : `Field must be a valid US Zip code.`
    };
  };
  _showError = new WeakSet();
  showError_fn = function(input, message) {
    if (!input)
      return;
    input.classList.add("error");
    const wrapper = input.closest(".frm-flds") || input.closest(".form-group") || input.parentElement;
    const errorElement = __privateMethod(this, _getOrCreateErrorElement, getOrCreateErrorElement_fn).call(this, wrapper);
    errorElement.textContent = message;
    Object.assign(errorElement.style, {
      color: "red",
      fontSize: "0.875rem",
      marginTop: "0.25rem"
    });
    if (!input.hasErrorListener) {
      input.hasErrorListener = true;
      ["input", "change"].forEach((event) => input.addEventListener(event, () => this.clearErrorForField(input)));
      if (input.type === "tel" && input.iti) {
        input.addEventListener("countrychange", () => this.clearErrorForField(input));
      }
    }
  };
  _getOrCreateErrorElement = new WeakSet();
  getOrCreateErrorElement_fn = function(wrapper) {
    let errorElement = wrapper.querySelector(".pb-input-error");
    if (!errorElement) {
      errorElement = document.createElement("div");
      errorElement.className = "pb-input-error";
      wrapper.appendChild(errorElement);
    }
    return errorElement;
  };
  _scrollToError = new WeakSet();
  scrollToError_fn = function(element) {
    if (!element)
      return;
    window.scrollTo({
      top: element.getBoundingClientRect().top + window.pageYOffset - 100,
      behavior: "smooth"
    });
    setTimeout(() => element.focus(), 500);
  };
  _isValidEmail = new WeakSet();
  isValidEmail_fn = function(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };
  _validatePhoneFields = new WeakSet();
  validatePhoneFields_fn = function() {
    const phoneFields = Array.from(document.querySelectorAll('input[type="tel"]'));
    let hasError = false;
    for (const field of phoneFields) {
      if (!field.value.trim() || !field.iti)
        continue;
      const isValid = field.iti.isValidNumber();
      if (!isValid) {
        const errorCode = field.iti.getValidationError();
        const errorMessages = {
          0: "Please enter a valid US phone number (e.g. 555-555-5555)",
          1: "Invalid country code",
          2: "Phone number is too short",
          3: "Phone number is too long",
          4: "Please enter a valid phone number",
          5: "Invalid phone number format"
        };
        const message = errorMessages[errorCode] || "Please enter a valid US phone number";
        __privateMethod(this, _showError, showError_fn).call(this, field, message);
        if (!hasError) {
          __privateMethod(this, _scrollToError, scrollToError_fn).call(this, field);
          hasError = true;
        }
      } else {
        this.clearErrorForField(field);
      }
    }
    return hasError;
  };
  _setupZipCodeFormatting = new WeakSet();
  setupZipCodeFormatting_fn = function() {
    const zipFields = [
      ...document.querySelectorAll('[os-checkout-field="postal"]'),
      ...document.querySelectorAll('[os-checkout-field="billing-postal"]'),
      ...document.querySelectorAll('[os-checkout-field="zip"]')
    ];
    zipFields.forEach((field) => {
      if (field) {
        field.addEventListener("input", (e) => __privateMethod(this, _formatZipCode, formatZipCode_fn).call(this, e));
        __privateGet(this, _logger3).debug(`ZIP code formatting setup for: ${field.getAttribute("os-checkout-field") || field.name || "unknown"}`);
      }
    });
  };
  _formatZipCode = new WeakSet();
  formatZipCode_fn = function(event) {
    const input = event.target;
    const cursorPos = input.selectionStart;
    const oldValue = input.value;
    let cleaned = oldValue.replace(/[^\d-]/g, "");
    if (cleaned.length > 5) {
      const firstPart = cleaned.slice(0, 5);
      if (cleaned.charAt(5) !== "-") {
        const secondPart = cleaned.slice(5).replace(/-/g, "");
        cleaned = `${firstPart}-${secondPart}`;
      } else {
        const secondPart = cleaned.slice(6).replace(/-/g, "");
        cleaned = `${firstPart}-${secondPart}`;
      }
    }
    if (cleaned.includes("-")) {
      const [first, second] = cleaned.split("-");
      cleaned = `${first.slice(0, 5)}-${second.slice(0, 4)}`;
    } else {
      cleaned = cleaned.slice(0, 5);
    }
    if (cleaned !== oldValue) {
      input.value = cleaned;
      const posAdjust = cleaned.length - oldValue.length;
      input.setSelectionRange(cursorPos + posAdjust, cursorPos + posAdjust);
    }
  };

  // src/managers/SpreedlyManager.js
  var _environmentKey, _debugMode2, _isReady, _onReadyCallback, _onErrorCallback, _onPaymentMethodCallback, _onValidationCallback, _config, _app2, _loadConfig, loadConfig_fn, _initialize, initialize_fn, _loadScript, loadScript_fn, _setupSpreedly, setupSpreedly_fn, _applySpreedlyConfig, applySpreedlyConfig_fn, _prepareHtmlStructure, prepareHtmlStructure_fn, _setupEventListeners, setupEventListeners_fn, _showErrors, showErrors_fn, _clearFieldError, clearFieldError_fn, _log, log_fn;
  var SpreedlyManager = class {
    /**
     * Create a new SpreedlyManager
     * @param {string} environmentKey - The Spreedly environment key
     * @param {Object} options - Configuration options
     * @param {boolean} options.debug - Enable debug mode
     * @param {Object} options.app - The app instance for accessing global config
     */
    constructor(environmentKey, options = {}) {
      /**
       * Load Spreedly configuration from global config
       */
      __privateAdd(this, _loadConfig);
      /**
       * Initialize Spreedly
       * Load the script if needed and set up the iframe fields
       */
      __privateAdd(this, _initialize);
      /**
       * Load the Spreedly script
       * @returns {Promise} A promise that resolves when the script is loaded
       */
      __privateAdd(this, _loadScript);
      /**
       * Set up Spreedly with the environment key and prepare the iframe fields
       */
      __privateAdd(this, _setupSpreedly);
      /**
       * Apply configuration to Spreedly iframe fields
       */
      __privateAdd(this, _applySpreedlyConfig);
      /**
       * Prepare the HTML structure for the iframe fields
       * This uses the existing inputs rather than creating new ones
       */
      __privateAdd(this, _prepareHtmlStructure);
      /**
       * Set up event listeners for Spreedly events
       */
      __privateAdd(this, _setupEventListeners);
      /**
       * Show errors on the form
       * @param {Array} errors - Array of error objects from Spreedly
       */
      __privateAdd(this, _showErrors);
      /**
       * Clear error for a specific field
       * @param {string} fieldType - The field type (number, cvv, etc.)
       */
      __privateAdd(this, _clearFieldError);
      /**
       * Log a message with the specified level
       * @param {string} level - The log level (debug, info, warn, error)
       * @param {string} message - The message to log
       * @param {*} data - Additional data to log
       */
      __privateAdd(this, _log);
      __privateAdd(this, _environmentKey, void 0);
      __privateAdd(this, _debugMode2, false);
      __privateAdd(this, _isReady, false);
      __privateAdd(this, _onReadyCallback, null);
      __privateAdd(this, _onErrorCallback, null);
      __privateAdd(this, _onPaymentMethodCallback, null);
      __privateAdd(this, _onValidationCallback, null);
      __privateAdd(this, _config, null);
      __privateAdd(this, _app2, null);
      __privateSet(this, _environmentKey, environmentKey);
      __privateSet(this, _debugMode2, options.debug || false);
      __privateSet(this, _app2, options.app || null);
      __privateMethod(this, _loadConfig, loadConfig_fn).call(this);
      if (!environmentKey) {
        __privateMethod(this, _log, log_fn).call(this, "error", "No environment key provided to SpreedlyManager");
        return;
      }
      __privateMethod(this, _log, log_fn).call(this, "debug", `SpreedlyManager initialized with environment key: ${environmentKey}`);
      __privateMethod(this, _initialize, initialize_fn).call(this);
    }
    /**
     * Clear all errors
     */
    clearAllErrors() {
      __privateMethod(this, _clearFieldError, clearFieldError_fn).call(this, "number");
      __privateMethod(this, _clearFieldError, clearFieldError_fn).call(this, "cvv");
      const monthField = document.querySelector('[os-checkout-field="cc-month"]') || document.querySelector('[os-checkout-field="exp-month"]') || document.querySelector("#credit_card_exp_month");
      const yearField = document.querySelector('[os-checkout-field="cc-year"]') || document.querySelector('[os-checkout-field="exp-year"]') || document.querySelector("#credit_card_exp_year");
      if (monthField) {
        monthField.classList.remove("error");
        const monthWrapper = monthField.closest(".frm-flds") || monthField.parentElement;
        const monthError = monthWrapper.querySelector(".pb-input-error");
        if (monthError)
          monthError.remove();
      }
      if (yearField) {
        yearField.classList.remove("error");
        const yearWrapper = yearField.closest(".frm-flds") || yearField.parentElement;
        const yearError = yearWrapper.querySelector(".pb-input-error");
        if (yearError)
          yearError.remove();
      }
    }
    /**
     * Tokenize a credit card
     * @param {Object} cardData - The card data to tokenize
     * @param {string} cardData.full_name - The cardholder name
     * @param {string} cardData.month - The expiration month (2 digits)
     * @param {string} cardData.year - The expiration year (4 digits)
     */
    tokenizeCard(cardData) {
      __privateMethod(this, _log, log_fn).call(this, "debug", "Tokenizing card with data:", {
        ...cardData,
        full_name: cardData.full_name,
        month: cardData.month,
        year: cardData.year
      });
      this.clearAllErrors();
      if (!cardData.full_name || !cardData.month || !cardData.year) {
        __privateMethod(this, _log, log_fn).call(this, "error", "Missing required card data");
        const errors = [];
        if (!cardData.full_name)
          errors.push({ attribute: "full_name", message: "Cardholder name is required" });
        if (!cardData.month)
          errors.push({ attribute: "month", message: "Expiration month is required" });
        if (!cardData.year)
          errors.push({ attribute: "year", message: "Expiration year is required" });
        __privateMethod(this, _showErrors, showErrors_fn).call(this, errors);
        if (__privateGet(this, _onErrorCallback)) {
          __privateGet(this, _onErrorCallback).call(this, errors.map((e) => e.message));
        }
        return;
      }
      if (!__privateGet(this, _isReady)) {
        __privateMethod(this, _log, log_fn).call(this, "error", "Spreedly is not ready yet");
        if (__privateGet(this, _onErrorCallback)) {
          __privateGet(this, _onErrorCallback).call(this, ["Payment system is not ready yet. Please try again in a moment."]);
        }
        return;
      }
      try {
        Spreedly.tokenizeCreditCard(cardData);
        __privateMethod(this, _log, log_fn).call(this, "debug", "Card tokenization initiated");
      } catch (error) {
        __privateMethod(this, _log, log_fn).call(this, "error", "Error tokenizing card", error);
        if (__privateGet(this, _onErrorCallback)) {
          __privateGet(this, _onErrorCallback).call(this, ["An error occurred while processing your card. Please try again."]);
        }
      }
    }
    /**
     * Set a callback to be called when Spreedly is ready
     * @param {Function} callback - The callback function
     */
    setOnReady(callback) {
      __privateSet(this, _onReadyCallback, callback);
      if (__privateGet(this, _isReady) && callback) {
        callback();
      }
    }
    /**
     * Set a callback to be called when Spreedly encounters an error
     * @param {Function} callback - The callback function
     */
    setOnError(callback) {
      __privateSet(this, _onErrorCallback, callback);
    }
    /**
     * Set a callback to be called when a payment method is created
     * @param {Function} callback - The callback function
     */
    setOnPaymentMethod(callback) {
      __privateSet(this, _onPaymentMethodCallback, callback);
    }
    /**
     * Set a callback to be called when a field is validated
     * @param {Function} callback - The callback function
     */
    setOnValidation(callback) {
      __privateSet(this, _onValidationCallback, callback);
    }
  };
  _environmentKey = new WeakMap();
  _debugMode2 = new WeakMap();
  _isReady = new WeakMap();
  _onReadyCallback = new WeakMap();
  _onErrorCallback = new WeakMap();
  _onPaymentMethodCallback = new WeakMap();
  _onValidationCallback = new WeakMap();
  _config = new WeakMap();
  _app2 = new WeakMap();
  _loadConfig = new WeakSet();
  loadConfig_fn = function() {
    __privateSet(this, _config, {
      fieldType: {
        number: "text",
        cvv: "text"
      },
      numberFormat: "prettyFormat",
      placeholder: {
        number: "Credit Card Number",
        cvv: "CVV *"
      },
      labels: {
        number: "Card Number",
        cvv: "CVV"
      },
      titles: {
        number: "Credit card number",
        cvv: "Card verification value"
      },
      styling: {
        number: 'color: #212529; font-size: .925rem; font-weight: 400; width: 100%; height:100%; font-family: system-ui,-apple-system,"Segoe UI",Roboto,"Helvetica Neue","Noto Sans","Liberation Sans",Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol","Noto Color Emoji";',
        cvv: 'color: #212529; font-size: .925rem; font-weight: 400; width: 100%; height: 100%; font-family: system-ui,-apple-system,"Segoe UI",Roboto,"Helvetica Neue","Noto Sans","Liberation Sans",Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol","Noto Color Emoji";'
      },
      placeholder_styling: "",
      required: {
        number: true,
        cvv: true
      },
      autocomplete: true
    });
    if (window.osConfig && window.osConfig.spreedlyConfig) {
      __privateMethod(this, _log, log_fn).call(this, "debug", "Found global Spreedly configuration", window.osConfig.spreedlyConfig);
      if (window.osConfig.spreedlyConfig.fieldType) {
        __privateGet(this, _config).fieldType = {
          ...__privateGet(this, _config).fieldType,
          ...window.osConfig.spreedlyConfig.fieldType
        };
      }
      if (window.osConfig.spreedlyConfig.numberFormat) {
        __privateGet(this, _config).numberFormat = window.osConfig.spreedlyConfig.numberFormat;
      }
      if (window.osConfig.spreedlyConfig.placeholder) {
        __privateGet(this, _config).placeholder = {
          ...__privateGet(this, _config).placeholder,
          ...window.osConfig.spreedlyConfig.placeholder
        };
      }
      if (window.osConfig.spreedlyConfig.labels) {
        __privateGet(this, _config).labels = {
          ...__privateGet(this, _config).labels,
          ...window.osConfig.spreedlyConfig.labels
        };
      }
      if (window.osConfig.spreedlyConfig.titles) {
        __privateGet(this, _config).titles = {
          ...__privateGet(this, _config).titles,
          ...window.osConfig.spreedlyConfig.titles
        };
      }
      if (window.osConfig.spreedlyConfig.styling) {
        __privateGet(this, _config).styling = {
          ...__privateGet(this, _config).styling,
          ...window.osConfig.spreedlyConfig.styling
        };
      }
      if (window.osConfig.spreedlyConfig.placeholder_styling) {
        __privateGet(this, _config).placeholder_styling = window.osConfig.spreedlyConfig.placeholder_styling;
      }
      if (window.osConfig.spreedlyConfig.required) {
        __privateGet(this, _config).required = {
          ...__privateGet(this, _config).required,
          ...window.osConfig.spreedlyConfig.required
        };
      }
      if (window.osConfig.spreedlyConfig.hasOwnProperty("autocomplete")) {
        __privateGet(this, _config).autocomplete = window.osConfig.spreedlyConfig.autocomplete;
      }
    }
    __privateMethod(this, _log, log_fn).call(this, "debug", "Spreedly configuration initialized", __privateGet(this, _config));
  };
  _initialize = new WeakSet();
  initialize_fn = function() {
    if (typeof Spreedly === "undefined") {
      __privateMethod(this, _log, log_fn).call(this, "debug", "Spreedly not loaded, loading script...");
      __privateMethod(this, _loadScript, loadScript_fn).call(this).then(() => {
        __privateMethod(this, _log, log_fn).call(this, "debug", "Spreedly script loaded");
        __privateMethod(this, _setupSpreedly, setupSpreedly_fn).call(this);
      }).catch((error) => {
        __privateMethod(this, _log, log_fn).call(this, "error", "Failed to load Spreedly script", error);
        if (__privateGet(this, _onErrorCallback)) {
          __privateGet(this, _onErrorCallback).call(this, ["Failed to load Spreedly. Please refresh the page and try again."]);
        }
      });
    } else {
      __privateMethod(this, _log, log_fn).call(this, "debug", "Spreedly already loaded");
      __privateMethod(this, _setupSpreedly, setupSpreedly_fn).call(this);
    }
  };
  _loadScript = new WeakSet();
  loadScript_fn = function() {
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://core.spreedly.com/iframe/iframe-v1.min.js";
      script.async = true;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  };
  _setupSpreedly = new WeakSet();
  setupSpreedly_fn = function() {
    try {
      __privateMethod(this, _log, log_fn).call(this, "debug", "Setting up Spreedly...");
      __privateMethod(this, _prepareHtmlStructure, prepareHtmlStructure_fn).call(this);
      Spreedly.init(__privateGet(this, _environmentKey), {
        "numberEl": "spreedly-number",
        "cvvEl": "spreedly-cvv"
      });
      Spreedly.on("ready", () => {
        __privateMethod(this, _log, log_fn).call(this, "debug", "Spreedly iframe ready");
        __privateMethod(this, _applySpreedlyConfig, applySpreedlyConfig_fn).call(this);
        __privateSet(this, _isReady, true);
        if (__privateGet(this, _onReadyCallback)) {
          __privateGet(this, _onReadyCallback).call(this);
        }
      });
      __privateMethod(this, _setupEventListeners, setupEventListeners_fn).call(this);
      __privateMethod(this, _log, log_fn).call(this, "debug", "Spreedly setup complete");
    } catch (error) {
      __privateMethod(this, _log, log_fn).call(this, "error", "Error setting up Spreedly", error);
      if (__privateGet(this, _onErrorCallback)) {
        __privateGet(this, _onErrorCallback).call(this, ["Failed to set up Spreedly. Please refresh the page and try again."]);
      }
    }
  };
  _applySpreedlyConfig = new WeakSet();
  applySpreedlyConfig_fn = function() {
    try {
      __privateMethod(this, _log, log_fn).call(this, "debug", "Applying Spreedly configuration...");
      Spreedly.setFieldType("number", __privateGet(this, _config).fieldType.number);
      Spreedly.setFieldType("cvv", __privateGet(this, _config).fieldType.cvv);
      Spreedly.setNumberFormat(__privateGet(this, _config).numberFormat);
      Spreedly.setPlaceholder("number", __privateGet(this, _config).placeholder.number);
      Spreedly.setPlaceholder("cvv", __privateGet(this, _config).placeholder.cvv);
      Spreedly.setLabel("number", __privateGet(this, _config).labels.number);
      Spreedly.setLabel("cvv", __privateGet(this, _config).labels.cvv);
      Spreedly.setTitle("number", __privateGet(this, _config).titles.number);
      Spreedly.setTitle("cvv", __privateGet(this, _config).titles.cvv);
      Spreedly.setStyle("number", __privateGet(this, _config).styling.number);
      Spreedly.setStyle("cvv", __privateGet(this, _config).styling.cvv);
      if (__privateGet(this, _config).placeholder_styling) {
        Spreedly.setStyle("placeholder", __privateGet(this, _config).placeholder_styling);
      }
      if (__privateGet(this, _config).required.number) {
        Spreedly.setRequiredAttribute("number");
      }
      if (__privateGet(this, _config).required.cvv) {
        Spreedly.setRequiredAttribute("cvv");
      }
      if (!__privateGet(this, _config).autocomplete) {
        Spreedly.toggleAutoComplete();
      }
      __privateMethod(this, _log, log_fn).call(this, "debug", "Spreedly configuration applied");
    } catch (error) {
      __privateMethod(this, _log, log_fn).call(this, "error", "Error applying Spreedly configuration", error);
    }
  };
  _prepareHtmlStructure = new WeakSet();
  prepareHtmlStructure_fn = function() {
    try {
      __privateMethod(this, _log, log_fn).call(this, "debug", "Preparing HTML structure for Spreedly iframe fields");
      const numberField = document.querySelector('[os-checkout-field="cc-number"]');
      const cvvField = document.querySelector('[os-checkout-field="cvv"]');
      if (!numberField || !cvvField) {
        __privateMethod(this, _log, log_fn).call(this, "error", "Could not find credit card fields");
        return;
      }
      numberField.id = "spreedly-number";
      cvvField.id = "spreedly-cvv";
      numberField.setAttribute("data-spreedly", "number");
      cvvField.setAttribute("data-spreedly", "cvv");
      __privateMethod(this, _log, log_fn).call(this, "debug", "HTML structure prepared for Spreedly iframe fields - using existing DOM elements");
    } catch (error) {
      __privateMethod(this, _log, log_fn).call(this, "error", "Error preparing HTML structure for Spreedly iframe fields", error);
    }
  };
  _setupEventListeners = new WeakSet();
  setupEventListeners_fn = function() {
    Spreedly.on("errors", (errors) => {
      __privateMethod(this, _log, log_fn).call(this, "error", "Spreedly validation errors:", errors);
      const errorMessages = errors.map((error) => error.message);
      if (__privateGet(this, _onErrorCallback)) {
        __privateGet(this, _onErrorCallback).call(this, errorMessages);
      }
      __privateMethod(this, _showErrors, showErrors_fn).call(this, errors);
    });
    Spreedly.on("paymentMethod", (token, pmData) => {
      __privateMethod(this, _log, log_fn).call(this, "debug", "Spreedly payment method created:", token);
      this.clearAllErrors();
      if (__privateGet(this, _onPaymentMethodCallback)) {
        __privateGet(this, _onPaymentMethodCallback).call(this, token, pmData);
      }
    });
    Spreedly.on("validation", (result) => {
      __privateMethod(this, _log, log_fn).call(this, "debug", "Spreedly field validation:", result);
      __privateMethod(this, _clearFieldError, clearFieldError_fn).call(this, result.fieldType);
      if (__privateGet(this, _onValidationCallback)) {
        __privateGet(this, _onValidationCallback).call(this, result);
      }
    });
  };
  _showErrors = new WeakSet();
  showErrors_fn = function(errors) {
    errors.forEach((error) => {
      const fieldType = error.attribute;
      let field = null;
      if (fieldType === "number" || fieldType === "card_number") {
        field = document.getElementById("spreedly-number");
      } else if (fieldType === "cvv") {
        field = document.getElementById("spreedly-cvv");
      } else if (fieldType === "month" || fieldType === "year") {
        field = document.querySelector(`[os-checkout-field="cc-${fieldType}"]`) || document.querySelector(`[os-checkout-field="exp-${fieldType}"]`) || document.querySelector(`#credit_card_exp_${fieldType}`);
      } else if (fieldType === "full_name" || fieldType === "first_name" || fieldType === "last_name") {
        field = document.querySelector('[os-checkout-field="cc-name"]');
      }
      if (field) {
        field.classList.add("error");
        const wrapper = field.closest(".frm-flds") || field.parentElement;
        let errorElement = wrapper.querySelector(".pb-input-error");
        if (!errorElement) {
          errorElement = document.createElement("div");
          errorElement.className = "pb-input-error";
          wrapper.appendChild(errorElement);
        }
        errorElement.textContent = error.message;
        errorElement.style.color = "red";
        errorElement.style.fontSize = "0.875rem";
        errorElement.style.marginTop = "0.25rem";
      }
    });
  };
  _clearFieldError = new WeakSet();
  clearFieldError_fn = function(fieldType) {
    let field = null;
    if (fieldType === "number" || fieldType === "card_number") {
      field = document.getElementById("spreedly-number");
    } else if (fieldType === "cvv") {
      field = document.getElementById("spreedly-cvv");
    }
    if (field) {
      field.classList.remove("error");
      const wrapper = field.closest(".frm-flds") || field.parentElement;
      const errorElement = wrapper.querySelector(".pb-input-error");
      if (errorElement) {
        errorElement.remove();
      }
    }
  };
  _log = new WeakSet();
  log_fn = function(level, message, data) {
    if (__privateGet(this, _debugMode2) || level === "error") {
      const prefix = "[SpreedlyManager]";
      if (data) {
        console[level](`${prefix} ${message}`, data);
      } else {
        console[level](`${prefix} ${message}`);
      }
    }
  };

  // src/utils/KonamiCodeHandler.js
  var _konamiCodeSequence, _konamiCodePosition, _indicatorTimeout, _indicator, _logger4, _callback, _createIndicator, createIndicator_fn, _initListener, initListener_fn;
  var KonamiCodeHandler = class {
    /**
     * Create a new KonamiCodeHandler instance
     * @param {Object} options - Configuration options
     * @param {Function} options.callback - Function to call when Konami code is detected
     * @param {Object} options.logger - Logger instance for logging
     */
    constructor({ callback, logger } = {}) {
      /**
       * Create the visual indicator element
       * @private
       */
      __privateAdd(this, _createIndicator);
      /**
       * Initialize the keydown event listener
       * @private
       */
      __privateAdd(this, _initListener);
      __privateAdd(this, _konamiCodeSequence, ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"]);
      __privateAdd(this, _konamiCodePosition, 0);
      __privateAdd(this, _indicatorTimeout, void 0);
      __privateAdd(this, _indicator, void 0);
      __privateAdd(this, _logger4, void 0);
      __privateAdd(this, _callback, void 0);
      __privateSet(this, _logger4, logger);
      __privateSet(this, _callback, callback);
      __privateMethod(this, _createIndicator, createIndicator_fn).call(this);
      __privateMethod(this, _initListener, initListener_fn).call(this);
      if (__privateGet(this, _logger4)) {
        __privateGet(this, _logger4).debug("KonamiCodeHandler initialized");
      }
    }
    /**
     * Set Konami code test mode in session storage
     * This can be used by other components to detect when Konami code is active
     */
    static setTestMode() {
      sessionStorage.setItem("konami_test_mode", "true");
      return true;
    }
    /**
     * Check if Konami code test mode is active
     * @returns {boolean} True if Konami code test mode is active
     */
    static isTestMode() {
      return sessionStorage.getItem("konami_test_mode") === "true";
    }
    /**
     * Clear Konami code test mode from session storage
     */
    static clearTestMode() {
      sessionStorage.removeItem("konami_test_mode");
    }
    /**
     * Get predefined test order data for Konami code test mode
     * @param {Object} state - Application state
     * @param {Function} getPackageIdFromUrl - Function to get package ID from URL
     * @param {Function} getCartLines - Function to get cart lines
     * @returns {Object} Test order data
     */
    static getTestOrderData(state, getPackageIdFromUrl, getCartLines) {
      try {
        const cartItems = state?.cart?.items || [];
        const packageId = getPackageIdFromUrl ? getPackageIdFromUrl() : 1;
        const lines = cartItems.length > 0 && getCartLines ? getCartLines(cartItems) : [{ package_id: packageId || 1, quantity: 1 }];
        return {
          user: {
            email: "test@test.com",
            first_name: "Test",
            last_name: "Order"
          },
          shipping_address: {
            first_name: "Test",
            last_name: "Order",
            line1: "Test Address 123",
            line2: "",
            line3: "",
            line4: "Tempe",
            state: "AZ",
            postcode: "85281",
            country: "US",
            phone_number: "+14807581224"
          },
          billing_address: {
            first_name: "Test",
            last_name: "Order",
            line1: "Test Address 123",
            line2: "",
            line3: "",
            line4: "Tempe",
            state: "AZ",
            postcode: "85281",
            country: "US",
            phone_number: "+14807581224"
          },
          shipping_method: 1,
          attribution: state?.cart?.attribution || {},
          lines,
          // Don't include payment-related fields here as they'll be added by the payment handler
          success_url: window.location.origin + "/checkout/confirmation/"
        };
      } catch (error) {
        console.error("Error getting Konami test order data:", error);
        return null;
      }
    }
    /**
     * Show a message to the user when Konami code is activated
     * @returns {HTMLElement} The message element
     */
    static showActivationMessage() {
      const messageElement = document.createElement("div");
      messageElement.style.position = "fixed";
      messageElement.style.top = "50%";
      messageElement.style.left = "50%";
      messageElement.style.transform = "translate(-50%, -50%)";
      messageElement.style.background = "rgba(0, 0, 0, 0.8)";
      messageElement.style.color = "#fff";
      messageElement.style.padding = "20px";
      messageElement.style.borderRadius = "10px";
      messageElement.style.zIndex = "9999";
      messageElement.style.textAlign = "center";
      messageElement.style.fontFamily = "monospace";
      messageElement.style.fontSize = "18px";
      messageElement.innerHTML = `
      <h3>🎮 KONAMI CODE ACTIVATED! 🎮</h3>
      <p>Creating test order with predefined data:</p>
      <p style="font-size: 14px; margin-top: 10px; text-align: left;">
        Email: test@test.com<br>
        Name: Test Order<br>
        Address: Test Address 123<br>
        City: Tempe, AZ 85281<br>
        Country: US<br>
        Phone: +14807581224<br>
        Card: 4111111111111111 (test mode)
      </p>
    `;
      document.body.appendChild(messageElement);
      return messageElement;
    }
  };
  _konamiCodeSequence = new WeakMap();
  _konamiCodePosition = new WeakMap();
  _indicatorTimeout = new WeakMap();
  _indicator = new WeakMap();
  _logger4 = new WeakMap();
  _callback = new WeakMap();
  _createIndicator = new WeakSet();
  createIndicator_fn = function() {
    __privateSet(this, _indicator, document.createElement("div"));
    __privateGet(this, _indicator).style.position = "fixed";
    __privateGet(this, _indicator).style.bottom = "10px";
    __privateGet(this, _indicator).style.right = "10px";
    __privateGet(this, _indicator).style.background = "rgba(0, 0, 0, 0.7)";
    __privateGet(this, _indicator).style.color = "#fff";
    __privateGet(this, _indicator).style.padding = "5px 10px";
    __privateGet(this, _indicator).style.borderRadius = "5px";
    __privateGet(this, _indicator).style.fontFamily = "monospace";
    __privateGet(this, _indicator).style.fontSize = "12px";
    __privateGet(this, _indicator).style.zIndex = "9999";
    __privateGet(this, _indicator).style.display = "none";
    __privateGet(this, _indicator).textContent = "Konami: 0/" + __privateGet(this, _konamiCodeSequence).length;
    document.body.appendChild(__privateGet(this, _indicator));
  };
  _initListener = new WeakSet();
  initListener_fn = function() {
    document.addEventListener("keydown", (e) => {
      if (e.key === __privateGet(this, _konamiCodeSequence)[__privateGet(this, _konamiCodePosition)]) {
        __privateWrapper(this, _konamiCodePosition)._++;
        if (__privateGet(this, _konamiCodePosition) >= 4) {
          __privateGet(this, _indicator).style.display = "block";
          __privateGet(this, _indicator).textContent = `Konami: ${__privateGet(this, _konamiCodePosition)}/${__privateGet(this, _konamiCodeSequence).length}`;
        }
        if (__privateGet(this, _konamiCodePosition) === __privateGet(this, _konamiCodeSequence).length) {
          if (__privateGet(this, _callback)) {
            __privateGet(this, _callback).call(this);
          }
          __privateSet(this, _konamiCodePosition, 0);
          setTimeout(() => {
            __privateGet(this, _indicator).style.display = "none";
          }, 500);
        }
        if (__privateGet(this, _konamiCodePosition) >= 4) {
          clearTimeout(__privateGet(this, _indicatorTimeout));
          __privateSet(this, _indicatorTimeout, setTimeout(() => {
            __privateGet(this, _indicator).style.display = "none";
          }, 3e3));
        }
      } else {
        if (__privateGet(this, _konamiCodePosition) > 0) {
          __privateSet(this, _konamiCodePosition, 0);
          if (__privateGet(this, _indicator).style.display === "block") {
            __privateGet(this, _indicator).textContent = `Konami: 0/${__privateGet(this, _konamiCodeSequence).length}`;
            clearTimeout(__privateGet(this, _indicatorTimeout));
            __privateSet(this, _indicatorTimeout, setTimeout(() => {
              __privateGet(this, _indicator).style.display = "none";
            }, 1500));
          }
        }
      }
    });
  };

  // src/components/checkout/PaymentHandler.js
  var _apiClient, _logger5, _app3, _form3, _spreedlyManager, _formValidator, _paymentMethod, _isProcessing, _debugMode3, _testCards, _expressCheckoutButtons, _deviceSupport, _getCheckoutForm, getCheckoutForm_fn, _setupFormPrevention, setupFormPrevention_fn, _preventFormSubmission, preventFormSubmission_fn, _convertSubmitButtons, convertSubmitButtons_fn, _setupCheckoutButton, setupCheckoutButton_fn, _safeLog2, safeLog_fn2, _initPaymentMethods, initPaymentMethods_fn, _setupPaymentMethodListeners, setupPaymentMethodListeners_fn, _initSpreedly, initSpreedly_fn, _setupSpreedlyCallbacks, setupSpreedlyCallbacks_fn, _formatSpreedlyErrors, formatSpreedlyErrors_fn, _initializeExpirationFields, initializeExpirationFields_fn, _getExpirationElements, getExpirationElements_fn, _populateExpirationOptions, populateExpirationOptions_fn, _isTestMode, isTestMode_fn, _enforceFormPrevention, enforceFormPrevention_fn, _showProcessingState, showProcessingState_fn, _hideProcessingState, hideProcessingState_fn, _processCreditCard, processCreditCard_fn, _getCreditCardFields, getCreditCardFields_fn, _isDebugTestCardMode, isDebugTestCardMode_fn, _processTestCard, processTestCard_fn, _processPaypal, processPaypal_fn, _getPackageIdFromUrl, getPackageIdFromUrl_fn, _getOrderData, getOrderData_fn, _getAddressData, getAddressData_fn, _formatAddress, formatAddress_fn, _getShippingMethod, getShippingMethod_fn, _getCartLines, getCartLines_fn, _createOrder, createOrder_fn, _formatOrderData, formatOrderData_fn, _formatErrorMessage, formatErrorMessage_fn, _formatPaymentErrorMessage, formatPaymentErrorMessage_fn, _handlePaymentError, handlePaymentError_fn, _displayCreditCardError, displayCreditCardError_fn, _clearPaymentErrors, clearPaymentErrors_fn, _handleOrderSuccess, handleOrderSuccess_fn, _getRedirectUrl, getRedirectUrl_fn, _initExpressCheckout, initExpressCheckout_fn, _detectDeviceSupport, detectDeviceSupport_fn, _hasActiveExpressButtons, hasActiveExpressButtons_fn, _setExpressButtonProcessing, setExpressButtonProcessing_fn, _handleExpressCheckoutError, handleExpressCheckoutError_fn, _checkForPaymentFailedParameters, checkForPaymentFailedParameters_fn, _displayTopBannerError, displayTopBannerError_fn;
  var PaymentHandler = class {
    constructor(apiClient, logger, app) {
      __privateAdd(this, _getCheckoutForm);
      __privateAdd(this, _setupFormPrevention);
      __privateAdd(this, _preventFormSubmission);
      __privateAdd(this, _convertSubmitButtons);
      __privateAdd(this, _setupCheckoutButton);
      __privateAdd(this, _safeLog2);
      __privateAdd(this, _initPaymentMethods);
      __privateAdd(this, _setupPaymentMethodListeners);
      __privateAdd(this, _initSpreedly);
      __privateAdd(this, _setupSpreedlyCallbacks);
      __privateAdd(this, _formatSpreedlyErrors);
      __privateAdd(this, _initializeExpirationFields);
      __privateAdd(this, _getExpirationElements);
      __privateAdd(this, _populateExpirationOptions);
      __privateAdd(this, _isTestMode);
      __privateAdd(this, _enforceFormPrevention);
      __privateAdd(this, _showProcessingState);
      __privateAdd(this, _hideProcessingState);
      __privateAdd(this, _processCreditCard);
      __privateAdd(this, _getCreditCardFields);
      __privateAdd(this, _isDebugTestCardMode);
      __privateAdd(this, _processTestCard);
      __privateAdd(this, _processPaypal);
      __privateAdd(this, _getPackageIdFromUrl);
      __privateAdd(this, _getOrderData);
      __privateAdd(this, _getAddressData);
      __privateAdd(this, _formatAddress);
      __privateAdd(this, _getShippingMethod);
      __privateAdd(this, _getCartLines);
      __privateAdd(this, _createOrder);
      __privateAdd(this, _formatOrderData);
      __privateAdd(this, _formatErrorMessage);
      __privateAdd(this, _formatPaymentErrorMessage);
      __privateAdd(this, _handlePaymentError);
      __privateAdd(this, _displayCreditCardError);
      __privateAdd(this, _clearPaymentErrors);
      __privateAdd(this, _handleOrderSuccess);
      __privateAdd(this, _getRedirectUrl);
      /**
       * Initialize express checkout buttons
       */
      __privateAdd(this, _initExpressCheckout);
      /**
       * Detect which payment methods are supported by the device/browser
       */
      __privateAdd(this, _detectDeviceSupport);
      /**
       * Check if there are any active express checkout buttons
       * @returns {boolean} True if at least one express button is initialized
       */
      __privateAdd(this, _hasActiveExpressButtons);
      /**
       * Set express checkout button to processing state
       * @param {HTMLElement} button - Button element
       * @param {boolean} isProcessing - Whether the button is processing
       */
      __privateAdd(this, _setExpressButtonProcessing);
      /**
       * Handle express checkout error
       * @param {string} message - Error message
       * @param {HTMLElement} button - Button element that was clicked
       */
      __privateAdd(this, _handleExpressCheckoutError);
      /**
       * Check URL parameters for payment_failed and display appropriate error message
       */
      __privateAdd(this, _checkForPaymentFailedParameters);
      /**
       * Display a prominent error banner at the top of the checkout form
       * @param {string} message - Error message to display
       * @param {string} method - Payment method that failed
       */
      __privateAdd(this, _displayTopBannerError);
      __privateAdd(this, _apiClient, void 0);
      __privateAdd(this, _logger5, void 0);
      __privateAdd(this, _app3, void 0);
      __privateAdd(this, _form3, void 0);
      __privateAdd(this, _spreedlyManager, null);
      __privateAdd(this, _formValidator, null);
      __privateAdd(this, _paymentMethod, "credit-card");
      __privateAdd(this, _isProcessing, false);
      __privateAdd(this, _debugMode3, false);
      __privateAdd(this, _testCards, {
        visa: "4111111111111111",
        mastercard: "5555555555554444",
        amex: "378282246310005",
        discover: "6011111111111117"
      });
      __privateAdd(this, _expressCheckoutButtons, {
        paypal: null,
        applePay: null,
        googlePay: null
      });
      __privateAdd(this, _deviceSupport, {
        applePay: false,
        googlePay: false
      });
      __privateSet(this, _apiClient, apiClient);
      __privateSet(this, _logger5, logger);
      __privateSet(this, _app3, app);
      __privateSet(this, _form3, __privateMethod(this, _getCheckoutForm, getCheckoutForm_fn).call(this));
      if (!__privateGet(this, _form3))
        return;
      __privateMethod(this, _setupFormPrevention, setupFormPrevention_fn).call(this);
      __privateMethod(this, _setupCheckoutButton, setupCheckoutButton_fn).call(this);
      __privateSet(this, _formValidator, new FormValidator({
        debugMode: __privateGet(this, _debugMode3),
        logger: __privateGet(this, _logger5)
      }));
      __privateGet(this, _form3).__formValidator = __privateGet(this, _formValidator);
      __privateMethod(this, _initPaymentMethods, initPaymentMethods_fn).call(this);
      __privateMethod(this, _initSpreedly, initSpreedly_fn).call(this);
      __privateMethod(this, _initExpressCheckout, initExpressCheckout_fn).call(this);
      __privateMethod(this, _checkForPaymentFailedParameters, checkForPaymentFailedParameters_fn).call(this);
    }
    /**
     * Set Konami code test mode flag
     * This method can be called from CheckoutManager when Konami code is activated
     */
    setKonamiTestMode() {
      KonamiCodeHandler.setTestMode();
      __privateMethod(this, _safeLog2, safeLog_fn2).call(this, "info", "🎮 Konami code test mode activated");
      return true;
    }
    processPayment() {
      const isKonamiMode = KonamiCodeHandler.isTestMode();
      if (isKonamiMode) {
        KonamiCodeHandler.clearTestMode();
        __privateMethod(this, _safeLog2, safeLog_fn2).call(this, "info", "🎮 Processing payment in Konami test mode");
      }
      if (__privateGet(this, _isProcessing)) {
        __privateMethod(this, _safeLog2, safeLog_fn2).call(this, "warn", "Payment already processing");
        return;
      }
      __privateMethod(this, _clearPaymentErrors, clearPaymentErrors_fn).call(this);
      __privateMethod(this, _enforceFormPrevention, enforceFormPrevention_fn).call(this);
      __privateSet(this, _isProcessing, true);
      __privateMethod(this, _safeLog2, safeLog_fn2).call(this, "debug", `Processing payment with method: ${__privateGet(this, _paymentMethod)}`);
      try {
        if (isKonamiMode) {
          __privateMethod(this, _showProcessingState, showProcessingState_fn).call(this);
          const orderData2 = KonamiCodeHandler.getTestOrderData(
            __privateGet(this, _app3)?.state?.getState(),
            __privateMethod(this, _getPackageIdFromUrl, getPackageIdFromUrl_fn).bind(this),
            __privateMethod(this, _getCartLines, getCartLines_fn).bind(this)
          );
          if (!orderData2) {
            __privateMethod(this, _hideProcessingState, hideProcessingState_fn).call(this);
            return;
          }
          __privateMethod(this, _createOrder, createOrder_fn).call(this, {
            ...orderData2,
            payment_detail: {
              payment_method: "card_token",
              card_token: "test_card",
              test_card_number: "6011111111111117"
              // Use specific test card for Konami mode
            }
          });
          return;
        }
        if (!__privateGet(this, _formValidator).validateAllFields(__privateGet(this, _paymentMethod))) {
          __privateSet(this, _isProcessing, false);
          __privateMethod(this, _hideProcessingState, hideProcessingState_fn).call(this);
          return;
        }
        __privateMethod(this, _showProcessingState, showProcessingState_fn).call(this);
        const orderData = __privateMethod(this, _getOrderData, getOrderData_fn).call(this);
        if (!orderData)
          return;
        if (__privateMethod(this, _isTestMode, isTestMode_fn).call(this)) {
          __privateMethod(this, _createOrder, createOrder_fn).call(this, {
            ...orderData,
            payment_detail: {
              payment_method: "card_token",
              card_token: "test_card"
              // Use test_card token for test mode
            }
          });
          return;
        }
        switch (__privateGet(this, _paymentMethod)) {
          case "credit-card":
          case "credit":
            __privateMethod(this, _processCreditCard, processCreditCard_fn).call(this);
            break;
          case "paypal":
            __privateMethod(this, _processPaypal, processPaypal_fn).call(this);
            break;
          default:
            __privateMethod(this, _handlePaymentError, handlePaymentError_fn).call(this, `Unknown payment method: ${__privateGet(this, _paymentMethod)}`);
        }
      } catch (error) {
        __privateMethod(this, _safeLog2, safeLog_fn2).call(this, "error", "Error processing payment:", error);
        __privateMethod(this, _handlePaymentError, handlePaymentError_fn).call(this, "Unexpected error occurred");
        __privateMethod(this, _hideProcessingState, hideProcessingState_fn).call(this);
      }
    }
    /**
     * Process an express checkout payment
     * @param {string} method - Payment method ('paypal', 'apple_pay', 'google_pay')
     */
    processExpressCheckout(method) {
      __privateMethod(this, _safeLog2, safeLog_fn2).call(this, "info", `Processing ${method} express checkout`);
      let button;
      switch (method) {
        case "paypal":
          button = __privateGet(this, _expressCheckoutButtons).paypal;
          break;
        case "apple_pay":
          button = __privateGet(this, _expressCheckoutButtons).applePay;
          break;
        case "google_pay":
          button = __privateGet(this, _expressCheckoutButtons).googlePay;
          break;
        default:
          __privateMethod(this, _safeLog2, safeLog_fn2).call(this, "error", `Unknown express checkout method: ${method}`);
          return;
      }
      __privateMethod(this, _setExpressButtonProcessing, setExpressButtonProcessing_fn).call(this, button, true);
      try {
        const cart = __privateGet(this, _app3).state.getState("cart");
        if (!cart || !cart.items || cart.items.length === 0) {
          __privateMethod(this, _safeLog2, safeLog_fn2).call(this, "error", `Cannot process ${method} checkout: cart is empty`);
          __privateMethod(this, _handleExpressCheckoutError, handleExpressCheckoutError_fn).call(this, "Your cart is empty. Please add items to your cart before checking out.", button);
          return;
        }
        const orderData = {
          lines: cart.items.map((item) => ({
            package_id: item.id,
            quantity: item.quantity || 1,
            is_upsell: !!item.is_upsell
          })),
          payment_detail: {
            payment_method: method
          },
          attribution: __privateGet(this, _app3).attribution?.getAttributionData() || cart.attribution || {},
          shipping_method: (cart.shippingMethod?.id || 1).toString()
        };
        if (__privateGet(this, _apiClient)) {
          const nextPageUrl = __privateGet(this, _apiClient).getNextPageUrlFromMeta();
          if (nextPageUrl) {
            orderData.success_url = nextPageUrl;
            __privateMethod(this, _safeLog2, safeLog_fn2).call(this, "debug", `Express checkout success URL set from meta tag: ${nextPageUrl}`);
          } else {
            __privateMethod(this, _safeLog2, safeLog_fn2).call(this, "debug", "No meta tag found for express checkout success_url, API will use order_status_url");
          }
        }
        const currentUrl = new URL(window.location.href);
        currentUrl.searchParams.set("payment_failed", "true");
        currentUrl.searchParams.set("payment_method", method);
        orderData.payment_failed_url = currentUrl.href;
        __privateMethod(this, _safeLog2, safeLog_fn2).call(this, "debug", `Express checkout payment_failed_url set to: ${orderData.payment_failed_url}`);
        if (cart.vouchers && cart.vouchers.length > 0) {
          orderData.vouchers = cart.vouchers.map((voucher) => voucher.code || voucher);
        }
        __privateMethod(this, _safeLog2, safeLog_fn2).call(this, "debug", "Express checkout order data:", orderData);
        __privateGet(this, _apiClient).createOrder(orderData).then((response) => {
          __privateMethod(this, _safeLog2, safeLog_fn2).call(this, "debug", `${method} express checkout order created:`, response);
          if (response.payment_complete_url) {
            __privateGet(this, _app3).triggerEvent("express.checkout.started", {
              method,
              order: response
            });
            window.location.href = response.payment_complete_url;
          } else {
            throw new Error("No payment URL returned from API");
          }
        }).catch((error) => {
          __privateMethod(this, _safeLog2, safeLog_fn2).call(this, "error", `${method} express checkout error:`, error);
          __privateMethod(this, _handleExpressCheckoutError, handleExpressCheckoutError_fn).call(this, `There was an error processing your ${method.replace("_", " ")} payment. Please try again or use a different payment method.`, button);
        });
      } catch (error) {
        __privateMethod(this, _safeLog2, safeLog_fn2).call(this, "error", `Error in ${method} express checkout:`, error);
        __privateMethod(this, _handleExpressCheckoutError, handleExpressCheckoutError_fn).call(this, "An unexpected error occurred. Please try again.", button);
      }
    }
    /**
     * Reset processing state for all express checkout buttons
     */
    resetExpressButtons() {
      __privateMethod(this, _setExpressButtonProcessing, setExpressButtonProcessing_fn).call(this, __privateGet(this, _expressCheckoutButtons).paypal, false);
      __privateMethod(this, _setExpressButtonProcessing, setExpressButtonProcessing_fn).call(this, __privateGet(this, _expressCheckoutButtons).applePay, false);
      __privateMethod(this, _setExpressButtonProcessing, setExpressButtonProcessing_fn).call(this, __privateGet(this, _expressCheckoutButtons).googlePay, false);
    }
  };
  _apiClient = new WeakMap();
  _logger5 = new WeakMap();
  _app3 = new WeakMap();
  _form3 = new WeakMap();
  _spreedlyManager = new WeakMap();
  _formValidator = new WeakMap();
  _paymentMethod = new WeakMap();
  _isProcessing = new WeakMap();
  _debugMode3 = new WeakMap();
  _testCards = new WeakMap();
  _expressCheckoutButtons = new WeakMap();
  _deviceSupport = new WeakMap();
  _getCheckoutForm = new WeakSet();
  getCheckoutForm_fn = function() {
    const form = document.querySelector('form[os-checkout="form"]') || document.querySelector("form#combo_form");
    if (!form) {
      __privateMethod(this, _safeLog2, safeLog_fn2).call(this, "warn", "No checkout form found");
    }
    return form;
  };
  _setupFormPrevention = new WeakSet();
  setupFormPrevention_fn = function() {
    __privateGet(this, _form3).removeAttribute("action");
    __privateGet(this, _form3).setAttribute("method", "post");
    const hiddenInput = document.createElement("input");
    hiddenInput.type = "hidden";
    hiddenInput.name = "prevent_serialization";
    hiddenInput.value = "true";
    __privateGet(this, _form3).appendChild(hiddenInput);
    __privateGet(this, _form3).addEventListener("submit", __privateMethod(this, _preventFormSubmission, preventFormSubmission_fn).bind(this), true);
    __privateGet(this, _form3).onsubmit = __privateMethod(this, _preventFormSubmission, preventFormSubmission_fn).bind(this);
    __privateMethod(this, _convertSubmitButtons, convertSubmitButtons_fn).call(this);
  };
  _preventFormSubmission = new WeakSet();
  preventFormSubmission_fn = function(e) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
    }
    __privateGet(this, _form3).removeAttribute("action");
    __privateGet(this, _form3).setAttribute("method", "post");
    window.stop?.();
    __privateMethod(this, _safeLog2, safeLog_fn2).call(this, "debug", "Form submission prevented");
    return false;
  };
  _convertSubmitButtons = new WeakSet();
  convertSubmitButtons_fn = function() {
    try {
      const submitButtons = __privateGet(this, _form3).querySelectorAll('button[type="submit"], input[type="submit"]');
      submitButtons.forEach((button, index) => {
        button.setAttribute("type", "button");
        button.addEventListener("click", (e) => {
          e.preventDefault();
          __privateMethod(this, _safeLog2, safeLog_fn2).call(this, "debug", `Submit button ${index + 1} clicked`);
          this.processPayment();
        });
      });
    } catch (error) {
      __privateMethod(this, _safeLog2, safeLog_fn2).call(this, "error", "Error converting submit buttons:", error);
    }
  };
  _setupCheckoutButton = new WeakSet();
  setupCheckoutButton_fn = function() {
    const checkoutButton = document.querySelector('[os-checkout-payment="combo"]');
    if (!checkoutButton) {
      __privateMethod(this, _safeLog2, safeLog_fn2).call(this, "warn", "Checkout button not found");
      return;
    }
    const newButton = checkoutButton.cloneNode(true);
    checkoutButton.parentNode.replaceChild(newButton, checkoutButton);
    newButton.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      __privateGet(this, _form3).onsubmit = __privateMethod(this, _preventFormSubmission, preventFormSubmission_fn).bind(this);
      __privateGet(this, _form3).removeAttribute("action");
      __privateGet(this, _form3).setAttribute("method", "post");
      __privateMethod(this, _safeLog2, safeLog_fn2).call(this, "debug", "Checkout button clicked");
      setTimeout(() => this.processPayment(), 0);
    });
  };
  _safeLog2 = new WeakSet();
  safeLog_fn2 = function(level, message, ...args) {
    try {
      const logFn = __privateGet(this, _logger5)?.[level] || console[level] || console.log;
      logFn.call(console, `[${level.toUpperCase()}] ${message}`, ...args);
    } catch (error) {
      console.error("Error logging:", error);
    }
  };
  _initPaymentMethods = new WeakSet();
  initPaymentMethods_fn = function() {
    try {
      const paymentMethodSelector = document.querySelector('[os-checkout-field="payment-method"]') || document.querySelector('input[name="combo_mode"]:checked');
      if (!paymentMethodSelector) {
        __privateMethod(this, _safeLog2, safeLog_fn2).call(this, "warn", "Payment method selector not found");
        return;
      }
      __privateSet(this, _paymentMethod, paymentMethodSelector.value || "credit-card");
      __privateMethod(this, _setupPaymentMethodListeners, setupPaymentMethodListeners_fn).call(this);
    } catch (error) {
      __privateMethod(this, _safeLog2, safeLog_fn2).call(this, "error", "Error initializing payment methods:", error);
    }
  };
  _setupPaymentMethodListeners = new WeakSet();
  setupPaymentMethodListeners_fn = function() {
    const radioButtons = document.querySelectorAll('input[name="combo_mode"]');
    const handler = (e) => {
      __privateSet(this, _paymentMethod, e.target.value);
      __privateMethod(this, _safeLog2, safeLog_fn2).call(this, "debug", `Payment method changed to: ${__privateGet(this, _paymentMethod)}`);
      document.dispatchEvent(new CustomEvent("payment-method-changed", {
        detail: { mode: __privateGet(this, _paymentMethod) }
      }));
    };
    if (radioButtons.length > 0) {
      radioButtons.forEach((radio) => radio.addEventListener("change", handler));
    } else {
      document.querySelector('[os-checkout-field="payment-method"]')?.addEventListener("change", handler);
    }
  };
  _initSpreedly = new WeakSet();
  initSpreedly_fn = function() {
    try {
      const environmentKey = document.querySelector('meta[name="spreedly-environment-key"]')?.content || document.querySelector('meta[name="os-payment-env-key"]')?.content;
      if (!environmentKey) {
        __privateMethod(this, _safeLog2, safeLog_fn2).call(this, "warn", "Spreedly environment key not found");
        return;
      }
      __privateSet(this, _spreedlyManager, new SpreedlyManager(environmentKey, {
        debug: __privateGet(this, _debugMode3),
        app: __privateGet(this, _app3)
      }));
      __privateMethod(this, _setupSpreedlyCallbacks, setupSpreedlyCallbacks_fn).call(this);
      __privateMethod(this, _initializeExpirationFields, initializeExpirationFields_fn).call(this);
    } catch (error) {
      __privateMethod(this, _safeLog2, safeLog_fn2).call(this, "error", "Error initializing Spreedly:", error);
    }
  };
  _setupSpreedlyCallbacks = new WeakSet();
  setupSpreedlyCallbacks_fn = function() {
    __privateGet(this, _spreedlyManager).setOnReady(() => __privateMethod(this, _safeLog2, safeLog_fn2).call(this, "debug", "Spreedly ready"));
    __privateGet(this, _spreedlyManager).setOnError((errors) => {
      __privateMethod(this, _safeLog2, safeLog_fn2).call(this, "error", "Spreedly errors:", errors);
      __privateSet(this, _isProcessing, false);
      __privateMethod(this, _hideProcessingState, hideProcessingState_fn).call(this);
      const errorMessage = __privateMethod(this, _formatSpreedlyErrors, formatSpreedlyErrors_fn).call(this, errors);
      __privateMethod(this, _handlePaymentError, handlePaymentError_fn).call(this, errorMessage);
    });
    __privateGet(this, _spreedlyManager).setOnPaymentMethod((token, pmData) => {
      __privateMethod(this, _safeLog2, safeLog_fn2).call(this, "debug", "Spreedly payment method token received:", token);
      __privateMethod(this, _createOrder, createOrder_fn).call(this, {
        payment_token: token,
        payment_method: "credit-card",
        ...__privateMethod(this, _getOrderData, getOrderData_fn).call(this)
      });
    });
  };
  _formatSpreedlyErrors = new WeakSet();
  formatSpreedlyErrors_fn = function(errors) {
    if (!errors || errors.length === 0) {
      return "An unknown error occurred with your payment method";
    }
    const errorMap = {
      "The card number is not a valid credit card number": "Please enter a valid credit card number",
      "Credit card number entered is not valid": "Please enter a valid credit card number",
      "The card number is too short": "The card number you entered is too short",
      "The card number is too long": "The card number you entered is too long",
      "The card security code is invalid": "Please enter a valid security code (CVV)",
      "The card security code is too short": "The security code (CVV) is too short",
      "The card security code is too long": "The security code (CVV) is too long",
      "The card has expired": "This card has expired. Please use a different card",
      "The card expiration month is invalid": "Please select a valid expiration month",
      "The card expiration year is invalid": "Please select a valid expiration year"
    };
    for (const error of errors) {
      for (const [key, value] of Object.entries(errorMap)) {
        if (error.includes(key)) {
          return value;
        }
      }
    }
    return errors[0];
  };
  _initializeExpirationFields = new WeakSet();
  initializeExpirationFields_fn = function() {
    try {
      const [monthSelect, yearSelect] = __privateMethod(this, _getExpirationElements, getExpirationElements_fn).call(this);
      __privateMethod(this, _populateExpirationOptions, populateExpirationOptions_fn).call(this, monthSelect, yearSelect);
    } catch (error) {
      __privateMethod(this, _safeLog2, safeLog_fn2).call(this, "error", "Error initializing expiration fields:", error);
    }
  };
  _getExpirationElements = new WeakSet();
  getExpirationElements_fn = function() {
    const monthSelectors = ['[os-checkout-field="cc-month"]', '[os-checkout-field="exp-month"]', "#credit_card_exp_month"];
    const yearSelectors = ['[os-checkout-field="cc-year"]', '[os-checkout-field="exp-year"]', "#credit_card_exp_year"];
    return [
      monthSelectors.map((s) => document.querySelector(s)).find(Boolean),
      yearSelectors.map((s) => document.querySelector(s)).find(Boolean)
    ];
  };
  _populateExpirationOptions = new WeakSet();
  populateExpirationOptions_fn = function(monthSelect, yearSelect) {
    if (monthSelect) {
      monthSelect.innerHTML = '<option value="">Month</option>';
      for (let i = 1; i <= 12; i++) {
        const month = i.toString().padStart(2, "0");
        monthSelect.appendChild(new Option(month, month));
      }
    }
    if (yearSelect) {
      yearSelect.innerHTML = '<option value="">Year</option>';
      const currentYear = (/* @__PURE__ */ new Date()).getFullYear();
      for (let i = 0; i < 20; i++) {
        const year = currentYear + i;
        yearSelect.appendChild(new Option(year, year));
      }
    }
  };
  _isTestMode = new WeakSet();
  isTestMode_fn = function() {
    return new URLSearchParams(window.location.search).get("test") === "true" || KonamiCodeHandler.isTestMode();
  };
  _enforceFormPrevention = new WeakSet();
  enforceFormPrevention_fn = function() {
    __privateGet(this, _form3)?.removeAttribute("action");
    __privateGet(this, _form3)?.setAttribute("method", "post");
    __privateGet(this, _form3).onsubmit = __privateMethod(this, _preventFormSubmission, preventFormSubmission_fn).bind(this);
    __privateGet(this, _form3)?.querySelectorAll('button[type="submit"], input[type="submit"]').forEach((btn) => {
      btn.disabled = true;
      btn.setAttribute("type", "button");
    });
  };
  _showProcessingState = new WeakSet();
  showProcessingState_fn = function() {
    const submitButton = document.querySelector('[os-checkout-payment="combo"]');
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.classList.add("is-submitting");
    }
  };
  _hideProcessingState = new WeakSet();
  hideProcessingState_fn = function() {
    const submitButton = document.querySelector('[os-checkout-payment="combo"]');
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.classList.remove("is-submitting");
    }
    __privateSet(this, _isProcessing, false);
  };
  _processCreditCard = new WeakSet();
  processCreditCard_fn = function() {
    if (!__privateGet(this, _spreedlyManager)) {
      __privateMethod(this, _handlePaymentError, handlePaymentError_fn).call(this, "Credit card processing unavailable");
      return;
    }
    const [fullName, month, year] = __privateMethod(this, _getCreditCardFields, getCreditCardFields_fn).call(this);
    if (__privateMethod(this, _isDebugTestCardMode, isDebugTestCardMode_fn).call(this) || __privateMethod(this, _isTestMode, isTestMode_fn).call(this)) {
      __privateMethod(this, _processTestCard, processTestCard_fn).call(this, fullName, month, year);
      return;
    }
    if (!__privateGet(this, _formValidator).validateCreditCard()) {
      __privateMethod(this, _safeLog2, safeLog_fn2).call(this, "debug", "Credit card validation failed on initial check");
      if (!month || !year) {
        __privateSet(this, _isProcessing, false);
        __privateMethod(this, _hideProcessingState, hideProcessingState_fn).call(this);
        return;
      }
    }
    __privateGet(this, _spreedlyManager).tokenizeCard({
      full_name: fullName || "",
      month,
      year
    });
    __privateGet(this, _spreedlyManager).setOnPaymentMethod((token, pmData) => {
      __privateMethod(this, _createOrder, createOrder_fn).call(this, {
        payment_token: token,
        payment_method: "credit-card",
        ...__privateMethod(this, _getOrderData, getOrderData_fn).call(this)
      });
    });
  };
  _getCreditCardFields = new WeakSet();
  getCreditCardFields_fn = function() {
    const isDifferentBilling = !__privateGet(this, _formValidator).isSameAsShipping();
    const firstName = document.querySelector(`[os-checkout-field="${isDifferentBilling ? "billing-fname" : "fname"}"]`)?.value || "";
    const lastName = document.querySelector(`[os-checkout-field="${isDifferentBilling ? "billing-lname" : "lname"}"]`)?.value || "";
    const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    const fullName = `${capitalize(firstName)} ${capitalize(lastName)}`.trim();
    return [
      fullName,
      document.querySelector('[os-checkout-field="cc-month"]')?.value || document.querySelector('[os-checkout-field="exp-month"]')?.value || document.querySelector("#credit_card_exp_month")?.value || "",
      document.querySelector('[os-checkout-field="cc-year"]')?.value || document.querySelector('[os-checkout-field="exp-year"]')?.value || document.querySelector("#credit_card_exp_year")?.value || ""
    ];
  };
  _isDebugTestCardMode = new WeakSet();
  isDebugTestCardMode_fn = function() {
    const params = new URLSearchParams(window.location.search);
    return (__privateGet(this, _debugMode3) || params.get("debug") === "true") && params.has("test-card");
  };
  _processTestCard = new WeakSet();
  processTestCard_fn = function(fullName, month, year) {
    const cardNumber = document.querySelector('[os-checkout-field="cc-number"]')?.value || document.querySelector("#credit_card_number")?.value;
    if (!cardNumber) {
      __privateMethod(this, _handlePaymentError, handlePaymentError_fn).call(this, "Please enter a credit card number");
      return;
    }
    __privateMethod(this, _createOrder, createOrder_fn).call(this, {
      payment_token: `test_card_token_${Date.now()}`,
      payment_method: "credit-card",
      test_card_number: cardNumber,
      ...__privateMethod(this, _getOrderData, getOrderData_fn).call(this)
    });
  };
  _processPaypal = new WeakSet();
  processPaypal_fn = function() {
    __privateMethod(this, _createOrder, createOrder_fn).call(this, {
      payment_method: "paypal",
      ...__privateMethod(this, _getOrderData, getOrderData_fn).call(this)
    });
  };
  _getPackageIdFromUrl = new WeakSet();
  getPackageIdFromUrl_fn = function() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("package_id") || params.get("pid");
    return id ? parseInt(id, 10) || null : null;
  };
  _getOrderData = new WeakSet();
  getOrderData_fn = function() {
    try {
      const shippingData = __privateMethod(this, _getAddressData, getAddressData_fn).call(this, ["fname", "lname", "address1", "address2", "city", "province", "postal", "country", "phone"]);
      const billingData = __privateGet(this, _formValidator).isSameAsShipping() ? null : __privateMethod(this, _getAddressData, getAddressData_fn).call(this, ["billing-fname", "billing-lname", "billing-address1", "billing-address2", "billing-city", "billing-province", "billing-postal", "billing-country", "billing-phone"]);
      const shippingAddress = __privateMethod(this, _formatAddress, formatAddress_fn).call(this, shippingData);
      const billingAddress = billingData ? __privateMethod(this, _formatAddress, formatAddress_fn).call(this, billingData) : { ...shippingAddress };
      if (!__privateGet(this, _app3)?.state) {
        __privateMethod(this, _handlePaymentError, handlePaymentError_fn).call(this, "Cart data missing");
        return null;
      }
      const state = __privateGet(this, _app3).state.getState();
      if (!state.cart?.items?.length) {
        __privateMethod(this, _handlePaymentError, handlePaymentError_fn).call(this, "Cart is empty");
        return null;
      }
      return {
        user: {
          email: state.user?.email || "",
          first_name: state.user?.firstName || shippingAddress.first_name,
          last_name: state.user?.lastName || shippingAddress.last_name
        },
        shipping_address: shippingAddress,
        billing_address: billingAddress,
        shipping_method: __privateMethod(this, _getShippingMethod, getShippingMethod_fn).call(this, state),
        attribution: state.cart.attribution || {},
        lines: __privateMethod(this, _getCartLines, getCartLines_fn).call(this, state.cart.items)
      };
    } catch (error) {
      __privateMethod(this, _safeLog2, safeLog_fn2).call(this, "error", "Error getting order data:", error);
      __privateMethod(this, _handlePaymentError, handlePaymentError_fn).call(this, "Error preparing order");
      return null;
    }
  };
  _getAddressData = new WeakSet();
  getAddressData_fn = function(fields) {
    const data = {};
    fields.forEach((field) => {
      const value = document.querySelector(`[os-checkout-field="${field}"]`)?.value;
      if (value)
        data[field.replace("billing-", "")] = value;
    });
    return data;
  };
  _formatAddress = new WeakSet();
  formatAddress_fn = function(data) {
    return {
      first_name: data.fname || "",
      last_name: data.lname || "",
      line1: data.address1 || "",
      line2: data.address2 || "",
      line3: "",
      line4: data.city || "",
      state: data.province || "",
      postcode: data.postal || "",
      country: data.country || "",
      phone_number: data.phone || ""
    };
  };
  _getShippingMethod = new WeakSet();
  getShippingMethod_fn = function(state) {
    const method = state.cart?.shippingMethod;
    return typeof method === "number" ? method : parseInt(method, 10) || 1;
  };
  _getCartLines = new WeakSet();
  getCartLines_fn = function(items) {
    return items.map((item) => {
      let packageId = parseInt(item.id || item.external_id, 10) || __privateMethod(this, _getPackageIdFromUrl, getPackageIdFromUrl_fn).call(this);
      if (!packageId)
        throw new Error(`Invalid package ID for item: ${item.name}`);
      const lineItem = {
        package_id: packageId,
        quantity: item.quantity || 1
      };
      if (item.is_upsell === true) {
        lineItem.is_upsell = true;
        __privateMethod(this, _safeLog2, safeLog_fn2).call(this, "debug", `Adding line item with is_upsell=true: ${packageId}`);
      }
      return lineItem;
    });
  };
  _createOrder = new WeakSet();
  createOrder_fn = function(orderData) {
    if (!orderData || !__privateGet(this, _apiClient)) {
      __privateMethod(this, _handlePaymentError, handlePaymentError_fn).call(this, "Cannot create order");
      __privateMethod(this, _hideProcessingState, hideProcessingState_fn).call(this);
      return;
    }
    __privateMethod(this, _enforceFormPrevention, enforceFormPrevention_fn).call(this);
    const formattedOrderData = __privateMethod(this, _formatOrderData, formatOrderData_fn).call(this, orderData);
    __privateGet(this, _apiClient).createOrder(formattedOrderData).then((response) => __privateMethod(this, _handleOrderSuccess, handleOrderSuccess_fn).call(this, response)).catch((error) => __privateMethod(this, _handlePaymentError, handlePaymentError_fn).call(this, __privateMethod(this, _formatErrorMessage, formatErrorMessage_fn).call(this, error))).finally(() => __privateMethod(this, _hideProcessingState, hideProcessingState_fn).call(this));
  };
  _formatOrderData = new WeakSet();
  formatOrderData_fn = function(orderData) {
    const formatted = { ...orderData };
    if (!formatted.success_url && __privateGet(this, _apiClient)) {
      const nextPageUrl = __privateGet(this, _apiClient).getNextPageUrlFromMeta(orderData.ref_id);
      if (nextPageUrl) {
        formatted.success_url = nextPageUrl;
      }
    }
    if (!formatted.payment_failed_url) {
      const currentUrl = new URL(window.location.href);
      currentUrl.searchParams.set("payment_failed", "true");
      if (orderData.payment_method) {
        currentUrl.searchParams.set("payment_method", orderData.payment_method);
      } else if (formatted.payment_detail?.payment_method) {
        currentUrl.searchParams.set("payment_method", formatted.payment_detail.payment_method);
      }
      formatted.payment_failed_url = currentUrl.href;
      __privateMethod(this, _safeLog2, safeLog_fn2).call(this, "debug", `Set payment_failed_url to: ${formatted.payment_failed_url}`);
    }
    if (orderData.payment_token) {
      formatted.payment_detail = { card_token: orderData.payment_token };
      delete formatted.payment_token;
    }
    if (orderData.payment_method) {
      formatted.payment_detail = formatted.payment_detail || {};
      formatted.payment_detail.payment_method = {
        "credit-card": "card_token",
        "credit": "card_token",
        "paypal": "paypal"
      }[orderData.payment_method] || orderData.payment_method;
      delete formatted.payment_method;
    }
    formatted.shipping_method = parseInt(formatted.shipping_method, 10) || 1;
    formatted.billing_address = formatted.billing_address || formatted.shipping_address;
    return formatted;
  };
  _formatErrorMessage = new WeakSet();
  formatErrorMessage_fn = function(error) {
    try {
      const errorData = JSON.parse(error.message);
      if (errorData?.payment_details) {
        return __privateMethod(this, _formatPaymentErrorMessage, formatPaymentErrorMessage_fn).call(this, errorData);
      }
      if (errorData?.message) {
        return `Order creation failed: ${Array.isArray(errorData.message) ? errorData.message.map((e) => Object.entries(e).map(([k, v]) => `${k}: ${v}`).join(", ")).join(", ") : Object.entries(errorData.message).map(([k, v]) => `${k}: ${v}`).join(", ")}`;
      }
    } catch {
      return error.message || "Unknown error";
    }
    return "Order creation failed";
  };
  _formatPaymentErrorMessage = new WeakSet();
  formatPaymentErrorMessage_fn = function(errorData) {
    const errorCode = errorData.payment_response_code;
    const errorDetails = errorData.payment_details;
    const errorMessages = {
      "3005": "The card number you entered is invalid. Please check and try again.",
      "3006": "The card expiration date is invalid. Please check and try again.",
      "3007": "The card security code (CVV) is invalid. Please check and try again.",
      "3008": "The card has been declined. Please try another payment method.",
      "3009": "This card has expired. Please use a different card.",
      "3010": "The card has insufficient funds. Please try another payment method."
    };
    return errorMessages[errorCode] || errorDetails || "There was a problem processing your payment. Please try again.";
  };
  _handlePaymentError = new WeakSet();
  handlePaymentError_fn = function(message) {
    __privateMethod(this, _hideProcessingState, hideProcessingState_fn).call(this);
    __privateMethod(this, _clearPaymentErrors, clearPaymentErrors_fn).call(this);
    const isCreditCardError = __privateGet(this, _paymentMethod) === "credit-card" && (message.includes("card") || message.includes("Card") || message.includes("CVV"));
    if (isCreditCardError) {
      __privateMethod(this, _displayCreditCardError, displayCreditCardError_fn).call(this, message);
    }
    const spreedlyErrorContainer = document.querySelector('[os-checkout-element="spreedly-error"]');
    if (spreedlyErrorContainer) {
      const errorMessageElement = spreedlyErrorContainer.querySelector('[data-os-message="error"]');
      if (errorMessageElement) {
        errorMessageElement.textContent = message;
        spreedlyErrorContainer.style.display = "flex";
      }
    } else {
      const errorContainer = document.querySelector('[os-checkout-element="payment-error"]');
      if (errorContainer) {
        errorContainer.textContent = message;
        errorContainer.style.display = "block";
        errorContainer.scrollIntoView({ behavior: "smooth", block: "center" });
      } else {
        alert(`Payment Error: ${message}`);
      }
    }
  };
  _displayCreditCardError = new WeakSet();
  displayCreditCardError_fn = function(message) {
    let fieldSelector = '[os-checkout-field="cc-number"]';
    let fieldId = "#credit_card_number";
    if (message.toLowerCase().includes("cvv") || message.toLowerCase().includes("security code")) {
      fieldSelector = '[os-checkout-field="cc-cvv"]';
      fieldId = "#credit_card_cvv";
    } else if (message.toLowerCase().includes("expiration") || message.toLowerCase().includes("expired")) {
      fieldSelector = '[os-checkout-field="cc-month"], [os-checkout-field="cc-year"]';
      fieldId = "#credit_card_exp_month, #credit_card_exp_year";
    }
    const fieldSelectors = fieldSelector.split(",").map((s) => s.trim());
    const idSelectors = fieldId.split(",").map((s) => s.trim());
    [...fieldSelectors, ...idSelectors].forEach((selector) => {
      const field = document.querySelector(selector);
      if (!field)
        return;
      const container = field.closest(".form-group") || field.parentElement;
      if (!container)
        return;
      field.classList.add("is-invalid");
      let errorElement = container.querySelector(".invalid-feedback");
      if (!errorElement) {
        errorElement = document.createElement("div");
        errorElement.className = "invalid-feedback";
        container.appendChild(errorElement);
      }
      errorElement.textContent = message;
      errorElement.style.display = "block";
    });
    const firstErrorField = document.querySelector(fieldSelectors[0]) || document.querySelector(idSelectors[0]);
    if (firstErrorField) {
      firstErrorField.focus();
      firstErrorField.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };
  _clearPaymentErrors = new WeakSet();
  clearPaymentErrors_fn = function() {
    const ccFieldSelectors = [
      '[os-checkout-field="cc-number"]',
      "#credit_card_number",
      '[os-checkout-field="cc-cvv"]',
      "#credit_card_cvv",
      '[os-checkout-field="cc-month"]',
      "#credit_card_exp_month",
      '[os-checkout-field="cc-year"]',
      "#credit_card_exp_year"
    ];
    ccFieldSelectors.forEach((selector) => {
      const field = document.querySelector(selector);
      if (!field)
        return;
      field.classList.remove("is-invalid");
      const container = field.closest(".form-group") || field.parentElement;
      if (container) {
        const errorElement = container.querySelector(".invalid-feedback");
        if (errorElement) {
          errorElement.style.display = "none";
        }
      }
    });
    const errorContainer = document.querySelector('[os-checkout-element="payment-error"]');
    if (errorContainer) {
      errorContainer.style.display = "none";
    }
  };
  _handleOrderSuccess = new WeakSet();
  handleOrderSuccess_fn = function(orderData) {
    sessionStorage.setItem("order_reference", orderData.ref_id);
    __privateGet(this, _app3)?.triggerEvent?.("order.created", orderData);
    if (orderData.payment_complete_url) {
      __privateMethod(this, _safeLog2, safeLog_fn2).call(this, "debug", `Redirecting to payment gateway: ${orderData.payment_complete_url}`);
      window.location.href = orderData.payment_complete_url;
      return;
    }
    const redirectUrl = __privateMethod(this, _getRedirectUrl, getRedirectUrl_fn).call(this, orderData);
    window.location.href = redirectUrl;
  };
  _getRedirectUrl = new WeakSet();
  getRedirectUrl_fn = function(orderData) {
    if (__privateGet(this, _apiClient)) {
      return __privateGet(this, _apiClient).getNextUrlFromOrderResponse(orderData);
    }
    const metaUrl = document.querySelector('meta[name="os-next-page"]')?.content;
    if (metaUrl) {
      const url = metaUrl.startsWith("http") ? metaUrl : new URL(metaUrl, window.location.origin).href;
      return `${url}${url.includes("?") ? "&" : "?"}ref_id=${orderData.ref_id}`;
    }
    if (orderData.order_status_url) {
      return orderData.order_status_url;
    }
    return orderData.confirmation_url || `${window.location.origin}/checkout/confirmation/?ref_id=${orderData.ref_id}`;
  };
  _initExpressCheckout = new WeakSet();
  initExpressCheckout_fn = function() {
    try {
      __privateMethod(this, _detectDeviceSupport, detectDeviceSupport_fn).call(this);
      const paypalButton = document.querySelector('[os-checkout-payment="paypal"]');
      if (paypalButton) {
        paypalButton.addEventListener("click", (e) => {
          e.preventDefault();
          this.processExpressCheckout("paypal");
        });
        __privateGet(this, _expressCheckoutButtons).paypal = paypalButton;
      }
      if (__privateGet(this, _deviceSupport).applePay) {
        const applePayButton = document.querySelector('[os-checkout-payment="apple-pay"]');
        if (applePayButton) {
          applePayButton.addEventListener("click", (e) => {
            e.preventDefault();
            this.processExpressCheckout("apple_pay");
          });
          __privateGet(this, _expressCheckoutButtons).applePay = applePayButton;
        }
      } else {
        const applePayBtn = document.querySelector('[os-checkout-payment="apple-pay"]');
        if (applePayBtn) {
          applePayBtn.style.display = "none";
        }
      }
      if (__privateGet(this, _deviceSupport).googlePay) {
        const googlePayButton = document.querySelector('[os-checkout-payment="google-pay"]');
        if (googlePayButton) {
          googlePayButton.addEventListener("click", (e) => {
            e.preventDefault();
            this.processExpressCheckout("google_pay");
          });
          __privateGet(this, _expressCheckoutButtons).googlePay = googlePayButton;
        }
      } else {
        const googlePayBtn = document.querySelector('[os-checkout-payment="google-pay"]');
        if (googlePayBtn) {
          googlePayBtn.style.display = "none";
        }
      }
      if (!__privateMethod(this, _hasActiveExpressButtons, hasActiveExpressButtons_fn).call(this)) {
        const container = document.querySelector('[os-checkout-container="express-checkout"]');
        if (container) {
          container.style.display = "none";
        }
      }
    } catch (error) {
      __privateMethod(this, _safeLog2, safeLog_fn2).call(this, "error", "Error initializing express checkout:", error);
    }
  };
  _detectDeviceSupport = new WeakSet();
  detectDeviceSupport_fn = function() {
    if (window.ApplePaySession && window.ApplePaySession.canMakePayments) {
      __privateGet(this, _deviceSupport).applePay = window.ApplePaySession.canMakePayments();
      __privateMethod(this, _safeLog2, safeLog_fn2).call(this, "debug", `Apple Pay support: ${__privateGet(this, _deviceSupport).applePay}`);
    }
    __privateGet(this, _deviceSupport).googlePay = !!(window.chrome && window.chrome.runtime);
    __privateMethod(this, _safeLog2, safeLog_fn2).call(this, "debug", `Google Pay support: ${__privateGet(this, _deviceSupport).googlePay}`);
  };
  _hasActiveExpressButtons = new WeakSet();
  hasActiveExpressButtons_fn = function() {
    return !!(__privateGet(this, _expressCheckoutButtons).paypal || __privateGet(this, _expressCheckoutButtons).applePay || __privateGet(this, _expressCheckoutButtons).googlePay);
  };
  _setExpressButtonProcessing = new WeakSet();
  setExpressButtonProcessing_fn = function(button, isProcessing) {
    if (!button)
      return;
    if (isProcessing) {
      button.setAttribute("disabled", "disabled");
      button.classList.add("processing");
      if (!button.dataset.originalHtml) {
        button.dataset.originalHtml = button.innerHTML;
        const loadingSpinner = document.createElement("div");
        loadingSpinner.className = "payment-btn-spinner";
        loadingSpinner.innerHTML = '<div class="spinner"></div>';
        button.innerHTML = "";
        button.appendChild(loadingSpinner);
      }
    } else {
      button.removeAttribute("disabled");
      button.classList.remove("processing");
      if (button.dataset.originalHtml) {
        button.innerHTML = button.dataset.originalHtml;
        delete button.dataset.originalHtml;
      }
    }
  };
  _handleExpressCheckoutError = new WeakSet();
  handleExpressCheckoutError_fn = function(message, button) {
    __privateMethod(this, _setExpressButtonProcessing, setExpressButtonProcessing_fn).call(this, button, false);
    const container = document.querySelector(".express-checkout-wrapper");
    if (!container)
      return;
    let errorContainer = container.querySelector(".express-checkout-error");
    if (!errorContainer) {
      errorContainer = document.createElement("div");
      errorContainer.className = "express-checkout-error";
      container.appendChild(errorContainer);
    }
    errorContainer.textContent = message;
    errorContainer.style.display = "block";
    setTimeout(() => {
      errorContainer.style.display = "none";
    }, 5e3);
    __privateGet(this, _app3).triggerEvent("express.checkout.error", { message });
  };
  _checkForPaymentFailedParameters = new WeakSet();
  checkForPaymentFailedParameters_fn = function() {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const paymentFailed = urlParams.get("payment_failed");
      if (paymentFailed === "true") {
        const paymentMethod = urlParams.get("payment_method");
        let errorMessage = "Your payment could not be processed. Please try again or use a different payment method.";
        if (paymentMethod) {
          const methodDisplay = {
            "paypal": "PayPal",
            "apple_pay": "Apple Pay",
            "google_pay": "Google Pay",
            "card_token": "credit card",
            "credit-card": "credit card",
            "credit": "credit card"
          }[paymentMethod] || paymentMethod;
          errorMessage = `Your ${methodDisplay} payment could not be processed. Please try again or use a different payment method.`;
        }
        const isExpressCheckout = ["paypal", "apple_pay", "google_pay"].includes(paymentMethod);
        if (isExpressCheckout) {
          __privateMethod(this, _displayTopBannerError, displayTopBannerError_fn).call(this, errorMessage, paymentMethod);
        } else {
          __privateMethod(this, _handlePaymentError, handlePaymentError_fn).call(this, errorMessage);
        }
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.delete("payment_failed");
        newUrl.searchParams.delete("payment_method");
        window.history.replaceState({}, document.title, newUrl.href);
      }
    } catch (error) {
      __privateMethod(this, _safeLog2, safeLog_fn2).call(this, "error", "Error checking payment failed parameters:", error);
    }
  };
  _displayTopBannerError = new WeakSet();
  displayTopBannerError_fn = function(message, method) {
    try {
      let errorBanner = document.querySelector('[os-checkout-element="top-error-banner"]');
      if (!errorBanner) {
        errorBanner = document.createElement("div");
        errorBanner.setAttribute("os-checkout-element", "top-error-banner");
        errorBanner.className = "checkout-error-banner";
        errorBanner.style.width = "100%";
        errorBanner.style.padding = "12px 16px";
        errorBanner.style.backgroundColor = "#fff3cd";
        errorBanner.style.color = "#856404";
        errorBanner.style.borderRadius = "4px";
        errorBanner.style.marginBottom = "20px";
        errorBanner.style.border = "1px solid #ffeeba";
        errorBanner.style.display = "flex";
        errorBanner.style.alignItems = "center";
        errorBanner.style.justifyContent = "space-between";
        const messageDiv = document.createElement("div");
        messageDiv.textContent = message;
        const closeButton = document.createElement("button");
        closeButton.textContent = "×";
        closeButton.style.background = "none";
        closeButton.style.border = "none";
        closeButton.style.fontSize = "20px";
        closeButton.style.fontWeight = "bold";
        closeButton.style.cursor = "pointer";
        closeButton.style.marginLeft = "10px";
        closeButton.addEventListener("click", () => {
          errorBanner.style.display = "none";
        });
        errorBanner.appendChild(messageDiv);
        errorBanner.appendChild(closeButton);
        const checkoutForm = __privateGet(this, _form3);
        if (checkoutForm) {
          checkoutForm.insertBefore(errorBanner, checkoutForm.firstChild);
        } else {
          const checkoutContainer = document.querySelector('[os-checkout-container="form"]') || document.querySelector(".checkout-form") || document.querySelector(".checkout-container");
          if (checkoutContainer) {
            checkoutContainer.insertBefore(errorBanner, checkoutContainer.firstChild);
          } else {
            const mainContent = document.querySelector("main") || document.body;
            mainContent.insertBefore(errorBanner, mainContent.firstChild);
          }
        }
        errorBanner.scrollIntoView({ behavior: "smooth", block: "center" });
      } else {
        const messageDiv = errorBanner.querySelector("div");
        if (messageDiv) {
          messageDiv.textContent = message;
        } else {
          errorBanner.textContent = message;
        }
        errorBanner.style.display = "flex";
        errorBanner.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      __privateMethod(this, _safeLog2, safeLog_fn2).call(this, "debug", `Displayed top banner error for ${method}: ${message}`);
    } catch (error) {
      __privateMethod(this, _safeLog2, safeLog_fn2).call(this, "error", "Error displaying top banner error:", error);
      __privateMethod(this, _handlePaymentError, handlePaymentError_fn).call(this, message);
    }
  };

  // src/components/checkout/BillingAddressHandler.js
  var _app4, _logger6, _sameAsShippingCheckbox, _billingFormContainer, _shippingFields, _billingFields, _fieldMap, _isTransitioning, _lastState, _billingLocationComponent, _billingAddress1Field, _init2, init_fn2, _logDebug, logDebug_fn, _logInfo, logInfo_fn, _logWarn, logWarn_fn, _logError, logError_fn, _setupBillingLocationVisibility, setupBillingLocationVisibility_fn, _cacheFieldElements, cacheFieldElements_fn, _setupEventListeners2, setupEventListeners_fn2, _setupBillingAddressAutocompleteDetection, setupBillingAddressAutocompleteDetection_fn, _showBillingLocationComponent, showBillingLocationComponent_fn, _toggleBillingForm, toggleBillingForm_fn, _updateBillingFormVisibility, updateBillingFormVisibility_fn;
  var BillingAddressHandler = class {
    constructor(app) {
      __privateAdd(this, _init2);
      // Safe logging methods that check if the method exists before calling
      __privateAdd(this, _logDebug);
      __privateAdd(this, _logInfo);
      __privateAdd(this, _logWarn);
      __privateAdd(this, _logError);
      __privateAdd(this, _setupBillingLocationVisibility);
      __privateAdd(this, _cacheFieldElements);
      __privateAdd(this, _setupEventListeners2);
      __privateAdd(this, _setupBillingAddressAutocompleteDetection);
      __privateAdd(this, _showBillingLocationComponent);
      __privateAdd(this, _toggleBillingForm);
      // Deprecated method - use #toggleBillingForm instead
      __privateAdd(this, _updateBillingFormVisibility);
      __privateAdd(this, _app4, void 0);
      __privateAdd(this, _logger6, void 0);
      __privateAdd(this, _sameAsShippingCheckbox, void 0);
      __privateAdd(this, _billingFormContainer, void 0);
      __privateAdd(this, _shippingFields, {});
      __privateAdd(this, _billingFields, {});
      __privateAdd(this, _fieldMap, {
        "fname": "billing-fname",
        "lname": "billing-lname",
        "address1": "billing-address1",
        "address2": "billing-address2",
        "city": "billing-city",
        "province": "billing-province",
        "postal": "billing-postal",
        "country": "billing-country",
        "phone": "billing-phone"
      });
      __privateAdd(this, _isTransitioning, false);
      __privateAdd(this, _lastState, null);
      __privateAdd(this, _billingLocationComponent, null);
      __privateAdd(this, _billingAddress1Field, null);
      __privateSet(this, _app4, app);
      if (app?.logger) {
        if (typeof app.logger.debug === "function" && typeof app.logger.info === "function" && typeof app.logger.warn === "function" && typeof app.logger.error === "function") {
          __privateSet(this, _logger6, app.logger);
        } else {
          __privateSet(this, _logger6, app.logger.createModuleLogger ? app.logger.createModuleLogger("BILLING") : console);
        }
      } else {
        __privateSet(this, _logger6, console);
      }
      __privateMethod(this, _init2, init_fn2).call(this);
    }
    /**
     * Copy shipping address values to billing address fields
     */
    copyShippingToBilling() {
      try {
        Object.entries(__privateGet(this, _shippingFields)).forEach(([shippingField, shippingElement]) => {
          const billingFieldName = __privateGet(this, _fieldMap)[shippingField];
          const billingElement = __privateGet(this, _billingFields)[billingFieldName];
          if (billingElement && shippingElement) {
            billingElement.value = shippingElement.value;
            billingElement.dispatchEvent(new Event("change", { bubbles: true }));
          }
        });
        if (__privateGet(this, _billingFields)["billing-address1"] && __privateGet(this, _billingFields)["billing-address1"].value && __privateGet(this, _billingFields)["billing-address1"].value.length > 0) {
          __privateMethod(this, _showBillingLocationComponent, showBillingLocationComponent_fn).call(this);
        }
        __privateMethod(this, _logDebug, logDebug_fn).call(this, "Copied shipping address to billing address");
      } catch (error) {
        __privateMethod(this, _logError, logError_fn).call(this, "Error copying shipping to billing:", error);
      }
    }
    /**
     * Get the billing address data
     * If "same as shipping" is checked, returns null to indicate shipping should be used
     * Otherwise returns an object with the billing address fields
     */
    getBillingAddressData() {
      if (__privateGet(this, _sameAsShippingCheckbox) && __privateGet(this, _sameAsShippingCheckbox).checked) {
        return null;
      }
      const billingData = {};
      Object.entries(__privateGet(this, _billingFields)).forEach(([fieldName, element]) => {
        const apiFieldName = fieldName.replace("billing-", "");
        billingData[apiFieldName] = element.value;
      });
      return billingData;
    }
    /**
     * Check if billing address is same as shipping
     * @returns {boolean} Whether billing address is same as shipping
     */
    isSameAsShipping() {
      const isSame = __privateGet(this, _sameAsShippingCheckbox) ? __privateGet(this, _sameAsShippingCheckbox).checked : true;
      __privateMethod(this, _logDebug, logDebug_fn).call(this, `Billing address is ${isSame ? "same as" : "different from"} shipping`);
      return isSame;
    }
  };
  _app4 = new WeakMap();
  _logger6 = new WeakMap();
  _sameAsShippingCheckbox = new WeakMap();
  _billingFormContainer = new WeakMap();
  _shippingFields = new WeakMap();
  _billingFields = new WeakMap();
  _fieldMap = new WeakMap();
  _isTransitioning = new WeakMap();
  _lastState = new WeakMap();
  _billingLocationComponent = new WeakMap();
  _billingAddress1Field = new WeakMap();
  _init2 = new WeakSet();
  init_fn2 = function() {
    try {
      __privateSet(this, _sameAsShippingCheckbox, document.querySelector('[os-checkout-field="same-as-shipping"]') || document.querySelector('[name="use_shipping_address"]') || document.querySelector("#use_shipping_address"));
      __privateSet(this, _billingFormContainer, document.querySelector('[os-checkout-element="different-billing-address"]'));
      __privateSet(this, _billingLocationComponent, document.querySelector('[data-os-component="billing-location"]'));
      __privateSet(this, _billingAddress1Field, document.querySelector('[os-checkout-field="billing-address1"]'));
      if (!__privateGet(this, _sameAsShippingCheckbox)) {
        __privateMethod(this, _logWarn, logWarn_fn).call(this, 'Same as shipping checkbox not found. Tried multiple selectors including [name="use_shipping_address"] and #use_shipping_address');
        const allCheckboxes = document.querySelectorAll('input[type="checkbox"]');
        __privateMethod(this, _logDebug, logDebug_fn).call(this, `Found ${allCheckboxes.length} checkboxes on the page:`);
        allCheckboxes.forEach((checkbox, index) => {
          __privateMethod(this, _logDebug, logDebug_fn).call(this, `Checkbox ${index + 1}: id=${checkbox.id}, name=${checkbox.name}, class=${checkbox.className}`);
        });
        return;
      }
      if (!__privateGet(this, _billingFormContainer)) {
        __privateMethod(this, _logWarn, logWarn_fn).call(this, 'Billing form container not found with selector [os-checkout-element="different-billing-address"]');
        __privateSet(this, _billingFormContainer, document.querySelector(".billing_form-container"));
        if (__privateGet(this, _billingFormContainer)) {
          __privateMethod(this, _logInfo, logInfo_fn).call(this, "Found billing form container with alternative selector .billing_form-container");
        } else {
          return;
        }
      }
      __privateMethod(this, _logDebug, logDebug_fn).call(this, "BillingAddressHandler initialized");
      __privateMethod(this, _cacheFieldElements, cacheFieldElements_fn).call(this);
      __privateSet(this, _lastState, __privateGet(this, _sameAsShippingCheckbox).checked);
      __privateMethod(this, _toggleBillingForm, toggleBillingForm_fn).call(this, __privateGet(this, _lastState), false);
      __privateMethod(this, _setupBillingLocationVisibility, setupBillingLocationVisibility_fn).call(this);
      __privateMethod(this, _setupEventListeners2, setupEventListeners_fn2).call(this);
    } catch (error) {
      __privateMethod(this, _logError, logError_fn).call(this, "Error initializing BillingAddressHandler:", error);
    }
  };
  _logDebug = new WeakSet();
  logDebug_fn = function(message, ...args) {
    if (typeof __privateGet(this, _logger6).debug === "function") {
      __privateGet(this, _logger6).debug(message, ...args);
    } else if (typeof __privateGet(this, _logger6).log === "function") {
      __privateGet(this, _logger6).log(message, ...args);
    }
  };
  _logInfo = new WeakSet();
  logInfo_fn = function(message, ...args) {
    if (typeof __privateGet(this, _logger6).info === "function") {
      __privateGet(this, _logger6).info(message, ...args);
    } else if (typeof __privateGet(this, _logger6).log === "function") {
      __privateGet(this, _logger6).log(message, ...args);
    }
  };
  _logWarn = new WeakSet();
  logWarn_fn = function(message, ...args) {
    if (typeof __privateGet(this, _logger6).warn === "function") {
      __privateGet(this, _logger6).warn(message, ...args);
    } else if (typeof __privateGet(this, _logger6).log === "function") {
      __privateGet(this, _logger6).log(`WARNING: ${message}`, ...args);
    }
  };
  _logError = new WeakSet();
  logError_fn = function(message, error) {
    if (typeof __privateGet(this, _logger6).error === "function") {
      __privateGet(this, _logger6).error(message, error);
    } else if (typeof __privateGet(this, _logger6).log === "function") {
      __privateGet(this, _logger6).log(`ERROR: ${message}`, error);
    } else {
      console.error(message, error);
    }
  };
  _setupBillingLocationVisibility = new WeakSet();
  setupBillingLocationVisibility_fn = function() {
    if (!__privateGet(this, _billingLocationComponent)) {
      __privateMethod(this, _logWarn, logWarn_fn).call(this, 'Billing location component not found with selector [data-os-component="billing-location"]');
      return;
    }
    if (!__privateGet(this, _billingAddress1Field)) {
      __privateMethod(this, _logWarn, logWarn_fn).call(this, 'Billing address1 field not found with selector [os-checkout-field="billing-address1"]');
      return;
    }
    __privateGet(this, _billingLocationComponent).classList.add("cc-hidden");
    __privateMethod(this, _logDebug, logDebug_fn).call(this, "Billing location component initially hidden");
  };
  _cacheFieldElements = new WeakSet();
  cacheFieldElements_fn = function() {
    Object.keys(__privateGet(this, _fieldMap)).forEach((shippingField) => {
      const element = document.querySelector(`[os-checkout-field="${shippingField}"]`);
      if (element) {
        __privateGet(this, _shippingFields)[shippingField] = element;
      }
    });
    Object.values(__privateGet(this, _fieldMap)).forEach((billingField) => {
      const element = document.querySelector(`[os-checkout-field="${billingField}"]`);
      if (element) {
        __privateGet(this, _billingFields)[billingField] = element;
      }
    });
    __privateMethod(this, _logDebug, logDebug_fn).call(this, `Cached ${Object.keys(__privateGet(this, _shippingFields)).length} shipping fields and ${Object.keys(__privateGet(this, _billingFields)).length} billing fields`);
  };
  _setupEventListeners2 = new WeakSet();
  setupEventListeners_fn2 = function() {
    __privateGet(this, _sameAsShippingCheckbox).addEventListener("change", (e) => {
      if (!__privateGet(this, _isTransitioning)) {
        __privateSet(this, _lastState, e.target.checked);
        __privateMethod(this, _toggleBillingForm, toggleBillingForm_fn).call(this, e.target.checked, true);
        if (e.target.checked) {
          this.copyShippingToBilling();
        }
        __privateMethod(this, _logDebug, logDebug_fn).call(this, `Billing address changed: ${e.target.checked ? "Same as shipping" : "Different from shipping"}`);
      }
    });
    document.addEventListener("payment-method-changed", () => {
      if (__privateGet(this, _lastState) !== null && !__privateGet(this, _isTransitioning)) {
        __privateMethod(this, _toggleBillingForm, toggleBillingForm_fn).call(this, __privateGet(this, _lastState), false);
        __privateMethod(this, _logDebug, logDebug_fn).call(this, `Payment method changed, billing address state: ${__privateGet(this, _lastState) ? "Same as shipping" : "Different from shipping"}`);
      }
    });
    document.addEventListener("location-fields-shown", () => {
      if (__privateGet(this, _billingLocationComponent)) {
        __privateMethod(this, _showBillingLocationComponent, showBillingLocationComponent_fn).call(this);
        __privateMethod(this, _logDebug, logDebug_fn).call(this, "Location fields shown by AddressAutocomplete, showing billing location component as well");
      }
    });
    Object.entries(__privateGet(this, _shippingFields)).forEach(([fieldName, element]) => {
      element.addEventListener("change", () => {
        if (__privateGet(this, _sameAsShippingCheckbox).checked) {
          const billingFieldName = __privateGet(this, _fieldMap)[fieldName];
          const billingElement = __privateGet(this, _billingFields)[billingFieldName];
          if (billingElement) {
            billingElement.value = element.value;
            billingElement.dispatchEvent(new Event("change", { bubbles: true }));
          }
        }
      });
    });
    if (__privateGet(this, _billingAddress1Field) && __privateGet(this, _billingLocationComponent)) {
      __privateGet(this, _billingAddress1Field).addEventListener("input", () => {
        if (__privateGet(this, _billingAddress1Field).value.length >= 3) {
          __privateMethod(this, _showBillingLocationComponent, showBillingLocationComponent_fn).call(this);
        }
      });
      __privateMethod(this, _setupBillingAddressAutocompleteDetection, setupBillingAddressAutocompleteDetection_fn).call(this);
    }
  };
  _setupBillingAddressAutocompleteDetection = new WeakSet();
  setupBillingAddressAutocompleteDetection_fn = function() {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === "attributes" && (mutation.attributeName === "value" || mutation.attributeName === "autocomplete-value")) {
          if (__privateGet(this, _billingAddress1Field).value.length > 0) {
            __privateMethod(this, _showBillingLocationComponent, showBillingLocationComponent_fn).call(this);
            __privateMethod(this, _logDebug, logDebug_fn).call(this, "Autocomplete detected on billing address field");
          }
        }
      });
    });
    observer.observe(__privateGet(this, _billingAddress1Field), {
      attributes: true,
      attributeFilter: ["value", "autocomplete-value"]
    });
    document.addEventListener("google-places-autocomplete-filled", (e) => {
      if (e.detail && e.detail.field === "billing-address1") {
        __privateMethod(this, _showBillingLocationComponent, showBillingLocationComponent_fn).call(this);
        __privateMethod(this, _logDebug, logDebug_fn).call(this, "Google Places autocomplete detected on billing address field");
      }
    });
    __privateMethod(this, _logDebug, logDebug_fn).call(this, "Billing address autocomplete detection set up");
  };
  _showBillingLocationComponent = new WeakSet();
  showBillingLocationComponent_fn = function() {
    if (__privateGet(this, _billingLocationComponent) && __privateGet(this, _billingLocationComponent).classList.contains("cc-hidden")) {
      __privateGet(this, _billingLocationComponent).classList.remove("cc-hidden");
      __privateMethod(this, _logDebug, logDebug_fn).call(this, "Billing location component shown");
    }
  };
  _toggleBillingForm = new WeakSet();
  toggleBillingForm_fn = function(isChecked, animate = true) {
    if (!__privateGet(this, _billingFormContainer) || __privateGet(this, _isTransitioning))
      return;
    __privateSet(this, _isTransitioning, true);
    if (!__privateGet(this, _billingFormContainer).style.transition) {
      __privateGet(this, _billingFormContainer).style.transition = "height 0.3s ease-out, opacity 0.3s ease-out";
    }
    const handleTransitionEnd = (e) => {
      if (e.propertyName === "height") {
        if (!isChecked) {
          __privateGet(this, _billingFormContainer).style.height = "auto";
        }
        __privateGet(this, _billingFormContainer).style.overflow = "";
        __privateSet(this, _isTransitioning, false);
        __privateGet(this, _billingFormContainer).removeEventListener("transitionend", handleTransitionEnd);
        __privateMethod(this, _logDebug, logDebug_fn).call(this, `Billing form transition completed: ${isChecked ? "collapsed" : "expanded"}`);
      }
    };
    if (animate) {
      __privateGet(this, _billingFormContainer).removeEventListener("transitionend", handleTransitionEnd);
      if (!isChecked) {
        __privateGet(this, _billingFormContainer).style.display = "flex";
        __privateGet(this, _billingFormContainer).style.height = "0px";
        __privateGet(this, _billingFormContainer).style.overflow = "hidden";
        requestAnimationFrame(() => {
          const targetHeight = __privateGet(this, _billingFormContainer).scrollHeight;
          __privateGet(this, _billingFormContainer).style.height = `${targetHeight}px`;
          __privateGet(this, _billingFormContainer).style.opacity = "1";
          __privateMethod(this, _logDebug, logDebug_fn).call(this, `Expanding billing form to height: ${targetHeight}px`);
        });
        __privateGet(this, _billingFormContainer).addEventListener("transitionend", handleTransitionEnd);
      } else {
        __privateGet(this, _billingFormContainer).style.height = `${__privateGet(this, _billingFormContainer).scrollHeight}px`;
        __privateGet(this, _billingFormContainer).style.overflow = "hidden";
        requestAnimationFrame(() => {
          __privateGet(this, _billingFormContainer).style.height = "0px";
          __privateGet(this, _billingFormContainer).style.opacity = "0";
          __privateMethod(this, _logDebug, logDebug_fn).call(this, "Collapsing billing form");
        });
        __privateGet(this, _billingFormContainer).addEventListener("transitionend", handleTransitionEnd);
        __privateGet(this, _billingFormContainer).addEventListener("transitionend", (e) => {
          if (e.propertyName === "height" && isChecked) {
            __privateGet(this, _billingFormContainer).style.display = "none";
            __privateMethod(this, _logDebug, logDebug_fn).call(this, "Billing form hidden after collapse");
          }
        }, { once: true });
      }
    } else {
      __privateGet(this, _billingFormContainer).style.display = isChecked ? "none" : "flex";
      __privateGet(this, _billingFormContainer).style.height = isChecked ? "0" : "auto";
      __privateGet(this, _billingFormContainer).style.opacity = isChecked ? "0" : "1";
      __privateGet(this, _billingFormContainer).style.overflow = "";
      __privateSet(this, _isTransitioning, false);
      __privateMethod(this, _logDebug, logDebug_fn).call(this, `Set billing form without animation: ${isChecked ? "hidden" : "visible"}`);
    }
  };
  _updateBillingFormVisibility = new WeakSet();
  updateBillingFormVisibility_fn = function() {
    __privateMethod(this, _toggleBillingForm, toggleBillingForm_fn).call(this, __privateGet(this, _sameAsShippingCheckbox).checked, false);
  };

  // src/components/checkout/PaymentSelector.js
  var _logger7, _container, _radioInputs, _forms, _activeTransitions, _currentMode, _init3, init_fn3, _setPaymentMode, setPaymentMode_fn;
  var PaymentSelector = class {
    constructor(logger) {
      __privateAdd(this, _init3);
      __privateAdd(this, _setPaymentMode);
      __privateAdd(this, _logger7, void 0);
      __privateAdd(this, _container, void 0);
      __privateAdd(this, _radioInputs, void 0);
      __privateAdd(this, _forms, void 0);
      __privateAdd(this, _activeTransitions, /* @__PURE__ */ new Map());
      __privateAdd(this, _currentMode, null);
      __privateSet(this, _logger7, logger);
      __privateSet(this, _container, document.querySelector("[os-payment-mode]"));
      __privateSet(this, _radioInputs, document.querySelectorAll('input[name="combo_mode"]'));
      __privateSet(this, _forms, document.querySelectorAll('[os-checkout-element$="-form"]'));
      if (__privateGet(this, _container) && __privateGet(this, _radioInputs).length > 0) {
        __privateGet(this, _logger7).debug("PaymentSelector initialized with elements found");
        __privateMethod(this, _init3, init_fn3).call(this);
      } else {
        __privateGet(this, _logger7).warn("PaymentSelector elements not found");
      }
    }
  };
  _logger7 = new WeakMap();
  _container = new WeakMap();
  _radioInputs = new WeakMap();
  _forms = new WeakMap();
  _activeTransitions = new WeakMap();
  _currentMode = new WeakMap();
  _init3 = new WeakSet();
  init_fn3 = function() {
    const checkedRadio = document.querySelector('input[name="combo_mode"]:checked');
    if (checkedRadio && __privateGet(this, _container)) {
      __privateMethod(this, _setPaymentMode, setPaymentMode_fn).call(this, checkedRadio.value, false);
    }
    __privateGet(this, _radioInputs).forEach(
      (radio) => radio.addEventListener("change", (e) => __privateMethod(this, _setPaymentMode, setPaymentMode_fn).call(this, e.target.value, true))
    );
    __privateGet(this, _logger7).debug("PaymentSelector event listeners attached");
  };
  _setPaymentMode = new WeakSet();
  setPaymentMode_fn = function(mode, animate = true) {
    __privateGet(this, _logger7).debug(`Setting payment mode to: ${mode}, animate: ${animate}`);
    __privateGet(this, _container)?.setAttribute("os-payment-mode", mode);
    __privateSet(this, _currentMode, mode);
    __privateGet(this, _forms).forEach((form) => {
      form.style.transition = "none";
      form.offsetHeight;
      form.style.transition = "";
    });
    __privateGet(this, _forms).forEach((form) => {
      const formType = form.getAttribute("os-checkout-element");
      const isSelected = formType === `${mode}-form`;
      if (__privateGet(this, _activeTransitions).has(form)) {
        const oldHandler = __privateGet(this, _activeTransitions).get(form);
        form.removeEventListener("transitionend", oldHandler);
        __privateGet(this, _activeTransitions).delete(form);
      }
      if (animate) {
        form.style.display = "block";
        form.style.overflow = "hidden";
        const currentHeight = form.scrollHeight;
        form.style.height = `${currentHeight}px`;
        form.offsetHeight;
        const transitionEndHandler = (e) => {
          if (e.propertyName === "height") {
            if (isSelected) {
              form.style.height = "auto";
              form.style.overflow = "";
            } else {
              form.style.display = "none";
            }
            __privateGet(this, _activeTransitions).delete(form);
          }
        };
        __privateGet(this, _activeTransitions).set(form, transitionEndHandler);
        form.addEventListener("transitionend", transitionEndHandler, { once: true });
        requestAnimationFrame(() => {
          form.style.height = isSelected ? `${form.scrollHeight}px` : "0";
          form.style.opacity = isSelected ? "1" : "0";
        });
      } else {
        form.style.transition = "none";
        Object.assign(form.style, {
          display: isSelected ? "block" : "none",
          height: isSelected ? "auto" : "0",
          opacity: isSelected ? "1" : "0",
          overflow: ""
        });
        form.offsetHeight;
        form.style.transition = "";
      }
    });
    document.dispatchEvent(new CustomEvent("payment-method-changed", { detail: { mode } }));
  };

  // src/components/checkout/AddressAutocomplete.js
  var _logger8, _fieldsShown, _elements2, _enableAutocomplete, _init4, init_fn4, _hideLocationFields, hideLocationFields_fn, _showLocationFields, showLocationFields_fn, _isGoogleMapsAvailable, isGoogleMapsAvailable_fn, _initAutocompleteWithRetry, initAutocompleteWithRetry_fn, _initializeAutocomplete, initializeAutocomplete_fn, _setupAutocomplete, setupAutocomplete_fn, _setStateWithRetry, setStateWithRetry_fn, _setupBasicFieldListeners, setupBasicFieldListeners_fn, _setupAutofillDetection, setupAutofillDetection_fn;
  var AddressAutocomplete = class {
    constructor(logger, options = {}) {
      __privateAdd(this, _init4);
      __privateAdd(this, _hideLocationFields);
      __privateAdd(this, _showLocationFields);
      __privateAdd(this, _isGoogleMapsAvailable);
      __privateAdd(this, _initAutocompleteWithRetry);
      __privateAdd(this, _initializeAutocomplete);
      __privateAdd(this, _setupAutocomplete);
      __privateAdd(this, _setStateWithRetry);
      __privateAdd(this, _setupBasicFieldListeners);
      __privateAdd(this, _setupAutofillDetection);
      __privateAdd(this, _logger8, void 0);
      __privateAdd(this, _fieldsShown, false);
      __privateAdd(this, _elements2, void 0);
      __privateAdd(this, _enableAutocomplete, void 0);
      __privateSet(this, _logger8, logger);
      __privateSet(this, _enableAutocomplete, options.enableGoogleMapsAutocomplete !== false);
      __privateSet(this, _elements2, {
        shipping: {
          address: document.querySelector('[os-checkout-field="address1"]'),
          city: document.querySelector('[os-checkout-field="city"]'),
          state: document.querySelector('[os-checkout-field="province"]'),
          zip: document.querySelector('[os-checkout-field="postal"]'),
          country: document.querySelector('[os-checkout-field="country"]')
        },
        billing: {
          address: document.querySelector('[os-checkout-field="billing-address1"]'),
          city: document.querySelector('[os-checkout-field="billing-city"]'),
          state: document.querySelector('[os-checkout-field="billing-province"]'),
          zip: document.querySelector('[os-checkout-field="billing-postal"]'),
          country: document.querySelector('[os-checkout-field="billing-country"]')
        },
        locations: document.querySelectorAll('[data-os-component="location"]')
      });
      __privateGet(this, _logger8).info(`AddressAutocomplete initialized (autocomplete ${__privateGet(this, _enableAutocomplete) ? "enabled" : "disabled"})`);
      __privateMethod(this, _hideLocationFields, hideLocationFields_fn).call(this);
      __privateMethod(this, _init4, init_fn4).call(this);
    }
  };
  _logger8 = new WeakMap();
  _fieldsShown = new WeakMap();
  _elements2 = new WeakMap();
  _enableAutocomplete = new WeakMap();
  _init4 = new WeakSet();
  init_fn4 = async function() {
    __privateMethod(this, _setupAutofillDetection, setupAutofillDetection_fn).call(this);
    if (!__privateGet(this, _enableAutocomplete)) {
      __privateGet(this, _logger8).debug("Google Maps autocomplete disabled, using basic field listeners");
      return __privateMethod(this, _setupBasicFieldListeners, setupBasicFieldListeners_fn).call(this);
    }
    await __privateMethod(this, _initAutocompleteWithRetry, initAutocompleteWithRetry_fn).call(this);
  };
  _hideLocationFields = new WeakSet();
  hideLocationFields_fn = function() {
    if (__privateGet(this, _fieldsShown))
      return;
    __privateGet(this, _elements2).locations.forEach((el) => el.classList.add("cc-hidden"));
    __privateGet(this, _logger8).debug("Location fields hidden");
  };
  _showLocationFields = new WeakSet();
  showLocationFields_fn = function() {
    if (__privateGet(this, _fieldsShown))
      return;
    __privateGet(this, _elements2).locations.forEach((el) => el.classList.remove("cc-hidden"));
    __privateSet(this, _fieldsShown, true);
    document.dispatchEvent(new CustomEvent("location-fields-shown"));
    __privateGet(this, _logger8).debug("Location fields shown");
  };
  _isGoogleMapsAvailable = new WeakSet();
  isGoogleMapsAvailable_fn = function() {
    return !!window.google?.maps?.places;
  };
  _initAutocompleteWithRetry = new WeakSet();
  initAutocompleteWithRetry_fn = async function(attempt = 0) {
    if (!__privateGet(this, _enableAutocomplete)) {
      return __privateMethod(this, _setupBasicFieldListeners, setupBasicFieldListeners_fn).call(this);
    }
    if (__privateMethod(this, _isGoogleMapsAvailable, isGoogleMapsAvailable_fn).call(this)) {
      __privateGet(this, _logger8).debug("Google Maps API available");
      return __privateMethod(this, _initializeAutocomplete, initializeAutocomplete_fn).call(this);
    }
    if (attempt >= 3) {
      __privateGet(this, _logger8).warn("Google Maps API unavailable after 3 attempts");
      return __privateMethod(this, _setupBasicFieldListeners, setupBasicFieldListeners_fn).call(this);
    }
    __privateGet(this, _logger8).debug(`Retrying Google Maps check, attempt ${attempt + 1}`);
    await new Promise((resolve) => setTimeout(resolve, 1e3 * 1.5 ** attempt));
    return __privateMethod(this, _initAutocompleteWithRetry, initAutocompleteWithRetry_fn).call(this, attempt + 1);
  };
  _initializeAutocomplete = new WeakSet();
  initializeAutocomplete_fn = function() {
    const { shipping, billing } = __privateGet(this, _elements2);
    [shipping, billing].forEach((fields) => {
      if (fields.address) {
        __privateMethod(this, _setupAutocomplete, setupAutocomplete_fn).call(this, fields.address, fields);
        __privateGet(this, _logger8).debug(`Autocomplete set up for ${fields.address.getAttribute("os-checkout-field")}`);
      }
    });
  };
  _setupAutocomplete = new WeakSet();
  setupAutocomplete_fn = function(input, fields) {
    try {
      const autocomplete = new google.maps.places.Autocomplete(input, {
        types: ["address"],
        fields: ["address_components", "formatted_address"]
      });
      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        if (!place.address_components)
          return;
        __privateMethod(this, _showLocationFields, showLocationFields_fn).call(this);
        const components = Object.fromEntries(
          place.address_components.map((c) => [c.types[0], { long: c.long_name, short: c.short_name }])
        );
        fields.address.value = [components.street_number?.long, components.route?.long].filter(Boolean).join(" ");
        fields.city && (fields.city.value = components.locality?.long ?? "");
        fields.zip && (fields.zip.value = components.postal_code?.long ?? "");
        if (fields.country && components.country) {
          const countryCode = components.country.short;
          if (fields.country.value !== countryCode) {
            fields.country.value = countryCode;
            fields.country.dispatchEvent(new Event("change", { bubbles: true }));
            __privateGet(this, _logger8).debug(`Country set to ${countryCode}`);
          }
          if (fields.state && components.administrative_area_level_1) {
            __privateMethod(this, _setStateWithRetry, setStateWithRetry_fn).call(this, fields.state, components.administrative_area_level_1.short);
          }
        }
        [fields.address, fields.city, fields.zip].forEach((el) => el?.dispatchEvent(new Event("change", { bubbles: true })));
      });
      input.addEventListener("blur", () => input.value.length > 10 && __privateMethod(this, _showLocationFields, showLocationFields_fn).call(this));
      input.addEventListener("keydown", (e) => e.key === "Enter" && e.preventDefault());
    } catch (error) {
      __privateGet(this, _logger8).error("Autocomplete setup failed:", error);
      __privateMethod(this, _setupBasicFieldListeners, setupBasicFieldListeners_fn).call(this);
    }
  };
  _setStateWithRetry = new WeakSet();
  setStateWithRetry_fn = async function(stateSelect, stateCode, attempt = 0) {
    if (attempt >= 5) {
      __privateGet(this, _logger8).warn(`Failed to set state ${stateCode} after 5 attempts`);
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, 300 * 1.5 ** attempt));
    const hasOption = Array.from(stateSelect.options).some((opt) => opt.value === stateCode);
    if (hasOption) {
      stateSelect.value = stateCode;
      stateSelect.dispatchEvent(new Event("change", { bubbles: true }));
      __privateGet(this, _logger8).debug(`State set to ${stateCode}`);
    } else {
      __privateMethod(this, _setStateWithRetry, setStateWithRetry_fn).call(this, stateSelect, stateCode, attempt + 1);
    }
  };
  _setupBasicFieldListeners = new WeakSet();
  setupBasicFieldListeners_fn = function() {
    [__privateGet(this, _elements2).shipping.address, __privateGet(this, _elements2).billing.address].forEach((field) => {
      field?.addEventListener("blur", () => field.value.length > 10 && __privateMethod(this, _showLocationFields, showLocationFields_fn).call(this));
    });
    __privateGet(this, _logger8).debug("Basic field listeners set up");
  };
  _setupAutofillDetection = new WeakSet();
  setupAutofillDetection_fn = function() {
    const style = document.createElement("style");
    style.textContent = `
        @keyframes onAutoFillStart { from { opacity: 0.99; } to { opacity: 1; } }
        input:-webkit-autofill { animation-name: onAutoFillStart; }
      `;
    document.head.appendChild(style);
    const fields = [__privateGet(this, _elements2).shipping.address, __privateGet(this, _elements2).billing.address].filter(Boolean);
    fields.forEach((field) => {
      field.addEventListener("input", () => field.value.length > 10 && __privateMethod(this, _showLocationFields, showLocationFields_fn).call(this));
      field.addEventListener("change", () => field.value.length > 0 && __privateMethod(this, _showLocationFields, showLocationFields_fn).call(this));
      field.addEventListener("animationstart", (e) => {
        if (e.animationName === "onAutoFillStart") {
          __privateGet(this, _logger8).debug(`Autofill detected on ${field.getAttribute("os-checkout-field")}`);
          __privateMethod(this, _showLocationFields, showLocationFields_fn).call(this);
        }
      });
    });
    __privateGet(this, _logger8).debug("Autofill detection initialized");
  };

  // src/components/checkout/PhoneInputHandler.js
  var _logger9, _intlTelInputAvailable, _loadIntlTelInput, loadIntlTelInput_fn, _initPhoneInputs, initPhoneInputs_fn, _initializePhoneInput, initializePhoneInput_fn, _showError2, showError_fn2, _clearError, clearError_fn, _getNumberTypeName, getNumberTypeName_fn, _setupPhoneInputSync, setupPhoneInputSync_fn, _setupPhoneValidation, setupPhoneValidation_fn;
  var PhoneInputHandler = class {
    constructor(logger) {
      __privateAdd(this, _loadIntlTelInput);
      __privateAdd(this, _initPhoneInputs);
      __privateAdd(this, _initializePhoneInput);
      __privateAdd(this, _showError2);
      __privateAdd(this, _clearError);
      // Helper method to convert number type to readable name
      __privateAdd(this, _getNumberTypeName);
      __privateAdd(this, _setupPhoneInputSync);
      __privateAdd(this, _setupPhoneValidation);
      __privateAdd(this, _logger9, void 0);
      __privateAdd(this, _intlTelInputAvailable, !!window.intlTelInput);
      __privateSet(this, _logger9, logger);
      if (!__privateGet(this, _intlTelInputAvailable)) {
        __privateGet(this, _logger9).warn("intlTelInput not found, loading dynamically");
        __privateMethod(this, _loadIntlTelInput, loadIntlTelInput_fn).call(this).then(() => __privateMethod(this, _initPhoneInputs, initPhoneInputs_fn).call(this));
      } else {
        __privateGet(this, _logger9).info("intlTelInput available, initializing phone inputs");
        __privateMethod(this, _initPhoneInputs, initPhoneInputs_fn).call(this);
      }
    }
  };
  _logger9 = new WeakMap();
  _intlTelInputAvailable = new WeakMap();
  _loadIntlTelInput = new WeakSet();
  loadIntlTelInput_fn = async function() {
    const resources = [
      { tag: "link", rel: "stylesheet", href: "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.8/css/intlTelInput.min.css" },
      { tag: "script", src: "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.8/js/intlTelInput.min.js", async: true },
      { tag: "script", src: "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.8/js/utils.js", async: true }
    ];
    await Promise.all(resources.map(({ tag, ...attrs }) => {
      const element = document.createElement(tag);
      Object.assign(element, attrs);
      document.head.appendChild(element);
      return tag === "link" ? Promise.resolve() : new Promise((resolve) => element.onload = resolve);
    }));
    __privateSet(this, _intlTelInputAvailable, true);
    __privateGet(this, _logger9).debug("intlTelInput and utils loaded");
  };
  _initPhoneInputs = new WeakSet();
  initPhoneInputs_fn = function() {
    if (!__privateGet(this, _intlTelInputAvailable))
      return;
    const phoneInputs = document.querySelectorAll('input[type="tel"]');
    __privateGet(this, _logger9).info(`Found ${phoneInputs.length} phone inputs`);
    phoneInputs.forEach((input, i) => __privateMethod(this, _initializePhoneInput, initializePhoneInput_fn).call(this, input, i + 1));
  };
  _initializePhoneInput = new WeakSet();
  initializePhoneInput_fn = function(input, index) {
    try {
      const iti = window.intlTelInput(input, {
        utilsScript: "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.8/js/utils.js",
        separateDialCode: true,
        onlyCountries: ["us"],
        initialCountry: "us",
        allowDropdown: false,
        dropdownContainer: document.body,
        useFullscreenPopup: true,
        formatOnDisplay: true,
        autoPlaceholder: "aggressive",
        customContainer: "iti-tel-input",
        autoFormat: true,
        nationalMode: true
      });
      input.iti = iti;
      __privateGet(this, _logger9).debug(`Phone input ${index} (${input.getAttribute("os-checkout-field") ?? "unknown"}) initialized`);
      __privateMethod(this, _setupPhoneInputSync, setupPhoneInputSync_fn).call(this, input, iti);
      __privateMethod(this, _setupPhoneValidation, setupPhoneValidation_fn).call(this, input, iti);
      input.addEventListener("input", () => {
        const number = input.value.trim();
        if (number) {
          const numericValue = number.replace(/\D/g, "");
          let formattedNumber = "";
          if (numericValue.length > 0) {
            if (numericValue.length <= 3) {
              formattedNumber = `(${numericValue}`;
            } else if (numericValue.length <= 6) {
              formattedNumber = `(${numericValue.slice(0, 3)}) ${numericValue.slice(3)}`;
            } else {
              formattedNumber = `(${numericValue.slice(0, 3)}) ${numericValue.slice(3, 6)}-${numericValue.slice(6, 10)}`;
            }
          }
          if (input.value !== formattedNumber) {
            const cursorPos = input.selectionStart;
            const oldLength = input.value.length;
            input.value = formattedNumber;
            if (cursorPos !== null) {
              const newLength = formattedNumber.length;
              const cursorOffset = newLength - oldLength;
              input.setSelectionRange(cursorPos + cursorOffset, cursorPos + cursorOffset);
            }
          }
        }
        const isValid = iti.isValidNumber();
        const numberType = iti.getNumberType();
        const validationError = iti.getValidationError();
        if (!number) {
          __privateMethod(this, _clearError, clearError_fn).call(this, input);
          return;
        }
        console.group("Phone Number Validation");
        /* @__PURE__ */ console.log("Number:", number);
        /* @__PURE__ */ console.log("Is Valid:", isValid);
        /* @__PURE__ */ console.log("Formatted Number:", iti.getNumber());
        /* @__PURE__ */ console.log("Number Type:", __privateMethod(this, _getNumberTypeName, getNumberTypeName_fn).call(this, numberType));
        /* @__PURE__ */ console.log("Validation Error:", validationError);
        console.groupEnd();
        __privateGet(this, _logger9).debug("Phone validation:", {
          number,
          isValid,
          formattedNumber: iti.getNumber(),
          type: __privateMethod(this, _getNumberTypeName, getNumberTypeName_fn).call(this, numberType),
          error: validationError
        });
      });
      input.addEventListener("blur", () => {
        const number = input.value.trim();
        if (number) {
          const isValid = iti.isValidNumber();
          if (isValid) {
            input.value = iti.getNumber(intlTelInputUtils.numberFormat.NATIONAL);
          }
          /* @__PURE__ */ console.log("Phone field blur - Final validation:", {
            number,
            isValid,
            formattedNumber: iti.getNumber()
          });
          if (!isValid) {
            __privateMethod(this, _showError2, showError_fn2).call(this, input, "Please enter a valid US phone number (e.g. 555-555-5555)");
          } else {
            __privateMethod(this, _clearError, clearError_fn).call(this, input);
          }
        }
      });
    } catch (error) {
      __privateGet(this, _logger9).error(`Error initializing phone input ${index}:`, error);
    }
  };
  _showError2 = new WeakSet();
  showError_fn2 = function(input, message) {
    input.classList.add("error");
    const itiContainer = input.closest(".iti");
    if (itiContainer) {
      itiContainer.classList.add("error");
      itiContainer.style.border = "1px solid red";
    }
    const wrapper = input.closest(".frm-flds") || input.closest(".form-group");
    let errorElement = wrapper.querySelector(".pb-input-error");
    if (!errorElement) {
      errorElement = document.createElement("div");
      errorElement.className = "pb-input-error";
      wrapper.appendChild(errorElement);
    }
    errorElement.textContent = message;
    Object.assign(errorElement.style, {
      color: "red",
      fontSize: "0.875rem",
      marginTop: "0.25rem",
      display: "block",
      position: "relative",
      clear: "both"
    });
  };
  _clearError = new WeakSet();
  clearError_fn = function(input) {
    input.classList.remove("error");
    const itiContainer = input.closest(".iti");
    if (itiContainer) {
      itiContainer.classList.remove("error");
      itiContainer.style.border = "";
    }
    const wrapper = input.closest(".frm-flds") || input.closest(".form-group");
    const errorElement = wrapper.querySelector(".pb-input-error");
    if (errorElement) {
      errorElement.remove();
    }
  };
  _getNumberTypeName = new WeakSet();
  getNumberTypeName_fn = function(type) {
    const types = {
      0: "FIXED_LINE",
      1: "MOBILE",
      2: "FIXED_LINE_OR_MOBILE",
      3: "TOLL_FREE",
      4: "PREMIUM_RATE",
      5: "SHARED_COST",
      6: "VOIP",
      7: "PERSONAL_NUMBER",
      8: "PAGER",
      9: "UAN",
      10: "UNKNOWN"
    };
    return types[type] || "UNKNOWN";
  };
  _setupPhoneInputSync = new WeakSet();
  setupPhoneInputSync_fn = function(input, iti) {
    const fieldAttr = input.getAttribute("os-checkout-field");
    if (!fieldAttr) {
      __privateGet(this, _logger9).warn("Phone input missing os-checkout-field attribute");
      return;
    }
    const countrySelect = document.querySelector(
      fieldAttr === "phone" ? '[os-checkout-field="country"]' : '[os-checkout-field="billing-country"]'
    );
    if (!countrySelect) {
      __privateGet(this, _logger9).warn(`Country select not found for ${fieldAttr}`);
      return;
    }
    if (countrySelect.value !== "US") {
      countrySelect.value = "US";
      countrySelect.dispatchEvent(new Event("change", { bubbles: true }));
      __privateGet(this, _logger9).debug("Country select updated to US");
    }
  };
  _setupPhoneValidation = new WeakSet();
  setupPhoneValidation_fn = function(input, iti) {
    input.validatePhone = () => !input.value.trim() ? !input.hasAttribute("required") : iti.isValidNumber();
    input.getFormattedNumber = () => iti.getNumber();
    const form = input.closest("form");
    form?.addEventListener("submit", () => {
      if (input.value.trim() && iti.isValidNumber()) {
        input.value = iti.getNumber();
        __privateGet(this, _logger9).debug(`Formatted phone number set to ${input.value} on submit`);
      }
    });
  };

  // src/components/checkout/ProspectCartHandler.js
  var _app5, _logger10, _initialized, _cartCreated, _cartAttempted, _beginCheckoutFired, _debounceTimeout, _debounceDelay, _lastFormData, _selectors, _fields, _emailRegex, _init5, init_fn5, _findFormFields, findFormFields_fn, _attachEventListeners, attachEventListeners_fn, _handleFieldChange, handleFieldChange_fn, _checkAndFireBeginCheckout, checkAndFireBeginCheckout_fn, _checkAndCreateCart, checkAndCreateCart_fn, _hasMinimumRequiredFields, hasMinimumRequiredFields_fn, _getFormData, getFormData_fn, _isSameFormData, isSameFormData_fn, _createProspectCart, createProspectCart_fn, _updateUserState, updateUserState_fn, _isAddressValid, isAddressValid_fn, _getValidAddressData, getValidAddressData_fn, _isValidPostalCode, isValidPostalCode_fn, _getPhoneNumber, getPhoneNumber_fn, _createCartViaApi, createCartViaApi_fn;
  var ProspectCartHandler = class {
    /**
     * Initialize the ProspectCartHandler
     * @param {Object} app - The main application instance
     */
    constructor(app) {
      /**
       * Initialize the component
       */
      __privateAdd(this, _init5);
      /**
       * Find form fields in the DOM
       */
      __privateAdd(this, _findFormFields);
      /**
       * Attach event listeners to form fields
       */
      __privateAdd(this, _attachEventListeners);
      /**
       * Handle field change event
       */
      __privateAdd(this, _handleFieldChange);
      /**
       * Check if we should fire the beginCheckout event
       * and fire it if we haven't already
       */
      __privateAdd(this, _checkAndFireBeginCheckout);
      /**
       * Check if we have enough information to create a cart
       * and create it if we do
       */
      __privateAdd(this, _checkAndCreateCart);
      /**
       * Check if we have the minimum required fields to create a cart
       * @returns {boolean} Whether we have the minimum required fields
       */
      __privateAdd(this, _hasMinimumRequiredFields);
      /**
       * Get the current form data
       * @returns {Object} The form data
       */
      __privateAdd(this, _getFormData);
      /**
       * Check if two form data objects are the same
       * @param {Object} data1 - The first form data object
       * @param {Object} data2 - The second form data object
       * @returns {boolean} Whether the form data objects are the same
       */
      __privateAdd(this, _isSameFormData);
      /**
       * Create a prospect cart
       */
      __privateAdd(this, _createProspectCart);
      /**
       * Update user state with user information
       * @param {string} email - User's email
       * @param {string} firstName - User's first name
       * @param {string} lastName - User's last name
       * @param {string} phone - User's phone number
       */
      __privateAdd(this, _updateUserState);
      /**
       * Check if address data is valid
       * @param {Object} address - The address data
       * @returns {boolean} Whether the address is valid
       */
      __privateAdd(this, _isAddressValid);
      /**
       * Get address data from form fields, validating postal code if present
       * @returns {Object} The validated address data
       */
      __privateAdd(this, _getValidAddressData);
      /**
       * Check if a postal code is valid for a country
       * @param {string} postalCode - The postal code to validate
       * @param {string} country - The country code
       * @returns {boolean} Whether the postal code is valid
       */
      __privateAdd(this, _isValidPostalCode);
      /**
       * Get phone number from field, handling international format
       * @returns {string} The phone number
       */
      __privateAdd(this, _getPhoneNumber);
      /**
       * Create a cart via the API
       * @param {Object} cartData - The cart data
       */
      __privateAdd(this, _createCartViaApi);
      __privateAdd(this, _app5, void 0);
      __privateAdd(this, _logger10, void 0);
      __privateAdd(this, _initialized, false);
      __privateAdd(this, _cartCreated, false);
      __privateAdd(this, _cartAttempted, false);
      __privateAdd(this, _beginCheckoutFired, false);
      // Track if beginCheckout event has been fired
      __privateAdd(this, _debounceTimeout, null);
      __privateAdd(this, _debounceDelay, 3e3);
      // 3 seconds debounce
      __privateAdd(this, _lastFormData, null);
      // Track the last form data we attempted to use
      // Form field selectors
      __privateAdd(this, _selectors, {
        firstName: '[os-checkout-field="fname"]',
        lastName: '[os-checkout-field="lname"]',
        email: '[os-checkout-field="email"]',
        phone: '[os-checkout-field="phone"]',
        address1: '[os-checkout-field="address1"]',
        address2: '[os-checkout-field="address2"]',
        city: '[os-checkout-field="city"]',
        province: '[os-checkout-field="province"]',
        postal: '[os-checkout-field="postal"]',
        country: '[os-checkout-field="country"]'
      });
      // Form fields
      __privateAdd(this, _fields, {
        firstName: null,
        lastName: null,
        email: null,
        phone: null,
        address1: null,
        address2: null,
        city: null,
        province: null,
        postal: null,
        country: null
      });
      // Email validation regex
      __privateAdd(this, _emailRegex, /^[^\s@]+@[^\s@]+\.[^\s@]+$/);
      __privateSet(this, _app5, app);
      if (__privateGet(this, _app5) && __privateGet(this, _app5).logger) {
        __privateSet(this, _logger10, __privateGet(this, _app5).logger.createModuleLogger("PROSPECT"));
      } else {
        __privateSet(this, _logger10, {
          debug: (message, data) => /* @__PURE__ */ console.log(`[PROSPECT DEBUG] ${message}`, data !== void 0 ? data : ""),
          info: (message, data) => /* @__PURE__ */ console.info(`[PROSPECT INFO] ${message}`, data !== void 0 ? data : ""),
          warn: (message, data) => console.warn(`[PROSPECT WARN] ${message}`, data !== void 0 ? data : ""),
          error: (message, data) => console.error(`[PROSPECT ERROR] ${message}`, data !== void 0 ? data : "")
        });
      }
      __privateMethod(this, _init5, init_fn5).call(this);
    }
    /**
     * Manually trigger the beginCheckout event
     * This can be called from outside the class if needed
     */
    triggerBeginCheckout() {
      if (__privateGet(this, _app5) && __privateGet(this, _app5).events) {
        if (!__privateGet(this, _beginCheckoutFired)) {
          __privateGet(this, _logger10).info("Manually triggering beginCheckout event");
          __privateGet(this, _app5).events.beginCheckout();
          __privateSet(this, _beginCheckoutFired, true);
          return true;
        } else {
          __privateGet(this, _logger10).debug("beginCheckout event already fired, skipping");
          return false;
        }
      } else {
        __privateGet(this, _logger10).warn("Cannot trigger beginCheckout event: Events manager not available");
        return false;
      }
    }
    /**
     * Reset the beginCheckout flag
     * This can be used if the user clears the form or starts over
     */
    resetBeginCheckoutFlag() {
      __privateSet(this, _beginCheckoutFired, false);
      __privateGet(this, _logger10).debug("Reset beginCheckout flag");
      return true;
    }
  };
  _app5 = new WeakMap();
  _logger10 = new WeakMap();
  _initialized = new WeakMap();
  _cartCreated = new WeakMap();
  _cartAttempted = new WeakMap();
  _beginCheckoutFired = new WeakMap();
  _debounceTimeout = new WeakMap();
  _debounceDelay = new WeakMap();
  _lastFormData = new WeakMap();
  _selectors = new WeakMap();
  _fields = new WeakMap();
  _emailRegex = new WeakMap();
  _init5 = new WeakSet();
  init_fn5 = function() {
    __privateGet(this, _logger10).info("Initializing ProspectCartHandler");
    __privateMethod(this, _findFormFields, findFormFields_fn).call(this);
    if (__privateGet(this, _fields).email && (__privateGet(this, _fields).firstName || __privateGet(this, _fields).lastName)) {
      __privateMethod(this, _attachEventListeners, attachEventListeners_fn).call(this);
      __privateSet(this, _initialized, true);
      __privateGet(this, _logger10).info("ProspectCartHandler initialized successfully");
    } else {
      __privateGet(this, _logger10).warn("Required form fields not found, ProspectCartHandler not initialized");
    }
  };
  _findFormFields = new WeakSet();
  findFormFields_fn = function() {
    Object.keys(__privateGet(this, _selectors)).forEach((field) => {
      __privateGet(this, _fields)[field] = document.querySelector(__privateGet(this, _selectors)[field]);
      if (!__privateGet(this, _fields)[field]) {
        const altSelector = __privateGet(this, _selectors)[field].replace("os-checkout-field", "data-os-field");
        __privateGet(this, _fields)[field] = document.querySelector(altSelector);
      }
      if (__privateGet(this, _fields)[field]) {
        __privateGet(this, _logger10).debug(`Found ${field} field`);
      } else {
        __privateGet(this, _logger10).debug(`${field} field not found`);
      }
    });
  };
  _attachEventListeners = new WeakSet();
  attachEventListeners_fn = function() {
    if (__privateGet(this, _fields).email) {
      __privateGet(this, _fields).email.addEventListener("blur", () => __privateMethod(this, _handleFieldChange, handleFieldChange_fn).call(this));
    }
    if (__privateGet(this, _fields).firstName) {
      __privateGet(this, _fields).firstName.addEventListener("blur", () => __privateMethod(this, _handleFieldChange, handleFieldChange_fn).call(this));
    }
    if (__privateGet(this, _fields).lastName) {
      __privateGet(this, _fields).lastName.addEventListener("blur", () => __privateMethod(this, _handleFieldChange, handleFieldChange_fn).call(this));
    }
    const form = document.querySelector('form[os-checkout="form"]');
    if (form) {
      form.addEventListener("submit", () => {
        __privateSet(this, _cartAttempted, true);
        if (__privateGet(this, _debounceTimeout)) {
          clearTimeout(__privateGet(this, _debounceTimeout));
        }
      });
    }
    __privateGet(this, _logger10).debug("Event listeners attached to form fields");
  };
  _handleFieldChange = new WeakSet();
  handleFieldChange_fn = function() {
    if (__privateGet(this, _cartCreated) || __privateGet(this, _cartAttempted)) {
      return;
    }
    if (__privateGet(this, _debounceTimeout)) {
      clearTimeout(__privateGet(this, _debounceTimeout));
    }
    __privateMethod(this, _checkAndFireBeginCheckout, checkAndFireBeginCheckout_fn).call(this);
    __privateSet(this, _debounceTimeout, setTimeout(() => {
      __privateMethod(this, _checkAndCreateCart, checkAndCreateCart_fn).call(this);
    }, __privateGet(this, _debounceDelay)));
  };
  _checkAndFireBeginCheckout = new WeakSet();
  checkAndFireBeginCheckout_fn = function() {
    if (__privateGet(this, _beginCheckoutFired)) {
      return;
    }
    const hasEmail = __privateGet(this, _fields).email && __privateGet(this, _fields).email.value && __privateGet(this, _fields).email.value.trim().length > 0;
    const hasName = __privateGet(this, _fields).firstName && __privateGet(this, _fields).firstName.value && __privateGet(this, _fields).firstName.value.trim().length > 0 || __privateGet(this, _fields).lastName && __privateGet(this, _fields).lastName.value && __privateGet(this, _fields).lastName.value.trim().length > 0;
    if (hasEmail || hasName) {
      __privateGet(this, _logger10).debug("User has started entering checkout information, firing beginCheckout event");
      if (__privateGet(this, _app5).events) {
        __privateGet(this, _app5).events.beginCheckout();
        __privateSet(this, _beginCheckoutFired, true);
        __privateGet(this, _logger10).info("beginCheckout event fired");
      }
    }
  };
  _checkAndCreateCart = new WeakSet();
  checkAndCreateCart_fn = function() {
    if (__privateGet(this, _cartCreated) || __privateGet(this, _cartAttempted)) {
      __privateGet(this, _logger10).debug("Cart already created or attempted, skipping");
      return;
    }
    if (!__privateMethod(this, _hasMinimumRequiredFields, hasMinimumRequiredFields_fn).call(this)) {
      __privateGet(this, _logger10).debug("Not enough information to create a cart");
      return;
    }
    const currentFormData = __privateMethod(this, _getFormData, getFormData_fn).call(this);
    if (__privateGet(this, _lastFormData) && __privateMethod(this, _isSameFormData, isSameFormData_fn).call(this, currentFormData, __privateGet(this, _lastFormData))) {
      __privateGet(this, _logger10).debug("Form data has not changed since last attempt, skipping");
      return;
    }
    __privateSet(this, _lastFormData, currentFormData);
    __privateSet(this, _cartAttempted, true);
    __privateMethod(this, _createProspectCart, createProspectCart_fn).call(this);
  };
  _hasMinimumRequiredFields = new WeakSet();
  hasMinimumRequiredFields_fn = function() {
    const hasValidEmail = __privateGet(this, _fields).email && __privateGet(this, _fields).email.value && __privateGet(this, _emailRegex).test(__privateGet(this, _fields).email.value);
    if (!hasValidEmail) {
      __privateGet(this, _logger10).debug("Email is missing or invalid");
      return false;
    }
    const hasFirstName = __privateGet(this, _fields).firstName && __privateGet(this, _fields).firstName.value && __privateGet(this, _fields).firstName.value.trim().length >= 2;
    const hasLastName = __privateGet(this, _fields).lastName && __privateGet(this, _fields).lastName.value && __privateGet(this, _fields).lastName.value.trim().length >= 2;
    if (!hasFirstName && !hasLastName) {
      __privateGet(this, _logger10).debug("First name and last name are missing or too short");
      return false;
    }
    __privateGet(this, _logger10).debug("Minimum required fields are present");
    return true;
  };
  _getFormData = new WeakSet();
  getFormData_fn = function() {
    const data = {};
    Object.keys(__privateGet(this, _fields)).forEach((field) => {
      if (__privateGet(this, _fields)[field]) {
        data[field] = __privateGet(this, _fields)[field].value;
      }
    });
    return data;
  };
  _isSameFormData = new WeakSet();
  isSameFormData_fn = function(data1, data2) {
    return data1.email === data2.email && data1.firstName === data2.firstName && data1.lastName === data2.lastName;
  };
  _createProspectCart = new WeakSet();
  createProspectCart_fn = function() {
    __privateGet(this, _logger10).info("Creating prospect cart");
    const cartData = __privateGet(this, _app5).state.getState("cart");
    if (!cartData || !cartData.items || cartData.items.length === 0) {
      __privateGet(this, _logger10).warn("No cart items available, skipping cart creation");
      __privateSet(this, _cartAttempted, false);
      return;
    }
    const attributionData = cartData.attribution || {};
    __privateGet(this, _logger10).debug("Using attribution data from state", attributionData);
    const firstName = __privateGet(this, _fields).firstName ? __privateGet(this, _fields).firstName.value : "";
    const lastName = __privateGet(this, _fields).lastName ? __privateGet(this, _fields).lastName.value : "";
    const email = __privateGet(this, _fields).email ? __privateGet(this, _fields).email.value : "";
    const phone = __privateMethod(this, _getPhoneNumber, getPhoneNumber_fn).call(this);
    __privateMethod(this, _updateUserState, updateUserState_fn).call(this, email, firstName, lastName, phone);
    const prospectCartData = {
      lines: cartData.items.map((item) => {
        const lineItem = {
          package_id: item.id,
          quantity: item.quantity || 1
        };
        if (item.is_upsell === true) {
          lineItem.is_upsell = true;
          __privateGet(this, _logger10).debug(`Adding upsell item to prospect cart: ${item.id}`);
        }
        return lineItem;
      }),
      user: {
        first_name: firstName,
        last_name: lastName,
        email
      },
      attribution: attributionData
    };
    if (phone) {
      prospectCartData.user.phone_number = phone;
    } else {
      __privateGet(this, _logger10).warn("Invalid phone number format - sending cart without phone number");
    }
    if (cartData.shippingMethod) {
      prospectCartData.shipping_method = cartData.shippingMethod.code || cartData.shippingMethod.id;
    }
    const addressData = __privateMethod(this, _getValidAddressData, getValidAddressData_fn).call(this);
    if (addressData && Object.keys(addressData).length > 0) {
      if (__privateMethod(this, _isAddressValid, isAddressValid_fn).call(this, addressData)) {
        __privateGet(this, _logger10).debug("Adding valid address data to cart");
        prospectCartData.address = addressData;
      } else {
        __privateGet(this, _logger10).info("Address data is incomplete or invalid - sending cart with user info only");
      }
    } else {
      __privateGet(this, _logger10).debug("No address data available - sending cart with user info only");
    }
    __privateMethod(this, _createCartViaApi, createCartViaApi_fn).call(this, prospectCartData);
  };
  _updateUserState = new WeakSet();
  updateUserState_fn = function(email, firstName, lastName, phone) {
    if (!__privateGet(this, _app5).state) {
      __privateGet(this, _logger10).warn("State manager not available, cannot update user state");
      return;
    }
    try {
      const currentUser = __privateGet(this, _app5).state.getState("user") || {};
      const updatedUser = {
        ...currentUser,
        email: email || currentUser.email,
        firstName: firstName || currentUser.firstName,
        lastName: lastName || currentUser.lastName,
        phone: phone || currentUser.phone
      };
      __privateGet(this, _app5).state.setState("user", updatedUser);
      __privateGet(this, _logger10).debug("Updated user state with user information", updatedUser);
    } catch (error) {
      __privateGet(this, _logger10).error("Error updating user state:", error);
    }
  };
  _isAddressValid = new WeakSet();
  isAddressValid_fn = function(address) {
    if (address.country === "US" && (!address.postcode || !__privateMethod(this, _isValidPostalCode, isValidPostalCode_fn).call(this, address.postcode, "US"))) {
      __privateGet(this, _logger10).warn("US address requires a valid postal code");
      return false;
    }
    return true;
  };
  _getValidAddressData = new WeakSet();
  getValidAddressData_fn = function() {
    const country = __privateGet(this, _fields).country && __privateGet(this, _fields).country.value ? __privateGet(this, _fields).country.value : "";
    const postalCode = __privateGet(this, _fields).postal && __privateGet(this, _fields).postal.value ? __privateGet(this, _fields).postal.value : "";
    if (country === "US" && postalCode && !__privateMethod(this, _isValidPostalCode, isValidPostalCode_fn).call(this, postalCode, country)) {
      __privateGet(this, _logger10).warn(`Invalid postal code for US: ${postalCode} - omitting all address data`);
      return null;
    }
    const address = {};
    if (__privateGet(this, _fields).firstName && __privateGet(this, _fields).firstName.value) {
      address.first_name = __privateGet(this, _fields).firstName.value;
    }
    if (__privateGet(this, _fields).lastName && __privateGet(this, _fields).lastName.value) {
      address.last_name = __privateGet(this, _fields).lastName.value;
    }
    const phone = __privateMethod(this, _getPhoneNumber, getPhoneNumber_fn).call(this);
    if (phone) {
      address.phone_number = phone;
    }
    if (__privateGet(this, _fields).address1 && __privateGet(this, _fields).address1.value) {
      address.line1 = __privateGet(this, _fields).address1.value;
    }
    if (__privateGet(this, _fields).address2 && __privateGet(this, _fields).address2.value) {
      address.line2 = __privateGet(this, _fields).address2.value;
    }
    if (__privateGet(this, _fields).city && __privateGet(this, _fields).city.value) {
      address.line4 = __privateGet(this, _fields).city.value;
    }
    if (__privateGet(this, _fields).province && __privateGet(this, _fields).province.value) {
      address.state = __privateGet(this, _fields).province.value;
    }
    if (country) {
      address.country = country;
    }
    if (postalCode && (!country || __privateMethod(this, _isValidPostalCode, isValidPostalCode_fn).call(this, postalCode, country))) {
      address.postcode = postalCode;
    }
    return address;
  };
  _isValidPostalCode = new WeakSet();
  isValidPostalCode_fn = function(postalCode, country) {
    if (!postalCode || !country) {
      return true;
    }
    switch (country.toUpperCase()) {
      case "US":
        return /^\d{5}(-\d{4})?$/.test(postalCode);
      case "CA":
        return /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/.test(postalCode);
      case "GB":
      case "UK":
        return /^[A-Z]{1,2}[0-9][A-Z0-9]? ?[0-9][A-Z]{2}$/i.test(postalCode);
      case "AU":
        return /^\d{4}$/.test(postalCode);
      case "NZ":
        return /^\d{4}$/.test(postalCode);
      case "DE":
        return /^\d{5}$/.test(postalCode);
      case "FR":
        return /^\d{5}$/.test(postalCode);
      default:
        return postalCode.trim().length > 0;
    }
  };
  _getPhoneNumber = new WeakSet();
  getPhoneNumber_fn = function() {
    if (!__privateGet(this, _fields).phone)
      return "";
    if (__privateGet(this, _fields).phone.iti && typeof __privateGet(this, _fields).phone.iti.getNumber === "function") {
      const number = __privateGet(this, _fields).phone.iti.getNumber();
      if (__privateGet(this, _fields).phone.iti.isValidNumber()) {
        return number;
      }
      return "";
    }
    const value = __privateGet(this, _fields).phone.value;
    if (!value)
      return "";
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    return phoneRegex.test(value.replace(/\D/g, "")) ? value : "";
  };
  _createCartViaApi = new WeakSet();
  createCartViaApi_fn = function(cartData) {
    if (!__privateGet(this, _app5).api || typeof __privateGet(this, _app5).api.createCart !== "function") {
      __privateGet(this, _logger10).error("API client not available");
      __privateSet(this, _cartAttempted, false);
      return;
    }
    __privateGet(this, _logger10).debug("Sending cart data to API", cartData);
    __privateGet(this, _app5).api.createCart(cartData).then((response) => {
      __privateGet(this, _logger10).info("Prospect cart created successfully", response);
      __privateSet(this, _cartCreated, true);
      if (__privateGet(this, _app5).events) {
        __privateGet(this, _app5).events.trigger("prospect.cartCreated", {
          cart: response
        });
        if (!__privateGet(this, _beginCheckoutFired)) {
          __privateGet(this, _logger10).info("Triggering beginCheckout event for analytics");
          __privateGet(this, _app5).events.beginCheckout();
          __privateSet(this, _beginCheckoutFired, true);
        } else {
          __privateGet(this, _logger10).debug("beginCheckout event already fired, skipping");
        }
      }
    }).catch((error) => {
      __privateGet(this, _logger10).error("Error creating prospect cart", error);
      __privateSet(this, _cartAttempted, false);
    });
  };

  // src/managers/CheckoutManager.js
  var _apiClient2, _logger11, _form4, _app6, _konamiCodeHandler, _initializeComponents, initializeComponents_fn, _initKonamiCodeHandler, initKonamiCodeHandler_fn, _triggerKonamiCodeEasterEgg, triggerKonamiCodeEasterEgg_fn, _initAddressHandler, initAddressHandler_fn, _initBillingAddressHandler, initBillingAddressHandler_fn, _initPaymentSelector, initPaymentSelector_fn, _initFormValidator, initFormValidator_fn, _initPaymentHandler, initPaymentHandler_fn, _initAddressAutocomplete, initAddressAutocomplete_fn, _initPhoneInputHandler, initPhoneInputHandler_fn, _initProspectCartHandler, initProspectCartHandler_fn, _injectBillingFormFields, injectBillingFormFields_fn, _setupEventListeners3, setupEventListeners_fn3, _handleSubmit2, handleSubmit_fn2, _disableSubmitButtons, disableSubmitButtons_fn;
  var CheckoutPage = class {
    constructor(apiClient, logger, app) {
      __privateAdd(this, _initializeComponents);
      /**
       * Initialize the Konami code handler
       */
      __privateAdd(this, _initKonamiCodeHandler);
      /**
       * Trigger the Konami code Easter egg - create a test order with predefined data
       */
      __privateAdd(this, _triggerKonamiCodeEasterEgg);
      __privateAdd(this, _initAddressHandler);
      __privateAdd(this, _initBillingAddressHandler);
      __privateAdd(this, _initPaymentSelector);
      __privateAdd(this, _initFormValidator);
      __privateAdd(this, _initPaymentHandler);
      __privateAdd(this, _initAddressAutocomplete);
      __privateAdd(this, _initPhoneInputHandler);
      __privateAdd(this, _initProspectCartHandler);
      /**
       * Fix billing form by duplicating shipping form fields
       * This ensures the billing form has the correct field attributes
       */
      __privateAdd(this, _injectBillingFormFields);
      __privateAdd(this, _setupEventListeners3);
      __privateAdd(this, _handleSubmit2);
      /**
       * Disable all submit buttons in the form to prevent accidental form submission
       * @private
       */
      __privateAdd(this, _disableSubmitButtons);
      __privateAdd(this, _apiClient2, void 0);
      __privateAdd(this, _logger11, void 0);
      __privateAdd(this, _form4, void 0);
      __privateAdd(this, _app6, void 0);
      __privateAdd(this, _konamiCodeHandler, void 0);
      __privateSet(this, _apiClient2, apiClient);
      __privateSet(this, _logger11, logger);
      __privateSet(this, _app6, app);
      __privateSet(this, _form4, document.querySelector('form[os-checkout="form"]') || document.querySelector("form#combo_form"));
      if (!__privateGet(this, _form4)) {
        __privateGet(this, _logger11).warn('No checkout form found with [os-checkout="form"] selector or form#combo_form');
        return;
      }
      __privateGet(this, _form4).removeAttribute("action");
      __privateGet(this, _form4).setAttribute("method", "post");
      __privateGet(this, _form4).setAttribute("novalidate", "novalidate");
      const hiddenInput = document.createElement("input");
      hiddenInput.type = "hidden";
      hiddenInput.name = "js_enabled";
      hiddenInput.value = "true";
      __privateGet(this, _form4).appendChild(hiddenInput);
      const preventSerializationInput = document.createElement("input");
      preventSerializationInput.type = "hidden";
      preventSerializationInput.name = "prevent_serialization";
      preventSerializationInput.value = "true";
      __privateGet(this, _form4).appendChild(preventSerializationInput);
      const preventSubmit = (e) => {
        if (e) {
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();
        }
        __privateGet(this, _form4).removeAttribute("action");
        __privateGet(this, _form4).setAttribute("method", "post");
        if (typeof window.stop === "function") {
          window.stop();
        }
        __privateGet(this, _logger11).debug("Form direct submission prevented");
        return false;
      };
      __privateGet(this, _form4).addEventListener("submit", preventSubmit, true);
      __privateGet(this, _form4).onsubmit = preventSubmit;
      __privateMethod(this, _disableSubmitButtons, disableSubmitButtons_fn).call(this);
      __privateGet(this, _logger11).debug("CheckoutPage initialized with form found");
      __privateMethod(this, _initializeComponents, initializeComponents_fn).call(this);
      __privateMethod(this, _initKonamiCodeHandler, initKonamiCodeHandler_fn).call(this);
    }
  };
  _apiClient2 = new WeakMap();
  _logger11 = new WeakMap();
  _form4 = new WeakMap();
  _app6 = new WeakMap();
  _konamiCodeHandler = new WeakMap();
  _initializeComponents = new WeakSet();
  initializeComponents_fn = function() {
    try {
      __privateMethod(this, _injectBillingFormFields, injectBillingFormFields_fn).call(this);
      __privateMethod(this, _initAddressHandler, initAddressHandler_fn).call(this);
      __privateMethod(this, _initBillingAddressHandler, initBillingAddressHandler_fn).call(this);
      __privateMethod(this, _initPaymentSelector, initPaymentSelector_fn).call(this);
      __privateMethod(this, _initFormValidator, initFormValidator_fn).call(this);
      __privateMethod(this, _initPaymentHandler, initPaymentHandler_fn).call(this);
      __privateMethod(this, _initAddressAutocomplete, initAddressAutocomplete_fn).call(this);
      __privateMethod(this, _initPhoneInputHandler, initPhoneInputHandler_fn).call(this);
      __privateMethod(this, _initProspectCartHandler, initProspectCartHandler_fn).call(this);
      __privateMethod(this, _setupEventListeners3, setupEventListeners_fn3).call(this);
      document.dispatchEvent(new CustomEvent("os:checkout.ready", {
        detail: { checkoutPage: this }
      }));
      __privateGet(this, _logger11).info("Checkout page components initialized successfully");
    } catch (error) {
      __privateGet(this, _logger11).error("Error initializing checkout components", error);
    }
  };
  _initKonamiCodeHandler = new WeakSet();
  initKonamiCodeHandler_fn = function() {
    try {
      __privateSet(this, _konamiCodeHandler, new KonamiCodeHandler({
        callback: () => __privateMethod(this, _triggerKonamiCodeEasterEgg, triggerKonamiCodeEasterEgg_fn).call(this),
        logger: __privateGet(this, _logger11)
      }));
      __privateGet(this, _logger11).debug("Konami code handler initialized");
    } catch (error) {
      __privateGet(this, _logger11).error("Error initializing Konami code handler:", error);
    }
  };
  _triggerKonamiCodeEasterEgg = new WeakSet();
  triggerKonamiCodeEasterEgg_fn = function() {
    try {
      __privateGet(this, _logger11).info("🎮 Konami code activated! Creating test order...");
      const messageElement = KonamiCodeHandler.showActivationMessage();
      setTimeout(() => {
        document.body.removeChild(messageElement);
        if (this.paymentHandler) {
          KonamiCodeHandler.setTestMode();
          this.paymentHandler.processPayment();
          __privateGet(this, _logger11).info("Konami code test order initiated");
        } else {
          __privateGet(this, _logger11).error("Payment handler not initialized, cannot create test order");
          alert("Could not create test order: Payment handler not initialized");
        }
      }, 2e3);
    } catch (error) {
      __privateGet(this, _logger11).error("Error triggering Konami code Easter egg:", error);
    }
  };
  _initAddressHandler = new WeakSet();
  initAddressHandler_fn = function() {
    try {
      this.addressHandler = new AddressHandler(__privateGet(this, _form4), __privateGet(this, _logger11));
    } catch (error) {
      __privateGet(this, _logger11).error("Error initializing AddressHandler", error);
    }
  };
  _initBillingAddressHandler = new WeakSet();
  initBillingAddressHandler_fn = function() {
    try {
      this.billingAddressHandler = new BillingAddressHandler(__privateGet(this, _app6));
      if (__privateGet(this, _form4) && this.billingAddressHandler) {
        __privateGet(this, _form4).__billingAddressHandler = this.billingAddressHandler;
        __privateGet(this, _logger11).debug("BillingAddressHandler initialized and attached to form");
      }
    } catch (error) {
      __privateGet(this, _logger11).error("Error initializing BillingAddressHandler", error);
    }
  };
  _initPaymentSelector = new WeakSet();
  initPaymentSelector_fn = function() {
    try {
      this.paymentSelector = new PaymentSelector(__privateGet(this, _logger11));
    } catch (error) {
      __privateGet(this, _logger11).error("Error initializing PaymentSelector", error);
    }
  };
  _initFormValidator = new WeakSet();
  initFormValidator_fn = function() {
    try {
      this.formValidator = new FormValidator({
        debugMode: window.location.search.includes("debug=true"),
        logger: __privateGet(this, _logger11)
      });
      if (__privateGet(this, _form4) && this.formValidator) {
        __privateGet(this, _form4).__formValidator = this.formValidator;
        __privateGet(this, _logger11).debug("FormValidator initialized and attached to form");
      }
    } catch (error) {
      __privateGet(this, _logger11).error("Error initializing FormValidator", error);
    }
  };
  _initPaymentHandler = new WeakSet();
  initPaymentHandler_fn = function() {
    try {
      this.paymentHandler = new PaymentHandler(__privateGet(this, _apiClient2), __privateGet(this, _logger11), __privateGet(this, _app6));
    } catch (error) {
      __privateGet(this, _logger11).error("Error initializing PaymentHandler", error);
    }
  };
  _initAddressAutocomplete = new WeakSet();
  initAddressAutocomplete_fn = function() {
    try {
      const googleMapsOptions = {
        enableGoogleMapsAutocomplete: __privateGet(this, _app6).options.enableGoogleMapsAutocomplete
      };
      this.addressAutocomplete = new AddressAutocomplete(__privateGet(this, _logger11), googleMapsOptions);
    } catch (error) {
      __privateGet(this, _logger11).error("Error initializing AddressAutocomplete", error);
    }
  };
  _initPhoneInputHandler = new WeakSet();
  initPhoneInputHandler_fn = function() {
    try {
      this.phoneInputHandler = new PhoneInputHandler(__privateGet(this, _logger11));
    } catch (error) {
      __privateGet(this, _logger11).error("Error initializing PhoneInputHandler", error);
    }
  };
  _initProspectCartHandler = new WeakSet();
  initProspectCartHandler_fn = function() {
    try {
      if (__privateGet(this, _app6)) {
        this.prospectCartHandler = new ProspectCartHandler(__privateGet(this, _app6));
        __privateGet(this, _logger11).info("ProspectCartHandler initialized");
      } else {
        __privateGet(this, _logger11).warn("App instance not provided, ProspectCartHandler not initialized");
      }
    } catch (error) {
      __privateGet(this, _logger11).error("Error initializing ProspectCartHandler", error);
    }
  };
  _injectBillingFormFields = new WeakSet();
  injectBillingFormFields_fn = function() {
    try {
      __privateGet(this, _logger11).info("Fixing billing form by duplicating shipping form");
      const shippingForm = document.querySelector('[os-checkout-component="shipping-form"]');
      const billingContainer = document.querySelector('[os-checkout-component="billing-form"]');
      if (shippingForm && billingContainer) {
        __privateGet(this, _logger11).info(`Found shipping form and billing container`);
        const billingForm = shippingForm.cloneNode(true);
        const fieldMap = {
          "fname": "billing-fname",
          "lname": "billing-lname",
          "address1": "billing-address1",
          "address2": "billing-address2",
          "city": "billing-city",
          "province": "billing-province",
          "postal": "billing-postal",
          "country": "billing-country",
          "phone": "billing-phone"
        };
        billingForm.querySelectorAll("input, select").forEach((field) => {
          const fieldAttr = field.getAttribute("os-checkout-field");
          if (fieldAttr && fieldMap[fieldAttr]) {
            field.setAttribute("os-checkout-field", fieldMap[fieldAttr]);
            if (field.id) {
              field.id = "billing_" + field.id;
            }
            if (field.name) {
              field.name = "billing_" + field.name;
            }
            if (field.getAttribute("data-name")) {
              field.setAttribute("data-name", "Billing " + field.getAttribute("data-name"));
            }
            if (field.getAttribute("autocomplete")) {
              field.setAttribute("autocomplete", "billing " + field.getAttribute("autocomplete"));
            }
          }
        });
        const locationContainer = billingForm.querySelector('[data-os-component="location"]');
        if (locationContainer) {
          locationContainer.setAttribute("data-os-component", "billing-location");
        }
        billingContainer.innerHTML = "";
        billingContainer.appendChild(billingForm);
        __privateGet(this, _logger11).info("Billing form successfully created from shipping form");
      } else {
        __privateGet(this, _logger11).warn("Could not fix billing form - shipping form or billing container not found");
        __privateGet(this, _logger11).warn(`Shipping form found: ${!!shippingForm}, Billing container found: ${!!billingContainer}`);
        const allComponents = document.querySelectorAll("[os-checkout-component]");
        __privateGet(this, _logger11).warn(`Found ${allComponents.length} checkout components:`);
        allComponents.forEach((comp) => {
          __privateGet(this, _logger11).warn(`- ${comp.getAttribute("os-checkout-component")}`);
        });
      }
    } catch (error) {
      __privateGet(this, _logger11).error("Error fixing billing form:", error);
    }
  };
  _setupEventListeners3 = new WeakSet();
  setupEventListeners_fn3 = function() {
    try {
      document.addEventListener("payment-method-changed", (e) => {
        __privateGet(this, _logger11).debug(`Payment method changed to: ${e.detail.mode}`);
        const container = document.querySelector("[os-payment-mode]");
        container?.setAttribute("os-payment-mode", e.detail.mode);
      });
      if (__privateGet(this, _form4)) {
        __privateGet(this, _form4).addEventListener("submit", (e) => __privateMethod(this, _handleSubmit2, handleSubmit_fn2).call(this, e));
        __privateGet(this, _logger11).debug("Form submit event listener attached");
      }
      if (__privateGet(this, _app6) && __privateGet(this, _app6).events && this.prospectCartHandler) {
        __privateGet(this, _app6).events.on("prospect.cartCreated", (data) => {
          __privateGet(this, _logger11).info("Prospect cart created successfully", data);
        });
      }
      if (__privateGet(this, _app6) && __privateGet(this, _app6).events) {
        __privateGet(this, _app6).events.on("order.created", (data) => {
          __privateGet(this, _logger11).info("Order created successfully", data);
        });
      }
    } catch (error) {
      __privateGet(this, _logger11).error("Error setting up event listeners:", error);
    }
  };
  _handleSubmit2 = new WeakSet();
  handleSubmit_fn2 = function(event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
    }
    __privateGet(this, _logger11).debug("Form submission intercepted by #handleSubmit");
    if (__privateGet(this, _form4)) {
      __privateGet(this, _form4).removeAttribute("action");
      __privateGet(this, _form4).setAttribute("method", "post");
      const preventSubmit = (e) => {
        if (e) {
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();
        }
        if (__privateGet(this, _form4)) {
          __privateGet(this, _form4).removeAttribute("action");
          __privateGet(this, _form4).setAttribute("method", "post");
        }
        if (typeof window.stop === "function") {
          window.stop();
        }
        __privateGet(this, _logger11).debug("Form direct submission prevented");
        return false;
      };
      __privateGet(this, _form4).onsubmit = preventSubmit;
    }
    if (this.formValidator && !this.formValidator.validateAllFields()) {
      __privateGet(this, _logger11).warn("Form validation failed, stopping submission");
      return false;
    }
    if (this.paymentHandler) {
      __privateGet(this, _logger11).debug("Delegating to paymentHandler.processPayment()");
      this.paymentHandler.processPayment();
    } else {
      __privateGet(this, _logger11).error("Payment handler not initialized");
    }
    return false;
  };
  _disableSubmitButtons = new WeakSet();
  disableSubmitButtons_fn = function() {
    try {
      if (!__privateGet(this, _form4))
        return;
      const submitButtons = __privateGet(this, _form4).querySelectorAll('button[type="submit"], input[type="submit"]');
      if (submitButtons.length > 0) {
        __privateGet(this, _logger11).debug(`Found ${submitButtons.length} submit buttons, converting to type="button"`);
        submitButtons.forEach((button, index) => {
          button.setAttribute("type", "button");
          button.addEventListener("click", (e) => {
            e.preventDefault();
            __privateGet(this, _logger11).debug(`Submit button ${index + 1} clicked, delegating to payment handler`);
            if (this.paymentHandler) {
              this.paymentHandler.processPayment();
            } else {
              __privateGet(this, _logger11).error("Payment handler not initialized");
            }
          });
          __privateGet(this, _logger11).debug(`Converted submit button ${index + 1} to type="button"`);
        });
      } else {
        __privateGet(this, _logger11).debug("No submit buttons found in the form");
      }
    } catch (error) {
      __privateGet(this, _logger11).error("Error disabling submit buttons:", error);
    }
  };

  // src/helpers/CampaignHelper.js
  var _app7, _logger12, _viewItemListFired;
  var CampaignHelper = class {
    constructor(app) {
      __privateAdd(this, _app7, void 0);
      __privateAdd(this, _logger12, void 0);
      __privateAdd(this, _viewItemListFired, false);
      __privateSet(this, _app7, app);
      __privateSet(this, _logger12, app.logger.createModuleLogger("CAMPAIGN"));
    }
    getCampaignData() {
      const campaignData = __privateGet(this, _app7).campaignData;
      if (campaignData && !__privateGet(this, _viewItemListFired) && __privateGet(this, _app7).events?.viewItemList) {
        __privateGet(this, _logger12).debug("Triggering view_item_list event from getCampaignData");
        /* @__PURE__ */ console.log("🔍 Triggering view_item_list from getCampaignData", campaignData);
        setTimeout(() => {
          __privateGet(this, _app7).events.viewItemList(campaignData);
          __privateSet(this, _viewItemListFired, true);
          /* @__PURE__ */ console.log("✅ view_item_list triggered from getCampaignData");
        }, 500);
      }
      return campaignData;
    }
    getCampaignName() {
      return __privateGet(this, _app7).campaignData?.name ?? "";
    }
    getCampaignId() {
      return __privateGet(this, _app7).campaignData?.id ?? "";
    }
    getProducts() {
      const products = __privateGet(this, _app7).campaignData?.products ?? [];
      if (products.length > 0 && !__privateGet(this, _viewItemListFired) && __privateGet(this, _app7).events?.viewItemList) {
        __privateGet(this, _logger12).debug("Triggering view_item_list event from getProducts");
        /* @__PURE__ */ console.log("🔍 Triggering view_item_list from getProducts", __privateGet(this, _app7).campaignData);
        setTimeout(() => {
          __privateGet(this, _app7).events.viewItemList(__privateGet(this, _app7).campaignData);
          __privateSet(this, _viewItemListFired, true);
          /* @__PURE__ */ console.log("✅ view_item_list triggered from getProducts");
        }, 500);
      }
      return products;
    }
    getProductById(productId) {
      return this.getProducts().find((product) => product.id === productId);
    }
    getCurrency() {
      return __privateGet(this, _app7).campaignData?.currency ?? "USD";
    }
    getLocale() {
      return __privateGet(this, _app7).campaignData?.locale ?? "en-US";
    }
    formatPrice(price) {
      if (typeof price !== "number")
        return "";
      try {
        return new Intl.NumberFormat(this.getLocale(), {
          style: "currency",
          currency: this.getCurrency()
        }).format(price);
      } catch (error) {
        __privateGet(this, _logger12).error("Error formatting price:", error);
        return price.toString();
      }
    }
    /**
     * Manually trigger the view_item_list event
     */
    triggerViewItemList() {
      if (!__privateGet(this, _app7).campaignData) {
        __privateGet(this, _logger12).warn("Cannot trigger view_item_list: No campaign data available");
        return;
      }
      if (!__privateGet(this, _app7).events?.viewItemList) {
        __privateGet(this, _logger12).warn("Cannot trigger view_item_list: EventManager not initialized");
        return;
      }
      __privateGet(this, _logger12).debug("Manually triggering view_item_list event");
      __privateGet(this, _app7).events.viewItemList(__privateGet(this, _app7).campaignData);
      __privateSet(this, _viewItemListFired, true);
    }
  };
  _app7 = new WeakMap();
  _logger12 = new WeakMap();
  _viewItemListFired = new WeakMap();

  // src/managers/StateManager.js
  var _app8, _logger13, _state, _subscribers, _initDefaultState, initDefaultState_fn, _loadState, loadState_fn, _saveState, saveState_fn, _notifySubscribers, notifySubscribers_fn, _updateExistingItem, updateExistingItem_fn, _calculateCartTotals, calculateCartTotals_fn, _recalculateCart, recalculateCart_fn;
  var StateManager = class {
    constructor(app) {
      __privateAdd(this, _initDefaultState);
      __privateAdd(this, _loadState);
      __privateAdd(this, _saveState);
      __privateAdd(this, _notifySubscribers);
      __privateAdd(this, _updateExistingItem);
      __privateAdd(this, _calculateCartTotals);
      __privateAdd(this, _recalculateCart);
      __privateAdd(this, _app8, void 0);
      __privateAdd(this, _logger13, void 0);
      __privateAdd(this, _state, void 0);
      __privateAdd(this, _subscribers, {});
      __privateSet(this, _app8, app);
      __privateSet(this, _logger13, app.logger.createModuleLogger("STATE"));
      __privateSet(this, _state, __privateMethod(this, _initDefaultState, initDefaultState_fn).call(this));
      __privateMethod(this, _loadState, loadState_fn).call(this);
      __privateMethod(this, _recalculateCart, recalculateCart_fn).call(this, false);
      __privateGet(this, _logger13).info("StateManager initialized");
    }
    getState(path = null) {
      if (!path)
        return { ...__privateGet(this, _state), cart: { ...__privateGet(this, _state).cart, totals: __privateMethod(this, _calculateCartTotals, calculateCartTotals_fn).call(this) } };
      if (path === "cart")
        return { ...__privateGet(this, _state).cart, totals: __privateMethod(this, _calculateCartTotals, calculateCartTotals_fn).call(this) };
      if (path === "cart.totals" || path.startsWith("cart.totals."))
        return __privateMethod(this, _calculateCartTotals, calculateCartTotals_fn).call(this);
      return path.split(".").reduce((obj, key) => obj?.[key] ?? null, __privateGet(this, _state));
    }
    setState(path, value, notify = true) {
      let current = __privateGet(this, _state);
      const parts = path.split(".");
      for (const [i, part] of parts.entries()) {
        if (i === parts.length - 1) {
          current[part] = value;
        } else {
          current[part] ?? (current[part] = {});
          current = current[part];
        }
      }
      if (path.startsWith("cart.items"))
        __privateMethod(this, _recalculateCart, recalculateCart_fn).call(this, false);
      __privateMethod(this, _saveState, saveState_fn).call(this);
      if (notify) {
        __privateMethod(this, _notifySubscribers, notifySubscribers_fn).call(this, path, value);
        if (path.startsWith("cart.items"))
          __privateMethod(this, _notifySubscribers, notifySubscribers_fn).call(this, "cart", this.getState("cart"));
      }
      return this;
    }
    subscribe(path, callback) {
      var _a;
      (_a = __privateGet(this, _subscribers))[path] ?? (_a[path] = []);
      __privateGet(this, _subscribers)[path].push(callback);
      try {
        callback(this.getState(path), path);
      } catch (error) {
        __privateGet(this, _logger13).error(`Error in initial subscriber callback for ${path}:`, error);
      }
      return () => __privateGet(this, _subscribers)[path] = __privateGet(this, _subscribers)[path].filter((cb) => cb !== callback);
    }
    clearState() {
      __privateSet(this, _state, __privateMethod(this, _initDefaultState, initDefaultState_fn).call(this));
      sessionStorage.removeItem("os_state");
      __privateMethod(this, _notifySubscribers, notifySubscribers_fn).call(this, "*", __privateGet(this, _state));
      __privateGet(this, _logger13).info("State cleared");
    }
    addToCart(item) {
      if (!item?.id || !item.name || item.price === void 0) {
        __privateGet(this, _logger13).error("Invalid item:", item);
        throw new Error("Invalid item. Must have id, name, and price.");
      }
      const cart = this.getState("cart");
      const packageData = __privateGet(this, _app8).campaignData?.packages?.find(
        (pkg) => pkg.ref_id.toString() === item.id.toString() || pkg.external_id?.toString() === item.id.toString()
      );
      const enhancedItem = {
        ...item,
        ...packageData && {
          name: packageData.name || item.name,
          price: Number.parseFloat(packageData.price) || item.price,
          price_total: Number.parseFloat(packageData.price_total) || item.price * (item.quantity || 1),
          retail_price: Number.parseFloat(packageData.price_retail) ?? void 0,
          retail_price_total: Number.parseFloat(packageData.price_retail_total) ?? void 0,
          is_recurring: packageData.is_recurring ?? false,
          price_recurring: packageData.price_recurring ? Number.parseFloat(packageData.price_recurring) : void 0,
          price_recurring_total: packageData.price_recurring_total ? Number.parseFloat(packageData.price_recurring_total) : void 0,
          interval: packageData.interval ?? void 0,
          interval_count: packageData.interval_count ?? void 0,
          image: packageData.image || item.image,
          external_id: packageData.external_id ?? void 0
        },
        quantity: item.quantity || 1
      };
      const existingItemIndex = cart.items.findIndex((i) => i.id === item.id);
      const updatedItems = existingItemIndex >= 0 ? __privateMethod(this, _updateExistingItem, updateExistingItem_fn).call(this, cart.items, existingItemIndex, enhancedItem) : [...cart.items, enhancedItem];
      this.setState("cart.items", updatedItems);
      __privateGet(this, _logger13).info(`Item added to cart: ${enhancedItem.name}`);
      __privateGet(this, _app8).triggerEvent("cart.updated", { cart: this.getState("cart") });
      return this.getState("cart");
    }
    updateCartItem(itemId, updates) {
      const cart = this.getState("cart");
      const itemIndex = cart.items.findIndex((item) => item.id === itemId);
      if (itemIndex === -1) {
        __privateGet(this, _logger13).error(`Item not found in cart: ${itemId}`);
        throw new Error(`Item not found in cart: ${itemId}`);
      }
      const updatedItems = [...cart.items];
      updatedItems[itemIndex] = { ...updatedItems[itemIndex], ...updates };
      if (updatedItems[itemIndex].quantity === 0)
        updatedItems.splice(itemIndex, 1);
      this.setState("cart.items", updatedItems);
      __privateGet(this, _logger13).info(`Cart item updated: ${itemId}`);
      __privateGet(this, _app8).triggerEvent("cart.updated", { cart: this.getState("cart") });
      return this.getState("cart");
    }
    removeFromCart(itemId) {
      const updatedItems = this.getState("cart").items.filter((item) => item.id !== itemId);
      this.setState("cart.items", updatedItems);
      __privateGet(this, _logger13).info(`Item removed from cart: ${itemId}`);
      __privateGet(this, _app8).triggerEvent("cart.updated", { cart: this.getState("cart") });
      return this.getState("cart");
    }
    clearCart() {
      this.setState("cart.items", []);
      this.setState("cart.couponCode", null);
      this.setState("cart.shippingMethod", null);
      __privateGet(this, _logger13).info("Cart cleared");
      __privateGet(this, _app8).triggerEvent("cart.updated", { cart: this.getState("cart") });
      return this.getState("cart");
    }
    setShippingMethod(shippingMethod) {
      this.setState("cart.shippingMethod", shippingMethod);
      __privateGet(this, _logger13).info(`Shipping method set: ${shippingMethod.code}`);
      __privateGet(this, _app8).triggerEvent("cart.updated", { cart: this.getState("cart") });
      return this.getState("cart");
    }
    applyCoupon(couponCode) {
      this.setState("cart.couponCode", couponCode);
      __privateGet(this, _logger13).info(`Coupon applied: ${couponCode}`);
      __privateGet(this, _app8).triggerEvent("cart.updated", { cart: this.getState("cart") });
      return this.getState("cart");
    }
    removeCoupon() {
      this.setState("cart.couponCode", null);
      __privateGet(this, _logger13).info("Coupon removed");
      __privateGet(this, _app8).triggerEvent("cart.updated", { cart: this.getState("cart") });
      return this.getState("cart");
    }
    isItemInCart(itemId) {
      return __privateGet(this, _state).cart.items.some((item) => item.id === itemId);
    }
    getCartForApi() {
      const { items, shippingMethod, couponCode, attribution } = this.getState("cart");
      const { email, firstName, lastName, phone } = this.getState("user");
      return {
        lines: items.map((item) => ({ product_id: item.id, quantity: item.quantity || 1, price: item.price })),
        shipping_method: shippingMethod?.code ?? null,
        coupon_code: couponCode,
        user: { email, first_name: firstName, last_name: lastName, phone },
        attribution: attribution || {}
      };
    }
    async syncCartWithApi() {
      try {
        this.setState("ui.loading", true);
        const apiCart = this.getCartForApi();
        const response = await __privateGet(this, _app8).api.createCart(apiCart);
        __privateGet(this, _logger13).info("Cart synced with API");
        __privateGet(this, _app8).triggerEvent("cart.synced", { cart: response });
        return response;
      } catch (error) {
        __privateGet(this, _logger13).error("Error syncing cart with API:", error);
        this.setState("ui.errors.cart", error.message);
        throw error;
      } finally {
        this.setState("ui.loading", false);
      }
    }
  };
  _app8 = new WeakMap();
  _logger13 = new WeakMap();
  _state = new WeakMap();
  _subscribers = new WeakMap();
  _initDefaultState = new WeakSet();
  initDefaultState_fn = function() {
    return {
      cart: {
        items: [],
        totals: {
          subtotal: 0,
          retail_subtotal: 0,
          savings: 0,
          savings_percentage: 0,
          shipping: 0,
          tax: 0,
          total: 0,
          recurring_total: 0,
          currency: "USD",
          currency_symbol: "$"
        },
        shippingMethod: null,
        couponCode: null,
        attribution: {
          utm_source: "",
          utm_medium: "",
          utm_campaign: "",
          utm_content: "",
          utm_term: "",
          gclid: "",
          fbclid: "",
          sub1: "",
          sub2: "",
          sub3: "",
          sub4: "",
          sub5: "",
          referrer: "",
          landing_page: "",
          user_agent: "",
          device_type: "",
          fbc: "",
          fbp: ""
        }
      },
      user: { email: null, firstName: null, lastName: null, phone: null },
      ui: { loading: false, currentStep: "cart", errors: {} }
    };
  };
  _loadState = new WeakSet();
  loadState_fn = function() {
    try {
      const savedState = sessionStorage.getItem("os_state");
      if (savedState) {
        const parsedState = JSON.parse(savedState);
        __privateSet(this, _state, { ...__privateGet(this, _state), ...parsedState, ui: { ...__privateGet(this, _state).ui } });
        __privateGet(this, _logger13).info("State loaded from sessionStorage");
      }
    } catch (error) {
      __privateGet(this, _logger13).error("Error loading state from sessionStorage:", error);
    }
  };
  _saveState = new WeakSet();
  saveState_fn = function() {
    try {
      const stateToSave = {
        cart: { ...__privateGet(this, _state).cart, totals: __privateMethod(this, _calculateCartTotals, calculateCartTotals_fn).call(this) },
        user: __privateGet(this, _state).user
      };
      sessionStorage.setItem("os_state", JSON.stringify(stateToSave));
      __privateGet(this, _logger13).debug("State saved to sessionStorage");
    } catch (error) {
      __privateGet(this, _logger13).error("Error saving state to sessionStorage:", error);
    }
  };
  _notifySubscribers = new WeakSet();
  notifySubscribers_fn = function(path, value) {
    __privateGet(this, _logger13).debug(`Notifying subscribers for path: ${path}`);
    for (const [subPath, callbacks] of Object.entries(__privateGet(this, _subscribers))) {
      if (subPath === path || subPath === "*" || path.startsWith(`${subPath}.`)) {
        const subValue = subPath === "*" ? this.getState() : this.getState(subPath);
        callbacks.forEach((callback) => {
          try {
            callback(subValue, subPath);
          } catch (error) {
            __privateGet(this, _logger13).error(`Error in subscriber callback for ${subPath}:`, error);
          }
        });
      }
    }
  };
  _updateExistingItem = new WeakSet();
  updateExistingItem_fn = function(items, index, newItem) {
    const updatedItems = [...items];
    updatedItems[index] = {
      ...updatedItems[index],
      quantity: (updatedItems[index].quantity || 1) + (newItem.quantity || 1),
      price_total: updatedItems[index].price * (updatedItems[index].quantity || 1 + (newItem.quantity || 1)),
      ...updatedItems[index].retail_price && {
        retail_price_total: updatedItems[index].retail_price * (updatedItems[index].quantity || 1 + (newItem.quantity || 1))
      },
      ...updatedItems[index].price_recurring && {
        price_recurring_total: updatedItems[index].price_recurring * (updatedItems[index].quantity || 1 + (newItem.quantity || 1))
      }
    };
    return updatedItems;
  };
  _calculateCartTotals = new WeakSet();
  calculateCartTotals_fn = function() {
    const { items, shippingMethod } = __privateGet(this, _state).cart;
    const subtotal = items.reduce((acc, item) => acc + (item.price_total ?? item.price * (item.quantity || 1)), 0);
    const retailSubtotal = items.reduce((acc, item) => acc + (item.retail_price_total ?? (item.retail_price ?? item.price) * (item.quantity || 1)), 0);
    const savings = retailSubtotal - subtotal;
    const savingsPercentage = retailSubtotal > 0 ? savings / retailSubtotal * 100 : 0;
    const recurringTotal = items.reduce((acc, item) => acc + (item.is_recurring && item.price_recurring ? item.price_recurring * (item.quantity || 1) : 0), 0);
    const shipping = shippingMethod?.price ? Number.parseFloat(shippingMethod.price) : 0;
    const tax = 0;
    const total = subtotal + shipping + tax;
    const currency = __privateGet(this, _app8).campaignData?.currency ?? "USD";
    const currencySymbol = { USD: "$", EUR: "€", GBP: "£" }[currency] ?? "$";
    return {
      subtotal,
      retail_subtotal: retailSubtotal,
      savings,
      savings_percentage: savingsPercentage,
      shipping,
      tax,
      total,
      recurring_total: recurringTotal,
      currency,
      currency_symbol: currencySymbol
    };
  };
  _recalculateCart = new WeakSet();
  recalculateCart_fn = function(notify = true) {
    const totals = __privateMethod(this, _calculateCartTotals, calculateCartTotals_fn).call(this);
    __privateGet(this, _state).cart.totals = totals;
    __privateGet(this, _logger13).debug("Cart totals recalculated");
    if (notify) {
      __privateMethod(this, _notifySubscribers, notifySubscribers_fn).call(this, "cart.totals", totals);
      __privateMethod(this, _notifySubscribers, notifySubscribers_fn).call(this, "cart", this.getState("cart"));
    }
    return totals;
  };

  // src/managers/CartManager.js
  var _app9, _stateManager, _logger14, _cartElements, _initCartUI, initCartUI_fn, _updateCartUI, updateCartUI_fn, _createCartItemElement, createCartItemElement_fn, _addToCart, addToCart_fn, _updateCartItemQuantity, updateCartItemQuantity_fn, _removeFromCart, removeFromCart_fn;
  var CartManager = class {
    constructor(app) {
      __privateAdd(this, _initCartUI);
      __privateAdd(this, _updateCartUI);
      __privateAdd(this, _createCartItemElement);
      __privateAdd(this, _addToCart);
      __privateAdd(this, _updateCartItemQuantity);
      __privateAdd(this, _removeFromCart);
      __privateAdd(this, _app9, void 0);
      __privateAdd(this, _stateManager, void 0);
      __privateAdd(this, _logger14, void 0);
      __privateAdd(this, _cartElements, void 0);
      __privateSet(this, _app9, app);
      __privateSet(this, _stateManager, app.state);
      __privateSet(this, _logger14, app.logger.createModuleLogger("CART"));
      __privateMethod(this, _initCartUI, initCartUI_fn).call(this);
      __privateGet(this, _logger14).info("CartManager initialized");
    }
    clearCart() {
      try {
        return __privateGet(this, _stateManager).clearCart();
      } catch (error) {
        __privateGet(this, _logger14).error("Error clearing cart:", error);
        throw error;
      }
    }
    addToCart(item) {
      return __privateMethod(this, _addToCart, addToCart_fn).call(this, item);
    }
    removeFromCart(itemId) {
      return __privateMethod(this, _removeFromCart, removeFromCart_fn).call(this, itemId);
    }
    setShippingMethod(shippingMethod) {
      try {
        return __privateGet(this, _stateManager).setShippingMethod(shippingMethod);
      } catch (error) {
        __privateGet(this, _logger14).error("Error setting shipping method:", error);
        throw error;
      }
    }
    applyCoupon(couponCode) {
      try {
        return __privateGet(this, _stateManager).applyCoupon(couponCode);
      } catch (error) {
        __privateGet(this, _logger14).error("Error applying coupon:", error);
        throw error;
      }
    }
    removeCoupon() {
      try {
        return __privateGet(this, _stateManager).removeCoupon();
      } catch (error) {
        __privateGet(this, _logger14).error("Error removing coupon:", error);
        throw error;
      }
    }
    async syncCartWithApi() {
      try {
        return await __privateGet(this, _stateManager).syncCartWithApi();
      } catch (error) {
        __privateGet(this, _logger14).error("Error syncing cart with API:", error);
        throw error;
      }
    }
    isItemInCart(itemId) {
      return __privateGet(this, _stateManager).isItemInCart?.(itemId) ?? __privateGet(this, _stateManager).getState("cart").items.some((item) => item.id === itemId);
    }
    // #showMessage(message, type = 'success') {
    //   const messageElement = document.createElement('div');
    //   messageElement.className = `os-message os-message-${type}`;
    //   messageElement.textContent = message;
    //   document.body.appendChild(messageElement);
    //   setTimeout(() => {
    //     messageElement.classList.add('os-message-hide');
    //     setTimeout(() => document.body.removeChild(messageElement), 300);
    //   }, 3000);
    // }
  };
  _app9 = new WeakMap();
  _stateManager = new WeakMap();
  _logger14 = new WeakMap();
  _cartElements = new WeakMap();
  _initCartUI = new WeakSet();
  initCartUI_fn = function() {
    __privateSet(this, _cartElements, {
      addToCartButtons: document.querySelectorAll("[data-os-add-to-cart]"),
      cartCount: document.querySelectorAll("[data-os-cart-count]"),
      cartTotal: document.querySelectorAll("[data-os-cart-total]"),
      cartItems: document.querySelector("[data-os-cart-items]"),
      cartEmpty: document.querySelector("[data-os-cart-empty]"),
      cartContainer: document.querySelector("[data-os-cart-container]")
    });
    __privateGet(this, _cartElements).addToCartButtons.forEach((button) => {
      button.addEventListener("click", (event) => {
        event.preventDefault();
        const item = {
          id: button.getAttribute("data-os-product-id"),
          name: button.getAttribute("data-os-product-name"),
          price: Number.parseFloat(button.getAttribute("data-os-product-price")),
          quantity: Number.parseInt(button.getAttribute("data-os-product-quantity") ?? "1", 10)
        };
        if (item.id && item.name && item.price)
          __privateMethod(this, _addToCart, addToCart_fn).call(this, item);
        else
          __privateGet(this, _logger14).error("Invalid product data for add to cart button");
      });
    });
    __privateGet(this, _stateManager).subscribe("cart", () => __privateMethod(this, _updateCartUI, updateCartUI_fn).call(this));
    __privateMethod(this, _updateCartUI, updateCartUI_fn).call(this);
  };
  _updateCartUI = new WeakSet();
  updateCartUI_fn = function() {
    const cart = __privateGet(this, _stateManager).getState("cart");
    __privateGet(this, _cartElements).cartCount.forEach((element) => {
      const itemCount = cart.items.reduce((count, item) => count + (item.quantity || 1), 0);
      element.textContent = itemCount.toString();
      element.classList.toggle("hidden", itemCount === 0);
    });
    const formatPrice = (price) => __privateGet(this, _app9).campaign?.formatPrice(price) ?? price.toFixed(2);
    __privateGet(this, _cartElements).cartTotal.forEach((element) => element.textContent = formatPrice(cart.totals.total));
    const updateElement = (selector, value, hideIfZero = false) => {
      const element = document.querySelector(selector);
      if (element) {
        element.textContent = hideIfZero ? `${Math.round(value)}%` : formatPrice(value);
        if (hideIfZero && value === 0)
          element.parentElement?.classList.add("hidden");
        else
          element.parentElement?.classList.remove("hidden");
      }
    };
    updateElement("[data-os-cart-retail-subtotal]", cart.totals.retail_subtotal);
    updateElement("[data-os-cart-savings]", cart.totals.savings, true);
    updateElement("[data-os-cart-savings-percentage]", cart.totals.savings_percentage, true);
    updateElement("[data-os-cart-recurring-total]", cart.totals.recurring_total, true);
    updateElement("[data-os-cart-subtotal]", cart.totals.subtotal);
    updateElement("[data-os-cart-shipping]", cart.totals.shipping);
    if (__privateGet(this, _cartElements).cartItems) {
      __privateGet(this, _cartElements).cartItems.innerHTML = "";
      cart.items.forEach((item) => __privateGet(this, _cartElements).cartItems.appendChild(__privateMethod(this, _createCartItemElement, createCartItemElement_fn).call(this, item)));
    }
    if (__privateGet(this, _cartElements).cartEmpty && __privateGet(this, _cartElements).cartContainer) {
      const isEmpty = cart.items.length === 0;
      __privateGet(this, _cartElements).cartEmpty.classList.toggle("hidden", !isEmpty);
      __privateGet(this, _cartElements).cartContainer.classList.toggle("hidden", isEmpty);
    }
  };
  _createCartItemElement = new WeakSet();
  createCartItemElement_fn = function(item) {
    const formatPrice = (price2) => __privateGet(this, _app9).campaign?.formatPrice(price2) ?? price2.toFixed(2);
    const itemElement = document.createElement("div");
    itemElement.className = "os-cart-item";
    itemElement.setAttribute("data-os-cart-item-id", item.id);
    const price = formatPrice(item.price);
    const retailPrice = item.retail_price ? formatPrice(item.retail_price) : "";
    const total = formatPrice(item.price * (item.quantity || 1));
    const savings = item.retail_price ? (item.retail_price - item.price) * (item.quantity || 1) : 0;
    const savingsHtml = savings ? `
      <div class="os-cart-item-savings">
        <span class="os-cart-item-savings-label">You save:</span>
        <span class="os-cart-item-savings-value">${formatPrice(savings)} (${Math.round(savings / (item.retail_price * (item.quantity || 1)) * 100)}%)</span>
      </div>
    ` : "";
    const recurringHtml = item.is_recurring && item.price_recurring ? `
      <div class="os-cart-item-recurring">
        <span class="os-cart-item-recurring-label">Recurring:</span>
        <span class="os-cart-item-recurring-value">${formatPrice(item.price_recurring)} ${item.interval_count > 1 ? `every ${item.interval_count} ${item.interval}s` : `per ${item.interval}`}</span>
      </div>
    ` : "";
    const imageHtml = item.image ? `
      <div class="os-cart-item-image">
        <img src="${item.image}" alt="${item.name}" />
      </div>
    ` : "";
    itemElement.innerHTML = `
      ${imageHtml}
      <div class="os-cart-item-details">
        <div class="os-cart-item-name">${item.name}</div>
        <div class="os-cart-item-price-container">
          <div class="os-cart-item-price">${price}</div>
          ${retailPrice ? `<div class="os-cart-item-retail-price">${retailPrice}</div>` : ""}
        </div>
        ${savingsHtml}
        ${recurringHtml}
      </div>
      <div class="os-cart-item-quantity">
        <button class="os-cart-item-decrease" data-os-cart-decrease="${item.id}">-</button>
        <span class="os-cart-item-quantity-value">${item.quantity || 1}</span>
        <button class="os-cart-item-increase" data-os-cart-increase="${item.id}">+</button>
      </div>
      <div class="os-cart-item-total">${total}</div>
      <button class="os-cart-item-remove" data-os-cart-remove="${item.id}">×</button>
    `;
    itemElement.querySelector(`[data-os-cart-decrease="${item.id}"]`)?.addEventListener("click", () => __privateMethod(this, _updateCartItemQuantity, updateCartItemQuantity_fn).call(this, item.id, (item.quantity || 1) - 1));
    itemElement.querySelector(`[data-os-cart-increase="${item.id}"]`)?.addEventListener("click", () => __privateMethod(this, _updateCartItemQuantity, updateCartItemQuantity_fn).call(this, item.id, (item.quantity || 1) + 1));
    itemElement.querySelector(`[data-os-cart-remove="${item.id}"]`)?.addEventListener("click", () => __privateMethod(this, _removeFromCart, removeFromCart_fn).call(this, item.id));
    return itemElement;
  };
  _addToCart = new WeakSet();
  addToCart_fn = function(item) {
    try {
      const result = __privateGet(this, _stateManager).addToCart(item);
      return result;
    } catch (error) {
      __privateGet(this, _logger14).error("Error adding item to cart:", error);
      throw error;
    }
  };
  _updateCartItemQuantity = new WeakSet();
  updateCartItemQuantity_fn = function(itemId, quantity) {
    try {
      return quantity <= 0 ? __privateMethod(this, _removeFromCart, removeFromCart_fn).call(this, itemId) : __privateGet(this, _stateManager).updateCartItem(itemId, { quantity });
    } catch (error) {
      __privateGet(this, _logger14).error("Error updating cart item quantity:", error);
      throw error;
    }
  };
  _removeFromCart = new WeakSet();
  removeFromCart_fn = function(itemId) {
    try {
      return __privateGet(this, _stateManager).removeFromCart(itemId);
    } catch (error) {
      __privateGet(this, _logger14).error("Error removing item from cart:", error);
      throw error;
    }
  };

  // src/utils/DebugUtils.js
  var _debugStylesInjected, _isDebugMode, _xrayEnabled, _overlays;
  var DebugUtils = class {
    /**
     * Initialize debug mode by checking URL parameters
     * @returns {boolean} Whether debug mode is enabled
     */
    static initDebugMode() {
      const urlParams = new URLSearchParams(window.location.search);
      __privateSet(this, _isDebugMode, urlParams.get("debugger") === "true");
      if (__privateGet(this, _isDebugMode) && !__privateGet(this, _debugStylesInjected)) {
        this.injectDebugStyles();
        __privateSet(this, _xrayEnabled, localStorage.getItem("os_debug_xray_enabled") === "true");
      }
      return __privateGet(this, _isDebugMode);
    }
    /**
     * Check if debug mode is enabled
     * @returns {boolean} Whether debug mode is enabled
     */
    static isDebugMode() {
      return __privateGet(this, _isDebugMode);
    }
    /**
     * Check if X-ray mode is enabled
     * @returns {boolean} Whether X-ray mode is enabled
     */
    static isXrayEnabled() {
      return __privateGet(this, _xrayEnabled);
    }
    /**
     * Toggle X-ray mode on or off
     * @param {boolean} enabled - Whether to enable X-ray mode
     * @returns {boolean} The new state of X-ray mode
     */
    static toggleXray(enabled = !__privateGet(this, _xrayEnabled)) {
      if (!__privateGet(this, _isDebugMode))
        return false;
      __privateSet(this, _xrayEnabled, enabled);
      localStorage.setItem("os_debug_xray_enabled", __privateGet(this, _xrayEnabled).toString());
      __privateGet(this, _overlays).forEach((overlay) => {
        overlay.style.display = __privateGet(this, _xrayEnabled) ? "block" : "none";
      });
      return __privateGet(this, _xrayEnabled);
    }
    /**
     * Inject debug styles into the document head
     */
    static injectDebugStyles() {
      if (__privateGet(this, _debugStylesInjected))
        return;
      const styleElement = document.createElement("style");
      styleElement.id = "os-debug-styles";
      styleElement.textContent = `
      /* Common debug styles */
      .os-debug-overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 9999;
        border: 2px dashed rgba(255, 0, 0, 0.7);
        box-sizing: border-box;
      }
      .os-debug-label {
        position: absolute;
        top: 0;
        right: 0;
        background-color: rgba(0, 0, 0, 0.7);
        color: white;
        font-size: 12px;
        padding: 2px 6px;
        border-radius: 0 0 0 4px;
        font-family: monospace;
        z-index: 10000;
      }
      
      /* Selector-specific styles */
      .os-debug-card-overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 9998;
        border: 1px solid rgba(0, 255, 255, 0.7);
        box-sizing: border-box;
      }
      .os-debug-card-label {
        position: absolute;
        top: 0;
        right: 0;
        background-color: rgba(0, 0, 0, 0.7);
        color: white;
        font-size: 10px;
        padding: 1px 4px;
        border-radius: 0 0 0 4px;
        font-family: monospace;
        z-index: 9999;
      }
      .os--selected .os-debug-card-overlay {
        border: 2px solid rgba(0, 255, 0, 0.9);
      }
      .os--active .os-debug-card-overlay {
        background-color: rgba(255, 255, 0, 0.2);
      }
      
      /* Toggle-specific styles */
      .os-debug-toggle-overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 9998;
        border: 1px solid rgba(255, 165, 0, 0.7);
        box-sizing: border-box;
      }
      .os-debug-toggle-label {
        position: absolute;
        top: 0;
        right: 0;
        background-color: rgba(0, 0, 0, 0.7);
        color: white;
        font-size: 10px;
        padding: 1px 4px;
        border-radius: 0 0 0 4px;
        font-family: monospace;
        z-index: 9999;
      }
      [data-os-active="true"] .os-debug-toggle-overlay {
        background-color: rgba(255, 165, 0, 0.3);
        border: 2px solid rgba(255, 165, 0, 0.9);
      }
      
      /* Upsell styles */
      .os-debug-upsell-overlay {
        border: 2px dashed rgba(76, 175, 80, 0.9) !important;
      }
      .os-debug-upsell-label {
        background-color: rgba(76, 175, 80, 0.9) !important;
      }
      .os-debug-upsell-badge {
        display: inline-block;
        background-color: rgba(76, 175, 80, 0.9);
        color: white;
        font-size: 9px;
        padding: 1px 3px;
        border-radius: 2px;
        margin-left: 4px;
        vertical-align: middle;
      }
      
      /* Debug bar styles */
      .os-debug-bar {
        position: fixed;
        bottom: 0;
        left: 0;
        width: 100%;
        background-color: rgba(33, 33, 33, 0.9);
        color: white;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        font-size: 14px;
        z-index: 10001;
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px 16px;
        box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.2);
      }
      
      .os-debug-bar-title {
        font-weight: 600;
        margin-right: 20px;
      }
      
      .os-debug-bar-controls {
        display: flex;
        align-items: center;
      }
      
      .os-debug-bar-control {
        margin: 0 10px;
        display: flex;
        align-items: center;
      }
      
      .os-debug-bar-toggle {
        position: relative;
        display: inline-block;
        width: 40px;
        height: 20px;
        margin-left: 8px;
      }
      
      .os-debug-bar-toggle input {
        opacity: 0;
        width: 0;
        height: 0;
      }
      
      .os-debug-bar-slider {
        position: absolute;
        cursor: pointer;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: #ccc;
        transition: .4s;
        border-radius: 20px;
      }
      
      .os-debug-bar-slider:before {
        position: absolute;
        content: "";
        height: 16px;
        width: 16px;
        left: 2px;
        bottom: 2px;
        background-color: white;
        transition: .4s;
        border-radius: 50%;
      }
      
      input:checked + .os-debug-bar-slider {
        background-color: #2196F3;
      }
      
      input:checked + .os-debug-bar-slider:before {
        transform: translateX(20px);
      }
      
      .os-debug-bar-button {
        background-color: #2196F3;
        color: white;
        border: none;
        border-radius: 4px;
        padding: 4px 10px;
        font-size: 12px;
        cursor: pointer;
        margin-left: 10px;
      }
      
      .os-debug-bar-button:hover {
        background-color: #0b7dda;
      }
    `;
      document.head.appendChild(styleElement);
      __privateSet(this, _debugStylesInjected, true);
    }
    /**
     * Add a debug overlay to an element
     * @param {HTMLElement} element - The element to add the overlay to
     * @param {string} id - The ID to display
     * @param {string} type - The type of element
     * @param {Object} additionalInfo - Additional information to display
     */
    static addDebugOverlay(element, id, type, additionalInfo = {}) {
      if (!__privateGet(this, _isDebugMode))
        return;
      const computedStyle = window.getComputedStyle(element);
      if (computedStyle.position === "static") {
        element.style.position = "relative";
      }
      const overlay = document.createElement("div");
      overlay.className = `os-debug-${type}-overlay`;
      const label = document.createElement("div");
      label.className = `os-debug-${type}-label`;
      const isUpsell = additionalInfo.Upsell === "Yes";
      if (isUpsell) {
        overlay.classList.add("os-debug-upsell-overlay");
        label.classList.add("os-debug-upsell-label");
      }
      let labelText = `ID: ${id}`;
      Object.entries(additionalInfo).forEach(([key, value]) => {
        if (key === "Upsell" && value === "Yes") {
          labelText += ` | ${key}: <span class="os-debug-upsell-badge">UPSELL</span>`;
        } else {
          labelText += ` | ${key}: ${value}`;
        }
      });
      label.innerHTML = labelText;
      if (!__privateGet(this, _xrayEnabled)) {
        overlay.style.display = "none";
        label.style.display = "none";
      }
      element.appendChild(overlay);
      element.appendChild(label);
      __privateGet(this, _overlays).push(overlay);
      __privateGet(this, _overlays).push(label);
    }
  };
  _debugStylesInjected = new WeakMap();
  _isDebugMode = new WeakMap();
  _xrayEnabled = new WeakMap();
  _overlays = new WeakMap();
  __privateAdd(DebugUtils, _debugStylesInjected, false);
  __privateAdd(DebugUtils, _isDebugMode, false);
  __privateAdd(DebugUtils, _xrayEnabled, false);
  __privateAdd(DebugUtils, _overlays, []);

  // src/managers/SelectorManager.js
  var _app10, _logger15, _selectors2, _selectedItems, _isDebugMode2, _initSelectors, initSelectors_fn, _initSelector, initSelector_fn, _initCard, initCard_fn, _handleClick, handleClick_fn, _selectItem, selectItem_fn, _updateCart, updateCart_fn, _addItemToCart, addItemToCart_fn, _removeItemFromCart, removeItemFromCart_fn, _syncWithCart, syncWithCart_fn, _initUnitPricingForSelector, initUnitPricingForSelector_fn, _updateUnitPricingForCard, updateUnitPricingForCard_fn, _formatPrice, formatPrice_fn, _updatePriceElement, updatePriceElement_fn;
  var SelectorManager = class {
    constructor(app) {
      __privateAdd(this, _initSelectors);
      __privateAdd(this, _initSelector);
      __privateAdd(this, _initCard);
      __privateAdd(this, _handleClick);
      __privateAdd(this, _selectItem);
      __privateAdd(this, _updateCart);
      __privateAdd(this, _addItemToCart);
      __privateAdd(this, _removeItemFromCart);
      __privateAdd(this, _syncWithCart);
      /**
       * Initialize unit pricing for a specific selector
       * @param {string} selectorId - The ID of the selector
       */
      __privateAdd(this, _initUnitPricingForSelector);
      /**
       * Update unit pricing for a specific card
       * @param {Object} item - The item object
       * @param {Array} packages - The packages array from campaign data
       */
      __privateAdd(this, _updateUnitPricingForCard);
      /**
       * Format a price with currency symbol
       * @param {number} price - Price to format
       * @returns {string} Formatted price
       */
      __privateAdd(this, _formatPrice);
      /**
       * Update a price element with the calculated value
       * @param {HTMLElement} cardElement - The card element
       * @param {string} type - The price type
       * @param {string} value - The formatted price value
       * @param {Set} processedElements - Set of elements that have already been processed
       */
      __privateAdd(this, _updatePriceElement);
      __privateAdd(this, _app10, void 0);
      __privateAdd(this, _logger15, void 0);
      __privateAdd(this, _selectors2, {});
      __privateAdd(this, _selectedItems, {});
      __privateAdd(this, _isDebugMode2, false);
      __privateSet(this, _app10, app);
      __privateSet(this, _logger15, app.logger.createModuleLogger("SELECTOR"));
      __privateSet(this, _isDebugMode2, DebugUtils.initDebugMode());
      __privateMethod(this, _initSelectors, initSelectors_fn).call(this);
      __privateGet(this, _logger15).info("SelectorManager initialized");
      if (__privateGet(this, _isDebugMode2)) {
        __privateGet(this, _logger15).info("Debug mode enabled for selectors");
      }
    }
    /**
     * Initialize unit pricing for all selectors
     * This populates any elements with data-card-price attributes
     */
    initUnitPricing() {
      __privateGet(this, _logger15).info("Initializing unit pricing for selectors");
      setTimeout(() => {
        Object.keys(__privateGet(this, _selectors2)).forEach((selectorId) => {
          __privateMethod(this, _initUnitPricingForSelector, initUnitPricingForSelector_fn).call(this, selectorId);
        });
      }, 100);
    }
    /**
     * Refresh unit pricing for all selectors
     * This can be called after campaign data is updated
     */
    refreshUnitPricing() {
      this.initUnitPricing();
    }
  };
  _app10 = new WeakMap();
  _logger15 = new WeakMap();
  _selectors2 = new WeakMap();
  _selectedItems = new WeakMap();
  _isDebugMode2 = new WeakMap();
  _initSelectors = new WeakSet();
  initSelectors_fn = function() {
    document.querySelectorAll('[data-os-component="selector"][data-os-selection-mode="swap"]').forEach((selector) => __privateMethod(this, _initSelector, initSelector_fn).call(this, selector));
    setTimeout(() => __privateMethod(this, _syncWithCart, syncWithCart_fn).call(this), 0);
    __privateGet(this, _app10).state?.subscribe("cart", () => __privateMethod(this, _syncWithCart, syncWithCart_fn).call(this));
    this.initUnitPricing();
  };
  _initSelector = new WeakSet();
  initSelector_fn = function(selectorElement) {
    const selectorId = selectorElement.getAttribute("data-os-id");
    if (!selectorId) {
      __privateGet(this, _logger15).warn("Selector missing data-os-id", selectorElement);
      return;
    }
    const mode = selectorElement.getAttribute("data-os-selection-mode") || "swap";
    __privateGet(this, _selectors2)[selectorId] = {
      element: selectorElement,
      items: [],
      mode
    };
    __privateGet(this, _selectedItems)[selectorId] = null;
    selectorElement.querySelectorAll('[data-os-element="card"]').forEach((card) => __privateMethod(this, _initCard, initCard_fn).call(this, selectorId, card));
    if (__privateGet(this, _isDebugMode2)) {
      DebugUtils.addDebugOverlay(selectorElement, selectorId, "overlay", { "Mode": mode });
    }
  };
  _initCard = new WeakSet();
  initCard_fn = function(selectorId, cardElement) {
    const packageId = cardElement.getAttribute("data-os-package");
    if (!packageId) {
      __privateGet(this, _logger15).warn("Card missing data-os-package", cardElement);
      return;
    }
    const priceElement = cardElement.querySelector(".pb-quantity__price.pb--current");
    const priceText = priceElement?.textContent.trim() ?? "$0.00 USD";
    const price = Number.parseFloat(priceText.match(/\$(\d+\.\d+)/)?.[1] ?? "0");
    const nameElement = cardElement.querySelector(".card-title");
    const name = nameElement?.textContent.trim() ?? `Package ${packageId}`;
    const quantity = Number.parseInt(cardElement.getAttribute("data-os-quantity") ?? "1", 10);
    const isPreSelected = cardElement.getAttribute("data-os-selected") === "true";
    const item = {
      element: cardElement,
      packageId,
      quantity,
      price,
      name,
      isPreSelected
    };
    __privateGet(this, _selectors2)[selectorId].items.push(item);
    cardElement.addEventListener("click", () => __privateMethod(this, _handleClick, handleClick_fn).call(this, selectorId, item));
    if (__privateGet(this, _isDebugMode2)) {
      DebugUtils.addDebugOverlay(cardElement, packageId, "card", {
        "Price": `$${price}`,
        "Qty": quantity,
        "PreSel": isPreSelected ? "Yes" : "No"
      });
    }
  };
  _handleClick = new WeakSet();
  handleClick_fn = function(selectorId, item) {
    const previous = __privateGet(this, _selectedItems)[selectorId];
    __privateMethod(this, _selectItem, selectItem_fn).call(this, selectorId, item);
    __privateMethod(this, _updateCart, updateCart_fn).call(this, selectorId, previous);
  };
  _selectItem = new WeakSet();
  selectItem_fn = function(selectorId, item) {
    if (__privateGet(this, _selectedItems)[selectorId] === item)
      return;
    __privateGet(this, _selectors2)[selectorId].items.forEach((i) => {
      i.element.classList.remove("os--selected");
      i.element.setAttribute("data-os-selected", "false");
      i.isSelected = false;
    });
    item.element.classList.add("os--selected");
    item.element.setAttribute("data-os-selected", "true");
    item.isSelected = true;
    __privateGet(this, _selectedItems)[selectorId] = item;
    __privateGet(this, _logger15).debug(`Selected item ${item.packageId} in selector ${selectorId}`);
  };
  _updateCart = new WeakSet();
  updateCart_fn = function(selectorId, previousItem) {
    if (!__privateGet(this, _app10).cart) {
      __privateGet(this, _logger15).error("Cart manager not available");
      return;
    }
    const selected = __privateGet(this, _selectedItems)[selectorId];
    if (!selected)
      return;
    if (previousItem && previousItem.packageId !== selected.packageId) {
      __privateMethod(this, _removeItemFromCart, removeItemFromCart_fn).call(this, previousItem);
    }
    if (!__privateGet(this, _app10).cart.isItemInCart(selected.packageId)) {
      __privateMethod(this, _addItemToCart, addItemToCart_fn).call(this, selected);
    }
  };
  _addItemToCart = new WeakSet();
  addItemToCart_fn = function(item) {
    if (!__privateGet(this, _app10).cart) {
      __privateGet(this, _logger15).error("Cart manager not available in addItemToCart");
      return;
    }
    if (typeof __privateGet(this, _app10).cart.addToCart !== "function") {
      __privateGet(this, _logger15).error("addToCart is not a function on this.#app.cart:", __privateGet(this, _app10).cart);
      return;
    }
    __privateGet(this, _logger15).info(`Adding item ${item.packageId} to cart`);
    __privateGet(this, _app10).cart.addToCart({
      id: item.packageId,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      type: "package"
    });
    item.element.classList.add("os--active");
    item.element.setAttribute("data-os-active", "true");
  };
  _removeItemFromCart = new WeakSet();
  removeItemFromCart_fn = function(item) {
    if (!__privateGet(this, _app10).cart) {
      __privateGet(this, _logger15).error("Cart manager not available in removeItemFromCart");
      return;
    }
    if (typeof __privateGet(this, _app10).cart.removeFromCart !== "function") {
      __privateGet(this, _logger15).error("removeFromCart is not a function on this.#app.cart:", __privateGet(this, _app10).cart);
      return;
    }
    __privateGet(this, _logger15).info(`Removing item ${item.packageId} from cart`);
    __privateGet(this, _app10).cart.removeFromCart(item.packageId);
    item.element.classList.remove("os--active");
    item.element.setAttribute("data-os-active", "false");
  };
  _syncWithCart = new WeakSet();
  syncWithCart_fn = function() {
    if (!__privateGet(this, _app10).cart) {
      __privateGet(this, _logger15).debug("Cart manager not available for sync");
      return;
    }
    const cart = __privateGet(this, _app10).state?.getState("cart");
    if (!cart) {
      __privateGet(this, _logger15).debug("Cart state not available");
      return;
    }
    __privateGet(this, _logger15).debug("Syncing with cart, this.#app.cart:", __privateGet(this, _app10).cart);
    Object.keys(__privateGet(this, _selectors2)).forEach((selectorId) => {
      const items = __privateGet(this, _selectors2)[selectorId].items;
      const cartItemsInSelector = items.filter((item) => __privateGet(this, _app10).cart.isItemInCart(item.packageId));
      if (cartItemsInSelector.length > 0) {
        const itemInCart = cartItemsInSelector[0];
        __privateMethod(this, _selectItem, selectItem_fn).call(this, selectorId, itemInCart);
        cartItemsInSelector.forEach((item) => {
          if (item.packageId !== itemInCart.packageId)
            __privateMethod(this, _removeItemFromCart, removeItemFromCart_fn).call(this, item);
        });
      } else if (!__privateGet(this, _selectedItems)[selectorId]) {
        const preSelected = items.find((item) => item.isPreSelected);
        if (preSelected) {
          __privateMethod(this, _selectItem, selectItem_fn).call(this, selectorId, preSelected);
          __privateMethod(this, _addItemToCart, addItemToCart_fn).call(this, preSelected);
        }
      }
      items.forEach((item) => {
        const isInCart = __privateGet(this, _app10).cart.isItemInCart(item.packageId);
        item.element.classList.toggle("os--active", isInCart);
        item.element.setAttribute("data-os-active", isInCart.toString());
      });
    });
  };
  _initUnitPricingForSelector = new WeakSet();
  initUnitPricingForSelector_fn = function(selectorId) {
    const selector = __privateGet(this, _selectors2)[selectorId];
    if (!selector) {
      __privateGet(this, _logger15).warn(`Selector ${selectorId} not found for unit pricing`);
      return;
    }
    const campaignData = __privateGet(this, _app10)?.campaignData;
    if (!campaignData || !campaignData.packages) {
      __privateGet(this, _logger15).warn("Campaign data not available for unit pricing");
      return;
    }
    selector.items.forEach((item) => {
      __privateMethod(this, _updateUnitPricingForCard, updateUnitPricingForCard_fn).call(this, item, campaignData.packages);
    });
  };
  _updateUnitPricingForCard = new WeakSet();
  updateUnitPricingForCard_fn = function(item, packages) {
    const packageData = packages.find(
      (pkg) => pkg.ref_id.toString() === item.packageId.toString() || pkg.external_id && pkg.external_id.toString() === item.packageId.toString()
    );
    if (!packageData) {
      __privateGet(this, _logger15).debug(`Package data not found for item ${item.packageId}`);
      return;
    }
    const cardElement = item.element;
    __privateGet(this, _logger15).debug(`Processing unit pricing for package ${item.packageId}:`, {
      packageId: item.packageId,
      name: packageData.name,
      price: packageData.price,
      price_total: packageData.price_total,
      price_retail: packageData.price_retail,
      price_retail_total: packageData.price_retail_total,
      qty: packageData.qty
    });
    const totalUnits = packageData.qty || 1;
    const totalPrice = Number.parseFloat(packageData.price_total) || Number.parseFloat(packageData.price) * totalUnits;
    const totalRetailPrice = Number.parseFloat(packageData.price_retail_total) || Number.parseFloat(packageData.price_retail) * totalUnits || totalPrice;
    const unitPrice = totalPrice / totalUnits;
    const unitRetailPrice = totalRetailPrice / totalUnits;
    const unitSavings = unitRetailPrice - unitPrice;
    const unitSavingsPercentage = unitRetailPrice > 0 ? unitSavings / unitRetailPrice * 100 : 0;
    const totalSavings = totalRetailPrice - totalPrice;
    const totalSavingsPercentage = totalRetailPrice > 0 ? totalSavings / totalRetailPrice * 100 : 0;
    __privateGet(this, _logger15).debug(`Calculated prices for package ${item.packageId}:`, {
      totalUnits,
      totalPrice,
      totalRetailPrice,
      totalSavings,
      totalSavingsPercentage,
      unitPrice,
      unitRetailPrice,
      unitSavings,
      unitSavingsPercentage
    });
    const formatPrice = (price) => {
      if (__privateGet(this, _app10).campaign?.formatPrice) {
        return __privateGet(this, _app10).campaign.formatPrice(price);
      }
      return `$${price.toFixed(2)}`;
    };
    const processedElements = /* @__PURE__ */ new Set();
    const subunitElements = cardElement.querySelectorAll("[data-divide-by]");
    if (subunitElements.length > 0) {
      __privateGet(this, _logger15).debug(`Found ${subunitElements.length} elements with data-divide-by in card ${item.packageId}`);
      subunitElements.forEach((element) => {
        const divisor = parseFloat(element.getAttribute("data-divide-by"));
        if (!isNaN(divisor) && divisor > 0) {
          const type = element.getAttribute("data-card-price");
          if (!type) {
            __privateGet(this, _logger15).debug(`Skipping element with data-divide-by but no data-card-price attribute`);
            return;
          }
          let value;
          switch (type) {
            case "each-sale":
              value = unitPrice / divisor;
              break;
            case "each-regular":
              value = unitRetailPrice / divisor;
              break;
            case "saving-amount":
              value = unitSavings / divisor;
              break;
            case "saving-percentage":
              value = unitSavingsPercentage;
              break;
            case "total-sale":
              value = totalPrice / divisor;
              break;
            case "total-regular":
              value = totalRetailPrice / divisor;
              break;
            case "total-saving-amount":
              value = totalSavings / divisor;
              break;
            case "total-saving-percentage":
              value = totalSavingsPercentage;
              break;
            default:
              __privateGet(this, _logger15).debug(`Unknown price type: ${type}`);
              return;
          }
          let formattedValue;
          if (type.includes("percentage")) {
            formattedValue = `${Math.round(value)}%`;
          } else {
            formattedValue = formatPrice(value);
          }
          __privateGet(this, _logger15).debug(`Setting price for element with data-divide-by="${divisor}":`, {
            attributeType: type,
            originalValue: element.textContent,
            calculatedValue: value,
            formattedValue,
            element: element.outerHTML
          });
          element.textContent = formattedValue;
          processedElements.add(element);
          __privateGet(this, _logger15).debug(`Updated element with data-divide-by="${divisor}" for ${type}: ${formattedValue}`);
        }
      });
    }
    __privateMethod(this, _updatePriceElement, updatePriceElement_fn).call(this, cardElement, "each-sale", formatPrice(unitPrice), processedElements);
    __privateMethod(this, _updatePriceElement, updatePriceElement_fn).call(this, cardElement, "each-regular", formatPrice(unitRetailPrice), processedElements);
    __privateMethod(this, _updatePriceElement, updatePriceElement_fn).call(this, cardElement, "saving-amount", formatPrice(unitSavings), processedElements);
    __privateMethod(this, _updatePriceElement, updatePriceElement_fn).call(this, cardElement, "saving-percentage", `${Math.round(unitSavingsPercentage)}%`, processedElements);
    __privateMethod(this, _updatePriceElement, updatePriceElement_fn).call(this, cardElement, "total-sale", formatPrice(totalPrice), processedElements);
    __privateMethod(this, _updatePriceElement, updatePriceElement_fn).call(this, cardElement, "total-regular", formatPrice(totalRetailPrice), processedElements);
    __privateMethod(this, _updatePriceElement, updatePriceElement_fn).call(this, cardElement, "total-saving-amount", formatPrice(totalSavings), processedElements);
    __privateMethod(this, _updatePriceElement, updatePriceElement_fn).call(this, cardElement, "total-saving-percentage", `${Math.round(totalSavingsPercentage)}%`, processedElements);
    __privateGet(this, _logger15).debug(`Updated pricing for card ${item.packageId}: ${formatPrice(unitPrice)} per unit, ${formatPrice(totalPrice)} total`);
  };
  _formatPrice = new WeakSet();
  formatPrice_fn = function(price) {
    if (__privateGet(this, _app10).campaign?.formatPrice) {
      return __privateGet(this, _app10).campaign.formatPrice(price);
    }
    return `$${price.toFixed(2)}`;
  };
  _updatePriceElement = new WeakSet();
  updatePriceElement_fn = function(cardElement, type, value, processedElements = /* @__PURE__ */ new Set()) {
    const priceElements = cardElement.querySelectorAll(`[data-card-price="${type}"]`);
    if (priceElements.length > 0) {
      priceElements.forEach((element) => {
        if (processedElements.has(element)) {
          return;
        }
        element.textContent = value;
        const hideIfZero = element.getAttribute("data-hide-if-zero") === "true";
        const numericValue = parseFloat(value.replace(/[^0-9.-]+/g, ""));
        if (hideIfZero && numericValue <= 0) {
          element.style.display = "none";
          const container = element.closest('[data-container="true"]');
          if (container)
            container.style.display = "none";
        } else {
          element.style.display = "";
          const container = element.closest('[data-container="true"]');
          if (container)
            container.style.display = "";
        }
      });
    }
  };

  // src/managers/ToggleManager.js
  var _toggleItems, _app11, _logger16, _isDebugMode3, _initToggleItems, initToggleItems_fn, _initToggleItem, initToggleItem_fn, _addDebugOverlay, addDebugOverlay_fn, _toggleItem, toggleItem_fn, _getPackageDataFromCampaign, getPackageDataFromCampaign_fn, _updateToggleItemUI, updateToggleItemUI_fn, _updateAllToggleItemsUI, updateAllToggleItemsUI_fn, _isItemInCart, isItemInCart_fn, _addItemToCart2, addItemToCart_fn2, _removeItemFromCart2, removeItemFromCart_fn2;
  var ToggleManager = class {
    constructor(app) {
      __privateAdd(this, _initToggleItems);
      __privateAdd(this, _initToggleItem);
      __privateAdd(this, _addDebugOverlay);
      __privateAdd(this, _toggleItem);
      __privateAdd(this, _getPackageDataFromCampaign);
      __privateAdd(this, _updateToggleItemUI);
      __privateAdd(this, _updateAllToggleItemsUI);
      __privateAdd(this, _isItemInCart);
      __privateAdd(this, _addItemToCart2);
      __privateAdd(this, _removeItemFromCart2);
      __privateAdd(this, _toggleItems, {});
      __privateAdd(this, _app11, void 0);
      __privateAdd(this, _logger16, void 0);
      __privateAdd(this, _isDebugMode3, false);
      __privateSet(this, _app11, app);
      __privateSet(this, _logger16, app.logger.createModuleLogger("TOGGLE"));
      __privateSet(this, _isDebugMode3, DebugUtils.initDebugMode());
      __privateMethod(this, _initToggleItems, initToggleItems_fn).call(this);
      __privateGet(this, _app11).state.subscribe("cart", () => __privateMethod(this, _updateAllToggleItemsUI, updateAllToggleItemsUI_fn).call(this));
      __privateGet(this, _logger16).info("ToggleManager initialized");
      if (__privateGet(this, _isDebugMode3)) {
        __privateGet(this, _logger16).info("Debug mode enabled for toggle items");
      }
    }
  };
  _toggleItems = new WeakMap();
  _app11 = new WeakMap();
  _logger16 = new WeakMap();
  _isDebugMode3 = new WeakMap();
  _initToggleItems = new WeakSet();
  initToggleItems_fn = function() {
    const toggleElements = document.querySelectorAll('[data-os-action="toggle-item"]');
    if (!toggleElements.length) {
      __privateGet(this, _logger16).debug("No toggle item buttons found in the DOM");
      return;
    }
    __privateGet(this, _logger16).info(`Found ${toggleElements.length} toggle item buttons`);
    toggleElements.forEach((element) => __privateMethod(this, _initToggleItem, initToggleItem_fn).call(this, element));
  };
  _initToggleItem = new WeakSet();
  initToggleItem_fn = function(toggleElement) {
    const packageId = toggleElement.getAttribute("data-os-package");
    if (!packageId) {
      __privateGet(this, _logger16).warn("Toggle item missing data-os-package attribute", toggleElement);
      return;
    }
    const quantity = Number.parseInt(toggleElement.getAttribute("data-os-quantity") ?? "1", 10);
    const toggleId = toggleElement.getAttribute("data-os-id") ?? `toggle-${packageId}`;
    __privateGet(this, _toggleItems)[toggleId] = { element: toggleElement, packageId, quantity };
    __privateMethod(this, _updateToggleItemUI, updateToggleItemUI_fn).call(this, toggleElement, packageId);
    toggleElement.addEventListener("click", (event) => {
      event.preventDefault();
      __privateMethod(this, _toggleItem, toggleItem_fn).call(this, toggleId);
    });
    if (__privateGet(this, _isDebugMode3)) {
      __privateMethod(this, _addDebugOverlay, addDebugOverlay_fn).call(this, toggleElement, toggleId, packageId, quantity);
    }
    __privateGet(this, _logger16).debug(`Initialized toggle item ${toggleId} for package ${packageId}`);
  };
  _addDebugOverlay = new WeakSet();
  addDebugOverlay_fn = function(element, toggleId, packageId, quantity) {
    const packageData = __privateMethod(this, _getPackageDataFromCampaign, getPackageDataFromCampaign_fn).call(this, packageId);
    const price = packageData ? packageData.price : "N/A";
    const isUpsell = element.hasAttribute("data-os-upsell") ? element.getAttribute("data-os-upsell") === "true" : element.closest("[data-os-upsell-section]") !== null;
    DebugUtils.addDebugOverlay(element, toggleId, "toggle", {
      "Package": packageId,
      "Qty": quantity,
      "Price": price,
      "Upsell": isUpsell ? "Yes" : "No"
    });
  };
  _toggleItem = new WeakSet();
  toggleItem_fn = function(toggleId) {
    const toggleItem = __privateGet(this, _toggleItems)[toggleId];
    if (!toggleItem) {
      __privateGet(this, _logger16).error(`Toggle item ${toggleId} not found`);
      return;
    }
    const { packageId, quantity, element } = toggleItem;
    const isInCart = __privateMethod(this, _isItemInCart, isItemInCart_fn).call(this, packageId);
    if (isInCart) {
      __privateMethod(this, _removeItemFromCart2, removeItemFromCart_fn2).call(this, packageId);
      __privateGet(this, _logger16).info(`Toggled OFF item ${packageId}`);
    } else {
      const packageData = __privateMethod(this, _getPackageDataFromCampaign, getPackageDataFromCampaign_fn).call(this, packageId);
      if (!packageData) {
        __privateGet(this, _logger16).error(`Package ${packageId} not found in campaign data`);
        return;
      }
      const isUpsell = element.hasAttribute("data-os-upsell") ? element.getAttribute("data-os-upsell") === "true" : element.closest("[data-os-upsell-section]") !== null;
      __privateMethod(this, _addItemToCart2, addItemToCart_fn2).call(this, {
        id: packageId,
        name: packageData.name,
        price: Number.parseFloat(packageData.price),
        quantity,
        type: "package",
        is_upsell: isUpsell
      });
      __privateGet(this, _logger16).info(`Toggled ON item ${packageId}${isUpsell ? " (upsell)" : ""}`);
    }
    __privateMethod(this, _updateToggleItemUI, updateToggleItemUI_fn).call(this, element, packageId);
    __privateGet(this, _app11).triggerEvent("toggle.changed", { toggleId, packageId, isActive: !isInCart });
  };
  _getPackageDataFromCampaign = new WeakSet();
  getPackageDataFromCampaign_fn = function(packageId) {
    if (!__privateGet(this, _app11).campaignData?.packages) {
      __privateGet(this, _logger16).error("Campaign data not available");
      return null;
    }
    return __privateGet(this, _app11).campaignData.packages.find((pkg) => pkg.ref_id.toString() === packageId.toString()) ?? null;
  };
  _updateToggleItemUI = new WeakSet();
  updateToggleItemUI_fn = function(element, packageId) {
    const isInCart = __privateMethod(this, _isItemInCart, isItemInCart_fn).call(this, packageId);
    element.classList.toggle("os--active", isInCart);
    element.setAttribute("data-os-active", isInCart.toString());
  };
  _updateAllToggleItemsUI = new WeakSet();
  updateAllToggleItemsUI_fn = function() {
    Object.values(__privateGet(this, _toggleItems)).forEach(
      ({ element, packageId }) => __privateMethod(this, _updateToggleItemUI, updateToggleItemUI_fn).call(this, element, packageId)
    );
  };
  _isItemInCart = new WeakSet();
  isItemInCart_fn = function(itemId) {
    return __privateGet(this, _app11).state.getState("cart").items.some((item) => item.id === itemId);
  };
  _addItemToCart2 = new WeakSet();
  addItemToCart_fn2 = function(item) {
    if (!__privateGet(this, _app11).cart) {
      __privateGet(this, _logger16).error("Cart manager not available");
      return;
    }
    __privateGet(this, _app11).cart.addToCart(item);
  };
  _removeItemFromCart2 = new WeakSet();
  removeItemFromCart_fn2 = function(itemId) {
    if (!__privateGet(this, _app11).cart) {
      __privateGet(this, _logger16).error("Cart manager not available");
      return;
    }
    __privateGet(this, _app11).cart.removeFromCart(itemId);
  };

  // src/managers/DebugManager.js
  var _app12, _logger17, _miniCartVisible, _miniCartElement, _debugBarElement, _isDebugMode4, _init6, init_fn6, _createDebugBar, createDebugBar_fn, _toggleXray, toggleXray_fn, _showMiniCart, showMiniCart_fn, _hideMiniCart, hideMiniCart_fn, _toggleMiniCart, toggleMiniCart_fn, _createMiniCartElement, createMiniCartElement_fn, _updateMiniCart, updateMiniCart_fn;
  var DebugManager = class {
    constructor(app) {
      __privateAdd(this, _init6);
      __privateAdd(this, _createDebugBar);
      __privateAdd(this, _toggleXray);
      __privateAdd(this, _showMiniCart);
      __privateAdd(this, _hideMiniCart);
      __privateAdd(this, _toggleMiniCart);
      __privateAdd(this, _createMiniCartElement);
      __privateAdd(this, _updateMiniCart);
      __privateAdd(this, _app12, void 0);
      __privateAdd(this, _logger17, void 0);
      __privateAdd(this, _miniCartVisible, false);
      __privateAdd(this, _miniCartElement, null);
      __privateAdd(this, _debugBarElement, null);
      __privateAdd(this, _isDebugMode4, false);
      __privateSet(this, _app12, app);
      __privateSet(this, _logger17, app.logger.createModuleLogger("DEBUG"));
      __privateSet(this, _isDebugMode4, DebugUtils.initDebugMode());
      __privateMethod(this, _init6, init_fn6).call(this);
      __privateGet(this, _logger17).info("DebugManager initialized");
    }
  };
  _app12 = new WeakMap();
  _logger17 = new WeakMap();
  _miniCartVisible = new WeakMap();
  _miniCartElement = new WeakMap();
  _debugBarElement = new WeakMap();
  _isDebugMode4 = new WeakMap();
  _init6 = new WeakSet();
  init_fn6 = function() {
    window.showMiniCart = () => __privateMethod(this, _showMiniCart, showMiniCart_fn).call(this);
    window.hideMiniCart = () => __privateMethod(this, _hideMiniCart, hideMiniCart_fn).call(this);
    window.toggleMiniCart = () => __privateMethod(this, _toggleMiniCart, toggleMiniCart_fn).call(this);
    window.toggleXray = (enabled) => __privateMethod(this, _toggleXray, toggleXray_fn).call(this, enabled);
    if (__privateGet(this, _isDebugMode4)) {
      __privateGet(this, _logger17).info("Debug mode activated via URL parameter");
      __privateMethod(this, _createDebugBar, createDebugBar_fn).call(this);
      if (localStorage.getItem("os_debug_mini_cart_visible") === "true") {
        __privateMethod(this, _showMiniCart, showMiniCart_fn).call(this);
      }
    }
    __privateGet(this, _app12).state?.subscribe("cart", () => {
      if (__privateGet(this, _miniCartVisible))
        __privateMethod(this, _updateMiniCart, updateMiniCart_fn).call(this);
    });
    __privateGet(this, _logger17).debug("Debug methods exposed to window object");
  };
  _createDebugBar = new WeakSet();
  createDebugBar_fn = function() {
    if (__privateGet(this, _debugBarElement))
      return;
    const debugBar = document.createElement("div");
    debugBar.className = "os-debug-bar";
    const leftSection = document.createElement("div");
    leftSection.className = "os-debug-bar-left";
    const title = document.createElement("span");
    title.className = "os-debug-bar-title";
    title.textContent = "29next Debug Tools";
    leftSection.appendChild(title);
    const rightSection = document.createElement("div");
    rightSection.className = "os-debug-bar-controls";
    const xrayControl = document.createElement("div");
    xrayControl.className = "os-debug-bar-control";
    const xrayLabel = document.createElement("span");
    xrayLabel.textContent = "X-ray View";
    const xrayToggle = document.createElement("label");
    xrayToggle.className = "os-debug-bar-toggle";
    const xrayCheckbox = document.createElement("input");
    xrayCheckbox.type = "checkbox";
    xrayCheckbox.checked = DebugUtils.isXrayEnabled();
    xrayCheckbox.addEventListener("change", () => __privateMethod(this, _toggleXray, toggleXray_fn).call(this, xrayCheckbox.checked));
    const xraySlider = document.createElement("span");
    xraySlider.className = "os-debug-bar-slider";
    xrayToggle.append(xrayCheckbox, xraySlider);
    xrayControl.append(xrayLabel, xrayToggle);
    const cartControl = document.createElement("div");
    cartControl.className = "os-debug-bar-control";
    const cartButton = document.createElement("button");
    cartButton.className = "os-debug-bar-button";
    cartButton.textContent = "Toggle Mini-Cart";
    cartButton.addEventListener("click", () => __privateMethod(this, _toggleMiniCart, toggleMiniCart_fn).call(this));
    cartControl.appendChild(cartButton);
    rightSection.append(xrayControl, cartControl);
    debugBar.append(leftSection, rightSection);
    document.body.appendChild(debugBar);
    __privateSet(this, _debugBarElement, debugBar);
  };
  _toggleXray = new WeakSet();
  toggleXray_fn = function(enabled) {
    const isEnabled = DebugUtils.toggleXray(enabled);
    if (__privateGet(this, _debugBarElement)) {
      const checkbox = __privateGet(this, _debugBarElement).querySelector('input[type="checkbox"]');
      if (checkbox)
        checkbox.checked = isEnabled;
    }
    __privateGet(this, _logger17).info(`X-ray view ${isEnabled ? "enabled" : "disabled"}`);
    return isEnabled;
  };
  _showMiniCart = new WeakSet();
  showMiniCart_fn = function() {
    if (__privateGet(this, _miniCartVisible)) {
      __privateGet(this, _logger17).debug("Mini-cart already visible");
      return;
    }
    __privateGet(this, _logger17).info("Showing mini-cart widget");
    __privateGet(this, _miniCartElement) ?? __privateSet(this, _miniCartElement, __privateMethod(this, _createMiniCartElement, createMiniCartElement_fn).call(this));
    __privateGet(this, _miniCartElement).style.display = "block";
    __privateSet(this, _miniCartVisible, true);
    localStorage.setItem("os_debug_mini_cart_visible", "true");
    __privateMethod(this, _updateMiniCart, updateMiniCart_fn).call(this);
  };
  _hideMiniCart = new WeakSet();
  hideMiniCart_fn = function() {
    if (!__privateGet(this, _miniCartVisible)) {
      __privateGet(this, _logger17).debug("Mini-cart already hidden");
      return;
    }
    __privateGet(this, _logger17).info("Hiding mini-cart widget");
    if (__privateGet(this, _miniCartElement)) {
      __privateGet(this, _miniCartElement).style.display = "none";
    }
    __privateSet(this, _miniCartVisible, false);
    localStorage.setItem("os_debug_mini_cart_visible", "false");
  };
  _toggleMiniCart = new WeakSet();
  toggleMiniCart_fn = function() {
    __privateGet(this, _miniCartVisible) ? __privateMethod(this, _hideMiniCart, hideMiniCart_fn).call(this) : __privateMethod(this, _showMiniCart, showMiniCart_fn).call(this);
  };
  _createMiniCartElement = new WeakSet();
  createMiniCartElement_fn = function() {
    const miniCart = document.createElement("div");
    miniCart.className = "os-debug-mini-cart";
    miniCart.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      width: 300px;
      max-height: 400px;
      overflow-y: auto;
      background-color: white;
      border: 1px solid #ccc;
      border-radius: 4px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      z-index: 9999;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      font-size: 14px;
      display: none;
    `;
    const header = document.createElement("div");
    header.className = "os-debug-mini-cart-header";
    header.style.cssText = `
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 15px;
      background-color: #f5f5f5;
      border-bottom: 1px solid #eee;
    `;
    const title = document.createElement("div");
    title.className = "os-debug-mini-cart-title";
    title.textContent = "Debug Mini-Cart";
    title.style.fontWeight = "600";
    const buttonContainer = document.createElement("div");
    buttonContainer.style.display = "flex";
    buttonContainer.style.alignItems = "center";
    const refreshButton = document.createElement("button");
    refreshButton.className = "os-debug-mini-cart-refresh";
    refreshButton.textContent = "↻";
    refreshButton.title = "Refresh cart data";
    refreshButton.style.cssText = `
      background: none;
      border: none;
      font-size: 16px;
      cursor: pointer;
      padding: 0 8px;
      line-height: 1;
      color: #666;
    `;
    refreshButton.addEventListener("click", () => {
      __privateMethod(this, _updateMiniCart, updateMiniCart_fn).call(this);
      __privateGet(this, _logger17).info("Mini-cart data refreshed manually");
    });
    const closeButton = document.createElement("button");
    closeButton.className = "os-debug-mini-cart-close";
    closeButton.textContent = "×";
    closeButton.style.cssText = `
      background: none;
      border: none;
      font-size: 20px;
      cursor: pointer;
      padding: 0;
      line-height: 1;
    `;
    closeButton.addEventListener("click", () => __privateMethod(this, _hideMiniCart, hideMiniCart_fn).call(this));
    buttonContainer.append(refreshButton, closeButton);
    header.append(title, buttonContainer);
    const content = document.createElement("div");
    content.className = "os-debug-mini-cart-content";
    content.style.padding = "15px";
    const footer = document.createElement("div");
    footer.className = "os-debug-mini-cart-footer";
    footer.style.cssText = `
      padding: 10px 15px;
      background-color: #f5f5f5;
      border-top: 1px solid #eee;
      font-size: 12px;
      color: #666;
      text-align: center;
    `;
    footer.textContent = "Use window.hideMiniCart() to hide this widget";
    miniCart.append(header, content, footer);
    document.body.appendChild(miniCart);
    return miniCart;
  };
  _updateMiniCart = new WeakSet();
  updateMiniCart_fn = function() {
    if (!__privateGet(this, _miniCartElement))
      return;
    const content = __privateGet(this, _miniCartElement).querySelector(".os-debug-mini-cart-content");
    if (!content)
      return;
    const cart = __privateGet(this, _app12).state?.getState("cart");
    if (!cart) {
      content.innerHTML = '<div style="color: #999; text-align: center;">Cart data not available</div>';
      return;
    }
    __privateGet(this, _logger17).debug("Updating mini-cart with cart data:", cart);
    const formatPrice = (price) => __privateGet(this, _app12).campaign?.formatPrice(price) ?? `$${price.toFixed(2)}`;
    let html = "";
    if (!cart.items?.length) {
      html += '<div style="color: #999; text-align: center; margin-bottom: 15px;">Cart is empty</div>';
    } else {
      html += '<div style="margin-bottom: 15px;">';
      html += '<div style="font-weight: 600; margin-bottom: 10px;">Items:</div>';
      html += '<ul style="list-style: none; padding: 0; margin: 0;">';
      cart.items.forEach((item) => {
        const isUpsell = !!item.is_upsell;
        const upsellBadge = isUpsell ? `<span style="display: inline-block; background-color: #4CAF50; color: white; font-size: 10px; padding: 2px 5px; border-radius: 3px; margin-left: 5px;">UPSELL</span>` : "";
        html += `
          <li style="padding: 5px 0; border-bottom: 1px solid #eee; ${isUpsell ? "background-color: rgba(76, 175, 80, 0.1);" : ""}">
            <div style="display: flex; justify-content: space-between;">
              <div style="font-weight: 500;">${item.name}${upsellBadge}</div>
              <div>${item.quantity} × ${formatPrice(item.price)}</div>
            </div>
            <div style="display: flex; justify-content: space-between; margin-top: 5px;">
              <div style="color: #666; font-size: 12px;">
                ID: ${item.id}
                ${isUpsell ? '<span style="color: #4CAF50; margin-left: 5px;">✓ is_upsell=true</span>' : ""}
              </div>
              <div style="font-weight: 500;">${formatPrice(item.price * item.quantity)}</div>
            </div>
          </li>
        `;
      });
      html += "</ul></div>";
    }
    if (cart.totals) {
      html += "<div>";
      html += '<div style="font-weight: 600; margin-bottom: 10px;">Totals:</div>';
      html += '<ul style="list-style: none; padding: 0; margin: 0;">';
      html += `
        <li style="display: flex; justify-content: space-between; padding: 3px 0;">
          <div>Subtotal:</div>
          <div>${formatPrice(cart.totals.subtotal)}</div>
        </li>
      `;
      if (cart.totals.retail_subtotal > cart.totals.subtotal) {
        html += `
          <li style="display: flex; justify-content: space-between; padding: 3px 0;">
            <div>Retail Subtotal:</div>
            <div>${formatPrice(cart.totals.retail_subtotal)}</div>
          </li>
        `;
        if (cart.totals.savings) {
          html += `
            <li style="display: flex; justify-content: space-between; padding: 3px 0; color: #e53935;">
              <div>Savings:</div>
              <div>${formatPrice(cart.totals.savings)} (${Math.round(cart.totals.savings_percentage)}%)</div>
            </li>
          `;
        }
      }
      if (cart.totals.shipping > 0) {
        html += `
          <li style="display: flex; justify-content: space-between; padding: 3px 0;">
            <div>Shipping:</div>
            <div>${formatPrice(cart.totals.shipping)}</div>
          </li>
        `;
      }
      if (cart.totals.recurring_total > 0) {
        html += `
          <li style="display: flex; justify-content: space-between; padding: 3px 0; color: #2196f3;">
            <div>Recurring Total:</div>
            <div>${formatPrice(cart.totals.recurring_total)}</div>
          </li>
        `;
      }
      html += `
        <li style="display: flex; justify-content: space-between; padding: 3px 0; font-weight: 600; margin-top: 5px; border-top: 1px solid #eee;">
          <div>Total:</div>
          <div>${formatPrice(cart.totals.total)}</div>
        </li>
      `;
      html += "</ul></div>";
    } else {
      html += '<div style="color: #999; text-align: center; margin-bottom: 15px;">Cart totals not available</div>';
    }
    content.innerHTML = html;
  };

  // src/managers/TimerManager.js
  var _app13, _logger18, _timers, _storagePrefix, _initTimers, initTimers_fn, _setupTimer, setupTimer_fn, _getTimerConfig, getTimerConfig_fn, _formatTime, formatTime_fn, _triggerTimerEvent, triggerTimerEvent_fn;
  var TimerManager = class {
    constructor(app) {
      /**
       * Initialize all timers on the page
       */
      __privateAdd(this, _initTimers);
      /**
       * Set up a single timer element
       * @param {HTMLElement} timerElement - The timer element to set up
       */
      __privateAdd(this, _setupTimer);
      /**
       * Get timer configuration from element attributes
       * @param {HTMLElement} timerElement - The timer element
       * @param {HTMLElement|null} parentElement - The parent element with timer configuration
       * @returns {Object} Timer configuration
       */
      __privateAdd(this, _getTimerConfig);
      /**
       * Format time according to the specified format
       * @param {number} hours - Hours
       * @param {number} minutes - Minutes
       * @param {number} seconds - Seconds
       * @param {string} format - Format string ('auto', 'hh:mm:ss', 'mm:ss', 'ss')
       * @returns {string} Formatted time
       */
      __privateAdd(this, _formatTime);
      /**
       * Trigger a timer event
       * @param {string} eventName - Name of the event
       * @param {HTMLElement} element - Element that triggered the event
       * @param {Object} detail - Event details
       */
      __privateAdd(this, _triggerTimerEvent);
      __privateAdd(this, _app13, void 0);
      __privateAdd(this, _logger18, void 0);
      __privateAdd(this, _timers, /* @__PURE__ */ new Map());
      __privateAdd(this, _storagePrefix, "os-timer-");
      __privateSet(this, _app13, app);
      __privateSet(this, _logger18, app.logger.createModuleLogger("TIMER"));
      __privateMethod(this, _initTimers, initTimers_fn).call(this);
      __privateGet(this, _logger18).infoWithTime("TimerManager initialized");
    }
    /**
     * Refresh all timers on the page
     * This can be called after dynamic content is loaded
     */
    refreshTimers() {
      __privateGet(this, _logger18).infoWithTime("Refreshing timers");
      __privateGet(this, _timers).forEach((timer) => {
        if (timer.intervalId) {
          clearInterval(timer.intervalId);
          timer.intervalId = null;
        }
      });
      __privateGet(this, _timers).clear();
      __privateMethod(this, _initTimers, initTimers_fn).call(this);
    }
    /**
     * Get all active timers
     * @returns {Map} Map of active timers
     */
    getTimers() {
      return __privateGet(this, _timers);
    }
  };
  _app13 = new WeakMap();
  _logger18 = new WeakMap();
  _timers = new WeakMap();
  _storagePrefix = new WeakMap();
  _initTimers = new WeakSet();
  initTimers_fn = function() {
    __privateGet(this, _logger18).infoWithTime("Initializing timers");
    const timerElements = document.querySelectorAll('[data-os-element="timer"]');
    if (timerElements.length === 0) {
      __privateGet(this, _logger18).debugWithTime("No timer elements found on page");
      return;
    }
    __privateGet(this, _logger18).debugWithTime(`Found ${timerElements.length} timer elements`);
    timerElements.forEach((timerElement) => {
      __privateMethod(this, _setupTimer, setupTimer_fn).call(this, timerElement);
    });
  };
  _setupTimer = new WeakSet();
  setupTimer_fn = function(timerElement) {
    const parentElement = timerElement.closest('[data-os-element="timer-text"]');
    if (!parentElement) {
      __privateGet(this, _logger18).warnWithTime(`Timer element has no parent with data-os-element="timer-text", using default configuration`);
    }
    const timerConfig = __privateMethod(this, _getTimerConfig, getTimerConfig_fn).call(this, timerElement, parentElement);
    if (!timerConfig.duration) {
      __privateGet(this, _logger18).warnWithTime(`Timer element is missing duration, skipping: ${timerElement.outerHTML}`);
      return;
    }
    const originalParentContent = parentElement ? parentElement.innerHTML : null;
    let startTime = +/* @__PURE__ */ new Date();
    const timerPersistenceId = timerConfig.persistenceId;
    if (timerPersistenceId) {
      const storageKey = __privateGet(this, _storagePrefix) + timerPersistenceId;
      const cachedStartTime = parseInt(localStorage.getItem(storageKey) || "");
      if (cachedStartTime > 0) {
        startTime = cachedStartTime;
        __privateGet(this, _logger18).debugWithTime(`Loaded persisted timer start time for ${timerPersistenceId}: ${new Date(startTime).toISOString()}`);
      } else {
        localStorage.setItem(storageKey, String(startTime));
        __privateGet(this, _logger18).debugWithTime(`Saved new timer start time for ${timerPersistenceId}: ${new Date(startTime).toISOString()}`);
      }
    } else {
      __privateGet(this, _logger18).debugWithTime(`Timer has no persistence ID, it will reset with every page load: ${timerElement.outerHTML}`);
    }
    const timer = {
      element: timerElement,
      parentElement,
      config: timerConfig,
      startTime,
      intervalId: null,
      originalParentContent
    };
    __privateGet(this, _timers).set(timerElement, timer);
    const updateHandler = () => {
      const now = +/* @__PURE__ */ new Date();
      const elapsed = (now - startTime) / 1e3;
      let seconds = Math.round(timerConfig.duration - elapsed);
      if (seconds <= 0) {
        seconds = 0;
        if (timerConfig.expiryText) {
          if (parentElement && timerConfig.replaceEntireContent) {
            parentElement.innerHTML = timerConfig.expiryText;
          } else {
            timerElement.innerText = timerConfig.expiryText;
          }
        } else {
          timerElement.innerText = "00:00";
        }
        if (timer.intervalId) {
          clearInterval(timer.intervalId);
          timer.intervalId = null;
        }
        __privateGet(this, _timers).delete(timerElement);
        __privateMethod(this, _triggerTimerEvent, triggerTimerEvent_fn).call(this, "expired", timerElement, {
          timerElement,
          parentElement,
          config: timerConfig
        });
        return;
      }
      const hours = Math.floor(seconds / 3600);
      seconds -= hours * 3600;
      const minutes = Math.floor(seconds / 60);
      seconds -= minutes * 60;
      const formattedTime = __privateMethod(this, _formatTime, formatTime_fn).call(this, hours, minutes, seconds, timerConfig.format);
      timerElement.innerText = formattedTime;
      __privateMethod(this, _triggerTimerEvent, triggerTimerEvent_fn).call(this, "updated", timerElement, {
        timerElement,
        parentElement,
        config: timerConfig,
        remaining: { hours, minutes, seconds },
        formattedTime
      });
    };
    updateHandler();
    timer.intervalId = setInterval(updateHandler, 1e3);
    __privateGet(this, _logger18).debugWithTime(`Timer initialized: ${timerConfig.duration} seconds, persistence ID: ${timerConfig.persistenceId || "none"}`);
  };
  _getTimerConfig = new WeakSet();
  getTimerConfig_fn = function(timerElement, parentElement) {
    const config = {
      duration: 0,
      persistenceId: null,
      expiryText: null,
      format: "auto",
      // 'auto', 'hh:mm:ss', 'mm:ss', 'ss'
      replaceEntireContent: false
      // Whether to replace the entire parent content on expiry
    };
    if (timerElement.dataset.osDuration) {
      config.duration = parseInt(timerElement.dataset.osDuration);
    } else if (parentElement?.dataset.osTimerDuration) {
      config.duration = parseInt(parentElement.dataset.osTimerDuration);
    }
    if (timerElement.dataset.osPersistenceId) {
      config.persistenceId = timerElement.dataset.osPersistenceId;
    } else if (parentElement?.dataset.osTimerPersistenceId) {
      config.persistenceId = parentElement.dataset.osTimerPersistenceId;
    }
    if (timerElement.dataset.osExpiryText) {
      config.expiryText = timerElement.dataset.osExpiryText;
    } else if (parentElement?.dataset.osTimerExpiryText) {
      config.expiryText = parentElement.dataset.osTimerExpiryText;
    }
    if (timerElement.dataset.osFormat) {
      config.format = timerElement.dataset.osFormat;
    } else if (parentElement?.dataset.osTimerFormat) {
      config.format = parentElement.dataset.osTimerFormat;
    }
    if (timerElement.dataset.osReplaceEntireContent === "true") {
      config.replaceEntireContent = true;
    } else if (parentElement?.dataset.osTimerReplaceEntireContent === "true") {
      config.replaceEntireContent = true;
    }
    if (config.expiryText && (config.expiryText.includes("<") || config.expiryText.includes(">"))) {
      config.replaceEntireContent = true;
    }
    return config;
  };
  _formatTime = new WeakSet();
  formatTime_fn = function(hours, minutes, seconds, format) {
    const padded = (num) => num.toString().padStart(2, "0");
    if (format === "hh:mm:ss" || format === "auto" && hours > 0) {
      return `${padded(hours)}:${padded(minutes)}:${padded(seconds)}`;
    } else if (format === "mm:ss" || format === "auto" && minutes > 0) {
      return `${padded(minutes)}:${padded(seconds)}`;
    } else if (format === "ss") {
      return padded(seconds);
    }
    return `${padded(minutes)}:${padded(seconds)}`;
  };
  _triggerTimerEvent = new WeakSet();
  triggerTimerEvent_fn = function(eventName, element, detail = {}) {
    const event = new CustomEvent(`os:timer.${eventName}`, {
      bubbles: true,
      cancelable: true,
      detail: { ...detail, manager: this }
    });
    element.dispatchEvent(event);
    document.dispatchEvent(event);
    __privateGet(this, _logger18).debugWithTime(`Timer event triggered: ${eventName}`);
  };

  // src/managers/DisplayManager.js
  var _app14, _logger19, _displayElements, _initDisplayElements, initDisplayElements_fn, _updateContainerDisplay, updateContainerDisplay_fn, _triggerDisplayEvent, triggerDisplayEvent_fn;
  var DisplayManager = class {
    constructor(app) {
      /**
       * Initialize all display elements on the page
       */
      __privateAdd(this, _initDisplayElements);
      /**
       * Update the display of elements within a container based on cart contents
       * @param {HTMLElement} container - The container element
       * @param {Object} containerData - Data about the container and its elements
       * @param {Array<string>} cartItemIds - IDs of items currently in the cart
       */
      __privateAdd(this, _updateContainerDisplay);
      /**
       * Trigger a display event
       * @param {string} eventName - Name of the event
       * @param {HTMLElement} element - Element that triggered the event
       * @param {Object} detail - Event details
       */
      __privateAdd(this, _triggerDisplayEvent);
      __privateAdd(this, _app14, void 0);
      __privateAdd(this, _logger19, void 0);
      __privateAdd(this, _displayElements, /* @__PURE__ */ new Map());
      __privateSet(this, _app14, app);
      __privateSet(this, _logger19, app.logger.createModuleLogger("DISPLAY"));
      __privateMethod(this, _initDisplayElements, initDisplayElements_fn).call(this);
      __privateGet(this, _app14).state.subscribe("cart", () => this.refreshDisplayElements());
      __privateGet(this, _logger19).infoWithTime("DisplayManager initialized");
    }
    /**
     * Refresh all display elements based on current cart contents
     */
    refreshDisplayElements() {
      __privateGet(this, _logger19).debugWithTime("Refreshing display elements");
      const cart = __privateGet(this, _app14).state.getState("cart");
      const cartItemIds = cart.items.map((item) => item.id.toString());
      __privateGet(this, _displayElements).forEach((containerData, container) => {
        __privateMethod(this, _updateContainerDisplay, updateContainerDisplay_fn).call(this, container, containerData, cartItemIds);
      });
    }
    /**
     * Manually refresh display elements
     * This can be called after dynamic content is loaded
     */
    refresh() {
      __privateGet(this, _logger19).infoWithTime("Manually refreshing display elements");
      __privateGet(this, _displayElements).clear();
      __privateMethod(this, _initDisplayElements, initDisplayElements_fn).call(this);
    }
  };
  _app14 = new WeakMap();
  _logger19 = new WeakMap();
  _displayElements = new WeakMap();
  _initDisplayElements = new WeakSet();
  initDisplayElements_fn = function() {
    __privateGet(this, _logger19).infoWithTime("Initializing display elements");
    const swapContainers = document.querySelectorAll('[data-os-cart="swap-display"]');
    if (swapContainers.length === 0) {
      __privateGet(this, _logger19).debugWithTime("No swap display containers found on page");
      return;
    }
    __privateGet(this, _logger19).debugWithTime(`Found ${swapContainers.length} swap display containers`);
    swapContainers.forEach((container, index) => {
      const containerId = container.dataset.osId || `auto-container-${index}`;
      const displayElements = container.querySelectorAll('[data-os-in-cart="display"]');
      if (displayElements.length === 0) {
        __privateGet(this, _logger19).warnWithTime(`Container ${containerId} has no display elements`);
        return;
      }
      __privateGet(this, _displayElements).set(container, {
        id: containerId,
        elements: Array.from(displayElements).map((element) => ({
          element,
          packageId: element.dataset.osPackage
        }))
      });
      __privateGet(this, _logger19).debugWithTime(`Initialized container ${containerId} with ${displayElements.length} display elements`);
    });
    this.refreshDisplayElements();
  };
  _updateContainerDisplay = new WeakSet();
  updateContainerDisplay_fn = function(container, containerData, cartItemIds) {
    const { id, elements } = containerData;
    let hasVisibleElement = false;
    for (const { element, packageId } of elements) {
      if (packageId && cartItemIds.includes(packageId)) {
        element.style.display = "block";
        hasVisibleElement = true;
        __privateGet(this, _logger19).debugWithTime(`Showing element for package ${packageId} in container ${id}`);
      } else {
        element.style.display = "none";
      }
    }
    if (!hasVisibleElement && elements.length > 0) {
    }
    __privateMethod(this, _triggerDisplayEvent, triggerDisplayEvent_fn).call(this, "updated", container, {
      containerId: id,
      hasVisibleElement,
      visiblePackageIds: elements.filter(({ element }) => element.style.display === "block").map(({ packageId }) => packageId)
    });
  };
  _triggerDisplayEvent = new WeakSet();
  triggerDisplayEvent_fn = function(eventName, element, detail = {}) {
    const event = new CustomEvent(`os:display.${eventName}`, {
      bubbles: true,
      cancelable: true,
      detail: { ...detail, manager: this }
    });
    element.dispatchEvent(event);
    document.dispatchEvent(event);
    __privateGet(this, _logger19).debugWithTime(`Display event triggered: ${eventName}`);
  };

  // src/managers/CartDisplayManager.js
  var _app15, _logger20, _elements3, _config2, _lineItemTemplate, _initCartDisplay, initCartDisplay_fn, _initSummaryToggle, initSummaryToggle_fn, _toggleSummary, toggleSummary_fn, _updateLineItems, updateLineItems_fn, _createLineItemElement, createLineItemElement_fn, _updateSummary, updateSummary_fn, _updateShipping, updateShipping_fn, _updateSavings, updateSavings_fn, _updateGrandTotal, updateGrandTotal_fn, _formatPrice2, formatPrice_fn2, _debounce, debounce_fn, _updateCompareTotals, updateCompareTotals_fn, _findAllSummaryElements, findAllSummaryElements_fn;
  var CartDisplayManager = class {
    constructor(app) {
      /**
       * Initialize the cart display elements
       */
      __privateAdd(this, _initCartDisplay);
      /**
       * Initialize the summary toggle functionality
       */
      __privateAdd(this, _initSummaryToggle);
      /**
       * Toggle the summary panel between expanded and collapsed states
       * @param {number} index - Index of the summary panel to toggle
       */
      __privateAdd(this, _toggleSummary);
      /**
       * Update the line items display
       * @param {Array} items - Cart items
       */
      __privateAdd(this, _updateLineItems);
      /**
       * Create a line item element
       * @param {Object} item - Cart item
       * @returns {HTMLElement} Line item element
       */
      __privateAdd(this, _createLineItemElement);
      /**
       * Update the summary section
       * @param {Object} totals - Cart totals
       */
      __privateAdd(this, _updateSummary);
      /**
       * Update the shipping information
       * @param {number} shippingCost - Shipping cost
       * @param {Object} shippingMethod - Selected shipping method
       */
      __privateAdd(this, _updateShipping);
      /**
       * Update the savings information
       * @param {Object} totals - Cart totals
       */
      __privateAdd(this, _updateSavings);
      /**
       * Update the grand total
       * @param {number} total - Cart total
       */
      __privateAdd(this, _updateGrandTotal);
      /**
       * Format a price with currency symbol
       * @param {number} price - Price to format
       * @returns {string} Formatted price
       */
      __privateAdd(this, _formatPrice2);
      /**
       * Simple debounce function for resize events
       * @param {Function} func - Function to debounce
       * @param {number} wait - Wait time in milliseconds
       * @returns {Function} Debounced function
       */
      __privateAdd(this, _debounce);
      /**
       * Update the compare total elements
       * @param {Object} totals - Cart totals
       */
      __privateAdd(this, _updateCompareTotals);
      /**
       * Find all elements with a specific data attribute across all summary containers
       * @param {string} attribute - The data attribute to search for
       * @returns {NodeList} - All matching elements
       */
      __privateAdd(this, _findAllSummaryElements);
      __privateAdd(this, _app15, void 0);
      __privateAdd(this, _logger20, void 0);
      __privateAdd(this, _elements3, {
        lineDisplays: [],
        // Changed to array to support multiple displays
        summaryContainers: [],
        // Changed to array to support multiple containers
        savingsBars: [],
        // Changed to array
        shippingBars: [],
        // Changed to array
        grandTotals: [],
        // Changed to array
        subtotals: [],
        // Added for subtotal elements
        // Summary toggle elements
        summaryBars: [],
        // Changed to array
        summaryPanels: [],
        // Changed to array
        summaryTexts: [],
        // Changed to array
        summaryIcons: [],
        // Changed to array
        // Compare total elements
        compareTotalElements: []
      });
      __privateAdd(this, _config2, {
        currencySymbol: "$",
        showComparePricing: true,
        showProductImages: true,
        showTaxPendingMessage: true
      });
      __privateAdd(this, _lineItemTemplate, null);
      __privateSet(this, _app15, app);
      __privateSet(this, _logger20, app.logger.createModuleLogger("CART_DISPLAY"));
      __privateMethod(this, _initCartDisplay, initCartDisplay_fn).call(this);
      __privateGet(this, _app15).state.subscribe("cart", () => this.updateCartDisplay());
      __privateGet(this, _logger20).infoWithTime("CartDisplayManager initialized");
    }
    /**
     * Update the cart display with current cart data
     */
    updateCartDisplay() {
      __privateGet(this, _logger20).debugWithTime("Updating cart display");
      const cart = __privateGet(this, _app15).state.getState("cart");
      if (!cart) {
        __privateGet(this, _logger20).warnWithTime("Cart data not available");
        return;
      }
      __privateGet(this, _logger20).debugWithTime(`Cart data: ${JSON.stringify(cart)}`);
      __privateMethod(this, _updateLineItems, updateLineItems_fn).call(this, cart.items);
      __privateMethod(this, _updateSummary, updateSummary_fn).call(this, cart.totals);
      __privateMethod(this, _updateShipping, updateShipping_fn).call(this, cart.totals.shipping, cart.shippingMethod);
      __privateMethod(this, _updateSavings, updateSavings_fn).call(this, cart.totals);
      __privateMethod(this, _updateGrandTotal, updateGrandTotal_fn).call(this, cart.totals.total);
      __privateMethod(this, _updateCompareTotals, updateCompareTotals_fn).call(this, cart.totals);
      __privateGet(this, _logger20).debugWithTime("Cart display updated");
    }
    /**
     * Refresh the cart display and re-find all elements
     * This can be called after dynamic content is loaded or when the viewport changes
     */
    refresh() {
      __privateGet(this, _logger20).infoWithTime("Manually refreshing cart display");
      __privateMethod(this, _initCartDisplay, initCartDisplay_fn).call(this);
    }
  };
  _app15 = new WeakMap();
  _logger20 = new WeakMap();
  _elements3 = new WeakMap();
  _config2 = new WeakMap();
  _lineItemTemplate = new WeakMap();
  _initCartDisplay = new WeakSet();
  initCartDisplay_fn = function() {
    __privateGet(this, _logger20).infoWithTime("Initializing cart display");
    __privateGet(this, _elements3).lineDisplays = document.querySelectorAll('[data-os-cart-summary="line-display"]');
    __privateGet(this, _elements3).summaryContainers = document.querySelectorAll('[data-os-cart="summary"]');
    __privateGet(this, _elements3).savingsBars = document.querySelectorAll('[data-os-cart-summary="savings"]');
    __privateGet(this, _elements3).shippingBars = document.querySelectorAll('[data-os-cart-summary="shipping-bar"]');
    __privateGet(this, _elements3).grandTotals = document.querySelectorAll('[data-os-cart-summary="grand-total"]');
    __privateGet(this, _elements3).subtotals = document.querySelectorAll('[data-os-cart-summary="subtotal"]');
    __privateGet(this, _elements3).summaryBars = document.querySelectorAll('[os-checkout-element="summary-bar"]');
    __privateGet(this, _elements3).summaryPanels = document.querySelectorAll('[os-checkout-element="summary-mobile"]');
    __privateGet(this, _elements3).summaryTexts = document.querySelectorAll('[os-checkout-element="summary-text"]');
    __privateGet(this, _elements3).summaryIcons = document.querySelectorAll("[os-summary-icon]");
    __privateGet(this, _elements3).compareTotalElements = document.querySelectorAll('[data-os-cart-summary="compare-total"]');
    __privateGet(this, _logger20).debugWithTime(`Line displays found: ${__privateGet(this, _elements3).lineDisplays.length}`);
    __privateGet(this, _logger20).debugWithTime(`Summary containers found: ${__privateGet(this, _elements3).summaryContainers.length}`);
    __privateGet(this, _logger20).debugWithTime(`Savings bars found: ${__privateGet(this, _elements3).savingsBars.length}`);
    __privateGet(this, _logger20).debugWithTime(`Shipping bars found: ${__privateGet(this, _elements3).shippingBars.length}`);
    __privateGet(this, _logger20).debugWithTime(`Grand total elements found: ${__privateGet(this, _elements3).grandTotals.length}`);
    __privateGet(this, _logger20).debugWithTime(`Subtotal elements found: ${__privateGet(this, _elements3).subtotals.length}`);
    __privateGet(this, _logger20).debugWithTime(`Summary bars found: ${__privateGet(this, _elements3).summaryBars.length}`);
    __privateGet(this, _logger20).debugWithTime(`Summary panels found: ${__privateGet(this, _elements3).summaryPanels.length}`);
    __privateGet(this, _logger20).debugWithTime(`Summary texts found: ${__privateGet(this, _elements3).summaryTexts.length}`);
    __privateGet(this, _logger20).debugWithTime(`Summary icons found: ${__privateGet(this, _elements3).summaryIcons.length}`);
    __privateGet(this, _logger20).debugWithTime(`Compare total elements found: ${__privateGet(this, _elements3).compareTotalElements.length}`);
    if (__privateGet(this, _elements3).summaryContainers.length > 0) {
      const firstContainer = __privateGet(this, _elements3).summaryContainers[0];
      __privateGet(this, _config2).showComparePricing = firstContainer.dataset.showComparePricing !== "false";
      __privateGet(this, _config2).showProductImages = firstContainer.dataset.showProductImages !== "false";
      __privateGet(this, _config2).showTaxPendingMessage = firstContainer.dataset.showTaxPendingMessage !== "false";
      __privateGet(this, _config2).currencySymbol = firstContainer.dataset.currencySymbol || "$";
    }
    const existingLineItem = document.querySelector('[data-os-cart-summary="line-item"]');
    if (existingLineItem) {
      __privateSet(this, _lineItemTemplate, existingLineItem.cloneNode(true));
    }
    __privateMethod(this, _initSummaryToggle, initSummaryToggle_fn).call(this);
    __privateGet(this, _logger20).debugWithTime("Cart display elements initialized");
    this.updateCartDisplay();
  };
  _initSummaryToggle = new WeakSet();
  initSummaryToggle_fn = function() {
    const { summaryBars, summaryPanels, summaryTexts, summaryIcons } = __privateGet(this, _elements3);
    if (!summaryBars.length || !summaryPanels.length) {
      __privateGet(this, _logger20).debugWithTime("Summary toggle elements not found, skipping initialization");
      return;
    }
    __privateGet(this, _logger20).debugWithTime("Initializing summary toggle");
    summaryPanels.forEach((panel, index) => {
      panel.classList.add("no-transition");
      if (!panel.classList.contains("cc-expanded")) {
        panel.style.height = "0";
        panel.style.opacity = "0";
        panel.style.overflow = "hidden";
        const textElement = summaryTexts[index];
        if (textElement) {
          textElement.textContent = "Show Order Summary";
        }
      }
      requestAnimationFrame(() => {
        panel.classList.remove("no-transition");
        panel.style.transition = "height 0.3s ease-out, opacity 0.25s ease-out";
      });
    });
    summaryBars.forEach((bar, index) => {
      bar.addEventListener("click", (e) => {
        e.preventDefault();
        __privateMethod(this, _toggleSummary, toggleSummary_fn).call(this, index);
      });
    });
    window.addEventListener("resize", __privateMethod(this, _debounce, debounce_fn).call(this, () => {
      summaryPanels.forEach((panel) => {
        if (panel.classList.contains("cc-expanded")) {
          panel.style.height = "auto";
        }
      });
    }, 250));
    __privateGet(this, _logger20).debugWithTime("Summary toggle initialized");
  };
  _toggleSummary = new WeakSet();
  toggleSummary_fn = function(index = 0) {
    const { summaryPanels, summaryTexts, summaryIcons } = __privateGet(this, _elements3);
    const panel = summaryPanels[index];
    const text = summaryTexts[index];
    const icon = summaryIcons[index];
    if (!panel)
      return;
    const isExpanded = panel.classList.contains("cc-expanded");
    if (!isExpanded) {
      panel.classList.add("cc-expanded");
      panel.style.height = `${panel.scrollHeight}px`;
      panel.style.opacity = "1";
      if (text) {
        text.textContent = "Hide Order Summary";
      }
      if (icon) {
        icon.style.transform = "rotate(180deg)";
      }
      panel.addEventListener("transitionend", () => {
        if (panel.classList.contains("cc-expanded")) {
          panel.style.height = "auto";
        }
      }, { once: true });
      __privateGet(this, _logger20).debugWithTime("Summary panel expanded");
    } else {
      const currentHeight = panel.scrollHeight;
      panel.style.height = `${currentHeight}px`;
      panel.offsetHeight;
      panel.style.height = "0";
      panel.style.opacity = "0";
      if (text) {
        text.textContent = "Show Order Summary";
      }
      if (icon) {
        icon.style.transform = "rotate(0deg)";
      }
      panel.addEventListener("transitionend", () => {
        if (panel.style.height === "0px") {
          panel.classList.remove("cc-expanded");
        }
      }, { once: true });
      __privateGet(this, _logger20).debugWithTime("Summary panel collapsed");
    }
  };
  _updateLineItems = new WeakSet();
  updateLineItems_fn = function(items) {
    if (!__privateGet(this, _elements3).lineDisplays.length || !__privateGet(this, _lineItemTemplate)) {
      __privateGet(this, _logger20).warnWithTime("Line displays or template not found");
      return;
    }
    if (!items || items.length === 0) {
      __privateGet(this, _logger20).debugWithTime("No items in cart");
      return;
    }
    __privateGet(this, _elements3).lineDisplays.forEach((lineDisplay) => {
      lineDisplay.innerHTML = "";
      items.forEach((item) => {
        const lineItemElement = __privateMethod(this, _createLineItemElement, createLineItemElement_fn).call(this, item);
        lineDisplay.appendChild(lineItemElement);
      });
    });
    const scrollIndicators = document.querySelectorAll('[data-os-cart-summary="summary-scroll"]');
    if (scrollIndicators.length) {
      const shouldShowScroll = items.length > 2;
      scrollIndicators.forEach((indicator) => {
        indicator.classList.toggle("hide", !shouldShowScroll);
      });
    }
  };
  _createLineItemElement = new WeakSet();
  createLineItemElement_fn = function(item) {
    const lineItem = __privateGet(this, _lineItemTemplate).cloneNode(true);
    const titleElement = lineItem.querySelector('[data-os-cart-summary="line-title"]');
    if (titleElement) {
      titleElement.textContent = item.name;
    }
    if (__privateGet(this, _config2).showProductImages) {
      const imageElement = lineItem.querySelector('[data-os-cart-summary="line-image"]');
      if (imageElement && item.image) {
        imageElement.src = item.image;
        imageElement.alt = item.name;
      }
    }
    const qtyElement = lineItem.querySelector('[os-cart="line_item-qty"]');
    if (qtyElement) {
      qtyElement.textContent = item.quantity || 1;
    }
    const comparePrice = lineItem.querySelector('[data-os-cart-summary="line-compare"]');
    const salePrice = lineItem.querySelector('[data-os-cart-summary="line-sale"]');
    if (comparePrice && item.retail_price && __privateGet(this, _config2).showComparePricing) {
      comparePrice.textContent = __privateMethod(this, _formatPrice2, formatPrice_fn2).call(this, item.retail_price * (item.quantity || 1));
      comparePrice.classList.remove("hide");
    } else if (comparePrice) {
      comparePrice.classList.add("hide");
    }
    if (salePrice) {
      salePrice.textContent = __privateMethod(this, _formatPrice2, formatPrice_fn2).call(this, item.price * (item.quantity || 1));
    }
    const savingsPercentElement = lineItem.querySelector('[data-os-cart-summary="line-saving-percent"]');
    if (savingsPercentElement && item.retail_price) {
      const savingsPercent = Math.round((1 - item.price / item.retail_price) * 100);
      if (savingsPercent > 0) {
        const format = savingsPercentElement.dataset.osFormat || "default";
        let savingsText = `${savingsPercent}% OFF`;
        if (format === "parenthesis") {
          savingsText = `(${savingsPercent}% OFF)`;
        }
        savingsPercentElement.textContent = savingsText;
        savingsPercentElement.classList.remove("hide");
      } else {
        savingsPercentElement.classList.add("hide");
      }
    } else if (savingsPercentElement) {
      savingsPercentElement.classList.add("hide");
    }
    return lineItem;
  };
  _updateSummary = new WeakSet();
  updateSummary_fn = function(totals) {
    if (!totals)
      return;
    if (__privateGet(this, _elements3).subtotals.length) {
      __privateGet(this, _elements3).subtotals.forEach((element) => {
        element.textContent = __privateMethod(this, _formatPrice2, formatPrice_fn2).call(this, totals.subtotal);
      });
      __privateGet(this, _logger20).debugWithTime(`Updated subtotal to: ${__privateMethod(this, _formatPrice2, formatPrice_fn2).call(this, totals.subtotal)}`);
    }
  };
  _updateShipping = new WeakSet();
  updateShipping_fn = function(shippingCost, shippingMethod) {
    if (!__privateGet(this, _elements3).shippingBars.length) {
      __privateGet(this, _logger20).warnWithTime("Shipping bars not found");
      return;
    }
    __privateGet(this, _elements3).shippingBars.forEach((shippingBar) => {
      const shippingCompare = shippingBar.querySelector('[data-os-cart-summary="shipping-compare"]');
      const shippingCurrent = shippingBar.querySelector('[data-os-cart-summary="shipping-current"]');
      if (shippingCompare && shippingCurrent) {
        if (shippingCost === 0 && shippingMethod?.standard_cost > 0) {
          shippingCompare.textContent = __privateMethod(this, _formatPrice2, formatPrice_fn2).call(this, shippingMethod.standard_cost);
          shippingCurrent.textContent = "FREE";
          shippingCompare.classList.remove("hide");
        } else if (shippingCost > 0) {
          shippingCurrent.textContent = __privateMethod(this, _formatPrice2, formatPrice_fn2).call(this, shippingCost);
          shippingCompare.classList.add("hide");
        } else {
          shippingCurrent.textContent = "FREE";
          shippingCompare.classList.add("hide");
        }
      }
    });
  };
  _updateSavings = new WeakSet();
  updateSavings_fn = function(totals) {
    if (!__privateGet(this, _elements3).savingsBars.length) {
      __privateGet(this, _logger20).warnWithTime("Savings bars not found");
      return;
    }
    __privateGet(this, _elements3).savingsBars.forEach((savingsBar) => {
      const savingsAmount = savingsBar.querySelector('[data-os-cart-summary="savings-amount"]');
      const savingsPercentage = savingsBar.querySelector('[data-os-cart-summary="savings-percentage"]');
      if (totals.savings > 0 && totals.savings_percentage > 0) {
        if (savingsAmount) {
          savingsAmount.textContent = __privateMethod(this, _formatPrice2, formatPrice_fn2).call(this, totals.savings);
          __privateGet(this, _logger20).debugWithTime(`Updated savings amount to: ${__privateMethod(this, _formatPrice2, formatPrice_fn2).call(this, totals.savings)}`);
        }
        if (savingsPercentage) {
          savingsPercentage.textContent = `${Math.round(totals.savings_percentage)}% OFF`;
          __privateGet(this, _logger20).debugWithTime(`Updated savings percentage to: ${Math.round(totals.savings_percentage)}% OFF`);
        }
        savingsBar.classList.remove("hide");
      } else {
        savingsBar.classList.add("hide");
      }
    });
    const allSavingsAmounts = document.querySelectorAll('[data-os-cart-summary="savings-amount"]');
    const allSavingsPercentages = document.querySelectorAll('[data-os-cart-summary="savings-percentage"]');
    if (totals.savings > 0 && totals.savings_percentage > 0) {
      allSavingsAmounts.forEach((element) => {
        element.textContent = __privateMethod(this, _formatPrice2, formatPrice_fn2).call(this, totals.savings);
      });
      allSavingsPercentages.forEach((element) => {
        element.textContent = `${Math.round(totals.savings_percentage)}% OFF`;
      });
    }
  };
  _updateGrandTotal = new WeakSet();
  updateGrandTotal_fn = function(total) {
    if (!__privateGet(this, _elements3).grandTotals.length) {
      __privateGet(this, _logger20).warnWithTime("Grand total elements not found");
      return;
    }
    __privateGet(this, _elements3).grandTotals.forEach((element) => {
      element.textContent = __privateMethod(this, _formatPrice2, formatPrice_fn2).call(this, total);
    });
    __privateGet(this, _logger20).debugWithTime(`Updated grand total to: ${__privateMethod(this, _formatPrice2, formatPrice_fn2).call(this, total)}`);
  };
  _formatPrice2 = new WeakSet();
  formatPrice_fn2 = function(price) {
    if (__privateGet(this, _app15).campaign?.formatPrice) {
      return __privateGet(this, _app15).campaign.formatPrice(price);
    }
    return `${__privateGet(this, _config2).currencySymbol}${price.toFixed(2)} USD`;
  };
  _debounce = new WeakSet();
  debounce_fn = function(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  };
  _updateCompareTotals = new WeakSet();
  updateCompareTotals_fn = function(totals) {
    if (!__privateGet(this, _elements3).compareTotalElements.length) {
      __privateGet(this, _logger20).debugWithTime("No compare-total elements found");
      return;
    }
    __privateGet(this, _logger20).debugWithTime("Updating compare-total elements");
    __privateGet(this, _logger20).debugWithTime(`Cart totals: ${JSON.stringify(totals)}`);
    __privateGet(this, _elements3).compareTotalElements.forEach((element) => {
      const totalType = element.dataset.totalType || "retail";
      let compareValue = null;
      switch (totalType) {
        case "retail":
          compareValue = totals.retail_subtotal;
          break;
        case "recurring":
          compareValue = totals.recurring_total;
          break;
        case "subtotal_compare":
        case "original":
        case "msrp":
          compareValue = totals[totalType] || null;
          break;
        default:
          compareValue = totals.retail_subtotal;
      }
      if (compareValue && compareValue > totals.total) {
        element.textContent = __privateMethod(this, _formatPrice2, formatPrice_fn2).call(this, compareValue);
        element.classList.remove("hide");
        __privateGet(this, _logger20).debugWithTime(`Updated compare-total (${totalType}) to: ${__privateMethod(this, _formatPrice2, formatPrice_fn2).call(this, compareValue)}`);
      } else {
        element.classList.add("hide");
        __privateGet(this, _logger20).debugWithTime(`Hiding compare-total element (${totalType}): compareValue=${compareValue}, total=${totals.total}`);
      }
    });
  };
  _findAllSummaryElements = new WeakSet();
  findAllSummaryElements_fn = function(attribute) {
    return document.querySelectorAll(`[${attribute}]`);
  };

  // src/managers/AttributionManager.js
  var _app16, _logger21, _attributionData, _initialized2, _init7, init_fn7, _collectAttributionData, collectAttributionData_fn, _collectTrackingTags, collectTrackingTags_fn, _storeAttributionData, storeAttributionData_fn, _persistAttributionData, persistAttributionData_fn, _loadPersistedAttributionData, loadPersistedAttributionData_fn, _getFirstVisitTimestamp, getFirstVisitTimestamp_fn, _setupEventListeners4, setupEventListeners_fn4, _getStoredValue, getStoredValue_fn, _getCookie, getCookie_fn, _getDeviceType, getDeviceType_fn, _getFacebookPixelId, getFacebookPixelId_fn;
  var AttributionManager = class {
    /**
     * Initialize the AttributionManager
     * @param {Object} app - The main application instance
     */
    constructor(app) {
      /**
       * Initialize the AttributionManager
       */
      __privateAdd(this, _init7);
      /**
       * Collect attribution data from various sources
       */
      __privateAdd(this, _collectAttributionData);
      /**
       * Collect all meta tracking tags and add them to metadata object
       * @param {Object} metadata - The metadata object to update
       */
      __privateAdd(this, _collectTrackingTags);
      /**
       * Store attribution data in the state
       */
      __privateAdd(this, _storeAttributionData);
      /**
       * Persist attribution data to localStorage
       */
      __privateAdd(this, _persistAttributionData);
      /**
       * Load persisted attribution data from localStorage
       * @returns {Object} The loaded attribution data
       */
      __privateAdd(this, _loadPersistedAttributionData);
      /**
       * Get the first visit timestamp
       * @returns {number} The timestamp of the first visit
       */
      __privateAdd(this, _getFirstVisitTimestamp);
      /**
       * Set up event listeners for page navigation
       */
      __privateAdd(this, _setupEventListeners4);
      /**
       * Get a value from URL parameters, sessionStorage, or localStorage
       * @param {string} key - The key to get
       * @returns {string} The value
       */
      __privateAdd(this, _getStoredValue);
      /**
       * Get a cookie value
       * @param {string} name - The cookie name
       * @returns {string} The cookie value
       */
      __privateAdd(this, _getCookie);
      /**
       * Get the device type based on user agent
       * @returns {string} The device type
       */
      __privateAdd(this, _getDeviceType);
      /**
       * Try to detect Facebook Pixel ID from the page
       * @returns {string} The Facebook Pixel ID or empty string if not found
       */
      __privateAdd(this, _getFacebookPixelId);
      __privateAdd(this, _app16, void 0);
      __privateAdd(this, _logger21, void 0);
      __privateAdd(this, _attributionData, {});
      __privateAdd(this, _initialized2, false);
      __privateSet(this, _app16, app);
      __privateSet(this, _logger21, app.logger.createModuleLogger("ATTRIBUTION"));
      __privateMethod(this, _init7, init_fn7).call(this);
    }
    /**
     * Update attribution data with new values
     * @param {Object} newData - New attribution data to merge
     */
    updateAttributionData(newData) {
      if (newData.metadata && __privateGet(this, _attributionData).metadata) {
        newData.metadata = {
          ...__privateGet(this, _attributionData).metadata,
          ...newData.metadata
        };
      }
      if (newData.funnel) {
        __privateGet(this, _logger21).debug(`Updating funnel value to: ${newData.funnel}`);
      }
      __privateSet(this, _attributionData, {
        ...__privateGet(this, _attributionData),
        ...newData
      });
      __privateMethod(this, _storeAttributionData, storeAttributionData_fn).call(this);
      __privateGet(this, _logger21).debug("Attribution data updated", newData);
      if (__privateGet(this, _app16).events) {
        __privateGet(this, _app16).events.trigger("attribution.updated", {
          attribution: __privateGet(this, _attributionData)
        });
      }
    }
    /**
     * Get attribution data
     * @returns {Object} The current attribution data
     */
    getAttributionData() {
      return { ...__privateGet(this, _attributionData) };
    }
    /**
     * Get attribution data formatted for API
     * @returns {Object} Attribution data formatted for API
     */
    getAttributionForApi() {
      return {
        // Core attribution fields
        affiliate: __privateGet(this, _attributionData).affiliate,
        funnel: __privateGet(this, _attributionData).funnel,
        gclid: __privateGet(this, _attributionData).gclid,
        metadata: __privateGet(this, _attributionData).metadata,
        // UTM parameters at root level as required by API
        utm_source: __privateGet(this, _attributionData).utm_source,
        utm_medium: __privateGet(this, _attributionData).utm_medium,
        utm_campaign: __privateGet(this, _attributionData).utm_campaign,
        utm_content: __privateGet(this, _attributionData).utm_content,
        utm_term: __privateGet(this, _attributionData).utm_term,
        // Subaffiliate parameters at root level as required by API
        subaffiliate1: __privateGet(this, _attributionData).subaffiliate1,
        subaffiliate2: __privateGet(this, _attributionData).subaffiliate2,
        subaffiliate3: __privateGet(this, _attributionData).subaffiliate3,
        subaffiliate4: __privateGet(this, _attributionData).subaffiliate4,
        subaffiliate5: __privateGet(this, _attributionData).subaffiliate5
      };
    }
    /**
     * Debug method to log attribution data to console
     * Useful for troubleshooting attribution issues
     */
    debug() {
      console.group("AttributionManager Debug Info");
      const funnelMetaTag = document.querySelector('meta[name="os-tracking-tag"][data-tag-name="funnel_name"]');
      const funnelFromTag = funnelMetaTag ? funnelMetaTag.getAttribute("data-tag-value") : "";
      const campaignName = __privateGet(this, _app16).campaign?.getCampaignName() || __privateGet(this, _app16).campaignData?.name || "";
      /* @__PURE__ */ console.log("Key Attribution Values:");
      /* @__PURE__ */ console.log("- Affiliate:", __privateGet(this, _attributionData).affiliate);
      /* @__PURE__ */ console.log("- Funnel:", __privateGet(this, _attributionData).funnel);
      /* @__PURE__ */ console.log("  • Funnel from meta tag:", funnelFromTag || "(not set)");
      /* @__PURE__ */ console.log("  • Campaign name:", campaignName || "(not set)");
      /* @__PURE__ */ console.log("  • Source used:", funnelFromTag ? "meta tag" : campaignName ? "campaign name" : "none");
      console.group("API Formatted Attribution Data (What gets sent to API)");
      const apiData = this.getAttributionForApi();
      /* @__PURE__ */ console.log("Core Fields:");
      /* @__PURE__ */ console.log("- affiliate:", apiData.affiliate);
      /* @__PURE__ */ console.log("- funnel:", apiData.funnel);
      /* @__PURE__ */ console.log("- gclid:", apiData.gclid);
      /* @__PURE__ */ console.log("UTM Parameters:");
      /* @__PURE__ */ console.log("- utm_source:", apiData.utm_source);
      /* @__PURE__ */ console.log("- utm_medium:", apiData.utm_medium);
      /* @__PURE__ */ console.log("- utm_campaign:", apiData.utm_campaign);
      /* @__PURE__ */ console.log("- utm_content:", apiData.utm_content);
      /* @__PURE__ */ console.log("- utm_term:", apiData.utm_term);
      /* @__PURE__ */ console.log("Subaffiliate Parameters:");
      /* @__PURE__ */ console.log("- subaffiliate1:", apiData.subaffiliate1);
      /* @__PURE__ */ console.log("- subaffiliate2:", apiData.subaffiliate2);
      /* @__PURE__ */ console.log("- subaffiliate3:", apiData.subaffiliate3);
      /* @__PURE__ */ console.log("- subaffiliate4:", apiData.subaffiliate4);
      /* @__PURE__ */ console.log("- subaffiliate5:", apiData.subaffiliate5);
      console.group("Metadata Object:");
      /* @__PURE__ */ console.log("- Domain:", apiData.metadata.domain);
      /* @__PURE__ */ console.log("- Device (User Agent):", apiData.metadata.device);
      /* @__PURE__ */ console.log("- Device Type:", apiData.metadata.device_type);
      /* @__PURE__ */ console.log("- Facebook Data:");
      /* @__PURE__ */ console.log("  - fb_fbp:", apiData.metadata.fb_fbp);
      /* @__PURE__ */ console.log("  - fb_fbc:", apiData.metadata.fb_fbc);
      /* @__PURE__ */ console.log("  - fb_pixel_id:", apiData.metadata.fb_pixel_id);
      /* @__PURE__ */ console.log("- Full Metadata:", apiData.metadata);
      console.groupEnd();
      console.groupEnd();
      /* @__PURE__ */ console.log("Raw Attribution Data:", __privateGet(this, _attributionData));
      /* @__PURE__ */ console.log("URL Parameters:", new URLSearchParams(window.location.search).toString());
      console.group("Tracking Tags");
      const trackingTags = document.querySelectorAll('meta[name="os-tracking-tag"]');
      if (trackingTags.length > 0) {
        trackingTags.forEach((tag) => {
          /* @__PURE__ */ console.log(`${tag.getAttribute("data-tag-name")}: ${tag.getAttribute("data-tag-value")}${tag.getAttribute("data-persist") === "true" ? " (persisted)" : ""}`);
        });
      } else {
        /* @__PURE__ */ console.log("No tracking tags found");
      }
      console.groupEnd();
      /* @__PURE__ */ console.log("Funnel Meta Tag:", funnelMetaTag ? {
        exists: true,
        value: funnelMetaTag.getAttribute("data-tag-value")
      } : {
        exists: false
      });
      /* @__PURE__ */ console.log("Campaign Name:", __privateGet(this, _app16).campaignData?.name || "Not available");
      if (__privateGet(this, _app16).state) {
        /* @__PURE__ */ console.log("API-formatted State Attribution:", __privateGet(this, _app16).state.getState("attribution"));
      }
      console.groupEnd();
      return "Attribution debug info logged to console.";
    }
    /**
     * Set the funnel name in attribution data
     * Simple method to set the funnel name
     * @param {string} funnelName - The funnel name to set
     */
    setFunnelName(funnelName) {
      if (!funnelName) {
        __privateGet(this, _logger21).warn("Cannot set empty funnel name");
        return false;
      }
      __privateGet(this, _attributionData).funnel = funnelName;
      __privateMethod(this, _storeAttributionData, storeAttributionData_fn).call(this);
      __privateGet(this, _logger21).info(`Funnel name set to: ${funnelName}`);
      return true;
    }
  };
  _app16 = new WeakMap();
  _logger21 = new WeakMap();
  _attributionData = new WeakMap();
  _initialized2 = new WeakMap();
  _init7 = new WeakSet();
  init_fn7 = function() {
    __privateGet(this, _logger21).info("Initializing AttributionManager");
    __privateMethod(this, _collectAttributionData, collectAttributionData_fn).call(this);
    __privateMethod(this, _storeAttributionData, storeAttributionData_fn).call(this);
    __privateMethod(this, _setupEventListeners4, setupEventListeners_fn4).call(this);
    __privateSet(this, _initialized2, true);
    __privateGet(this, _logger21).info("AttributionManager initialized successfully");
  };
  _collectAttributionData = new WeakSet();
  collectAttributionData_fn = function() {
    const metadata = {
      landing_page: window.location.href || "",
      referrer: document.referrer || "",
      device: navigator.userAgent || "",
      device_type: __privateMethod(this, _getDeviceType, getDeviceType_fn).call(this),
      timestamp: Date.now(),
      domain: window.location.hostname,
      // Facebook tracking data
      fb_fbp: __privateMethod(this, _getCookie, getCookie_fn).call(this, "_fbp") || "",
      fb_fbc: __privateMethod(this, _getCookie, getCookie_fn).call(this, "_fbc") || "",
      fb_pixel_id: __privateMethod(this, _getFacebookPixelId, getFacebookPixelId_fn).call(this)
    };
    const fbclid = __privateMethod(this, _getStoredValue, getStoredValue_fn).call(this, "fbclid") || "";
    if (fbclid) {
      metadata.fbclid = fbclid;
    }
    __privateMethod(this, _collectTrackingTags, collectTrackingTags_fn).call(this, metadata);
    const affiliate = __privateMethod(this, _getStoredValue, getStoredValue_fn).call(this, "affid") || __privateMethod(this, _getStoredValue, getStoredValue_fn).call(this, "aff") || "";
    __privateSet(this, _attributionData, {
      // Attribution API compatible fields
      affiliate,
      funnel: "",
      // Will be set later when campaign data is available
      gclid: __privateMethod(this, _getStoredValue, getStoredValue_fn).call(this, "gclid") || "",
      metadata,
      // Standard UTM parameters
      utm_source: __privateMethod(this, _getStoredValue, getStoredValue_fn).call(this, "utm_source") || "",
      utm_medium: __privateMethod(this, _getStoredValue, getStoredValue_fn).call(this, "utm_medium") || "",
      utm_campaign: __privateMethod(this, _getStoredValue, getStoredValue_fn).call(this, "utm_campaign") || "",
      utm_content: __privateMethod(this, _getStoredValue, getStoredValue_fn).call(this, "utm_content") || "",
      utm_term: __privateMethod(this, _getStoredValue, getStoredValue_fn).call(this, "utm_term") || "",
      // Other tracking parameters
      fbclid,
      // Sub-affiliate parameters
      subaffiliate1: __privateMethod(this, _getStoredValue, getStoredValue_fn).call(this, "subaffiliate1") || __privateMethod(this, _getStoredValue, getStoredValue_fn).call(this, "sub1") || "",
      subaffiliate2: __privateMethod(this, _getStoredValue, getStoredValue_fn).call(this, "subaffiliate2") || __privateMethod(this, _getStoredValue, getStoredValue_fn).call(this, "sub2") || "",
      subaffiliate3: __privateMethod(this, _getStoredValue, getStoredValue_fn).call(this, "subaffiliate3") || __privateMethod(this, _getStoredValue, getStoredValue_fn).call(this, "sub3") || "",
      subaffiliate4: __privateMethod(this, _getStoredValue, getStoredValue_fn).call(this, "subaffiliate4") || __privateMethod(this, _getStoredValue, getStoredValue_fn).call(this, "sub4") || "",
      subaffiliate5: __privateMethod(this, _getStoredValue, getStoredValue_fn).call(this, "subaffiliate5") || __privateMethod(this, _getStoredValue, getStoredValue_fn).call(this, "sub5") || "",
      // Time data
      first_visit_timestamp: __privateMethod(this, _getFirstVisitTimestamp, getFirstVisitTimestamp_fn).call(this),
      current_visit_timestamp: Date.now()
    });
    __privateGet(this, _logger21).debug("Attribution data collected");
  };
  _collectTrackingTags = new WeakSet();
  collectTrackingTags_fn = function(metadata) {
    const trackingTags = document.querySelectorAll('meta[name="os-tracking-tag"]');
    __privateGet(this, _logger21).debug(`Found ${trackingTags.length} tracking tags`);
    trackingTags.forEach((tag) => {
      const tagName = tag.getAttribute("data-tag-name");
      const tagValue = tag.getAttribute("data-tag-value");
      const shouldPersist = tag.getAttribute("data-persist") === "true";
      if (tagName && tagValue) {
        metadata[tagName] = tagValue;
        __privateGet(this, _logger21).debug(`Added tracking tag: ${tagName} = ${tagValue}`);
        if (shouldPersist) {
          try {
            sessionStorage.setItem(`os_tag_${tagName}`, tagValue);
            __privateGet(this, _logger21).debug(`Persisted tracking tag: ${tagName} = ${tagValue}`);
          } catch (error) {
            __privateGet(this, _logger21).error(`Error persisting tracking tag ${tagName}:`, error);
          }
        }
      }
    });
  };
  _storeAttributionData = new WeakSet();
  storeAttributionData_fn = function() {
    if (!__privateGet(this, _app16).state) {
      __privateGet(this, _logger21).warn("State manager not available, attribution data will not be stored");
      return;
    }
    __privateGet(this, _app16).state.setState("cart.attribution", __privateGet(this, _attributionData));
    __privateGet(this, _app16).state.setState("attribution", this.getAttributionForApi());
    __privateMethod(this, _persistAttributionData, persistAttributionData_fn).call(this);
    if (__privateGet(this, _app16).events) {
      __privateGet(this, _app16).events.trigger("attribution.updated", {
        attribution: __privateGet(this, _attributionData)
      });
    }
    __privateGet(this, _logger21).debug("Attribution data stored in state");
  };
  _persistAttributionData = new WeakSet();
  persistAttributionData_fn = function() {
    try {
      localStorage.setItem("os_attribution", JSON.stringify(__privateGet(this, _attributionData)));
      __privateGet(this, _logger21).debug("Attribution data persisted to localStorage");
    } catch (error) {
      __privateGet(this, _logger21).error("Error persisting attribution data to localStorage:", error);
    }
  };
  _loadPersistedAttributionData = new WeakSet();
  loadPersistedAttributionData_fn = function() {
    try {
      const persistedData = localStorage.getItem("os_attribution");
      if (persistedData) {
        return JSON.parse(persistedData);
      }
    } catch (error) {
      __privateGet(this, _logger21).error("Error loading attribution data from localStorage:", error);
    }
    return {};
  };
  _getFirstVisitTimestamp = new WeakSet();
  getFirstVisitTimestamp_fn = function() {
    const persistedData = __privateMethod(this, _loadPersistedAttributionData, loadPersistedAttributionData_fn).call(this);
    if (persistedData.first_visit_timestamp) {
      return persistedData.first_visit_timestamp;
    }
    return Date.now();
  };
  _setupEventListeners4 = new WeakSet();
  setupEventListeners_fn4 = function() {
    window.addEventListener("popstate", () => {
      const metadata = __privateGet(this, _attributionData).metadata || {};
      metadata.landing_page = window.location.href;
      this.updateAttributionData({
        metadata
      });
    });
    if (__privateGet(this, _app16).events) {
      __privateGet(this, _app16).events.on("campaign.loaded", (data) => {
        if (data && data.campaign && data.campaign.name && !__privateGet(this, _attributionData).funnel) {
          const funnelMetaTag = document.querySelector('meta[name="os-tracking-tag"][data-tag-name="funnel_name"]');
          const funnelName = funnelMetaTag?.getAttribute("data-tag-value") || data.campaign.name;
          this.setFunnelName(funnelName);
        }
      });
      __privateGet(this, _app16).events.on("prospect.cartCreated", () => {
        const metadata = __privateGet(this, _attributionData).metadata || {};
        metadata.conversion_timestamp = Date.now();
        this.updateAttributionData({
          metadata
        });
        __privateGet(this, _logger21).debug("Cart created, updated metadata with conversion timestamp");
      });
    }
  };
  _getStoredValue = new WeakSet();
  getStoredValue_fn = function(key) {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has(key)) {
      const value = urlParams.get(key);
      try {
        sessionStorage.setItem(key, value);
      } catch (error) {
        __privateGet(this, _logger21).error(`Error storing ${key} in sessionStorage:`, error);
      }
      return value;
    }
    try {
      if (sessionStorage.getItem(key)) {
        return sessionStorage.getItem(key);
      }
    } catch (error) {
      __privateGet(this, _logger21).error(`Error reading ${key} from sessionStorage:`, error);
    }
    try {
      if (localStorage.getItem(key)) {
        return localStorage.getItem(key);
      }
    } catch (error) {
      __privateGet(this, _logger21).error(`Error reading ${key} from localStorage:`, error);
    }
    const persistedData = __privateMethod(this, _loadPersistedAttributionData, loadPersistedAttributionData_fn).call(this);
    if (persistedData[key]) {
      return persistedData[key];
    }
    return "";
  };
  _getCookie = new WeakSet();
  getCookie_fn = function(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2)
      return parts.pop().split(";").shift();
    return "";
  };
  _getDeviceType = new WeakSet();
  getDeviceType_fn = function() {
    const userAgent = navigator.userAgent;
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)) {
      return "mobile";
    }
    return "desktop";
  };
  _getFacebookPixelId = new WeakSet();
  getFacebookPixelId_fn = function() {
    const metaPixelId = document.querySelector('meta[name="facebook-domain-verification"]');
    if (metaPixelId) {
      const content = metaPixelId.getAttribute("content");
      if (content && content.includes("=")) {
        const parts = content.split("=");
        if (parts.length > 1) {
          return parts[1];
        }
      }
    }
    const scripts = document.querySelectorAll("script");
    for (const script of scripts) {
      const content = script.textContent || "";
      if (content.includes("fbq(") && content.includes("init")) {
        const match = content.match(/fbq\s*\(\s*['"]init['"],\s*['"](\d+)['"]/);
        if (match && match[1]) {
          return match[1];
        }
      }
    }
    return "";
  };

  // src/managers/EventManager.js
  var _app17, _logger22, _isInitialized, _platforms, _debugMode4, _processedOrderIds, _loadProcessedOrderIds, loadProcessedOrderIds_fn, _saveProcessedOrderIds, saveProcessedOrderIds_fn, _detectPlatforms, detectPlatforms_fn, _setupEventListeners5, setupEventListeners_fn5, _getUserDataForTracking, getUserDataForTracking_fn, _hashString, hashString_fn, _fireEvent, fireEvent_fn;
  var EventManager = class {
    // Track processed order IDs to prevent duplicates
    constructor(app) {
      /**
       * Load processed order IDs from sessionStorage
       */
      __privateAdd(this, _loadProcessedOrderIds);
      /**
       * Save processed order IDs to sessionStorage
       */
      __privateAdd(this, _saveProcessedOrderIds);
      /**
       * Detect which platforms are available
       */
      __privateAdd(this, _detectPlatforms);
      /**
       * Setup event listeners for app events
       */
      __privateAdd(this, _setupEventListeners5);
      /**
       * Get user data for tracking with privacy considerations
       * @param {Object} orderData - The order data
       * @returns {Object} - User data for tracking
       */
      __privateAdd(this, _getUserDataForTracking);
      /**
       * Hash a string for privacy
       * @param {string} str - The string to hash
       * @returns {string} - The hashed string
       */
      __privateAdd(this, _hashString);
      /**
       * Fire an event to all enabled platforms
       * @param {string} eventName - The name of the event
       * @param {Object} eventData - The event data
       */
      __privateAdd(this, _fireEvent);
      __privateAdd(this, _app17, void 0);
      __privateAdd(this, _logger22, void 0);
      __privateAdd(this, _isInitialized, false);
      __privateAdd(this, _platforms, {
        gtm: { enabled: false, initialized: false },
        fbPixel: { enabled: false, initialized: false },
        ga4: { enabled: false, initialized: false }
      });
      __privateAdd(this, _debugMode4, false);
      __privateAdd(this, _processedOrderIds, /* @__PURE__ */ new Set());
      __privateSet(this, _app17, app);
      __privateSet(this, _logger22, app.logger.createModuleLogger("EVENT"));
      __privateSet(this, _debugMode4, app.options?.debug || false);
      this.init();
    }
    /**
     * Initialize the event manager
     */
    init() {
      __privateGet(this, _logger22).info("Initializing EventManager");
      __privateMethod(this, _detectPlatforms, detectPlatforms_fn).call(this);
      __privateMethod(this, _setupEventListeners5, setupEventListeners_fn5).call(this);
      __privateMethod(this, _loadProcessedOrderIds, loadProcessedOrderIds_fn).call(this);
      __privateSet(this, _isInitialized, true);
      __privateGet(this, _logger22).info("EventManager initialized");
    }
    /**
     * Fire a view_item_list event
     * @param {Object} campaignData - The campaign data
     */
    viewItemList(campaignData) {
      __privateGet(this, _logger22).debug("viewItemList called with campaign data:", campaignData ? "present" : "missing");
      if (!campaignData || !campaignData.packages || campaignData.packages.length === 0) {
        __privateGet(this, _logger22).warn("Cannot fire view_item_list event: No packages found in campaign data");
        return;
      }
      __privateGet(this, _logger22).debug(`Found ${campaignData.packages.length} packages in campaign data`);
      const items = campaignData.packages.map((pkg) => ({
        item_id: pkg.external_id || pkg.ref_id,
        item_name: pkg.name,
        price: parseFloat(pkg.price) || 0,
        currency: campaignData.currency || "USD",
        quantity: 1
      }));
      const eventData = {
        event: "view_item_list",
        ecommerce: {
          currency: campaignData.currency || "USD",
          items
        }
      };
      __privateGet(this, _logger22).debug("Firing view_item_list event with data:", eventData);
      __privateMethod(this, _fireEvent, fireEvent_fn).call(this, "view_item_list", eventData);
    }
    /**
     * Fire an add_to_cart event
     * @param {Object} cartData - The cart data or a single package object
     */
    addToCart(cartData) {
      const isSinglePackage = !cartData.items && !cartData.totals;
      let items = [];
      let currency = "USD";
      let value = 0;
      if (isSinglePackage) {
        __privateGet(this, _logger22).debug("addToCart called with single package, converting to cart format");
        if (!cartData) {
          __privateGet(this, _logger22).warn("Cannot fire add_to_cart event: No package data provided");
          return;
        }
        const pkg = cartData;
        const item = {
          item_id: pkg.external_id || pkg.ref_id || pkg.id,
          item_name: pkg.name,
          price: parseFloat(pkg.price) || 0,
          currency: pkg.currency || __privateGet(this, _app17).getCampaignData()?.currency || "USD",
          quantity: pkg.quantity || 1
        };
        items = [item];
        currency = item.currency;
        value = item.price * item.quantity;
      } else {
        if (!cartData || !cartData.items || cartData.items.length === 0) {
          __privateGet(this, _logger22).warn("Cannot fire add_to_cart event: No items in cart");
          return;
        }
        items = cartData.items.map((item) => ({
          item_id: item.external_id || item.id,
          item_name: item.name,
          price: parseFloat(item.price) || 0,
          currency: cartData.totals?.currency || "USD",
          quantity: item.quantity || 1
        }));
        currency = cartData.totals?.currency || "USD";
        value = cartData.totals?.total || 0;
      }
      const eventData = {
        event: "add_to_cart",
        ecommerce: {
          currency,
          value,
          items
        }
      };
      __privateMethod(this, _fireEvent, fireEvent_fn).call(this, "add_to_cart", eventData);
    }
    /**
     * Fire a purchase event
     * @param {Object} orderData - The order data
     * @param {boolean} force - Whether to force firing the event even if the order ID has been processed
     */
    purchase(orderData, force = false) {
      if (!orderData || !orderData.lines || orderData.lines.length === 0) {
        __privateGet(this, _logger22).warn("Cannot fire purchase event: No items in order");
        return;
      }
      const orderId = orderData.number || orderData.ref_id;
      if (!force && orderId && __privateGet(this, _processedOrderIds).has(orderId)) {
        __privateGet(this, _logger22).info(`Purchase event for order ${orderId} already fired, skipping`);
        return;
      }
      const items = orderData.lines.map((line) => ({
        item_id: line.product_id || line.id,
        item_name: line.product_title || line.name,
        price: parseFloat(line.price_incl_tax || line.price) || 0,
        currency: orderData.currency || "USD",
        quantity: line.quantity || 1
      }));
      const userData = __privateMethod(this, _getUserDataForTracking, getUserDataForTracking_fn).call(this, orderData);
      const eventData = {
        event: "purchase",
        ecommerce: {
          transaction_id: orderId,
          value: parseFloat(orderData.total_incl_tax || orderData.total) || 0,
          tax: parseFloat(orderData.total_tax) || 0,
          shipping: parseFloat(orderData.shipping_incl_tax || orderData.shipping) || 0,
          currency: orderData.currency || "USD",
          coupon: orderData.vouchers?.length > 0 ? orderData.vouchers[0].code : "",
          ...userData,
          items
        }
      };
      __privateMethod(this, _fireEvent, fireEvent_fn).call(this, "purchase", eventData);
      if (orderId) {
        __privateGet(this, _processedOrderIds).add(orderId);
        __privateMethod(this, _saveProcessedOrderIds, saveProcessedOrderIds_fn).call(this);
        __privateGet(this, _logger22).debug(`Marked order ${orderId} as processed`);
      }
    }
    /**
     * Manually fire a view_item event
     * @param {Object} packageData - The package data
     */
    viewItem(packageData) {
      if (!packageData) {
        __privateGet(this, _logger22).warn("Cannot fire view_item event: No package data provided");
        return;
      }
      const item = {
        item_id: packageData.ref_id || packageData.external_id || packageData.id,
        item_name: packageData.name,
        price: parseFloat(packageData.price) || 0,
        currency: packageData.currency || __privateGet(this, _app17).getCampaignData()?.currency || "USD",
        quantity: 1
      };
      const eventData = {
        event: "view_item",
        ecommerce: {
          currency: item.currency,
          value: item.price,
          items: [item]
        }
      };
      __privateMethod(this, _fireEvent, fireEvent_fn).call(this, "view_item", eventData);
    }
    /**
     * Manually fire a begin_checkout event
     */
    beginCheckout() {
      const cart = __privateGet(this, _app17).state.getState("cart");
      if (!cart || !cart.items || cart.items.length === 0) {
        __privateGet(this, _logger22).warn("Cannot fire begin_checkout event: No items in cart");
        return;
      }
      const items = cart.items.map((item) => ({
        item_id: item.external_id || item.id,
        item_name: item.name,
        price: parseFloat(item.price) || 0,
        currency: cart.totals?.currency || "USD",
        quantity: item.quantity || 1
      }));
      const eventData = {
        event: "begin_checkout",
        ecommerce: {
          currency: cart.totals?.currency || "USD",
          value: cart.totals?.total || 0,
          items
        }
      };
      __privateMethod(this, _fireEvent, fireEvent_fn).call(this, "begin_checkout", eventData);
    }
    /**
     * Manually fire a custom event
     * @param {string} eventName - The name of the event
     * @param {Object} eventData - The event data
     */
    fireCustomEvent(eventName, eventData = {}) {
      if (!eventName) {
        __privateGet(this, _logger22).warn("Cannot fire custom event: No event name provided");
        return;
      }
      const formattedEventData = {
        event: eventName,
        ...eventData
      };
      __privateGet(this, _logger22).debug(`Firing custom event: ${eventName}`, formattedEventData);
      if (__privateGet(this, _platforms).gtm.enabled) {
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push(formattedEventData);
        __privateGet(this, _logger22).debug(`Custom event ${eventName} fired to Google Tag Manager`);
      }
      if (__privateGet(this, _platforms).fbPixel.enabled && typeof window.fbq === "function") {
        window.fbq("trackCustom", eventName, eventData);
        __privateGet(this, _logger22).debug(`Custom event ${eventName} fired to Facebook Pixel`);
      }
      if (__privateGet(this, _platforms).ga4.enabled && typeof window.gtag === "function") {
        window.gtag("event", eventName, eventData);
        __privateGet(this, _logger22).debug(`Custom event ${eventName} fired to Google Analytics 4`);
      }
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
    setPlatformEnabled(platform2, enabled) {
      if (__privateGet(this, _platforms)[platform2]) {
        __privateGet(this, _platforms)[platform2].enabled = enabled;
        __privateGet(this, _logger22).info(`${platform2} ${enabled ? "enabled" : "disabled"}`);
      } else {
        __privateGet(this, _logger22).warn(`Unknown platform: ${platform2}`);
      }
    }
    /**
     * Get the status of all platforms
     * @returns {Object} - The status of all platforms
     */
    getPlatformStatus() {
      return { ...__privateGet(this, _platforms) };
    }
  };
  _app17 = new WeakMap();
  _logger22 = new WeakMap();
  _isInitialized = new WeakMap();
  _platforms = new WeakMap();
  _debugMode4 = new WeakMap();
  _processedOrderIds = new WeakMap();
  _loadProcessedOrderIds = new WeakSet();
  loadProcessedOrderIds_fn = function() {
    try {
      const storedIds = sessionStorage.getItem("os_processed_order_ids");
      if (storedIds) {
        const parsedIds = JSON.parse(storedIds);
        if (Array.isArray(parsedIds)) {
          parsedIds.forEach((id) => __privateGet(this, _processedOrderIds).add(id));
          __privateGet(this, _logger22).debug(`Loaded ${parsedIds.length} processed order IDs from sessionStorage`);
        }
      }
    } catch (error) {
      __privateGet(this, _logger22).error("Error loading processed order IDs from sessionStorage:", error);
    }
  };
  _saveProcessedOrderIds = new WeakSet();
  saveProcessedOrderIds_fn = function() {
    try {
      const idsArray = Array.from(__privateGet(this, _processedOrderIds));
      sessionStorage.setItem("os_processed_order_ids", JSON.stringify(idsArray));
      __privateGet(this, _logger22).debug(`Saved ${idsArray.length} processed order IDs to sessionStorage`);
    } catch (error) {
      __privateGet(this, _logger22).error("Error saving processed order IDs to sessionStorage:", error);
    }
  };
  _detectPlatforms = new WeakSet();
  detectPlatforms_fn = function() {
    if (typeof window.dataLayer !== "undefined") {
      __privateGet(this, _platforms).gtm.enabled = true;
      __privateGet(this, _platforms).gtm.initialized = true;
      __privateGet(this, _logger22).info("Google Tag Manager detected");
    } else {
      __privateGet(this, _logger22).info("Google Tag Manager not detected");
    }
    if (typeof window.fbq !== "undefined") {
      __privateGet(this, _platforms).fbPixel.enabled = true;
      __privateGet(this, _platforms).fbPixel.initialized = true;
      __privateGet(this, _logger22).info("Facebook Pixel detected");
    } else {
      __privateGet(this, _logger22).info("Facebook Pixel not detected");
    }
    if (typeof window.gtag !== "undefined") {
      __privateGet(this, _platforms).ga4.enabled = true;
      __privateGet(this, _platforms).ga4.initialized = true;
      __privateGet(this, _logger22).info("Google Analytics 4 detected");
    } else {
      __privateGet(this, _logger22).info("Google Analytics 4 not detected");
    }
  };
  _setupEventListeners5 = new WeakSet();
  setupEventListeners_fn5 = function() {
    __privateGet(this, _app17).on("campaign.loaded", (data) => {
      __privateGet(this, _logger22).debug("Campaign loaded event received, firing view_item_list");
      if (data && data.campaign) {
        this.viewItemList(data.campaign);
      } else {
        __privateGet(this, _logger22).warn("Campaign loaded event received but no campaign data found");
      }
    });
    __privateGet(this, _app17).on("cart.updated", (data) => {
      if (data.cart && data.cart.items && data.cart.items.length > 0) {
        this.addToCart(data.cart);
      }
    });
    __privateGet(this, _app17).on("order.created", (data) => {
      this.purchase(data);
    });
    __privateGet(this, _app17).on("order.loaded", (data) => {
      if (data.order) {
        __privateGet(this, _logger22).info("Order loaded on receipt page, checking if purchase event needed");
        this.purchase(data.order);
      }
    });
  };
  _getUserDataForTracking = new WeakSet();
  getUserDataForTracking_fn = function(orderData) {
    const userData = {};
    if (orderData.user) {
      if (orderData.user.first_name)
        userData.firstname = orderData.user.first_name;
      if (orderData.user.last_name)
        userData.lastname = orderData.user.last_name;
      if (orderData.user.email) {
        userData.email_hash = __privateMethod(this, _hashString, hashString_fn).call(this, orderData.user.email);
      }
    }
    if (orderData.shipping_address) {
      userData.city = orderData.shipping_address.line4 || "";
      userData.state = orderData.shipping_address.state || "";
      userData.zipcode = orderData.shipping_address.postcode || "";
      userData.country = orderData.shipping_address.country || "";
    }
    return userData;
  };
  _hashString = new WeakSet();
  hashString_fn = function(str) {
    let hash = 0;
    if (str.length === 0)
      return hash.toString();
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return hash.toString();
  };
  _fireEvent = new WeakSet();
  fireEvent_fn = function(eventName, eventData) {
    __privateGet(this, _logger22).debug(`Firing ${eventName} event`, eventData);
    if (__privateGet(this, _platforms).gtm.enabled) {
      window.dataLayer = window.dataLayer || [];
      __privateGet(this, _logger22).debug("Clearing previous ecommerce data in dataLayer");
      window.dataLayer.push({ ecommerce: null });
      /* @__PURE__ */ console.log(`🔥 Firing ${eventName} event to dataLayer`);
      window.dataLayer.push(eventData);
      __privateGet(this, _logger22).debug(`${eventName} event fired to Google Tag Manager`);
    } else {
      __privateGet(this, _logger22).warn(`Cannot fire ${eventName} event to GTM: GTM not enabled`);
      /* @__PURE__ */ console.log("GTM not detected, initializing dataLayer and pushing event");
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({ ecommerce: null });
      window.dataLayer.push(eventData);
    }
    if (__privateGet(this, _platforms).fbPixel.enabled) {
      switch (eventName) {
        case "view_item_list":
          window.fbq("track", "ViewContent", {
            content_type: "product_group",
            content_ids: eventData.ecommerce.items.map((item) => item.item_id),
            currency: eventData.ecommerce.currency
          });
          break;
        case "add_to_cart":
          window.fbq("track", "AddToCart", {
            content_type: "product_group",
            content_ids: eventData.ecommerce.items.map((item) => item.item_id),
            currency: eventData.ecommerce.currency,
            value: eventData.ecommerce.value
          });
          break;
        case "purchase":
          window.fbq("track", "Purchase", {
            content_type: "product_group",
            content_ids: eventData.ecommerce.items.map((item) => item.item_id),
            currency: eventData.ecommerce.currency,
            value: eventData.ecommerce.value
          });
          break;
      }
      __privateGet(this, _logger22).debug(`${eventName} event fired to Facebook Pixel`);
    }
    if (__privateGet(this, _platforms).ga4.enabled) {
      window.gtag("event", eventName, {
        currency: eventData.ecommerce.currency,
        value: eventData.ecommerce.value,
        items: eventData.ecommerce.items
      });
      __privateGet(this, _logger22).debug(`${eventName} event fired to Google Analytics 4`);
    }
    const customEvent = new CustomEvent(`os:${eventName}`, {
      bubbles: true,
      detail: eventData
    });
    document.dispatchEvent(customEvent);
  };

  // node_modules/@floating-ui/utils/dist/floating-ui.utils.mjs
  var min = Math.min;
  var max = Math.max;
  var round = Math.round;
  var createCoords = (v) => ({
    x: v,
    y: v
  });
  var oppositeSideMap = {
    left: "right",
    right: "left",
    bottom: "top",
    top: "bottom"
  };
  var oppositeAlignmentMap = {
    start: "end",
    end: "start"
  };
  function clamp(start, value, end) {
    return max(start, min(value, end));
  }
  function evaluate(value, param) {
    return typeof value === "function" ? value(param) : value;
  }
  function getSide(placement) {
    return placement.split("-")[0];
  }
  function getAlignment(placement) {
    return placement.split("-")[1];
  }
  function getOppositeAxis(axis) {
    return axis === "x" ? "y" : "x";
  }
  function getAxisLength(axis) {
    return axis === "y" ? "height" : "width";
  }
  function getSideAxis(placement) {
    return ["top", "bottom"].includes(getSide(placement)) ? "y" : "x";
  }
  function getAlignmentAxis(placement) {
    return getOppositeAxis(getSideAxis(placement));
  }
  function getAlignmentSides(placement, rects, rtl) {
    if (rtl === void 0) {
      rtl = false;
    }
    const alignment = getAlignment(placement);
    const alignmentAxis = getAlignmentAxis(placement);
    const length = getAxisLength(alignmentAxis);
    let mainAlignmentSide = alignmentAxis === "x" ? alignment === (rtl ? "end" : "start") ? "right" : "left" : alignment === "start" ? "bottom" : "top";
    if (rects.reference[length] > rects.floating[length]) {
      mainAlignmentSide = getOppositePlacement(mainAlignmentSide);
    }
    return [mainAlignmentSide, getOppositePlacement(mainAlignmentSide)];
  }
  function getExpandedPlacements(placement) {
    const oppositePlacement = getOppositePlacement(placement);
    return [getOppositeAlignmentPlacement(placement), oppositePlacement, getOppositeAlignmentPlacement(oppositePlacement)];
  }
  function getOppositeAlignmentPlacement(placement) {
    return placement.replace(/start|end/g, (alignment) => oppositeAlignmentMap[alignment]);
  }
  function getSideList(side, isStart, rtl) {
    const lr = ["left", "right"];
    const rl = ["right", "left"];
    const tb = ["top", "bottom"];
    const bt = ["bottom", "top"];
    switch (side) {
      case "top":
      case "bottom":
        if (rtl)
          return isStart ? rl : lr;
        return isStart ? lr : rl;
      case "left":
      case "right":
        return isStart ? tb : bt;
      default:
        return [];
    }
  }
  function getOppositeAxisPlacements(placement, flipAlignment, direction, rtl) {
    const alignment = getAlignment(placement);
    let list = getSideList(getSide(placement), direction === "start", rtl);
    if (alignment) {
      list = list.map((side) => side + "-" + alignment);
      if (flipAlignment) {
        list = list.concat(list.map(getOppositeAlignmentPlacement));
      }
    }
    return list;
  }
  function getOppositePlacement(placement) {
    return placement.replace(/left|right|bottom|top/g, (side) => oppositeSideMap[side]);
  }
  function expandPaddingObject(padding) {
    return {
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      ...padding
    };
  }
  function getPaddingObject(padding) {
    return typeof padding !== "number" ? expandPaddingObject(padding) : {
      top: padding,
      right: padding,
      bottom: padding,
      left: padding
    };
  }
  function rectToClientRect(rect) {
    const {
      x,
      y,
      width,
      height
    } = rect;
    return {
      width,
      height,
      top: y,
      left: x,
      right: x + width,
      bottom: y + height,
      x,
      y
    };
  }

  // node_modules/@floating-ui/core/dist/floating-ui.core.mjs
  function computeCoordsFromPlacement(_ref, placement, rtl) {
    let {
      reference,
      floating
    } = _ref;
    const sideAxis = getSideAxis(placement);
    const alignmentAxis = getAlignmentAxis(placement);
    const alignLength = getAxisLength(alignmentAxis);
    const side = getSide(placement);
    const isVertical = sideAxis === "y";
    const commonX = reference.x + reference.width / 2 - floating.width / 2;
    const commonY = reference.y + reference.height / 2 - floating.height / 2;
    const commonAlign = reference[alignLength] / 2 - floating[alignLength] / 2;
    let coords;
    switch (side) {
      case "top":
        coords = {
          x: commonX,
          y: reference.y - floating.height
        };
        break;
      case "bottom":
        coords = {
          x: commonX,
          y: reference.y + reference.height
        };
        break;
      case "right":
        coords = {
          x: reference.x + reference.width,
          y: commonY
        };
        break;
      case "left":
        coords = {
          x: reference.x - floating.width,
          y: commonY
        };
        break;
      default:
        coords = {
          x: reference.x,
          y: reference.y
        };
    }
    switch (getAlignment(placement)) {
      case "start":
        coords[alignmentAxis] -= commonAlign * (rtl && isVertical ? -1 : 1);
        break;
      case "end":
        coords[alignmentAxis] += commonAlign * (rtl && isVertical ? -1 : 1);
        break;
    }
    return coords;
  }
  var computePosition = async (reference, floating, config) => {
    const {
      placement = "bottom",
      strategy = "absolute",
      middleware = [],
      platform: platform2
    } = config;
    const validMiddleware = middleware.filter(Boolean);
    const rtl = await (platform2.isRTL == null ? void 0 : platform2.isRTL(floating));
    let rects = await platform2.getElementRects({
      reference,
      floating,
      strategy
    });
    let {
      x,
      y
    } = computeCoordsFromPlacement(rects, placement, rtl);
    let statefulPlacement = placement;
    let middlewareData = {};
    let resetCount = 0;
    for (let i = 0; i < validMiddleware.length; i++) {
      const {
        name,
        fn
      } = validMiddleware[i];
      const {
        x: nextX,
        y: nextY,
        data,
        reset
      } = await fn({
        x,
        y,
        initialPlacement: placement,
        placement: statefulPlacement,
        strategy,
        middlewareData,
        rects,
        platform: platform2,
        elements: {
          reference,
          floating
        }
      });
      x = nextX != null ? nextX : x;
      y = nextY != null ? nextY : y;
      middlewareData = {
        ...middlewareData,
        [name]: {
          ...middlewareData[name],
          ...data
        }
      };
      if (reset && resetCount <= 50) {
        resetCount++;
        if (typeof reset === "object") {
          if (reset.placement) {
            statefulPlacement = reset.placement;
          }
          if (reset.rects) {
            rects = reset.rects === true ? await platform2.getElementRects({
              reference,
              floating,
              strategy
            }) : reset.rects;
          }
          ({
            x,
            y
          } = computeCoordsFromPlacement(rects, statefulPlacement, rtl));
        }
        i = -1;
      }
    }
    return {
      x,
      y,
      placement: statefulPlacement,
      strategy,
      middlewareData
    };
  };
  async function detectOverflow(state, options) {
    var _await$platform$isEle;
    if (options === void 0) {
      options = {};
    }
    const {
      x,
      y,
      platform: platform2,
      rects,
      elements,
      strategy
    } = state;
    const {
      boundary = "clippingAncestors",
      rootBoundary = "viewport",
      elementContext = "floating",
      altBoundary = false,
      padding = 0
    } = evaluate(options, state);
    const paddingObject = getPaddingObject(padding);
    const altContext = elementContext === "floating" ? "reference" : "floating";
    const element = elements[altBoundary ? altContext : elementContext];
    const clippingClientRect = rectToClientRect(await platform2.getClippingRect({
      element: ((_await$platform$isEle = await (platform2.isElement == null ? void 0 : platform2.isElement(element))) != null ? _await$platform$isEle : true) ? element : element.contextElement || await (platform2.getDocumentElement == null ? void 0 : platform2.getDocumentElement(elements.floating)),
      boundary,
      rootBoundary,
      strategy
    }));
    const rect = elementContext === "floating" ? {
      x,
      y,
      width: rects.floating.width,
      height: rects.floating.height
    } : rects.reference;
    const offsetParent = await (platform2.getOffsetParent == null ? void 0 : platform2.getOffsetParent(elements.floating));
    const offsetScale = await (platform2.isElement == null ? void 0 : platform2.isElement(offsetParent)) ? await (platform2.getScale == null ? void 0 : platform2.getScale(offsetParent)) || {
      x: 1,
      y: 1
    } : {
      x: 1,
      y: 1
    };
    const elementClientRect = rectToClientRect(platform2.convertOffsetParentRelativeRectToViewportRelativeRect ? await platform2.convertOffsetParentRelativeRectToViewportRelativeRect({
      elements,
      rect,
      offsetParent,
      strategy
    }) : rect);
    return {
      top: (clippingClientRect.top - elementClientRect.top + paddingObject.top) / offsetScale.y,
      bottom: (elementClientRect.bottom - clippingClientRect.bottom + paddingObject.bottom) / offsetScale.y,
      left: (clippingClientRect.left - elementClientRect.left + paddingObject.left) / offsetScale.x,
      right: (elementClientRect.right - clippingClientRect.right + paddingObject.right) / offsetScale.x
    };
  }
  var arrow = (options) => ({
    name: "arrow",
    options,
    async fn(state) {
      const {
        x,
        y,
        placement,
        rects,
        platform: platform2,
        elements,
        middlewareData
      } = state;
      const {
        element,
        padding = 0
      } = evaluate(options, state) || {};
      if (element == null) {
        return {};
      }
      const paddingObject = getPaddingObject(padding);
      const coords = {
        x,
        y
      };
      const axis = getAlignmentAxis(placement);
      const length = getAxisLength(axis);
      const arrowDimensions = await platform2.getDimensions(element);
      const isYAxis = axis === "y";
      const minProp = isYAxis ? "top" : "left";
      const maxProp = isYAxis ? "bottom" : "right";
      const clientProp = isYAxis ? "clientHeight" : "clientWidth";
      const endDiff = rects.reference[length] + rects.reference[axis] - coords[axis] - rects.floating[length];
      const startDiff = coords[axis] - rects.reference[axis];
      const arrowOffsetParent = await (platform2.getOffsetParent == null ? void 0 : platform2.getOffsetParent(element));
      let clientSize = arrowOffsetParent ? arrowOffsetParent[clientProp] : 0;
      if (!clientSize || !await (platform2.isElement == null ? void 0 : platform2.isElement(arrowOffsetParent))) {
        clientSize = elements.floating[clientProp] || rects.floating[length];
      }
      const centerToReference = endDiff / 2 - startDiff / 2;
      const largestPossiblePadding = clientSize / 2 - arrowDimensions[length] / 2 - 1;
      const minPadding = min(paddingObject[minProp], largestPossiblePadding);
      const maxPadding = min(paddingObject[maxProp], largestPossiblePadding);
      const min$1 = minPadding;
      const max2 = clientSize - arrowDimensions[length] - maxPadding;
      const center = clientSize / 2 - arrowDimensions[length] / 2 + centerToReference;
      const offset3 = clamp(min$1, center, max2);
      const shouldAddOffset = !middlewareData.arrow && getAlignment(placement) != null && center !== offset3 && rects.reference[length] / 2 - (center < min$1 ? minPadding : maxPadding) - arrowDimensions[length] / 2 < 0;
      const alignmentOffset = shouldAddOffset ? center < min$1 ? center - min$1 : center - max2 : 0;
      return {
        [axis]: coords[axis] + alignmentOffset,
        data: {
          [axis]: offset3,
          centerOffset: center - offset3 - alignmentOffset,
          ...shouldAddOffset && {
            alignmentOffset
          }
        },
        reset: shouldAddOffset
      };
    }
  });
  var flip = function(options) {
    if (options === void 0) {
      options = {};
    }
    return {
      name: "flip",
      options,
      async fn(state) {
        var _middlewareData$arrow, _middlewareData$flip;
        const {
          placement,
          middlewareData,
          rects,
          initialPlacement,
          platform: platform2,
          elements
        } = state;
        const {
          mainAxis: checkMainAxis = true,
          crossAxis: checkCrossAxis = true,
          fallbackPlacements: specifiedFallbackPlacements,
          fallbackStrategy = "bestFit",
          fallbackAxisSideDirection = "none",
          flipAlignment = true,
          ...detectOverflowOptions
        } = evaluate(options, state);
        if ((_middlewareData$arrow = middlewareData.arrow) != null && _middlewareData$arrow.alignmentOffset) {
          return {};
        }
        const side = getSide(placement);
        const initialSideAxis = getSideAxis(initialPlacement);
        const isBasePlacement = getSide(initialPlacement) === initialPlacement;
        const rtl = await (platform2.isRTL == null ? void 0 : platform2.isRTL(elements.floating));
        const fallbackPlacements = specifiedFallbackPlacements || (isBasePlacement || !flipAlignment ? [getOppositePlacement(initialPlacement)] : getExpandedPlacements(initialPlacement));
        const hasFallbackAxisSideDirection = fallbackAxisSideDirection !== "none";
        if (!specifiedFallbackPlacements && hasFallbackAxisSideDirection) {
          fallbackPlacements.push(...getOppositeAxisPlacements(initialPlacement, flipAlignment, fallbackAxisSideDirection, rtl));
        }
        const placements2 = [initialPlacement, ...fallbackPlacements];
        const overflow = await detectOverflow(state, detectOverflowOptions);
        const overflows = [];
        let overflowsData = ((_middlewareData$flip = middlewareData.flip) == null ? void 0 : _middlewareData$flip.overflows) || [];
        if (checkMainAxis) {
          overflows.push(overflow[side]);
        }
        if (checkCrossAxis) {
          const sides2 = getAlignmentSides(placement, rects, rtl);
          overflows.push(overflow[sides2[0]], overflow[sides2[1]]);
        }
        overflowsData = [...overflowsData, {
          placement,
          overflows
        }];
        if (!overflows.every((side2) => side2 <= 0)) {
          var _middlewareData$flip2, _overflowsData$filter;
          const nextIndex = (((_middlewareData$flip2 = middlewareData.flip) == null ? void 0 : _middlewareData$flip2.index) || 0) + 1;
          const nextPlacement = placements2[nextIndex];
          if (nextPlacement) {
            return {
              data: {
                index: nextIndex,
                overflows: overflowsData
              },
              reset: {
                placement: nextPlacement
              }
            };
          }
          let resetPlacement = (_overflowsData$filter = overflowsData.filter((d) => d.overflows[0] <= 0).sort((a, b) => a.overflows[1] - b.overflows[1])[0]) == null ? void 0 : _overflowsData$filter.placement;
          if (!resetPlacement) {
            switch (fallbackStrategy) {
              case "bestFit": {
                var _overflowsData$filter2;
                const placement2 = (_overflowsData$filter2 = overflowsData.filter((d) => {
                  if (hasFallbackAxisSideDirection) {
                    const currentSideAxis = getSideAxis(d.placement);
                    return currentSideAxis === initialSideAxis || // Create a bias to the `y` side axis due to horizontal
                    // reading directions favoring greater width.
                    currentSideAxis === "y";
                  }
                  return true;
                }).map((d) => [d.placement, d.overflows.filter((overflow2) => overflow2 > 0).reduce((acc, overflow2) => acc + overflow2, 0)]).sort((a, b) => a[1] - b[1])[0]) == null ? void 0 : _overflowsData$filter2[0];
                if (placement2) {
                  resetPlacement = placement2;
                }
                break;
              }
              case "initialPlacement":
                resetPlacement = initialPlacement;
                break;
            }
          }
          if (placement !== resetPlacement) {
            return {
              reset: {
                placement: resetPlacement
              }
            };
          }
        }
        return {};
      }
    };
  };
  async function convertValueToCoords(state, options) {
    const {
      placement,
      platform: platform2,
      elements
    } = state;
    const rtl = await (platform2.isRTL == null ? void 0 : platform2.isRTL(elements.floating));
    const side = getSide(placement);
    const alignment = getAlignment(placement);
    const isVertical = getSideAxis(placement) === "y";
    const mainAxisMulti = ["left", "top"].includes(side) ? -1 : 1;
    const crossAxisMulti = rtl && isVertical ? -1 : 1;
    const rawValue = evaluate(options, state);
    let {
      mainAxis,
      crossAxis,
      alignmentAxis
    } = typeof rawValue === "number" ? {
      mainAxis: rawValue,
      crossAxis: 0,
      alignmentAxis: null
    } : {
      mainAxis: rawValue.mainAxis || 0,
      crossAxis: rawValue.crossAxis || 0,
      alignmentAxis: rawValue.alignmentAxis
    };
    if (alignment && typeof alignmentAxis === "number") {
      crossAxis = alignment === "end" ? alignmentAxis * -1 : alignmentAxis;
    }
    return isVertical ? {
      x: crossAxis * crossAxisMulti,
      y: mainAxis * mainAxisMulti
    } : {
      x: mainAxis * mainAxisMulti,
      y: crossAxis * crossAxisMulti
    };
  }
  var offset = function(options) {
    if (options === void 0) {
      options = 0;
    }
    return {
      name: "offset",
      options,
      async fn(state) {
        var _middlewareData$offse, _middlewareData$arrow;
        const {
          x,
          y,
          placement,
          middlewareData
        } = state;
        const diffCoords = await convertValueToCoords(state, options);
        if (placement === ((_middlewareData$offse = middlewareData.offset) == null ? void 0 : _middlewareData$offse.placement) && (_middlewareData$arrow = middlewareData.arrow) != null && _middlewareData$arrow.alignmentOffset) {
          return {};
        }
        return {
          x: x + diffCoords.x,
          y: y + diffCoords.y,
          data: {
            ...diffCoords,
            placement
          }
        };
      }
    };
  };
  var shift = function(options) {
    if (options === void 0) {
      options = {};
    }
    return {
      name: "shift",
      options,
      async fn(state) {
        const {
          x,
          y,
          placement
        } = state;
        const {
          mainAxis: checkMainAxis = true,
          crossAxis: checkCrossAxis = false,
          limiter = {
            fn: (_ref) => {
              let {
                x: x2,
                y: y2
              } = _ref;
              return {
                x: x2,
                y: y2
              };
            }
          },
          ...detectOverflowOptions
        } = evaluate(options, state);
        const coords = {
          x,
          y
        };
        const overflow = await detectOverflow(state, detectOverflowOptions);
        const crossAxis = getSideAxis(getSide(placement));
        const mainAxis = getOppositeAxis(crossAxis);
        let mainAxisCoord = coords[mainAxis];
        let crossAxisCoord = coords[crossAxis];
        if (checkMainAxis) {
          const minSide = mainAxis === "y" ? "top" : "left";
          const maxSide = mainAxis === "y" ? "bottom" : "right";
          const min2 = mainAxisCoord + overflow[minSide];
          const max2 = mainAxisCoord - overflow[maxSide];
          mainAxisCoord = clamp(min2, mainAxisCoord, max2);
        }
        if (checkCrossAxis) {
          const minSide = crossAxis === "y" ? "top" : "left";
          const maxSide = crossAxis === "y" ? "bottom" : "right";
          const min2 = crossAxisCoord + overflow[minSide];
          const max2 = crossAxisCoord - overflow[maxSide];
          crossAxisCoord = clamp(min2, crossAxisCoord, max2);
        }
        const limitedCoords = limiter.fn({
          ...state,
          [mainAxis]: mainAxisCoord,
          [crossAxis]: crossAxisCoord
        });
        return {
          ...limitedCoords,
          data: {
            x: limitedCoords.x - x,
            y: limitedCoords.y - y,
            enabled: {
              [mainAxis]: checkMainAxis,
              [crossAxis]: checkCrossAxis
            }
          }
        };
      }
    };
  };

  // node_modules/@floating-ui/utils/dist/floating-ui.utils.dom.mjs
  function hasWindow() {
    return typeof window !== "undefined";
  }
  function getNodeName(node) {
    if (isNode(node)) {
      return (node.nodeName || "").toLowerCase();
    }
    return "#document";
  }
  function getWindow(node) {
    var _node$ownerDocument;
    return (node == null || (_node$ownerDocument = node.ownerDocument) == null ? void 0 : _node$ownerDocument.defaultView) || window;
  }
  function getDocumentElement(node) {
    var _ref;
    return (_ref = (isNode(node) ? node.ownerDocument : node.document) || window.document) == null ? void 0 : _ref.documentElement;
  }
  function isNode(value) {
    if (!hasWindow()) {
      return false;
    }
    return value instanceof Node || value instanceof getWindow(value).Node;
  }
  function isElement(value) {
    if (!hasWindow()) {
      return false;
    }
    return value instanceof Element || value instanceof getWindow(value).Element;
  }
  function isHTMLElement(value) {
    if (!hasWindow()) {
      return false;
    }
    return value instanceof HTMLElement || value instanceof getWindow(value).HTMLElement;
  }
  function isShadowRoot(value) {
    if (!hasWindow() || typeof ShadowRoot === "undefined") {
      return false;
    }
    return value instanceof ShadowRoot || value instanceof getWindow(value).ShadowRoot;
  }
  function isOverflowElement(element) {
    const {
      overflow,
      overflowX,
      overflowY,
      display
    } = getComputedStyle(element);
    return /auto|scroll|overlay|hidden|clip/.test(overflow + overflowY + overflowX) && !["inline", "contents"].includes(display);
  }
  function isTableElement(element) {
    return ["table", "td", "th"].includes(getNodeName(element));
  }
  function isTopLayer(element) {
    return [":popover-open", ":modal"].some((selector) => {
      try {
        return element.matches(selector);
      } catch (e) {
        return false;
      }
    });
  }
  function isContainingBlock(elementOrCss) {
    const webkit = isWebKit();
    const css = isElement(elementOrCss) ? getComputedStyle(elementOrCss) : elementOrCss;
    return ["transform", "translate", "scale", "rotate", "perspective"].some((value) => css[value] ? css[value] !== "none" : false) || (css.containerType ? css.containerType !== "normal" : false) || !webkit && (css.backdropFilter ? css.backdropFilter !== "none" : false) || !webkit && (css.filter ? css.filter !== "none" : false) || ["transform", "translate", "scale", "rotate", "perspective", "filter"].some((value) => (css.willChange || "").includes(value)) || ["paint", "layout", "strict", "content"].some((value) => (css.contain || "").includes(value));
  }
  function getContainingBlock(element) {
    let currentNode = getParentNode(element);
    while (isHTMLElement(currentNode) && !isLastTraversableNode(currentNode)) {
      if (isContainingBlock(currentNode)) {
        return currentNode;
      } else if (isTopLayer(currentNode)) {
        return null;
      }
      currentNode = getParentNode(currentNode);
    }
    return null;
  }
  function isWebKit() {
    if (typeof CSS === "undefined" || !CSS.supports)
      return false;
    return CSS.supports("-webkit-backdrop-filter", "none");
  }
  function isLastTraversableNode(node) {
    return ["html", "body", "#document"].includes(getNodeName(node));
  }
  function getComputedStyle(element) {
    return getWindow(element).getComputedStyle(element);
  }
  function getNodeScroll(element) {
    if (isElement(element)) {
      return {
        scrollLeft: element.scrollLeft,
        scrollTop: element.scrollTop
      };
    }
    return {
      scrollLeft: element.scrollX,
      scrollTop: element.scrollY
    };
  }
  function getParentNode(node) {
    if (getNodeName(node) === "html") {
      return node;
    }
    const result = (
      // Step into the shadow DOM of the parent of a slotted node.
      node.assignedSlot || // DOM Element detected.
      node.parentNode || // ShadowRoot detected.
      isShadowRoot(node) && node.host || // Fallback.
      getDocumentElement(node)
    );
    return isShadowRoot(result) ? result.host : result;
  }
  function getNearestOverflowAncestor(node) {
    const parentNode = getParentNode(node);
    if (isLastTraversableNode(parentNode)) {
      return node.ownerDocument ? node.ownerDocument.body : node.body;
    }
    if (isHTMLElement(parentNode) && isOverflowElement(parentNode)) {
      return parentNode;
    }
    return getNearestOverflowAncestor(parentNode);
  }
  function getOverflowAncestors(node, list, traverseIframes) {
    var _node$ownerDocument2;
    if (list === void 0) {
      list = [];
    }
    if (traverseIframes === void 0) {
      traverseIframes = true;
    }
    const scrollableAncestor = getNearestOverflowAncestor(node);
    const isBody = scrollableAncestor === ((_node$ownerDocument2 = node.ownerDocument) == null ? void 0 : _node$ownerDocument2.body);
    const win = getWindow(scrollableAncestor);
    if (isBody) {
      const frameElement = getFrameElement(win);
      return list.concat(win, win.visualViewport || [], isOverflowElement(scrollableAncestor) ? scrollableAncestor : [], frameElement && traverseIframes ? getOverflowAncestors(frameElement) : []);
    }
    return list.concat(scrollableAncestor, getOverflowAncestors(scrollableAncestor, [], traverseIframes));
  }
  function getFrameElement(win) {
    return win.parent && Object.getPrototypeOf(win.parent) ? win.frameElement : null;
  }

  // node_modules/@floating-ui/dom/dist/floating-ui.dom.esm.js
  function getCssDimensions(element) {
    const css = getComputedStyle(element);
    let width = parseFloat(css.width) || 0;
    let height = parseFloat(css.height) || 0;
    const hasOffset = isHTMLElement(element);
    const offsetWidth = hasOffset ? element.offsetWidth : width;
    const offsetHeight = hasOffset ? element.offsetHeight : height;
    const shouldFallback = round(width) !== offsetWidth || round(height) !== offsetHeight;
    if (shouldFallback) {
      width = offsetWidth;
      height = offsetHeight;
    }
    return {
      width,
      height,
      $: shouldFallback
    };
  }
  function unwrapElement(element) {
    return !isElement(element) ? element.contextElement : element;
  }
  function getScale(element) {
    const domElement = unwrapElement(element);
    if (!isHTMLElement(domElement)) {
      return createCoords(1);
    }
    const rect = domElement.getBoundingClientRect();
    const {
      width,
      height,
      $
    } = getCssDimensions(domElement);
    let x = ($ ? round(rect.width) : rect.width) / width;
    let y = ($ ? round(rect.height) : rect.height) / height;
    if (!x || !Number.isFinite(x)) {
      x = 1;
    }
    if (!y || !Number.isFinite(y)) {
      y = 1;
    }
    return {
      x,
      y
    };
  }
  var noOffsets = /* @__PURE__ */ createCoords(0);
  function getVisualOffsets(element) {
    const win = getWindow(element);
    if (!isWebKit() || !win.visualViewport) {
      return noOffsets;
    }
    return {
      x: win.visualViewport.offsetLeft,
      y: win.visualViewport.offsetTop
    };
  }
  function shouldAddVisualOffsets(element, isFixed, floatingOffsetParent) {
    if (isFixed === void 0) {
      isFixed = false;
    }
    if (!floatingOffsetParent || isFixed && floatingOffsetParent !== getWindow(element)) {
      return false;
    }
    return isFixed;
  }
  function getBoundingClientRect(element, includeScale, isFixedStrategy, offsetParent) {
    if (includeScale === void 0) {
      includeScale = false;
    }
    if (isFixedStrategy === void 0) {
      isFixedStrategy = false;
    }
    const clientRect = element.getBoundingClientRect();
    const domElement = unwrapElement(element);
    let scale = createCoords(1);
    if (includeScale) {
      if (offsetParent) {
        if (isElement(offsetParent)) {
          scale = getScale(offsetParent);
        }
      } else {
        scale = getScale(element);
      }
    }
    const visualOffsets = shouldAddVisualOffsets(domElement, isFixedStrategy, offsetParent) ? getVisualOffsets(domElement) : createCoords(0);
    let x = (clientRect.left + visualOffsets.x) / scale.x;
    let y = (clientRect.top + visualOffsets.y) / scale.y;
    let width = clientRect.width / scale.x;
    let height = clientRect.height / scale.y;
    if (domElement) {
      const win = getWindow(domElement);
      const offsetWin = offsetParent && isElement(offsetParent) ? getWindow(offsetParent) : offsetParent;
      let currentWin = win;
      let currentIFrame = getFrameElement(currentWin);
      while (currentIFrame && offsetParent && offsetWin !== currentWin) {
        const iframeScale = getScale(currentIFrame);
        const iframeRect = currentIFrame.getBoundingClientRect();
        const css = getComputedStyle(currentIFrame);
        const left = iframeRect.left + (currentIFrame.clientLeft + parseFloat(css.paddingLeft)) * iframeScale.x;
        const top = iframeRect.top + (currentIFrame.clientTop + parseFloat(css.paddingTop)) * iframeScale.y;
        x *= iframeScale.x;
        y *= iframeScale.y;
        width *= iframeScale.x;
        height *= iframeScale.y;
        x += left;
        y += top;
        currentWin = getWindow(currentIFrame);
        currentIFrame = getFrameElement(currentWin);
      }
    }
    return rectToClientRect({
      width,
      height,
      x,
      y
    });
  }
  function getWindowScrollBarX(element, rect) {
    const leftScroll = getNodeScroll(element).scrollLeft;
    if (!rect) {
      return getBoundingClientRect(getDocumentElement(element)).left + leftScroll;
    }
    return rect.left + leftScroll;
  }
  function getHTMLOffset(documentElement, scroll, ignoreScrollbarX) {
    if (ignoreScrollbarX === void 0) {
      ignoreScrollbarX = false;
    }
    const htmlRect = documentElement.getBoundingClientRect();
    const x = htmlRect.left + scroll.scrollLeft - (ignoreScrollbarX ? 0 : (
      // RTL <body> scrollbar.
      getWindowScrollBarX(documentElement, htmlRect)
    ));
    const y = htmlRect.top + scroll.scrollTop;
    return {
      x,
      y
    };
  }
  function convertOffsetParentRelativeRectToViewportRelativeRect(_ref) {
    let {
      elements,
      rect,
      offsetParent,
      strategy
    } = _ref;
    const isFixed = strategy === "fixed";
    const documentElement = getDocumentElement(offsetParent);
    const topLayer = elements ? isTopLayer(elements.floating) : false;
    if (offsetParent === documentElement || topLayer && isFixed) {
      return rect;
    }
    let scroll = {
      scrollLeft: 0,
      scrollTop: 0
    };
    let scale = createCoords(1);
    const offsets = createCoords(0);
    const isOffsetParentAnElement = isHTMLElement(offsetParent);
    if (isOffsetParentAnElement || !isOffsetParentAnElement && !isFixed) {
      if (getNodeName(offsetParent) !== "body" || isOverflowElement(documentElement)) {
        scroll = getNodeScroll(offsetParent);
      }
      if (isHTMLElement(offsetParent)) {
        const offsetRect = getBoundingClientRect(offsetParent);
        scale = getScale(offsetParent);
        offsets.x = offsetRect.x + offsetParent.clientLeft;
        offsets.y = offsetRect.y + offsetParent.clientTop;
      }
    }
    const htmlOffset = documentElement && !isOffsetParentAnElement && !isFixed ? getHTMLOffset(documentElement, scroll, true) : createCoords(0);
    return {
      width: rect.width * scale.x,
      height: rect.height * scale.y,
      x: rect.x * scale.x - scroll.scrollLeft * scale.x + offsets.x + htmlOffset.x,
      y: rect.y * scale.y - scroll.scrollTop * scale.y + offsets.y + htmlOffset.y
    };
  }
  function getClientRects(element) {
    return Array.from(element.getClientRects());
  }
  function getDocumentRect(element) {
    const html = getDocumentElement(element);
    const scroll = getNodeScroll(element);
    const body = element.ownerDocument.body;
    const width = max(html.scrollWidth, html.clientWidth, body.scrollWidth, body.clientWidth);
    const height = max(html.scrollHeight, html.clientHeight, body.scrollHeight, body.clientHeight);
    let x = -scroll.scrollLeft + getWindowScrollBarX(element);
    const y = -scroll.scrollTop;
    if (getComputedStyle(body).direction === "rtl") {
      x += max(html.clientWidth, body.clientWidth) - width;
    }
    return {
      width,
      height,
      x,
      y
    };
  }
  function getViewportRect(element, strategy) {
    const win = getWindow(element);
    const html = getDocumentElement(element);
    const visualViewport = win.visualViewport;
    let width = html.clientWidth;
    let height = html.clientHeight;
    let x = 0;
    let y = 0;
    if (visualViewport) {
      width = visualViewport.width;
      height = visualViewport.height;
      const visualViewportBased = isWebKit();
      if (!visualViewportBased || visualViewportBased && strategy === "fixed") {
        x = visualViewport.offsetLeft;
        y = visualViewport.offsetTop;
      }
    }
    return {
      width,
      height,
      x,
      y
    };
  }
  function getInnerBoundingClientRect(element, strategy) {
    const clientRect = getBoundingClientRect(element, true, strategy === "fixed");
    const top = clientRect.top + element.clientTop;
    const left = clientRect.left + element.clientLeft;
    const scale = isHTMLElement(element) ? getScale(element) : createCoords(1);
    const width = element.clientWidth * scale.x;
    const height = element.clientHeight * scale.y;
    const x = left * scale.x;
    const y = top * scale.y;
    return {
      width,
      height,
      x,
      y
    };
  }
  function getClientRectFromClippingAncestor(element, clippingAncestor, strategy) {
    let rect;
    if (clippingAncestor === "viewport") {
      rect = getViewportRect(element, strategy);
    } else if (clippingAncestor === "document") {
      rect = getDocumentRect(getDocumentElement(element));
    } else if (isElement(clippingAncestor)) {
      rect = getInnerBoundingClientRect(clippingAncestor, strategy);
    } else {
      const visualOffsets = getVisualOffsets(element);
      rect = {
        x: clippingAncestor.x - visualOffsets.x,
        y: clippingAncestor.y - visualOffsets.y,
        width: clippingAncestor.width,
        height: clippingAncestor.height
      };
    }
    return rectToClientRect(rect);
  }
  function hasFixedPositionAncestor(element, stopNode) {
    const parentNode = getParentNode(element);
    if (parentNode === stopNode || !isElement(parentNode) || isLastTraversableNode(parentNode)) {
      return false;
    }
    return getComputedStyle(parentNode).position === "fixed" || hasFixedPositionAncestor(parentNode, stopNode);
  }
  function getClippingElementAncestors(element, cache) {
    const cachedResult = cache.get(element);
    if (cachedResult) {
      return cachedResult;
    }
    let result = getOverflowAncestors(element, [], false).filter((el) => isElement(el) && getNodeName(el) !== "body");
    let currentContainingBlockComputedStyle = null;
    const elementIsFixed = getComputedStyle(element).position === "fixed";
    let currentNode = elementIsFixed ? getParentNode(element) : element;
    while (isElement(currentNode) && !isLastTraversableNode(currentNode)) {
      const computedStyle = getComputedStyle(currentNode);
      const currentNodeIsContaining = isContainingBlock(currentNode);
      if (!currentNodeIsContaining && computedStyle.position === "fixed") {
        currentContainingBlockComputedStyle = null;
      }
      const shouldDropCurrentNode = elementIsFixed ? !currentNodeIsContaining && !currentContainingBlockComputedStyle : !currentNodeIsContaining && computedStyle.position === "static" && !!currentContainingBlockComputedStyle && ["absolute", "fixed"].includes(currentContainingBlockComputedStyle.position) || isOverflowElement(currentNode) && !currentNodeIsContaining && hasFixedPositionAncestor(element, currentNode);
      if (shouldDropCurrentNode) {
        result = result.filter((ancestor) => ancestor !== currentNode);
      } else {
        currentContainingBlockComputedStyle = computedStyle;
      }
      currentNode = getParentNode(currentNode);
    }
    cache.set(element, result);
    return result;
  }
  function getClippingRect(_ref) {
    let {
      element,
      boundary,
      rootBoundary,
      strategy
    } = _ref;
    const elementClippingAncestors = boundary === "clippingAncestors" ? isTopLayer(element) ? [] : getClippingElementAncestors(element, this._c) : [].concat(boundary);
    const clippingAncestors = [...elementClippingAncestors, rootBoundary];
    const firstClippingAncestor = clippingAncestors[0];
    const clippingRect = clippingAncestors.reduce((accRect, clippingAncestor) => {
      const rect = getClientRectFromClippingAncestor(element, clippingAncestor, strategy);
      accRect.top = max(rect.top, accRect.top);
      accRect.right = min(rect.right, accRect.right);
      accRect.bottom = min(rect.bottom, accRect.bottom);
      accRect.left = max(rect.left, accRect.left);
      return accRect;
    }, getClientRectFromClippingAncestor(element, firstClippingAncestor, strategy));
    return {
      width: clippingRect.right - clippingRect.left,
      height: clippingRect.bottom - clippingRect.top,
      x: clippingRect.left,
      y: clippingRect.top
    };
  }
  function getDimensions(element) {
    const {
      width,
      height
    } = getCssDimensions(element);
    return {
      width,
      height
    };
  }
  function getRectRelativeToOffsetParent(element, offsetParent, strategy) {
    const isOffsetParentAnElement = isHTMLElement(offsetParent);
    const documentElement = getDocumentElement(offsetParent);
    const isFixed = strategy === "fixed";
    const rect = getBoundingClientRect(element, true, isFixed, offsetParent);
    let scroll = {
      scrollLeft: 0,
      scrollTop: 0
    };
    const offsets = createCoords(0);
    if (isOffsetParentAnElement || !isOffsetParentAnElement && !isFixed) {
      if (getNodeName(offsetParent) !== "body" || isOverflowElement(documentElement)) {
        scroll = getNodeScroll(offsetParent);
      }
      if (isOffsetParentAnElement) {
        const offsetRect = getBoundingClientRect(offsetParent, true, isFixed, offsetParent);
        offsets.x = offsetRect.x + offsetParent.clientLeft;
        offsets.y = offsetRect.y + offsetParent.clientTop;
      } else if (documentElement) {
        offsets.x = getWindowScrollBarX(documentElement);
      }
    }
    const htmlOffset = documentElement && !isOffsetParentAnElement && !isFixed ? getHTMLOffset(documentElement, scroll) : createCoords(0);
    const x = rect.left + scroll.scrollLeft - offsets.x - htmlOffset.x;
    const y = rect.top + scroll.scrollTop - offsets.y - htmlOffset.y;
    return {
      x,
      y,
      width: rect.width,
      height: rect.height
    };
  }
  function isStaticPositioned(element) {
    return getComputedStyle(element).position === "static";
  }
  function getTrueOffsetParent(element, polyfill) {
    if (!isHTMLElement(element) || getComputedStyle(element).position === "fixed") {
      return null;
    }
    if (polyfill) {
      return polyfill(element);
    }
    let rawOffsetParent = element.offsetParent;
    if (getDocumentElement(element) === rawOffsetParent) {
      rawOffsetParent = rawOffsetParent.ownerDocument.body;
    }
    return rawOffsetParent;
  }
  function getOffsetParent(element, polyfill) {
    const win = getWindow(element);
    if (isTopLayer(element)) {
      return win;
    }
    if (!isHTMLElement(element)) {
      let svgOffsetParent = getParentNode(element);
      while (svgOffsetParent && !isLastTraversableNode(svgOffsetParent)) {
        if (isElement(svgOffsetParent) && !isStaticPositioned(svgOffsetParent)) {
          return svgOffsetParent;
        }
        svgOffsetParent = getParentNode(svgOffsetParent);
      }
      return win;
    }
    let offsetParent = getTrueOffsetParent(element, polyfill);
    while (offsetParent && isTableElement(offsetParent) && isStaticPositioned(offsetParent)) {
      offsetParent = getTrueOffsetParent(offsetParent, polyfill);
    }
    if (offsetParent && isLastTraversableNode(offsetParent) && isStaticPositioned(offsetParent) && !isContainingBlock(offsetParent)) {
      return win;
    }
    return offsetParent || getContainingBlock(element) || win;
  }
  var getElementRects = async function(data) {
    const getOffsetParentFn = this.getOffsetParent || getOffsetParent;
    const getDimensionsFn = this.getDimensions;
    const floatingDimensions = await getDimensionsFn(data.floating);
    return {
      reference: getRectRelativeToOffsetParent(data.reference, await getOffsetParentFn(data.floating), data.strategy),
      floating: {
        x: 0,
        y: 0,
        width: floatingDimensions.width,
        height: floatingDimensions.height
      }
    };
  };
  function isRTL(element) {
    return getComputedStyle(element).direction === "rtl";
  }
  var platform = {
    convertOffsetParentRelativeRectToViewportRelativeRect,
    getDocumentElement,
    getClippingRect,
    getOffsetParent,
    getElementRects,
    getClientRects,
    getDimensions,
    getScale,
    isElement,
    isRTL
  };
  var offset2 = offset;
  var shift2 = shift;
  var flip2 = flip;
  var arrow2 = arrow;
  var computePosition2 = (reference, floating, options) => {
    const cache = /* @__PURE__ */ new Map();
    const mergedOptions = {
      platform,
      ...options
    };
    const platformWithCache = {
      ...mergedOptions.platform,
      _c: cache
    };
    return computePosition(reference, floating, {
      ...mergedOptions,
      platform: platformWithCache
    });
  };

  // src/managers/TooltipManager.js
  var _app18, _logger23, _tooltip, _arrowElement, _textContainer, _currentElement, _showTimeout, _hideTimeout, _initialized3, _init8, init_fn8, _createTooltip, createTooltip_fn, _setupEventListeners6, setupEventListeners_fn6, _showTooltip, showTooltip_fn, _hideTooltip, hideTooltip_fn;
  var TooltipManager = class {
    constructor(app) {
      /**
       * Initialize the tooltip system
       */
      __privateAdd(this, _init8);
      /**
       * Create the tooltip element
       */
      __privateAdd(this, _createTooltip);
      /**
       * Set up event listeners for tooltips
       */
      __privateAdd(this, _setupEventListeners6);
      /**
       * Show the tooltip for a specific element
       */
      __privateAdd(this, _showTooltip);
      /**
       * Hide the tooltip
       */
      __privateAdd(this, _hideTooltip);
      __privateAdd(this, _app18, void 0);
      __privateAdd(this, _logger23, void 0);
      __privateAdd(this, _tooltip, void 0);
      __privateAdd(this, _arrowElement, void 0);
      __privateAdd(this, _textContainer, void 0);
      __privateAdd(this, _currentElement, null);
      __privateAdd(this, _showTimeout, null);
      __privateAdd(this, _hideTimeout, null);
      __privateAdd(this, _initialized3, false);
      __privateSet(this, _app18, app);
      __privateSet(this, _logger23, app.logger.createModuleLogger("TOOLTIP"));
      __privateMethod(this, _init8, init_fn8).call(this);
      __privateGet(this, _logger23).info("TooltipManager initialized");
    }
  };
  _app18 = new WeakMap();
  _logger23 = new WeakMap();
  _tooltip = new WeakMap();
  _arrowElement = new WeakMap();
  _textContainer = new WeakMap();
  _currentElement = new WeakMap();
  _showTimeout = new WeakMap();
  _hideTimeout = new WeakMap();
  _initialized3 = new WeakMap();
  _init8 = new WeakSet();
  init_fn8 = function() {
    if (__privateGet(this, _initialized3))
      return;
    __privateSet(this, _tooltip, __privateMethod(this, _createTooltip, createTooltip_fn).call(this));
    __privateSet(this, _arrowElement, __privateGet(this, _tooltip).querySelector("#checkout-tooltip-arrow"));
    __privateSet(this, _textContainer, __privateGet(this, _tooltip).querySelector("#checkout-tooltip-text"));
    __privateMethod(this, _setupEventListeners6, setupEventListeners_fn6).call(this);
    __privateSet(this, _initialized3, true);
    __privateGet(this, _logger23).info("Tooltip system initialized with floating-ui");
  };
  _createTooltip = new WeakSet();
  createTooltip_fn = function() {
    const existingTooltip = document.getElementById("checkout-tooltip");
    if (existingTooltip)
      return existingTooltip;
    const tooltip = document.createElement("div");
    tooltip.setAttribute("role", "tooltip");
    tooltip.id = "checkout-tooltip";
    tooltip.style.display = "none";
    const textContainer = document.createElement("div");
    textContainer.id = "checkout-tooltip-text";
    tooltip.appendChild(textContainer);
    const arrowElement = document.createElement("div");
    arrowElement.id = "checkout-tooltip-arrow";
    tooltip.appendChild(arrowElement);
    document.body.appendChild(tooltip);
    return tooltip;
  };
  _setupEventListeners6 = new WeakSet();
  setupEventListeners_fn6 = function() {
    document.addEventListener("mouseover", (e) => {
      const element = e.target.closest("[data-os-tooltip]");
      if (!element)
        return;
      clearTimeout(__privateGet(this, _showTimeout));
      __privateSet(this, _showTimeout, setTimeout(() => {
        __privateMethod(this, _showTooltip, showTooltip_fn).call(this, element);
      }, 200));
    });
    document.addEventListener("mouseout", (e) => {
      const element = e.target.closest("[data-os-tooltip]");
      if (!element)
        return;
      clearTimeout(__privateGet(this, _showTimeout));
      __privateMethod(this, _hideTooltip, hideTooltip_fn).call(this);
    });
    document.addEventListener("focus", (e) => {
      const element = e.target.closest("[data-os-tooltip]");
      if (!element)
        return;
      __privateMethod(this, _showTooltip, showTooltip_fn).call(this, element);
    }, true);
    document.addEventListener("blur", (e) => {
      const element = e.target.closest("[data-os-tooltip]");
      if (!element)
        return;
      __privateMethod(this, _hideTooltip, hideTooltip_fn).call(this);
    }, true);
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && __privateGet(this, _currentElement)) {
        __privateMethod(this, _hideTooltip, hideTooltip_fn).call(this);
      }
    });
  };
  _showTooltip = new WeakSet();
  showTooltip_fn = function(element) {
    if (!__privateGet(this, _initialized3)) {
      __privateGet(this, _logger23).warn("Cannot show tooltip: system not initialized");
      return;
    }
    clearTimeout(__privateGet(this, _hideTimeout));
    __privateSet(this, _currentElement, element);
    const text = element.getAttribute("data-os-tooltip");
    const position = element.getAttribute("data-os-tooltip-position") || "top";
    __privateGet(this, _textContainer).textContent = text;
    __privateGet(this, _tooltip).style.display = "block";
    computePosition2(element, __privateGet(this, _tooltip), {
      placement: position,
      middleware: [
        offset2(8),
        flip2({
          fallbackPlacements: ["top", "right", "bottom", "left"]
        }),
        shift2({ padding: 5 }),
        arrow2({ element: __privateGet(this, _arrowElement) })
      ]
    }).then(({ x, y, placement, middlewareData }) => {
      Object.assign(__privateGet(this, _tooltip).style, {
        left: `${x}px`,
        top: `${y}px`
      });
      const { x: arrowX, y: arrowY } = middlewareData.arrow;
      const staticSide = {
        top: "bottom",
        right: "left",
        bottom: "top",
        left: "right"
      }[placement.split("-")[0]];
      Object.assign(__privateGet(this, _arrowElement).style, {
        left: arrowX != null ? `${arrowX}px` : "",
        top: arrowY != null ? `${arrowY}px` : "",
        right: "",
        bottom: "",
        [staticSide]: "-4px"
      });
      requestAnimationFrame(() => {
        __privateGet(this, _tooltip).classList.add("checkout-tooltip-visible");
      });
    });
  };
  _hideTooltip = new WeakSet();
  hideTooltip_fn = function() {
    if (!__privateGet(this, _tooltip))
      return;
    __privateGet(this, _tooltip).classList.remove("checkout-tooltip-visible");
    __privateSet(this, _hideTimeout, setTimeout(() => {
      if (!__privateGet(this, _tooltip).classList.contains("checkout-tooltip-visible")) {
        __privateGet(this, _tooltip).style.display = "none";
      }
      __privateSet(this, _currentElement, null);
    }, 200));
  };

  // src/managers/UpsellManager.js
  var _app19, _logger24, _stateManager2, _api, _upsellElements, _orderRef, _init9, init_fn9, _getOrderReferenceId, getOrderReferenceId_fn, _initUpsellElements, initUpsellElements_fn, _bindEvents, bindEvents_fn, _disableUpsellButtons, disableUpsellButtons_fn, _enableUpsellButtons, enableUpsellButtons_fn, _redirect, redirect_fn, _displayError, displayError_fn;
  var UpsellManager = class {
    constructor(app) {
      __privateAdd(this, _init9);
      /**
       * Get the order reference ID from URL parameters or sessionStorage
       * @returns {string|null} The order reference ID or null if not found
       */
      __privateAdd(this, _getOrderReferenceId);
      /**
       * Initialize upsell UI elements
       */
      __privateAdd(this, _initUpsellElements);
      /**
       * Bind events to upsell elements
       */
      __privateAdd(this, _bindEvents);
      /**
       * Disable all upsell buttons to prevent multiple clicks
       */
      __privateAdd(this, _disableUpsellButtons);
      /**
       * Re-enable all upsell buttons (used in case of error)
       */
      __privateAdd(this, _enableUpsellButtons);
      /**
       * Redirect to a URL, appending the order reference ID if needed
       * @param {string} url - The URL to redirect to
       */
      __privateAdd(this, _redirect);
      /**
       * Display an error message to the user
       * @param {string} message - The error message to display
       */
      __privateAdd(this, _displayError);
      __privateAdd(this, _app19, void 0);
      __privateAdd(this, _logger24, void 0);
      __privateAdd(this, _stateManager2, void 0);
      __privateAdd(this, _api, void 0);
      __privateAdd(this, _upsellElements, {});
      __privateAdd(this, _orderRef, null);
      __privateSet(this, _app19, app);
      __privateSet(this, _logger24, app.logger.createModuleLogger("UPSELL"));
      __privateSet(this, _stateManager2, app.state);
      __privateSet(this, _api, app.api);
      __privateMethod(this, _init9, init_fn9).call(this);
      __privateGet(this, _logger24).info("UpsellManager initialized");
    }
    /**
     * Accept an upsell offer by adding the product to the order
     * @param {string|number} packageId - The package ID to add to the order
     * @param {number} quantity - The quantity to add (default: 1)
     * @param {string} nextUrl - The URL to redirect to after adding the upsell
     */
    async acceptUpsell(packageId, quantity = 1, nextUrl) {
      if (!__privateGet(this, _orderRef)) {
        __privateGet(this, _logger24).error("Cannot accept upsell: No order reference ID found");
        return;
      }
      __privateGet(this, _logger24).info(`Accepting upsell: Package ${packageId}, Quantity ${quantity}`);
      __privateMethod(this, _disableUpsellButtons, disableUpsellButtons_fn).call(this);
      try {
        document.body.classList.add("os-loading");
        const upsellData = {
          lines: [{
            package_id: Number(packageId),
            quantity: Number(quantity),
            is_upsell: true
          }]
        };
        const response = await __privateGet(this, _api).createOrderUpsell(__privateGet(this, _orderRef), upsellData);
        __privateGet(this, _logger24).info("Upsell successfully added to order", response);
        __privateMethod(this, _redirect, redirect_fn).call(this, nextUrl);
      } catch (error) {
        __privateGet(this, _logger24).error("Error accepting upsell:", error);
        document.body.classList.remove("os-loading");
        __privateMethod(this, _enableUpsellButtons, enableUpsellButtons_fn).call(this);
        __privateMethod(this, _displayError, displayError_fn).call(this, "There was an error processing your upsell. Please try again.");
      }
    }
    /**
     * Decline an upsell offer and redirect to the next URL
     * @param {string} nextUrl - The URL to redirect to
     */
    declineUpsell(nextUrl) {
      __privateGet(this, _logger24).info("Declining upsell offer");
      __privateMethod(this, _disableUpsellButtons, disableUpsellButtons_fn).call(this);
      __privateMethod(this, _redirect, redirect_fn).call(this, nextUrl);
    }
  };
  _app19 = new WeakMap();
  _logger24 = new WeakMap();
  _stateManager2 = new WeakMap();
  _api = new WeakMap();
  _upsellElements = new WeakMap();
  _orderRef = new WeakMap();
  _init9 = new WeakSet();
  init_fn9 = function() {
    __privateSet(this, _orderRef, __privateMethod(this, _getOrderReferenceId, getOrderReferenceId_fn).call(this));
    if (__privateGet(this, _orderRef)) {
      __privateGet(this, _logger24).info(`Order reference ID found: ${__privateGet(this, _orderRef)}`);
      __privateGet(this, _stateManager2).setState("order.ref_id", __privateGet(this, _orderRef));
    } else {
      __privateGet(this, _logger24).warn("No order reference ID found, upsell functionality will be limited");
    }
    __privateMethod(this, _initUpsellElements, initUpsellElements_fn).call(this);
    __privateMethod(this, _bindEvents, bindEvents_fn).call(this);
  };
  _getOrderReferenceId = new WeakSet();
  getOrderReferenceId_fn = function() {
    const urlParams = new URLSearchParams(window.location.search);
    let refId = urlParams.get("ref_id");
    if (!refId) {
      refId = sessionStorage.getItem("order_ref_id");
      __privateGet(this, _logger24).debug("Getting order ref_id from sessionStorage:", refId);
    } else {
      __privateGet(this, _logger24).debug("Getting order ref_id from URL parameters:", refId);
      sessionStorage.setItem("order_ref_id", refId);
    }
    return refId;
  };
  _initUpsellElements = new WeakSet();
  initUpsellElements_fn = function() {
    __privateSet(this, _upsellElements, {
      acceptButtons: document.querySelectorAll('[data-os-upsell="accept"]'),
      declineButtons: document.querySelectorAll('[data-os-upsell="decline"]')
    });
    __privateGet(this, _logger24).debug(`Found ${__privateGet(this, _upsellElements).acceptButtons.length} accept buttons and ${__privateGet(this, _upsellElements).declineButtons.length} decline buttons`);
  };
  _bindEvents = new WeakSet();
  bindEvents_fn = function() {
    __privateGet(this, _upsellElements).acceptButtons.forEach((button) => {
      button.addEventListener("click", (event) => {
        event.preventDefault();
        const packageId = button.getAttribute("data-os-package-id");
        const quantity = parseInt(button.getAttribute("data-os-quantity") || "1", 10);
        const nextUrl = button.getAttribute("data-os-next-url");
        if (!packageId) {
          __privateGet(this, _logger24).error("No package ID specified for upsell accept button");
          return;
        }
        this.acceptUpsell(packageId, quantity, nextUrl);
      });
    });
    __privateGet(this, _upsellElements).declineButtons.forEach((button) => {
      button.addEventListener("click", (event) => {
        event.preventDefault();
        const nextUrl = button.getAttribute("data-os-next-url");
        if (nextUrl) {
          this.declineUpsell(nextUrl);
        } else {
          __privateGet(this, _logger24).error("No next URL specified for upsell decline button");
        }
      });
    });
  };
  _disableUpsellButtons = new WeakSet();
  disableUpsellButtons_fn = function() {
    __privateGet(this, _logger24).debug("Disabling upsell buttons");
    __privateGet(this, _upsellElements).acceptButtons.forEach((button) => {
      button.style.pointerEvents = "none";
      button.classList.add("os-button-disabled");
    });
    __privateGet(this, _upsellElements).declineButtons.forEach((button) => {
      button.style.pointerEvents = "none";
      button.classList.add("os-button-disabled");
    });
  };
  _enableUpsellButtons = new WeakSet();
  enableUpsellButtons_fn = function() {
    __privateGet(this, _logger24).debug("Re-enabling upsell buttons");
    __privateGet(this, _upsellElements).acceptButtons.forEach((button) => {
      button.style.pointerEvents = "";
      button.classList.remove("os-button-disabled");
    });
    __privateGet(this, _upsellElements).declineButtons.forEach((button) => {
      button.style.pointerEvents = "";
      button.classList.remove("os-button-disabled");
    });
  };
  _redirect = new WeakSet();
  redirect_fn = function(url) {
    if (!url) {
      __privateGet(this, _logger24).warn("No URL provided for redirect");
      return;
    }
    const redirectUrl = new URL(url, window.location.origin);
    if (__privateGet(this, _orderRef) && !redirectUrl.searchParams.has("ref_id")) {
      redirectUrl.searchParams.append("ref_id", __privateGet(this, _orderRef));
    }
    __privateGet(this, _logger24).info(`Redirecting to ${redirectUrl.href}`);
    window.location.href = redirectUrl.href;
  };
  _displayError = new WeakSet();
  displayError_fn = function(message) {
    const errorContainer = document.querySelector("[data-os-error-container]");
    if (errorContainer) {
      errorContainer.textContent = message;
      errorContainer.style.display = "block";
    } else {
      alert(message);
    }
  };

  // src/utils/PBAccordion.js
  var PBAccordion = class {
    constructor() {
      this.cleanupInitialState();
      this.init();
    }
    cleanupInitialState() {
      document.querySelectorAll('[pb-component="accordion"]').forEach((accordion) => {
        const group = accordion.querySelector('[pb-accordion-element="group"]');
        if (!group)
          return;
        const items = group.querySelectorAll('[pb-accordion-element="accordion"]');
        items.forEach((item) => {
          const content = item.querySelector('[pb-accordion-element="content"]');
          const trigger = item.querySelector('[pb-accordion-element="trigger"]');
          const arrow3 = item.querySelector('[pb-accordion-element="arrow"]');
          const plus = item.querySelector('[pb-accordion-element="plus"]');
          if (content) {
            content.style.maxHeight = "0";
            content.style.opacity = "0";
            content.style.visibility = "hidden";
            content.style.display = "none";
          }
          if (trigger)
            trigger.setAttribute("aria-expanded", "false");
          item.classList.remove("is-active-accordion");
          content?.classList.remove("is-active-accordion");
          if (arrow3)
            arrow3.classList.remove("is-active-accordion");
          if (plus)
            plus.classList.remove("is-active-accordion");
        });
        const initial = group.getAttribute("pb-accordion-initial");
        if (initial && initial !== "none") {
          const initialItem = items[parseInt(initial) - 1];
          if (initialItem) {
            this.openAccordion(initialItem);
          }
        }
      });
    }
    init() {
      document.querySelectorAll('[pb-component="accordion"]').forEach((accordion) => {
        const group = accordion.querySelector('[pb-accordion-element="group"]');
        if (!group)
          return;
        group.addEventListener("click", (e) => this.handleClick(e, group));
      });
    }
    handleClick(event, group) {
      const accordionItem = event.target.closest('[pb-accordion-element="accordion"]');
      if (!accordionItem)
        return;
      const isOpen = accordionItem.classList.contains("is-active-accordion");
      const isSingle = group.getAttribute("pb-accordion-single") === "true";
      if (isSingle) {
        group.querySelectorAll('[pb-accordion-element="accordion"]').forEach((item) => {
          if (item !== accordionItem && item.classList.contains("is-active-accordion")) {
            this.closeAccordion(item);
          }
        });
      }
      if (isOpen) {
        this.closeAccordion(accordionItem);
      } else {
        this.openAccordion(accordionItem);
      }
    }
    openAccordion(item) {
      const trigger = item.querySelector('[pb-accordion-element="trigger"]');
      const content = item.querySelector('[pb-accordion-element="content"]');
      const arrow3 = item.querySelector('[pb-accordion-element="arrow"]');
      const plus = item.querySelector('[pb-accordion-element="plus"]');
      content.style.visibility = "visible";
      content.style.display = "block";
      content.offsetHeight;
      const contentHeight = content.scrollHeight;
      requestAnimationFrame(() => {
        content.style.maxHeight = `${contentHeight}px`;
        content.style.opacity = "1";
        trigger.setAttribute("aria-expanded", "true");
        item.classList.add("is-active-accordion");
        content.classList.add("is-active-accordion");
        if (arrow3)
          arrow3.classList.add("is-active-accordion");
        if (plus)
          plus.classList.add("is-active-accordion");
      });
      content.addEventListener("transitionend", () => {
        if (item.classList.contains("is-active-accordion")) {
          content.style.maxHeight = "none";
        }
      }, { once: true });
    }
    closeAccordion(item) {
      const trigger = item.querySelector('[pb-accordion-element="trigger"]');
      const content = item.querySelector('[pb-accordion-element="content"]');
      const arrow3 = item.querySelector('[pb-accordion-element="arrow"]');
      const plus = item.querySelector('[pb-accordion-element="plus"]');
      content.style.maxHeight = `${content.scrollHeight}px`;
      content.style.display = "block";
      content.offsetHeight;
      requestAnimationFrame(() => {
        content.style.maxHeight = "0";
        content.style.opacity = "0";
        trigger.setAttribute("aria-expanded", "false");
        item.classList.remove("is-active-accordion");
        content.classList.remove("is-active-accordion");
        if (arrow3)
          arrow3.classList.remove("is-active-accordion");
        if (plus)
          plus.classList.remove("is-active-accordion");
      });
      content.addEventListener("transitionend", () => {
        if (!item.classList.contains("is-active-accordion")) {
          content.style.visibility = "hidden";
          content.style.display = "none";
        }
      }, { once: true });
    }
  };
  var initPBAccordion = () => {
    if (document.querySelector('[pb-component="accordion"]')) {
      return new PBAccordion();
    }
    return null;
  };

  // src/utils/UtmTransfer.js
  var UtmTransfer = class {
    constructor() {
      this.config = {
        enabled: true,
        applyToExternalLinks: false,
        excludedDomains: [],
        paramsToCopy: []
      };
      this.loadConfig();
    }
    loadConfig() {
      if (window.osConfig && window.osConfig.utmTransfer) {
        this.config = {
          ...this.config,
          ...window.osConfig.utmTransfer
        };
      }
      if (this.config.paramsToCopy === null || this.config.paramsToCopy === void 0) {
        this.config.paramsToCopy = [];
      }
      /* @__PURE__ */ console.log("UTM Transfer: Initialized with config", JSON.stringify(this.config));
    }
    // Initialize the UTM transfer feature
    init() {
      if (!this.config.enabled) {
        /* @__PURE__ */ console.log("UTM Transfer: Disabled by configuration");
        return;
      }
      const currentParams = new URLSearchParams(window.location.search);
      if (currentParams.toString() === "") {
        /* @__PURE__ */ console.log("UTM Transfer: No URL parameters to transfer");
        return;
      }
      const availableParams = [];
      currentParams.forEach((value, key) => {
        availableParams.push(`${key}=${value}`);
      });
      /* @__PURE__ */ console.log(`UTM Transfer: Available parameters: ${availableParams.join(", ")}`);
      let paramsToApply = currentParams;
      if (Array.isArray(this.config.paramsToCopy) && this.config.paramsToCopy.length > 0) {
        /* @__PURE__ */ console.log(`UTM Transfer: Filtering to specific parameters: ${this.config.paramsToCopy.join(", ")}`);
        paramsToApply = new URLSearchParams();
        this.config.paramsToCopy.forEach((param) => {
          if (currentParams.has(param)) {
            paramsToApply.append(param, currentParams.get(param));
            /* @__PURE__ */ console.log(`UTM Transfer: Found parameter to copy: ${param}=${currentParams.get(param)}`);
          }
        });
        if (paramsToApply.toString() === "") {
          /* @__PURE__ */ console.log("UTM Transfer: No matching parameters to transfer");
          return;
        }
      } else {
        /* @__PURE__ */ console.log("UTM Transfer: No specific parameters configured, will copy all parameters");
      }
      const links = document.querySelectorAll("a");
      /* @__PURE__ */ console.log(`UTM Transfer: Found ${links.length} links on the page`);
      links.forEach((link) => {
        link.addEventListener("click", (event) => {
          this.applyParamsToLink(link, paramsToApply);
        });
      });
      /* @__PURE__ */ console.log("UTM Transfer: Event listeners attached to links");
    }
    // Apply parameters to a specific link
    applyParamsToLink(linkElement, params = null) {
      if (!linkElement || !linkElement.getAttribute) {
        console.error("UTM Transfer: Invalid link element provided");
        return;
      }
      let href = linkElement.getAttribute("href");
      if (!href)
        return;
      if (href.startsWith("#") || href.startsWith("javascript:") || href.startsWith("mailto:") || href.startsWith("tel:")) {
        return;
      }
      const isExternalLink = href.includes("://") && !href.includes(window.location.hostname);
      if (isExternalLink) {
        if (!this.config.applyToExternalLinks) {
          return;
        }
        if (this.config.excludedDomains && this.config.excludedDomains.length > 0) {
          for (const domain of this.config.excludedDomains) {
            if (href.includes(domain)) {
              return;
            }
          }
        }
      }
      const paramsToApply = params || new URLSearchParams(window.location.search);
      if (paramsToApply.toString() === "") {
        return;
      }
      let url;
      try {
        url = new URL(href, window.location.origin);
      } catch (e) {
        console.error("UTM Transfer: Invalid URL:", href);
        return;
      }
      const linkParams = new URLSearchParams(url.search);
      paramsToApply.forEach((value, key) => {
        if (!linkParams.has(key)) {
          linkParams.append(key, value);
        }
      });
      url.search = linkParams.toString();
      linkElement.setAttribute("href", url.toString());
      if (this.config.debug) {
        /* @__PURE__ */ console.log(`UTM Transfer: Updated link ${href} to ${url.toString()}`);
      }
    }
  };
  var initUtmTransfer = () => {
    const utmTransfer = new UtmTransfer();
    utmTransfer.init();
    return utmTransfer;
  };

  // src/core/TwentyNineNext.js
  var _isInitialized2, _isCheckoutPage, _campaignData, _loadConfig2, loadConfig_fn2, _initSpreedlyConfig, initSpreedlyConfig_fn, _loadGoogleMapsApi, loadGoogleMapsApi_fn, _fetchCampaignData, fetchCampaignData_fn, _initializeManagers, initializeManagers_fn, _finalizeInitialization, finalizeInitialization_fn, _hidePreloader, hidePreloader_fn, _detectCheckoutPage, detectCheckoutPage_fn, _initCheckoutPage, initCheckoutPage_fn, _initReceiptPage, initReceiptPage_fn, _initUpsellPage, initUpsellPage_fn, _initUIUtilities, initUIUtilities_fn;
  var TwentyNineNext = class {
    constructor(options = {}) {
      __privateAdd(this, _loadConfig2);
      /**
       * Initialize Spreedly configuration from global config
       * This allows users to customize Spreedly iframe behavior
       */
      __privateAdd(this, _initSpreedlyConfig);
      __privateAdd(this, _loadGoogleMapsApi);
      __privateAdd(this, _fetchCampaignData);
      __privateAdd(this, _initializeManagers);
      __privateAdd(this, _finalizeInitialization);
      __privateAdd(this, _hidePreloader);
      __privateAdd(this, _detectCheckoutPage);
      __privateAdd(this, _initCheckoutPage);
      __privateAdd(this, _initReceiptPage);
      __privateAdd(this, _initUpsellPage);
      __privateAdd(this, _initUIUtilities);
      __privateAdd(this, _isInitialized2, false);
      __privateAdd(this, _isCheckoutPage, false);
      __privateAdd(this, _campaignData, null);
      const googleMapsConfig = window.osConfig?.googleMaps || {};
      this.options = {
        debug: false,
        autoInit: true,
        googleMapsApiKey: googleMapsConfig.apiKey || "YOUR_API_KEY_HERE",
        googleMapsRegion: googleMapsConfig.region || "US",
        enableGoogleMapsAutocomplete: googleMapsConfig.enableAutocomplete !== false,
        ...options
      };
      this.logger = new Logger(this.options.debug);
      this.coreLogger = this.logger.createModuleLogger("CORE");
      this.api = new ApiClient(this);
      this.config = __privateMethod(this, _loadConfig2, loadConfig_fn2).call(this);
      this.state = new StateManager(this);
      this.attribution = new AttributionManager(this);
      this.cart = new CartManager(this);
      this.campaign = new CampaignHelper(this);
      this.upsell = new UpsellManager(this);
      this.events = {
        on: (event, callback) => this.on(event, callback),
        once: (event, callback) => this.once(event, callback),
        off: (event, callback) => this.off(event, callback),
        trigger: (event, data) => this.triggerEvent(event, data)
      };
      if (this.options.autoInit)
        this.init();
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
    async init() {
      this.coreLogger.info("Initializing 29next client");
      this.api.init();
      if (typeof window.on29NextReady !== "undefined" && !Array.isArray(window.on29NextReady)) {
        this.coreLogger.warn("window.on29NextReady is not an array, resetting it");
        window.on29NextReady = [];
      }
      await __privateMethod(this, _fetchCampaignData, fetchCampaignData_fn).call(this);
      await __privateMethod(this, _loadGoogleMapsApi, loadGoogleMapsApi_fn).call(this);
      __privateSet(this, _isCheckoutPage, __privateMethod(this, _detectCheckoutPage, detectCheckoutPage_fn).call(this));
      if (__privateGet(this, _isCheckoutPage))
        __privateMethod(this, _initCheckoutPage, initCheckoutPage_fn).call(this);
      __privateMethod(this, _initializeManagers, initializeManagers_fn).call(this);
      __privateMethod(this, _initUIUtilities, initUIUtilities_fn).call(this);
      __privateSet(this, _isInitialized2, true);
      this.triggerEvent("initialized", { client: this });
      await __privateMethod(this, _finalizeInitialization, finalizeInitialization_fn).call(this);
    }
    triggerEvent(eventName, detail = {}) {
      this.coreLogger.debug(`Triggering event: ${eventName}`);
      const eventData = { ...detail, timestamp: Date.now(), client: this };
      const event = new CustomEvent(`os:${eventName}`, { bubbles: true, cancelable: true, detail: eventData });
      document.dispatchEvent(event);
      return event;
    }
    getCampaignData() {
      return __privateGet(this, _campaignData);
    }
    get isInitialized() {
      return __privateGet(this, _isInitialized2);
    }
    get isCheckoutPage() {
      return __privateGet(this, _isCheckoutPage);
    }
    debugTriggerViewItemList() {
      /* @__PURE__ */ console.log("🛠️ Manually triggering view_item_list event");
      if (!__privateGet(this, _campaignData)) {
        console.error("❌ No campaign data available");
        return { success: false, message: "No campaign data" };
      }
      if (!this.events.viewItemList) {
        console.error("❌ events.viewItemList not available");
        return { success: false, message: "Event manager not initialized" };
      }
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({ ecommerce: null });
      this.events.viewItemList(__privateGet(this, _campaignData));
      /* @__PURE__ */ console.log("✅ view_item_list manually triggered");
      return { success: true, message: "view_item_list event triggered", campaignData: __privateGet(this, _campaignData) };
    }
    isReady() {
      return __privateGet(this, _isInitialized2) && __privateGet(this, _campaignData) !== null && Array.isArray(__privateGet(this, _campaignData).packages);
    }
    onReady(callback) {
      if (!callback || typeof callback !== "function")
        return this;
      if (this.isReady()) {
        try {
          callback(this);
        } catch (error) {
          this.coreLogger.error("Error in onReady callback:", error);
        }
      } else {
        this.once("initialized", () => {
          if (this.isReady())
            callback(this);
        });
      }
      return this;
    }
  };
  _isInitialized2 = new WeakMap();
  _isCheckoutPage = new WeakMap();
  _campaignData = new WeakMap();
  _loadConfig2 = new WeakSet();
  loadConfig_fn2 = function() {
    const config = { apiKey: null, campaignId: null, debug: this.options.debug };
    const apiKeyMeta = document.querySelector('meta[name="os-api-key"]');
    config.apiKey = apiKeyMeta?.getAttribute("content") ?? null;
    this.coreLogger.info(`API key: ${config.apiKey ? "✓ Set" : "✗ Not set"}`);
    const campaignIdMeta = document.querySelector('meta[name="os-campaign-id"]');
    config.campaignId = campaignIdMeta?.getAttribute("content") ?? null;
    this.coreLogger.info(`Campaign ID: ${config.campaignId ? "✓ Set" : "✗ Not set"}`);
    const debugMeta = document.querySelector('meta[name="os-debug"]');
    if (debugMeta?.getAttribute("content") === "true") {
      config.debug = true;
      this.logger.setDebug(true);
      this.coreLogger.info("Debug mode: ✓ Enabled");
    }
    __privateMethod(this, _initSpreedlyConfig, initSpreedlyConfig_fn).call(this);
    return config;
  };
  _initSpreedlyConfig = new WeakSet();
  initSpreedlyConfig_fn = function() {
    window.osConfig = window.osConfig || {};
    if (!window.osConfig.spreedlyConfig) {
      this.coreLogger.debug("Initializing default Spreedly configuration");
      window.osConfig.spreedlyConfig = {
        fieldType: {
          number: "text",
          cvv: "text"
        },
        numberFormat: "prettyFormat",
        placeholder: {
          number: "Credit Card Number",
          cvv: "CVV *"
        },
        labels: {
          number: "Card Number",
          cvv: "CVV"
        }
        // Other properties will use defaults from SpreedlyManager
      };
    } else {
      this.coreLogger.info("Found custom Spreedly configuration");
    }
  };
  _loadGoogleMapsApi = new WeakSet();
  loadGoogleMapsApi_fn = async function() {
    if (!this.options.enableGoogleMapsAutocomplete) {
      this.coreLogger.debug("Google Maps Autocomplete is disabled in configuration");
      return;
    }
    if (typeof google !== "undefined" && typeof google.maps !== "undefined") {
      this.coreLogger.debug("Google Maps API already loaded");
      return;
    }
    this.coreLogger.debug("Loading Google Maps API...");
    return new Promise((resolve) => {
      const script = document.createElement("script");
      const regionParam = this.options.googleMapsRegion ? `&region=${this.options.googleMapsRegion}` : "";
      script.src = `https://maps.googleapis.com/maps/api/js?key=${this.options.googleMapsApiKey}&libraries=places${regionParam}`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        this.coreLogger.debug("Google Maps API loaded successfully");
        resolve();
      };
      script.onerror = () => {
        this.coreLogger.error("Failed to load Google Maps API");
        resolve();
      };
      document.head.appendChild(script);
    });
  };
  _fetchCampaignData = new WeakSet();
  fetchCampaignData_fn = async function() {
    try {
      this.coreLogger.info("Fetching campaign data...");
      __privateSet(this, _campaignData, await this.api.getCampaign());
      __privateSet(this, _campaignData, __privateGet(this, _campaignData) || { packages: [] });
      __privateGet(this, _campaignData).packages = __privateGet(this, _campaignData).packages || [];
      this.campaignData = __privateGet(this, _campaignData);
      this.coreLogger.info("Campaign data retrieved successfully");
      window.osConfig = window.osConfig || {};
      window.osConfig.campaign = __privateGet(this, _campaignData);
      window.dataLayer = window.dataLayer || [];
      if (__privateGet(this, _campaignData).name && this.attribution) {
        const funnelMetaTag = document.querySelector('meta[name="os-tracking-tag"][data-tag-name="funnel_name"]');
        const funnelName = funnelMetaTag?.getAttribute("data-tag-value") || __privateGet(this, _campaignData).name;
        this.attribution.setFunnelName(funnelName);
      }
      this.triggerEvent("campaign.loaded", { campaign: __privateGet(this, _campaignData) });
    } catch (error) {
      this.coreLogger.error("Failed to retrieve campaign data:", error);
      __privateSet(this, _campaignData, {
        name: "Default Campaign",
        packages: [],
        currency: "USD",
        locale: "en-US"
      });
      this.campaignData = __privateGet(this, _campaignData);
    }
  };
  _initializeManagers = new WeakSet();
  initializeManagers_fn = function() {
    this.selector = new SelectorManager(this);
    this.toggle = new ToggleManager(this);
    this.timer = new TimerManager(this);
    this.display = new DisplayManager(this);
    this.eventManager = new EventManager(this);
    this.tooltip = new TooltipManager(this);
    if (__privateGet(this, _isCheckoutPage) || document.querySelector('[data-os-cart="line-display"]') || document.querySelector('[os-cart="checkout-summary"]') || document.querySelector('[data-os-cart-summary="grand-total"]')) {
      this.coreLogger.info("Cart display elements detected, initializing CartDisplayManager");
      this.cartDisplay = new CartDisplayManager(this);
    }
    this.debug = new DebugManager(this);
    Object.assign(this.events, {
      emit: (event, data) => this.triggerEvent(event, data),
      viewItemList: (data) => this.eventManager.viewItemList(data || __privateGet(this, _campaignData)),
      viewItem: (packageData) => this.eventManager.viewItem(packageData),
      addToCart: (cartData) => this.eventManager.addToCart(cartData),
      beginCheckout: () => this.eventManager.beginCheckout(),
      purchase: (orderData, force) => this.eventManager.purchase(orderData, force),
      fireCustomEvent: (eventName, eventData) => this.eventManager.fireCustomEvent(eventName, eventData)
    });
  };
  _finalizeInitialization = new WeakSet();
  finalizeInitialization_fn = async function() {
    this.events.viewItemList(__privateGet(this, _campaignData));
    await new Promise((resolve) => setTimeout(resolve, 800));
    __privateMethod(this, _hidePreloader, hidePreloader_fn).call(this);
  };
  _hidePreloader = new WeakSet();
  hidePreloader_fn = function() {
    const preloader = document.querySelector('div[os-element="preloader"]');
    if (preloader) {
      this.coreLogger.info("Hiding preloader element");
      preloader.style.transition = "opacity 0.5s ease";
      preloader.style.opacity = "0";
      preloader.style.pointerEvents = "none";
      this.coreLogger.debug("Preloader hidden");
    }
  };
  _detectCheckoutPage = new WeakSet();
  detectCheckoutPage_fn = function() {
    const pageTypeMeta = document.querySelector('meta[name="os-page-type"]');
    const pageType = pageTypeMeta?.getAttribute("content");
    if (pageType === "checkout" || !pageType && document.querySelector('form[os-checkout="form"]')) {
      this.coreLogger.info("Checkout page detected");
      return true;
    }
    if (pageType === "receipt") {
      this.coreLogger.info("Receipt page detected");
      __privateMethod(this, _initReceiptPage, initReceiptPage_fn).call(this);
    }
    if (pageType === "upsell" || document.querySelector("[data-os-upsell]")) {
      this.coreLogger.info("Upsell page detected");
      __privateMethod(this, _initUpsellPage, initUpsellPage_fn).call(this);
    }
    return false;
  };
  _initCheckoutPage = new WeakSet();
  initCheckoutPage_fn = function() {
    this.checkout = new CheckoutPage(this.api, this.coreLogger, this);
  };
  _initReceiptPage = new WeakSet();
  initReceiptPage_fn = function() {
    Promise.resolve().then(() => (init_ReceiptPage(), ReceiptPage_exports)).then((module) => {
      const ReceiptPage2 = module.ReceiptPage;
      this.receipt = new ReceiptPage2(this.api, this.coreLogger, this);
      this.coreLogger.info("Receipt page initialized");
      const refId = new URLSearchParams(window.location.search).get("ref_id");
      if (refId) {
        this.api.getOrder(refId).then((orderData) => {
          if (orderData)
            this.triggerEvent("order.loaded", { order: orderData });
        }).catch((error) => this.coreLogger.error("Failed to load order data:", error));
      }
    }).catch((error) => this.coreLogger.error("Failed to load ReceiptPage module:", error));
  };
  _initUpsellPage = new WeakSet();
  initUpsellPage_fn = function() {
    this.coreLogger.info("Initializing upsell page");
    if (!this.upsell) {
      this.upsell = new UpsellManager(this);
      this.coreLogger.info("UpsellManager initialized for upsell page");
    }
    this.triggerEvent("upsell.pageview", {
      ref_id: new URLSearchParams(window.location.search).get("ref_id") || sessionStorage.getItem("order_ref_id")
    });
  };
  _initUIUtilities = new WeakSet();
  initUIUtilities_fn = function() {
    this.coreLogger.info("Initializing UI utilities");
    try {
      const accordion = initPBAccordion();
      if (accordion) {
        this.pbAccordion = accordion;
        this.coreLogger.info("PBAccordion initialized");
      }
    } catch (error) {
      this.coreLogger.error("Failed to initialize PBAccordion:", error);
    }
    try {
      const utmTransfer = initUtmTransfer();
      if (utmTransfer) {
        this.utmTransfer = utmTransfer;
        this.coreLogger.info("UTM parameter transfer initialized");
      }
    } catch (error) {
      this.coreLogger.error("Failed to initialize UTM transfer:", error);
    }
  };

  // src/index.js
  var initialize = () => {
    try {
      if (document.querySelector('meta[name="os-disable-auto-init"]')) {
        /* @__PURE__ */ console.log("29next Client: Auto-initialization disabled");
        return;
      }
      const config = {
        apiKey: document.querySelector('meta[name="os-api-key"]')?.getAttribute("content") ?? null,
        campaignId: document.querySelector('meta[name="os-campaign-id"]')?.getAttribute("content") ?? null,
        debug: document.querySelector('meta[name="os-debug"]')?.getAttribute("content") === "true",
        paypalClientId: document.querySelector('meta[name="os-paypal-client-id"]')?.getAttribute("content") ?? null
      };
      /* @__PURE__ */ console.log(
        "29next Client: Initializing with config",
        JSON.stringify({
          apiKey: config.apiKey ? "✓ Set" : "✗ Not set",
          campaignId: config.campaignId ? "✓ Set" : "✗ Not set",
          debug: config.debug
        })
      );
      window.on29NextReady = Array.isArray(window.on29NextReady) ? window.on29NextReady : [];
      const callbacks = [...window.on29NextReady];
      window.twentyNineNext = new TwentyNineNext(config);
      callbacks.forEach((callback) => {
        window.twentyNineNext.onReady(callback);
      });
      window.on29NextReady = {
        push: (callback) => window.twentyNineNext.onReady(callback)
      };
    } catch (error) {
      console.error("29next Client: Error during initialization", error);
    }
  };
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialize);
  } else {
    initialize();
  }
  return __toCommonJS(src_exports);
})();
