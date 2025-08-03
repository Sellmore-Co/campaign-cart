# NextCommerce JavaScript API Summary

This document provides a quick reference of all available methods in the NextCommerce SDK (`window.next`).

## Production API Methods

### Cart Management
**Note:** Cart methods that accept parameters require an options object, not direct values.

- `addItem({ packageId, quantity? })` - Add item to cart *(not `addItem(123)`)*
- `removeItem({ packageId })` - Remove item from cart *(not `removeItem(123)`)*
- `updateQuantity({ packageId, quantity })` - Update item quantity *(not `updateQuantity(123, 5)`)*
- `clearCart()` - Remove all items
- `hasItemInCart({ packageId })` - Check if item exists *(not `hasItemInCart(123)`)*
- `getCartData()` - Get comprehensive cart data
- `getCartTotals()` - Get cart pricing totals
- `getCartCount()` - Get total item count

### Campaign & Package Data
- `getCampaignData()` - Get campaign configuration
- `getPackage(id)` - Get specific package details

### Coupons
- `applyCoupon(code)` - Apply discount code
- `removeCoupon(code)` - Remove discount code
- `getCoupons()` - Get applied coupons
- `validateCoupon(code)` - Validate without applying
- `calculateDiscountAmount(coupon)` - Calculate discount amount

### Shipping
- `getShippingMethods()` - Get available methods
- `getSelectedShippingMethod()` - Get current selection
- `setShippingMethod(methodId)` - Set shipping method

### Tracking & Analytics
- `trackViewItemList(packageIds, listId?, listName?)` - Track list views
- `trackViewItem(packageId)` - Track single item view
- `trackAddToCart(packageId, quantity?)` - Track add to cart
- `trackRemoveFromCart(packageId, quantity?)` - Track removal
- `trackBeginCheckout()` - Track checkout start
- `trackPurchase(orderData)` - Track purchase completion
- `trackCustomEvent(eventName, data?)` - Track custom events
- `trackSignUp(email)` - Track user signup
- `trackLogin(email)` - Track user login
- `setDebugMode(enabled)` - Enable analytics debugging
- `invalidateAnalyticsContext()` - Reset analytics context

### Upsells (Post-Purchase)
- `addUpsell({ packageId?, quantity?, items? })` - Add upsell to order
- `canAddUpsells()` - Check if upsells available
- `getCompletedUpsells()` - Get added upsell IDs
- `isUpsellAlreadyAdded(packageId)` - Check if already added

### Behavioral Features
- `fomo(config?)` - Start FOMO popups
- `stopFomo()` - Stop FOMO popups
- `exitIntent({ image, action? })` - Show exit intent popup
- `disableExitIntent()` - Disable exit intent

### Events
- `on(event, handler)` - Subscribe to events
- `off(event, handler)` - Unsubscribe from events

### Callbacks (Legacy)
- `registerCallback(type, callback)` - Register lifecycle callback
- `unregisterCallback(type, callback)` - Remove lifecycle callback
- Available callback types:
  - `beforeRender`, `afterRender`
  - `beforeCheckout`, `afterCheckout`
  - `beforeRedirect`
  - `itemAdded`, `itemRemoved`, `cartCleared`

### Utilities
- `formatPrice(amount, currency?)` - Format price display
- `validateCheckout()` - Validate cart for checkout

## Debug API Methods (`window.nextDebug`)

Available when `?debugger=true` is in URL.

### Store Access
- `stores.cart` - Cart store access
- `stores.campaign` - Campaign store access
- `stores.config` - Config store access
- `stores.checkout` - Checkout store access
- `stores.order` - Order store access
- `stores.attribution` - Attribution store access

### Cart Testing
- `addToCart(packageId, quantity?)` - Quick add to cart
- `removeFromCart(packageId)` - Quick remove
- `updateQuantity(packageId, quantity)` - Quick update
- `addTestItems()` - Add preset test items

### Campaign Tools
- `loadCampaign()` - Reload campaign data
- `clearCampaignCache()` - Clear cache
- `getCacheInfo()` - Get cache details
- `inspectPackage(packageId)` - Inspect package
- `testShippingMethod(methodId)` - Test shipping

### Analytics Debug
- `analytics.getStatus()` - Get analytics status
- `analytics.getProviders()` - Get loaded providers
- `analytics.track(name, data)` - Track test event
- `analytics.setDebugMode(enabled)` - Toggle debug mode
- `analytics.invalidateContext()` - Reset context

### Attribution Debug
- `attribution.debug()` - Show attribution data
- `attribution.get()` - Get attribution for API
- `attribution.setFunnel(name)` - Set funnel name
- `attribution.setEvclid(id)` - Set Everflow ID
- `attribution.getFunnel()` - Get current funnel
- `attribution.clearFunnel()` - Clear funnel

### System Tools
- `sdk` - Direct SDK instance access
- `getStats()` - Get initialization stats
- `reinitialize()` - Reinitialize SDK
- `testMode` - Test mode controls
- `overlay` - Debug overlay controls

## Event Types

### Cart Events
- `cart:updated` - Cart state changed
- `cart:item-added` - Item added
- `cart:item-removed` - Item removed
- `cart:quantity-changed` - Quantity updated

### Checkout & Order Events
- `checkout:started` - Checkout began
- `checkout:form-initialized` - Form ready
- `order:completed` - Order finished
- `payment:tokenized` - Payment tokenized
- `payment:error` - Payment failed

### Coupon Events
- `coupon:applied` - Coupon applied
- `coupon:removed` - Coupon removed

### Upsell Events
- `upsell:viewed` - Upsell displayed
- `upsell:accepted` - Upsell accepted
- `upsell:added` - Upsell added to order
- `upsell:skipped` - Upsell skipped

### Other Events
- `campaign:loaded` - Campaign data loaded
- `config:updated` - Config changed
- `error:occurred` - Error happened
- `fomo:shown` - FOMO popup shown
- `route:changed` - Route changed

## Initialization System

### Ready Queue
```javascript
// Queue callbacks before SDK loads
window.nextReady = window.nextReady || [];
window.nextReady.push(function() {
  // SDK is ready
});
```

### DOM Events

Listen on `document`:
- `next:ready` - SDK module loaded (early)
- `next:initialized` - SDK fully initialized (recommended)
- `next:cart-updated` - Cart updated
- `next:item-added` - Item added
- `next:item-removed` - Item removed
- `next:checkout-started` - Checkout started
- `next:payment-success` - Payment succeeded
- `next:payment-error` - Payment failed
- `next:timer-expired` - Timer expired