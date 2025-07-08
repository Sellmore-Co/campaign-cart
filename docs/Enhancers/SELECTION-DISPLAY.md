# Selection Display Enhancer

The Selection Display Enhancer allows you to display calculated values based on the currently selected package in a selector, rather than showing cart totals. This is particularly useful when you have package selectors on your page and want to show the price of the selected item before it's added to the cart.

## Problem It Solves

When using package selectors with buttons that show prices, displaying cart totals can be misleading:
- If the cart has other items, the total shown will be incorrect
- The price should reflect only what the user is about to add
- Multiple selectors on a page need independent price displays

## Basic Usage

Replace cart display attributes with selection display attributes:

```html
<!-- Instead of: -->
<div data-next-display="cart.subtotal">$19.99</div>

<!-- Use: -->
<div data-next-display="selection.total">$19.99</div>
```

## Three Ways to Specify Selector ID

### 1. Embedded Selector ID (Recommended for External Elements)

When display elements are outside the selector's DOM hierarchy, embed the selector ID directly in the display path:

```html
<!-- Display elements anywhere on page -->
<div data-next-display="selection.drone-packages.total">$19.99</div>
<div data-next-display="selection.drone-packages.compareTotal">$39.99</div>

<!-- For a different selector on the same page -->
<div data-next-display="selection.color-selector.name">Red</div>
<div data-next-display="selection.color-selector.price">$5.00</div>
```

### 2. Explicit Attribute

Use the `data-next-selector-id` attribute to specify which selector to use:

```html
<div data-next-display="selection.total" data-next-selector-id="drone-packages">$19.99</div>
<div data-next-display="selection.savings" data-next-selector-id="drone-packages">Save $20</div>
```

### 3. Automatic Context Detection

When display elements are inside the selector container, the selector ID is detected automatically:

```html
<div data-next-selector-id="drone-packages">
  <!-- selector cards... -->
  
  <!-- No selector ID needed - inherited from parent -->
  <div data-next-display="selection.total">$19.99</div>
  <div data-next-display="selection.compareTotal">$39.99</div>
</div>
```

## Available Properties

### Pricing Properties
- `total` or `price_total` - Total price of selected package
- `compareTotal` or `price_retail_total` - Retail/compare price total
- `price` - Unit price of selected item
- `savings` - Savings amount (compareTotal - total)
- `savingsPercentage` - Savings as percentage
- `unitPrice` or `pricePerUnit` - Price per individual unit
- `savingsPerUnit` - Savings per individual unit
- `discountAmount` - Discount amount (same as savings)

### Calculated Time-Based Pricing
- `monthlyPrice` - Monthly price (for subscriptions or spread cost)
- `yearlyPrice` - Yearly price calculation
- `pricePerDay` - Daily cost (yearlyPrice / 365)

### Information Properties
- `name` - Name of selected package
- `quantity` - Quantity of selected package
- `packageId` - ID of selected package
- `totalUnits` or `totalQuantity` - Total number of units

### Boolean Properties (for conditional display)
- `hasSelection` - True if an item is selected
- `hasSavings` - True if there are savings (compareTotal > total)
- `isBundle` or `isMultiPack` - True if quantity > 1
- `isSingleUnit` - True if quantity = 1

### Custom Calculated Fields
You can create mathematical expressions using basic operators:
- `total*0.1` - 10% of total (e.g., for showing tax estimate)
- `price+5` - Price plus shipping
- `total/3` - Price split 3 ways
- `savings*2` - Double savings promotion

## Complete Example

### HTML Structure

