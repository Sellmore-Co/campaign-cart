# Campaign Cart SDKv v0.2.0 - Complete Methods Reference

A comprehensive list of all available methods, utilities, and functions in the Campaign Cart SDKv v0.2.0.

## Table of Contents

- [Public API Methods (`window.next`)](#public-api-methods-windownext)
- [Debug API Methods (`window.nextDebug`)](#debug-api-methods-windownextdebug)
- [Store Methods (Internal)](#store-methods-internal)
- [Enhancer Methods](#enhancer-methods)
- [Utility Functions](#utility-functions)
- [Event Methods](#event-methods)

---

## Public API Methods (`window.next`)

These methods are available via the global `window.next` object after SDK initialization.

### Cart Management

| Method | Signature | Description |
|--------|-----------|-------------|
| `addItem` | `(options) => Promise<void>` | Adds an item to the cart |
| `removeItem` | `(options) => Promise<void>` | Removes an item from the cart |
| `updateQuantity` | `(options) => Promise<void>` | Updates item quantity in cart |
| `clearCart` | `() => Promise<void>` | Removes all items from cart |
| `hasItemInCart` | `(options) => boolean` | Checks if item is in cart |
| `getCartData` | `() => CartData` | Returns comprehensive cart data |
| `getCartTotals` | `() => CartTotals` | Returns cart pricing totals |
| `getCartCount` | `() => number` | Returns total item count |

### Package Profiles

| Method | Signature | Description |
|--------|-----------|-------------|
| `getPackageProfiles` | `() => Record<string, PackageProfile>` | Gets all package profiles |
| `resolvePackageProfile` | `(profileName) => ResolvedProfile \| null` | Resolves profile details |
| `addProfileBundle` | `(profileName) => Promise<void>` | Adds profile bundle to cart |
| `removeProfileBundle` | `(profileName) => Promise<void>` | Removes profile bundle from cart |
| `evaluateProfileConditions` | `(profileName) => boolean` | Checks if profile conditions are met |
| `getProfileDisplay` | `(profileName, property) => string \| undefined` | Gets profile display property |

### Tracking & Analytics

| Method | Signature | Description |
|--------|-----------|-------------|
| `trackViewItemList` | `(packageIds, listId?, listName?) => Promise<void>` | Tracks product list views |
| `trackAddToCart` | `(packageId, quantity?) => Promise<void>` | Tracks cart additions |
| `trackRemoveFromCart` | `(packageId, quantity?) => Promise<void>` | Tracks cart removals |
| `trackBeginCheckout` | `() => Promise<void>` | Tracks checkout initiation |
| `trackPurchase` | `(transactionId, value?) => Promise<void>` | Tracks completed purchases |
| `trackViewItem` | `(packageId) => Promise<void>` | Tracks single item views |
| `trackCustomEvent` | `(eventName, data?) => Promise<void>` | Tracks custom events |

### Campaign Data

| Method | Signature | Description |
|--------|-----------|-------------|
| `getCampaignData` | `() => Campaign \| null` | Gets loaded campaign data |
| `getPackage` | `(id) => Package \| null` | Gets package by ID |

### Coupons

| Method | Signature | Description |
|--------|-----------|-------------|
| `applyCoupon` | `(code) => Promise<{success: boolean, message: string}>` | Applies coupon code |
| `removeCoupon` | `(code) => void` | Removes coupon from cart |
| `getCoupons` | `() => AppliedCoupon[]` | Gets applied coupons |
| `validateCoupon` | `(code) => {valid: boolean, message?: string}` | Validates coupon without applying |

### Event Handling

| Method | Signature | Description |
|--------|-----------|-------------|
| `on` | `(event, handler) => void` | Subscribe to internal events |
| `off` | `(event, handler) => void` | Unsubscribe from internal events |
| `registerCallback` | `(type, callback) => void` | Register lifecycle callback |
| `unregisterCallback` | `(type, callback) => void` | Unregister lifecycle callback |
| `triggerCallback` | `(type, data) => void` | Trigger lifecycle callback |

### Shipping

| Method | Signature | Description |
|--------|-----------|-------------|
| `getShippingMethods` | `() => Array<{ref_id: number; code: string; price: string}>` | Gets available shipping methods |
| `getSelectedShippingMethod` | `() => {id: number; name: string; price: number; code: string} \| null` | Gets currently selected shipping method |
| `setShippingMethod` | `(methodId) => Promise<void>` | Sets shipping method by ID |

### Utilities

| Method | Signature | Description |
|--------|-----------|-------------|
| `formatPrice` | `(amount, currency?) => string` | Formats price with currency |
| `validateCheckout` | `() => {valid: boolean, errors?: string[]}` | Validates checkout readiness |

---

## Debug API Methods (`window.nextDebug`)

These methods are available only when debug mode is enabled (`?debugger=true`).

### Store Access

| Property | Type | Description |
|----------|------|-------------|
| `stores.cart` | `Store<CartState>` | Direct cart store access |
| `stores.campaign` | `Store<CampaignState>` | Direct campaign store access |
| `stores.config` | `Store<ConfigState>` | Direct config store access |
| `stores.checkout` | `Store<CheckoutState>` | Direct checkout store access |
| `stores.order` | `Store<OrderState>` | Direct order store access |
| `stores.attribution` | `Store<AttributionState>` | Direct attribution store access |

### Tracking Utilities

| Method | Signature | Description |
|--------|-----------|-------------|
| `tracking.viewItemList` | `(packageIds, listId?, listName?) => void` | Debug track view item list |
| `tracking.addToCart` | `(packageId, quantity?) => void` | Debug track add to cart |
| `tracking.removeFromCart` | `(packageId, quantity?) => void` | Debug track remove from cart |
| `tracking.beginCheckout` | `() => void` | Debug track begin checkout |
| `tracking.purchase` | `(transactionId, value?) => void` | Debug track purchase |
| `tracking.viewItem` | `(packageId) => void` | Debug track view item |
| `tracking.custom` | `(eventName, data?) => void` | Debug track custom event |
| `tracking.getStatus` | `() => {enabled: boolean, initialized: boolean}` | Get tracking status |

### Cart Utilities

| Method | Signature | Description |
|--------|-----------|-------------|
| `addToCart` | `(packageId, quantity?) => void` | Quick add to cart for testing |
| `removeFromCart` | `(packageId) => void` | Quick remove from cart for testing |
| `updateQuantity` | `(packageId, quantity) => void` | Quick quantity update for testing |
| `addTestItems` | `() => void` | Adds predefined test items |

### Campaign Utilities

| Method | Signature | Description |
|--------|-----------|-------------|
| `loadCampaign` | `() => Promise<void>` | Reload campaign data |
| `clearCampaignCache` | `() => void` | Clear campaign cache |
| `getCacheInfo` | `() => CacheInfo` | Get cache information |
| `inspectPackage` | `(packageId) => void` | Log detailed package info |
| `sortPackages` | `(sortBy) => void` | Test package sorting |
| `testShippingMethod` | `(methodId) => void` | Test shipping calculation |

### Analytics Utilities

| Property | Type | Description |
|----------|------|-------------|
| `analytics` | `AnalyticsManager` | Direct analytics manager access |
| `analytics.isLoaded` | `() => boolean` | Check if analytics loaded |
| `analytics.isLoading` | `() => boolean` | Check if analytics loading |
| `analytics.trackEvent` | `(name, data) => Promise<void>` | Track analytics event |
| `analytics.trackPageView` | `() => Promise<void>` | Track page view |

### Attribution Utilities

| Method | Signature | Description |
|--------|-----------|-------------|
| `attribution.debug` | `() => void` | Debug attribution data |
| `attribution.get` | `() => AttributionData` | Get attribution for API |
| `attribution.setFunnel` | `(funnel) => void` | Set funnel name |
| `attribution.setEvclid` | `(evclid) => void` | Set Everflow click ID |

### System Utilities

| Method | Signature | Description |
|--------|-----------|-------------|
| `sdk` | `NextCommerce` | Direct SDK instance access |
| `getStats` | `() => InitializationStats` | Get initialization statistics |
| `reinitialize` | `() => Promise<void>` | Reinitialize entire SDK |
| `overlay` | `DebugOverlay` | Debug overlay instance |
| `testMode` | `TestModeManager` | Test mode manager |

### UI Utilities

| Method | Signature | Description |
|--------|-----------|-------------|
| `accordion.open` | `(id) => void` | Open accordion by ID |
| `accordion.close` | `(id) => void` | Close accordion by ID |
| `accordion.toggle` | `(id) => void` | Toggle accordion by ID |
| `highlightElement` | `(selector) => void` | Highlight page elements |

---

## Store Methods (Internal)

These methods are available on individual store instances.

### Cart Store (`useCartStore`)

| Method | Signature | Description |
|--------|-----------|-------------|
| `addItem` | `(item) => Promise<void>` | Add item to cart |
| `removeItem` | `(packageId) => Promise<void>` | Remove item from cart |
| `updateQuantity` | `(packageId, quantity) => Promise<void>` | Update item quantity |
| `addItemByProfile` | `(profileName, quantity) => Promise<void>` | Add item by profile |
| `removeItemByProfile` | `(profileName) => Promise<void>` | Remove item by profile |
| `updateQuantityByProfile` | `(profileName, quantity) => Promise<void>` | Update quantity by profile |
| `swapPackage` | `(removeId, addItem) => Promise<void>` | Swap packages in cart |
| `clear` | `() => Promise<void>` | Clear entire cart |
| `syncWithAPI` | `() => Promise<void>` | Sync cart with API |
| `calculateTotals` | `() => void` | Recalculate cart totals |
| `calculateShipping` | `() => number` | Calculate shipping cost |
| `calculateTax` | `() => number` | Calculate tax amount |
| `calculateEnrichedItems` | `() => Promise<void>` | Calculate enriched cart items |
| `setShippingMethod` | `(methodId) => Promise<void>` | Set shipping method with validation |
| `hasItem` | `(packageId) => boolean` | Check if item exists |
| `getItem` | `(packageId) => CartItem \| undefined` | Get item by package ID |
| `getItemQuantity` | `(packageId) => number` | Get item quantity |
| `getTotalWeight` | `() => number` | Get total cart weight |
| `getTotalItemCount` | `() => number` | Get total item count |
| `reset` | `() => void` | Reset cart to initial state |
| `applyCoupon` | `(code) => Promise<{success: boolean, message: string}>` | Apply coupon |
| `removeCoupon` | `(code) => void` | Remove coupon |
| `getCoupons` | `() => AppliedCoupon[]` | Get applied coupons |
| `validateCoupon` | `(code) => {valid: boolean, message?: string}` | Validate coupon |
| `calculateDiscountAmount` | `(coupon) => number` | Calculate discount amount |

### Campaign Store (`useCampaignStore`)

| Method | Signature | Description |
|--------|-----------|-------------|
| `loadCampaign` | `(apiKey) => Promise<void>` | Load campaign data |
| `getPackage` | `(id) => Package \| null` | Get package by ID |
| `getAllPackages` | `() => Package[]` | Get all packages |
| `clearCache` | `() => void` | Clear campaign cache |
| `getCacheInfo` | `() => CacheInfo` | Get cache information |
| `isLoading` | `() => boolean` | Check if loading |
| `isLoaded` | `() => boolean` | Check if loaded |
| `getError` | `() => string \| null` | Get loading error |
| `reset` | `() => void` | Reset to initial state |

### Config Store (`useConfigStore`)

| Method | Signature | Description |
|--------|-----------|-------------|
| `loadFromMeta` | `() => void` | Load config from meta tags |
| `loadFromWindow` | `() => void` | Load config from window |
| `updateConfig` | `(config) => void` | Update configuration |
| `setPackageProfiles` | `(profiles) => void` | Set package profiles |
| `setSpreedlyEnvironmentKey` | `(key) => void` | Set Spreedly key |
| `reset` | `() => void` | Reset to initial state |

### Checkout Store (`useCheckoutStore`)

| Method | Signature | Description |
|--------|-----------|-------------|
| `updateFormData` | `(data) => void` | Update form data |
| `setPaymentMethod` | `(method) => void` | Set payment method |
| `setProcessing` | `(processing) => void` | Set processing state |
| `setStep` | `(step) => void` | Set checkout step |
| `validateForm` | `() => boolean` | Validate form data |
| `reset` | `() => void` | Reset checkout state |

### Order Store (`useOrderStore`)

| Method | Signature | Description |
|--------|-----------|-------------|
| `loadOrder` | `(refId, apiClient) => Promise<void>` | Load order by ref ID |
| `addUpsell` | `(upsellData, apiClient) => Promise<Order \| null>` | Add upsell to order |
| `canAddUpsells` | `() => boolean` | Check if upsells can be added |
| `hasUpsellBeenAdded` | `(packageId) => boolean` | Check if upsell was added |
| `setOrder` | `(order) => void` | Set order data |
| `clearOrder` | `() => void` | Clear order data |
| `reset` | `() => void` | Reset to initial state |

### Attribution Store (`useAttributionStore`)

| Method | Signature | Description |
|--------|-----------|-------------|
| `initialize` | `() => Promise<void>` | Initialize attribution |
| `updateAttribution` | `(data) => void` | Update attribution data |
| `setFunnelName` | `(name) => void` | Set funnel name |
| `setEverflowClickId` | `(clickId) => void` | Set Everflow click ID |
| `getAttributionForApi` | `() => AttributionData` | Get attribution for API |
| `debug` | `() => void` | Debug attribution data |
| `reset` | `() => void` | Reset to initial state |

---

## Enhancer Methods

These methods are available on enhancer instances.

### Base Enhancer

| Method | Signature | Description |
|--------|-----------|-------------|
| `initialize` | `() => Promise<void>` | Initialize enhancer |
| `destroy` | `() => void` | Destroy enhancer |
| `update` | `() => void` | Update enhancer state |
| `getAttribute` | `(name) => string \| null` | Get element attribute |
| `setAttribute` | `(name, value) => void` | Set element attribute |
| `hasAttribute` | `(name) => boolean` | Check if attribute exists |
| `removeAttribute` | `(name) => void` | Remove element attribute |
| `addClass` | `(className) => void` | Add CSS class |
| `removeClass` | `(className) => void` | Remove CSS class |
| `toggleClass` | `(className, force?) => void` | Toggle CSS class |
| `updateTextContent` | `(content) => void` | Update element text |
| `updateInnerHTML` | `(html) => void` | Update element HTML |
| `subscribe` | `(store, callback) => void` | Subscribe to store changes |
| `emit` | `(event, data) => void` | Emit internal event |

### Display Enhancers

#### Cart Display Enhancer

| Method | Signature | Description |
|--------|-----------|-------------|
| `getPropertyValue` | `() => any` | Get cart property value |
| `parseDisplayAttributes` | `() => void` | Parse display attributes |
| `updateDisplay` | `() => void` | Update display content |

#### Product Display Enhancer

| Method | Signature | Description |
|--------|-----------|-------------|
| `getPropertyValue` | `() => any` | Get product property value |
| `findContextPackageId` | `() => number \| undefined` | Find package ID from context |
| `updateDisplay` | `() => void` | Update display content |

### Cart Enhancers

#### Cart Toggle Enhancer

| Method | Signature | Description |
|--------|-----------|-------------|
| `handleClick` | `(event) => Promise<void>` | Handle toggle click |
| `addToCart` | `() => Promise<void>` | Add item to cart |
| `removeFromCart` | `() => Promise<void>` | Remove item from cart |
| `updateState` | `(cartState) => void` | Update toggle state |
| `isInCart` | `(cartState) => boolean` | Check if item in cart |

#### Package Selector Enhancer

| Method | Signature | Description |
|--------|-----------|-------------|
| `handleSelection` | `(packageId) => Promise<void>` | Handle package selection |
| `updateSelectionState` | `() => void` | Update selection UI |
| `findSelectorItems` | `() => SelectorItem[]` | Find selector items |

### Checkout Enhancers

#### Checkout Form Enhancer

| Method | Signature | Description |
|--------|-----------|-------------|
| `initializeForm` | `() => void` | Initialize checkout form |
| `handleSubmit` | `(event) => Promise<void>` | Handle form submission |
| `validateForm` | `() => boolean` | Validate form data |
| `setupPaymentIntegration` | `() => void` | Setup payment processing |

---

## Utility Functions

### Logger

| Function | Signature | Description |
|----------|-----------|-------------|
| `createLogger` | `(namespace) => Logger` | Create namespaced logger |
| `Logger.info` | `(message, ...args) => void` | Log info message |
| `Logger.warn` | `(message, ...args) => void` | Log warning message |
| `Logger.error` | `(message, ...args) => void` | Log error message |
| `Logger.debug` | `(message, ...args) => void` | Log debug message |

### Storage

| Function | Signature | Description |
|----------|-----------|-------------|
| `sessionStorageManager.getItem` | `(key) => any` | Get item from session storage |
| `sessionStorageManager.setItem` | `(key, value) => void` | Set item in session storage |
| `sessionStorageManager.removeItem` | `(key) => void` | Remove item from session storage |
| `sessionStorageManager.clear` | `() => void` | Clear session storage |

### Template Renderer

| Function | Signature | Description |
|----------|-----------|-------------|
| `TemplateRenderer.render` | `(template, data) => string` | Render template with data |
| `TemplateRenderer.parseTemplate` | `(template) => ParsedTemplate` | Parse template string |

### Analytics

| Function | Signature | Description |
|----------|-----------|-------------|
| `analyticsManager.loadAnalyticsSDK` | `() => Promise<void>` | Load analytics SDK |
| `analyticsManager.trackEvent` | `(name, data) => Promise<void>` | Track analytics event |
| `analyticsManager.trackPageView` | `() => Promise<void>` | Track page view |
| `analyticsManager.isLoaded` | `() => boolean` | Check if loaded |
| `analyticsManager.isLoading` | `() => boolean` | Check if loading |

### Tracking

| Function | Signature | Description |
|----------|-----------|-------------|
| `trackingManager.initialize` | `() => void` | Initialize tracking |
| `trackingManager.viewItemList` | `(ids, listId?, listName?) => void` | Track view item list |
| `trackingManager.addToCart` | `(id, quantity?) => void` | Track add to cart |
| `trackingManager.removeFromCart` | `(id, quantity?) => void` | Track remove from cart |
| `trackingManager.beginCheckout` | `() => void` | Track begin checkout |
| `trackingManager.purchase` | `(transactionId, value?) => void` | Track purchase |
| `trackingManager.viewItem` | `(id) => void` | Track view item |
| `trackingManager.trackCustomEvent` | `(name, data?) => void` | Track custom event |
| `trackingManager.getStatus` | `() => {enabled: boolean, initialized: boolean}` | Get tracking status |

---

## Event Methods

### EventBus

| Method | Signature | Description |
|--------|-----------|-------------|
| `EventBus.getInstance` | `() => EventBus` | Get EventBus singleton |
| `on` | `(event, handler) => void` | Subscribe to event |
| `emit` | `(event, data) => void` | Emit event |
| `off` | `(event, handler) => void` | Unsubscribe from event |
| `removeAllListeners` | `(event?) => void` | Remove all listeners |

### DOM Events

| Function | Signature | Description |
|----------|-----------|-------------|
| `document.addEventListener` | `(event, handler) => void` | Listen for DOM events |
| `document.dispatchEvent` | `(event) => void` | Dispatch DOM events |
| `new CustomEvent` | `(name, options) => CustomEvent` | Create custom events |

---

## Method Categories Summary

### **Core API (30 methods)**
Essential methods for cart, tracking, and campaign operations

### **Debug API (40+ methods)**  
Comprehensive debugging and testing utilities

### **Store Methods (60+ methods)**
Internal store operations for state management

### **Enhancer Methods (50+ methods)**
UI enhancement and DOM interaction methods

### **Utility Functions (25+ methods)**
Helper functions for logging, storage, templates, etc.

### **Event Methods (10+ methods)**
Event handling and communication systems

---

## Usage Examples

### Most Common Methods
```javascript
// Essential cart operations
next.addItem({ packageId: 1, quantity: 2 });
next.removeItem({ packageId: 1 });
next.getCartCount();

// Essential tracking
next.trackViewItemList(['1', '2', '3']);
next.trackPurchase('order-123', 99.99);

// Essential debugging
nextDebug.getStats();
nextDebug.tracking.getStatus();
```

### Advanced Usage
```javascript
// Profile management
next.addProfileBundle('starter-pack');
next.evaluateProfileConditions('premium-bundle');

// Event handling
next.on('cart:updated', (data) => console.log(data));

// Custom tracking
next.trackCustomEvent('user_engagement', { action: 'video_play' });
```

---

**Total Methods Available: 200+**

This comprehensive reference covers all available methods in the Campaign Cart SDKv v0.2.0, from basic cart operations to advanced debugging utilities.