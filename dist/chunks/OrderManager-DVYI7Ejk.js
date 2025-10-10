import { w as nextAnalytics, x as EcommerceEvents, a as useCampaignStore, f as configStore, b as useAttributionStore, R as getFailureUrl, S as getSuccessUrl, u as useCartStore, d as useCheckoutStore, T as handleOrderRedirect } from "./utils-BiJ8-_Kg.js";
const API_PAYMENT_METHOD_MAP = {
  "credit-card": "card_token",
  "card_token": "card_token",
  "paypal": "paypal",
  "apple_pay": "apple_pay",
  "google_pay": "google_pay"
};
const EXPRESS_PAYMENT_METHOD_MAP = {
  "paypal": "paypal",
  "apple-pay": "apple_pay",
  "google-pay": "google_pay"
};
class ExpressCheckoutProcessor {
  constructor(logger, showLoadingCallback, hideLoadingCallback, emitCallback, orderManager) {
    this.logger = logger;
    this.showLoadingCallback = showLoadingCallback;
    this.hideLoadingCallback = hideLoadingCallback;
    this.emitCallback = emitCallback;
    this.orderManager = orderManager;
  }
  async handleExpressCheckout(method, cartItems, isCartEmpty, _resetCart) {
    let hasError = false;
    try {
      this.showLoadingCallback();
      if (isCartEmpty) {
        this.logger.warn("Cannot checkout with empty cart");
        this.emitCallback("express-checkout:error", {
          method,
          error: "Cart is empty"
        });
        hasError = true;
        return;
      }
      const paymentMethod = EXPRESS_PAYMENT_METHOD_MAP[method] || method;
      try {
        const paymentTypeMap = {
          "paypal": "PayPal",
          "apple_pay": "Apple Pay",
          "google_pay": "Google Pay"
        };
        const paymentType = paymentTypeMap[paymentMethod] || paymentMethod;
        nextAnalytics.track(EcommerceEvents.createAddPaymentInfoEvent(paymentType));
        this.logger.info("Tracked add_payment_info event for express checkout", { paymentType });
      } catch (analyticsError) {
        this.logger.warn("Failed to track add_payment_info event:", analyticsError);
      }
      this.emitCallback("express-checkout:started", {
        method: paymentMethod,
        itemCount: cartItems.length
      });
      this.logger.info(`Express checkout initiated with ${method}`);
      const order = await this.orderManager.createExpressOrder(
        cartItems,
        paymentMethod
      );
      this.emitCallback("express-checkout:completed", {
        method: paymentMethod,
        order
      });
      this.orderManager.handleOrderRedirect(order);
    } catch (error) {
      hasError = true;
      this.logger.error("Express checkout failed:", error);
      if (error.responseData) {
        const responseData = error.responseData;
        if (method === "paypal" && responseData.payment_details) {
          this.displayPayPalError(responseData.payment_details);
        } else if ((method === "apple_pay" || method === "google_pay") && responseData.payment_details) {
          this.displayExpressPaymentError(method, responseData.payment_details);
        }
      }
      this.emitCallback("express-checkout:failed", {
        method,
        error: error instanceof Error ? error.message : "Unknown error"
      });
      throw error;
    } finally {
      this.hideLoadingCallback(hasError);
    }
  }
  displayPayPalError(errorMessage) {
    const errorContainer = document.querySelector('[data-next-component="paypal-error"]');
    const errorTextElement = document.querySelector('[data-next-component="paypal-error-text"]');
    if (errorContainer instanceof HTMLElement && errorTextElement) {
      errorTextElement.textContent = errorMessage + " Please try a different payment method.";
      errorContainer.style.display = "flex";
      this.logger.info("PayPal error displayed:", errorMessage);
    }
    this.displayGeneralPaymentError(errorMessage);
  }
  displayExpressPaymentError(method, errorMessage) {
    const methodName = method === "apple_pay" ? "Apple Pay" : "Google Pay";
    const fullMessage = `${methodName} error: ${errorMessage}. Please try a different payment method.`;
    this.displayGeneralPaymentError(fullMessage);
  }
  displayGeneralPaymentError(message) {
    const errorContainer = document.querySelector('[data-next-component="credit-error"]');
    const errorTextElement = document.querySelector('[data-next-component="credit-error-text"]');
    if (errorContainer instanceof HTMLElement && errorTextElement) {
      errorTextElement.textContent = message;
      errorContainer.style.display = "flex";
    }
  }
}
class OrderBuilder {
  getCurrency() {
    const campaignState = useCampaignStore.getState();
    if (campaignState?.data?.currency) {
      return campaignState.data.currency;
    }
    const configStore$1 = configStore.getState();
    return configStore$1?.selectedCurrency || configStore$1?.detectedCurrency || "USD";
  }
  buildOrder(checkoutFormData, cartItems, paymentMethod, paymentToken, billingAddress, sameAsShipping = true, shippingMethod, vouchers = []) {
    const shippingAddress = {
      first_name: checkoutFormData.fname || "",
      last_name: checkoutFormData.lname || "",
      line1: checkoutFormData.address1 || "",
      line2: checkoutFormData.address2,
      line4: checkoutFormData.city || "",
      // city
      state: checkoutFormData.province,
      postcode: checkoutFormData.postal,
      country: checkoutFormData.country || "",
      phone_number: checkoutFormData.phone
    };
    let billingAddressData;
    if (!sameAsShipping && billingAddress) {
      billingAddressData = {
        first_name: billingAddress.first_name || "",
        last_name: billingAddress.last_name || "",
        line1: billingAddress.address1 || "",
        line4: billingAddress.city || "",
        country: billingAddress.country || "",
        ...billingAddress.address2 && { line2: billingAddress.address2 },
        ...billingAddress.province && { state: billingAddress.province },
        ...billingAddress.postal && { postcode: billingAddress.postal },
        ...billingAddress.phone && { phone_number: billingAddress.phone }
      };
    }
    const payment = {
      payment_method: this.mapPaymentMethod(paymentMethod),
      ...paymentToken && { card_token: paymentToken }
    };
    const attributionStore = useAttributionStore.getState();
    const attribution = attributionStore.getAttributionForApi();
    const orderData = {
      lines: cartItems.map((item) => ({
        package_id: item.packageId,
        quantity: item.quantity,
        is_upsell: item.is_upsell || false
      })),
      shipping_address: shippingAddress,
      ...billingAddressData && { billing_address: billingAddressData },
      billing_same_as_shipping_address: sameAsShipping,
      shipping_method: shippingMethod?.id || this.getDefaultShippingMethodId(),
      payment_detail: payment,
      user: {
        email: checkoutFormData.email,
        first_name: checkoutFormData.fname || "",
        last_name: checkoutFormData.lname || "",
        language: "en",
        phone_number: checkoutFormData.phone,
        accepts_marketing: checkoutFormData.accepts_marketing ?? true
      },
      vouchers,
      attribution,
      currency: this.getCurrency(),
      success_url: getSuccessUrl(),
      payment_failed_url: getFailureUrl()
    };
    return orderData;
  }
  buildExpressOrder(cartItems, paymentMethod, vouchers = []) {
    const attributionStore = useAttributionStore.getState();
    const attribution = attributionStore.getAttributionForApi();
    const orderData = {
      lines: cartItems.map((item) => ({
        package_id: item.packageId,
        quantity: item.quantity,
        is_upsell: item.is_upsell || false
      })),
      payment_detail: {
        payment_method: paymentMethod
      },
      shipping_method: this.getDefaultShippingMethodId(),
      vouchers,
      attribution,
      currency: this.getCurrency(),
      success_url: getSuccessUrl(),
      payment_failed_url: getFailureUrl()
    };
    return orderData;
  }
  buildTestOrder(cartItems, vouchers = []) {
    const testOrderData = {
      lines: cartItems.length > 0 ? cartItems.map((item) => ({
        package_id: item.packageId,
        quantity: item.quantity,
        is_upsell: item.is_upsell || false
      })) : [{ package_id: 1, quantity: 1, is_upsell: false }],
      // Default package if cart empty
      shipping_address: {
        first_name: "Test",
        last_name: "Order",
        line1: "Test Address 123",
        line2: "",
        line4: "Tempe",
        // city
        state: "AZ",
        postcode: "85281",
        country: "US",
        phone_number: "+14807581224"
      },
      billing_same_as_shipping_address: true,
      shipping_method: this.getDefaultShippingMethodId(),
      payment_detail: {
        payment_method: "card_token",
        card_token: "test_card"
      },
      user: {
        email: "test@test.com",
        first_name: "Test",
        last_name: "Order",
        language: "en",
        phone_number: "+14807581224",
        accepts_marketing: true
      },
      vouchers,
      attribution: this.getTestAttribution(),
      currency: this.getCurrency(),
      success_url: getSuccessUrl(),
      payment_failed_url: getFailureUrl()
    };
    return testOrderData;
  }
  mapPaymentMethod(method) {
    return API_PAYMENT_METHOD_MAP[method] || "card_token";
  }
  getDefaultShippingMethodId() {
    const cartStore = useCartStore.getState();
    const checkoutStore = useCheckoutStore.getState();
    const campaignStore = useCampaignStore.getState();
    if (cartStore.shippingMethod?.id) {
      console.log("[OrderBuilder] Using shipping method from cart:", cartStore.shippingMethod.id);
      return cartStore.shippingMethod.id;
    }
    if (checkoutStore.shippingMethod?.id) {
      console.log("[OrderBuilder] Using shipping method from checkout:", checkoutStore.shippingMethod.id);
      return checkoutStore.shippingMethod.id;
    }
    if (campaignStore.data?.shipping_methods && campaignStore.data.shipping_methods.length > 0) {
      const firstMethod = campaignStore.data.shipping_methods[0];
      if (firstMethod) {
        const firstMethodId = firstMethod.ref_id;
        console.log("[OrderBuilder] Using first available shipping method:", firstMethodId);
        return firstMethodId;
      }
    }
    console.warn("[OrderBuilder] No shipping method found, using fallback ID 1");
    return 1;
  }
  getTestAttribution() {
    const attributionStore = useAttributionStore.getState();
    const baseAttribution = attributionStore.getAttributionForApi();
    return {
      ...baseAttribution,
      utm_source: "konami_code",
      utm_medium: "test",
      utm_campaign: "debug_test_order",
      utm_content: "test_mode",
      metadata: {
        ...baseAttribution.metadata,
        test_order: true,
        test_timestamp: Date.now()
      }
    };
  }
}
class OrderManager {
  constructor(apiClient, logger, emitCallback) {
    this.apiClient = apiClient;
    this.logger = logger;
    this.emitCallback = emitCallback;
    this.orderBuilder = new OrderBuilder();
  }
  async createOrder(checkoutFormData, cartItems, paymentMethod, paymentToken, billingAddress, sameAsShipping = true, shippingMethod, vouchers = []) {
    console.log("🟢 [OrderManager] createOrder called with:", {
      paymentMethod,
      paymentToken: paymentToken ? `${paymentToken.substring(0, 8)}...` : "none",
      itemCount: cartItems.length,
      sameAsShipping,
      hasShippingMethod: !!shippingMethod,
      vouchersCount: vouchers.length
    });
    try {
      if (!checkoutFormData.email || !checkoutFormData.fname || !checkoutFormData.lname) {
        throw new Error("Missing required customer information");
      }
      if (cartItems.length === 0) {
        throw new Error("Cannot create order with empty cart");
      }
      if ((paymentMethod === "credit-card" || paymentMethod === "card_token") && !paymentToken) {
        throw new Error("Payment token is required for credit card payments");
      }
      const orderData = this.orderBuilder.buildOrder(
        checkoutFormData,
        cartItems,
        paymentMethod,
        paymentToken,
        billingAddress,
        sameAsShipping,
        shippingMethod,
        vouchers
      );
      this.logger.debug("Creating order with data:", {
        ...orderData,
        // Mask sensitive data in logs
        payment_detail: {
          ...orderData.payment_detail,
          card_token: orderData.payment_detail.card_token ? "MASKED" : void 0
        }
      });
      console.log("🟢 [OrderManager] Order data built successfully");
      console.log("🟢 [OrderManager] Payment method:", orderData.payment_detail.payment_method);
      console.log("🟢 [OrderManager] Has payment token:", !!orderData.payment_detail.card_token);
      console.log("🟢 [OrderManager] Calling API to create order...");
      const order = await this.apiClient.createOrder(orderData);
      console.log("🟢 [OrderManager] Order created successfully by API:", {
        ref_id: order.ref_id,
        number: order.number,
        total: order.total_incl_tax,
        currency: order.currency,
        has_order_status_url: !!order.order_status_url,
        has_payment_complete_url: !!order.payment_complete_url,
        is_test: order.is_test
      });
      if (!order.ref_id) {
        throw new Error("Invalid order response: missing ref_id");
      }
      this.logger.info("Order created successfully", {
        ref_id: order.ref_id,
        number: order.number,
        total: order.total_incl_tax,
        payment_method: paymentMethod
      });
      return order;
    } catch (error) {
      console.error("🔴 [OrderManager] Error creating order:", error);
      this.logger.error("Failed to create order:", error);
      if (error.status === 400 && error.responseData) {
        const responseData = error.responseData;
        if (responseData.payment_details || responseData.payment_response_code) {
          console.log("🔴 [OrderManager] Payment error detected:", {
            payment_details: responseData.payment_details,
            payment_response_code: responseData.payment_response_code
          });
          this.emitCallback("payment:error", {
            message: responseData.payment_details || "Payment failed",
            code: responseData.payment_response_code,
            details: responseData
          });
          let errorMessage = "Payment failed: ";
          if (responseData.payment_details) {
            errorMessage += responseData.payment_details;
          } else {
            errorMessage += "Please check your payment information and try again.";
          }
          throw new Error(errorMessage);
        }
      }
      if (error instanceof Error) {
        if (error.message.includes("Rate limited")) {
          throw new Error("Too many requests. Please wait a moment and try again.");
        } else if (error.message.includes("401") || error.message.includes("403")) {
          throw new Error("Authentication error. Please refresh the page and try again.");
        } else if (error.message.includes("400")) {
          throw new Error("Invalid order data. Please check your information and try again.");
        } else if (error.message.includes("500")) {
          throw new Error("Server error. Please try again in a few moments.");
        }
      }
      throw error;
    }
  }
  async createExpressOrder(cartItems, paymentMethod) {
    this.logger.info("createExpressOrder called with:", {
      paymentMethod,
      itemCount: cartItems.length
    });
    try {
      if (cartItems.length === 0) {
        throw new Error("Cannot create express order with empty cart");
      }
      const { useCartStore: useCartStore2 } = await import("./utils-BiJ8-_Kg.js").then((n) => n._);
      const cartStore = useCartStore2.getState();
      const vouchers = (cartStore.appliedCoupons || []).map((coupon) => coupon.code);
      const orderData = this.orderBuilder.buildExpressOrder(cartItems, paymentMethod, vouchers);
      this.logger.debug("Creating express order with minimal data:", orderData);
      this.logger.info("Express order data built");
      const order = await this.apiClient.createOrder(orderData);
      this.logger.info("Express order created:", {
        ref_id: order.ref_id,
        has_order_status_url: !!order.order_status_url,
        has_payment_complete_url: !!order.payment_complete_url
      });
      return order;
    } catch (error) {
      console.error("🔴 [OrderManager] Error creating express order:", error);
      this.logger.error("Failed to create express order:", error);
      throw error;
    }
  }
  async createTestOrder(cartItems) {
    console.log("🟢 [OrderManager] createTestOrder called with:", {
      itemCount: cartItems.length
    });
    try {
      const { useCartStore: useCartStore2 } = await import("./utils-BiJ8-_Kg.js").then((n) => n._);
      const cartStore = useCartStore2.getState();
      const vouchers = (cartStore.appliedCoupons || []).map((coupon) => coupon.code);
      const testOrderData = this.orderBuilder.buildTestOrder(cartItems, vouchers);
      this.logger.debug("Creating test order with data:", testOrderData);
      console.log("🟢 [OrderManager] Test order data built");
      const order = await this.apiClient.createOrder(testOrderData);
      console.log("🟢 [OrderManager] Test order created:", {
        ref_id: order.ref_id,
        number: order.number,
        is_test: order.is_test
      });
      return order;
    } catch (error) {
      console.error("🔴 [OrderManager] Error creating test order:", error);
      this.logger.error("Failed to create test order:", error);
      throw error;
    }
  }
  handleOrderRedirect(order) {
    this.logger.info("handleOrderRedirect called with order:", {
      ref_id: order.ref_id,
      has_order_status_url: !!order.order_status_url,
      has_payment_complete_url: !!order.payment_complete_url
    });
    try {
      if (!order.ref_id) {
        console.error("🔴 [OrderManager] Cannot redirect: order missing ref_id");
        this.logger.error("Cannot redirect: order missing ref_id");
        this.emitCallback("order:redirect-missing", { order });
        return;
      }
      handleOrderRedirect(order, this.logger, this.emitCallback);
    } catch (error) {
      console.error("🔴 [OrderManager] Error handling order redirect:", error);
      this.logger.error("Error handling order redirect:", error);
      this.emitCallback("order:redirect-missing", { order });
    }
  }
  async handleTokenizedPayment(token, pmData, createOrderCallback) {
    console.log("🟢 [OrderManager] handleTokenizedPayment called with token:", token ? `${token.substring(0, 8)}...` : "none");
    try {
      if (!token) {
        throw new Error("Payment token is required");
      }
      this.logger.debug("Handling tokenized payment", {
        token: token.substring(0, 8) + "...",
        pmData: pmData ? "present" : "missing"
      });
      console.log("🟢 [OrderManager] Calling createOrderCallback...");
      const order = await createOrderCallback();
      console.log("🟢 [OrderManager] Order created via callback:", {
        ref_id: order.ref_id,
        number: order.number
      });
      console.log("🟢 [OrderManager] Emitting order:completed event");
      this.emitCallback("order:completed", order);
      console.log("🟢 [OrderManager] Handling order redirect...");
      this.handleOrderRedirect(order);
    } catch (error) {
      console.error("🔴 [OrderManager] Failed to process tokenized payment:", error);
      this.logger.error("Failed to process tokenized payment:", error);
      throw error;
    }
  }
  // validateOrderData method removed - unused
  /**
   * Get order status for debugging
   */
  async getOrderStatus(refId) {
    try {
      console.log("🟢 [OrderManager] Getting order status for:", refId);
      const order = await this.apiClient.getOrder(refId);
      console.log("🟢 [OrderManager] Order status retrieved:", {
        ref_id: order.ref_id,
        number: order.number,
        total: order.total_incl_tax
      });
      return order;
    } catch (error) {
      console.error("🔴 [OrderManager] Error getting order status:", error);
      this.logger.error("Failed to get order status:", error);
      throw error;
    }
  }
}
export {
  ExpressCheckoutProcessor as E,
  OrderManager as O
};
