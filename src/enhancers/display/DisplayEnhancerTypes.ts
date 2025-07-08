/**
 * Display Enhancer Types and Constants
 * Consolidated type definitions and constants for all display enhancers
 */

// =====================
// TYPE DEFINITIONS
// =====================

export type FormatType = 'currency' | 'number' | 'boolean' | 'date' | 'percentage' | 'auto';

export interface DisplayProperty {
  path: string;
  property: string;
  format?: FormatType;
  hideIfZero?: boolean;
  hideIfFalse?: boolean;
  divideBy?: number;
  multiplyBy?: number;
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

export const PROPERTY_MAPPINGS = {
  // Cart properties
  cart: {
    // Booleans
    isEmpty: 'isEmpty',
    hasItems: '!isEmpty', // Negation
    hasSavings: 'totals.hasSavings',
    
    // Quantities (number of packages in cart)
    quantity: 'totalQuantity',
    itemCount: 'items.length',
    count: 'totals.count',
    
    // Prices (enhanced names - formatted by default)
    subtotal: 'totals.subtotal.formatted',
    total: 'totals.total.formatted',
    shipping: 'totals.shipping.formatted',
    tax: 'totals.tax.formatted',
    discounts: 'totals.discounts.formatted',
    savingsAmount: 'totals.savings.formatted',
    savingsPercentage: 'totals.savingsPercentage.formatted',
    compareTotal: 'totals.compareTotal.formatted',
    
    // Raw values (numeric)
    'subtotal.raw': 'totals.subtotal.value',
    'total.raw': 'totals.total.value',
    'shipping.raw': 'totals.shipping.value',
    'tax.raw': 'totals.tax.value',
    'discounts.raw': 'totals.discounts.value',
    'savingsAmount.raw': 'totals.savings.value',
    'savingsPercentage.raw': 'totals.savingsPercentage.value',
    'compareTotal.raw': 'totals.compareTotal.value'
  },
  
  // Package properties
  package: {
    // API properties (keep snake_case - direct from API)
    ref_id: 'ref_id',
    external_id: 'external_id',
    qty: 'qty', // Number of units in this package
    price: 'price', // Per-unit price
    price_total: 'price_total', // Total for all units in package
    price_retail: 'price_retail', // Per-unit retail price
    price_retail_total: 'price_retail_total', // Total retail for all units
    price_recurring: 'price_recurring',
    is_recurring: 'is_recurring',
    interval: 'interval',
    interval_count: 'interval_count',
    
    // Enhanced properties (camelCase - calculated)
    unitPrice: 'price', // Alias for clarity
    unitRetailPrice: 'price_retail', // Alias for clarity
    packageTotal: 'price_total', // Alias for clarity
    comparePrice: 'price_retail_total', // Total compare price
    compareTotal: 'price_retail_total', // Alias for comparePrice (consistency with cart/selection)
    savingsAmount: '_calculated.savingsAmount', // Total savings
    savingsPercentage: '_calculated.savingsPercentage',
    hasSavings: '_calculated.hasSavings',
    isRecurring: 'is_recurring', // Maps to API property
    isBundle: '_calculated.isBundle', // True if qty > 1
    unitsInPackage: 'qty', // Alias for clarity
  },
  
  // Selection properties (for package selectors)
  selection: {
    // Current selection
    packageId: 'selectedItem.packageId',
    quantity: 'selectedItem.quantity',
    name: 'selectedItem.name',
    
    // Calculated values
    total: '_calculated.total',
    compareTotal: '_calculated.compareTotal',
    savingsAmount: '_calculated.savingsAmount',
    savingsPercentage: '_calculated.savingsPercentage',
    unitPrice: '_calculated.unitPrice',
    
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
    // API properties (keep snake_case)
    ref_id: 'ref_id',
    created_at: 'created_at',
    total_incl_tax: 'total_incl_tax',
    order_status_url: 'order_status_url',
    is_test: 'is_test',
    supports_upsells: 'supports_upsells',
    payment_method: 'payment_method',
    
    // Enhanced properties (camelCase)
    refId: 'ref_id',
    createdAt: 'created_at',
    total: 'total_incl_tax',
    statusUrl: 'order_status_url',
    isTest: 'is_test',
    supportsUpsells: 'supports_upsells',
    paymentMethod: 'payment_method',
    
    // Formatted values
    'total.formatted': '_formatted.total',
    'createdAt.formatted': '_formatted.createdAt',
  }
};

// =====================
// PROPERTY MAPPING UTILITIES
// =====================

/**
 * Get property mapping for a given object type and property name
 */
export function getPropertyMapping(
  objectType: keyof typeof PROPERTY_MAPPINGS,
  propertyName: string
): string | undefined {
  const mappings = PROPERTY_MAPPINGS[objectType];
  if (!mappings) return undefined;
  
  return mappings[propertyName as keyof typeof mappings] as string | undefined;
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
  return mappings && '_expression' in mappings && mappings._expression === true;
}