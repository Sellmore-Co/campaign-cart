import { B as BaseDisplayEnhancer, a as getPropertyMapping, P as PropertyResolver, D as DisplayFormatter } from "./DisplayEnhancerCore-B4ZwUEWy.js";
import { A as AttributeParser } from "./index-CSinXMt-.js";
import { e as useOrderStore, f as configStore } from "./utils-vgQHeO41.js";
import { ApiClient } from "./api-DtVFHPSI.js";
class OrderDisplayEnhancer extends BaseDisplayEnhancer {
  constructor() {
    super(...arguments);
    this.orderState = {};
  }
  async initialize() {
    await this.checkAndLoadOrderFromUrl();
    await super.initialize();
  }
  setupStoreSubscriptions() {
    this.subscribe(useOrderStore, this.handleOrderUpdate.bind(this));
    this.orderState = useOrderStore.getState();
  }
  getPropertyValue() {
    return this.getDisplayValue(this.orderState, this.displayPath);
  }
  update(data) {
    if (data) {
      this.handleOrderUpdate(data);
    } else {
      super.update();
    }
  }
  async checkAndLoadOrderFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    const refId = urlParams.get("ref_id");
    if (refId) {
      const orderStore = useOrderStore.getState();
      if (!orderStore.order && !orderStore.isLoading && orderStore.refId !== refId) {
        try {
          const config = configStore.getState();
          this.apiClient = new ApiClient(config.apiKey);
          await orderStore.loadOrder(refId, this.apiClient);
        } catch (error) {
          this.logger.error("Failed to auto-load order:", error);
        }
      }
    }
  }
  handleOrderUpdate(orderState) {
    try {
      this.orderState = orderState;
      if (orderState.isLoading) {
        this.addClass("next-loading");
        this.removeClass("next-loaded");
        this.removeClass("next-error");
      } else if (orderState.error) {
        this.removeClass("next-loading");
        this.removeClass("next-loaded");
        this.addClass("next-error");
      } else if (orderState.order) {
        this.removeClass("next-loading");
        this.addClass("next-loaded");
        this.removeClass("next-error");
      }
      this.updateDisplay();
    } catch (error) {
      this.handleError(error, "handleOrderUpdate");
      this.updateElementContent("N/A");
      this.addClass("next-error");
    }
  }
  updateElementContent(value) {
    if (this.element.tagName === "A" && this.displayPath?.includes("statusUrl")) {
      this.element.href = value;
      if (!this.element.textContent) {
        this.element.textContent = "View Order Status";
      }
    } else {
      super.updateElementContent(value);
    }
  }
  getDisplayValue(orderState, path) {
    const parsed = AttributeParser.parseDisplayPath(path);
    const property = parsed.property;
    if (!property) {
      return "";
    }
    const propertyStr = property;
    const order = orderState.order;
    if (!order) {
      if (orderState.isLoading) {
        return "Loading...";
      } else if (orderState.error) {
        return "Error";
      }
      return "";
    }
    const mappedPath = getPropertyMapping("order", propertyStr);
    if (mappedPath) {
      if (mappedPath.startsWith("_calculated.")) {
        return this.getCalculatedProperty(order, mappedPath.substring(12));
      }
      if (mappedPath.startsWith("order.")) {
        const value = PropertyResolver.getNestedProperty(order, mappedPath.substring(6));
        if (value !== void 0) {
          return value;
        }
      } else {
        const value = PropertyResolver.getNestedProperty(orderState, mappedPath);
        if (value !== void 0) {
          return value;
        }
      }
    }
    const parts = propertyStr.split(".");
    if (parts.length > 1 && parts[0] && !this.isComplexOrderProperty(parts[0])) {
      const resolvedValue = PropertyResolver.getNestedProperty(order, propertyStr);
      if (resolvedValue !== void 0) {
        return resolvedValue;
      }
    }
    switch (parts[0]) {
      case "created_at":
      case "createdAt":
        const timestamp = order.attribution?.metadata?.timestamp;
        if (!timestamp) return "";
        if (parts[1] === "raw") return timestamp;
        return DisplayFormatter.formatDate(new Date(timestamp));
      case "testBadge":
        return order.is_test ? "🧪 TEST ORDER" : "";
      // User/Customer properties
      case "user":
      case "customer":
        return this.getOrderUserProperty(order, parts.slice(1).join(".") || "");
      // Address properties
      case "shippingAddress":
        return this.getOrderAddressProperty(order.shipping_address, parts.slice(1).join(".") || "");
      case "billingAddress":
        return this.getOrderAddressProperty(order.billing_address, parts.slice(1).join(".") || "");
      // Line items
      case "items":
      case "lines":
        return this.getOrderLinesProperty(order, parts.slice(1).join(".") || "");
      // Attribution
      case "attribution":
        return this.getOrderAttributionProperty(order.attribution, parts.slice(1).join(".") || "");
      default:
        this.logger.warn(`Unknown order property: ${propertyStr}`);
        return "";
    }
  }
  getOrderUserProperty(order, property) {
    const user = order.user;
    if (!user) return "";
    switch (property) {
      case "":
      case "name":
        return `${user.first_name || ""} ${user.last_name || ""}`.trim();
      case "email":
        return String(user.email || "");
      case "firstName":
        return String(user.first_name || "");
      case "lastName":
        return String(user.last_name || "");
      case "phone":
        return String(user.phone_number || "");
      case "acceptsMarketing":
        return user.accepts_marketing;
      case "language":
        return String(user.language || "");
      case "ip":
        return String(user.ip || "");
      default:
        return "";
    }
  }
  getOrderAddressProperty(address, property) {
    if (!address) return "";
    switch (property) {
      case "":
      case "full":
        return this.formatAddress(address);
      case "name":
        return `${address.first_name || ""} ${address.last_name || ""}`.trim();
      case "line1":
        return String(address.line1 || "");
      case "line2":
        return String(address.line2 || "");
      case "city":
        return String(address.line4 || "");
      case "state":
        return String(address.state || "");
      case "zip":
      case "postcode":
        return String(address.postcode || "");
      case "country":
        return String(address.country || "");
      case "phone":
        return String(address.phone_number || "");
      default:
        return "";
    }
  }
  getOrderLinesProperty(order, property) {
    const lines = order.lines || [];
    switch (property) {
      case "count":
        return lines.length;
      case "totalQuantity":
        return lines.reduce((sum, line) => sum + (line.quantity || 0), 0);
      case "upsellCount":
        return lines.filter((line) => line.is_upsell).length;
      case "mainProduct":
        return lines[0]?.product_title || "";
      case "mainProductSku":
        return lines[0]?.product_sku || "";
      default:
        const match = property.match(/^\[(\d+)\]\.(.+)$/);
        if (match && match[1] && match[2]) {
          const index = parseInt(match[1], 10);
          const prop = match[2];
          const line = lines[index];
          if (line && prop) {
            return this.getOrderLineProperty(line, prop);
          }
        }
        return "";
    }
  }
  getOrderLineProperty(line, property) {
    switch (property) {
      case "title":
      case "product_title":
        return line.product_title || "";
      case "sku":
      case "product_sku":
        return line.product_sku || "";
      case "quantity":
        return line.quantity || 0;
      case "price":
        return DisplayFormatter.formatCurrency(parseFloat(line.price_incl_tax || "0"));
      case "price.raw":
        return parseFloat(line.price_incl_tax || "0");
      case "priceExclTax":
        return DisplayFormatter.formatCurrency(parseFloat(line.price_excl_tax || "0"));
      case "priceExclTax.raw":
        return parseFloat(line.price_excl_tax || "0");
      case "priceExclTaxExclDiscounts":
        return DisplayFormatter.formatCurrency(parseFloat(line.price_excl_tax_excl_discounts || "0"));
      case "priceExclTaxExclDiscounts.raw":
        return parseFloat(line.price_excl_tax_excl_discounts || "0");
      case "priceInclTaxExclDiscounts":
        return DisplayFormatter.formatCurrency(parseFloat(line.price_incl_tax_excl_discounts || "0"));
      case "priceInclTaxExclDiscounts.raw":
        return parseFloat(line.price_incl_tax_excl_discounts || "0");
      case "total":
        return DisplayFormatter.formatCurrency(parseFloat(line.price_incl_tax || "0") * (line.quantity || 1));
      case "total.raw":
        return parseFloat(line.price_incl_tax || "0") * (line.quantity || 1);
      case "totalExclTax":
        return DisplayFormatter.formatCurrency(parseFloat(line.price_excl_tax || "0") * (line.quantity || 1));
      case "totalExclTax.raw":
        return parseFloat(line.price_excl_tax || "0") * (line.quantity || 1);
      case "isUpsell":
        return line.is_upsell || false;
      case "image":
        return line.image || "";
      default:
        return "";
    }
  }
  getOrderAttributionProperty(attribution, property) {
    if (!attribution) return "";
    switch (property) {
      case "source":
      case "utm_source":
        return attribution.utm_source || "";
      case "medium":
      case "utm_medium":
        return attribution.utm_medium || "";
      case "campaign":
      case "utm_campaign":
        return attribution.utm_campaign || "";
      case "term":
      case "utm_term":
        return attribution.utm_term || "";
      case "content":
      case "utm_content":
        return attribution.utm_content || "";
      case "gclid":
        return attribution.gclid || "";
      case "funnel":
        return attribution.funnel || "";
      case "affiliate":
        return attribution.affiliate || "";
      case "hasTracking":
        return !!(attribution.utm_source || attribution.utm_medium || attribution.gclid);
      default:
        return "";
    }
  }
  formatAddress(address) {
    if (!address) return "";
    const parts = [
      address.line1,
      address.line2,
      address.line4,
      // city
      address.state,
      address.postcode,
      address.country
    ].filter(Boolean).map((part) => String(part));
    return parts.join(", ");
  }
  isComplexOrderProperty(property) {
    const complexProperties = [
      "user",
      "customer",
      "total",
      "subtotal",
      "tax",
      "shipping",
      "discounts",
      "shippingAddress",
      "billingAddress",
      "items",
      "lines",
      "attribution",
      "created_at"
    ];
    return complexProperties.includes(property);
  }
  getCalculatedProperty(order, property) {
    switch (property) {
      // Subtotal (line items only, excluding shipping and tax)
      case "subtotal":
      case "subtotalExclShipping":
        if (order.lines && order.lines.length > 0) {
          return order.lines.reduce((sum, line) => {
            return sum + parseFloat(line.price_excl_tax || "0");
          }, 0);
        }
        const totalExclTax = parseFloat(order.total_excl_tax || "0");
        const shippingExclTax = parseFloat(order.shipping_excl_tax || "0");
        return totalExclTax - shippingExclTax;
      // Savings calculations
      case "savings":
      case "savingsAmount":
        if (order.lines && order.lines.length > 0) {
          const originalTotal = order.lines.reduce((sum, line) => {
            return sum + parseFloat(line.price_incl_tax_excl_discounts || line.price_incl_tax || "0") * line.quantity;
          }, 0);
          const currentTotal = parseFloat(order.total_incl_tax || "0");
          return Math.max(0, originalTotal - currentTotal);
        }
        return parseFloat(order.total_discounts || "0");
      case "savingsPercentage":
        if (order.lines && order.lines.length > 0) {
          const originalPrice = order.lines.reduce((sum, line) => {
            return sum + parseFloat(line.price_incl_tax_excl_discounts || line.price_incl_tax || "0") * line.quantity;
          }, 0);
          const currentPrice = parseFloat(order.total_incl_tax || "0");
          if (originalPrice > 0 && originalPrice > currentPrice) {
            return (originalPrice - currentPrice) / originalPrice * 100;
          }
        }
        return 0;
      case "hasSavings":
        if (parseFloat(order.total_discounts || "0") > 0) {
          return true;
        }
        if (order.lines && order.lines.length > 0) {
          return order.lines.some((line) => {
            const beforeDiscount = parseFloat(line.price_incl_tax_excl_discounts || "0");
            const afterDiscount = parseFloat(line.price_incl_tax || "0");
            return beforeDiscount > afterDiscount;
          });
        }
        return false;
      // Boolean flags
      case "hasItems":
        return order.lines && order.lines.length > 0;
      case "isEmpty":
        return !order.lines || order.lines.length === 0;
      case "hasShipping":
        return parseFloat(order.shipping_incl_tax || "0") > 0;
      case "hasTax":
        return parseFloat(order.total_tax || "0") > 0;
      case "hasDiscounts":
        return parseFloat(order.total_discounts || "0") > 0;
      case "hasUpsells":
        return order.lines?.some((line) => line.is_upsell) || false;
      // Line items calculations
      case "lines.count":
        return order.lines?.length || 0;
      case "lines.totalQuantity":
        return order.lines?.reduce((sum, line) => sum + (line.quantity || 0), 0) || 0;
      case "lines.upsellCount":
        return order.lines?.filter((line) => line.is_upsell).length || 0;
      case "lines.mainProduct":
        return order.lines?.[0]?.product_title || "";
      case "lines.mainProductSku":
        return order.lines?.[0]?.product_sku || "";
      default:
        return void 0;
    }
  }
}
export {
  OrderDisplayEnhancer
};
