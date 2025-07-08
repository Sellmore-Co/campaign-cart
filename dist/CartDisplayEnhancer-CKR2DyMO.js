import { B as BaseDisplayEnhancer, P as PropertyResolver } from "./DisplayEnhancerCore-7Pgn4miP.js";
import { g as getPropertyMapping } from "./DisplayEnhancerTypes-DCptTE0o.js";
import { u as useCartStore, A as AttributeParser } from "./analytics-BZUvO6mp.js";
import { P as PackageContextResolver } from "./PackageContextResolver-DHzDMVjr.js";
class CartDisplayEnhancer extends BaseDisplayEnhancer {
  setupStoreSubscriptions() {
    this.subscribe(useCartStore, this.handleCartUpdate.bind(this));
    this.cartState = useCartStore.getState();
  }
  handleCartUpdate(cartState) {
    this.cartState = cartState;
    this.toggleClass("next-cart-empty", cartState.isEmpty);
    this.toggleClass("next-cart-has-items", !cartState.isEmpty);
    this.updateDisplay();
  }
  getPropertyValue() {
    if (!this.cartState || !this.property) return void 0;
    const mappedPath = getPropertyMapping("cart", this.property);
    if (mappedPath) {
      if (mappedPath.startsWith("!")) {
        const actualPath = mappedPath.substring(1);
        const value = PropertyResolver.getNestedProperty(this.cartState, actualPath);
        return !value;
      }
      return PropertyResolver.getNestedProperty(this.cartState, mappedPath);
    }
    if (this.property.endsWith(".raw")) {
      const baseProperty = this.property.replace(".raw", "");
      const mappedPath2 = getPropertyMapping("cart", baseProperty);
      if (mappedPath2) {
        const rawPath = mappedPath2.replace(".formatted", ".value");
        return PropertyResolver.getNestedProperty(this.cartState, rawPath);
      }
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
