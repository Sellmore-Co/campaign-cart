import { B as BaseEnhancer } from "./BaseEnhancer-Dr4ORk3i.js";
import { a as useOrderStore } from "./index-DHPABw_W.js";
import { d as configStore, T as TemplateRenderer } from "./utils-DQ58kv_0.js";
import { ApiClient } from "./api-_23e7H2w.js";
import { D as DisplayFormatter } from "./DisplayEnhancerCore-B-36EUIl.js";
class OrderItemListEnhancer extends BaseEnhancer {
  async initialize() {
    this.validateElement();
    const templateId = this.getAttribute("data-item-template-id");
    const templateSelector = this.getAttribute("data-item-template-selector");
    if (templateId) {
      const templateElement = document.getElementById(templateId);
      this.template = templateElement?.innerHTML.trim() ?? "";
    } else if (templateSelector) {
      const templateElement = document.querySelector(templateSelector);
      this.template = templateElement?.innerHTML.trim() ?? "";
    } else {
      this.template = this.getAttribute("data-item-template") || this.element.innerHTML.trim();
    }
    if (!this.template || this.template.replace(/<!--[\s\S]*?-->/g, "").trim() === "") {
      this.template = this.getDefaultItemTemplate();
    }
    this.emptyTemplate = this.getAttribute("data-empty-template") || '<div class="order-empty">No items found in order</div>';
    await this.checkAndLoadOrderFromUrl();
    this.subscribe(useOrderStore, this.handleOrderUpdate.bind(this));
    this.handleOrderUpdate(useOrderStore.getState());
    this.logger.debug("OrderItemListEnhancer initialized");
  }
  update(data) {
    if (data) {
      this.handleOrderUpdate(data);
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
  async handleOrderUpdate(orderState) {
    try {
      const order = orderState.order;
      if (orderState.isLoading) {
        this.element.innerHTML = '<div class="status-message">Loading order items...</div>';
        this.addClass("order-loading");
        this.removeClass("order-has-items");
        this.removeClass("order-empty");
        return;
      }
      if (orderState.error) {
        this.element.innerHTML = '<div class="status-message">Error loading order items</div>';
        this.addClass("order-error");
        this.removeClass("order-has-items");
        this.removeClass("order-empty");
        this.removeClass("order-loading");
        return;
      }
      if (!order || !order.lines || order.lines.length === 0) {
        this.renderEmptyOrder();
      } else {
        await this.renderOrderItems(order.lines);
      }
    } catch (error) {
      this.handleError(error, "handleOrderUpdate");
    }
  }
  renderEmptyOrder() {
    this.element.innerHTML = this.emptyTemplate || "";
    this.addClass("order-empty");
    this.removeClass("order-has-items");
    this.removeClass("order-loading");
    this.removeClass("order-error");
  }
  async renderOrderItems(lines) {
    this.removeClass("order-empty");
    this.removeClass("order-loading");
    this.removeClass("order-error");
    this.addClass("order-has-items");
    const itemsHTML = [];
    for (const line of lines) {
      const itemHTML = this.renderOrderItem(line);
      if (itemHTML) {
        itemsHTML.push(itemHTML);
      }
    }
    this.element.innerHTML = itemsHTML.join("");
  }
  renderOrderItem(line) {
    try {
      const itemData = this.prepareOrderLineData(line);
      const template = this.template || this.getDefaultItemTemplate();
      const formatters = {
        ...TemplateRenderer.createDefaultFormatters(),
        currency: (value) => DisplayFormatter.formatCurrency(value)
      };
      return TemplateRenderer.render(template, {
        data: { item: itemData },
        formatters
      });
    } catch (error) {
      this.logger.error("Error rendering order item:", error);
      return "";
    }
  }
  getDefaultItemTemplate() {
    return `
      <div class="order-item" data-order-line-id="{item.id}">
        <div class="order-item-image {item.showImage}">
          <img src="{item.image}" alt="{item.name}" onerror="this.style.display='none';">
          <span class="item-fallback-icon" style="font-size: 1.5em;">📦</span>
        </div>
        <div class="order-item-details">
          <h4 class="order-item-name">
            {item.name}
            <span class="upsell-badge {item.showUpsell}" style="background: #e7f3ff; color: #0056b3; padding: 2px 6px; border-radius: 10px; font-size: 0.8em; margin-left: 8px;">{item.upsellBadge}</span>
          </h4>
          <div class="order-item-meta">
            <div class="item-sku">SKU: {item.sku}</div>
            <div class="item-variant {item.showVariant}">Variant: {item.variant}</div>
            <div class="item-description {item.showDescription}" style="color: #6c757d; font-size: 0.9em;">{item.description}</div>
          </div>
          <div class="order-item-pricing">
            <div class="unit-price">{item.price} each</div>
            <div class="tax-info {item.showTax}" style="color: #666; font-size: 0.9em;">Tax: {item.unitTax}</div>
          </div>
        </div>
        <div class="quantity-info">
          <span class="quantity-label">Qty:</span>
          <span class="quantity-value">{item.quantity}</span>
        </div>
        <div class="order-item-total">
          <div class="line-total">{item.lineTotal}</div>
          <div class="line-tax {item.showTax}" style="color: #666; font-size: 0.9em;">Tax: {item.lineTax}</div>
        </div>
      </div>
    `.trim();
  }
  // formatCurrency is not used in this class as currency formatting is handled differently
  // private formatCurrency(amount: number): string {
  //   return new Intl.NumberFormat('en-US', {
  //     style: 'currency',
  //     currency: 'USD'
  //   }).format(amount);
  // }
  prepareOrderLineData(line) {
    const lineTotal = parseFloat(line.price_incl_tax || "0");
    const lineTotalExclTax = parseFloat(line.price_excl_tax || "0");
    const quantity = line.quantity || 1;
    const unitPrice = quantity > 0 ? lineTotal / quantity : lineTotal;
    const unitPriceExclTax = quantity > 0 ? lineTotalExclTax / quantity : lineTotalExclTax;
    const unitTax = unitPrice - unitPriceExclTax;
    const lineTax = lineTotal - lineTotalExclTax;
    const upsellBadge = line.is_upsell ? "UPSELL" : "";
    return {
      // Basic item data
      id: String(line.id || ""),
      title: line.product_title || "Unknown Product",
      name: line.product_title || "Unknown Product",
      sku: line.product_sku || "",
      quantity: String(quantity),
      // Pricing - will be formatted by TemplateRenderer
      price: unitPrice,
      priceExclTax: unitPriceExclTax,
      unitTax,
      lineTotal,
      lineTotalExclTax,
      lineTax,
      // Product data
      image: line.image || "",
      description: line.product_description || "",
      variant: line.variant_title || "",
      // Flags and status
      isUpsell: line.is_upsell ? "true" : "false",
      upsellBadge,
      hasImage: line.image ? "true" : "false",
      hasDescription: line.product_description ? "true" : "false",
      hasVariant: line.variant_title ? "true" : "false",
      hasTax: unitTax > 0 ? "true" : "false",
      // Conditional display helpers
      showUpsell: line.is_upsell ? "show" : "hide",
      showImage: line.image ? "show" : "hide",
      showDescription: line.product_description ? "show" : "hide",
      showVariant: line.variant_title ? "show" : "hide",
      showTax: unitTax > 0 ? "show" : "hide"
    };
  }
  getItemCount() {
    return this.element.querySelectorAll("[data-order-line-id]").length;
  }
  getItemElements() {
    return this.element.querySelectorAll("[data-order-line-id]");
  }
}
export {
  OrderItemListEnhancer
};
