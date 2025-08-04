/**
 * DOM selector constants for checkout form elements
 */

export const FIELD_SELECTORS = [
  '[data-next-checkout-field]',
  '[os-checkout-field]'
] as const;

export const PAYMENT_BUTTON_SELECTORS = [
  '[data-next-checkout-payment]',
  '[os-checkout-payment]'
] as const;

export const BILLING_FIELD_SELECTORS = [
  '[os-checkout-field^="billing-"]',
  '[data-next-checkout-field^="billing-"]'
] as const;

export const EXPIRATION_MONTH_SELECTORS = [
  '[data-next-checkout-field="cc-month"]',
  '[data-next-checkout-field="exp-month"]', 
  '[os-checkout-field="cc-month"]',
  '[os-checkout-field="exp-month"]',
  '#credit_card_exp_month'
] as const;

export const EXPIRATION_YEAR_SELECTORS = [
  '[data-next-checkout-field="cc-year"]',
  '[data-next-checkout-field="exp-year"]',
  '[os-checkout-field="cc-year"]', 
  '[os-checkout-field="exp-year"]',
  '#credit_card_exp_year'
] as const;

export const BILLING_CONTAINER_SELECTOR = '[os-checkout-element="different-billing-address"]';
export const SHIPPING_FORM_SELECTOR = '[os-checkout-component="shipping-form"]';
export const BILLING_FORM_CONTAINER_SELECTOR = '[os-checkout-component="billing-form"]';

export const PAYMENT_METHOD_SELECTOR = 'input[name="payment_method"]';
export const SHIPPING_METHOD_SELECTOR = 'input[name="shipping_method"]';
export const BILLING_TOGGLE_SELECTOR = 'input[name="use_shipping_address"]';

export const META_TAG_SELECTORS = {
  SUCCESS_URL: ['meta[name="next-success-url"]', 'meta[name="next-next-url"]', 'meta[name="os-next-page"]'],
  FAILURE_URL: ['meta[name="next-failure-url"]', 'meta[name="os-failure-url"]'],
  NEXT_PAGE: ['meta[name="next-success-url"]', 'meta[name="next-next-url"]', 'meta[name="os-next-page"]']
} as const;