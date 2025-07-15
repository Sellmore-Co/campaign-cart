import { B as BaseEnhancer } from "./BaseEnhancer-Cv_63cIz.js";
import { b as useOrderStore, c as configStore, d as ApiClient, a as useCampaignStore } from "./analytics-DFGNuX0x.js";
import { p as preserveQueryParams } from "./url-utils-Bp-Q8IGf.js";
const _UpsellEnhancer = class _UpsellEnhancer extends BaseEnhancer {
  constructor() {
    super(...arguments);
    this.quantity = 1;
    this.actionButtons = [];
    this.isSelector = false;
    this.options = /* @__PURE__ */ new Map();
  }
  async initialize() {
    this.validateElement();
    setTimeout(() => {
      this.trackUpsellPageView();
    }, 100);
    this.selectorId = this.getAttribute("data-next-selector-id") || "";
    this.isSelector = !!this.selectorId;
    if (this.isSelector) {
      this.initializeSelectorMode();
    } else {
      const packageIdAttr = this.getAttribute("data-next-package-id");
      if (!packageIdAttr) {
        throw new Error("UpsellEnhancer requires data-next-package-id attribute (or use selector mode with data-next-selector-id)");
      }
      this.packageId = parseInt(packageIdAttr, 10);
      if (isNaN(this.packageId)) {
        throw new Error("Invalid package ID provided");
      }
      const orderStore = useOrderStore.getState();
      if (orderStore.order) {
        orderStore.markUpsellViewed(this.packageId.toString());
      }
    }
    const quantityAttr = this.getAttribute("data-next-quantity");
    if (quantityAttr) {
      this.quantity = parseInt(quantityAttr, 10) || 1;
    }
    const config = configStore.getState();
    this.apiClient = new ApiClient(config.apiKey);
    this.scanUpsellElements();
    this.setupEventHandlers();
    this.subscribe(useOrderStore, this.handleOrderUpdate.bind(this));
    this.updateUpsellDisplay();
    this.logger.debug("UpsellEnhancer initialized", {
      mode: this.isSelector ? "selector" : "direct",
      packageId: this.packageId,
      selectorId: this.selectorId,
      quantity: this.quantity,
      actionButtons: this.actionButtons.length,
      options: this.options.size,
      currentPagePath: this.currentPagePath
    });
    this.emit("upsell:initialized", {
      packageId: this.packageId || 0,
      element: this.element
    });
  }
  trackUpsellPageView() {
    const pageTypeMeta = document.querySelector('meta[name="next-page-type"]');
    if (pageTypeMeta && pageTypeMeta.getAttribute("content") === "upsell") {
      this.currentPagePath = window.location.pathname;
      if (!_UpsellEnhancer.pageViewTracked || _UpsellEnhancer.currentPagePath !== this.currentPagePath) {
        _UpsellEnhancer.pageViewTracked = true;
        _UpsellEnhancer.currentPagePath = this.currentPagePath;
        const orderStore = useOrderStore.getState();
        if (orderStore.order) {
          orderStore.markUpsellPageViewed(this.currentPagePath);
          this.logger.debug("Tracked upsell page view:", this.currentPagePath);
          this.eventBus.emit("upsell:viewed", {
            pagePath: this.currentPagePath,
            orderId: orderStore.order.ref_id
          });
        }
      }
    }
  }
  initializeSelectorMode() {
    const optionElements = this.element.querySelectorAll("[data-next-upsell-option]");
    optionElements.forEach((element) => {
      if (element instanceof HTMLElement) {
        const packageIdAttr = element.getAttribute("data-next-package-id");
        if (packageIdAttr) {
          const packageId = parseInt(packageIdAttr, 10);
          if (!isNaN(packageId)) {
            this.options.set(packageId, element);
            element.addEventListener("click", () => this.selectOption(packageId));
            if (element.getAttribute("data-next-selected") === "true") {
              this.selectOption(packageId);
            }
          }
        }
      }
    });
    let selectElement = null;
    if (this.element.tagName === "SELECT") {
      selectElement = this.element;
    } else {
      selectElement = this.element.querySelector(`[data-next-upsell-select="${this.selectorId}"]`);
    }
    if (selectElement) {
      selectElement.addEventListener("change", () => {
        const value = selectElement.value;
        if (value) {
          const packageId = parseInt(value, 10);
          if (!isNaN(packageId)) {
            this.selectOption(packageId);
          }
        } else {
          delete this.selectedPackageId;
          delete this.packageId;
        }
      });
      if (selectElement.value) {
        const packageId = parseInt(selectElement.value, 10);
        if (!isNaN(packageId)) {
          this.selectOption(packageId);
        }
      }
    }
  }
  selectOption(packageId) {
    this.options.forEach((element, id) => {
      if (id === packageId) {
        element.classList.add("next-selected");
        element.setAttribute("data-next-selected", "true");
      } else {
        element.classList.remove("next-selected");
        element.setAttribute("data-next-selected", "false");
      }
    });
    this.selectedPackageId = packageId;
    this.packageId = packageId;
    this.eventBus.emit("upsell-selector:item-selected", {
      selectorId: this.selectorId || "",
      packageId
    });
    this.element._selectedPackageId = packageId;
    this.logger.debug("Upsell option selected:", { packageId, selectorId: this.selectorId });
  }
  scanUpsellElements() {
    const actionSelectors = [
      "[data-next-upsell-action]"
    ];
    actionSelectors.forEach((selector) => {
      this.element.querySelectorAll(selector).forEach((element) => {
        if (element instanceof HTMLElement) {
          this.actionButtons.push(element);
          this.logger.debug("Found upsell action button:", element);
        }
      });
    });
    const increaseBtn = this.element.querySelector('[data-next-upsell-quantity="increase"]');
    const decreaseBtn = this.element.querySelector('[data-next-upsell-quantity="decrease"]');
    if (increaseBtn) {
      increaseBtn.addEventListener("click", () => {
        this.quantity = Math.min(10, this.quantity + 1);
        this.updateQuantityDisplay();
      });
    }
    if (decreaseBtn) {
      decreaseBtn.addEventListener("click", () => {
        this.quantity = Math.max(1, this.quantity - 1);
        this.updateQuantityDisplay();
      });
    }
    const quantityToggles = this.element.querySelectorAll("[data-next-upsell-quantity-toggle]");
    quantityToggles.forEach((toggle) => {
      if (toggle instanceof HTMLElement) {
        const qty = parseInt(toggle.getAttribute("data-next-upsell-quantity-toggle") || "1", 10);
        toggle.addEventListener("click", () => {
          this.quantity = qty;
          this.updateQuantityDisplay();
          this.updateQuantityToggles();
        });
        if (qty === this.quantity) {
          toggle.classList.add("next-selected");
        }
      }
    });
  }
  updateQuantityDisplay() {
    const display = this.element.querySelector('[data-next-upsell-quantity="display"]');
    if (display) {
      display.textContent = this.quantity.toString();
    }
  }
  updateQuantityToggles() {
    const toggles = this.element.querySelectorAll("[data-next-upsell-quantity-toggle]");
    toggles.forEach((toggle) => {
      if (toggle instanceof HTMLElement) {
        const qty = parseInt(toggle.getAttribute("data-next-upsell-quantity-toggle") || "1", 10);
        if (qty === this.quantity) {
          toggle.classList.add("next-selected");
        } else {
          toggle.classList.remove("next-selected");
        }
      }
    });
  }
  setupEventHandlers() {
    this.clickHandler = this.handleActionClick.bind(this);
    this.actionButtons.forEach((button) => {
      button.addEventListener("click", this.clickHandler);
    });
  }
  async handleActionClick(event) {
    event.preventDefault();
    const button = event.currentTarget;
    const action = button.getAttribute("data-next-upsell-action") || "";
    const nextUrl = button.getAttribute("data-next-url") || button.getAttribute("data-next-next-url") || button.getAttribute("data-os-next-url") || void 0;
    this.logger.debug("Upsell action clicked:", { action, nextUrl });
    switch (action) {
      case "add":
      case "accept":
        await this.addUpsellToOrder(nextUrl);
        break;
      case "skip":
      case "decline":
        this.skipUpsell(nextUrl);
        break;
      default:
        this.logger.warn(`Unknown upsell action: ${action}`);
    }
  }
  async addUpsellToOrder(nextUrl) {
    const orderStore = useOrderStore.getState();
    this.logger.debug("Order state check:", {
      hasOrder: !!orderStore.order,
      supportsUpsells: orderStore.order?.supports_post_purchase_upsells,
      isProcessingUpsell: orderStore.isProcessingUpsell,
      canAddUpsells: orderStore.canAddUpsells()
    });
    if (!orderStore.canAddUpsells()) {
      this.logger.warn("Order does not support upsells or is currently processing");
      if (orderStore.isProcessingUpsell && orderStore.order?.supports_post_purchase_upsells) {
        this.logger.warn("Processing flag stuck, resetting...");
        orderStore.setProcessingUpsell(false);
        if (orderStore.canAddUpsells()) {
          this.logger.info("Reset successful, continuing with upsell...");
        } else {
          this.showError("Unable to add upsell at this time");
          return;
        }
      } else {
        this.showError("Unable to add upsell at this time");
        return;
      }
    }
    const packageToAdd = this.isSelector ? this.selectedPackageId : this.packageId;
    if (packageToAdd && this.checkIfUpsellAlreadyAccepted(packageToAdd)) {
      const shouldProceed = await this.showDuplicateUpsellDialog();
      if (!shouldProceed) {
        if (nextUrl) {
          this.navigateToUrl(nextUrl);
        }
        return;
      }
    }
    this.logger.debug("Package selection:", {
      isSelector: this.isSelector,
      packageId: this.packageId,
      selectedPackageId: this.selectedPackageId,
      packageToAdd
    });
    if (!packageToAdd) {
      this.logger.warn("No package selected for upsell");
      this.showError("Please select an option first");
      return;
    }
    try {
      this.setProcessingState(true);
      this.emit("upsell:adding", { packageId: packageToAdd });
      const upsellData = {
        lines: [{
          package_id: packageToAdd,
          quantity: this.quantity
        }]
      };
      this.logger.info("Adding upsell to order:", upsellData);
      const updatedOrder = await orderStore.addUpsell(upsellData, this.apiClient);
      if (updatedOrder) {
        this.logger.info("Upsell added successfully");
        this.showSuccess();
        let upsellValue = 0;
        const previousLineIds = orderStore.order?.lines?.map((line) => line.id) || [];
        const addedLine = updatedOrder.lines?.find(
          (line) => line.is_upsell && !previousLineIds.includes(line.id)
        );
        if (addedLine?.price_incl_tax) {
          upsellValue = parseFloat(addedLine.price_incl_tax);
        } else {
          const packageData = useCampaignStore.getState().getPackage(packageToAdd);
          if (packageData?.price) {
            upsellValue = parseFloat(packageData.price) * this.quantity;
          }
        }
        this.emit("upsell:added", {
          packageId: packageToAdd,
          quantity: this.quantity,
          order: updatedOrder,
          value: upsellValue
        });
        if (nextUrl) {
          this.navigateToUrl(nextUrl, updatedOrder.ref_id);
        }
      } else {
        throw new Error("Failed to add upsell - no updated order returned");
      }
    } catch (error) {
      this.logger.error("Failed to add upsell:", error);
      this.showError(error instanceof Error ? error.message : "Failed to add upsell");
      this.emit("upsell:error", {
        packageId: this.packageId || 0,
        error: error instanceof Error ? error.message : "Unknown error"
      });
    } finally {
      this.setProcessingState(false);
    }
  }
  skipUpsell(nextUrl) {
    this.logger.info("Upsell skipped by user");
    this.addClass("next-skipped");
    this.disableActions();
    if (this.packageId) {
      const orderStore2 = useOrderStore.getState();
      orderStore2.markUpsellSkipped(this.packageId.toString(), this.currentPagePath);
    }
    const orderStore = useOrderStore.getState();
    const eventData = {};
    if (this.packageId !== void 0) {
      eventData.packageId = this.packageId;
    }
    if (orderStore.order?.ref_id !== void 0) {
      eventData.orderId = orderStore.order.ref_id;
    }
    this.emit("upsell:skipped", eventData);
    if (nextUrl) {
      this.navigateToUrl(nextUrl);
    }
  }
  /**
   * Navigate to a URL, preserving ref_id and debug parameters
   * @param url - The URL to navigate to
   * @param refId - Optional ref_id to preserve (defaults to current order ref_id)
   */
  navigateToUrl(url, refId) {
    if (!url) {
      this.logger.warn("No URL provided for navigation");
      return;
    }
    try {
      const targetUrl = new URL(url, window.location.origin);
      const orderStore = useOrderStore.getState();
      const orderRefId = refId || orderStore.order?.ref_id;
      if (orderRefId && !targetUrl.searchParams.has("ref_id")) {
        targetUrl.searchParams.append("ref_id", orderRefId);
      }
      const finalUrl = preserveQueryParams(targetUrl.href, ["debug", "debugger", "test"]);
      this.logger.info(`Navigating to ${finalUrl}`);
      window.location.href = finalUrl;
    } catch (error) {
      this.logger.error("Invalid URL for navigation:", url, error);
      const fallbackUrl = preserveQueryParams(url);
      window.location.href = fallbackUrl;
    }
  }
  handleOrderUpdate(orderState) {
    this.updateUpsellDisplay();
    if (orderState.isProcessingUpsell) {
      this.setProcessingState(true);
    } else {
      this.setProcessingState(false);
    }
    if (orderState.upsellError) {
      this.showError(orderState.upsellError);
    }
  }
  updateUpsellDisplay() {
    const orderStore = useOrderStore.getState();
    if (!orderStore.canAddUpsells()) {
      this.hideUpsellOffer();
      return;
    }
    this.showUpsellOffer();
  }
  setProcessingState(processing) {
    if (processing) {
      this.addClass("next-processing");
      this.disableActions();
    } else {
      this.removeClass("next-processing");
      this.enableActions();
    }
  }
  disableActions() {
    this.actionButtons.forEach((button) => {
      if (button instanceof HTMLButtonElement) {
        button.disabled = true;
      }
      button.classList.add("next-disabled");
    });
  }
  enableActions() {
    this.actionButtons.forEach((button) => {
      if (button instanceof HTMLButtonElement) {
        button.disabled = false;
      }
      button.classList.remove("next-disabled");
    });
  }
  showUpsellOffer() {
    this.removeClass("next-hidden");
    this.removeClass("next-error");
    this.addClass("next-available");
  }
  hideUpsellOffer() {
    this.addClass("next-hidden");
    this.removeClass("next-available");
  }
  showSuccess() {
    this.addClass("next-success");
    setTimeout(() => {
      this.removeClass("next-success");
    }, 3e3);
  }
  showError(message) {
    this.addClass("next-error");
    this.removeClass("next-processing");
    this.logger.error("Upsell error:", message);
    setTimeout(() => {
      this.removeClass("next-error");
    }, 5e3);
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
  update() {
    this.scanUpsellElements();
    this.updateUpsellDisplay();
  }
  cleanupEventListeners() {
    if (this.clickHandler) {
      this.actionButtons.forEach((button) => {
        button.removeEventListener("click", this.clickHandler);
      });
    }
  }
  destroy() {
    this.actionButtons = [];
    super.destroy();
  }
};
_UpsellEnhancer.pageViewTracked = false;
_UpsellEnhancer.currentPagePath = null;
let UpsellEnhancer = _UpsellEnhancer;
export {
  UpsellEnhancer
};
