# Campaign Cart Events

This document lists all events dispatched by the Campaign Cart library. You can listen for these events to extend functionality or integrate with other systems.

## Quick Start

### The Easiest Way to Use Events

Add this code to your page to run your code when the library is ready:

```html
<script>
// Initialize the array
window.on29NextReady = window.on29NextReady || [];

// Add your code
window.on29NextReady.push(function(client) {
  console.log("29next client is ready!");
  
  // Listen for events
  client.on('cart.updated', function(data) {
    console.log("Cart updated:", data.cart);
  });
  
  // Trigger events
  client.events.viewItem(client.getCampaignData().packages[0]);
});
</script>
```

### Testing in the Console

When using the browser console, use the global object:

```javascript
// Access the global instance
window.twentyNineNext.events.viewItemList();
```

## All Available Events

| Category | Event Name | Description | Triggered By |
|----------|------------|-------------|-------------|
| **Core** | `initialized` | Library has completed initialization | Automatic |
| **Core** | `campaign.loaded` | Campaign data has been loaded | Automatic |
| **Core** | `order.loaded` | Order data has been loaded | Automatic |
| **Cart** | `cart.updated` | Cart has been updated | Automatic when cart changes |
| **Cart** | `cart.synced` | Cart is synchronized with server | Automatic on sync |
| **Cart** | `toggle.changed` | Toggle button state changed | Automatic on toggle |
| **Checkout** | `checkout.ready` | Checkout page is ready | Automatic |
| **Checkout** | `checkout.started` | Checkout process began | `client.events.beginCheckout()` |
| **Checkout** | `checkout.completed` | Checkout completed successfully | Automatic |
| **Payment** | `payment.started` | Payment processing began | Automatic |
| **Payment** | `payment.completed` | Payment completed successfully | Automatic |
| **Payment** | `payment.failed` | Payment processing failed | Automatic |
| **Order** | `order.created` | New order was created | Automatic |
| **Attribution** | `attribution.updated` | Attribution data updated | Automatic |
| **Attribution** | `prospect.cartCreated` | Prospect cart created | Automatic |
| **UI** | `timer.expired` | Countdown timer expired | Automatic |
| **UI** | `timer.updated` | Countdown timer updated | Automatic |
| **UI** | `display.updated` | Display section updated | Automatic |
| **Analytics** | `view_item_list` | Product list viewed | `client.events.viewItemList()` |
| **Analytics** | `view_item` | Single product viewed | `client.events.viewItem()` |
| **Analytics** | `add_to_cart` | Item added to cart | `client.events.addToCart()` |
| **Analytics** | `remove_from_cart` | Item removed from cart | Automatic |
| **Analytics** | `begin_checkout` | Checkout began | `client.events.beginCheckout()` |
| **Analytics** | `purchase` | Purchase completed | `client.events.purchase()` |

## How to Listen for Events

Events can be captured in two ways:

### 1. Using the Client Instance

```javascript
// When you have direct access to the client instance
client.on('eventName', (data) => {
  console.log('Event received:', data);
});
```

### 2. Using the Global Event Queue

```javascript
// Using the global queue when auto-initialization is enabled
window.on29NextReady = window.on29NextReady || [];
window.on29NextReady.push((client) => {
  client.on('eventName', (data) => {
    console.log('Event received:', data);
  });
});
```

## How to Trigger Events

You can trigger events in three different ways:

### 1. Using the Client Events Object

```javascript
// Direct method calls on the events object
client.events.viewItemList(campaignData);
client.events.purchase(orderData);
client.events.beginCheckout();
client.events.fireCustomEvent('custom_event', { key: 'value' });
```

### 2. Using the Global Instance

```javascript
// Using the global instance after auto-initialization
window.twentyNineNext.events.viewItemList(); // TODO ONLY PACKAGES THAT ARE ON THE PAGE
window.twentyNineNext.events.purchase(orderData);
window.twentyNineNext.events.beginCheckout();
```

### 3. Using Helper Methods

```javascript
client.campaign.triggerViewItemList();
client.checkout.prospectCart.triggerBeginCheckout();
```

## Example: Triggering a Purchase Event

```javascript
// Simple way to trigger a purchase event
window.twentyNineNext.events.purchase({
  number: '10001',
  total_incl_tax: 99.99,
  currency: 'USD',
  lines: [
    {
      product_id: 'PROD-123', 
      product_title: 'Sample Product',
      price_incl_tax: 99.99,
      quantity: 1
    }
  ]
});
```

## Example: Tracking Cart Updates

```javascript
window.on29NextReady.push(function(client) {
  // Listen for cart updates
  client.on('cart.updated', function(data) {
    console.log('Cart updated:', data.cart);
    
    // Example: Update UI elements with cart data
    const cartTotal = document.querySelector('.custom-cart-total');
    if (cartTotal) {
      cartTotal.textContent = client.campaign.formatPrice(data.cart.totals.total);
    }
  });
});
``` 