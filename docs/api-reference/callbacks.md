# Callbacks

The Next Commerce SDK provides two callback systems for different purposes:

1. **Initialization Callbacks** (`window.nextReady`) - For code that needs to run after SDK loads
2. **Lifecycle Callbacks** (`next.registerCallback`) - For hooking into SDK operations

## Initialization Callbacks (window.nextReady)

The `window.nextReady` queue ensures your code runs after the SDK is fully initialized.

### Basic Usage

```javascript
// Queue a callback before SDK loads
window.nextReady = window.nextReady || [];
window.nextReady.push(function() {
  // SDK is ready - window.next is available
  console.log('Cart count:', next.getCartCount());
  next.addItem({ packageId: 123 });
});
```

### Callback Patterns

The SDK supports two callback patterns:

#### Pattern 1: Without SDK Parameter (Recommended)

```javascript
window.nextReady.push(function() {
  // Access SDK via global window.next
  next.addItem({ packageId: 123 });
  next.trackViewItemList(['1', '2', '3']);
});
```

#### Pattern 2: With SDK Parameter

```javascript
window.nextReady.push(function(sdk) {
  // SDK passed as parameter
  sdk.addItem({ packageId: 123 });
  sdk.trackViewItemList(['1', '2', '3']);
});
```

### Multiple Callbacks

You can queue multiple callbacks:

```javascript
// First callback - initialize tracking
window.nextReady.push(function() {
  next.trackViewItemList(['1', '2', '3']);
});

// Second callback - set up event listeners
window.nextReady.push(function() {
  next.on('cart:updated', function(data) {
    console.log('Cart updated:', data);
  });
});

// Third callback - check for saved cart
window.nextReady.push(function() {
  if (next.getCartCount() === 0) {
    console.log('Cart is empty');
  }
});
```

### After SDK Loads

Once the SDK is loaded, `window.nextReady` becomes a direct executor:

```javascript
// After SDK initialization, callbacks execute immediately
window.nextReady.push(function() {
  console.log('This runs immediately after SDK is ready');
});
```

### Error Handling

Callbacks are wrapped in try-catch to prevent one callback from breaking others:

```javascript
window.nextReady.push(function() {
  try {
    // Your code here
    customIntegration();
  } catch (error) {
    console.error('Custom integration failed:', error);
  }
});
```

## Lifecycle Callbacks (Legacy)

The SDK also supports lifecycle callbacks for specific operations. This is a legacy feature primarily for backwards compatibility.

### Available Callback Types

```javascript
// CallbackType values:
'beforeRender'    // Before cart UI renders
'afterRender'     // After cart UI renders
'beforeCheckout'  // Before checkout starts
'afterCheckout'   // After checkout completes
'beforeRedirect'  // Before order redirect
'itemAdded'       // After item added to cart
'itemRemoved'     // After item removed from cart
'cartCleared'     // After cart cleared
```

### Registering Callbacks

```javascript
window.nextReady.push(function() {
  // Register a callback
  next.registerCallback('itemAdded', function(data) {
    console.log('Item added to cart:', data);
    // data contains: cartLines, cartTotals, campaignData, appliedCoupons
  });
  
  // Register multiple callbacks
  next.registerCallback('beforeCheckout', function(data) {
    console.log('Checkout starting with:', data.cartTotals);
  });
});
```

### Callback Data Structure

All lifecycle callbacks receive a `CallbackData` object:

```typescript
{
  cartLines: EnrichedCartLine[];      // Cart items with full details
  cartTotals: CartTotals;              // Pricing information
  campaignData: Campaign | null;       // Campaign configuration
  appliedCoupons: AppliedCoupon[];     // Active discounts
}
```

### Unregistering Callbacks

```javascript
// Store reference to callback function
const myCallback = function(data) {
  console.log('Cart data:', data);
};

// Register callback
next.registerCallback('cartCleared', myCallback);

// Later, unregister it
next.unregisterCallback('cartCleared', myCallback);
```

