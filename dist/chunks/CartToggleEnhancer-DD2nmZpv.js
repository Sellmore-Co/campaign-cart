import { B as BaseEnhancer } from "./BaseEnhancer-BXn1ZPNz.js";
import { u as useCartStore, a as useCampaignStore } from "./utils-Bnlf88EQ.js";
const autoAddedPackages = /* @__PURE__ */ new Set();
if (typeof window !== "undefined") {
  window.addEventListener("beforeunload", () => {
    autoAddedPackages.clear();
  });
}
class CartToggleEnhancer extends BaseEnhancer {
  constructor() {
    super(...arguments);
    this.quantity = 1;
    this.syncPackageIds = [];
    this.isSyncMode = false;
    this.isUpsell = false;
    this.isInitialized = false;
    this.isAutoAdding = false;
  }
  async initialize() {
    this.validateElement();
    if (this.isInitialized) {
      this.logger.warn("CartToggleEnhancer already initialized, skipping");
      return;
    }
    if (this.element.hasAttribute("data-toggle-initializing")) {
      this.logger.warn("CartToggleEnhancer initialization already in progress, skipping");
      return;
    }
    this.element.setAttribute("data-toggle-initializing", "true");
    if (!this.hasAttribute("data-next-toggle")) {
      this.element.removeAttribute("data-toggle-initializing");
      throw new Error("data-next-toggle attribute is required");
    }
    this.findStateContainer();
    this.resolvePackageIdentifier();
    this.checkSyncMode();
    if (!this.isSyncMode) {
      this.setQuantity();
    }
    this.detectUpsellContext();
    this.setupEventListeners();
    this.updateState(useCartStore.getState());
    await this.checkAutoAdd();
    this.isInitialized = true;
    this.element.removeAttribute("data-toggle-initializing");
    this.element.setAttribute("data-toggle-initialized", "true");
    this.logger.debug("Toggle initialized:", {
      packageId: this.packageId,
      quantity: this.quantity,
      isSyncMode: this.isSyncMode,
      syncPackageIds: this.syncPackageIds,
      isUpsell: this.isUpsell
    });
  }
  findStateContainer() {
    let element = this.element;
    while (element && element !== document.body) {
      if (element.hasAttribute("data-next-toggle-container") || element.hasAttribute("data-next-bump") || element.hasAttribute("data-next-upsell-item") || element.classList.contains("upsell") || element.classList.contains("bump")) {
        this.stateContainer = element;
        break;
      }
      if (element.hasAttribute("data-next-package-id") || element.hasAttribute("data-package-id")) {
        this.stateContainer = element;
        break;
      }
      element = element.parentElement;
    }
    if (!this.stateContainer) {
      this.stateContainer = this.element;
    }
  }
  resolvePackageIdentifier() {
    const elementPackageId = this.getAttribute("data-next-package-id") || this.getAttribute("data-package-id");
    if (elementPackageId) {
      this.packageId = parseInt(elementPackageId, 10);
      return;
    }
    if (this.stateContainer && this.stateContainer !== this.element) {
      const containerPackageId = this.stateContainer.getAttribute("data-next-package-id") || this.stateContainer.getAttribute("data-package-id");
      if (containerPackageId) {
        this.packageId = parseInt(containerPackageId, 10);
        return;
      }
    }
    throw new Error("Package identifier required: data-next-package-id");
  }
  checkSyncMode() {
    const packageSyncAttr = this.getAttribute("data-next-package-sync") || this.stateContainer?.getAttribute("data-next-package-sync");
    const qtySyncAttr = this.getAttribute("data-next-qty-sync") || this.stateContainer?.getAttribute("data-next-qty-sync");
    if (packageSyncAttr) {
      this.syncPackageIds = packageSyncAttr.split(",").map((id) => parseInt(id.trim(), 10)).filter((id) => !isNaN(id));
      if (this.syncPackageIds.length > 0) {
        this.isSyncMode = true;
        this.quantity = 0;
      }
    } else if (qtySyncAttr) {
      const syncId = parseInt(qtySyncAttr, 10);
      if (!isNaN(syncId)) {
        this.syncPackageIds = [syncId];
        this.isSyncMode = true;
        this.quantity = 0;
      }
    }
  }
  setQuantity() {
    const qtyAttr = this.getAttribute("data-next-quantity") || this.getAttribute("data-quantity") || this.stateContainer?.getAttribute("data-next-quantity");
    this.quantity = qtyAttr ? parseInt(qtyAttr, 10) : 1;
  }
  detectUpsellContext() {
    this.isUpsell = this.getAttribute("data-next-is-upsell") === "true" || this.stateContainer?.hasAttribute("data-next-upsell") || this.stateContainer?.hasAttribute("data-next-bump") || this.element.closest("[data-next-upsell-section]") !== null || this.element.closest("[data-next-bump-section]") !== null;
  }
  async checkAutoAdd() {
    const isSelected = this.getAttribute("data-next-selected") === "true" || this.stateContainer?.getAttribute("data-next-selected") === "true";
    if (isSelected && this.packageId) {
      if (autoAddedPackages.has(this.packageId)) {
        this.logger.debug("Package already auto-added by another element, skipping:", {
          packageId: this.packageId
        });
        return;
      }
      if (this.isAutoAdding) {
        this.logger.debug("Auto-add already in progress, skipping");
        return;
      }
      const cartState = useCartStore.getState();
      const isInCart = this.isInCart(cartState);
      if (!isInCart) {
        autoAddedPackages.add(this.packageId);
        this.logger.debug("Auto-adding item on page load:", {
          packageId: this.packageId,
          quantity: this.quantity
        });
        this.isAutoAdding = true;
        try {
          if (this.isSyncMode) {
            this.updateSyncedQuantity(cartState);
          }
          await this.addToCart();
        } catch (error) {
          this.logger.error("Failed to auto-add item:", error);
          autoAddedPackages.delete(this.packageId);
        } finally {
          this.isAutoAdding = false;
        }
      }
    }
  }
  setupEventListeners() {
    this.clickHandler = this.handleClick.bind(this);
    this.element.addEventListener("click", this.clickHandler);
    this.subscribe(useCartStore, (state) => this.updateState(state));
  }
  async handleClick(event) {
    event.preventDefault();
    try {
      this.setLoadingState(true);
      const cartState = useCartStore.getState();
      if (this.isSyncMode) {
        this.updateSyncedQuantity(cartState);
      }
      const isInCart = this.isInCart(cartState);
      this.logger.debug("Toggle click:", {
        packageId: this.packageId,
        isInCart,
        quantity: this.quantity,
        isSyncMode: this.isSyncMode
      });
      if (isInCart) {
        await this.removeFromCart();
      } else {
        await this.addToCart();
      }
    } catch (error) {
      this.handleError(error, "handleClick");
    } finally {
      this.setLoadingState(false);
    }
  }
  async addToCart() {
    const cartStore = useCartStore.getState();
    this.logger.debug("Adding to cart:", {
      packageId: this.packageId,
      quantity: this.quantity
    });
    if (this.packageId) {
      let title = `Package ${this.packageId}`;
      let price = 0;
      try {
        const campaign = useCampaignStore.getState();
        const pkg = campaign.getPackage(this.packageId);
        if (pkg) {
          title = pkg.name;
          price = parseFloat(pkg.price);
          this.logger.debug("Found package data:", { title, price });
        } else {
          this.logger.debug("Package not found in campaign store");
        }
      } catch (e) {
        this.logger.debug("Error getting package data:", e);
      }
      await cartStore.addItem({
        packageId: this.packageId,
        quantity: this.quantity,
        title,
        price,
        isUpsell: this.isUpsell
      });
      this.logger.debug("Added to cart successfully");
    }
  }
  async removeFromCart() {
    const cartStore = useCartStore.getState();
    if (this.packageId) {
      await cartStore.removeItem(this.packageId);
    }
  }
  updateState(cartState) {
    const inCart = this.isInCart(cartState);
    if (this.stateContainer) {
      this.stateContainer.setAttribute("data-in-cart", String(inCart));
      this.stateContainer.setAttribute("data-next-active", String(inCart));
      this.stateContainer.classList.toggle("next-in-cart", inCart);
      this.stateContainer.classList.toggle("next-not-in-cart", !inCart);
      this.stateContainer.classList.toggle("next-active", inCart);
      this.stateContainer.classList.toggle("os--active", inCart);
    }
    this.setAttribute("data-in-cart", String(inCart));
    this.setAttribute("data-next-active", String(inCart));
    this.toggleClass("next-in-cart", inCart);
    this.toggleClass("next-not-in-cart", !inCart);
    this.toggleClass("next-active", inCart);
    const addText = this.getAttribute("data-add-text");
    const removeText = this.getAttribute("data-remove-text");
    if (addText && removeText) {
      this.updateTextContent(inCart ? removeText : addText);
    }
    if (this.isSyncMode && this.syncPackageIds.length > 0) {
      this.handleSyncUpdate(cartState);
    }
  }
  updateSyncedQuantity(cartState) {
    if (this.syncPackageIds.length === 0) return;
    let totalQuantity = 0;
    this.syncPackageIds.forEach((syncId) => {
      const syncedItem = cartState.items.find((item) => item.packageId === syncId);
      if (syncedItem) {
        const itemsPerPackage = syncedItem.qty || 1;
        const totalItemsForPackage = syncedItem.quantity * itemsPerPackage;
        totalQuantity += totalItemsForPackage;
        this.logger.debug(`Sync package ${syncId}: ${syncedItem.quantity} packages × ${itemsPerPackage} items/package = ${totalItemsForPackage} total`);
      }
    });
    this.quantity = totalQuantity;
    this.logger.debug(`Total sync quantity: ${this.quantity} (from packages: ${this.syncPackageIds.join(", ")})`);
  }
  async handleSyncUpdate(cartState) {
    if (!this.packageId || this.syncPackageIds.length === 0) return;
    let totalSyncQuantity = 0;
    let anySyncedItemExists = false;
    this.syncPackageIds.forEach((syncId) => {
      const syncedItem = cartState.items.find((item) => item.packageId === syncId);
      if (syncedItem) {
        anySyncedItemExists = true;
        const itemsPerPackage = syncedItem.qty || 1;
        totalSyncQuantity += syncedItem.quantity * itemsPerPackage;
      }
    });
    const currentItem = cartState.items.find((item) => item.packageId === this.packageId);
    if (anySyncedItemExists && totalSyncQuantity > 0) {
      if (currentItem && currentItem.quantity !== totalSyncQuantity) {
        this.logger.debug(`Auto-sync: Updating quantity to ${totalSyncQuantity}`);
        await useCartStore.getState().updateQuantity(this.packageId, totalSyncQuantity);
      }
    } else if (currentItem && !cartState.swapInProgress) {
      this.logger.debug("Auto-sync: No synced packages found and not swapping - removing item");
      await this.removeFromCart();
    } else if (currentItem && cartState.swapInProgress) {
      this.logger.debug("Auto-sync: Swap in progress - keeping item for now");
    }
  }
  isInCart(cartState) {
    if (this.packageId) {
      return cartState.items.some((item) => item.packageId === this.packageId);
    }
    return false;
  }
  setLoadingState(loading) {
    if (loading) {
      this.addClass("next-loading");
      this.setAttribute("disabled", "true");
    } else {
      this.removeClass("next-loading");
      this.removeAttribute("disabled");
    }
  }
  update() {
    this.updateState(useCartStore.getState());
  }
  cleanupEventListeners() {
    if (this.clickHandler) {
      this.element.removeEventListener("click", this.clickHandler);
    }
  }
}
export {
  CartToggleEnhancer
};
