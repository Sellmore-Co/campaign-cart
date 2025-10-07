import { B as BaseEnhancer } from "./index-Gm2XgMu5.js";
class QuantityTextEnhancer extends BaseEnhancer {
  constructor() {
    super(...arguments);
    this.template = "";
    this.currentQuantity = 1;
  }
  async initialize() {
    this.validateElement();
    this.template = this.getAttribute("data-next-quantity-text") || "";
    if (!this.template) {
      this.logger.warn("QuantityTextEnhancer requires data-next-quantity-text attribute");
      return;
    }
    this.quantitySelectorId = this.getAttribute("data-next-quantity-selector-id") || "";
    const container = this.element.closest("[data-next-package-id]");
    if (container) {
      const packageIdAttr = container.getAttribute("data-next-package-id");
      if (packageIdAttr) {
        this.containerPackageId = parseInt(packageIdAttr, 10);
      }
    }
    this.setupQuantityListeners();
    this.getInitialQuantity();
    this.updateText();
    this.logger.debug("QuantityTextEnhancer initialized", {
      template: this.template,
      quantitySelectorId: this.quantitySelectorId,
      packageId: this.containerPackageId
    });
  }
  setupQuantityListeners() {
    this.eventBus.on("upsell:quantity-changed", (data) => {
      if (this.quantitySelectorId && data.selectorId === this.quantitySelectorId) {
        this.currentQuantity = data.quantity;
        this.updateText();
      } else if (!this.quantitySelectorId && !data.selectorId) {
        if (data.packageId === this.containerPackageId) {
          this.currentQuantity = data.quantity;
          this.updateText();
        }
      } else if (!this.quantitySelectorId) {
        const container = this.element.closest("[data-next-selector-id]");
        if (container) {
          const containerSelectorId = container.getAttribute("data-next-selector-id");
          if (containerSelectorId === data.selectorId) {
            this.currentQuantity = data.quantity;
            this.updateText();
          }
        } else if (data.packageId === this.containerPackageId) {
          this.currentQuantity = data.quantity;
          this.updateText();
        }
      }
    });
  }
  getInitialQuantity() {
    if (this.quantitySelectorId) {
      const quantityDisplay = document.querySelector(
        `[data-next-upsell-quantity="display"][data-next-quantity-selector-id="${this.quantitySelectorId}"]`
      );
      if (quantityDisplay && quantityDisplay.textContent) {
        const qty = parseInt(quantityDisplay.textContent, 10);
        if (!isNaN(qty)) {
          this.currentQuantity = qty;
        }
      }
    } else {
      const container = this.element.closest('[data-next-upsell="offer"]');
      if (container) {
        const quantityDisplay = container.querySelector('[data-next-upsell-quantity="display"]');
        if (quantityDisplay && quantityDisplay.textContent) {
          const qty = parseInt(quantityDisplay.textContent, 10);
          if (!isNaN(qty)) {
            this.currentQuantity = qty;
          }
        }
      }
    }
  }
  updateText() {
    let text = this.template;
    text = text.replace(/\{qty([*+\-]?\d*)\}/g, (_match, operation) => {
      let result = this.currentQuantity;
      if (operation) {
        const operator = operation[0];
        const value = parseInt(operation.substring(1), 10);
        switch (operator) {
          case "*":
            result = this.currentQuantity * value;
            break;
          case "+":
            result = this.currentQuantity + value;
            break;
          case "-":
            result = Math.max(0, this.currentQuantity - value);
            break;
        }
      }
      return result.toString();
    });
    text = text.replace(/\{([^|]+)\|([^}]+)\}/g, (_match, singular, plural) => {
      return this.currentQuantity === 1 ? singular : plural;
    });
    this.element.textContent = text;
  }
  update() {
    this.updateText();
  }
  destroy() {
    super.destroy();
  }
}
export {
  QuantityTextEnhancer
};
