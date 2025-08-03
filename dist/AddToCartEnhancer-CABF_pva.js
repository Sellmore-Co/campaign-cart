import { B as BaseActionEnhancer } from "./BaseActionEnhancer-3LeLJrGL.js";
import { u as useCartStore } from "./index-B40VgCtc.js";
import { p as preserveQueryParams } from "./url-utils-Bp-Q8IGf.js";
class AddToCartEnhancer extends BaseActionEnhancer {
  constructor() {
    super(...arguments);
    this.quantity = 1;
    this.clearCart = false;
  }
  async initialize() {
    this.validateElement();
    const packageIdAttr = this.getAttribute("data-next-package-id");
    if (packageIdAttr) {
      this.packageId = parseInt(packageIdAttr, 10);
    }
    const quantityAttr = this.getAttribute("data-next-quantity");
    this.quantity = quantityAttr ? parseInt(quantityAttr, 10) : 1;
    const selectorIdAttr = this.getAttribute("data-next-selector-id");
    if (selectorIdAttr) {
      this.selectorId = selectorIdAttr;
    }
    const redirectUrlAttr = this.getAttribute("data-next-url");
    if (redirectUrlAttr) {
      this.redirectUrl = redirectUrlAttr;
    }
    const clearCartAttr = this.getAttribute("data-next-clear-cart");
    this.clearCart = clearCartAttr === "true";
    this.clickHandler = this.handleClick.bind(this);
    this.element.addEventListener("click", this.clickHandler);
    if (this.selectorId) {
      this.setupSelectorListener();
    }
    this.updateButtonState();
    this.logger.debug("AddToCartEnhancer initialized", {
      packageId: this.packageId,
      selectorId: this.selectorId,
      quantity: this.quantity,
      redirectUrl: this.redirectUrl,
      clearCart: this.clearCart
    });
  }
  setupSelectorListener() {
    setTimeout(() => {
      const selectorElement = this.findSelectorElement();
      if (!selectorElement) {
        this.logger.warn(`Selector with id "${this.selectorId}" not found. Button may not work properly.`);
      } else {
        this.selectedItem = this.getSelectedItemFromElement(selectorElement);
        this.updateButtonState();
      }
    }, 100);
    this.eventBus.on("selector:item-selected", this.handleSelectorChange.bind(this));
    this.eventBus.on("selector:selection-changed", this.handleSelectorChange.bind(this));
  }
  findSelectorElement() {
    return document.querySelector(
      `[data-next-cart-selector][data-next-selector-id="${this.selectorId}"], [data-next-package-selector][data-next-selector-id="${this.selectorId}"]`
    );
  }
  getSelectedItemFromElement(element) {
    const getSelectedItem = element._getSelectedItem;
    if (typeof getSelectedItem === "function") {
      return getSelectedItem();
    }
    const selectedItem = element._selectedItem;
    if (selectedItem) {
      return selectedItem;
    }
    const selectedPackageAttr = element.getAttribute("data-selected-package");
    if (selectedPackageAttr) {
      const packageId = parseInt(selectedPackageAttr, 10);
      if (!isNaN(packageId)) {
        return {
          packageId,
          quantity: 1,
          element: null,
          price: void 0,
          name: void 0,
          isPreSelected: false,
          shippingId: void 0
        };
      }
    }
    return null;
  }
  handleSelectorChange(event) {
    if (event.selectorId !== this.selectorId) {
      return;
    }
    const selectorElement = this.findSelectorElement();
    if (selectorElement) {
      this.selectedItem = this.getSelectedItemFromElement(selectorElement);
    } else if (event.item) {
      this.selectedItem = event.item;
    } else if (event.packageId) {
      this.selectedItem = {
        packageId: event.packageId,
        quantity: event.quantity || 1,
        element: null,
        price: void 0,
        name: void 0,
        isPreSelected: false,
        shippingId: void 0
      };
    } else {
      this.selectedItem = null;
    }
    this.updateButtonState();
  }
  updateButtonState() {
    if (this.selectorId) {
      const hasSelection = this.selectedItem !== null;
      this.setEnabled(hasSelection);
    } else if (this.packageId) {
      this.setEnabled(true);
    }
  }
  setEnabled(enabled) {
    if (enabled) {
      this.element.removeAttribute("disabled");
      this.removeClass("next-disabled");
    } else {
      this.element.setAttribute("disabled", "true");
      this.addClass("next-disabled");
    }
  }
  async handleClick(event) {
    event.preventDefault();
    await this.executeAction(
      async () => {
        await this.addToCart();
      },
      { showLoading: true, disableOnProcess: true }
    );
  }
  async addToCart() {
    const cartStore = useCartStore.getState();
    let packageIdToAdd;
    let quantityToAdd = this.quantity;
    if (this.selectorId && this.selectedItem) {
      packageIdToAdd = this.selectedItem.packageId;
      quantityToAdd = this.selectedItem.quantity || this.quantity;
    } else if (this.packageId) {
      packageIdToAdd = this.packageId;
    }
    if (!packageIdToAdd) {
      this.logger.warn("No package ID available for add-to-cart action");
      return;
    }
    try {
      if (this.clearCart) {
        this.logger.debug("Clearing cart before adding item");
        await cartStore.clear();
      }
      await cartStore.addItem({
        packageId: packageIdToAdd,
        quantity: quantityToAdd,
        isUpsell: void 0
      });
      this.updateButtonState();
      this.eventBus.emit("cart:item-added", {
        packageId: packageIdToAdd,
        quantity: quantityToAdd,
        source: this.selectorId ? "selector" : "direct"
      });
      if (this.redirectUrl) {
        const finalUrl = preserveQueryParams(this.redirectUrl);
        this.logger.debug("Redirecting to:", finalUrl);
        window.location.href = finalUrl;
      }
    } catch (error) {
      this.logger.error("Failed to add item to cart:", error);
      throw error;
    }
  }
  update(_data) {
  }
  destroy() {
    if (this.clickHandler) {
      this.element.removeEventListener("click", this.clickHandler);
    }
    if (this.selectorId) {
      this.eventBus.off("selector:item-selected", this.handleSelectorChange.bind(this));
      this.eventBus.off("selector:selection-changed", this.handleSelectorChange.bind(this));
    }
    super.destroy();
  }
}
export {
  AddToCartEnhancer
};
