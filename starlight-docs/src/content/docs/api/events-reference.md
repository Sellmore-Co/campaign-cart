---
title: Events Reference
description: Complete reference of all events emitted by Campaign Cart for analytics and custom integrations
---

Complete reference of all events emitted by Campaign Cart.

## Event System Overview

Campaign Cart uses a standard DOM event system:

```javascript
// Listen to events
document.addEventListener('cart.updated', (event) => {
  console.log('Event data:', event.detail);
});

// Remove listener
document.removeEventListener('cart.updated', handler);
```

## Cart Events

### `cart.updated`
Fired whenever the cart changes.

```javascript
document.addEventListener('cart.updated', (event) => {
  const { items, count, total, subtotal } = event.detail;
  console.log(`Cart has ${count} items totaling ${total}`);
});
```

### `cart.item.added`
Fired when an item is added to cart.

```javascript
document.addEventListener('cart.item.added', (event) => {
  const { item, quantity } = event.detail;
  console.log(`Added ${quantity} of ${item.name}`);
});
```

### `cart.item.removed`
Fired when an item is removed from cart.

```javascript
document.addEventListener('cart.item.removed', (event) => {
  const { item } = event.detail;
  console.log(`Removed ${item.name}`);
});
```

### `cart.item.updated`
Fired when an item quantity changes.

```javascript
document.addEventListener('cart.item.updated', (event) => {
  const { item, oldQuantity, newQuantity } = event.detail;
  console.log(`Updated ${item.name} from ${oldQuantity} to ${newQuantity}`);
});
```

### `cart.cleared`
Fired when cart is emptied.

```javascript
document.addEventListener('cart.cleared', (event) => {
  console.log('Cart was cleared');
});
```

### `cart.synced`
Fired when cart syncs with API.

```javascript
document.addEventListener('cart.synced', (event) => {
  const { success, timestamp } = event.detail;
  console.log(`Cart synced: ${success}`);
});
```

## Checkout Events

### `checkout.started`
Fired when checkout begins.

```javascript
document.addEventListener('checkout.started', (event) => {
  const { items, total } = event.detail;
  console.log(`Starting checkout with ${items.length} items`);
});
```

### `checkout.step.completed`
Fired when a checkout step completes.

```javascript
document.addEventListener('checkout.step.completed', (event) => {
  const { step, data } = event.detail;
  console.log(`Completed step: ${step}`);
});
```

### `checkout.error`
Fired on checkout errors.

```javascript
document.addEventListener('checkout.error', (event) => {
  const { error, step } = event.detail;
  console.error(`Checkout error at ${step}: ${error.message}`);
});
```

### `checkout.abandoned`
Fired when checkout is abandoned.

```javascript
document.addEventListener('checkout.abandoned', (event) => {
  const { step, duration } = event.detail;
  console.log(`Checkout abandoned at ${step} after ${duration}ms`);
});
```

## Purchase Events

### `purchase.completed`
Fired on successful purchase.

```javascript
document.addEventListener('purchase.completed', (event) => {
  const { 
    orderId, 
    total, 
    items, 
    customer,
    paymentMethod 
  } = event.detail;
  
  console.log(`Order ${orderId} completed for ${total}`);
  
  // Track conversion
  gtag('event', 'purchase', {
    transaction_id: orderId,
    value: total,
    currency: 'USD',
    items: items
  });
});
```

### `purchase.failed`
Fired when purchase fails.

```javascript
document.addEventListener('purchase.failed', (event) => {
  const { error, attemptNumber } = event.detail;
  console.error(`Purchase failed: ${error.message}`);
});
```

## Payment Events

### `payment.method.selected`
Fired when payment method changes.

```javascript
document.addEventListener('payment.method.selected', (event) => {
  const { method } = event.detail;
  console.log(`Selected payment method: ${method}`);
});
```

### `payment.processing`
Fired during payment processing.

```javascript
document.addEventListener('payment.processing', (event) => {
  console.log('Processing payment...');
});
```

### `payment.authorized`
Fired when payment is authorized.

```javascript
document.addEventListener('payment.authorized', (event) => {
  const { transactionId, amount } = event.detail;
  console.log(`Payment authorized: ${transactionId}`);
});
```

## Voucher Events

### `voucher.applied`
Fired when voucher is applied.

```javascript
document.addEventListener('voucher.applied', (event) => {
  const { code, discount, type } = event.detail;
  console.log(`Applied ${code}: ${discount} ${type}`);
});
```

### `voucher.removed`
Fired when voucher is removed.

```javascript
document.addEventListener('voucher.removed', (event) => {
  const { code } = event.detail;
  console.log(`Removed voucher: ${code}`);
});
```

### `voucher.error`
Fired on voucher errors.

```javascript
document.addEventListener('voucher.error', (event) => {
  const { code, error } = event.detail;
  console.error(`Voucher ${code} error: ${error}`);
});
```

## Timer Events

### `timer.started`
Fired when timer starts.

```javascript
document.addEventListener('timer.started', (event) => {
  const { elementId, duration } = event.detail;
  console.log(`Timer ${elementId} started for ${duration}s`);
});
```

### `timer.tick`
Fired every second.

```javascript
document.addEventListener('timer.tick', (event) => {
  const { elementId, remaining } = event.detail;
  console.log(`Timer ${elementId}: ${remaining}s left`);
});
```

### `timer.expired`
Fired when timer reaches zero.

```javascript
document.addEventListener('timer.expired', (event) => {
  const { elementId, action } = event.detail;
  console.log(`Timer ${elementId} expired, action: ${action}`);
});
```

## Country/Currency Events

### `country.detected`
Fired when country is detected.

```javascript
document.addEventListener('country.detected', (event) => {
  const { country, source } = event.detail;
  console.log(`Detected country: ${country} via ${source}`);
});
```

