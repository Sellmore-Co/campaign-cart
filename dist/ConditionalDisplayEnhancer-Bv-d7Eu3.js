import { B as BaseEnhancer } from "./BaseEnhancer-qzIjg0WD.js";
import { A as AttributeParser, u as useCartStore, a as useCampaignStore, b as useOrderStore } from "./analytics-Bb3lEgxb.js";
import { g as getPropertyConfig, P as PropertyResolver } from "./DisplayEnhancerCore-DPLaXj9C.js";
import { P as PackageContextResolver } from "./PackageContextResolver-Chdg_wMJ.js";
import { P as PriceCalculator } from "./PriceCalculator-BzaL6mLz.js";
class ConditionalDisplayEnhancer extends BaseEnhancer {
  constructor() {
    super(...arguments);
    this.packageContext = null;
    this.selectorId = null;
    this.dependsOnCart = false;
    this.dependsOnPackage = false;
    this.dependsOnSelection = false;
    this.dependsOnOrder = false;
    this.dependsOnShipping = false;
    this.selectionChangeHandler = null;
  }
  async initialize() {
    this.validateElement();
    const packageId = PackageContextResolver.findPackageId(this.element);
    this.packageContext = packageId !== void 0 ? packageId : null;
    this.selectorId = this.detectSelectorContext();
    const showAttr = this.getAttribute("data-next-show");
    const hideAttr = this.getAttribute("data-next-hide");
    if (showAttr) {
      this.condition = AttributeParser.parseCondition(showAttr);
      this.showCondition = true;
    } else if (hideAttr) {
      this.condition = AttributeParser.parseCondition(hideAttr);
      this.showCondition = false;
    } else {
      throw new Error("Either data-next-show or data-next-hide is required");
    }
    this.analyzeDependencies();
    if (this.dependsOnCart) {
      this.subscribe(useCartStore, this.handleStateUpdate.bind(this));
    }
    if (this.dependsOnPackage) {
      this.subscribe(useCampaignStore, this.handleCampaignUpdate.bind(this));
    }
    if (this.dependsOnSelection) {
      this.selectionChangeHandler = this.handleSelectionChange.bind(this);
      this.eventBus.on("selector:selection-changed", this.selectionChangeHandler);
      this.eventBus.on("selector:item-selected", this.selectionChangeHandler);
    }
    if (this.dependsOnOrder) {
      this.subscribe(useOrderStore, this.handleOrderUpdate.bind(this));
    }
    if (this.dependsOnShipping) {
      this.subscribe(useCampaignStore, this.handleShippingUpdate.bind(this));
    }
    if (this.dependsOnCart) {
      this.handleStateUpdate(useCartStore.getState());
    } else if (this.dependsOnPackage) {
      this.handlePackageUpdate();
    } else if (this.dependsOnSelection) {
      this.handleSelectionUpdate();
    } else if (this.dependsOnOrder) {
      this.handleOrderUpdate(useOrderStore.getState());
    } else if (this.dependsOnShipping) {
      this.handleShippingUpdate();
    }
    this.logger.debug(`Initialized conditional display:`, {
      condition: this.condition,
      packageContext: this.packageContext,
      selectorId: this.selectorId,
      dependsOnCart: this.dependsOnCart,
      dependsOnPackage: this.dependsOnPackage,
      dependsOnSelection: this.dependsOnSelection,
      dependsOnOrder: this.dependsOnOrder,
      dependsOnShipping: this.dependsOnShipping
    });
  }
  update() {
    if (this.dependsOnCart) {
      this.handleStateUpdate(useCartStore.getState());
    } else if (this.dependsOnPackage) {
      this.handlePackageUpdate();
    } else if (this.dependsOnSelection) {
      this.handleSelectionUpdate();
    } else if (this.dependsOnOrder) {
      this.handleOrderUpdate(useOrderStore.getState());
    }
  }
  analyzeDependencies() {
    this.dependsOnCart = this.conditionDependsOnCart(this.condition);
    this.dependsOnPackage = this.conditionDependsOnPackage(this.condition);
    this.dependsOnSelection = this.conditionDependsOnSelection(this.condition);
    this.dependsOnOrder = this.conditionDependsOnOrder(this.condition);
    this.dependsOnShipping = this.conditionDependsOnShipping(this.condition);
    if (!this.dependsOnCart && !this.dependsOnPackage && !this.dependsOnSelection && !this.dependsOnOrder && !this.dependsOnShipping) {
      this.dependsOnCart = true;
    }
  }
  conditionDependsOnCart(condition) {
    switch (condition.type) {
      case "property":
        return condition.object === "cart";
      case "function":
        return condition.object === "cart";
      case "comparison":
        return condition.left.object === "cart" || condition.right && typeof condition.right === "object" && condition.right.object === "cart";
      default:
        return false;
    }
  }
  conditionDependsOnPackage(condition) {
    switch (condition.type) {
      case "property":
        return condition.object === "package";
      case "function":
        return condition.object === "package";
      case "comparison":
        return condition.left.object === "package" || condition.right && typeof condition.right === "object" && condition.right.object === "package";
      default:
        return false;
    }
  }
  conditionDependsOnSelection(condition) {
    switch (condition.type) {
      case "property":
        return condition.object === "selection" || condition.object && condition.object.startsWith("selection.");
      case "function":
        return condition.object === "selection" || condition.object && condition.object.startsWith("selection.");
      case "comparison":
        const leftIsSelection = condition.left.object === "selection" || condition.left.object && condition.left.object.startsWith("selection.");
        const rightIsSelection = condition.right && typeof condition.right === "object" && (condition.right.object === "selection" || condition.right.object && condition.right.object.startsWith("selection."));
        return leftIsSelection || rightIsSelection;
      default:
        return false;
    }
  }
  conditionDependsOnOrder(condition) {
    switch (condition.type) {
      case "property":
        return condition.object === "order";
      case "function":
        return condition.object === "order";
      case "comparison":
        return condition.left.object === "order" || condition.right && typeof condition.right === "object" && condition.right.object === "order";
      default:
        return false;
    }
  }
  conditionDependsOnShipping(condition) {
    switch (condition.type) {
      case "property":
        return condition.object === "shipping";
      case "function":
        return condition.object === "shipping";
      case "comparison":
        return condition.left.object === "shipping" || condition.right && typeof condition.right === "object" && condition.right.object === "shipping";
      default:
        return false;
    }
  }
  handleCampaignUpdate() {
    if (this.dependsOnPackage) {
      this.handlePackageUpdate();
    }
  }
  handleOrderUpdate(orderState) {
    try {
      const conditionMet = this.evaluateOrderCondition(orderState);
      const shouldShow = this.showCondition ? conditionMet : !conditionMet;
      this.element.style.display = shouldShow ? "" : "none";
      this.toggleClass("next-condition-met", conditionMet);
      this.toggleClass("next-condition-not-met", !conditionMet);
      this.toggleClass("next-visible", shouldShow);
      this.toggleClass("next-hidden", !shouldShow);
    } catch (error) {
      this.handleError(error, "handleOrderUpdate");
    }
  }
  handlePackageUpdate() {
    try {
      const conditionMet = this.evaluatePackageCondition();
      const shouldShow = this.showCondition ? conditionMet : !conditionMet;
      this.element.style.display = shouldShow ? "" : "none";
      this.toggleClass("next-condition-met", conditionMet);
      this.toggleClass("next-condition-not-met", !conditionMet);
      this.toggleClass("next-visible", shouldShow);
      this.toggleClass("next-hidden", !shouldShow);
    } catch (error) {
      this.handleError(error, "handlePackageUpdate");
    }
  }
  handleShippingUpdate() {
    try {
      const conditionMet = this.evaluateShippingCondition();
      const shouldShow = this.showCondition ? conditionMet : !conditionMet;
      this.element.style.display = shouldShow ? "" : "none";
      this.toggleClass("next-condition-met", conditionMet);
      this.toggleClass("next-condition-not-met", !conditionMet);
      this.toggleClass("next-visible", shouldShow);
      this.toggleClass("next-hidden", !shouldShow);
    } catch (error) {
      this.handleError(error, "handleShippingUpdate");
    }
  }
  evaluatePackageCondition() {
    try {
      switch (this.condition.type) {
        case "property":
          return this.evaluatePackageProperty(this.condition);
        case "comparison":
          return this.evaluatePackageComparison(this.condition);
        default:
          this.logger.warn(`Unsupported condition type for package: ${this.condition.type}`);
          return false;
      }
    } catch (error) {
      this.logger.error("Error evaluating package condition:", error);
      return false;
    }
  }
  evaluateOrderCondition(orderState) {
    try {
      switch (this.condition.type) {
        case "property":
          return this.evaluateOrderProperty(orderState, this.condition);
        case "comparison":
          return this.evaluateOrderComparison(orderState, this.condition);
        default:
          this.logger.warn(`Unsupported condition type for order: ${this.condition.type}`);
          return false;
      }
    } catch (error) {
      this.logger.error("Error evaluating order condition:", error);
      return false;
    }
  }
  evaluatePackageProperty(condition) {
    const value = this.getPackagePropertyValue(condition.property);
    return Boolean(value);
  }
  evaluatePackageComparison(condition) {
    const leftValue = this.getPackagePropertyValue(condition.left.property);
    const rightValue = condition.right;
    switch (condition.operator) {
      case ">":
        return Number(leftValue) > Number(rightValue);
      case ">=":
        return Number(leftValue) >= Number(rightValue);
      case "<":
        return Number(leftValue) < Number(rightValue);
      case "<=":
        return Number(leftValue) <= Number(rightValue);
      case "==":
      case "===":
        return leftValue === rightValue;
      case "!=":
      case "!==":
        return leftValue !== rightValue;
      default:
        return false;
    }
  }
  evaluateOrderProperty(orderState, condition) {
    const value = this.getOrderPropertyValue(orderState, condition.property);
    return Boolean(value);
  }
  evaluateOrderComparison(orderState, condition) {
    const leftValue = this.getOrderPropertyValue(orderState, condition.left.property);
    const rightValue = condition.right;
    switch (condition.operator) {
      case ">":
        return Number(leftValue) > Number(rightValue);
      case ">=":
        return Number(leftValue) >= Number(rightValue);
      case "<":
        return Number(leftValue) < Number(rightValue);
      case "<=":
        return Number(leftValue) <= Number(rightValue);
      case "==":
      case "===":
        return leftValue === rightValue;
      case "!=":
      case "!==":
        return leftValue !== rightValue;
      default:
        return false;
    }
  }
  handleStateUpdate(cartState) {
    try {
      const conditionMet = this.evaluateCondition(cartState);
      const shouldShow = this.showCondition ? conditionMet : !conditionMet;
      this.element.style.display = shouldShow ? "" : "none";
      this.toggleClass("next-condition-met", conditionMet);
      this.toggleClass("next-condition-not-met", !conditionMet);
      this.toggleClass("next-visible", shouldShow);
      this.toggleClass("next-hidden", !shouldShow);
    } catch (error) {
      this.handleError(error, "handleStateUpdate");
    }
  }
  evaluateCondition(cartState) {
    try {
      switch (this.condition.type) {
        case "property":
          return this.evaluateProperty(cartState, this.condition);
        case "function":
          return this.evaluateFunction(cartState, this.condition);
        case "comparison":
          return this.evaluateComparison(cartState, this.condition);
        default:
          this.logger.warn(`Unknown condition type: ${this.condition.type}`);
          return false;
      }
    } catch (error) {
      this.logger.error("Error evaluating condition:", error);
      return false;
    }
  }
  detectSelectorContext() {
    if (this.condition) {
      if (this.condition.property && this.condition.property.includes(".")) {
        const parts = this.condition.property.split(".");
        if (parts.length >= 2) {
          this.logger.debug("Found selector ID in property:", parts[0]);
          return parts[0];
        }
      }
      if (this.condition.left && this.condition.left.property && this.condition.left.property.includes(".")) {
        const parts = this.condition.left.property.split(".");
        if (parts.length >= 2) {
          this.logger.debug("Found selector ID in comparison:", parts[0]);
          return parts[0];
        }
      }
    }
    const explicitId = this.getAttribute("data-next-selector-id") || this.getAttribute("data-selector-id");
    if (explicitId) return explicitId;
    let current = this.element;
    while (current) {
      const selectorId = current.getAttribute("data-next-selector-id");
      if (selectorId) return selectorId;
      if (current.hasAttribute("data-next-cart-selector")) {
        return current.getAttribute("data-next-selector-id") || current.getAttribute("data-next-id") || null;
      }
      current = current.parentElement;
    }
    return null;
  }
  handleSelectionChange(event) {
    if (this.selectorId && event.selectorId !== this.selectorId) return;
    this.handleSelectionUpdate();
  }
  handleSelectionUpdate() {
    try {
      const conditionMet = this.evaluateSelectionCondition();
      const shouldShow = this.showCondition ? conditionMet : !conditionMet;
      this.element.style.display = shouldShow ? "" : "none";
      this.toggleClass("next-condition-met", conditionMet);
      this.toggleClass("next-condition-not-met", !conditionMet);
      this.toggleClass("next-visible", shouldShow);
      this.toggleClass("next-hidden", !shouldShow);
    } catch (error) {
      this.handleError(error, "handleSelectionUpdate");
    }
  }
  evaluateSelectionCondition() {
    try {
      switch (this.condition.type) {
        case "property":
          return this.evaluateSelectionProperty(this.condition);
        case "comparison":
          return this.evaluateSelectionComparison(this.condition);
        default:
          this.logger.warn(`Unsupported condition type for selection: ${this.condition.type}`);
          return false;
      }
    } catch (error) {
      this.logger.error("Error evaluating selection condition:", error);
      return false;
    }
  }
  evaluateShippingCondition() {
    try {
      switch (this.condition.type) {
        case "property":
          return this.evaluateShippingProperty(this.condition);
        case "comparison":
          return this.evaluateShippingComparison(this.condition);
        default:
          this.logger.warn(`Unsupported condition type for shipping: ${this.condition.type}`);
          return false;
      }
    } catch (error) {
      this.logger.error("Error evaluating shipping condition:", error);
      return false;
    }
  }
  evaluateSelectionProperty(condition) {
    const value = this.getSelectionPropertyValue(condition.property);
    return Boolean(value);
  }
  evaluateSelectionComparison(condition) {
    const leftValue = this.getSelectionPropertyValue(condition.left.property);
    const rightValue = condition.right;
    switch (condition.operator) {
      case ">":
        return Number(leftValue) > Number(rightValue);
      case ">=":
        return Number(leftValue) >= Number(rightValue);
      case "<":
        return Number(leftValue) < Number(rightValue);
      case "<=":
        return Number(leftValue) <= Number(rightValue);
      case "==":
      case "===":
        return leftValue === rightValue;
      case "!=":
      case "!==":
        return leftValue !== rightValue;
      default:
        return false;
    }
  }
  evaluateShippingProperty(condition) {
    const value = this.getShippingPropertyValue(condition.property);
    return Boolean(value);
  }
  evaluateShippingComparison(condition) {
    const leftValue = this.getShippingPropertyValue(condition.left.property);
    const rightValue = condition.right;
    switch (condition.operator) {
      case ">":
        return Number(leftValue) > Number(rightValue);
      case ">=":
        return Number(leftValue) >= Number(rightValue);
      case "<":
        return Number(leftValue) < Number(rightValue);
      case "<=":
        return Number(leftValue) <= Number(rightValue);
      case "==":
      case "===":
        return leftValue === rightValue;
      case "!=":
      case "!==":
        return leftValue !== rightValue;
      default:
        return false;
    }
  }
  evaluateProperty(cartState, condition) {
    const value = this.getPropertyValue(cartState, condition.object, condition.property);
    return Boolean(value);
  }
  evaluateFunction(cartState, condition) {
    const { object, method, args } = condition;
    if (object === "cart") {
      switch (method) {
        case "hasItem":
          if (args.length > 0) {
            const packageId = args[0];
            return cartState.items.some((item) => item.packageId === packageId);
          }
          return false;
        case "hasItems":
          return !cartState.isEmpty;
        default:
          this.logger.warn(`Unknown cart method: ${method}`);
          return false;
      }
    }
    return false;
  }
  evaluateComparison(cartState, condition) {
    const leftValue = this.getPropertyValue(cartState, condition.left.object, condition.left.property);
    const rightValue = condition.right;
    switch (condition.operator) {
      case ">":
        return Number(leftValue) > Number(rightValue);
      case ">=":
        return Number(leftValue) >= Number(rightValue);
      case "<":
        return Number(leftValue) < Number(rightValue);
      case "<=":
        return Number(leftValue) <= Number(rightValue);
      case "==":
      case "===":
        return leftValue === rightValue;
      case "!=":
      case "!==":
        return leftValue !== rightValue;
      default:
        return false;
    }
  }
  getPropertyValue(cartState, object, property) {
    if (object === "cart") {
      switch (property) {
        case "total":
        case "total.value":
          return cartState.totals.total.value;
        case "subtotal":
        case "subtotal.value":
          return cartState.totals.subtotal.value;
        case "shipping":
        case "shipping.value":
          return cartState.totals.shipping.value;
        case "tax":
        case "tax.value":
          return cartState.totals.tax.value;
        case "discounts":
        case "discounts.value":
          return cartState.totals.discounts.value;
        case "count":
          return cartState.totalQuantity;
        case "isEmpty":
          return cartState.isEmpty;
        case "hasItems":
          return !cartState.isEmpty;
        case "hasShipping":
          return cartState.totals.shipping.value > 0;
        case "hasFreeShipping":
          return cartState.totals.shipping.value === 0;
        case "savingsAmount":
        case "savingsAmount.value":
          return cartState.totals.savings.value;
        case "savingsPercentage":
        case "savingsPercentage.value":
          return cartState.totals.savingsPercentage.value;
        case "compareTotal":
        case "compareTotal.value":
          return cartState.totals.compareTotal.value;
        case "hasSavings":
          return cartState.totals.hasSavings;
        default:
          const config = getPropertyConfig("cart", property);
          if (config) {
            const { path, validator } = config;
            if (path.startsWith("!")) {
              const actualPath = path.substring(1);
              const value2 = PropertyResolver.getNestedProperty(cartState, actualPath);
              return !value2;
            }
            let value = PropertyResolver.getNestedProperty(cartState, path);
            if (validator && value !== void 0) {
              value = validator(value);
            }
            return value;
          }
          return PropertyResolver.getNestedProperty(cartState, property);
      }
    }
    if (object === "package") {
      return this.getPackagePropertyValue(property);
    }
    if (object === "selection" || object && object.startsWith("selection.")) {
      let actualSelectorId = this.selectorId;
      let actualProperty = property;
      if (object.startsWith("selection.")) {
        const parts = object.split(".");
        if (parts.length >= 2) {
          actualSelectorId = parts[1] ?? null;
          if (parts.length > 2) {
            actualProperty = parts.slice(2).join(".") + (property ? "." + property : "");
          }
        }
      }
      return this.getSelectionPropertyValue(actualProperty, actualSelectorId);
    }
    if (object === "order") {
      const orderStore = useOrderStore.getState();
      return this.getOrderPropertyValue(orderStore, property);
    }
    if (object === "shipping") {
      return this.getShippingPropertyValue(property);
    }
    return null;
  }
  getSelectionPropertyValue(property, selectorId) {
    let targetSelectorId = selectorId || this.selectorId;
    let actualProperty = property;
    if (property && property.includes(".")) {
      const parts = property.split(".");
      if (parts.length >= 2) {
        targetSelectorId = parts[0] ?? null;
        actualProperty = parts.slice(1).join(".");
      }
    }
    if (!targetSelectorId) {
      this.logger.warn("Selection condition used but no selector context found");
      return null;
    }
    const selectorElement = document.querySelector(
      `[data-next-selector-id="${targetSelectorId}"]`
    );
    if (!selectorElement) {
      this.logger.debug(`Selector element not found for ID: ${targetSelectorId}`);
      return null;
    }
    const getSelectedItem = selectorElement._getSelectedItem;
    const selectedItem = typeof getSelectedItem === "function" ? getSelectedItem() : null;
    if (!selectedItem) {
      if (actualProperty === "hasSelection") return false;
      return null;
    }
    let packageData;
    try {
      const campaignStore = useCampaignStore.getState();
      packageData = campaignStore.getPackage(selectedItem.packageId) ?? void 0;
    } catch (error) {
      this.logger.debug("Could not get package data for selection");
    }
    switch (actualProperty) {
      case "hasSelection":
        return true;
      case "packageId":
        return selectedItem.packageId;
      case "quantity":
        return selectedItem.quantity || 1;
      case "name":
        return packageData?.name || selectedItem.name || "";
      case "price":
        return packageData ? parseFloat(packageData.price || "0") : selectedItem.price || 0;
      case "total":
      case "price_total":
        if (packageData) {
          return parseFloat(packageData.price_total || "0") || parseFloat(packageData.price || "0") * selectedItem.quantity;
        }
        return (selectedItem.price || 0) * selectedItem.quantity;
      case "hasSavings":
        if (!packageData) return false;
        const hasSavingsMetrics = PriceCalculator.calculatePackageMetrics({
          price: parseFloat(packageData.price || "0"),
          retailPrice: parseFloat(packageData.price_retail || "0"),
          quantity: selectedItem.quantity,
          priceTotal: parseFloat(packageData.price_total || "0"),
          retailPriceTotal: parseFloat(packageData.price_retail_total || "0")
        });
        return hasSavingsMetrics.hasSavings;
      case "savingsAmount":
        if (!packageData) return 0;
        const metrics = PriceCalculator.calculatePackageMetrics({
          price: parseFloat(packageData.price || "0"),
          retailPrice: parseFloat(packageData.price_retail || "0"),
          quantity: selectedItem.quantity,
          priceTotal: parseFloat(packageData.price_total || "0"),
          retailPriceTotal: parseFloat(packageData.price_retail_total || "0")
        });
        return metrics.totalSavings;
      case "savingsPercentage":
        if (!packageData) return 0;
        const metricsPerc = PriceCalculator.calculatePackageMetrics({
          price: parseFloat(packageData.price || "0"),
          retailPrice: parseFloat(packageData.price_retail || "0"),
          quantity: selectedItem.quantity,
          priceTotal: parseFloat(packageData.price_total || "0"),
          retailPriceTotal: parseFloat(packageData.price_retail_total || "0")
        });
        return metricsPerc.totalSavingsPercentage;
      case "compareTotal":
      case "price_retail_total":
        if (!packageData) return 0;
        const rtlTotal = parseFloat(packageData.price_retail_total || "0");
        if (rtlTotal > 0) return rtlTotal;
        const rtlPrice = parseFloat(packageData.price_retail || "0");
        if (rtlPrice > 0) return rtlPrice * selectedItem.quantity;
        return this.getSelectionPropertyValue("total", targetSelectorId);
      case "isBundle":
      case "isMultiPack":
        return (selectedItem.quantity || 1) > 1;
      case "isSingleUnit":
        return (selectedItem.quantity || 1) === 1;
      case "totalUnits":
      case "totalQuantity":
        return selectedItem.quantity || 1;
      default:
        if (packageData) {
          return PropertyResolver.getNestedProperty(packageData, actualProperty);
        }
        return null;
    }
  }
  getPackagePropertyValue(property) {
    if (!this.packageContext) {
      this.logger.warn("Package condition used but no package context found");
      return null;
    }
    try {
      const campaignStore = useCampaignStore.getState();
      const packageData = campaignStore.getPackage(this.packageContext);
      if (!packageData) {
        this.logger.warn(`Package ${this.packageContext} not found in campaign data`);
        return null;
      }
      return this.calculatePackageProperty(packageData, property);
    } catch (error) {
      this.logger.error(`Error getting package property ${property}:`, error);
      return null;
    }
  }
  calculatePackageProperty(packageData, property) {
    const price = parseFloat(packageData.price) || 0;
    const priceRetail = parseFloat(packageData.price_retail || packageData.price) || 0;
    const priceTotal = parseFloat(packageData.price_total || "0") || price * (packageData.qty || 1);
    const priceRetailTotal = parseFloat(packageData.price_retail_total || "0") || priceRetail * (packageData.qty || 1);
    const quantity = packageData.qty || 1;
    const metrics = PriceCalculator.calculatePackageMetrics({
      price,
      retailPrice: priceRetail,
      quantity,
      priceTotal,
      retailPriceTotal: priceRetailTotal
    });
    switch (property) {
      case "name":
        return packageData.name;
      case "price":
        return price;
      case "quantity":
      case "qty":
        return quantity;
      case "image":
        return packageData.image;
      case "isRecurring":
        return packageData.is_recurring;
      case "interval":
        return packageData.interval;
      case "intervalCount":
        return packageData.interval_count;
      case "hasRetailPrice":
        return priceRetail > 0 && priceRetail !== price;
      case "hasSavings":
        return metrics.hasSavings;
      case "savingsAmount":
        return metrics.totalSavings;
      case "savingsPercentage":
        return metrics.totalSavingsPercentage;
      case "priceRetailTotal":
        return metrics.totalRetailPrice;
      case "totalSavings":
        return metrics.totalSavings;
      case "totalSavingsPercentage":
        return metrics.totalSavingsPercentage;
      case "unitPrice":
        return metrics.unitPrice;
      case "unitRetailPrice":
        return metrics.unitRetailPrice;
      case "unitSavings":
        return metrics.unitSavings;
      case "unitSavingsPercentage":
        return metrics.unitSavingsPercentage;
      case "isBundle":
        return quantity > 1;
      case "hasDiscount":
        return metrics.hasSavings;
      case "isSubscription":
        return packageData.is_recurring === true;
      case "isOneTime":
        return !packageData.is_recurring;
      case "price.raw":
        return price;
      case "priceRetail.raw":
        return priceRetail;
      case "savingsAmount.raw":
        return metrics.totalSavings;
      default:
        return PropertyResolver.getNestedProperty(packageData, property);
    }
  }
  getShippingPropertyValue(property) {
    const shippingElement = this.element.closest("[data-next-shipping-id]");
    if (!shippingElement) {
      this.logger.warn("Shipping condition used but no shipping context found");
      return null;
    }
    const shippingId = shippingElement.getAttribute("data-next-shipping-id");
    if (!shippingId) {
      return null;
    }
    const campaignStore = useCampaignStore.getState();
    const shippingMethods = campaignStore.data?.shipping_methods || [];
    const shippingMethod = shippingMethods.find(
      (method) => method.ref_id === parseInt(shippingId, 10)
    );
    if (!shippingMethod) {
      this.logger.warn(`Shipping method ${shippingId} not found in campaign data`);
      return null;
    }
    switch (property) {
      case "isFree":
        return parseFloat(shippingMethod.price || "0") === 0;
      case "cost":
      case "price":
        return parseFloat(shippingMethod.price || "0");
      case "name":
      case "code":
        return shippingMethod.code;
      case "id":
      case "refId":
        return shippingMethod.ref_id;
      case "method":
        return shippingMethod;
      default:
        return null;
    }
  }
  // getPackageShippingCost method removed - unused
  getOrderPropertyValue(orderState, property) {
    const order = orderState.order;
    switch (property) {
      case "exists":
      case "hasOrder":
        return !!order;
      case "isLoaded":
        return !orderState.isLoading && !!order;
      case "isLoading":
        return orderState.isLoading;
      case "hasError":
        return !!orderState.error;
      case "cacheFresh":
      case "isCacheFresh":
        if (!order || !orderState.orderLoadedAt) return false;
        const now = Date.now();
        const loadedAt = orderState.orderLoadedAt;
        const fifteenMinutes = 15 * 60 * 1e3;
        return now - loadedAt < fifteenMinutes;
      case "cacheExpired":
      case "isCacheExpired":
        if (!order || !orderState.orderLoadedAt) return false;
        const currentTime = Date.now();
        const orderLoadTime = orderState.orderLoadedAt;
        const expiration = 15 * 60 * 1e3;
        return currentTime - orderLoadTime >= expiration;
      case "isRecent":
      case "isRecentOrder":
        if (!order) return false;
        const orderTsRecent = order.attribution?.metadata?.timestamp;
        if (!orderTsRecent) return false;
        const nowRecent = Date.now();
        const ageRecent = nowRecent - orderTsRecent;
        const fifteenMinsRecent = 15 * 60 * 1e3;
        return ageRecent < fifteenMinsRecent;
      case "isExpired":
        if (!order) return false;
        const orderTsExpired = order.attribution?.metadata?.timestamp;
        if (!orderTsExpired) return false;
        const nowExpired = Date.now();
        const ageExpired = nowExpired - orderTsExpired;
        const fifteenMinsExpired = 15 * 60 * 1e3;
        return ageExpired >= fifteenMinsExpired;
      case "isNewOrder":
      case "wasPlacedRecently":
        if (!order) return false;
        const orderTimestamp = order.attribution?.metadata?.timestamp;
        if (!orderTimestamp) return false;
        const nowTime = Date.now();
        const orderAge = nowTime - orderTimestamp;
        const fifteenMins = 15 * 60 * 1e3;
        return orderAge < fifteenMins;
      case "isOldOrder":
      case "wasPlacedLongAgo":
        if (!order) return false;
        const orderTs = order.attribution?.metadata?.timestamp;
        if (!orderTs) return false;
        const currentTs = Date.now();
        const age = currentTs - orderTs;
        const fifteenMinutesMs = 15 * 60 * 1e3;
        return age >= fifteenMinutesMs;
    }
    if (!order) {
      return false;
    }
    switch (property) {
      case "isTest":
        return order.is_test || false;
      case "hasItems":
        return order.lines && order.lines.length > 0;
      case "isEmpty":
        return !order.lines || order.lines.length === 0;
      case "hasShipping":
        return parseFloat(order.shipping_incl_tax || "0") > 0;
      case "hasTax":
        return parseFloat(order.total_tax || "0") > 0;
      case "hasDiscounts":
        return parseFloat(order.total_discounts || "0") > 0;
      case "hasUpsells":
        return order.lines?.some((line) => line.is_upsell) || false;
      case "supportsUpsells":
      case "acceptsUpsells":
      case "supportsPostPurchaseUpsells":
        return order.supports_post_purchase_upsells || false;
      case "total":
        return parseFloat(order.total_incl_tax || "0");
      case "subtotal":
        return parseFloat(order.total_excl_tax || "0");
      case "tax":
        return parseFloat(order.total_tax || "0");
      case "shipping":
        return parseFloat(order.shipping_incl_tax || "0");
      case "shippingExclTax":
        return parseFloat(order.shipping_excl_tax || "0");
      case "shippingTax":
        return parseFloat(order.shipping_tax || "0");
      case "discounts":
        return parseFloat(order.total_discounts || "0");
      case "itemCount":
        return order.lines?.length || 0;
      case "totalQuantity":
        return order.lines?.reduce((sum, line) => sum + (line.quantity || 0), 0) || 0;
      default:
        return PropertyResolver.getNestedProperty(order, property);
    }
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
  ConditionalDisplayEnhancer
};
