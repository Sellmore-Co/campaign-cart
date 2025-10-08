import { B as BaseDisplayEnhancer, g as getPropertyConfig, P as PropertyResolver } from "./DisplayEnhancerCore-DP60R73i.js";
import { A as AttributeParser } from "./index-D2cvBAGs.js";
import { u as useCartStore, a as useCampaignStore, f as configStore, p as getCurrencySymbol, q as formatCurrency, r as PackageContextResolver } from "./utils-hVzoqFyD.js";
class CartDisplayEnhancer extends BaseDisplayEnhancer {
  constructor() {
    super(...arguments);
    this.includeDiscounts = false;
  }
  async initialize() {
    this.includeDiscounts = this.element.hasAttribute("data-include-discounts");
    await super.initialize();
  }
  setupStoreSubscriptions() {
    this.subscribe(useCartStore, this.handleCartUpdate.bind(this));
    this.cartState = useCartStore.getState();
    if (this.cartState.items.length > 0 && this.cartState.totals.isEmpty) {
      this.logger.debug("Cart has items but totals are empty, triggering recalculation");
      useCartStore.getState().calculateTotals();
    }
  }
  handleCartUpdate(cartState) {
    const prevState = this.cartState;
    this.cartState = cartState;
    const shouldLog = this.property === "total" || this.property === "itemCount";
    if (shouldLog && (prevState?.total !== cartState.total || prevState?.items?.length !== cartState.items?.length)) {
      this.logger.debug("Cart updated", {
        isEmpty: cartState.isEmpty,
        itemCount: cartState.items.length,
        total: cartState.total,
        totalsFormatted: cartState.totals?.total?.formatted
      });
    }
    this.toggleClass("next-cart-empty", cartState.isEmpty);
    this.toggleClass("next-cart-has-items", !cartState.isEmpty);
    this.updateDisplay();
  }
  getPropertyValue() {
    if (!this.cartState || !this.property) {
      this.logger.debug("Missing cartState or property", {
        hasCartState: !!this.cartState,
        property: this.property
      });
      return void 0;
    }
    if (this.property === "currency" || this.property === "currencyCode") {
      const campaignStore = useCampaignStore.getState();
      if (campaignStore?.data?.currency) {
        return campaignStore.data.currency;
      } else {
        const configStore$1 = configStore.getState();
        return configStore$1?.selectedCurrency || configStore$1?.detectedCurrency || "USD";
      }
    }
    if (this.property === "currencySymbol") {
      const configStore$1 = configStore.getState();
      if (configStore$1?.locationData?.detectedCountryConfig?.currencySymbol) {
        return configStore$1.locationData.detectedCountryConfig.currencySymbol;
      }
      let currency = "USD";
      const campaignStore = useCampaignStore.getState();
      if (campaignStore?.data?.currency) {
        currency = campaignStore.data.currency;
      } else {
        currency = configStore$1?.selectedCurrency || configStore$1?.detectedCurrency || "USD";
      }
      return getCurrencySymbol(currency) || currency;
    }
    if (this.includeDiscounts && this.property === "subtotal") {
      this.logger.debug("Handling subtotal with discounts", {
        subtotal: this.cartState.totals?.subtotal,
        discounts: this.cartState.totals?.discounts
      });
      const subtotalValue = this.cartState.totals?.subtotal?.value || 0;
      const discountsValue = this.cartState.totals?.discounts?.value || 0;
      const discountedSubtotal = subtotalValue - discountsValue;
      let currency = "USD";
      const campaignStore = useCampaignStore.getState();
      if (campaignStore?.data?.currency) {
        currency = campaignStore.data.currency;
      } else {
        const configStore$1 = configStore.getState();
        currency = configStore$1?.selectedCurrency || configStore$1?.detectedCurrency || "USD";
      }
      const formatted = formatCurrency(discountedSubtotal, currency);
      this.logger.debug("Returning discounted subtotal", {
        discountedSubtotal,
        formatted,
        currency
      });
      return { _preformatted: true, value: formatted };
    }
    if (this.includeDiscounts && this.property === "subtotal.raw") {
      const subtotalValue = this.cartState.totals?.subtotal?.value || 0;
      const discountsValue = this.cartState.totals?.discounts?.value || 0;
      return subtotalValue - discountsValue;
    }
    const config = getPropertyConfig("cart", this.property);
    if (config) {
      const { path, preformatted } = config;
      if (path.startsWith("!")) {
        const actualPath = path.substring(1);
        const value2 = PropertyResolver.getNestedProperty(this.cartState, actualPath);
        return !value2;
      }
      const value = PropertyResolver.getNestedProperty(this.cartState, path);
      if (preformatted) {
        return { _preformatted: true, value };
      }
      return value;
    }
    return PropertyResolver.getNestedProperty(this.cartState, this.property);
  }
  async performInitialUpdate() {
    if (this.displayPath) {
      const parsed = AttributeParser.parseDisplayPath(this.displayPath);
      if (parsed.object === "package") {
        this.logger.warn(`CartDisplayEnhancer is handling package property "${this.displayPath}" - this may be incorrect!`, {
          element: this.element.outerHTML.substring(0, 200) + "...",
          hasPackageContext: PackageContextResolver.findPackageId(this.element) !== void 0
        });
      }
    }
    await super.performInitialUpdate();
  }
  getCartProperty(cartState, property) {
    const oldCartState = this.cartState;
    const oldProperty = this.property;
    this.cartState = cartState;
    this.property = property;
    const value = this.getPropertyValue();
    if (oldCartState !== void 0) {
      this.cartState = oldCartState;
    }
    if (oldProperty !== void 0) {
      this.property = oldProperty;
    }
    return value;
  }
  refreshDisplay() {
    this.updateDisplay();
  }
}
export {
  CartDisplayEnhancer
};
