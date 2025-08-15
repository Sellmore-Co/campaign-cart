import { B as BaseDisplayEnhancer, g as getPropertyConfig, P as PropertyResolver } from "./DisplayEnhancerCore-DrcqPMZa.js";
import { A as AttributeParser } from "./index-Cq35q0YH.js";
import { u as useCartStore, P as PackageContextResolver } from "./utils-CZZAc6zU.js";
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
