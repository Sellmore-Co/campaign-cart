# Voucher System Documentation

This document explains how to use the enhanced voucher/discount system in Campaign Cart.

## Overview

The voucher system allows you to apply different types of discounts to the cart:

- **Percentage discounts**: Apply a percentage off the cart subtotal
- **Fixed amount discounts**: Apply a fixed dollar amount off the cart subtotal
- **Free shipping**: Eliminate shipping costs

## Using Vouchers in JavaScript

### Applying a Voucher

The basic syntax for applying a voucher is:

```javascript
client.cart.applyCoupon(code, discountType, discountValue);
```

Where:
- `code` is the voucher code (string)
- `discountType` is one of: `'percentage'`, `'fixed'`, or `'free_shipping'`
- `discountValue` is the discount amount (number)

> **Note on API Compatibility**: While the cart system handles these different voucher types locally, when sending to the API, only the voucher code is transmitted. The API must be configured to recognize these codes and apply the appropriate discount type and value.

### Examples

#### Applying a Percentage Discount

```javascript
// Apply a 10% discount with code "10PERCENTOFF"
client.cart.applyCoupon('10PERCENTOFF', 'percentage', 10);
```

#### Applying a Fixed Amount Discount

```javascript
// Apply a $5 discount with code "5DOLLARSOFF"
client.cart.applyCoupon('5DOLLARSOFF', 'fixed', 5);
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
  console.log('Discount amount:', cart.totals.discount);
}
```

## Integrating with Checkout

The voucher information is automatically included when proceeding to checkout. The discount is displayed in the cart summary and the voucher code is passed to the API when creating an order.

When creating an order via the API, only the voucher code is sent in this format:

```javascript
"vouchers": ["5DOLLARSOFF"]  // Only the code is sent, not the type or value
```

The API service must be configured to recognize these voucher codes and apply the appropriate discount.

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

## Showing Compare Prices

When a coupon is applied, you can display the original (pre-discount) price with a strikethrough using:

```html
<p data-os-cart-summary="compare-total" data-style="diagonal-line" class="diagonal-strike hide">$0.00</p>
<p data-os-cart-summary="grand-total">$0.00</p>
```

The system will automatically:
1. Show built-in retail discounts when products have them
2. Show the original subtotal when a coupon is applied
3. Select the higher price when both are present

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