### Example: Analytics Integration

```javascript
window.nextReady.push(function() {
  // Track when items are added
  next.registerCallback('itemAdded', function(data) {
    if (window.gtag) {
      const lastItem = data.cartLines[data.cartLines.length - 1];
      gtag('event', 'add_to_cart', {
        currency: 'USD',
        value: lastItem.price,
        items: [{
          item_id: lastItem.packageId,
          item_name: lastItem.name,
          price: lastItem.price,
          quantity: lastItem.quantity
        }]
      });
    }
  });
  
  // Track checkout start
  next.registerCallback('beforeCheckout', function(data) {
    if (window.gtag) {
      gtag('event', 'begin_checkout', {
        currency: 'USD',
        value: data.cartTotals.total.value,
        items: data.cartLines.map(item => ({
          item_id: item.packageId,
          item_name: item.name,
          price: item.price,
          quantity: item.quantity
        }))
      });
    }
  });
});
```

## Best Practices

### 1. Always Initialize the Queue

```javascript
// Ensure queue exists before pushing
window.nextReady = window.nextReady || [];
window.nextReady.push(function() {
  // Your code
});
```

### 2. Check SDK Availability

```javascript
if (window.next) {
  // SDK already loaded, use directly
  next.addItem({ packageId: 123 });
} else {
  // Queue for later
  window.nextReady = window.nextReady || [];
  window.nextReady.push(function() {
    next.addItem({ packageId: 123 });
  });
}
```

### 3. Prefer Events Over Callbacks

For most use cases, SDK events are more flexible than lifecycle callbacks:

```javascript
// Preferred: Use events
next.on('cart:item-added', function(data) {
  console.log('Item added:', data);
});

// Legacy: Lifecycle callbacks
next.registerCallback('itemAdded', function(data) {
  console.log('Item added:', data);
});
```

### 4. Clean Up When Done

```javascript
// Store references for cleanup
const callbacks = {
  itemAdded: function(data) { /* ... */ },
  cartCleared: function(data) { /* ... */ }
};

// Register callbacks
Object.entries(callbacks).forEach(([type, callback]) => {
  next.registerCallback(type, callback);
});

// Later, clean up
Object.entries(callbacks).forEach(([type, callback]) => {
  next.unregisterCallback(type, callback);
});
```

## Common Patterns

### Initialization with Feature Detection

```javascript
window.nextReady = window.nextReady || [];
window.nextReady.push(function() {
  // Check for features
  if (next.fomo) {
    next.fomo({ displayDuration: 5000 });
  }
  
  if (next.exitIntent) {
    next.exitIntent({
      image: '/offers/exit-discount.jpg',
      action: function() {
        next.applyCoupon('EXIT20');
      }
    });
  }
});
```

### Conditional Loading

```javascript
// Only load on specific pages
if (document.body.classList.contains('product-page')) {
  window.nextReady = window.nextReady || [];
  window.nextReady.push(function() {
    // Product page specific code
    const productId = document.querySelector('[data-product-id]').dataset.productId;
    next.trackViewItem(productId);
  });
}
```

### Error Recovery

```javascript
window.nextReady = window.nextReady || [];
window.nextReady.push(function() {
  try {
    // Primary integration
    setupCustomCheckout();
  } catch (error) {
    console.error('Custom checkout failed:', error);
    
    // Fallback behavior
    next.on('checkout:started', function() {
      console.log('Using default checkout');
    });
  }
});
```

## Migration from Legacy Patterns

If migrating from older SDK versions:

```javascript
// Old pattern (direct access)
if (window.MySDK) {
  MySDK.addToCart(123);
}

// New pattern (with ready queue)
window.nextReady = window.nextReady || [];
window.nextReady.push(function() {
  next.addItem({ packageId: 123 });
});
```

## Related Documentation

- [Events](./events.md) - For reactive event handling
- [Methods](./methods.md) - For available SDK methods
- [Getting Started](../getting-started/quick-start.md) - For basic setup