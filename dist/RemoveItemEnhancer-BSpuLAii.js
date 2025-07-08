import { B as BaseEnhancer } from "./BaseEnhancer-Bek_tq0G.js";
import { u as useCartStore } from "./analytics-CbggJMJ_.js";
class RemoveItemEnhancer extends BaseEnhancer {
  constructor() {
    super(...arguments);
    this.confirmRemoval = false;
    this.confirmMessage = "Are you sure you want to remove this item?";
  }
  async initialize() {
    this.validateElement();
    const packageIdAttr = this.getRequiredAttribute("data-package-id");
    this.packageId = parseInt(packageIdAttr, 10);
    if (isNaN(this.packageId)) {
      throw new Error(`Invalid package ID: ${packageIdAttr}`);
    }
    this.confirmRemoval = this.getAttribute("data-confirm") === "true";
    this.confirmMessage = this.getAttribute("data-confirm-message") || this.confirmMessage;
    this.element.addEventListener("click", this.handleClick.bind(this));
    this.subscribe(useCartStore, this.handleCartUpdate.bind(this));
    this.handleCartUpdate(useCartStore.getState());
    this.logger.debug(`RemoveItemEnhancer initialized for package ${this.packageId}`);
  }
  update(data) {
    if (data) {
      this.handleCartUpdate(data);
    }
  }
  async handleClick(event) {
    event.preventDefault();
    event.stopPropagation();
    if (this.hasClass("disabled") || this.element.hasAttribute("disabled")) {
      return;
    }
    if (this.confirmRemoval) {
      if (!confirm(this.confirmMessage)) {
        return;
      }
    }
    try {
      this.addClass("processing");
      await this.removeItem();
    } catch (error) {
      this.handleError(error, "handleClick");
    } finally {
      this.removeClass("processing");
    }
  }
  async removeItem() {
    const cartStore = useCartStore.getState();
    const currentQuantity = cartStore.getItemQuantity(this.packageId);
    if (currentQuantity === 0) {
      this.logger.debug(`Item ${this.packageId} not in cart, nothing to remove`);
      return;
    }
    await cartStore.removeItem(this.packageId);
    this.logger.debug(`Removed item ${this.packageId} from cart`);
    this.emitRemoveEvent();
    this.addRemovalFeedback();
  }
  emitRemoveEvent() {
    this.emit("cart:item-removed", { packageId: this.packageId });
  }
  handleCartUpdate(cartState) {
    const currentQuantity = cartState.items.find((item) => item.packageId === this.packageId)?.quantity || 0;
    const isInCart = currentQuantity > 0;
    this.toggleClass("disabled", !isInCart);
    this.element.toggleAttribute("disabled", !isInCart);
    this.setAttribute("aria-disabled", String(!isInCart));
    this.toggleClass("has-item", isInCart);
    this.toggleClass("empty", !isInCart);
    this.element.setAttribute("data-quantity", String(currentQuantity));
    this.element.setAttribute("data-in-cart", String(isInCart));
    this.updateButtonContent(currentQuantity);
  }
  updateButtonContent(currentQuantity) {
    const originalContent = this.getAttribute("data-original-content") || this.element.innerHTML;
    if (!this.hasAttribute("data-original-content")) {
      this.setAttribute("data-original-content", this.element.innerHTML);
    }
    const newContent = originalContent.replace(/\{quantity\}/g, String(currentQuantity));
    if (this.element.innerHTML !== newContent) {
      this.element.innerHTML = newContent;
    }
  }
  addRemovalFeedback() {
    this.addClass("item-removed");
    const cartItem = this.element.closest("[data-cart-item-id], .cart-item");
    if (cartItem instanceof HTMLElement) {
      cartItem.classList.add("removing");
      setTimeout(() => {
        cartItem.classList.remove("removing");
      }, 300);
    }
    setTimeout(() => {
      this.removeClass("item-removed");
    }, 300);
  }
  getCurrentQuantity() {
    const cartStore = useCartStore.getState();
    return cartStore.getItemQuantity(this.packageId);
  }
  isInCart() {
    return this.getCurrentQuantity() > 0;
  }
  setConfirmation(enabled, message) {
    this.confirmRemoval = enabled;
    if (message) {
      this.confirmMessage = message;
    }
  }
}
export {
  RemoveItemEnhancer
};
