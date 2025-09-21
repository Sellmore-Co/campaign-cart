/**
 * Global type definitions for the SDK
 */

// Event Map for type-safe event handling
export interface EventMap {
  'cart:updated': CartState;
  'cart:item-added': { packageId: number; quantity?: number; source?: string };
  'cart:item-removed': { packageId: number; };
  'cart:quantity-changed': { packageId: number; quantity: number; oldQuantity: number };
  'cart:package-swapped': { 
    previousPackageId: number; 
    newPackageId: number; 
    previousItem?: CartItem;
    newItem?: CartItem;
    priceDifference: number;
    source?: string;
  };
  'campaign:loaded': Campaign;
  'checkout:started': CheckoutData;
  'checkout:form-initialized': { form: HTMLFormElement };
  'checkout:spreedly-ready': {};
  'checkout:express-started': { method: 'paypal' | 'apple_pay' | 'google_pay' };
  'order:completed': OrderData;
  'order:redirect-missing': { order: any };
  'error:occurred': ErrorData;
  'currency:fallback': { requested: string; actual: string; reason: 'cached' | 'api' };
  'timer:expired': { persistenceId: string };
  'config:updated': ConfigState;
  'coupon:applied': { coupon: AppliedCoupon } | { code: string };
  'coupon:removed': { code: string };
  'coupon:validation-failed': { code: string; message: string };
  'selector:item-selected': { selectorId: string; packageId: number; previousPackageId: number | undefined; mode: string; pendingAction: boolean | undefined; item?: SelectorItem };
  'selector:action-completed': { selectorId: string; packageId: number; previousPackageId: number | undefined; mode: string };
  'selector:selection-changed': { selectorId: string; packageId?: number; quantity?: number; item?: SelectorItem };
  'shipping:method-selected': { shippingId: string; selectorId: string };
  'shipping:method-changed': { methodId: number; method: any };
  
  // Action Events
  'action:success': { action: string; data?: any };
  'action:failed': { action: string; error: Error };
  
  // Upsell Events
  'upsell:accepted': { packageId: number; quantity: number; orderId: string; value?: number };
  'upsell-selector:item-selected': { selectorId: string; packageId: number };
  'upsell:quantity-changed': { selectorId?: string | undefined; quantity: number; packageId?: number | undefined };
  'upsell:option-selected': { selectorId: string; packageId: number };
  
  // Message Events
  'message:displayed': { message: string; type: string };
  
  // Payment Events
  'payment:tokenized': { token: string; pmData: any; paymentMethod: string };
  'payment:error': { errors: string[] };
  'checkout:express-completed': { method: string; success: boolean };
  'checkout:express-failed': { method: string; error: string };
  
  // Express Checkout Events
  'express-checkout:initialized': { method: 'paypal' | 'apple_pay' | 'google_pay'; element: HTMLElement };
  'express-checkout:error': { method: 'paypal' | 'apple_pay' | 'google_pay'; error: string };
  'express-checkout:started': { method: 'paypal' | 'apple_pay' | 'google_pay'; cartTotal: { value: number; formatted: string }; itemCount: number };
  'express-checkout:failed': { method: 'paypal' | 'apple_pay' | 'google_pay'; error: string };
  'express-checkout:completed': { method: 'paypal' | 'apple_pay' | 'google_pay'; order: any };
  'express-checkout:redirect-missing': { order: any };
  
  // Address Autocomplete Events
  'address:autocomplete-filled': { type: 'shipping' | 'billing'; components: Record<string, { long: string; short: string }> };
  'address:location-fields-shown': {};
  'checkout:location-fields-shown': {};
  'checkout:billing-location-fields-shown': {};
  
  // Upsell Events
  'upsell:initialized': { packageId: number; element: HTMLElement };
  'upsell:adding': { packageId: number };
  'upsell:added': { packageId: number; quantity: number; order: any; value?: number; willRedirect?: boolean };
  'upsell:error': { packageId: number; error: string };
  
  // Accordion Events
  'accordion:toggled': { id: string; isOpen: boolean; element: HTMLElement };
  'accordion:opened': { id: string; element: HTMLElement };
  'accordion:closed': { id: string; element: HTMLElement };
  'upsell:skipped': { packageId?: number; orderId?: string };
  'upsell:viewed': { packageId?: number; pagePath?: string; orderId?: string };
  
  // Exit Intent Events (simplified)
  'exit-intent:shown': { imageUrl?: string; template?: string };
  'exit-intent:clicked': { imageUrl?: string; template?: string };
  'exit-intent:dismissed': { imageUrl?: string; template?: string };
  'exit-intent:closed': { imageUrl?: string; template?: string };
  'exit-intent:action': { action: string; couponCode?: string };
  
  // FOMO Events
  'fomo:shown': { customer: string; product: string; image: string };
  
