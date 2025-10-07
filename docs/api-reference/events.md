# Events

The Next Commerce JS SDK emits events that you can listen to for tracking and custom functionality. The SDK has 34 internal events that can be listened to via `next.on()`.

## Event Categories

- **Cart Events** - Track cart state changes
- **Checkout Events** - Monitor checkout process
- **Payment Events** - Handle payment states
- **Order Events** - Track order completion
- **Campaign Events** - Campaign data loading
- **Coupon Events** - Discount code usage
- **Upsell Events** - Post-purchase upsell tracking
- **User Events** - User authentication
- **Behavioral Events** - FOMO, exit intent
- **Profile Events** - Profile management and switching
- **System Events** - SDK state, errors, routing

## SDK Initialization

### next:initialized

Fired when SDK is fully loaded and ready (DOM event):

```javascript
// Listen on document for initialization
document.addEventListener('next:initialized', function(event) {
  console.log('SDK is ready at:', event.detail.timestamp);
  console.log('Version:', event.detail.version);
  // Safe to use SDK methods here
});
```

## Cart Events

### cart:updated

Fired whenever cart contents change (most common event):

```javascript
next.on('cart:updated', (cartState) => {
  console.log('Cart updated:', cartState);
  // cartState includes: items, totals, enrichedItems, etc.
  console.log('Total items:', cartState.totalQuantity);
  console.log('Cart total:', cartState.totals.total.formatted);
});
```

### cart:item-added

Fired when item is added to cart:

```javascript
next.on('cart:item-added', (data) => {
  console.log('Item added:', data);
  // data includes: packageId, quantity, item details
});
```

### cart:item-removed

Fired when item is removed from cart:

```javascript
next.on('cart:item-removed', (data) => {
  console.log('Item removed:', data);
  // data includes: packageId, item details that were removed
});
```

### cart:quantity-changed

Fired when item quantity is updated:

```javascript
next.on('cart:quantity-changed', (data) => {
  console.log('Quantity changed:', data);
  // data includes: packageId, oldQuantity, newQuantity
});
```

### cart:package-swapped

Fired when a package is swapped for another:

```javascript
next.on('cart:package-swapped', (data) => {
  console.log('Package swapped:', data);
  // data includes: previousPackageId, newPackageId, previousItem, newItem, priceDifference, source
});
```

## Checkout & Order Events

### checkout:started

Fired when checkout process begins:

```javascript
next.on('checkout:started', (data) => {
  console.log('Checkout started:', data);
  // data includes: cart items, totals
});
```

### checkout:form-initialized

Fired when checkout form is ready:

```javascript
next.on('checkout:form-initialized', () => {
  console.log('Checkout form ready');
  // Form is now initialized and ready for input
});
```

### order:completed

Fired when order is successfully completed:

```javascript
next.on('order:completed', (order) => {
  console.log('Order completed:', order);
  // order includes: ref_id, total, lines, customer info
});
```

## Payment Events

### payment:tokenized

Fired when payment is successfully tokenized:

```javascript
next.on('payment:tokenized', (data) => {
  console.log('Payment tokenized:', data);
  // data includes: token info, payment method
});
```

### payment:error

Fired when payment processing fails:

```javascript
next.on('payment:error', (error) => {
  console.error('Payment failed:', error);
  // error includes: message, code, details
});
```

### express-checkout:started

Fired when express checkout (PayPal, Apple Pay, etc.) begins:

```javascript
next.on('express-checkout:started', (data) => {
  console.log('Express checkout started:', data);
  // data includes: method type (paypal, apple, google)
});
```

## Campaign & Configuration Events

### campaign:loaded

Fired when campaign data is loaded:

```javascript
next.on('campaign:loaded', (campaign) => {
  console.log('Campaign loaded:', campaign);
  // campaign includes: packages, settings, currency, etc.
});
```

### config:updated

Fired when SDK configuration changes:

```javascript
next.on('config:updated', (config) => {
  console.log('Config updated:', config);
  // config includes: all SDK settings
});
```

## Coupon Events

### coupon:applied

Fired when coupon is successfully applied:

```javascript
next.on('coupon:applied', (coupon) => {
  console.log('Coupon applied:', coupon);
  // coupon includes: code, discount amount, type
});
```

### coupon:removed

Fired when coupon is removed:

```javascript
next.on('coupon:removed', (code) => {
  console.log('Coupon removed:', code);
  // code is the removed coupon code string
});
```

## Upsell Events

### upsell:viewed

Fired when upsell offer is displayed:

```javascript
next.on('upsell:viewed', (data) => {
  console.log('Upsell viewed:', data);
  // data includes: packageId, offer details
});
```

