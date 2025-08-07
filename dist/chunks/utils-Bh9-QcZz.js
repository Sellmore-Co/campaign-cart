import { c as create, p as persist, s as subscribeWithSelector } from "./vendor-B2NPMtAQ.js";
var LogLevel = /* @__PURE__ */ ((LogLevel2) => {
  LogLevel2[LogLevel2["ERROR"] = 0] = "ERROR";
  LogLevel2[LogLevel2["WARN"] = 1] = "WARN";
  LogLevel2[LogLevel2["INFO"] = 2] = "INFO";
  LogLevel2[LogLevel2["DEBUG"] = 3] = "DEBUG";
  return LogLevel2;
})(LogLevel || {});
const isDebugModeEnabled = () => {
  if (typeof window === "undefined") return false;
  const params = new URLSearchParams(window.location.search);
  return params.get("debug") === "true" || params.get("debugger") === "true";
};
const _Logger = class _Logger {
  constructor(context) {
    this.context = context;
  }
  static setLogLevel(level) {
    _Logger.globalLevel = level;
  }
  static getLogLevel() {
    return _Logger.globalLevel;
  }
  error(message, ...args) {
    if (_Logger.globalLevel >= 0) {
      console.error(`[${this.context}] ${message}`, ...args);
    }
  }
  warn(message, ...args) {
    if (!isDebugModeEnabled()) {
      return;
    }
    if (_Logger.globalLevel >= 1) {
      console.warn(`[${this.context}] ${message}`, ...args);
    }
  }
  info(message, ...args) {
    if (!isDebugModeEnabled()) {
      return;
    }
    if (_Logger.globalLevel >= 2) {
      console.info(`[${this.context}] ${message}`, ...args);
    }
  }
  debug(message, ...args) {
    if (!isDebugModeEnabled()) {
      return;
    }
    if (_Logger.globalLevel >= 3) {
      console.debug(`[${this.context}] ${message}`, ...args);
    }
  }
};
_Logger.globalLevel = 2;
let Logger = _Logger;
class ProductionLogger extends Logger {
  constructor(context) {
    super(context);
  }
  warn(message, ...args) {
    if (isDebugModeEnabled()) {
      super.warn(message, ...args);
    }
  }
  info(message, ...args) {
    if (isDebugModeEnabled()) {
      super.info(message, ...args);
    }
  }
  debug(message, ...args) {
    if (isDebugModeEnabled()) {
      super.debug(message, ...args);
    }
  }
}
function createLogger(context) {
  {
    return new ProductionLogger(context);
  }
}
createLogger("SDK");
class StorageManager {
  constructor(options = {}) {
    this.logger = createLogger("StorageManager");
    this.storage = options.storage ?? sessionStorage;
    this.serialize = options.serialize ?? JSON.stringify;
    this.deserialize = options.deserialize ?? JSON.parse;
  }
  set(key, value) {
    try {
      const serialized = this.serialize(value);
      this.storage.setItem(key, serialized);
      this.logger.debug(`Stored value for key: ${key}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to store value for key ${key}:`, error);
      return false;
    }
  }
  get(key, defaultValue) {
    try {
      const item = this.storage.getItem(key);
      if (item === null) {
        this.logger.debug(`No value found for key: ${key}`);
        return defaultValue;
      }
      const deserialized = this.deserialize(item);
      this.logger.debug(`Retrieved value for key: ${key}`);
      return deserialized;
    } catch (error) {
      this.logger.error(`Failed to retrieve value for key ${key}:`, error);
      return defaultValue;
    }
  }
  remove(key) {
    try {
      this.storage.removeItem(key);
      this.logger.debug(`Removed value for key: ${key}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to remove value for key ${key}:`, error);
      return false;
    }
  }
  clear() {
    try {
      this.storage.clear();
      this.logger.debug("Cleared all storage");
      return true;
    } catch (error) {
      this.logger.error("Failed to clear storage:", error);
      return false;
    }
  }
  has(key) {
    return this.storage.getItem(key) !== null;
  }
  keys() {
    const keys = [];
    for (let i = 0; i < this.storage.length; i++) {
      const key = this.storage.key(i);
      if (key !== null) {
        keys.push(key);
      }
    }
    return keys;
  }
  size() {
    let total = 0;
    for (let i = 0; i < this.storage.length; i++) {
      const key = this.storage.key(i);
      if (key !== null) {
        const value = this.storage.getItem(key);
        if (value !== null) {
          total += key.length + value.length;
        }
      }
    }
    return total;
  }
}
const sessionStorageManager = new StorageManager({
  storage: sessionStorage
});
new StorageManager({
  storage: localStorage
});
const CART_STORAGE_KEY = "next-cart-state";
const CAMPAIGN_STORAGE_KEY = "next-campaign-cache";
class EventBus {
  constructor() {
    this.listeners = /* @__PURE__ */ new Map();
  }
  static getInstance() {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus();
    }
    return EventBus.instance;
  }
  on(event, handler) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, /* @__PURE__ */ new Set());
    }
    this.listeners.get(event).add(handler);
  }
  emit(event, data) {
    const handlers = this.listeners.get(event);
    if (handlers) {
      handlers.forEach((handler) => {
        try {
          handler(data);
        } catch (error) {
          console.error(`Event handler error for ${String(event)}:`, error);
        }
      });
    }
  }
  off(event, handler) {
    const handlers = this.listeners.get(event);
    if (handlers) {
      handlers.delete(handler);
    }
  }
  removeAllListeners(event) {
    if (event) {
      this.listeners.delete(event);
    } else {
      this.listeners.clear();
    }
  }
}
const logger$a = createLogger("CartStore");
const initialState$3 = {
  items: [],
  subtotal: 0,
  shipping: 0,
  tax: 0,
  total: 0,
  totalQuantity: 0,
  isEmpty: true,
  appliedCoupons: [],
  enrichedItems: [],
  totals: {
    subtotal: { value: 0, formatted: "$0.00" },
    shipping: { value: 0, formatted: "$0.00" },
    tax: { value: 0, formatted: "$0.00" },
    discounts: { value: 0, formatted: "$0.00" },
    total: { value: 0, formatted: "$0.00" },
    count: 0,
    isEmpty: true,
    savings: { value: 0, formatted: "$0.00" },
    savingsPercentage: { value: 0, formatted: "0%" },
    compareTotal: { value: 0, formatted: "$0.00" },
    hasSavings: false,
    totalSavings: { value: 0, formatted: "$0.00" },
    totalSavingsPercentage: { value: 0, formatted: "0%" },
    hasTotalSavings: false
  }
};
const cartStoreInstance = create()(
  persist(
    subscribeWithSelector((set, get) => ({
      ...initialState$3,
      addItem: async (item) => {
        const { useCampaignStore: useCampaignStore2 } = await Promise.resolve().then(() => campaignStore);
        const campaignStore$1 = useCampaignStore2.getState();
        const packageData = campaignStore$1.getPackage(item.packageId ?? 0);
        if (!packageData) {
          throw new Error(`Package ${item.packageId} not found in campaign data`);
        }
        set((state) => {
          const newItem = {
            id: Date.now(),
            packageId: item.packageId ?? 0,
            quantity: item.quantity ?? 1,
            price: parseFloat(packageData.price_total),
            // Use total package price, not per-unit
            title: item.title ?? packageData.name,
            is_upsell: item.isUpsell ?? false,
            image: item.image ?? void 0,
            sku: item.sku ?? void 0,
            // Add campaign response data for display
            price_per_unit: packageData.price,
            qty: packageData.qty,
            price_total: packageData.price_total,
            price_retail: packageData.price_retail,
            price_retail_total: packageData.price_retail_total,
            price_recurring: packageData.price_recurring,
            is_recurring: packageData.is_recurring,
            interval: packageData.interval,
            interval_count: packageData.interval_count
          };
          if (item.isUpsell) {
            logger$a.debug(`Adding upsell item:`, {
              packageId: newItem.packageId,
              isUpsell: item.isUpsell,
              finalItemIsUpsell: newItem.is_upsell,
              itemData: newItem
            });
          }
          const existingIndex = state.items.findIndex(
            (existing) => existing.packageId === newItem.packageId
          );
          let newItems;
          if (existingIndex >= 0) {
            newItems = [...state.items];
            newItems[existingIndex].quantity += newItem.quantity;
          } else {
            newItems = [...state.items, newItem];
          }
          return { ...state, items: newItems };
        });
        get().calculateTotals();
        const eventBus = EventBus.getInstance();
        eventBus.emit("cart:item-added", {
          packageId: item.packageId ?? 0,
          quantity: item.quantity ?? 1
        });
        eventBus.emit("cart:updated", get());
      },
      removeItem: async (packageId) => {
        const removedItem = get().items.find((item) => item.packageId === packageId);
        set((state) => {
          const newItems = state.items.filter((item) => item.packageId !== packageId);
          return { ...state, items: newItems };
        });
        get().calculateTotals();
        if (removedItem) {
          const eventBus = EventBus.getInstance();
          eventBus.emit("cart:item-removed", {
            packageId
          });
          eventBus.emit("cart:updated", get());
        }
      },
      updateQuantity: async (packageId, quantity) => {
        if (quantity <= 0) {
          return get().removeItem(packageId);
        }
        const currentItem = get().items.find((item) => item.packageId === packageId);
        const oldQuantity = currentItem?.quantity ?? 0;
        set((state) => {
          const newItems = state.items.map(
            (item) => item.packageId === packageId ? { ...item, quantity } : item
          );
          return { ...state, items: newItems };
        });
        get().calculateTotals();
        if (currentItem) {
          const eventBus = EventBus.getInstance();
          eventBus.emit("cart:quantity-changed", {
            packageId,
            quantity,
            oldQuantity
          });
          eventBus.emit("cart:updated", get());
        }
      },
      swapPackage: async (removePackageId, addItem) => {
        set((state) => ({ ...state, swapInProgress: true }));
        try {
          await get().removeItem(removePackageId);
          await get().addItem(addItem);
        } finally {
          set((state) => ({ ...state, swapInProgress: false }));
        }
      },
      clear: async () => {
        set((state) => ({
          ...state,
          items: []
        }));
        get().calculateTotals();
      },
      syncWithAPI: async () => {
        logger$a.debug("syncWithAPI not yet implemented");
      },
      calculateTotals: async () => {
        try {
          const { useCampaignStore: useCampaignStore2 } = await Promise.resolve().then(() => campaignStore);
          const campaignState = useCampaignStore2.getState();
          const state = get();
          const subtotal = state.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
          const totalQuantity = state.items.reduce((sum, item) => sum + item.quantity, 0);
          const isEmpty = state.items.length === 0;
          const formatCurrency = (amount) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
          const compareTotal = state.items.reduce((sum, item) => {
            const packageData = campaignState.getPackage(item.packageId);
            let retailTotal = 0;
            if (packageData?.price_retail_total) {
              retailTotal = parseFloat(packageData.price_retail_total);
            } else if (packageData?.price_total) {
              retailTotal = parseFloat(packageData.price_total);
            }
            return sum + retailTotal * item.quantity;
          }, 0);
          const savings = Math.max(0, compareTotal - subtotal);
          const savingsPercentage = compareTotal > 0 ? savings / compareTotal * 100 : 0;
          const hasSavings = savings > 0;
          const shipping = get().calculateShipping();
          const tax = get().calculateTax();
          let totalDiscounts = 0;
          const appliedCoupons = state.appliedCoupons || [];
          const updatedCoupons = appliedCoupons.map((appliedCoupon) => {
            const discountAmount = get().calculateDiscountAmount(appliedCoupon.definition);
            totalDiscounts += discountAmount;
            return {
              ...appliedCoupon,
              discount: discountAmount
            };
          });
          if (updatedCoupons.length > 0) {
            set((currentState) => ({
              ...currentState,
              appliedCoupons: updatedCoupons
            }));
          }
          const total = subtotal + shipping + tax - totalDiscounts;
          const totalSavings = savings + totalDiscounts;
          const totalSavingsPercentage = compareTotal > 0 ? totalSavings / compareTotal * 100 : 0;
          const hasTotalSavings = totalSavings > 0;
          const totals = {
            subtotal: { value: subtotal, formatted: formatCurrency(subtotal) },
            shipping: { value: shipping, formatted: formatCurrency(shipping) },
            tax: { value: tax, formatted: formatCurrency(tax) },
            discounts: { value: totalDiscounts, formatted: formatCurrency(totalDiscounts) },
            total: { value: total, formatted: formatCurrency(total) },
            count: totalQuantity,
            isEmpty,
            savings: { value: savings, formatted: formatCurrency(savings) },
            savingsPercentage: { value: savingsPercentage, formatted: `${Math.round(savingsPercentage)}%` },
            compareTotal: { value: compareTotal, formatted: formatCurrency(compareTotal) },
            hasSavings,
            totalSavings: { value: totalSavings, formatted: formatCurrency(totalSavings) },
            totalSavingsPercentage: { value: totalSavingsPercentage, formatted: `${Math.round(totalSavingsPercentage)}%` },
            hasTotalSavings
          };
          set({
            subtotal,
            shipping,
            tax,
            total,
            totalQuantity,
            isEmpty,
            totals
          });
          await get().calculateEnrichedItems();
        } catch (error) {
          console.error("Error calculating totals:", error);
          set({
            subtotal: 0,
            shipping: 0,
            tax: 0,
            total: 0,
            totalQuantity: 0,
            isEmpty: true,
            totals: {
              subtotal: { value: 0, formatted: "$0.00" },
              shipping: { value: 0, formatted: "$0.00" },
              tax: { value: 0, formatted: "$0.00" },
              discounts: { value: 0, formatted: "$0.00" },
              total: { value: 0, formatted: "$0.00" },
              count: 0,
              isEmpty: true,
              savings: { value: 0, formatted: "$0.00" },
              savingsPercentage: { value: 0, formatted: "0%" },
              compareTotal: { value: 0, formatted: "$0.00" },
              hasSavings: false,
              totalSavings: { value: 0, formatted: "$0.00" },
              totalSavingsPercentage: { value: 0, formatted: "0%" },
              hasTotalSavings: false
            }
          });
        }
      },
      hasItem: (packageId) => {
        const state = get();
        return state.items.some((item) => item.packageId === packageId);
      },
      getItem: (packageId) => {
        const state = get();
        return state.items.find((item) => item.packageId === packageId);
      },
      getItemQuantity: (packageId) => {
        const state = get();
        const item = state.items.find((item2) => item2.packageId === packageId);
        return item?.quantity ?? 0;
      },
      calculateShipping: () => {
        const state = get();
        if (state.isEmpty || state.items.length === 0) {
          return 0;
        }
        if (state.shippingMethod) {
          return state.shippingMethod.price;
        }
        return 0;
      },
      calculateTax: () => {
        return 0;
      },
      setShippingMethod: async (methodId) => {
        try {
          const { useCampaignStore: useCampaignStore2 } = await Promise.resolve().then(() => campaignStore);
          const { useCheckoutStore: useCheckoutStore2 } = await Promise.resolve().then(() => checkoutStore);
          const campaignStore$1 = useCampaignStore2.getState();
          const checkoutStore$1 = useCheckoutStore2.getState();
          const campaignData = campaignStore$1.data;
          if (!campaignData?.shipping_methods) {
            throw new Error("No shipping methods available");
          }
          const shippingMethod = campaignData.shipping_methods.find(
            (method) => method.ref_id === methodId
          );
          if (!shippingMethod) {
            throw new Error(`Shipping method ${methodId} not found`);
          }
          const price = parseFloat(shippingMethod.price || "0");
          set((state) => ({
            ...state,
            shippingMethod: {
              id: shippingMethod.ref_id,
              name: shippingMethod.code,
              price,
              code: shippingMethod.code
            }
          }));
          checkoutStore$1.setShippingMethod({
            id: shippingMethod.ref_id,
            name: shippingMethod.code,
            price,
            code: shippingMethod.code
          });
          get().calculateTotals();
          const eventBus = EventBus.getInstance();
          eventBus.emit("shipping:method-changed", {
            methodId,
            method: shippingMethod
          });
        } catch (error) {
          console.error("Failed to set shipping method:", error);
          throw error;
        }
      },
      getTotalWeight: () => {
        const state = get();
        return state.items.reduce((sum, item) => sum + item.quantity, 0);
      },
      getTotalItemCount: () => {
        const state = get();
        return state.items.reduce((sum, item) => sum + item.quantity, 0);
      },
      calculateEnrichedItems: async () => {
        try {
          const { useCampaignStore: useCampaignStore2 } = await Promise.resolve().then(() => campaignStore);
          const campaignState = useCampaignStore2.getState();
          const state = get();
          const formatCurrency = (amount) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
          const enrichedItems = state.items.map((item) => {
            const packageData = campaignState.getPackage(item.packageId);
            const actualUnitPrice = parseFloat(packageData?.price || "0");
            const retailUnitPrice = parseFloat(packageData?.price_retail || packageData?.price || "0");
            const packagePrice = item.price;
            const lineTotal = packagePrice * item.quantity;
            let retailPackagePrice = 0;
            if (packageData?.price_retail_total) {
              retailPackagePrice = parseFloat(packageData.price_retail_total);
            } else if (packageData?.price_total) {
              retailPackagePrice = parseFloat(packageData.price_total);
            }
            const retailLineTotal = retailPackagePrice * item.quantity;
            const unitSavings = Math.max(0, retailUnitPrice - actualUnitPrice);
            const lineSavings = Math.max(0, retailLineTotal - lineTotal);
            const savingsPct = retailUnitPrice > actualUnitPrice ? Math.round(unitSavings / retailUnitPrice * 100) : 0;
            const hasRecurring = packageData?.is_recurring === true;
            const recurringPrice = hasRecurring ? parseFloat(packageData?.price_recurring || "0") : 0;
            const frequencyText = hasRecurring ? packageData?.interval_count && packageData.interval_count > 1 ? `Every ${packageData.interval_count} ${packageData.interval}s` : `Per ${packageData.interval}` : "One time";
            return {
              id: item.id,
              packageId: item.packageId,
              quantity: item.quantity,
              price: {
                excl_tax: { value: actualUnitPrice, formatted: formatCurrency(actualUnitPrice) },
                incl_tax: { value: actualUnitPrice, formatted: formatCurrency(actualUnitPrice) },
                original: { value: retailUnitPrice, formatted: formatCurrency(retailUnitPrice) },
                savings: { value: unitSavings, formatted: formatCurrency(unitSavings) },
                recurring: { value: recurringPrice, formatted: formatCurrency(recurringPrice) },
                // Line totals
                lineTotal: { value: lineTotal, formatted: formatCurrency(lineTotal) },
                lineCompare: { value: retailLineTotal, formatted: formatCurrency(retailLineTotal) },
                lineSavings: { value: lineSavings, formatted: formatCurrency(lineSavings) },
                // Calculated fields
                savingsPct: { value: savingsPct, formatted: `${savingsPct}%` }
              },
              product: {
                title: item.title || packageData?.name || "",
                sku: packageData?.external_id?.toString() || "",
                image: item.image || packageData?.image || ""
              },
              is_upsell: item.is_upsell ?? false,
              is_recurring: hasRecurring,
              interval: packageData?.interval || void 0,
              interval_count: packageData?.interval_count,
              frequency: frequencyText,
              is_bundle: false,
              bundleComponents: void 0,
              // Conditional flags for templates
              hasSavings: lineSavings > 0,
              hasComparePrice: retailUnitPrice > actualUnitPrice,
              showCompare: retailUnitPrice > actualUnitPrice ? "show" : "hide",
              showSavings: lineSavings > 0 ? "show" : "hide",
              showRecurring: hasRecurring ? "show" : "hide"
            };
          });
          set({ enrichedItems });
        } catch (error) {
          console.error("Error calculating enriched items:", error);
        }
      },
      // Coupon methods
      applyCoupon: async (code) => {
        const { useConfigStore } = await Promise.resolve().then(() => configStore$1);
        const configState = useConfigStore.getState();
        const state = get();
        const normalizedCode = code.toUpperCase().trim();
        if ((state.appliedCoupons || []).some((c) => c.code === normalizedCode)) {
          return { success: false, message: "Coupon already applied" };
        }
        const discount = configState.discounts[normalizedCode];
        if (!discount) {
          return { success: false, message: "Invalid coupon code" };
        }
        const validation = get().validateCoupon(normalizedCode);
        if (!validation.valid) {
          return { success: false, message: validation.message || "Coupon cannot be applied" };
        }
        set((state2) => ({
          ...state2,
          appliedCoupons: [...state2.appliedCoupons, {
            code: normalizedCode,
            discount: 0,
            // Will be calculated dynamically in calculateTotals
            definition: discount
          }]
        }));
        get().calculateTotals();
        return { success: true, message: `Coupon ${normalizedCode} applied successfully` };
      },
      removeCoupon: (code) => {
        set((state) => ({
          ...state,
          appliedCoupons: (state.appliedCoupons || []).filter((c) => c.code !== code)
        }));
        get().calculateTotals();
      },
      getCoupons: () => {
        return get().appliedCoupons || [];
      },
      validateCoupon: (code) => {
        const state = get();
        const windowConfig = window.nextConfig;
        if (!windowConfig?.discounts) {
          return { valid: false, message: "No discounts configured" };
        }
        const discount = windowConfig.discounts[code];
        if (!discount) {
          return { valid: false, message: "Invalid coupon code" };
        }
        if (discount.minOrderValue && state.subtotal < discount.minOrderValue) {
          return { valid: false, message: `Minimum order value of $${discount.minOrderValue} required` };
        }
        if (!discount.combinable && (state.appliedCoupons || []).length > 0) {
          return { valid: false, message: "Cannot combine with other coupons" };
        }
        return { valid: true };
      },
      calculateDiscountAmount: (coupon) => {
        const state = get();
        let discountAmount = 0;
        if (coupon.scope === "order") {
          if (coupon.type === "percentage") {
            discountAmount = state.subtotal * (coupon.value / 100);
            if (coupon.maxDiscount) {
              discountAmount = Math.min(discountAmount, coupon.maxDiscount);
            }
          } else {
            discountAmount = coupon.value;
          }
        } else if (coupon.scope === "package" && coupon.packageIds) {
          const eligibleTotal = state.items.filter((item) => coupon.packageIds?.includes(item.packageId)).reduce((sum, item) => sum + item.price * item.quantity, 0);
          if (coupon.type === "percentage") {
            discountAmount = eligibleTotal * (coupon.value / 100);
            if (coupon.maxDiscount) {
              discountAmount = Math.min(discountAmount, coupon.maxDiscount);
            }
          } else {
            discountAmount = Math.min(coupon.value, eligibleTotal);
          }
        }
        return Math.min(discountAmount, state.subtotal);
      },
      reset: () => {
        set(initialState$3);
      }
    })),
    {
      name: CART_STORAGE_KEY,
      storage: {
        getItem: (name) => {
          const value = sessionStorageManager.get(name);
          return value;
        },
        setItem: (name, value) => {
          sessionStorageManager.set(name, value);
        },
        removeItem: (name) => {
          sessionStorageManager.remove(name);
        }
      },
      partialize: (state) => ({
        items: state.items,
        appliedCoupons: state.appliedCoupons,
        subtotal: state.subtotal,
        shipping: state.shipping,
        shippingMethod: state.shippingMethod,
        // Include shipping method to persist selection
        tax: state.tax,
        total: state.total,
        totalQuantity: state.totalQuantity,
        isEmpty: state.isEmpty,
        totals: state.totals,
        enrichedItems: []
        // Include but keep empty - will be recalculated
      })
    }
  )
);
const useCartStore = cartStoreInstance;
const CACHE_EXPIRY_MS = 5 * 60 * 1e3;
const logger$9 = createLogger("CampaignStore");
const initialState$2 = {
  data: null,
  packages: [],
  isLoading: false,
  error: null
};
const campaignStoreInstance = create((set, get) => ({
  ...initialState$2,
  loadCampaign: async (apiKey) => {
    set({ isLoading: true, error: null });
    try {
      const cachedData = sessionStorageManager.get(CAMPAIGN_STORAGE_KEY);
      const now = Date.now();
      if (cachedData && cachedData.apiKey === apiKey && now - cachedData.timestamp < CACHE_EXPIRY_MS) {
        logger$9.info("🎯 Using cached campaign data (expires in " + Math.round((CACHE_EXPIRY_MS - (now - cachedData.timestamp)) / 1e3) + " seconds)");
        const { useConfigStore: useConfigStore2 } = await Promise.resolve().then(() => configStore$1);
        if (cachedData.campaign.payment_env_key) {
          useConfigStore2.getState().setSpreedlyEnvironmentKey(cachedData.campaign.payment_env_key);
        }
        set({
          data: cachedData.campaign,
          packages: cachedData.campaign.packages,
          isLoading: false,
          error: null
        });
        return;
      }
      logger$9.info("🌐 Fetching fresh campaign data from API...");
      const { ApiClient } = await import("./api-Cf7yb9-2.js");
      const client = new ApiClient(apiKey);
      const campaign = await client.getCampaigns();
      if (!campaign) {
        throw new Error("Campaign data not found");
      }
      const { useConfigStore } = await Promise.resolve().then(() => configStore$1);
      if (campaign.payment_env_key) {
        useConfigStore.getState().setSpreedlyEnvironmentKey(campaign.payment_env_key);
        logger$9.info("💳 Spreedly environment key updated from campaign API: " + campaign.payment_env_key);
      }
      const cacheData = {
        campaign,
        timestamp: now,
        apiKey
      };
      sessionStorageManager.set(CAMPAIGN_STORAGE_KEY, cacheData);
      logger$9.info("💾 Campaign data cached for 5 minutes");
      set({
        data: campaign,
        packages: campaign.packages,
        isLoading: false,
        error: null
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to load campaign";
      set({
        data: null,
        packages: [],
        isLoading: false,
        error: errorMessage
      });
      throw error;
    }
  },
  getPackage: (id) => {
    const { packages } = get();
    return packages.find((pkg) => pkg.ref_id === id) ?? null;
  },
  getProduct: (id) => {
    return get().getPackage(id);
  },
  setError: (error) => {
    set({ error });
  },
  reset: () => {
    set(initialState$2);
  },
  clearCache: () => {
    sessionStorageManager.remove(CAMPAIGN_STORAGE_KEY);
    logger$9.info("🗑️ Campaign cache cleared");
  },
  getCacheInfo: () => {
    const cachedData = sessionStorageManager.get(CAMPAIGN_STORAGE_KEY);
    if (!cachedData) {
      return { cached: false };
    }
    const now = Date.now();
    const timeLeft = CACHE_EXPIRY_MS - (now - cachedData.timestamp);
    return {
      cached: true,
      expiresIn: Math.max(0, Math.round(timeLeft / 1e3)),
      // seconds until expiry
      apiKey: cachedData.apiKey
    };
  }
}));
const useCampaignStore = campaignStoreInstance;
const campaignStore = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  useCampaignStore
});
const initialState$1 = {
  step: 1,
  isProcessing: false,
  errors: {},
  formData: {},
  paymentMethod: "credit-card",
  sameAsShipping: true,
  testMode: false,
  vouchers: []
};
const useCheckoutStore = create((set) => ({
  ...initialState$1,
  setStep: (step) => {
    set({ step });
  },
  setProcessing: (isProcessing) => {
    set({ isProcessing });
  },
  setError: (field, error) => {
    set((state) => ({
      errors: { ...state.errors, [field]: error }
    }));
  },
  clearError: (field) => {
    set((state) => {
      const { [field]: _, ...errors } = state.errors;
      return { errors };
    });
  },
  clearAllErrors: () => {
    set({ errors: {} });
  },
  updateFormData: (data) => {
    set((state) => ({
      formData: { ...state.formData, ...data }
    }));
  },
  setPaymentToken: (paymentToken) => {
    set({ paymentToken });
  },
  setPaymentMethod: (paymentMethod) => {
    set({ paymentMethod });
  },
  setShippingMethod: (shippingMethod) => {
    set({ shippingMethod });
  },
  setBillingAddress: (billingAddress) => {
    set({ billingAddress });
  },
  setSameAsShipping: (sameAsShipping) => {
    set({ sameAsShipping });
  },
  setTestMode: (testMode) => {
    set({ testMode });
  },
  addVoucher: (code) => {
    set((state) => ({
      vouchers: [...state.vouchers, code]
    }));
  },
  removeVoucher: (code) => {
    set((state) => ({
      vouchers: state.vouchers.filter((v) => v !== code)
    }));
  },
  reset: () => {
    set(initialState$1);
  }
}));
const checkoutStore = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  useCheckoutStore
});
const initialState = {
  apiKey: "",
  campaignId: "",
  debug: false,
  pageType: "product",
  // spreedlyEnvironmentKey: undefined, - omitted to avoid exactOptionalPropertyTypes issue
  paymentConfig: {},
  googleMapsConfig: {},
  addressConfig: {},
  // Additional configuration with enterprise defaults
  autoInit: true,
  rateLimit: 4,
  cacheTtl: 300,
  retryAttempts: 3,
  timeout: 1e4,
  testMode: false,
  // API and performance settings
  maxRetries: 3,
  requestTimeout: 3e4,
  enableAnalytics: true,
  enableDebugMode: false,
  // Environment and deployment settings
  environment: "production",
  // version: undefined, - omitted
  // buildTimestamp: undefined, - omitted
  // Discount system
  discounts: {},
  // Attribution
  // utmTransfer: undefined, - omitted
  // Tracking configuration
  tracking: "auto"
  // 'auto', 'manual', 'disabled'
  // Error monitoring removed - add externally via HTML/scripts
};
const configStore = create((set, _get) => ({
  ...initialState,
  loadFromMeta: () => {
    if (typeof document === "undefined") return;
    const updates = {};
    const apiKeyMeta = document.querySelector('meta[name="next-api-key"]');
    if (apiKeyMeta) {
      updates.apiKey = apiKeyMeta.getAttribute("content") ?? "";
    }
    const campaignIdMeta = document.querySelector('meta[name="next-campaign-id"]');
    if (campaignIdMeta) {
      updates.campaignId = campaignIdMeta.getAttribute("content") ?? "";
    }
    const debugMeta = document.querySelector('meta[name="next-debug"]');
    if (debugMeta) {
      updates.debug = debugMeta.getAttribute("content") === "true";
    }
    const pageTypeMeta = document.querySelector('meta[name="next-page-type"]');
    if (pageTypeMeta) {
      updates.pageType = pageTypeMeta.getAttribute("content");
    }
    const spreedlyKeyMeta = document.querySelector('meta[name="next-spreedly-key"]') || document.querySelector('meta[name="next-payment-env-key"]');
    if (spreedlyKeyMeta) {
      const spreedlyKey = spreedlyKeyMeta.getAttribute("content");
      if (spreedlyKey) {
        updates.spreedlyEnvironmentKey = spreedlyKey;
      }
    }
    if (Object.keys(updates).length > 0) {
      set(updates);
    }
  },
  loadFromWindow: () => {
    if (typeof window === "undefined") return;
    const windowConfig = window.nextConfig;
    if (!windowConfig || typeof windowConfig !== "object") return;
    const updates = {};
    if (typeof windowConfig.apiKey === "string") {
      updates.apiKey = windowConfig.apiKey;
    }
    if (typeof windowConfig.campaignId === "string") {
      updates.campaignId = windowConfig.campaignId;
    }
    if (typeof windowConfig.debug === "boolean") {
      updates.debug = windowConfig.debug;
    }
    if (typeof windowConfig.storeName === "string") {
      updates.storeName = windowConfig.storeName;
    }
    if (typeof windowConfig.pageType === "string") {
      updates.pageType = windowConfig.pageType;
    }
    if (typeof windowConfig.spreedlyEnvironmentKey === "string") {
      updates.spreedlyEnvironmentKey = windowConfig.spreedlyEnvironmentKey;
    }
    if (windowConfig.payment && typeof windowConfig.payment === "object") {
      updates.paymentConfig = windowConfig.payment;
    }
    if (windowConfig.paymentConfig && typeof windowConfig.paymentConfig === "object") {
      updates.paymentConfig = windowConfig.paymentConfig;
    }
    if (windowConfig.googleMaps && typeof windowConfig.googleMaps === "object") {
      updates.googleMapsConfig = windowConfig.googleMaps;
    }
    if (windowConfig.addressConfig && typeof windowConfig.addressConfig === "object") {
      updates.addressConfig = windowConfig.addressConfig;
    }
    if (windowConfig.discounts && typeof windowConfig.discounts === "object") {
      updates.discounts = windowConfig.discounts;
    }
    if (typeof windowConfig.tracking === "string") {
      updates.tracking = windowConfig.tracking;
    }
    if (windowConfig.analytics && typeof windowConfig.analytics === "object") {
      updates.analytics = windowConfig.analytics;
    }
    if (windowConfig.utmTransfer && typeof windowConfig.utmTransfer === "object") {
      updates.utmTransfer = windowConfig.utmTransfer;
    }
    if (Object.keys(updates).length > 0) {
      set(updates);
    }
  },
  updateConfig: (config) => {
    set((state) => ({ ...state, ...config }));
  },
  setSpreedlyEnvironmentKey: (key) => {
    set({ spreedlyEnvironmentKey: key });
  },
  reset: () => {
    set(initialState);
  }
}));
const configStore$1 = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  configStore,
  useConfigStore: configStore
});
class TestModeManager {
  constructor() {
    this.isTestMode = false;
    this.konamiSequence = [
      "ArrowUp",
      "ArrowUp",
      "ArrowDown",
      "ArrowDown",
      "ArrowLeft",
      "ArrowRight",
      "ArrowLeft",
      "ArrowRight",
      "KeyB",
      "KeyA"
    ];
    this.keySequence = [];
    this.testCards = [
      {
        number: "4111111111111111",
        name: "Visa Test Card",
        cvv: "123",
        expiry: "12/25",
        type: "visa"
      },
      {
        number: "5555555555554444",
        name: "Mastercard Test Card",
        cvv: "123",
        expiry: "12/25",
        type: "mastercard"
      },
      {
        number: "378282246310005",
        name: "American Express Test Card",
        cvv: "1234",
        expiry: "12/25",
        type: "amex"
      },
      {
        number: "6011111111111117",
        name: "Discover Test Card",
        cvv: "123",
        expiry: "12/25",
        type: "discover"
      }
    ];
    this.initializeKonamiCode();
    this.checkUrlTestMode();
  }
  static getInstance() {
    if (!TestModeManager.instance) {
      TestModeManager.instance = new TestModeManager();
    }
    return TestModeManager.instance;
  }
  initializeKonamiCode() {
    document.addEventListener("keydown", this.handleKeyDown.bind(this));
  }
  handleKeyDown(event) {
    this.keySequence.push(event.code);
    if (this.keySequence.length > this.konamiSequence.length) {
      this.keySequence.shift();
    }
    if (this.keySequence.length === this.konamiSequence.length) {
      const isMatch = this.keySequence.every(
        (key, index2) => key === this.konamiSequence[index2]
      );
      if (isMatch) {
        this.activateKonamiCode();
        this.keySequence = [];
      }
    }
  }
  checkUrlTestMode() {
    const params = new URLSearchParams(window.location.search);
    const debugMode = params.get("debugger") === "true";
    const testMode = params.get("test") === "true";
    if (debugMode || testMode) {
      this.isTestMode = true;
    }
  }
  activateKonamiCode() {
    console.log("🎮 Konami Code activated!");
    this.isTestMode = true;
    this.showKonamiMessage();
    const url = new URL(window.location.href);
    url.searchParams.set("test", "true");
    window.history.replaceState({}, "", url.toString());
    if (this.konamiCallback) {
      setTimeout(() => {
        this.konamiCallback?.();
      }, 2e3);
    }
    document.dispatchEvent(new CustomEvent("next:test-mode-activated", {
      detail: { method: "konami" }
    }));
  }
  showKonamiMessage() {
    const message = document.createElement("div");
    message.className = "konami-activation-message";
    message.innerHTML = `
      <div class="konami-content">
        <h3>🎮 Konami Code Activated!</h3>
        <p>Test mode enabled. You can now use test payment methods.</p>
        <div class="konami-progress">
          <div class="konami-progress-bar"></div>
        </div>
      </div>
    `;
    message.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 2rem;
      border-radius: 12px;
      box-shadow: 0 20px 40px rgba(0,0,0,0.3);
      z-index: 10000;
      font-family: Arial, sans-serif;
      text-align: center;
      min-width: 300px;
    `;
    const progressBar = message.querySelector(".konami-progress-bar");
    if (progressBar) {
      progressBar.style.cssText = `
        width: 100%;
        height: 4px;
        background: rgba(255,255,255,0.3);
        border-radius: 2px;
        overflow: hidden;
        margin-top: 1rem;
      `;
      progressBar.innerHTML = '<div style="width: 0; height: 100%; background: white; transition: width 2s ease-in-out;"></div>';
    }
    document.body.appendChild(message);
    setTimeout(() => {
      const bar = progressBar?.querySelector("div");
      if (bar) {
        bar.style.width = "100%";
      }
    }, 100);
    setTimeout(() => {
      if (message.parentNode) {
        message.parentNode.removeChild(message);
      }
    }, 2500);
  }
  setTestMode(enabled) {
    this.isTestMode = enabled;
    if (enabled) {
      const url = new URL(window.location.href);
      url.searchParams.set("test", "true");
      window.history.replaceState({}, "", url.toString());
    }
  }
  isActive() {
    return this.isTestMode;
  }
  onKonamiCode(callback) {
    this.konamiCallback = callback;
  }
  getTestCards() {
    return [...this.testCards];
  }
  getTestCard(type) {
    if (type) {
      const card = this.testCards.find((c) => c.type === type);
      if (card) return card;
    }
    const defaultCard = this.testCards[0];
    if (!defaultCard) {
      throw new Error("No test cards available");
    }
    return defaultCard;
  }
  fillTestCardData(cardType = "visa") {
    if (!this.isTestMode) return;
    const testCard = this.getTestCard(cardType);
    const numberField = document.querySelector('input[data-spreedly="number"], input[name*="card_number"], input[name*="cardNumber"]');
    if (numberField) {
      numberField.value = testCard.number;
      numberField.dispatchEvent(new Event("input", { bubbles: true }));
    }
    const cvvField = document.querySelector('input[data-spreedly="cvv"], input[name*="cvv"], input[name*="security"]');
    if (cvvField) {
      cvvField.value = testCard.cvv;
      cvvField.dispatchEvent(new Event("input", { bubbles: true }));
    }
    const expiryField = document.querySelector('input[name*="expiry"], input[name*="exp"]');
    if (expiryField) {
      expiryField.value = testCard.expiry;
      expiryField.dispatchEvent(new Event("input", { bubbles: true }));
    } else {
      const monthField = document.querySelector('select[name*="month"], input[name*="month"]');
      const yearField = document.querySelector('select[name*="year"], input[name*="year"]');
      if (monthField && yearField) {
        const [month, year] = testCard.expiry.split("/");
        if (month && year) {
          monthField.value = month;
          yearField.value = `20${year}`;
          monthField.dispatchEvent(new Event("change", { bubbles: true }));
          yearField.dispatchEvent(new Event("change", { bubbles: true }));
        }
      }
    }
    const nameField = document.querySelector('input[name*="cardholder"], input[name*="card_name"]');
    if (nameField) {
      nameField.value = "Test Cardholder";
      nameField.dispatchEvent(new Event("input", { bubbles: true }));
    }
    console.log(`Filled test card data: ${testCard.name}`);
  }
  showTestCardMenu() {
    if (!this.isTestMode) return;
    const menu = document.createElement("div");
    menu.className = "test-card-menu";
    menu.innerHTML = `
      <div class="test-card-content">
        <h4>Test Card Numbers</h4>
        <div class="test-card-options">
          ${this.testCards.map((card) => `
            <button class="test-card-option" data-card-type="${card.type}">
              <div class="card-name">${card.name}</div>
              <div class="card-number">${card.number}</div>
            </button>
          `).join("")}
        </div>
        <button class="test-card-close">Close</button>
      </div>
    `;
    menu.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: white;
      border: 1px solid #ddd;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 10000;
      font-family: Arial, sans-serif;
      min-width: 250px;
    `;
    menu.addEventListener("click", (e) => {
      const target = e.target;
      if (target.classList.contains("test-card-option") || target.closest(".test-card-option")) {
        const button = target.closest(".test-card-option");
        const cardType = button.getAttribute("data-card-type");
        if (cardType) {
          this.fillTestCardData(cardType);
          menu.remove();
        }
      } else if (target.classList.contains("test-card-close")) {
        menu.remove();
      }
    });
    document.body.appendChild(menu);
    setTimeout(() => {
      if (menu.parentNode) {
        menu.remove();
      }
    }, 3e4);
  }
}
const testModeManager = TestModeManager.getInstance();
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
const logger$8 = createLogger("PendingEventsHandler");
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
      logger$8.info(`Event queued for after redirect: ${event.event} (${pending.length} total queued)`);
    } catch (error) {
      logger$8.error("Failed to queue event:", error);
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
      logger$8.error("Failed to get pending events:", error);
      return [];
    }
  }
  /**
   * Process and fire all pending events
   */
  processPendingEvents() {
    const events = this.getPendingEvents();
    if (events.length === 0) {
      logger$8.debug("No pending analytics events to process");
      return;
    }
    logger$8.info(`Processing ${events.length} pending analytics events`);
    const processedIds = [];
    for (const pendingEvent of events) {
      try {
        if (Date.now() - pendingEvent.timestamp > 5 * 60 * 1e3) {
          logger$8.warn("Skipping stale event:", pendingEvent.event.event);
          processedIds.push(pendingEvent.id);
          continue;
        }
        dataLayer.push(pendingEvent.event);
        processedIds.push(pendingEvent.id);
        logger$8.debug("Processed pending event:", pendingEvent.event.event);
      } catch (error) {
        logger$8.error("Failed to process pending event:", pendingEvent.event.event, error);
      }
    }
    if (processedIds.length > 0) {
      const remaining = events.filter((e) => !processedIds.includes(e.id));
      if (remaining.length === 0) {
        sessionStorage.removeItem(STORAGE_KEY$1);
      } else {
        sessionStorage.setItem(STORAGE_KEY$1, JSON.stringify(remaining));
      }
      logger$8.debug("Removed processed events:", processedIds.length);
    }
  }
  /**
   * Clear all pending events
   */
  clearPendingEvents() {
    try {
      sessionStorage.removeItem(STORAGE_KEY$1);
      logger$8.debug("Cleared all pending events");
    } catch (error) {
      logger$8.error("Failed to clear pending events:", error);
    }
  }
  /**
   * Reset the handler (called by NextAnalytics)
   */
  reset() {
    this.clearPendingEvents();
    logger$8.debug("PendingEventsHandler reset");
  }
  /**
   * Initialize the handler (called by NextAnalytics)
   */
  initialize() {
    logger$8.debug("PendingEventsHandler initialized");
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
    return items.map((item, index2) => ({
      item_id: item.item_id || item.id || item.product_id || item.sku,
      item_name: item.item_name || item.name || item.title,
      affiliation: item.affiliation || "Online Store",
      coupon: item.coupon || void 0,
      discount: item.discount || 0,
      index: item.index || index2,
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
    if (config?.storeName) {
      this.storeName = config.storeName;
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
        if (fbEventName === "Purchase" && this.storeName) {
          const orderIdentifier = parameters.order_number || parameters.order_id;
          if (orderIdentifier) {
            const eventId = `${this.storeName}-${orderIdentifier}`;
            const paramsWithEventId = { ...parameters, event_id: eventId };
            window.fbq("track", fbEventName, paramsWithEventId);
            this.debug(`Event sent to Facebook: ${fbEventName} with event_id: ${eventId}`, paramsWithEventId);
          } else {
            window.fbq("track", fbEventName, parameters);
            this.debug(`Event sent to Facebook: ${fbEventName} (no order identifier for event_id)`, parameters);
          }
        } else {
          window.fbq("track", fbEventName, parameters);
          this.debug(`Event sent to Facebook: ${fbEventName}`, parameters);
        }
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
      order_id: data.transaction_id || data.order_id,
      order_number: data.order_number
      // Include order_number for event_id
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
const logger$7 = createLogger("RudderStack");
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
    logger$7.info(`Processing event "${event.event}"`, {
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
      const configStore$12 = configStore.getState();
      this.apiKey = configStore$12.apiKey || "";
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
const logger$6 = createLogger("ListAttributionTracker");
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
    logger$6.debug("ListAttributionTracker initialized");
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
    logger$6.debug("Set current list:", { listId, listName });
  }
  /**
   * Get the current list context if still valid
   */
  getCurrentList() {
    if (!this.currentList) {
      return null;
    }
    if (Date.now() - this.currentList.timestamp > LIST_EXPIRY_MS) {
      logger$6.debug("List context expired");
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
    logger$6.debug("Cleared current list");
  }
  /**
   * Reset the tracker (called by NextAnalytics)
   */
  reset() {
    this.clearCurrentList();
    logger$6.debug("ListAttributionTracker reset");
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
        logger$6.debug("Detected list from URL:", { listId, listName, type: pattern.type });
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
          logger$6.debug("Loaded list context from storage:", context);
        } else {
          this.removeFromStorage();
        }
      }
    } catch (error) {
      logger$6.error("Error loading list context from storage:", error);
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
      logger$6.error("Error saving list context to storage:", error);
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
      logger$6.error("Error removing list context from storage:", error);
    }
  }
}
const listAttributionTracker = ListAttributionTracker.getInstance();
const logger$5 = createLogger("ViewItemListTracker");
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
    logger$5.info("ViewItemListTracker initialized");
  }
  /**
   * Scan the page for products and fire appropriate events
   */
  scan() {
    const now = Date.now();
    if (now - this.lastScanTime < this.scanDebounceMs) {
      logger$5.debug("Scan debounced (too soon after last scan)");
      return;
    }
    this.lastScanTime = now;
    const products = this.findProductElements();
    if (products.length === 0) {
      logger$5.debug("No products found on page");
      return;
    }
    logger$5.debug(`Found ${products.length} products on page`);
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
    logger$5.debug("Manual rescan triggered");
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
    elements.forEach((element, index2) => {
      const packageId = element.getAttribute("data-next-package-id");
      if (packageId && !seen.has(packageId)) {
        seen.add(packageId);
        products.push({
          packageId,
          element,
          index: index2
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
      logger$5.debug("Product already tracked:", product.packageId);
      return;
    }
    const campaignStore2 = useCampaignStore.getState();
    if (!campaignStore2.data || !campaignStore2.packages || campaignStore2.packages.length === 0) {
      logger$5.debug("Campaign data not yet loaded, deferring tracking");
      setTimeout(() => this.scan(), 1e3);
      return;
    }
    const packageIdNum = parseInt(product.packageId, 10);
    const packageData = !isNaN(packageIdNum) ? campaignStore2.getPackage(packageIdNum) : null;
    if (!packageData) {
      logger$5.warn("Package not found in store:", product.packageId);
      return;
    }
    const listContext = listAttributionTracker.getCurrentList();
    const item = {
      item_id: packageData.external_id.toString(),
      // Use external_id for analytics
      item_name: packageData.name || `Package ${product.packageId}`,
      currency: campaignStore2.data?.currency || "USD",
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
    logger$5.debug("Tracked view_item:", product.packageId);
  }
  /**
   * Track multiple products view
   */
  trackViewItemList(products) {
    const campaignStore2 = useCampaignStore.getState();
    const items = [];
    let totalValue = 0;
    if (!campaignStore2.data || !campaignStore2.packages || campaignStore2.packages.length === 0) {
      logger$5.debug("Campaign data not yet loaded, deferring tracking");
      setTimeout(() => this.scan(), 1e3);
      return;
    }
    const listContext = listAttributionTracker.getCurrentList() || listAttributionTracker.detectListFromUrl() || { listId: "product_list", listName: "Product List" };
    products.forEach((product, index2) => {
      if (this.trackedProducts.has(product.packageId)) {
        return;
      }
      const packageIdNum = parseInt(product.packageId, 10);
      const packageData = !isNaN(packageIdNum) ? campaignStore2.getPackage(packageIdNum) : null;
      if (!packageData) {
        logger$5.warn("Package not found in store:", product.packageId);
        return;
      }
      const price = parseFloat(packageData.price_total || "0");
      totalValue += price;
      items.push({
        item_id: packageData.external_id.toString(),
        // Use external_id for analytics
        item_name: packageData.name || `Package ${product.packageId}`,
        currency: campaignStore2.data?.currency || "USD",
        price,
        quantity: 1,
        // Always 1 for package-based pricing
        item_category: "uncategorized",
        item_variant: void 0,
        item_list_id: listContext.listId,
        item_list_name: listContext.listName,
        index: index2
      });
      this.trackedProducts.add(product.packageId);
    });
    if (items.length === 0) {
      logger$5.debug("No new products to track");
      return;
    }
    const event = dataLayer.formatEcommerceEvent("dl_view_item_list", {
      currency: campaignStore2.data?.currency || "USD",
      value: totalValue,
      items,
      item_list_id: listContext.listId,
      item_list_name: listContext.listName
    });
    dataLayer.push(event);
    logger$5.debug(`Tracked view_item_list with ${items.length} items`);
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
        logger$5.debug("Detected DOM changes with products");
        this.scan();
      }
    });
    this.observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["data-next-package-id"]
    });
    logger$5.debug("Mutation observer set up");
  }
  /**
   * Reset the tracker (for route changes)
   */
  reset() {
    this.trackedProducts.clear();
    logger$5.debug("ViewItemListTracker reset");
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
    logger$5.debug("ViewItemListTracker destroyed");
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
const logger$4 = createLogger("UserDataTracker");
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
    logger$4.info("UserDataTracker initialized");
  }
  /**
   * Track user data event
   */
  trackUserData() {
    const now = Date.now();
    if (now - this.lastTrackTime < this.trackDebounceMs) {
      logger$4.debug("User data tracking debounced");
      return;
    }
    this.lastTrackTime = now;
    const userData = this.collectUserData();
    if (!userData || Object.keys(userData).length === 0) {
      logger$4.debug("No user data to track");
      return;
    }
    const event = dataLayer.formatUserDataEvent(userData);
    dataLayer.push(event);
    logger$4.debug("Tracked user data:", {
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
      logger$4.debug("Error accessing user data from storage:", error);
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
      logger$4.debug("Cart store not available or error accessing:", error);
    }
    try {
      const checkoutData = this.getCheckoutData();
      if (checkoutData) {
        Object.assign(userData, checkoutData);
      }
    } catch (error) {
      logger$4.debug("Error getting checkout data:", error);
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
      logger$4.debug("Route changed, tracking user data");
      this.trackUserData();
    });
    this.eventBus.on("sdk:route-invalidated", () => {
      logger$4.debug("SDK route invalidated, tracking user data");
      this.trackUserData();
    });
    this.eventBus.on("user:logged-in", () => {
      logger$4.debug("User logged in, tracking user data");
      setTimeout(() => this.trackUserData(), 100);
    });
    this.eventBus.on("user:logged-out", () => {
      logger$4.debug("User logged out, tracking user data");
      setTimeout(() => this.trackUserData(), 100);
    });
    this.eventBus.on("cart:updated", () => {
      logger$4.debug("Cart updated, tracking user data");
      this.trackUserData();
    });
    const unsubscribeCart = useCartStore.subscribe(() => {
      logger$4.debug("Cart store changed, tracking user data");
      this.trackUserData();
    });
    this.unsubscribers.push(unsubscribeCart);
    if (typeof window !== "undefined") {
      window.addEventListener("popstate", () => {
        logger$4.debug("Browser navigation, tracking user data");
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
    logger$4.debug("User data tracking listeners set up");
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
    logger$4.debug("UserDataTracker reset");
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
    logger$4.debug("UserDataTracker destroyed");
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
const logger$3 = createLogger("AutoEventListener");
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
    logger$3.info("AutoEventListener initialized");
  }
  /**
   * Check if event should be processed based on debounce
   */
  shouldProcessEvent(eventName) {
    const now = Date.now();
    const lastTime = this.lastEventTimes.get(eventName) || 0;
    const debounceTime = this.debounceConfig[eventName] || 0;
    if (now - lastTime < debounceTime) {
      logger$3.debug(`Event ${eventName} debounced`);
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
      const campaignStore2 = useCampaignStore.getState();
      const packageData = campaignStore2.getPackage(packageId);
      if (!packageData) {
        logger$3.warn("Package not found for add to cart:", packageId);
        return;
      }
      const listContext = listAttributionTracker.getCurrentList();
      const item = {
        item_id: packageData.external_id.toString(),
        // Use external_id for analytics
        item_name: packageData.name || `Package ${packageId}`,
        currency: campaignStore2.data?.currency || "USD",
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
      logger$3.debug("Tracked add to cart:", packageId);
    };
    this.eventBus.on("cart:item-added", handleAddToCart);
    this.eventHandlers.set("cart:item-added", handleAddToCart);
    const handleRemoveFromCart = async (data) => {
      if (!this.shouldProcessEvent("cart:item-removed")) {
        return;
      }
      const packageId = data.packageId;
      const quantity = data.quantity || 1;
      const campaignStore2 = useCampaignStore.getState();
      const packageData = campaignStore2.getPackage(packageId);
      if (!packageData) {
        logger$3.warn("Package not found for remove from cart:", packageId);
        return;
      }
      const item = {
        item_id: packageData.external_id.toString(),
        // Use external_id for analytics
        item_name: packageData.name || `Package ${packageId}`,
        currency: campaignStore2.data?.currency || "USD",
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
      logger$3.debug("Tracked remove from cart:", packageId);
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
        logger$3.info("Tracked upsell page view:", pagePath);
        return;
      }
      const packageId = data.packageId;
      const campaignStore2 = useCampaignStore.getState();
      const packageData = campaignStore2.getPackage(packageId);
      if (!packageData) {
        logger$3.warn("Package not found for upsell view:", packageId);
        return;
      }
      dataLayer.push({
        event: "dl_viewed_upsell",
        order_id: orderId,
        upsell: {
          package_id: packageId.toString(),
          package_name: packageData.name || `Package ${packageId}`,
          price: parseFloat(packageData.price || "0"),
          currency: campaignStore2.data?.currency || "USD"
        }
      });
      logger$3.info("Tracked upsell view:", packageId);
    };
    this.eventBus.on("upsell:viewed", handleUpsellViewed);
    this.eventHandlers.set("upsell:viewed", handleUpsellViewed);
    const handleUpsellAccepted = async (data) => {
      const packageId = data.packageId;
      const quantity = data.quantity || 1;
      const orderId = data.orderId || data.order?.ref_id;
      let value = data.value;
      if (value === void 0) {
        const campaignStore2 = useCampaignStore.getState();
        const packageData = campaignStore2.getPackage(packageId);
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
      logger$3.debug("Upsell accepted event data:", { willRedirect: data.willRedirect, data });
      if (data.willRedirect) {
        acceptedUpsellEvent._willRedirect = true;
        logger$3.debug("Marked upsell event for queueing due to redirect");
      }
      dataLayer.push(acceptedUpsellEvent);
      logger$3.info("Tracked upsell accepted:", packageId);
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
      logger$3.info("Tracked upsell skipped:", data.packageId);
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
      const campaignStore2 = useCampaignStore.getState();
      const items = cartStore.items.map((item, index2) => {
        const packageData = campaignStore2.getPackage(item.packageId);
        return {
          item_id: packageData?.external_id?.toString() || item.packageId.toString(),
          // Use external_id for analytics
          item_name: packageData?.name || `Package ${item.packageId}`,
          currency: campaignStore2.data?.currency || "USD",
          price: parseFloat(packageData?.price_total || "0"),
          // Use total package price
          quantity: item.quantity,
          // This is the number of packages in cart
          item_category: campaignStore2.data?.name || "uncategorized",
          item_variant: void 0,
          index: index2
        };
      });
      const event = dataLayer.formatEcommerceEvent("dl_begin_checkout", {
        currency: campaignStore2.data?.currency || "USD",
        value: cartStore.total || cartStore.subtotal || 0,
        items,
        coupon: data.coupon
      });
      dataLayer.push(event);
      logger$3.info("Tracked checkout started");
    };
    this.eventBus.on("checkout:started", handleCheckoutStarted);
    this.eventHandlers.set("checkout:started", handleCheckoutStarted);
    const handleExpressCheckoutStarted = async (data) => {
      const cartStore = useCartStore.getState();
      const campaignStore2 = useCampaignStore.getState();
      const items = cartStore.items.map((item, index2) => {
        const packageData = campaignStore2.getPackage(item.packageId);
        return {
          item_id: packageData?.external_id?.toString() || item.packageId.toString(),
          item_name: packageData?.name || `Package ${item.packageId}`,
          currency: campaignStore2.data?.currency || "USD",
          price: parseFloat(packageData?.price_total || "0"),
          quantity: item.quantity,
          item_category: campaignStore2.data?.name || "uncategorized",
          item_variant: void 0,
          index: index2
        };
      });
      const event = dataLayer.formatEcommerceEvent("dl_begin_checkout", {
        currency: campaignStore2.data?.currency || "USD",
        value: cartStore.total || cartStore.subtotal || 0,
        items,
        coupon: cartStore.appliedCoupons?.[0]?.code,
        payment_type: data.method || "express"
      });
      dataLayer.push(event);
      logger$3.info("Tracked express checkout started", { method: data.method });
    };
    this.eventBus.on("express-checkout:started", handleExpressCheckoutStarted);
    this.eventHandlers.set("express-checkout:started", handleExpressCheckoutStarted);
    const handleOrderCompleted = async (order) => {
      const orderId = order.ref_id || order.number || order.order_id || order.transaction_id;
      const total = parseFloat(order.total_incl_tax || order.total || "0");
      let items = [];
      if (order.lines && Array.isArray(order.lines)) {
        const campaignStore2 = useCampaignStore.getState();
        items = order.lines.map((line, index2) => ({
          item_id: line.product_sku || line.id?.toString() || `line_${index2}`,
          item_name: line.product_title || line.product_description || `Item ${line.id}`,
          currency: order.currency || "USD",
          price: parseFloat(line.price_incl_tax || line.price || "0"),
          quantity: parseInt(line.quantity?.toString() || "1"),
          item_category: campaignStore2.data?.name || "uncategorized",
          item_variant: line.variant_title,
          discount: parseFloat(line.price_incl_tax_excl_discounts || "0") - parseFloat(line.price_incl_tax || "0"),
          index: index2
        }));
      } else {
        const cartStore = useCartStore.getState();
        const campaignStore2 = useCampaignStore.getState();
        items = cartStore.items.map((item, index2) => {
          const packageData = campaignStore2.getPackage(item.packageId);
          return {
            item_id: packageData?.external_id?.toString() || item.packageId.toString(),
            // Use external_id for analytics
            item_name: packageData?.name || `Package ${item.packageId}`,
            currency: campaignStore2.data?.currency || "USD",
            price: parseFloat(packageData?.price_total || "0"),
            // Use total package price
            quantity: item.quantity,
            // This is the number of packages in cart
            item_category: campaignStore2.data?.name || "uncategorized",
            index: index2
          };
        });
      }
      const purchaseData = {
        transaction_id: orderId,
        order_number: order.number,
        // Add the actual order number
        currency: order.currency || "USD",
        value: total || 0,
        items,
        coupon: order.discounts?.[0]?.code || order.coupon_code || order.coupon,
        shipping: parseFloat(order.shipping_incl_tax || order.shipping || "0"),
        tax: parseFloat(order.total_tax || order.tax || "0")
      };
      const event = dataLayer.formatEcommerceEvent("dl_purchase", purchaseData);
      event._willRedirect = true;
      logger$3.debug("Marked purchase event for queueing with _willRedirect = true");
      dataLayer.push(event);
      logger$3.info("Tracked purchase:", orderId);
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
      const campaignStore2 = useCampaignStore.getState();
      return {
        total_value: cartStore.total || cartStore.subtotal || 0,
        total_items: cartStore.totalQuantity || 0,
        currency: campaignStore2.data?.currency || "USD",
        items: cartStore.items.map((item) => ({
          package_id: item.packageId,
          quantity: item.quantity,
          price: campaignStore2.getPackage(item.packageId)?.price || 0
        }))
      };
    } catch (error) {
      logger$3.error("Error getting cart data:", error);
      return null;
    }
  }
  /**
   * Reset the auto event listener (called by NextAnalytics)
   */
  reset() {
    this.lastEventTimes.clear();
    logger$3.debug("AutoEventListener reset");
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
    logger$3.debug("AutoEventListener destroyed");
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
    logger$3.debug("Updated debounce config:", this.debounceConfig);
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
      value.forEach((item, index2) => {
        validateField(item, fieldDef.items, `${path}[${index2}]`);
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
        eventData.ecommerce.items.forEach((item, index2) => {
          this.validateProduct(item, `ecommerce.items[${index2}]`, result);
        });
      }
      if (eventData.ecommerce.impressions && Array.isArray(eventData.ecommerce.impressions)) {
        eventData.ecommerce.impressions.forEach((impression, index2) => {
          this.validateProduct(impression, `ecommerce.impressions[${index2}]`, result);
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
        const checkoutStore2 = window.checkoutStore;
        if (checkoutStore2) {
          const checkoutState = checkoutStore2.getState();
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
        const campaignStore2 = window.campaignStore;
        if (campaignStore2) {
          const campaign = campaignStore2.getState().data;
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
  static formatEcommerceItem(item, index2, list) {
    const currency = this.getCurrency();
    let campaignName = "Campaign";
    try {
      if (typeof window !== "undefined") {
        const campaignStore2 = window.campaignStore;
        if (campaignStore2) {
          const campaign = campaignStore2.getState().data;
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
    if (index2 !== void 0) {
      ecommerceItem.index = index2;
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
      (item, index2) => EventBuilder.formatEcommerceItem(item, index2, listId !== void 0 || listName !== void 0 ? {
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
      (item, index2) => EventBuilder.formatEcommerceItem(item, index2)
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
      formattedItems = order.lines.map((line, index2) => ({
        item_id: String(line.package || line.product_id || line.id),
        item_name: line.product_title || line.name || "Unknown Product",
        item_category: line.campaign_name || "Campaign",
        item_variant: line.package_profile || line.variant,
        price: parseFloat(line.price_incl_tax || line.price || 0),
        quantity: line.quantity || 1,
        currency: order.currency || currency,
        index: index2
      }));
    } else if (orderData.items || cartState.enrichedItems.length > 0) {
      formattedItems = (orderData.items || cartState.enrichedItems).map(
        (item, index2) => EventBuilder.formatEcommerceItem(item, index2)
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
      (item, index2) => EventBuilder.formatEcommerceItem(item, index2, { id: "cart", name: "Shopping Cart" })
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
const logger$2 = createLogger("NextAnalytics");
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
      this.checkAndSetIgnoreFlag();
    }
  }
  static getInstance() {
    if (!NextAnalytics.instance) {
      NextAnalytics.instance = new NextAnalytics();
    }
    return NextAnalytics.instance;
  }
  /**
   * Check URL for ignore parameter and set session storage flag
   */
  checkAndSetIgnoreFlag() {
    if (typeof window === "undefined") return;
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const ignoreParam = urlParams.get("ignore");
      if (ignoreParam === "true") {
        sessionStorage.setItem("analytics_ignore", "true");
        logger$2.info("Analytics ignore flag set from URL parameter");
      }
    } catch (error) {
      logger$2.error("Error checking ignore parameter:", error);
    }
  }
  /**
   * Check if analytics should be ignored
   */
  shouldIgnoreAnalytics() {
    if (typeof window === "undefined") return false;
    try {
      const sessionIgnore = sessionStorage.getItem("analytics_ignore");
      if (sessionIgnore === "true") {
        return true;
      }
      const urlParams = new URLSearchParams(window.location.search);
      const ignoreParam = urlParams.get("ignore");
      return ignoreParam === "true";
    } catch (error) {
      logger$2.error("Error checking ignore status:", error);
      return false;
    }
  }
  /**
   * Initialize the analytics system
   */
  async initialize() {
    if (this.initialized) {
      logger$2.debug("Analytics already initialized");
      return;
    }
    if (this.shouldIgnoreAnalytics()) {
      logger$2.info("Analytics ignored due to ignore parameter");
      return;
    }
    try {
      const config = configStore.getState();
      if (!config.analytics?.enabled) {
        logger$2.info("Analytics disabled in configuration");
        return;
      }
      dataLayer.initialize();
      if (config.analytics.debug) {
        dataLayer.setDebugMode(true);
      }
      await this.initializeProviders(config.analytics, config.storeName);
      PendingEventsHandler.getInstance().processPendingEvents();
      if (config.analytics.mode === "auto") {
        this.initializeAutoTracking();
      }
      this.initialized = true;
      logger$2.info("NextAnalytics initialized successfully", {
        providers: Array.from(this.providers.keys()),
        mode: config.analytics.mode
      });
      this.track(UserEvents.createUserDataEvent("dl_user_data"));
    } catch (error) {
      logger$2.error("Failed to initialize analytics:", error);
      throw error;
    }
  }
  /**
   * Initialize analytics providers
   */
  async initializeProviders(config, storeName) {
    if (config.providers?.nextCampaign?.enabled) {
      const nextCampaignAdapter = new NextCampaignAdapter();
      await nextCampaignAdapter.initialize();
      this.providers.set("nextCampaign", nextCampaignAdapter);
      dataLayer.addProvider(nextCampaignAdapter);
      logger$2.info("NextCampaign adapter initialized");
    }
    if (config.providers?.gtm?.enabled) {
      const gtmAdapter = new GTMAdapter();
      this.providers.set("gtm", gtmAdapter);
      dataLayer.addProvider(gtmAdapter);
      logger$2.info("GTM adapter initialized");
    }
    if (config.providers?.facebook?.enabled && config.providers.facebook.settings?.pixelId) {
      const fbConfig = {
        ...config.providers.facebook,
        storeName
        // Pass storeName from root config
      };
      const fbAdapter = new FacebookAdapter(fbConfig);
      this.providers.set("facebook", fbAdapter);
      dataLayer.addProvider(fbAdapter);
      logger$2.info("Facebook Pixel adapter initialized", {
        blockedEvents: config.providers.facebook.blockedEvents || [],
        storeName
      });
    }
    if (config.providers?.rudderstack?.enabled) {
      const rudderAdapter = new RudderStackAdapter();
      this.providers.set("rudderstack", rudderAdapter);
      dataLayer.addProvider(rudderAdapter);
      logger$2.info("RudderStack adapter initialized");
    }
    if (config.providers?.custom?.enabled && config.providers.custom.settings?.endpoint) {
      const customAdapter = new CustomAdapter(config.providers.custom.settings);
      this.providers.set("custom", customAdapter);
      dataLayer.addProvider(customAdapter);
      logger$2.info("Custom adapter initialized");
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
    logger$2.info("Auto-tracking initialized");
  }
  /**
   * Track an event
   */
  track(event) {
    if (this.shouldIgnoreAnalytics()) {
      logger$2.debug("Event tracking skipped due to ignore flag:", event.event);
      return;
    }
    if (!this.initialized) {
      logger$2.warn("Analytics not initialized, queuing event:", event.event);
    }
    if (dataLayer.isDebugMode()) {
      const validation = this.validator.validateEvent(event);
      if (!validation.valid) {
        logger$2.error("Event validation failed:", validation.errors);
        if (validation.warnings.length > 0) {
          logger$2.warn("Event validation warnings:", validation.warnings);
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
    logger$2.info(`Debug mode ${enabled ? "enabled" : "disabled"}`);
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
      eventsTracked: dataLayer.getEventCount(),
      ignored: this.shouldIgnoreAnalytics()
    };
  }
  /**
   * Clear the analytics ignore flag from session storage
   */
  clearIgnoreFlag() {
    if (typeof window !== "undefined") {
      try {
        sessionStorage.removeItem("analytics_ignore");
        logger$2.info("Analytics ignore flag cleared");
      } catch (error) {
        logger$2.error("Error clearing ignore flag:", error);
      }
    }
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
  window.NextAnalyticsClearIgnore = () => {
    nextAnalytics.clearIgnoreFlag();
  };
}
const index = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  EcommerceEvents,
  EventValidator,
  NextAnalytics,
  UserEvents,
  dataLayer,
  nextAnalytics
});
const logger$1 = createLogger("AttributionCollector");
class AttributionCollector {
  /**
   * Collect attribution data from all available sources
   */
  async collect() {
    const metadata = this.collectMetadata();
    return {
      // Core attribution fields
      affiliate: this.getStoredValue("affid") || this.getStoredValue("aff") || "",
      funnel: this.getFunnelName(),
      gclid: this.getStoredValue("gclid") || "",
      // UTM parameters
      utm_source: this.getStoredValue("utm_source") || "",
      utm_medium: this.getStoredValue("utm_medium") || "",
      utm_campaign: this.getStoredValue("utm_campaign") || "",
      utm_content: this.getStoredValue("utm_content") || "",
      utm_term: this.getStoredValue("utm_term") || "",
      // Subaffiliates
      subaffiliate1: this.getStoredValue("subaffiliate1") || this.getStoredValue("sub1") || "",
      subaffiliate2: this.getStoredValue("subaffiliate2") || this.getStoredValue("sub2") || "",
      subaffiliate3: this.getStoredValue("subaffiliate3") || this.getStoredValue("sub3") || "",
      subaffiliate4: this.getStoredValue("subaffiliate4") || this.getStoredValue("sub4") || "",
      subaffiliate5: this.getStoredValue("subaffiliate5") || this.getStoredValue("sub5") || "",
      // Metadata
      metadata,
      // Timestamps
      first_visit_timestamp: this.getFirstVisitTimestamp(),
      current_visit_timestamp: Date.now()
    };
  }
  /**
   * Collect metadata including device info, referrer, and tracking data
   */
  collectMetadata() {
    const metadata = {
      landing_page: window.location.href,
      referrer: document.referrer || "",
      device: navigator.userAgent || "",
      device_type: this.getDeviceType(),
      domain: window.location.hostname,
      timestamp: Date.now(),
      // Facebook tracking
      fb_fbp: this.getCookie("_fbp") || "",
      fb_fbc: this.getCookie("_fbc") || "",
      fb_pixel_id: this.getFacebookPixelId()
    };
    const fbclid = this.getStoredValue("fbclid");
    if (fbclid) {
      metadata.fbclid = fbclid;
    }
    this.handleEverflowClickId(metadata);
    this.collectTrackingTags(metadata);
    return metadata;
  }
  /**
   * Get value from URL parameters, sessionStorage, or localStorage
   * Priority: URL > sessionStorage > localStorage
   */
  getStoredValue(key) {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has(key)) {
      const value = urlParams.get(key) || "";
      try {
        sessionStorage.setItem(key, value);
      } catch (error) {
        console.error(`[AttributionCollector] Error storing ${key} in sessionStorage:`, error);
      }
      return value;
    }
    try {
      const sessionValue = sessionStorage.getItem(key);
      if (sessionValue) {
        return sessionValue;
      }
    } catch (error) {
      console.error(`[AttributionCollector] Error reading ${key} from sessionStorage:`, error);
    }
    try {
      const localValue = localStorage.getItem(key);
      if (localValue) {
        return localValue;
      }
    } catch (error) {
      console.error(`[AttributionCollector] Error reading ${key} from localStorage:`, error);
    }
    try {
      const persistedData = localStorage.getItem("next-attribution");
      if (persistedData) {
        const parsed = JSON.parse(persistedData);
        if (parsed.state && parsed.state[key]) {
          return parsed.state[key];
        }
      }
    } catch (error) {
      console.error("[AttributionCollector] Error reading persisted attribution:", error);
    }
    return "";
  }
  /**
   * Get cookie value by name
   */
  getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      return parts.pop()?.split(";").shift() || "";
    }
    return "";
  }
  /**
   * Detect device type based on user agent
   */
  getDeviceType() {
    const userAgent = navigator.userAgent;
    const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
    return mobileRegex.test(userAgent) ? "mobile" : "desktop";
  }
  /**
   * Get funnel name from meta tag or campaign
   * Once a funnel is set, it persists and won't be overwritten
   */
  getFunnelName() {
    try {
      const sessionFunnel = sessionStorage.getItem("next_funnel_name");
      if (sessionFunnel) {
        logger$1.debug(`Using persisted funnel from session: ${sessionFunnel}`);
        return sessionFunnel;
      }
      const localFunnel = localStorage.getItem("next_funnel_name");
      if (localFunnel) {
        logger$1.debug(`Using persisted funnel from localStorage: ${localFunnel}`);
        sessionStorage.setItem("next_funnel_name", localFunnel);
        return localFunnel;
      }
      const persistedData = localStorage.getItem("next-attribution");
      if (persistedData) {
        const parsed = JSON.parse(persistedData);
        if (parsed.state && parsed.state.funnel) {
          logger$1.debug(`Using persisted funnel from attribution: ${parsed.state.funnel}`);
          sessionStorage.setItem("next_funnel_name", parsed.state.funnel);
          localStorage.setItem("next_funnel_name", parsed.state.funnel);
          return parsed.state.funnel;
        }
      }
    } catch (error) {
      console.error("[AttributionCollector] Error reading persisted funnel:", error);
    }
    const funnelMetaTag = document.querySelector(
      'meta[name="os-tracking-tag"][data-tag-name="funnel_name"], meta[name="data-next-tracking-tag"][data-tag-name="funnel_name"], meta[name="next-funnel"]'
    );
    if (funnelMetaTag) {
      const value = funnelMetaTag.getAttribute("data-tag-value") || funnelMetaTag.getAttribute("content");
      if (value) {
        logger$1.debug(`New funnel found from meta tag: ${value}`);
        try {
          sessionStorage.setItem("next_funnel_name", value);
          localStorage.setItem("next_funnel_name", value);
          logger$1.info(`Persisted funnel name: ${value}`);
        } catch (error) {
          console.error("[AttributionCollector] Error persisting funnel name:", error);
        }
        return value;
      }
    }
    return "";
  }
  /**
   * Handle Everflow click ID tracking
   */
  handleEverflowClickId(metadata) {
    const urlParams = new URLSearchParams(window.location.search);
    let evclid = localStorage.getItem("evclid");
    if (urlParams.has("evclid")) {
      evclid = urlParams.get("evclid") || "";
      localStorage.setItem("evclid", evclid);
      sessionStorage.setItem("evclid", evclid);
      logger$1.debug(`Everflow click ID found in URL: ${evclid}`);
    } else if (!evclid && sessionStorage.getItem("evclid")) {
      evclid = sessionStorage.getItem("evclid");
      if (evclid) {
        localStorage.setItem("evclid", evclid);
        logger$1.debug(`Everflow click ID found in sessionStorage: ${evclid}`);
      }
    }
    if (urlParams.has("sg_evclid")) {
      const sg_evclid = urlParams.get("sg_evclid") || "";
      sessionStorage.setItem("sg_evclid", sg_evclid);
      localStorage.setItem("sg_evclid", sg_evclid);
      metadata.sg_evclid = sg_evclid;
      logger$1.debug(`SG Everflow click ID found: ${sg_evclid}`);
    } else {
      const storedSgEvclid = localStorage.getItem("sg_evclid");
      if (storedSgEvclid) {
        metadata.sg_evclid = storedSgEvclid;
      }
    }
    if (evclid) {
      metadata.everflow_transaction_id = evclid;
      logger$1.debug(`Added Everflow transaction ID to metadata: ${evclid}`);
    }
  }
  /**
   * Collect custom tracking tags from meta elements
   */
  collectTrackingTags(metadata) {
    const trackingTags = document.querySelectorAll(
      'meta[name="os-tracking-tag"], meta[name="data-next-tracking-tag"]'
    );
    logger$1.debug(`Found ${trackingTags.length} tracking tags`);
    trackingTags.forEach((tag) => {
      const tagName = tag.getAttribute("data-tag-name");
      const tagValue = tag.getAttribute("data-tag-value");
      const shouldPersist = tag.getAttribute("data-persist") === "true";
      if (tagName && tagValue) {
        metadata[tagName] = tagValue;
        logger$1.debug(`Added tracking tag: ${tagName} = ${tagValue}`);
        if (shouldPersist) {
          try {
            sessionStorage.setItem(`tn_tag_${tagName}`, tagValue);
            logger$1.debug(`Persisted tracking tag: ${tagName}`);
          } catch (error) {
            console.error(`[AttributionCollector] Error persisting tag ${tagName}:`, error);
          }
        }
      }
    });
  }
  /**
   * Try to detect Facebook Pixel ID from the page
   */
  getFacebookPixelId() {
    const pixelMeta = document.querySelector(
      'meta[name="os-facebook-pixel"], meta[name="facebook-pixel-id"]'
    );
    if (pixelMeta) {
      const pixelId = pixelMeta.getAttribute("content");
      if (pixelId) {
        logger$1.debug(`Facebook Pixel ID found from meta tag: ${pixelId}`);
        return pixelId;
      }
    }
    const scripts = document.querySelectorAll("script");
    for (const script of scripts) {
      const content = script.textContent || "";
      if (content.includes("fbq(") && content.includes("init")) {
        const match = content.match(/fbq\s*\(\s*['"]init['"],\s*['"](\d+)['"]/);
        if (match && match[1]) {
          logger$1.debug(`Facebook Pixel ID found from script: ${match[1]}`);
          return match[1];
        }
      }
    }
    return "";
  }
  /**
   * Get the first visit timestamp
   */
  getFirstVisitTimestamp() {
    try {
      const persistedData = localStorage.getItem("next-attribution");
      if (persistedData) {
        const parsed = JSON.parse(persistedData);
        if (parsed.state && parsed.state.first_visit_timestamp) {
          return parsed.state.first_visit_timestamp;
        }
      }
    } catch (error) {
      console.error("[AttributionCollector] Error reading first visit timestamp:", error);
    }
    return Date.now();
  }
}
const AttributionCollector$1 = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  AttributionCollector
});
class DisplayValueValidator {
  static validatePercentage(value) {
    const num = Number(value);
    if (isNaN(num)) {
      console.warn(`Invalid percentage value: ${value}`);
      return 0;
    }
    if (num > 1 && num <= 100) return num;
    if (num >= 0 && num <= 1) return num * 100;
    if (num > 100) {
      console.warn(`Percentage exceeds 100: ${num}`);
      return 100;
    }
    return Math.max(0, num);
  }
  static validateCurrency(value) {
    if (typeof value === "string") {
      const cleanValue = value.replace(/[$,]/g, "").trim();
      const num2 = Number(cleanValue);
      if (!isNaN(num2)) {
        return Math.round(num2 * 100) / 100;
      }
    }
    const num = Number(value);
    if (isNaN(num)) {
      console.warn(`Invalid currency value: ${value}`);
      return 0;
    }
    return Math.round(num * 100) / 100;
  }
  static validateNumber(value) {
    const num = Number(value);
    if (isNaN(num)) {
      console.warn(`Invalid number value: ${value}`);
      return 0;
    }
    return num;
  }
  static validateBoolean(value) {
    if (typeof value === "boolean") {
      return value;
    }
    if (typeof value === "string") {
      const lower = value.toLowerCase();
      return lower === "true" || lower === "1" || lower === "yes";
    }
    return !!value;
  }
  static validateDate(value) {
    if (!value) return null;
    try {
      const date = new Date(value);
      if (isNaN(date.getTime())) {
        console.warn(`Invalid date value: ${value}`);
        return null;
      }
      return date;
    } catch {
      console.warn(`Invalid date value: ${value}`);
      return null;
    }
  }
  static validateString(value) {
    if (value === null || value === void 0) {
      return "";
    }
    return String(value);
  }
}
const _PackageContextResolver = class _PackageContextResolver {
  /**
   * Find package ID from parent DOM context
   * Searches up the DOM tree for package ID attributes
   */
  static findPackageId(element) {
    let current = element.parentElement;
    while (current) {
      for (const attr of this.PACKAGE_ID_ATTRS) {
        const value = current.getAttribute(attr);
        if (value) {
          const id = parseInt(value, 10);
          if (!isNaN(id)) {
            this.logger.debug(`Found context package ID: ${id} from element:`, current);
            return id;
          }
        }
      }
      current = current.parentElement;
    }
    this.logger.debug("No context package ID found in parent elements");
    return void 0;
  }
  /**
   * Get package ID from element or its context
   * First checks element itself, then searches parents
   */
  static getPackageId(element) {
    for (const attr of this.PACKAGE_ID_ATTRS) {
      const value = element.getAttribute(attr);
      if (value) {
        const id = parseInt(value, 10);
        if (!isNaN(id)) {
          this.logger.debug(`Found direct package ID: ${id} from element:`, element);
          return id;
        }
      }
    }
    return this.findPackageId(element);
  }
};
_PackageContextResolver.logger = createLogger("PackageContextResolver");
_PackageContextResolver.PACKAGE_ID_ATTRS = [
  "data-next-package-id",
  "data-next-package",
  "data-package-id"
];
let PackageContextResolver = _PackageContextResolver;
class PriceCalculator {
  /**
   * Calculate savings amount
   * @param retailPrice Original/compare price
   * @param currentPrice Sale/current price
   * @returns Savings amount (always >= 0)
   */
  static calculateSavings(retailPrice, currentPrice) {
    return Math.max(0, retailPrice - currentPrice);
  }
  /**
   * Calculate savings percentage
   * @param retailPrice Original/compare price
   * @param currentPrice Sale/current price
   * @returns Savings percentage (0-100)
   */
  static calculateSavingsPercentage(retailPrice, currentPrice) {
    const savings = this.calculateSavings(retailPrice, currentPrice);
    if (retailPrice <= 0 || savings <= 0) return 0;
    const percentage = savings / retailPrice * 100;
    return Math.round(percentage);
  }
  /**
   * Calculate unit price from total
   * @param totalPrice Total package price
   * @param quantity Number of units
   * @returns Price per unit
   */
  static calculateUnitPrice(totalPrice, quantity) {
    return quantity > 0 ? totalPrice / quantity : 0;
  }
  /**
   * Calculate line total
   * @param unitPrice Price per unit
   * @param quantity Number of units
   * @returns Total price
   */
  static calculateLineTotal(unitPrice, quantity) {
    return unitPrice * quantity;
  }
  /**
   * Calculate complete price metrics for a package
   * Note: 'price' from API is per-unit price, 'price_total' is for all units
   */
  static calculatePackageMetrics(params) {
    const totalPrice = params.priceTotal || params.price * params.quantity;
    const totalRetailPrice = params.retailPriceTotal || params.retailPrice * params.quantity;
    const unitPrice = this.calculateUnitPrice(totalPrice, params.quantity);
    const unitRetailPrice = this.calculateUnitPrice(totalRetailPrice, params.quantity);
    return {
      // Totals
      totalPrice,
      totalRetailPrice,
      totalSavings: this.calculateSavings(totalRetailPrice, totalPrice),
      totalSavingsPercentage: this.calculateSavingsPercentage(totalRetailPrice, totalPrice),
      // Units
      unitPrice,
      unitRetailPrice,
      unitSavings: this.calculateSavings(unitRetailPrice, unitPrice),
      unitSavingsPercentage: this.calculateSavingsPercentage(unitRetailPrice, unitPrice),
      // Helpers
      hasSavings: totalRetailPrice > totalPrice
    };
  }
}
function preserveQueryParams(targetUrl, preserveParams = ["debug", "debugger"]) {
  try {
    const url = new URL(targetUrl, window.location.origin);
    const currentParams = new URLSearchParams(window.location.search);
    preserveParams.forEach((param) => {
      const value = currentParams.get(param);
      if (value && !url.searchParams.has(param)) {
        url.searchParams.append(param, value);
      }
    });
    if (currentParams.get("debug") === "true" && !url.searchParams.has("debug")) {
      url.searchParams.append("debug", "true");
    }
    if (currentParams.get("debugger") === "true" && !url.searchParams.has("debugger")) {
      url.searchParams.append("debugger", "true");
    }
    return url.href;
  } catch (error) {
    console.error("[URL Utils] Error preserving query parameters:", error);
    return targetUrl;
  }
}
function isValidString(value) {
  return typeof value === "string" && value.length > 0;
}
function isValidNumber(value) {
  return typeof value === "number" && !isNaN(value) && isFinite(value);
}
function isValidPositiveNumber(value) {
  return isValidNumber(value) && value >= 0;
}
function isValidPrice(value) {
  return isValidPositiveNumber(value);
}
function parseValidPrice(priceString) {
  if (!isValidString(priceString)) return void 0;
  const priceMatch = priceString.match(/\$?(\d+\.?\d*)/);
  if (!priceMatch || !priceMatch[1]) return void 0;
  const parsed = parseFloat(priceMatch[1]);
  return isValidPrice(parsed) ? parsed : void 0;
}
const _ElementDataExtractor = class _ElementDataExtractor {
  /**
   * Extract price from an element using common price selectors
   */
  static extractPrice(element) {
    for (const selector of this.PRICE_SELECTORS) {
      const priceEl = element.querySelector(selector);
      if (priceEl?.textContent) {
        const price = parseValidPrice(priceEl.textContent.trim());
        if (price !== void 0) return price;
      }
    }
    return void 0;
  }
  /**
   * Extract name/title from an element using common selectors
   */
  static extractName(element) {
    for (const selector of this.NAME_SELECTORS) {
      const nameEl = element.querySelector(selector);
      const name = nameEl?.textContent?.trim();
      if (name) return name;
    }
    return void 0;
  }
  /**
   * Extract quantity from element attributes
   */
  static extractQuantity(element) {
    const qtyAttr = element.getAttribute("data-next-quantity") || element.getAttribute("data-quantity") || element.getAttribute("data-qty");
    return qtyAttr ? parseInt(qtyAttr, 10) || 1 : 1;
  }
};
_ElementDataExtractor.PRICE_SELECTORS = [
  ".pb-quantity__price.pb--current",
  ".price",
  '[data-next-display*="price"]',
  ".next-price",
  ".product-price",
  ".item-price"
];
_ElementDataExtractor.NAME_SELECTORS = [
  ".card-title",
  "h1, h2, h3, h4, h5, h6",
  ".title",
  ".name",
  '[data-next-display*="name"]',
  ".product-name",
  ".item-name"
];
let ElementDataExtractor = _ElementDataExtractor;
class CountryService {
  constructor() {
    this.cachePrefix = "next_country_";
    this.cacheExpiry = 36e5;
    this.baseUrl = "https://cdn-countries.muddy-wind-c7ca.workers.dev";
    this.config = {};
    this.logger = new Logger("CountryService");
  }
  static getInstance() {
    if (!CountryService.instance) {
      CountryService.instance = new CountryService();
    }
    return CountryService.instance;
  }
  /**
   * Set address configuration
   */
  setConfig(config) {
    this.config = { ...config };
    this.logger.debug("Address configuration updated:", this.config);
  }
  /**
   * Get current configuration
   */
  getConfig() {
    return { ...this.config };
  }
  /**
   * Get location data with user's detected country and list of all countries
   */
  async getLocationData() {
    const cached = this.getFromCache("location_data");
    if (cached) {
      return await this.applyCountryFiltering(cached);
    }
    try {
      const response = await fetch(`${this.baseUrl}/location`);
      if (!response.ok) {
        throw new Error(`Failed to fetch location data: ${response.statusText}`);
      }
      const data = await response.json();
      this.setCache("location_data", data);
      this.logger.debug("Location data fetched", {
        detectedCountry: data.detectedCountryCode,
        countriesCount: data.countries?.length
      });
      return await this.applyCountryFiltering(data);
    } catch (error) {
      this.logger.error("Failed to fetch location data:", error);
      return await this.applyCountryFiltering(this.getFallbackLocationData());
    }
  }
  /**
   * Get states for a specific country
   */
  async getCountryStates(countryCode) {
    const cacheKey = `states_${countryCode}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      return {
        ...cached,
        states: this.applyStateFiltering(cached.states || [])
      };
    }
    try {
      const response = await fetch(`${this.baseUrl}/countries/${countryCode}/states`);
      if (!response.ok) {
        throw new Error(`Failed to fetch states for ${countryCode}: ${response.statusText}`);
      }
      const data = await response.json();
      this.setCache(cacheKey, data);
      this.logger.debug(`States data fetched for ${countryCode}`, {
        statesCount: data.states?.length,
        stateLabel: data.countryConfig?.stateLabel
      });
      return {
        ...data,
        states: this.applyStateFiltering(data.states || [])
      };
    } catch (error) {
      this.logger.error(`Failed to fetch states for ${countryCode}:`, error);
      return {
        countryConfig: this.getDefaultCountryConfig(countryCode),
        states: []
      };
    }
  }
  /**
   * Get country configuration by country code
   */
  async getCountryConfig(countryCode) {
    const locationData = await this.getLocationData();
    if (locationData.detectedCountryCode === countryCode) {
      return locationData.detectedCountryConfig;
    }
    const statesData = await this.getCountryStates(countryCode);
    return statesData.countryConfig;
  }
  /**
   * Validate postal code based on country configuration
   */
  validatePostalCode(postalCode, _countryCode, countryConfig) {
    if (!postalCode) return false;
    if (postalCode.length < countryConfig.postcodeMinLength || postalCode.length > countryConfig.postcodeMaxLength) {
      return false;
    }
    if (countryConfig.postcodeRegex) {
      try {
        const regex = new RegExp(countryConfig.postcodeRegex);
        return regex.test(postalCode);
      } catch (error) {
        this.logger.error("Invalid postal code regex:", error);
        return true;
      }
    }
    return true;
  }
  /**
   * Clear all cached data
   */
  clearCache() {
    try {
      const keysToRemove = [];
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key && key.startsWith(this.cachePrefix)) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((key) => sessionStorage.removeItem(key));
      this.logger.debug("Country service cache cleared");
    } catch (error) {
      this.logger.warn("Failed to clear cache:", error);
    }
  }
  /**
   * Clear cache for a specific country
   */
  clearCountryCache(countryCode) {
    try {
      const cacheKey = this.cachePrefix + `states_${countryCode}`;
      sessionStorage.removeItem(cacheKey);
      this.logger.debug(`Cache cleared for country: ${countryCode}`);
    } catch (error) {
      this.logger.warn(`Failed to clear cache for country ${countryCode}:`, error);
    }
  }
  getFromCache(key) {
    try {
      const cacheKey = this.cachePrefix + key;
      const cached = sessionStorage.getItem(cacheKey);
      if (!cached) return null;
      const { data, timestamp } = JSON.parse(cached);
      const now = Date.now();
      if (now - timestamp > this.cacheExpiry) {
        sessionStorage.removeItem(cacheKey);
        return null;
      }
      return data;
    } catch (error) {
      this.logger.warn("Failed to read from cache:", error);
      return null;
    }
  }
  setCache(key, data) {
    try {
      const cacheKey = this.cachePrefix + key;
      const cacheData = {
        data,
        timestamp: Date.now()
      };
      sessionStorage.setItem(cacheKey, JSON.stringify(cacheData));
    } catch (error) {
      this.logger.warn("Failed to write to cache:", error);
    }
  }
  getDefaultCountryConfig(countryCode) {
    const configs = {
      US: {
        stateLabel: "State",
        stateRequired: true,
        postcodeLabel: "ZIP Code",
        postcodeRegex: "^\\d{5}(-\\d{4})?$",
        postcodeMinLength: 5,
        postcodeMaxLength: 10,
        postcodeExample: "12345 or 12345-6789",
        currencyCode: "USD",
        currencySymbol: "$"
      },
      CA: {
        stateLabel: "Province",
        stateRequired: true,
        postcodeLabel: "Postal Code",
        postcodeRegex: "^[A-Z]\\d[A-Z] ?\\d[A-Z]\\d$",
        postcodeMinLength: 6,
        postcodeMaxLength: 7,
        postcodeExample: "K1A 0B1",
        currencyCode: "CAD",
        currencySymbol: "$"
      },
      GB: {
        stateLabel: "County",
        stateRequired: false,
        postcodeLabel: "Postcode",
        postcodeRegex: "^[A-Z]{1,2}\\d{1,2}[A-Z]?\\s?\\d[A-Z]{2}$",
        postcodeMinLength: 5,
        postcodeMaxLength: 8,
        postcodeExample: "SW1A 1AA",
        currencyCode: "GBP",
        currencySymbol: "£"
      }
    };
    return configs[countryCode] || {
      stateLabel: "State/Province",
      stateRequired: false,
      postcodeLabel: "Postal Code",
      postcodeRegex: null,
      postcodeMinLength: 2,
      postcodeMaxLength: 20,
      postcodeExample: null,
      currencyCode: "USD",
      currencySymbol: "$"
    };
  }
  getFallbackLocationData() {
    return {
      detectedCountryCode: "US",
      detectedCountryConfig: this.getDefaultCountryConfig("US"),
      detectedStates: [],
      countries: [
        { code: "US", name: "United States", phonecode: "+1", currencyCode: "USD", currencySymbol: "$" },
        { code: "CA", name: "Canada", phonecode: "+1", currencyCode: "CAD", currencySymbol: "$" },
        { code: "GB", name: "United Kingdom", phonecode: "+44", currencyCode: "GBP", currencySymbol: "£" },
        { code: "AU", name: "Australia", phonecode: "+61", currencyCode: "AUD", currencySymbol: "$" },
        { code: "DE", name: "Germany", phonecode: "+49", currencyCode: "EUR", currencySymbol: "€" }
      ]
    };
  }
  async applyCountryFiltering(data) {
    let filteredCountries = [...data.countries];
    if (this.config.countries && this.config.countries.length > 0) {
      filteredCountries = this.config.countries.map((customCountry) => ({
        code: customCountry.code,
        name: customCountry.name,
        phonecode: "",
        currencyCode: "USD",
        currencySymbol: "$"
      }));
    } else if (this.config.showCountries && this.config.showCountries.length > 0) {
      filteredCountries = filteredCountries.filter(
        (country) => this.config.showCountries.includes(country.code)
      );
    }
    let detectedCountryCode = data.detectedCountryCode;
    let detectedCountryConfig = data.detectedCountryConfig;
    if (this.config.defaultCountry) {
      const defaultCountryExists = filteredCountries.some(
        (country) => country.code === this.config.defaultCountry
      );
      if (defaultCountryExists) {
        detectedCountryCode = this.config.defaultCountry;
        try {
          const defaultCountryData = await this.getCountryStates(this.config.defaultCountry);
          detectedCountryConfig = defaultCountryData.countryConfig;
        } catch (error) {
          this.logger.warn(`Failed to fetch config for default country ${this.config.defaultCountry}, using fallback:`, error);
          detectedCountryConfig = this.getDefaultCountryConfig(this.config.defaultCountry);
        }
      }
    }
    return {
      ...data,
      countries: filteredCountries,
      detectedCountryCode,
      detectedCountryConfig
    };
  }
  applyStateFiltering(states) {
    const US_TERRITORIES_TO_HIDE = [
      "AS",
      "UM-81",
      "GU",
      "UM-84",
      "UM-86",
      "UM-67",
      "UM-89",
      "UM-71",
      "UM-76",
      "MP",
      "UM-95",
      "PR",
      "UM",
      "VI",
      "UM-79"
    ];
    let filteredStates = states.filter(
      (state) => !US_TERRITORIES_TO_HIDE.includes(state.code)
    );
    if (this.config.dontShowStates && this.config.dontShowStates.length > 0) {
      filteredStates = filteredStates.filter(
        (state) => !this.config.dontShowStates.includes(state.code)
      );
    }
    return filteredStates;
  }
}
class FieldFinder {
  /**
   * Find a field by name using multiple selector strategies
   */
  static findField(fieldName, options = {}) {
    const container = options.container || document;
    const defaultSelectors = [
      `[data-next-checkout-field="${fieldName}"]`,
      `[os-checkout-field="${fieldName}"]`,
      `input[name="${fieldName}"]`,
      `select[name="${fieldName}"]`,
      `textarea[name="${fieldName}"]`,
      `#${fieldName}`,
      `[data-field="${fieldName}"]`,
      `[data-field-name="${fieldName}"]`
    ];
    const selectors = options.customSelectors || defaultSelectors;
    for (const selector of selectors) {
      try {
        const element = container.querySelector(selector);
        if (element) {
          const htmlElement = element;
          if (!options.includeHidden && htmlElement.offsetParent === null) {
            continue;
          }
          if (!options.includeDisabled && "disabled" in htmlElement) {
            const inputElement = htmlElement;
            if (inputElement.disabled) continue;
          }
          return htmlElement;
        }
      } catch (e) {
        console.warn(`Invalid selector: ${selector}`);
      }
    }
    return null;
  }
  /**
   * Find multiple fields by names
   */
  static findFields(fieldNames, options = {}) {
    const fields = /* @__PURE__ */ new Map();
    fieldNames.forEach((name) => {
      const field = this.findField(name, options);
      if (field) {
        fields.set(name, field);
      }
    });
    return fields;
  }
  /**
   * Find field wrapper element
   */
  static findFieldWrapper(field, customSelectors) {
    const wrapperSelectors = customSelectors || [
      ".form-group",
      ".frm-flds",
      ".form-input",
      ".select-form-wrapper",
      ".field-wrapper",
      ".input-wrapper",
      ".form-field"
    ];
    for (const selector of wrapperSelectors) {
      const wrapper = field.closest(selector);
      if (wrapper) return wrapper;
    }
    return field.parentElement;
  }
  /**
   * Find form container for a field
   */
  static findFormContainer(field) {
    return field.closest("form");
  }
  /**
   * Find label for a field
   */
  static findFieldLabel(field) {
    if (field.id) {
      const label = document.querySelector(`label[for="${field.id}"]`);
      if (label) return label;
    }
    let parent = field.parentElement;
    while (parent) {
      const label = parent.querySelector("label");
      if (label) return label;
      if (parent.tagName === "LABEL") {
        return parent;
      }
      parent = parent.parentElement;
    }
    const wrapper = this.findFieldWrapper(field);
    if (wrapper) {
      const label = wrapper.querySelector("label");
      if (label) return label;
    }
    return null;
  }
  /**
   * Find all form fields in a container
   */
  static findAllFormFields(container, options = {}) {
    const selectors = [
      'input:not([type="hidden"]):not([type="submit"]):not([type="button"])',
      "select",
      "textarea"
    ];
    if (options.includeButtons) {
      selectors.push("button", 'input[type="submit"]', 'input[type="button"]');
    }
    const fields = [];
    const elements = container.querySelectorAll(selectors.join(", "));
    elements.forEach((element) => {
      fields.push(element);
    });
    return fields;
  }
  /**
   * Find fields by attribute pattern
   */
  static findFieldsByAttribute(attributeName, pattern, container = document.body) {
    const fields = [];
    const selector = pattern ? `[${attributeName}]` : `[${attributeName}]`;
    const elements = container.querySelectorAll(selector);
    elements.forEach((element) => {
      const attrValue = element.getAttribute(attributeName);
      if (!pattern || !attrValue) {
        fields.push(element);
      } else if (typeof pattern === "string") {
        if (attrValue.includes(pattern)) {
          fields.push(element);
        }
      } else if (pattern instanceof RegExp) {
        if (pattern.test(attrValue)) {
          fields.push(element);
        }
      }
    });
    return fields;
  }
  /**
   * Check if element is a form field
   */
  static isFormField(element) {
    const fieldTags = ["INPUT", "SELECT", "TEXTAREA"];
    return fieldTags.includes(element.tagName);
  }
  /**
   * Get field type
   */
  static getFieldType(field) {
    if (field instanceof HTMLInputElement) {
      return field.type || "text";
    } else if (field instanceof HTMLSelectElement) {
      return "select";
    } else if (field instanceof HTMLTextAreaElement) {
      return "textarea";
    }
    return "unknown";
  }
  /**
   * Get field value safely
   */
  static getFieldValue(field) {
    if (field instanceof HTMLInputElement || field instanceof HTMLSelectElement || field instanceof HTMLTextAreaElement) {
      return field.value;
    }
    return "";
  }
  /**
   * Set field value safely
   */
  static setFieldValue(field, value) {
    if (field instanceof HTMLInputElement || field instanceof HTMLSelectElement || field instanceof HTMLTextAreaElement) {
      field.value = value;
      field.dispatchEvent(new Event("change", { bubbles: true }));
      return true;
    }
    return false;
  }
}
const DEFAULT_OPTIONS = {
  wrapperClass: "form-group",
  errorClass: "next-error-field",
  errorLabelClass: "next-error-label",
  successClass: "no-error",
  iconErrorClass: "addErrorIcon",
  iconSuccessClass: "addTick"
};
class ErrorDisplayManager {
  constructor(options = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
  }
  /**
   * Show error on a field with consistent styling
   */
  showFieldError(field, message) {
    const wrapper = FieldFinder.findFieldWrapper(field);
    if (!wrapper) return;
    this.clearFieldError(field);
    field.classList.add("has-error", this.options.errorClass);
    field.classList.remove(this.options.successClass);
    wrapper.classList.add(this.options.iconErrorClass);
    wrapper.classList.remove(this.options.iconSuccessClass);
    const errorElement = document.createElement("div");
    errorElement.className = this.options.errorLabelClass;
    errorElement.textContent = message;
    errorElement.setAttribute("role", "alert");
    errorElement.setAttribute("aria-live", "polite");
    const formGroup = field.closest(`.${this.options.wrapperClass}`);
    if (formGroup) {
      formGroup.appendChild(errorElement);
    } else {
      wrapper.appendChild(errorElement);
    }
  }
  /**
   * Clear error from a field
   */
  clearFieldError(field) {
    const wrapper = FieldFinder.findFieldWrapper(field);
    field.classList.remove("has-error", this.options.errorClass);
    if (wrapper) {
      wrapper.classList.remove(this.options.iconErrorClass);
      const errorLabel = wrapper.querySelector(`.${this.options.errorLabelClass}`);
      if (errorLabel) {
        errorLabel.remove();
      }
      const formGroup = field.closest(`.${this.options.wrapperClass}`);
      if (formGroup) {
        const formGroupError = formGroup.querySelector(`.${this.options.errorLabelClass}`);
        if (formGroupError) {
          formGroupError.remove();
        }
      }
    }
  }
  /**
   * Show field as valid with success styling
   */
  showFieldValid(field) {
    const wrapper = FieldFinder.findFieldWrapper(field);
    this.clearFieldError(field);
    field.classList.add(this.options.successClass);
    if (wrapper) {
      wrapper.classList.add(this.options.iconSuccessClass);
    }
  }
  /**
   * Clear all error displays in a container
   */
  clearAllErrors(container) {
    const errorLabels = container.querySelectorAll(`.${this.options.errorLabelClass}`);
    errorLabels.forEach((label) => label.remove());
    const errorFields = container.querySelectorAll(`.${this.options.errorClass}, .has-error`);
    errorFields.forEach((field) => {
      field.classList.remove("has-error", this.options.errorClass);
    });
    const errorWrappers = container.querySelectorAll(`.${this.options.iconErrorClass}`);
    errorWrappers.forEach((wrapper) => {
      wrapper.classList.remove(this.options.iconErrorClass);
    });
  }
  /**
   * Display multiple field errors at once
   */
  displayErrors(errors, container) {
    this.clearAllErrors(container);
    Object.entries(errors).forEach(([fieldName, message]) => {
      const field = this.findField(fieldName, container);
      if (field) {
        this.showFieldError(field, message);
      }
    });
  }
  /**
   * Find a field by name within a container
   */
  findField(fieldName, container) {
    const selectors = [
      `[data-next-checkout-field="${fieldName}"]`,
      `[os-checkout-field="${fieldName}"]`,
      `[name="${fieldName}"]`,
      `#${fieldName}`
    ];
    for (const selector of selectors) {
      const field = container.querySelector(selector);
      if (field) return field;
    }
    return null;
  }
  /**
   * Show a toast error message
   */
  static showToastError(message, duration = 1e4) {
    const toastHandler = document.querySelector('[next-checkout-element="spreedly-error"]');
    if (!(toastHandler instanceof HTMLElement)) return;
    const messageElement = toastHandler.querySelector('[data-os-message="error"]');
    if (messageElement instanceof HTMLElement) {
      messageElement.textContent = message;
      toastHandler.style.display = "flex";
      setTimeout(() => {
        if (toastHandler.style.display === "flex") {
          toastHandler.style.display = "none";
        }
      }, duration);
    }
  }
  /**
   * Hide toast error message
   */
  static hideToastError() {
    const toastHandler = document.querySelector('[next-checkout-element="spreedly-error"]');
    if (toastHandler instanceof HTMLElement) {
      toastHandler.style.display = "none";
    }
  }
}
class EventHandlerManager {
  constructor() {
    this.handlers = /* @__PURE__ */ new Map();
    this.bindings = [];
  }
  /**
   * Add an event handler with automatic cleanup tracking
   */
  addHandler(element, event, handler, options) {
    if (!element) return;
    if (!this.handlers.has(element)) {
      this.handlers.set(element, /* @__PURE__ */ new Map());
    }
    const elementHandlers = this.handlers.get(element);
    if (elementHandlers.has(event)) {
      const existingHandler = elementHandlers.get(event);
      element.removeEventListener(event, existingHandler);
    }
    element.addEventListener(event, handler, options);
    elementHandlers.set(event, handler);
    const binding = { element, event, handler };
    if (options !== void 0) {
      binding.options = options;
    }
    this.bindings.push(binding);
  }
  /**
   * Add multiple handlers at once
   */
  addHandlers(bindings) {
    bindings.forEach((binding) => {
      this.addHandler(
        binding.element,
        binding.event,
        binding.handler,
        binding.options
      );
    });
  }
  /**
   * Remove a specific handler
   */
  removeHandler(element, event) {
    if (!element) return;
    const elementHandlers = this.handlers.get(element);
    if (!elementHandlers) return;
    const handler = elementHandlers.get(event);
    if (handler) {
      element.removeEventListener(event, handler);
      elementHandlers.delete(event);
      this.bindings = this.bindings.filter(
        (b) => !(b.element === element && b.event === event)
      );
    }
    if (elementHandlers.size === 0) {
      this.handlers.delete(element);
    }
  }
  /**
   * Remove all handlers for a specific element
   */
  removeElementHandlers(element) {
    const elementHandlers = this.handlers.get(element);
    if (!elementHandlers) return;
    elementHandlers.forEach((handler, event) => {
      element.removeEventListener(event, handler);
    });
    this.handlers.delete(element);
    this.bindings = this.bindings.filter((b) => b.element !== element);
  }
  /**
   * Remove all handlers
   */
  removeAllHandlers() {
    this.handlers.forEach((elementHandlers, element) => {
      elementHandlers.forEach((handler, event) => {
        element.removeEventListener(event, handler);
      });
    });
    this.handlers.clear();
    this.bindings = [];
  }
  /**
   * Add event delegation handler
   */
  addDelegatedHandler(container, selector, event, handler) {
    const delegatedHandler = (e) => {
      const target = e.target;
      const matchedElement = target.closest(selector);
      if (matchedElement && container.contains(matchedElement)) {
        handler(e, matchedElement);
      }
    };
    this.addHandler(container, event, delegatedHandler);
  }
  /**
   * Add handler with debounce
   */
  addDebouncedHandler(element, event, handler, delay = 300) {
    let timeoutId;
    const debouncedHandler = (e) => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => {
        handler(e);
      }, delay);
    };
    this.addHandler(element, event, debouncedHandler);
  }
  /**
   * Add handler with throttle
   */
  addThrottledHandler(element, event, handler, limit = 300) {
    let inThrottle = false;
    const throttledHandler = (e) => {
      if (!inThrottle) {
        handler(e);
        inThrottle = true;
        setTimeout(() => {
          inThrottle = false;
        }, limit);
      }
    };
    this.addHandler(element, event, throttledHandler);
  }
  /**
   * Add one-time handler that auto-removes
   */
  addOnceHandler(element, event, handler) {
    const onceHandler = (e) => {
      handler(e);
      this.removeHandler(element, event);
    };
    this.addHandler(element, event, onceHandler);
  }
  /**
   * Get all active bindings (for debugging)
   */
  getActiveBindings() {
    return [...this.bindings];
  }
  /**
   * Check if element has handler for event
   */
  hasHandler(element, event) {
    const elementHandlers = this.handlers.get(element);
    return elementHandlers ? elementHandlers.has(event) : false;
  }
}
function getSuccessUrl() {
  const metaTag = document.querySelector('meta[name="next-success-url"]') || document.querySelector('meta[name="next-next-url"]') || document.querySelector('meta[name="os-next-page"]');
  if (metaTag?.content) {
    if (metaTag.content.startsWith("/")) {
      return window.location.origin + metaTag.content;
    }
    return metaTag.content;
  }
  return window.location.origin + "/success";
}
function getFailureUrl() {
  const metaTag = document.querySelector('meta[name="next-failure-url"]') || document.querySelector('meta[name="os-failure-url"]');
  if (metaTag?.content) {
    if (metaTag.content.startsWith("/")) {
      return window.location.origin + metaTag.content;
    }
    return metaTag.content;
  }
  const currentUrl = new URL(window.location.href);
  currentUrl.searchParams.set("payment_failed", "true");
  return currentUrl.href;
}
function getNextPageUrlFromMeta(refId) {
  const metaTag = document.querySelector('meta[name="next-success-url"]') || document.querySelector('meta[name="next-next-url"]') || document.querySelector('meta[name="os-next-page"]');
  if (!metaTag?.content) {
    return null;
  }
  const nextPagePath = metaTag.content;
  const redirectUrl = nextPagePath.startsWith("http") ? new URL(nextPagePath) : new URL(nextPagePath, window.location.origin);
  if (refId) {
    redirectUrl.searchParams.append("ref_id", refId);
  }
  return redirectUrl.href;
}
function handleOrderRedirect(order, logger2, emitCallback) {
  let redirectUrl;
  if (order.payment_complete_url) {
    logger2.debug(`Using payment_complete_url from API: ${order.payment_complete_url}`);
    redirectUrl = order.payment_complete_url;
  } else {
    const nextPageUrl = getNextPageUrlFromMeta(order.ref_id);
    if (nextPageUrl) {
      logger2.debug(`Using success URL from meta tag: ${nextPageUrl}`);
      redirectUrl = nextPageUrl;
    } else if (order.order_status_url) {
      logger2.debug(`Using order_status_url from API: ${order.order_status_url}`);
      redirectUrl = order.order_status_url;
    } else {
      logger2.warn("No order_status_url found in API response - using fallback URL");
      redirectUrl = `${window.location.origin}/checkout/confirmation/?ref_id=${order.ref_id || ""}`;
    }
  }
  if (redirectUrl) {
    const finalUrl = preserveQueryParams(redirectUrl);
    logger2.info("Redirecting to:", finalUrl);
    window.location.href = finalUrl;
  } else {
    logger2.error("No redirect URL could be determined");
    emitCallback("order:redirect-missing", { order });
  }
}
class TemplateRenderer {
  /**
   * Renders a template string by replacing {placeholder} patterns with actual values
   * @param template - Template string with {key.subkey} placeholders
   * @param options - Data, formatters, and default values
   * @returns Rendered HTML string
   */
  static render(template, options) {
    const { data, formatters = {}, defaultValues = {} } = options;
    return template.replace(/\{([^}]+)\}/g, (_, placeholder) => {
      try {
        const value = this.getValue(data, placeholder);
        const formattedValue = this.formatValue(value, placeholder, formatters);
        if (formattedValue === "" || formattedValue === null || formattedValue === void 0) {
          return defaultValues[placeholder] || "";
        }
        return String(formattedValue);
      } catch (error) {
        console.warn(`Template rendering error for placeholder ${placeholder}:`, error);
        return defaultValues[placeholder] || "";
      }
    });
  }
  /**
   * Extracts nested property value from data object
   * Handles paths like "item.price", "item.price.raw", "item.showUpsell"
   */
  static getValue(data, path) {
    const keys = path.split(".");
    let current = data;
    for (const key of keys) {
      if (current === null || current === void 0) {
        return void 0;
      }
      current = current[key];
    }
    return current;
  }
  /**
   * Applies formatting based on placeholder path and available formatters
   */
  static formatValue(value, placeholder, formatters) {
    if (placeholder.endsWith(".raw")) {
      return value;
    }
    const currencyFields = [
      "price",
      "total",
      "savings",
      "amount",
      "cost",
      "fee",
      "charge",
      "compare",
      "retail",
      "recurring",
      "subtotal",
      "tax",
      "shipping",
      "discount",
      "credit",
      "balance",
      "payment",
      "refund"
    ];
    const shouldFormatAsCurrency = currencyFields.some(
      (field) => placeholder.toLowerCase().includes(field.toLowerCase())
    );
    if (shouldFormatAsCurrency && typeof value === "number") {
      return formatters.currency ? formatters.currency(value) : value;
    }
    if (shouldFormatAsCurrency && typeof value === "string" && !isNaN(parseFloat(value))) {
      return formatters.currency ? formatters.currency(parseFloat(value)) : value;
    }
    if (placeholder.includes("date") || placeholder.includes("created_at")) {
      return formatters.date ? formatters.date(value) : value;
    }
    if (typeof value === "string" && (placeholder.includes("name") || placeholder.includes("title") || placeholder.includes("description"))) {
      return formatters.escapeHtml ? formatters.escapeHtml(value) : value;
    }
    return value;
  }
  /**
   * Validates template for common issues
   * Returns list of potential problems
   */
  static validateTemplate(template, availablePlaceholders) {
    const issues = [];
    const usedPlaceholders = this.extractPlaceholders(template);
    for (const placeholder of usedPlaceholders) {
      const basePlaceholder = placeholder.replace(".raw", "");
      if (!availablePlaceholders.some((p) => p.startsWith(basePlaceholder))) {
        issues.push(`Unknown placeholder: {${placeholder}}`);
      }
    }
    const unclosed = template.match(/\{[^}]*$/g);
    if (unclosed) {
      issues.push(`Unclosed placeholders found: ${unclosed.join(", ")}`);
    }
    return issues;
  }
  /**
   * Extracts all placeholders from template
   */
  static extractPlaceholders(template) {
    const matches = template.match(/\{([^}]+)\}/g) || [];
    return matches.map((match) => match.slice(1, -1));
  }
  /**
   * Creates default formatters that both cart and order enhancers can use
   */
  static createDefaultFormatters() {
    return {
      currency: (amount) => new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD"
      }).format(amount),
      date: (dateValue) => {
        if (!dateValue) return "";
        try {
          const date = new Date(dateValue);
          if (isNaN(date.getTime())) return String(dateValue);
          return new Intl.DateTimeFormat("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
          }).format(date);
        } catch {
          return String(dateValue);
        }
      },
      escapeHtml: (text) => {
        const div = document.createElement("div");
        div.textContent = text;
        return div.innerHTML;
      }
    };
  }
}
const logger = createLogger("UtmTransfer");
class UtmTransfer {
  constructor(config = {}) {
    this.config = {
      enabled: true,
      applyToExternalLinks: false,
      excludedDomains: [],
      paramsToCopy: [],
      debug: false,
      ...config
    };
    this.paramsToApply = new URLSearchParams();
  }
  /**
   * Initialize the UTM transfer feature
   */
  init() {
    if (!this.config.enabled) {
      logger.debug("UTM Transfer disabled by configuration");
      return;
    }
    const currentParams = new URLSearchParams(window.location.search);
    if (currentParams.toString() === "") {
      logger.debug("No URL parameters to transfer");
      return;
    }
    if (this.config.debug) {
      const availableParams = [];
      currentParams.forEach((value, key) => {
        availableParams.push(`${key}=${value}`);
      });
      logger.debug(`Available parameters: ${availableParams.join(", ")}`);
    }
    this.prepareParameters(currentParams);
    if (this.paramsToApply.toString() === "") {
      logger.debug("No matching parameters to transfer");
      return;
    }
    this.enhanceLinks();
    this.observeNewLinks();
    logger.debug(`UTM Transfer initialized with parameters: ${this.paramsToApply.toString()}`);
  }
  /**
   * Prepare parameters to apply based on configuration
   */
  prepareParameters(currentParams) {
    if (Array.isArray(this.config.paramsToCopy) && this.config.paramsToCopy.length > 0) {
      logger.debug(`Filtering to specific parameters: ${this.config.paramsToCopy.join(", ")}`);
      this.config.paramsToCopy.forEach((param) => {
        if (currentParams.has(param)) {
          this.paramsToApply.append(param, currentParams.get(param));
          logger.debug(`Found parameter to copy: ${param}=${currentParams.get(param)}`);
        }
      });
    } else {
      logger.debug("No specific parameters configured, will copy all parameters");
      currentParams.forEach((value, key) => {
        this.paramsToApply.append(key, value);
      });
    }
  }
  /**
   * Enhance all existing links on the page
   */
  enhanceLinks() {
    const links = document.querySelectorAll("a");
    logger.debug(`Found ${links.length} links on the page`);
    links.forEach((link) => {
      this.addClickListener(link);
    });
  }
  /**
   * Add click listener to a link
   */
  addClickListener(link) {
    if (link.dataset.utmEnhanced === "true") {
      return;
    }
    link.addEventListener("click", (_event) => {
      this.applyParamsToLink(link);
    });
    link.dataset.utmEnhanced = "true";
  }
  /**
   * Apply parameters to a specific link
   */
  applyParamsToLink(linkElement) {
    if (!linkElement || !linkElement.getAttribute) {
      logger.error("Invalid link element provided");
      return;
    }
    const href = linkElement.getAttribute("href");
    if (!href) return;
    if (this.shouldSkipLink(href)) {
      return;
    }
    if (this.isExternalLink(href)) {
      if (!this.config.applyToExternalLinks) {
        return;
      }
      if (this.isExcludedDomain(href)) {
        return;
      }
    }
    let url;
    try {
      url = new URL(href, window.location.origin);
    } catch (e) {
      logger.error("Invalid URL:", href);
      return;
    }
    const linkParams = new URLSearchParams(url.search);
    let paramsAdded = false;
    this.paramsToApply.forEach((value, key) => {
      if (!linkParams.has(key)) {
        linkParams.append(key, value);
        paramsAdded = true;
      }
    });
    if (paramsAdded) {
      url.search = linkParams.toString();
      linkElement.setAttribute("href", url.toString());
      logger.debug(`Updated link ${href} to ${url.toString()}`);
    }
  }
  /**
   * Check if link should be skipped
   */
  shouldSkipLink(href) {
    return href.startsWith("#") || href.startsWith("javascript:") || href.startsWith("mailto:") || href.startsWith("tel:") || href.startsWith("sms:") || href.startsWith("whatsapp:");
  }
  /**
   * Check if link is external
   */
  isExternalLink(href) {
    return href.includes("://") && !href.includes(window.location.hostname);
  }
  /**
   * Check if domain is excluded
   */
  isExcludedDomain(href) {
    if (!this.config.excludedDomains || this.config.excludedDomains.length === 0) {
      return false;
    }
    return this.config.excludedDomains.some((domain) => href.includes(domain));
  }
  /**
   * Observe DOM for new links
   */
  observeNewLinks() {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node;
            if (element.tagName === "A") {
              this.addClickListener(element);
            }
            const links = element.querySelectorAll("a");
            links.forEach((link) => {
              this.addClickListener(link);
            });
          }
        });
      });
    });
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
  /**
   * Get current configuration
   */
  getConfig() {
    return { ...this.config };
  }
  /**
   * Update configuration
   */
  updateConfig(config) {
    this.config = { ...this.config, ...config };
  }
}
const UtmTransfer$1 = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  UtmTransfer
});
class GlobalErrorHandler {
  constructor() {
    this.logger = new Logger("ErrorHandler");
    this.initialized = false;
    this.isHandlingError = false;
  }
  initialize() {
    if (this.initialized) return;
    window.addEventListener("error", (event) => {
      this.handleError(event.error, {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      });
    });
    window.addEventListener("unhandledrejection", (event) => {
      this.handleError(event.reason, {
        type: "unhandledRejection",
        promise: event.promise
      });
    });
    const originalConsoleError = console.error;
    console.error = (...args) => {
      originalConsoleError.apply(console, args);
      if (this.isHandlingError) return;
      const firstArg = args[0];
      if (firstArg instanceof Error) {
        this.handleError(firstArg, { source: "console.error" });
      } else if (typeof firstArg === "string" && firstArg.toLowerCase().includes("error")) {
        this.handleError(new Error(firstArg), {
          source: "console.error",
          additionalArgs: args.slice(1)
        });
      }
    };
    this.initialized = true;
    this.logger.debug("Global error handler initialized");
  }
  handleError(error, context) {
    if (!error) return;
    if (this.isHandlingError) return;
    try {
      this.isHandlingError = true;
      const errorObj = error instanceof Error ? error : new Error(String(error));
      const enrichedContext = {
        ...context,
        sdk: {
          version: "0.2.0",
          timestamp: (/* @__PURE__ */ new Date()).toISOString(),
          url: window.location.href,
          userAgent: navigator.userAgent
        }
      };
      this.logger.error("Captured error:", errorObj, enrichedContext);
      EventBus.getInstance().emit("error:occurred", {
        message: errorObj.message,
        code: errorObj.name,
        details: enrichedContext
      });
    } finally {
      this.isHandlingError = false;
    }
  }
  captureMessage(_message, _level = "info") {
  }
  addBreadcrumb(_breadcrumb) {
  }
}
const errorHandler = new GlobalErrorHandler();
const errorHandler$1 = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  errorHandler
});
class DebugEventManager {
  constructor() {
    this.eventLog = [];
    this.maxEvents = 100;
    this.initializeEventCapture();
  }
  initializeEventCapture() {
    const events = [
      "next:cart-updated",
      "next:checkout-step",
      "next:item-added",
      "next:item-removed",
      "next:timer-expired",
      "next:validation-error",
      "next:payment-success",
      "next:payment-error"
    ];
    events.forEach((eventType) => {
      document.addEventListener(eventType, (e) => {
        this.logEvent(eventType.replace("next:", ""), e.detail, "CustomEvent");
      });
    });
    this.interceptFetch();
  }
  interceptFetch() {
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const url = args[0].toString();
      if (url.includes("29next.com") || url.includes("campaigns.")) {
        this.logEvent("api-request", {
          url,
          method: args[1]?.method || "GET"
        }, "API");
      }
      return originalFetch.apply(window, args);
    };
  }
  logEvent(type, data, source) {
    this.eventLog.push({
      timestamp: /* @__PURE__ */ new Date(),
      type,
      data,
      source
    });
    if (this.eventLog.length > this.maxEvents) {
      this.eventLog.shift();
    }
  }
  getEvents(limit) {
    const events = limit ? this.eventLog.slice(-limit) : this.eventLog;
    return events.reverse();
  }
  clearEvents() {
    this.eventLog = [];
  }
  exportEvents() {
    return JSON.stringify(this.eventLog, null, 2);
  }
}
class EnhancedDebugUI {
  static createOverlayHTML(panels, activePanel, isExpanded, activePanelTab) {
    const activePanelData = panels.find((p) => p.id === activePanel);
    return `
      <div class="enhanced-debug-overlay ${isExpanded ? "expanded" : "collapsed"}">
        ${this.createBottomBar(isExpanded)}
        ${isExpanded ? this.createExpandedContent(panels, activePanelData, activePanel, activePanelTab) : ""}
      </div>
    `;
  }
  static createBottomBar(isExpanded) {
    return `
      <div class="debug-bottom-bar">
        <div class="debug-logo-section">
          ${this.get29NextLogo()}
          <span class="debug-title">Debug Tools</span>
          <div class="debug-status">
            <div class="status-indicator active"></div>
            <span class="status-text">Active</span>
          </div>
        </div>
        
        <div class="debug-quick-stats">
          <div class="stat-item">
            <span class="stat-value" data-debug-stat="cart-items">0</span>
            <span class="stat-label">Items</span>
          </div>
          <div class="stat-item">
            <span class="stat-value" data-debug-stat="cart-total">$0.00</span>
            <span class="stat-label">Total</span>
          </div>
          <div class="stat-item">
            <span class="stat-value" data-debug-stat="enhanced-elements">0</span>
            <span class="stat-label">Enhanced</span>
          </div>
        </div>

        <div class="debug-controls">
          <button class="debug-control-btn" data-action="toggle-mini-cart" title="Toggle Mini Cart">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17,18C15.89,18 15,18.89 15,20A2,2 0 0,0 17,22A2,2 0 0,0 19,20C19,18.89 18.1,18 17,18M1,2V4H3L6.6,11.59L5.24,14.04C5.09,14.32 5,14.65 5,15A2,2 0 0,0 7,17H19V15H7.42A0.25,0.25 0 0,1 7.17,14.75C7.17,14.7 7.18,14.66 7.2,14.63L8.1,13H15.55C16.3,13 16.96,12.58 17.3,11.97L20.88,5.5C20.95,5.34 21,5.17 21,5A1,1 0 0,0 20,4H5.21L4.27,2M7,18C5.89,18 5,18.89 5,20A2,2 0 0,0 7,22A2,2 0 0,0 9,20C9,18.89 8.1,18 7,18Z"/>
            </svg>
          </button>
          <button class="debug-control-btn" data-action="clear-cart" title="Clear Cart">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
            </svg>
          </button>
          <button class="debug-control-btn" data-action="toggle-xray" title="Toggle X-Ray View">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M5 3C3.89 3 3 3.9 3 5V19C3 20.11 3.89 21 5 21H19C20.11 21 21 20.11 21 19V5C21 3.9 20.11 3 19 3H5M5 5H19V19H5V5M7 7V9H9V7H7M11 7V9H13V7H11M15 7V9H17V7H15M7 11V13H9V11H7M11 11V13H13V11H11M15 11V13H17V11H15M7 15V17H9V15H7M11 15V17H13V15H11M15 15V17H17V15H15Z"/>
            </svg>
          </button>
          <button class="debug-control-btn" data-action="export-data" title="Export Debug Data">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M5,20H19V18H5M19,9H15V3H9V9H5L12,16L19,9Z"/>
            </svg>
          </button>
          <button class="debug-expand-btn" data-action="toggle-expand" title="${isExpanded ? "Collapse" : "Expand"}">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" class="expand-icon ${isExpanded ? "rotated" : ""}">
              <path d="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z"/>
            </svg>
          </button>
          <button class="debug-control-btn close-btn" data-action="close" title="Close Debug Tools">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"/>
            </svg>
          </button>
        </div>
      </div>
    `;
  }
  static createExpandedContent(panels, activePanel, activePanelId, activePanelTab) {
    return `
      <div class="debug-expanded-content">
        <div class="debug-sidebar">
          ${this.createPanelTabs(panels, activePanelId)}
        </div>
        
        <div class="debug-main-content">
          ${this.createPanelContent(activePanel, activePanelTab)}
        </div>
      </div>
    `;
  }
  static createPanelTabs(panels, activePanel) {
    return `
      <div class="debug-panel-tabs">
        ${panels.map((panel) => `
          <button class="debug-panel-tab ${panel.id === activePanel ? "active" : ""}" 
                  data-panel="${panel.id}">
            <span class="tab-icon">${panel.icon}</span>
            <span class="tab-label">${panel.title}</span>
            ${panel.id === "events" ? '<div class="tab-badge" data-debug-badge="events">0</div>' : ""}
          </button>
        `).join("")}
      </div>
    `;
  }
  static createPanelContent(activePanel, activePanelTab) {
    if (!activePanel) return "";
    const tabs = activePanel.getTabs?.() || [];
    const hasHorizontalTabs = tabs.length > 0;
    if (hasHorizontalTabs) {
      const activeTabId = activePanelTab || tabs[0]?.id;
      const activeTab = tabs.find((tab) => tab.id === activeTabId) || tabs[0];
      return `
        <div class="debug-panel-container">
          <div class="panel-header">
            <div class="panel-title">
              <span class="panel-icon">${activePanel.icon}</span>
              <h2>${activePanel.title}</h2>
            </div>
            ${activePanel.getActions ? `
              <div class="panel-actions">
                ${activePanel.getActions().map((action) => `
                  <button class="panel-action-btn ${action.variant || "primary"}" 
                          data-panel-action="${action.label}">
                    ${action.label}
                  </button>
                `).join("")}
              </div>
            ` : ""}
          </div>
          
          <div class="panel-horizontal-tabs">
            ${tabs.map((tab) => `
              <button class="horizontal-tab ${tab.id === activeTabId ? "active" : ""}" 
                      data-panel-tab="${tab.id}">
                ${tab.icon ? `<span class="tab-icon">${tab.icon}</span>` : ""}
                <span class="tab-label">${tab.label}</span>
              </button>
            `).join("")}
          </div>
          
          <div class="panel-content">
            ${activeTab ? activeTab.getContent() : ""}
          </div>
        </div>
      `;
    }
    return `
      <div class="debug-panel-container">
        <div class="panel-header">
          <div class="panel-title">
            <span class="panel-icon">${activePanel.icon}</span>
            <h2>${activePanel.title}</h2>
          </div>
          ${activePanel.getActions ? `
            <div class="panel-actions">
              ${activePanel.getActions().map((action) => `
                <button class="panel-action-btn ${action.variant || "primary"}" 
                        data-panel-action="${action.label}">
                  ${action.label}
                </button>
              `).join("")}
            </div>
          ` : ""}
        </div>
        <div class="panel-content">
          ${activePanel.getContent()}
        </div>
      </div>
    `;
  }
  static get29NextLogo() {
    return `
      <svg class="debug-logo" width="32" height="32" viewBox="0 0 518.2 99" fill="none">
        <g>
          <path d="M17.5,0c3.4,0,6.8,1,9.6,2.9l58.8,40v12.6L20.7,12.6c-1-0.6-2.1-1-3.2-1c-3.2,0-5.8,2.6-5.8,5.8v64c0,3.2,2.6,5.8,5.8,5.8h3.1V99h-3.1C7.8,99,0,91.2,0,81.5v-64C0,7.8,7.8,0,17.5,0z" fill="currentColor"/>
          <path d="M95.4,99c-3.4,0-6.8-1-9.6-2.9L27,56.1V43.5l65.2,42.8c1,0.6,2.1,1,3.2,1c3.2,0,5.8-2.6,5.8-5.8v-64c0-3.2-2.6-5.8-5.8-5.8h-3.1V0h3.1c9.7,0,17.5,7.8,17.5,17.5v64C112.9,91.2,105.1,99,95.4,99z" fill="currentColor"/>
        </g>
        <g>
          <path d="M161.1,69.5c1.9-1.9,3.8-3.5,5.9-4.9l10.1-7.5c4.4-3.2,7.9-6.6,10.4-10.2c2.5-3.7,3.8-7.8,3.8-12.5c0-4.6-1-8.7-3.2-12.2c-2.2-3.5-5.2-6.3-9.2-8.3s-8.8-3-14.3-3c-4.8,0-9.1,1-12.9,2.9c-3.8,1.9-6.9,4.4-9.2,7.5c-2.4,3.1-3.9,6.5-4.6,10.1l15,2.6c0.4-1.7,1.1-3.3,2.2-4.7c1.1-1.5,2.4-2.6,4.1-3.5c1.7-0.9,3.6-1.3,5.7-1.3c2.5,0,4.6,0.4,6.3,1.3c1.7,0.9,3,2.1,3.9,3.6c0.9,1.5,1.3,3.2,1.3,5.1c0,1.5-0.4,3.1-1.3,4.7c-0.9,1.6-2,3.1-3.4,4.5c-1.4,1.4-2.8,2.6-4.4,3.7L156,55.6c-3.1,2.1-5.7,4.5-8,7c-2.2,2.6-4,5.1-5.3,7.6s-1.9,4.8-1.9,6.9l0.1,0.1V88h51.5V75h-35.2C158.3,73,159.6,71.1,161.1,69.5z" fill="currentColor"/>
          <path d="M248.3,20.8c-2.2-3.2-5.1-5.7-8.6-7.6c-3.5-1.9-7.8-2.8-12.8-2.8c-5.3,0-10,1-14.2,3.1c-4,2.1-7.1,5-9.3,8.6c-2.2,3.6-3.3,7.8-3.3,12.6c0,4.9,1,9.2,3.1,13c2,3.8,4.9,6.8,8.6,9.1s7.9,3.4,12.6,3.4c4.7,0,8.8-1.2,12.2-3.6c1.7-1.2,3.2-2.6,4.5-4.2c-0.4,6.9-1.8,12.2-4.2,15.9c-3.1,4.9-7.5,7.4-13,7.4c-2.1,0-4.4-0.3-6.9-1.1c-2.5-0.8-4.9-1.9-7.2-3.4L202.7,82c3,2.1,6.4,3.7,10.1,4.9c3.7,1.2,7.5,1.8,11.4,1.8c5.4,0,10-1.1,13.8-3.4s7-5.4,9.4-9.3c2.5-3.9,4.3-8.4,5.5-13.6c1.2-5.2,1.8-10.7,1.8-16.5c0-4.9-0.5-9.5-1.5-13.8C252.2,27.8,250.5,24,248.3,20.8z M237.6,41.9c-1.1,1.9-2.6,3.4-4.4,4.5c-1.9,1.1-4,1.6-6.3,1.6c-2.4,0-4.5-0.5-6.3-1.6c-1.9-1-3.3-2.6-4.4-4.5c-1.1-1.9-1.6-4.1-1.6-6.6s0.5-4.6,1.6-6.5c1.1-1.8,2.6-3.3,4.4-4.4c1.9-1.1,4-1.6,6.3-1.6c2.4,0,4.5,0.5,6.3,1.6c1.8,1,3.3,2.5,4.4,4.4c1.1,1.9,1.6,4,1.6,6.5S238.7,40,237.6,41.9z" fill="currentColor"/>
        </g>
      </svg>
    `;
  }
  static addStyles() {
    console.log("Debug styles loaded via CSS modules");
  }
  static removeStyles() {
    console.log("Debug styles will be cleaned up by DebugStyleLoader");
  }
}
function generateXrayStyles() {
  return `
    /* X-RAY WIREFRAME CSS - PURE CSS, NO JS */

    /* Subtle outlines for all data attributes */
    [data-next-display],
    [data-next-show],
    [data-next-checkout],
    [data-next-selector-id],
    [data-next-cart-selector],
    [data-next-selection-mode],
    [data-next-shipping-id],
    [data-next-selector-card],
    [data-next-package-id],
    [data-next-quantity],
    [data-next-selected],
    [data-next-await],
    [data-next-in-cart],
    [data-next-express-checkout],
    [data-next-payment-method],
    [data-next-checkout-field],
    [data-next-payment-form] {
      position: relative !important;
      outline: 1px dashed rgba(0, 0, 0, 0.3) !important;
      outline-offset: -1px !important;
    }

    /* Color coding for different attribute types */
    [data-next-display] {
      outline-color: #4ecdc4 !important;
    }

    [data-next-show] {
      outline-color: #ffe66d !important;
    }

    [data-next-checkout] {
      outline-color: #ff6b6b !important;
    }

    [data-next-selector-id] {
      outline-color: #a8e6cf !important;
    }

    [data-next-selector-card] {
      outline-color: #95e1d3 !important;
    }

    [data-next-in-cart] {
      outline-color: #c7ceea !important;
    }

    [data-next-selected] {
      outline-color: #ffa502 !important;
    }

    [data-next-package-id] {
      outline-color: #ff8b94 !important;
    }

    /* Small corner labels */
    [data-next-selector-id]::before {
      content: attr(data-next-selector-id) !important;
      position: absolute !important;
      top: 2px !important;
      right: 2px !important;
      background: rgba(168, 230, 207, 0.9) !important;
      color: #333 !important;
      padding: 2px 4px !important;
      font-size: 9px !important;
      font-family: monospace !important;
      line-height: 1 !important;
      border-radius: 2px !important;
      pointer-events: none !important;
      z-index: 10 !important;
    }

    [data-next-package-id]::before {
      content: "PKG " attr(data-next-package-id) !important;
      position: absolute !important;
      top: 2px !important;
      left: 2px !important;
      background: rgba(255, 139, 148, 0.9) !important;
      color: white !important;
      padding: 2px 4px !important;
      font-size: 9px !important;
      font-family: monospace !important;
      font-weight: bold !important;
      line-height: 1 !important;
      border-radius: 2px !important;
      pointer-events: none !important;
      z-index: 10 !important;
    }

    /* Special highlighting for active states */
    [data-next-selected="true"] {
      outline-width: 2px !important;
      outline-style: solid !important;
    }

    [data-next-in-cart="true"] {
      background-color: rgba(199, 206, 234, 0.1) !important;
    }

    /* Hover tooltips */
    [data-next-display]:hover::after,
    [data-next-show]:hover::after,
    [data-next-selector-card]:hover::after {
      position: absolute !important;
      z-index: 99999 !important;
      pointer-events: none !important;
      font-family: monospace !important;
      font-size: 10px !important;
      padding: 4px 6px !important;
      border-radius: 3px !important;
      white-space: nowrap !important;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2) !important;
      bottom: 100% !important;
      left: 0 !important;
      margin-bottom: 4px !important;
    }

    [data-next-display]:hover::after {
      content: "display: " attr(data-next-display) !important;
      background: #4ecdc4 !important;
      color: white !important;
    }

    [data-next-show]:hover::after {
      content: "show: " attr(data-next-show) !important;
      background: #ffe66d !important;
      color: #333 !important;
    }

    [data-next-selector-card]:hover::after {
      content: "pkg:" attr(data-next-package-id) " | selected:" attr(data-next-selected) " | in-cart:" attr(data-next-in-cart) !important;
      background: #95e1d3 !important;
      color: #333 !important;
    }
  `;
}
const _XrayManager = class _XrayManager {
  static initialize() {
    const savedState = localStorage.getItem(this.STORAGE_KEY);
    if (savedState === "true") {
      this.activate();
    }
  }
  static toggle() {
    if (this.isActive) {
      this.deactivate();
    } else {
      this.activate();
    }
    return this.isActive;
  }
  static activate() {
    if (this.isActive) return;
    this.styleElement = document.createElement("style");
    this.styleElement.id = "debug-xray-styles";
    this.styleElement.textContent = generateXrayStyles();
    document.head.appendChild(this.styleElement);
    document.body.classList.add("debug-xray-active");
    this.isActive = true;
    localStorage.setItem(this.STORAGE_KEY, "true");
    console.log("🔍 X-Ray mode activated");
  }
  static deactivate() {
    if (!this.isActive) return;
    if (this.styleElement) {
      this.styleElement.remove();
      this.styleElement = null;
    }
    document.body.classList.remove("debug-xray-active");
    this.isActive = false;
    localStorage.setItem(this.STORAGE_KEY, "false");
    console.log("🔍 X-Ray mode deactivated");
  }
  static isXrayActive() {
    return this.isActive;
  }
};
_XrayManager.styleElement = null;
_XrayManager.isActive = false;
_XrayManager.STORAGE_KEY = "debug-xray-active";
let XrayManager = _XrayManager;
class CartPanel {
  constructor() {
    this.id = "cart";
    this.title = "Cart State";
    this.icon = "🛒";
  }
  getContent() {
    const tabs = this.getTabs();
    return tabs[0]?.getContent() || "";
  }
  getTabs() {
    return [
      {
        id: "overview",
        label: "Overview",
        icon: "📊",
        getContent: () => this.getOverviewContent()
      },
      {
        id: "items",
        label: "Items",
        icon: "📦",
        getContent: () => this.getItemsContent()
      },
      {
        id: "raw",
        label: "Raw Data",
        icon: "🔧",
        getContent: () => this.getRawDataContent()
      }
    ];
  }
  getOverviewContent() {
    const cartState = useCartStore.getState();
    return `
      <div class="enhanced-panel">
        <div class="metrics-grid">
          <div class="metric-card">
            <div class="metric-icon">📦</div>
            <div class="metric-content">
              <div class="metric-value">${cartState.items.length}</div>
              <div class="metric-label">Unique Items</div>
            </div>
          </div>
          <div class="metric-card">
            <div class="metric-icon">🔢</div>
            <div class="metric-content">
              <div class="metric-value">${cartState.totalQuantity}</div>
              <div class="metric-label">Total Quantity</div>
            </div>
          </div>
          <div class="metric-card">
            <div class="metric-icon">💰</div>
            <div class="metric-content">
              <div class="metric-value">${cartState.totals.subtotal.formatted}</div>
              <div class="metric-label">Subtotal</div>
            </div>
          </div>
          <div class="metric-card">
            <div class="metric-icon">🚚</div>
            <div class="metric-content">
              <div class="metric-value">${cartState.totals.shipping.formatted}</div>
              <div class="metric-label">Shipping</div>
            </div>
          </div>
          <div class="metric-card">
            <div class="metric-icon">📊</div>
            <div class="metric-content">
              <div class="metric-value">${cartState.totals.tax.formatted}</div>
              <div class="metric-label">Tax</div>
            </div>
          </div>
          <div class="metric-card">
            <div class="metric-icon">💳</div>
            <div class="metric-content">
              <div class="metric-value">${cartState.totals.total.formatted}</div>
              <div class="metric-label">Total</div>
            </div>
          </div>
        </div>
      </div>
    `;
  }
  getItemsContent() {
    const cartState = useCartStore.getState();
    return `
      <div class="enhanced-panel">
        <div class="section">
          ${cartState.items.length === 0 ? `
            <div class="empty-state">
              <div class="empty-icon">🛒</div>
              <div class="empty-text">Cart is empty</div>
              <button class="empty-action" onclick="window.nextDebug.addTestItems()">Add Test Items</button>
            </div>
          ` : `
            <div class="cart-items-list">
              ${cartState.items.map((item) => `
                <div class="cart-item-card">
                  <div class="item-info">
                    <div class="item-title">${item.title}</div>
                    <div class="item-details">
                      Package ID: ${item.packageId} • Price: $${item.price}
                    </div>
                  </div>
                  <div class="item-quantity">
                    <button onclick="window.nextDebug.updateQuantity(${item.packageId}, ${item.quantity - 1})" 
                            class="qty-btn">-</button>
                    <span class="qty-value">${item.quantity}</span>
                    <button onclick="window.nextDebug.updateQuantity(${item.packageId}, ${item.quantity + 1})" 
                            class="qty-btn">+</button>
                  </div>
                  <div class="item-total">$${(item.price * item.quantity).toFixed(2)}</div>
                  <button onclick="window.nextDebug.removeItem(${item.packageId})" 
                          class="remove-btn">×</button>
                </div>
              `).join("")}
            </div>
          `}
        </div>
      </div>
    `;
  }
  getRawDataContent() {
    const cartState = useCartStore.getState();
    return `
      <div class="enhanced-panel">
        <div class="section">
          <div class="json-viewer">
            <pre><code>${JSON.stringify(cartState, null, 2)}</code></pre>
          </div>
        </div>
      </div>
    `;
  }
  getActions() {
    return [
      {
        label: "Clear Cart",
        action: () => useCartStore.getState().clear(),
        variant: "danger"
      },
      {
        label: "Add Test Items",
        action: this.addTestItems,
        variant: "secondary"
      },
      {
        label: "Recalculate",
        action: () => useCartStore.getState().calculateTotals(),
        variant: "primary"
      },
      {
        label: "Export Cart",
        action: this.exportCart,
        variant: "secondary"
      }
    ];
  }
  addTestItems() {
    const cartStore = useCartStore.getState();
    const testItems = [
      { packageId: 999, quantity: 1, price: 19.99, title: "Debug Test Item 1", isUpsell: false },
      { packageId: 998, quantity: 2, price: 29.99, title: "Debug Test Item 2", isUpsell: false },
      { packageId: 997, quantity: 1, price: 9.99, title: "Debug Test Item 3", isUpsell: false }
    ];
    testItems.forEach((item) => cartStore.addItem(item));
  }
  exportCart() {
    const cartState = useCartStore.getState();
    const data = JSON.stringify(cartState, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cart-state-${(/* @__PURE__ */ new Date()).toISOString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }
}
class EventsPanel {
  constructor(events) {
    this.events = events;
    this.id = "events";
    this.title = "Event Timeline";
    this.icon = "📋";
  }
  getContent() {
    const tabs = this.getTabs();
    return tabs[0]?.getContent() || "";
  }
  getTabs() {
    return [
      {
        id: "overview",
        label: "Overview",
        icon: "📊",
        getContent: () => this.getOverviewContent()
      },
      {
        id: "timeline",
        label: "Timeline",
        icon: "⏰",
        getContent: () => this.getTimelineContent()
      },
      {
        id: "analytics",
        label: "Analytics",
        icon: "📈",
        getContent: () => this.getAnalyticsContent()
      }
    ];
  }
  getOverviewContent() {
    const eventTypes = [...new Set(this.events.map((e) => e.type))];
    return `
      <div class="enhanced-panel">
        <div class="metrics-grid">
          <div class="metric-card">
            <div class="metric-icon">📊</div>
            <div class="metric-content">
              <div class="metric-value">${this.events.length}</div>
              <div class="metric-label">Total Events</div>
            </div>
          </div>
          <div class="metric-card">
            <div class="metric-icon">🎯</div>
            <div class="metric-content">
              <div class="metric-value">${eventTypes.length}</div>
              <div class="metric-label">Event Types</div>
            </div>
          </div>
          <div class="metric-card">
            <div class="metric-icon">⏱️</div>
            <div class="metric-content">
              <div class="metric-value">${this.getEventsPerMinute()}</div>
              <div class="metric-label">Events/min</div>
            </div>
          </div>
        </div>

        <div class="section">
          <h3 class="section-title">Event Types</h3>
          <div class="event-types">
            ${eventTypes.map((type) => {
      const count = this.events.filter((e) => e.type === type).length;
      return `
                <div class="event-type-card" onclick="window.nextDebug.filterEvents('${type}')">
                  <div class="event-type-name">${type}</div>
                  <div class="event-type-count">${count}</div>
                </div>
              `;
    }).join("")}
          </div>
        </div>
      </div>
    `;
  }
  getTimelineContent() {
    const recentEvents = this.events.slice(0, 30);
    return `
      <div class="enhanced-panel">
        <div class="section">
          <div class="events-timeline">
            ${recentEvents.length === 0 ? `
              <div class="empty-state">
                <div class="empty-icon">📋</div>
                <div class="empty-text">No events logged yet</div>
              </div>
            ` : recentEvents.map((event) => `
              <div class="timeline-event">
                <div class="event-time">${event.timestamp.toLocaleTimeString()}</div>
                <div class="event-content">
                  <div class="event-header">
                    <span class="event-type-badge">${event.type}</span>
                    <span class="event-source">${event.source}</span>
                  </div>
                  <div class="event-data-preview">
                    ${this.formatEventData(event.data)}
                  </div>
                </div>
              </div>
            `).join("")}
          </div>
        </div>
      </div>
    `;
  }
  getAnalyticsContent() {
    const eventTypes = [...new Set(this.events.map((e) => e.type))];
    const sourceStats = this.getSourceStatistics();
    return `
      <div class="enhanced-panel">
        <div class="section">
          <h3 class="section-title">Event Distribution</h3>
          <div class="analytics-charts">
            ${eventTypes.map((type) => {
      const count = this.events.filter((e) => e.type === type).length;
      const percentage = this.events.length > 0 ? (count / this.events.length * 100).toFixed(1) : 0;
      return `
                <div class="analytics-bar">
                  <div class="bar-label">${type}</div>
                  <div class="bar-container">
                    <div class="bar-fill" style="width: ${percentage}%"></div>
                    <div class="bar-value">${count} (${percentage}%)</div>
                  </div>
                </div>
              `;
    }).join("")}
          </div>
        </div>
        
        <div class="section">
          <h3 class="section-title">Source Statistics</h3>
          <div class="source-stats">
            ${Object.entries(sourceStats).map(([source, count]) => `
              <div class="source-stat-item">
                <span class="source-name">${source}</span>
                <span class="source-count">${count}</span>
              </div>
            `).join("")}
          </div>
        </div>
      </div>
    `;
  }
  getActions() {
    return [
      {
        label: "Clear Events",
        action: () => this.clearEvents(),
        variant: "danger"
      },
      {
        label: "Export Timeline",
        action: () => this.exportEvents(),
        variant: "secondary"
      },
      {
        label: "Start Recording",
        action: () => this.startRecording(),
        variant: "primary"
      }
    ];
  }
  getEventsPerMinute() {
    const now = /* @__PURE__ */ new Date();
    const oneMinuteAgo = new Date(now.getTime() - 6e4);
    const recentEvents = this.events.filter((e) => e.timestamp > oneMinuteAgo);
    return recentEvents.length;
  }
  getSourceStatistics() {
    const stats = {};
    this.events.forEach((event) => {
      stats[event.source] = (stats[event.source] || 0) + 1;
    });
    return stats;
  }
  formatEventData(data) {
    if (typeof data === "object" && data !== null) {
      const keys = Object.keys(data);
      if (keys.length === 0) return "No data";
      if (keys.length === 1) {
        const firstKey = keys[0];
        return firstKey ? `${firstKey}: ${data[firstKey] || "undefined"}` : "No data";
      }
      return `${keys.slice(0, 2).join(", ")}${keys.length > 2 ? "..." : ""}`;
    }
    return String(data);
  }
  clearEvents() {
    this.events.length = 0;
    document.dispatchEvent(new CustomEvent("debug:update-content"));
  }
  exportEvents() {
    const data = JSON.stringify(this.events, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `debug-events-${(/* @__PURE__ */ new Date()).toISOString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }
  startRecording() {
    console.log("Event recording started");
  }
}
class EventTimelinePanel {
  constructor() {
    this.id = "event-timeline";
    this.title = "Events";
    this.icon = "⚡";
    this.events = [];
    this.maxEvents = 1e3;
    this.isRecording = true;
    this.filters = {
      types: /* @__PURE__ */ new Set(["dataLayer", "internal", "dom"]),
      sources: /* @__PURE__ */ new Set(),
      search: "",
      timeRange: 30
      // last 30 minutes
    };
    this.startTime = Date.now();
    this.eventBus = EventBus.getInstance();
    this.initializeEventWatching();
  }
  initializeEventWatching() {
    this.watchDataLayer();
    this.watchInternalEvents();
    this.watchDOMEvents();
    this.watchPerformanceEvents();
  }
  watchDataLayer() {
    if (typeof window === "undefined") return;
    window.dataLayer = window.dataLayer || [];
    const originalPush = window.dataLayer.push;
    window.dataLayer.push = (...args) => {
      if (this.isRecording) {
        args.forEach((event) => {
          let source = "GTM DataLayer";
          if (event.event && event.event.startsWith("gtm_")) {
            source = "GTM Internal";
          } else if (event.timestamp || event.event_context) {
            source = "Analytics Manager";
          }
          this.addEvent({
            type: "dataLayer",
            name: event.event || "dataLayer.push",
            data: event,
            source
          });
        });
      }
      return originalPush.apply(window.dataLayer, args);
    };
    if (window.dataLayer.length > 0) {
      window.dataLayer.forEach((event, index2) => {
        if (typeof event === "object" && event.event) {
          this.addEvent({
            type: "dataLayer",
            name: event.event,
            data: event,
            source: "GTM DataLayer (existing)",
            timestamp: this.startTime + index2 * 10
            // Approximate timing
          });
        }
      });
    }
  }
  watchInternalEvents() {
    const internalEvents = [
      "cart:updated",
      "cart:item-added",
      "cart:item-removed",
      "cart:quantity-changed",
      "campaign:loaded",
      "checkout:started",
      "checkout:form-initialized",
      "order:completed",
      "payment:tokenized",
      "payment:error",
      "coupon:applied",
      "coupon:removed",
      "upsell:added",
      "upsell:skipped",
      "config:updated",
      "error:occurred"
    ];
    internalEvents.forEach((eventName) => {
      this.eventBus.on(eventName, (data) => {
        if (this.isRecording) {
          this.addEvent({
            type: "internal",
            name: eventName,
            data,
            source: "SDK Internal"
          });
        }
      });
    });
  }
  watchDOMEvents() {
    if (typeof document === "undefined") return;
    const domEvents = [
      "next:initialized",
      "next:cart-updated",
      "next:item-added",
      "next:item-removed",
      "next:checkout-started",
      "next:payment-success",
      "next:payment-error",
      "next:timer-expired",
      "next:coupon-applied",
      "next:display-ready"
    ];
    domEvents.forEach((eventName) => {
      document.addEventListener(eventName, (event) => {
        if (this.isRecording) {
          const customEvent = event;
          this.addEvent({
            type: "dom",
            name: eventName,
            data: customEvent.detail,
            source: "DOM CustomEvent"
          });
        }
      });
    });
  }
  watchPerformanceEvents() {
    if (typeof window === "undefined" || !window.performance) return;
    const originalMark = performance.mark;
    const originalMeasure = performance.measure;
    const self = this;
    performance.mark = function(name) {
      const result = originalMark.call(performance, name);
      if (self.isRecording) {
        self.addEvent({
          type: "performance",
          name: `mark: ${name}`,
          data: { markName: name, timestamp: performance.now() },
          source: "Performance API"
        });
      }
      return result;
    };
    performance.measure = function(name, startMark, endMark) {
      const result = originalMeasure.call(performance, name, startMark, endMark);
      if (self.isRecording) {
        self.addEvent({
          type: "performance",
          name: `measure: ${name}`,
          data: { measureName: name, startMark, endMark },
          source: "Performance API"
        });
      }
      return result;
    };
  }
  addEvent(eventData) {
    const now = Date.now();
    const event = {
      id: `event_${now}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: eventData.timestamp || now,
      type: eventData.type || "internal",
      name: eventData.name || "unknown",
      data: eventData.data || {},
      source: eventData.source || "Unknown",
      relativeTime: this.formatRelativeTime(eventData.timestamp || now)
    };
    this.events.unshift(event);
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(0, this.maxEvents);
    }
    if (event.source && event.source !== "Unknown") {
      this.filters.sources.add(event.source);
    }
    if (typeof document !== "undefined") {
      const activeElement = document.activeElement;
      const isUserTyping = activeElement && (activeElement.tagName === "INPUT" || activeElement.tagName === "SELECT");
      if (!isUserTyping) {
        setTimeout(() => {
          document.dispatchEvent(new CustomEvent("debug:update-content"));
        }, 100);
      }
    }
  }
  formatRelativeTime(timestamp) {
    const diff = Date.now() - timestamp;
    const seconds = Math.floor(diff / 1e3);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    if (hours > 0) return `${hours}h ${minutes % 60}m ago`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s ago`;
    if (seconds > 0) return `${seconds}s ago`;
    return "just now";
  }
  getFilteredEvents() {
    const cutoffTime = Date.now() - this.filters.timeRange * 60 * 1e3;
    return this.events.filter((event) => {
      if (event.timestamp < cutoffTime) return false;
      if (!this.filters.types.has(event.type)) return false;
      if (this.filters.sources.size > 0 && !this.filters.sources.has(event.source)) return false;
      if (this.filters.search) {
        const searchLower = this.filters.search.toLowerCase();
        return event.name.toLowerCase().includes(searchLower) || event.source.toLowerCase().includes(searchLower) || JSON.stringify(event.data).toLowerCase().includes(searchLower);
      }
      return true;
    });
  }
  // getEventIcon method removed - unused
  getEventTypeColor(type) {
    const colors = {
      dataLayer: "#4CAF50",
      // Green
      internal: "#2196F3",
      // Blue  
      dom: "#FF9800",
      // Orange
      performance: "#9C27B0"
      // Purple
    };
    return colors[type] || "#666";
  }
  getTabs() {
    return [
      {
        id: "timeline",
        label: "Events",
        icon: "📅",
        getContent: () => this.getTimelineContent()
      },
      {
        id: "analytics",
        label: "Stats",
        icon: "📊",
        getContent: () => this.getAnalyticsContent()
      },
      {
        id: "filters",
        label: "Filter",
        icon: "🔍",
        getContent: () => this.getFiltersContent()
      }
    ];
  }
  getTimelineContent() {
    const filteredEvents = this.getFilteredEvents();
    if (filteredEvents.length === 0) {
      return `<div style="padding: 20px; text-align: center; color: #666;">No events yet</div>`;
    }
    let eventsHtml = "";
    filteredEvents.slice(0, 20).forEach((event) => {
      eventsHtml += `
        <div style="border-bottom: 1px solid #333; padding: 8px; background: #1a1a1a;">
          <div style="font-weight: bold; color: ${this.getEventTypeColor(event.type)};">
            ${event.name} <span style="float: right; font-weight: normal; color: #999;">${event.relativeTime}</span>
          </div>
          <div style="color: #999; font-size: 11px; margin: 4px 0;">${event.source}</div>
          <div style="background: #2a2a2a; padding: 4px; border-radius: 3px; font-family: monospace; font-size: 10px; overflow: hidden; color: #ccc;">
            ${JSON.stringify(event.data).length > 100 ? JSON.stringify(event.data).substring(0, 100) + "..." : JSON.stringify(event.data)}
          </div>
        </div>
      `;
    });
    return `
      <div style="padding: 10px; border-bottom: 1px solid #444; background: #2a2a2a; color: #fff;">
        <strong>Total Events: ${this.events.length}</strong>
        <span style="float: right;">
          <button onclick="this.closest('.debug-panel').dispatchEvent(new CustomEvent('timeline-action', {detail: 'toggle'}))" style="margin-right: 5px; background: #444; color: #fff; border: 1px solid #666; padding: 4px 8px; cursor: pointer;">
            ${this.isRecording ? "Pause" : "Record"}
          </button>
          <button onclick="this.closest('.debug-panel').dispatchEvent(new CustomEvent('timeline-action', {detail: 'clear'}))" style="background: #444; color: #fff; border: 1px solid #666; padding: 4px 8px; cursor: pointer;">
            Clear
          </button>
        </span>
      </div>
      <div style="max-height: 300px; overflow-y: auto; background: #1a1a1a;">
        ${eventsHtml}
      </div>
    `;
  }
  getAnalyticsContent() {
    const stats = this.getEventStats();
    const typeDistribution = this.getTypeDistribution();
    return `
      <div style="padding: 15px; background: #1a1a1a; color: #fff;">
        <h4 style="color: #fff;">Event Statistics</h4>
        <p>Total Events: <strong>${stats.total}</strong></p>
        <p>Events Per Minute: <strong>${stats.eventsPerMinute}</strong></p>
        <p>Most Active Type: <strong>${stats.mostActiveType}</strong></p>
        
        <h4 style="margin-top: 20px; color: #fff;">Event Types</h4>
        ${Object.entries(typeDistribution).map(([type, count]) => `
          <p style="margin: 5px 0;">
            <span style="color: ${this.getEventTypeColor(type)};">${type}:</span> 
            <strong>${count}</strong>
          </p>
        `).join("")}
      </div>
    `;
  }
  getFiltersContent() {
    const availableTypes = ["dataLayer", "internal", "dom", "performance"];
    return `
      <div style="padding: 15px; background: #1a1a1a; color: #fff;">
        <h4 style="color: #fff;">Search Events</h4>
        <input type="text" 
               placeholder="Search event names or data..." 
               value="${this.filters.search || ""}"
               style="width: 100%; padding: 8px; margin-bottom: 15px; border: 1px solid #666; border-radius: 4px; background: #2a2a2a; color: #fff;">
        
        <h4 style="color: #fff;">Event Types</h4>
        ${availableTypes.map((type) => `
          <label style="display: block; margin: 8px 0; color: #fff;">
            <input type="checkbox" ${this.filters.types.has(type) ? "checked" : ""} style="margin-right: 8px;">
            ${type}
          </label>
        `).join("")}
        
        <h4 style="margin-top: 20px; color: #fff;">Time Range</h4>
        <select style="width: 100%; padding: 8px; border: 1px solid #666; border-radius: 4px; background: #2a2a2a; color: #fff;">
          <option value="5">Last 5 minutes</option>
          <option value="15">Last 15 minutes</option>
          <option value="30" selected>Last 30 minutes</option>
          <option value="60">Last hour</option>
        </select>
      </div>
    `;
  }
  getEventStats() {
    const now = Date.now();
    const oneMinuteAgo = now - 6e4;
    const recentEvents = this.events.filter((e) => e?.timestamp && e.timestamp > oneMinuteAgo);
    const typeCounts = this.events.reduce((acc, event) => {
      if (event?.type) {
        acc[event.type] = (acc[event.type] || 0) + 1;
      }
      return acc;
    }, {});
    const mostActiveType = Object.entries(typeCounts).sort(([, a], [, b]) => (b || 0) - (a || 0))[0]?.[0];
    return {
      total: this.events.length,
      eventsPerMinute: recentEvents.length,
      mostActiveType: mostActiveType || "None"
    };
  }
  getTypeDistribution() {
    return this.events.reduce((acc, event) => {
      if (event?.type) {
        acc[event.type] = (acc[event.type] || 0) + 1;
      }
      return acc;
    }, {});
  }
  getSourceDistribution() {
    return this.events.reduce((acc, event) => {
      if (event?.source) {
        acc[event.source] = (acc[event.source] || 0) + 1;
      }
      return acc;
    }, {});
  }
  // getTimelineChart method removed - unused
  getActions() {
    return [
      {
        label: this.isRecording ? "⏸️ Pause Recording" : "▶️ Start Recording",
        action: () => {
          this.isRecording = !this.isRecording;
          console.log(`Event recording ${this.isRecording ? "started" : "paused"}`);
        }
      },
      {
        label: "🗑️ Clear Events",
        action: () => {
          this.events = [];
          console.log("Event timeline cleared");
        }
      },
      {
        label: "💾 Export Events",
        action: () => this.exportEvents()
      },
      {
        label: "🧪 Test Events",
        action: () => this.generateTestEvents()
      }
    ];
  }
  exportEvents() {
    const exportData = {
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      totalEvents: this.events.length,
      filters: {
        types: Array.from(this.filters.types),
        sources: Array.from(this.filters.sources),
        search: this.filters.search,
        timeRange: this.filters.timeRange
      },
      events: this.events,
      stats: this.getEventStats(),
      typeDistribution: this.getTypeDistribution(),
      sourceDistribution: this.getSourceDistribution()
    };
    const data = JSON.stringify(exportData, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `event-timeline-${(/* @__PURE__ */ new Date()).toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }
  generateTestEvents() {
    const testEvents = [
      { type: "dataLayer", name: "add_to_cart", data: { item_id: "123", value: 29.99 }, source: "Test" },
      { type: "internal", name: "cart:updated", data: { itemCount: 2 }, source: "Test" },
      { type: "dom", name: "next:item-added", data: { packageId: 123 }, source: "Test" },
      { type: "performance", name: "navigation", data: { loadTime: 1234 }, source: "Test" }
    ];
    testEvents.forEach((event, index2) => {
      setTimeout(() => {
        this.addEvent(event);
      }, index2 * 200);
    });
    console.log("Generated test events for timeline");
  }
  getContent() {
    return this.getTimelineContent();
  }
}
class ConfigPanel {
  constructor() {
    this.id = "config";
    this.title = "Configuration";
    this.icon = "⚙️";
  }
  getContent() {
    const tabs = this.getTabs();
    return tabs[0]?.getContent() || "";
  }
  getTabs() {
    return [
      {
        id: "overview",
        label: "Overview",
        icon: "📊",
        getContent: () => this.getOverviewContent()
      },
      {
        id: "settings",
        label: "Settings",
        icon: "⚙️",
        getContent: () => this.getSettingsContent()
      },
      {
        id: "raw",
        label: "Raw Data",
        icon: "🔧",
        getContent: () => this.getRawDataContent()
      }
    ];
  }
  getOverviewContent() {
    const config = configStore.getState();
    return `
      <div class="enhanced-panel">
        <div class="metrics-grid">
          <div class="metric-card">
            <div class="metric-icon">🔧</div>
            <div class="metric-content">
              <div class="metric-value">${config.debug ? "ON" : "OFF"}</div>
              <div class="metric-label">Debug Mode</div>
            </div>
          </div>
          <div class="metric-card">
            <div class="metric-icon">🌍</div>
            <div class="metric-content">
              <div class="metric-value">${config.environment || "production"}</div>
              <div class="metric-label">Environment</div>
            </div>
          </div>
          <div class="metric-card">
            <div class="metric-icon">🔑</div>
            <div class="metric-content">
              <div class="metric-value">${config.apiKey ? "SET" : "MISSING"}</div>
              <div class="metric-label">API Key</div>
            </div>
          </div>
          <div class="metric-card">
            <div class="metric-icon">📋</div>
            <div class="metric-content">
              <div class="metric-value">${config.campaignId || "NONE"}</div>
              <div class="metric-label">Campaign ID</div>
            </div>
          </div>
        </div>
      </div>
    `;
  }
  getSettingsContent() {
    const config = configStore.getState();
    return `
      <div class="enhanced-panel">
        <div class="section">
          <div class="config-groups">
            <div class="config-group">
              <h4 class="config-group-title">Core Settings</h4>
              <div class="config-items">
                <div class="config-item">
                  <span class="config-key">Campaign ID:</span>
                  <span class="config-value">${config.campaignId || "Not set"}</span>
                </div>
                <div class="config-item">
                  <span class="config-key">API Key:</span>
                  <span class="config-value">${config.apiKey ? `${config.apiKey.substring(0, 8)}...` : "Not set"}</span>
                </div>
                <div class="config-item">
                  <span class="config-key">Environment:</span>
                  <span class="config-value">${config.environment || "production"}</span>
                </div>
                <div class="config-item">
                  <span class="config-key">Base URL:</span>
                  <span class="config-value">https://campaigns.apps.29next.com</span>
                </div>
              </div>
            </div>

            <div class="config-group">
              <h4 class="config-group-title">Feature Flags</h4>
              <div class="config-items">
                <div class="config-item">
                  <span class="config-key">Debug Mode:</span>
                  <span class="config-value ${config.debug ? "enabled" : "disabled"}">${config.debug ? "Enabled" : "Disabled"}</span>
                </div>
                <div class="config-item">
                  <span class="config-key">Test Mode:</span>
                  <span class="config-value ${config.testMode ?? false ? "enabled" : "disabled"}">${config.testMode ?? false ? "Enabled" : "Disabled"}</span>
                </div>
                <div class="config-item">
                  <span class="config-key">Analytics:</span>
                  <span class="config-value ${config.enableAnalytics ?? true ? "enabled" : "disabled"}">${config.enableAnalytics ?? true ? "Enabled" : "Disabled"}</span>
                </div>
                <div class="config-item">
                  <span class="config-key">Auto Initialize:</span>
                  <span class="config-value ${config.autoInit ?? true ? "enabled" : "disabled"}">${config.autoInit ?? true ? "Enabled" : "Disabled"}</span>
                </div>
              </div>
            </div>

            <div class="config-group">
              <h4 class="config-group-title">Performance</h4>
              <div class="config-items">
                <div class="config-item">
                  <span class="config-key">Rate Limit:</span>
                  <span class="config-value">${config.rateLimit ?? 4} req/sec</span>
                </div>
                <div class="config-item">
                  <span class="config-key">Cache TTL:</span>
                  <span class="config-value">${config.cacheTtl ?? 300}s</span>
                </div>
                <div class="config-item">
                  <span class="config-key">Retry Attempts:</span>
                  <span class="config-value">${config.retryAttempts ?? 3}</span>
                </div>
                <div class="config-item">
                  <span class="config-key">Timeout:</span>
                  <span class="config-value">${config.timeout ?? 1e4}ms</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }
  getRawDataContent() {
    const config = configStore.getState();
    return `
      <div class="enhanced-panel">
        <div class="section">
          <div class="json-viewer">
            <pre><code>${JSON.stringify(config, null, 2)}</code></pre>
          </div>
        </div>
      </div>
    `;
  }
  getActions() {
    return [
      {
        label: "Toggle Debug",
        action: () => this.toggleDebug(),
        variant: "primary"
      },
      {
        label: "Toggle Test Mode",
        action: () => this.toggleTestMode(),
        variant: "secondary"
      },
      {
        label: "Export Config",
        action: () => this.exportConfig(),
        variant: "secondary"
      },
      {
        label: "Reset Config",
        action: () => this.resetConfig(),
        variant: "danger"
      }
    ];
  }
  toggleDebug() {
    const configStore$12 = configStore.getState();
    configStore$12.updateConfig({ debug: !configStore$12.debug });
    document.dispatchEvent(new CustomEvent("debug:update-content"));
  }
  toggleTestMode() {
    const configStore$12 = configStore.getState();
    configStore$12.updateConfig({ testMode: !(configStore$12.testMode ?? false) });
    document.dispatchEvent(new CustomEvent("debug:update-content"));
  }
  exportConfig() {
    const config = configStore.getState();
    const data = JSON.stringify(config, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `next-config-${(/* @__PURE__ */ new Date()).toISOString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }
  resetConfig() {
    if (confirm("Are you sure you want to reset the configuration to defaults?")) {
      const configStore$12 = configStore.getState();
      configStore$12.reset();
      document.dispatchEvent(new CustomEvent("debug:update-content"));
    }
  }
}
class CheckoutPanel {
  constructor() {
    this.id = "checkout";
    this.title = "Checkout State";
    this.icon = "💳";
  }
  getContent() {
    const tabs = this.getTabs();
    return tabs[0]?.getContent() || "";
  }
  getTabs() {
    return [
      {
        id: "overview",
        label: "Overview",
        icon: "📊",
        getContent: () => this.getOverviewContent()
      },
      {
        id: "customer",
        label: "Customer Info",
        icon: "👤",
        getContent: () => this.getCustomerContent()
      },
      {
        id: "validation",
        label: "Validation",
        icon: "✅",
        getContent: () => this.getValidationContent()
      },
      {
        id: "raw",
        label: "Raw Data",
        icon: "🔧",
        getContent: () => this.getRawDataContent()
      }
    ];
  }
  getOverviewContent() {
    const checkoutState = useCheckoutStore.getState();
    return `
      <div class="enhanced-panel">
        <div class="metrics-grid">
          <div class="metric-card">
            <div class="metric-icon">📋</div>
            <div class="metric-content">
              <div class="metric-value">${checkoutState.step || "Not Started"}</div>
              <div class="metric-label">Current Step</div>
            </div>
          </div>
          <div class="metric-card">
            <div class="metric-icon">${checkoutState.isProcessing ? "⏳" : "✅"}</div>
            <div class="metric-content">
              <div class="metric-value">${checkoutState.isProcessing ? "PROCESSING" : "READY"}</div>
              <div class="metric-label">Form Status</div>
            </div>
          </div>
          <div class="metric-card">
            <div class="metric-icon">🔒</div>
            <div class="metric-content">
              <div class="metric-value">${checkoutState.paymentMethod || "None"}</div>
              <div class="metric-label">Payment Method</div>
            </div>
          </div>
          <div class="metric-card">
            <div class="metric-icon">🚚</div>
            <div class="metric-content">
              <div class="metric-value">${checkoutState.shippingMethod?.name || "None"}</div>
              <div class="metric-label">Shipping Method</div>
            </div>
          </div>
        </div>

        <div class="section">
          <h3 class="section-title">Form Fields Status</h3>
          <div class="form-fields-grid">
            ${this.renderFormFields(checkoutState)}
          </div>
        </div>
        
        <div class="section">
          <h3 class="section-title">Current Form Data</h3>
          <div class="form-data-summary">
            ${Object.keys(checkoutState.formData).length > 0 ? Object.entries(checkoutState.formData).map(([key, value]) => `
                <div class="form-field-row">
                  <span class="field-name">${this.formatFieldName(key)}</span>
                  <span class="field-value">${value || "Empty"}</span>
                </div>
              `).join("") : '<div class="empty-state">No form data yet</div>'}
          </div>
        </div>
      </div>
    `;
  }
  getCustomerContent() {
    const checkoutState = useCheckoutStore.getState();
    const formData = checkoutState.formData;
    const hasFormData = Object.keys(formData).length > 0;
    return `
      <div class="enhanced-panel">
        <div class="section">
          <div class="customer-info">
            ${hasFormData ? `
              <div class="info-card">
                <h4>Contact Information</h4>
                <div class="info-row">
                  <span class="info-label">Email:</span>
                  <span class="info-value">${formData.email || "Not provided"}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Phone:</span>
                  <span class="info-value">${formData.phone || "Not provided"}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Name:</span>
                  <span class="info-value">${formData.fname || ""} ${formData.lname || ""}</span>
                </div>
              </div>
              
              <div class="info-card">
                <h4>Shipping Address</h4>
                <div class="address-info">
                  ${formData.address1 ? `
                    <div class="info-row">
                      <span class="info-label">Address:</span>
                      <span class="info-value">${formData.address1}</span>
                    </div>
                    ${formData.address2 ? `
                      <div class="info-row">
                        <span class="info-label">Address 2:</span>
                        <span class="info-value">${formData.address2}</span>
                      </div>
                    ` : ""}
                    <div class="info-row">
                      <span class="info-label">City:</span>
                      <span class="info-value">${formData.city || "Not provided"}</span>
                    </div>
                    <div class="info-row">
                      <span class="info-label">State/Province:</span>
                      <span class="info-value">${formData.province || "Not provided"}</span>
                    </div>
                    <div class="info-row">
                      <span class="info-label">Postal Code:</span>
                      <span class="info-value">${formData.postal || "Not provided"}</span>
                    </div>
                    <div class="info-row">
                      <span class="info-label">Country:</span>
                      <span class="info-value">${formData.country || "Not provided"}</span>
                    </div>
                  ` : '<div class="info-empty">Not provided</div>'}
                </div>
              </div>

              <div class="info-card">
                <h4>Billing Address</h4>
                <div class="address-info">
                  ${checkoutState.sameAsShipping ? `
                    <div class="info-same">Same as shipping address</div>
                  ` : checkoutState.billingAddress ? `
                    <div class="info-row">
                      <span class="info-label">Name:</span>
                      <span class="info-value">${checkoutState.billingAddress.first_name} ${checkoutState.billingAddress.last_name}</span>
                    </div>
                    <div class="info-row">
                      <span class="info-label">Address:</span>
                      <span class="info-value">${checkoutState.billingAddress.address1}</span>
                    </div>
                    <div class="info-row">
                      <span class="info-label">City:</span>
                      <span class="info-value">${checkoutState.billingAddress.city}, ${checkoutState.billingAddress.province} ${checkoutState.billingAddress.postal}</span>
                    </div>
                  ` : '<div class="info-empty">Not provided</div>'}
                </div>
              </div>
            ` : `
              <div class="empty-state">
                <div class="empty-icon">👤</div>
                <div class="empty-text">No customer information yet</div>
                <div class="empty-subtitle">Fill out the checkout form to see data here</div>
              </div>
            `}
          </div>
        </div>
      </div>
    `;
  }
  getValidationContent() {
    const checkoutState = useCheckoutStore.getState();
    return `
      <div class="enhanced-panel">
        <div class="section">
          <div class="validation-errors">
            ${checkoutState.errors && Object.keys(checkoutState.errors).length > 0 ? `
              ${Object.entries(checkoutState.errors).map(([field, error]) => `
                <div class="error-item">
                  <span class="error-field">${field}:</span>
                  <span class="error-message">${error}</span>
                </div>
              `).join("")}
            ` : `
              <div class="empty-state">
                <div class="empty-icon">✅</div>
                <div class="empty-text">No validation errors</div>
              </div>
            `}
          </div>
        </div>
      </div>
    `;
  }
  getRawDataContent() {
    const checkoutState = useCheckoutStore.getState();
    return `
      <div class="enhanced-panel">
        <div class="section">
          <div class="json-viewer">
            <pre><code>${JSON.stringify(checkoutState, null, 2)}</code></pre>
          </div>
        </div>
      </div>
    `;
  }
  getActions() {
    return [
      {
        label: "Fill Test Data",
        action: () => this.fillTestData(),
        variant: "primary"
      },
      {
        label: "Validate Form",
        action: () => this.validateForm(),
        variant: "secondary"
      },
      {
        label: "Clear Errors",
        action: () => this.clearErrors(),
        variant: "secondary"
      },
      {
        label: "Reset Checkout",
        action: () => this.resetCheckout(),
        variant: "danger"
      },
      {
        label: "Export State",
        action: () => this.exportState(),
        variant: "secondary"
      }
    ];
  }
  renderFormFields(checkoutState) {
    const requiredFields = [
      "email",
      "fname",
      "lname",
      "address1",
      "city",
      "province",
      "postal",
      "phone",
      "country"
    ];
    return requiredFields.map((field) => {
      const hasValue = this.hasFieldValue(checkoutState, field);
      const hasError = checkoutState.errors && checkoutState.errors[field];
      return `
        <div class="field-status-card ${hasValue ? "filled" : "empty"} ${hasError ? "error" : ""}">
          <div class="field-name">${this.formatFieldName(field)}</div>
          <div class="field-status">
            ${hasValue ? "✅" : "⏳"}
            ${hasError ? " ❌" : ""}
          </div>
        </div>
      `;
    }).join("");
  }
  hasFieldValue(checkoutState, field) {
    if (checkoutState.formData && checkoutState.formData[field]) {
      return checkoutState.formData[field].toString().trim().length > 0;
    }
    if (checkoutState.billingAddress && checkoutState.billingAddress[field]) {
      return checkoutState.billingAddress[field].toString().trim().length > 0;
    }
    return false;
  }
  formatFieldName(field) {
    const fieldNames = {
      fname: "First Name",
      lname: "Last Name",
      email: "Email",
      phone: "Phone",
      address1: "Address",
      address2: "Address 2",
      city: "City",
      province: "State/Province",
      postal: "Postal Code",
      country: "Country",
      accepts_marketing: "Accepts Marketing"
    };
    return fieldNames[field] || field.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase()).trim();
  }
  fillTestData() {
    const checkoutStore2 = useCheckoutStore.getState();
    const testFormData = {
      email: "test@test.com",
      fname: "Test",
      lname: "Order",
      phone: "+14807581224",
      address1: "Test Address 123",
      address2: "",
      city: "Tempe",
      province: "AZ",
      postal: "85281",
      country: "US",
      accepts_marketing: false
    };
    checkoutStore2.clearAllErrors();
    checkoutStore2.updateFormData(testFormData);
    checkoutStore2.setPaymentMethod("credit-card");
    checkoutStore2.setSameAsShipping(true);
    checkoutStore2.setShippingMethod({
      id: 1,
      name: "Standard Shipping",
      price: 0,
      code: "standard"
    });
    console.log("✅ Test data filled successfully");
    document.dispatchEvent(new CustomEvent("debug:update-content"));
    setTimeout(() => {
      document.dispatchEvent(new CustomEvent("checkout:test-data-filled", {
        detail: testFormData
      }));
    }, 100);
  }
  validateForm() {
    const checkoutStore2 = useCheckoutStore.getState();
    const formData = checkoutStore2.formData;
    const requiredFields = ["email", "fname", "lname", "address1", "city", "country"];
    let hasErrors = false;
    checkoutStore2.clearAllErrors();
    requiredFields.forEach((field) => {
      if (!formData[field] || formData[field].toString().trim() === "") {
        checkoutStore2.setError(field, `${this.formatFieldName(field)} is required`);
        hasErrors = true;
      }
    });
    if (!hasErrors) {
      console.log("✅ Form validation passed");
    }
    document.dispatchEvent(new CustomEvent("debug:update-content"));
  }
  clearErrors() {
    const checkoutStore2 = useCheckoutStore.getState();
    checkoutStore2.clearAllErrors();
    document.dispatchEvent(new CustomEvent("debug:update-content"));
  }
  resetCheckout() {
    if (confirm("Are you sure you want to reset the checkout state?")) {
      const checkoutStore2 = useCheckoutStore.getState();
      checkoutStore2.reset();
      document.dispatchEvent(new CustomEvent("debug:update-content"));
    }
  }
  exportState() {
    const checkoutState = useCheckoutStore.getState();
    const data = JSON.stringify(checkoutState, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `checkout-state-${(/* @__PURE__ */ new Date()).toISOString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }
}
class StoragePanel {
  constructor() {
    this.id = "storage";
    this.title = "Storage";
    this.icon = "💾";
  }
  getContent() {
    const tabs = this.getTabs();
    return tabs[0]?.getContent() || "";
  }
  getTabs() {
    return [
      {
        id: "overview",
        label: "Overview",
        icon: "📊",
        getContent: () => this.getOverviewContent()
      },
      {
        id: "next-data",
        label: "Next Data",
        icon: "🏷️",
        getContent: () => this.getNextContent()
      },
      {
        id: "local-storage",
        label: "Local Storage",
        icon: "💾",
        getContent: () => this.getLocalStorageContent()
      },
      {
        id: "session-storage",
        label: "Session Storage",
        icon: "⏰",
        getContent: () => this.getSessionStorageContent()
      }
    ];
  }
  getOverviewContent() {
    const localStorage2 = this.getLocalStorageData();
    const sessionStorage2 = this.getSessionStorageData();
    return `
      <div class="enhanced-panel">
        <div class="metrics-grid">
          <div class="metric-card">
            <div class="metric-icon">💾</div>
            <div class="metric-content">
              <div class="metric-value">${localStorage2.length}</div>
              <div class="metric-label">LocalStorage Items</div>
            </div>
          </div>
          <div class="metric-card">
            <div class="metric-icon">⏰</div>
            <div class="metric-content">
              <div class="metric-value">${sessionStorage2.length}</div>
              <div class="metric-label">SessionStorage Items</div>
            </div>
          </div>
          <div class="metric-card">
            <div class="metric-icon">📊</div>
            <div class="metric-content">
              <div class="metric-value">${this.getStorageSize()}KB</div>
              <div class="metric-label">Total Size</div>
            </div>
          </div>
          <div class="metric-card">
            <div class="metric-icon">🏷️</div>
            <div class="metric-content">
              <div class="metric-value">${this.getNextItems().length}</div>
              <div class="metric-label">Next Items</div>
            </div>
          </div>
        </div>
      </div>
    `;
  }
  getNextContent() {
    return `
      <div class="enhanced-panel">
        <div class="section">
          <div class="storage-items">
            ${this.getNextItems().length === 0 ? `
              <div class="empty-state">
                <div class="empty-icon">💾</div>
                <div class="empty-text">No Next storage items found</div>
              </div>
            ` : `
              ${this.getNextItems().map((item) => `
                <div class="storage-item-card next-item">
                  <div class="storage-item-header">
                    <span class="storage-key">${item.key}</span>
                    <span class="storage-type ${item.type}">${item.type}</span>
                    <button class="storage-delete-btn" onclick="window.nextDebug.deleteStorageItem('${item.key}', '${item.type}')">×</button>
                  </div>
                  <div class="storage-item-size">${item.size} bytes</div>
                  <div class="storage-item-value">
                    <pre><code>${item.formattedValue}</code></pre>
                  </div>
                </div>
              `).join("")}
            `}
          </div>
        </div>
      </div>
    `;
  }
  getLocalStorageContent() {
    const localStorage2 = this.getLocalStorageData();
    return `
      <div class="enhanced-panel">
        <div class="section">
          <div class="storage-items">
            ${localStorage2.length === 0 ? `
              <div class="empty-state">
                <div class="empty-icon">💾</div>
                <div class="empty-text">No localStorage items</div>
              </div>
            ` : `
              ${localStorage2.map((item) => `
                <div class="storage-item-card ${item.key.includes("next") ? "next-item" : ""}">
                  <div class="storage-item-header">
                    <span class="storage-key">${item.key}</span>
                    <span class="storage-type local">local</span>
                    <button class="storage-delete-btn" onclick="window.nextDebug.deleteStorageItem('${item.key}', 'local')">×</button>
                  </div>
                  <div class="storage-item-size">${item.size} bytes</div>
                  <div class="storage-item-value">
                    <pre><code>${item.formattedValue}</code></pre>
                  </div>
                </div>
              `).join("")}
            `}
          </div>
        </div>
      </div>
    `;
  }
  getSessionStorageContent() {
    const sessionStorage2 = this.getSessionStorageData();
    return `
      <div class="enhanced-panel">
        <div class="section">
          <div class="storage-items">
            ${sessionStorage2.length === 0 ? `
              <div class="empty-state">
                <div class="empty-icon">⏰</div>
                <div class="empty-text">No sessionStorage items</div>
              </div>
            ` : `
              ${sessionStorage2.map((item) => `
                <div class="storage-item-card ${item.key.includes("next") ? "next-item" : ""}">
                  <div class="storage-item-header">
                    <span class="storage-key">${item.key}</span>
                    <span class="storage-type session">session</span>
                    <button class="storage-delete-btn" onclick="window.nextDebug.deleteStorageItem('${item.key}', 'session')">×</button>
                  </div>
                  <div class="storage-item-size">${item.size} bytes</div>
                  <div class="storage-item-value">
                    <pre><code>${item.formattedValue}</code></pre>
                  </div>
                </div>
              `).join("")}
            `}
          </div>
        </div>
      </div>
    `;
  }
  getActions() {
    return [
      {
        label: "Clear Next Data",
        action: () => this.clearNextStorage(),
        variant: "danger"
      },
      {
        label: "Clear All Local",
        action: () => this.clearLocalStorage(),
        variant: "danger"
      },
      {
        label: "Clear All Session",
        action: () => this.clearSessionStorage(),
        variant: "danger"
      },
      {
        label: "Export Storage",
        action: () => this.exportStorage(),
        variant: "secondary"
      }
    ];
  }
  getLocalStorageData() {
    const items = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        const value = localStorage.getItem(key) || "";
        items.push({
          key,
          value,
          size: new Blob([value]).size,
          formattedValue: this.formatValue(value)
        });
      }
    }
    return items.sort((a, b) => a.key.localeCompare(b.key));
  }
  getSessionStorageData() {
    const items = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key) {
        const value = sessionStorage.getItem(key) || "";
        items.push({
          key,
          value,
          size: new Blob([value]).size,
          formattedValue: this.formatValue(value)
        });
      }
    }
    return items.sort((a, b) => a.key.localeCompare(b.key));
  }
  getNextItems() {
    const items = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.includes("next") || key.includes("29next") || key.includes("campaign"))) {
        const value = localStorage.getItem(key) || "";
        items.push({
          key,
          value,
          size: new Blob([value]).size,
          formattedValue: this.formatValue(value),
          type: "local"
        });
      }
    }
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key && (key.includes("next") || key.includes("29next") || key.includes("campaign"))) {
        const value = sessionStorage.getItem(key) || "";
        items.push({
          key,
          value,
          size: new Blob([value]).size,
          formattedValue: this.formatValue(value),
          type: "session"
        });
      }
    }
    return items.sort((a, b) => a.key.localeCompare(b.key));
  }
  formatValue(value) {
    try {
      const parsed = JSON.parse(value);
      return JSON.stringify(parsed, null, 2);
    } catch {
      if (value.length > 200) {
        return value.substring(0, 200) + "...";
      }
      return value;
    }
  }
  getStorageSize() {
    let total = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        const value = localStorage.getItem(key) || "";
        total += new Blob([key + value]).size;
      }
    }
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key) {
        const value = sessionStorage.getItem(key) || "";
        total += new Blob([key + value]).size;
      }
    }
    return Math.round(total / 1024);
  }
  clearNextStorage() {
    if (confirm("Are you sure you want to clear all Next storage data?")) {
      const nextItems = this.getNextItems();
      nextItems.forEach((item) => {
        if (item.type === "local") {
          localStorage.removeItem(item.key);
        } else {
          sessionStorage.removeItem(item.key);
        }
      });
      document.dispatchEvent(new CustomEvent("debug:update-content"));
    }
  }
  clearLocalStorage() {
    if (confirm("Are you sure you want to clear ALL localStorage data?")) {
      localStorage.clear();
      document.dispatchEvent(new CustomEvent("debug:update-content"));
    }
  }
  clearSessionStorage() {
    if (confirm("Are you sure you want to clear ALL sessionStorage data?")) {
      sessionStorage.clear();
      document.dispatchEvent(new CustomEvent("debug:update-content"));
    }
  }
  exportStorage() {
    const data = {
      localStorage: this.getLocalStorageData(),
      sessionStorage: this.getSessionStorageData(),
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `storage-data-${(/* @__PURE__ */ new Date()).toISOString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }
}
class EnhancedCampaignPanel {
  constructor() {
    this.id = "campaign";
    this.title = "Campaign Data";
    this.icon = "📊";
  }
  getContent() {
    const tabs = this.getTabs();
    return tabs[0]?.getContent() || "";
  }
  getTabs() {
    return [
      {
        id: "overview",
        label: "Overview",
        icon: "📊",
        getContent: () => this.getOverviewContent()
      },
      {
        id: "packages",
        label: "Packages",
        icon: "📦",
        getContent: () => this.getPackagesContent()
      },
      {
        id: "shipping",
        label: "Shipping",
        icon: "🚚",
        getContent: () => this.getShippingContent()
      },
      {
        id: "raw",
        label: "Raw Data",
        icon: "🔧",
        getContent: () => this.getRawDataContent()
      }
    ];
  }
  getOverviewContent() {
    const campaignState = useCampaignStore.getState();
    const campaignData = campaignState.data;
    if (!campaignData) {
      return `
        <div class="enhanced-panel">
          <div class="empty-state">
            <div class="empty-icon">📊</div>
            <div class="empty-text">No campaign data loaded</div>
            <button class="empty-action" onclick="window.nextDebug.loadCampaign()">Load Campaign</button>
          </div>
        </div>
      `;
    }
    return `
      <div class="enhanced-panel">
        ${this.getCampaignOverview(campaignData)}
      </div>
    `;
  }
  getPackagesContent() {
    const campaignState = useCampaignStore.getState();
    const cartState = useCartStore.getState();
    const campaignData = campaignState.data;
    if (!campaignData) {
      return `
        <div class="enhanced-panel">
          <div class="empty-state">
            <div class="empty-icon">📦</div>
            <div class="empty-text">No campaign data loaded</div>
          </div>
        </div>
      `;
    }
    return `
      <div class="enhanced-panel">
        ${this.getPackagesSection(campaignData.packages, cartState)}
      </div>
    `;
  }
  getShippingContent() {
    const campaignState = useCampaignStore.getState();
    const campaignData = campaignState.data;
    if (!campaignData) {
      return `
        <div class="enhanced-panel">
          <div class="empty-state">
            <div class="empty-icon">🚚</div>
            <div class="empty-text">No campaign data loaded</div>
          </div>
        </div>
      `;
    }
    return `
      <div class="enhanced-panel">
        ${this.getShippingMethodsSection(campaignData.shipping_methods)}
      </div>
    `;
  }
  getRawDataContent() {
    const campaignState = useCampaignStore.getState();
    const campaignData = campaignState.data;
    if (!campaignData) {
      return `
        <div class="enhanced-panel">
          <div class="empty-state">
            <div class="empty-icon">🔧</div>
            <div class="empty-text">No campaign data loaded</div>
          </div>
        </div>
      `;
    }
    return `
      <div class="enhanced-panel">
        <div class="section">
          <div class="json-viewer">
            <pre><code>${JSON.stringify(campaignData, null, 2)}</code></pre>
          </div>
        </div>
      </div>
    `;
  }
  getCampaignOverview(data) {
    return `
      <div class="campaign-overview">
        <div class="campaign-header">
          <h2 class="campaign-name">${data.name}</h2>
          <div class="campaign-badges">
            <span class="campaign-badge currency">${data.currency}</span>
            <span class="campaign-badge language">${data.language.toUpperCase()}</span>
          </div>
        </div>
        
        <div class="metrics-grid">
          <div class="metric-card">
            <div class="metric-icon">📦</div>
            <div class="metric-content">
              <div class="metric-value">${data.packages.length}</div>
              <div class="metric-label">Total Packages</div>
            </div>
          </div>
          <div class="metric-card">
            <div class="metric-icon">🚚</div>
            <div class="metric-content">
              <div class="metric-value">${data.shipping_methods.length}</div>
              <div class="metric-label">Shipping Methods</div>
            </div>
          </div>
          <div class="metric-card">
            <div class="metric-icon">🔄</div>
            <div class="metric-content">
              <div class="metric-value">${data.packages.filter((p) => p.is_recurring).length}</div>
              <div class="metric-label">Recurring Items</div>
            </div>
          </div>
          <div class="metric-card">
            <div class="metric-icon">💰</div>
            <div class="metric-content">
              <div class="metric-value">${this.getPriceRange(data.packages)}</div>
              <div class="metric-label">Price Range</div>
            </div>
          </div>
        </div>
      </div>
    `;
  }
  getPackagesSection(packages, cartState) {
    return `
      <div class="section">
        <div class="section-header">
          <h3 class="section-title">Available Packages</h3>
          <div class="section-controls">
            <button class="sort-btn" onclick="window.nextDebug.sortPackages('price')">Sort by Price</button>
            <button class="sort-btn" onclick="window.nextDebug.sortPackages('name')">Sort by Name</button>
          </div>
        </div>
        
        <div class="packages-grid">
          ${packages.map((pkg) => this.getPackageCard(pkg, cartState)).join("")}
        </div>
      </div>
    `;
  }
  getPackageCard(pkg, cartState) {
    const isInCart = cartState.items.some((item) => item.packageId === pkg.ref_id);
    const cartItem = cartState.items.find((item) => item.packageId === pkg.ref_id);
    const savings = parseFloat(pkg.price_retail_total) - parseFloat(pkg.price_total);
    const savingsPercent = Math.round(savings / parseFloat(pkg.price_retail_total) * 100);
    return `
      <div class="package-card ${isInCart ? "in-cart" : ""}" data-package-id="${pkg.ref_id}">
        <div class="package-image-container">
          <img src="${pkg.image}" alt="${pkg.name}" class="package-image" loading="lazy" />
          ${pkg.is_recurring ? '<div class="recurring-badge">🔄 Recurring</div>' : ""}
          ${isInCart ? `<div class="cart-badge">In Cart (${cartItem?.quantity || 0})</div>` : ""}
        </div>
        
        <div class="package-info">
          <div class="package-header">
            <h4 class="package-name">${pkg.name}</h4>
            <div class="package-id">ID: ${pkg.ref_id}</div>
          </div>
          
          <div class="package-details">
            <div class="package-qty">Quantity: ${pkg.qty}</div>
            <div class="package-external-id">External ID: ${pkg.external_id}</div>
          </div>
          
          <div class="package-pricing">
            <div class="price-row">
              <span class="price-label">Sale Price:</span>
              <span class="price-value sale-price">$${pkg.price_total}</span>
            </div>
            ${pkg.price_retail_total !== pkg.price_total ? `
              <div class="price-row">
                <span class="price-label">Retail Price:</span>
                <span class="price-value retail-price">$${pkg.price_retail_total}</span>
              </div>
              <div class="savings">
                Save $${savings.toFixed(2)} (${savingsPercent}%)
              </div>
            ` : ""}
            
            ${pkg.is_recurring && pkg.price_recurring ? `
              <div class="recurring-pricing">
                <div class="price-row recurring">
                  <span class="price-label">Recurring:</span>
                  <span class="price-value recurring-price">
                    $${pkg.price_recurring_total}/${pkg.interval}
                  </span>
                </div>
              </div>
            ` : ""}
          </div>
          
          <div class="package-actions">
            ${isInCart ? `
              <button class="package-btn remove-btn" onclick="window.nextDebug.removeFromCart(${pkg.ref_id})">
                Remove from Cart
              </button>
              <div class="qty-controls">
                <button onclick="window.nextDebug.updateQuantity(${pkg.ref_id}, ${(cartItem?.quantity || 1) - 1})">-</button>
                <span>${cartItem?.quantity || 0}</span>
                <button onclick="window.nextDebug.updateQuantity(${pkg.ref_id}, ${(cartItem?.quantity || 1) + 1})">+</button>
              </div>
            ` : `
              <button class="package-btn add-btn" onclick="window.nextDebug.addToCart(${pkg.ref_id})">
                Add to Cart - $${pkg.price_total}
              </button>
            `}
            <button class="package-btn inspect-btn" onclick="window.nextDebug.inspectPackage(${pkg.ref_id})">
              Inspect
            </button>
          </div>
        </div>
      </div>
    `;
  }
  getShippingMethodsSection(shippingMethods) {
    return `
      <div class="section">
        <h3 class="section-title">Shipping Methods</h3>
        
        <div class="shipping-methods">
          ${shippingMethods.map((method) => `
            <div class="shipping-method-card">
              <div class="shipping-info">
                <div class="shipping-name">${method.code}</div>
                <div class="shipping-id">ID: ${method.ref_id}</div>
              </div>
              <div class="shipping-price">
                ${parseFloat(method.price) === 0 ? "FREE" : `$${method.price}`}
              </div>
              <button class="shipping-test-btn" onclick="window.nextDebug.testShippingMethod(${method.ref_id})">
                Test
              </button>
            </div>
          `).join("")}
        </div>
      </div>
    `;
  }
  getPriceRange(packages) {
    const prices = packages.map((p) => parseFloat(p.price_total)).filter((p) => p > 0);
    if (prices.length === 0) return "Free";
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    if (min === max) return `$${min}`;
    return `$${min} - $${max}`;
  }
  getActions() {
    return [
      {
        label: "Refresh Campaign",
        action: () => {
          const configStore$12 = configStore.getState();
          const campaignStore2 = useCampaignStore.getState();
          if (configStore$12.apiKey) {
            campaignStore2.loadCampaign(configStore$12.apiKey);
          } else {
            console.error("No API key available to load campaign");
          }
        },
        variant: "primary"
      },
      {
        label: "Export Packages",
        action: () => this.exportPackages(),
        variant: "secondary"
      },
      {
        label: "Test All Packages",
        action: () => this.testAllPackages(),
        variant: "secondary"
      },
      {
        label: "Clear Cart",
        action: () => useCartStore.getState().clear(),
        variant: "danger"
      }
    ];
  }
  exportPackages() {
    const campaignState = useCampaignStore.getState();
    const data = campaignState.data;
    if (!data) return;
    const exportData = {
      campaign: data.name,
      packages: data.packages,
      shipping_methods: data.shipping_methods,
      export_date: (/* @__PURE__ */ new Date()).toISOString()
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `campaign-packages-${data.name.toLowerCase().replace(/\s+/g, "-")}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }
  testAllPackages() {
    const campaignState = useCampaignStore.getState();
    const cartStore = useCartStore.getState();
    const data = campaignState.data;
    if (!data) return;
    data.packages.slice(0, 3).forEach((pkg) => {
      cartStore.addItem({
        packageId: pkg.ref_id,
        quantity: 1,
        title: pkg.name,
        isUpsell: false
      });
    });
  }
}
const _DebugOverlay = class _DebugOverlay {
  constructor() {
    this.visible = false;
    this.isExpanded = false;
    this.container = null;
    this.activePanel = "cart";
    this.updateInterval = null;
    this.logger = new Logger("DebugOverlay");
    this.panels = [];
    this.handleContainerClick = (event) => {
      const target = event.target;
      const action = target.getAttribute("data-action") || target.closest("[data-action]")?.getAttribute("data-action");
      if (action) {
        switch (action) {
          case "toggle-expand":
            this.isExpanded = !this.isExpanded;
            localStorage.setItem(_DebugOverlay.EXPANDED_STORAGE_KEY, this.isExpanded.toString());
            this.updateBodyHeight();
            this.updateOverlay();
            break;
          case "close":
            this.hide();
            break;
          case "clear-cart":
            this.clearCart();
            break;
          case "export-data":
            this.exportAllData();
            break;
          case "toggle-mini-cart":
            this.toggleMiniCart();
            break;
          case "toggle-xray":
            this.toggleXray();
            break;
        }
        return;
      }
      const panelTab = target.closest(".debug-panel-tab");
      if (panelTab) {
        const panelId = panelTab.getAttribute("data-panel");
        if (panelId && panelId !== this.activePanel) {
          this.activePanel = panelId;
          this.activePanelTab = void 0;
          this.updateOverlay();
        }
        return;
      }
      const horizontalTab = target.closest(".horizontal-tab");
      if (horizontalTab) {
        const tabId = horizontalTab.getAttribute("data-panel-tab");
        if (tabId && tabId !== this.activePanelTab) {
          this.activePanelTab = tabId;
          this.updateOverlay();
        }
        return;
      }
      const panelActionBtn = target.closest(".panel-action-btn");
      if (panelActionBtn) {
        const actionLabel = panelActionBtn.getAttribute("data-panel-action");
        const activePanel = this.panels.find((p) => p.id === this.activePanel);
        const panelAction = activePanel?.getActions?.()?.find((a) => a.label === actionLabel);
        if (panelAction) {
          panelAction.action();
          setTimeout(() => this.updateContent(), 100);
        }
        return;
      }
    };
    this.eventManager = new DebugEventManager();
    this.initializePanels();
    this.setupEventListeners();
    const savedExpandedState = localStorage.getItem(_DebugOverlay.EXPANDED_STORAGE_KEY);
    if (savedExpandedState === "true") {
      this.isExpanded = true;
    }
  }
  static getInstance() {
    if (!_DebugOverlay.instance) {
      _DebugOverlay.instance = new _DebugOverlay();
    }
    return _DebugOverlay.instance;
  }
  initializePanels() {
    this.panels = [
      new CartPanel(),
      new ConfigPanel(),
      new EnhancedCampaignPanel(),
      new CheckoutPanel(),
      new EventTimelinePanel(),
      new StoragePanel()
    ];
  }
  setupEventListeners() {
    document.addEventListener("debug:update-content", () => {
      this.updateContent();
    });
  }
  initialize() {
    const urlParams = new URLSearchParams(window.location.search);
    const isDebugMode = urlParams.get("debugger") === "true";
    if (isDebugMode) {
      this.show();
      this.logger.info("Debug overlay initialized");
    }
  }
  async show() {
    if (this.visible) return;
    this.visible = true;
    await this.createOverlay();
    this.startAutoUpdate();
    XrayManager.initialize();
    if (XrayManager.isXrayActive()) {
      const xrayButton = this.container?.querySelector('[data-action="toggle-xray"]');
      if (xrayButton) {
        xrayButton.classList.add("active");
        xrayButton.setAttribute("title", "Disable X-Ray View");
      }
    }
    const savedMiniCartState = localStorage.getItem("debug-mini-cart-visible");
    if (savedMiniCartState === "true") {
      this.toggleMiniCart();
    }
  }
  hide() {
    if (!this.visible) return;
    this.visible = false;
    this.stopAutoUpdate();
    document.body.classList.remove("debug-body-expanded");
    document.documentElement.classList.remove("debug-body-expanded");
    if (this.container) {
      this.container.remove();
      this.container = null;
    }
    EnhancedDebugUI.removeStyles();
  }
  async toggle() {
    if (this.visible) {
      this.hide();
    } else {
      await this.show();
    }
  }
  isVisible() {
    return this.visible;
  }
  async createOverlay() {
    const { DebugStyleLoader: DebugStyleLoader2 } = await Promise.resolve().then(() => DebugStyleLoader$1);
    await DebugStyleLoader2.loadDebugStyles();
    this.container = document.createElement("div");
    this.container.className = "debug-overlay";
    this.updateOverlay();
    this.addEventListeners();
    document.body.appendChild(this.container);
  }
  updateOverlay() {
    if (!this.container) return;
    this.panels = this.panels.map(
      (panel) => panel.id === "events" ? new EventsPanel(this.eventManager.getEvents()) : panel
    );
    this.container.innerHTML = EnhancedDebugUI.createOverlayHTML(
      this.panels,
      this.activePanel,
      this.isExpanded,
      this.activePanelTab
    );
    this.addEventListeners();
    this.updateButtonStates();
  }
  updateContent() {
    if (!this.container) return;
    const panelContent = this.container.querySelector(".panel-content");
    if (panelContent) {
      const activePanel = this.panels.find((p) => p.id === this.activePanel);
      if (activePanel) {
        const tabs = activePanel.getTabs?.() || [];
        if (tabs.length > 0) {
          const activeTabId = this.activePanelTab || tabs[0]?.id;
          const activeTab = tabs.find((tab) => tab.id === activeTabId) || tabs[0];
          if (activeTab) {
            panelContent.innerHTML = activeTab.getContent();
          }
        } else {
          panelContent.innerHTML = activePanel.getContent();
        }
      }
    }
  }
  addEventListeners() {
    if (!this.container) return;
    this.container.removeEventListener("click", this.handleContainerClick);
    this.container.addEventListener("click", this.handleContainerClick);
  }
  updateBodyHeight() {
    if (this.isExpanded) {
      document.body.classList.add("debug-body-expanded");
      document.documentElement.classList.add("debug-body-expanded");
    } else {
      document.body.classList.remove("debug-body-expanded");
      document.documentElement.classList.remove("debug-body-expanded");
    }
  }
  startAutoUpdate() {
    this.updateInterval = window.setInterval(() => {
      this.updateQuickStats();
      if (this.activePanel === "cart" || this.activePanel === "config") {
        this.updateContent();
      }
    }, 1e3);
  }
  stopAutoUpdate() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }
  // Public API for external access
  getEventManager() {
    return this.eventManager;
  }
  getPanels() {
    return this.panels;
  }
  setActivePanel(panelId) {
    if (this.panels.find((p) => p.id === panelId)) {
      this.activePanel = panelId;
      this.updateOverlay();
    }
  }
  logEvent(type, data, source = "Manual") {
    this.eventManager.logEvent(type, data, source);
  }
  // Enhanced debug methods for global access
  clearCart() {
    useCartStore.getState().clear();
    this.updateContent();
  }
  exportAllData() {
    const debugData = {
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      cart: useCartStore.getState(),
      config: configStore.getState(),
      events: this.eventManager.getEvents(),
      url: window.location.href,
      userAgent: navigator.userAgent
    };
    const data = JSON.stringify(debugData, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `debug-session-${(/* @__PURE__ */ new Date()).toISOString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }
  toggleMiniCart() {
    let miniCart = document.getElementById("debug-mini-cart-display");
    if (!miniCart) {
      miniCart = document.createElement("div");
      miniCart.id = "debug-mini-cart-display";
      miniCart.className = "debug-mini-cart-display";
      document.body.appendChild(miniCart);
      useCartStore.subscribe(() => {
        if (miniCart && miniCart.classList.contains("show")) {
          this.updateMiniCart();
        }
      });
      const savedState = localStorage.getItem("debug-mini-cart-visible");
      if (savedState === "true") {
        miniCart.classList.add("show");
        this.updateMiniCart();
      }
    } else {
      miniCart.classList.toggle("show");
      localStorage.setItem("debug-mini-cart-visible", miniCart.classList.contains("show").toString());
      if (miniCart.classList.contains("show")) {
        this.updateMiniCart();
      }
    }
    const cartButton = this.container?.querySelector('[data-action="toggle-mini-cart"]');
    if (cartButton && miniCart) {
      if (miniCart.classList.contains("show")) {
        cartButton.classList.add("active");
        cartButton.setAttribute("title", "Hide Mini Cart");
      } else {
        cartButton.classList.remove("active");
        cartButton.setAttribute("title", "Toggle Mini Cart");
      }
    }
  }
  updateMiniCart() {
    const miniCart = document.getElementById("debug-mini-cart-display");
    if (!miniCart || !miniCart.classList.contains("show")) return;
    const cartState = useCartStore.getState();
    if (!cartState.items || cartState.items.length === 0) {
      miniCart.innerHTML = `
        <div class="debug-mini-cart-header">
          <span>🛒 Debug Cart</span>
          <button class="mini-cart-close" onclick="document.getElementById('debug-mini-cart-display').classList.remove('show'); localStorage.setItem('debug-mini-cart-visible', 'false')">×</button>
        </div>
        <div class="debug-mini-cart-empty">Cart empty</div>
      `;
      return;
    }
    let itemsHtml = "";
    cartState.items.forEach((item) => {
      const isUpsell = item.is_upsell;
      const upsellBadge = isUpsell ? '<span class="mini-cart-upsell-badge">UPSELL</span>' : "";
      itemsHtml += `
        <div class="debug-mini-cart-item">
          <div class="mini-cart-item-info">
            <span class="mini-cart-item-id">ID: ${item.packageId}</span>
            ${upsellBadge}
            <span class="mini-cart-item-qty">×${item.quantity}</span>
          </div>
          <div class="mini-cart-item-title">${item.title || "Unknown"}</div>
          <div class="mini-cart-item-price">$${(item.price * item.quantity).toFixed(2)}</div>
        </div>
      `;
    });
    miniCart.innerHTML = `
      <div class="debug-mini-cart-header">
        <span>🛒 Debug Cart</span>
        <button class="mini-cart-close" onclick="document.getElementById('debug-mini-cart-display').classList.remove('show'); localStorage.setItem('debug-mini-cart-visible', 'false')">×</button>
      </div>
      <div class="debug-mini-cart-items">${itemsHtml}</div>
      <div class="debug-mini-cart-footer">
        <div class="mini-cart-stat">
          <span>Items:</span>
          <span>${cartState.totalQuantity}</span>
        </div>
        <div class="mini-cart-stat">
          <span>Total:</span>
          <span class="mini-cart-total">${cartState.totals.total.formatted}</span>
        </div>
      </div>
    `;
  }
  toggleXray() {
    const isActive = XrayManager.toggle();
    const xrayButton = this.container?.querySelector('[data-action="toggle-xray"]');
    if (xrayButton) {
      if (isActive) {
        xrayButton.classList.add("active");
        xrayButton.setAttribute("title", "Disable X-Ray View");
      } else {
        xrayButton.classList.remove("active");
        xrayButton.setAttribute("title", "Toggle X-Ray View");
      }
    }
    this.eventManager.logEvent("debug:xray-toggled", { active: isActive }, "Debug");
  }
  updateButtonStates() {
    if (XrayManager.isXrayActive()) {
      const xrayButton = this.container?.querySelector('[data-action="toggle-xray"]');
      if (xrayButton) {
        xrayButton.classList.add("active");
        xrayButton.setAttribute("title", "Disable X-Ray View");
      }
    }
    const miniCart = document.getElementById("debug-mini-cart-display");
    if (miniCart && miniCart.classList.contains("show")) {
      const cartButton = this.container?.querySelector('[data-action="toggle-mini-cart"]');
      if (cartButton) {
        cartButton.classList.add("active");
        cartButton.setAttribute("title", "Hide Mini Cart");
      }
    }
  }
  updateQuickStats() {
    if (!this.container) return;
    const cartState = useCartStore.getState();
    const cartItemsEl = this.container.querySelector('[data-debug-stat="cart-items"]');
    const cartTotalEl = this.container.querySelector('[data-debug-stat="cart-total"]');
    const enhancedElementsEl = this.container.querySelector('[data-debug-stat="enhanced-elements"]');
    if (cartItemsEl) cartItemsEl.textContent = cartState.totalQuantity.toString();
    if (cartTotalEl) cartTotalEl.textContent = cartState.totals.total.formatted;
    if (enhancedElementsEl) enhancedElementsEl.textContent = document.querySelectorAll("[data-next-]").length.toString();
  }
};
_DebugOverlay.EXPANDED_STORAGE_KEY = "debug-overlay-expanded";
let DebugOverlay = _DebugOverlay;
const debugOverlay = DebugOverlay.getInstance();
if (typeof window !== "undefined") {
  document.addEventListener("DOMContentLoaded", () => {
    debugOverlay.initialize();
  });
}
const DebugOverlay$1 = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  DebugOverlay,
  debugOverlay
});
createLogger("Analytics");
const analytics = /* @__PURE__ */ Object.freeze({
  __proto__: null
});
const baseCSS = ".enhanced-debug-overlay{position:fixed;bottom:0;left:0;right:0;z-index:999999;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,SF Pro Display,sans-serif;font-size:13px;line-height:1.4;color:#fff;transition:all .3s cubic-bezier(.4,0,.2,1);box-shadow:0 -4px 32px #0000004d}.enhanced-debug-overlay.collapsed{height:60px}.enhanced-debug-overlay.expanded{height:40vh;min-height:450px;max-height:calc(100vh - 120px)}body:has(.enhanced-debug-overlay.expanded){padding-bottom:40vh}.debug-body-expanded{padding-bottom:40vh!important;box-sizing:border-box}html.debug-body-expanded{overflow-x:hidden}.debug-bottom-bar{display:flex;align-items:center;justify-content:space-between;height:60px;background:linear-gradient(135deg,#1a1a1a,#2d2d2d);border-top:1px solid #3C7DFF;padding:0 20px;backdrop-filter:blur(20px)}.debug-logo-section{display:flex;align-items:center;gap:12px}.debug-logo{color:#3c7dff;filter:drop-shadow(0 0 8px rgba(60,125,255,.3))}.debug-title{font-weight:600;font-size:16px;color:#fff;letter-spacing:-.2px}.debug-status{display:flex;align-items:center;gap:6px;margin-left:12px;padding:4px 8px;background:#3c7dff1a;border-radius:12px;border:1px solid rgba(60,125,255,.2)}.status-indicator{width:6px;height:6px;border-radius:50%;background:#0f8;box-shadow:0 0 6px #0f8;animation:pulse 2s infinite}@keyframes pulse{0%,to{opacity:1}50%{opacity:.5}}.status-text{font-size:11px;color:#3c7dff;font-weight:500}.debug-quick-stats{display:flex;align-items:center;gap:24px}.stat-item{display:flex;flex-direction:column;align-items:center;gap:2px}.stat-value{font-size:16px;font-weight:700;color:#3c7dff;min-width:40px;text-align:center}.stat-label{font-size:10px;color:#888;text-transform:uppercase;font-weight:500;letter-spacing:.5px}.debug-controls{display:flex;align-items:center;gap:8px}.debug-control-btn,.debug-expand-btn{width:36px;height:36px;border:none;border-radius:8px;background:#ffffff1a;color:#fff;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .2s ease;position:relative;overflow:hidden}.debug-control-btn:hover,.debug-expand-btn:hover{background:#3c7dff33;transform:translateY(-1px);box-shadow:0 4px 12px #3c7dff4d}.debug-control-btn.active{background:#3c7dff4d;color:#87b4ff;box-shadow:inset 0 0 0 1px #3c7dff80}.debug-control-btn.active:hover{background:#3c7dff66}.debug-expand-btn{background:#3c7dff;color:#fff}.debug-expand-btn:hover{background:#2563eb;transform:translateY(-1px) scale(1.05)}.expand-icon{transition:transform .3s ease}.expand-icon.rotated{transform:rotate(180deg)}.close-btn:hover{background:#ff475733!important;color:#ff4757}.debug-expanded-content{display:flex;height:calc(100% - 60px);background:#1a1a1a}.debug-highlight{outline:2px solid #3C7DFF!important;outline-offset:2px!important;background:#3c7dff1a!important;position:relative!important;z-index:999998!important}.debug-highlight:after{content:attr(data-debug-label);position:absolute;top:-30px;left:0;background:#3c7dff;color:#fff;padding:4px 8px;border-radius:4px;font-size:11px;font-weight:500;white-space:nowrap;z-index:999999}@media (max-width: 768px){.debug-quick-stats{display:none}.debug-bottom-bar{padding:0 12px}}@media (max-width: 640px){.debug-title{display:none}}";
const sidebarCSS = '.debug-sidebar{width:240px;background:linear-gradient(180deg,#222,#1a1a1a);border-right:1px solid #333;display:flex;flex-direction:column}.debug-panel-tabs{flex:1;padding:16px 0}.debug-panel-tab{width:100%;display:flex;align-items:center;gap:12px;padding:12px 20px;border:none;background:none;color:#888;cursor:pointer;transition:all .2s ease;position:relative;font-size:14px}.debug-panel-tab:hover{background:#3c7dff1a;color:#fff}.debug-panel-tab.active{background:#3c7dff26;color:#3c7dff;border-right:3px solid #3C7DFF}.debug-panel-tab.active:before{content:"";position:absolute;left:0;top:0;bottom:0;width:3px;background:#3c7dff}.tab-icon{font-size:16px;width:20px;text-align:center}.tab-label{font-weight:500;flex:1}.tab-badge{background:#3c7dff;color:#fff;font-size:10px;font-weight:600;padding:2px 6px;border-radius:10px;min-width:16px;text-align:center}.debug-sidebar-footer{padding:16px;border-top:1px solid #333;display:flex;flex-direction:column;gap:8px}.sidebar-btn{display:flex;align-items:center;gap:8px;padding:8px 12px;border:1px solid #333;border-radius:6px;background:#ffffff0d;color:#888;cursor:pointer;font-size:12px;transition:all .2s ease}.sidebar-btn:hover{background:#3c7dff1a;border-color:#3c7dff;color:#3c7dff}@media (max-width: 768px){.debug-sidebar{width:200px}}@media (max-width: 640px){.debug-sidebar{width:180px}}';
const panelsCSS = ".debug-main-content{flex:1;background:#1a1a1a;overflow:hidden;display:flex;flex-direction:column}.debug-panel-container{flex:1;display:flex;flex-direction:column;height:100%}.panel-header{display:flex;align-items:center;justify-content:space-between;padding:20px 24px;border-bottom:1px solid #333;background:linear-gradient(135deg,#222,#1a1a1a)}.panel-title{display:flex;align-items:center;gap:12px}.panel-icon{font-size:20px}.panel-title h2{margin:0;font-size:18px;font-weight:600;color:#fff}.panel-actions{display:flex;gap:8px}.panel-action-btn{padding:8px 16px;border:none;border-radius:6px;font-size:12px;font-weight:500;cursor:pointer;transition:all .2s ease}.panel-action-btn.primary{background:#3c7dff;color:#fff}.panel-action-btn.secondary{background:#ffffff1a;color:#fff;border:1px solid #333}.panel-action-btn.danger{background:#ff47571a;color:#ff4757;border:1px solid rgba(255,71,87,.3)}.panel-action-btn:hover{transform:translateY(-1px);box-shadow:0 4px 12px #0000004d}.panel-action-btn.primary:hover{background:#2563eb}.panel-action-btn.secondary:hover{background:#ffffff26}.panel-action-btn.danger:hover{background:#ff475733}.panel-horizontal-tabs{display:flex;background:#1a1a1a;border-bottom:1px solid #333;overflow-x:auto}.horizontal-tab{display:flex;align-items:center;gap:8px;padding:12px 20px;background:none;border:none;color:#888;font-size:13px;font-weight:500;cursor:pointer;transition:all .2s ease;white-space:nowrap;border-bottom:2px solid transparent}.horizontal-tab:hover{background:#ffffff0d;color:#ccc}.horizontal-tab.active{color:#3c7dff;border-bottom-color:#3c7dff;background:#3c7dff0d}.horizontal-tab .tab-icon{font-size:14px}.horizontal-tab .tab-label{font-weight:500}.panel-content{flex:1;padding:24px;overflow-y:auto;color:#ccc}.panel-content>.enhanced-panel{margin-top:0}.panel-content>.enhanced-panel>*:first-child{margin-top:0}.panel-content .section:first-child,.panel-content .section:first-child .section-title,.panel-content h3:first-child,.panel-content .section-title:first-child,.panel-content h1,.panel-content h2,.panel-content h3,.panel-content h4,.panel-content h5,.panel-content h6{margin-top:0}.enhanced-panel{display:flex;flex-direction:column;gap:24px}.metrics-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:16px}.metric-card{background:linear-gradient(135deg,#222,#1a1a1a);border:1px solid #333;border-radius:8px;padding:16px;display:flex;align-items:center;gap:12px;transition:all .2s ease}.metric-card:hover{border-color:#3c7dff;box-shadow:0 4px 12px #3c7dff1a}.metric-icon{font-size:20px;width:32px;text-align:center}.metric-content{flex:1}.metric-value{font-size:18px;font-weight:700;color:#3c7dff;line-height:1}.metric-label{font-size:11px;color:#888;text-transform:uppercase;font-weight:500;letter-spacing:.5px;margin-top:2px}.section{display:flex;flex-direction:column;gap:16px}.section-title{font-size:16px;font-weight:600;color:#fff;margin:0;padding-bottom:8px;border-bottom:1px solid #333}.section-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:16px}.section-controls{display:flex;gap:8px}.sort-btn{background:#ffffff1a;border:1px solid #333;color:#ccc;padding:6px 12px;border-radius:6px;font-size:12px;cursor:pointer;transition:all .2s ease}.sort-btn:hover{background:#3c7dff1a;border-color:#3c7dff;color:#3c7dff}.empty-state{display:flex;flex-direction:column;align-items:center;gap:12px;padding:40px 20px;color:#888;text-align:center}.empty-icon{font-size:32px;opacity:.5}.empty-text{font-size:14px}.empty-action{background:#3c7dff;color:#fff;border:none;padding:8px 16px;border-radius:6px;cursor:pointer;font-size:12px;font-weight:500}.json-viewer{background:#0f0f0f;border:1px solid #333;border-radius:8px;overflow:hidden}.json-viewer pre{margin:0;padding:16px;overflow-x:auto;font-family:SF Mono,monospace;font-size:12px;line-height:1.6;color:#e6e6e6}.debug-metric{display:flex;justify-content:space-between;align-items:center;padding:12px 0;border-bottom:1px solid #2a2a2a}.debug-metric:last-child{border-bottom:none}.metric-label{color:#888;font-weight:500}.metric-value{color:#3c7dff;font-family:SF Mono,monospace;font-weight:600}@media (max-width: 768px){.panel-header,.panel-content{padding:16px}.metrics-grid{grid-template-columns:repeat(auto-fit,minmax(120px,1fr))}}";
const componentsCSS = ".cart-items-list{display:flex;flex-direction:column;gap:8px}.cart-item-card{background:linear-gradient(135deg,#222,#1a1a1a);border:1px solid #333;border-radius:8px;padding:16px;display:flex;align-items:center;gap:16px}.item-info{flex:1}.item-title{font-weight:600;color:#fff;margin-bottom:4px}.item-details{font-size:12px;color:#888}.item-quantity{display:flex;align-items:center;gap:8px}.qty-btn{width:24px;height:24px;border:1px solid #333;background:#ffffff0d;color:#fff;border-radius:4px;cursor:pointer;display:flex;align-items:center;justify-content:center;font-weight:600}.qty-btn:hover{background:#3c7dff1a;border-color:#3c7dff}.qty-value{font-weight:600;color:#3c7dff;min-width:20px;text-align:center}.item-total{font-weight:600;color:#3c7dff}.remove-btn{width:24px;height:24px;border:1px solid rgba(255,71,87,.3);background:#ff47571a;color:#ff4757;border-radius:4px;cursor:pointer;display:flex;align-items:center;justify-content:center;font-weight:600}.remove-btn:hover{background:#ff475733}.elements-list{display:flex;flex-direction:column;gap:8px}.element-card{background:linear-gradient(135deg,#222,#1a1a1a);border:1px solid #333;border-radius:8px;padding:16px;cursor:pointer;transition:all .2s ease}.element-card:hover{border-color:#3c7dff;box-shadow:0 4px 12px #3c7dff1a}.element-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px}.element-tag{background:#3c7dff;color:#fff;padding:2px 6px;border-radius:4px;font-size:10px;font-weight:600;text-transform:uppercase}.element-index{color:#888;font-size:12px}.element-attributes,.element-enhancers{display:flex;flex-wrap:wrap;gap:4px;margin-top:8px}.attribute-tag{background:#ffffff1a;color:#ccc;padding:2px 6px;border-radius:3px;font-size:10px;font-family:SF Mono,monospace}.enhancer-tag{background:#3c7dff33;color:#3c7dff;padding:2px 6px;border-radius:3px;font-size:10px;font-weight:500}.requests-list{display:flex;flex-direction:column;gap:8px}.request-card{background:linear-gradient(135deg,#222,#1a1a1a);border:1px solid #333;border-radius:8px;padding:16px}.request-card.error{border-color:#ff47574d}.request-card.success{border-color:#00ff884d}.request-header{display:flex;align-items:center;gap:12px;margin-bottom:8px}.request-method{padding:2px 6px;border-radius:3px;font-size:10px;font-weight:600;text-transform:uppercase}.request-method.get{background:#0f83;color:#0f8}.request-method.post{background:#3c7dff33;color:#3c7dff}.request-method.put{background:#ffc10733;color:#ffc107}.request-method.delete{background:#ff475733;color:#ff4757}.request-url{flex:1;color:#ccc;font-family:SF Mono,monospace;font-size:12px}.request-status{padding:2px 6px;border-radius:3px;font-size:10px;font-weight:600}.request-status.status-2xx{background:#0f83;color:#0f8}.request-status.status-4xx,.request-status.status-5xx{background:#ff475733;color:#ff4757}.request-time{color:#888;font-size:11px;font-family:SF Mono,monospace}.request-timestamp{color:#666;font-size:11px;margin-bottom:8px}.request-details summary{cursor:pointer;color:#3c7dff;font-size:12px;margin-top:8px}.request-data,.response-data{margin-top:12px}.request-data h4,.response-data h4{margin:0 0 8px;color:#fff;font-size:12px}.event-types{display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:8px}.event-type-card{background:linear-gradient(135deg,#222,#1a1a1a);border:1px solid #333;border-radius:6px;padding:12px;text-align:center;cursor:pointer;transition:all .2s ease}.event-type-card:hover{border-color:#3c7dff;box-shadow:0 2px 8px #3c7dff1a}.event-type-name{font-size:12px;color:#fff;font-weight:500}.event-type-count{font-size:16px;color:#3c7dff;font-weight:700;margin-top:4px}.events-timeline{display:flex;flex-direction:column;gap:12px}.timeline-event{display:flex;gap:16px;background:linear-gradient(135deg,#222,#1a1a1a);border:1px solid #333;border-radius:8px;padding:16px}.event-time{color:#888;font-size:11px;font-family:SF Mono,monospace;white-space:nowrap;width:80px}.event-content{flex:1}.event-header{display:flex;align-items:center;gap:8px;margin-bottom:4px}.event-type-badge{background:#3c7dff;color:#fff;padding:2px 6px;border-radius:3px;font-size:10px;font-weight:600;text-transform:uppercase}.event-source{color:#888;font-size:10px;text-transform:uppercase;font-weight:500}.event-data-preview{color:#ccc;font-size:12px;font-family:SF Mono,monospace}.event-item{background:linear-gradient(135deg,#222,#1a1a1a);border:1px solid #333;border-radius:8px;padding:16px;margin-bottom:12px;transition:all .2s ease}.event-item:hover{border-color:#3c7dff;box-shadow:0 4px 12px #3c7dff1a}.event-item .event-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:12px}.event-type{background:#3c7dff;color:#fff;padding:4px 8px;border-radius:4px;font-size:10px;font-weight:600;text-transform:uppercase}.event-data{background:#0f0f0f;border-radius:4px;padding:12px;font-family:SF Mono,monospace;font-size:11px;color:#ccc;max-height:120px;overflow-y:auto}.debug-mini-cart-display{position:fixed;top:20px;right:20px;background:#000000f2;border:1px solid #333;border-radius:8px;padding:0;min-width:280px;max-width:350px;max-height:400px;box-shadow:0 8px 32px #00000080;font-family:SF Mono,monospace;font-size:12px;color:#ccc;z-index:10000;display:none;overflow:hidden}.debug-mini-cart-display.show{display:block}.debug-mini-cart-header{background:linear-gradient(135deg,#1a1a1a,#111);padding:12px 16px;border-bottom:1px solid #333;display:flex;justify-content:space-between;align-items:center;font-weight:600;color:#3c7dff}.debug-mini-cart-header span{display:flex;align-items:center;gap:8px}.mini-cart-close{background:transparent;border:none;color:#888;font-size:20px;cursor:pointer;padding:0;width:24px;height:24px;display:flex;align-items:center;justify-content:center;border-radius:4px;transition:all .2s ease}.mini-cart-close:hover{background:#ff475733;color:#ff4757}.debug-mini-cart-empty{padding:40px 20px;text-align:center;color:#666;font-style:italic}.debug-mini-cart-items{max-height:280px;overflow-y:auto;padding:8px}.debug-mini-cart-item{background:#ffffff08;border:1px solid rgba(255,255,255,.05);border-radius:6px;padding:10px;margin-bottom:6px;transition:all .2s ease}.debug-mini-cart-item:hover{background:#3c7dff0d;border-color:#3c7dff33}.debug-mini-cart-item:last-child{margin-bottom:0}.mini-cart-item-info{display:flex;justify-content:space-between;align-items:center;margin-bottom:4px}.mini-cart-item-id{color:#3c7dff;font-weight:600;font-size:11px}.mini-cart-item-qty{color:#ffc107;font-weight:600;font-size:11px}.mini-cart-upsell-badge{background:#ff4757;color:#fff;padding:1px 4px;border-radius:3px;font-size:9px;font-weight:600;text-transform:uppercase;letter-spacing:.5px;margin:0 4px}.mini-cart-item-title{color:#fff;font-size:11px;margin-bottom:4px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.mini-cart-item-price{color:#0f8;font-weight:600;font-size:12px;text-align:right}.debug-mini-cart-footer{background:linear-gradient(135deg,#1a1a1a,#111);border-top:1px solid #333;padding:12px 16px;display:flex;justify-content:space-between;align-items:center}.mini-cart-stat{display:flex;align-items:center;gap:6px}.mini-cart-stat span:first-child{color:#888;font-size:11px}.mini-cart-stat span:last-child{color:#fff;font-weight:600}.mini-cart-total{color:#0f8!important;font-size:14px}.debug-mini-cart-items::-webkit-scrollbar{width:6px}.debug-mini-cart-items::-webkit-scrollbar-track{background:#ffffff05;border-radius:3px}.debug-mini-cart-items::-webkit-scrollbar-thumb{background:#3c7dff4d;border-radius:3px}.debug-mini-cart-items::-webkit-scrollbar-thumb:hover{background:#3c7dff80}";
const campaignCSS = ".campaign-overview{background:linear-gradient(135deg,#2a2a2a,#1a1a1a);border:1px solid #333;border-radius:12px;padding:24px;margin-bottom:24px}.campaign-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:20px}.campaign-name{margin:0;font-size:24px;font-weight:700;color:#fff;background:linear-gradient(135deg,#3c7dff,#00d4ff);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}.campaign-badges{display:flex;gap:8px}.campaign-badge{padding:4px 8px;border-radius:6px;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.5px}.campaign-badge.currency{background:#3c7dff33;color:#3c7dff}.campaign-badge.language{background:#0f83;color:#0f8}.packages-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:20px;margin-bottom:32px}.package-card{background:linear-gradient(135deg,#222,#1a1a1a);border:1px solid #333;border-radius:12px;overflow:hidden;transition:all .3s ease;position:relative}.package-card:hover{border-color:#3c7dff;box-shadow:0 8px 32px #3c7dff1a;transform:translateY(-2px)}.package-card.in-cart{border-color:#0f8;background:linear-gradient(135deg,#00ff881a,#1a1a1a)}.package-image-container{position:relative;height:140px;background:#f8f9fa;display:flex;align-items:center;justify-content:center;overflow:hidden}.package-image{max-width:100%;max-height:100%;object-fit:contain}.recurring-badge,.cart-badge{position:absolute;top:8px;right:8px;background:#3c7dff;color:#fff;padding:4px 8px;border-radius:12px;font-size:10px;font-weight:600}.cart-badge{background:#0f8;color:#000;top:8px;left:8px}.package-info{padding:16px}.package-header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:12px}.package-name{margin:0;font-size:16px;font-weight:600;color:#fff;line-height:1.3}.package-id{font-size:11px;color:#888;font-family:SF Mono,monospace}.package-details{display:flex;gap:16px;margin-bottom:12px;font-size:12px;color:#888}.package-pricing{margin-bottom:16px}.price-row{display:flex;justify-content:space-between;align-items:center;margin-bottom:4px}.price-label{font-size:12px;color:#888}.price-value{font-weight:600;font-family:SF Mono,monospace}.sale-price{color:#3c7dff;font-size:16px}.retail-price{color:#888;text-decoration:line-through}.recurring-price{color:#ff6b6b}.savings{background:#00ff881a;color:#0f8;padding:4px 8px;border-radius:6px;font-size:11px;font-weight:600;text-align:center;margin-top:8px}.recurring-pricing{border-top:1px solid #333;padding-top:8px;margin-top:8px}.package-actions{display:flex;gap:8px;align-items:center}.package-btn{padding:8px 12px;border:none;border-radius:6px;font-size:12px;font-weight:500;cursor:pointer;transition:all .2s ease;flex:1}.add-btn{background:#3c7dff;color:#fff}.add-btn:hover{background:#2563eb}.remove-btn{background:#ff47571a;color:#ff4757;border:1px solid rgba(255,71,87,.3)}.remove-btn:hover{background:#ff475733}.inspect-btn{background:#ffffff1a;color:#ccc;border:1px solid #333;flex:0 0 auto}.inspect-btn:hover{background:#ffffff26;color:#fff}.qty-controls{display:flex;align-items:center;gap:8px;flex:0 0 auto}.qty-controls button{width:24px;height:24px;border:1px solid #333;background:#ffffff0d;color:#fff;border-radius:4px;cursor:pointer;display:flex;align-items:center;justify-content:center;font-weight:600}.qty-controls span{font-weight:600;color:#3c7dff;min-width:20px;text-align:center}.shipping-methods{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:16px;margin-bottom:24px}.shipping-method-card{background:linear-gradient(135deg,#222,#1a1a1a);border:1px solid #333;border-radius:8px;padding:16px;display:flex;align-items:center;gap:16px;transition:all .2s ease}.shipping-method-card:hover{border-color:#3c7dff;box-shadow:0 4px 12px #3c7dff1a}.shipping-info{flex:1}.shipping-name{font-size:16px;font-weight:600;color:#fff;margin-bottom:4px}.shipping-id{font-size:11px;color:#888;font-family:SF Mono,monospace}.shipping-price{font-size:18px;font-weight:700;color:#3c7dff;font-family:SF Mono,monospace}.shipping-test-btn{background:#3c7dff1a;border:1px solid #3C7DFF;color:#3c7dff;padding:8px 16px;border-radius:6px;font-size:12px;font-weight:500;cursor:pointer;transition:all .2s ease}.shipping-test-btn:hover{background:#3c7dff33}.raw-data-section{background:linear-gradient(135deg,#222,#1a1a1a);border:1px solid #333;border-radius:8px;overflow:hidden}.raw-data-summary{padding:16px;cursor:pointer;display:flex;align-items:center;justify-content:space-between;user-select:none}.raw-data-summary:hover{background:#ffffff0d}.toggle-icon{color:#888;transition:transform .2s ease}.raw-data-section[open] .toggle-icon{transform:rotate(180deg)}.raw-data-section .json-viewer{border-top:1px solid #333;margin:0}@media (max-width: 768px){.packages-grid,.shipping-methods{grid-template-columns:1fr}.campaign-header{flex-direction:column;align-items:flex-start;gap:12px}.package-card{margin-bottom:16px}.package-actions{flex-direction:column;gap:8px}.package-btn{width:100%}}";
const panelComponentsCSS = ".enhanced-panel{display:flex;flex-direction:column;gap:24px}.metrics-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:16px}.metric-card{background:linear-gradient(135deg,#222,#1a1a1a);border:1px solid #333;border-radius:8px;padding:16px;display:flex;align-items:center;gap:12px;transition:all .2s ease}.metric-card:hover{border-color:#3c7dff;box-shadow:0 4px 12px #3c7dff1a}.metric-icon{font-size:20px;width:32px;text-align:center}.metric-content{flex:1}.metric-value{font-size:18px;font-weight:700;color:#3c7dff;line-height:1}.metric-label{font-size:11px;color:#888;text-transform:uppercase;font-weight:500;letter-spacing:.5px;margin-top:2px}.section{display:flex;flex-direction:column;gap:16px}.section-title{font-size:16px;font-weight:600;color:#fff;margin:0;padding-bottom:8px;border-bottom:1px solid #333}.empty-state{display:flex;flex-direction:column;align-items:center;gap:12px;padding:40px 20px;color:#888;text-align:center}.empty-icon{font-size:32px;opacity:.5}.empty-text{font-size:14px}.empty-action{background:#3c7dff;color:#fff;border:none;padding:8px 16px;border-radius:6px;cursor:pointer;font-size:12px;font-weight:500}.config-groups{display:flex;flex-direction:column;gap:24px}.config-group{background:linear-gradient(135deg,#222,#1a1a1a);border:1px solid #333;border-radius:8px;padding:20px}.config-group-title{font-size:14px;font-weight:600;color:#fff;margin:0 0 16px;padding-bottom:8px;border-bottom:1px solid #333}.config-items{display:flex;flex-direction:column;gap:12px}.config-item{display:flex;justify-content:space-between;align-items:center;padding:8px 0}.config-key{font-size:12px;color:#ccc;font-weight:500}.config-value{font-size:12px;color:#fff;font-family:SF Mono,monospace}.config-value.enabled{color:#0f8}.config-value.disabled{color:#888}.form-fields-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:12px}.field-status-card{background:linear-gradient(135deg,#222,#1a1a1a);border:1px solid #333;border-radius:6px;padding:12px;text-align:center;transition:all .2s ease}.field-status-card.filled{border-color:#00ff884d;background:linear-gradient(135deg,#00ff881a,#1a1a1a)}.field-status-card.error{border-color:#ff47574d;background:linear-gradient(135deg,#ff47571a,#1a1a1a)}.field-name{font-size:11px;color:#ccc;font-weight:500;margin-bottom:4px}.field-status{font-size:14px}.customer-info{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:16px}.info-card{background:linear-gradient(135deg,#222,#1a1a1a);border:1px solid #333;border-radius:8px;padding:16px}.info-card h4{margin:0 0 12px;font-size:14px;color:#fff;font-weight:600}.info-row{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px}.info-label{font-size:12px;color:#888}.info-value{font-size:12px;color:#fff;font-family:SF Mono,monospace}.info-empty{color:#666;font-style:italic;font-size:12px}.address-info,.validation-errors{display:flex;flex-direction:column;gap:8px}.error-item{background:linear-gradient(135deg,#ff47571a,#1a1a1a);border:1px solid rgba(255,71,87,.3);border-radius:6px;padding:12px;display:flex;gap:8px}.error-field{font-weight:600;color:#ff4757;font-size:12px}.error-message{color:#ccc;font-size:12px}.storage-items{display:flex;flex-direction:column;gap:12px}.storage-item-card{background:linear-gradient(135deg,#222,#1a1a1a);border:1px solid #333;border-radius:8px;padding:16px;transition:all .2s ease}.storage-item-card.next-item{border-color:#3c7dff4d;background:linear-gradient(135deg,#3c7dff0d,#1a1a1a)}.storage-item-header{display:flex;align-items:center;gap:12px;margin-bottom:8px}.storage-key{flex:1;font-family:SF Mono,monospace;font-size:12px;color:#fff;font-weight:500}.storage-type{padding:2px 6px;border-radius:3px;font-size:10px;font-weight:600;text-transform:uppercase}.storage-type.local{background:#0f83;color:#0f8}.storage-type.session{background:#ffc10733;color:#ffc107}.storage-delete-btn{width:20px;height:20px;border:1px solid rgba(255,71,87,.3);background:#ff47571a;color:#ff4757;border-radius:3px;cursor:pointer;display:flex;align-items:center;justify-content:center;font-weight:600;font-size:12px}.storage-delete-btn:hover{background:#ff475733}.storage-item-size{font-size:10px;color:#666;margin-bottom:8px}.storage-item-value{background:#0f0f0f;border:1px solid #333;border-radius:4px;overflow:hidden}.storage-item-value pre{margin:0;padding:12px;overflow-x:auto;font-family:SF Mono,monospace;font-size:11px;line-height:1.4;color:#e6e6e6;max-height:200px;overflow-y:auto}.json-viewer{background:#0f0f0f;border:1px solid #333;border-radius:8px;overflow:hidden}.json-viewer pre{margin:0;padding:16px;overflow-x:auto;font-family:SF Mono,monospace;font-size:12px;line-height:1.6;color:#e6e6e6;max-height:400px;overflow-y:auto}.analytics-charts{display:flex;flex-direction:column;gap:12px}.analytics-bar{display:flex;flex-direction:column;gap:4px}.bar-label{font-size:12px;color:#ccc;font-weight:500}.bar-container{position:relative;background:#0f0f0f;border:1px solid #333;border-radius:4px;height:24px;overflow:hidden}.bar-fill{background:linear-gradient(90deg,#3c7dff,#2563eb);height:100%;transition:width .3s ease}.bar-value{position:absolute;right:8px;top:50%;transform:translateY(-50%);font-size:11px;color:#fff;font-weight:500}.source-stats{display:flex;flex-direction:column;gap:8px}.source-stat-item{display:flex;justify-content:space-between;align-items:center;padding:8px 12px;background:linear-gradient(135deg,#222,#1a1a1a);border:1px solid #333;border-radius:6px}.source-name{font-size:12px;color:#ccc}.source-count{font-size:12px;color:#3c7dff;font-weight:600}.method-stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px}.method-stat-card{background:linear-gradient(135deg,#222,#1a1a1a);border:1px solid #333;border-radius:8px;padding:16px}.method-name{font-size:14px;font-weight:600;color:#fff;margin-bottom:8px}.method-metrics{display:flex;flex-direction:column;gap:4px}.method-metrics .metric{font-size:11px;color:#888}.performance-chart{display:flex;flex-direction:column;gap:8px}.performance-bar{display:flex;flex-direction:column;gap:4px}.enhancer-distribution{display:flex;flex-direction:column;gap:8px}.enhancer-dist-item{display:flex;justify-content:space-between;align-items:center;padding:8px 12px;background:linear-gradient(135deg,#222,#1a1a1a);border:1px solid #333;border-radius:6px}.enhancer-type{font-size:12px;color:#ccc}.enhancer-count{font-size:12px;color:#3c7dff;font-weight:600}.performance-metrics{display:flex;flex-direction:column;gap:12px}.performance-metric{display:flex;justify-content:space-between;align-items:center;padding:12px;background:linear-gradient(135deg,#222,#1a1a1a);border:1px solid #333;border-radius:6px}.enhancement-timeline{display:flex;flex-direction:column;gap:8px}.timeline-item{display:flex;gap:16px;padding:8px 12px;background:linear-gradient(135deg,#222,#1a1a1a);border:1px solid #333;border-radius:6px}.timeline-time{font-size:11px;color:#888;font-family:SF Mono,monospace;min-width:60px}.timeline-event{font-size:12px;color:#ccc}@media (max-width: 768px){.metrics-grid,.form-fields-grid{grid-template-columns:repeat(2,1fr)}.customer-info{grid-template-columns:1fr}.config-groups{gap:16px}.storage-items{gap:8px}.method-stats{grid-template-columns:1fr}}";
const eventTimelineCSS = ".timeline-header{display:flex;justify-content:space-between;align-items:center;padding:12px 16px;background:#f8f9fa;border-bottom:1px solid #e9ecef;border-radius:4px 4px 0 0;margin-bottom:12px}.timeline-stats{display:flex;gap:16px}.timeline-stat{display:flex;flex-direction:column;align-items:center;font-size:11px}.timeline-stat-label{color:#6c757d;margin-bottom:2px}.timeline-stat-value{font-weight:600;color:#495057}.timeline-stat-value.recording{color:#28a745}.timeline-stat-value.paused{color:#dc3545}.timeline-controls{display:flex;gap:8px}.timeline-control-btn{padding:6px 12px;border:1px solid #dee2e6;border-radius:3px;background:#fff;font-size:11px;cursor:pointer;transition:all .2s}.timeline-control-btn:hover{background:#f8f9fa;transform:translateY(-1px)}.timeline-control-btn.record{background:#28a745;color:#fff;border-color:#28a745}.timeline-control-btn.pause{background:#ffc107;color:#212529;border-color:#ffc107}.timeline-control-btn.clear{background:#dc3545;color:#fff;border-color:#dc3545}.timeline-control-btn.export{background:#007bff;color:#fff;border-color:#007bff}.timeline-events{max-height:500px;overflow-y:auto;padding:0 4px}.timeline-event{background:#fff;border:1px solid #e9ecef;border-radius:4px;margin-bottom:8px;transition:all .2s;position:relative}.timeline-event:hover{box-shadow:0 2px 8px #0000001a;transform:translateY(-1px)}.timeline-event-header{padding:8px 12px;border-bottom:1px solid #f8f9fa;display:flex;justify-content:space-between;align-items:center}.timeline-event-meta{display:flex;align-items:center;gap:8px;font-size:11px}.timeline-event-icon{font-size:14px}.timeline-event-type{font-weight:600;text-transform:uppercase;letter-spacing:.5px}.timeline-event-time{color:#6c757d;font-style:italic}.timeline-event-name{font-weight:600;color:#495057;font-size:13px}.timeline-event-details{padding:8px 12px;font-size:11px}.timeline-event-source{color:#6c757d;margin-bottom:8px}.timeline-event-data-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:4px}.timeline-toggle-data{background:none;border:1px solid #dee2e6;border-radius:2px;padding:2px 6px;font-size:10px;cursor:pointer;color:#007bff}.timeline-toggle-data:hover{background:#f8f9fa}.timeline-event-data-content{background:#f8f9fa;border:1px solid #e9ecef;border-radius:3px;padding:8px;margin:4px 0;font-family:Monaco,Consolas,monospace;font-size:10px;line-height:1.4;max-height:200px;overflow-y:auto}.timeline-event-data-preview{background:#f8f9fa;border:1px solid #e9ecef;border-radius:3px;padding:6px;font-family:Monaco,Consolas,monospace;font-size:10px;color:#6c757d;white-space:pre-wrap;word-break:break-all}.timeline-empty{text-align:center;padding:40px 20px;color:#6c757d}.timeline-empty-icon{font-size:48px;margin-bottom:16px}.timeline-empty-title{font-size:16px;font-weight:600;margin-bottom:8px;color:#495057}.timeline-empty-subtitle{font-size:13px}.analytics-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;padding:12px}.analytics-card{background:#fff;border:1px solid #e9ecef;border-radius:4px;padding:12px}.analytics-card-full{grid-column:1 / -1}.analytics-card-title{font-weight:600;margin-bottom:12px;color:#495057;font-size:13px;border-bottom:1px solid #f8f9fa;padding-bottom:6px}.analytics-stats{display:flex;flex-direction:column;gap:8px}.analytics-stat{display:flex;justify-content:space-between;font-size:11px}.analytics-stat-label{color:#6c757d}.analytics-stat-value{font-weight:600;color:#495057}.analytics-distribution{display:flex;flex-direction:column;gap:6px}.analytics-distribution-item{display:flex;align-items:center;gap:8px;font-size:11px}.analytics-distribution-bar{flex:1;height:16px;background:#f8f9fa;border-radius:8px;overflow:hidden;position:relative}.analytics-distribution-fill{height:100%;border-radius:8px;transition:width .3s ease}.analytics-distribution-label{min-width:80px;color:#495057;font-weight:500}.analytics-sources{display:flex;flex-direction:column;gap:4px;max-height:200px;overflow-y:auto}.analytics-source-item{display:flex;justify-content:space-between;padding:4px 8px;background:#f8f9fa;border-radius:3px;font-size:11px}.analytics-source-name{color:#495057;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.analytics-source-count{color:#6c757d;font-weight:600;min-width:20px;text-align:right}.timeline-chart{display:flex;align-items:end;gap:4px;height:100px;padding:8px;background:#f8f9fa;border-radius:4px}.timeline-chart-bar{flex:1;background:linear-gradient(to top,#007bff,#66b3ff);border-radius:2px 2px 0 0;min-height:2px;position:relative;cursor:pointer;transition:all .2s}.timeline-chart-bar:hover{opacity:.8;transform:scaleY(1.1)}.timeline-chart-value{position:absolute;top:-16px;left:50%;transform:translate(-50%);font-size:9px;color:#495057;font-weight:600;opacity:0;transition:opacity .2s}.timeline-chart-bar:hover .timeline-chart-value{opacity:1}.filters-container{padding:12px;display:flex;flex-direction:column;gap:16px}.filter-group{border:1px solid #e9ecef;border-radius:4px;padding:12px;background:#fff}.filter-group-title{font-weight:600;margin-bottom:8px;color:#495057;font-size:12px}.filter-search-input{width:100%;padding:6px 8px;border:1px solid #dee2e6;border-radius:3px;font-size:11px}.filter-search-input:focus{outline:none;border-color:#007bff;box-shadow:0 0 0 2px #007bff40}.filter-checkboxes{display:flex;flex-direction:column;gap:6px}.filter-checkbox{display:flex;align-items:center;gap:6px;font-size:11px;cursor:pointer;padding:4px;border-radius:3px;transition:background .2s}.filter-checkbox:hover{background:#f8f9fa}.filter-checkbox input[type=checkbox]{margin:0}.filter-checkbox-icon{font-size:14px}.filter-checkbox-label{color:#495057}.filter-sources-list{max-height:150px;overflow-y:auto;border:1px solid #e9ecef;border-radius:3px;padding:4px}.filter-empty{color:#6c757d;font-style:italic;text-align:center;padding:12px;font-size:11px}.filter-time-range{width:100%;padding:6px 8px;border:1px solid #dee2e6;border-radius:3px;font-size:11px;background:#fff}.filter-controls{display:flex;gap:8px}.filter-control-btn{flex:1;padding:8px 12px;border:1px solid #dee2e6;border-radius:3px;background:#fff;font-size:11px;cursor:pointer;transition:all .2s}.filter-control-btn:hover{background:#f8f9fa;transform:translateY(-1px)}@media (max-width: 768px){.timeline-header{flex-direction:column;gap:12px;align-items:stretch}.timeline-stats{justify-content:space-around}.analytics-grid{grid-template-columns:1fr}.filter-controls{flex-direction:column}}@keyframes eventAdded{0%{opacity:0;transform:translate(-20px)}to{opacity:1;transform:translate(0)}}.timeline-event.new{animation:eventAdded .3s ease-out}.timeline-events::-webkit-scrollbar,.analytics-sources::-webkit-scrollbar,.filter-sources-list::-webkit-scrollbar{width:6px}.timeline-events::-webkit-scrollbar-track,.analytics-sources::-webkit-scrollbar-track,.filter-sources-list::-webkit-scrollbar-track{background:#f8f9fa;border-radius:3px}.timeline-events::-webkit-scrollbar-thumb,.analytics-sources::-webkit-scrollbar-thumb,.filter-sources-list::-webkit-scrollbar-thumb{background:#dee2e6;border-radius:3px}.timeline-events::-webkit-scrollbar-thumb:hover,.analytics-sources::-webkit-scrollbar-thumb:hover,.filter-sources-list::-webkit-scrollbar-thumb:hover{background:#adb5bd}";
const _DebugStyleLoader = class _DebugStyleLoader {
  static async loadDebugStyles() {
    if (this.isLoading || this.styleElement) return;
    this.isLoading = true;
    try {
      const combinedCSS = [
        baseCSS,
        sidebarCSS,
        panelsCSS,
        componentsCSS,
        campaignCSS,
        panelComponentsCSS,
        eventTimelineCSS
      ].join("\n");
      this.styleElement = document.createElement("style");
      this.styleElement.id = "debug-overlay-styles";
      this.styleElement.textContent = combinedCSS;
      document.head.appendChild(this.styleElement);
      console.log("🎨 Debug styles injected");
    } catch (error) {
      console.error("Failed to load debug styles:", error);
    } finally {
      this.isLoading = false;
    }
  }
  static removeDebugStyles() {
    if (this.styleElement) {
      this.styleElement.remove();
      this.styleElement = null;
    }
    const existingStyle = document.getElementById("debug-overlay-styles");
    if (existingStyle) {
      existingStyle.remove();
    }
  }
};
_DebugStyleLoader.styleElement = null;
_DebugStyleLoader.isLoading = false;
let DebugStyleLoader = _DebugStyleLoader;
const DebugStyleLoader$1 = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  DebugStyleLoader
});
export {
  AttributionCollector$1 as A,
  CountryService as C,
  DisplayValueValidator as D,
  EventBus as E,
  FieldFinder as F,
  Logger as L,
  PackageContextResolver as P,
  TemplateRenderer as T,
  UtmTransfer$1 as U,
  useCampaignStore as a,
  useCheckoutStore as b,
  createLogger as c,
  configStore as d,
  LogLevel as e,
  ElementDataExtractor as f,
  PriceCalculator as g,
  ErrorDisplayManager as h,
  EventHandlerManager as i,
  getFailureUrl as j,
  getSuccessUrl as k,
  handleOrderRedirect as l,
  index as m,
  errorHandler$1 as n,
  DebugOverlay$1 as o,
  preserveQueryParams as p,
  analytics as q,
  testModeManager as t,
  useCartStore as u
};
