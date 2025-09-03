import { B as BaseDisplayEnhancer, a as getPropertyMapping, D as DisplayFormatter } from "./DisplayEnhancerCore-hW37aLJC.js";
import { a as useCampaignStore } from "./utils-D8OWy5yH.js";
class ShippingDisplayEnhancer extends BaseDisplayEnhancer {
  async initialize() {
    this.validateElement();
    this.parseDisplayAttributes();
    this.detectShippingContext();
    if (!this.shippingId) {
      this.logger.warn("ShippingDisplayEnhancer requires data-next-shipping-id context");
      return;
    }
    this.setupStoreSubscriptions();
    await this.performInitialUpdate();
    this.logger.debug(`ShippingDisplayEnhancer initialized with shipping ID ${this.shippingId}`);
  }
  setupStoreSubscriptions() {
    this.subscribe(useCampaignStore, this.handleCampaignUpdate.bind(this));
    this.loadShippingMethod();
  }
  handleCampaignUpdate() {
    this.loadShippingMethod();
    this.updateDisplay();
  }
  detectShippingContext() {
    const shippingElement = this.element.closest("[data-next-shipping-id]");
    if (!shippingElement) {
      return;
    }
    const shippingIdStr = shippingElement.getAttribute("data-next-shipping-id");
    if (shippingIdStr) {
      this.shippingId = parseInt(shippingIdStr, 10);
    }
  }
  loadShippingMethod() {
    if (!this.shippingId) return;
    const campaignStore = useCampaignStore.getState();
    const shippingMethods = campaignStore.data?.shipping_methods || [];
    const method = shippingMethods.find(
      (method2) => method2.ref_id === this.shippingId
    );
    if (method) {
      this.shippingMethod = method;
    }
    if (!this.shippingMethod) {
      this.logger.warn(`Shipping method ${this.shippingId} not found in campaign data`);
    }
  }
  getPropertyValue() {
    if (!this.shippingMethod || !this.property) return void 0;
    const mappedPath = getPropertyMapping("shipping", this.property);
    if (mappedPath && mappedPath.startsWith("_calculated.")) {
      const calculatedProp = mappedPath.replace("_calculated.", "");
      return this.getCalculatedProperty(calculatedProp);
    }
    switch (this.property) {
      case "isFree":
        return parseFloat(this.shippingMethod.price || "0") === 0;
      case "cost":
      case "price":
        return DisplayFormatter.formatValue(parseFloat(this.shippingMethod.price || "0"), "currency");
      case "cost.raw":
      case "price.raw":
        return parseFloat(this.shippingMethod.price || "0");
      case "name":
      case "code":
        return this.shippingMethod.code;
      case "id":
      case "refId":
        return this.shippingMethod.ref_id;
      case "method":
        return this.shippingMethod;
      default:
        return void 0;
    }
  }
  getCalculatedProperty(property) {
    if (!this.shippingMethod) return void 0;
    switch (property) {
      case "isFree":
        return parseFloat(this.shippingMethod.price || "0") === 0;
      case "cost":
      case "price":
        return DisplayFormatter.formatValue(parseFloat(this.shippingMethod.price || "0"), "currency");
      case "name":
      case "code":
        return this.shippingMethod.code;
      case "id":
      case "refId":
        return this.shippingMethod.ref_id;
      case "method":
        return this.shippingMethod;
      default:
        return void 0;
    }
  }
  update() {
    this.updateDisplay();
  }
}
export {
  ShippingDisplayEnhancer
};
