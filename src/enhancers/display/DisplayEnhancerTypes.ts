/**
 * Display Enhancer Types and Constants
 * Consolidated type definitions and constants for all display enhancers
 * 
 * DISPLAY FORMATTING PIPELINE:
 * 
 * 1. Property Mapping (PROPERTY_MAPPINGS):
 *    - Maps display properties to data paths
 *    - Indicates if values are pre-formatted with { preformatted: true }
 *    - Example: cart.total -> { path: 'totals.total.formatted', preformatted: true }
 * 
 * 2. Format Detection (PROPERTY_FORMAT_REGISTRY + getDefaultFormatType):
 *    - Explicit format registry for properties that need formatting
 *    - Fallback to name-based detection for unmapped properties
 *    - Only applies to raw values, not pre-formatted ones
 * 
 * 3. Value Formatting (DisplayFormatter):
 *    - Pre-formatted values bypass formatting entirely
 *    - Raw values are formatted based on detected format type
 *    - Validation is applied during formatting
 * 
 * BEST PRACTICES:
 * - Cart/Order data: Use pre-formatted values from store (e.g., cart.total)
 * - Package data: Use raw values that need formatting (e.g., package.price)
 * - For calculations: Use .raw suffix to get numeric values (e.g., cart.total.raw)
 */

// =====================
// TYPE DEFINITIONS
// =====================

export type FormatType = 'currency' | 'number' | 'boolean' | 'date' | 'percentage' | 'text' | 'auto';

export interface DisplayProperty {
  path: string;
  property: string;
  format?: FormatType;
  hideIfZero?: boolean;
  hideIfFalse?: boolean;
  divideBy?: number;
  multiplyBy?: number;
}

// Structured value interface for enhanced format detection
export interface DisplayValue<T = any> {
  value: T;
  format: FormatType;
  metadata?: {
    decimals?: number;
    prefix?: string;
    suffix?: string;
    locale?: string;
  };
}

export interface DisplayState {
  isVisible: boolean;
  lastValue: any;
  lastFormattedValue: string;
}

// =====================
// CONSTANTS
// =====================

export const DISPLAY_FORMATS = {
  CURRENCY: 'currency',
  NUMBER: 'number',
  BOOLEAN: 'boolean',
  DATE: 'date',
  PERCENTAGE: 'percentage',
  AUTO: 'auto'
} as const;

export const DISPLAY_ATTRIBUTES = {
  DISPLAY: 'data-next-display',
  FORMAT: 'data-format',
  HIDE_IF_ZERO: 'data-hide-if-zero',
  HIDE_IF_FALSE: 'data-hide-if-false',
  HIDE_ZERO_CENTS: 'data-hide-zero-cents',
  DIVIDE_BY: 'data-divide-by',
  MULTIPLY_BY: 'data-multiply-by',
  SELECTOR_ID: 'data-next-selector-id'
} as const;

export const DISPLAY_OBJECTS = {
  CART: 'cart',
  PACKAGE: 'package',
  CAMPAIGN: 'campaign',
  ORDER: 'order',
  SELECTION: 'selection',
  SHIPPING: 'shipping'
} as const;

export const CSS_CLASSES = {
  DISPLAY_VISIBLE: 'display-visible',
  DISPLAY_HIDDEN: 'display-hidden',
  DISPLAY_ERROR: 'display-error',
  DISPLAY_LOADING: 'display-loading'
} as const;

// =====================
// PROPERTY MAPPINGS
// =====================

// Property configuration that combines path, format, and whether it's pre-formatted
export interface PropertyConfig {
  path: string;
  format?: FormatType;
  preformatted?: boolean;
  validator?: (value: any) => any;
  fallback?: any;
  debugInfo?: boolean;
}

// Type helper for property mappings
type PropertyMap = Record<string, string | PropertyConfig | boolean>;

