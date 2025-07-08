# Campaign Cart SDKv v0.2.0 - API Reference

A comprehensive guide to all available methods, utilities, and debugging tools in the Campaign Cart SDKv v0.2.0.

## Table of Contents

- [Getting Started](#getting-started)
- [Production API](#production-api)
  - [Cart Management](#cart-management)
  - [Package Profiles](#package-profiles) 
  - [Tracking & Analytics](#tracking--analytics)
  - [Campaign Data](#campaign-data)
  - [Coupons](#coupons)
  - [Event Handling](#event-handling)
  - [Shipping Methods](#shipping-methods)
- [Debug API](#debug-api)
  - [Debug Access](#debug-access)
  - [Store Inspection](#store-inspection)
  - [Tracking Utilities](#tracking-utilities)
  - [Cart Utilities](#cart-utilities)
  - [Campaign Utilities](#campaign-utilities)
  - [Analytics Utilities](#analytics-utilities)
  - [Attribution Utilities](#attribution-utilities)
- [Configuration](#configuration)
- [Events Reference](#events-reference)
- [Error Handling](#error-handling)
- [Migration Guide](#migration-guide)

## Getting Started

### Basic Setup

```html
<!-- Required Configuration -->
<meta name="next-api-key" content="your-api-key">
<meta name="next-campaign-id" content="your-campaign-id">

<!-- Optional Configuration -->
<script>
window.nextConfig = {
  apiKey: 'your-api-key',
  campaignId: 'your-campaign-id',
  enableAnalytics: true,
  tracking: 'auto', // 'auto', 'manual', 'disabled'
  debug: false
};
</script>

<!-- SDK Script -->
<script src="path/to/campaign-cart-next.js"></script>
```

### Direct API Access

```javascript
// Direct access via window.next (available after SDK loads)
next.addItem({ packageId: 1, quantity: 2 });
next.trackViewItemList(['1', '2', '3']);
console.log('Cart count:', next.getCartCount());
```

### Ready Callback Pattern

```javascript
// Queue callbacks before SDK loads (for early script execution)
window.nextReady = window.nextReady || [];

// Both patterns work - choose the one that fits your needs:

// Pattern 1: Without SDK parameter (recommended for simplicity)
window.nextReady.push(function() {
  // SDK is ready - window.next is available globally
  console.log('Cart count:', next.getCartCount());
  next.addItem({ packageId: 123 });
});

// Pattern 2: With SDK parameter (useful for isolation/testing)
window.nextReady.push(function(sdk) {
  // SDK passed as parameter
  console.log('Cart count:', sdk.getCartCount());
  sdk.addItem({ packageId: 123 });
});
```

### Initialization Detection

The SDK provides two initialization events to help you integrate at the right time:

#### Initialization Events

1. **`next:ready`** - Emitted when the SDK module is loaded (but not necessarily initialized)
   - Fired by: `loader.js` when the SDK module finishes loading
   - Use case: Module preloading, early setup tasks
   - Available data: `event.detail.loadTime`, `event.detail.version`, `event.detail.mode`

2. **`next:initialized`** - Emitted when the SDK is fully initialized and ready to use
   - Fired by: `SDKInitializer` after configuration, campaign data, and DOM scanning
   - Use case: Start using the SDK API (`window.next`)
   - Available data: `event.detail.version`, `event.detail.timestamp`, `event.detail.stats`

#### Initialization Flow

```
1. User includes loader.js in HTML
2. loader.js loads the SDK module
3. loader.js emits 'next:ready' event
4. SDK module auto-initializes via SDKInitializer
5. SDKInitializer loads configuration
6. SDKInitializer loads campaign data
7. SDKInitializer scans DOM for data attributes
8. SDKInitializer emits 'next:initialized' event
9. window.next API is now available
```

#### Usage Examples

```javascript
// Wait for SDK module to be loaded (early hook)
document.addEventListener('next:ready', function(event) {
  console.log('SDK module loaded in', event.detail.loadTime + 'ms');
  // Module is loaded but SDK may still be initializing
  // Don't use window.next here yet
});

// Wait for SDK to be fully initialized (recommended)
document.addEventListener('next:initialized', function(event) {
  // Now window.next is fully available
  console.log('SDK initialized at', new Date(event.detail.timestamp));
  next.trackViewItemList(['1', '2', '3']);
});

// Check if already initialized
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

// Combined approach for maximum compatibility
(function() {
  function initializeSDK() {
    // Your SDK initialization code
    next.addItem({ packageId: 123 });
    next.trackViewItemList(['1', '2', '3']);
  }
  
  if (window.next) {
    // Already initialized
    initializeSDK();
  } else {
    // Wait for initialization
    document.addEventListener('next:initialized', initializeSDK);
  }
})();
```

#### When to Use Each Event

- **Use `next:ready`** when you need to:
  - Know when the SDK module has loaded
  - Perform module preloading
  - Set up early event listeners
  - Track SDK load performance

- **Use `next:initialized`** when you need to:
  - Start using the SDK API (`window.next`)
  - Access campaign data
  - Interact with the cart
  - Set up tracking and analytics

**Important:** Most integrations should use `next:initialized` or the `window.nextReady` callback pattern. The `next:ready` event is primarily for advanced use cases.

---

## Production API

The production API provides clean, documented methods for end-user applications.

### Cart Management

#### `addItem(options)`
Adds an item to the cart.

```javascript
// Add by package ID
await next.addItem({ 
  packageId: 123, 
  quantity: 2 
});

// Add by profile name
await next.addItem({ 
  itemProfile: 'starter-pack', 
  quantity: 1 
});
```

**Parameters:**
- `options.packageId` (number): Package ID to add
- `options.itemProfile` (string): Profile name to add
- `options.quantity` (number, optional): Quantity to add (default: 1)

**Returns:** `Promise<void>`

#### `removeItem(options)`
Removes an item from the cart.

```javascript
// Remove by package ID
await next.removeItem({ packageId: 123 });

// Remove by profile name
await next.removeItem({ itemProfile: 'starter-pack' });
```

**Parameters:**
- `options.packageId` (number): Package ID to remove
- `options.itemProfile` (string): Profile name to remove

**Returns:** `Promise<void>`

#### `updateQuantity(options)`
Updates the quantity of an item in the cart.

```javascript
// Update by package ID
await next.updateQuantity({ 
  packageId: 123, 
  quantity: 5 
});

// Update by profile name
await next.updateQuantity({ 
  itemProfile: 'starter-pack', 
  quantity: 3 
});
```

**Parameters:**
- `options.packageId` (number): Package ID to update
- `options.itemProfile` (string): Profile name to update
- `options.quantity` (number): New quantity

**Returns:** `Promise<void>`

#### `clearCart()`
Removes all items from the cart.

```javascript
await next.clearCart();
```

**Returns:** `Promise<void>`

#### `hasItemInCart(options)`
Checks if an item is in the cart.

```javascript
// Check by package ID
const hasItem = next.hasItemInCart({ packageId: 123 });

// Check by profile name
const hasProfile = next.hasItemInCart({ itemProfile: 'starter-pack' });
```

**Parameters:**
- `options.packageId` (number): Package ID to check
- `options.itemProfile` (string): Profile name to check

**Returns:** `boolean`

#### `getCartData()`
Returns comprehensive cart data.

```javascript
const cartData = next.getCartData();
console.log(cartData);
```

**Returns:**
```typescript
{
  cartLines: EnrichedCartLine[];
  cartTotals: CartTotals;
  campaignData: Campaign | null;
  packageProfiles: Record<string, PackageProfile>;
  appliedCoupons: AppliedCoupon[];
}
```

#### `getCartTotals()`
Returns cart totals and pricing information.

```javascript
const totals = next.getCartTotals();
console.log('Total:', totals.total.formatted);
console.log('Subtotal:', totals.subtotal.formatted);
```

**Returns:** `CartTotals`

#### `getCartCount()`
Returns the total number of items in the cart.

```javascript
const count = next.getCartCount();
console.log('Items in cart:', count);
```

**Returns:** `number`

### Package Profiles

#### `getPackageProfiles()`
Returns all available package profiles.

```javascript
const profiles = next.getPackageProfiles();
Object.keys(profiles).forEach(profileName => {
  console.log('Profile:', profileName, profiles[profileName]);
});
```

**Returns:** `Record<string, PackageProfile>`

#### `resolvePackageProfile(profileName)`
Gets detailed information about a specific profile.

```javascript
const profile = next.resolvePackageProfile('premium-bundle');
if (profile) {
  console.log('Profile price:', profile.totalPrice);
  console.log('Available:', profile.isAvailable);
}
```

**Parameters:**
- `profileName` (string): Name of the profile to resolve

**Returns:** `ResolvedProfile | null`

#### `addProfileBundle(profileName)`
Adds all packages from a profile bundle to the cart.

```javascript
await next.addProfileBundle('starter-pack');
```

**Parameters:**
- `profileName` (string): Profile name to add

**Returns:** `Promise<void>`

#### `removeProfileBundle(profileName)`
Removes all packages from a profile bundle from the cart.

```javascript
await next.removeProfileBundle('starter-pack');
```

**Parameters:**
- `profileName` (string): Profile name to remove

**Returns:** `Promise<void>`

#### `evaluateProfileConditions(profileName)`
Checks if a profile's conditions are met.

```javascript
const isAvailable = next.evaluateProfileConditions('premium-bundle');
console.log('Profile available:', isAvailable);
```

**Parameters:**
- `profileName` (string): Profile name to evaluate

**Returns:** `boolean`

### Tracking & Analytics

#### `trackViewItemList(packageIds, listId?, listName?)`
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

#### `trackAddToCart(packageId, quantity?)`
Tracks when an item is added to cart.

```javascript
await next.trackAddToCart('1', 2);
```

**Parameters:**
- `packageId` (string|number): Package ID added
- `quantity` (number, optional): Quantity added (default: 1)

**Returns:** `Promise<void>`

#### `trackRemoveFromCart(packageId, quantity?)`
Tracks when an item is removed from cart.

```javascript
await next.trackRemoveFromCart('1', 1);
```

**Parameters:**
- `packageId` (string|number): Package ID removed
- `quantity` (number, optional): Quantity removed (default: 1)

**Returns:** `Promise<void>`

#### `trackBeginCheckout()`
Tracks when checkout process begins.

```javascript
await next.trackBeginCheckout();
```

**Returns:** `Promise<void>`

#### `trackPurchase(transactionId, value?)`
Tracks completed purchases.

```javascript
// Basic purchase tracking
await next.trackPurchase('order-123');

// With custom value
await next.trackPurchase('order-123', 99.99);
```

**Parameters:**
- `transactionId` (string): Unique order/transaction ID
- `value` (number, optional): Transaction value (uses cart total if not provided)

**Returns:** `Promise<void>`

#### `trackViewItem(packageId)`
Tracks when a single item is viewed.

```javascript
await next.trackViewItem('1');
```

**Parameters:**
- `packageId` (string|number): Package ID viewed

**Returns:** `Promise<void>`

#### `trackCustomEvent(eventName, data?)`
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

### Campaign Data

#### `getCampaignData()`
Returns the loaded campaign data.

```javascript
const campaign = next.getCampaignData();
if (campaign) {
  console.log('Campaign:', campaign.name);
  console.log('Currency:', campaign.currency);
}
```

**Returns:** `Campaign | null`

#### `getPackage(id)`
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

### Coupons

#### `applyCoupon(code)`
Applies a coupon code to the cart.

```javascript
const result = await next.applyCoupon('SAVE20');
if (result.success) {
  console.log('Coupon applied:', result.message);
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
}>
```

#### `removeCoupon(code)`
Removes a coupon from the cart.

```javascript
next.removeCoupon('SAVE20');
```

**Parameters:**
- `code` (string): Coupon code to remove

**Returns:** `void`

#### `getCoupons()`
Returns all applied coupons.

```javascript
const coupons = next.getCoupons();
coupons.forEach(coupon => {
  console.log(`${coupon.code}: ${coupon.amount.formatted} off`);
});
```

**Returns:** `AppliedCoupon[]`

#### `validateCoupon(code)`
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

### Event Handling

#### `on(event, handler)`
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

#### `off(event, handler)`
Unsubscribe from internal SDK events.

```javascript
const handler = (data) => console.log(data);
next.on('cart:updated', handler);
next.off('cart:updated', handler);
```

**Parameters:**
- `event` (string): Event name
- `handler` (function): Handler function to remove

**Returns:** `void`

### Shipping Methods

#### `getShippingMethods()`
Returns all available shipping methods from the campaign.

```javascript
const methods = next.getShippingMethods();
console.log(methods);
// Returns: [{ref_id: 1, code: "standard", price: "0.00"}, {ref_id: 2, code: "Express", price: "12.99"}]
```

**Returns:** `Array<{ref_id: number; code: string; price: string}>`

#### `getSelectedShippingMethod()`
Returns the currently selected shipping method.

```javascript
const selected = next.getSelectedShippingMethod();
if (selected) {
  console.log('Shipping:', selected.name, selected.price);
}
```

**Returns:** `{id: number; name: string; price: number; code: string} | null`

#### `setShippingMethod(methodId)`
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

### Utility Methods

#### `formatPrice(amount, currency?)`
Formats a price value according to campaign currency.

```javascript
const formatted = next.formatPrice(19.99); // "$19.99"
const euros = next.formatPrice(19.99, 'EUR'); // "€19.99"
```

**Parameters:**
- `amount` (number): Price amount to format
- `currency` (string, optional): Currency code (uses campaign currency if not provided)

**Returns:** `string`

#### `validateCheckout()`
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

---

## Debug API

The debug API provides powerful utilities for development, testing, and troubleshooting. Available only when debug mode is enabled.

### Debug Access

Enable debug mode by adding `?debugger=true` to your URL, then access via:

```javascript
// Check if debug mode is available
if (window.nextDebug) {
  console.log('Debug mode available');
  
  // Access debug utilities
  window.nextDebug.getStats();
  window.nextDebug.stores.cart.getState();
}
```

### Store Inspection

#### `nextDebug.stores`
Direct access to all internal stores.

```javascript
// Cart store
const cartState = nextDebug.stores.cart.getState();
console.log('Cart items:', cartState.items);
console.log('Cart total:', cartState.totals.total.formatted);

// Campaign store
const campaignState = nextDebug.stores.campaign.getState();
console.log('Campaign data:', campaignState.data);

// Config store
const configState = nextDebug.stores.config.getState();
console.log('API key:', configState.apiKey);
console.log('Debug mode:', configState.debug);

// Checkout store
const checkoutState = nextDebug.stores.checkout.getState();
console.log('Checkout data:', checkoutState);

// Order store  
const orderState = nextDebug.stores.order.getState();
console.log('Current order:', orderState.order);

// Attribution store
const attributionState = nextDebug.stores.attribution.getState();
console.log('Attribution data:', attributionState);
```

### Tracking Utilities

#### `nextDebug.tracking`
Debug-specific tracking utilities.

```javascript
// Test tracking functions
nextDebug.tracking.viewItemList(['1', '2'], 'debug', 'Debug Test');
nextDebug.tracking.addToCart('1', 2);
nextDebug.tracking.removeFromCart('1', 1);
nextDebug.tracking.beginCheckout();
nextDebug.tracking.purchase('debug-order-123', 99.99);
nextDebug.tracking.viewItem('1');

// Custom events
nextDebug.tracking.custom('debug_event', { test: true });

// Check tracking status
nextDebug.tracking.getStatus();
// Returns: { enabled: true, initialized: true }
```

### Cart Utilities

#### `nextDebug.addToCart(packageId, quantity?)`
Quick cart addition for testing.

```javascript
// Add single item
nextDebug.addToCart(123);

// Add multiple quantity
nextDebug.addToCart(123, 3);
```

#### `nextDebug.removeFromCart(packageId)`
Quick cart removal for testing.

```javascript
nextDebug.removeFromCart(123);
```

#### `nextDebug.updateQuantity(packageId, quantity)`
Quick quantity update for testing.

```javascript
nextDebug.updateQuantity(123, 5);
```

#### `nextDebug.addTestItems()`
Adds predefined test items to cart.

```javascript
// Adds packages 2, 7, 9 with quantity 1 each
nextDebug.addTestItems();
```

### Campaign Utilities

#### `nextDebug.loadCampaign()`
Reloads campaign data.

```javascript
await nextDebug.loadCampaign();
```

#### `nextDebug.clearCampaignCache()`
Clears cached campaign data.

```javascript
nextDebug.clearCampaignCache();
```

#### `nextDebug.getCacheInfo()`
Displays cache information in a table.

```javascript
const cacheInfo = nextDebug.getCacheInfo();
// Also logs a formatted table to console
```

#### `nextDebug.inspectPackage(packageId)`
Displays detailed package information.

```javascript
// Shows formatted package details in console
nextDebug.inspectPackage(123);
```

#### `nextDebug.sortPackages(sortBy)`
Tests package sorting.

```javascript
nextDebug.sortPackages('price'); // Sort by price
nextDebug.sortPackages('name');  // Sort by name
```

### Analytics Utilities

#### `nextDebug.analytics`
Direct access to analytics manager.

```javascript
// Check analytics status
console.log('Analytics loaded:', nextDebug.analytics.isLoaded());
console.log('Analytics loading:', nextDebug.analytics.isLoading());

// Track events directly
await nextDebug.analytics.trackEvent('debug_test', { test: true });
await nextDebug.analytics.trackPageView();
```

### Attribution Utilities

#### `nextDebug.attribution`
Attribution debugging utilities.

```javascript
// Debug attribution data
nextDebug.attribution.debug();

// Get attribution for API
const attribution = nextDebug.attribution.get();
console.log('Attribution data:', attribution);

// Set funnel name
nextDebug.attribution.setFunnel('debug-funnel');

// Set Everflow click ID
nextDebug.attribution.setEvclid('test-evclid-123');
```

### System Utilities

#### `nextDebug.sdk`
Direct access to SDK instance.

```javascript
// Same as production API but direct access
nextDebug.next.addItem({ packageId: 123 });
nextDebug.next.trackPurchase('debug-order');
```

#### `nextDebug.getStats()`
Returns comprehensive initialization statistics.

```javascript
const stats = nextDebug.getStats();
console.log('Initialization stats:', stats);
```

#### `nextDebug.reinitialize()`
Reinitializes the entire SDK.

```javascript
// Useful for testing configuration changes
await nextDebug.reinitialize();
```

### UI Utilities

#### `nextDebug.accordion`
Accordion control utilities.

```javascript
// Control accordions programmatically
nextDebug.accordion.open('accordion-id');
nextDebug.accordion.close('accordion-id');
nextDebug.accordion.toggle('accordion-id');
```

#### `nextDebug.highlightElement(selector)`
Highlights elements on the page (planned feature).

```javascript
nextDebug.highlightElement('.cart-button');
```

---

## Configuration

### Meta Tag Configuration

```html
<!-- Required -->
<meta name="next-api-key" content="your-api-key">
<meta name="next-campaign-id" content="your-campaign-id">

<!-- Optional -->
<meta name="next-debug" content="true">
<meta name="next-page-type" content="product">
<meta name="next-spreedly-key" content="your-spreedly-key">
```

### Window Configuration

```javascript
window.nextConfig = {
  // Required
  apiKey: 'your-api-key',
  campaignId: 'your-campaign-id',
  
  // Analytics & Tracking
  enableAnalytics: true,           // Enable analytics integration
  tracking: 'auto',                // 'auto', 'manual', 'disabled'
  
  // Environment
  debug: false,                    // Enable debug mode
  testMode: false,                 // Enable test mode
  environment: 'production',       // 'development', 'staging', 'production'
  
  // Performance
  timeout: 10000,                  // Request timeout (ms)
  retryAttempts: 3,                // Number of retry attempts
  cacheTtl: 300,                   // Cache TTL (seconds)
  
  // Payment
  spreedlyEnvironmentKey: 'key',   // Spreedly environment key
  paymentConfig: {
    spreedly: {
      fieldType: { number: 'text', cvv: 'text' }
    },
    expressCheckout: {
      enabled: true,
      methods: {
        paypal: true,
        applePay: true,
        googlePay: false
      }
    }
  },
  
  // Address & Maps
  googleMapsConfig: {
    apiKey: 'your-maps-key',
    region: 'US',
    enableAutocomplete: true
  },
  addressConfig: {
    defaultCountry: 'US',
    showCountries: ['US', 'CA'],
    dontShowStates: ['US-HI', 'US-AK']
  },
  
  // Package Profiles
  packageProfiles: {
    'starter-pack': {
      packages: [
        { id: 1, quantity: 1 },
        { id: 2, quantity: 1 }
      ],
      displayName: 'Starter Pack',
      priceOverride: {
        display: '$29.99',
        strikethrough: '$39.99'
      }
    }
  },
  
  // Discounts
  discounts: {
    'SAVE20': {
      code: 'SAVE20',
      type: 'percentage',
      value: 20,
      scope: 'order',
      minOrderValue: 50
    }
  },
  
  // Attribution
  utmTransfer: {
    enabled: true,
    applyToExternalLinks: true,
    excludedDomains: ['example.com'],
    paramsToCopy: ['utm_source', 'utm_medium']
  }
};
```

---

## Events Reference

### DOM Events (Public)

Listen for these events on the document:

```javascript
// SDK lifecycle
document.addEventListener('next:ready', (event) => {
  console.log('SDK module loaded:', event.detail);
  // Module loaded, but SDK may still be initializing
});

document.addEventListener('next:initialized', (event) => {
  console.log('SDK fully initialized:', event.detail);
  // SDK is ready to use (window.next available)
});

// Cart events
document.addEventListener('next:cart-updated', (event) => {
  console.log('Cart updated:', event.detail);
});

document.addEventListener('next:item-added', (event) => {
  console.log('Item added:', event.detail);
});

document.addEventListener('next:item-removed', (event) => {
  console.log('Item removed:', event.detail);
});

// Checkout events
document.addEventListener('next:checkout-started', (event) => {
  console.log('Checkout started:', event.detail);
});

document.addEventListener('next:payment-success', (event) => {
  console.log('Payment successful:', event.detail);
});

document.addEventListener('next:payment-error', (event) => {
  console.error('Payment failed:', event.detail);
});

// UI events
document.addEventListener('next:timer-expired', (event) => {
  console.log('Timer expired:', event.detail);
});
```

### Internal Events (SDK)

Subscribe via `next.on()`:

```javascript
window.nextReady.push(function() {
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
});
```

---

## Error Handling

### Standard Error Handling

```javascript
window.nextReady.push(async function() {
  try {
    await next.addItem({ packageId: 123, quantity: 2 });
    console.log('Item added successfully');
  } catch (error) {
    console.error('Failed to add item:', error.message);
  }
});
```

### Coupon Error Handling

```javascript
window.nextReady.push(async function() {
  const result = await next.applyCoupon('INVALID_CODE');
  if (!result.success) {
    // Handle coupon error gracefully
    console.error('Coupon error:', result.message);
    // Show user-friendly message
  }
});
```

### Event Error Handling

```javascript
window.nextReady.push(function() {
  next.on('error:occurred', (error) => {
    console.error('SDK error:', error);
    // Handle errors gracefully
  });
});
```

### Debug Error Information

```javascript
if (window.nextDebug) {
  // Get comprehensive error information
  const stats = nextDebug.getStats();
  console.log('Initialization errors:', stats.errors);
  
  // Check store states for issues
  console.log('Config state:', nextDebug.stores.config.getState());
  console.log('Campaign state:', nextDebug.stores.campaign.getState());
}
```

---

## Migration Guide

### From Legacy SDK

If migrating from the legacy SDK, note these key changes:

#### Event Names
```javascript
// Old (legacy)
document.addEventListener('os:cart-updated', handler);

// New (v2)
document.addEventListener('next:cart-updated', handler);
```

#### Attributes
```html
<!-- Old (legacy) -->
<button data-os-toggle data-os-package-id="123">Add to Cart</button>

<!-- New (v2) -->
<button data-next-toggle data-next-package-id="123">Add to Cart</button>
```

#### Global Object
```javascript
// Old (legacy)
window.osConfig = { /* config */ };

// New (v2)
window.nextConfig = { /* config */ };
```

#### Ready Pattern
```javascript
// Old (legacy) - direct access
MySDK.addToCart(123);

// New (v2) - ready callback
window.nextReady.push(function() {
  next.addItem({ packageId: 123 });
});
```

### API Method Mapping

| Legacy Method |v v0.2.0 Equivalent |
|---------------|---------------|
| `addToCart(id)` | `next.addItem({ packageId: id })` |
| `removeFromCart(id)` | `next.removeItem({ packageId: id })` |
| `getCartTotal()` | `next.getCartTotals().total.value` |
| `getCartCount()` | `next.getCartCount()` |
| `applyCoupon(code)` | `next.applyCoupon(code)` |

---

## Advanced Usage Examples

### E-commerce Tracking Flow

```javascript
window.nextReady.push(function() {
  // 1. Track product list view
  next.trackViewItemList(['1', '2', '3'], 'category', 'Best Sellers');
  
  // 2. Track product view
  next.trackViewItem('1');
  
  // 3. Add to cart (tracked automatically + manually)
  next.addItem({ packageId: 1, quantity: 2 });
  
  // 4. Apply coupon
  next.applyCoupon('SAVE20').then(result => {
    if (result.success) {
      console.log('Coupon applied successfully');
    }
  });
  
  // 5. Begin checkout (tracked automatically)
  // Happens when checkout form is initialized
  
  // 6. Complete purchase (tracked automatically)
  // Happens when order is completed
});
```

### Custom Analytics Integration

```javascript
window.nextReady.push(function() {
  // Listen for cart events and send to custom analytics
  next.on('cart:item-added', (data) => {
    // Send to custom analytics platform
    customAnalytics.track('product_added', {
      product_id: data.packageId,
      quantity: data.quantity,
      profile: data.profileName
    });
  });
  
  // Listen for DOM events
  document.addEventListener('next:payment-success', (event) => {
    customAnalytics.track('purchase_completed', {
      order_id: event.detail.order.ref_id,
      value: event.detail.order.total_incl_tax
    });
  });
});
```

### Dynamic Profile Management

```javascript
window.nextReady.push(function() {
  // Get all available profiles
  const profiles = next.getPackageProfiles();
  
  // Filter by conditions
  const availableProfiles = Object.keys(profiles).filter(profileName => {
    return next.evaluateProfileConditions(profileName);
  });
  
  // Add profile based on user selection
  document.getElementById('profile-selector').addEventListener('change', (e) => {
    const selectedProfile = e.target.value;
    if (availableProfiles.includes(selectedProfile)) {
      next.addProfileBundle(selectedProfile);
    }
  });
});
```

### Debug Mode Development

```javascript
// Development helper functions
if (window.nextDebug) {
  // Quick test setup
  window.testSetup = function() {
    nextDebug.addTestItems();
    nextDebug.tracking.viewItemList(['2', '7', '9'], 'test', 'Test Items');
    console.log('Test setup complete');
  };
  
  // Quick checkout test
  window.testCheckout = function() {
    nextDebug.addTestItems();
    nextDebug.tracking.beginCheckout();
    nextDebug.tracking.purchase('test-order-' + Date.now(), 99.99);
    console.log('Checkout test complete');
  };
  
  // Monitor all events
  window.monitorEvents = function() {
    const events = [
      'cart:updated', 'cart:item-added', 'cart:item-removed',
      'checkout:started', 'order:completed', 'payment:error'
    ];
    
    events.forEach(event => {
      nextDebug.next.on(event, (data) => {
        console.log(`🔔 Event: ${event}`, data);
      });
    });
    
    console.log('Event monitoring started');
  };
}
```

---

## Support & Troubleshooting

### Common Issues

#### SDK Not Loading
```javascript
// Check if SDK script loaded
if (!window.nextReady && !window.nextDebug) {
  console.error('SDK script not loaded. Check script tag.');
}

// Check configuration
if (!document.querySelector('meta[name="next-api-key"]')) {
  console.error('API key meta tag missing.');
}
```

#### Tracking Not Working
```javascript
// Enable debug mode: add ?debugger=true to URL
if (window.nextDebug) {
  const status = nextDebug.tracking.getStatus();
  console.log('Tracking status:', status);
  
  if (!status.enabled) {
    console.log('Check enableAnalytics and tracking config');
  }
}
```

#### Events Not Firing
```javascript
// Check event listeners
window.nextReady.push(function() {
  next.on('cart:updated', () => console.log('Cart event working'));
  
  // Test manual event
  next.addItem({ packageId: 1 });
});
```

### Debug Information Collection

```javascript
// Collect debug information for support
if (window.nextDebug) {
  const debugInfo = {
    stats: nextDebug.getStats(),
    config: nextDebug.stores.config.getState(),
    cart: nextDebug.stores.cart.getState(),
    campaign: nextDebug.stores.campaign.getState(),
    tracking: nextDebug.tracking.getStatus(),
    userAgent: navigator.userAgent,
    url: window.location.href
  };
  
  console.log('Debug Information:', debugInfo);
  // Send this to support if needed
}
```

---

## Changelog

###v v0.2.0.0 (Current)
- ✅ Complete rewrite with TypeScript
- ✅ Enhanced tracking and analytics
- ✅ Comprehensive debug utilities
- ✅ Improved error handling
- ✅ Modern SDK patterns

### Migration from v1.x
- Event names changed from `os:` to `next:`
- Attributes changed from `data-os-*` to `data-next-*`
- New ready callback pattern required
- Enhanced API methods with better error handling

---

For more examples and advanced usage, see the [examples](../examples/) directory.