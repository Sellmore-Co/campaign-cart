/**
 * Field mapping constants for checkout form
 */

export const COMMON_FIELD_PATTERNS = [
  { pattern: /country/i, key: 'country' },
  { pattern: /state|province|region/i, key: 'province' },
  { pattern: /postal|zip|postcode/i, key: 'postal' },
  { pattern: /city|town/i, key: 'city' },
  { pattern: /email/i, key: 'email' },
  { pattern: /phone|tel/i, key: 'phone' },
  { pattern: /fname|first.*name/i, key: 'fname' },
  { pattern: /lname|last.*name/i, key: 'lname' },
  { pattern: /address1|address_1|street/i, key: 'address1' }
] as const;

export const FIELD_NAME_MAP: Record<string, string> = {
  fname: 'First name',
  lname: 'Last name',
  address1: 'Address',
  address2: 'Address line 2',
  city: 'City',
  province: 'State/Province', // Will be overridden by country config
  postal: 'Postal code', // Will be overridden by country config
  country: 'Country',
  email: 'Email',
  phone: 'Phone number'
};

export const BILLING_FIELD_MAPPING: Record<string, string> = {
  'fname': 'billing-fname',
  'lname': 'billing-lname',
  'address1': 'billing-address1',
  'address2': 'billing-address2',
  'city': 'billing-city',
  'province': 'billing-province',
  'postal': 'billing-postal',
  'country': 'billing-country',
  'phone': 'billing-phone'
};

export const BILLING_ADDRESS_FIELD_MAP: Record<string, string> = {
  'fname': 'first_name',
  'lname': 'last_name',
  'address1': 'address1',
  'address2': 'address2',
  'city': 'city',
  'province': 'province',
  'postal': 'postal',
  'country': 'country',
  'phone': 'phone'
};

export const PAYMENT_METHOD_MAP: Record<string, 'card_token' | 'paypal' | 'apple_pay' | 'google_pay' | 'credit-card'> = {
  'credit': 'credit-card',
  'paypal': 'paypal',
  'apple-pay': 'apple_pay',
  'google-pay': 'google_pay'
};

export const API_PAYMENT_METHOD_MAP: Record<string, 'card_token' | 'paypal' | 'apple_pay' | 'google_pay'> = {
  'credit-card': 'card_token',
  'card_token': 'card_token',
  'paypal': 'paypal',
  'apple_pay': 'apple_pay',
  'google_pay': 'google_pay'
};

export const EXPRESS_PAYMENT_METHOD_MAP: Record<string, 'paypal' | 'apple_pay' | 'google_pay'> = {
  'paypal': 'paypal',
  'apple-pay': 'apple_pay',
  'google-pay': 'google_pay'
};