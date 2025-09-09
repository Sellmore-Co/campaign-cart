import { B as BaseDisplayEnhancer, g as getPropertyConfig, P as PropertyResolver } from "./DisplayEnhancerCore-Ctom89He.js";
import { A as AttributeParser } from "./index-VH7rirSE.js";
import { u as useCartStore, i as PackageContextResolver } from "./utils-C0fPUD1W.js";
class CartDisplayEnhancer extends BaseDisplayEnhancer {
  constructor() {
    super(...arguments);
    this.includeDiscounts = false;
  }
  async initialize() {
    this.includeDiscounts = this.element.hasAttribute("data-include-discounts");
    await super.initialize();
  }
  setupStoreSubscriptions() {
    this.subscribe(useCartStore, this.handleCartUpdate.bind(this));
    this.cartState = useCartStore.getState();
    if (this.cartState.items.length > 0 && this.cartState.totals.isEmpty) {
      this.logger.debug("Cart has items but totals are empty, triggering recalculation");
      useCartStore.getState().calculateTotals();
    }
  }
  handleCartUpdate(cartState) {
    this.cartState = cartState;
    this.toggleClass("next-cart-empty", cartState.isEmpty);
    this.toggleClass("next-cart-has-items", !cartState.isEmpty);
    this.updateDisplay();
  }
  getPropertyValue() {
    if (!this.cartState || !this.property) return void 0;
    if (this.includeDiscounts && this.property === "subtotal") {
      const subtotalValue = this.cartState.totals?.subtotal?.value || 0;
      const discountsValue = this.cartState.totals?.discounts?.value || 0;
      const discountedSubtotal = subtotalValue - discountsValue;
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD"
      }).format(discountedSubtotal);
      return { _preformatted: true, value: formatted };
    }
    if (this.includeDiscounts && this.property === "subtotal.raw") {
      const subtotalValue = this.cartState.totals?.subtotal?.value || 0;
      const discountsValue = this.cartState.totals?.discounts?.value || 0;
      return subtotalValue - discountsValue;
    }
    const config = getPropertyConfig("cart", this.property);
    if (config) {
      const { path, preformatted } = config;
      if (path.startsWith("!")) {
        const actualPath = path.substring(1);
        const value2 = PropertyResolver.getNestedProperty(this.cartState, actualPath);
        return !value2;
      }
      const value = PropertyResolver.getNestedProperty(this.cartState, path);
      if (preformatted) {
        return { _preformatted: true, value };
      }
      return value;
    }
    return PropertyResolver.getNestedProperty(this.cartState, this.property);
  }
  async performInitialUpdate() {
    if (this.displayPath) {
      const parsed = AttributeParser.parseDisplayPath(this.displayPath);
      if (parsed.object === "package") {
        this.logger.warn(`CartDisplayEnhancer is handling package property "${this.displayPath}" - this may be incorrect!`, {
          element: this.element.outerHTML.substring(0, 200) + "...",
          hasPackageContext: PackageContextResolver.findPackageId(this.element) !== void 0
        });
      }
    }
    await super.performInitialUpdate();
  }
  getCartProperty(cartState, property) {
    const oldCartState = this.cartState;
    const oldProperty = this.property;
    this.cartState = cartState;
    this.property = property;
    const value = this.getPropertyValue();
    if (oldCartState !== void 0) {
      this.cartState = oldCartState;
    }
    if (oldProperty !== void 0) {
      this.property = oldProperty;
    }
    return value;
  }
  refreshDisplay() {
    this.updateDisplay();
  }
}
export {
  CartDisplayEnhancer
};