  // SDK Events
  'sdk:url-parameters-processed': {};
  
  // Profile Events
  'profile:applied': { 
    profileId: string; 
    previousProfileId?: string | null; 
    itemsSwapped: number;
    originalItems?: number;
    cleared?: boolean;
    profile?: any;
  };
  'profile:reverted': { 
    previousProfileId?: string | null;
    itemsRestored: number;
  };
  'profile:switched': {
    fromProfileId?: string | null;
    toProfileId: string;
    itemsAffected: number;
  };
  'profile:registered': {
    profileId: string;
    mappingsCount: number;
  };
}

// Basic cart types
export interface CartItem {
  id: number;
  packageId: number;
  originalPackageId?: number; // Original package ID before profile mapping
  quantity: number;
  price: number; // Total package price (price_total from campaign)
  image: string | undefined;
  title: string;
  sku: string | undefined;
  is_upsell: boolean | undefined;
  // Campaign response data for display (using snake_case to match API)
  price_per_unit?: string | undefined; // Per-unit price (price from campaign)
  qty?: number | undefined; // Number of units in package (qty from campaign)
  price_total?: string | undefined; // Total package price (price_total from campaign)
  price_retail?: string | undefined; // Per-unit retail price (price_retail from campaign)
  price_retail_total?: string | undefined; // Total retail price (price_retail_total from campaign)
  price_recurring?: string | undefined; // Recurring price if applicable
  price_recurring_total?: string | undefined; // Total recurring price
  is_recurring?: boolean | undefined; // Whether this is a recurring item
  interval?: string | null | undefined; // Billing interval
  interval_count?: number | null | undefined; // Billing interval count
  // Product and variant information for display
  productId?: number | undefined;
  productName?: string | undefined;
  variantId?: number | undefined;
  variantName?: string | undefined;
  variantAttributes?: Array<{ code: string; name: string; value: string }> | undefined;
  variantSku?: string | undefined;
  // Grouping support
  groupedItemIds?: number[] | undefined; // IDs of items grouped together
}

// Selector-specific types with explicit undefined handling
export interface SelectorItem {
  element: HTMLElement;
  packageId: number;
  quantity: number;
  price: number | undefined;
  name: string | undefined;
  isPreSelected: boolean;
  shippingId: string | undefined;
}

export interface CartState {
  items: CartItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  totalQuantity: number;
  isEmpty: boolean;
  coupon?: Coupon; // Legacy - will be deprecated in favor of appliedCoupons
  appliedCoupons: AppliedCoupon[];
  shippingMethod?: ShippingMethod;
  enrichedItems: EnrichedCartLine[];
  totals: CartTotals;
  swapInProgress?: boolean;
  lastCurrency?: string; // Track last currency to detect changes
}

export interface CartTotals {
  subtotal: { value: number; formatted: string };
  shipping: { value: number; formatted: string };
  tax: { value: number; formatted: string };
  discounts: { value: number; formatted: string };
  total: { value: number; formatted: string };
  totalExclShipping: { value: number; formatted: string };
  count: number;
  isEmpty: boolean;
  savings: { value: number; formatted: string };
  savingsPercentage: { value: number; formatted: string };
  compareTotal: { value: number; formatted: string };
  hasSavings: boolean;
  totalSavings: { value: number; formatted: string };
  totalSavingsPercentage: { value: number; formatted: string };
  hasTotalSavings: boolean;
}

export interface EnrichedCartLine {
  id: number;
  packageId: number;
  quantity: number;
  price: {
    excl_tax: { value: number; formatted: string };
    incl_tax: { value: number; formatted: string };
    original: { value: number; formatted: string };
    savings: { value: number; formatted: string };
  };
  product: {
    title: string;
    sku: string;
    image: string;
  };
  is_upsell: boolean;
  is_recurring: boolean;
  interval?: 'day' | 'month';
  is_bundle: boolean;
  bundleComponents?: number[];
}

// Campaign types
export interface Campaign {
  currency: string;
  language: string;
  name: string;
  packages: Package[];
  payment_env_key: string;
  shipping_methods: ShippingOption[];
  available_currencies?: Array<{ code: string; label: string }>;
}

export interface Package {
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

export interface ShippingOption {
  ref_id: number;
  code: string;
  price: string;
}

// Google Maps configuration interface
export interface GoogleMapsConfig {
  apiKey?: string;
  region?: string;
  enableAutocomplete?: boolean;
  autocompleteOptions?: any;
}

// Address configuration interface
export interface AddressConfig {
  defaultCountry?: string;
  showCountries?: string[];
  dontShowStates?: string[];
  countries?: Array<{
    code: string;
    name: string;
  }>;
}

// Configuration types
export interface ConfigState {
  apiKey: string;
  campaignId: string;
  debug: boolean;
  pageType: PageType;
  storeName?: string;
  spreedlyEnvironmentKey?: string | undefined;
  paymentConfig: PaymentConfig;
  googleMapsConfig: GoogleMapsConfig;
  addressConfig: AddressConfig;
  