```html
<!-- Package Selector -->
<div data-next-selector-id="drone-packages" data-next-cart-selector="" data-next-selection-mode="swap">
  <div class="package-cards">
    <!-- 3x Package -->
    <div data-next-selector-card="" data-next-package-id="4" data-next-quantity="1">
      <div class="card-title">3x Drone Bundle</div>
      <div class="price">$15.99/ea</div>
      <div class="total">Total: $47.97</div>
    </div>
    
    <!-- 2x Package -->
    <div data-next-selector-card="" data-next-package-id="3" data-next-quantity="1">
      <div class="card-title">2x Drone Bundle</div>
      <div class="price">$17.99/ea</div>
      <div class="total">Total: $35.98</div>
    </div>
    
    <!-- 1x Package -->
    <div data-next-selector-card="" data-next-package-id="2" data-next-quantity="1" data-next-selected="true">
      <div class="card-title">1x Drone</div>
      <div class="price">$19.99/ea</div>
      <div class="total">Total: $19.99</div>
    </div>
  </div>
  
  <!-- Button with selection-based pricing -->
  <button class="add-to-cart-btn">
    <span>Add to Cart</span>
    <div class="price-bubble">
      <div data-next-display="selection.compareTotal" class="compare-price">$39.99</div>
      <div data-next-display="selection.total" class="sale-price">$19.99</div>
    </div>
  </button>
</div>

<!-- External summary showing current selection -->
<div class="selection-summary">
  <h3>Currently Selected:</h3>
  <p>Package: <span data-next-display="selection.drone-packages.name">1x Drone</span></p>
  <p>You Save: <span data-next-display="selection.drone-packages.savings">$20.00</span> 
     (<span data-next-display="selection.drone-packages.savingsPercentage">50%</span>)</p>
</div>
```

## Multiple Selectors Example

When you have multiple selectors on a page, use embedded selector IDs to keep displays independent:

```html
<!-- Product Selector -->
<div data-next-selector-id="product-selector" data-next-cart-selector="">
  <!-- selector cards for different products -->
</div>

<!-- Color Selector -->
<div data-next-selector-id="color-selector" data-next-cart-selector="">
  <!-- selector cards for colors -->
</div>

<!-- Size Selector -->
<div data-next-selector-id="size-selector" data-next-cart-selector="">
  <!-- selector cards for sizes -->
</div>

<!-- Order Summary showing all selections -->
<div class="order-summary">
  <h3>Your Configuration:</h3>
  <dl>
    <dt>Product:</dt>
    <dd data-next-display="selection.product-selector.name">Premium Drone</dd>
    
    <dt>Color:</dt>
    <dd data-next-display="selection.color-selector.name">Midnight Black</dd>
    
    <dt>Size:</dt>
    <dd data-next-display="selection.size-selector.name">Large</dd>
    
    <dt>Total Price:</dt>
    <dd data-next-display="selection.product-selector.total">$299.99</dd>
  </dl>
</div>
```

## Formatting Options

Selection displays support all standard formatting attributes:

```html
<!-- Hide if no savings -->
<div data-next-display="selection.savings" data-hide-if-zero="true">
  Save $<span></span>
</div>

<!-- Custom number formatting -->
<div data-next-display="selection.quantity" data-format="number">1</div>

<!-- Math operations -->
<div data-next-display="selection.price" data-multiply-by="12">$239.88</div>
```

## Integration with Buttons

The Selection Display Enhancer works seamlessly with action buttons:

```html
<a data-action="add-to-cart" data-next-selector-id="drone-packages" class="button">
  <span>Add to Cart</span>
  <!-- These prices update based on selection -->
  <span data-next-display="selection.total" class="btn-price">$19.99</span>
</a>
```

## Events and Reactivity

The enhancer automatically updates when:
- User clicks a different selector card
- Selection is changed programmatically
- Cart state changes (in swap mode)

## Technical Notes

### Selector Detection Priority

1. Embedded ID in display path (highest priority)
2. Explicit `data-next-selector-id` attribute
3. Context-based detection from parent elements

### Performance

- Display updates are debounced to prevent excessive re-renders
- Only affected displays are updated when selection changes
- Cached package data minimizes store lookups

### Debugging

Enable debug logging to see selection events:

```javascript
// In browser console
localStorage.setItem('next-debug', 'true');
```

## Calculated Fields Examples

### Example 1: Showing Unit Pricing
```html
<div class="pricing-breakdown">
  <p>Total: <span data-next-display="selection.products.total">$47.97</span></p>
  <p>Price per unit: <span data-next-display="selection.products.unitPrice">$15.99</span></p>
  <p>You save <span data-next-display="selection.products.savingsPerUnit">$8.00</span> per unit!</p>
</div>
```

