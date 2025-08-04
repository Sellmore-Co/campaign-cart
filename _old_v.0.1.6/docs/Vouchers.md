# Voucher System Documentation

This document explains how to use the enhanced voucher/discount system in Campaign Cart.

## Overview

The voucher system allows you to apply different types of discounts to the cart:

- **Percentage discounts**: Apply a percentage off the applicable subtotal (either entire cart or specific items).
- **Fixed amount discounts**: Apply a fixed dollar amount off the applicable subtotal.
- **Free shipping**: Eliminate shipping costs.

Discounts can be general (applying to the entire cart subtotal) or specific to certain product IDs.

## Using Vouchers in JavaScript

### Applying a Voucher

The basic syntax for applying a voucher is:

```javascript
client.cart.applyCoupon(code, discountType, discountValue, applicableProductIds?);
```

Where:
- `code` is the voucher code (string).
- `discountType` is one of: `'percentage'`, `'fixed'`, or `'free_shipping'`.
- `discountValue` is the discount amount (number).
- `applicableProductIds` (optional) is an array of strings representing the `package_id`s (or `id`s) of products this coupon should exclusively apply to. E.g., `["4", "prod_B"]`.

When `applicableProductIds` is provided, the `StateManager` stores these IDs within the `couponDetails` object. The `DiscountManager` then uses this information to calculate the discount only on the subtotal of the items in the cart that match these IDs.

> **Note on API Compatibility**: While the cart system handles these different voucher types locally (including product-specificity for calculation), when sending to the API, the `vouchers` array in the cart payload typically includes the coupon code and its properties. The API service must be configured to recognize these voucher codes and correctly apply discounts, potentially respecting product restrictions if your backend supports them.

### Examples

#### Applying a General Percentage Discount

```javascript
// Apply a 10% discount to the entire cart with code "10PERCENTOFF"
client.cart.applyCoupon('10PERCENTOFF', 'percentage', 10);
```

#### Applying a Product-Specific Percentage Discount

```javascript
// Apply a 25% discount with code "SAVEONPRODUCT4" only to items with package_id "4"
client.cart.applyCoupon('SAVEONPRODUCT4', 'percentage', 25, ["4"]);
```

#### Applying a General Fixed Amount Discount

```javascript
// Apply a $5 discount to the entire cart with code "5DOLLARSOFF"
client.cart.applyCoupon('5DOLLARSOFF', 'fixed', 5);
```

#### Applying a Product-Specific Fixed Amount Discount

```javascript
// Apply a $10 discount with code "TENOFFSPECIAL" only to items with package_id "special_item_123"
client.cart.applyCoupon('TENOFFSPECIAL', 'fixed', 10, ["special_item_123"]);
```

#### Applying a Free Shipping Voucher

```javascript
// Apply free shipping with code "FREESHIP"
client.cart.applyCoupon('FREESHIP', 'free_shipping', 0);
```

### Removing a Voucher

To remove a voucher from the cart:

```javascript
client.cart.removeCoupon();
```

## Checking Voucher Status

You can check the current voucher status by accessing the cart state:

```javascript
// Get the current cart state
const cart = client.state.getState('cart');

// Check if a coupon is applied
if (cart.couponDetails) {
  console.log('Applied coupon:', cart.couponDetails.code);
  console.log('Discount type:', cart.couponDetails.type);
  console.log('Discount value:', cart.couponDetails.value);
  console.log('Discount amount (total for cart):', cart.totals.discount);
  if (cart.couponDetails.applicable_product_ids && cart.couponDetails.applicable_product_ids.length > 0) {
    console.log('Coupon applies to specific products:', cart.couponDetails.applicable_product_ids.join(', '));
  }
  
  // To see per-item discount (if calculated and stored by StateManager):
  cart.items.forEach(item => {
    if (item.applied_coupon_discount_amount && parseFloat(item.applied_coupon_discount_amount) > 0) {
      console.log(`Item "${item.name}" (ID: ${item.package_id}) has an applied discount of: ${item.applied_coupon_discount_amount}`);
    }
  });
}
```

## Integrating with Checkout

The voucher information is automatically included when proceeding to checkout. The discount is displayed in the cart summary.

When creating an order via the API, the `vouchers` array in the payload sent by `getCartForApi()` (from `StateManager.js`) will include the coupon code, type, and value, which can help the backend validate and apply the discount correctly, including any product restrictions if the backend logic supports them.

Example `vouchers` array in API payload:
```javascript
"vouchers": [
  {
    "code": "SAVEONPRODUCT4",
    "type": "percentage",
    "value": 25
    // Backend would need to know/check applicable_product_ids based on its own data for SAVEONPRODUCT4
  }
]
```

## Displaying Voucher Information

You can use the following data attributes to display voucher information in your HTML:

```html
<!-- Original subtotal before discount -->
<div data-os-cart-original-subtotal></div>

<!-- Discount amount -->
<div data-os-cart-discount></div>

<!-- Discount as coupon savings -->
<div data-os-cart-coupon-savings></div>

<!-- Container for coupon display (will be hidden when no coupon is applied) -->
<div data-os-cart-coupon-container>
  <span>Coupon applied: </span>
  <span data-os-cart-coupon></span>
</div>
```
For displaying coupon-adjusted prices on individual line items, see the `CartDisplay.md` documentation regarding the `data-os-show-item-discount` attribute.

## Showing Compare Prices

When a coupon is applied, you can display the original (pre-discount) price with a strikethrough using:

```html
<p data-os-cart-summary="compare-total" data-style="diagonal-line" class="diagonal-strike hide">$0.00</p>
<p data-os-cart-summary="grand-total">$0.00</p>
```

The system will automatically:
1. Show built-in retail discounts when products have them.
2. Show the original subtotal (`original_subtotal` from cart totals) in the `compare-total` element if a coupon is applied (`totals.discount > 0`).
3. Select the higher price for comparison if both retail and coupon-based original prices are relevant.

## Advanced Usage

### Custom Voucher Management

For more advanced voucher management, you can directly access the DiscountManager:

```javascript
// Get the discount manager
const discountManager = client.discount;

// Get display text for a coupon
const displayText = discountManager.getCouponDisplayText({
  code: 'SUMMER2023',
  type: 'percentage',
  value: 20
}); // Returns "SUMMER2023 (20% off)"
```

## Example Implementation

A complete example with HTML and JavaScript is available in the `js/voucher-example.html` and `js/voucher-example.js` files. 