# Exit Intent Popup

Show popups when users try to leave the page. Supports both simple image popups and custom HTML templates.

## Basic Usage (Image Popup)

```javascript
// Wait for SDK to be fully initialized
window.addEventListener('next:initialized', function() {
  console.log('SDK initialized, setting up exit intent...');

  // Simple image popup setup
  next.exitIntent({
    image: 'https://cdn.prod.website-files.com/68106277c04984fe676e423a/6823ba8d65474fce67152554_exit-popup1.webp',
    action: async () => {
      const result = await next.applyCoupon('SAVE10');
      if (result.success) {
        alert('Coupon applied successfully: ' + result.message);
      } else {
        alert('Coupon failed: ' + result.message);
      }
    }
  });

  // Optional: Listen to events for analytics
  next.on('exit-intent:shown', (data) => {
    console.log('Exit intent popup shown:', data);
  });

  next.on('exit-intent:clicked', (data) => {
    console.log('Exit intent popup clicked:', data);
  });

  next.on('exit-intent:dismissed', (data) => {
    console.log('Exit intent popup dismissed:', data);
  });
});
```

## Template-Based Usage (Custom HTML)

```html
<!-- Define your template in HTML -->
<template data-template="exit-intent">
  <div class="exit-modal">
    <h2>Wait! Don't Leave Yet!</h2>
    <p>Get 20% OFF your order</p>
    
    <!-- Display dynamic cart data -->
    <div class="cart-info">
      Your cart total: <span data-next-display="cart.total"></span>
    </div>
    
    <!-- Action buttons with special attributes -->
    <button data-exit-intent-action="apply-coupon" data-coupon-code="SAVE20" class="btn-primary">
      Apply 20% Discount
    </button>
    
    <!-- This button triggers the custom action function -->
    <button data-exit-intent-action="custom" class="btn-primary">
      Show Me More
    </button>
    
    <button data-exit-intent-action="close" class="btn-secondary">
      No Thanks
    </button>
  </div>
</template>

<script>
window.addEventListener('next:initialized', function() {
  // Setup with template
  next.exitIntent({
    template: 'exit-intent',        // Name matches data-template attribute
    showCloseButton: true,          // Show X button
    overlayClosable: true,           // Click overlay to close
    maxTriggers: 1,                  // Show only once per session
    disableOnMobile: true,           // Desktop only by default
    action: () => {
      // This function is ONLY called when clicking elements with:
      // data-exit-intent-action="custom"
      console.log('Custom action triggered!');
      alert('Custom action was triggered!');
    }
  });
});
</script>
```

## Simple Examples

### Just Show a Popup (No Action)

```javascript
function justShowPopup() {
  next.exitIntent({
    image: 'https://example.com/just-popup.webp'
  });
}
```

### Redirect Instead of Coupon

```javascript
function redirectExample() {
  next.exitIntent({
    image: 'https://example.com/special-offer.webp',
    action: () => {
      window.location.href = '/special-offer';
    }
  });
}
```

### Conditional Popup Based on Cart

```javascript
function conditionalExample() {
  const cartCount = next.getCartCount();
  
  if (cartCount === 0) {
    next.exitIntent({
      image: 'https://example.com/empty-cart.webp',
      action: () => window.location.href = '/products'
    });
  } else {
    next.exitIntent({
      image: 'https://example.com/discount.webp',
      action: () => next.applyCoupon('SAVE10')
    });
  }
}
```

### Template with Multiple Offers

```html
<template data-template="exit-intent-offers">
  <div class="exit-offers">
    <h2>Choose Your Discount!</h2>
    
    <div class="offer-grid">
      <div class="offer">
        <h3>10% OFF</h3>
        <button data-exit-intent-action="apply-coupon" data-coupon-code="SAVE10">
          Apply Code
        </button>
      </div>
      
      <div class="offer">
        <h3>Free Shipping</h3>
        <button data-exit-intent-action="apply-coupon" data-coupon-code="FREESHIP">
          Get Free Shipping
        </button>
      </div>
      
      <div class="offer">
        <h3>$5 OFF</h3>
        <button data-exit-intent-action="apply-coupon" data-coupon-code="FIVER">
          Save $5
        </button>
      </div>
    </div>
    
    <button data-exit-intent-action="close" class="close-link">
      I don't want to save money
    </button>
  </div>
</template>
```

