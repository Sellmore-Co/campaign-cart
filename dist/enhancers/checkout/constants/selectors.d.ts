export declare const FIELD_SELECTORS: readonly ["[data-next-checkout-field]", "[os-checkout-field]"];
export declare const PAYMENT_BUTTON_SELECTORS: readonly ["[data-next-checkout-payment]", "[os-checkout-payment]"];
export declare const BILLING_FIELD_SELECTORS: readonly ["[os-checkout-field^=\"billing-\"]", "[data-next-checkout-field^=\"billing-\"]"];
export declare const EXPIRATION_MONTH_SELECTORS: readonly ["[data-next-checkout-field=\"cc-month\"]", "[data-next-checkout-field=\"exp-month\"]", "[os-checkout-field=\"cc-month\"]", "[os-checkout-field=\"exp-month\"]", "#credit_card_exp_month"];
export declare const EXPIRATION_YEAR_SELECTORS: readonly ["[data-next-checkout-field=\"cc-year\"]", "[data-next-checkout-field=\"exp-year\"]", "[os-checkout-field=\"cc-year\"]", "[os-checkout-field=\"exp-year\"]", "#credit_card_exp_year"];
export declare const BILLING_CONTAINER_SELECTOR = "[os-checkout-element=\"different-billing-address\"]";
export declare const SHIPPING_FORM_SELECTOR = "[os-checkout-component=\"shipping-form\"]";
export declare const BILLING_FORM_CONTAINER_SELECTOR = "[os-checkout-component=\"billing-form\"]";
export declare const PAYMENT_METHOD_SELECTOR = "input[name=\"payment_method\"]";
export declare const SHIPPING_METHOD_SELECTOR = "input[name=\"shipping_method\"]";
export declare const BILLING_TOGGLE_SELECTOR = "input[name=\"use_shipping_address\"]";
export declare const META_TAG_SELECTORS: {
    readonly SUCCESS_URL: readonly ["meta[name=\"next-success-url\"]", "meta[name=\"next-next-url\"]", "meta[name=\"os-next-page\"]"];
    readonly FAILURE_URL: readonly ["meta[name=\"next-failure-url\"]", "meta[name=\"os-failure-url\"]"];
    readonly NEXT_PAGE: readonly ["meta[name=\"next-success-url\"]", "meta[name=\"next-next-url\"]", "meta[name=\"os-next-page\"]"];
};
//# sourceMappingURL=selectors.d.ts.map