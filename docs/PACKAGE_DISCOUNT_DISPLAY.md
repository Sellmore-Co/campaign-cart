# Package Discount Display Attributes

This document explains how to display package/product prices with cart discounts applied.

## Overview

When displaying package prices, you often need to show:
1. **Original Price** - The standard package price
2. **Retail Price** - The compare-at price (if higher than original)
3. **Discounted Price** - The price after applying cart discount codes
4. **Final Price** - The actual price customer will pay (including all discounts)

## Display Contexts

These discount attributes work in three different contexts:

### 1. Package Context
When inside an element with `data-next-package-id`:
```html
<div data-next-package-id="123">
  <span data-next-display="package.finalPrice">$24.99</span>
</div>
```

### 2. Specific Package ID
Using package ID in the display path:
```html
<span data-next-display="package.123.finalPrice">$24.99</span>
```

### 3. Selection Context
For package selectors (shows selected package with discounts):
```html
<span data-next-display="selection.main-selector.finalPrice">$24.99</span>
```

## Available Discount Attributes

### Basic Package Prices (No Discounts)
```html
<!-- Standard package prices -->
<span data-next-display="package.price">$29.99</span>
<span data-next-display="package.price_total">$89.97</span>
<span data-next-display="package.price_retail">$39.99</span>
<span data-next-display="package.price_retail_total">$119.97</span>
```

### Discount-Adjusted Prices
These attributes calculate prices with any applicable cart discounts:

```html
<!-- Unit price after discounts -->
<span data-next-display="package.discountedPrice">$24.99</span>

<!-- Total package price after discounts -->
<span data-next-display="package.discountedPriceTotal">$74.97</span>

<!-- Amount saved from discount codes -->
<span data-next-display="package.discountAmount">$15.00</span>

<!-- Check if package has any discounts -->
<div data-next-show="package.hasDiscount">
  Special Discount Applied!
</div>

<!-- Final prices (aliases for discounted prices) -->
<span data-next-display="package.finalPrice">$24.99</span>
<span data-next-display="package.finalPriceTotal">$74.97</span>
```

## Usage Examples

### Product Card with Discount
```html
<div class="product-card" data-next-package-id="123">
  <h3 data-next-display="package.name">Product Name</h3>
  
  <!-- Price display with discount -->
  <div class="pricing">
    <!-- Original price (struck through if discounted) -->
    <span class="original-price" data-next-show="package.hasDiscount">
      <s data-next-display="package.price_total">$89.97</s>
    </span>
    
    <!-- Final price after discounts -->
    <span class="final-price" data-next-display="package.finalPriceTotal">$74.97</span>
    
    <!-- Discount badge -->
    <span class="discount-badge" data-next-show="package.hasDiscount">
      Save <span data-next-display="package.discountAmount">$15.00</span>!
    </span>
  </div>
</div>
```

### Detailed Price Breakdown
```html
<div class="price-breakdown" data-next-package-id="456">
  <table>
    <tr>
      <td>Regular Price:</td>
      <td data-next-display="package.price_retail_total">$119.97</td>
    </tr>
    <tr data-next-show="package.hasSavings">
      <td>Sale Price:</td>
      <td data-next-display="package.price_total">$89.97</td>
    </tr>
    <tr data-next-show="package.hasDiscount">
      <td>Discount:</td>
      <td>-<span data-next-display="package.discountAmount">$15.00</span></td>
    </tr>
    <tr class="total">
      <td><strong>You Pay:</strong></td>
      <td><strong data-next-display="package.finalPriceTotal">$74.97</strong></td>
    </tr>
  </table>
</div>
```

### Dynamic Pricing Display
```html
<div class="product-pricing" data-next-package-id="789">
  <!-- Show different price displays based on discount state -->
  
  <!-- No discounts -->
  <div data-next-hide="package.hasDiscount">
    <span class="price" data-next-display="package.price_total">$89.97</span>
  </div>
  
  <!-- Has discounts -->
  <div data-next-show="package.hasDiscount">
    <span class="was-price">Was: <s data-next-display="package.price_total">$89.97</s></span>
    <span class="now-price">Now: <span data-next-display="package.finalPriceTotal">$74.97</span></span>
    <span class="savings">You Save: <span data-next-display="package.discountAmount">$15.00</span></span>
  </div>
</div>
```

### Combined Savings Display
Show both retail savings AND discount code savings:

```html
<div class="all-savings" data-next-package-id="321">
  <!-- Retail savings -->
  <div data-next-show="package.hasSavings">
    <span>Retail Savings: <span data-next-display="package.savingsAmount">$30.00</span></span>
  </div>
  
  <!-- Discount code savings -->
  <div data-next-show="package.hasDiscount">
    <span>Discount Code: <span data-next-display="package.discountAmount">$15.00</span></span>
  </div>
  
  <!-- Total combined savings -->
  <div data-next-show="package.hasSavings || package.hasDiscount">
    <strong>Total Savings: $<span data-calc="package.savingsAmount + package.discountAmount">45.00</span></strong>
  </div>
</div>
```

## How It Works

1. **Package Context**: The enhancer needs to know which package to calculate discounts for. This is determined by:
   - `data-next-package-id` attribute on the element or parent
   - Package ID in the display path (e.g., `package.123.discountedPrice`)

2. **Discount Calculation**: The system checks all applied cart discounts and calculates:
   - Package-specific discounts (coupons that only apply to certain packages)
   - Order-level discounts (distributed proportionally across all packages)

3. **Real-time Updates**: Prices update automatically when:
   - Discount codes are added or removed
   - Cart contents change
   - Package quantities are modified

## Conditional Display Based on Discounts

```html
<!-- Show special messaging for discounted items -->
<div data-next-package-id="555">
  <p data-next-show="package.hasDiscount && package.discountAmount > 20">
    🔥 HOT DEAL! Over $20 off with current discounts!
  </p>
  
  <p data-next-show="package.hasDiscount && !package.hasSavings">
    Exclusive discount code savings on this item!
  </p>
  
  <p data-next-show="package.hasSavings && package.hasDiscount">
    Double savings! Sale price PLUS discount code!
  </p>
</div>
```

## Selection Context Examples

The discount attributes also work with package selectors:

```html
<!-- Basic selection discount display -->
<div class="selected-package-info">
  <h4>Selected Package:</h4>
  <p data-next-display="selection.packages-selector.name">Package Name</p>
  
  <!-- Original vs discounted price -->
  <div class="price-comparison">
    <span>Regular: <span data-next-display="selection.packages-selector.price">$29.99</span></span>
    <span data-next-show="selection.packages-selector.hasDiscount">
      → Now: <span data-next-display="selection.packages-selector.finalPrice">$24.99</span>
    </span>
  </div>
  
  <!-- Discount amount for selected package -->
  <div data-next-show="selection.packages-selector.hasDiscount">
    <span class="discount">
      Save <span data-next-display="selection.packages-selector.appliedDiscountAmount">$5.00</span> 
      with discount code!
    </span>
  </div>
</div>

<!-- Multiple selectors with different IDs -->
<div>
  <span data-next-display="selection.addon-selector.finalPrice">$9.99</span>
  <span data-next-display="selection.warranty-selector.finalPrice">$14.99</span>
</div>
```

## Notes

- Discount calculations are performed in real-time based on current cart state
- Package-specific discounts take precedence over order-level discounts
- Fixed-amount order discounts are distributed proportionally based on package value
- All prices respect the original price formatting (currency symbol, decimals)
- The `finalPrice` and `discountedPrice` are synonyms - use whichever reads better in your context
- Selection context requires cart store subscription for discount properties (automatically handled)