## Configuration Options

| Parameter | Description | Required | Default |
|-----------|-------------|----------|---------|
| `image` | URL of popup image | Yes (if no template) | - |
| `template` | Name of template (matches `data-template` attribute) | Yes (if no image) | - |
| `action` | Function to execute on click/custom action | No | - |
| `showCloseButton` | Show X button on modal | No | false |
| `overlayClosable` | Allow clicking overlay to close | No | true |
| `maxTriggers` | Maximum times to show per session | No | 1 |
| `disableOnMobile` | Disable on mobile devices | No | true |
| `mobileScrollTrigger` | Enable scroll trigger on mobile | No | false |
| `useSessionStorage` | Remember dismissal in session | No | true |
| `sessionStorageKey` | Custom storage key | No | 'exit-intent-dismissed' |

## Events

### exit-intent:shown
Fired when popup is displayed:
```javascript
next.on('exit-intent:shown', (data) => {
  // data.imageUrl - The image URL shown (if using image)
  // data.template - The template name (if using template)
});
```

### exit-intent:clicked
Fired when popup is clicked (image mode only):
```javascript
next.on('exit-intent:clicked', (data) => {
  // data.imageUrl - The image URL clicked
});
```

### exit-intent:dismissed
Fired when popup is closed without action:
```javascript
next.on('exit-intent:dismissed', (data) => {
  // data.imageUrl - The image URL (if using image)
  // data.template - The template name (if using template)
});
```

### exit-intent:closed
Fired when close button is clicked:
```javascript
next.on('exit-intent:closed', (data) => {
  // data.template - The template name
});
```

### exit-intent:action
Fired when template action buttons are clicked:
```javascript
next.on('exit-intent:action', (data) => {
  // data.action - The action type ('close', 'apply-coupon', 'custom')
  // data.couponCode - The coupon code (if action is 'apply-coupon')
});
```

## Advanced Examples

### Multiple Exit Intent Strategies

```javascript
// Different popups for different pages
window.addEventListener('next:initialized', function() {
  const pathname = window.location.pathname;
  
  if (pathname.includes('/product')) {
    // Product page - offer discount
    next.exitIntent({
      image: '/images/10-percent-off.jpg',
      action: () => next.applyCoupon('SAVE10')
    });
  } else if (pathname.includes('/cart')) {
    // Cart page - free shipping offer with template
    next.exitIntent({
      template: 'exit-intent-shipping',
      showCloseButton: true
    });
  } else {
    // Other pages - newsletter signup
    next.exitIntent({
      template: 'exit-intent-newsletter',
      overlayClosable: true
    });
  }
});
```

### Cart Value Based Offers

```javascript
function setupDynamicExitIntent() {
  const cartData = next.getCartData();
  const cartTotal = cartData?.totals?.total?.value || 0;
  
  if (cartTotal === 0) {
    // Empty cart - show bestsellers
    next.exitIntent({
      image: '/images/bestsellers.jpg',
      action: () => window.location.href = '/bestsellers'
    });
  } else if (cartTotal < 50) {
    // Small cart - offer percentage discount
    next.exitIntent({
      template: 'exit-intent-discount-15'
    });
  } else if (cartTotal < 100) {
    // Medium cart - offer free shipping
    next.exitIntent({
      template: 'exit-intent-free-shipping'
    });
  } else {
    // Large cart - offer free gift
    next.exitIntent({
      image: '/images/free-gift-100.jpg',
      action: () => {
        next.addToCart({ packageId: 99, quantity: 1 }); // Free gift item
      }
    });
  }
}
```

### Time-Based Exit Intent

```javascript
// Show exit intent only after user has been on page for 30 seconds
let exitIntentTimer;

window.addEventListener('next:initialized', function() {
  exitIntentTimer = setTimeout(() => {
    next.exitIntent({
      image: '/images/dont-leave-yet.jpg',
      action: () => next.applyCoupon('COMEBACK')
    });
  }, 30000); // 30 seconds
});

// Clear timer if user completes action
function onUserAction() {
  clearTimeout(exitIntentTimer);
}
```

