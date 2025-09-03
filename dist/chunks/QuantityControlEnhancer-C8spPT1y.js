import { B as BaseEnhancer } from "./BaseEnhancer-CMi-nyJP.js";
import { u as useCartStore } from "./utils-Dp4Mi545.js";
class BaseCartEnhancer extends BaseEnhancer {
  /**
   * Setup cart store subscription
   * Automatically subscribes to cart updates and initializes with current state
   */
  setupCartSubscription() {
    this.subscribe(useCartStore, this.handleCartUpdate.bind(this));
    this.cartState = useCartStore.getState();
  }
  /**
   * Check if cart is empty
   */
  isCartEmpty() {
    return this.cartState?.isEmpty ?? true;
  }
  /**
   * Get cart item by package ID
   */
  getCartItem(packageId) {
    return this.cartState?.items.find((item) => item.packageId === packageId);
  }
  /**
   * Get total quantity of items in cart
   */
  getTotalQuantity() {
    return this.cartState?.totalQuantity ?? 0;
  }
  /**
   * Get cart totals
   */
  getCartTotals() {
    return this.cartState?.totals ?? {
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
      hasSavings: false
    };
  }
  /**
   * Get all cart items
   */
  getCartItems() {
    return this.cartState?.items ?? [];
  }
  /**
   * Check if a package is in cart
   */
  hasPackageInCart(packageId) {
    return this.getCartItem(packageId) !== void 0;
  }
}
class QuantityControlEnhancer extends BaseCartEnhancer {
  constructor() {
    super(...arguments);
    this.step = 1;
    this.min = 0;
    this.max = 99;
  }
  async initialize() {
    this.validateElement();
    const actionAttr = this.getRequiredAttribute("data-next-quantity");
    if (!["increase", "decrease", "set"].includes(actionAttr)) {
      throw new Error(`Invalid quantity action: ${actionAttr}. Must be 'increase', 'decrease', or 'set'`);
    }
    this.action = actionAttr;
    const packageIdAttr = this.getRequiredAttribute("data-package-id");
    this.packageId = parseInt(packageIdAttr, 10);
    if (isNaN(this.packageId)) {
      throw new Error(`Invalid package ID: ${packageIdAttr}`);
    }
    this.step = parseInt(this.getAttribute("data-step") || "1", 10) || 1;
    this.min = parseInt(this.getAttribute("data-min") || "0", 10) || 0;
    this.max = parseInt(this.getAttribute("data-max") || "99", 10) || 99;
    this.setupEventListeners();
    this.setupCartSubscription();
    this.logger.debug(`QuantityControlEnhancer initialized for package ${this.packageId} with action ${this.action}`);
  }
  update(data) {
    if (data) {
      this.handleCartUpdate(data);
    }
  }
  setupEventListeners() {
    if (this.action === "set" && (this.element.tagName === "INPUT" || this.element.tagName === "SELECT")) {
      this.element.addEventListener("change", this.handleQuantityChange.bind(this));
      this.element.addEventListener("blur", this.handleQuantityChange.bind(this));
      if (this.element instanceof HTMLInputElement && this.element.type === "number") {
        this.element.addEventListener("input", this.handleNumberInput.bind(this));
      }
    } else {
      this.element.addEventListener("click", this.handleClick.bind(this));
    }
  }
  async handleClick(event) {
    event.preventDefault();
    event.stopPropagation();
    if (this.hasClass("disabled") || this.element.hasAttribute("disabled")) {
      return;
    }
    try {
      this.addClass("processing");
      await this.updateQuantity();
    } catch (error) {
      this.handleError(error, "handleClick");
    } finally {
      this.removeClass("processing");
    }
  }
  async handleQuantityChange(event) {
    if (this.action !== "set") return;
    const target = event.target;
    const newQuantity = parseInt(target.value, 10);
    if (isNaN(newQuantity) || newQuantity < this.min) {
      target.value = String(this.min);
      return;
    }
    if (newQuantity > this.max) {
      target.value = String(this.max);
      return;
    }
    try {
      this.addClass("processing");
      const cartStore = useCartStore.getState();
      if (newQuantity === 0) {
        await cartStore.removeItem(this.packageId);
      } else {
        await cartStore.updateQuantity(this.packageId, newQuantity);
      }
    } catch (error) {
      this.handleError(error, "handleQuantityChange");
      const cartStore = useCartStore.getState();
      const currentQuantity = cartStore.getItemQuantity(this.packageId);
      target.value = String(currentQuantity);
    } finally {
      this.removeClass("processing");
    }
  }
  handleNumberInput(event) {
    const input = event.target;
    const value = parseInt(input.value, 10);
    if (value < this.min) {
      input.value = String(this.min);
    }
    if (value > this.max) {
      input.value = String(this.max);
    }
  }
  async updateQuantity() {
    const cartStore = useCartStore.getState();
    const currentQuantity = cartStore.getItemQuantity(this.packageId);
    let newQuantity;
    switch (this.action) {
      case "increase":
        newQuantity = Math.min(currentQuantity + this.step, this.max);
        break;
      case "decrease":
        newQuantity = Math.max(currentQuantity - this.step, this.min);
        break;
      default:
        return;
    }
    if (newQuantity === currentQuantity) {
      this.logger.debug("Quantity unchanged, no action needed");
      return;
    }
    if (newQuantity <= 0) {
      await cartStore.removeItem(this.packageId);
      this.logger.debug(`Removed item ${this.packageId} from cart`);
    } else {
      await cartStore.updateQuantity(this.packageId, newQuantity);
      this.logger.debug(`Updated quantity for item ${this.packageId} to ${newQuantity}`);
    }
    this.emitQuantityChangeEvent(currentQuantity, newQuantity);
  }
  handleCartUpdate(_cartState) {
    const cartItem = this.getCartItem(this.packageId);
    const currentQuantity = cartItem?.quantity || 0;
    const isInCart = currentQuantity > 0;
    this.updateButtonState(currentQuantity);
    if (this.action === "set" && (this.element instanceof HTMLInputElement || this.element instanceof HTMLSelectElement)) {
      if (this.element.value !== String(currentQuantity)) {
        this.element.value = String(currentQuantity);
      }
    }
    this.toggleClass("has-item", isInCart);
    this.toggleClass("empty", !isInCart);
    this.element.setAttribute("data-quantity", String(currentQuantity));
    this.element.setAttribute("data-in-cart", String(isInCart));
  }
  updateButtonState(currentQuantity) {
    const canIncrease = currentQuantity < this.max;
    const canDecrease = currentQuantity > this.min;
    switch (this.action) {
      case "increase":
        this.toggleClass("disabled", !canIncrease);
        this.element.toggleAttribute("disabled", !canIncrease);
        this.setAttribute("aria-disabled", String(!canIncrease));
        break;
      case "decrease":
        this.toggleClass("disabled", !canDecrease);
        this.element.toggleAttribute("disabled", !canDecrease);
        this.setAttribute("aria-disabled", String(!canDecrease));
        break;
      case "set":
        if (this.element instanceof HTMLInputElement) {
          this.element.min = String(this.min);
          this.element.max = String(this.max);
          this.element.step = String(this.step);
        }
        break;
    }
    this.updateButtonContent(currentQuantity);
  }
  updateButtonContent(currentQuantity) {
    const originalContent = this.getAttribute("data-original-content") || this.element.innerHTML;
    if (!this.hasAttribute("data-original-content")) {
      this.setAttribute("data-original-content", this.element.innerHTML);
    }
    const newContent = originalContent.replace(/\{quantity\}/g, String(currentQuantity)).replace(/\{step\}/g, String(this.step));
    if (this.element.innerHTML !== newContent) {
      this.element.innerHTML = newContent;
    }
  }
  emitQuantityChangeEvent(oldQuantity, newQuantity) {
    this.emit("cart:quantity-changed", {
      packageId: this.packageId,
      quantity: newQuantity,
      oldQuantity
    });
  }
  getCurrentQuantity() {
    const cartStore = useCartStore.getState();
    return cartStore.getItemQuantity(this.packageId);
  }
  setQuantity(quantity) {
    const clampedQuantity = Math.max(this.min, Math.min(this.max, quantity));
    const cartStore = useCartStore.getState();
    if (clampedQuantity <= 0) {
      return cartStore.removeItem(this.packageId);
    } else {
      return cartStore.updateQuantity(this.packageId, clampedQuantity);
    }
  }
  getConstraints() {
    return {
      min: this.min,
      max: this.max,
      step: this.step
    };
  }
}
export {
  QuantityControlEnhancer
};