export const PROPERTY_MAPPINGS: Record<string, PropertyMap> = {
  // Cart properties
  cart: {
    // Booleans
    isEmpty: 'isEmpty',
    hasItems: '!isEmpty', // Negation
    hasSavings: 'totals.hasSavings',
    hasTotalSavings: 'totals.hasTotalSavings',
    
    // Quantities (number of packages in cart)
    quantity: 'totalQuantity',
    itemCount: 'items.length',
    count: 'totals.count',
    
    // Pre-formatted financial values from store
    subtotal: { path: 'totals.subtotal.formatted', preformatted: true },
    total: { path: 'totals.total.formatted', preformatted: true },
    totalExclShipping: { path: 'totals.totalExclShipping.formatted', preformatted: true },
    shipping: { path: 'totals.shipping.formatted', preformatted: true },
    tax: { path: 'totals.tax.formatted', preformatted: true },
    discounts: { path: 'totals.discounts.formatted', preformatted: true },
    savingsAmount: { path: 'totals.savings.formatted', preformatted: true, fallback: '$0.00' },
    savingsPercentage: { path: 'totals.savingsPercentage.formatted', preformatted: true, fallback: '0%' },
    compareTotal: { path: 'totals.compareTotal.formatted', preformatted: true },
    totalSavingsAmount: { path: 'totals.totalSavings.formatted', preformatted: true, fallback: '$0.00' },
    totalSavingsPercentage: { path: 'totals.totalSavingsPercentage.formatted', preformatted: true, fallback: '0%' },
    
    // Raw numeric values that need formatting
    'subtotal.raw': { path: 'totals.subtotal.value', format: 'currency' },
    'total.raw': { path: 'totals.total.value', format: 'currency' },
    'totalExclShipping.raw': { path: 'totals.totalExclShipping.value', format: 'currency' },
    'shipping.raw': { path: 'totals.shipping.value', format: 'currency' },
    'tax.raw': { path: 'totals.tax.value', format: 'currency' },
    'discounts.raw': { path: 'totals.discounts.value', format: 'currency' },
    'savingsAmount.raw': { path: 'totals.savings.value', format: 'currency' },
    'savingsPercentage.raw': { path: 'totals.savingsPercentage.value', format: 'percentage' },
    'compareTotal.raw': { path: 'totals.compareTotal.value', format: 'currency' },
    'totalSavingsAmount.raw': { path: 'totals.totalSavings.value', format: 'currency' },
    'totalSavingsPercentage.raw': { path: 'totals.totalSavingsPercentage.value', format: 'percentage' },
    
    // Coupon/discount code properties
    hasCoupons: { path: 'appliedCoupons.length', format: 'boolean', validator: (v) => v > 0 },
    hasCoupon: { path: 'appliedCoupons.length', format: 'boolean', validator: (v) => v > 0 }, // Alias for hasCoupons
    couponCount: { path: 'appliedCoupons.length', format: 'number' },
    'coupons[0].code': { path: 'appliedCoupons.0.code', format: 'text' },
    'coupons[0].discount': { path: 'appliedCoupons.0.discount', format: 'currency' },
    'coupons[1].code': { path: 'appliedCoupons.1.code', format: 'text' },
    'coupons[1].discount': { path: 'appliedCoupons.1.discount', format: 'currency' },
    // Convenience aliases
    discountCode: { path: 'appliedCoupons.0.code', format: 'text', fallback: '' },
    discountCodes: { 
      path: 'appliedCoupons', 
      format: 'text',
      validator: (coupons) => {
        if (!Array.isArray(coupons) || coupons.length === 0) return '';
        return coupons.map(c => c.code).join(', ');
      }
    }
  },
  
  // Package properties
  package: {
    // Direct API properties (need formatting)
    ref_id: { path: 'ref_id', format: 'number' },
    external_id: 'external_id',
    qty: { path: 'qty', format: 'number' },
    price: { path: 'price', format: 'currency' },
    price_total: { path: 'price_total', format: 'currency' },
    price_retail: { path: 'price_retail', format: 'currency' },
    price_retail_total: { path: 'price_retail_total', format: 'currency' },
    price_recurring: { path: 'price_recurring', format: 'currency' },
    is_recurring: 'is_recurring',
    interval: 'interval',
    interval_count: { path: 'interval_count', format: 'number' },
    
    // Enhanced properties (calculated values)
    unitPrice: { path: '_calculated.unitPrice', format: 'currency' },
    unitRetailPrice: { path: '_calculated.unitRetailPrice', format: 'currency' },
    packageTotal: { path: 'price_total', format: 'currency' },
    comparePrice: { path: 'price_retail_total', format: 'currency' },
    compareTotal: { path: 'price_retail_total', format: 'currency' },
    savingsAmount: { 
      path: '_calculated.savingsAmount', 
      format: 'currency',
      validator: (v) => Math.max(0, Number(v) || 0),
      fallback: 0,
      debugInfo: true
    },
    savingsPercentage: { 
      path: '_calculated.savingsPercentage', 
      format: 'percentage',
      validator: (v) => Math.min(100, Math.max(0, Number(v) || 0)),
      fallback: 0
    },
    unitSavings: { path: '_calculated.unitSavings', format: 'currency' },
    unitSavingsPercentage: { path: '_calculated.unitSavingsPercentage', format: 'percentage' },
    hasSavings: '_calculated.hasSavings',
    isRecurring: 'is_recurring',
    isBundle: '_calculated.isBundle',
    unitsInPackage: { path: 'qty', format: 'number' },
    
    // Discount-adjusted prices (calculated with cart context)
    discountedPrice: { path: '_calculated.discountedPrice', format: 'currency' },
    discountedPriceTotal: { path: '_calculated.discountedPriceTotal', format: 'currency' },
    discountAmount: { path: '_calculated.discountAmount', format: 'currency' },
    hasDiscount: '_calculated.hasDiscount',
    finalPrice: { path: '_calculated.finalPrice', format: 'currency' },
    finalPriceTotal: { path: '_calculated.finalPriceTotal', format: 'currency' },
    
    // Total savings including both retail savings and discounts
    totalSavingsAmount: { path: '_calculated.totalSavingsAmount', format: 'currency' },
    totalSavingsPercentage: { path: '_calculated.totalSavingsPercentage', format: 'percentage' },
    totalSavingsWithDiscounts: { path: '_calculated.totalSavingsWithDiscounts', format: 'currency' },
    totalSavingsPercentageWithDiscounts: { path: '_calculated.totalSavingsPercentageWithDiscounts', format: 'percentage' },
    hasTotalSavings: '_calculated.hasTotalSavings',
  },
  
  // Selection properties (for package selectors)
  selection: {
    // Basic selection properties
    hasSelection: { path: 'hasSelection', format: 'boolean' },
    packageId: { path: 'packageId', format: 'number' },
    quantity: { path: 'quantity', format: 'number' },
    name: 'name',
    
    // Pricing - raw values that need formatting
    price: { path: 'price', format: 'currency' },
    total: { path: 'total', format: 'currency' },
    compareTotal: { path: 'compareTotal', format: 'currency' },
    unitPrice: { path: 'unitPrice', format: 'currency' },
    
    // Savings
    savingsAmount: { path: 'savingsAmount', format: 'currency' },
    savingsPercentage: { path: 'savingsPercentage', format: 'percentage' },
    hasSavings: { path: 'hasSavings', format: 'boolean' },
    
    // Bundle info
    isBundle: { path: 'isBundle', format: 'boolean' },
    totalUnits: { path: 'totalUnits', format: 'number' },
    
    // Advanced calculations
    monthlyPrice: { path: 'monthlyPrice', format: 'currency' },
    yearlyPrice: { path: 'yearlyPrice', format: 'currency' },
    pricePerDay: { path: 'pricePerDay', format: 'currency' },
    savingsPerUnit: { path: 'savingsPerUnit', format: 'currency' },
    discountAmount: { path: 'discountAmount', format: 'currency' },
    
    // Aliases
    price_total: { path: 'total', format: 'currency' },
    price_retail_total: { path: 'compareTotal', format: 'currency' },
    savings: { path: 'savingsAmount', format: 'currency' },
    pricePerUnit: { path: 'unitPrice', format: 'currency' },
    totalQuantity: { path: 'totalUnits', format: 'number' },
    isMultiPack: { path: 'isBundle', format: 'boolean' },
    isSingleUnit: { path: 'isSingleUnit', format: 'boolean' },
    
    // Mathematical expressions
    '_expression': true, // Flag to enable expression evaluation
  },
  
  // Shipping properties (context-based)
  shipping: {
    // Properties available within data-next-shipping-id context
    isFree: '_calculated.isFree',
    cost: '_calculated.cost',
    price: '_calculated.price', // Alias for cost
    name: '_calculated.name',
    code: '_calculated.code',
    method: '_calculated.method', // Full method object
    id: '_calculated.id',
    refId: '_calculated.refId', // Alias for id
  },
  
  // Order properties
  order: {
    // Loading states
    isLoading: 'isLoading',
    hasError: 'error',
    errorMessage: 'error',
    
    // Order basics
    id: 'order.id',
    number: 'order.number',
    // API properties (keep snake_case)
    ref_id: 'order.ref_id',
    created_at: { path: 'created_at', format: 'date' },
    total_incl_tax: { path: 'total_incl_tax', format: 'currency' },
    order_status_url: 'order_status_url',
    is_test: 'is_test',
    supports_upsells: 'supports_upsells',
    payment_method: { path: 'payment_method', format: 'text' },
    shipping_method: { path: 'shipping_method', format: 'text' },
    
    // Enhanced properties (camelCase)
    refId: 'order.ref_id',
    createdAt: { path: 'order.created_at', format: 'date' },
    total: { path: 'order.total_incl_tax', format: 'currency', fallback: 0 },
    statusUrl: 'order.order_status_url',
    isTest: 'order.is_test',
    supportsUpsells: 'order.supports_post_purchase_upsells',
    paymentMethod: { path: 'order.payment_method', format: 'text', fallback: 'Credit Card' },
    shippingMethod: { path: 'order.shipping_method', format: 'text' },
    status: { path: 'order.status', fallback: 'Completed' },
    currency: 'order.currency',
    testBadge: { path: 'order.is_test', format: 'text' }, // Will need custom formatting
    
    // Financial properties (check if these come pre-formatted from API)
    subtotal: { path: '_calculated.subtotal', format: 'currency' }, // Line items only, excludes shipping and tax
    subtotalExclShipping: { path: '_calculated.subtotalExclShipping', format: 'currency' }, // Alias for subtotal
    total_excl_tax: { path: 'order.total_excl_tax', format: 'currency' }, // Total excluding tax but INCLUDING shipping
    tax: { path: 'order.total_tax', format: 'currency' },
    shipping: { path: 'order.shipping_incl_tax', format: 'currency' },
    shippingExclTax: { path: 'order.shipping_excl_tax', format: 'currency' },
    shippingTax: { path: 'order.shipping_tax', format: 'currency' },
    discounts: { path: 'order.total_discounts', format: 'currency' },
    savings: { path: '_calculated.savings', format: 'currency' },
    savingsAmount: { path: '_calculated.savingsAmount', format: 'currency' },
    savingsPercentage: { path: '_calculated.savingsPercentage', format: 'percentage' },
    hasSavings: '_calculated.hasSavings',
    
    // Customer properties
    'customer.name': 'customer.name',
    'customer.firstName': 'customer.firstName',
    'customer.lastName': 'customer.lastName',
    'customer.email': 'customer.email',
    'customer.phone': 'customer.phone',
    
    // Address properties - explicitly text format
    'shippingAddress.full': { path: 'shippingAddress.full', format: 'text' },
    'shippingAddress.line1': { path: 'shippingAddress.line1', format: 'text' },
    'shippingAddress.line2': { path: 'shippingAddress.line2', format: 'text' },
    'shippingAddress.city': { path: 'shippingAddress.city', format: 'text' },
    'shippingAddress.state': { path: 'shippingAddress.state', format: 'text' },
    'shippingAddress.country': { path: 'shippingAddress.country', format: 'text' },
    'shippingAddress.zip': { path: 'shippingAddress.zip', format: 'text' },
    'shippingAddress.postcode': { path: 'shippingAddress.postcode', format: 'text' },
    'billingAddress.full': { path: 'billingAddress.full', format: 'text' },
    'billingAddress.line1': { path: 'billingAddress.line1', format: 'text' },
    'billingAddress.line2': { path: 'billingAddress.line2', format: 'text' },
    'billingAddress.city': { path: 'billingAddress.city', format: 'text' },
    'billingAddress.state': { path: 'billingAddress.state', format: 'text' },
    'billingAddress.country': { path: 'billingAddress.country', format: 'text' },
    'billingAddress.zip': { path: 'billingAddress.zip', format: 'text' },
    'billingAddress.postcode': { path: 'billingAddress.postcode', format: 'text' },
    
    // Calculated boolean flags
    hasItems: '_calculated.hasItems',
    isEmpty: '_calculated.isEmpty',
    hasShipping: '_calculated.hasShipping',
    hasTax: '_calculated.hasTax',
    hasDiscounts: '_calculated.hasDiscounts',
    hasUpsells: '_calculated.hasUpsells',
    
    // Line items properties
    'lines.count': '_calculated.lines.count',
    'lines.totalQuantity': '_calculated.lines.totalQuantity',
    'lines.upsellCount': '_calculated.lines.upsellCount',
    'lines.mainProduct': '_calculated.lines.mainProduct',
    'lines.mainProductSku': '_calculated.lines.mainProductSku',
    
    // Formatted values
    'total.formatted': '_formatted.total',
    'createdAt.formatted': '_formatted.createdAt',
  }
};