### upsell:accepted

Fired when user accepts an upsell:

```javascript
next.on('upsell:accepted', (data) => {
  console.log('Upsell accepted:', data);
  // data includes: packageId, quantity, value
});
```

### upsell:added

Fired when upsell is successfully added to order:

```javascript
next.on('upsell:added', (data) => {
  console.log('Upsell added:', data);
  // data includes: packageId, order, value
});
```

### upsell:skipped

Fired when user skips/declines an upsell:

```javascript
next.on('upsell:skipped', (data) => {
  console.log('Upsell skipped:', data);
  // data includes: packageId, reason
});
```

## User Events

### user:logged-in

Fired when user logs in:

```javascript
next.on('user:logged-in', (data) => {
  console.log('User logged in:', data);
  // data includes: user info, email
});
```

### user:logged-out

Fired when user logs out:

```javascript
next.on('user:logged-out', (data) => {
  console.log('User logged out:', data);
});
```

## Behavioral Events

### fomo:shown

Fired when FOMO notification appears:

```javascript
next.on('fomo:shown', (data) => {
  console.log('FOMO shown:', data);
  // data includes: customer name, product, location
});
```

### exit-intent:clicked

Fired when user clicks on exit intent popup:

```javascript
next.on('exit-intent:clicked', (data) => {
  console.log('Exit intent clicked:', data);
  // data includes: imageUrl, template
});
```

### exit-intent:dismissed

Fired when exit intent popup is dismissed:

```javascript
next.on('exit-intent:dismissed', (data) => {
  console.log('Exit intent dismissed:', data);
  // data includes: imageUrl, template
});
```

### exit-intent:closed

Fired when exit intent popup is closed:

```javascript
next.on('exit-intent:closed', (data) => {
  console.log('Exit intent closed:', data);
  // data includes: imageUrl, template
});
```

### exit-intent:action

Fired when user takes an action on exit intent popup:

```javascript
next.on('exit-intent:action', (data) => {
  console.log('Exit intent action:', data);
  // data includes: action, couponCode
});
```

## Profile Events

### profile:applied

Fired when a profile is applied to the cart:

```javascript
next.on('profile:applied', (data) => {
  console.log('Profile applied:', data);
  // data includes: profileId, previousProfileId, itemsSwapped, originalItems, cleared, profile
});
```

### profile:reverted

Fired when profile changes are reverted:

```javascript
next.on('profile:reverted', (data) => {
  console.log('Profile reverted:', data);
  // data includes: previousProfileId, itemsRestored
});
```

### profile:switched

Fired when switching between profiles:

```javascript
next.on('profile:switched', (data) => {
  console.log('Profile switched:', data);
  // data includes: fromProfileId, toProfileId, itemsAffected
});
```

### profile:registered

Fired when a new profile is registered:

```javascript
next.on('profile:registered', (data) => {
  console.log('Profile registered:', data);
  // data includes: profileId, mappingsCount
});
```

## System Events

### route:changed

Fired when SDK detects route/page change:

```javascript
next.on('route:changed', (route) => {
  console.log('Route changed:', route);
  // route includes: path, params
});
```

### sdk:route-invalidated

Fired when SDK route context is invalidated:

```javascript
next.on('sdk:route-invalidated', (data) => {
  console.log('Route invalidated:', data);
});
```

### page:viewed

Fired when page view is tracked:

```javascript
next.on('page:viewed', (data) => {
  console.log('Page viewed:', data);
  // data includes: page info, timestamp
});
```

### error:occurred

Fired when SDK encounters an error:

```javascript
next.on('error:occurred', (error) => {
  console.error('SDK error:', error);
  // error includes: message, stack, context
});
```

## Complete Event List

Here are all 34 available events organized by category:

### Cart (5 events)
- `cart:updated` - Cart state changed
- `cart:item-added` - Item added to cart
- `cart:item-removed` - Item removed from cart
- `cart:quantity-changed` - Item quantity changed
- `cart:package-swapped` - Package swapped for another

### Checkout & Order (3 events)
- `checkout:started` - Checkout process began
- `checkout:form-initialized` - Checkout form ready
- `order:completed` - Order successfully completed

### Payment (3 events)
- `payment:tokenized` - Payment token created
- `payment:error` - Payment processing failed
- `express-checkout:started` - Express checkout initiated

### Campaign & Config (2 events)
- `campaign:loaded` - Campaign data loaded
- `config:updated` - Configuration changed

### Coupons (2 events)
- `coupon:applied` - Discount code applied
- `coupon:removed` - Discount code removed