  // Location and currency detection
  detectedCountry?: string;
  detectedCurrency?: string;
  selectedCurrency?: string;
  locationData?: any;
  currencyBehavior?: 'auto' | 'manual'; // auto: change currency when country changes, manual: never auto-change
  currencyFallbackOccurred?: boolean; // Track if currency fallback happened
  
  // Additional configuration properties for complete type coverage
  autoInit: boolean | undefined;
  rateLimit: number | undefined;
  cacheTtl: number | undefined;
  retryAttempts: number | undefined;
  timeout: number | undefined;
  testMode: boolean | undefined;
  
  // API and performance settings
  maxRetries: number | undefined;
  requestTimeout: number | undefined;
  enableAnalytics: boolean | undefined;
  enableDebugMode: boolean | undefined;
  
  // Environment and deployment settings
  environment: 'development' | 'staging' | 'production' | undefined;
  version?: string | undefined;
  buildTimestamp?: string | undefined;
  
  // Discount system
  discounts: Record<string, DiscountDefinition>;
  
  // Attribution configuration
  utmTransfer?: {
    enabled: boolean;
    applyToExternalLinks?: boolean;
    excludedDomains?: string[];
    paramsToCopy?: string[];
  };
  
  // Tracking configuration (legacy)
  tracking?: 'auto' | 'manual' | 'disabled';
  
  // New analytics configuration
  analytics?: {
    enabled: boolean;
    mode: 'auto' | 'manual' | 'disabled';
    debug: boolean;
    providers: {
      gtm: {
        enabled: boolean;
        settings: {
          containerId?: string;
          dataLayerName?: string;
          environment?: string;
        };
      };
      facebook: {
        enabled: boolean;
        settings: {
          pixelId: string;
          accessToken?: string;
          testEventCode?: string;
        };
        blockedEvents?: string[];
      };
      custom: {
        enabled: boolean;
        settings: {
          endpoint: string;
          apiKey?: string;
          batchSize?: number;
          timeout?: number;
        };
      };
    };
  };
  
  // Error monitoring configuration - removed
  // Error tracking can be added externally via HTML/scripts
  
  // Profile configuration
  profiles?: Record<string, {
    name: string;
    description?: string;
    packageMappings: Record<number, number>;
  }>;
  defaultProfile?: string;
  activeProfile?: string;
}

export type PageType = 'product' | 'cart' | 'checkout' | 'upsell' | 'receipt';

export interface PaymentConfig {
  spreedly?: {
    fieldType?: { number?: string; cvv?: string };
  };
  expressCheckout?: {
    enabled: boolean;
    methods: {
      paypal?: boolean;
      applePay?: boolean;
      googlePay?: boolean;
    };
    requireValidation?: boolean; // If true, express payment methods in combo form will require form validation
    requiredFields?: string[]; // List of fields required for express checkout (e.g., ['email', 'fname', 'lname'])
  };
}

// Callback types
export type CallbackType = 
  | 'beforeRender'
  | 'afterRender' 
  | 'beforeCheckout'
  | 'afterCheckout'
  | 'beforeRedirect'
  | 'itemAdded'
  | 'itemRemoved'
  | 'cartCleared';

export interface CallbackData {
  cartLines: EnrichedCartLine[];
  cartTotals: CartTotals;
  campaignData: Campaign | null;
  appliedCoupons: AppliedCoupon[];
}

// Coupon system types
export interface DiscountDefinition {
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  scope: 'order' | 'package';
  packageIds?: number[]; // For package-specific discounts
  minOrderValue?: number;
  maxDiscount?: number; // For percentage discounts
  description?: string;
  usageLimit?: number;
  combinable?: boolean; // Can be combined with other coupons
}

export interface AppliedCoupon {
  code: string;
  discount: number; // Calculated discount amount
  definition: DiscountDefinition;
}

// Legacy coupon interface - kept for backwards compatibility
export interface Coupon {
  code: string;
  amount: number;
  type: 'fixed' | 'percentage';
}

export interface ShippingMethod {
  id: number;
  name: string;
  price: number;
  code: string;
}

export interface CheckoutData {
  formData: Record<string, any>;
  paymentMethod: 'card_token' | 'paypal' | 'apple_pay' | 'google_pay' | 'credit-card';
  isProcessing?: boolean;
  step?: number;
}

export interface OrderData {
  ref_id: string;
  number: string;
  currency: string;
  total_incl_tax: string;
  order_status_url: string;
  is_test: boolean;
  lines?: any[];
  user?: any;
}

export interface ErrorData {
  message: string;
  code?: string;
  details?: any;
}

