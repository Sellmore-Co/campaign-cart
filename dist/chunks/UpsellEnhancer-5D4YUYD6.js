import { B as BaseEnhancer } from "./index-D1kBALZN.js";
import { e as useOrderStore, f as configStore, a as useCampaignStore, U as preserveQueryParams } from "./utils-BvMFuFWj.js";
import { ApiClient } from "./api-Dli5suMK.js";
import { G as GeneralModal } from "./GeneralModal-Cuk4sJCc.js";
import { L as LoadingOverlay } from "./LoadingOverlay-DOjYiQnB.js";
const _UpsellEnhancer = class _UpsellEnhancer extends BaseEnhancer {
  constructor(element) {
    super(element);
    this.quantity = 1;
    this.actionButtons = [];
    this.isProcessing = false;
    this.isSelector = false;
    this.options = /* @__PURE__ */ new Map();
    this.quantityBySelectorId = /* @__PURE__ */ new Map();
    this.loadingOverlay = new LoadingOverlay();
  }
  async initialize() {
    this.validateElement();
    this.pageShowHandler = (event) => {
      if (event.persisted) {
        this.loadingOverlay.hide(true);
        this.isProcessing = false;
        this.setProcessingState(false);
      }
    };
    window.addEventListener("pageshow", this.pageShowHandler);
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
    this.eventBus.on("upsell:quantity-changed", (data) => {
      const shouldSync = this.selectorId && data.selectorId === this.selectorId || !this.selectorId && !data.selectorId && this.packageId && data.packageId === this.packageId;
      if (shouldSync) {
        if (this.selectorId) {
          this.quantityBySelectorId.set(this.selectorId, data.quantity);
          this.currentQuantitySelectorId = this.selectorId;
        } else {
          this.quantity = data.quantity;
        }
        this.updateQuantityDisplay();
      }
    });
    this.eventBus.on("upsell:option-selected", (data) => {
      const ourSelectors = this.element.querySelectorAll("[data-next-selector-id]");
      let shouldUpdate = false;
      ourSelectors.forEach((selector) => {
        const selectorId = selector.getAttribute("data-next-selector-id");
        if (selectorId === data.selectorId) {
          shouldUpdate = true;
        }
      });
      if (this.selectorId === data.selectorId) {
        shouldUpdate = true;
      }
      if (shouldUpdate) {
        this.selectedPackageId = data.packageId;
        this.packageId = data.packageId;
        this.options.forEach((element, id) => {
          if (id === data.packageId) {
            element.classList.add("next-selected");
            element.setAttribute("data-next-selected", "true");
          } else {
            element.classList.remove("next-selected");
            element.setAttribute("data-next-selected", "false");
          }
        });
      }
    });
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
    if (this.selectorId && !this.quantityBySelectorId.has(this.selectorId)) {
      this.quantityBySelectorId.set(this.selectorId, this.quantity);
    }
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
    let actualSelectorId = this.selectorId;
    const selectedOption = this.options.get(packageId);
    if (selectedOption) {
      const parentSelector = selectedOption.closest("[data-next-selector-id]");
      if (parentSelector) {
        actualSelectorId = parentSelector.getAttribute("data-next-selector-id") || this.selectorId;
      }
    }
    this.eventBus.emit("upsell-selector:item-selected", {
      selectorId: actualSelectorId || "",
      packageId
    });
    this.eventBus.emit("upsell:option-selected", {
      selectorId: actualSelectorId || "",
      packageId
    });
    if (actualSelectorId) {
      this.syncOptionSelectionAcrossContainers(actualSelectorId, packageId);
    }
    this.element._selectedPackageId = packageId;
    this.logger.debug("Upsell option selected:", { packageId, selectorId: actualSelectorId });
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
    const quantitySelectorId = increaseBtn?.getAttribute("data-next-quantity-selector-id") || decreaseBtn?.getAttribute("data-next-quantity-selector-id") || this.selectorId;
    if (increaseBtn) {
      increaseBtn.addEventListener("click", () => {
        if (quantitySelectorId) {
          const currentQty = this.quantityBySelectorId.get(quantitySelectorId) || 1;
          const newQty = Math.min(10, currentQty + 1);
          this.quantityBySelectorId.set(quantitySelectorId, newQty);
          this.currentQuantitySelectorId = quantitySelectorId;
          this.eventBus.emit("upsell:quantity-changed", {
            selectorId: quantitySelectorId,
            quantity: newQty,
            packageId: this.packageId
          });
        } else {
          this.quantity = Math.min(10, this.quantity + 1);
          this.eventBus.emit("upsell:quantity-changed", {
            quantity: this.quantity,
            packageId: this.packageId
          });
        }
        this.updateQuantityDisplay();
        this.syncQuantityAcrossContainers(quantitySelectorId, this.packageId);
      });
    }
    if (decreaseBtn) {
      decreaseBtn.addEventListener("click", () => {
        if (quantitySelectorId) {
          const currentQty = this.quantityBySelectorId.get(quantitySelectorId) || 1;
          const newQty = Math.max(1, currentQty - 1);
          this.quantityBySelectorId.set(quantitySelectorId, newQty);
          this.currentQuantitySelectorId = quantitySelectorId;
          this.eventBus.emit("upsell:quantity-changed", {
            selectorId: quantitySelectorId,
            quantity: newQty,
            packageId: this.packageId
          });
        } else {
          this.quantity = Math.max(1, this.quantity - 1);
          this.eventBus.emit("upsell:quantity-changed", {
            quantity: this.quantity,
            packageId: this.packageId
          });
        }
        this.updateQuantityDisplay();
        this.syncQuantityAcrossContainers(quantitySelectorId, this.packageId);
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
          this.eventBus.emit("upsell:quantity-changed", {
            selectorId: this.selectorId,
            quantity: this.quantity,
            packageId: this.packageId
          });
        });
        if (qty === this.quantity) {
          toggle.classList.add("next-selected");
        }
      }
    });
  }
  updateQuantityDisplay() {
    const selectorId = this.currentQuantitySelectorId || this.selectorId;
    if (selectorId && this.quantityBySelectorId.has(selectorId)) {
      const allDisplays = document.querySelectorAll(
        `[data-next-upsell-quantity="display"][data-next-quantity-selector-id="${selectorId}"]`
      );
      const quantity = this.quantityBySelectorId.get(selectorId);
      allDisplays.forEach((display) => {
        if (display instanceof HTMLElement) {
          display.textContent = quantity.toString();
        }
      });
      const localDisplay = this.element.querySelector('[data-next-upsell-quantity="display"]:not([data-next-quantity-selector-id])');
      if (localDisplay && localDisplay instanceof HTMLElement) {
        localDisplay.textContent = quantity.toString();
      }
    } else {
      const display = this.element.querySelector('[data-next-upsell-quantity="display"]');
      if (display) {
        display.textContent = this.quantity.toString();
      }
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
  /**
   * Synchronize quantity across all containers with the same selector ID or package ID
   * This ensures all upsell containers for the same offer stay in sync
   */
  syncQuantityAcrossContainers(selectorId, packageId) {
    if (selectorId) {
      const quantity = this.quantityBySelectorId.get(selectorId);
      if (!quantity) return;
      const allOptions = document.querySelectorAll(
        `[data-next-selector-id="${selectorId}"] [data-next-upsell-option]`
      );
      allOptions.forEach((option) => {
        if (option instanceof HTMLElement) {
          option.setAttribute("data-next-quantity", quantity.toString());
        }
      });
      const selectElements = document.querySelectorAll(
        `[data-next-upsell-select="${selectorId}"]`
      );
      selectElements.forEach((select) => {
        if (select instanceof HTMLSelectElement) {
          const options = select.querySelectorAll("option[data-next-package-id]");
          options.forEach((option) => {
            if (option instanceof HTMLOptionElement) {
              option.setAttribute("data-next-quantity", quantity.toString());
            }
          });
        }
      });
    } else if (packageId) {
      const allContainers = document.querySelectorAll(
        `[data-next-upsell="offer"][data-next-package-id="${packageId}"]:not([data-next-selector-id])`
      );
      allContainers.forEach((container) => {
        if (container instanceof HTMLElement) {
          const display = container.querySelector('[data-next-upsell-quantity="display"]');
          if (display && display instanceof HTMLElement) {
            display.textContent = this.quantity.toString();
          }
        }
      });
    }
  }
  /**
   * Synchronize option selection across all containers with the same selector ID
   * This ensures all option groups stay in sync when one is selected
   */
  syncOptionSelectionAcrossContainers(selectorId, selectedPackageId) {
    const allSelectors = document.querySelectorAll(`[data-next-selector-id="${selectorId}"]`);
    allSelectors.forEach((selectorElement) => {
      if (selectorElement instanceof HTMLElement) {
        const options = selectorElement.querySelectorAll("[data-next-upsell-option]");
        options.forEach((option) => {
          if (option instanceof HTMLElement) {
            const packageId = parseInt(option.getAttribute("data-next-package-id") || "0", 10);
            if (packageId === selectedPackageId) {
              option.classList.add("next-selected");
              option.setAttribute("data-next-selected", "true");
            } else {
              option.classList.remove("next-selected");
              option.setAttribute("data-next-selected", "false");
            }
          }
        });
        const selectElement = selectorElement.querySelector("select");
        if (selectElement) {
          selectElement.value = selectedPackageId.toString();
        }
      }
    });
  }
  setupEventHandlers() {
    this.clickHandler = this.handleActionClick.bind(this);
    this.actionButtons.forEach((button) => {
      button.addEventListener("click", this.clickHandler);
    });
    this.keydownHandler = (event) => {
      if (event.key === "Enter" && this.isProcessing) {
        event.preventDefault();
        event.stopPropagation();
        this.logger.debug("Enter key blocked - upsell is processing");
      }
    };
    this.element.addEventListener("keydown", this.keydownHandler, true);
  }
  async handleActionClick(event) {
    event.preventDefault();
    if (this.isProcessing) {
      this.logger.debug("Upsell action blocked - already processing");
      return;
    }
    const button = event.currentTarget;
    const action = button.getAttribute("data-next-upsell-action") || "";
    let nextUrl = button.getAttribute("data-next-url") || button.getAttribute("data-next-next-url") || button.getAttribute("data-os-next-url") || void 0;
    if (!nextUrl) {
      if (action === "add" || action === "accept") {
        const acceptMeta = document.querySelector('meta[name="next-upsell-accept-url"]');
        nextUrl = acceptMeta?.getAttribute("content") || void 0;
      } else if (action === "skip" || action === "decline") {
        const declineMeta = document.querySelector('meta[name="next-upsell-decline-url"]');
        nextUrl = declineMeta?.getAttribute("content") || void 0;
      }
      if (nextUrl) {
        this.logger.debug("Using fallback URL from meta tag:", nextUrl);
      }
    }
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
  getCurrency() {
    const campaignState = useCampaignStore.getState();
    if (campaignState?.data?.currency) {
      return campaignState.data.currency;
    }
    const configStore$1 = configStore.getState();
    return configStore$1?.selectedCurrency || configStore$1?.detectedCurrency || "USD";
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
          if (nextUrl) {
            this.logger.info("Navigating to next page despite error");
            setTimeout(() => this.navigateToUrl(nextUrl), 1e3);
          }
          return;
        }
      } else {
        this.showError("Unable to add upsell at this time");
        if (nextUrl) {
          this.logger.info("Navigating to next page despite error");
          setTimeout(() => this.navigateToUrl(nextUrl), 1e3);
        }
        return;
      }
    }
    const packageToAdd = this.isSelector ? this.selectedPackageId || this.packageId : this.packageId;
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
      this.isProcessing = true;
      this.setProcessingState(true);
      this.loadingOverlay.show();
      this.emit("upsell:adding", { packageId: packageToAdd });
      let quantityToUse = this.quantity;
      if (this.selectorId && this.quantityBySelectorId.has(this.selectorId)) {
        quantityToUse = this.quantityBySelectorId.get(this.selectorId);
      } else if (this.currentQuantitySelectorId && this.quantityBySelectorId.has(this.currentQuantitySelectorId)) {
        quantityToUse = this.quantityBySelectorId.get(this.currentQuantitySelectorId);
      }
      const upsellData = {
        lines: [{
          package_id: packageToAdd,
          quantity: quantityToUse
        }],
        currency: this.getCurrency()
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
        }
        const packageData = useCampaignStore.getState().getPackage(packageToAdd);
        if (packageData) {
          if (!upsellValue && packageData.price) {
            upsellValue = parseFloat(packageData.price) * this.quantity;
          }
        }
        this.emit("upsell:added", {
          packageId: packageToAdd,
          quantity: quantityToUse,
          order: updatedOrder,
          value: upsellValue,
          willRedirect: !!nextUrl
        });
        if (nextUrl) {
          setTimeout(() => {
            this.navigateToUrl(nextUrl, updatedOrder.ref_id);
          }, 100);
        } else {
          this.loadingOverlay.hide();
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
      this.loadingOverlay.hide(true);
      if (nextUrl) {
        this.logger.info("Navigating to next page despite API error");
        setTimeout(() => this.navigateToUrl(nextUrl), 1e3);
      }
    } finally {
      this.isProcessing = false;
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
    const result = await GeneralModal.showDuplicateUpsell();
    this.logger.info(result ? "User confirmed to add duplicate upsell" : "User declined to add duplicate upsell");
    return result;
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
    if (this.keydownHandler) {
      this.element.removeEventListener("keydown", this.keydownHandler, true);
    }
  }
  destroy() {
    if (this.pageShowHandler) {
      window.removeEventListener("pageshow", this.pageShowHandler);
    }
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
