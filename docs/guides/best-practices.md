# Best Practices

Recommended patterns and anti-patterns for the Next Commerce JS SDK.

## Performance Best Practices

### Use Appropriate Selectors
```html
<!-- Good: Uses data attributes for SDK elements -->
<div data-next-cart-selector data-next-selection-mode="swap">
  <!-- selector content -->
</div>

<!-- Avoid: Don't mix SDK functionality with CSS selectors -->
<div class="cart-selector" onclick="customFunction()">
  <!-- This bypasses SDK event handling -->
</div>
```

### Minimize Reflows
```html
<!-- Good: Use loading states -->
<div data-next-await>
  <span data-next-display="package.price">Loading...</span>
</div>

<!-- Avoid: Empty elements that cause layout shift -->
<span data-next-display="package.price"></span>
```

### Batch Operations
```javascript
// Good: Let SDK handle updates
next.on('cart:updated', (data) => {
  // React to changes
});

// Avoid: Multiple individual updates
function updateEverything() {
  updatePrice();
  updateQuantity();
  updateTotal();
  // Causes multiple reflows
}
```

## Code Organization

### Separate Concerns
```html
<!-- Good: Keep SDK attributes separate from styling -->
<div class="product-card" data-next-package-id="1">
  <span class="price-display" data-next-display="package.price">$99</span>
</div>

<!-- Avoid: Mixing concerns -->
<div class="product-card price-$99" data-next-package-id="1">
  <!-- Price in class name is redundant -->
</div>
```

### Use Semantic HTML
```html
<!-- Good: Semantic structure -->
<article data-next-package-id="1">
  <h3 data-next-display="package.name">Product Name</h3>
  <p data-next-display="package.description">Description</p>
  <button data-next-action="add-to-cart">Add to Cart</button>
</article>

<!-- Avoid: Divitis -->
<div data-next-package-id="1">
  <div data-next-display="package.name"></div>
  <div data-next-display="package.description"></div>
  <div data-next-action="add-to-cart"></div>
</div>
```

## Event Handling

### Clean Up Listeners
```javascript
// Good: Remove listeners when done
const handler = (data) => console.log(data);
next.on('cart:updated', handler);

// Later, when no longer needed
next.off('cart:updated', handler);

// Avoid: Accumulating listeners
setInterval(() => {
  next.on('cart:updated', (data) => {
    // This creates a new listener every interval!
  });
}, 1000);
```

### Error Handling
```javascript
// Good: Handle errors gracefully
next.on('cart:item-added', (data) => {
  try {
    updateUI(data);
    trackAnalytics(data);
  } catch (error) {
    console.error('Error handling cart update:', error);
    // Show user-friendly message
  }
});

// Avoid: Unhandled errors
next.on('cart:item-added', (data) => {
  updateUI(data); // Could throw
  trackAnalytics(data); // Could throw
});
```

## State Management

### Let SDK Manage State
```html
<!-- Good: Use SDK's state management -->
<div data-next-show="cart.hasItems">
  <button onclick="checkout()">Checkout</button>
</div>

<!-- Avoid: Manual state tracking -->
<div id="checkout-container" style="display: none;">
  <button onclick="if(itemCount > 0) checkout()">Checkout</button>
</div>
```

### Avoid State Duplication
```javascript
// Good: Use SDK as single source of truth
function getCartTotal() {
  return next.getCartData().total;
}

// Avoid: Duplicating state
let myCartTotal = 0;
next.on('cart:updated', (data) => {
  myCartTotal = data.total; // Unnecessary duplication
});
```

## Accessibility

### Provide Context
```html
<!-- Good: Accessible markup -->
<button data-next-toggle 
        data-next-package-id="1"
        aria-label="Add Product Name to cart"
        aria-pressed="false">
  Add to Cart
</button>

<!-- Update aria-pressed based on state -->
<style>
  button[data-next-toggle].next-in-cart {
    aria-pressed: true;
  }
</style>
```

### Keyboard Navigation
```html
<!-- Good: Focusable interactive elements -->
<div data-next-selector-card 
     data-next-package-id="1"
     tabindex="0"
     role="radio"
     aria-checked="false">
  Package Option
</div>

<!-- Avoid: Non-accessible clickable divs -->
<div data-next-selector-card 
     data-next-package-id="1"
     onclick="select(this)">
  Package Option
</div>
```

## Loading States

### Progressive Enhancement
```html
<!-- Good: Content visible even without JS -->
<div data-next-await>
  <h3>Premium Package</h3>
  <p>Starting at <span data-next-display="package.price">$99</span></p>
</div>

<!-- Avoid: Empty containers -->
<div data-next-await>
  <span data-next-display="package.name"></span>
  <span data-next-display="package.price"></span>
</div>
```

## Mobile Optimization

### Touch-Friendly Targets
```css
/* Good: Adequate touch targets */
[data-next-selector-card] {
  min-height: 44px;
  padding: 12px;
}

button[data-next-action] {
  min-height: 44px;
  min-width: 44px;
}

/* Avoid: Too small for touch */
button {
  padding: 5px;
  font-size: 12px;
}
```

### Responsive Layouts
```html
<!-- Good: Mobile-first approach -->
<div class="selector-grid">
  <style>
    .selector-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 10px;
    }
    
    @media (min-width: 768px) {
      .selector-grid {
        grid-template-columns: repeat(3, 1fr);
      }
    }
  </style>
</div>
```

## Security

### Validate Input
```javascript
// Good: Validate before using
async function applyCouponCode(code) {
  // Sanitize input
  const sanitized = code.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
  
  if (sanitized.length < 3 || sanitized.length > 20) {
    alert('Invalid coupon code');
    return;
  }
  
  const result = await next.applyCoupon(sanitized);
  // Handle result
}

// Avoid: Direct usage
async function applyCouponCode(code) {
  const result = await next.applyCoupon(code); // No validation!
}
```

## Analytics Integration

### Structured Tracking
```javascript
// Good: Consistent event structure
function trackEvent(action, category, label, value) {
  if (window.gtag) {
    gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value
    });
  }
}

next.on('cart:item-added', (data) => {
  trackEvent('add_to_cart', 'ecommerce', data.item.name, data.item.price);
});

// Avoid: Inconsistent tracking
next.on('cart:item-added', (data) => {
  gtag('event', 'cart_add'); // Missing data
  fbq('track', 'AddToCart', { value: data.item.price }); // Different structure
});
```

## Common Anti-Patterns to Avoid

1. **Don't fight the SDK** - Work with its patterns, not against them
2. **Don't duplicate state** - Use SDK as single source of truth  
3. **Don't bypass SDK methods** - Use provided APIs
4. **Don't over-optimize** - Let SDK handle performance
5. **Don't ignore errors** - Always handle edge cases
6. **Don't hardcode values** - Use dynamic data from SDK
7. **Don't break accessibility** - Maintain semantic HTML

## Testing Strategies

TODO: Add testing best practices

## Debugging Tips

Enable debug mode during development:
```html
<meta name="next-debug" content="true">
```

Use browser DevTools:
- Monitor Network tab for API calls
- Check Console for SDK messages
- Use Elements panel to inspect state classes