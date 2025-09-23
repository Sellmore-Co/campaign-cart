import { c as createLogger, L as Logger, E as EventBus, u as useCartStore, a as useCampaignStore, b as useAttributionStore, d as useCheckoutStore, e as useOrderStore, f as configStore, g as useProfileStore, h as trackPageView, i as trackSDKInitialized, j as trackSDKInitializationFailed, C as CountryService, k as trackCampaignLoaded, l as testModeManager, m as CART_STORAGE_KEY, n as trackCartLoaded, o as LogLevel } from "./utils-CYhT6z_5.js";
import { c as create, p as persist } from "./vendor-Cm8LLIxS.js";
import { ApiClient } from "./api-B32c6sFA.js";
const logger = createLogger("ParameterStore");
const useParameterStore = create()(
  persist(
    (set, get) => ({
      params: {},
      updateParam: (key, value) => {
        set((state) => ({
          params: { ...state.params, [key]: value }
        }));
        logger.debug(`Parameter updated: ${key} = ${value}`);
      },
      updateParams: (params) => {
        set({ params });
        logger.debug("Parameters replaced:", params);
      },
      mergeParams: (params) => {
        set((state) => ({
          params: { ...state.params, ...params }
        }));
        logger.debug("Parameters merged:", params);
      },
      getParam: (key) => {
        const state = get();
        return state.params[key];
      },
      hasParam: (key) => {
        const state = get();
        return key in state.params;
      },
      clearParams: () => {
        set({ params: {} });
        logger.info("All parameters cleared");
      },
      removeParam: (key) => {
        set((state) => {
          const newParams = { ...state.params };
          delete newParams[key];
          return { params: newParams };
        });
        logger.debug(`Parameter removed: ${key}`);
      },
      debug: () => {
        const state = get();
        console.group("🔍 URL Parameters Debug Info");
        const paramCount = Object.keys(state.params).length;
        console.log(`📊 Total parameters: ${paramCount}`);
        if (paramCount > 0) {
          console.log("\n📋 Current parameters:");
          console.table(state.params);
          const grouped = {};
          Object.entries(state.params).forEach(([key, value]) => {
            const prefix = key.includes("_") ? key.split("_")[0] : "other";
            if (!grouped[prefix]) grouped[prefix] = [];
            grouped[prefix].push(`${key}=${value}`);
          });
          console.log("\n🗂️ Parameters by prefix:");
          Object.entries(grouped).forEach(([prefix, params]) => {
            console.log(`  ${prefix}: ${params.join(", ")}`);
          });
        } else {
          console.log("No parameters currently stored");
        }
        const currentUrlParams = new URLSearchParams(window.location.search);
        const currentParams = {};
        currentUrlParams.forEach((value, key) => {
          currentParams[key] = value;
        });
        if (Object.keys(currentParams).length > 0) {
          console.log("\n🔗 Current URL parameters:");
          console.table(currentParams);
          const storedKeys = new Set(Object.keys(state.params));
          const urlKeys = new Set(Object.keys(currentParams));
          const onlyInStore = Array.from(storedKeys).filter((k) => !urlKeys.has(k));
          const onlyInUrl = Array.from(urlKeys).filter((k) => !storedKeys.has(k));
          const different = Array.from(storedKeys).filter(
            (k) => urlKeys.has(k) && state.params[k] !== currentParams[k]
          );
          if (onlyInStore.length > 0 || onlyInUrl.length > 0 || different.length > 0) {
            console.log("\n⚠️ Differences:");
            if (onlyInStore.length > 0) {
              console.log("  Only in store:", onlyInStore);
            }
            if (onlyInUrl.length > 0) {
              console.log("  Only in URL:", onlyInUrl);
            }
            if (different.length > 0) {
              console.log("  Different values:", different);
            }
          }
        }
        console.groupEnd();
        return "Parameter debug info logged to console.";
      }
    }),
    {
      name: "next-url-params",
      storage: {
        getItem: (name) => {
          try {
            const str = sessionStorage.getItem(name);
            return str ? JSON.parse(str) : null;
          } catch (error) {
            logger.error("Error reading from sessionStorage:", error);
            return null;
          }
        },
        setItem: (name, value) => {
          try {
            sessionStorage.setItem(name, JSON.stringify(value));
          } catch (error) {
            logger.error("Error writing to sessionStorage:", error);
          }
        },
        removeItem: (name) => {
          try {
            sessionStorage.removeItem(name);
          } catch (error) {
            logger.error("Error removing from sessionStorage:", error);
          }
        }
      }
    }
  )
);
const parameterStore = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  useParameterStore
});
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
  async swapCart(items) {
    const cartStore = useCartStore.getState();
    if (typeof cartStore.swapCart === "function") {
      await cartStore.swapCart(items);
    } else {
      await cartStore.clear();
      for (const item of items) {
        await cartStore.addItem({
          packageId: item.packageId,
          quantity: item.quantity,
          isUpsell: false
        });
      }
    }
    this.logger.debug(`Cart swapped with ${items.length} items`);
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
  // Product variant methods
  getVariantsByProductId(productId) {
    const campaignStore = useCampaignStore.getState();
    return campaignStore.getVariantsByProductId(productId);
  }
  getAvailableVariantAttributes(productId, attributeCode) {
    const campaignStore = useCampaignStore.getState();
    return campaignStore.getAvailableVariantAttributes(productId, attributeCode);
  }
  getPackageByVariantSelection(productId, selectedAttributes) {
    const campaignStore = useCampaignStore.getState();
    return campaignStore.getPackageByVariantSelection(productId, selectedAttributes);
  }
  // Enhanced pricing tier methods
  getProductVariantsWithPricing(productId) {
    const campaignStore = useCampaignStore.getState();
    return campaignStore.getProductVariantsWithPricing(productId);
  }
  getVariantPricingTiers(productId, variantKey) {
    const campaignStore = useCampaignStore.getState();
    return campaignStore.getVariantPricingTiers(productId, variantKey);
  }
  getLowestPriceForVariant(productId, variantKey) {
    const campaignStore = useCampaignStore.getState();
    return campaignStore.getLowestPriceForVariant(productId, variantKey);
  }
  createVariantKey(attributes) {
    return Object.entries(attributes).map(([code, value]) => `${code}:${value}`).sort().join("|");
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
        const { nextAnalytics } = await import("./utils-CYhT6z_5.js").then((n) => n.a0);
        nextAnalytics.trackViewItemList(packageIds, listName);
      } catch (error) {
        this.logger.debug("Analytics tracking failed (non-critical):", error);
      }
    });
  }
  async trackViewItem(packageId) {
    queueMicrotask(async () => {
      try {
        const { nextAnalytics } = await import("./utils-CYhT6z_5.js").then((n) => n.a0);
        nextAnalytics.trackViewItem(packageId);
      } catch (error) {
        this.logger.debug("Analytics tracking failed (non-critical):", error);
      }
    });
  }
  async trackAddToCart(packageId, quantity) {
    queueMicrotask(async () => {
      try {
        const { nextAnalytics } = await import("./utils-CYhT6z_5.js").then((n) => n.a0);
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
        const { nextAnalytics, EcommerceEvents } = await import("./utils-CYhT6z_5.js").then((n) => n.a0);
        nextAnalytics.track(EcommerceEvents.createRemoveFromCartEvent({ packageId, quantity: quantity || 1 }));
      } catch (error) {
        this.logger.debug("Analytics tracking failed (non-critical):", error);
      }
    });
  }
  async trackBeginCheckout() {
    queueMicrotask(async () => {
      try {
        const { nextAnalytics } = await import("./utils-CYhT6z_5.js").then((n) => n.a0);
        nextAnalytics.trackBeginCheckout();
      } catch (error) {
        this.logger.debug("Analytics tracking failed (non-critical):", error);
      }
    });
  }
  async trackPurchase(orderData) {
    queueMicrotask(async () => {
      try {
        const { nextAnalytics } = await import("./utils-CYhT6z_5.js").then((n) => n.a0);
        nextAnalytics.trackPurchase(orderData);
      } catch (error) {
        this.logger.debug("Analytics tracking failed (non-critical):", error);
      }
    });
  }
  async trackCustomEvent(eventName, data) {
    queueMicrotask(async () => {
      try {
        const { nextAnalytics } = await import("./utils-CYhT6z_5.js").then((n) => n.a0);
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
        const { nextAnalytics } = await import("./utils-CYhT6z_5.js").then((n) => n.a0);
        nextAnalytics.trackSignUp(email);
      } catch (error) {
        this.logger.debug("Analytics tracking failed (non-critical):", error);
      }
    });
  }
  async trackLogin(email) {
    queueMicrotask(async () => {
      try {
        const { nextAnalytics } = await import("./utils-CYhT6z_5.js").then((n) => n.a0);
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
        const { nextAnalytics } = await import("./utils-CYhT6z_5.js").then((n) => n.a0);
        nextAnalytics.setDebugMode(enabled);
      } catch (error) {
        this.logger.debug("Analytics debug mode failed (non-critical):", error);
      }
    });
  }
  async invalidateAnalyticsContext() {
    queueMicrotask(async () => {
      try {
        const { nextAnalytics } = await import("./utils-CYhT6z_5.js").then((n) => n.a0);
        nextAnalytics.invalidateContext();
      } catch (error) {
        this.logger.debug("Analytics context invalidation failed (non-critical):", error);
      }
    });
  }
  // Attribution metadata methods
  addMetadata(key, value) {
    try {
      const store = useAttributionStore.getState();
      const currentMetadata = store.metadata || {};
      store.updateAttribution({
        metadata: {
          ...currentMetadata,
          [key]: value
        }
      });
      this.logger.debug(`Attribution metadata added: ${key}`, value);
    } catch (error) {
      this.logger.error("Failed to add attribution metadata:", error);
    }
  }
  setMetadata(metadata) {
    try {
      const store = useAttributionStore.getState();
      const currentMetadata = store.metadata || {};
      store.updateAttribution({
        metadata: {
          ...currentMetadata,
          ...metadata
        }
      });
      this.logger.debug("Attribution metadata set:", metadata);
    } catch (error) {
      this.logger.error("Failed to set attribution metadata:", error);
    }
  }
  clearMetadata() {
    try {
      const store = useAttributionStore.getState();
      store.updateAttribution({
        metadata: {
          // Preserve automatic fields
          landing_page: store.metadata?.landing_page || "",
          referrer: store.metadata?.referrer || "",
          device: store.metadata?.device || "",
          device_type: store.metadata?.device_type || "desktop",
          domain: store.metadata?.domain || "",
          timestamp: store.metadata?.timestamp || Date.now()
        }
      });
      this.logger.debug("Attribution metadata cleared");
    } catch (error) {
      this.logger.error("Failed to clear attribution metadata:", error);
    }
  }
  getMetadata() {
    try {
      const store = useAttributionStore.getState();
      return store.metadata;
    } catch (error) {
      this.logger.error("Failed to get attribution metadata:", error);
      return void 0;
    }
  }
  setAttribution(attribution) {
    try {
      const store = useAttributionStore.getState();
      store.updateAttribution(attribution);
      this.logger.debug("Attribution set:", attribution);
    } catch (error) {
      this.logger.error("Failed to set attribution:", error);
    }
  }
  getAttribution() {
    try {
      const store = useAttributionStore.getState();
      return store.getAttributionForApi();
    } catch (error) {
      this.logger.error("Failed to get attribution:", error);
      return void 0;
    }
  }
  debugAttribution() {
    try {
      const store = useAttributionStore.getState();
      store.debug();
    } catch (error) {
      this.logger.error("Failed to debug attribution:", error);
    }
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
  getVersion() {
    if (typeof window !== "undefined" && window.__NEXT_SDK_VERSION__) {
      return window.__NEXT_SDK_VERSION__;
    }
    return "__VERSION__";
  }
  formatPrice(amount, currency) {
    const { formatCurrency } = require("@/utils/currencyFormatter");
    const campaignStore = useCampaignStore.getState();
    const useCurrency = currency ?? campaignStore.data?.currency ?? "USD";
    return formatCurrency(amount, useCurrency);
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
        const { ExitIntentEnhancer } = await import("./SimpleExitIntentEnhancer-DEbxD7xO.js");
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
        const { FomoPopupEnhancer } = await import("./FomoPopupEnhancer-D3rHScV6.js");
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
  // Profile Management Methods
  async setProfile(profileId, options) {
    try {
      const { ProfileManager: ProfileManager2 } = await Promise.resolve().then(() => ProfileManager$1);
      const profileManager = ProfileManager2.getInstance();
      await profileManager.applyProfile(profileId, options);
      this.logger.info(`Profile "${profileId}" applied via API`);
    } catch (error) {
      this.logger.error(`Failed to set profile "${profileId}":`, error);
      throw error;
    }
  }
  async revertProfile() {
    try {
      const { ProfileManager: ProfileManager2 } = await Promise.resolve().then(() => ProfileManager$1);
      const profileManager = ProfileManager2.getInstance();
      await profileManager.revertProfile();
      this.logger.info("Profile reverted via API");
    } catch (error) {
      this.logger.error("Failed to revert profile:", error);
      throw error;
    }
  }
  getActiveProfile() {
    const profileStore = useProfileStore.getState();
    return profileStore.activeProfileId;
  }
  getProfileInfo(profileId) {
    const profileStore = useProfileStore.getState();
    return profileId ? profileStore.getProfileById(profileId) : profileStore.getActiveProfile();
  }
  getMappedPackageId(originalId) {
    const profileStore = useProfileStore.getState();
    return profileStore.getMappedPackageId(originalId);
  }
  getOriginalPackageId(mappedId) {
    const profileStore = useProfileStore.getState();
    return profileStore.getOriginalPackageId(mappedId);
  }
  listProfiles() {
    const profileStore = useProfileStore.getState();
    return Array.from(profileStore.profiles.keys());
  }
  hasProfile(profileId) {
    const profileStore = useProfileStore.getState();
    return profileStore.hasProfile(profileId);
  }
  registerProfile(profile) {
    const profileStore = useProfileStore.getState();
    profileStore.registerProfile(profile);
    this.logger.info(`Profile "${profile.id}" registered via API`);
  }
  // URL Parameter Methods
  setParam(key, value) {
    const paramStore = useParameterStore.getState();
    paramStore.updateParam(key, value);
    this.logger.debug(`URL parameter set: ${key}=${value}`);
  }
  setParams(params) {
    const paramStore = useParameterStore.getState();
    paramStore.updateParams(params);
    this.logger.debug("URL parameters set:", params);
  }
  getParam(key) {
    const paramStore = useParameterStore.getState();
    const value = paramStore.getParam(key);
    return value !== void 0 ? value : null;
  }
  getAllParams() {
    const paramStore = useParameterStore.getState();
    return paramStore.params;
  }
  hasParam(key) {
    const paramStore = useParameterStore.getState();
    return paramStore.hasParam(key);
  }
  clearParam(key) {
    const paramStore = useParameterStore.getState();
    const newParams = { ...paramStore.params };
    delete newParams[key];
    paramStore.updateParams(newParams);
    this.logger.debug(`URL parameter cleared: ${key}`);
  }
  clearAllParams() {
    const paramStore = useParameterStore.getState();
    paramStore.updateParams({});
    this.logger.debug("All URL parameters cleared");
  }
  mergeParams(params) {
    const paramStore = useParameterStore.getState();
    paramStore.mergeParams(params);
    this.logger.debug("URL parameters merged:", params);
  }
}
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
    if (element.hasAttribute("data-next-show") || element.hasAttribute("data-next-hide") || element.hasAttribute("data-next-show-if-profile") || element.hasAttribute("data-next-hide-if-profile")) {
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
    if (element.hasAttribute("data-next-profile")) {
      types.push("profile-switcher");
    }
    if (element.hasAttribute("data-next-profile-selector")) {
      types.push("profile-selector");
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
    if (element.hasAttribute("data-next-selector") || element.hasAttribute("data-next-cart-selector") || element.hasAttribute("data-next-selector-id") && !element.hasAttribute("data-next-action") && !element.hasAttribute("data-next-upsell") && !element.hasAttribute("data-next-upsell-selector")) {
      types.push("selector");
    }
    if (element.hasAttribute("data-next-upsell")) {
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
    if (element.hasAttribute("data-next-quantity-text")) {
      types.push("quantity-text");
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
      this.logger.debug("Parsing condition:", condition);
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
      if (condition.includes(" ") || condition.includes("==") || condition.includes("!=")) {
        const operators = [">=", "<=", ">", "<", "===", "==", "!==", "!="];
        for (const op of operators) {
          if (condition.includes(op)) {
            const parts = condition.split(op);
            if (parts.length === 2) {
              const left = parts[0].trim();
              const right = parts[1].trim();
              const leftPath = this.parseDisplayPath(left ?? "");
              let rightValue;
              const rightTrimmed = right.trim();
              const hasQuotes = rightTrimmed.startsWith('"') && rightTrimmed.endsWith('"') || rightTrimmed.startsWith("'") && rightTrimmed.endsWith("'");
              if (hasQuotes) {
                rightValue = rightTrimmed.slice(1, -1);
              } else {
                rightValue = this.parseValue(right ?? "");
                if ((leftPath.object === "param" || leftPath.object === "params") && typeof rightValue === "string" && right !== "true" && right !== "false" && !/^-?\d+(\.\d+)?$/.test(right)) {
                  rightValue = right;
                }
              }
              const result = {
                type: "comparison",
                left: leftPath,
                operator: op,
                right: rightValue
              };
              this.logger.debug("Parsed comparison:", {
                original: condition,
                leftPart: left,
                rightPart: right,
                hasQuotes,
                result,
                leftObject: leftPath.object,
                rightValue,
                rightType: typeof rightValue
              });
              return result;
            }
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
    this.logger.info("🔍 Starting DOM scan for data attributes...", { root: root.tagName });
    try {
      const selector = [
        "[data-next-display]",
        "[data-next-toggle]",
        "[data-next-action]",
        "[data-next-timer]",
        "[data-next-show]",
        "[data-next-hide]",
        "[data-next-show-if-profile]",
        "[data-next-hide-if-profile]",
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
        '[data-next-component="scroll-hint"]',
        "[data-next-quantity-text]",
        "[data-next-profile]",
        "select[data-next-profile-selector]"
      ].join(", ");
      const elements = root.querySelectorAll(selector);
      this.logger.debug(`Found ${elements.length} elements with data attributes`);
      const conditionalElements = root.querySelectorAll("[data-next-show], [data-next-hide]");
      if (conditionalElements.length > 0) {
        this.logger.info(
          `Found ${conditionalElements.length} conditional display elements:`,
          Array.from(conditionalElements).map((el) => ({
            tag: el.tagName,
            class: el.className,
            show: el.getAttribute("data-next-show"),
            hide: el.getAttribute("data-next-hide")
          }))
        );
      }
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
            const { CartDisplayEnhancer } = await import("./CartDisplayEnhancer-BhOZMnzu.js");
            return new CartDisplayEnhancer(element);
          } else if (parsed.object === "selection") {
            this.logger.debug("Using SelectionDisplayEnhancer");
            const { SelectionDisplayEnhancer } = await import("./SelectionDisplayEnhancer-DRgrbgkz.js");
            return new SelectionDisplayEnhancer(element);
          } else if (parsed.object === "package" || parsed.object === "campaign") {
            this.logger.debug("Using ProductDisplayEnhancer");
            const { ProductDisplayEnhancer } = await import("./ProductDisplayEnhancer-CxSTc2HZ.js");
            return new ProductDisplayEnhancer(element);
          } else if (parsed.object === "order") {
            this.logger.debug("Using OrderDisplayEnhancer");
            const { OrderDisplayEnhancer } = await import("./OrderDisplayEnhancer-B2xI21tT.js");
            return new OrderDisplayEnhancer(element);
          } else if (parsed.object === "shipping") {
            this.logger.debug("Using ShippingDisplayEnhancer");
            const { ShippingDisplayEnhancer } = await import("./ShippingDisplayEnhancer-B0tqMhRE.js");
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
              const { ProductDisplayEnhancer } = await import("./ProductDisplayEnhancer-CxSTc2HZ.js");
              return new ProductDisplayEnhancer(element);
            } else {
              this.logger.debug(`Using CartDisplayEnhancer (fallback without package context)`);
              const { CartDisplayEnhancer } = await import("./CartDisplayEnhancer-BhOZMnzu.js");
              return new CartDisplayEnhancer(element);
            }
          }
        case "toggle":
          const { CartToggleEnhancer } = await import("./CartToggleEnhancer-D3_xCJdl.js");
          return new CartToggleEnhancer(element);
        case "action":
          const action = element.getAttribute("data-next-action");
          switch (action) {
            case "add-to-cart":
              const { AddToCartEnhancer } = await import("./AddToCartEnhancer-CWKxMSPK.js");
              return new AddToCartEnhancer(element);
            case "accept-upsell":
              const { AcceptUpsellEnhancer } = await import("./AcceptUpsellEnhancer-VpJkSST0.js");
              return new AcceptUpsellEnhancer(element);
            default:
              this.logger.warn(`Unknown action type: ${action}`);
              return null;
          }
        case "selector":
          const { PackageSelectorEnhancer } = await import("./PackageSelectorEnhancer-GPXlvkvJ.js");
          return new PackageSelectorEnhancer(element);
        case "timer":
          const { TimerEnhancer } = await import("./TimerEnhancer-B8Fr2Ry-.js");
          return new TimerEnhancer(element);
        case "conditional":
          this.logger.info("Creating ConditionalDisplayEnhancer for element:", {
            element: element.tagName,
            class: element.className,
            showAttr: element.getAttribute("data-next-show"),
            hideAttr: element.getAttribute("data-next-hide")
          });
          const { ConditionalDisplayEnhancer } = await import("./ConditionalDisplayEnhancer-BYucELpP.js");
          return new ConditionalDisplayEnhancer(element);
        case "checkout":
          const { CheckoutFormEnhancer } = await import("./CheckoutFormEnhancer-BC7gOjvV.js");
          return new CheckoutFormEnhancer(element);
        case "express-checkout":
          this.logger.debug("Skipping individual express checkout button - managed by container");
          return null;
        case "express-checkout-container":
          const { ExpressCheckoutContainerEnhancer } = await import("./ExpressCheckoutContainerEnhancer-ceshwKKw.js");
          return new ExpressCheckoutContainerEnhancer(element);
        // REMOVED: form-validator, payment, address, phone, validation enhancers
        // These are now handled by the main CheckoutFormEnhancer (simplified approach)
        case "cart-items":
          const { CartItemListEnhancer } = await import("./CartItemListEnhancer-DbS2i4rm.js");
          return new CartItemListEnhancer(element);
        case "order-items":
          const { OrderItemListEnhancer } = await import("./OrderItemListEnhancer-CIjvLPQE.js");
          return new OrderItemListEnhancer(element);
        case "quantity":
          const { QuantityControlEnhancer } = await import("./QuantityControlEnhancer-HiK96PoL.js");
          return new QuantityControlEnhancer(element);
        case "remove-item":
          const { RemoveItemEnhancer } = await import("./RemoveItemEnhancer-C9XtN8IN.js");
          return new RemoveItemEnhancer(element);
        // 'order' case removed - order display now handled via data-next-display="order.xxx" pattern
        case "upsell":
          const { UpsellEnhancer } = await import("./UpsellEnhancer-CKk8vNKI.js");
          return new UpsellEnhancer(element);
        case "coupon":
          const { CouponEnhancer } = await import("./CouponEnhancer-Nj6fRKph.js");
          return new CouponEnhancer(element);
        case "accordion":
          const { AccordionEnhancer } = await import("./AccordionEnhancer-C4jHTWq9.js");
          return new AccordionEnhancer(element);
        case "tooltip":
          const { TooltipEnhancer } = await import("./TooltipEnhancer-BOJ2dPs5.js");
          return new TooltipEnhancer(element);
        case "scroll-hint":
          const { ScrollHintEnhancer } = await import("./ScrollHintEnhancer-DNpIe9an.js");
          return new ScrollHintEnhancer(element);
        case "quantity-text":
          const { QuantityTextEnhancer } = await import("./QuantityTextEnhancer-Buzk8zRU.js");
          return new QuantityTextEnhancer(element);
        case "profile-switcher":
          const { ProfileSwitcherEnhancer: ProfileSwitcherEnhancer2 } = await Promise.resolve().then(() => ProfileSwitcherEnhancer$1);
          return new ProfileSwitcherEnhancer2(element);
        case "profile-selector":
          const { ProfileSelectorEnhancer: ProfileSelectorEnhancer2 } = await Promise.resolve().then(() => ProfileSwitcherEnhancer$1);
          return new ProfileSelectorEnhancer2(element);
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
      this.initStartTime = Date.now();
      queueMicrotask(() => trackPageView());
      await this.waitForDOM();
      await this.loadConfiguration();
      await this.initializeLocationAndCurrency();
      await this.initializeAttribution();
      await this.loadCampaignData();
      await this.initializeAnalytics();
      await this.waitForStoreRehydration();
      this.initializeErrorHandler();
      await this.checkAndLoadOrder();
      await this.scanAndEnhanceDOM();
      this.setupReadyCallbacks();
      await this.initializeDebugMode();
      this.initialized = true;
      const initTime = Date.now() - this.initStartTime;
      this.logger.info("SDK initialization complete ✅");
      const configStore$1 = configStore.getState();
      const stats = this.attributeScanner?.getStats();
      queueMicrotask(() => {
        trackSDKInitialized({
          initializationTime: initTime,
          campaignLoadTime: this.campaignLoadTime,
          fromCache: this.campaignFromCache,
          retryAttempts: this.retryAttempts,
          elementsEnhanced: stats?.enhancedElements || 0,
          debugMode: configStore$1.debug || false,
          forcePackageId: window._nextForcePackageId || null,
          forceShippingId: window._nextForceShippingId || null
        });
      });
      this.retryAttempts = 0;
      this.emitInitializedEvent();
    } catch (error) {
      this.logger.error("SDK initialization failed:", error);
      let errorStage = "config_load";
      if (this.campaignLoadStartTime > 0) errorStage = "campaign_load";
      if (this.attributeScanner) errorStage = "dom_scan";
      queueMicrotask(() => {
        trackSDKInitializationFailed({
          errorMessage: error instanceof Error ? error.message : String(error),
          errorStage,
          retryAttempt: this.retryAttempts
        });
      });
      if (this.retryAttempts < this.maxRetries) {
        this.retryAttempts++;
        this.logger.warn(`Retrying initialization (attempt ${this.retryAttempts}/${this.maxRetries})...`);
        await new Promise((resolve) => setTimeout(resolve, 1e3 * this.retryAttempts));
        return this.initialize();
      }
      throw error;
    }
  }
  static async captureUrlParameters(urlParams) {
    try {
      const { useParameterStore: useParameterStore2 } = await Promise.resolve().then(() => parameterStore);
      const paramStore = useParameterStore2.getState();
      const existingParams = { ...paramStore.params };
      const currentParams = {};
      urlParams.forEach((value, key) => {
        currentParams[key] = value;
      });
      const mergedParams = { ...existingParams, ...currentParams };
      if (Object.keys(mergedParams).length > 0) {
        paramStore.updateParams(mergedParams);
        this.logger.debug(`Captured ${Object.keys(currentParams).length} URL parameters, total stored: ${Object.keys(mergedParams).length}`);
        const visibilityParams = ["seen", "timer", "reviews", "loading", "banner", "exit"];
        const relevantParams = Object.keys(mergedParams).filter((key) => visibilityParams.includes(key));
        if (relevantParams.length > 0) {
          this.logger.info("Visibility control parameters detected:", relevantParams.map((k) => `${k}=${mergedParams[k]}`).join(", "));
        }
      }
    } catch (error) {
      this.logger.warn("Failed to capture URL parameters:", error);
    }
  }
  static async initializeLocationAndCurrency() {
    try {
      this.logger.info("Initializing location and currency detection...");
      const countryService = CountryService.getInstance();
      const configStore$1 = configStore.getState();
      const urlParams = new URLSearchParams(window.location.search);
      const countryOverride = urlParams.get("country");
      const savedCountry = sessionStorage.getItem("next_selected_country");
      const forcedCountry = countryOverride || savedCountry;
      let locationData = null;
      if (forcedCountry) {
        this.logger.info(`Using forced country: ${forcedCountry} (source: ${countryOverride ? "URL" : "session"})`);
        try {
          const response = await fetch(`https://cdn-countries.muddy-wind-c7ca.workers.dev/countries/${forcedCountry.toUpperCase()}/states`);
          if (response.ok) {
            const data = await response.json();
            locationData = {
              detectedCountryCode: forcedCountry.toUpperCase(),
              detectedCountryConfig: data.countryConfig || {
                currencyCode: "USD",
                currencySymbol: "$",
                stateLabel: "State / Province",
                stateRequired: true,
                postcodeLabel: "Postcode / ZIP",
                postcodeMinLength: 2,
                postcodeMaxLength: 20
              },
              detectedStates: data.states || [],
              countries: []
            };
            if (countryOverride) {
              sessionStorage.setItem("next_selected_country", countryOverride.toUpperCase());
            }
            this.logger.info("Country config loaded:", {
              country: locationData?.detectedCountryCode,
              currency: locationData?.detectedCountryConfig.currencyCode
            });
          } else {
            this.logger.warn(`Failed to fetch country config for ${forcedCountry}, falling back to detection`);
          }
        } catch (error) {
          this.logger.error("Error fetching country config:", error);
        }
      }
      if (!locationData) {
        if (configStore$1.addressConfig) {
          countryService.setConfig(configStore$1.addressConfig);
        }
        const locationDataPromise = countryService.getLocationData();
        const timeoutPromise = new Promise(
          (_, reject) => setTimeout(() => reject(new Error("Location detection timeout")), 3e3)
        );
        try {
          locationData = await Promise.race([locationDataPromise, timeoutPromise]);
        } catch (error) {
          this.logger.warn("Location detection failed or timed out, using defaults:", error);
          locationData = {
            detectedCountryCode: "US",
            detectedCountryConfig: {
              stateLabel: "State",
              stateRequired: true,
              postcodeLabel: "ZIP Code",
              postcodeRegex: "^\\d{5}(-\\d{4})?$",
              postcodeMinLength: 5,
              postcodeMaxLength: 10,
              postcodeExample: "12345",
              currencyCode: "USD",
              currencySymbol: "$"
            },
            detectedStates: [],
            countries: []
          };
        }
      } else if (locationData && !locationData.countries?.length) {
        try {
          const countriesData = await countryService.getLocationData();
          locationData.countries = countriesData.countries || [];
        } catch (error) {
          this.logger.warn("Failed to fetch countries list:", error);
        }
      }
      if (locationData) {
        this.logger.info("User location detected:", {
          country: locationData.detectedCountryCode,
          currency: locationData.detectedCountryConfig.currencyCode,
          currencySymbol: locationData.detectedCountryConfig.currencySymbol
        });
        configStore$1.updateConfig({
          detectedCountry: locationData.detectedCountryCode,
          detectedCurrency: locationData.detectedCountryConfig.currencyCode,
          locationData
          // Cache the entire response
        });
        const urlParams2 = new URLSearchParams(window.location.search);
        const urlCurrency = urlParams2.get("currency");
        const savedCurrency = sessionStorage.getItem("next_selected_currency");
        const detectedCurrency = locationData.detectedCountryConfig.currencyCode;
        let selectedCurrency;
        if (urlCurrency) {
          selectedCurrency = urlCurrency.toUpperCase();
          this.logger.info("Currency override from URL:", selectedCurrency);
          sessionStorage.setItem("next_selected_currency", selectedCurrency);
        } else if (savedCurrency) {
          selectedCurrency = savedCurrency;
          this.logger.info("Using saved currency preference:", selectedCurrency);
        } else {
          selectedCurrency = detectedCurrency;
          this.logger.info("Using detected currency:", selectedCurrency);
        }
        configStore$1.updateConfig({
          selectedCurrency
        });
        this.logger.debug("Location and currency initialized:", {
          detectedCountry: configStore$1.detectedCountry,
          detectedCurrency: configStore$1.detectedCurrency,
          selectedCurrency: configStore$1.selectedCurrency
        });
      }
    } catch (error) {
      this.logger.warn("Failed to initialize location/currency, using defaults:", error);
      const savedCurrency = sessionStorage.getItem("next_selected_currency");
      const urlParams = new URLSearchParams(window.location.search);
      const urlCurrency = urlParams.get("currency");
      let fallbackCurrency = "USD";
      if (urlCurrency) {
        fallbackCurrency = urlCurrency.toUpperCase();
        sessionStorage.setItem("next_selected_currency", fallbackCurrency);
      } else if (savedCurrency) {
        fallbackCurrency = savedCurrency;
      }
      const configStore$1 = configStore.getState();
      configStore$1.updateConfig({
        detectedCountry: "US",
        detectedCurrency: "USD",
        selectedCurrency: fallbackCurrency
      });
    }
  }
  static async loadConfiguration() {
    const configStore$1 = configStore.getState();
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("reset") === "true") {
      await this.clearAllStorage();
      urlParams.delete("reset");
      const newUrl = window.location.pathname + (urlParams.toString() ? "?" + urlParams.toString() : "");
      window.history.replaceState({}, "", newUrl);
    }
    await this.captureUrlParameters(urlParams);
    const debugMode = urlParams.get("debugger") === "true";
    const forcePackageId = urlParams.get("forcePackageId");
    const forceShippingId = urlParams.get("forceShippingId");
    configStore$1.loadFromWindow();
    configStore$1.loadFromMeta();
    if (debugMode) {
      configStore$1.updateConfig({ debug: true });
    }
    if (forcePackageId) {
      this.logger.info("forcePackageId parameter detected:", forcePackageId);
      window._nextForcePackageId = forcePackageId;
    }
    if (forceShippingId) {
      this.logger.info("forceShippingId parameter detected:", forceShippingId);
      window._nextForceShippingId = forceShippingId;
    }
    this.logger.debug("Configuration loaded (metatags have priority):", configStore$1);
  }
  static async loadCampaignData() {
    const configStore$1 = configStore.getState();
    const campaignStore = useCampaignStore.getState();
    if (!configStore$1.apiKey) {
      throw new Error("API key not found. Please set next-api-key meta tag or window.nextConfig.apiKey");
    }
    this.campaignLoadStartTime = Date.now();
    await campaignStore.loadCampaign(configStore$1.apiKey);
    this.campaignLoadTime = Date.now() - this.campaignLoadStartTime;
    this.campaignFromCache = campaignStore.isFromCache || false;
    if (campaignStore.data) {
      queueMicrotask(() => {
        const trackData = {
          loadTime: this.campaignLoadTime,
          fromCache: this.campaignFromCache,
          packageCount: campaignStore.data?.packages?.length || 0,
          shippingMethodsCount: campaignStore.data?.shipping_methods?.length || 0,
          currency: campaignStore.data?.currency || "USD"
        };
        if (campaignStore.cacheAge !== void 0) {
          trackData.cacheAge = campaignStore.cacheAge;
        }
        trackCampaignLoaded(trackData);
      });
    }
    this.logger.debug("Campaign data loaded");
    await this.processForcePackageId();
    await this.processForceShippingId();
    await this.processProfileParameter();
    const eventBus = EventBus.getInstance();
    eventBus.emit("sdk:url-parameters-processed", {});
    this.logger.debug("Emitted sdk:url-parameters-processed event");
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
  static async processProfileParameter() {
    const urlParams = new URLSearchParams(window.location.search);
    const profileParam = urlParams.get("profile") || urlParams.get("forceProfile") || urlParams.get("packageProfile");
    const configStore$1 = configStore.getState();
    if (configStore$1.profiles && Object.keys(configStore$1.profiles).length > 0) {
      const { useProfileStore: useProfileStore22 } = await import("./utils-CYhT6z_5.js").then((n) => n.Z);
      const profileStore2 = useProfileStore22.getState();
      Object.entries(configStore$1.profiles).forEach(([id, config]) => {
        profileStore2.registerProfile({
          id,
          name: config.name,
          description: config.description || "",
          packageMappings: config.packageMappings
        });
      });
      this.logger.debug(`Registered ${Object.keys(configStore$1.profiles).length} profiles from config`);
    }
    if (profileParam) {
      this.logger.info("Profile parameter detected:", profileParam);
      try {
        const { ProfileManager: ProfileManager2 } = await Promise.resolve().then(() => ProfileManager$1);
        const profileManager = ProfileManager2.getInstance();
        const clearCart = urlParams.get("forceProfile") !== null;
        await profileManager.applyProfile(profileParam, { clearCart });
        this.logger.info(`Profile "${profileParam}" applied successfully from URL`);
      } catch (error) {
        this.logger.error("Failed to apply profile from URL:", error);
      }
      return;
    }
    const { useProfileStore: useProfileStore2 } = await import("./utils-CYhT6z_5.js").then((n) => n.Z);
    const profileStore = useProfileStore2.getState();
    if (profileStore.activeProfileId && profileStore.activeProfileId !== "default" && profileStore.activeProfileId !== "regular") {
      try {
        this.logger.info("Restoring persisted profile:", profileStore.activeProfileId);
        const { ProfileManager: ProfileManager2 } = await Promise.resolve().then(() => ProfileManager$1);
        const profileManager = ProfileManager2.getInstance();
        await profileManager.applyProfile(profileStore.activeProfileId, {
          clearCart: false,
          // Don't clear cart when restoring
          preserveQuantities: true
        });
        this.logger.info(`Restored profile "${profileStore.activeProfileId}" from previous session`);
        return;
      } catch (error) {
        this.logger.error("Failed to restore persisted profile:", error);
      }
    }
    if (configStore$1.defaultProfile && !profileStore.activeProfileId) {
      try {
        this.logger.info("Applying default profile:", configStore$1.defaultProfile);
        const { ProfileManager: ProfileManager2 } = await Promise.resolve().then(() => ProfileManager$1);
        const profileManager = ProfileManager2.getInstance();
        await profileManager.applyProfile(configStore$1.defaultProfile);
      } catch (error) {
        this.logger.error("Failed to apply default profile:", error);
      }
    }
  }
  static async processForceShippingId() {
    const forceShippingId = window._nextForceShippingId;
    if (!forceShippingId) {
      return;
    }
    try {
      this.logger.info("Processing forceShippingId parameter:", forceShippingId);
      const cartStore = useCartStore.getState();
      const campaignStore = useCampaignStore.getState();
      const shippingId = parseInt(forceShippingId, 10);
      if (isNaN(shippingId) || shippingId <= 0) {
        throw new Error(`Invalid shipping ID: ${forceShippingId}`);
      }
      const campaignData = campaignStore.data;
      if (!campaignData?.shipping_methods) {
        this.logger.warn("No shipping methods available in campaign data");
        return;
      }
      const shippingMethod = campaignData.shipping_methods.find(
        (method) => method.ref_id === shippingId
      );
      if (!shippingMethod) {
        this.logger.warn(`Shipping method ${shippingId} not found in campaign data`);
        this.logger.debug(
          "Available shipping methods:",
          campaignData.shipping_methods.map((m) => ({ id: m.ref_id, code: m.code, price: m.price }))
        );
        return;
      }
      await cartStore.setShippingMethod(shippingId);
      this.logger.info(`Successfully set shipping method: ${shippingMethod.code} (ID: ${shippingId}, Price: $${shippingMethod.price})`);
      delete window._nextForceShippingId;
    } catch (error) {
      this.logger.error("Error processing forceShippingId parameter:", error);
    }
  }
  static async initializeAttribution() {
    try {
      this.logger.info("Initializing attribution...");
      const attributionStore = useAttributionStore.getState();
      const configStore$1 = configStore.getState();
      await attributionStore.initialize();
      const sdkVersion = typeof window !== "undefined" && window.__NEXT_SDK_VERSION__ ? window.__NEXT_SDK_VERSION__ : "unknown";
      attributionStore.updateAttribution({
        metadata: {
          ...attributionStore.metadata,
          sdk_version: sdkVersion
        }
      });
      this.logger.debug(`Added SDK version to attribution metadata: ${sdkVersion}`);
      this.setupAttributionListeners();
      if (configStore$1.utmTransfer?.enabled) {
        const { UtmTransfer } = await import("./utils-CYhT6z_5.js").then((n) => n.a1);
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
        const { nextAnalytics } = await import("./utils-CYhT6z_5.js").then((n) => n.a0);
        await nextAnalytics.initialize();
        this.logger.debug("Analytics v2 initialized successfully (lazy)");
      } catch (error) {
        this.logger.warn("Analytics v2 initialization failed (non-critical):", error);
      }
    }, 0);
  }
  static initializeErrorHandler() {
    try {
      import("./utils-CYhT6z_5.js").then((n) => n.a2).then(({ errorHandler }) => {
        errorHandler.initialize();
        this.logger.debug("Error handler initialized");
      });
    } catch (error) {
      this.logger.warn("Error handler initialization failed:", error);
    }
  }
  static async checkAndLoadOrder() {
    const urlParams = new URLSearchParams(window.location.search);
    const refId = urlParams.get("ref_id") || urlParams.get("order_ref_id");
    if (refId) {
      const paramName = urlParams.get("ref_id") ? "ref_id" : "order_ref_id";
      this.logger.info(`Page loaded with ${paramName} parameter, auto-loading order:`, refId);
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
      const { debugOverlay } = await import("./utils-CYhT6z_5.js").then((n) => n.a3);
      debugOverlay.initialize();
      this.setupGlobalDebugUtils();
      this.logger.info("Debug utilities initialized ✅");
    }
  }
  static setupGlobalDebugUtils() {
    if (typeof window !== "undefined") {
      window.nextDebug = {
        overlay: () => import("./utils-CYhT6z_5.js").then((n) => n.a3).then((m) => m.debugOverlay),
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
            const { nextAnalytics } = await import("./utils-CYhT6z_5.js").then((n) => n.a0);
            return nextAnalytics.getStatus();
          },
          getProviders: async () => {
            const { nextAnalytics } = await import("./utils-CYhT6z_5.js").then((n) => n.a0);
            return nextAnalytics.getStatus().providers;
          },
          track: async (name, data) => {
            const { nextAnalytics } = await import("./utils-CYhT6z_5.js").then((n) => n.a0);
            return nextAnalytics.track({ event: name, ...data });
          },
          setDebugMode: async (enabled) => {
            const { nextAnalytics } = await import("./utils-CYhT6z_5.js").then((n) => n.a0);
            return nextAnalytics.setDebugMode(enabled);
          },
          invalidateContext: async () => {
            const { nextAnalytics } = await import("./utils-CYhT6z_5.js").then((n) => n.a0);
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
  static async waitForStoreRehydration() {
    const cartStore = useCartStore.getState();
    const storedData = sessionStorage.getItem(CART_STORAGE_KEY);
    if (storedData) {
      this.logger.debug("Waiting for cart store rehydration...");
      const rehydrationStartTime = Date.now();
      await new Promise((resolve) => {
        setTimeout(resolve, 50);
      });
      await cartStore.calculateTotals();
      const rehydrationTime = Date.now() - rehydrationStartTime;
      this.logger.debug("Cart store rehydration complete", {
        itemCount: cartStore.items.length,
        total: cartStore.total,
        isEmpty: cartStore.isEmpty
      });
      queueMicrotask(() => {
        trackCartLoaded({
          itemsCount: cartStore.items.length,
          cartValue: cartStore.total,
          loadTime: rehydrationTime,
          fromStorage: true
        });
      });
    } else {
      this.logger.debug("No cart data to rehydrate");
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
  static async clearAllStorage() {
    this.logger.info("Clearing all Next Campaign Cart storage...");
    const sessionKeys = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key && (key.startsWith("next-") || key.startsWith("_next"))) {
        sessionKeys.push(key);
      }
    }
    sessionKeys.forEach((key) => sessionStorage.removeItem(key));
    const localKeys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith("next-") || key.startsWith("_next"))) {
        localKeys.push(key);
      }
    }
    localKeys.forEach((key) => localStorage.removeItem(key));
    document.cookie.split(";").forEach((cookie) => {
      const eqPos = cookie.indexOf("=");
      const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
      if (name.startsWith("next_") || name.startsWith("_next")) {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`;
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${window.location.hostname};`;
      }
    });
    this.logger.info(`Cleared ${sessionKeys.length} sessionStorage items, ${localKeys.length} localStorage items`);
  }
};
_SDKInitializer.logger = createLogger("SDKInitializer");
_SDKInitializer.initialized = false;
_SDKInitializer.attributeScanner = null;
_SDKInitializer.retryAttempts = 0;
_SDKInitializer.maxRetries = 3;
_SDKInitializer.initStartTime = 0;
_SDKInitializer.campaignLoadStartTime = 0;
_SDKInitializer.campaignLoadTime = 0;
_SDKInitializer.campaignFromCache = false;
let SDKInitializer = _SDKInitializer;
class ProfileManager {
  constructor() {
    this.logger = createLogger("ProfileManager");
    this.eventBus = EventBus.getInstance();
    this.profileOperationInProgress = false;
    this.initialCartState = null;
    this.captureInitialState();
  }
  static getInstance() {
    if (!ProfileManager.instance) {
      ProfileManager.instance = new ProfileManager();
    }
    return ProfileManager.instance;
  }
  /**
   * Capture the initial cart state before any profiles are applied
   */
  captureInitialState() {
    const cartStore = useCartStore.getState();
    const profileStore = useProfileStore.getState();
    if (!profileStore.activeProfileId || profileStore.activeProfileId === "default" || profileStore.activeProfileId === "regular") {
      this.initialCartState = [...cartStore.items];
      this.logger.debug("Captured initial cart state with items:", this.initialCartState.map((i) => i.packageId));
    }
  }
  /**
   * Apply a profile to the current cart
   */
  async applyProfile(profileId, options = {}) {
    if (this.profileOperationInProgress) {
      this.logger.warn("Profile operation already in progress, skipping");
      return;
    }
    this.profileOperationInProgress = true;
    try {
      const { clearCart = false, preserveQuantities = true, skipValidation = false } = options;
      this.logger.info(`Applying profile: ${profileId}`, options);
      const profileStore = useProfileStore.getState();
      const cartStore = useCartStore.getState();
      if (profileId === "default" || profileId === "regular" || !profileId) {
        if (!profileStore.activeProfileId || profileStore.activeProfileId === "default" || profileStore.activeProfileId === "regular") {
          this.logger.info("Already on default/regular profile, no action needed");
          this.profileOperationInProgress = false;
          return;
        }
        await this.revertProfile();
        this.profileOperationInProgress = false;
        return;
      }
      const profile = profileStore.getProfileById(profileId);
      if (!profile) {
        const error = `Profile "${profileId}" not found`;
        this.logger.error(error);
        throw new Error(error);
      }
      if (profileStore.activeProfileId === profileId) {
        this.logger.info(`Profile "${profileId}" is already active`);
        return;
      }
      const currentItems = [...cartStore.items];
      if (clearCart) {
        await cartStore.clear();
        profileStore.activateProfile(profileId);
        profileStore.clearOriginalCartSnapshot();
        this.eventBus.emit("profile:applied", {
          profileId,
          previousProfileId: profileStore.previousProfileId,
          cleared: true,
          itemsSwapped: 0,
          profile
        });
        this.logger.info(`Profile "${profileId}" applied with cart cleared`);
        return;
      }
      if (currentItems.length > 0 && !profileStore.originalCartSnapshot) {
        profileStore.setOriginalCartSnapshot(currentItems);
        this.logger.debug("Saved original cart snapshot before profile application");
      } else if (profileStore.originalCartSnapshot) {
        this.logger.debug("Keeping existing cart snapshot, not overwriting");
      }
      const mappedItems = await this.mapCartItems(currentItems, profile, preserveQuantities, skipValidation);
      if (mappedItems.length === 0 && currentItems.length > 0) {
        this.logger.warn("No items could be mapped to the new profile");
      }
      await this.applyMappedItems(mappedItems, currentItems);
      profileStore.activateProfile(profileId);
      const event = {
        profileId,
        action: "applied",
        itemsAffected: mappedItems.length
      };
      if (profileStore.previousProfileId) {
        event.previousProfileId = profileStore.previousProfileId;
      }
      profileStore.addMappingEvent(event);
      this.eventBus.emit("profile:applied", {
        profileId,
        previousProfileId: profileStore.previousProfileId,
        itemsSwapped: mappedItems.length,
        originalItems: currentItems.length,
        profile
      });
      this.logger.info(`Profile "${profileId}" applied successfully, swapped ${mappedItems.length} items`);
    } finally {
      this.profileOperationInProgress = false;
    }
  }
  /**
   * Map cart items to new package IDs based on profile
   */
  async mapCartItems(items, profile, preserveQuantities, skipValidation) {
    const campaignStore = useCampaignStore.getState();
    const mappedItems = [];
    for (const item of items) {
      const mappedId = profile.packageMappings[item.packageId];
      if (mappedId === void 0) {
        this.logger.debug(`No mapping found for package ${item.packageId} in profile ${profile.id}, preserving as-is`);
        mappedItems.push({
          originalItem: item,
          mappedPackageId: item.packageId,
          // Keep the same package ID
          quantity: preserveQuantities ? item.quantity : 1,
          preserveUnmapped: true
          // Flag to indicate this item should be preserved unchanged
        });
        continue;
      }
      if (!skipValidation) {
        const mappedPackage = campaignStore.getPackage(mappedId);
        if (!mappedPackage) {
          this.logger.warn(`Mapped package ${mappedId} not found in campaign data, skipping`);
          continue;
        }
        mappedItems.push({
          originalItem: item,
          mappedPackageId: mappedId,
          quantity: preserveQuantities ? item.quantity : 1,
          mappedPackage
        });
      } else {
        mappedItems.push({
          originalItem: item,
          mappedPackageId: mappedId,
          quantity: preserveQuantities ? item.quantity : 1
        });
      }
    }
    return mappedItems;
  }
  /**
   * Apply mapped items to cart (swap operation)
   */
  async applyMappedItems(mappedItems, originalItems) {
    const cartStore = useCartStore.getState();
    const swapItems = [];
    for (const mapped of mappedItems) {
      const isUnmapped = mapped.preserveUnmapped === true;
      swapItems.push({
        packageId: mapped.mappedPackageId,
        quantity: mapped.quantity,
        isUpsell: mapped.originalItem.is_upsell || false,
        // Only store original package ID if it was actually mapped
        originalPackageId: isUnmapped ? void 0 : mapped.originalItem.packageId
      });
      if (isUnmapped) {
        this.logger.debug(`Will preserve unmapped package ${mapped.mappedPackageId}`);
      } else {
        this.logger.debug(`Will add mapped package ${mapped.mappedPackageId} (was ${mapped.originalItem.packageId})`);
      }
    }
    await cartStore.swapCart(swapItems);
    this.logger.info(`Applied ${mappedItems.length} items to cart (including preserved items)`);
  }
  /**
   * Revert to original packages (before profile was applied)
   */
  async revertProfile() {
    const profileStore = useProfileStore.getState();
    const cartStore = useCartStore.getState();
    const previousProfileId = profileStore.activeProfileId;
    let cartToRestore = this.initialCartState;
    if (!cartToRestore || cartToRestore.length === 0) {
      cartToRestore = profileStore.originalCartSnapshot || null;
    }
    if (!cartToRestore || cartToRestore.length === 0) {
      this.logger.warn("No cart state to revert to, attempting to reverse profile mappings");
      if (previousProfileId && previousProfileId !== "default" && previousProfileId !== "regular") {
        const currentItems = cartStore.items;
        if (currentItems.length > 0) {
          const itemsToRestore2 = currentItems.map((item) => {
            const packageId = item.originalPackageId || item.packageId;
            return {
              packageId,
              quantity: item.quantity,
              isUpsell: item.is_upsell || false
            };
          });
          this.logger.info("Attempting to reverse profile mappings for cart items");
          try {
            await cartStore.swapCart(itemsToRestore2);
            profileStore.deactivateProfile();
            this.eventBus.emit("profile:reverted", {
              previousProfileId,
              itemsRestored: itemsToRestore2.length
            });
            this.logger.info(`Reversed profile mappings for ${itemsToRestore2.length} items`);
            return;
          } catch (error) {
            this.logger.error("Failed to reverse profile mappings:", error);
          }
        }
      }
      profileStore.deactivateProfile();
      this.eventBus.emit("profile:reverted", {
        previousProfileId,
        itemsRestored: 0
      });
      return;
    }
    this.logger.info("Reverting to original cart state");
    profileStore.deactivateProfile();
    profileStore.clearOriginalCartSnapshot();
    const itemsToRestore = cartToRestore.map((item) => ({
      // If reverting from snapshot that may contain mapped items, check originalPackageId
      // But if using initial state, items are already unmapped
      packageId: item.originalPackageId || item.packageId,
      quantity: item.quantity,
      isUpsell: item.is_upsell || false
    }));
    let restoredCount = 0;
    try {
      await cartStore.swapCart(itemsToRestore);
      restoredCount = itemsToRestore.length;
    } catch (error) {
      this.logger.error("Failed to restore cart items:", error);
      await cartStore.clear();
      for (const item of cartToRestore) {
        try {
          await cartStore.addItem({
            packageId: item.packageId,
            quantity: item.quantity,
            isUpsell: item.is_upsell || false
          });
          restoredCount++;
        } catch (error2) {
          this.logger.error(`Failed to restore item ${item.packageId}:`, error2);
        }
      }
    }
    profileStore.addMappingEvent({
      profileId: previousProfileId || "unknown",
      action: "reverted",
      itemsAffected: restoredCount
    });
    this.eventBus.emit("profile:reverted", {
      previousProfileId,
      itemsRestored: restoredCount
    });
    this.logger.info(`Reverted profile, restored ${restoredCount} items`);
  }
  /**
   * Switch between profiles (convenience method)
   */
  async switchProfile(fromProfileId, toProfileId, options = {}) {
    if (fromProfileId) {
      const profileStore2 = useProfileStore.getState();
      if (profileStore2.activeProfileId !== fromProfileId) {
        this.logger.warn(`Expected active profile "${fromProfileId}" but found "${profileStore2.activeProfileId}"`);
      }
    }
    await this.applyProfile(toProfileId, options);
    const profileStore = useProfileStore.getState();
    const switchEvent = {
      profileId: toProfileId,
      action: "switched",
      itemsAffected: useCartStore.getState().items.length
    };
    if (fromProfileId) {
      switchEvent.previousProfileId = fromProfileId;
    }
    profileStore.addMappingEvent(switchEvent);
  }
  /**
   * Check if a profile can be applied
   */
  canApplyProfile(profileId) {
    const profileStore = useProfileStore.getState();
    const profile = profileStore.getProfileById(profileId);
    if (!profile) {
      return false;
    }
    return true;
  }
  /**
   * Get profile application statistics
   */
  getProfileStats() {
    const profileStore = useProfileStore.getState();
    return {
      activeProfile: profileStore.activeProfileId,
      previousProfile: profileStore.previousProfileId,
      totalProfiles: profileStore.profiles.size,
      historyLength: profileStore.mappingHistory.length,
      hasOriginalSnapshot: !!profileStore.originalCartSnapshot
    };
  }
  /**
   * Clear all profile data and revert to original state
   */
  async clearAllProfiles() {
    await this.revertProfile();
    const profileStore = useProfileStore.getState();
    profileStore.reset();
    this.logger.info("All profile data cleared");
  }
}
const ProfileManager$1 = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  ProfileManager
});
class BaseEnhancer {
  constructor(element) {
    this.subscriptions = [];
    this.element = element;
    this.logger = createLogger(this.constructor.name);
    this.eventBus = EventBus.getInstance();
  }
  // Optional lifecycle hook
  destroy() {
    this.subscriptions.forEach((unsubscribe) => unsubscribe());
    this.subscriptions = [];
    this.cleanupEventListeners();
  }
  // Event handling
  emit(event, detail) {
    this.eventBus.emit(event, detail);
  }
  on(event, handler) {
    this.eventBus.on(event, handler);
  }
  // Store subscription helper
  subscribe(store, listener) {
    const unsubscribe = store.subscribe(listener);
    this.subscriptions.push(unsubscribe);
  }
  // Utility methods
  getAttribute(name) {
    return this.element.getAttribute(name);
  }
  getRequiredAttribute(name) {
    const value = this.getAttribute(name);
    if (!value) {
      throw new Error(`Required attribute ${name} not found on element`);
    }
    return value;
  }
  hasAttribute(name) {
    return this.element.hasAttribute(name);
  }
  setAttribute(name, value) {
    this.element.setAttribute(name, value);
  }
  removeAttribute(name) {
    this.element.removeAttribute(name);
  }
  addClass(className) {
    this.element.classList.add(className);
  }
  removeClass(className) {
    this.element.classList.remove(className);
  }
  hasClass(className) {
    return this.element.classList.contains(className);
  }
  toggleClass(className, force) {
    this.element.classList.toggle(className, force);
  }
  updateTextContent(content) {
    this.element.textContent = content;
  }
  updateInnerHTML(html) {
    this.element.innerHTML = html;
  }
  // Override this in subclasses if they add event listeners
  cleanupEventListeners() {
  }
  // Validation helpers
  validateElement() {
    if (!this.element) {
      throw new Error("Element is required");
    }
  }
  // Error handling
  handleError(error, context) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    this.logger.error(`Error in ${context}:`, errorMessage);
    this.emit("error:occurred", {
      message: errorMessage,
      code: "ENHANCER_ERROR",
      details: { enhancer: this.constructor.name, context, element: this.element }
    });
  }
}
class ProfileSwitcherEnhancer extends BaseEnhancer {
  constructor() {
    super(...arguments);
    this.clearCart = false;
    this.preserveQuantities = true;
    this.profileManager = ProfileManager.getInstance();
  }
  async initialize() {
    this.validateElement();
    this.profileId = this.getAttribute("data-next-profile") || void 0;
    if (!this.profileId) {
      this.logger.error("Profile ID is required for profile switcher", this.element);
      return;
    }
    this.clearCart = this.getAttribute("data-next-clear-cart") === "true";
    this.preserveQuantities = this.getAttribute("data-next-preserve-quantities") !== "false";
    this.clickHandler = this.handleClick.bind(this);
    this.element.addEventListener("click", this.clickHandler);
    this.updateActiveState();
    this.eventBus.on("profile:applied", this.updateActiveState.bind(this));
    this.eventBus.on("profile:reverted", this.updateActiveState.bind(this));
    this.element.classList.add("next-profile-switcher");
    this.logger.debug("ProfileSwitcherEnhancer initialized", {
      profileId: this.profileId,
      clearCart: this.clearCart,
      preserveQuantities: this.preserveQuantities
    });
  }
  async handleClick(event) {
    event.preventDefault();
    if (!this.profileId) {
      return;
    }
    try {
      this.element.classList.add("next-loading");
      this.element.setAttribute("aria-busy", "true");
      const profileStore = useProfileStore.getState();
      if (profileStore.activeProfileId === this.profileId) {
        this.logger.info(`Profile "${this.profileId}" is already active`);
        return;
      }
      await this.profileManager.applyProfile(this.profileId, {
        clearCart: this.clearCart,
        preserveQuantities: this.preserveQuantities
      });
      this.logger.info(`Profile "${this.profileId}" applied via switcher`);
      this.eventBus.emit("action:success", {
        action: "profile-switch",
        data: { profileId: this.profileId }
      });
    } catch (error) {
      this.logger.error(`Failed to apply profile "${this.profileId}":`, error);
      this.eventBus.emit("action:failed", {
        action: "profile-switch",
        error
      });
    } finally {
      this.element.classList.remove("next-loading");
      this.element.setAttribute("aria-busy", "false");
    }
  }
  updateActiveState() {
    const profileStore = useProfileStore.getState();
    const isActive = profileStore.activeProfileId === this.profileId;
    this.element.classList.toggle("next-profile-active", isActive);
    this.element.setAttribute("aria-pressed", String(isActive));
    const activeText = this.element.getAttribute("data-next-active-text");
    const inactiveText = this.element.getAttribute("data-next-inactive-text");
    if (activeText && inactiveText) {
      const textElement = this.element.querySelector(".next-profile-text") || this.element;
      if (textElement.textContent) {
        textElement.textContent = isActive ? activeText : inactiveText;
      }
    }
  }
  update(_data) {
    this.updateActiveState();
  }
  destroy() {
    if (this.clickHandler) {
      this.element.removeEventListener("click", this.clickHandler);
    }
    this.element.classList.remove("next-profile-switcher", "next-profile-active", "next-loading");
    this.element.removeAttribute("aria-pressed");
    this.element.removeAttribute("aria-busy");
    super.destroy();
  }
}
class ProfileSelectorEnhancer extends BaseEnhancer {
  constructor() {
    super(...arguments);
    this.profileManager = ProfileManager.getInstance();
    this.clearCart = false;
    this.preserveQuantities = true;
  }
  async initialize() {
    this.validateElement();
    if (!(this.element instanceof HTMLSelectElement)) {
      this.logger.error("ProfileSelectorEnhancer requires a <select> element", this.element);
      return;
    }
    this.selectElement = this.element;
    this.clearCart = this.getAttribute("data-next-clear-cart") === "true";
    this.preserveQuantities = this.getAttribute("data-next-preserve-quantities") !== "false";
    this.changeHandler = this.handleChange.bind(this);
    this.selectElement.addEventListener("change", this.changeHandler);
    if (this.getAttribute("data-next-auto-populate") === "true") {
      this.populateOptions();
    }
    this.updateSelectedValue();
    this.eventBus.on("profile:applied", this.updateSelectedValue.bind(this));
    this.eventBus.on("profile:reverted", this.updateSelectedValue.bind(this));
    this.element.classList.add("next-profile-selector");
    this.logger.debug("ProfileSelectorEnhancer initialized");
  }
  populateOptions() {
    if (!this.selectElement) {
      return;
    }
    const profileStore = useProfileStore.getState();
    const profiles = profileStore.getAllProfiles();
    this.selectElement.innerHTML = "";
    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.textContent = "Regular Pricing";
    this.selectElement.appendChild(defaultOption);
    profiles.forEach((profile) => {
      const option = document.createElement("option");
      option.value = profile.id;
      option.textContent = profile.name;
      if (this.selectElement) {
        this.selectElement.appendChild(option);
      }
    });
  }
  async handleChange(event) {
    if (!this.selectElement) {
      return;
    }
    const profileId = this.selectElement.value;
    try {
      if (profileId) {
        await this.profileManager.applyProfile(profileId, {
          clearCart: this.clearCart,
          preserveQuantities: this.preserveQuantities
        });
        this.logger.info(`Profile "${profileId}" applied via selector`);
      } else {
        await this.profileManager.revertProfile();
        this.logger.info("Profile reverted via selector");
      }
      this.eventBus.emit("action:success", {
        action: "profile-select",
        data: { profileId: profileId || "none" }
      });
    } catch (error) {
      this.logger.error(`Failed to apply profile "${profileId}":`, error);
      this.updateSelectedValue();
      this.eventBus.emit("action:failed", {
        action: "profile-select",
        error
      });
    }
  }
  updateSelectedValue() {
    if (!this.selectElement) {
      return;
    }
    const profileStore = useProfileStore.getState();
    this.selectElement.value = profileStore.activeProfileId || "";
  }
  update(_data) {
    this.updateSelectedValue();
  }
  destroy() {
    if (this.changeHandler && this.selectElement) {
      this.selectElement.removeEventListener("change", this.changeHandler);
    }
    this.element.classList.remove("next-profile-selector");
    super.destroy();
  }
}
const ProfileSwitcherEnhancer$1 = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  ProfileSelectorEnhancer,
  ProfileSwitcherEnhancer
});
const VERSION = typeof window !== "undefined" && window.__NEXT_SDK_VERSION__ ? window.__NEXT_SDK_VERSION__ : "__VERSION__";
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
        import("./CartDisplayEnhancer-BhOZMnzu.js");
        import("./CartToggleEnhancer-D3_xCJdl.js");
        import("./PackageSelectorEnhancer-GPXlvkvJ.js");
        import("./ProductDisplayEnhancer-CxSTc2HZ.js");
        import("./SelectionDisplayEnhancer-DRgrbgkz.js");
        import("./TimerEnhancer-B8Fr2Ry-.js");
      }, { timeout: 5e3 });
      requestIdleCallback(() => {
        import("./CheckoutFormEnhancer-BC7gOjvV.js");
        import("./ExpressCheckoutContainerEnhancer-ceshwKKw.js");
        import("./OrderDisplayEnhancer-B2xI21tT.js");
        import("./UpsellEnhancer-CKk8vNKI.js");
        import("./utils-CYhT6z_5.js").then((n) => n.$);
        import("./CartItemListEnhancer-DbS2i4rm.js");
        import("./QuantityControlEnhancer-HiK96PoL.js");
      }, { timeout: 5e3 });
      requestIdleCallback(() => {
        import("./AccordionEnhancer-C4jHTWq9.js");
        import("./CouponEnhancer-Nj6fRKph.js");
        import("./SimpleExitIntentEnhancer-DEbxD7xO.js");
        Promise.resolve().then(() => ProfileManager$1);
        Promise.resolve().then(() => ProfileSwitcherEnhancer$1);
      }, { timeout: 5e3 });
    } else {
      setTimeout(() => {
        import("./CartDisplayEnhancer-BhOZMnzu.js");
        import("./ProductDisplayEnhancer-CxSTc2HZ.js");
        import("./utils-CYhT6z_5.js").then((n) => n.a4);
      }, 1e3);
    }
  });
}
export {
  AttributeParser as A,
  BaseEnhancer as B,
  NextCommerce as N,
  ProfileManager as P,
  SDKInitializer as S,
  VERSION as V,
  ProfileSwitcherEnhancer as a,
  ProfileSelectorEnhancer as b,
  ProfileManager$1 as c,
  useParameterStore as u
};
