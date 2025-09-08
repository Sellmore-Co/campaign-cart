import { B as BaseDisplayEnhancer, a as getPropertyMapping, D as DisplayFormatter, P as PropertyResolver } from "./DisplayEnhancerCore-BUzF32Or.js";
import { A as AttributeParser } from "./index-CNGWMEZS.js";
import { a as useCampaignStore, u as useCartStore, P as PackageContextResolver, l as PriceCalculator } from "./utils-DondkAMT.js";
const _DisplayContextProvider = class _DisplayContextProvider {
  /**
   * Provide context to an element and its descendants
   */
  static provide(element, context) {
    this.contexts.set(element, context);
    this.contextElements.add(element);
  }
  /**
   * Resolve context for an element by traversing up the DOM tree
   */
  static resolve(element) {
    let current = element;
    while (current) {
      if (this.contexts.has(current)) {
        return this.contexts.get(current);
      }
      const packageId = current.getAttribute("data-next-package-id");
      const cartItemId = current.getAttribute("data-next-cart-item-id");
      const shippingId = current.getAttribute("data-next-shipping-id");
      const selectionId = current.getAttribute("data-next-selector-id");
      if (packageId || cartItemId || shippingId || selectionId) {
        const context = {};
        if (packageId) context.packageId = parseInt(packageId, 10);
        if (cartItemId) context.cartItemId = cartItemId;
        if (shippingId) context.shippingMethodId = shippingId;
        if (selectionId) context.selectionId = selectionId;
        this.provide(current, context);
        return context;
      }
      current = current.parentElement;
    }
    return null;
  }
  /**
   * Merge contexts, with child context taking precedence
   */
  static merge(parentContext, childContext) {
    if (!parentContext) return childContext;
    if (!childContext) return parentContext;
    return {
      ...parentContext,
      ...childContext
    };
  }
  /**
   * Clear context for an element
   */
  static clear(element) {
    this.contexts.delete(element);
    this.contextElements.delete(element);
  }
  /**
   * Clear all contexts (useful for cleanup)
   */
  static clearAll() {
    this.contextElements.forEach((element) => {
    });
    this.contexts = /* @__PURE__ */ new WeakMap();
    this.contextElements.clear();
  }
  /**
   * Get all elements with contexts (for debugging)
   */
  static getContextElements() {
    return Array.from(this.contextElements);
  }
  /**
   * Validate context has required fields
   */
  static validate(context, requiredFields) {
    return requiredFields.every((field) => context[field] !== void 0);
  }
};
_DisplayContextProvider.contexts = /* @__PURE__ */ new WeakMap();
_DisplayContextProvider.contextElements = /* @__PURE__ */ new Set();
let DisplayContextProvider = _DisplayContextProvider;
class ProductDisplayEnhancer extends BaseDisplayEnhancer {
  constructor() {
    super(...arguments);
    this.multiplyByQuantity = false;
    this.currentQuantity = 1;
  }
  async initialize() {
    this.validateElement();
    this.parseDisplayAttributes();
    this.multiplyByQuantity = this.element.hasAttribute("data-next-multiply-quantity");
    this.quantitySelectorId = this.getAttribute("data-next-quantity-selector-id") || "";
    this.detectPackageContext();
    this.setupStoreSubscriptions();
    this.setupQuantityListeners();
    this.setupCurrencyChangeListener();
    await this.performInitialUpdate();
    this.logger.debug(`ProductDisplayEnhancer initialized with package ${this.packageId}, path: ${this.displayPath}, format: ${this.formatType}, multiplyByQuantity: ${this.multiplyByQuantity}`);
  }
  setupStoreSubscriptions() {
    this.subscribe(useCampaignStore, this.handleCampaignUpdate.bind(this));
    this.subscribe(useCartStore, this.handleCartUpdate.bind(this));
    this.campaignState = useCampaignStore.getState();
    this.loadPackageData();
  }
  handleCampaignUpdate(campaignState) {
    this.campaignState = campaignState;
    this.loadPackageData();
    this.updateDisplay();
  }
  handleCartUpdate() {
    this.updateDisplay();
  }
  setupCurrencyChangeListener() {
    super.setupCurrencyChangeListener();
    document.addEventListener("next:currency-changed", async () => {
      this.logger.debug("Currency changed, reloading package data");
      this.campaignState = useCampaignStore.getState();
      this.loadPackageData();
      await this.updateDisplay();
    });
  }
  setupQuantityListeners() {
    if (!this.multiplyByQuantity) return;
    this.eventBus.on("upsell:quantity-changed", (data) => {
      if (this.quantitySelectorId && data.selectorId === this.quantitySelectorId) {
        this.currentQuantity = data.quantity;
        this.updateDisplay();
      } else if (!this.quantitySelectorId && !data.selectorId) {
        if (data.packageId === this.packageId) {
          this.currentQuantity = data.quantity;
          this.updateDisplay();
        }
      } else if (!this.quantitySelectorId) {
        const container = this.element.closest("[data-next-selector-id]");
        if (container) {
          const containerSelectorId = container.getAttribute("data-next-selector-id");
          if (containerSelectorId === data.selectorId) {
            this.currentQuantity = data.quantity;
            this.updateDisplay();
          }
        } else if (data.packageId === this.packageId) {
          this.currentQuantity = data.quantity;
          this.updateDisplay();
        }
      }
    });
    if (this.quantitySelectorId) {
      const quantityDisplay = document.querySelector(
        `[data-next-upsell-quantity="display"][data-next-quantity-selector-id="${this.quantitySelectorId}"]`
      );
      if (quantityDisplay && quantityDisplay.textContent) {
        const qty = parseInt(quantityDisplay.textContent, 10);
        if (!isNaN(qty)) {
          this.currentQuantity = qty;
        }
      }
    } else {
      const container = this.element.closest('[data-next-upsell="offer"]');
      if (container) {
        const quantityDisplay = container.querySelector('[data-next-upsell-quantity="display"]');
        if (quantityDisplay && quantityDisplay.textContent) {
          const qty = parseInt(quantityDisplay.textContent, 10);
          if (!isNaN(qty)) {
            this.currentQuantity = qty;
          }
        }
      }
    }
  }
  // PRESERVE: Package context detection
  detectPackageContext() {
    const context = DisplayContextProvider.resolve(this.element);
    if (context?.packageId) {
      this.contextPackageId = context.packageId;
    } else {
      this.contextPackageId = PackageContextResolver.findPackageId(this.element);
    }
    const parsed = AttributeParser.parseDisplayPath(this.displayPath);
    if (parsed.object === "package" && parsed.property.includes(".")) {
      const parts = parsed.property.split(".");
      if (parts[0] && !isNaN(Number(parts[0]))) {
        this.packageId = Number(parts[0]);
        this.property = parts.slice(1).join(".");
      }
    } else if (this.contextPackageId) {
      this.packageId = this.contextPackageId;
    }
    if (!this.packageId) {
      this.logger.warn("No package context found - package ID required");
    }
  }
  loadPackageData() {
    if (!this.packageId || !this.campaignState) return;
    const packages = this.campaignState.data?.packages || this.campaignState.packages;
    this.packageData = packages?.find((pkg) => pkg.ref_id === this.packageId);
    if (!this.packageData) {
      this.logger.warn(`Package ${this.packageId} not found in campaign data`);
    } else {
      this.logger.debug(`Package ${this.packageId} loaded with price: ${this.packageData.price} ${this.campaignState.data?.currency || ""}`);
    }
  }
  getPropertyValue() {
    if (!this.packageData || !this.property) return void 0;
    if (this.displayPath?.startsWith("campaign.")) {
      return this.getCampaignProperty(this.campaignState, this.property);
    }
    const calculatedValue = this.getCalculatedProperty(this.property);
    if (calculatedValue !== void 0) {
      if (this.multiplyByQuantity && typeof calculatedValue === "number") {
        return calculatedValue * this.currentQuantity;
      }
      return calculatedValue;
    }
    const value = this.getPackageValue(this.packageData, this.property);
    if (this.multiplyByQuantity && this.isPriceProperty(this.property)) {
      const numericValue = this.parseNumericValue(value);
      if (numericValue !== null) {
        return numericValue * this.currentQuantity;
      }
    }
    return value;
  }
  isPriceProperty(property) {
    const priceProperties = [
      "price",
      "price_total",
      "price_retail",
      "price_retail_total",
      "discountedPrice",
      "discountedPriceTotal",
      "finalPrice",
      "finalPriceTotal",
      "savingsAmount",
      "discountAmount"
    ];
    return priceProperties.includes(property);
  }
  parseNumericValue(value) {
    if (typeof value === "number") return value;
    if (typeof value === "string") {
      const cleaned = value.replace(/[^0-9.-]/g, "");
      const parsed = parseFloat(cleaned);
      return isNaN(parsed) ? null : parsed;
    }
    return null;
  }
  // Override to handle special element types and container hiding
  updateElementContent(value) {
    if (this.element instanceof HTMLInputElement || this.element instanceof HTMLTextAreaElement) {
      this.element.value = value;
    } else if (this.element instanceof HTMLImageElement) {
      this.element.src = value;
      this.element.alt = "Product image";
    } else {
      this.element.textContent = value;
    }
  }
  // Override to handle container hiding support
  hideElement() {
    this.element.style.display = "none";
    this.addClass("display-hidden");
    this.removeClass("display-visible");
    const container = this.element.closest('[data-container="true"]');
    if (container) {
      container.style.display = "none";
    }
  }
  showElement() {
    this.element.style.display = "";
    this.addClass("display-visible");
    this.removeClass("display-hidden");
    const container = this.element.closest('[data-container="true"]');
    if (container) {
      container.style.display = "";
    }
  }
  update(data) {
    if (data) {
      this.handleCampaignUpdate(data);
    } else {
      this.updateDisplay();
    }
  }
  // PRESERVE: Advanced calculations
  getCalculatedProperty(property) {
    if (!this.packageData) return void 0;
    const calculatorInput = {
      price: parseFloat(this.packageData.price || "0"),
      retailPrice: parseFloat(this.packageData.price_retail || "0"),
      quantity: this.packageData.qty || 1,
      priceTotal: parseFloat(this.packageData.price_total || "0"),
      retailPriceTotal: parseFloat(this.packageData.price_retail_total || "0")
    };
    const metrics = PriceCalculator.calculatePackageMetrics(calculatorInput);
    const mappedPath = getPropertyMapping("package", property);
    if (mappedPath && mappedPath.startsWith("_calculated.")) {
      const calculatedProp = mappedPath.replace("_calculated.", "");
      switch (calculatedProp) {
        case "savingsAmount":
          return metrics.totalSavings;
        case "savingsPercentage":
          return metrics.totalSavingsPercentage;
        case "hasSavings":
          return metrics.hasSavings;
        case "isBundle":
          return (this.packageData.qty || 1) > 1;
        case "discountedPrice":
          return this.calculateDiscountedPrice();
        case "discountedPriceTotal":
          return this.calculateDiscountedPriceTotal();
        case "discountAmount":
          return this.calculatePackageDiscountAmount();
        case "hasDiscount":
          return this.calculatePackageDiscountAmount() > 0;
        case "finalPrice":
          return this.calculateFinalPrice();
        case "finalPriceTotal":
          return this.calculateFinalPriceTotal();
        case "totalSavingsAmount":
          return this.calculateTotalSavingsAmount();
        case "totalSavingsPercentage":
          return this.calculateTotalSavingsPercentage();
        case "totalSavingsWithDiscounts":
          return this.calculateTotalSavingsAmount();
        // Alias
        case "totalSavingsPercentageWithDiscounts":
          return this.calculateTotalSavingsPercentage();
        // Alias
        case "hasTotalSavings":
          return this.calculateHasTotalSavings();
      }
    }
    switch (property) {
      // Standardized camelCase properties
      case "savingsAmount":
        return metrics.totalSavings;
      case "savingsPercentage":
        return metrics.totalSavingsPercentage;
      case "unitPrice":
        return DisplayFormatter.formatCurrency(metrics.unitPrice);
      case "unitRetailPrice":
        return DisplayFormatter.formatCurrency(metrics.unitRetailPrice);
      case "unitSavings":
        return DisplayFormatter.formatCurrency(metrics.unitSavings);
      case "unitSavingsPercentage":
        this.logger.warn("[PERCENTAGE DEBUG] ProductDisplayEnhancer returning unitSavingsPercentage:", {
          unitSavingsPercentage: metrics.unitSavingsPercentage,
          unitSavingsPercentageType: typeof metrics.unitSavingsPercentage
        });
        return metrics.unitSavingsPercentage;
      // Boolean helpers
      case "hasSavings":
        return metrics.hasSavings;
      case "hasRetailPrice":
        return metrics.unitRetailPrice > 0 && metrics.unitRetailPrice !== metrics.unitPrice;
      case "isBundle":
        return (this.packageData.qty || 1) > 1;
      case "isRecurring":
        return this.packageData.is_recurring === true;
      // Raw values for calculations
      case "savingsAmount.raw":
        return metrics.totalSavings;
      case "savingsPercentage.raw":
        return metrics.totalSavingsPercentage;
      case "unitPrice.raw":
        return metrics.unitPrice;
      case "unitRetailPrice.raw":
        return metrics.unitRetailPrice;
      // Discount-adjusted prices
      case "discountedPrice":
        return this.calculateDiscountedPrice();
      case "discountedPriceTotal":
        return this.calculateDiscountedPriceTotal();
      case "discountAmount":
        return this.calculatePackageDiscountAmount();
      case "hasDiscount":
        return this.calculatePackageDiscountAmount() > 0;
      case "finalPrice":
        return this.calculateFinalPrice();
      case "finalPriceTotal":
        return this.calculateFinalPriceTotal();
      // Total savings (retail + discounts)
      case "totalSavingsAmount":
      case "totalSavingsWithDiscounts":
        return this.calculateTotalSavingsAmount();
      case "totalSavingsPercentage":
      case "totalSavingsPercentageWithDiscounts":
        return this.calculateTotalSavingsPercentage();
      case "hasTotalSavings":
        return this.calculateHasTotalSavings();
      // Raw values for total savings
      case "totalSavingsAmount.raw":
      case "totalSavingsWithDiscounts.raw":
        return this.calculateTotalSavingsAmountRaw();
      case "totalSavingsPercentage.raw":
      case "totalSavingsPercentageWithDiscounts.raw":
        return this.calculateTotalSavingsPercentageRaw();
      default:
        return void 0;
    }
  }
  calculatePackageDiscountAmount() {
    if (!this.packageData) return 0;
    const cartStore = useCartStore.getState();
    const appliedCoupons = cartStore.appliedCoupons || [];
    let totalDiscount = 0;
    for (const appliedCoupon of appliedCoupons) {
      const coupon = appliedCoupon.definition;
      if (coupon.scope === "package" && coupon.packageIds) {
        if (!coupon.packageIds.includes(this.packageData.ref_id)) {
          continue;
        }
      } else if (coupon.scope === "package") {
        continue;
      }
      const packageTotal = parseFloat(this.packageData.price_total || "0") || parseFloat(this.packageData.price || "0") * (this.packageData.qty || 1);
      if (coupon.type === "percentage") {
        const discount = packageTotal * (coupon.value / 100);
        totalDiscount += coupon.maxDiscount ? Math.min(discount, coupon.maxDiscount) : discount;
      } else if (coupon.type === "fixed" && coupon.scope === "order") {
        const cartSubtotal = cartStore.subtotal;
        if (cartSubtotal > 0) {
          const packageProportion = packageTotal / cartSubtotal;
          totalDiscount += coupon.value * packageProportion;
        }
      }
    }
    return Math.min(totalDiscount, parseFloat(this.packageData.price_total || "0"));
  }
  calculateDiscountedPrice() {
    if (!this.packageData) return 0;
    const unitPrice = parseFloat(this.packageData.price || "0");
    const quantity = this.packageData.qty || 1;
    const discountAmount = this.calculatePackageDiscountAmount();
    const discountPerUnit = quantity > 0 ? discountAmount / quantity : 0;
    return Math.max(0, unitPrice - discountPerUnit);
  }
  calculateDiscountedPriceTotal() {
    if (!this.packageData) return 0;
    const packageTotal = parseFloat(this.packageData.price_total || "0") || parseFloat(this.packageData.price || "0") * (this.packageData.qty || 1);
    const discountAmount = this.calculatePackageDiscountAmount();
    return Math.max(0, packageTotal - discountAmount);
  }
  calculateFinalPrice() {
    return this.calculateDiscountedPrice();
  }
  calculateFinalPriceTotal() {
    return this.calculateDiscountedPriceTotal();
  }
  calculateTotalSavingsAmount() {
    if (!this.packageData) return 0;
    const calculatorInput = {
      price: parseFloat(this.packageData.price || "0"),
      retailPrice: parseFloat(this.packageData.price_retail || "0"),
      quantity: this.packageData.qty || 1,
      priceTotal: parseFloat(this.packageData.price_total || "0"),
      retailPriceTotal: parseFloat(this.packageData.price_retail_total || "0")
    };
    const metrics = PriceCalculator.calculatePackageMetrics(calculatorInput);
    const retailSavings = metrics.totalSavings || 0;
    const discountAmount = this.calculatePackageDiscountAmount();
    return retailSavings + discountAmount;
  }
  calculateTotalSavingsAmountRaw() {
    return this.calculateTotalSavingsAmount();
  }
  calculateTotalSavingsPercentage() {
    if (!this.packageData) return 0;
    const retailTotal = parseFloat(this.packageData.price_retail_total || "0") || parseFloat(this.packageData.price_total || "0");
    if (retailTotal <= 0) return 0;
    const finalPrice = this.calculateFinalPriceTotal();
    const totalSavings = retailTotal - finalPrice;
    const percentage = totalSavings / retailTotal * 100;
    return Math.min(100, Math.max(0, percentage));
  }
  calculateTotalSavingsPercentageRaw() {
    return this.calculateTotalSavingsPercentage();
  }
  calculateHasTotalSavings() {
    if (!this.packageData) return false;
    const totalSavings = this.calculateTotalSavingsAmount();
    return totalSavings > 0;
  }
  getPackageValue(packageData, property) {
    const mappedPath = getPropertyMapping("package", property);
    if (mappedPath && !mappedPath.startsWith("_calculated.")) {
      return PropertyResolver.getNestedProperty(packageData, mappedPath);
    }
    return PropertyResolver.getNestedProperty(packageData, property);
  }
  getCampaignProperty(campaignState, property) {
    const campaignData = campaignState.data;
    if (!campaignData) {
      return "";
    }
    switch (property) {
      case "name":
        return campaignData.name;
      case "currency":
        return campaignData.currency;
      case "language":
        return campaignData.language;
      default:
        this.logger.warn(`Unknown campaign property: ${property}`);
        return "";
    }
  }
  // COMPATIBILITY METHODS
  getPackageProperty(property) {
    const oldProperty = this.property;
    this.property = property;
    const value = this.getPropertyValue();
    this.property = oldProperty;
    return value;
  }
  setPackageContext(packageId) {
    this.packageId = packageId;
    this.loadPackageData();
    this.updateDisplay();
  }
}
export {
  ProductDisplayEnhancer
};
