---
title: JavaScript API Reference
description: Complete reference for Campaign Cart's JavaScript API methods and properties
---

Complete reference for Campaign Cart's JavaScript API.

## Global Object

Campaign Cart is available globally as:
```javascript
window.twentyNineNext
```

## Initialization

### `init(config)`
Initialize Campaign Cart with configuration.

```javascript
window.twentyNineNext.init({
    apiKey: 'YOUR_API_KEY',
    campaignId: 'YOUR_CAMPAIGN_ID',
    defaultCountry: 'US'
});
```

## Cart Methods

### `addToCart(packageId, quantity, options)`
Add a package to the cart.

```javascript
// Simple add
window.twentyNineNext.addToCart(1);

// With quantity
window.twentyNineNext.addToCart(1, 2);

// With options
window.twentyNineNext.addToCart(1, 1, {
    upsell: true,
    frequency: 30
});
```

### `addToCartByRefId(refId, quantity, price, name)`
Add item by reference ID with custom details.

```javascript
window.twentyNineNext.addToCartByRefId('CUSTOM-001', 1, 29.99, 'Custom Product');
```

### `removeFromCart(packageId)`
Remove a package from the cart.

```javascript
window.twentyNineNext.removeFromCart(1);
```

### `updateQuantity(packageId, quantity)`
Update quantity for a cart item.

```javascript
window.twentyNineNext.updateQuantity(1, 3);
```

### `clearCart()`
Remove all items from the cart.

```javascript
window.twentyNineNext.clearCart();
```

### `getCart()`
Get current cart contents.

```javascript
const cart = window.twentyNineNext.getCart();
console.log(cart.items);
console.log(cart.total);
```

### `getCartCount()`
Get number of items in cart.

```javascript
const count = window.twentyNineNext.getCartCount();
```

### `getCartTotal()`
Get cart total amount.

```javascript
const total = window.twentyNineNext.getCartTotal();
```

## Product Profile Methods

These methods work with [Product Profiles](../guides/features/product-profiles.md) for semantic product management.

### `profiles.addToCart(profileId, quantity)`
Add a product profile to cart.

```javascript
window.twentyNineNext.profiles.addToCart('starter-kit');
window.twentyNineNext.profiles.addToCart('pro-bundle', 2);
```

### `profiles.getProfile(profileId)`
Get profile details.

```javascript
const profile = await window.twentyNineNext.profiles.getProfile('starter-kit');
console.log(profile.name, profile.price);
```

### `profiles.getAll()`
Get all available profiles.

```javascript
const profiles = await window.twentyNineNext.profiles.getAll();
```

## Checkout Methods

### `checkout()`
Initiate checkout process.

```javascript
window.twentyNineNext.checkout();
```

### `setCheckoutField(field, value)`
Pre-fill checkout fields.

```javascript
window.twentyNineNext.setCheckoutField('email', 'customer@example.com');
window.twentyNineNext.setCheckoutField('firstName', 'John');
window.twentyNineNext.setCheckoutField('lastName', 'Doe');
```

## Display Methods

### `updateDisplays()`
Manually update all display elements.

```javascript
window.twentyNineNext.updateDisplays();
```

### `formatCurrency(amount)`
Format amount as currency.

```javascript
const formatted = window.twentyNineNext.formatCurrency(29.99);
// Returns: "$29.99"
```

## Event Methods

### `on(eventName, callback)`
Subscribe to events.

```javascript
window.twentyNineNext.on('cart.updated', (data) => {
    console.log('Cart updated:', data);
});
```

### `off(eventName, callback)`
Unsubscribe from events.

```javascript
window.twentyNineNext.off('cart.updated', myCallback);
```

### `emit(eventName, data)`
Emit custom events.

```javascript
window.twentyNineNext.emit('custom.event', { foo: 'bar' });
```

## Configuration Methods

### `getConfig()`
Get current configuration.

```javascript
const config = window.twentyNineNext.getConfig();
```

### `setConfig(key, value)`
Update configuration.

```javascript
window.twentyNineNext.setConfig('debug', true);
window.twentyNineNext.setConfig('analytics.gtm', true);
```

## Utility Methods

### `isInitialized()`
Check if Campaign Cart is initialized.

```javascript
if (window.twentyNineNext.isInitialized()) {
    // Ready to use
}
```

