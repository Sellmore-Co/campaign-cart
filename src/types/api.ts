/**
 * API type definitions based on 29Next Campaigns API schema
 */

// Re-export from the OpenAPI spec we reviewed
export interface Campaign {
  currency: string;
  language: string;
  name: string;
  packages: PackageSerializer[];
  payment_env_key: string;
  shipping_methods: ShippingOption[];
  available_express_payment_methods?: PaymentMethodOption[];
  available_payment_methods?: PaymentMethodOption[];
  available_currencies?: Array<{ code: string; label: string }>;
}

export interface PackageSerializer {
  ref_id: number;
  external_id: number;
  name: string;
  price: string;
  price_total: string;
  price_retail?: string;
  price_retail_total?: string;
  price_recurring?: string;
  price_recurring_total?: string;
  qty: number;
  image: string;
  is_recurring: boolean;
  interval?: 'day' | 'month' | null;
  interval_count?: number | null;
}

export interface Cart {
  checkout_url: string;
  currency: string;
  lines: CartLine[];
  total_excl_tax: string;
  total_incl_tax: string;
  total_excl_tax_excl_discounts: string;
  total_incl_tax_excl_discounts: string;
  total_discounts: string;
  discounts: Voucher[];
  user: User;
  attribution?: MarketingAttribution;
}

export interface CartLine {
  id: number;
  quantity: number;
  price_excl_tax: string;
  price_incl_tax: string;
  price_excl_tax_excl_discounts: string;
  price_incl_tax_excl_discounts: string;
  product_title: string;
  product_sku: string;
  image: string;
  is_upsell: boolean;
}

export interface Order {
  ref_id: string;
  number: string;
  currency: string;
  lines: OrderLine[];
  total_excl_tax: string;
  total_incl_tax: string;
  total_tax: string;
  total_discounts: string;
  shipping_excl_tax: string;
  shipping_incl_tax: string;
  shipping_tax: string;
  shipping_method: string;
  shipping_code: string;
  display_taxes?: string;
  discounts: Discount[];
  user: OrderUser;
  shipping_address?: OrderAddress;
  billing_address?: OrderAddress;
  attribution?: MarketingAttribution;
  order_status_url: string;
  payment_complete_url?: string;
  supports_post_purchase_upsells: boolean;
  is_test: boolean;
}

export interface OrderLine {
  id: number;
  image: string;
  is_upsell: boolean;
  price_excl_tax: string;
  price_excl_tax_excl_discounts: string;
  price_incl_tax: string;
  price_incl_tax_excl_discounts: string;
  product_sku: string;
  product_title: string;
  product_description?: string;
  variant_title?: string;
  quantity: number;
}

export interface MarketingAttribution {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  gclid?: string;
  affiliate?: string;
  funnel?: string;
  subaffiliate1?: string;
  subaffiliate2?: string;
  subaffiliate3?: string;
  subaffiliate4?: string;
  subaffiliate5?: string;
  metadata?: Record<string, any>;
}

export interface ShippingOption {
  ref_id: number;
  code: string;
  price: string;
}

export interface PaymentMethodOption {
  code: string;
  label: string;
}

export interface User {
  accepts_marketing?: boolean;
  email?: string;
  first_name: string;
  ip?: string;
  language: string;
  last_name: string;
  phone_number?: string;
  user_agent?: string;
}

export interface OrderUser {
  accepts_marketing?: boolean;
  email?: string;
  first_name: string;
  ip?: string;
  language: string;
  last_name: string;
  phone_number?: string;
  user_agent?: string;
}

export interface OrderAddress {
  country: string;
  first_name: string;
  last_name: string;
  line1: string;
  line2?: string;
  line3?: string;
  line4: string; // City
  notes?: string;
  phone_number?: string;
  postcode?: string;
  state?: string;
}

export interface Voucher {
  amount: string;
  description?: string;
  name?: string;
}

export interface Discount {
  amount: string;
  description?: string;
  name?: string;
}

export type PaymentMethod = 
  | 'apple_pay'
  | 'card_token'
  | 'paypal'
  | 'klarna'
  | 'ideal'
  | 'bancontact'
  | 'giropay'
  | 'google_pay'
  | 'sofort'
  | 'sepa_debit'
  | 'external';

// Request/Response types
export interface CartBase {
  address?: AddressCart;
  attribution?: Attribution;
  currency?: string;
  lines: LineWithUpsell[];
  user: UserCreateCart;
  vouchers?: string[];
}

export interface AddressCart {
  country: string;
  first_name: string;
  last_name: string;
  line1: string;
  line2?: string;
  line3?: string;
  line4: string; // City
  notes?: string;
  phone_number?: string;
  postcode?: string;
  state?: string;
}

export interface Attribution {
  affiliate?: string;
  funnel?: string;
  gclid?: string;
  metadata?: Record<string, any>;
  subaffiliate1?: string;
  subaffiliate2?: string;
  subaffiliate3?: string;
  subaffiliate4?: string;
  subaffiliate5?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_medium?: string;
  utm_source?: string;
  utm_term?: string;
  everflow_transaction_id?: string;
}

export interface LineWithUpsell {
  is_upsell?: boolean;
  package_id: number;
  quantity: number;
}

export interface UserCreateCart {
  accepts_marketing?: boolean;
  email?: string;
  first_name: string;
  language: string;
  last_name: string;
  phone_number?: string;
}

export interface CreateOrder {
  attribution?: Attribution;
  billing_address?: Address;
  billing_same_as_shipping_address?: boolean;
  currency?: string;
  lines: LineWithUpsell[];
  payment_detail: Payment;
  payment_failed_url?: string;
  shipping_address?: Address;
  shipping_method: number;
  success_url: string;
  use_default_billing_address?: boolean;
  use_default_shipping_address?: boolean;
  user?: OrderUser;
  vouchers?: string[];
}

export interface Address {
  country: string;
  first_name: string;
  is_default_for_billing?: boolean;
  is_default_for_shipping?: boolean;
  last_name: string;
  line1: string;
  line2?: string;
  line3?: string;
  line4: string; // City
  notes?: string;
  phone_number?: string;
  postcode?: string;
  state?: string;
}

export interface Payment {
  card_token?: string;
  external_payment_method?: string;
  payment_gateway?: number;
  payment_gateway_group?: number;
  payment_method: PaymentMethod;
}

export interface AddUpsellLine {
  lines: UpsellLineItem[];
  payment_detail?: PaymentDetail;
  currency?: string;
}

export interface UpsellLineItem {
  package_id: number;
  quantity: number;
}

export interface PaymentDetail {
  payment_gateway?: number;
  payment_gateway_group?: number;
}