# URL Parameters

The Next Commerce JS SDK supports several URL parameters that enable advanced functionality for testing, cart initialization, and order management.

## Force Package ID

The `forcePackageId` parameter allows you to pre-populate the cart with specific packages on page load. This is useful for:
- Direct marketing campaigns
- Testing specific cart configurations
- Creating quick-buy links
- Pre-filling carts from email campaigns

### Usage

```
https://yoursite.com/checkout?forcePackageId=1
```

### Format

#### Single Package
```
?forcePackageId=1
```
Adds package with ID 1 to the cart with quantity 1.

#### Single Package with Quantity
```
?forcePackageId=1:3
```
Adds package with ID 1 to the cart with quantity 3.

#### Multiple Packages
```
?forcePackageId=1:2,3:1,5:3
```
Adds:
- Package 1 with quantity 2
- Package 3 with quantity 1
- Package 5 with quantity 3

### Behavior

1. **Cart Clearing**: When `forcePackageId` is present, the existing cart is cleared before adding the specified packages
2. **Validation**: Invalid package IDs are skipped with a warning logged
3. **Campaign Loading**: Packages are added after campaign data is loaded to ensure validity
4. **One-time Effect**: The parameter is processed once during SDK initialization

### Examples

#### Direct Product Link
Send customers directly to checkout with a specific product:
```html
<a href="https://store.com/checkout?forcePackageId=15">
  Buy Now - Special Offer
</a>
```

#### Email Campaign with Multiple Items
Create a bundle link for email marketing:
```html
<a href="https://store.com/checkout?forcePackageId=1:1,2:1,3:1">
  Get the Complete Bundle
</a>
```

#### Testing Different Quantities
Test checkout flow with various quantities:
```
https://store.com/checkout?forcePackageId=1:10
```

## Order Reference ID

The `ref_id` parameter is used to load an existing order on upsell pages. This enables post-purchase upsell flows where customers can add additional items to their completed order.

### Usage

```
https://yoursite.com/upsell?ref_id=ABC123
```

### Behavior

1. **Auto-loading**: When `ref_id` is present, the SDK automatically loads the order details
2. **Upsell Support**: The order must support post-purchase upsells (`supports_post_purchase_upsells: true`)
3. **Order Expiry**: Orders expire after 30 minutes by default
4. **State Persistence**: Order state is maintained across upsell pages

### Use Cases

#### Post-Purchase Upsell Flow
After a successful checkout, redirect to an upsell page:
```javascript
// On checkout success
window.location.href = `/upsell/special-offer?ref_id=${orderRefId}`;
```

#### Multi-Step Upsell Journey
The SDK automatically preserves `ref_id` across navigation:
```html
<!-- Page 1: /upsell/offer1?ref_id=ABC123 -->
<button data-next-upsell-skip="/upsell/offer2">
  Skip to Next Offer
</button>

<!-- Automatically navigates to: /upsell/offer2?ref_id=ABC123 -->
```

#### Thank You Page
Display order details on the confirmation page:
```html
<!-- /thank-you?ref_id=ABC123 -->
<div data-next-display="order.number">Order #12345</div>
<div data-next-display="order.total">$99.99</div>
```

## Combining Parameters

You can combine multiple URL parameters:

```
https://yoursite.com/checkout?forcePackageId=1:2&debugger=true
```

This will:
1. Enable debug mode
2. Clear the cart and add package 1 with quantity 2

## Important Notes

### Security Considerations
- `forcePackageId` bypasses normal cart selection UI - ensure packages are valid
- `ref_id` should be unique and non-guessable for security
- These parameters are intended for legitimate business use cases

### Best Practices
1. **Validate Package IDs**: Ensure package IDs exist in your campaign before using in links
2. **Test Thoroughly**: Test forcePackageId links with various configurations
3. **Monitor Usage**: Track conversion rates for direct cart links
4. **Handle Errors**: Implement fallbacks if packages are unavailable

### Limitations
- `forcePackageId` only works during initial page load
- Orders loaded via `ref_id` must not be expired
- Package availability is still subject to campaign rules

## JavaScript API

You can also achieve similar functionality programmatically:

### Adding Items to Cart
```javascript
// Equivalent to ?forcePackageId=1:2
window.next.addItem(1, 2);

// Clear cart and add multiple items
window.next.clearCart();
window.next.addItem(1, 2);
window.next.addItem(3, 1);
```

### Loading Orders
```javascript
// Equivalent to ?ref_id=ABC123
window.next.loadOrder('ABC123');
```