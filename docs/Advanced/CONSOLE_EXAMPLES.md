# NextCommerce Console Examples - Complete Guide

This document provides a comprehensive guide to ALL methods, events, and features available in the NextCommerce SDK, including hidden utilities and advanced features.

## Important: API Access

The SDK exposes multiple access points:
- `window.next` - The main SDK instance with public methods
- `window.NextCommerce` - The module exports (stores, classes, utilities)
- `window.nextDebug` - Debug utilities (only when `?debugger=true`)

### Quick Test
```javascript
// Verify SDK is loaded
console.log('window.next available?', typeof window.next !== 'undefined');
console.log('window.NextCommerce available?', typeof window.NextCommerce !== 'undefined');

// Test basic functionality
window.next.getCartData(); // Should return cart data
```

## Table of Contents
- [Production API Examples](#production-api-examples)
- [Direct Store Access](#direct-store-access)
- [Complete Event List](#complete-event-list)
- [Debug Utilities](#debug-utilities)
- [Hidden Features](#hidden-features)
- [Advanced Patterns](#advanced-patterns)
- [Upsell Error Handling](#upsell-error-handling)

## Production API Examples

These examples use `window.next`, the main public API for production use.

### Basic Cart Operations

```javascript
// 1. Check cart contents
console.log('Cart Data:', window.next.getCartData());
console.log('Cart Count:', window.next.getCartCount());
console.log('Cart Totals:', window.next.getCartTotals());

// 2. Add item to cart
window.next.addItem({ packageId: 2, quantity: 1 })
  .then(() => console.log('✅ Item added!'))
  .catch(err => console.error('❌ Failed to add item:', err));

// 3. Check if item is in cart
console.log('Has package 2?', window.next.hasItemInCart({ packageId: 2 }));

// 4. Update item quantity
window.next.updateQuantity({ packageId: 2, quantity: 3 })
  .then(() => console.log('✅ Quantity updated!'))
  .catch(err => console.error('❌ Failed to update:', err));

// 5. Remove item from cart
window.next.removeItem({ packageId: 2 })
  .then(() => console.log('✅ Item removed!'))
  .catch(err => console.error('❌ Failed to remove:', err));

// 6. Clear entire cart
window.next.clearCart()
  .then(() => console.log('✅ Cart cleared!'))
  .catch(err => console.error('❌ Failed to clear:', err));
```

### Campaign and Package Data

```javascript
// 1. Get campaign data
const campaign = window.next.getCampaignData();
console.log('Campaign:', campaign);

// 2. Get specific package details
const package2 = window.next.getPackage(2);
console.log('Package 2:', package2);

// 3. Get all shipping methods
const shippingMethods = window.next.getShippingMethods();
console.log('Available Shipping Methods:', shippingMethods);

// 4. Get selected shipping method
const selectedShipping = window.next.getSelectedShippingMethod();
console.log('Selected Shipping:', selectedShipping);

// 5. Set shipping method (use ID from available methods)
window.next.setShippingMethod(1)
  .then(() => console.log('✅ Shipping method set!'))
  .catch(err => console.error('❌ Failed to set shipping:', err));
```

### Coupon Management

```javascript
// 1. Apply a coupon
window.next.applyCoupon('SAVE10')
  .then(result => console.log('✅ Coupon result:', result))
  .catch(err => console.error('❌ Coupon error:', err));

// 2. Get applied coupons
const coupons = window.next.getCoupons();
console.log('Applied Coupons:', coupons);

// 3. Validate a coupon (without applying)
const validation = window.next.validateCoupon('TESTCODE');
console.log('Coupon validation:', validation);

// 4. Remove a coupon
window.next.removeCoupon('SAVE10');
console.log('✅ Coupon removed');

// 5. Calculate discount for a specific coupon
const discount = window.next.calculateDiscountAmount({
  type: 'percentage',
  value: 10
});
console.log('Calculated discount:', discount);
```

### Analytics Tracking

```javascript
// 1. Track custom event
window.next.trackCustomEvent('console_test', { 
  action: 'testing', 
  value: 123 
});

// 2. Track page view
window.next.trackPageView('Console Test Page', {
  test: true,
  timestamp: Date.now()
});

// 3. Track item view
window.next.trackViewItem(2);

// 4. Track add to cart
window.next.trackAddToCart(2, 1);

// 5. Track checkout begin
window.next.trackBeginCheckout();

// 6. Track purchase
window.next.trackPurchase('TEST-123', 99.99);

// 7. Identify user
window.next.identifyUser('user123', {
  email: 'test@example.com',
  name: 'Test User'
});

// 8. Reset analytics
window.next.resetAnalytics();
```

### Event Management

```javascript
// Subscribe to events
window.next.on('cart.updated', (data) => {
  console.log('Cart updated:', data);
});

window.next.on('upsell:error', (data) => {
  console.error('Upsell error:', data.error);
});

// Register callbacks
window.next.registerCallback('cart.updated', (data) => {
  console.log('Cart callback:', data);
});

// Trigger callback manually
window.next.triggerCallback('cart.updated', window.next.getCartData());
```

### Utility Methods

```javascript
// 1. Format price
console.log('Formatted $99.99:', window.next.formatPrice(99.99));
console.log('Formatted €49.99:', window.next.formatPrice(49.99, 'EUR'));

// 2. Validate checkout
const validation = window.next.validateCheckout();
console.log('Checkout validation:', validation);
```

## Direct Store Access

Access store methods not exposed through `window.next`:

### Cart Store Methods
```javascript
const cartStore = window.NextCommerce.useCartStore.getState();

// Hidden cart methods
cartStore.swapPackage(oldPackageId, { packageId: newId, quantity: 1 });
cartStore.getItem(packageId);
cartStore.getItemQuantity(packageId);
cartStore.getTotalWeight();
cartStore.calculateTotals();
cartStore.calculateShipping();
cartStore.calculateEnrichedItems();
cartStore.reset();
```

### Order Store Methods (Upsell Management)
```javascript
const orderStore = window.NextCommerce.useOrderStore.getState();

// Upsell operations
orderStore.addUpsell(upsellData, apiClient);
orderStore.canAddUpsells();
orderStore.setUpsellError('Custom error message');
orderStore.clearErrors();
orderStore.markUpsellViewed(packageId);
orderStore.markUpsellSkipped(packageId, pagePath);
orderStore.markUpsellCompleted(packageId);
orderStore.getUpsellJourney();

// Order management
orderStore.loadOrder(refId, apiClient);
orderStore.isOrderExpired();
orderStore.getOrderTotal();
orderStore.setProcessingUpsell(true);

// Check upsell status
console.log('Upsell error:', orderStore.upsellError);
console.log('Processing upsell?', orderStore.isProcessingUpsell);
console.log('Completed upsells:', orderStore.completedUpsells);
```

### Checkout Store Methods
```javascript
const checkoutStore = window.NextCommerce.useCheckoutStore.getState();

// Form management
checkoutStore.setStep(2); // 1-3
checkoutStore.updateFormData({ email: 'test@example.com' });
checkoutStore.setError('email', 'Invalid email');
checkoutStore.clearError('email');
checkoutStore.clearAllErrors();

// Payment/shipping
checkoutStore.setPaymentToken('tok_123');
checkoutStore.setPaymentMethod('credit_card');
checkoutStore.setShippingMethod({ id: 1, name: 'Standard', price: 9.99 });
checkoutStore.setBillingAddress({ /* address data */ });
checkoutStore.setSameAsShipping(true);

// Test mode
checkoutStore.setTestMode(true);
```

### Campaign Store Methods
```javascript
const campaignStore = window.NextCommerce.useCampaignStore.getState();

// Campaign operations
campaignStore.loadCampaign(apiKey);
campaignStore.getPackage(packageId);
campaignStore.clearCache();
campaignStore.getCacheInfo();
campaignStore.reset();
```

### Config Store Methods
```javascript
const configStore = window.NextCommerce.useConfigStore.getState();

// Configuration
configStore.loadFromMeta();
configStore.loadFromWindow();
configStore.updateConfig({ debug: true });
configStore.setSpreedlyEnvironmentKey('key_123');
```

## Complete Event List

All 47 events emitted by the SDK:

### Cart Events
```javascript
window.next.on('cart:updated', (state) => console.log('Cart state:', state));
window.next.on('cart:item-added', ({ packageId, quantity, source }) => {});
window.next.on('cart:item-removed', ({ packageId }) => {});
window.next.on('cart:quantity-changed', ({ packageId, quantity, oldQuantity }) => {});
```

### Order Events
```javascript
window.next.on('order:completed', (orderData) => {
  console.log('Order completed:', orderData.ref_id);
});
window.next.on('order:redirect-missing', ({ order }) => {});
```

### Upsell Events
```javascript
window.next.on('upsell:initialized', ({ packageId, element }) => {});
window.next.on('upsell:adding', ({ packageId }) => console.log('Adding upsell...'));
window.next.on('upsell:added', ({ packageId, order }) => console.log('Upsell added!'));
window.next.on('upsell:error', ({ packageId, error }) => {
  console.error('Upsell failed:', error);
  alert(`Unable to add offer: ${error}`);
});
window.next.on('upsell:accepted', ({ packageId, quantity, orderId }) => {});
window.next.on('upsell:skipped', ({ packageId }) => {});
window.next.on('upsell-selector:item-selected', ({ selectorId, packageId }) => {});
```

### Checkout Events
```javascript
window.next.on('checkout:started', ({ formData, paymentMethod }) => {});
window.next.on('checkout:form-initialized', ({ form }) => {});
window.next.on('checkout:spreedly-ready', () => {});
```

### Payment Events
```javascript
window.next.on('payment:tokenized', ({ token, pmData, paymentMethod }) => {});
window.next.on('payment:error', ({ errors }) => {});
```

### Express Checkout Events
```javascript
window.next.on('checkout:express-started', ({ method }) => {});
window.next.on('checkout:express-completed', ({ method, success }) => {});
window.next.on('checkout:express-failed', ({ method, error }) => {});
window.next.on('express-checkout:initialized', ({ method, element }) => {});
window.next.on('express-checkout:error', ({ method, error }) => {});
window.next.on('express-checkout:started', ({ method, cartTotal, itemCount }) => {});
window.next.on('express-checkout:failed', ({ method, error }) => {});
window.next.on('express-checkout:completed', ({ method, order }) => {});
window.next.on('express-checkout:redirect-missing', ({ order }) => {});
```

### Selector Events
```javascript
window.next.on('selector:item-selected', ({ selectorId, packageId, previousPackageId }) => {});
window.next.on('selector:action-completed', ({ selectorId, packageId }) => {});
window.next.on('selector:selection-changed', ({ selectorId, packageId, quantity }) => {});
```

### Shipping Events
```javascript
window.next.on('shipping:method-selected', ({ shippingId, selectorId }) => {});
window.next.on('shipping:method-changed', ({ methodId, method }) => {});
```

### Coupon Events
```javascript
window.next.on('coupon:applied', ({ coupon }) => {});
window.next.on('coupon:removed', ({ code }) => {});
window.next.on('coupon:validation-failed', ({ code, message }) => {});
```

### UI Events
```javascript
window.next.on('accordion:toggled', ({ id, isOpen, element }) => {});
window.next.on('accordion:opened', ({ id, element }) => {});
window.next.on('accordion:closed', ({ id, element }) => {});
```

### Address Events
```javascript
window.next.on('address:autocomplete-filled', ({ type, components }) => {});
window.next.on('address:location-fields-shown', () => {});
```

### Action Events
```javascript
window.next.on('action:success', ({ action, data }) => {});
window.next.on('action:failed', ({ action, error, enhancer, element }) => {});
```

### System Events
```javascript
window.next.on('campaign:loaded', (campaign) => {});
window.next.on('config:updated', (config) => {});
window.next.on('error:occurred', ({ message, code, details }) => {});
window.next.on('timer:expired', ({ persistenceId }) => {});
window.next.on('message:displayed', ({ message, type }) => {});
```

## Debug Utilities

These utilities are only available when debug mode is enabled. Add `?debugger=true` to your URL to enable.

```javascript
// Check if debug mode is enabled
if (!window.nextDebug) {
  console.log('⚠️ Debug mode not enabled. Add ?debugger=true to URL');
} else {
  console.log('✅ Debug mode active!');
}
```

### Debug Cart Operations

```javascript
// 1. Add test items quickly
window.nextDebug.addTestItems();
console.log('✅ Test items added');

// 2. Add specific item with quantity
window.nextDebug.addToCart(7, 2); // Add 2 of package 7

// 3. Remove item
window.nextDebug.removeFromCart(7);

// 4. Update quantity
window.nextDebug.updateQuantity(7, 5);
```

### Debug Store Access

```javascript
// 1. Access all store states
console.log('Cart Store:', window.nextDebug.stores.cart.getState());
console.log('Campaign Store:', window.nextDebug.stores.campaign.getState());
console.log('Order Store:', window.nextDebug.stores.order.getState());
console.log('Config Store:', window.nextDebug.stores.config.getState());
console.log('Checkout Store:', window.nextDebug.stores.checkout.getState());
console.log('Attribution Store:', window.nextDebug.stores.attribution.getState());

// 2. Get specific store data
const cartItems = window.nextDebug.stores.cart.getState().items;
console.table(cartItems);

// 3. Watch store changes
const unsubscribe = window.nextDebug.stores.cart.subscribe((state) => {
  console.log('Cart changed:', state.items);
});
// Call unsubscribe() to stop watching
```

### Debug Campaign Tools

```javascript
// 1. Inspect package details
window.nextDebug.inspectPackage(2);

// 2. Get cache information
window.nextDebug.getCacheInfo();

// 3. Clear campaign cache
window.nextDebug.clearCampaignCache();
console.log('✅ Campaign cache cleared');

// 4. Reload campaign
window.nextDebug.loadCampaign()
  .then(() => console.log('✅ Campaign reloaded'))
  .catch(err => console.error('❌ Failed to reload:', err));
```

### Debug Attribution Tools

```javascript
// 1. View current attribution
window.nextDebug.attribution.debug();

// 2. Get attribution data
const attribution = window.nextDebug.attribution.get();
console.log('Attribution:', attribution);

// 3. Get/Set funnel name
console.log('Current funnel:', window.nextDebug.attribution.getFunnel());
window.nextDebug.attribution.setFunnel('console-test-funnel');

// 4. Set Everflow click ID
window.nextDebug.attribution.setEvclid('test-click-id-123');

// 5. Clear funnel data
window.nextDebug.attribution.clearFunnel();
```

### Debug Order/Upsell Tools

```javascript
// 1. Get order statistics
console.log('Order Stats:', window.nextDebug.order.getStats());

// 2. View upsell journey
console.log('Upsell Journey:', window.nextDebug.order.getJourney());

// 3. Load order by ref_id
window.nextDebug.order.load('12345')
  .then(() => console.log('✅ Order loaded'))
  .catch(err => console.error('❌ Failed to load order:', err));

// 4. Check upsell support
console.log('Can add upsells?', window.nextDebug.order.canAddUpsells());
```

### Debug Accordion Controls

```javascript
// Control accordion elements programmatically
window.nextDebug.accordion.open('accordion-1');
window.nextDebug.accordion.close('accordion-1');
window.nextDebug.accordion.toggle('accordion-1');
```

### Debug Overlay Controls

```javascript
// When debug mode is active
window.nextDebug.overlay.show();
window.nextDebug.overlay.hide();
window.nextDebug.overlay.toggle();

// Debug mode control
window.nextDebug.enableDebug();
window.nextDebug.disableDebug();
window.nextDebug.toggleDebug();
window.nextDebug.isDebugMode();
```

## Hidden Features

### 1. Test Mode Activation

```javascript
// Method 1: URL parameter
window.location.href += '?test=true';

// Method 2: Konami Code (↑↑↓↓←→←→BA)
// Type the sequence on your keyboard to activate test mode

// Method 3: Direct activation (if available)
window.testModeManager?.activate();
```

### 2. Storage Utilities

```javascript
// Access storage managers
const { sessionStorageManager, localStorageManager } = window.NextCommerce;

// Advanced storage operations
sessionStorageManager.set('test', { data: 'value' });
sessionStorageManager.get('test');
sessionStorageManager.remove('test');
sessionStorageManager.clear();
sessionStorageManager.keys();
sessionStorageManager.size();

// Cross-tab synchronization
sessionStorageManager.onStorageChange((key, value) => {
  console.log('Storage changed:', key, value);
});
```

### 3. Attribution Collector

```javascript
// Access attribution data
const attributionStore = window.NextCommerce.useAttributionStore.getState();

// Get full attribution
const attribution = attributionStore.getAttributionForApi();
console.log('Attribution:', attribution);

// Set custom values
attributionStore.setFunnelName('my-funnel');
attributionStore.setEverflowClickId('click-123');
attributionStore.updateAttribution({
  metadata: { custom_field: 'value' }
});
```

### 4. Price Calculator

```javascript
// Advanced pricing calculations
const { PriceCalculator } = window.NextCommerce;

const metrics = PriceCalculator.calculatePackageMetrics(
  packageData,
  quantity,
  compareAtPrice
);
console.log('Package metrics:', metrics);
```

### 5. Country Service

```javascript
// Country utilities
const { CountryService } = window.NextCommerce;

// Get country configuration
const usConfig = CountryService.getCountryConfig('US');
console.log('US Config:', usConfig);

// Validate postal code
const isValid = CountryService.validatePostalCode('90210', 'US');
console.log('Valid postal code?', isValid);

// Get states for country
const states = CountryService.getStatesForCountry('US');
console.log('US States:', states);
```

### 6. Type Guards and Validation

```javascript
// Type validation utilities
const { validateOrThrow, isValidPrice, isValidPackageId } = window.NextCommerce;

try {
  validateOrThrow(data, schema, 'CustomData');
} catch (error) {
  console.error('Validation failed:', error);
}
```

### 7. URL Utilities

```javascript
// URL parameter preservation
const { preserveQueryParams, navigateWithParams, isDebugMode } = window.NextCommerce;

// Navigate preserving debug params
navigateWithParams('/checkout', { step: 2 });

// Check debug mode
console.log('Debug mode?', isDebugMode());
```

### 8. Storage Keys Reference

```javascript
// Useful storage keys for debugging
const storageKeys = {
  cart: 'next-cart-state',
  config: 'next-config-state',
  campaign: 'next-campaign-cache',
  timer: 'next-timer-*',
  attribution: 'next-attribution',
  country: 'next_country_*',
  everflow: 'evclid',
  funnel: 'next_funnel_name'
};

// Check what's stored
Object.entries(storageKeys).forEach(([name, key]) => {
  const value = localStorage.getItem(key) || sessionStorage.getItem(key);
  if (value) console.log(`${name}:`, value);
});
```

## Advanced Patterns

### Monitor All Events

```javascript
// Get all event names from the SDK
const allEvents = [
  'cart:updated', 'cart:item-added', 'cart:item-removed', 'cart:quantity-changed',
  'order:completed', 'order:redirect-missing',
  'upsell:initialized', 'upsell:adding', 'upsell:added', 'upsell:error', 'upsell:skipped',
  'checkout:started', 'checkout:form-initialized',
  'payment:tokenized', 'payment:error',
  'coupon:applied', 'coupon:removed', 'coupon:validation-failed',
  'shipping:method-changed',
  'action:success', 'action:failed',
  'error:occurred'
];

// Monitor all events
allEvents.forEach(event => {
  window.next.on(event, (data) => {
    console.log(`📡 ${event}:`, data);
  });
});
```

### Complete Cart Test Sequence

```javascript
// Run a complete cart test sequence
(async () => {
  console.log('🧪 Starting cart test sequence...\n');
  
  try {
    // 1. Clear cart
    await window.next.clearCart();
    console.log('✓ Cart cleared');
    
    // 2. Add multiple items
    await window.next.addItem({ packageId: 2, quantity: 1 });
    console.log('✓ Added package 2 (qty: 1)');
    
    await window.next.addItem({ packageId: 7, quantity: 2 });
    console.log('✓ Added package 7 (qty: 2)');
    
    // 3. Show cart state
    console.log('\n📊 Cart State:');
    console.log('Items:', window.next.getCartCount());
    console.log('Totals:', window.next.getCartTotals());
    
    // 4. Update quantity
    await window.next.updateQuantity({ packageId: 2, quantity: 3 });
    console.log('\n✓ Updated package 2 quantity to 3');
    
    // 5. Apply coupon
    const couponResult = await window.next.applyCoupon('TEST10');
    console.log('✓ Coupon applied:', couponResult);
    
    // 6. Final state
    console.log('\n📊 Final Cart State:');
    const finalData = window.next.getCartData();
    console.table(finalData.cartLines);
    console.log('Final Totals:', finalData.cartTotals);
    
    console.log('\n✅ Test sequence complete!');
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
})();
```

### Direct API Client Usage

```javascript
// Create API client instance
const { ApiClient } = window.NextCommerce;
const configStore = window.NextCommerce.useConfigStore.getState();
const apiClient = new ApiClient(configStore.apiKey);

// Use API directly
apiClient.getCampaigns().then(data => console.log('Campaigns:', data));
apiClient.getOrder('ref-123').then(order => console.log('Order:', order));

// Add upsell directly
apiClient.addUpsell('ref-123', {
  packageId: 7,
  quantity: 1
}).then(result => console.log('Upsell added:', result));
```

## Upsell Error Handling

### Complete Upsell Management Setup

```javascript
// Comprehensive upsell error handling and management
(() => {
  console.log('🎯 Setting up complete upsell management...\n');
  
  // 1. Listen for all upsell events
  window.next.on('upsell:error', (data) => {
    console.error('🚨 Upsell Error:', {
      packageId: data.packageId,
      error: data.error,
      timestamp: new Date().toISOString()
    });
    
    // Show user-friendly error
    alert(`Unable to add this offer to your order. ${data.error}`);
    
    // Access order store to check state
    const orderStore = window.NextCommerce.useOrderStore.getState();
    console.log('Order state:', {
      upsellError: orderStore.upsellError,
      isProcessing: orderStore.isProcessingUpsell,
      canAddMore: orderStore.canAddUpsells()
    });
  });
  
  window.next.on('upsell:added', (data) => {
    console.log('✅ Upsell Successfully Added:', data);
    
    // Check journey
    const orderStore = window.NextCommerce.useOrderStore.getState();
    console.log('Upsell journey:', orderStore.getUpsellJourney());
  });
  
  window.next.on('upsell:adding', (data) => {
    console.log('⏳ Adding upsell...', data);
  });
  
  window.next.on('upsell:skipped', (data) => {
    console.log('⏭️ Upsell Skipped:', data);
  });
  
  // 2. Monitor action failures
  window.next.on('action:failed', (data) => {
    if (data.enhancer === 'AcceptUpsellEnhancer' || data.enhancer === 'UpsellEnhancer') {
      console.error('🚨 Upsell Action Failed:', {
        enhancer: data.enhancer,
        action: data.action,
        error: data.error,
        element: data.element
      });
    }
  });
  
  console.log('✅ Upsell management active!');
})();
```

### Test Upsell Operations

```javascript
// Direct upsell operations (requires order to be loaded)
(async () => {
  const orderStore = window.NextCommerce.useOrderStore.getState();
  const configStore = window.NextCommerce.useConfigStore.getState();
  const { ApiClient } = window.NextCommerce;
  
  // Check if order is loaded
  if (!orderStore.order) {
    console.log('No order loaded. Load an order first with ref_id parameter.');
    return;
  }
  
  console.log('Current order:', orderStore.order.number);
  console.log('Can add upsells?', orderStore.canAddUpsells());
  
  if (orderStore.canAddUpsells()) {
    // Try to add an upsell
    const apiClient = new ApiClient(configStore.apiKey);
    
    try {
      await orderStore.addUpsell({
        packageId: 7,
        quantity: 1
      }, apiClient);
      
      console.log('✅ Upsell added successfully!');
    } catch (error) {
      console.error('❌ Failed to add upsell:', error);
    }
  }
})();
```

### Manual Upsell Error Testing

```javascript
// Test error states (debug mode required)
if (window.nextDebug) {
  const orderStore = window.nextDebug.stores.order.getState();
  
  // Set test error
  orderStore.setUpsellError('Test error: Package not available');
  console.log('✅ Test error set. Check UI for error display.');
  
  // Clear after 5 seconds
  setTimeout(() => {
    orderStore.setUpsellError(null);
    console.log('✅ Error cleared');
  }, 5000);
  
  // Check complete state
  console.log('Order state:', {
    order: orderStore.order,
    upsellError: orderStore.upsellError,
    isProcessingUpsell: orderStore.isProcessingUpsell,
    completedUpsells: orderStore.completedUpsells,
    upsellJourney: orderStore.upsellJourney
  });
}
```

## Tips and Notes

1. **Enable Debug Mode**: Add `?debugger=true` to your URL to access `window.nextDebug`
2. **Check SDK Status**: Run `window.next` in console to verify SDK is loaded
3. **Module Exports**: Access module exports via `window.NextCommerce` (e.g., `window.NextCommerce.useCartStore`)
4. **Event Names**: All events are lowercase with dots (e.g., `cart.updated`) or colon-separated (e.g., `upsell:error`)
5. **Async Operations**: Most operations return Promises - use `await` or `.then()`
6. **Error Handling**: Always include `.catch()` for Promise-based operations
7. **Test Mode**: Activate with `?test=true` or Konami code for test credit cards
8. **Storage Sync**: Changes to cart/config sync across browser tabs automatically

## Common Troubleshooting

```javascript
// 1. Check if SDK is loaded
console.log('SDK loaded?', typeof window.next !== 'undefined');

// 2. Check debug mode
console.log('Debug enabled?', typeof window.nextDebug !== 'undefined');

// 3. Get SDK initialization stats (debug mode)
if (window.nextDebug) {
  console.log('Config:', window.nextDebug.stores.config.getState());
}

// 4. Force reload campaign data (debug mode)
if (window.nextDebug) {
  window.nextDebug.clearCampaignCache();
  window.nextDebug.loadCampaign();
}

// 5. Check all store states
Object.entries(window.NextCommerce).forEach(([key, value]) => {
  if (key.startsWith('use') && key.endsWith('Store')) {
    console.log(`${key}:`, value.getState());
  }
});

// 6. Enable verbose logging
localStorage.setItem('next-debug', 'true');
console.log('Verbose logging enabled. Refresh page.');
```

## Quick Reference Card

```javascript
// 🛒 Cart
window.next.addItem({ packageId: 2, quantity: 1 })
window.next.removeItem({ packageId: 2 })
window.next.updateQuantity({ packageId: 2, quantity: 3 })
window.next.clearCart()
window.next.getCartData()

// 💳 Checkout
window.next.validateCheckout()
window.next.applyCoupon('CODE')
window.next.setShippingMethod(1)

// 📦 Orders & Upsells
const orderStore = window.NextCommerce.useOrderStore.getState()
orderStore.canAddUpsells()
orderStore.addUpsell({ packageId: 7 }, apiClient)
orderStore.getUpsellJourney()

// 📡 Events
window.next.on('upsell:error', handler)
window.next.on('cart:updated', handler)
window.next.on('order:completed', handler)

// 🐛 Debug (add ?debugger=true)
window.nextDebug.stores.cart.getState()
window.nextDebug.addTestItems()
window.nextDebug.inspectPackage(2)

// 🔧 Advanced
window.NextCommerce.useCartStore.getState().swapPackage(old, new)
window.NextCommerce.ApiClient
window.NextCommerce.PriceCalculator
```

This guide covers ALL available methods, events, and features in the NextCommerce SDK. Save this file for reference!