// =====================
// PROPERTY MAPPING UTILITIES
// =====================

/**
 * Get property configuration for a given object type and property name
 * This is the single source of truth for property mappings
 */
export function getPropertyConfig(
  objectType: keyof typeof PROPERTY_MAPPINGS,
  propertyName: string
): PropertyConfig | null {
  const mappings = PROPERTY_MAPPINGS[objectType];
  if (!mappings) return null;
  
  const mapping = mappings[propertyName];
  if (!mapping || typeof mapping === 'boolean') return null;
  
  // Normalize to PropertyConfig
  if (typeof mapping === 'string') {
    return { path: mapping };
  }
  
  return mapping;
}

/**
 * Get property mapping path (for backward compatibility)
 */
export function getPropertyMapping(
  objectType: keyof typeof PROPERTY_MAPPINGS,
  propertyName: string
): string | undefined {
  const config = getPropertyConfig(objectType, propertyName);
  return config?.path;
}

/**
 * Check if a property name is a raw value accessor
 */
export function isRawValueProperty(propertyName: string): boolean {
  return propertyName.endsWith('.raw');
}

/**
 * Check if a property name is a formatted value accessor
 */
export function isFormattedValueProperty(propertyName: string): boolean {
  return propertyName.endsWith('.formatted');
}

/**
 * Get base property name without .raw or .formatted suffix
 */
export function getBasePropertyName(propertyName: string): string {
  return propertyName.replace(/\.(raw|formatted)$/, '');
}

/**
 * Check if expression evaluation is enabled for an object type
 */
export function supportsExpressions(objectType: keyof typeof PROPERTY_MAPPINGS): boolean {
  const mappings = PROPERTY_MAPPINGS[objectType];
  return Boolean(mappings && '_expression' in mappings && mappings._expression === true);
}

// =====================
// FORMAT REGISTRY
// =====================

