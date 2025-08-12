import { B as BaseEnhancer } from "./BaseEnhancer-0Il_MRjC.js";
import { A as AttributeParser } from "./index-Dew7BpNC.js";
import { L as Logger, D as DisplayValueValidator } from "./utils-BvUgT8Ms.js";
const PROPERTY_MAPPINGS = {
  // Cart properties
  cart: {
    // Booleans
    isEmpty: "isEmpty",
    hasItems: "!isEmpty",
    // Negation
    hasSavings: "totals.hasSavings",
    hasTotalSavings: "totals.hasTotalSavings",
    // Quantities (number of packages in cart)
    quantity: "totalQuantity",
    itemCount: "items.length",
    count: "totals.count",
    // Pre-formatted financial values from store
    subtotal: { path: "totals.subtotal.formatted", preformatted: true },
    total: { path: "totals.total.formatted", preformatted: true },
    shipping: { path: "totals.shipping.formatted", preformatted: true },
    tax: { path: "totals.tax.formatted", preformatted: true },
    discounts: { path: "totals.discounts.formatted", preformatted: true },
    savingsAmount: { path: "totals.savings.formatted", preformatted: true, fallback: "$0.00" },
    savingsPercentage: { path: "totals.savingsPercentage.formatted", preformatted: true, fallback: "0%" },
    compareTotal: { path: "totals.compareTotal.formatted", preformatted: true },
    totalSavingsAmount: { path: "totals.totalSavings.formatted", preformatted: true, fallback: "$0.00" },
    totalSavingsPercentage: { path: "totals.totalSavingsPercentage.formatted", preformatted: true, fallback: "0%" },
    // Raw numeric values that need formatting
    "subtotal.raw": { path: "totals.subtotal.value", format: "currency" },
    "total.raw": { path: "totals.total.value", format: "currency" },
    "shipping.raw": { path: "totals.shipping.value", format: "currency" },
    "tax.raw": { path: "totals.tax.value", format: "currency" },
    "discounts.raw": { path: "totals.discounts.value", format: "currency" },
    "savingsAmount.raw": { path: "totals.savings.value", format: "currency" },
    "savingsPercentage.raw": { path: "totals.savingsPercentage.value", format: "percentage" },
    "compareTotal.raw": { path: "totals.compareTotal.value", format: "currency" },
    "totalSavingsAmount.raw": { path: "totals.totalSavings.value", format: "currency" },
    "totalSavingsPercentage.raw": { path: "totals.totalSavingsPercentage.value", format: "percentage" },
    // Coupon/discount code properties
    hasCoupons: { path: "appliedCoupons.length", format: "boolean", validator: (v) => v > 0 },
    hasCoupon: { path: "appliedCoupons.length", format: "boolean", validator: (v) => v > 0 },
    // Alias for hasCoupons
    couponCount: { path: "appliedCoupons.length", format: "number" },
    "coupons[0].code": { path: "appliedCoupons.0.code", format: "text" },
    "coupons[0].discount": { path: "appliedCoupons.0.discount", format: "currency" },
    "coupons[1].code": { path: "appliedCoupons.1.code", format: "text" },
    "coupons[1].discount": { path: "appliedCoupons.1.discount", format: "currency" },
    // Convenience aliases
    discountCode: { path: "appliedCoupons.0.code", format: "text", fallback: "" },
    discountCodes: {
      path: "appliedCoupons",
      format: "text",
      validator: (coupons) => {
        if (!Array.isArray(coupons) || coupons.length === 0) return "";
        return coupons.map((c) => c.code).join(", ");
      }
    }
  },
  // Package properties
  package: {
    // Direct API properties (need formatting)
    ref_id: { path: "ref_id", format: "number" },
    external_id: "external_id",
    qty: { path: "qty", format: "number" },
    price: { path: "price", format: "currency" },
    price_total: { path: "price_total", format: "currency" },
    price_retail: { path: "price_retail", format: "currency" },
    price_retail_total: { path: "price_retail_total", format: "currency" },
    price_recurring: { path: "price_recurring", format: "currency" },
    is_recurring: "is_recurring",
    interval: "interval",
    interval_count: { path: "interval_count", format: "number" },
    // Enhanced properties (calculated values)
    unitPrice: { path: "_calculated.unitPrice", format: "currency" },
    unitRetailPrice: { path: "_calculated.unitRetailPrice", format: "currency" },
    packageTotal: { path: "price_total", format: "currency" },
    comparePrice: { path: "price_retail_total", format: "currency" },
    compareTotal: { path: "price_retail_total", format: "currency" },
    savingsAmount: {
      path: "_calculated.savingsAmount",
      format: "currency",
      validator: (v) => Math.max(0, Number(v) || 0),
      fallback: 0,
      debugInfo: true
    },
    savingsPercentage: {
      path: "_calculated.savingsPercentage",
      format: "percentage",
      validator: (v) => Math.min(100, Math.max(0, Number(v) || 0)),
      fallback: 0
    },
    unitSavings: { path: "_calculated.unitSavings", format: "currency" },
    unitSavingsPercentage: { path: "_calculated.unitSavingsPercentage", format: "percentage" },
    hasSavings: "_calculated.hasSavings",
    isRecurring: "is_recurring",
    isBundle: "_calculated.isBundle",
    unitsInPackage: { path: "qty", format: "number" },
    // Discount-adjusted prices (calculated with cart context)
    discountedPrice: { path: "_calculated.discountedPrice", format: "currency" },
    discountedPriceTotal: { path: "_calculated.discountedPriceTotal", format: "currency" },
    discountAmount: { path: "_calculated.discountAmount", format: "currency" },
    hasDiscount: "_calculated.hasDiscount",
    finalPrice: { path: "_calculated.finalPrice", format: "currency" },
    finalPriceTotal: { path: "_calculated.finalPriceTotal", format: "currency" }
  },
  // Selection properties (for package selectors)
  selection: {
    // Basic selection properties
    hasSelection: { path: "hasSelection", format: "boolean" },
    packageId: { path: "packageId", format: "number" },
    quantity: { path: "quantity", format: "number" },
    name: "name",
    // Pricing - raw values that need formatting
    price: { path: "price", format: "currency" },
    total: { path: "total", format: "currency" },
    compareTotal: { path: "compareTotal", format: "currency" },
    unitPrice: { path: "unitPrice", format: "currency" },
    // Savings
    savingsAmount: { path: "savingsAmount", format: "currency" },
    savingsPercentage: { path: "savingsPercentage", format: "percentage" },
    hasSavings: { path: "hasSavings", format: "boolean" },
    // Bundle info
    isBundle: { path: "isBundle", format: "boolean" },
    totalUnits: { path: "totalUnits", format: "number" },
    // Advanced calculations
    monthlyPrice: { path: "monthlyPrice", format: "currency" },
    yearlyPrice: { path: "yearlyPrice", format: "currency" },
    pricePerDay: { path: "pricePerDay", format: "currency" },
    savingsPerUnit: { path: "savingsPerUnit", format: "currency" },
    discountAmount: { path: "discountAmount", format: "currency" },
    // Aliases
    price_total: { path: "total", format: "currency" },
    price_retail_total: { path: "compareTotal", format: "currency" },
    savings: { path: "savingsAmount", format: "currency" },
    pricePerUnit: { path: "unitPrice", format: "currency" },
    totalQuantity: { path: "totalUnits", format: "number" },
    isMultiPack: { path: "isBundle", format: "boolean" },
    isSingleUnit: { path: "isSingleUnit", format: "boolean" },
    // Mathematical expressions
    "_expression": true
    // Flag to enable expression evaluation
  },
  // Shipping properties (context-based)
  shipping: {
    // Properties available within data-next-shipping-id context
    isFree: "_calculated.isFree",
    cost: "_calculated.cost",
    price: "_calculated.price",
    // Alias for cost
    name: "_calculated.name",
    code: "_calculated.code",
    method: "_calculated.method",
    // Full method object
    id: "_calculated.id",
    refId: "_calculated.refId"
    // Alias for id
  },
  // Order properties
  order: {
    // Loading states
    isLoading: "isLoading",
    hasError: "error",
    errorMessage: "error",
    // Order basics
    id: "order.id",
    number: "order.number",
    // API properties (keep snake_case)
    ref_id: "order.ref_id",
    created_at: { path: "created_at", format: "date" },
    total_incl_tax: { path: "total_incl_tax", format: "currency" },
    order_status_url: "order_status_url",
    is_test: "is_test",
    supports_upsells: "supports_upsells",
    payment_method: { path: "payment_method", format: "text" },
    shipping_method: { path: "shipping_method", format: "text" },
    // Enhanced properties (camelCase)
    refId: "order.ref_id",
    createdAt: { path: "order.created_at", format: "date" },
    total: { path: "order.total_incl_tax", format: "currency", fallback: 0 },
    statusUrl: "order.order_status_url",
    isTest: "order.is_test",
    supportsUpsells: "order.supports_post_purchase_upsells",
    paymentMethod: { path: "order.payment_method", format: "text", fallback: "Credit Card" },
    shippingMethod: { path: "order.shipping_method", format: "text" },
    status: { path: "order.status", fallback: "Completed" },
    currency: "order.currency",
    testBadge: { path: "order.is_test", format: "text" },
    // Will need custom formatting
    // Financial properties (check if these come pre-formatted from API)
    subtotal: { path: "order.total_excl_tax", format: "currency" },
    tax: { path: "order.total_tax", format: "currency" },
    shipping: { path: "order.shipping_incl_tax", format: "currency" },
    shippingExclTax: { path: "order.shipping_excl_tax", format: "currency" },
    shippingTax: { path: "order.shipping_tax", format: "currency" },
    discounts: { path: "order.total_discounts", format: "currency" },
    savings: { path: "_calculated.savings", format: "currency" },
    savingsAmount: { path: "_calculated.savingsAmount", format: "currency" },
    savingsPercentage: { path: "_calculated.savingsPercentage", format: "percentage" },
    hasSavings: "_calculated.hasSavings",
    // Customer properties
    "customer.name": "customer.name",
    "customer.firstName": "customer.firstName",
    "customer.lastName": "customer.lastName",
    "customer.email": "customer.email",
    "customer.phone": "customer.phone",
    // Address properties - explicitly text format
    "shippingAddress.full": { path: "shippingAddress.full", format: "text" },
    "shippingAddress.line1": { path: "shippingAddress.line1", format: "text" },
    "shippingAddress.line2": { path: "shippingAddress.line2", format: "text" },
    "shippingAddress.city": { path: "shippingAddress.city", format: "text" },
    "shippingAddress.state": { path: "shippingAddress.state", format: "text" },
    "shippingAddress.country": { path: "shippingAddress.country", format: "text" },
    "shippingAddress.zip": { path: "shippingAddress.zip", format: "text" },
    "shippingAddress.postcode": { path: "shippingAddress.postcode", format: "text" },
    "billingAddress.full": { path: "billingAddress.full", format: "text" },
    "billingAddress.line1": { path: "billingAddress.line1", format: "text" },
    "billingAddress.line2": { path: "billingAddress.line2", format: "text" },
    "billingAddress.city": { path: "billingAddress.city", format: "text" },
    "billingAddress.state": { path: "billingAddress.state", format: "text" },
    "billingAddress.country": { path: "billingAddress.country", format: "text" },
    "billingAddress.zip": { path: "billingAddress.zip", format: "text" },
    "billingAddress.postcode": { path: "billingAddress.postcode", format: "text" },
    // Calculated boolean flags
    hasItems: "_calculated.hasItems",
    isEmpty: "_calculated.isEmpty",
    hasShipping: "_calculated.hasShipping",
    hasTax: "_calculated.hasTax",
    hasDiscounts: "_calculated.hasDiscounts",
    hasUpsells: "_calculated.hasUpsells",
    // Line items properties
    "lines.count": "_calculated.lines.count",
    "lines.totalQuantity": "_calculated.lines.totalQuantity",
    "lines.upsellCount": "_calculated.lines.upsellCount",
    "lines.mainProduct": "_calculated.lines.mainProduct",
    "lines.mainProductSku": "_calculated.lines.mainProductSku",
    // Formatted values
    "total.formatted": "_formatted.total",
    "createdAt.formatted": "_formatted.createdAt"
  }
};
function getPropertyConfig(objectType, propertyName) {
  const mappings = PROPERTY_MAPPINGS[objectType];
  if (!mappings) return null;
  const mapping = mappings[propertyName];
  if (!mapping || typeof mapping === "boolean") return null;
  if (typeof mapping === "string") {
    return { path: mapping };
  }
  return mapping;
}
function getPropertyMapping(objectType, propertyName) {
  const config = getPropertyConfig(objectType, propertyName);
  return config?.path;
}
const _DisplayErrorBoundary = class _DisplayErrorBoundary {
  // 1 minute
  /**
   * Wrap a synchronous function with error handling
   */
  static wrap(fn, fallback, context) {
    try {
      return fn();
    } catch (error) {
      this.handleError(error, context || { operation: "unknown" });
      return fallback;
    }
  }
  /**
   * Wrap an async function with error handling
   */
  static async wrapAsync(fn, fallback, context) {
    try {
      return await fn();
    } catch (error) {
      this.handleError(error, context || { operation: "unknown" });
      return fallback;
    }
  }
  /**
   * Try multiple strategies in order until one succeeds
   */
  static tryStrategies(strategies, fallback, context) {
    for (let i = 0; i < strategies.length; i++) {
      try {
        const strategy = strategies[i];
        if (strategy) {
          return strategy();
        }
      } catch (error) {
        if (i === strategies.length - 1) {
          this.handleError(error, {
            ...context,
            operation: context?.operation || "tryStrategies",
            strategy: i
          });
        }
      }
    }
    return fallback;
  }
  /**
   * Register a custom error handler
   */
  static addErrorHandler(handler) {
    this.errorHandlers.push(handler);
  }
  /**
   * Remove a custom error handler
   */
  static removeErrorHandler(handler) {
    const index = this.errorHandlers.indexOf(handler);
    if (index > -1) {
      this.errorHandlers.splice(index, 1);
    }
  }
  /**
   * Handle an error with context
   */
  static handleError(error, context) {
    const errorKey = `${context.operation}:${error.message}`;
    const now = Date.now();
    const cached = this.errorCache.get(errorKey);
    if (cached) {
      if (now - cached.lastError.getTime() < this.ERROR_WINDOW_MS) {
        cached.count++;
        if (cached.count > this.ERROR_THRESHOLD) {
          return;
        }
      } else {
        cached.count = 1;
        cached.lastError = new Date(now);
      }
    } else {
      this.errorCache.set(errorKey, { count: 1, lastError: new Date(now) });
    }
    this.logger.error(`[Display Error] ${context.operation}:`, {
      error: error.message,
      stack: error.stack,
      context
    });
    this.errorHandlers.forEach((handler) => {
      try {
        handler(error, context);
      } catch (handlerError) {
        this.logger.error("Error in error handler:", handlerError);
      }
    });
  }
  /**
   * Clear error cache (useful for testing)
   */
  static clearErrorCache() {
    this.errorCache.clear();
  }
  /**
   * Get error statistics
   */
  static getErrorStats() {
    return new Map(this.errorCache);
  }
};
_DisplayErrorBoundary.logger = new Logger("DisplayErrorBoundary");
_DisplayErrorBoundary.errorHandlers = [];
_DisplayErrorBoundary.errorCache = /* @__PURE__ */ new Map();
_DisplayErrorBoundary.ERROR_THRESHOLD = 5;
_DisplayErrorBoundary.ERROR_WINDOW_MS = 6e4;
let DisplayErrorBoundary = _DisplayErrorBoundary;
const _DisplayFormatter = class _DisplayFormatter {
  static formatValue(value, format = "auto", options) {
    return DisplayErrorBoundary.wrap(() => {
      if (value === null || value === void 0) {
        return "";
      }
      switch (format) {
        case "currency":
          return this.formatCurrency(value, options?.hideZeroCents);
        case "number":
          return this.formatNumber(value);
        case "boolean":
          return this.formatBoolean(value);
        case "date":
          return this.formatDate(value);
        case "percentage":
          return this.formatPercentage(value);
        case "text":
          return String(value);
        case "auto":
        default:
          return this.formatAuto(value, options);
      }
    }, "", {
      operation: "formatValue",
      value: String(value),
      format: String(format)
    });
  }
  static formatCurrency(value, hideZeroCents) {
    if (typeof value === "string" && value.includes("$")) {
      return value;
    }
    const numValue = DisplayValueValidator.validateCurrency(value);
    if (hideZeroCents) {
      return this.currencyFormatterNoZeroCents.format(numValue);
    }
    return this.currencyFormatter.format(numValue);
  }
  static formatNumber(value) {
    const numValue = DisplayValueValidator.validateNumber(value);
    return this.numberFormatter.format(numValue);
  }
  static formatBoolean(value) {
    if (typeof value === "boolean") {
      return value ? "Yes" : "No";
    }
    if (typeof value === "string") {
      const lower = value.toLowerCase();
      if (lower === "true" || lower === "1" || lower === "yes") return "Yes";
      if (lower === "false" || lower === "0" || lower === "no") return "No";
    }
    return value ? "Yes" : "No";
  }
  static formatDate(value) {
    if (!value) return "";
    try {
      const date = new Date(value);
      if (isNaN(date.getTime())) return String(value);
      return this.dateFormatter.format(date);
    } catch {
      return String(value);
    }
  }
  static formatPercentage(value) {
    const numValue = DisplayValueValidator.validatePercentage(value);
    return `${Math.round(numValue)}%`;
  }
  static formatAuto(value, options) {
    if (typeof value === "boolean") {
      return this.formatBoolean(value);
    }
    if (typeof value === "number") {
      if (Number.isInteger(value) && value >= 0 && value <= 10) {
        return value.toString();
      }
      const valueStr = value.toString();
      if (valueStr.includes(".") && valueStr.split(".")[1]?.length === 2) {
        return this.formatCurrency(value, options?.hideZeroCents);
      }
      if (Number.isInteger(value) && value >= 0 && value <= 100) {
        return this.formatNumber(value);
      }
      return this.formatNumber(value);
    }
    if (typeof value === "string") {
      const dateValue = new Date(value);
      if (!isNaN(dateValue.getTime()) && value.match(/\d{4}-\d{2}-\d{2}/)) {
        return this.formatDate(value);
      }
      const numValue = Number(value);
      if (!isNaN(numValue) && value.includes(".")) {
        const valueStr = numValue.toString();
        if (valueStr.includes(".") && valueStr.split(".")[1]?.length === 2) {
          return this.formatCurrency(numValue, options?.hideZeroCents);
        }
        return this.formatNumber(numValue);
      }
    }
    return String(value);
  }
};
_DisplayFormatter.currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD"
});
_DisplayFormatter.currencyFormatterNoZeroCents = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2
});
_DisplayFormatter.numberFormatter = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2
});
_DisplayFormatter.dateFormatter = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "long",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit"
});
let DisplayFormatter = _DisplayFormatter;
class PropertyResolver {
  /**
   * Safely gets nested property value from an object
   */
  static getNestedProperty(obj, path) {
    if (!obj || !path) return void 0;
    const keys = path.split(".");
    let current = obj;
    for (const key of keys) {
      if (current === null || current === void 0) {
        return void 0;
      }
      if (key.includes("[") && key.includes("]")) {
        const [arrayKey, indexStr] = key.split("[");
        const index = parseInt(indexStr?.replace("]", "") || "");
        if (arrayKey && !isNaN(index)) {
          current = current[arrayKey];
          if (Array.isArray(current) && index >= 0 && index < current.length) {
            current = current[index];
          } else {
            return void 0;
          }
        } else {
          return void 0;
        }
      } else {
        current = current[key];
      }
    }
    return current;
  }
  /**
   * Checks if a property path exists in an object
   */
  static hasProperty(obj, path) {
    return this.getNestedProperty(obj, path) !== void 0;
  }
  /**
   * Gets property with fallback values
   */
  static getPropertyWithFallbacks(obj, paths) {
    for (const path of paths) {
      const value = this.getNestedProperty(obj, path);
      if (value !== void 0) {
        return value;
      }
    }
    return void 0;
  }
}
class BaseDisplayEnhancer extends BaseEnhancer {
  constructor() {
    super(...arguments);
    this.formatType = "auto";
    this.hideIfZero = false;
    this.hideIfFalse = false;
    this.hideZeroCents = false;
    this.debugMode = false;
  }
  async initialize() {
    this.validateElement();
    this.parseDisplayAttributes();
    this.setupStoreSubscriptions();
    await this.performInitialUpdate();
    this.logger.debug(`${this.constructor.name} initialized with path: ${this.displayPath}`);
  }
  /**
   * Parses display-related attributes from the element
   * Note: Subclasses should NOT override unless they need custom parsing logic
   * (e.g., SelectionDisplayEnhancer extracts selector ID from path)
   */
  parseDisplayAttributes() {
    const displayPath = this.getAttribute("data-next-display");
    if (!displayPath) {
      throw new Error(`${this.constructor.name}: data-next-display attribute is required`);
    }
    this.displayPath = displayPath;
    const parsed = AttributeParser.parseDisplayPath(this.displayPath);
    this.property = parsed.property;
    const explicitFormat = this.getAttribute("data-next-format") || this.getAttribute("data-format");
    const detectedFormat = this.getDefaultFormatType(this.property || "");
    this.formatType = explicitFormat || detectedFormat;
    this.hideIfZero = this.getAttribute("data-hide-if-zero") === "true";
    this.hideIfFalse = this.getAttribute("data-hide-if-false") === "true";
    this.hideZeroCents = this.getAttribute("data-hide-zero-cents") === "true";
    const divideBy = this.getAttribute("data-divide-by");
    if (divideBy) this.divideBy = parseFloat(divideBy);
    const multiplyBy = this.getAttribute("data-multiply-by");
    if (multiplyBy) this.multiplyBy = parseFloat(multiplyBy);
  }
  /**
   * Determines the default format type based on property name
   * This enables smart formatting for common property patterns
   */
  getDefaultFormatType(property) {
    if (this.displayPath) {
      const parts = this.displayPath.split(".");
      if (parts.length >= 2) {
        const [objectType, ...propParts] = parts;
        let propName = propParts.join(".");
        if (objectType === "selection" && propParts.length >= 2) {
          propName = propParts.slice(1).join(".");
        }
        const config = getPropertyConfig(objectType, propName);
        if (config?.format) {
          return config.format;
        }
      }
    }
    const currencyProperties = [
      "price",
      "cost",
      "amount",
      "total",
      "subtotal",
      "retail",
      "compare",
      "savings",
      "shipping",
      "tax",
      "discount",
      "fee",
      "charge",
      "payment",
      "balance",
      "credit",
      "debit",
      "refund",
      "revenue",
      "msrp",
      "value"
    ];
    const propertyLower = property.toLowerCase();
    if (propertyLower.endsWith(".raw")) {
      return "auto";
    }
    if (propertyLower.includes("percentage") || propertyLower.includes("percent") || propertyLower.endsWith("pct") || propertyLower.endsWith("rate")) {
      return "percentage";
    }
    if (currencyProperties.some((term) => propertyLower.includes(term))) {
      return "currency";
    }
    if (propertyLower.startsWith("is") || propertyLower.startsWith("has") || propertyLower.startsWith("can") || propertyLower.startsWith("should") || propertyLower.startsWith("enabled") || propertyLower.startsWith("disabled") || propertyLower.includes("visible") || propertyLower.includes("active")) {
      return "boolean";
    }
    if (propertyLower.includes("date") || propertyLower.includes("time") || propertyLower.endsWith("at") || propertyLower.endsWith("on")) {
      return "date";
    }
    if (propertyLower.includes("quantity") || propertyLower.includes("count") || propertyLower.includes("qty") || propertyLower.includes("units") || propertyLower.includes("items")) {
      return "number";
    }
    return "auto";
  }
  getPropertyValueWithValidation() {
    return DisplayErrorBoundary.wrap(() => {
      const rawValue = this.getPropertyValue();
      if (this.displayPath) {
        const parsed = AttributeParser.parseDisplayPath(this.displayPath);
        const config = getPropertyConfig(parsed.object, this.property || parsed.property);
        if (config) {
          let value = rawValue;
          if (config.validator && value !== void 0 && value !== null) {
            try {
              value = config.validator(value);
            } catch (error) {
              this.logger.warn(`Validator failed for ${this.displayPath}:`, error);
              value = config.fallback;
            }
          }
          if ((value === null || value === void 0) && config.fallback !== void 0) {
            value = config.fallback;
          }
          return value;
        }
      }
      return rawValue;
    }, void 0, {
      operation: "getPropertyValueWithValidation",
      property: this.property || "unknown",
      path: this.displayPath || "unknown"
    });
  }
  async performInitialUpdate() {
    await this.updateDisplay();
  }
  async updateDisplay() {
    if (this.element.style.display === "none" || this.element.classList.contains("next-hidden")) {
      return;
    }
    try {
      let value = this.getPropertyValueWithValidation();
      if (value && typeof value === "object" && "_preformatted" in value) {
        const preformattedValue = value.value || "";
        this.updateElementContent(preformattedValue);
        this.showElement();
        if (this.debugMode) {
          this.element.setAttribute("data-format-debug", JSON.stringify({
            path: this.displayPath,
            property: this.property,
            format: "preformatted",
            rawValue: value,
            formattedValue: preformattedValue
          }));
        }
        return;
      }
      let rawValue;
      let structuredFormat;
      if (value && typeof value === "object" && "value" in value && "format" in value) {
        const displayValue = value;
        rawValue = displayValue.value;
        structuredFormat = displayValue.format;
      } else {
        rawValue = value;
      }
      if (typeof rawValue === "number" || typeof rawValue === "string" && !isNaN(Number(rawValue))) {
        const numValue = Number(rawValue);
        if (this.divideBy) rawValue = numValue / this.divideBy;
        if (this.multiplyBy) rawValue = numValue * this.multiplyBy;
      }
      if (rawValue === this.lastValue) return;
      this.lastValue = rawValue;
      if (this.shouldHideElement(rawValue)) {
        this.hideElement();
        return;
      }
      let effectiveFormatType = structuredFormat || this.formatType;
      if (!structuredFormat && this.property && this.property.toLowerCase().includes("percentage") && this.formatType === "auto") {
        effectiveFormatType = "percentage";
      }
      const formattedValue = DisplayFormatter.formatValue(rawValue, effectiveFormatType, {
        hideZeroCents: this.hideZeroCents
      });
      if (this.debugMode) {
        this.element.setAttribute("data-format-debug", JSON.stringify({
          path: this.displayPath,
          property: this.property,
          format: effectiveFormatType,
          rawValue: value,
          formattedValue
        }));
      }
      this.updateElementContent(formattedValue);
      this.showElement();
    } catch (error) {
      this.handleError(error, "updateDisplay");
      this.updateElementContent("N/A");
    }
  }
  shouldHideElement(value) {
    if (this.hideIfZero && (value === 0 || value === "0" || value === 0)) {
      return true;
    }
    if (this.hideIfFalse && !value) {
      return true;
    }
    return false;
  }
  updateElementContent(value) {
    if (this.element instanceof HTMLInputElement || this.element instanceof HTMLTextAreaElement) {
      this.element.value = value;
    } else {
      this.element.textContent = value;
    }
  }
  hideElement() {
    this.element.style.display = "none";
    this.addClass("display-hidden");
    this.removeClass("display-visible");
  }
  showElement() {
    this.element.style.display = "";
    this.addClass("display-visible");
    this.removeClass("display-hidden");
  }
  update() {
    this.updateDisplay();
  }
}
export {
  BaseDisplayEnhancer as B,
  DisplayFormatter as D,
  PropertyResolver as P,
  getPropertyMapping as a,
  getPropertyConfig as g
};