### Upsells (4 events)
- `upsell:viewed` - Upsell offer shown
- `upsell:accepted` - Upsell accepted by user
- `upsell:added` - Upsell added to order
- `upsell:skipped` - Upsell declined/skipped

### User (2 events)
- `user:logged-in` - User authenticated
- `user:logged-out` - User logged out

### Behavioral (5 events)
- `fomo:shown` - FOMO popup displayed
- `exit-intent:clicked` - Exit intent popup clicked
- `exit-intent:dismissed` - Exit intent popup dismissed
- `exit-intent:closed` - Exit intent popup closed
- `exit-intent:action` - Exit intent action taken

### Profile (4 events)
- `profile:applied` - Profile applied to cart
- `profile:reverted` - Profile changes reverted
- `profile:switched` - Switched between profiles
- `profile:registered` - New profile registered

### System (5 events)
- `route:changed` - Page/route changed
- `sdk:route-invalidated` - Route context reset
- `page:viewed` - Page view tracked
- `error:occurred` - Error encountered

## Event Handling Patterns

### Basic Event Listening

```javascript
// Subscribe to events
next.on('cart:updated', (data) => {
  console.log('Cart updated:', data);
});

// Multiple events
['cart:item-added', 'cart:item-removed'].forEach(event => {
  next.on(event, (data) => {
    console.log(`Event ${event}:`, data);
  });
});
```

### Removing Listeners

```javascript
const handler = (data) => console.log(data);

// Add listener
next.on('cart:updated', handler);

// Remove listener
next.off('cart:updated', handler);
```

### Error Handling in Events

```javascript
next.on('cart:updated', (data) => {
  try {
    // Your code here
    updateUI(data);
  } catch (error) {
    console.error('Error in event handler:', error);
  }
});
```

### DOM Events vs SDK Events

```javascript
// DOM events (for SDK lifecycle)
document.addEventListener('next:initialized', (event) => {
  console.log('SDK ready via DOM event');
});

// SDK events (for cart, checkout, etc.)
next.on('cart:updated', (data) => {
  console.log('Cart updated via SDK event');
});
```

## Custom Event Integration

### Google Analytics

```javascript
next.on('cart:item-added', (data) => {
  if (typeof gtag !== 'undefined') {
    gtag('event', 'add_to_cart', {
      value: data.item.price,
      currency: 'USD',
      items: [data.item]
    });
  }
});
```

### Custom Analytics

```javascript
// Track all cart changes
next.on('cart:updated', (data) => {
  fetch('/api/track', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      event: 'cart_updated',
      properties: data
    })
  });
});
```

## Best Practices

1. **Always check data**: Validate event data before using
2. **Handle errors**: Wrap handlers in try-catch
3. **Clean up**: Remove listeners when no longer needed
4. **Don't block**: Keep handlers fast and async
5. **Test events**: Verify events fire as expected

## Debugging Events

### List All Available Events

```javascript
// Get all registered events from the EventBus
if (window.next && window.next.eventBus) {
  const listeners = window.next.eventBus.listeners;
  const events = Array.from(listeners.keys()).sort();
  
  console.log('Available events:', events.length);
  events.forEach((event, i) => {
    const count = listeners.get(event).size;
    console.log(`${i + 1}. ${event} (${count} listeners)`);
  });
}
```

### Monitor All Events

```javascript
// Log all events for debugging
if (window.location.search.includes('debug=true')) {
  const allEvents = [
    // Cart
    'cart:updated', 'cart:item-added', 'cart:item-removed', 'cart:quantity-changed', 'cart:package-swapped',
    // Checkout & Order
    'checkout:started', 'checkout:form-initialized', 'order:completed',
    // Payment
    'payment:tokenized', 'payment:error', 'express-checkout:started',
    // Campaign & Config
    'campaign:loaded', 'config:updated',
    // Coupons
    'coupon:applied', 'coupon:removed',
    // Upsells
    'upsell:viewed', 'upsell:accepted', 'upsell:added', 'upsell:skipped',
    // User
    'user:logged-in', 'user:logged-out',
    // Behavioral
    'fomo:shown', 'exit-intent:clicked', 'exit-intent:dismissed', 'exit-intent:closed', 'exit-intent:action',
    // Profile
    'profile:applied', 'profile:reverted', 'profile:switched', 'profile:registered',
    // System
    'route:changed', 'sdk:route-invalidated', 'page:viewed', 'error:occurred'
  ];
  
  allEvents.forEach(event => {
    next.on(event, (data) => {
      console.log(`[Event] ${event}:`, data);
    });
  });
}
```