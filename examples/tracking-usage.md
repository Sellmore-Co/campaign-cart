# Tracking Implementation - Usage Examples

This document demonstrates how to use the new tracking utilities implemented in the Campaign Cart SDK v0.2.0.

## Overview

The tracking system provides:
- ✅ **Event Bridge**: Connects internal EventBus to DOM CustomEvents for external analytics
- ✅ **GTM DataLayer Events**: Fires Enhanced E-commerce events
- ✅ **Utility Functions**: Easy-to-use functions like `viewItemList()`, `addToCart()`, etc.
- ✅ **Configuration Control**: Only fires when `enableAnalytics: true` and `tracking !== 'disabled'`
- ✅ **Seamless Integration**: Works with existing analytics-integration.ts

## Configuration

### Enable Tracking
```html
<!-- Via meta tags -->
<meta name="next-api-key" content="your-api-key">
<!-- Tracking will be enabled by default (tracking: 'auto') -->

<!-- Via window config -->
<script>
window.nextConfig = {
  apiKey: 'your-api-key',
  enableAnalytics: true,    // Required: enables analytics
  tracking: 'auto'          // Optional: 'auto', 'manual', 'disabled'
};
</script>
```

## Usage Examples

### 1. Basic Usage via SDK

```javascript
// Wait for SDK to be ready
window.nextReady = window.nextReady || [];
window.nextReady.push(function(sdk) {
  
  // Track viewing a list of products
  sdk.trackViewItemList(['1', '2', '3'], 'homepage', 'Featured Products');
  
  // Track adding item to cart (also happens automatically)
  sdk.trackAddToCart('1', 2);
  
  // Track viewing single item
  sdk.trackViewItem('1');
  
  // Track checkout start (also happens automatically)
  sdk.trackBeginCheckout();
  
  // Track purchase
  sdk.trackPurchase('order-123', 99.99);
  
  // Track custom events
  sdk.trackCustomEvent('custom_engagement', {
    section: 'hero',
    action: 'video_play'
  });
});
```

### 2. Direct Utility Functions

```javascript
import { tracking } from '@/utils/tracking';

// These work anywhere after SDK initialization
tracking.viewItemList(['1', '2'], 'category', 'Best Sellers');
tracking.addToCart('1', 1);
tracking.beginCheckout();
tracking.purchase('order-456');
tracking.custom('newsletter_signup', { source: 'footer' });
```

### 3. Debug Mode Usage

Enable debug mode by adding `?debugger=true` to your URL:

```javascript
// Access tracking utilities in console
nextDebug.tracking.viewItemList(['1', '2'], 'test', 'Debug List');
nextDebug.tracking.addToCart('1', 2);
nextDebug.tracking.getStatus(); // Check if tracking is enabled/initialized
```

### 4. Manual Control

Set tracking to manual mode to control when events fire:

```javascript
window.nextConfig = {
  apiKey: 'your-api-key',
  enableAnalytics: true,
  tracking: 'manual'  // Disables automatic cart event tracking
};

// Then manually track events when needed
window.nextReady.push(function(sdk) {
  // Only manual tracking calls will fire events
  sdk.trackAddToCart('1', 1);
});
```

## Events Fired

### Automatic Events (tracking: 'auto')
- `view_item_list` - When you call `trackViewItemList()`
- `add_to_cart` - When items are added to cart OR manually tracked
- `remove_from_cart` - When items are removed from cart OR manually tracked  
- `begin_checkout` - When checkout is started OR manually tracked
- `purchase` - When order is completed OR manually tracked

### GTM DataLayer Structure

```javascript
// Example add_to_cart event
{
  event: 'add_to_cart',
  ecommerce: {
    currency_code: 'USD',
    value: 19.99,
    items: [{
      item_id: '1',
      item_name: 'Test Package 1',
      currency: 'USD',
      price: 19.99,
      quantity: 1,
      item_category: 'package'
    }]
  }
}

// Example view_item_list event  
{
  event: 'view_item_list',
  ecommerce: {
    currency_code: 'USD',
    item_list_id: 'homepage',
    item_list_name: 'Featured Products',
    items: [
      {
        item_id: '1',
        item_name: 'Package 1',
        currency: 'USD', 
        price: 19.99,
        quantity: 1,
        item_category: 'package',
        item_list_id: 'homepage',
        item_list_name: 'Featured Products',
        index: 0
      }
      // ... more items
    ]
  }
}
```

## Integration with Existing Analytics

The tracking system works seamlessly with the existing `analytics-integration.ts`:

1. **EventBus → DOM Events**: Internal cart events are bridged to DOM CustomEvents
2. **DOM Events → Analytics**: The analytics-integration.ts listens for these DOM events
3. **Analytics → Platforms**: Events are sent to GTM, Facebook Pixel, GA4, etc.

## Testing

### Check Implementation

```javascript
// In browser console with ?debugger=true
nextDebug.tracking.getStatus();
// Returns: { enabled: true, initialized: true }

// Test tracking events
nextDebug.tracking.viewItemList(['1', '2'], 'test');
nextDebug.tracking.addToCart('1', 1);

// Check dataLayer
console.log(window.dataLayer);
```

### Verify Events

1. Open browser dev tools
2. Add `?debugger=true` to URL  
3. Look for tracking logs in console
4. Check `window.dataLayer` array for events
5. Use GTM Preview mode to see events

## Common Patterns

### E-commerce Flow

```javascript
window.nextReady.push(function(sdk) {
  
  // 1. User views product listing
  const packageIds = ['1', '2', '3', '4'];
  sdk.trackViewItemList(packageIds, 'category', 'Popular Items');
  
  // 2. User views specific product  
  sdk.trackViewItem('1');
  
  // 3. User adds to cart (automatic + manual tracking)
  sdk.addItem({ packageId: 1, quantity: 2 }); // Fires automatically
  // OR manually:
  sdk.trackAddToCart('1', 2);
  
  // 4. User begins checkout (automatic)
  // Checkout starts automatically when checkout form loads
  
  // 5. Purchase complete (automatic) 
  // Fires automatically on order completion
});
```

### Custom Event Tracking

```javascript
window.nextReady.push(function(sdk) {
  
  // Track user interactions
  document.getElementById('video-play').addEventListener('click', () => {
    sdk.trackCustomEvent('video_engagement', {
      video_id: 'intro-video',
      duration: 30,
      source: 'hero'
    });
  });
  
  // Track form interactions
  document.getElementById('newsletter').addEventListener('submit', () => {
    sdk.trackCustomEvent('lead_generation', {
      form_type: 'newsletter',
      source: 'footer'
    });
  });
});
```

## Troubleshooting

### Tracking Not Working
1. Check `nextDebug.tracking.getStatus()` - should show `enabled: true, initialized: true`
2. Verify `enableAnalytics: true` in config
3. Ensure `tracking` is not set to `'disabled'`
4. Check console for tracking logs with `?debugger=true`

### Events Not in DataLayer
1. Check if `window.dataLayer` exists
2. Verify GTM container is loaded
3. Look for JavaScript errors in console
4. Test with `nextDebug.tracking.addToCart('1', 1)` manually

### Analytics Not Receiving Events
1. Verify analytics-integration.ts is loaded
2. Check if DOM events are being dispatched
3. Test external analytics platforms (GTM Preview, Facebook Pixel Helper)