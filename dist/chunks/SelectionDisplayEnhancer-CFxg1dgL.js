import { B as BaseDisplayEnhancer, P as PropertyResolver } from "./DisplayEnhancerCore-BnU92W4a.js";
import { a as useCampaignStore, u as useCartStore, g as PriceCalculator } from "./utils-JRJJAjGt.js";
class SelectionDisplayEnhancer extends BaseDisplayEnhancer {
  constructor() {
    super(...arguments);
    this.selectedItem = null;
    this.selectionChangeHandler = null;
  }
  async initialize() {
    this.validateElement();
    this.parseDisplayAttributes();
    this.findAssociatedSelector();
    this.setupStoreSubscriptions();
    if (this.selectedItem) {
      this.loadPackageData();
    }
    await this.performInitialUpdate();
    this.logger.debug(`SelectionDisplayEnhancer initialized:`, {
      displayPath: this.displayPath,
      selectorId: this.selectorId
    });
  }
  parseDisplayAttributes() {
    super.parseDisplayAttributes();
    const pathParts = this.displayPath.split(".");
    if (pathParts.length >= 3 && pathParts[0] === "selection") {
      const selectorId = pathParts[1];
      if (selectorId) {
        this.selectorId = selectorId;
      }
      this.property = pathParts.slice(2).join(".");
      this.logger.debug("Extracted selector ID from display path:", {
        displayPath: this.displayPath,
        selectorId: this.selectorId,
        property: this.property
      });
    } else {
      const selectorId = this.getAttribute("data-next-selector-id") || this.getAttribute("data-selector-id") || this.findSelectorIdFromContext();
      if (selectorId) {
        this.selectorId = selectorId;
      }
    }
    if (!this.selectorId) {
      this.logger.warn("No selector ID found for SelectionDisplayEnhancer");
    }
  }
  findSelectorIdFromContext() {
    let current = this.element.parentElement;
    while (current) {
      const selectorId = current.getAttribute("data-next-selector-id") ?? void 0;
      if (selectorId) return selectorId;
      if (current.hasAttribute("data-next-cart-selector")) {
        return current.getAttribute("data-next-selector-id") ?? current.getAttribute("data-next-id") ?? void 0;
      }
      current = current.parentElement;
    }
    return void 0;
  }
  findAssociatedSelector() {
    if (!this.selectorId) return;
    const selectorElement = document.querySelector(
      `[data-next-selector-id="${this.selectorId}"]`
    );
    if (selectorElement) {
      const getSelectedItem = selectorElement._getSelectedItem;
      if (typeof getSelectedItem === "function") {
        this.selectedItem = getSelectedItem();
        this.logger.debug("Got initial selected item from selector:", this.selectedItem);
      } else {
        const selectedCard = selectorElement.querySelector('[data-next-selected="true"]');
        if (selectedCard) {
          const packageId = parseInt(selectedCard.getAttribute("data-next-package-id") || "0", 10);
          const quantity = parseInt(selectedCard.getAttribute("data-next-quantity") || "1", 10);
          if (packageId > 0) {
            this.selectedItem = {
              packageId,
              quantity,
              element: selectedCard,
              name: void 0,
              price: void 0,
              shippingId: selectedCard.getAttribute("data-next-shipping-id") || void 0,
              isPreSelected: true
            };
            this.logger.debug("Found selected item from DOM:", this.selectedItem);
          }
        }
      }
    } else {
      this.logger.debug(`Selector element not found for ID: ${this.selectorId}`);
    }
  }
  setupStoreSubscriptions() {
    this.subscribe(useCampaignStore, this.handleCampaignUpdate.bind(this));
    this.campaignState = useCampaignStore.getState();
    if (this.needsCartData()) {
      this.subscribe(useCartStore, this.handleCartUpdate.bind(this));
      this.cartState = useCartStore.getState();
    }
    this.selectionChangeHandler = this.handleSelectionChange.bind(this);
    this.eventBus.on("selector:selection-changed", this.selectionChangeHandler);
    this.eventBus.on("selector:item-selected", this.selectionChangeHandler);
  }
  needsCartData() {
    const discountProperties = [
      "discountedPrice",
      "finalPrice",
      "discountAmount",
      "appliedDiscountAmount",
      "hasDiscount",
      "appliedDiscounts",
      "discountPercentage"
    ];
    return this.property ? discountProperties.includes(this.property) : false;
  }
  handleCampaignUpdate(campaignState) {
    this.campaignState = campaignState;
    this.loadPackageData();
    this.updateDisplay();
  }
  handleCartUpdate(cartState) {
    this.cartState = cartState;
    this.updateDisplay();
  }
  handleSelectionChange(event) {
    if (event.selectorId !== this.selectorId) return;
    this.logger.debug("Selection changed:", event);
    if (event.item) {
      this.selectedItem = event.item;
    } else if (event.packageId) {
      const selectorElement = document.querySelector(
        `[data-next-selector-id="${this.selectorId}"]`
      );
      if (selectorElement) {
        const getSelectedItem = selectorElement._getSelectedItem;
        if (typeof getSelectedItem === "function") {
          this.selectedItem = getSelectedItem();
        }
      }
    }
    this.loadPackageData();
    this.updateDisplay();
  }
  loadPackageData() {
    if (!this.selectedItem || !this.campaignState) return;
    this.packageData = this.campaignState.packages?.find(
      (pkg) => pkg.ref_id === this.selectedItem.packageId
    );
    if (!this.packageData) {
      this.logger.warn(`Package ${this.selectedItem.packageId} not found in campaign data`);
    }
  }
  getPropertyValue() {
    if (!this.selectedItem || !this.property) return void 0;
    switch (this.property) {
      case "hasSelection":
        return this.selectedItem !== null;
      case "packageId":
        return this.selectedItem.packageId;
      case "quantity":
        return this.selectedItem.quantity;
      case "name":
        return this.packageData?.name || this.selectedItem.name || "";
      // Pricing properties
      case "price":
        return this.getSelectionPrice();
      case "total":
      case "price_total":
        return this.getSelectionTotal();
      case "compareTotal":
      case "price_retail_total":
        return this.getSelectionCompareTotal();
      case "savings":
      case "savingsAmount":
        return this.getSelectionSavingsAmount();
      case "savingsPercentage":
        return this.getSelectionSavingsPercentageFormatted();
      case "hasSavings":
        return this.getSelectionHasSavings();
      // Additional calculated fields
      case "unitPrice":
      case "pricePerUnit":
        return this.getSelectionUnitPrice();
      case "totalUnits":
      case "totalQuantity":
        return this.getSelectionTotalUnits();
      case "discountAmount":
        return this.getSelectionDiscountAmount();
      // Cart discount properties
      case "discountedPrice":
      case "finalPrice":
        return this.calculateSelectionDiscountedPrice();
      case "appliedDiscountAmount":
        return this.calculateSelectionDiscountAmount();
      case "hasDiscount":
        return this.getSelectionHasDiscount();
      case "discountPercentage":
        return this.getSelectionDiscountPercentage();
      case "appliedDiscounts":
        return this.getSelectionAppliedDiscounts();
      case "isMultiPack":
      case "isBundle":
        return this.getSelectionIsBundle();
      case "isSingleUnit":
        return !this.getSelectionIsBundle();
      default:
        const calculatedValue = this.parseCalculatedField(this.property);
        if (calculatedValue !== void 0) {
          return calculatedValue;
        }
        if (this.packageData) {
          return PropertyResolver.getNestedProperty(this.packageData, this.property);
        }
        return void 0;
    }
  }
  getSelectionPrice() {
    if (!this.selectedItem) return 0;
    if (this.packageData) {
      return parseFloat(this.packageData.price || "0");
    }
    return this.selectedItem.price || 0;
  }
  getSelectionTotal() {
    if (!this.selectedItem) return 0;
    if (this.packageData) {
      return parseFloat(this.packageData.price_total || "0") || parseFloat(this.packageData.price || "0") * this.selectedItem.quantity;
    }
    return (this.selectedItem.price || 0) * this.selectedItem.quantity;
  }
  getSelectionCompareTotal() {
    if (!this.selectedItem || !this.packageData) return 0;
    const retailTotal = parseFloat(this.packageData.price_retail_total || "0");
    if (retailTotal > 0) return retailTotal;
    const retailPrice = parseFloat(this.packageData.price_retail || "0");
    if (retailPrice > 0) {
      return retailPrice * this.selectedItem.quantity;
    }
    return this.getSelectionTotal();
  }
  getSelectionMetrics() {
    const total = this.getSelectionTotal();
    const compareTotal = this.getSelectionCompareTotal();
    return {
      total,
      compareTotal,
      savings: PriceCalculator.calculateSavings(compareTotal, total),
      savingsPercentage: PriceCalculator.calculateSavingsPercentage(compareTotal, total)
    };
  }
  getSelectionSavingsAmount() {
    return this.getSelectionMetrics().savings;
  }
  getSelectionSavingsPercentageFormatted() {
    return this.getSelectionMetrics().savingsPercentage;
  }
  getSelectionHasSavings() {
    return this.getSelectionMetrics().savings > 0;
  }
  getSelectionUnitPrice() {
    const total = this.getSelectionTotal();
    const units = this.getSelectionTotalUnits();
    return units > 0 ? total / units : 0;
  }
  getSelectionTotalUnits() {
    if (!this.selectedItem) return 0;
    return this.packageData?.qty || 1;
  }
  getSelectionDiscountAmount() {
    return this.getSelectionSavingsAmount();
  }
  getSelectionIsBundle() {
    return this.getSelectionTotalUnits() > 1;
  }
  // Discount calculation methods
  calculateSelectionDiscountAmount() {
    if (!this.selectedItem || !this.packageData || !this.cartState?.appliedCoupons?.length) {
      return 0;
    }
    let totalDiscount = 0;
    const basePrice = this.getSelectionPrice();
    const quantity = this.selectedItem.quantity;
    for (const coupon of this.cartState.appliedCoupons) {
      if (coupon.definition.packageIds && coupon.definition.packageIds.includes(this.selectedItem.packageId)) {
        if (coupon.definition.type === "percentage") {
          totalDiscount += basePrice * quantity * coupon.definition.value / 100;
        } else if (coupon.definition.type === "fixed") {
          totalDiscount += coupon.definition.value * quantity;
        }
      } else if (!coupon.definition.packageIds || coupon.definition.packageIds.length === 0) {
        if (coupon.definition.type === "percentage") {
          totalDiscount += basePrice * quantity * coupon.definition.value / 100;
        } else if (coupon.definition.type === "fixed") {
          const packageTotal = basePrice * quantity;
          const cartSubtotal = this.cartState.totals.subtotal.value;
          if (cartSubtotal > 0) {
            const proportion = packageTotal / cartSubtotal;
            totalDiscount += coupon.definition.value * proportion;
          }
        }
      }
    }
    return totalDiscount;
  }
  calculateSelectionDiscountedPrice() {
    const unitPrice = this.getSelectionPrice();
    const discountAmount = this.calculateSelectionDiscountAmount();
    const quantity = this.selectedItem?.quantity || 1;
    const discountPerUnit = quantity > 0 ? discountAmount / quantity : 0;
    return Math.max(0, unitPrice - discountPerUnit);
  }
  getSelectionHasDiscount() {
    return this.calculateSelectionDiscountAmount() > 0;
  }
  getSelectionDiscountPercentage() {
    const total = this.getSelectionTotal();
    const discount = this.calculateSelectionDiscountAmount();
    if (total <= 0) return 0;
    return discount / total * 100;
  }
  getSelectionAppliedDiscounts() {
    if (!this.selectedItem || !this.packageData || !this.cartState?.appliedCoupons?.length) {
      return [];
    }
    const discounts = [];
    for (const coupon of this.cartState.appliedCoupons) {
      let discountAmount = 0;
      if (coupon.definition.packageIds && coupon.definition.packageIds.includes(this.selectedItem.packageId)) {
        if (coupon.definition.type === "percentage") {
          discountAmount = this.getSelectionTotal() * coupon.definition.value / 100;
        } else if (coupon.definition.type === "fixed") {
          discountAmount = coupon.definition.value * this.selectedItem.quantity;
        }
      } else if (!coupon.definition.packageIds || coupon.definition.packageIds.length === 0) {
        if (coupon.definition.type === "percentage") {
          discountAmount = this.getSelectionTotal() * coupon.definition.value / 100;
        } else if (coupon.definition.type === "fixed") {
          const packageTotal = this.getSelectionTotal();
          const cartSubtotal = this.cartState.totals.subtotal.value;
          if (cartSubtotal > 0) {
            const proportion = packageTotal / cartSubtotal;
            discountAmount = coupon.definition.value * proportion;
          }
        }
      }
      if (discountAmount > 0) {
        discounts.push({
          code: coupon.code,
          amount: discountAmount
        });
      }
    }
    return discounts;
  }
  // Parse custom calculated fields with mathematical expressions
  parseCalculatedField(field) {
    if (!this.selectedItem || !field) return void 0;
    const operators = ["+", "-", "*", "/"];
    for (const op of operators) {
      if (field.includes(op)) {
        const parts = field.split(op);
        if (parts.length === 2) {
          const leftProperty = parts[0]?.trim() || "";
          const rightValue = parseFloat(parts[1]?.trim() || "0");
          let leftValue = 0;
          switch (leftProperty) {
            case "total":
            case "price_total":
              leftValue = this.getSelectionTotal();
              break;
            case "price":
              leftValue = this.getSelectionPrice();
              break;
            case "savings":
            case "savingsAmount":
              leftValue = this.getSelectionSavingsAmount();
              break;
            case "compareTotal":
              leftValue = this.getSelectionCompareTotal();
              break;
            default:
              const oldProperty = this.property;
              this.property = leftProperty;
              const value = this.getPropertyValue();
              this.property = oldProperty;
              leftValue = typeof value === "number" ? value : 0;
          }
          if (!isNaN(rightValue)) {
            switch (op) {
              case "+":
                return leftValue + rightValue;
              case "-":
                return leftValue - rightValue;
              case "*":
                return leftValue * rightValue;
              case "/":
                return rightValue !== 0 ? leftValue / rightValue : 0;
            }
          }
        }
      }
    }
    return void 0;
  }
  async performInitialUpdate() {
    if (!this.selectedItem && this.selectorId) {
      await new Promise((resolve) => setTimeout(resolve, 50));
      this.findAssociatedSelector();
      if (this.selectedItem) {
        this.loadPackageData();
      }
    }
    await this.updateDisplay();
  }
  // Override to handle empty selection
  async updateDisplay() {
    if (this.selectedItem === null && this.property !== "hasSelection") {
      this.hideElement();
      return;
    }
    await super.updateDisplay();
  }
  destroy() {
    if (this.selectionChangeHandler) {
      this.eventBus.off("selector:selection-changed", this.selectionChangeHandler);
      this.eventBus.off("selector:item-selected", this.selectionChangeHandler);
    }
    super.destroy();
  }
}
export {
  SelectionDisplayEnhancer
};
