import { B as BaseEnhancer } from "./BaseEnhancer-BXn1ZPNz.js";
import { u as useCartStore, a as useCampaignStore, T as TemplateRenderer, l as PriceCalculator } from "./utils-Bnlf88EQ.js";
import { D as DisplayFormatter } from "./DisplayEnhancerCore-BTuQDGcI.js";
class CartItemListEnhancer extends BaseEnhancer {
  constructor() {
    super(...arguments);
    this.lastRenderedItems = "";
  }
  // Track last rendered state
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
    this.emptyTemplate = this.getAttribute("data-empty-template") || '<div class="cart-empty">Your cart is empty</div>';
    const titleMapAttr = this.getAttribute("data-title-map");
    if (titleMapAttr) {
      try {
        this.titleMap = JSON.parse(titleMapAttr);
      } catch (error) {
        this.logger.warn("Invalid title map JSON:", error);
      }
    }
    this.subscribe(useCartStore, this.handleCartUpdate.bind(this));
    this.handleCartUpdate(useCartStore.getState());
    this.logger.debug("CartItemListEnhancer initialized");
  }
  update(data) {
    if (data) {
      this.handleCartUpdate(data);
    }
  }
  async handleCartUpdate(cartState) {
    try {
      if (cartState.isEmpty || cartState.items.length === 0) {
        this.renderEmptyCart();
      } else {
        await this.renderCartItems(cartState.items);
      }
    } catch (error) {
      this.handleError(error, "handleCartUpdate");
    }
  }
  renderEmptyCart() {
    this.element.innerHTML = this.emptyTemplate || "";
    this.addClass("cart-empty");
    this.removeClass("cart-has-items");
  }
  async renderCartItems(items) {
    this.removeClass("cart-empty");
    this.addClass("cart-has-items");
    const campaignStore = useCampaignStore.getState();
    const itemsHTML = [];
    for (const item of items) {
      const itemHTML = await this.renderCartItem(item, campaignStore);
      if (itemHTML) {
        itemsHTML.push(itemHTML);
      }
    }
    const newHTML = itemsHTML.join("");
    if (newHTML !== this.lastRenderedItems) {
      this.element.innerHTML = newHTML;
      this.lastRenderedItems = newHTML;
      await this.enhanceNewElements();
    } else {
      this.logger.debug("Cart items HTML unchanged, skipping DOM update");
    }
  }
  async renderCartItem(item, campaignStore) {
    try {
      const packageData = campaignStore.getPackage(item.packageId);
      if (!packageData) {
        this.logger.warn(`Package data not found for item ${item.packageId}`);
        return "";
      }
      const itemData = this.prepareCartItemData(item, packageData);
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
      this.logger.error("Error rendering cart item:", error);
      return "";
    }
  }
  getDefaultItemTemplate() {
    return `
      <div class="cart-item" data-cart-item-id="{item.id}" data-package-id="{item.packageId}">
        <div class="cart-item-image">
          <img src="{item.image}" alt="{item.name}" onerror="this.style.display='none';">
          <span style="font-size: 1.5em;">📦</span>
        </div>
        <div class="cart-item-details">
          <h4 class="cart-item-name">{item.name}</h4>
          <div class="cart-item-pricing">
            <div class="original-price {item.showOriginalPrice}" style="text-decoration: line-through; color: #999;">{item.price} each</div>
            <div class="current-price">{item.finalPrice} each</div>
            <div class="discount-badge {item.showDiscount}" style="color: #e74c3c; font-weight: bold;">-{item.discountAmount} coupon discount</div>
            <div class="compare-price {item.showCompare}" style="text-decoration: line-through; color: #999;">{item.comparePrice}</div>
            <div class="savings {item.showSavings}" style="color: #0d7519; font-weight: bold;">Save {item.savingsAmount} ({item.savingsPct})</div>
            <div class="frequency">{item.frequency}</div>
            <div class="recurring-price {item.showRecurring}" style="color: #666;">Then {item.recurringPrice} recurring</div>
          </div>
        </div>
        <div class="quantity-controls">
          <button class="quantity-btn" data-next-quantity="decrease" data-package-id="{item.packageId}">-</button>
          <span class="quantity-display">{item.quantity}</span>
          <button class="quantity-btn" data-next-quantity="increase" data-package-id="{item.packageId}">+</button>
        </div>
        <div class="cart-item-total">
          <div class="line-total-original {item.showOriginalPrice}" style="text-decoration: line-through; color: #999; font-size: 0.9em;">{item.lineTotal}</div>
          <div class="line-total">{item.finalLineTotal}</div>
          <div class="line-compare {item.showCompare}" style="text-decoration: line-through; color: #999; font-size: 0.9em;">{item.lineCompare}</div>
        </div>
        <button class="remove-btn" data-next-remove-item data-package-id="{item.packageId}" data-confirm="true" data-confirm-message="Remove this item from your cart?">Remove</button>
      </div>
    `.trim();
  }
  async enhanceNewElements() {
    const quantityButtons = this.element.querySelectorAll("[data-next-quantity]");
    const removeButtons = this.element.querySelectorAll("[data-next-remove-item]");
    if (quantityButtons.length > 0) {
      const { QuantityControlEnhancer } = await import("./QuantityControlEnhancer-D8wUtx8-.js");
      for (const button of Array.from(quantityButtons)) {
        if (button instanceof HTMLElement) {
          try {
            const enhancer = new QuantityControlEnhancer(button);
            await enhancer.initialize();
            this.logger.debug("Enhanced quantity control button", button);
          } catch (error) {
            this.logger.error("Failed to enhance quantity button:", error, button);
          }
        }
      }
    }
    if (removeButtons.length > 0) {
      const { RemoveItemEnhancer } = await import("./RemoveItemEnhancer-BPnQAeMC.js");
      for (const button of Array.from(removeButtons)) {
        if (button instanceof HTMLElement) {
          try {
            const enhancer = new RemoveItemEnhancer(button);
            await enhancer.initialize();
            this.logger.debug("Enhanced remove button", button);
          } catch (error) {
            this.logger.error("Failed to enhance remove button:", error, button);
          }
        }
      }
    }
    this.logger.debug(`Enhanced ${quantityButtons.length} quantity buttons and ${removeButtons.length} remove buttons`);
  }
  prepareCartItemData(item, packageData) {
    const packageCurrentPrice = item.price;
    const lineTotal = packageCurrentPrice * item.quantity;
    const packagePrice = parseFloat(packageData.price || "0");
    const packagePriceTotal = parseFloat(packageData.price_total || "0");
    const packageRetailPrice = parseFloat(packageData.price_retail || packageData.price || "0");
    const packageRetailTotal = parseFloat(packageData.price_retail_total || "0");
    const packageQty = packageData.qty || 1;
    const cartState = useCartStore.getState();
    let itemDiscount = 0;
    let hasDiscount = false;
    if (cartState.appliedCoupons && cartState.appliedCoupons.length > 0) {
      for (const coupon of cartState.appliedCoupons) {
        if (coupon.definition.scope === "package" && coupon.definition.packageIds?.includes(item.packageId)) {
          if (coupon.definition.type === "percentage") {
            itemDiscount += lineTotal * (coupon.definition.value / 100);
            if (coupon.definition.maxDiscount) {
              itemDiscount = Math.min(itemDiscount, coupon.definition.maxDiscount);
            }
          } else {
            const eligibleTotal = cartState.items.filter((cartItem) => coupon.definition.packageIds?.includes(cartItem.packageId)).reduce((sum, cartItem) => sum + cartItem.price * cartItem.quantity, 0);
            const proportion = lineTotal / eligibleTotal;
            itemDiscount += coupon.definition.value * proportion;
          }
          hasDiscount = true;
        } else if (coupon.definition.scope === "order") {
          const proportion = lineTotal / cartState.subtotal;
          if (coupon.definition.type === "percentage") {
            itemDiscount += lineTotal * (coupon.definition.value / 100);
          } else {
            itemDiscount += coupon.definition.value * proportion;
          }
          hasDiscount = true;
        }
      }
    }
    const discountedLineTotal = lineTotal - itemDiscount;
    const discountedPackagePrice = packageCurrentPrice - itemDiscount / item.quantity;
    const metrics = PriceCalculator.calculatePackageMetrics({
      price: packagePrice,
      retailPrice: packageRetailPrice,
      quantity: packageQty,
      priceTotal: packagePriceTotal,
      retailPriceTotal: packageRetailTotal
    });
    const retailLineTotal = metrics.totalRetailPrice * item.quantity;
    const lineSavings = metrics.totalSavings * item.quantity;
    const recurringPrice = parseFloat(packageData.price_recurring || "0");
    const recurringTotal = parseFloat(packageData.price_recurring_total || "0");
    const hasRecurring = packageData.is_recurring && recurringPrice > 0;
    const frequencyText = hasRecurring ? packageData.interval_count && packageData.interval_count > 1 ? `Every ${packageData.interval_count} ${packageData.interval}s` : `Per ${packageData.interval}` : "One time";
    const globalTitleMap = window.nextConfig?.productTitleMap || {};
    const titleMap = this.titleMap || globalTitleMap;
    let customTitle = titleMap[item.packageId] || titleMap[String(item.packageId)];
    const titleTransform = window.nextConfig?.productTitleTransform;
    if (!customTitle && typeof titleTransform === "function") {
      try {
        customTitle = titleTransform(item.packageId, packageData.name);
      } catch (error) {
        this.logger.warn("Error in productTitleTransform:", error);
      }
    }
    return {
      // Basic item data
      id: item.id,
      packageId: item.packageId,
      title: customTitle || item.title || packageData.name,
      name: customTitle || packageData.name,
      quantity: item.quantity,
      // Pricing - will be formatted by TemplateRenderer
      price: packageCurrentPrice,
      // Total package price (e.g., $47.97 for 3x Drone)
      unitPrice: metrics.unitPrice,
      // Individual unit price (e.g., $15.99 per drone)
      lineTotal,
      lineCompare: metrics.hasSavings ? retailLineTotal : 0,
      comparePrice: metrics.hasSavings ? metrics.totalRetailPrice : 0,
      unitComparePrice: metrics.unitRetailPrice,
      // Individual unit retail price (e.g., $39.99 per drone)
      recurringPrice: hasRecurring ? recurringPrice : 0,
      savingsAmount: lineSavings > 0 ? lineSavings : 0,
      unitSavings: metrics.unitSavings,
      // Per-unit savings
      // Discount-specific fields
      discountAmount: itemDiscount,
      discountedPrice: discountedPackagePrice,
      discountedLineTotal,
      hasDiscount,
      finalPrice: hasDiscount ? discountedPackagePrice : packageCurrentPrice,
      finalLineTotal: hasDiscount ? discountedLineTotal : lineTotal,
      // Package-level pricing
      packagePrice,
      packagePriceTotal: metrics.totalPrice,
      packageRetailPrice,
      packageRetailTotal: metrics.totalRetailPrice,
      packageSavings: metrics.totalSavings > 0 ? metrics.totalSavings : 0,
      recurringTotal: hasRecurring ? recurringTotal : 0,
      // Calculated fields
      savingsPct: metrics.totalSavingsPercentage > 0 ? `${Math.round(metrics.totalSavingsPercentage)}%` : "",
      packageSavingsPct: metrics.totalSavingsPercentage > 0 ? `${Math.round(metrics.totalSavingsPercentage)}%` : "",
      packageQty,
      frequency: frequencyText,
      isRecurring: hasRecurring ? "true" : "false",
      hasSavings: lineSavings > 0 ? "true" : "false",
      hasPackageSavings: metrics.hasSavings ? "true" : "false",
      // Product data
      image: packageData.image || "",
      sku: packageData.external_id ? String(packageData.external_id) : "",
      // Raw values (unformatted)
      "price.raw": packageCurrentPrice,
      "unitPrice.raw": metrics.unitPrice,
      "lineTotal.raw": lineTotal,
      "lineCompare.raw": retailLineTotal,
      "comparePrice.raw": metrics.totalRetailPrice,
      "unitComparePrice.raw": metrics.unitRetailPrice,
      "recurringPrice.raw": recurringPrice,
      "savingsAmount.raw": lineSavings,
      "unitSavings.raw": metrics.unitSavings,
      "packagePrice.raw": packagePrice,
      "packagePriceTotal.raw": metrics.totalPrice,
      "packageRetailPrice.raw": packageRetailPrice,
      "packageRetailTotal.raw": metrics.totalRetailPrice,
      "packageSavings.raw": metrics.totalSavings,
      "recurringTotal.raw": recurringTotal,
      "savingsPct.raw": Math.round(metrics.totalSavingsPercentage),
      "packageSavingsPct.raw": Math.round(metrics.totalSavingsPercentage),
      "discountAmount.raw": itemDiscount,
      "discountedPrice.raw": discountedPackagePrice,
      "discountedLineTotal.raw": discountedLineTotal,
      "finalPrice.raw": hasDiscount ? discountedPackagePrice : packageCurrentPrice,
      "finalLineTotal.raw": hasDiscount ? discountedLineTotal : lineTotal,
      // Conditional display helpers
      showCompare: metrics.hasSavings ? "show" : "hide",
      showSavings: lineSavings > 0 ? "show" : "hide",
      showUnitPrice: packageQty > 1 ? "show" : "hide",
      // Show unit price for multi-item packages
      showUnitCompare: packageQty > 1 && metrics.unitSavings > 0 ? "show" : "hide",
      showUnitSavings: packageQty > 1 && metrics.unitSavings > 0 ? "show" : "hide",
      showRecurring: hasRecurring ? "show" : "hide",
      showPackageSavings: metrics.totalSavings > 0 ? "show" : "hide",
      showPackageTotal: metrics.totalPrice > 0 ? "show" : "hide",
      showRecurringTotal: hasRecurring && recurringTotal > 0 ? "show" : "hide",
      showDiscount: hasDiscount ? "show" : "hide",
      showOriginalPrice: hasDiscount ? "show" : "hide"
    };
  }
  getItemCount() {
    return this.element.querySelectorAll("[data-cart-item-id]").length;
  }
  getItemElements() {
    return this.element.querySelectorAll("[data-cart-item-id]");
  }
  refreshItem(_packageId) {
    const cartState = useCartStore.getState();
    this.handleCartUpdate(cartState);
  }
}
export {
  CartItemListEnhancer
};
