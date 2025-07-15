# Cart Savings Display Attributes

This document describes the various savings-related display attributes available for showing cart discounts, retail savings, and total combined savings.

## Overview

The cart system tracks two types of savings:
1. **Retail Savings** - The difference between retail prices and sale prices
2. **Discount Savings** - Savings from applied coupon/discount codes

These can be displayed individually or combined for a total savings amount.

## Important: Display vs Conditional Attributes

### Display Attributes (`data-next-display`)
Use for showing values/content:
```html
<span data-next-display="cart.discountCode">SAVE20</span>
<span data-next-display="cart.totalSavingsAmount">$45.00</span>
```

### Conditional Attributes (`data-next-show` / `data-next-hide`)
Use for showing/hiding elements based on conditions:
```html
<!-- Shows element when condition is true -->
<div data-next-show="cart.hasCoupons">
  Discount applied!
</div>

<!-- Both work identically -->
<div data-next-show="cart.hasCoupon">
  Discount applied!
</div>

<!-- Hides element when condition is true -->
<div data-next-hide="cart.isEmpty">
  Your cart has items
</div>

<!-- Can use comparisons -->
<div data-next-show="cart.discounts > 0">
  You saved <span data-next-display="cart.discounts">$0.00</span> with discount codes!
</div>
```

### Testing Conditional Display
```html
<!-- Debug: Check if conditions are working -->
<div style="background: #f0f0f0; padding: 10px; margin: 10px 0;">
  <p>Debug Info:</p>
  <p>Has coupon (hasCoupon): <span data-next-show="cart.hasCoupon">YES</span><span data-next-hide="cart.hasCoupon">NO</span></p>
  <p>Has coupons (hasCoupons): <span data-next-show="cart.hasCoupons">YES</span><span data-next-hide="cart.hasCoupons">NO</span></p>
  <p>Coupon count: <span data-next-display="cart.couponCount">0</span></p>
  <p>Applied codes: <span data-next-display="cart.discountCodes">none</span></p>
</div>
```

## Available Display Attributes

### Individual Savings Components

#### Retail Savings (Price Comparison)
Shows the savings from retail vs sale prices:

```html
<!-- Formatted display -->
<span data-next-display="cart.savingsAmount">$0.00</span>

<!-- Percentage saved -->
<span data-next-display="cart.savingsPercentage">0%</span>

<!-- Raw numeric value (for calculations) -->
<span data-next-display="cart.savingsAmount.raw">0</span>

<!-- Boolean check -->
<div data-next-show="cart.hasSavings">
  You're saving on retail prices!
</div>
```

#### Discount Code Savings
Shows the savings from applied coupon/discount codes:

```html
<!-- Total discount amount -->
<span data-next-display="cart.discounts">$0.00</span>

<!-- Raw numeric value -->
<span data-next-display="cart.discounts.raw">0</span>

<!-- Display the discount code(s) -->
<span data-next-display="cart.discountCode">SAVE20</span>

<!-- Display multiple codes (comma-separated) -->
<span data-next-display="cart.discountCodes">SAVE20, FREESHIP</span>

<!-- Check if any coupons are applied -->
<div data-next-show="cart.hasCoupons">
  Discount code applied!
</div>

<!-- Alternative: singular form also works -->
<div data-next-show="cart.hasCoupon">
  Discount code applied!
</div>

<!-- Number of coupons applied -->
<span data-next-display="cart.couponCount">0</span>

<!-- Access individual coupons -->
<div data-next-display="cart.coupons[0].code">
  Code: <span data-next-display="cart.coupons[0].code"></span>
  saves <span data-next-display="cart.coupons[0].discount">$0.00</span>
</div>
```

### Combined Total Savings

#### Total Savings Amount
Shows the combined savings (retail + discounts):

```html
<!-- Formatted display -->
<span data-next-display="cart.totalSavingsAmount">$0.00</span>

<!-- Percentage of total savings -->
<span data-next-display="cart.totalSavingsPercentage">0%</span>

<!-- Raw numeric value -->
<span data-next-display="cart.totalSavingsAmount.raw">0</span>

<!-- Boolean check for any savings -->
<div data-next-show="cart.hasTotalSavings">
  Total savings section visible when there are any savings
</div>
```

## Usage Examples

### Basic Savings Display
```html
<div class="order-summary">
  <div class="order-totals">
    <div class="order-totals__row">
      <span>Subtotal:</span>
      <span data-next-display="cart.subtotal">$0.00</span>
    </div>
    
    <!-- Show retail savings if any -->
    <div class="order-totals__row" data-next-show="cart.hasSavings">
      <span>Retail Savings:</span>
      <span data-next-display="cart.savingsAmount">$0.00</span>
    </div>
    
    <!-- Show discount codes if any -->
    <div class="order-totals__row" data-next-show="cart.discounts > 0">
      <span>Discount:</span>
      <span data-next-display="cart.discounts">$0.00</span>
    </div>
    
    <div class="order-totals__row">
      <span>Total:</span>
      <span data-next-display="cart.total">$0.00</span>
    </div>
  </div>
</div>
```