### `ready(callback)`
Execute callback when ready.

```javascript
window.twentyNineNext.ready(() => {
    console.log('Campaign Cart is ready!');
});
```

### `getCampaignData()`
Get campaign information.

```javascript
const campaign = window.twentyNineNext.getCampaignData();
console.log(campaign.name, campaign.currency);
```

### `getCountry()`
Get detected/configured country.

```javascript
const country = window.twentyNineNext.getCountry();
// Returns: "US", "CA", "GB", etc.
```

### `setCountry(countryCode)`
Override country setting.

```javascript
window.twentyNineNext.setCountry('CA');
```

## Debug Methods

### `enableDebug()`
Enable debug mode.

```javascript
window.twentyNineNext.enableDebug();
```

### `disableDebug()`
Disable debug mode.

```javascript
window.twentyNineNext.disableDebug();
```

### `getDebugInfo()`
Get debug information.

```javascript
const debug = window.twentyNineNext.getDebugInfo();
console.log(debug);
```

## Timer Methods

### `timers.start(elementId, duration)`
Start a countdown timer.

```javascript
window.twentyNineNext.timers.start('offer-timer', 3600); // 1 hour
```

### `timers.stop(elementId)`
Stop a timer.

```javascript
window.twentyNineNext.timers.stop('offer-timer');
```

### `timers.getRemainingTime(elementId)`
Get remaining time.

```javascript
const remaining = window.twentyNineNext.timers.getRemainingTime('offer-timer');
```

## Voucher Methods

### `applyVoucher(code)`
Apply a discount voucher.

```javascript
window.twentyNineNext.applyVoucher('SAVE20');
```

### `removeVoucher()`
Remove applied voucher.

```javascript
window.twentyNineNext.removeVoucher();
```

### `getAppliedVoucher()`
Get currently applied voucher.

```javascript
const voucher = window.twentyNineNext.getAppliedVoucher();
```

## Storage Methods

### `storage.get(key)`
Get value from storage.

```javascript
const value = window.twentyNineNext.storage.get('user_preference');
```

### `storage.set(key, value)`
Set value in storage.

```javascript
window.twentyNineNext.storage.set('user_preference', 'dark_mode');
```

### `storage.remove(key)`
Remove value from storage.

```javascript
window.twentyNineNext.storage.remove('user_preference');
```

### `storage.clear()`
Clear all storage.

```javascript
window.twentyNineNext.storage.clear();
```

## Example Usage

```javascript
// Wait for initialization
document.addEventListener('DOMContentLoaded', () => {
    // Initialize
    window.twentyNineNext.init({
        apiKey: 'YOUR_KEY',
        campaignId: 'YOUR_CAMPAIGN'
    });
    
    // Use the API
    const client = window.twentyNineNext;
    
    // Listen for cart updates
    window.twentyNineNext.on('cart.updated', (data) => {
        console.log('Cart now has', data.count, 'items');
    });
    
    // Add products
    window.twentyNineNext.profiles.addToCart('starter-kit');
    
    // Apply discount
    window.twentyNineNext.applyVoucher('WELCOME10');
    
    // Start checkout when ready
    document.getElementById('checkout-btn').addEventListener('click', () => {
        window.twentyNineNext.checkout();
    });
});
```

## See Also

### Feature Guides
- [Shopping Cart Guide](../guides/features/shopping-cart.md) - Using cart methods
- [Product Profiles Guide](../guides/features/product-profiles.md) - Profile API usage
- [Multi-Currency Guide](../guides/features/multi-currency.md) - Country and currency methods
- [Events Guide](events-reference.md) - Event handling

### Implementation
- [Basic Implementation](../examples/basic-implementation.md) - API usage examples
- [Configuration Guide](../guides/configuration/basic-config.md) - Configuration API

## TypeScript Support

While Campaign Cart is written in JavaScript, you can use these type definitions:

```typescript
interface TwentyNineNext {
    init(config: Config): void;
    addToCart(packageId: number, quantity?: number, options?: CartOptions): void;
    removeFromCart(packageId: number): void;
    clearCart(): void;
    getCart(): Cart;
    checkout(): void;
    // ... etc
}

declare global {
    interface Window {
        twentyNineNext: TwentyNineNext;
    }
}
```