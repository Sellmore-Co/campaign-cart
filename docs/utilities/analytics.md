# Analytics

Track user interactions and conversions with the Next Commerce JS SDK event system.

## Available Events

The SDK emits various events you can listen to:

```javascript
// SDK initialization
window.addEventListener('next:initialized', function() {
  console.log('SDK is ready');
});

// Cart events
next.on('cart:updated', (data) => {
  console.log('Cart updated:', data);
});

next.on('cart:item-added', (data) => {
  console.log('Item added to cart:', data);
});

next.on('cart:item-removed', (data) => {
  console.log('Item removed from cart:', data);
});

// Selection events
next.on('selection:changed', (data) => {
  console.log('Selection changed:', data);
});

// FOMO events
next.on('fomo:shown', (data) => {
  console.log('FOMO notification shown:', data);
});

// Exit intent events
next.on('exit-intent:shown', (data) => {
  console.log('Exit intent popup shown:', data);
});

next.on('exit-intent:clicked', (data) => {
  console.log('Exit intent popup clicked:', data);
});

next.on('exit-intent:dismissed', (data) => {
  console.log('Exit intent popup dismissed:', data);
});
```

## Google Analytics 4 Integration

```javascript
// Track cart events in GA4
next.on('cart:item-added', (data) => {
  if (typeof gtag !== 'undefined') {
    gtag('event', 'add_to_cart', {
      currency: data.currency || 'USD',
      value: data.item.price,
      items: [{
        item_id: data.item.packageId,
        item_name: data.item.name,
        price: data.item.price,
        quantity: data.item.quantity
      }]
    });
  }
});

next.on('cart:item-removed', (data) => {
  if (typeof gtag !== 'undefined') {
    gtag('event', 'remove_from_cart', {
      currency: data.currency || 'USD',
      value: data.item.price,
      items: [{
        item_id: data.item.packageId,
        item_name: data.item.name,
        price: data.item.price,
        quantity: data.item.quantity
      }]
    });
  }
});
```

## Facebook Pixel Integration

```javascript
// Track events with Facebook Pixel
next.on('cart:item-added', (data) => {
  if (typeof fbq !== 'undefined') {
    fbq('track', 'AddToCart', {
      content_ids: [data.item.packageId],
      content_name: data.item.name,
      content_type: 'product',
      value: data.item.price,
      currency: data.currency || 'USD'
    });
  }
});

// Track selection changes
next.on('selection:changed', (data) => {
  if (typeof fbq !== 'undefined') {
    fbq('track', 'ViewContent', {
      content_ids: [data.packageId],
      content_name: data.name,
      content_type: 'product',
      value: data.price,
      currency: 'USD'
    });
  }
});
```

## Custom Analytics Implementation

```javascript
// Create custom analytics wrapper
const Analytics = {
  track: function(event, properties) {
    // Send to your analytics platform
    console.log('Track:', event, properties);
    
    // Example: Send to custom endpoint
    fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: event,
        properties: properties,
        timestamp: new Date().toISOString()
      })
    });
  }
};

// Wire up SDK events to custom analytics
window.addEventListener('next:initialized', function() {
  // Cart tracking
  next.on('cart:updated', (data) => {
    Analytics.track('Cart Updated', {
      itemCount: data.itemCount,
      total: data.total,
      items: data.items
    });
  });
  
  // Conversion tracking
  next.on('order:completed', (data) => {
    Analytics.track('Purchase', {
      orderId: data.orderId,
      total: data.total,
      items: data.items
    });
  });
  
  // Engagement tracking
  next.on('fomo:clicked', (data) => {
    Analytics.track('FOMO Clicked', {
      product: data.product,
      customer: data.customer
    });
  });
});
```

## Enhanced Ecommerce Tracking

```javascript
// Track product impressions
function trackProductImpressions() {
  const products = document.querySelectorAll('[data-next-package-id]');
  const impressions = [];
  
  products.forEach((product, index) => {
    const packageId = product.dataset.nextPackageId;
    const name = product.querySelector('[data-next-display="package.name"]')?.textContent;
    const price = product.querySelector('[data-next-display="package.price.raw"]')?.textContent;
    
    impressions.push({
      id: packageId,
      name: name,
      price: parseFloat(price) || 0,
      position: index + 1
    });
  });
  
  // Send to analytics
  if (impressions.length > 0) {
    Analytics.track('Product Impressions', { products: impressions });
  }
}

// Track on page load
window.addEventListener('next:initialized', trackProductImpressions);
```

## Conversion Funnel Tracking

```javascript
// Track each step of the funnel
const FunnelTracker = {
  // Product view
  trackProductView: function(packageId) {
    Analytics.track('Product Viewed', {
      packageId: packageId,
      step: 1,
      funnel: 'purchase'
    });
  },
  
  // Add to cart
  trackAddToCart: function(data) {
    Analytics.track('Added to Cart', {
      packageId: data.packageId,
      quantity: data.quantity,
      price: data.price,
      step: 2,
      funnel: 'purchase'
    });
  },
  
  // Checkout started
  trackCheckoutStarted: function() {
    Analytics.track('Checkout Started', {
      total: next.getCartData().total,
      items: next.getCartData().items.length,
      step: 3,
      funnel: 'purchase'
    });
  },
  
  // Purchase complete
  trackPurchase: function(orderData) {
    Analytics.track('Purchase Completed', {
      orderId: orderData.id,
      total: orderData.total,
      step: 4,
      funnel: 'purchase'
    });
  }
};
```

## A/B Testing Events

```javascript
// Track A/B test variations
const ABTest = {
  // Track which variation user sees
  trackVariation: function(testName, variation) {
    Analytics.track('AB Test Viewed', {
      testName: testName,
      variation: variation
    });
  },
  
  // Track conversion for variation
  trackConversion: function(testName, variation) {
    Analytics.track('AB Test Converted', {
      testName: testName,
      variation: variation,
      value: next.getCartData().total
    });
  }
};

// Example: Test different button text
const buttonVariation = Math.random() > 0.5 ? 'A' : 'B';
if (buttonVariation === 'A') {
  document.querySelector('button').textContent = 'Add to Cart';
} else {
  document.querySelector('button').textContent = 'Buy Now';
}
ABTest.trackVariation('button-text', buttonVariation);
```

## Best Practices

1. **Track Key Events**: Focus on events that matter for your business
2. **Include Context**: Add relevant properties to events
3. **Avoid Over-Tracking**: Don't track every minor interaction
4. **Test Tracking**: Verify events fire correctly
5. **Privacy Compliance**: Respect user privacy preferences

## Debugging Analytics

```javascript
// Debug mode for analytics
const DEBUG_ANALYTICS = true;

if (DEBUG_ANALYTICS) {
  // Log all SDK events
  const events = [
    'cart:updated', 'cart:item-added', 'cart:item-removed',
    'selection:changed', 'fomo:shown', 'exit-intent:shown'
  ];
  
  events.forEach(event => {
    next.on(event, (data) => {
      console.group(`📊 Analytics Event: ${event}`);
      console.log('Data:', data);
      console.log('Timestamp:', new Date().toISOString());
      console.groupEnd();
    });
  });
}
```

## Common Analytics Patterns

TODO: Add information about:
- Revenue tracking
- User behavior analysis
- Cohort analysis
- Attribution tracking
- Multi-channel tracking