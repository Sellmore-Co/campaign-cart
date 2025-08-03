import { c as createLogger, L as Logger, E as EventBus, u as useCartStore, a as useCampaignStore, b as useCheckoutStore, d as configStore, t as testModeManager, e as LogLevel } from "./utils-B9l4NwAb.js";
import { c as create, d as devtools, p as persist } from "./vendor-B25iCwZd.js";
import { ApiClient } from "./api-h0xFYioj.js";
const logger = createLogger("OrderStore");
const initialState$1 = {
  order: null,
  refId: null,
  orderLoadedAt: null,
  isLoading: false,
  isProcessingUpsell: false,
  error: null,
  upsellError: null,
  pendingUpsells: [],
  completedUpsells: [],
  completedUpsellPages: [],
  viewedUpsells: [],
  viewedUpsellPages: [],
  upsellJourney: []
};
const useOrderStore = create()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState$1,
        // Order management
        setOrder: (order) => {
          logger.debug("Setting order data:", order);
          set({
            order,
            error: null,
            orderLoadedAt: Date.now()
          });
        },
        setRefId: (refId) => {
          logger.debug("Setting ref ID:", refId);
          set({ refId });
        },
        loadOrder: async (refId, apiClient) => {
          const state = get();
          if (state.order && state.refId === refId && !get().isOrderExpired()) {
            logger.info("Using cached order data:", refId);
            return;
          }
          if (state.isLoading) {
            logger.warn("Order loading already in progress");
            return;
          }
          logger.info("Loading order:", refId);
          set({ isLoading: true, error: null, refId });
          try {
            const order = await apiClient.getOrder(refId);
            logger.info("Order loaded successfully:", order);
            const upsellPackageIds = [];
            if (order.lines && Array.isArray(order.lines)) {
              order.lines.forEach((line) => {
                if (line.is_upsell && line.product_sku) {
                  const skuMatch = line.product_sku.match(/(\d+)/);
                  if (skuMatch) {
                    upsellPackageIds.push(skuMatch[1]);
                  } else {
                    upsellPackageIds.push(line.product_sku);
                  }
                  logger.debug("Detected upsell line:", {
                    sku: line.product_sku,
                    title: line.product_title,
                    extractedId: skuMatch ? skuMatch[1] : line.product_sku
                  });
                }
              });
            }
            set({
              order,
              isLoading: false,
              isProcessingUpsell: false,
              // Reset processing state when loading order
              error: null,
              orderLoadedAt: Date.now(),
              completedUpsells: upsellPackageIds,
              // Reset journey when loading a new order
              upsellJourney: [],
              viewedUpsells: [],
              viewedUpsellPages: []
            });
            logger.debug("Populated completed upsells from order:", upsellPackageIds);
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Failed to load order";
            logger.error("Failed to load order:", error);
            set({
              isLoading: false,
              error: errorMessage,
              order: null
            });
          }
        },
        clearOrder: () => {
          logger.debug("Clearing order data");
          set({
            order: null,
            refId: null,
            error: null,
            orderLoadedAt: null
          });
        },
        isOrderExpired: () => {
          const state = get();
          if (!state.orderLoadedAt) return true;
          const EXPIRY_TIME = 15 * 60 * 1e3;
          const now = Date.now();
          const isExpired = now - state.orderLoadedAt > EXPIRY_TIME;
          if (isExpired) {
            logger.info("Order data has expired (>15 minutes old)");
          }
          return isExpired;
        },
        // Upsell management
        addUpsell: async (upsellData, apiClient) => {
          const state = get();
          if (!state.refId) {
            const error = "No order reference ID available";
            logger.error(error);
            set({ upsellError: error });
            return null;
          }
          if (state.isProcessingUpsell) {
            logger.warn("Upsell processing already in progress");
            return null;
          }
          logger.info("Adding upsell to order:", state.refId, upsellData);
          set({ isProcessingUpsell: true, upsellError: null });
          try {
            const updatedOrder = await apiClient.addUpsell(state.refId, upsellData);
            logger.info("Upsell added successfully:", updatedOrder);
            const currentPagePath = window.location.pathname;
            const packageIds = upsellData.lines.map((line) => line.package_id.toString());
            const journeyEntries = packageIds.map((id) => ({
              packageId: id,
              pagePath: currentPagePath,
              action: "accepted",
              timestamp: Date.now()
            }));
            set({
              order: updatedOrder,
              isProcessingUpsell: false,
              upsellError: null,
              orderLoadedAt: Date.now(),
              // Refresh the timestamp
              completedUpsells: [...state.completedUpsells, ...packageIds],
              // Keep for backward compatibility
              completedUpsellPages: state.completedUpsellPages.includes(currentPagePath) ? state.completedUpsellPages : [...state.completedUpsellPages, currentPagePath],
              upsellJourney: [...state.upsellJourney, ...journeyEntries]
            });
            return updatedOrder;
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Failed to add upsell";
            logger.error("Failed to add upsell:", error);
            set({
              isProcessingUpsell: false,
              upsellError: errorMessage
            });
            return null;
          }
        },
        addPendingUpsell: (upsellData) => {
          const state = get();
          logger.debug("Adding pending upsell:", upsellData);
          set({
            pendingUpsells: [...state.pendingUpsells, upsellData]
          });
        },
        removePendingUpsell: (index) => {
          const state = get();
          const newPendingUpsells = [...state.pendingUpsells];
          newPendingUpsells.splice(index, 1);
          logger.debug("Removing pending upsell at index:", index);
          set({ pendingUpsells: newPendingUpsells });
        },
        clearPendingUpsells: () => {
          logger.debug("Clearing pending upsells");
          set({ pendingUpsells: [] });
        },
        markUpsellCompleted: (packageId) => {
          const state = get();
          if (!state.completedUpsells.includes(packageId)) {
            logger.debug("Marking upsell as completed:", packageId);
            set({
              completedUpsells: [...state.completedUpsells, packageId]
            });
          }
        },
        markUpsellViewed: (packageId) => {
          const state = get();
          if (!state.viewedUpsells.includes(packageId)) {
            logger.debug("Marking upsell as viewed:", packageId);
            const journeyEntry = {
              packageId,
              action: "viewed",
              timestamp: Date.now()
            };
            set({
              viewedUpsells: [...state.viewedUpsells, packageId],
              upsellJourney: [...state.upsellJourney, journeyEntry]
            });
          }
        },
        markUpsellPageViewed: (pagePath) => {
          const state = get();
          if (!state.viewedUpsellPages.includes(pagePath)) {
            logger.debug("Marking upsell page as viewed:", pagePath);
            const journeyEntry = {
              pagePath,
              action: "viewed",
              timestamp: Date.now()
            };
            set({
              viewedUpsellPages: [...state.viewedUpsellPages, pagePath],
              upsellJourney: [...state.upsellJourney, journeyEntry],
              isProcessingUpsell: false,
              // Reset processing state when viewing new page
              upsellError: null
              // Clear any previous errors
            });
          }
        },
        markUpsellSkipped: (packageId, pagePath) => {
          const state = get();
          logger.debug("Marking upsell as skipped:", { packageId, pagePath });
          const journeyEntry = {
            action: "skipped",
            timestamp: Date.now()
          };
          if (packageId !== void 0) journeyEntry.packageId = packageId;
          if (pagePath !== void 0) journeyEntry.pagePath = pagePath;
          set({
            upsellJourney: [...state.upsellJourney, journeyEntry],
            isProcessingUpsell: false,
            // Reset processing state when skipping
            upsellError: null
            // Clear any errors
          });
        },
        // Error handling
        setError: (error) => set({ error }),
        setUpsellError: (error) => set({ upsellError: error }),
        clearErrors: () => set({ error: null, upsellError: null }),
        // Loading states
        setLoading: (loading) => set({ isLoading: loading }),
        setProcessingUpsell: (processing) => set({ isProcessingUpsell: processing }),
        // Utility methods
        hasUpsellPageBeenCompleted: (pagePath) => {
          const state = get();
          return state.completedUpsellPages.includes(pagePath);
        },
        hasUpsellBeenViewed: (packageId) => {
          const state = get();
          return state.viewedUpsells.includes(packageId);
        },
        hasUpsellPageBeenViewed: (pagePath) => {
          const state = get();
          return state.viewedUpsellPages.includes(pagePath);
        },
        getUpsellJourney: () => {
          const state = get();
          return state.upsellJourney;
        },
        getOrderTotal: () => {
          const state = get();
          if (!state.order) return 0;
          return parseFloat(state.order.total_incl_tax || "0");
        },
        canAddUpsells: () => {
          const state = get();
          return !!(state.order && state.order.supports_post_purchase_upsells && !state.isProcessingUpsell);
        },
        reset: () => {
          logger.debug("Resetting order store");
          set(initialState$1);
        }
      }),
      {
        name: "next-order",
        storage: {
          getItem: (name) => {
            const str = sessionStorage.getItem(name);
            return str ? JSON.parse(str) : null;
          },
          setItem: (name, value) => {
            sessionStorage.setItem(name, JSON.stringify(value));
          },
          removeItem: (name) => {
            sessionStorage.removeItem(name);
          }
        }
      }
    ),
    {
      name: "order-store"
    }
  )
);
class NextCommerce {
  constructor() {
    this.callbacks = /* @__PURE__ */ new Map();
    this.exitIntentEnhancer = null;
    this.fomoEnhancer = null;
    this.logger = new Logger("NextCommerce");
    this.eventBus = EventBus.getInstance();
  }
  static getInstance() {
    if (!NextCommerce.instance) {
      NextCommerce.instance = new NextCommerce();
    }
    return NextCommerce.instance;
  }
  // Cart manipulation methods
  hasItemInCart(options) {
    const cartStore = useCartStore.getState();
    if (options.packageId) {
      return cartStore.items.some((item) => item.packageId === options.packageId);
    }
    return false;
  }
  async addItem(options) {
    const cartStore = useCartStore.getState();
    const quantity = options.quantity ?? 1;
    if (options.packageId) {
      await cartStore.addItem({
        packageId: options.packageId,
        quantity,
        isUpsell: false
      });
    }
  }
  async removeItem(options) {
    const cartStore = useCartStore.getState();
    if (options.packageId) {
      await cartStore.removeItem(options.packageId);
    }
  }
  async updateQuantity(options) {
    const cartStore = useCartStore.getState();
    if (options.packageId) {
      await cartStore.updateQuantity(options.packageId, options.quantity);
    }
  }
  async clearCart() {
    const cartStore = useCartStore.getState();
    await cartStore.clear();
  }
  // Cart data access
  getCartData() {
    const cartStore = useCartStore.getState();
    const campaignStore = useCampaignStore.getState();
    return {
      cartLines: cartStore.enrichedItems,
      cartTotals: cartStore.totals,
      campaignData: campaignStore.data,
      appliedCoupons: cartStore.getCoupons()
    };
  }
  getCartTotals() {
    const cartStore = useCartStore.getState();
    return cartStore.totals;
  }
  getCartCount() {
    const cartStore = useCartStore.getState();
    return cartStore.totalQuantity;
  }
  // Campaign data access
  getCampaignData() {
    const campaignStore = useCampaignStore.getState();
    return campaignStore.data;
  }
  getPackage(id) {
    const campaignStore = useCampaignStore.getState();
    return campaignStore.getPackage(id);
  }
  // Event and callback registration
  on(event, handler) {
    this.eventBus.on(event, handler);
  }
  off(event, handler) {
    this.eventBus.off(event, handler);
  }
  registerCallback(type, callback) {
    if (!this.callbacks.has(type)) {
      this.callbacks.set(type, /* @__PURE__ */ new Set());
    }
    this.callbacks.get(type).add(callback);
  }
  unregisterCallback(type, callback) {
    this.callbacks.get(type)?.delete(callback);
  }
  triggerCallback(type, data) {
    this.callbacks.get(type)?.forEach((callback) => {
      try {
        callback(data);
      } catch (error) {
        this.logger.error(`Callback error for ${type}:`, error);
      }
    });
  }
  // Analytics methods (v2 system)
  async trackViewItemList(packageIds, _listId, listName) {
    queueMicrotask(async () => {
      try {
        const { nextAnalytics } = await import("./utils-B9l4NwAb.js").then((n) => n.m);
        nextAnalytics.trackViewItemList(packageIds, listName);
      } catch (error) {
        this.logger.debug("Analytics tracking failed (non-critical):", error);
      }
    });
  }
  async trackViewItem(packageId) {
    queueMicrotask(async () => {
      try {
        const { nextAnalytics } = await import("./utils-B9l4NwAb.js").then((n) => n.m);
        nextAnalytics.trackViewItem(packageId);
      } catch (error) {
        this.logger.debug("Analytics tracking failed (non-critical):", error);
      }
    });
  }
  async trackAddToCart(packageId, quantity) {
    queueMicrotask(async () => {
      try {
        const { nextAnalytics } = await import("./utils-B9l4NwAb.js").then((n) => n.m);
        const item = {
          id: String(packageId),
          packageId,
          quantity: quantity || 1
        };
        nextAnalytics.trackAddToCart(item);
      } catch (error) {
        this.logger.debug("Analytics tracking failed (non-critical):", error);
      }
    });
  }
  async trackRemoveFromCart(packageId, quantity) {
    queueMicrotask(async () => {
      try {
        const { nextAnalytics, EcommerceEvents } = await import("./utils-B9l4NwAb.js").then((n) => n.m);
        nextAnalytics.track(EcommerceEvents.createRemoveFromCartEvent({ packageId, quantity: quantity || 1 }));
      } catch (error) {
        this.logger.debug("Analytics tracking failed (non-critical):", error);
      }
    });
  }
  async trackBeginCheckout() {
    queueMicrotask(async () => {
      try {
        const { nextAnalytics } = await import("./utils-B9l4NwAb.js").then((n) => n.m);
        nextAnalytics.trackBeginCheckout();
      } catch (error) {
        this.logger.debug("Analytics tracking failed (non-critical):", error);
      }
    });
  }
  async trackPurchase(orderData) {
    queueMicrotask(async () => {
      try {
        const { nextAnalytics } = await import("./utils-B9l4NwAb.js").then((n) => n.m);
        nextAnalytics.trackPurchase(orderData);
      } catch (error) {
        this.logger.debug("Analytics tracking failed (non-critical):", error);
      }
    });
  }
  async trackCustomEvent(eventName, data) {
    queueMicrotask(async () => {
      try {
        const { nextAnalytics } = await import("./utils-B9l4NwAb.js").then((n) => n.m);
        nextAnalytics.track({ event: eventName, ...data });
      } catch (error) {
        this.logger.debug("Analytics tracking failed (non-critical):", error);
      }
    });
  }
  // User tracking methods
  async trackSignUp(email) {
    queueMicrotask(async () => {
      try {
        const { nextAnalytics } = await import("./utils-B9l4NwAb.js").then((n) => n.m);
        nextAnalytics.trackSignUp(email);
      } catch (error) {
        this.logger.debug("Analytics tracking failed (non-critical):", error);
      }
    });
  }
  async trackLogin(email) {
    queueMicrotask(async () => {
      try {
        const { nextAnalytics } = await import("./utils-B9l4NwAb.js").then((n) => n.m);
        nextAnalytics.trackLogin(email);
      } catch (error) {
        this.logger.debug("Analytics tracking failed (non-critical):", error);
      }
    });
  }
  // Advanced analytics methods
  async setDebugMode(enabled) {
    queueMicrotask(async () => {
      try {
        const { nextAnalytics } = await import("./utils-B9l4NwAb.js").then((n) => n.m);
        nextAnalytics.setDebugMode(enabled);
      } catch (error) {
        this.logger.debug("Analytics debug mode failed (non-critical):", error);
      }
    });
  }
  async invalidateAnalyticsContext() {
    queueMicrotask(async () => {
      try {
        const { nextAnalytics } = await import("./utils-B9l4NwAb.js").then((n) => n.m);
        nextAnalytics.invalidateContext();
      } catch (error) {
        this.logger.debug("Analytics context invalidation failed (non-critical):", error);
      }
    });
  }
  // Shipping methods
  getShippingMethods() {
    const campaignStore = useCampaignStore.getState();
    return campaignStore.data?.shipping_methods || [];
  }
  getSelectedShippingMethod() {
    const checkoutStore = useCheckoutStore.getState();
    return checkoutStore.shippingMethod || null;
  }
  async setShippingMethod(methodId) {
    const cartStore = useCartStore.getState();
    await cartStore.setShippingMethod(methodId);
  }
  // Utility methods
  formatPrice(amount, currency) {
    const campaignStore = useCampaignStore.getState();
    const useCurrency = currency ?? campaignStore.data?.currency ?? "USD";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: useCurrency
    }).format(amount);
  }
  validateCheckout() {
    const cartStore = useCartStore.getState();
    const errors = [];
    if (cartStore.items.length === 0) {
      errors.push("Cart is empty");
    }
    return {
      valid: errors.length === 0,
      errors
    };
  }
  // Coupon methods
  async applyCoupon(code) {
    const cartStore = useCartStore.getState();
    return await cartStore.applyCoupon(code);
  }
  removeCoupon(code) {
    const cartStore = useCartStore.getState();
    cartStore.removeCoupon(code);
  }
  getCoupons() {
    const cartStore = useCartStore.getState();
    return cartStore.getCoupons();
  }
  validateCoupon(code) {
    const cartStore = useCartStore.getState();
    return cartStore.validateCoupon(code);
  }
  calculateDiscountAmount(coupon) {
    const cartStore = useCartStore.getState();
    return cartStore.calculateDiscountAmount(coupon);
  }
  // Exit Intent - Simple approach
  async exitIntent(options) {
    try {
      if (!this.exitIntentEnhancer) {
        const { ExitIntentEnhancer } = await import("./SimpleExitIntentEnhancer-DXieRti3.js");
        this.exitIntentEnhancer = new ExitIntentEnhancer();
        await this.exitIntentEnhancer.initialize();
      }
      this.exitIntentEnhancer.setup(options);
      this.logger.debug("Exit intent configured with image:", options.image);
    } catch (error) {
      this.logger.error("Failed to setup exit intent:", error);
      throw error;
    }
  }
  disableExitIntent() {
    if (this.exitIntentEnhancer) {
      this.exitIntentEnhancer.disable();
    }
  }
  async fomo(config) {
    try {
      if (!this.fomoEnhancer) {
        const { FomoPopupEnhancer } = await import("./FomoPopupEnhancer-BxjGbxGJ.js");
        this.fomoEnhancer = new FomoPopupEnhancer();
        await this.fomoEnhancer.initialize();
      }
      this.fomoEnhancer.setup(config);
      this.fomoEnhancer.start();
      this.logger.debug("FOMO popup started");
    } catch (error) {
      this.logger.error("Failed to start FOMO popup:", error);
      throw error;
    }
  }
  stopFomo() {
    if (this.fomoEnhancer) {
      this.fomoEnhancer.stop();
    }
  }
  // Upsell methods
  async addUpsell(options) {
    const orderStore = useOrderStore.getState();
    const configStore$1 = configStore.getState();
    if (!orderStore.order) {
      throw new Error("No order found. Upsells can only be added after order completion.");
    }
    if (!orderStore.canAddUpsells()) {
      throw new Error("Order does not support post-purchase upsells or is currently processing.");
    }
    const apiClient = new ApiClient(configStore$1.apiKey);
    let lines = [];
    if (options.items && options.items.length > 0) {
      lines = options.items.map((item) => ({
        package_id: item.packageId,
        quantity: item.quantity || 1
      }));
    } else if (options.packageId) {
      lines = [{
        package_id: options.packageId,
        quantity: options.quantity || 1
      }];
    } else {
      throw new Error("Either packageId or items array must be provided");
    }
    const upsellData = { lines };
    this.logger.info("Adding upsell(s) via SDK:", upsellData);
    try {
      const previousLineIds = orderStore.order?.lines?.map((line) => line.id) || [];
      const updatedOrder = await orderStore.addUpsell(upsellData, apiClient);
      if (!updatedOrder) {
        throw new Error("Failed to add upsell - no updated order returned");
      }
      const addedLines = updatedOrder.lines?.filter(
        (line) => line.is_upsell && !previousLineIds.includes(line.id)
      ) || [];
      const totalUpsellValue = addedLines.reduce((sum, line) => {
        return sum + (line.price_incl_tax ? parseFloat(line.price_incl_tax) : 0);
      }, 0);
      lines.forEach((line, index) => {
        const addedLine = addedLines[index];
        const value = addedLine?.price_incl_tax ? parseFloat(addedLine.price_incl_tax) : 0;
        this.eventBus.emit("upsell:added", {
          packageId: line.package_id,
          quantity: line.quantity,
          order: updatedOrder,
          value
        });
      });
      return {
        order: updatedOrder,
        addedLines,
        totalValue: totalUpsellValue
      };
    } catch (error) {
      this.logger.error("Failed to add upsell(s) via SDK:", error);
      throw error;
    }
  }
  canAddUpsells() {
    const orderStore = useOrderStore.getState();
    return orderStore.canAddUpsells();
  }
  getCompletedUpsells() {
    const orderStore = useOrderStore.getState();
    return orderStore.completedUpsells;
  }
  isUpsellAlreadyAdded(packageId) {
    const orderStore = useOrderStore.getState();
    if (orderStore.completedUpsells.includes(packageId.toString())) {
      return true;
    }
    const acceptedInJourney = orderStore.upsellJourney.some(
      (entry) => entry.packageId === packageId.toString() && entry.action === "accepted"
    );
    return acceptedInJourney;
  }
}
const initialState = {
  // Attribution fields
  affiliate: "",
  funnel: "",
  gclid: "",
  utm_source: "",
  utm_medium: "",
  utm_campaign: "",
  utm_content: "",
  utm_term: "",
  subaffiliate1: "",
  subaffiliate2: "",
  subaffiliate3: "",
  subaffiliate4: "",
  subaffiliate5: "",
  // Metadata
  metadata: {
    landing_page: "",
    referrer: "",
    device: "",
    device_type: "desktop",
    domain: "",
    timestamp: Date.now()
  },
  // Timestamps
  first_visit_timestamp: Date.now(),
  current_visit_timestamp: Date.now()
};
const useAttributionStore = create()(
  persist(
    (set, get) => ({
      ...initialState,
      initialize: async () => {
        try {
          const { AttributionCollector } = await import("./utils-B9l4NwAb.js").then((n) => n.A);
          const collector = new AttributionCollector();
          const data = await collector.collect();
          set((state) => ({
            ...state,
            ...data,
            // Preserve first visit timestamp if it exists
            first_visit_timestamp: state.first_visit_timestamp || data.first_visit_timestamp
          }));
        } catch (error) {
          console.error("[AttributionStore] Error initializing attribution:", error);
        }
      },
      updateAttribution: (data) => {
        set((state) => ({
          ...state,
          ...data,
          metadata: data.metadata ? { ...state.metadata, ...data.metadata } : state.metadata,
          current_visit_timestamp: Date.now()
        }));
      },
      setFunnelName: (funnel) => {
        if (!funnel) {
          console.warn("[AttributionStore] Cannot set empty funnel name");
          return;
        }
        const currentState = get();
        if (currentState.funnel) {
          console.info(`[AttributionStore] Funnel already set to: ${currentState.funnel}, ignoring new value: ${funnel}`);
          return;
        }
        const persistedFunnel = localStorage.getItem("next_funnel_name") || sessionStorage.getItem("next_funnel_name");
        if (persistedFunnel) {
          console.info(`[AttributionStore] Funnel already persisted as: ${persistedFunnel}, ignoring new value: ${funnel}`);
          set({ funnel: persistedFunnel });
          return;
        }
        set({ funnel });
        try {
          sessionStorage.setItem("next_funnel_name", funnel);
          localStorage.setItem("next_funnel_name", funnel);
          console.info(`[AttributionStore] Funnel name set and persisted: ${funnel}`);
        } catch (error) {
          console.error("[AttributionStore] Error persisting funnel name:", error);
        }
      },
      setEverflowClickId: (evclid) => {
        if (!evclid) {
          console.warn("[AttributionStore] Cannot set empty Everflow click ID");
          return;
        }
        localStorage.setItem("evclid", evclid);
        sessionStorage.setItem("evclid", evclid);
        set((state) => ({
          ...state,
          metadata: {
            ...state.metadata,
            everflow_transaction_id: evclid
          }
        }));
        console.info(`[AttributionStore] Everflow click ID set to: ${evclid}`);
      },
      getAttributionForApi: () => {
        const state = get();
        const attribution = {};
        if (state.affiliate !== void 0) attribution.affiliate = state.affiliate;
        if (state.funnel !== void 0) attribution.funnel = state.funnel;
        if (state.gclid !== void 0) attribution.gclid = state.gclid;
        if (state.metadata !== void 0) attribution.metadata = state.metadata;
        if (state.utm_source !== void 0) attribution.utm_source = state.utm_source;
        if (state.utm_medium !== void 0) attribution.utm_medium = state.utm_medium;
        if (state.utm_campaign !== void 0) attribution.utm_campaign = state.utm_campaign;
        if (state.utm_content !== void 0) attribution.utm_content = state.utm_content;
        if (state.utm_term !== void 0) attribution.utm_term = state.utm_term;
        if (state.subaffiliate1 !== void 0) attribution.subaffiliate1 = state.subaffiliate1;
        if (state.subaffiliate2 !== void 0) attribution.subaffiliate2 = state.subaffiliate2;
        if (state.subaffiliate3 !== void 0) attribution.subaffiliate3 = state.subaffiliate3;
        if (state.subaffiliate4 !== void 0) attribution.subaffiliate4 = state.subaffiliate4;
        if (state.subaffiliate5 !== void 0) attribution.subaffiliate5 = state.subaffiliate5;
        if (state.metadata.everflow_transaction_id) {
          attribution.everflow_transaction_id = state.metadata.everflow_transaction_id;
        }
        return attribution;
      },
      debug: () => {
        const state = get();
        console.group("🔍 Attribution Debug Info");
        console.log("📊 Key Attribution Values:");
        console.log("- Affiliate:", state.affiliate || "(not set)");
        console.log("- Funnel:", state.funnel || "(not set)");
        console.log("- GCLID:", state.gclid || "(not set)");
        console.log("\n📈 UTM Parameters:");
        console.log("- Source:", state.utm_source || "(not set)");
        console.log("- Medium:", state.utm_medium || "(not set)");
        console.log("- Campaign:", state.utm_campaign || "(not set)");
        console.log("- Content:", state.utm_content || "(not set)");
        console.log("- Term:", state.utm_term || "(not set)");
        console.log("\n👥 Subaffiliates:");
        for (let i = 1; i <= 5; i++) {
          const key = `subaffiliate${i}`;
          console.log(`- Subaffiliate ${i}:`, state[key] || "(not set)");
        }
        console.log("\n🔄 Everflow:");
        console.log("- Transaction ID:", state.metadata.everflow_transaction_id || "(not set)");
        console.log("- SG EVCLID:", state.metadata.sg_evclid || "(not set)");
        console.log("- localStorage evclid:", localStorage.getItem("evclid") || "(not set)");
        console.log("- sessionStorage evclid:", sessionStorage.getItem("evclid") || "(not set)");
        console.log("\n📘 Facebook:");
        console.log("- fbclid:", state.metadata.fbclid || "(not set)");
        console.log("- fb_fbp:", state.metadata.fb_fbp || "(not set)");
        console.log("- fb_fbc:", state.metadata.fb_fbc || "(not set)");
        console.log("- fb_pixel_id:", state.metadata.fb_pixel_id || "(not set)");
        console.log("\n📋 Metadata:");
        console.log("- Landing Page:", state.metadata.landing_page);
        console.log("- Referrer:", state.metadata.referrer || "(direct)");
        console.log("- Domain:", state.metadata.domain);
        console.log("- Device Type:", state.metadata.device_type);
        console.log("- First Visit:", new Date(state.first_visit_timestamp).toLocaleString());
        console.log("- Current Visit:", new Date(state.current_visit_timestamp).toLocaleString());
        if (state.metadata.conversion_timestamp) {
          console.log("- Conversion Time:", new Date(state.metadata.conversion_timestamp).toLocaleString());
        }
        console.log("\n📤 API Format:");
        console.log(JSON.stringify(get().getAttributionForApi(), null, 2));
        console.log("\n🔗 Current URL Parameters:");
        console.log(window.location.search || "(none)");
        console.groupEnd();
        return "Attribution debug info logged to console.";
      },
      reset: () => {
        set(initialState);
      },
      clearPersistedFunnel: () => {
        try {
          localStorage.removeItem("next_funnel_name");
          sessionStorage.removeItem("next_funnel_name");
          set({ funnel: "" });
          console.info("[AttributionStore] Cleared persisted funnel name");
        } catch (error) {
          console.error("[AttributionStore] Error clearing persisted funnel:", error);
        }
      }
    }),
    {
      name: "next-attribution",
      storage: {
        getItem: (name) => {
          const str = sessionStorage.getItem(name);
          return str ? JSON.parse(str) : null;
        },
        setItem: (name, value) => {
          sessionStorage.setItem(name, JSON.stringify(value));
        },
        removeItem: (name) => {
          sessionStorage.removeItem(name);
        }
      }
    }
  )
);
const _AttributeParser = class _AttributeParser {
  static parseDataAttribute(element, attribute) {
    const value = element.getAttribute(attribute);
    return {
      raw: value,
      parsed: this.parseValue(value),
      type: this.inferType(value)
    };
  }
  static parseValue(value) {
    if (value === null || value === "") {
      return null;
    }
    if (value.startsWith("{") || value.startsWith("[")) {
      try {
        return JSON.parse(value);
      } catch {
      }
    }
    if (value === "true") return true;
    if (value === "false") return false;
    if (/^-?\d+(\.\d+)?$/.test(value)) {
      const num = parseFloat(value);
      return Number.isNaN(num) ? value : num;
    }
    return value;
  }
  static inferType(value) {
    if (value === null || value === "") {
      return "string";
    }
    if (value === "true" || value === "false") {
      return "boolean";
    }
    if (/^-?\d+(\.\d+)?$/.test(value)) {
      return "number";
    }
    if (value.startsWith("{") && value.endsWith("}")) {
      return "object";
    }
    if (value.startsWith("[") && value.endsWith("]")) {
      return "array";
    }
    return "string";
  }
  static getEnhancerTypes(element) {
    const types = [];
    if (element.hasAttribute("data-next-display")) {
      types.push("display");
    }
    if (element.hasAttribute("data-next-toggle")) {
      types.push("toggle");
    }
    if (element.hasAttribute("data-next-action")) {
      types.push("action");
    }
    if (element.hasAttribute("data-next-timer")) {
      types.push("timer");
    }
    if (element.hasAttribute("data-next-show") || element.hasAttribute("data-next-hide")) {
      types.push("conditional");
    }
    if (element instanceof HTMLFormElement && element.hasAttribute("data-next-checkout")) {
      types.push("checkout");
    }
    if (element.hasAttribute("data-next-express-checkout")) {
      const checkoutType = element.getAttribute("data-next-express-checkout");
      if (checkoutType === "container") {
        types.push("express-checkout-container");
      } else if (checkoutType === "paypal" || checkoutType === "apple_pay" || checkoutType === "google_pay") {
        types.push("express-checkout");
      }
    }
    if (element.hasAttribute("data-next-cart-items")) {
      types.push("cart-items");
    }
    if (element.hasAttribute("data-next-order-items")) {
      types.push("order-items");
    }
    if (element.hasAttribute("data-next-quantity")) {
      const quantityAction = element.getAttribute("data-next-quantity");
      if (quantityAction && ["increase", "decrease", "set"].includes(quantityAction)) {
        types.push("quantity");
      }
    }
    if (element.hasAttribute("data-next-remove-item")) {
      types.push("remove-item");
    }
    if (element.hasAttribute("data-next-selector") || element.hasAttribute("data-next-cart-selector") || element.hasAttribute("data-next-selector-id") && !element.hasAttribute("data-next-action")) {
      types.push("selector");
    }
    if (element.hasAttribute("data-next-upsell") || element.hasAttribute("data-next-upsell-selector") || element.hasAttribute("data-next-upsell-select")) {
      types.push("upsell");
    }
    if (element.hasAttribute("data-next-coupon")) {
      const couponType = element.getAttribute("data-next-coupon");
      if (couponType === "input" || couponType === "") {
        types.push("coupon");
      }
    }
    if (element.hasAttribute("data-next-accordion")) {
      types.push("accordion");
    }
    if (element.hasAttribute("data-next-tooltip")) {
      types.push("tooltip");
    }
    if (element.hasAttribute("data-next-component") && element.getAttribute("data-next-component") === "scroll-hint") {
      types.push("scroll-hint");
    }
    return [...new Set(types)];
  }
  static parseDisplayPath(path) {
    const parts = path.split(".");
    if (parts.length === 1) {
      return { object: "cart", property: parts[0] ?? "" };
    }
    return {
      object: parts[0] ?? "cart",
      property: parts.slice(1).join(".")
    };
  }
  static parseCondition(condition) {
    try {
      if (condition.includes("(") && condition.includes(")")) {
        const match = condition.match(/^(\w+)\.(\w+)\(([^)]*)\)$/);
        if (match) {
          return {
            type: "function",
            object: match[1] ?? "",
            method: match[2] ?? "",
            args: match[3] ? match[3].split(",").map((arg) => this.parseValue(arg.trim())) : []
          };
        }
      }
      if (condition.includes(" ")) {
        const operators = [">=", "<=", ">", "<", "===", "==", "!==", "!="];
        for (const op of operators) {
          if (condition.includes(op)) {
            const [left, right] = condition.split(op).map((s) => s.trim());
            return {
              type: "comparison",
              left: this.parseDisplayPath(left ?? ""),
              operator: op,
              right: this.parseValue(right ?? "")
            };
          }
        }
      }
      return {
        type: "property",
        ...this.parseDisplayPath(condition)
      };
    } catch (error) {
      this.logger.error("Failed to parse condition:", condition, error);
      return { type: "property", object: "cart", property: "isEmpty" };
    }
  }
};
_AttributeParser.logger = createLogger("AttributeParser");
let AttributeParser = _AttributeParser;
class DOMObserver {
  constructor(config = {}) {
    this.handlers = /* @__PURE__ */ new Set();
    this.isObserving = false;
    this.pendingChanges = /* @__PURE__ */ new Set();
    this.logger = createLogger("DOMObserver");
    this.config = {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: [
        "data-next-display",
        "data-next-toggle",
        "data-next-timer",
        "data-next-show",
        "data-next-hide",
        "data-next-checkout",
        "data-next-validate",
        "data-next-express-checkout"
      ],
      ...config
    };
    this.observer = new MutationObserver(this.handleMutations.bind(this));
  }
  /**
   * Add a change handler
   */
  addHandler(handler) {
    this.handlers.add(handler);
    this.logger.debug(`Added handler, total: ${this.handlers.size}`);
  }
  /**
   * Remove a change handler
   */
  removeHandler(handler) {
    this.handlers.delete(handler);
    this.logger.debug(`Removed handler, total: ${this.handlers.size}`);
  }
  /**
   * Start observing DOM changes
   */
  start(target = document.body) {
    if (this.isObserving) {
      this.logger.warn("Already observing, ignoring start request");
      return;
    }
    try {
      this.observer.observe(target, this.config);
      this.isObserving = true;
      this.logger.debug("Started observing DOM changes", { target: target.tagName });
    } catch (error) {
      this.logger.error("Failed to start DOM observation:", error);
    }
  }
  /**
   * Stop observing DOM changes
   */
  stop() {
    if (!this.isObserving) {
      return;
    }
    this.observer.disconnect();
    this.isObserving = false;
    this.clearThrottle();
    this.pendingChanges.clear();
    this.logger.debug("Stopped observing DOM changes");
  }
  /**
   * Temporarily pause observation
   */
  pause() {
    if (this.isObserving) {
      this.observer.disconnect();
      this.isObserving = false;
      this.logger.debug("Paused DOM observation");
    }
  }
  /**
   * Resume observation after pause
   */
  resume(target = document.body) {
    if (!this.isObserving) {
      this.start(target);
      this.logger.debug("Resumed DOM observation");
    }
  }
  /**
   * Check if currently observing
   */
  isActive() {
    return this.isObserving;
  }
  /**
   * Handle mutation records from MutationObserver
   */
  handleMutations(mutations) {
    const relevantMutations = mutations.filter((mutation) => this.isRelevantMutation(mutation));
    if (relevantMutations.length === 0) {
      return;
    }
    this.logger.debug(`Processing ${relevantMutations.length} relevant mutations`);
    for (const mutation of relevantMutations) {
      this.processMutation(mutation);
    }
    this.throttleNotifications();
  }
  /**
   * Check if a mutation is relevant to our data attributes
   */
  isRelevantMutation(mutation) {
    switch (mutation.type) {
      case "childList":
        return this.hasRelevantNodes(mutation.addedNodes) || this.hasRelevantNodes(mutation.removedNodes);
      case "attributes":
        const attrName = mutation.attributeName;
        return attrName !== null && this.config.attributeFilter?.includes(attrName) === true;
      default:
        return false;
    }
  }
  /**
   * Check if a NodeList contains relevant elements
   */
  hasRelevantNodes(nodeList) {
    for (const node of nodeList) {
      if (node instanceof HTMLElement) {
        if (this.hasRelevantAttributes(node) || this.hasRelevantDescendants(node)) {
          return true;
        }
      }
    }
    return false;
  }
  /**
   * Check if an element has relevant data attributes
   */
  hasRelevantAttributes(element) {
    return this.config.attributeFilter?.some((attr) => element.hasAttribute(attr)) === true;
  }
  /**
   * Check if an element has descendants with relevant attributes
   */
  hasRelevantDescendants(element) {
    if (!this.config.attributeFilter) return false;
    const selector = this.config.attributeFilter.map((attr) => `[${attr}]`).join(",");
    return element.querySelector(selector) !== null;
  }
  /**
   * Process a single mutation record
   */
  processMutation(mutation) {
    switch (mutation.type) {
      case "childList":
        this.processChildListMutation(mutation);
        break;
      case "attributes":
        this.processAttributeMutation(mutation);
        break;
    }
  }
  /**
   * Process child list mutations (added/removed nodes)
   */
  processChildListMutation(mutation) {
    for (const node of mutation.addedNodes) {
      if (node instanceof HTMLElement) {
        this.addElementForProcessing(node, "added");
        if (this.config.attributeFilter) {
          const selector = this.config.attributeFilter.map((attr) => `[${attr}]`).join(",");
          const descendants = node.querySelectorAll(selector);
          descendants.forEach((desc) => {
            if (desc instanceof HTMLElement) {
              this.addElementForProcessing(desc, "added");
            }
          });
        }
      }
    }
    for (const node of mutation.removedNodes) {
      if (node instanceof HTMLElement) {
        this.addElementForProcessing(node, "removed");
      }
    }
  }
  /**
   * Process attribute mutations
   */
  processAttributeMutation(mutation) {
    if (mutation.target instanceof HTMLElement && mutation.attributeName) {
      const element = mutation.target;
      const attributeName = mutation.attributeName;
      const oldValue = mutation.oldValue;
      const newValue = element.getAttribute(attributeName);
      this.notifyHandlers({
        type: "attributeChanged",
        element,
        attributeName,
        oldValue: oldValue || void 0,
        newValue: newValue || void 0
      });
    }
  }
  /**
   * Add an element to the pending changes queue
   */
  addElementForProcessing(element, type) {
    if (this.hasRelevantAttributes(element)) {
      this.pendingChanges.add(element);
      if (type === "removed") {
        this.notifyHandlers({
          type: "removed",
          element,
          attributeName: void 0,
          oldValue: void 0,
          newValue: void 0
        });
      }
    }
  }
  /**
   * Throttle notifications to avoid excessive processing
   */
  throttleNotifications() {
    if (this.throttleTimeout) {
      return;
    }
    this.throttleTimeout = window.setTimeout(() => {
      this.processePendingChanges();
      this.throttleTimeout = void 0;
    }, 16);
  }
  /**
   * Process all pending changes
   */
  processePendingChanges() {
    if (this.pendingChanges.size === 0) {
      return;
    }
    this.logger.debug(`Processing ${this.pendingChanges.size} pending changes`);
    for (const element of this.pendingChanges) {
      this.notifyHandlers({
        type: "added",
        element,
        attributeName: void 0,
        oldValue: void 0,
        newValue: void 0
      });
    }
    this.pendingChanges.clear();
  }
  /**
   * Notify all handlers of a change
   */
  notifyHandlers(event) {
    for (const handler of this.handlers) {
      try {
        handler(event);
      } catch (error) {
        this.logger.error("Handler error:", error);
      }
    }
  }
  /**
   * Clear throttle timeout
   */
  clearThrottle() {
    if (this.throttleTimeout) {
      clearTimeout(this.throttleTimeout);
      this.throttleTimeout = void 0;
    }
  }
  /**
   * Cleanup and destroy observer
   */
  destroy() {
    this.stop();
    this.handlers.clear();
    this.logger.debug("DOM observer destroyed");
  }
  /**
   * Get current configuration
   */
  getConfig() {
    return { ...this.config };
  }
  /**
   * Update configuration (requires restart)
   */
  updateConfig(newConfig) {
    const wasObserving = this.isObserving;
    let target;
    if (wasObserving) {
      target = document.body;
      this.stop();
    }
    this.config = { ...this.config, ...newConfig };
    if (wasObserving && target) {
      this.start(target);
    }
    this.logger.debug("Updated configuration", this.config);
  }
}
class AttributeScanner {
  constructor() {
    this.enhancers = /* @__PURE__ */ new WeakMap();
    this.enhancerCount = 0;
    this.isScanning = false;
    this.scanQueue = /* @__PURE__ */ new Set();
    this.enhancerStats = /* @__PURE__ */ new Map();
    this.isDebugMode = false;
    this.processQueueDebounced = this.debounce(() => {
      this.processQueue();
    }, 50);
    this.logger = createLogger("AttributeScanner");
    this.domObserver = new DOMObserver();
    this.domObserver.addHandler(this.handleDOMChange.bind(this));
    this.isDebugMode = new URLSearchParams(location.search).get("debug") === "true";
    if (this.isDebugMode) {
      console.log("🐛 AttributeScanner: Debug mode enabled for performance tracking");
    }
  }
  async scanAndEnhance(root) {
    if (this.isScanning) {
      this.logger.warn("Already scanning, queuing request");
      return;
    }
    this.isScanning = true;
    this.logger.debug("Scanning for data attributes...", { root: root.tagName });
    try {
      const selector = [
        "[data-next-display]",
        "[data-next-toggle]",
        "[data-next-action]",
        "[data-next-timer]",
        "[data-next-show]",
        "[data-next-hide]",
        "form[data-next-checkout]",
        "[data-next-express-checkout]",
        "[data-next-timer-display]",
        "[data-next-timer-expired]",
        "[data-next-cart-items]",
        "[data-next-order-items]",
        '[data-next-quantity="increase"]',
        '[data-next-quantity="decrease"]',
        '[data-next-quantity="set"]',
        "[data-next-remove-item]",
        "[data-next-selector]",
        "[data-next-selector-id]",
        "[data-next-cart-selector]",
        "[data-next-upsell]",
        "[data-next-upsell-selector]",
        "[data-next-upsell-select]",
        '[data-next-coupon="input"]',
        '[data-next-coupon=""]',
        "[data-next-accordion]",
        "[data-next-tooltip]",
        '[data-next-express-checkout="container"]',
        '[data-next-component="scroll-hint"]'
      ].join(", ");
      const elements = root.querySelectorAll(selector);
      this.logger.debug(`Found ${elements.length} elements with data attributes`);
      let enhancedCount = 0;
      const enhancePromises = [];
      const batchSize = 10;
      for (let i = 0; i < elements.length; i += batchSize) {
        const batch = Array.from(elements).slice(i, i + batchSize);
        for (const element of batch) {
          if (element instanceof HTMLElement) {
            enhancePromises.push(
              this.enhanceElement(element).then(() => {
                enhancedCount++;
              })
            );
          }
        }
        await Promise.all(enhancePromises.splice(0, batchSize));
        if (i + batchSize < elements.length) {
          await new Promise((resolve) => setTimeout(resolve, 0));
        }
      }
      await Promise.all(enhancePromises);
      this.logger.debug(`Enhanced ${enhancedCount} elements successfully`);
      if (this.isDebugMode && this.enhancerStats.size > 0) {
        this.showPerformanceReport();
      }
      document.documentElement.classList.add("next-display-ready");
      this.logger.debug("Added next-display-ready class to HTML element");
      window.dispatchEvent(new CustomEvent("next:display-ready", {
        detail: {
          enhancedCount,
          root: root.tagName
        }
      }));
      this.startObserving(root);
    } catch (error) {
      this.logger.error("Error during scan and enhance:", error);
    } finally {
      this.isScanning = false;
    }
  }
  async enhanceElement(element) {
    if (this.enhancers.has(element)) {
      this.logger.debug("Element already enhanced, skipping", element);
      return;
    }
    const cartItemsContainer = element.closest("[data-next-cart-items]");
    if (cartItemsContainer && cartItemsContainer !== element) {
      this.logger.debug("Skipping element inside cart items template", element);
      return;
    }
    const packageId = element.getAttribute("data-package-id");
    if (packageId && packageId.includes("{") && packageId.includes("}")) {
      this.logger.debug("Skipping element with template variable", element, packageId);
      return;
    }
    try {
      const enhancerTypes = AttributeParser.getEnhancerTypes(element);
      if (enhancerTypes.length === 0) {
        this.logger.debug("No enhancer types found for element", element);
        return;
      }
      const elementEnhancers = [];
      for (const type of enhancerTypes) {
        const enhancer = await this.createEnhancer(type, element);
        if (enhancer) {
          elementEnhancers.push(enhancer);
          try {
            if (this.isDebugMode) {
              const enhancerStart = performance.now();
              await enhancer.initialize();
              const enhancerTime = performance.now() - enhancerStart;
              this.updateEnhancerStats(type, enhancerTime);
              this.logger.debug(`Initialized ${type} enhancer for element`, element);
            } else {
              await enhancer.initialize();
              this.logger.debug(`Initialized ${type} enhancer for element`, element);
            }
          } catch (initError) {
            this.logger.error(`Failed to initialize ${type} enhancer:`, initError, element);
            enhancer.destroy();
          }
        }
      }
      if (elementEnhancers.length > 0) {
        this.enhancers.set(element, elementEnhancers);
        this.enhancerCount += elementEnhancers.length;
        this.logger.debug(`Enhanced element with ${elementEnhancers.length} enhancer(s)`, {
          element: element.tagName,
          types: enhancerTypes,
          attributes: Array.from(element.attributes).map((attr) => attr.name)
        });
      }
    } catch (error) {
      this.logger.error("Failed to enhance element:", error, element);
    }
  }
  async createEnhancer(type, element) {
    try {
      switch (type) {
        case "display":
          const displayPath = element.getAttribute("data-next-display") || "";
          const parsed = AttributeParser.parseDisplayPath(displayPath);
          this.logger.debug(`Creating display enhancer for path: "${displayPath}"`, {
            parsed,
            element: element.tagName,
            elementHtml: element.outerHTML.substring(0, 200) + "..."
          });
          if (parsed.object === "cart") {
            this.logger.debug("Using CartDisplayEnhancer");
            const { CartDisplayEnhancer } = await import("./CartDisplayEnhancer-DJu3jcPS.js");
            return new CartDisplayEnhancer(element);
          } else if (parsed.object === "selection") {
            this.logger.debug("Using SelectionDisplayEnhancer");
            const { SelectionDisplayEnhancer } = await import("./SelectionDisplayEnhancer-C7UVIrWF.js");
            return new SelectionDisplayEnhancer(element);
          } else if (parsed.object === "package" || parsed.object === "campaign") {
            this.logger.debug("Using ProductDisplayEnhancer");
            const { ProductDisplayEnhancer } = await import("./ProductDisplayEnhancer-CMtY-i7Q.js");
            return new ProductDisplayEnhancer(element);
          } else if (parsed.object === "order") {
            this.logger.debug("Using OrderDisplayEnhancer");
            const { OrderDisplayEnhancer } = await import("./OrderDisplayEnhancer-etaRT6QW.js");
            return new OrderDisplayEnhancer(element);
          } else if (parsed.object === "shipping") {
            this.logger.debug("Using ShippingDisplayEnhancer");
            const { ShippingDisplayEnhancer } = await import("./ShippingDisplayEnhancer-C-cVrEok.js");
            return new ShippingDisplayEnhancer(element);
          } else {
            let currentElement = element.parentElement;
            let hasPackageContext = false;
            while (currentElement && !hasPackageContext) {
              if (currentElement.hasAttribute("data-next-package-id") || currentElement.hasAttribute("data-next-package") || currentElement.hasAttribute("data-package-id")) {
                hasPackageContext = true;
              }
              currentElement = currentElement.parentElement;
            }
            if (hasPackageContext) {
              this.logger.debug(`Using ProductDisplayEnhancer (fallback with package context)`);
              const { ProductDisplayEnhancer } = await import("./ProductDisplayEnhancer-CMtY-i7Q.js");
              return new ProductDisplayEnhancer(element);
            } else {
              this.logger.debug(`Using CartDisplayEnhancer (fallback without package context)`);
              const { CartDisplayEnhancer } = await import("./CartDisplayEnhancer-DJu3jcPS.js");
              return new CartDisplayEnhancer(element);
            }
          }
        case "toggle":
          const { CartToggleEnhancer } = await import("./CartToggleEnhancer-BXRzqsTi.js");
          return new CartToggleEnhancer(element);
        case "action":
          const action = element.getAttribute("data-next-action");
          switch (action) {
            case "add-to-cart":
              const { AddToCartEnhancer } = await import("./AddToCartEnhancer-ygbxk5VT.js");
              return new AddToCartEnhancer(element);
            case "accept-upsell":
              const { AcceptUpsellEnhancer } = await import("./AcceptUpsellEnhancer-BxlZxjzN.js");
              return new AcceptUpsellEnhancer(element);
            default:
              this.logger.warn(`Unknown action type: ${action}`);
              return null;
          }
        case "selector":
          const { PackageSelectorEnhancer } = await import("./PackageSelectorEnhancer-BMOdkd2O.js");
          return new PackageSelectorEnhancer(element);
        case "timer":
          const { TimerEnhancer } = await import("./TimerEnhancer-17ku7YZB.js");
          return new TimerEnhancer(element);
        case "conditional":
          const { ConditionalDisplayEnhancer } = await import("./ConditionalDisplayEnhancer-C1NUIdF7.js");
          return new ConditionalDisplayEnhancer(element);
        case "checkout":
          const { CheckoutFormEnhancer } = await import("./CheckoutFormEnhancer-BjTYq3-U.js");
          return new CheckoutFormEnhancer(element);
        case "express-checkout":
          this.logger.debug("Skipping individual express checkout button - managed by container");
          return null;
        case "express-checkout-container":
          const { ExpressCheckoutContainerEnhancer } = await import("./ExpressCheckoutContainerEnhancer-Cj3PZ0n6.js");
          return new ExpressCheckoutContainerEnhancer(element);
        // REMOVED: form-validator, payment, address, phone, validation enhancers
        // These are now handled by the main CheckoutFormEnhancer (simplified approach)
        case "cart-items":
          const { CartItemListEnhancer } = await import("./CartItemListEnhancer-CcW6D_ph.js");
          return new CartItemListEnhancer(element);
        case "order-items":
          const { OrderItemListEnhancer } = await import("./OrderItemListEnhancer-LnjTLeea.js");
          return new OrderItemListEnhancer(element);
        case "quantity":
          const { QuantityControlEnhancer } = await import("./QuantityControlEnhancer-B8hpz-OE.js");
          return new QuantityControlEnhancer(element);
        case "remove-item":
          const { RemoveItemEnhancer } = await import("./RemoveItemEnhancer-BRnUgU4k.js");
          return new RemoveItemEnhancer(element);
        // 'order' case removed - order display now handled via data-next-display="order.xxx" pattern
        case "upsell":
          const { UpsellEnhancer } = await import("./UpsellEnhancer-B1CTkGpb.js");
          return new UpsellEnhancer(element);
        case "coupon":
          const { CouponEnhancer } = await import("./CouponEnhancer-DpMdOksh.js");
          return new CouponEnhancer(element);
        case "accordion":
          const { AccordionEnhancer } = await import("./AccordionEnhancer-fIygdsPn.js");
          return new AccordionEnhancer(element);
        case "tooltip":
          const { TooltipEnhancer } = await import("./TooltipEnhancer-DP27UQxs.js");
          return new TooltipEnhancer(element);
        case "scroll-hint":
          const { ScrollHintEnhancer } = await import("./ScrollHintEnhancer-dy3Hhy48.js");
          return new ScrollHintEnhancer(element);
        default:
          this.logger.warn(`Unknown enhancer type: ${type}`);
          return null;
      }
    } catch (error) {
      this.logger.error(`Failed to create enhancer of type ${type}:`, error);
      return null;
    }
  }
  startObserving(root) {
    if (!this.domObserver.isActive()) {
      this.domObserver.start(root);
      this.logger.debug("Started DOM observation");
    }
  }
  handleDOMChange(event) {
    switch (event.type) {
      case "added":
        this.queueElementForEnhancement(event.element);
        break;
      case "removed":
        this.cleanupElement(event.element);
        break;
      case "attributeChanged":
        if (event.attributeName?.startsWith("data-next-")) {
          this.logger.debug("Data attribute changed, re-enhancing element", {
            element: event.element.tagName,
            attribute: event.attributeName,
            oldValue: event.oldValue,
            newValue: event.newValue
          });
          this.cleanupElement(event.element);
          this.queueElementForEnhancement(event.element);
        }
        break;
    }
  }
  queueElementForEnhancement(element) {
    this.scanQueue.add(element);
    this.processQueueDebounced();
  }
  async processQueue() {
    if (this.scanQueue.size === 0) {
      return;
    }
    const elements = Array.from(this.scanQueue);
    this.scanQueue.clear();
    this.logger.debug(`Processing ${elements.length} queued elements`);
    for (const element of elements) {
      try {
        await this.enhanceElement(element);
      } catch (error) {
        this.logger.error("Failed to enhance queued element:", error, element);
      }
    }
  }
  debounce(func, wait) {
    let timeout;
    return function(...args) {
      clearTimeout(timeout);
      timeout = window.setTimeout(() => func.apply(this, args), wait);
    };
  }
  cleanupElement(element) {
    const enhancers = this.enhancers.get(element);
    if (enhancers) {
      enhancers.forEach((enhancer) => enhancer.destroy());
      this.enhancerCount -= enhancers.length;
      this.enhancers.delete(element);
    }
  }
  destroy() {
    this.domObserver.destroy();
    this.scanQueue.clear();
    this.enhancerCount = 0;
    this.logger.debug("AttributeScanner destroyed");
  }
  pause() {
    this.domObserver.pause();
    this.logger.debug("AttributeScanner paused");
  }
  resume(root = document.body) {
    this.domObserver.resume(root);
    this.logger.debug("AttributeScanner resumed");
  }
  updateEnhancerStats(type, time) {
    const current = this.enhancerStats.get(type) || { totalTime: 0, count: 0 };
    current.totalTime += time;
    current.count += 1;
    this.enhancerStats.set(type, current);
  }
  showPerformanceReport() {
    console.group("🚀 Enhancement Performance Report");
    const sortedStats = Array.from(this.enhancerStats.entries()).map(([type, stats]) => ({
      Enhancer: type,
      "Total Time (ms)": stats.totalTime.toFixed(2),
      "Average Time (ms)": (stats.totalTime / stats.count).toFixed(2),
      "Count": stats.count,
      "Impact": stats.totalTime > 50 ? "🔴 High" : stats.totalTime > 20 ? "🟡 Medium" : "🟢 Low"
    })).sort((a, b) => parseFloat(b["Total Time (ms)"]) - parseFloat(a["Total Time (ms)"]));
    console.table(sortedStats);
    const topSlow = sortedStats.slice(0, 3);
    if (topSlow.length > 0) {
      console.log("🐌 Slowest enhancers:");
      topSlow.forEach((stat, index) => {
        console.log(`${index + 1}. ${stat.Enhancer}: ${stat["Total Time (ms)"]}ms (${stat.Count} instances)`);
      });
    }
    const totalTime = Array.from(this.enhancerStats.values()).reduce((sum, stats) => sum + stats.totalTime, 0);
    const totalCount = Array.from(this.enhancerStats.values()).reduce((sum, stats) => sum + stats.count, 0);
    console.log(`📊 Total enhancement time: ${totalTime.toFixed(2)}ms across ${totalCount} enhancers`);
    console.groupEnd();
  }
  getStats() {
    const stats = {
      enhancedElements: this.enhancerCount,
      queuedElements: this.scanQueue.size,
      isObserving: this.domObserver.isActive(),
      isScanning: this.isScanning
    };
    if (this.isDebugMode && this.enhancerStats.size > 0) {
      stats.performanceStats = {};
      for (const [type, data] of this.enhancerStats.entries()) {
        stats.performanceStats[type] = {
          totalTime: data.totalTime,
          averageTime: data.totalTime / data.count,
          count: data.count
        };
      }
    }
    return stats;
  }
}
const _SDKInitializer = class _SDKInitializer {
  static async initialize() {
    if (this.initialized) {
      this.logger.warn("SDK already initialized");
      return;
    }
    try {
      this.logger.info("Initializing 29Next Campaign Cart SDK v2...");
      await this.waitForDOM();
      await this.loadConfiguration();
      await this.initializeAttribution();
      await this.loadCampaignData();
      await this.initializeAnalytics();
      this.initializeErrorHandler();
      await this.checkAndLoadOrder();
      await this.scanAndEnhanceDOM();
      this.setupReadyCallbacks();
      await this.initializeDebugMode();
      this.initialized = true;
      this.retryAttempts = 0;
      this.logger.info("SDK initialization complete ✅");
      this.emitInitializedEvent();
    } catch (error) {
      this.logger.error("SDK initialization failed:", error);
      if (this.retryAttempts < this.maxRetries) {
        this.retryAttempts++;
        this.logger.warn(`Retrying initialization (attempt ${this.retryAttempts}/${this.maxRetries})...`);
        await new Promise((resolve) => setTimeout(resolve, 1e3 * this.retryAttempts));
        return this.initialize();
      }
      throw error;
    }
  }
  static async loadConfiguration() {
    const configStore$1 = configStore.getState();
    const urlParams = new URLSearchParams(window.location.search);
    const debugMode = urlParams.get("debugger") === "true";
    const forcePackageId = urlParams.get("forcePackageId");
    configStore$1.loadFromMeta();
    configStore$1.loadFromWindow();
    if (debugMode) {
      configStore$1.updateConfig({ debug: true });
    }
    if (forcePackageId) {
      this.logger.info("forcePackageId parameter detected:", forcePackageId);
      window._nextForcePackageId = forcePackageId;
    }
    this.logger.debug("Configuration loaded:", configStore$1);
  }
  static async loadCampaignData() {
    const configStore$1 = configStore.getState();
    const campaignStore = useCampaignStore.getState();
    if (!configStore$1.apiKey) {
      throw new Error("API key not found. Please set next-api-key meta tag or window.nextConfig.apiKey");
    }
    await campaignStore.loadCampaign(configStore$1.apiKey);
    this.logger.debug("Campaign data loaded");
    await this.processForcePackageId();
  }
  static async processForcePackageId() {
    const forcePackageId = window._nextForcePackageId;
    if (!forcePackageId) {
      return;
    }
    try {
      this.logger.info("Processing forcePackageId parameter:", forcePackageId);
      const cartStore = useCartStore.getState();
      const campaignStore = useCampaignStore.getState();
      await cartStore.clear();
      this.logger.debug("Cart cleared for forcePackageId");
      const packageSpecs = forcePackageId.split(",").map((spec) => {
        const [idStr, quantityStr] = spec.trim().split(":");
        const packageId = parseInt(idStr || "", 10);
        const quantity = quantityStr ? parseInt(quantityStr, 10) : 1;
        if (isNaN(packageId) || packageId <= 0) {
          throw new Error(`Invalid package ID: ${idStr}`);
        }
        if (isNaN(quantity) || quantity <= 0) {
          throw new Error(`Invalid quantity: ${quantityStr}`);
        }
        return { packageId, quantity };
      });
      this.logger.debug("Parsed package specifications:", packageSpecs);
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
      delete window._nextForcePackageId;
    } catch (error) {
      this.logger.error("Error processing forcePackageId parameter:", error);
    }
  }
  static async initializeAttribution() {
    try {
      this.logger.info("Initializing attribution...");
      const attributionStore = useAttributionStore.getState();
      const configStore$1 = configStore.getState();
      await attributionStore.initialize();
      this.setupAttributionListeners();
      if (configStore$1.utmTransfer?.enabled) {
        const { UtmTransfer } = await import("./utils-B9l4NwAb.js").then((n) => n.U);
        const utmTransfer = new UtmTransfer(configStore$1.utmTransfer);
        utmTransfer.init();
        this.logger.debug("UTM transfer initialized");
      }
      this.logger.debug("Attribution initialized");
    } catch (error) {
      this.logger.error("Attribution initialization failed:", error);
    }
  }
  static setupAttributionListeners() {
    const eventBus = EventBus.getInstance();
    const attributionStore = useAttributionStore.getState();
    eventBus.on("campaign:loaded", (campaign) => {
      if (campaign?.name && !attributionStore.funnel) {
        attributionStore.setFunnelName(campaign.name);
        this.logger.debug("Set funnel name from campaign:", campaign.name);
      }
    });
    eventBus.on("cart:updated", () => {
      attributionStore.updateAttribution({
        metadata: {
          ...attributionStore.metadata,
          conversion_timestamp: Date.now()
        }
      });
      this.logger.debug("Updated attribution with conversion timestamp");
    });
    window.addEventListener("popstate", () => {
      attributionStore.updateAttribution({
        metadata: {
          ...attributionStore.metadata,
          landing_page: window.location.href
        }
      });
    });
  }
  static async initializeAnalytics() {
    setTimeout(async () => {
      try {
        this.logger.info("Initializing analytics v2 (lazy)...");
        const { nextAnalytics } = await import("./utils-B9l4NwAb.js").then((n) => n.m);
        await nextAnalytics.initialize();
        this.logger.debug("Analytics v2 initialized successfully (lazy)");
      } catch (error) {
        this.logger.warn("Analytics v2 initialization failed (non-critical):", error);
      }
    }, 0);
  }
  static initializeErrorHandler() {
    try {
      import("./utils-B9l4NwAb.js").then((n) => n.n).then(({ errorHandler }) => {
        errorHandler.initialize();
        this.logger.debug("Error handler initialized");
      });
    } catch (error) {
      this.logger.warn("Error handler initialization failed:", error);
    }
  }
  static async checkAndLoadOrder() {
    const urlParams = new URLSearchParams(window.location.search);
    const refId = urlParams.get("ref_id");
    if (refId) {
      this.logger.info("Page loaded with ref_id parameter, auto-loading order:", refId);
      try {
        const configStore$1 = configStore.getState();
        const orderStore = useOrderStore.getState();
        const apiClient = new ApiClient(configStore$1.apiKey);
        await orderStore.loadOrder(refId, apiClient);
        this.logger.info("Order loaded successfully:", orderStore.order);
        if (orderStore.order) {
          this.logger.info("Order supports upsells:", orderStore.order.supports_post_purchase_upsells);
        }
      } catch (error) {
        this.logger.error("Failed to auto-load order:", error);
      }
    }
  }
  static async scanAndEnhanceDOM() {
    if (this.attributeScanner) {
      this.attributeScanner.destroy();
    }
    this.attributeScanner = new AttributeScanner();
    await this.attributeScanner.scanAndEnhance(document.body);
    const stats = this.attributeScanner.getStats();
    this.logger.info("DOM scanning and enhancement complete", stats);
  }
  static setupReadyCallbacks() {
    const sdk = NextCommerce.getInstance();
    if (typeof window !== "undefined") {
      if (Array.isArray(window.nextReady)) {
        const readyQueue = window.nextReady;
        readyQueue.forEach((callback) => {
          try {
            callback(sdk);
          } catch (error) {
            this.logger.error("Ready callback error:", error);
          }
        });
      }
      window.next = sdk;
      window.nextReady = {
        push: (callback) => {
          try {
            callback(sdk);
          } catch (error) {
            this.logger.error("Ready callback error:", error);
          }
        }
      };
      this.logger.debug("nextReady callback system and window.next API initialized");
    }
  }
  static async initializeDebugMode() {
    const configStore$1 = configStore.getState();
    if (configStore$1.debug) {
      this.logger.info("Debug mode enabled - initializing debug utilities");
      Logger.setLogLevel(LogLevel.DEBUG);
      this.logger.info("Logger level set to DEBUG");
      const { debugOverlay } = await import("./utils-B9l4NwAb.js").then((n) => n.o);
      debugOverlay.initialize();
      this.setupGlobalDebugUtils();
      this.logger.info("Debug utilities initialized ✅");
    }
  }
  static setupGlobalDebugUtils() {
    if (typeof window !== "undefined") {
      window.nextDebug = {
        overlay: () => import("./utils-B9l4NwAb.js").then((n) => n.o).then((m) => m.debugOverlay),
        testMode: testModeManager,
        stores: {
          cart: useCartStore,
          campaign: useCampaignStore,
          config: configStore,
          checkout: useCheckoutStore,
          order: useOrderStore,
          attribution: useAttributionStore
        },
        sdk: NextCommerce.getInstance(),
        reinitialize: () => this.reinitialize(),
        getStats: () => this.getInitializationStats(),
        // Enhanced cart methods
        addToCart: (packageId, quantity = 1) => {
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
        removeFromCart: (packageId) => {
          useCartStore.getState().removeItem(packageId);
        },
        updateQuantity: (packageId, quantity) => {
          useCartStore.getState().updateQuantity(packageId, quantity);
        },
        // Analytics methods (removed - will be combined with analytics below)
        // Campaign methods
        loadCampaign: () => {
          const configStore$1 = configStore.getState();
          return useCampaignStore.getState().loadCampaign(configStore$1.apiKey);
        },
        clearCampaignCache: () => {
          useCampaignStore.getState().clearCache();
        },
        getCacheInfo: () => {
          const info = useCampaignStore.getState().getCacheInfo();
          console.table(info);
          return info;
        },
        inspectPackage: (packageId) => {
          const campaignStore = useCampaignStore.getState();
          const packageData = campaignStore.getPackage(packageId);
          console.group(`📦 Package ${packageId} Details`);
          console.table(packageData);
          console.groupEnd();
        },
        testShippingMethod: async (methodId) => {
          console.log(`🚚 Testing shipping method ${methodId}`);
          try {
            const cartStore = useCartStore.getState();
            await cartStore.setShippingMethod(methodId);
            console.log(`✅ Shipping method ${methodId} set successfully`);
            const state = cartStore;
            const shippingMethod = state.shippingMethod;
            if (shippingMethod) {
              console.log(`📦 Shipping: ${shippingMethod.code} - $${shippingMethod.price}`);
            }
            document.dispatchEvent(new CustomEvent("debug:update-content"));
          } catch (error) {
            console.error(`❌ Failed to set shipping method ${methodId}:`, error);
          }
        },
        sortPackages: (sortBy) => {
          console.log(`🔄 Sorting packages by ${sortBy}`);
          document.dispatchEvent(new CustomEvent("debug:update-content"));
        },
        // Analytics utilities - lazy loaded to avoid blocking
        analytics: {
          getStatus: async () => {
            const { nextAnalytics } = await import("./utils-B9l4NwAb.js").then((n) => n.m);
            return nextAnalytics.getStatus();
          },
          getProviders: async () => {
            const { nextAnalytics } = await import("./utils-B9l4NwAb.js").then((n) => n.m);
            return nextAnalytics.getStatus().providers;
          },
          track: async (name, data) => {
            const { nextAnalytics } = await import("./utils-B9l4NwAb.js").then((n) => n.m);
            return nextAnalytics.track({ event: name, ...data });
          },
          setDebugMode: async (enabled) => {
            const { nextAnalytics } = await import("./utils-B9l4NwAb.js").then((n) => n.m);
            return nextAnalytics.setDebugMode(enabled);
          },
          invalidateContext: async () => {
            const { nextAnalytics } = await import("./utils-B9l4NwAb.js").then((n) => n.m);
            return nextAnalytics.invalidateContext();
          }
        },
        // Attribution utilities
        attribution: {
          debug: () => useAttributionStore.getState().debug(),
          get: () => useAttributionStore.getState().getAttributionForApi(),
          setFunnel: (funnel) => useAttributionStore.getState().setFunnelName(funnel),
          setEvclid: (evclid) => useAttributionStore.getState().setEverflowClickId(evclid),
          clearFunnel: () => useAttributionStore.getState().clearPersistedFunnel(),
          getFunnel: () => {
            const state = useAttributionStore.getState();
            const persisted = localStorage.getItem("next_funnel_name") || sessionStorage.getItem("next_funnel_name");
            console.log("Current funnel:", state.funnel);
            console.log("Persisted funnel:", persisted);
            return state.funnel || persisted || "(not set)";
          }
        },
        // Element highlighting
        highlightElement: (selector) => {
          this.logger.debug(`🎯 Highlighting element: ${selector}`);
        },
        addTestItems: () => {
          const cartStore = useCartStore.getState();
          [2, 7, 9].forEach((packageId) => {
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
          open: (id) => {
            document.dispatchEvent(new CustomEvent("next:accordion-open", { detail: { id } }));
          },
          close: (id) => {
            document.dispatchEvent(new CustomEvent("next:accordion-close", { detail: { id } }));
          },
          toggle: (id) => {
            document.dispatchEvent(new CustomEvent("next:accordion-toggle", { detail: { id } }));
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
            console.log("Order cache cleared");
          },
          getStats: () => {
            const orderStore = useOrderStore.getState();
            return {
              hasOrder: !!orderStore.order,
              refId: orderStore.refId,
              orderAge: orderStore.orderLoadedAt ? `${Math.floor((Date.now() - orderStore.orderLoadedAt) / 1e3 / 60)} minutes` : "N/A",
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
  static isInitialized() {
    return this.initialized;
  }
  static async reinitialize() {
    this.logger.info("Reinitializing SDK...");
    if (this.attributeScanner) {
      this.attributeScanner.destroy();
      this.attributeScanner = null;
    }
    this.initialized = false;
    this.retryAttempts = 0;
    await this.initialize();
  }
  static async waitForDOM() {
    if (document.readyState === "loading") {
      return new Promise((resolve) => {
        const onReady = () => {
          document.removeEventListener("DOMContentLoaded", onReady);
          document.removeEventListener("readystatechange", onReady);
          resolve();
        };
        document.addEventListener("DOMContentLoaded", onReady);
        document.addEventListener("readystatechange", onReady);
      });
    }
  }
  static emitInitializedEvent() {
    if (typeof window !== "undefined") {
      const event = new CustomEvent("next:initialized", {
        detail: {
          version: "0.2.0",
          timestamp: Date.now(),
          stats: this.attributeScanner?.getStats()
        }
      });
      window.dispatchEvent(event);
    }
  }
  static getAttributeScanner() {
    return this.attributeScanner;
  }
  static getInitializationStats() {
    return {
      initialized: this.initialized,
      retryAttempts: this.retryAttempts,
      ...this.attributeScanner && { scannerStats: this.attributeScanner.getStats() }
    };
  }
};
_SDKInitializer.logger = createLogger("SDKInitializer");
_SDKInitializer.initialized = false;
_SDKInitializer.attributeScanner = null;
_SDKInitializer.retryAttempts = 0;
_SDKInitializer.maxRetries = 3;
let SDKInitializer = _SDKInitializer;
const VERSION = "__VERSION__";
if (typeof window !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      SDKInitializer.initialize();
    });
  } else {
    SDKInitializer.initialize();
  }
  window.addEventListener("next:ready", () => {
    if ("requestIdleCallback" in window) {
      requestIdleCallback(() => {
        import("./CartDisplayEnhancer-DJu3jcPS.js");
        import("./CartToggleEnhancer-BXRzqsTi.js");
        import("./PackageSelectorEnhancer-BMOdkd2O.js");
        import("./ProductDisplayEnhancer-CMtY-i7Q.js");
        import("./SelectionDisplayEnhancer-C7UVIrWF.js");
        import("./TimerEnhancer-17ku7YZB.js");
      }, { timeout: 5e3 });
      requestIdleCallback(() => {
        import("./CheckoutFormEnhancer-BjTYq3-U.js");
        import("./ExpressCheckoutContainerEnhancer-Cj3PZ0n6.js");
        import("./OrderDisplayEnhancer-etaRT6QW.js");
        import("./UpsellEnhancer-B1CTkGpb.js");
        import("./utils-B9l4NwAb.js").then((n) => n.A);
        import("./CartItemListEnhancer-CcW6D_ph.js");
        import("./QuantityControlEnhancer-B8hpz-OE.js");
      }, { timeout: 5e3 });
      requestIdleCallback(() => {
        import("./AccordionEnhancer-fIygdsPn.js");
        import("./CouponEnhancer-DpMdOksh.js");
        import("./SimpleExitIntentEnhancer-DXieRti3.js");
      }, { timeout: 5e3 });
    } else {
      setTimeout(() => {
        import("./CartDisplayEnhancer-DJu3jcPS.js");
        import("./ProductDisplayEnhancer-CMtY-i7Q.js");
        import("./utils-B9l4NwAb.js").then((n) => n.q);
      }, 1e3);
    }
  });
}
export {
  AttributeParser as A,
  NextCommerce as N,
  SDKInitializer as S,
  VERSION as V,
  useOrderStore as a,
  useAttributionStore as u
};
