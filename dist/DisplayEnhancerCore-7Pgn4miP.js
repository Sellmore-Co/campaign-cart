import { B as BaseEnhancer } from "./BaseEnhancer-Bbss3g8X.js";
import { A as AttributeParser } from "./analytics-BZUvO6mp.js";
const _DisplayFormatter = class _DisplayFormatter {
  static formatValue(value, format = "auto") {
    if (value === null || value === void 0) {
      return "";
    }
    switch (format) {
      case "currency":
        return this.formatCurrency(value);
      case "number":
        return this.formatNumber(value);
      case "boolean":
        return this.formatBoolean(value);
      case "date":
        return this.formatDate(value);
      case "percentage":
        return this.formatPercentage(value);
      case "auto":
      default:
        return this.formatAuto(value);
    }
  }
  static formatCurrency(value) {
    const numValue = this.toNumber(value);
    if (isNaN(numValue)) return String(value);
    return this.currencyFormatter.format(numValue);
  }
  static formatNumber(value) {
    const numValue = this.toNumber(value);
    if (isNaN(numValue)) return String(value);
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
    const numValue = this.toNumber(value);
    if (isNaN(numValue)) return String(value);
    return `${Math.round(numValue)}%`;
  }
  static formatAuto(value) {
    if (typeof value === "boolean") {
      return this.formatBoolean(value);
    }
    if (typeof value === "number") {
      if (Number.isInteger(value) && value >= 0 && value <= 10) {
        return value.toString();
      }
      const valueStr = value.toString();
      if (valueStr.includes(".") && valueStr.split(".")[1]?.length === 2) {
        return this.formatCurrency(value);
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
          return this.formatCurrency(numValue);
        }
        return this.formatNumber(numValue);
      }
    }
    return String(value);
  }
  static toNumber(value) {
    if (typeof value === "number") return value;
    if (typeof value === "string") {
      const cleaned = value.replace(/[$,\s]/g, "");
      return parseFloat(cleaned);
    }
    return parseFloat(value);
  }
};
_DisplayFormatter.currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD"
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
    const explicitFormat = this.getAttribute("data-next-format");
    this.formatType = explicitFormat || this.getDefaultFormatType(this.property || "");
    this.hideIfZero = this.getAttribute("data-hide-if-zero") === "true";
    this.hideIfFalse = this.getAttribute("data-hide-if-false") === "true";
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
    if (currencyProperties.some((term) => propertyLower.includes(term))) {
      return "currency";
    }
    if (propertyLower.includes("percentage") || propertyLower.includes("percent") || propertyLower.endsWith("pct") || propertyLower.endsWith("rate")) {
      return "percentage";
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
  async performInitialUpdate() {
    await this.updateDisplay();
  }
  async updateDisplay() {
    if (this.element.style.display === "none" || this.element.classList.contains("next-hidden")) {
      return;
    }
    try {
      let value = this.getPropertyValue();
      if (typeof value === "number" || typeof value === "string" && !isNaN(Number(value))) {
        const numValue = Number(value);
        if (this.divideBy) value = numValue / this.divideBy;
        if (this.multiplyBy) value = numValue * this.multiplyBy;
      }
      if (value === this.lastValue) return;
      this.lastValue = value;
      if (this.shouldHideElement(value)) {
        this.hideElement();
        return;
      }
      const formattedValue = DisplayFormatter.formatValue(value, this.formatType);
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
  PropertyResolver as P
};
