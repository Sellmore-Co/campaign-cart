import { B as BaseActionEnhancer } from "./BaseActionEnhancer-CaR6SjNq.js";
import { c as configStore, d as ApiClient, b as useOrderStore, s as sentryManager } from "./analytics-Dvf5RBLE.js";
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
    const isAlreadyAccepted = this.checkIfUpsellAlreadyAccepted(packageIdToAdd);
    if (isAlreadyAccepted) {
      const shouldProceed = await this.showDuplicateUpsellDialog();
      if (!shouldProceed) {
        if (this.nextUrl) {
          const redirectUrl = preserveQueryParams(this.nextUrl);
          window.location.href = redirectUrl;
        }
        return;
      }
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
    return new Promise((resolve) => {
      const backdrop = document.createElement("div");
      backdrop.className = "next-modal-backdrop";
      backdrop.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        animation: fadeIn 0.2s ease-out;
      `;
      const modal = document.createElement("div");
      modal.className = "next-modal";
      modal.style.cssText = `
        background: white;
        border-radius: 8px;
        padding: 24px;
        max-width: 400px;
        width: 90%;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06);
        animation: slideIn 0.3s ease-out;
      `;
      modal.innerHTML = `
        <div style="text-align: center;">
          <h3 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 600; color: #1a202c;">
            Already Added!
          </h3>
          <p style="margin: 0 0 24px 0; color: #4a5568; line-height: 1.5;">
            You've already added this item to your order. Would you like to add it again?
          </p>
          <div style="display: flex; gap: 12px; justify-content: center;">
            <button class="next-modal-cancel" style="
              padding: 10px 20px;
              border: 1px solid #e2e8f0;
              background: white;
              border-radius: 6px;
              font-size: 16px;
              cursor: pointer;
              color: #4a5568;
              transition: all 0.2s;
            ">Skip to Next</button>
            <button class="next-modal-confirm" style="
              padding: 10px 20px;
              border: none;
              background: #3182ce;
              color: white;
              border-radius: 6px;
              font-size: 16px;
              cursor: pointer;
              font-weight: 500;
              transition: all 0.2s;
            ">Yes, Add Again</button>
          </div>
        </div>
      `;
      const style = document.createElement("style");
      style.textContent = `
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideIn {
          from { 
            opacity: 0;
            transform: translateY(-20px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }
        .next-modal-cancel:hover {
          border-color: #cbd5e0 !important;
          background: #f7fafc !important;
        }
        .next-modal-confirm:hover {
          background: #2c5282 !important;
        }
      `;
      document.head.appendChild(style);
      backdrop.appendChild(modal);
      document.body.appendChild(backdrop);
      const cancelBtn = modal.querySelector(".next-modal-cancel");
      const confirmBtn = modal.querySelector(".next-modal-confirm");
      const cleanup = () => {
        backdrop.remove();
        style.remove();
      };
      cancelBtn.addEventListener("click", () => {
        cleanup();
        this.logger.info("User declined to add duplicate upsell");
        resolve(false);
      });
      confirmBtn.addEventListener("click", () => {
        cleanup();
        this.logger.info("User confirmed to add duplicate upsell");
        resolve(true);
      });
      backdrop.addEventListener("click", (e) => {
        if (e.target === backdrop) {
          cleanup();
          resolve(false);
        }
      });
    });
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
