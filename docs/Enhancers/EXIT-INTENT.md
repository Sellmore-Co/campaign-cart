# Exit Intent Enhancer

The Exit Intent Enhancer provides a simple way to show popups when users are about to leave your site. Perfect for last-minute offers, newsletter signups, or discount codes.

## Overview

The exit intent feature detects when a user is likely to leave your page and displays a customizable popup image. When clicked, it can trigger any action you define - from applying coupons to redirecting to special offers.

## Basic Usage

```javascript
// Simple exit intent with coupon
next.exitIntent({
  image: 'https://example.com/popup.jpg',
  action: () => next.applyCoupon('SAVE10')
});
```

That's it! The enhancer handles all the complexity internally.

## How It Works

### Desktop Detection
- Triggers when mouse moves to the top 10px of the browser window
- Indicates user moving toward browser tabs/close button

### Mobile Detection  
- Triggers when user scrolls 50% down the page
- Helps capture engaged mobile users before they leave

### Smart Limits
- Maximum 3 triggers per session
- 30-second cooldown between triggers
- Prevents annoying repeated popups

## API Reference

### `next.exitIntent(options)`

Configures and enables exit intent detection.

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `options.image` | string | **Required.** URL of the popup image to display |
| `options.action` | function | Optional. Function to execute when popup is clicked |

#### Example

```javascript
next.exitIntent({
  image: 'https://cdn.example.com/special-offer.jpg',
  action: async () => {
    const result = await next.applyCoupon('WELCOME20');
    if (result.success) {
      alert('20% discount applied!');
    }
  }
});
```

### `next.disableExitIntent()`

Disables exit intent detection and removes any active popups.

```javascript
// Disable exit intent
next.disableExitIntent();
```

## Events

The enhancer emits events for tracking and analytics:

### `exit-intent:shown`
Fired when the popup is displayed.

```javascript
next.on('exit-intent:shown', (data) => {
  console.log('Popup shown:', data.imageUrl);
  // Track with analytics
  gtag('event', 'exit_intent_shown', {
    image: data.imageUrl
  });
});
```

### `exit-intent:clicked`
Fired when the popup is clicked.

```javascript
next.on('exit-intent:clicked', (data) => {
  console.log('Popup clicked:', data.imageUrl);
});
```

### `exit-intent:dismissed`
Fired when the popup is closed without clicking.

```javascript
next.on('exit-intent:dismissed', (data) => {
  console.log('Popup dismissed');
});
```

## Common Use Cases

### 1. Discount Coupon
```javascript
next.exitIntent({
  image: 'https://example.com/10-percent-off.jpg',
  action: () => next.applyCoupon('SAVE10')
});
```

### 2. Newsletter Signup
```javascript
next.exitIntent({
  image: 'https://example.com/newsletter.jpg',
  action: () => {
    document.getElementById('newsletter-modal').style.display = 'block';
  }
});
```

### 3. Special Offer Redirect
```javascript
next.exitIntent({
  image: 'https://example.com/limited-time.jpg',
  action: () => {
    window.location.href = '/special-offer';
  }
});
```

### 4. Conditional Popups
```javascript
// Different popups based on cart value
const cartTotal = next.getCartTotals().total.value;

if (cartTotal === 0) {
  // Empty cart - show product suggestions
  next.exitIntent({
    image: 'https://example.com/browse-products.jpg',
    action: () => window.location.href = '/bestsellers'
  });
} else if (cartTotal < 50) {
  // Low cart value - offer free shipping
  next.exitIntent({
    image: 'https://example.com/free-shipping-50.jpg',
    action: () => next.applyCoupon('FREESHIP50')
  });
} else {
  // High cart value - offer percentage discount
  next.exitIntent({
    image: 'https://example.com/vip-discount.jpg',
    action: () => next.applyCoupon('VIP15')
  });
}
```

### 5. Just Display Information
```javascript
// No action needed - just show announcement
next.exitIntent({
  image: 'https://example.com/store-announcement.jpg'
});
```

## Best Practices

### 1. Image Guidelines
- **Size**: Keep images under 500KB for fast loading
- **Dimensions**: Design for both desktop and mobile viewports
- **Format**: Use WebP or optimized JPEG/PNG
- **Content**: Clear call-to-action, readable text

### 2. Timing
- Initialize after page content loads
- Don't trigger on checkout or thank you pages
- Consider user journey stage

### 3. Mobile Considerations
- Test on various device sizes
- Ensure popup is dismissible on touch devices
- Consider smaller images for mobile

### 4. Performance
```javascript
// Wait for SDK initialization
window.addEventListener('next:initialized', function() {
  // Only load on appropriate pages
  if (!window.location.pathname.includes('/checkout')) {
    next.exitIntent({
      image: 'https://example.com/offer.jpg',
      action: () => next.applyCoupon('SAVE')
    });
  }
});
```

## Troubleshooting

### Popup Not Showing
1. Check browser console for errors
2. Verify image URL is accessible
3. Ensure SDK is initialized before calling `exitIntent()`
4. Clear cooldown by refreshing page

### Multiple Popups
The enhancer prevents multiple simultaneous popups. Only one exit intent can be active at a time.

### Testing Tips
- Move mouse slowly to top of browser window
- On mobile, scroll down at least 50% of page
- Use incognito/private mode to reset trigger count
- Add `?debug=true` to URL for debug logs

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 11+
- Edge 79+
- Mobile Safari (iOS 11+)
- Chrome Mobile (Android 5+)

## Complete Example

```html
<!DOCTYPE html>
<html>
<head>
  <script src="https://campaign-cart-v2.pages.dev/loader.js"></script>
</head>
<body>
  <h1>My Store</h1>
  
  <script>
    window.addEventListener('next:initialized', function() {
      // Setup exit intent with discount offer
      next.exitIntent({
        image: 'https://example.com/last-chance-20-off.jpg',
        action: async () => {
          // Apply coupon
          const result = await next.applyCoupon('LASTCHANCE20');
          
          if (result.success) {
            // Show success message
            const message = document.createElement('div');
            message.textContent = '20% discount applied!';
            message.style.cssText = `
              position: fixed;
              top: 20px;
              right: 20px;
              background: #4CAF50;
              color: white;
              padding: 15px 25px;
              border-radius: 5px;
              z-index: 10000;
            `;
            document.body.appendChild(message);
            
            // Remove after 3 seconds
            setTimeout(() => message.remove(), 3000);
          }
        }
      });
      
      // Track analytics
      next.on('exit-intent:shown', (data) => {
        if (typeof gtag !== 'undefined') {
          gtag('event', 'exit_intent_displayed', {
            event_category: 'engagement',
            event_label: data.imageUrl
          });
        }
      });
    });
  </script>
</body>
</html>
```