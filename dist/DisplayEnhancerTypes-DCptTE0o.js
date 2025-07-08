const PROPERTY_MAPPINGS = {
  // Cart properties
  cart: {
    // Booleans
    isEmpty: "isEmpty",
    hasItems: "!isEmpty",
    // Negation
    hasSavings: "totals.hasSavings",
    // Quantities (number of packages in cart)
    quantity: "totalQuantity",
    itemCount: "items.length",
    count: "totals.count",
    // Prices (enhanced names - formatted by default)
    subtotal: "totals.subtotal.formatted",
    total: "totals.total.formatted",
    shipping: "totals.shipping.formatted",
    tax: "totals.tax.formatted",
    discounts: "totals.discounts.formatted",
    savingsAmount: "totals.savings.formatted",
    savingsPercentage: "totals.savingsPercentage.formatted",
    compareTotal: "totals.compareTotal.formatted",
    // Raw values (numeric)
    "subtotal.raw": "totals.subtotal.value",
    "total.raw": "totals.total.value",
    "shipping.raw": "totals.shipping.value",
    "tax.raw": "totals.tax.value",
    "discounts.raw": "totals.discounts.value",
    "savingsAmount.raw": "totals.savings.value",
    "savingsPercentage.raw": "totals.savingsPercentage.value",
    "compareTotal.raw": "totals.compareTotal.value"
  },
  // Package properties
  package: {
    // API properties (keep snake_case - direct from API)
    ref_id: "ref_id",
    external_id: "external_id",
    qty: "qty",
    // Number of units in this package
    price: "price",
    // Per-unit price
    price_total: "price_total",
    // Total for all units in package
    price_retail: "price_retail",
    // Per-unit retail price
    price_retail_total: "price_retail_total",
    // Total retail for all units
    price_recurring: "price_recurring",
    is_recurring: "is_recurring",
    interval: "interval",
    interval_count: "interval_count",
    // Enhanced properties (camelCase - calculated)
    unitPrice: "price",
    // Alias for clarity
    unitRetailPrice: "price_retail",
    // Alias for clarity
    packageTotal: "price_total",
    // Alias for clarity
    comparePrice: "price_retail_total",
    // Total compare price
    compareTotal: "price_retail_total",
    // Alias for comparePrice (consistency with cart/selection)
    savingsAmount: "_calculated.savingsAmount",
    // Total savings
    savingsPercentage: "_calculated.savingsPercentage",
    hasSavings: "_calculated.hasSavings",
    isRecurring: "is_recurring",
    // Maps to API property
    isBundle: "_calculated.isBundle",
    // True if qty > 1
    unitsInPackage: "qty"
    // Alias for clarity
  },
  // Selection properties (for package selectors)
  selection: {
    // Current selection
    packageId: "selectedItem.packageId",
    quantity: "selectedItem.quantity",
    name: "selectedItem.name",
    // Calculated values
    total: "_calculated.total",
    compareTotal: "_calculated.compareTotal",
    savingsAmount: "_calculated.savingsAmount",
    savingsPercentage: "_calculated.savingsPercentage",
    unitPrice: "_calculated.unitPrice",
    // Mathematical expressions
    "_expression": true
    // Flag to enable expression evaluation
  },
  // Shipping properties (context-based)
  shipping: {
    // Properties available within data-next-shipping-id context
    isFree: "_calculated.isFree",
    cost: "_calculated.cost",
    price: "_calculated.price",
    // Alias for cost
    name: "_calculated.name",
    code: "_calculated.code",
    method: "_calculated.method",
    // Full method object
    id: "_calculated.id",
    refId: "_calculated.refId"
    // Alias for id
  },
  // Order properties
  order: {
    // API properties (keep snake_case)
    ref_id: "ref_id",
    created_at: "created_at",
    total_incl_tax: "total_incl_tax",
    order_status_url: "order_status_url",
    is_test: "is_test",
    supports_upsells: "supports_upsells",
    payment_method: "payment_method",
    // Enhanced properties (camelCase)
    refId: "ref_id",
    createdAt: "created_at",
    total: "total_incl_tax",
    statusUrl: "order_status_url",
    isTest: "is_test",
    supportsUpsells: "supports_upsells",
    paymentMethod: "payment_method",
    // Formatted values
    "total.formatted": "_formatted.total",
    "createdAt.formatted": "_formatted.createdAt"
  }
};
function getPropertyMapping(objectType, propertyName) {
  const mappings = PROPERTY_MAPPINGS[objectType];
  if (!mappings) return void 0;
  return mappings[propertyName];
}
export {
  getPropertyMapping as g
};
