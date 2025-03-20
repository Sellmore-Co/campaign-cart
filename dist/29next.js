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
  var _apiClient3, _logger23, _app17, _orderData, _orderFetched, _initialized3, _debugMode5, _safeLog3, safeLog_fn3, _fetchOrderDetails, fetchOrderDetails_fn, _updateReceiptContent, updateReceiptContent_fn, _determinePaymentMethod, determinePaymentMethod_fn, _updateOrderLines, updateOrderLines_fn, _updateElement, updateElement_fn, _updateElementInNode, updateElementInNode_fn, _formatAddress2, formatAddress_fn2, _formatLocation, formatLocation_fn, _getCountryName, getCountryName_fn, _formatPaymentMethod, formatPaymentMethod_fn, _formatCurrency, formatCurrency_fn, _showError2, showError_fn2, ReceiptPage;
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
          __privateAdd(this, _showError2);
          __privateAdd(this, _apiClient3, void 0);
          __privateAdd(this, _logger23, void 0);
          __privateAdd(this, _app17, void 0);
          __privateAdd(this, _orderData, null);
          __privateAdd(this, _orderFetched, false);
          // Flag to prevent duplicate API calls
          __privateAdd(this, _initialized3, false);
          // Flag to prevent duplicate initialization
          __privateAdd(this, _debugMode5, false);
          __privateSet(this, _apiClient3, apiClient);
          __privateSet(this, _logger23, logger);
          __privateSet(this, _app17, app);
          const debugMeta = document.querySelector('meta[name="os-debug"]');
          __privateSet(this, _debugMode5, debugMeta?.getAttribute("content") === "true");
          __privateMethod(this, _safeLog3, safeLog_fn3).call(this, "info", "ReceiptPage component created");
          this.init();
        }
        /**
         * Initialize the receipt page
         */
        async init() {
          if (__privateGet(this, _initialized3)) {
            __privateMethod(this, _safeLog3, safeLog_fn3).call(this, "info", "Receipt page already initialized, skipping");
            return;
          }
          __privateMethod(this, _safeLog3, safeLog_fn3).call(this, "info", "Initializing Receipt Page");
          __privateSet(this, _initialized3, true);
          const urlParams = new URLSearchParams(window.location.search);
          const refId = urlParams.get("ref_id");
          if (!refId) {
            __privateMethod(this, _safeLog3, safeLog_fn3).call(this, "error", "No ref_id found in URL parameters");
            __privateMethod(this, _showError2, showError_fn2).call(this, "Order reference not found. Please check your URL.");
            return;
          }
          __privateMethod(this, _safeLog3, safeLog_fn3).call(this, "info", `Found ref_id in URL: ${refId}`);
          try {
            await __privateMethod(this, _fetchOrderDetails, fetchOrderDetails_fn).call(this, refId);
            __privateMethod(this, _updateReceiptContent, updateReceiptContent_fn).call(this);
          } catch (error) {
            __privateMethod(this, _safeLog3, safeLog_fn3).call(this, "error", "Error initializing receipt page:", error);
            __privateMethod(this, _showError2, showError_fn2).call(this, "Failed to load order details. Please try again later.");
          }
        }
      };
      _apiClient3 = new WeakMap();
      _logger23 = new WeakMap();
      _app17 = new WeakMap();
      _orderData = new WeakMap();
      _orderFetched = new WeakMap();
      _initialized3 = new WeakMap();
      _debugMode5 = new WeakMap();
      _safeLog3 = new WeakSet();
      safeLog_fn3 = function(level, message, ...args) {
        try {
          if (__privateGet(this, _logger23) && typeof __privateGet(this, _logger23)[level] === "function") {
            __privateGet(this, _logger23)[level](message, ...args);
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
      _showError2 = new WeakSet();
      showError_fn2 = function(message) {
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
      return this.createOrder(orderData);
    }
    getNextUrlFromOrderResponse(orderResponse, defaultPath = "/checkout/complete") {
      __privateGet(this, _logger).debug("Getting next URL for redirect");
      const refId = orderResponse.ref_id;
      const nextPageMeta = document.querySelector('meta[name="os-next-page"]');
      let defaultUrl = defaultPath;
      if (nextPageMeta?.getAttribute("content")) {
        const nextPagePath = nextPageMeta.getAttribute("content");
        __privateGet(this, _logger).debug(`Found meta tag with next page URL: ${nextPagePath}`);
        const redirectUrl = nextPagePath.startsWith("http") ? new URL(nextPagePath) : new URL(nextPagePath, `${location.protocol}//${location.host}`);
        if (refId)
          redirectUrl.searchParams.append("ref_id", refId);
        return redirectUrl.href;
      }
      if (orderResponse.payment_complete_url)
        return orderResponse.payment_complete_url;
      if (orderResponse.order_status_url)
        return orderResponse.order_status_url;
      const currentPath = location.pathname.split("/");
      const basePath = currentPath.slice(0, -1).join("/");
      const defaultFullUrl = new URL(`${basePath}${defaultUrl}`, `${location.protocol}//${location.host}`);
      if (refId)
        defaultFullUrl.searchParams.append("ref_id", refId);
      return defaultFullUrl.href;
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
  var _logger3, _form2, _validationErrors, _debugMode, _spreedlyEnabled, _spreedlyFieldsValid, _spreedlyReady, _getFormElement, getFormElement_fn, _safeLog, safeLog_fn, _setupListeners, setupListeners_fn, _setupSpreedlyListeners, setupSpreedlyListeners_fn, _handleSpreedlyError, handleSpreedlyError_fn, _handleSubmit, handleSubmit_fn, _logValidationStart, logValidationStart_fn, _validateFields, validateFields_fn, _shouldSkipField, shouldSkipField_fn, _validateCreditCardExpiryFields, validateCreditCardExpiryFields_fn, _getExpiryFields, getExpiryFields_fn, _validateExpiryField, validateExpiryField_fn, _clearSpreedlyErrors, clearSpreedlyErrors_fn, _validateField, validateField_fn, _getFieldValidation, getFieldValidation_fn, _showError, showError_fn, _getOrCreateErrorElement, getOrCreateErrorElement_fn, _scrollToError, scrollToError_fn, _isValidEmail, isValidEmail_fn;
  var FormValidator = class {
    constructor(options = {}) {
      __privateAdd(this, _getFormElement);
      __privateAdd(this, _safeLog);
      __privateAdd(this, _setupListeners);
      __privateAdd(this, _setupSpreedlyListeners);
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
      __privateAdd(this, _getFieldValidation);
      __privateAdd(this, _showError);
      __privateAdd(this, _getOrCreateErrorElement);
      __privateAdd(this, _scrollToError);
      __privateAdd(this, _isValidEmail);
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
      const requiredFields = Array.from(document.querySelectorAll('[os-checkout-validate="required"]'));
      const firstErrorField = __privateMethod(this, _validateFields, validateFields_fn).call(this, requiredFields, isCreditCard);
      if (isCreditCard && __privateGet(this, _spreedlyEnabled) && !firstErrorField) {
        if (!__privateMethod(this, _validateCreditCardExpiryFields, validateCreditCardExpiryFields_fn).call(this))
          return false;
      }
      if (firstErrorField) {
        __privateMethod(this, _scrollToError, scrollToError_fn).call(this, firstErrorField);
        return false;
      }
      return true;
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
        if (result.valid)
          this.clearErrorForField(document.getElementById(`spreedly-${result.fieldType}`));
      },
      "errors": (errors) => {
        __privateMethod(this, _safeLog, safeLog_fn).call(this, "debug", "Spreedly validation errors:", errors);
        errors.forEach((error) => __privateMethod(this, _handleSpreedlyError, handleSpreedlyError_fn).call(this, error));
      }
    };
    Object.entries(listeners).forEach(([event, handler]) => Spreedly.on(event, handler));
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
    const validation = __privateMethod(this, _getFieldValidation, getFieldValidation_fn).call(this, field, value, label);
    if (!validation.isValid) {
      __privateMethod(this, _showError, showError_fn).call(this, field, validation.errorMessage);
    } else {
      this.clearErrorForField(field);
    }
    return validation.isValid;
  };
  _getFieldValidation = new WeakSet();
  getFieldValidation_fn = function(field, value, label) {
    const tag = field.tagName.toLowerCase();
    if (tag === "select")
      return {
        isValid: !!value,
        errorMessage: `Please select a ${label.toLowerCase()}`
      };
    if (!value)
      return { isValid: false, errorMessage: `${label} is required` };
    if (field.type === "tel" && field.iti)
      return {
        isValid: field.iti.isValidNumber(),
        errorMessage: "Please enter a valid phone number"
      };
    if (field.type === "email")
      return {
        isValid: __privateMethod(this, _isValidEmail, isValidEmail_fn).call(this, value),
        errorMessage: "Please enter a valid email address"
      };
    return { isValid: true, errorMessage: "" };
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

  // src/utils/SpreedlyManager.js
  var _environmentKey, _debugMode2, _isReady, _onReadyCallback, _onErrorCallback, _onPaymentMethodCallback, _onValidationCallback, _initialize, initialize_fn, _loadScript, loadScript_fn, _setupSpreedly, setupSpreedly_fn, _prepareHtmlStructure, prepareHtmlStructure_fn, _setupEventListeners, setupEventListeners_fn, _showErrors, showErrors_fn, _clearFieldError, clearFieldError_fn, _log, log_fn;
  var SpreedlyManager = class {
    /**
     * Create a new SpreedlyManager
     * @param {string} environmentKey - The Spreedly environment key
     * @param {Object} options - Configuration options
     * @param {boolean} options.debug - Enable debug mode
     */
    constructor(environmentKey, options = {}) {
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
       * Prepare the HTML structure for the iframe fields
       * This creates the containers for the iframe fields and hides the original inputs
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
      __privateSet(this, _environmentKey, environmentKey);
      __privateSet(this, _debugMode2, options.debug || false);
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
      const style = 'color: #212529; font-size: 1rem; line-height: 1.5; font-weight: 400;       width: calc(100% - 20px); height: calc(100% - 2px); position: absolute;       font-family: system-ui,-apple-system,"Segoe UI",Roboto,"Helvetica Neue","Noto Sans","Liberation Sans",Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol","Noto Color Emoji";';
      Spreedly.on("ready", () => {
        __privateMethod(this, _log, log_fn).call(this, "debug", "Spreedly iframe ready");
        Spreedly.setFieldType("text");
        Spreedly.setPlaceholder("cvv", "CVV *");
        Spreedly.setPlaceholder("number", "Credit Card Number");
        Spreedly.setNumberFormat("prettyFormat");
        Spreedly.setStyle("cvv", style);
        Spreedly.setStyle("number", style);
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
      const numberContainer = numberField.closest(".frm-flds");
      const cvvContainer = cvvField.closest(".frm-flds");
      if (numberContainer && cvvContainer) {
        numberField.style.display = "none";
        cvvField.style.display = "none";
        const numberDiv = document.createElement("div");
        numberDiv.id = "spreedly-number";
        numberDiv.className = "input-flds spreedly-field";
        numberContainer.appendChild(numberDiv);
        const cvvDiv = document.createElement("div");
        cvvDiv.id = "spreedly-cvv";
        cvvDiv.className = "input-flds spreedly-field";
        cvvContainer.appendChild(cvvDiv);
        const styleSheet = document.createElement("style");
        styleSheet.textContent = `
          .spreedly-field {
            position: relative;
            overflow: hidden;
          }
        `;
        document.head.appendChild(styleSheet);
      } else {
        __privateMethod(this, _log, log_fn).call(this, "error", "Could not find credit card field containers");
      }
      __privateMethod(this, _log, log_fn).call(this, "debug", "HTML structure prepared for Spreedly iframe fields");
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
      let container = null;
      if (fieldType === "number" || fieldType === "card_number") {
        container = document.getElementById("spreedly-number");
      } else if (fieldType === "cvv") {
        container = document.getElementById("spreedly-cvv");
      } else if (fieldType === "month" || fieldType === "year") {
        container = document.querySelector(`[os-checkout-field="cc-${fieldType}"]`) || document.querySelector(`[os-checkout-field="exp-${fieldType}"]`) || document.querySelector(`#credit_card_exp_${fieldType}`);
      } else if (fieldType === "full_name" || fieldType === "first_name" || fieldType === "last_name") {
        container = document.querySelector('[os-checkout-field="cc-name"]');
      }
      if (container) {
        container.classList.add("error");
        const wrapper = container.closest(".frm-flds") || container.parentElement;
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
    let container = null;
    if (fieldType === "number" || fieldType === "card_number") {
      container = document.getElementById("spreedly-number");
    } else if (fieldType === "cvv") {
      container = document.getElementById("spreedly-cvv");
    }
    if (container) {
      container.classList.remove("error");
      const wrapper = container.closest(".frm-flds") || container.parentElement;
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
  var _apiClient, _logger5, _app2, _form3, _spreedlyManager, _formValidator, _paymentMethod, _isProcessing, _debugMode3, _testCards, _getCheckoutForm, getCheckoutForm_fn, _setupFormPrevention, setupFormPrevention_fn, _preventFormSubmission, preventFormSubmission_fn, _convertSubmitButtons, convertSubmitButtons_fn, _setupCheckoutButton, setupCheckoutButton_fn, _safeLog2, safeLog_fn2, _initPaymentMethods, initPaymentMethods_fn, _setupPaymentMethodListeners, setupPaymentMethodListeners_fn, _initSpreedly, initSpreedly_fn, _setupSpreedlyCallbacks, setupSpreedlyCallbacks_fn, _formatSpreedlyErrors, formatSpreedlyErrors_fn, _initializeExpirationFields, initializeExpirationFields_fn, _getExpirationElements, getExpirationElements_fn, _populateExpirationOptions, populateExpirationOptions_fn, _isTestMode, isTestMode_fn, _enforceFormPrevention, enforceFormPrevention_fn, _showProcessingState, showProcessingState_fn, _hideProcessingState, hideProcessingState_fn, _processCreditCard, processCreditCard_fn, _getCreditCardFields, getCreditCardFields_fn, _isDebugTestCardMode, isDebugTestCardMode_fn, _processTestCard, processTestCard_fn, _processPaypal, processPaypal_fn, _getPackageIdFromUrl, getPackageIdFromUrl_fn, _getOrderData, getOrderData_fn, _getAddressData, getAddressData_fn, _formatAddress, formatAddress_fn, _getShippingMethod, getShippingMethod_fn, _getCartLines, getCartLines_fn, _createOrder, createOrder_fn, _formatOrderData, formatOrderData_fn, _formatErrorMessage, formatErrorMessage_fn, _formatPaymentErrorMessage, formatPaymentErrorMessage_fn, _handlePaymentError, handlePaymentError_fn, _displayCreditCardError, displayCreditCardError_fn, _clearPaymentErrors, clearPaymentErrors_fn, _handleOrderSuccess, handleOrderSuccess_fn, _getRedirectUrl, getRedirectUrl_fn;
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
      __privateAdd(this, _apiClient, void 0);
      __privateAdd(this, _logger5, void 0);
      __privateAdd(this, _app2, void 0);
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
      __privateSet(this, _apiClient, apiClient);
      __privateSet(this, _logger5, logger);
      __privateSet(this, _app2, app);
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
        if (isKonamiMode || __privateMethod(this, _isTestMode, isTestMode_fn).call(this)) {
          __privateMethod(this, _showProcessingState, showProcessingState_fn).call(this);
          const orderData2 = isKonamiMode ? KonamiCodeHandler.getTestOrderData(
            __privateGet(this, _app2)?.state?.getState(),
            __privateMethod(this, _getPackageIdFromUrl, getPackageIdFromUrl_fn).bind(this),
            __privateMethod(this, _getCartLines, getCartLines_fn).bind(this)
          ) : __privateMethod(this, _getOrderData, getOrderData_fn).call(this);
          if (!orderData2) {
            __privateMethod(this, _hideProcessingState, hideProcessingState_fn).call(this);
            return;
          }
          __privateMethod(this, _createOrder, createOrder_fn).call(this, {
            ...orderData2,
            payment_detail: {
              payment_method: "card_token",
              card_token: "test_card"
              // Use the same token as test=true for consistency
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
  };
  _apiClient = new WeakMap();
  _logger5 = new WeakMap();
  _app2 = new WeakMap();
  _form3 = new WeakMap();
  _spreedlyManager = new WeakMap();
  _formValidator = new WeakMap();
  _paymentMethod = new WeakMap();
  _isProcessing = new WeakMap();
  _debugMode3 = new WeakMap();
  _testCards = new WeakMap();
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
      __privateSet(this, _spreedlyManager, new SpreedlyManager(environmentKey, { debug: __privateGet(this, _debugMode3) }));
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
    if (!month || !year) {
      __privateMethod(this, _handlePaymentError, handlePaymentError_fn).call(this, "Please select expiration month and year");
      return;
    }
    if (__privateMethod(this, _isDebugTestCardMode, isDebugTestCardMode_fn).call(this)) {
      __privateMethod(this, _processTestCard, processTestCard_fn).call(this, fullName, month, year);
    } else {
      __privateGet(this, _spreedlyManager).tokenizeCard({ full_name: fullName || "Test User", month, year });
    }
  };
  _getCreditCardFields = new WeakSet();
  getCreditCardFields_fn = function() {
    return [
      document.querySelector('[os-checkout-field="cc-name"]')?.value || "",
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
    const testCardType = new URLSearchParams(window.location.search).get("test-card");
    const testCard = __privateGet(this, _testCards)[testCardType];
    if (testCard) {
      __privateMethod(this, _createOrder, createOrder_fn).call(this, {
        payment_token: `test_card_token_${testCardType}_${Date.now()}`,
        payment_method: "credit-card",
        test_card_type: testCardType,
        test_card_number: testCard,
        ...__privateMethod(this, _getOrderData, getOrderData_fn).call(this)
      });
    }
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
      if (!__privateGet(this, _app2)?.state) {
        __privateMethod(this, _handlePaymentError, handlePaymentError_fn).call(this, "Cart data missing");
        return null;
      }
      const state = __privateGet(this, _app2).state.getState();
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
      return { package_id: packageId, quantity: item.quantity || 1 };
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
    const formatted = { ...orderData, success_url: orderData.success_url || window.location.origin + "/checkout/confirmation/" };
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
    const errorContainer = document.querySelector('[os-checkout-element="payment-error"]');
    if (errorContainer) {
      errorContainer.textContent = message;
      errorContainer.style.display = "block";
      errorContainer.scrollIntoView({ behavior: "smooth", block: "center" });
    } else {
      alert(`Payment Error: ${message}`);
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
    __privateGet(this, _app2)?.triggerEvent?.("order.created", orderData);
    const redirectUrl = __privateMethod(this, _getRedirectUrl, getRedirectUrl_fn).call(this, orderData);
    window.location.href = redirectUrl;
  };
  _getRedirectUrl = new WeakSet();
  getRedirectUrl_fn = function(orderData) {
    const metaUrl = document.querySelector('meta[name="os-next-page"]')?.content;
    if (metaUrl)
      return `${metaUrl}${metaUrl.includes("?") ? "&" : "?"}ref_id=${orderData.ref_id}`;
    return orderData.confirmation_url || orderData.order_status_url || `/checkout/confirmation/?ref_id=${orderData.ref_id}`;
  };

  // src/components/checkout/BillingAddressHandler.js
  var _app3, _logger6, _sameAsShippingCheckbox, _billingFormContainer, _shippingFields, _billingFields, _fieldMap, _isTransitioning, _lastState, _init2, init_fn2, _logDebug, logDebug_fn, _logInfo, logInfo_fn, _logWarn, logWarn_fn, _logError, logError_fn, _cacheFieldElements, cacheFieldElements_fn, _setupEventListeners2, setupEventListeners_fn2, _toggleBillingForm, toggleBillingForm_fn, _updateBillingFormVisibility, updateBillingFormVisibility_fn;
  var BillingAddressHandler = class {
    constructor(app) {
      __privateAdd(this, _init2);
      // Safe logging methods that check if the method exists before calling
      __privateAdd(this, _logDebug);
      __privateAdd(this, _logInfo);
      __privateAdd(this, _logWarn);
      __privateAdd(this, _logError);
      __privateAdd(this, _cacheFieldElements);
      __privateAdd(this, _setupEventListeners2);
      __privateAdd(this, _toggleBillingForm);
      // Deprecated method - use #toggleBillingForm instead
      __privateAdd(this, _updateBillingFormVisibility);
      __privateAdd(this, _app3, void 0);
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
      __privateSet(this, _app3, app);
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
  _app3 = new WeakMap();
  _logger6 = new WeakMap();
  _sameAsShippingCheckbox = new WeakMap();
  _billingFormContainer = new WeakMap();
  _shippingFields = new WeakMap();
  _billingFields = new WeakMap();
  _fieldMap = new WeakMap();
  _isTransitioning = new WeakMap();
  _lastState = new WeakMap();
  _init2 = new WeakSet();
  init_fn2 = function() {
    try {
      __privateSet(this, _sameAsShippingCheckbox, document.querySelector('[os-checkout-field="same-as-shipping"]') || document.querySelector('[name="use_shipping_address"]') || document.querySelector("#use_shipping_address"));
      __privateSet(this, _billingFormContainer, document.querySelector('[os-checkout-element="different-billing-address"]'));
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
  var _logger8, _fieldsShown, _elements2, _init4, init_fn4, _hideLocationFields, hideLocationFields_fn, _showLocationFields, showLocationFields_fn, _isGoogleMapsAvailable, isGoogleMapsAvailable_fn, _initAutocompleteWithRetry, initAutocompleteWithRetry_fn, _initializeAutocomplete, initializeAutocomplete_fn, _setupAutocomplete, setupAutocomplete_fn, _setStateWithRetry, setStateWithRetry_fn, _setupBasicFieldListeners, setupBasicFieldListeners_fn, _setupAutofillDetection, setupAutofillDetection_fn;
  var AddressAutocomplete = class {
    constructor(logger) {
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
      __privateSet(this, _logger8, logger);
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
      __privateGet(this, _logger8).info("AddressAutocomplete initialized");
      __privateMethod(this, _hideLocationFields, hideLocationFields_fn).call(this);
      __privateMethod(this, _init4, init_fn4).call(this);
    }
  };
  _logger8 = new WeakMap();
  _fieldsShown = new WeakMap();
  _elements2 = new WeakMap();
  _init4 = new WeakSet();
  init_fn4 = async function() {
    __privateMethod(this, _setupAutofillDetection, setupAutofillDetection_fn).call(this);
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
  var _logger9, _intlTelInputAvailable, _loadIntlTelInput, loadIntlTelInput_fn, _initPhoneInputs, initPhoneInputs_fn, _initializePhoneInput, initializePhoneInput_fn, _setupPhoneInputSync, setupPhoneInputSync_fn, _setupPhoneValidation, setupPhoneValidation_fn;
  var PhoneInputHandler = class {
    constructor(logger) {
      __privateAdd(this, _loadIntlTelInput);
      __privateAdd(this, _initPhoneInputs);
      __privateAdd(this, _initializePhoneInput);
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
        preferredCountries: ["us", "gb", "ca", "au"],
        dropdownContainer: document.body,
        useFullscreenPopup: true,
        formatOnDisplay: true,
        autoPlaceholder: "aggressive",
        customContainer: "iti-tel-input"
      });
      input.iti = iti;
      __privateGet(this, _logger9).debug(`Phone input ${index} (${input.getAttribute("os-checkout-field") ?? "unknown"}) initialized`);
      __privateMethod(this, _setupPhoneInputSync, setupPhoneInputSync_fn).call(this, input, iti);
      __privateMethod(this, _setupPhoneValidation, setupPhoneValidation_fn).call(this, input, iti);
    } catch (error) {
      __privateGet(this, _logger9).error(`Error initializing phone input ${index}:`, error);
    }
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
    countrySelect.addEventListener("change", () => {
      const countryCode = countrySelect.value?.toLowerCase();
      if (countryCode) {
        iti.setCountry(countryCode);
        __privateGet(this, _logger9).debug(`Country select updated phone to ${countryCode}`);
      }
    });
    input.addEventListener("countrychange", () => {
      const { iso2 } = iti.getSelectedCountryData() ?? {};
      if (iso2) {
        countrySelect.value = iso2.toUpperCase();
        countrySelect.dispatchEvent(new Event("change", { bubbles: true }));
        __privateGet(this, _logger9).debug(`Phone country updated select to ${iso2}`);
      } else {
        __privateGet(this, _logger9).warn("Invalid country data from phone input");
      }
    });
    if (countrySelect.value)
      iti.setCountry(countrySelect.value.toLowerCase());
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
  var _app4, _logger10, _initialized, _cartCreated, _cartAttempted, _beginCheckoutFired, _debounceTimeout, _debounceDelay, _lastFormData, _selectors, _fields, _emailRegex, _init5, init_fn5, _findFormFields, findFormFields_fn, _attachEventListeners, attachEventListeners_fn, _handleFieldChange, handleFieldChange_fn, _checkAndFireBeginCheckout, checkAndFireBeginCheckout_fn, _checkAndCreateCart, checkAndCreateCart_fn, _hasMinimumRequiredFields, hasMinimumRequiredFields_fn, _getFormData, getFormData_fn, _isSameFormData, isSameFormData_fn, _createProspectCart, createProspectCart_fn, _updateUserState, updateUserState_fn, _isAddressValid, isAddressValid_fn, _getValidAddressData, getValidAddressData_fn, _isValidPostalCode, isValidPostalCode_fn, _getPhoneNumber, getPhoneNumber_fn, _createCartViaApi, createCartViaApi_fn;
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
      __privateAdd(this, _app4, void 0);
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
      __privateSet(this, _app4, app);
      if (__privateGet(this, _app4) && __privateGet(this, _app4).logger) {
        __privateSet(this, _logger10, __privateGet(this, _app4).logger.createModuleLogger("PROSPECT"));
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
      if (__privateGet(this, _app4) && __privateGet(this, _app4).events) {
        if (!__privateGet(this, _beginCheckoutFired)) {
          __privateGet(this, _logger10).info("Manually triggering beginCheckout event");
          __privateGet(this, _app4).events.beginCheckout();
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
  _app4 = new WeakMap();
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
      if (__privateGet(this, _app4).events) {
        __privateGet(this, _app4).events.beginCheckout();
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
    const cartData = __privateGet(this, _app4).state.getState("cart");
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
      lines: cartData.items.map((item) => ({
        package_id: item.id,
        quantity: item.quantity || 1
      })),
      user: {
        first_name: firstName,
        last_name: lastName,
        email,
        phone_number: phone
      },
      attribution: attributionData
    };
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
    if (!__privateGet(this, _app4).state) {
      __privateGet(this, _logger10).warn("State manager not available, cannot update user state");
      return;
    }
    try {
      const currentUser = __privateGet(this, _app4).state.getState("user") || {};
      const updatedUser = {
        ...currentUser,
        email: email || currentUser.email,
        firstName: firstName || currentUser.firstName,
        lastName: lastName || currentUser.lastName,
        phone: phone || currentUser.phone
      };
      __privateGet(this, _app4).state.setState("user", updatedUser);
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
      return __privateGet(this, _fields).phone.iti.getNumber();
    }
    return __privateGet(this, _fields).phone.value;
  };
  _createCartViaApi = new WeakSet();
  createCartViaApi_fn = function(cartData) {
    if (!__privateGet(this, _app4).api || typeof __privateGet(this, _app4).api.createCart !== "function") {
      __privateGet(this, _logger10).error("API client not available");
      __privateSet(this, _cartAttempted, false);
      return;
    }
    __privateGet(this, _logger10).debug("Sending cart data to API", cartData);
    __privateGet(this, _app4).api.createCart(cartData).then((response) => {
      __privateGet(this, _logger10).info("Prospect cart created successfully", response);
      __privateSet(this, _cartCreated, true);
      if (__privateGet(this, _app4).events) {
        __privateGet(this, _app4).events.trigger("prospect.cartCreated", {
          cart: response
        });
        if (!__privateGet(this, _beginCheckoutFired)) {
          __privateGet(this, _logger10).info("Triggering beginCheckout event for analytics");
          __privateGet(this, _app4).events.beginCheckout();
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
  var _apiClient2, _logger11, _form4, _app5, _konamiCodeHandler, _initializeComponents, initializeComponents_fn, _initKonamiCodeHandler, initKonamiCodeHandler_fn, _triggerKonamiCodeEasterEgg, triggerKonamiCodeEasterEgg_fn, _initAddressHandler, initAddressHandler_fn, _initBillingAddressHandler, initBillingAddressHandler_fn, _initPaymentSelector, initPaymentSelector_fn, _initFormValidator, initFormValidator_fn, _initPaymentHandler, initPaymentHandler_fn, _initAddressAutocomplete, initAddressAutocomplete_fn, _initPhoneInputHandler, initPhoneInputHandler_fn, _initProspectCartHandler, initProspectCartHandler_fn, _injectBillingFormFields, injectBillingFormFields_fn, _setupEventListeners3, setupEventListeners_fn3, _handleSubmit2, handleSubmit_fn2, _disableSubmitButtons, disableSubmitButtons_fn;
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
      __privateAdd(this, _app5, void 0);
      __privateAdd(this, _konamiCodeHandler, void 0);
      __privateSet(this, _apiClient2, apiClient);
      __privateSet(this, _logger11, logger);
      __privateSet(this, _app5, app);
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
  _app5 = new WeakMap();
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
      this.billingAddressHandler = new BillingAddressHandler(__privateGet(this, _app5));
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
      this.paymentHandler = new PaymentHandler(__privateGet(this, _apiClient2), __privateGet(this, _logger11), __privateGet(this, _app5));
    } catch (error) {
      __privateGet(this, _logger11).error("Error initializing PaymentHandler", error);
    }
  };
  _initAddressAutocomplete = new WeakSet();
  initAddressAutocomplete_fn = function() {
    try {
      this.addressAutocomplete = new AddressAutocomplete(__privateGet(this, _logger11));
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
      if (__privateGet(this, _app5)) {
        this.prospectCartHandler = new ProspectCartHandler(__privateGet(this, _app5));
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
      if (__privateGet(this, _app5) && __privateGet(this, _app5).events && this.prospectCartHandler) {
        __privateGet(this, _app5).events.on("prospect.cartCreated", (data) => {
          __privateGet(this, _logger11).info("Prospect cart created successfully", data);
        });
      }
      if (__privateGet(this, _app5) && __privateGet(this, _app5).events) {
        __privateGet(this, _app5).events.on("order.created", (data) => {
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
  var _app6, _logger12, _viewItemListFired;
  var CampaignHelper = class {
    constructor(app) {
      __privateAdd(this, _app6, void 0);
      __privateAdd(this, _logger12, void 0);
      __privateAdd(this, _viewItemListFired, false);
      __privateSet(this, _app6, app);
      __privateSet(this, _logger12, app.logger.createModuleLogger("CAMPAIGN"));
    }
    getCampaignData() {
      const campaignData = __privateGet(this, _app6).campaignData;
      if (campaignData && !__privateGet(this, _viewItemListFired) && __privateGet(this, _app6).events?.viewItemList) {
        __privateGet(this, _logger12).debug("Triggering view_item_list event from getCampaignData");
        /* @__PURE__ */ console.log("🔍 Triggering view_item_list from getCampaignData", campaignData);
        setTimeout(() => {
          __privateGet(this, _app6).events.viewItemList(campaignData);
          __privateSet(this, _viewItemListFired, true);
          /* @__PURE__ */ console.log("✅ view_item_list triggered from getCampaignData");
        }, 500);
      }
      return campaignData;
    }
    getCampaignName() {
      return __privateGet(this, _app6).campaignData?.name ?? "";
    }
    getCampaignId() {
      return __privateGet(this, _app6).campaignData?.id ?? "";
    }
    getProducts() {
      const products = __privateGet(this, _app6).campaignData?.products ?? [];
      if (products.length > 0 && !__privateGet(this, _viewItemListFired) && __privateGet(this, _app6).events?.viewItemList) {
        __privateGet(this, _logger12).debug("Triggering view_item_list event from getProducts");
        /* @__PURE__ */ console.log("🔍 Triggering view_item_list from getProducts", __privateGet(this, _app6).campaignData);
        setTimeout(() => {
          __privateGet(this, _app6).events.viewItemList(__privateGet(this, _app6).campaignData);
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
      return __privateGet(this, _app6).campaignData?.currency ?? "USD";
    }
    getLocale() {
      return __privateGet(this, _app6).campaignData?.locale ?? "en-US";
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
      if (!__privateGet(this, _app6).campaignData) {
        __privateGet(this, _logger12).warn("Cannot trigger view_item_list: No campaign data available");
        return;
      }
      if (!__privateGet(this, _app6).events?.viewItemList) {
        __privateGet(this, _logger12).warn("Cannot trigger view_item_list: EventManager not initialized");
        return;
      }
      __privateGet(this, _logger12).debug("Manually triggering view_item_list event");
      __privateGet(this, _app6).events.viewItemList(__privateGet(this, _app6).campaignData);
      __privateSet(this, _viewItemListFired, true);
    }
  };
  _app6 = new WeakMap();
  _logger12 = new WeakMap();
  _viewItemListFired = new WeakMap();

  // src/managers/StateManager.js
  var _app7, _logger13, _state, _subscribers, _initDefaultState, initDefaultState_fn, _loadState, loadState_fn, _saveState, saveState_fn, _notifySubscribers, notifySubscribers_fn, _updateExistingItem, updateExistingItem_fn, _calculateCartTotals, calculateCartTotals_fn, _recalculateCart, recalculateCart_fn;
  var StateManager = class {
    constructor(app) {
      __privateAdd(this, _initDefaultState);
      __privateAdd(this, _loadState);
      __privateAdd(this, _saveState);
      __privateAdd(this, _notifySubscribers);
      __privateAdd(this, _updateExistingItem);
      __privateAdd(this, _calculateCartTotals);
      __privateAdd(this, _recalculateCart);
      __privateAdd(this, _app7, void 0);
      __privateAdd(this, _logger13, void 0);
      __privateAdd(this, _state, void 0);
      __privateAdd(this, _subscribers, {});
      __privateSet(this, _app7, app);
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
      const packageData = __privateGet(this, _app7).campaignData?.packages?.find(
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
      __privateGet(this, _app7).triggerEvent("cart.updated", { cart: this.getState("cart") });
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
      __privateGet(this, _app7).triggerEvent("cart.updated", { cart: this.getState("cart") });
      return this.getState("cart");
    }
    removeFromCart(itemId) {
      const updatedItems = this.getState("cart").items.filter((item) => item.id !== itemId);
      this.setState("cart.items", updatedItems);
      __privateGet(this, _logger13).info(`Item removed from cart: ${itemId}`);
      __privateGet(this, _app7).triggerEvent("cart.updated", { cart: this.getState("cart") });
      return this.getState("cart");
    }
    clearCart() {
      this.setState("cart.items", []);
      this.setState("cart.couponCode", null);
      this.setState("cart.shippingMethod", null);
      __privateGet(this, _logger13).info("Cart cleared");
      __privateGet(this, _app7).triggerEvent("cart.updated", { cart: this.getState("cart") });
      return this.getState("cart");
    }
    setShippingMethod(shippingMethod) {
      this.setState("cart.shippingMethod", shippingMethod);
      __privateGet(this, _logger13).info(`Shipping method set: ${shippingMethod.code}`);
      __privateGet(this, _app7).triggerEvent("cart.updated", { cart: this.getState("cart") });
      return this.getState("cart");
    }
    applyCoupon(couponCode) {
      this.setState("cart.couponCode", couponCode);
      __privateGet(this, _logger13).info(`Coupon applied: ${couponCode}`);
      __privateGet(this, _app7).triggerEvent("cart.updated", { cart: this.getState("cart") });
      return this.getState("cart");
    }
    removeCoupon() {
      this.setState("cart.couponCode", null);
      __privateGet(this, _logger13).info("Coupon removed");
      __privateGet(this, _app7).triggerEvent("cart.updated", { cart: this.getState("cart") });
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
        const response = await __privateGet(this, _app7).api.createCart(apiCart);
        __privateGet(this, _logger13).info("Cart synced with API");
        __privateGet(this, _app7).triggerEvent("cart.synced", { cart: response });
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
  _app7 = new WeakMap();
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
    const subtotal = items.reduce((acc, item) => acc + item.price * (item.quantity || 1), 0);
    const retailSubtotal = items.reduce((acc, item) => acc + (item.retail_price ?? item.price) * (item.quantity || 1), 0);
    const savings = retailSubtotal - subtotal;
    const savingsPercentage = retailSubtotal > 0 ? savings / retailSubtotal * 100 : 0;
    const recurringTotal = items.reduce((acc, item) => acc + (item.is_recurring && item.price_recurring ? item.price_recurring * (item.quantity || 1) : 0), 0);
    const shipping = shippingMethod?.price ? Number.parseFloat(shippingMethod.price) : 0;
    const tax = 0;
    const total = subtotal + shipping + tax;
    const currency = __privateGet(this, _app7).campaignData?.currency ?? "USD";
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
  var _app8, _stateManager, _logger14, _cartElements, _initCartUI, initCartUI_fn, _updateCartUI, updateCartUI_fn, _createCartItemElement, createCartItemElement_fn, _addToCart, addToCart_fn, _updateCartItemQuantity, updateCartItemQuantity_fn, _removeFromCart, removeFromCart_fn, _showMessage, showMessage_fn;
  var CartManager = class {
    constructor(app) {
      __privateAdd(this, _initCartUI);
      __privateAdd(this, _updateCartUI);
      __privateAdd(this, _createCartItemElement);
      __privateAdd(this, _addToCart);
      __privateAdd(this, _updateCartItemQuantity);
      __privateAdd(this, _removeFromCart);
      __privateAdd(this, _showMessage);
      __privateAdd(this, _app8, void 0);
      __privateAdd(this, _stateManager, void 0);
      __privateAdd(this, _logger14, void 0);
      __privateAdd(this, _cartElements, void 0);
      __privateSet(this, _app8, app);
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
        __privateMethod(this, _showMessage, showMessage_fn).call(this, "Error clearing cart", "error");
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
        __privateMethod(this, _showMessage, showMessage_fn).call(this, "Error setting shipping method", "error");
        throw error;
      }
    }
    applyCoupon(couponCode) {
      try {
        return __privateGet(this, _stateManager).applyCoupon(couponCode);
      } catch (error) {
        __privateGet(this, _logger14).error("Error applying coupon:", error);
        __privateMethod(this, _showMessage, showMessage_fn).call(this, "Error applying coupon", "error");
        throw error;
      }
    }
    removeCoupon() {
      try {
        return __privateGet(this, _stateManager).removeCoupon();
      } catch (error) {
        __privateGet(this, _logger14).error("Error removing coupon:", error);
        __privateMethod(this, _showMessage, showMessage_fn).call(this, "Error removing coupon", "error");
        throw error;
      }
    }
    async syncCartWithApi() {
      try {
        return await __privateGet(this, _stateManager).syncCartWithApi();
      } catch (error) {
        __privateGet(this, _logger14).error("Error syncing cart with API:", error);
        __privateMethod(this, _showMessage, showMessage_fn).call(this, "Error syncing cart with server", "error");
        throw error;
      }
    }
    isItemInCart(itemId) {
      return __privateGet(this, _stateManager).isItemInCart?.(itemId) ?? __privateGet(this, _stateManager).getState("cart").items.some((item) => item.id === itemId);
    }
  };
  _app8 = new WeakMap();
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
    const formatPrice = (price) => __privateGet(this, _app8).campaign?.formatPrice(price) ?? price.toFixed(2);
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
    const formatPrice = (price2) => __privateGet(this, _app8).campaign?.formatPrice(price2) ?? price2.toFixed(2);
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
      __privateMethod(this, _showMessage, showMessage_fn).call(this, `${item.name} added to cart`);
      return result;
    } catch (error) {
      __privateGet(this, _logger14).error("Error adding item to cart:", error);
      __privateMethod(this, _showMessage, showMessage_fn).call(this, "Error adding item to cart", "error");
      throw error;
    }
  };
  _updateCartItemQuantity = new WeakSet();
  updateCartItemQuantity_fn = function(itemId, quantity) {
    try {
      return quantity <= 0 ? __privateMethod(this, _removeFromCart, removeFromCart_fn).call(this, itemId) : __privateGet(this, _stateManager).updateCartItem(itemId, { quantity });
    } catch (error) {
      __privateGet(this, _logger14).error("Error updating cart item quantity:", error);
      __privateMethod(this, _showMessage, showMessage_fn).call(this, "Error updating cart", "error");
      throw error;
    }
  };
  _removeFromCart = new WeakSet();
  removeFromCart_fn = function(itemId) {
    try {
      return __privateGet(this, _stateManager).removeFromCart(itemId);
    } catch (error) {
      __privateGet(this, _logger14).error("Error removing item from cart:", error);
      __privateMethod(this, _showMessage, showMessage_fn).call(this, "Error removing item from cart", "error");
      throw error;
    }
  };
  _showMessage = new WeakSet();
  showMessage_fn = function(message, type = "success") {
    const messageElement = document.createElement("div");
    messageElement.className = `os-message os-message-${type}`;
    messageElement.textContent = message;
    document.body.appendChild(messageElement);
    setTimeout(() => {
      messageElement.classList.add("os-message-hide");
      setTimeout(() => document.body.removeChild(messageElement), 300);
    }, 3e3);
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
      let labelText = `ID: ${id}`;
      Object.entries(additionalInfo).forEach(([key, value]) => {
        labelText += ` | ${key}: ${value}`;
      });
      label.textContent = labelText;
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
  var _app9, _logger15, _selectors2, _selectedItems, _isDebugMode2, _initSelectors, initSelectors_fn, _initSelector, initSelector_fn, _initCard, initCard_fn, _handleClick, handleClick_fn, _selectItem, selectItem_fn, _updateCart, updateCart_fn, _addItemToCart, addItemToCart_fn, _removeItemFromCart, removeItemFromCart_fn, _syncWithCart, syncWithCart_fn;
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
      __privateAdd(this, _app9, void 0);
      __privateAdd(this, _logger15, void 0);
      __privateAdd(this, _selectors2, {});
      __privateAdd(this, _selectedItems, {});
      __privateAdd(this, _isDebugMode2, false);
      __privateSet(this, _app9, app);
      __privateSet(this, _logger15, app.logger.createModuleLogger("SELECTOR"));
      __privateSet(this, _isDebugMode2, DebugUtils.initDebugMode());
      __privateMethod(this, _initSelectors, initSelectors_fn).call(this);
      __privateGet(this, _logger15).info("SelectorManager initialized");
      if (__privateGet(this, _isDebugMode2)) {
        __privateGet(this, _logger15).info("Debug mode enabled for selectors");
      }
    }
  };
  _app9 = new WeakMap();
  _logger15 = new WeakMap();
  _selectors2 = new WeakMap();
  _selectedItems = new WeakMap();
  _isDebugMode2 = new WeakMap();
  _initSelectors = new WeakSet();
  initSelectors_fn = function() {
    document.querySelectorAll('[data-os-component="selector"][data-os-selection-mode="swap"]').forEach((selector) => __privateMethod(this, _initSelector, initSelector_fn).call(this, selector));
    setTimeout(() => __privateMethod(this, _syncWithCart, syncWithCart_fn).call(this), 0);
    __privateGet(this, _app9).state?.subscribe("cart", () => __privateMethod(this, _syncWithCart, syncWithCart_fn).call(this));
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
    if (!__privateGet(this, _app9).cart) {
      __privateGet(this, _logger15).error("Cart manager not available");
      return;
    }
    const selected = __privateGet(this, _selectedItems)[selectorId];
    if (!selected)
      return;
    if (previousItem && previousItem.packageId !== selected.packageId) {
      __privateMethod(this, _removeItemFromCart, removeItemFromCart_fn).call(this, previousItem);
    }
    if (!__privateGet(this, _app9).cart.isItemInCart(selected.packageId)) {
      __privateMethod(this, _addItemToCart, addItemToCart_fn).call(this, selected);
    }
  };
  _addItemToCart = new WeakSet();
  addItemToCart_fn = function(item) {
    if (!__privateGet(this, _app9).cart) {
      __privateGet(this, _logger15).error("Cart manager not available in addItemToCart");
      return;
    }
    if (typeof __privateGet(this, _app9).cart.addToCart !== "function") {
      __privateGet(this, _logger15).error("addToCart is not a function on this.#app.cart:", __privateGet(this, _app9).cart);
      return;
    }
    __privateGet(this, _logger15).info(`Adding item ${item.packageId} to cart`);
    __privateGet(this, _app9).cart.addToCart({
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
    if (!__privateGet(this, _app9).cart) {
      __privateGet(this, _logger15).error("Cart manager not available in removeItemFromCart");
      return;
    }
    if (typeof __privateGet(this, _app9).cart.removeFromCart !== "function") {
      __privateGet(this, _logger15).error("removeFromCart is not a function on this.#app.cart:", __privateGet(this, _app9).cart);
      return;
    }
    __privateGet(this, _logger15).info(`Removing item ${item.packageId} from cart`);
    __privateGet(this, _app9).cart.removeFromCart(item.packageId);
    item.element.classList.remove("os--active");
    item.element.setAttribute("data-os-active", "false");
  };
  _syncWithCart = new WeakSet();
  syncWithCart_fn = function() {
    if (!__privateGet(this, _app9).cart) {
      __privateGet(this, _logger15).debug("Cart manager not available for sync");
      return;
    }
    const cart = __privateGet(this, _app9).state?.getState("cart");
    if (!cart) {
      __privateGet(this, _logger15).debug("Cart state not available");
      return;
    }
    __privateGet(this, _logger15).debug("Syncing with cart, this.#app.cart:", __privateGet(this, _app9).cart);
    Object.keys(__privateGet(this, _selectors2)).forEach((selectorId) => {
      const items = __privateGet(this, _selectors2)[selectorId].items;
      const cartItemsInSelector = items.filter((item) => __privateGet(this, _app9).cart.isItemInCart(item.packageId));
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
        const isInCart = __privateGet(this, _app9).cart.isItemInCart(item.packageId);
        item.element.classList.toggle("os--active", isInCart);
        item.element.setAttribute("data-os-active", isInCart.toString());
      });
    });
  };

  // src/managers/ToggleManager.js
  var _toggleItems, _app10, _logger16, _isDebugMode3, _initToggleItems, initToggleItems_fn, _initToggleItem, initToggleItem_fn, _addDebugOverlay, addDebugOverlay_fn, _toggleItem, toggleItem_fn, _getPackageDataFromCampaign, getPackageDataFromCampaign_fn, _updateToggleItemUI, updateToggleItemUI_fn, _updateAllToggleItemsUI, updateAllToggleItemsUI_fn, _isItemInCart, isItemInCart_fn, _addItemToCart2, addItemToCart_fn2, _removeItemFromCart2, removeItemFromCart_fn2;
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
      __privateAdd(this, _app10, void 0);
      __privateAdd(this, _logger16, void 0);
      __privateAdd(this, _isDebugMode3, false);
      __privateSet(this, _app10, app);
      __privateSet(this, _logger16, app.logger.createModuleLogger("TOGGLE"));
      __privateSet(this, _isDebugMode3, DebugUtils.initDebugMode());
      __privateMethod(this, _initToggleItems, initToggleItems_fn).call(this);
      __privateGet(this, _app10).state.subscribe("cart", () => __privateMethod(this, _updateAllToggleItemsUI, updateAllToggleItemsUI_fn).call(this));
      __privateGet(this, _logger16).info("ToggleManager initialized");
      if (__privateGet(this, _isDebugMode3)) {
        __privateGet(this, _logger16).info("Debug mode enabled for toggle items");
      }
    }
  };
  _toggleItems = new WeakMap();
  _app10 = new WeakMap();
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
    DebugUtils.addDebugOverlay(element, toggleId, "toggle", {
      "Package": packageId,
      "Qty": quantity,
      "Price": price
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
      __privateMethod(this, _addItemToCart2, addItemToCart_fn2).call(this, {
        id: packageId,
        name: packageData.name,
        price: Number.parseFloat(packageData.price),
        quantity,
        type: "package"
      });
      __privateGet(this, _logger16).info(`Toggled ON item ${packageId}`);
    }
    __privateMethod(this, _updateToggleItemUI, updateToggleItemUI_fn).call(this, element, packageId);
    __privateGet(this, _app10).triggerEvent("toggle.changed", { toggleId, packageId, isActive: !isInCart });
  };
  _getPackageDataFromCampaign = new WeakSet();
  getPackageDataFromCampaign_fn = function(packageId) {
    if (!__privateGet(this, _app10).campaignData?.packages) {
      __privateGet(this, _logger16).error("Campaign data not available");
      return null;
    }
    return __privateGet(this, _app10).campaignData.packages.find((pkg) => pkg.ref_id.toString() === packageId.toString()) ?? null;
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
    return __privateGet(this, _app10).state.getState("cart").items.some((item) => item.id === itemId);
  };
  _addItemToCart2 = new WeakSet();
  addItemToCart_fn2 = function(item) {
    if (!__privateGet(this, _app10).cart) {
      __privateGet(this, _logger16).error("Cart manager not available");
      return;
    }
    __privateGet(this, _app10).cart.addToCart(item);
  };
  _removeItemFromCart2 = new WeakSet();
  removeItemFromCart_fn2 = function(itemId) {
    if (!__privateGet(this, _app10).cart) {
      __privateGet(this, _logger16).error("Cart manager not available");
      return;
    }
    __privateGet(this, _app10).cart.removeFromCart(itemId);
  };

  // src/managers/DebugManager.js
  var _app11, _logger17, _miniCartVisible, _miniCartElement, _debugBarElement, _isDebugMode4, _init6, init_fn6, _createDebugBar, createDebugBar_fn, _toggleXray, toggleXray_fn, _showMiniCart, showMiniCart_fn, _hideMiniCart, hideMiniCart_fn, _toggleMiniCart, toggleMiniCart_fn, _createMiniCartElement, createMiniCartElement_fn, _updateMiniCart, updateMiniCart_fn;
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
      __privateAdd(this, _app11, void 0);
      __privateAdd(this, _logger17, void 0);
      __privateAdd(this, _miniCartVisible, false);
      __privateAdd(this, _miniCartElement, null);
      __privateAdd(this, _debugBarElement, null);
      __privateAdd(this, _isDebugMode4, false);
      __privateSet(this, _app11, app);
      __privateSet(this, _logger17, app.logger.createModuleLogger("DEBUG"));
      __privateSet(this, _isDebugMode4, DebugUtils.initDebugMode());
      __privateMethod(this, _init6, init_fn6).call(this);
      __privateGet(this, _logger17).info("DebugManager initialized");
    }
  };
  _app11 = new WeakMap();
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
    __privateGet(this, _app11).state?.subscribe("cart", () => {
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
    const cart = __privateGet(this, _app11).state?.getState("cart");
    if (!cart) {
      content.innerHTML = '<div style="color: #999; text-align: center;">Cart data not available</div>';
      return;
    }
    __privateGet(this, _logger17).debug("Updating mini-cart with cart data:", cart);
    const formatPrice = (price) => __privateGet(this, _app11).campaign?.formatPrice(price) ?? `$${price.toFixed(2)}`;
    let html = "";
    if (!cart.items?.length) {
      html += '<div style="color: #999; text-align: center; margin-bottom: 15px;">Cart is empty</div>';
    } else {
      html += '<div style="margin-bottom: 15px;">';
      html += '<div style="font-weight: 600; margin-bottom: 10px;">Items:</div>';
      html += '<ul style="list-style: none; padding: 0; margin: 0;">';
      cart.items.forEach((item) => {
        html += `
          <li style="padding: 5px 0; border-bottom: 1px solid #eee;">
            <div style="display: flex; justify-content: space-between;">
              <div style="font-weight: 500;">${item.name}</div>
              <div>${item.quantity} × ${formatPrice(item.price)}</div>
            </div>
            <div style="display: flex; justify-content: space-between; margin-top: 5px;">
              <div style="color: #666; font-size: 12px;">ID: ${item.id}</div>
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
  var _app12, _logger18, _timers, _storagePrefix, _initTimers, initTimers_fn, _setupTimer, setupTimer_fn, _getTimerConfig, getTimerConfig_fn, _formatTime, formatTime_fn, _triggerTimerEvent, triggerTimerEvent_fn;
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
      __privateAdd(this, _app12, void 0);
      __privateAdd(this, _logger18, void 0);
      __privateAdd(this, _timers, /* @__PURE__ */ new Map());
      __privateAdd(this, _storagePrefix, "os-timer-");
      __privateSet(this, _app12, app);
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
  _app12 = new WeakMap();
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
  var _app13, _logger19, _displayElements, _initDisplayElements, initDisplayElements_fn, _updateContainerDisplay, updateContainerDisplay_fn, _triggerDisplayEvent, triggerDisplayEvent_fn;
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
      __privateAdd(this, _app13, void 0);
      __privateAdd(this, _logger19, void 0);
      __privateAdd(this, _displayElements, /* @__PURE__ */ new Map());
      __privateSet(this, _app13, app);
      __privateSet(this, _logger19, app.logger.createModuleLogger("DISPLAY"));
      __privateMethod(this, _initDisplayElements, initDisplayElements_fn).call(this);
      __privateGet(this, _app13).state.subscribe("cart", () => this.refreshDisplayElements());
      __privateGet(this, _logger19).infoWithTime("DisplayManager initialized");
    }
    /**
     * Refresh all display elements based on current cart contents
     */
    refreshDisplayElements() {
      __privateGet(this, _logger19).debugWithTime("Refreshing display elements");
      const cart = __privateGet(this, _app13).state.getState("cart");
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
  _app13 = new WeakMap();
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
  var _app14, _logger20, _elements3, _config, _lineItemTemplate, _initCartDisplay, initCartDisplay_fn, _initSummaryToggle, initSummaryToggle_fn, _toggleSummary, toggleSummary_fn, _updateLineItems, updateLineItems_fn, _createLineItemElement, createLineItemElement_fn, _updateSummary, updateSummary_fn, _updateShipping, updateShipping_fn, _updateSavings, updateSavings_fn, _updateGrandTotal, updateGrandTotal_fn, _formatPrice, formatPrice_fn, _debounce, debounce_fn, _updateCompareTotals, updateCompareTotals_fn, _findAllSummaryElements, findAllSummaryElements_fn;
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
      __privateAdd(this, _formatPrice);
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
      __privateAdd(this, _app14, void 0);
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
      __privateAdd(this, _config, {
        currencySymbol: "$",
        showComparePricing: true,
        showProductImages: true,
        showTaxPendingMessage: true
      });
      __privateAdd(this, _lineItemTemplate, null);
      __privateSet(this, _app14, app);
      __privateSet(this, _logger20, app.logger.createModuleLogger("CART_DISPLAY"));
      __privateMethod(this, _initCartDisplay, initCartDisplay_fn).call(this);
      __privateGet(this, _app14).state.subscribe("cart", () => this.updateCartDisplay());
      __privateGet(this, _logger20).infoWithTime("CartDisplayManager initialized");
    }
    /**
     * Update the cart display with current cart data
     */
    updateCartDisplay() {
      __privateGet(this, _logger20).debugWithTime("Updating cart display");
      const cart = __privateGet(this, _app14).state.getState("cart");
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
  _app14 = new WeakMap();
  _logger20 = new WeakMap();
  _elements3 = new WeakMap();
  _config = new WeakMap();
  _lineItemTemplate = new WeakMap();
  _initCartDisplay = new WeakSet();
  initCartDisplay_fn = function() {
    __privateGet(this, _logger20).infoWithTime("Initializing cart display");
    __privateGet(this, _elements3).lineDisplays = document.querySelectorAll('[data-os-cart-summary="line-display"]');
    __privateGet(this, _elements3).summaryContainers = document.querySelectorAll('[data-os-cart="summary"]');
    __privateGet(this, _elements3).savingsBars = document.querySelectorAll('[data-os-cart-summary="savings"]');
    __privateGet(this, _elements3).shippingBars = document.querySelectorAll('[data-os-cart-summary="shipping-bar"]');
    __privateGet(this, _elements3).grandTotals = document.querySelectorAll('[data-os-cart-summary="grand-total"]');
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
    __privateGet(this, _logger20).debugWithTime(`Summary bars found: ${__privateGet(this, _elements3).summaryBars.length}`);
    __privateGet(this, _logger20).debugWithTime(`Summary panels found: ${__privateGet(this, _elements3).summaryPanels.length}`);
    __privateGet(this, _logger20).debugWithTime(`Summary texts found: ${__privateGet(this, _elements3).summaryTexts.length}`);
    __privateGet(this, _logger20).debugWithTime(`Summary icons found: ${__privateGet(this, _elements3).summaryIcons.length}`);
    __privateGet(this, _logger20).debugWithTime(`Compare total elements found: ${__privateGet(this, _elements3).compareTotalElements.length}`);
    if (__privateGet(this, _elements3).summaryContainers.length > 0) {
      const firstContainer = __privateGet(this, _elements3).summaryContainers[0];
      __privateGet(this, _config).showComparePricing = firstContainer.dataset.showComparePricing !== "false";
      __privateGet(this, _config).showProductImages = firstContainer.dataset.showProductImages !== "false";
      __privateGet(this, _config).showTaxPendingMessage = firstContainer.dataset.showTaxPendingMessage !== "false";
      __privateGet(this, _config).currencySymbol = firstContainer.dataset.currencySymbol || "$";
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
    if (__privateGet(this, _config).showProductImages) {
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
    if (comparePrice && item.retail_price && __privateGet(this, _config).showComparePricing) {
      comparePrice.textContent = __privateMethod(this, _formatPrice, formatPrice_fn).call(this, item.retail_price * (item.quantity || 1));
      comparePrice.classList.remove("hide");
    } else if (comparePrice) {
      comparePrice.classList.add("hide");
    }
    if (salePrice) {
      salePrice.textContent = __privateMethod(this, _formatPrice, formatPrice_fn).call(this, item.price * (item.quantity || 1));
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
          shippingCompare.textContent = __privateMethod(this, _formatPrice, formatPrice_fn).call(this, shippingMethod.standard_cost);
          shippingCurrent.textContent = "FREE";
          shippingCompare.classList.remove("hide");
        } else if (shippingCost > 0) {
          shippingCurrent.textContent = __privateMethod(this, _formatPrice, formatPrice_fn).call(this, shippingCost);
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
          savingsAmount.textContent = __privateMethod(this, _formatPrice, formatPrice_fn).call(this, totals.savings);
          __privateGet(this, _logger20).debugWithTime(`Updated savings amount to: ${__privateMethod(this, _formatPrice, formatPrice_fn).call(this, totals.savings)}`);
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
        element.textContent = __privateMethod(this, _formatPrice, formatPrice_fn).call(this, totals.savings);
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
      element.textContent = __privateMethod(this, _formatPrice, formatPrice_fn).call(this, total);
    });
    __privateGet(this, _logger20).debugWithTime(`Updated grand total to: ${__privateMethod(this, _formatPrice, formatPrice_fn).call(this, total)}`);
  };
  _formatPrice = new WeakSet();
  formatPrice_fn = function(price) {
    if (__privateGet(this, _app14).campaign?.formatPrice) {
      return __privateGet(this, _app14).campaign.formatPrice(price);
    }
    return `${__privateGet(this, _config).currencySymbol}${price.toFixed(2)} USD`;
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
        element.textContent = __privateMethod(this, _formatPrice, formatPrice_fn).call(this, compareValue);
        element.classList.remove("hide");
        __privateGet(this, _logger20).debugWithTime(`Updated compare-total (${totalType}) to: ${__privateMethod(this, _formatPrice, formatPrice_fn).call(this, compareValue)}`);
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
  var _app15, _logger21, _attributionData, _initialized2, _init7, init_fn7, _collectAttributionData, collectAttributionData_fn, _collectTrackingTags, collectTrackingTags_fn, _storeAttributionData, storeAttributionData_fn, _persistAttributionData, persistAttributionData_fn, _loadPersistedAttributionData, loadPersistedAttributionData_fn, _getFirstVisitTimestamp, getFirstVisitTimestamp_fn, _setupEventListeners4, setupEventListeners_fn4, _reinitializeAttributionData, reinitializeAttributionData_fn, _getStoredValue, getStoredValue_fn, _getCookie, getCookie_fn, _getDeviceType, getDeviceType_fn, _getFacebookPixelId, getFacebookPixelId_fn;
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
       * Reinitialize attribution data after campaign data is loaded
       * This ensures we have the latest campaign information
       */
      __privateAdd(this, _reinitializeAttributionData);
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
      __privateAdd(this, _app15, void 0);
      __privateAdd(this, _logger21, void 0);
      __privateAdd(this, _attributionData, {});
      __privateAdd(this, _initialized2, false);
      __privateSet(this, _app15, app);
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
      if (__privateGet(this, _app15).events) {
        __privateGet(this, _app15).events.trigger("attribution.updated", {
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
      const campaignName = __privateGet(this, _app15).campaign?.getCampaignName() || __privateGet(this, _app15).campaignData?.name || "";
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
      /* @__PURE__ */ console.log("Campaign Name:", __privateGet(this, _app15).campaignData?.name || "Not available");
      if (__privateGet(this, _app15).state) {
        /* @__PURE__ */ console.log("API-formatted State Attribution:", __privateGet(this, _app15).state.getState("attribution"));
      }
      console.groupEnd();
      return "Attribution debug info logged to console.";
    }
  };
  _app15 = new WeakMap();
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
    const funnelMetaTag = document.querySelector('meta[name="os-tracking-tag"][data-tag-name="funnel_name"]');
    const funnelIdFromTag = funnelMetaTag ? funnelMetaTag.getAttribute("data-tag-value") : "";
    const campaignName = __privateGet(this, _app15).campaign?.getCampaignName() || __privateGet(this, _app15).campaignData?.name || "";
    const funnelId = funnelIdFromTag || campaignName;
    __privateGet(this, _logger21).debug(`Using funnel value: ${funnelId} (from ${funnelIdFromTag ? "meta tag" : "campaign name"})`);
    const affiliate = __privateMethod(this, _getStoredValue, getStoredValue_fn).call(this, "affid") || __privateMethod(this, _getStoredValue, getStoredValue_fn).call(this, "aff") || "";
    const fbcValue = __privateMethod(this, _getCookie, getCookie_fn).call(this, "_fbc") || "";
    const fbpValue = __privateMethod(this, _getCookie, getCookie_fn).call(this, "_fbp") || "";
    const fbPixelId = __privateMethod(this, _getFacebookPixelId, getFacebookPixelId_fn).call(this);
    const metadata = {
      landing_page: window.location.href || "",
      referrer: document.referrer || "",
      device: navigator.userAgent || "",
      device_type: __privateMethod(this, _getDeviceType, getDeviceType_fn).call(this),
      timestamp: Date.now(),
      domain: window.location.hostname,
      // Facebook tracking data - using the exact variable names from the example
      fb_fbp: fbpValue,
      fb_fbc: fbcValue,
      fb_pixel_id: fbPixelId
    };
    const fbclid = __privateMethod(this, _getStoredValue, getStoredValue_fn).call(this, "fbclid") || "";
    if (fbclid) {
      metadata.fbclid = fbclid;
    }
    __privateMethod(this, _collectTrackingTags, collectTrackingTags_fn).call(this, metadata);
    __privateSet(this, _attributionData, {
      // Attribution API compatible fields
      affiliate,
      funnel: funnelId,
      // Using funnelId which is either from the meta tag or campaign name
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
      // Sub-affiliate parameters (renamed from sub1, sub2, etc.)
      subaffiliate1: __privateMethod(this, _getStoredValue, getStoredValue_fn).call(this, "subaffiliate1") || __privateMethod(this, _getStoredValue, getStoredValue_fn).call(this, "sub1") || "",
      subaffiliate2: __privateMethod(this, _getStoredValue, getStoredValue_fn).call(this, "subaffiliate2") || __privateMethod(this, _getStoredValue, getStoredValue_fn).call(this, "sub2") || "",
      subaffiliate3: __privateMethod(this, _getStoredValue, getStoredValue_fn).call(this, "subaffiliate3") || __privateMethod(this, _getStoredValue, getStoredValue_fn).call(this, "sub3") || "",
      subaffiliate4: __privateMethod(this, _getStoredValue, getStoredValue_fn).call(this, "subaffiliate4") || __privateMethod(this, _getStoredValue, getStoredValue_fn).call(this, "sub4") || "",
      subaffiliate5: __privateMethod(this, _getStoredValue, getStoredValue_fn).call(this, "subaffiliate5") || __privateMethod(this, _getStoredValue, getStoredValue_fn).call(this, "sub5") || "",
      // Time data
      first_visit_timestamp: __privateMethod(this, _getFirstVisitTimestamp, getFirstVisitTimestamp_fn).call(this),
      current_visit_timestamp: Date.now()
    });
    __privateGet(this, _logger21).debug("Attribution data collected", __privateGet(this, _attributionData));
    if (!campaignName && __privateGet(this, _app15).events) {
      __privateGet(this, _logger21).debug("Campaign data not available yet, will update when loaded");
    }
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
    if (!__privateGet(this, _app15).state) {
      __privateGet(this, _logger21).warn("State manager not available, attribution data will not be stored");
      return;
    }
    __privateGet(this, _app15).state.setState("cart.attribution", __privateGet(this, _attributionData));
    __privateGet(this, _app15).state.setState("attribution", this.getAttributionForApi());
    __privateGet(this, _logger21).info("Attribution data stored in state");
    __privateMethod(this, _persistAttributionData, persistAttributionData_fn).call(this);
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
    if (__privateGet(this, _app15).events) {
      __privateGet(this, _app15).events.on("campaign.loaded", (data) => {
        if (data && data.campaign) {
          const campaignName = __privateGet(this, _app15).campaign?.getCampaignName() || data.campaign.name || "";
          if (!campaignName) {
            __privateGet(this, _logger21).warn("Campaign loaded but name is not available");
            return;
          }
          __privateGet(this, _logger21).info(`Campaign loaded: ${campaignName}`);
          const funnelMetaTag = document.querySelector('meta[name="os-tracking-tag"][data-tag-name="funnel_name"]');
          const funnelIdFromTag = funnelMetaTag ? funnelMetaTag.getAttribute("data-tag-value") : "";
          const funnel = funnelIdFromTag || campaignName;
          this.updateAttributionData({
            funnel
          });
          __privateMethod(this, _reinitializeAttributionData, reinitializeAttributionData_fn).call(this);
          __privateGet(this, _logger21).debug(`Updated funnel to: ${funnel} (from ${funnelIdFromTag ? "meta tag" : "campaign name"})`);
        }
      });
      __privateGet(this, _app15).events.on("prospect.cartCreated", () => {
        const metadata = __privateGet(this, _attributionData).metadata || {};
        metadata.conversion_timestamp = Date.now();
        this.updateAttributionData({
          metadata
        });
        __privateGet(this, _logger21).debug("Cart created, updated metadata with conversion timestamp");
      });
    }
  };
  _reinitializeAttributionData = new WeakSet();
  reinitializeAttributionData_fn = function() {
    __privateGet(this, _logger21).info("Reinitializing attribution data with campaign information");
    const campaignName = __privateGet(this, _app15).campaign?.getCampaignName() || __privateGet(this, _app15).campaignData?.name || "";
    if (!campaignName) {
      __privateGet(this, _logger21).warn("Cannot reinitialize attribution data: Campaign name not available");
      return;
    }
    const funnelMetaTag = document.querySelector('meta[name="os-tracking-tag"][data-tag-name="funnel_name"]');
    const funnelIdFromTag = funnelMetaTag ? funnelMetaTag.getAttribute("data-tag-value") : "";
    const funnelId = funnelIdFromTag || campaignName;
    __privateGet(this, _logger21).debug(`Using funnel value: ${funnelId} (from ${funnelIdFromTag ? "meta tag" : "campaign name"})`);
    __privateGet(this, _attributionData).funnel = funnelId;
    __privateMethod(this, _storeAttributionData, storeAttributionData_fn).call(this);
    __privateGet(this, _logger21).info(`Attribution data reinitialized with funnel: ${funnelId}`);
    if (__privateGet(this, _app15).events) {
      __privateGet(this, _app15).events.trigger("attribution.updated", {
        attribution: __privateGet(this, _attributionData)
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
  var _app16, _logger22, _isInitialized, _platforms, _debugMode4, _processedOrderIds, _loadProcessedOrderIds, loadProcessedOrderIds_fn, _saveProcessedOrderIds, saveProcessedOrderIds_fn, _detectPlatforms, detectPlatforms_fn, _setupEventListeners5, setupEventListeners_fn5, _getUserDataForTracking, getUserDataForTracking_fn, _hashString, hashString_fn, _fireEvent, fireEvent_fn;
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
      __privateAdd(this, _app16, void 0);
      __privateAdd(this, _logger22, void 0);
      __privateAdd(this, _isInitialized, false);
      __privateAdd(this, _platforms, {
        gtm: { enabled: false, initialized: false },
        fbPixel: { enabled: false, initialized: false },
        ga4: { enabled: false, initialized: false }
      });
      __privateAdd(this, _debugMode4, false);
      __privateAdd(this, _processedOrderIds, /* @__PURE__ */ new Set());
      __privateSet(this, _app16, app);
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
          currency: pkg.currency || __privateGet(this, _app16).getCampaignData()?.currency || "USD",
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
        currency: packageData.currency || __privateGet(this, _app16).getCampaignData()?.currency || "USD",
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
      const cart = __privateGet(this, _app16).state.getState("cart");
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
    setPlatformEnabled(platform, enabled) {
      if (__privateGet(this, _platforms)[platform]) {
        __privateGet(this, _platforms)[platform].enabled = enabled;
        __privateGet(this, _logger22).info(`${platform} ${enabled ? "enabled" : "disabled"}`);
      } else {
        __privateGet(this, _logger22).warn(`Unknown platform: ${platform}`);
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
  _app16 = new WeakMap();
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
    __privateGet(this, _app16).on("campaign.loaded", (data) => {
      __privateGet(this, _logger22).debug("Campaign loaded event received, firing view_item_list");
      if (data && data.campaign) {
        this.viewItemList(data.campaign);
      } else {
        __privateGet(this, _logger22).warn("Campaign loaded event received but no campaign data found");
      }
    });
    __privateGet(this, _app16).on("cart.updated", (data) => {
      if (data.cart && data.cart.items && data.cart.items.length > 0) {
        this.addToCart(data.cart);
      }
    });
    __privateGet(this, _app16).on("order.created", (data) => {
      this.purchase(data);
    });
    __privateGet(this, _app16).on("order.loaded", (data) => {
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
          const arrow = item.querySelector('[pb-accordion-element="arrow"]');
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
          if (arrow)
            arrow.classList.remove("is-active-accordion");
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
      const arrow = item.querySelector('[pb-accordion-element="arrow"]');
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
        if (arrow)
          arrow.classList.add("is-active-accordion");
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
      const arrow = item.querySelector('[pb-accordion-element="arrow"]');
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
        if (arrow)
          arrow.classList.remove("is-active-accordion");
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
  var _isInitialized2, _isCheckoutPage, _campaignData, _loadConfig, loadConfig_fn, _loadGoogleMapsApi, loadGoogleMapsApi_fn, _fetchCampaignData, fetchCampaignData_fn, _initializeManagers, initializeManagers_fn, _finalizeInitialization, finalizeInitialization_fn, _hidePreloader, hidePreloader_fn, _detectCheckoutPage, detectCheckoutPage_fn, _initCheckoutPage, initCheckoutPage_fn, _initReceiptPage, initReceiptPage_fn, _initUIUtilities, initUIUtilities_fn;
  var TwentyNineNext = class {
    constructor(options = {}) {
      __privateAdd(this, _loadConfig);
      __privateAdd(this, _loadGoogleMapsApi);
      __privateAdd(this, _fetchCampaignData);
      __privateAdd(this, _initializeManagers);
      __privateAdd(this, _finalizeInitialization);
      __privateAdd(this, _hidePreloader);
      __privateAdd(this, _detectCheckoutPage);
      __privateAdd(this, _initCheckoutPage);
      __privateAdd(this, _initReceiptPage);
      __privateAdd(this, _initUIUtilities);
      __privateAdd(this, _isInitialized2, false);
      __privateAdd(this, _isCheckoutPage, false);
      __privateAdd(this, _campaignData, null);
      this.options = {
        debug: false,
        autoInit: true,
        googleMapsApiKey: "YOUR_API_KEY_HERE",
        // Replace with configurable key
        ...options
      };
      this.logger = new Logger(this.options.debug);
      this.coreLogger = this.logger.createModuleLogger("CORE");
      this.api = new ApiClient(this);
      this.config = __privateMethod(this, _loadConfig, loadConfig_fn).call(this);
      this.state = new StateManager(this);
      this.attribution = new AttributionManager(this);
      this.cart = new CartManager(this);
      this.campaign = new CampaignHelper(this);
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
  _loadConfig = new WeakSet();
  loadConfig_fn = function() {
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
    return config;
  };
  _loadGoogleMapsApi = new WeakSet();
  loadGoogleMapsApi_fn = async function() {
    if (typeof google !== "undefined" && typeof google.maps !== "undefined") {
      this.coreLogger.debug("Google Maps API already loaded");
      return;
    }
    this.coreLogger.debug("Loading Google Maps API...");
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${this.options.googleMapsApiKey}&libraries=places`;
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
