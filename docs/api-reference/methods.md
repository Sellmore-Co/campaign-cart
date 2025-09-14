# JavaScript API Methods

The Next Commerce JS SDK exposes methods through the `window.next` object after initialization.

## Table of Contents

- [Getting Started](#getting-started)
- [Cart Methods](#cart-methods)
- [Campaign & Package Methods](#campaign--package-methods)
- [Profile Methods](#profile-methods)
- [Coupon Methods](#coupon-methods)
- [Tracking & Analytics Methods](#tracking--analytics-methods)
- [Shipping Methods](#shipping-methods)
- [Upsell Methods](#upsell-methods)
- [Event Methods](#event-methods)
- [Behavioral Methods](#behavioral-methods)
- [Utility Methods](#utility-methods)
- [Debug API](#debug-api)

## Getting Started

### Initialization Detection

```javascript
// Check if SDK is ready
if (window.next) {
  // SDK is ready, use it directly
  next.addItem({ packageId: 1 });
} else {
  // Queue for later execution
  window.nextReady = window.nextReady || [];
  window.nextReady.push(function() {
    next.addItem({ packageId: 1 });
  });
}

// Or listen for initialization event
document.addEventListener('next:initialized', function(event) {
  // SDK is ready
  console.log('SDK initialized at', new Date(event.detail.timestamp));
  next.addItem({ packageId: 1 });
});
```

## Cart Methods

### addItem

Adds an item to the cart. **Note: This method requires an options object, not a direct package ID.**

```javascript
// ✅ CORRECT - Pass an object with packageId property
await next.addItem({ 
  packageId: 123, 
  quantity: 2 
});

// ✅ CORRECT - Quantity is optional (defaults to 1)
await next.addItem({ packageId: 123 });

// ❌ WRONG - Don't pass packageId directly
// next.addItem(123); // This won't work!
```

**Parameters:**
- `options` (object): Required options object
  - `options.packageId` (number): Package ID to add
  - `options.quantity` (number, optional): Quantity to add (default: 1)

**Returns:** `Promise<void>`

### removeItem

Removes an item from the cart. **Requires an options object.**

```javascript
// ✅ CORRECT
await next.removeItem({ packageId: 123 });

// ❌ WRONG
// next.removeItem(123); // This won't work!
```

**Parameters:**
- `options` (object): Required options object
  - `options.packageId` (number): Package ID to remove

**Returns:** `Promise<void>`

### updateQuantity

Updates the quantity of an item in the cart. **Requires an options object.**

```javascript
// ✅ CORRECT
await next.updateQuantity({ 
  packageId: 123, 
  quantity: 5 
});

// ❌ WRONG
// next.updateQuantity(123, 5); // This won't work!
```

**Parameters:**
- `options` (object): Required options object
  - `options.packageId` (number): Package ID to update
  - `options.quantity` (number): New quantity

**Returns:** `Promise<void>`

### clearCart

Removes all items from the cart.

```javascript
await next.clearCart();
```

**Returns:** `Promise<void>`

### hasItemInCart

Checks if an item is in the cart. **Requires an options object.**

```javascript
// ✅ CORRECT
const hasItem = next.hasItemInCart({ packageId: 123 });
console.log('Item in cart:', hasItem); // true or false

// ❌ WRONG
// next.hasItemInCart(123); // This won't work!
```

**Parameters:**
- `options` (object): Required options object
  - `options.packageId` (number): Package ID to check

**Returns:** `boolean`

### getCartData

Returns comprehensive cart data including enriched items, totals, campaign data, and applied coupons.

```javascript
const cartData = next.getCartData();
console.log(cartData);
// {
//   cartLines: [...],
//   cartTotals: { subtotal: {...}, total: {...}, ... },
//   campaignData: {...},
//   appliedCoupons: [...]
// }
```

**Returns:**
```typescript
{
  cartLines: EnrichedCartLine[];
  cartTotals: CartTotals;
  campaignData: Campaign | null;
  appliedCoupons: AppliedCoupon[];
}
```

### getCartTotals

Returns cart totals and pricing information.

```javascript
const totals = next.getCartTotals();
console.log('Total:', totals.total.formatted); // "$99.99"
console.log('Subtotal:', totals.subtotal.formatted); // "$89.99"
console.log('Shipping:', totals.shipping.formatted); // "$10.00"
```

**Returns:** `CartTotals` object with subtotal, shipping, tax, discounts, and total

### getCartCount

Returns the total number of items in the cart.

```javascript
const count = next.getCartCount();
console.log('Items in cart:', count); // 3
```

**Returns:** `number`

## Campaign & Package Methods

### getCampaignData

Returns the loaded campaign data.

```javascript
const campaign = next.getCampaignData();
if (campaign) {
  console.log('Campaign:', campaign.name);
  console.log('Currency:', campaign.currency);
  console.log('Packages:', campaign.packages);
}
```

**Returns:** `Campaign | null`

### getPackage

Gets detailed information about a specific package.

```javascript
const package = next.getPackage(123);
if (package) {
  console.log('Package name:', package.display_name);
  console.log('Price:', next.formatPrice(package.price));
}
```

**Parameters:**
- `id` (number): Package ID

**Returns:** `Package | null`

## Profile Methods

Profile methods enable dynamic package ID mapping for different pricing tiers, promotions, and customer segments. See the [complete Profile API documentation](./profiles.md) for detailed information.

### setProfile

Applies a pricing profile to swap package IDs.

```javascript
// Basic usage
await next.setProfile('black_friday');

// With options
await next.setProfile('vip', {
  clearCart: true,
  preserveQuantities: false
});
```

### revertProfile

Reverts to original packages.

```javascript
await next.revertProfile();
```

### getActiveProfile

Gets the currently active profile ID.

```javascript
const profile = next.getActiveProfile();
console.log(profile); // "black_friday" or null
```

### getMappedPackageId

Gets the mapped package ID for the active profile.

```javascript
const mappedId = next.getMappedPackageId(1);
console.log(mappedId); // 101 (if profile maps 1 -> 101)
```

### listProfiles

Lists all configured profiles.

```javascript
const profiles = next.listProfiles();
console.log(profiles); // ["regular", "black_friday", "vip"]
```

See [Profile API Reference](./profiles.md) for complete documentation including events, data attributes, and configuration.

## Coupon Methods

### applyCoupon

Applies a coupon code to the cart.

```javascript
const result = await next.applyCoupon('SAVE20');
if (result.success) {
  console.log('Coupon applied:', result.message);
  console.log('Discount amount:', result.data.amount);
} else {
  console.error('Coupon error:', result.message);
}
```

**Parameters:**
- `code` (string): Coupon code to apply

**Returns:**
```typescript
Promise<{
  success: boolean;
  message: string;
  data?: { amount: number; formatted: string; }
}>
```

### removeCoupon

Removes a coupon from the cart.

```javascript
next.removeCoupon('SAVE20');
```

**Parameters:**
- `code` (string): Coupon code to remove

**Returns:** `void`

### getCoupons

Returns all applied coupons.

```javascript
const coupons = next.getCoupons();
coupons.forEach(coupon => {
  console.log(`${coupon.code}: ${coupon.amount.formatted} off`);
});
```

**Returns:** `AppliedCoupon[]`

### validateCoupon

Validates a coupon without applying it.

```javascript
const validation = next.validateCoupon('TESTCODE');
if (validation.valid) {
  console.log('Coupon is valid');
} else {
  console.log('Invalid:', validation.message);
}
```

**Parameters:**
- `code` (string): Coupon code to validate

**Returns:**
```typescript
{
  valid: boolean;
  message?: string;
}
```

### calculateDiscountAmount

Calculates the discount amount for a given coupon definition.

```javascript
const amount = next.calculateDiscountAmount(couponDefinition);
console.log('Discount amount:', amount);
```

**Parameters:**
- `coupon` (DiscountDefinition): Coupon definition object

**Returns:** `number` - Calculated discount amount

## Tracking & Analytics Methods

### trackViewItemList

Tracks when users view a list of products.

```javascript
// Basic tracking
await next.trackViewItemList(['1', '2', '3']);

// With list context
await next.trackViewItemList(
  ['1', '2', '3'], 
  'homepage', 
  'Featured Products'
);
```

**Parameters:**
- `packageIds` (Array<string|number>): Array of package IDs
- `listId` (string, optional): Unique list identifier
- `listName` (string, optional): Human-readable list name

**Returns:** `Promise<void>`

### trackViewItem

Tracks when a single item is viewed.

```javascript
await next.trackViewItem('1');
```

**Parameters:**
- `packageId` (string|number): Package ID viewed

**Returns:** `Promise<void>`

### trackAddToCart

Tracks when an item is added to cart.

```javascript
await next.trackAddToCart('1', 2);
```

**Parameters:**
- `packageId` (string|number): Package ID added
- `quantity` (number, optional): Quantity added (default: 1)

**Returns:** `Promise<void>`

### trackRemoveFromCart

Tracks when an item is removed from cart.

```javascript
await next.trackRemoveFromCart('1', 1);
```

**Parameters:**
- `packageId` (string|number): Package ID removed
- `quantity` (number, optional): Quantity removed (default: 1)

**Returns:** `Promise<void>`

### trackBeginCheckout

Tracks when checkout process begins.

```javascript
await next.trackBeginCheckout();
```

**Returns:** `Promise<void>`

### trackPurchase

Tracks completed purchases.

```javascript
// Track with order data
await next.trackPurchase(orderData);
```

**Parameters:**
- `orderData` (any): Order data object

**Returns:** `Promise<void>`

### trackCustomEvent

Tracks custom events with optional data.

```javascript
// Simple custom event
await next.trackCustomEvent('video_played');

// Custom event with data
await next.trackCustomEvent('user_engagement', {
  section: 'hero',
  action: 'video_play',
  duration: 30
});
```

**Parameters:**
- `eventName` (string): Custom event name
- `data` (Record<string, any>, optional): Additional event data

**Returns:** `Promise<void>`

### trackSignUp

Tracks user sign-up events.

```javascript
await next.trackSignUp('user@example.com');
```

**Parameters:**
- `email` (string): User's email address

**Returns:** `Promise<void>`

### trackLogin

Tracks user login events.

```javascript
await next.trackLogin('user@example.com');
```

**Parameters:**
- `email` (string): User's email address

**Returns:** `Promise<void>`

### setDebugMode (Analytics)

Enables or disables analytics debug mode.

```javascript
await next.setDebugMode(true); // Enable debug logging
```

**Parameters:**
- `enabled` (boolean): Enable or disable debug mode

**Returns:** `Promise<void>`

### invalidateAnalyticsContext

Invalidates the analytics context, useful when switching between pages.

```javascript
await next.invalidateAnalyticsContext();
```

**Returns:** `Promise<void>`

## Shipping Methods

### getShippingMethods

Returns all available shipping methods from the campaign.

```javascript
const methods = next.getShippingMethods();
console.log(methods);
// [
//   {ref_id: 1, code: "standard", price: "0.00"},
//   {ref_id: 2, code: "express", price: "12.99"}
// ]
```

**Returns:** `Array<{ref_id: number; code: string; price: string}>`

### getSelectedShippingMethod

Returns the currently selected shipping method.

```javascript
const selected = next.getSelectedShippingMethod();
if (selected) {
  console.log('Shipping:', selected.name, selected.price);
}
```

**Returns:** `{id: number; name: string; price: number; code: string} | null`

### setShippingMethod

Sets the shipping method by ID.

```javascript
// Set standard shipping (ID 1)
await next.setShippingMethod(1);

// Set express shipping (ID 2)
await next.setShippingMethod(2);
```

**Parameters:**
- `methodId` (number): The ref_id of the shipping method from campaign data

**Returns:** `Promise<void>`

**Throws:** Error if shipping method ID is not found in campaign data

## Upsell Methods

### addUpsell

Adds upsell items to a completed order. Only available after order completion.

```javascript
// Add single upsell
const result = await next.addUpsell({ 
  packageId: 123, 
  quantity: 1 
});

// Add multiple upsells at once
const result = await next.addUpsell({ 
  items: [
    { packageId: 123, quantity: 1 },
    { packageId: 456, quantity: 2 }
  ]
});

console.log('Upsells added:', result.addedLines);
console.log('Total upsell value:', result.totalValue);
```

**Parameters:**
- `options.packageId` (number, optional): Single package ID to add
- `options.quantity` (number, optional): Quantity for single item (default: 1)
- `options.items` (Array, optional): Multiple items to add
  - `items[].packageId` (number): Package ID
  - `items[].quantity` (number, optional): Quantity (default: 1)

**Returns:**
```typescript
Promise<{
  order: Order;
  addedLines: OrderLine[];
  totalValue: number;
}>
```

**Throws:** Error if no order exists or order doesn't support upsells

### canAddUpsells

Checks if upsells can be added to the current order.

```javascript
if (next.canAddUpsells()) {
  console.log('Order supports upsells');
}
```

**Returns:** `boolean`

### getCompletedUpsells

Returns array of package IDs that have been added as upsells.

```javascript
const completedUpsells = next.getCompletedUpsells();
console.log('Upsells added:', completedUpsells); // ['123', '456']
```

**Returns:** `string[]`

### isUpsellAlreadyAdded

Checks if a specific package has already been added as an upsell.

```javascript
if (next.isUpsellAlreadyAdded(123)) {
  console.log('This upsell was already added');
}
```

**Parameters:**
- `packageId` (number): Package ID to check

**Returns:** `boolean`

## Behavioral Methods

### fomo

Starts FOMO (Fear of Missing Out) popup notifications showing recent purchases.

```javascript
// Start with default configuration
await next.fomo();

// Start with custom configuration
await next.fomo({
  items: [
    { text: "Premium Package", image: "/images/product1.jpg" },
    { text: "Starter Bundle", image: "/images/product2.jpg" }
  ],
  customers: {
    US: ["John", "Sarah", "Mike", "Emma"],
    GB: ["James", "Sophie", "Oliver", "Lily"]
  },
  maxMobileShows: 2,
  displayDuration: 5000,
  delayBetween: 12000,
  initialDelay: 3000
});
```

**Parameters:**
- `config` (object, optional):
  - `items` (Array): Custom product items to show
  - `customers` (object): Customer names by country code
  - `maxMobileShows` (number): Max popups on mobile (default: 2)
  - `displayDuration` (number): How long to show each popup in ms (default: 5000)
  - `delayBetween` (number): Delay between popups in ms (default: 12000)
  - `initialDelay` (number): Initial delay before first popup in ms (default: 3000)

**Returns:** `Promise<void>`

### stopFomo

Stops FOMO popup notifications.

```javascript
next.stopFomo();
```

**Returns:** `void`

### exitIntent

Shows exit intent popup when user tries to leave the page.

```javascript
await next.exitIntent({
  image: 'https://example.com/special-offer.jpg',
  action: async () => {
    // Apply discount when popup is clicked
    await next.applyCoupon('EXIT20');
    // Close the popup
  }
});
```

**Parameters:**
- `options.image` (string): URL of the image to display
- `options.action` (function, optional): Function to call when popup is clicked

**Returns:** `Promise<void>`

### disableExitIntent

Disables the exit intent popup.

```javascript
next.disableExitIntent();
```

**Returns:** `void`

## Event Methods

### on

Subscribe to internal SDK events.

```javascript
// Listen for cart updates
next.on('cart:updated', (cartState) => {
  console.log('Cart updated:', cartState.items.length, 'items');
});

// Listen for item additions
next.on('cart:item-added', (data) => {
  console.log('Item added:', data.packageId);
});
```

**Parameters:**
- `event` (string): Event name from EventMap
- `handler` (function): Event handler function

**Returns:** `void`

### off

Unsubscribe from internal SDK events.

```javascript
const handler = (data) => console.log(data);
next.on('cart:updated', handler);
// Later...
next.off('cart:updated', handler);
```

**Parameters:**
- `event` (string): Event name
- `handler` (function): Handler function to remove

**Returns:** `void`

### Available Events

```javascript
// Cart events
next.on('cart:updated', (cartState) => { /* ... */ });
next.on('cart:item-added', (data) => { /* ... */ });
next.on('cart:item-removed', (data) => { /* ... */ });
next.on('cart:quantity-changed', (data) => { /* ... */ });

// Campaign events
next.on('campaign:loaded', (campaign) => { /* ... */ });

// Checkout events
next.on('checkout:started', (data) => { /* ... */ });
next.on('checkout:form-initialized', () => { /* ... */ });

// Order events
next.on('order:completed', (order) => { /* ... */ });

// Payment events
next.on('payment:tokenized', (data) => { /* ... */ });
next.on('payment:error', (error) => { /* ... */ });

// Coupon events
next.on('coupon:applied', (coupon) => { /* ... */ });
next.on('coupon:removed', (code) => { /* ... */ });

// Upsell events
next.on('upsell:added', (data) => { /* ... */ });
next.on('upsell:skipped', (data) => { /* ... */ });
next.on('upsell:viewed', (data) => { /* ... */ });
next.on('upsell:accepted', (data) => { /* ... */ });

// Other events
next.on('error:occurred', (error) => { /* ... */ });
next.on('config:updated', (config) => { /* ... */ });
next.on('fomo:shown', (data) => { /* ... */ });
next.on('route:changed', (route) => { /* ... */ });
```

## Utility Methods

### formatPrice

Formats a price value according to campaign currency.

```javascript
const formatted = next.formatPrice(19.99); // "$19.99"
const euros = next.formatPrice(19.99, 'EUR'); // "€19.99"
```

**Parameters:**
- `amount` (number): Price amount to format
- `currency` (string, optional): Currency code (uses campaign currency if not provided)

**Returns:** `string`

### validateCheckout

Validates if the cart is ready for checkout.

```javascript
const validation = next.validateCheckout();
if (!validation.valid) {
  console.error('Cannot checkout:', validation.errors);
}
```

**Returns:**
```typescript
{
  valid: boolean;
  errors?: string[];
}
```

### registerCallback

Register a callback for specific SDK operations (legacy compatibility).

```javascript
next.registerCallback('itemAdded', (data) => {
  console.log('Item added:', data);
  // data includes: cartLines, cartTotals, campaignData, appliedCoupons
});
```

**Parameters:**
- `type` (CallbackType): Type of callback. Available types:
  - `'beforeRender'` - Before cart UI renders
  - `'afterRender'` - After cart UI renders  
  - `'beforeCheckout'` - Before checkout starts
  - `'afterCheckout'` - After checkout completes
  - `'beforeRedirect'` - Before order redirect
  - `'itemAdded'` - After item added to cart
  - `'itemRemoved'` - After item removed from cart
  - `'cartCleared'` - After cart cleared
- `callback` (function): Callback function that receives `CallbackData`

**Returns:** `void`

### unregisterCallback

Remove a previously registered callback.

```javascript
const myCallback = (data) => console.log(data);
next.registerCallback('itemAdded', myCallback);
// Later...
next.unregisterCallback('itemAdded', myCallback);
```

**Parameters:**
- `type` (CallbackType): Type of callback
- `callback` (function): The exact callback function to remove

**Returns:** `void`

### triggerCallback (Internal)

Triggers all callbacks of a specific type. This is used internally by the SDK.

**Note:** This method is for internal SDK use only and should not be called directly.

## Debug API

The debug API provides powerful utilities for development and troubleshooting. Available only when debug mode is enabled with `?debugger=true`.

### Accessing Debug Mode

```javascript
// Check if debug mode is available
if (window.nextDebug) {
  console.log('Debug mode available');
}
```

### Store Access

Direct access to all internal stores:

```javascript
// Cart store
const cartState = nextDebug.stores.cart.getState();
console.log('Cart items:', cartState.items);

// Campaign store
const campaignState = nextDebug.stores.campaign.getState();
console.log('Campaign data:', campaignState.data);

// Config store
const configState = nextDebug.stores.config.getState();
console.log('API key:', configState.apiKey);

// Checkout store
const checkoutState = nextDebug.stores.checkout.getState();

// Order store
const orderState = nextDebug.stores.order.getState();

// Attribution store
const attributionState = nextDebug.stores.attribution.getState();
```

### Cart Debug Methods

```javascript
// Quick cart operations
nextDebug.addToCart(123);        // Add single item
nextDebug.addToCart(123, 3);     // Add with quantity
nextDebug.removeFromCart(123);   // Remove item
nextDebug.updateQuantity(123, 5); // Update quantity

// Add test items (packages 2, 7, 9)
nextDebug.addTestItems();
```

### Campaign Debug Methods

```javascript
// Reload campaign data
await nextDebug.loadCampaign();

// Clear campaign cache
nextDebug.clearCampaignCache();

// Get cache information
const cacheInfo = nextDebug.getCacheInfo();

// Inspect specific package
nextDebug.inspectPackage(123);

// Test shipping methods
await nextDebug.testShippingMethod(1);
```

### Analytics Debug Methods

```javascript
// Get analytics status
const status = await nextDebug.analytics.getStatus();

// Get loaded providers
const providers = await nextDebug.analytics.getProviders();

// Track test event
await nextDebug.analytics.track('test_event', { test: true });

// Enable analytics debug mode
await nextDebug.analytics.setDebugMode(true);

// Invalidate analytics context
await nextDebug.analytics.invalidateContext();
```

### Attribution Debug Methods

```javascript
// Debug attribution data
nextDebug.attribution.debug();

// Get attribution for API
const attribution = nextDebug.attribution.get();

// Set funnel name
nextDebug.attribution.setFunnel('debug-funnel');

// Set Everflow click ID
nextDebug.attribution.setEvclid('test-evclid-123');

// Get current funnel
const funnel = nextDebug.attribution.getFunnel();

// Clear persisted funnel
nextDebug.attribution.clearFunnel();
```

### System Debug Methods

```javascript
// Direct SDK access
nextDebug.sdk.addItem({ packageId: 123 });

// Get initialization stats
const stats = nextDebug.getStats();

// Reinitialize SDK
await nextDebug.reinitialize();

// Test mode manager
nextDebug.testMode.enable();
nextDebug.testMode.disable();
nextDebug.testMode.getConfig();
```

### Debug Overlay Control

```javascript
// Show/hide debug overlay
nextDebug.overlay.show();
nextDebug.overlay.hide();
nextDebug.overlay.toggle();

// Check visibility
const isVisible = nextDebug.overlay.isVisible();
```

## Error Handling

### Standard Error Handling

```javascript
try {
  await next.addItem({ packageId: 123, quantity: 2 });
  console.log('Item added successfully');
} catch (error) {
  console.error('Failed to add item:', error.message);
}
```

### Async Method Handling

```javascript
// Most cart/coupon methods are async
const result = await next.applyCoupon('INVALID_CODE');
if (!result.success) {
  console.error('Coupon error:', result.message);
  // Show user-friendly message
}
```

### Event Error Handling

```javascript
next.on('error:occurred', (error) => {
  console.error('SDK error:', error);
  // Handle errors gracefully
});
```

## Best Practices

1. **Always wait for SDK initialization** before calling methods
2. **Use async/await** for cleaner code with promises
3. **Handle errors appropriately** - check success flags and catch exceptions
4. **Subscribe to events** for reactive UI updates
5. **Use debug mode** during development for troubleshooting
6. **Batch operations** when possible for better performance
7. **Validate inputs** before calling methods
8. **Clean up event listeners** when no longer needed

## Common Patterns

### E-commerce Flow

```javascript
window.nextReady.push(async function() {
  // 1. Track product list view
  await next.trackViewItemList(['1', '2', '3'], 'category', 'Best Sellers');
  
  // 2. Add item to cart
  await next.addItem({ packageId: 1, quantity: 2 });
  
  // 3. Apply coupon
  const couponResult = await next.applyCoupon('SAVE20');
  if (couponResult.success) {
    console.log('Discount applied');
  }
  
  // 4. Track checkout start
  await next.trackBeginCheckout();
});
```

### Reactive Cart Updates

```javascript
// Update UI when cart changes
next.on('cart:updated', (cartState) => {
  document.querySelector('.cart-count').textContent = next.getCartCount();
  document.querySelector('.cart-total').textContent = cartState.totals.total.formatted;
});

// React to specific actions
next.on('cart:item-added', (data) => {
  showNotification(`${data.packageName} added to cart`);
});
```