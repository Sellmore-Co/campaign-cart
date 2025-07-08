import { B as BaseActionEnhancer } from "./BaseActionEnhancer-C9T6ycsQ.js";
import { c as configStore, d as ApiClient, b as useOrderStore, s as sentryManager } from "./analytics-CbggJMJ_.js";
import { p as preserveQueryParams } from "./url-utils-Bp-Q8IGf.js";
class AcceptUpsellEnhancer extends BaseActionEnhancer {
  constructor() {
    super(...arguments);
    this.quantity = 1;
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
    const nextUrlAttr = this.getAttribute("data-next-url");
    if (nextUrlAttr) {
      this.nextUrl = nextUrlAttr;
    }
    const config = configStore.getState();
    this.apiClient = new ApiClient(config.apiKey);
    this.clickHandler = this.handleClick.bind(this);
    this.element.addEventListener("click", this.clickHandler);
    if (this.selectorId) {
      this.setupSelectorListener();
    }
    this.subscribe(useOrderStore, () => this.updateButtonState());
    this.updateButtonState();
    this.logger.debug("AcceptUpsellEnhancer initialized", {
      packageId: this.packageId,
      selectorId: this.selectorId,
      quantity: this.quantity,
      nextUrl: this.nextUrl
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
    this.eventBus.on("upsell-selector:item-selected", this.handleSelectorChange.bind(this));
    this.eventBus.on("selector:item-selected", this.handleSelectorChange.bind(this));
    this.eventBus.on("selector:selection-changed", this.handleSelectorChange.bind(this));
  }
  findSelectorElement() {
    return document.querySelector(
      `[data-next-upsell-selector][data-next-selector-id="${this.selectorId}"], [data-next-upsell-select="${this.selectorId}"], [data-next-upsell][data-next-selector-id="${this.selectorId}"]`
    );
  }
  getSelectedItemFromElement(element) {
    const getSelectedPackageId = element._getSelectedPackageId;
    if (typeof getSelectedPackageId === "function") {
      const packageId = getSelectedPackageId();
      if (packageId) {
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
    const selectedPackageId = element._selectedPackageId;
    if (selectedPackageId) {
      return {
        packageId: selectedPackageId,
        quantity: 1,
        element: null,
        price: void 0,
        name: void 0,
        isPreSelected: false,
        shippingId: void 0
      };
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
    const orderStore = useOrderStore.getState();
    const canAddUpsells = orderStore.canAddUpsells();
    const hasPackage = !!(this.packageId || this.selectedItem);
    this.setEnabled(canAddUpsells && hasPackage);
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
        await sentryManager.startSpan(
          {
            op: "ui.click",
            name: "Accept Upsell Button Click",
            attributes: {
              "button.package_id": this.packageId,
              "button.selector_id": this.selectorId,
              "button.quantity": this.quantity
            }
          },
          async () => {
            await this.acceptUpsell();
          }
        );
      },
      { showLoading: true, disableOnProcess: true }
    );
  }
  async acceptUpsell() {
    const orderStore = useOrderStore.getState();
    let packageIdToAdd;
    let quantityToAdd = this.quantity;
    if (this.selectorId && this.selectedItem) {
      packageIdToAdd = this.selectedItem.packageId;
      quantityToAdd = this.selectedItem.quantity || this.quantity;
    } else if (this.packageId) {
      packageIdToAdd = this.packageId;
    }
    if (!packageIdToAdd) {
      this.logger.warn("No package ID available for accept-upsell action");
      return;
    }
    if (!orderStore.order || !this.apiClient) {
      this.logger.error("No order loaded or API client not initialized");
      return;
    }
    try {
      const upsellData = {
        lines: [{
          package_id: packageIdToAdd,
          quantity: quantityToAdd
        }]
      };
      const previousLineIds = orderStore.order.lines?.map((line) => line.id) || [];
      const updatedOrder = await orderStore.addUpsell(upsellData, this.apiClient);
      if (!updatedOrder) {
        throw new Error("Failed to add upsell");
      }
      const addedLine = updatedOrder.lines?.find(
        (line) => line.is_upsell && !previousLineIds.includes(line.id)
      );
      const upsellValue = addedLine?.price_incl_tax ? parseFloat(addedLine.price_incl_tax) : 0;
      this.eventBus.emit("upsell:accepted", {
        packageId: packageIdToAdd,
        quantity: quantityToAdd,
        orderId: orderStore.order.ref_id,
        value: upsellValue
      });
      if (this.nextUrl) {
        const redirectUrl = preserveQueryParams(this.nextUrl);
        window.location.href = redirectUrl;
      }
    } catch (error) {
      this.logger.error("Failed to accept upsell:", error);
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
      this.eventBus.off("upsell-selector:item-selected", this.handleSelectorChange.bind(this));
      this.eventBus.off("selector:item-selected", this.handleSelectorChange.bind(this));
      this.eventBus.off("selector:selection-changed", this.handleSelectorChange.bind(this));
    }
    super.destroy();
  }
}
export {
  AcceptUpsellEnhancer
};
