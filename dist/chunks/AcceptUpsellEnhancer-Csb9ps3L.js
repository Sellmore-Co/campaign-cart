import { B as BaseActionEnhancer } from "./BaseActionEnhancer-DhA4DO-W.js";
import { f as configStore, e as useOrderStore, a as useCampaignStore, S as preserveQueryParams } from "./utils-D3MhrmeJ.js";
import { ApiClient } from "./api-C7AqiGNG.js";
import { G as GeneralModal } from "./GeneralModal-Cuk4sJCc.js";
import { L as LoadingOverlay } from "./LoadingOverlay-DOjYiQnB.js";
class AcceptUpsellEnhancer extends BaseActionEnhancer {
  constructor(element) {
    super(element);
    this.quantity = 1;
    this.loadingOverlay = new LoadingOverlay();
  }
  async initialize() {
    this.validateElement();
    this.pageShowHandler = (event) => {
      if (event.persisted) {
        this.loadingOverlay.hide(true);
        this.setEnabled(true);
      }
    };
    window.addEventListener("pageshow", this.pageShowHandler);
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
        await this.acceptUpsell();
      },
      { showLoading: false, disableOnProcess: true }
      // Use our own loading overlay
    );
  }
  getCurrency() {
    const campaignState = useCampaignStore.getState();
    if (campaignState?.data?.currency) {
      return campaignState.data.currency;
    }
    const configStore$1 = configStore.getState();
    return configStore$1?.selectedCurrency || configStore$1?.detectedCurrency || "USD";
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
    const isAlreadyAccepted = this.checkIfUpsellAlreadyAccepted(packageIdToAdd);
    if (isAlreadyAccepted) {
      const shouldProceed = await this.showDuplicateUpsellDialog();
      if (!shouldProceed) {
        let declineUrl = this.nextUrl;
        if (!declineUrl) {
          const declineMeta = document.querySelector('meta[name="next-upsell-decline-url"]');
          declineUrl = declineMeta?.getAttribute("content") || void 0;
          if (declineUrl) {
            this.logger.debug("Using fallback decline URL from meta tag:", declineUrl);
          }
        }
        if (declineUrl) {
          const redirectUrl = preserveQueryParams(declineUrl);
          window.location.href = redirectUrl;
        }
        return;
      }
    }
    try {
      this.loadingOverlay.show();
      const upsellData = {
        lines: [{
          package_id: packageIdToAdd,
          quantity: quantityToAdd
        }],
        currency: this.getCurrency()
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
      let redirectUrl = this.nextUrl;
      if (!redirectUrl) {
        const acceptMeta = document.querySelector('meta[name="next-upsell-accept-url"]');
        redirectUrl = acceptMeta?.getAttribute("content") || void 0;
        if (redirectUrl) {
          this.logger.debug("Using fallback accept URL from meta tag:", redirectUrl);
        }
      }
      if (redirectUrl) {
        const finalUrl = preserveQueryParams(redirectUrl);
        window.location.href = finalUrl;
      } else {
        this.loadingOverlay.hide();
      }
    } catch (error) {
      this.logger.error("Failed to accept upsell:", error);
      this.loadingOverlay.hide(true);
      throw error;
    }
  }
  checkIfUpsellAlreadyAccepted(packageId) {
    const orderStore = useOrderStore.getState();
    if (orderStore.completedUpsells.includes(packageId.toString())) {
      return true;
    }
    const acceptedInJourney = orderStore.upsellJourney.some(
      (entry) => entry.packageId === packageId.toString() && entry.action === "accepted"
    );
    return acceptedInJourney;
  }
  async showDuplicateUpsellDialog() {
    const result = await GeneralModal.showDuplicateUpsell();
    this.logger.info(result ? "User confirmed to add duplicate upsell" : "User declined to add duplicate upsell");
    return result;
  }
  update(_data) {
  }
  destroy() {
    if (this.clickHandler) {
      this.element.removeEventListener("click", this.clickHandler);
    }
    if (this.pageShowHandler) {
      window.removeEventListener("pageshow", this.pageShowHandler);
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
