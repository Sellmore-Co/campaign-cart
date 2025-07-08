import { B as BaseEnhancer } from "./BaseEnhancer-Bek_tq0G.js";
import { u as useCartStore, a as useCampaignStore } from "./analytics-CbggJMJ_.js";
function isValidString(value) {
  return typeof value === "string" && value.length > 0;
}
function isValidNumber(value) {
  return typeof value === "number" && !isNaN(value) && isFinite(value);
}
function isValidPositiveNumber(value) {
  return isValidNumber(value) && value >= 0;
}
function isValidPrice(value) {
  return isValidPositiveNumber(value);
}
function parseValidPrice(priceString) {
  if (!isValidString(priceString)) return void 0;
  const priceMatch = priceString.match(/\$?(\d+\.?\d*)/);
  if (!priceMatch || !priceMatch[1]) return void 0;
  const parsed = parseFloat(priceMatch[1]);
  return isValidPrice(parsed) ? parsed : void 0;
}
const _ElementDataExtractor = class _ElementDataExtractor {
  /**
   * Extract price from an element using common price selectors
   */
  static extractPrice(element) {
    for (const selector of this.PRICE_SELECTORS) {
      const priceEl = element.querySelector(selector);
      if (priceEl?.textContent) {
        const price = parseValidPrice(priceEl.textContent.trim());
        if (price !== void 0) return price;
      }
    }
    return void 0;
  }
  /**
   * Extract name/title from an element using common selectors
   */
  static extractName(element) {
    for (const selector of this.NAME_SELECTORS) {
      const nameEl = element.querySelector(selector);
      const name = nameEl?.textContent?.trim();
      if (name) return name;
    }
    return void 0;
  }
  /**
   * Extract quantity from element attributes
   */
  static extractQuantity(element) {
    const qtyAttr = element.getAttribute("data-next-quantity") || element.getAttribute("data-quantity") || element.getAttribute("data-qty");
    return qtyAttr ? parseInt(qtyAttr, 10) || 1 : 1;
  }
};
_ElementDataExtractor.PRICE_SELECTORS = [
  ".pb-quantity__price.pb--current",
  ".price",
  '[data-next-display*="price"]',
  ".next-price",
  ".product-price",
  ".item-price"
];
_ElementDataExtractor.NAME_SELECTORS = [
  ".card-title",
  "h1, h2, h3, h4, h5, h6",
  ".title",
  ".name",
  '[data-next-display*="name"]',
  ".product-name",
  ".item-name"
];
let ElementDataExtractor = _ElementDataExtractor;
class PackageSelectorEnhancer extends BaseEnhancer {
  constructor() {
    super(...arguments);
    this.items = [];
    this.selectedItem = null;
    this.clickHandlers = /* @__PURE__ */ new Map();
  }
  async initialize() {
    this.validateElement();
    this.selectorId = this.getRequiredAttribute("data-next-selector-id") || this.getRequiredAttribute("data-next-id") || `selector-${Date.now()}`;
    this.mode = this.getAttribute("data-next-selection-mode") || "swap";
    this.initializeSelectorCards();
    this.subscribe(useCartStore, this.syncWithCart.bind(this));
    this.syncWithCart(useCartStore.getState());
    this.element._getSelectedItem = () => this.selectedItem;
    this.element._getSelectedPackageId = () => this.selectedItem?.packageId;
    this.logger.debug(`Initialized package selector:`, {
      selectorId: this.selectorId,
      mode: this.mode,
      itemCount: this.items.length,
      element: this.element,
      initialSelectedPackage: this.selectedItem?.packageId
    });
    this.logger.info(`Selector "${this.selectorId}" initialized with ${this.items.length} items in ${this.mode} mode`);
  }
  initializeSelectorCards() {
    const cardElements = this.element.querySelectorAll("[data-next-selector-card]");
    cardElements.forEach((cardElement) => {
      if (cardElement instanceof HTMLElement) {
        this.registerCard(cardElement);
      }
    });
    if (this.items.length === 0) {
      this.logger.warn("No selector cards found in selector", this.element);
    }
  }
  registerCard(cardElement) {
    const packageIdAttr = cardElement.getAttribute("data-next-package-id");
    if (!packageIdAttr) {
      this.logger.warn("Card missing package ID attribute", cardElement);
      return;
    }
    const packageId = parseInt(packageIdAttr, 10);
    const quantity = parseInt(cardElement.getAttribute("data-next-quantity") || "1", 10);
    const isPreSelected = cardElement.getAttribute("data-next-selected") === "true";
    const shippingId = cardElement.getAttribute("data-next-shipping-id");
    let packageData;
    try {
      const campaignState = useCampaignStore.getState();
      packageData = campaignState.getPackage(packageId) || void 0;
    } catch (error) {
      this.logger.debug("Package data not yet available for:", packageId);
    }
    const extractedPrice = packageData?.price ? parseFloat(packageData.price) : ElementDataExtractor.extractPrice(cardElement);
    const extractedName = packageData?.name || ElementDataExtractor.extractName(cardElement) || `Package ${packageId}`;
    const item = {
      element: cardElement,
      packageId,
      quantity,
      price: extractedPrice,
      name: extractedName,
      isPreSelected,
      shippingId: shippingId || void 0
    };
    this.items.push(item);
    const clickHandler = (event) => this.handleCardClick(event, item);
    this.clickHandlers.set(cardElement, clickHandler);
    cardElement.addEventListener("click", clickHandler);
    cardElement.classList.add("next-selector-card");
    this.logger.debug(`Registered selector card:`, {
      packageId,
      quantity,
      isPreSelected,
      shippingId
    });
  }
  async handleCardClick(event, item) {
    event.preventDefault();
    try {
      if (this.selectedItem === item) {
        return;
      }
      const previousItem = this.selectedItem;
      this.selectItem(item);
      this.eventBus.emit("selector:item-selected", {
        selectorId: this.selectorId,
        packageId: item.packageId,
        previousPackageId: previousItem?.packageId || void 0,
        mode: this.mode,
        pendingAction: this.mode === "select" ? true : void 0
      });
      this.element.setAttribute("data-selected-package", item.packageId.toString());
      this.element._selectedItem = item;
      if (this.mode === "swap") {
        await this.updateCart(previousItem, item);
        if (item.shippingId) {
          await this.setShippingMethod(item.shippingId);
        }
      }
    } catch (error) {
      this.handleError(error, "handleCardClick");
    }
  }
  selectItem(item) {
    this.items.forEach((i) => {
      i.element.classList.remove("next-selected");
      i.element.setAttribute("data-next-selected", "false");
    });
    item.element.classList.add("next-selected");
    item.element.setAttribute("data-next-selected", "true");
    this.selectedItem = item;
    this.element.setAttribute("data-selected-package", item.packageId.toString());
    this.logger.debug(`Selected item in selector ${this.selectorId}:`, {
      packageId: item.packageId,
      name: item.name,
      quantity: item.quantity
    });
    this.emit("selector:selection-changed", {
      selectorId: this.selectorId,
      packageId: item.packageId,
      item
    });
  }
  async updateCart(previousItem, selectedItem) {
    const cartStore = useCartStore.getState();
    if (previousItem && previousItem.packageId !== selectedItem.packageId) {
      await cartStore.swapPackage(previousItem.packageId, {
        packageId: selectedItem.packageId,
        quantity: selectedItem.quantity,
        isUpsell: false
      });
    } else if (!cartStore.hasItem(selectedItem.packageId)) {
      await cartStore.addItem({
        packageId: selectedItem.packageId,
        quantity: selectedItem.quantity,
        isUpsell: false
      });
    }
  }
  async setShippingMethod(shippingId) {
    try {
      const shippingIdNum = parseInt(shippingId, 10);
      if (isNaN(shippingIdNum)) {
        this.logger.error("Invalid shipping ID:", shippingId);
        return;
      }
      const cartStore = useCartStore.getState();
      await cartStore.setShippingMethod(shippingIdNum);
      this.logger.debug(`Shipping method ${shippingIdNum} set via selector`);
    } catch (error) {
      this.logger.error("Failed to set shipping method:", error);
    }
  }
  syncWithCart(cartState) {
    try {
      this.items.forEach((item) => {
        const isInCart = cartState.items.some(
          (cartItem) => cartItem.packageId === item.packageId
        );
        item.element.classList.toggle("next-in-cart", isInCart);
        item.element.setAttribute("data-next-in-cart", isInCart.toString());
      });
      const cartItemsInSelector = this.items.filter(
        (item) => cartState.items.some((cartItem) => cartItem.packageId === item.packageId)
      );
      if (cartItemsInSelector.length > 0 && this.mode === "swap") {
        const itemToSelect = cartItemsInSelector[0];
        if (itemToSelect && this.selectedItem !== itemToSelect) {
          this.selectItem(itemToSelect);
        }
      } else if (!this.selectedItem) {
        const preSelectedItems = this.items.filter((item) => item.isPreSelected);
        if (preSelectedItems.length > 1) {
          this.logger.warn(`Multiple pre-selected items found in selector ${this.selectorId}. Only one should be pre-selected.`);
          preSelectedItems.slice(1).forEach((item) => {
            item.element.classList.remove("next-selected");
            item.element.setAttribute("data-next-selected", "false");
            item.isPreSelected = false;
          });
        }
        const preSelected = preSelectedItems[0];
        if (preSelected) {
          this.selectItem(preSelected);
          if (this.mode !== "select") {
            this.updateCart(null, preSelected).catch((error) => {
              this.logger.error("Failed to add pre-selected item:", error);
            });
          }
        }
      }
    } catch (error) {
      this.handleError(error, "syncWithCart");
    }
  }
  update() {
    this.syncWithCart(useCartStore.getState());
  }
  getSelectedItem() {
    return this.selectedItem;
  }
  getSelectorConfig() {
    return {
      id: this.selectorId,
      mode: this.mode,
      itemCount: this.items.length
    };
  }
  cleanupEventListeners() {
    this.clickHandlers.forEach((handler, element) => {
      element.removeEventListener("click", handler);
    });
    this.clickHandlers.clear();
  }
  destroy() {
    this.cleanupEventListeners();
    this.items.forEach((item) => {
      item.element.classList.remove(
        "next-selector-card",
        "next-selected",
        "next-in-cart"
      );
    });
    super.destroy();
  }
}
export {
  PackageSelectorEnhancer
};