### Example 2: Payment Plan Display
```html
<div class="payment-options">
  <p>Pay now: <span data-next-display="selection.course.total">$299</span></p>
  <p>Or just <span data-next-display="selection.course.monthlyPrice">$24.92</span>/month for 12 months</p>
  <p>That's only <span data-next-display="selection.course.pricePerDay">$0.82</span> per day!</p>
</div>
```

### Example 3: Custom Calculations
```html
<!-- Show 10% tax estimate -->
<p>Estimated tax: <span data-next-display="selection.items.total*0.1">$4.80</span></p>

<!-- Show price split 4 ways -->
<p>Split 4 ways: <span data-next-display="selection.items.total/4">$12.00</span> each</p>

<!-- Show price with shipping -->
<p>Total with shipping: <span data-next-display="selection.items.total+9.99">$57.96</span></p>
```

### Example 4: Conditional Bundle Messages
```html
<!-- Show only for multi-packs -->
<div data-next-show="selection.products.isBundle">
  <p class="bundle-message">
    Great choice! This <span data-next-display="selection.products.totalUnits">3</span>-pack 
    saves you <span data-next-display="selection.products.savings">$24.00</span>!
  </p>
</div>

<!-- Show only for single items -->
<div data-next-show="selection.products.isSingleUnit">
  <p class="single-message">
    Tip: Save more with our multi-packs!
  </p>
</div>
```

## Conditional Display Integration

The Selection Display Enhancer works seamlessly with the Conditional Display Enhancer (`data-next-show` / `data-next-hide`):

### Show/Hide Based on Selection Properties
```html
<!-- Show message when selection has savings -->
<div data-next-show="selection.drone-packages.hasSavings">
  <p class="savings-alert">🎉 You're saving <span data-next-display="selection.drone-packages.savingsPercentage">50%</span>!</p>
</div>

<!-- Show shipping notice for bundles -->
<div data-next-show="selection.products.isBundle">
  <p class="shipping-notice">✓ Free shipping included on multi-packs!</p>
</div>

<!-- Hide element when no selection -->
<div data-next-hide="selection.products.hasSelection">
  <p>Please select a package to continue</p>
</div>
```

### Comparison Conditions
```html
<!-- Show when savings exceed $20 -->
<div data-next-show="selection.products.savings > 20">
  <p class="big-savings">Huge savings alert! 🎉</p>
</div>

<!-- Show bulk discount for 3+ items -->
<div data-next-show="selection.products.totalUnits >= 3">
  <p>Bulk discount applied!</p>
</div>

<!-- Show financing option for expensive items -->
<div data-next-show="selection.products.total > 500">
  <p>💳 Financing available for this purchase</p>
</div>
```

### Multiple Selector Conditions
```html
<!-- Reference different selectors -->
<div data-next-show="selection.size-selector.hasSelection">
  <p>Size selected: <span data-next-display="selection.size-selector.name">Large</span></p>
</div>

<div data-next-show="selection.color-selector.hasSelection">
  <p>Color selected: <span data-next-display="selection.color-selector.name">Blue</span></p>
</div>
```

## Common Use Cases

### 1. Package Selector with Tiered Pricing
Show different prices based on quantity selection with per-unit breakdowns

### 2. Product Configurator
Display running total as user selects options with live calculations

### 3. Subscription Plans
Show monthly vs annual pricing based on selection with daily cost breakdowns

### 4. Bundle Builder
Update bundle price as items are selected/deselected with savings calculations

### 5. Payment Plans
Show installment options with calculated monthly payments

### 6. Group Purchases
Display per-person costs when splitting orders

## Migration Guide

To migrate from cart-based displays to selection-based displays:

1. Identify displays that should show selection-specific values
2. Change `data-next-display="cart.*"` to `data-next-display="selection.*"`
3. Add selector ID using one of the three methods above
4. Test with multiple items in cart to ensure correct behavior

## Troubleshooting

### Display shows "--" or empty
- Ensure selector has `data-next-selector-id` attribute
- Verify at least one card is selected
- Check that package data is loaded

### Wrong selector referenced
- Use embedded ID format for clarity: `selection.{selector-id}.{property}`
- Avoid relying on context detection for external elements

### Price doesn't update
- Confirm selector is in "swap" or "select" mode
- Check browser console for selection events
- Verify enhancer initialization in debug logs