## Template Action Attributes

When using templates, you can add special attributes to buttons and links to trigger actions:

### Available Actions

| Attribute | Additional Attributes | Description |
|-----------|----------------------|-------------|
| `data-exit-intent-action="close"` | - | Closes the modal |
| `data-exit-intent-action="apply-coupon"` | `data-coupon-code="CODE"` | Applies coupon and closes modal |
| `data-exit-intent-action="custom"` | - | Triggers the custom action function from options |

### ⚠️ Important: How Actions Work

**For Templates:**
- The `action` function is **ONLY** triggered by elements with `data-exit-intent-action="custom"`
- Clicking regular content (divs, text, etc.) does NOT trigger any action
- You MUST add the attribute to buttons/links that should trigger the action

**For Images:**
- Clicking anywhere on the image triggers the action function

### Working Example:

```html
<template data-template="exit-intent">
  <div class="exit-modal-content">
    <!-- This content does nothing when clicked -->
    <h2>Special Offer!</h2>
    <p>Click the buttons below for actions:</p>
    
    <!-- Only these buttons trigger actions -->
    <button data-exit-intent-action="apply-coupon" data-coupon-code="SAVE10">
      Apply SAVE10 Coupon
    </button>
    
    <button data-exit-intent-action="custom">
      Click Here to Trigger Custom Action
    </button>
    
    <button data-exit-intent-action="close">
      Close Modal
    </button>
  </div>
</template>

<script>
next.exitIntent({
  template: 'exit-intent',
  action: () => {
    // This ONLY runs when clicking the button with:
    // data-exit-intent-action="custom"
    console.log('The custom action button was clicked!');
    alert('Custom action triggered!');
  }
});
</script>
```

## Styling

The exit intent popup can be styled with CSS:

```css
/* Exit intent overlay */
[data-exit-intent="overlay"] {
  /* Overlay is styled inline but you can override */
  background: rgba(0, 0, 0, 0.8) !important;
}

/* Exit intent popup container */
[data-exit-intent="popup"] {
  /* Popup container styles */
}

/* Template popup specific */
.exit-intent-template-popup {
  background: white;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

/* Close button */
[data-exit-intent="close"] {
  /* Close button styles */
}

/* Your custom template content */
.exit-modal-content {
  padding: 40px;
  text-align: center;
}

.exit-modal-content h2 {
  margin-bottom: 20px;
  font-size: 28px;
}

.exit-modal-content button {
  margin: 10px;
  padding: 12px 30px;
  font-size: 16px;
  border-radius: 5px;
}
```

## Best Practices

1. **Choose the Right Method**:
   - Use **image popups** for simple, visual offers
   - Use **templates** for interactive, complex modals

2. **Mobile Optimization**:
   - Default `disableOnMobile: true` for desktop-only
   - Enable `mobileScrollTrigger` for mobile support
   - Test template layouts on small screens

3. **Session Management**:
   - Use `maxTriggers: 1` to avoid annoying users
   - Leverage `sessionStorage` to remember dismissals
   - Reset with `next.exitIntent.reset()` if needed

4. **Template Best Practices**:
   - Keep templates hidden with `<template>` tags
   - Use semantic `data-template` names
   - Include cart display attributes for dynamic data
   - Test all action buttons thoroughly

5. **Performance**:
   - Templates are only cloned when needed
   - Images should be optimized and pre-loaded
   - Use CDN for image hosting

## API Methods

The exit intent enhancer is accessed directly via `next.exitIntent()`:

```javascript
// Initialize exit intent (call this method directly)
next.exitIntent(options);

// The exit intent instance has these methods available after initialization:
// However, these are internal methods and not typically called directly by users
```

**Note:** The main API is simply `next.exitIntent(options)` - you don't need to call `.setup()`. The enhancer initializes automatically when you pass the configuration options.

## Integration Tips

- **Analytics**: Track events to measure conversion impact
- **A/B Testing**: Create multiple templates for testing
- **Personalization**: Use cart data to customize offers
- **Timing**: Consider page visit duration before triggering
- **Context**: Different templates for different page types