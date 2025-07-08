import { B as BaseDisplayEnhancer, D as DisplayFormatter, P as PropertyResolver } from "./DisplayEnhancerCore-BaUL7j6s.js";
import { g as getPropertyMapping } from "./DisplayEnhancerTypes-DCptTE0o.js";
import { a as useCampaignStore, A as AttributeParser } from "./analytics-CbggJMJ_.js";
import { P as PackageContextResolver } from "./PackageContextResolver-B7T99g1Y.js";
import { P as PriceCalculator } from "./PriceCalculator-D3ch1_s6.js";
class ProductDisplayEnhancer extends BaseDisplayEnhancer {
  async initialize() {
    this.validateElement();
    this.parseDisplayAttributes();
    this.detectPackageContext();
    this.setupStoreSubscriptions();
    await this.performInitialUpdate();
    this.logger.debug(`ProductDisplayEnhancer initialized with package ${this.packageId}, path: ${this.displayPath}`);
  }
  setupStoreSubscriptions() {
    this.subscribe(useCampaignStore, this.handleCampaignUpdate.bind(this));
    this.campaignState = useCampaignStore.getState();
    this.loadPackageData();
  }
  handleCampaignUpdate(campaignState) {
    this.campaignState = campaignState;
    this.loadPackageData();
    this.updateDisplay();
  }
  // PRESERVE: Package context detection
  detectPackageContext() {
    this.contextPackageId = PackageContextResolver.findPackageId(this.element);
    const parsed = AttributeParser.parseDisplayPath(this.displayPath);
    if (parsed.object === "package" && parsed.property.includes(".")) {
      const parts = parsed.property.split(".");
      if (parts[0] && !isNaN(Number(parts[0]))) {
        this.packageId = Number(parts[0]);
        this.property = parts.slice(1).join(".");
      }
    } else if (this.contextPackageId) {
      this.packageId = this.contextPackageId;
    }
    if (!this.packageId) {
      this.logger.warn("No package context found - package ID required");
    }
  }
  loadPackageData() {
    if (!this.packageId || !this.campaignState) return;
    this.packageData = this.campaignState.packages?.find((pkg) => pkg.ref_id === this.packageId);
    if (!this.packageData) {
      this.logger.warn(`Package ${this.packageId} not found in campaign data`);
    }
  }
  getPropertyValue() {
    if (!this.packageData || !this.property) return void 0;
    if (this.displayPath?.startsWith("campaign.")) {
      return this.getCampaignProperty(this.campaignState, this.property);
    }
    const calculatedValue = this.getCalculatedProperty(this.property);
    if (calculatedValue !== void 0) {
      return calculatedValue;
    }
    return this.getPackageValue(this.packageData, this.property);
  }
  // Override to handle special element types and container hiding
  updateElementContent(value) {
    if (this.element instanceof HTMLInputElement || this.element instanceof HTMLTextAreaElement) {
      this.element.value = value;
    } else if (this.element instanceof HTMLImageElement) {
      this.element.src = value;
      this.element.alt = "Product image";
    } else {
      this.element.textContent = value;
    }
  }
  // Override to handle container hiding support
  hideElement() {
    this.element.style.display = "none";
    this.addClass("display-hidden");
    this.removeClass("display-visible");
    const container = this.element.closest('[data-container="true"]');
    if (container) {
      container.style.display = "none";
    }
  }
  showElement() {
    this.element.style.display = "";
    this.addClass("display-visible");
    this.removeClass("display-hidden");
    const container = this.element.closest('[data-container="true"]');
    if (container) {
      container.style.display = "";
    }
  }
  update(data) {
    if (data) {
      this.handleCampaignUpdate(data);
    } else {
      this.updateDisplay();
    }
  }
  // PRESERVE: Advanced calculations
  getCalculatedProperty(property) {
    if (!this.packageData) return void 0;
    const metrics = PriceCalculator.calculatePackageMetrics({
      price: parseFloat(this.packageData.price || "0"),
      retailPrice: parseFloat(this.packageData.price_retail || "0"),
      quantity: this.packageData.qty || 1,
      priceTotal: parseFloat(this.packageData.price_total || "0"),
      retailPriceTotal: parseFloat(this.packageData.price_retail_total || "0")
    });
    const mappedPath = getPropertyMapping("package", property);
    if (mappedPath && mappedPath.startsWith("_calculated.")) {
      const calculatedProp = mappedPath.replace("_calculated.", "");
      switch (calculatedProp) {
        case "savingsAmount":
          return DisplayFormatter.formatCurrency(metrics.totalSavings);
        case "savingsPercentage":
          return `${Math.round(metrics.totalSavingsPercentage)}%`;
        case "hasSavings":
          return metrics.hasSavings;
        case "isBundle":
          return (this.packageData.qty || 1) > 1;
      }
    }
    switch (property) {
      case "savingsAmount":
        return DisplayFormatter.formatCurrency(metrics.totalSavings);
      case "savingsPercentage":
        this.logger.debug(`Calculating savingsPercentage for package ${this.packageData.ref_id}:`, {
          totalSavingsPercentage: metrics.totalSavingsPercentage,
          totalSavings: metrics.totalSavings,
          unitPrice: metrics.unitPrice,
          unitRetailPrice: metrics.unitRetailPrice,
          packageData: {
            ref_id: this.packageData.ref_id,
            name: this.packageData.name,
            price: this.packageData.price,
            price_retail: this.packageData.price_retail,
            price_total: this.packageData.price_total,
            price_retail_total: this.packageData.price_retail_total
          }
        });
        return `${Math.round(metrics.totalSavingsPercentage)}%`;
      case "unitPrice":
        return DisplayFormatter.formatCurrency(metrics.unitPrice);
      case "unitRetailPrice":
        return DisplayFormatter.formatCurrency(metrics.unitRetailPrice);
      case "unitSavings":
        return DisplayFormatter.formatCurrency(metrics.unitSavings);
      case "unitSavingsPercentage":
        return `${Math.round(metrics.unitSavingsPercentage)}%`;
      case "hasSavings":
        return metrics.hasSavings;
      case "hasRetailPrice":
        return metrics.unitRetailPrice > 0 && metrics.unitRetailPrice !== metrics.unitPrice;
      case "isBundle":
        return (this.packageData.qty || 1) > 1;
      case "isRecurring":
        return this.packageData.is_recurring === true;
      case "savingsAmount.raw":
        return metrics.totalSavings;
      case "savingsPercentage.raw":
        return metrics.totalSavingsPercentage;
      case "unitPrice.raw":
        return metrics.unitPrice;
      case "unitRetailPrice.raw":
        return metrics.unitRetailPrice;
      default:
        return void 0;
    }
  }
  getPackageValue(packageData, property) {
    const mappedPath = getPropertyMapping("package", property);
    if (mappedPath && !mappedPath.startsWith("_calculated.")) {
      return PropertyResolver.getNestedProperty(packageData, mappedPath);
    }
    return PropertyResolver.getNestedProperty(packageData, property);
  }
  getCampaignProperty(campaignState, property) {
    const campaignData = campaignState.data;
    if (!campaignData) {
      return "";
    }
    switch (property) {
      case "name":
        return campaignData.name;
      case "currency":
        return campaignData.currency;
      case "language":
        return campaignData.language;
      default:
        this.logger.warn(`Unknown campaign property: ${property}`);
        return "";
    }
  }
  // COMPATIBILITY METHODS
  getPackageProperty(property) {
    const oldProperty = this.property;
    this.property = property;
    const value = this.getPropertyValue();
    this.property = oldProperty;
    return value;
  }
  setPackageContext(packageId) {
    this.packageId = packageId;
    this.loadPackageData();
    this.updateDisplay();
  }
}
export {
  ProductDisplayEnhancer
};