### `country.changed`
Fired when country changes.

```javascript
document.addEventListener('country.changed', (event) => {
  const { 
    oldCountry, 
    newCountry, 
    campaign 
  } = event.detail;
  console.log(`Country changed from ${oldCountry} to ${newCountry}`);
});
```

### `campaign.loaded`
Fired when campaign data loads.

```javascript
document.addEventListener('campaign.loaded', (event) => {
  const { campaignId, currency, packages } = event.detail;
  console.log(`Loaded campaign ${campaignId} with ${packages.length} packages`);
});
```

## Upsell Events

### `upsell.displayed`
Fired when upsell is shown.

```javascript
document.addEventListener('upsell.displayed', (event) => {
  const { upsellId, product, price } = event.detail;
  console.log(`Showing upsell: ${product.name} for ${price}`);
});
```

### `upsell.accepted`
Fired when upsell is accepted.

```javascript
document.addEventListener('upsell.accepted', (event) => {
  const { upsellId, product, revenue } = event.detail;
  console.log(`Upsell accepted: ${product.name}`);
});
```

### `upsell.declined`
Fired when upsell is declined.

```javascript
document.addEventListener('upsell.declined', (event) => {
  const { upsellId, product } = event.detail;
  console.log(`Upsell declined: ${product.name}`);
});
```

## Analytics Events

### `analytics.pageview`
Fired on page views.

```javascript
document.addEventListener('analytics.pageview', (event) => {
  const { page, title } = event.detail;
  console.log(`Page view: ${page}`);
});
```

### `analytics.event`
Generic analytics event.

```javascript
document.addEventListener('analytics.event', (event) => {
  const { category, action, label, value } = event.detail;
  console.log(`Analytics: ${category} - ${action}`);
});
```

## Error Events

### `error`
General error event.

```javascript
document.addEventListener('29next.error', (event) => {
  const { error, context } = event.detail;
  console.error(`Error in ${context}:`, error);
});
```

### `api.error`
API request errors.

```javascript
document.addEventListener('api.error', (event) => {
  const { endpoint, status, message } = event.detail;
  console.error(`API error ${status} at ${endpoint}: ${message}`);
});
```

## Custom Events

### Emitting Custom Events

```javascript
// Using Campaign Cart's emit method
window.twentyNineNext.emit('custom.event', {
  action: 'button_clicked',
  label: 'hero_cta'
});

// Using native dispatchEvent
const event = new CustomEvent('29next.custom', {
  detail: {
    action: 'custom_action',
    data: { foo: 'bar' }
  }
});
document.dispatchEvent(event);
```

### Listening to Custom Events

```javascript
document.addEventListener('29next.custom', (event) => {
  const { action, data } = event.detail;
  console.log(`Custom action: ${action}`, data);
});
```

## Event Utilities

### Batch Event Handling

```javascript
// Handle multiple events with one function
const events = ['cart.updated', 'voucher.applied', 'country.changed'];
events.forEach(eventName => {
  document.addEventListener(eventName, updateUI);
});
```

### Event Debugging

```javascript
// Log all Campaign Cart events
if (window.osConfig.debug) {
  const allEvents = [
    'cart.updated', 'checkout.started', 'purchase.completed',
    'voucher.applied', 'timer.expired', 'country.changed'
  ];
  
  allEvents.forEach(eventName => {
    document.addEventListener(eventName, (event) => {
      console.log(`[EVENT] ${eventName}:`, event.detail);
    });
  });
}
```

### Preventing Default Behavior

Some events can be prevented:

```javascript
document.addEventListener('cart.item.adding', (event) => {
  // Prevent adding items over limit
  if (window.twentyNineNext.getCartCount() >= 10) {
    event.preventDefault();
    alert('Maximum 10 items allowed');
  }
});
```

## Best Practices

1. **Always check event.detail exists** before accessing properties
2. **Remove listeners** when components unmount
3. **Use specific events** rather than generic ones when possible
4. **Handle errors gracefully** in event handlers
5. **Don't modify cart** directly from event handlers (avoid loops)

## Example: Complete Event Integration

```javascript
class CartEventHandler {
  constructor() {
    this.bindEvents();
  }
  
  bindEvents() {
    // Cart events
    document.addEventListener('cart.updated', this.onCartUpdate.bind(this));
    document.addEventListener('cart.item.added', this.onItemAdded.bind(this));
    
    // Purchase events
    document.addEventListener('purchase.completed', this.onPurchase.bind(this));
    
    // Error handling
    document.addEventListener('29next.error', this.onError.bind(this));
  }
  
  onCartUpdate(event) {
    const { count, total } = event.detail;
    this.updateCartUI(count, total);
    this.trackEvent('cart_updated', { count, total });
  }
  
  onItemAdded(event) {
    const { item } = event.detail;
    this.showNotification(`${item.name} added to cart`);
    this.trackEvent('add_to_cart', {
      item_id: item.id,
      item_name: item.name,
      price: item.price
    });
  }
  
  onPurchase(event) {
    const { orderId, total, items } = event.detail;
    this.trackPurchase(orderId, total, items);
    this.showSuccessPage(orderId);
  }
  
  onError(event) {
    const { error, context } = event.detail;
    console.error('Campaign Cart error:', error);
    this.showErrorMessage(error.message);
  }
  
  // Cleanup
  destroy() {
    document.removeEventListener('cart.updated', this.onCartUpdate);
    document.removeEventListener('cart.item.added', this.onItemAdded);
    document.removeEventListener('purchase.completed', this.onPurchase);
    document.removeEventListener('29next.error', this.onError);
  }
}

// Initialize
const eventHandler = new CartEventHandler();
```