### Combined Savings Summary
```html
<!-- Show total savings banner when customer has any savings -->
<div class="savings-banner" data-next-show="cart.hasTotalSavings">
  <h3>🎉 You're saving <span data-next-display="cart.totalSavingsAmount">$0.00</span>!</h3>
  <p>That's <span data-next-display="cart.totalSavingsPercentage">0%</span> off the regular price!</p>
</div>
```

### Detailed Savings Breakdown
```html
<div class="savings-breakdown" data-next-show="cart.hasTotalSavings">
  <h4>Your Savings:</h4>
  <ul>
    <li data-next-show="cart.hasSavings">
      Sale Price Savings: <span data-next-display="cart.savingsAmount">$0.00</span>
    </li>
    <li data-next-show="cart.discounts > 0">
      Coupon Discounts: <span data-next-display="cart.discounts">$0.00</span>
      <small>(Code: <span data-next-display="cart.discountCode"></span>)</small>
    </li>
  </ul>
  <div class="total-savings">
    <strong>Total Saved: <span data-next-display="cart.totalSavingsAmount">$0.00</span></strong>
  </div>
</div>
```

### Display Applied Discount Codes
```html
<!-- Simple display of applied code -->
<div class="applied-discount" data-next-show="cart.hasCoupons">
  <span class="discount-label">Discount Code:</span>
  <span class="discount-code" data-next-display="cart.discountCode">SAVE20</span>
  <span class="discount-amount">(-<span data-next-display="cart.discounts">$0.00</span>)</span>
</div>

<!-- Multiple discount codes -->
<div class="applied-discounts" data-next-show="cart.hasCoupons">
  <h5>Applied Discounts (<span data-next-display="cart.couponCount">0</span>):</h5>
  <div class="discount-list">
    <div data-next-show="cart.coupons[0].code">
      <span data-next-display="cart.coupons[0].code">CODE1</span>: 
      -<span data-next-display="cart.coupons[0].discount">$0.00</span>
    </div>
    <div data-next-show="cart.coupons[1].code">
      <span data-next-display="cart.coupons[1].code">CODE2</span>: 
      -<span data-next-display="cart.coupons[1].discount">$0.00</span>
    </div>
  </div>
  <div class="discount-total">
    Total: -<span data-next-display="cart.discounts">$0.00</span>
  </div>
</div>
```

### Conditional Messaging
```html
<!-- Different messages based on savings type -->
<div class="savings-message">
  <!-- Only retail savings (no discount codes) -->
  <p data-next-show="cart.hasSavings && cart.discounts == 0">
    You're getting our best prices - <span data-next-display="cart.savingsPercentage">0%</span> off retail!
  </p>
  
  <!-- Has discount codes -->
  <p data-next-show="cart.discounts > 0">
    Your discount codes are saving you <span data-next-display="cart.discounts">$0.00</span>!
  </p>
  
  <!-- Has both types of savings -->
  <p data-next-show="cart.hasTotalSavings">
    Total savings of <span data-next-display="cart.totalSavingsAmount">$0.00</span> 
    (<span data-next-display="cart.totalSavingsPercentage">0%</span> off)!
  </p>
</div>
```

## Comparison Pricing Display

To show original vs discounted pricing:

```html
<div class="price-comparison">
  <span class="original-price" data-next-display="cart.compareTotal">$0.00</span>
  <span class="sale-price" data-next-display="cart.total">$0.00</span>
  <span class="savings-badge" data-next-display="cart.totalSavingsPercentage">0% OFF</span>
</div>
```

## CSS Classes

The display enhancer automatically adds/removes CSS classes:
- `.display-visible` - Added when the condition is true or value exists
- `.display-hidden` - Added when the condition is false or value is zero/empty

## Notes

1. **Fallback Values**: All savings amounts default to `$0.00` if no savings exist
2. **Auto-calculation**: Total savings are automatically recalculated when cart changes
3. **Formatting**: All currency values are pre-formatted with proper currency symbols
4. **Performance**: Values update in real-time as cart contents change

## Discount Code Attributes Summary

- `cart.discountCode` - First applied discount code (e.g., "SAVE20")
- `cart.discountCodes` - All applied codes comma-separated (e.g., "SAVE20, FREESHIP")
- `cart.hasCoupons` / `cart.hasCoupon` - Boolean check if any coupons are applied (both work)
- `cart.couponCount` - Number of coupons applied
- `cart.coupons[0].code` - Access individual coupon codes by index
- `cart.coupons[0].discount` - Access individual coupon discount amounts

## Related Attributes

- `cart.subtotal` - Cart subtotal before discounts
- `cart.total` - Final cart total after all discounts
- `cart.compareTotal` - Original retail price total
- `cart.isEmpty` / `cart.hasItems` - Cart state checks