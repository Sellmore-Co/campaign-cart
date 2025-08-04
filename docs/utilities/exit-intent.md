# Exit Intent Popup

Show popups when users try to leave the page.

## Basic Usage

```javascript
// Wait for SDK to be fully initialized
window.addEventListener('next:initialized', function() {
  console.log('SDK initialized, setting up exit intent...');

  // Super simple exit intent setup
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
    console.log('Exit intent popup shown:', data.imageUrl);
  });

  next.on('exit-intent:clicked', (data) => {
    console.log('Exit intent popup clicked:', data.imageUrl);
  });

  next.on('exit-intent:dismissed', (data) => {
    console.log('Exit intent popup dismissed:', data.imageUrl);
  });
});
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

## Configuration Options

| Parameter | Description | Required |
|-----------|-------------|----------|
| `image` | URL of popup image | Yes |
| `action` | Function to execute on click | No |

## Events

### exit-intent:shown
Fired when popup is displayed:
```javascript
next.on('exit-intent:shown', (data) => {
  // data.imageUrl - The image URL shown
  // data.timestamp - When shown
});
```

### exit-intent:clicked
Fired when popup is clicked:
```javascript
next.on('exit-intent:clicked', (data) => {
  // data.imageUrl - The image URL clicked
  // data.timestamp - When clicked
});
```

### exit-intent:dismissed
Fired when popup is closed without clicking:
```javascript
next.on('exit-intent:dismissed', (data) => {
  // data.imageUrl - The image URL dismissed
  // data.timestamp - When dismissed
  // data.method - How it was dismissed ('overlay', 'close', 'escape')
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
    // Cart page - free shipping offer
    next.exitIntent({
      image: '/images/free-shipping.jpg',
      action: () => next.applyCoupon('FREESHIP')
    });
  } else {
    // Other pages - newsletter signup
    next.exitIntent({
      image: '/images/newsletter.jpg',
      action: () => {
        document.querySelector('#newsletter-modal').classList.add('show');
      }
    });
  }
});
```

### Cart Value Based Offers

```javascript
function setupDynamicExitIntent() {
  const cartTotal = next.getCartData()?.total || 0;
  
  if (cartTotal === 0) {
    // Empty cart - show bestsellers
    next.exitIntent({
      image: '/images/bestsellers.jpg',
      action: () => window.location.href = '/bestsellers'
    });
  } else if (cartTotal < 50) {
    // Small cart - offer percentage discount
    next.exitIntent({
      image: '/images/15-percent-off.jpg',
      action: () => next.applyCoupon('SAVE15')
    });
  } else if (cartTotal < 100) {
    // Medium cart - offer free shipping
    next.exitIntent({
      image: '/images/free-shipping-50.jpg',
      action: () => next.applyCoupon('SHIP50')
    });
  } else {
    // Large cart - offer free gift
    next.exitIntent({
      image: '/images/free-gift-100.jpg',
      action: () => {
        next.addItem({ packageId: 99, quantity: 1 }); // Free gift item
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

## Styling

The exit intent popup can be styled with CSS:

```css
/* Exit intent overlay */
.next-exit-intent-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  z-index: 9998;
}

/* Exit intent popup */
.next-exit-intent-popup {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 9999;
  max-width: 600px;
  cursor: pointer;
}

/* Close button */
.next-exit-intent-close {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 30px;
  height: 30px;
  cursor: pointer;
}
```

## Best Practices

1. **Relevant Offers**: Match popup content to user behavior
2. **Clear Value**: Make the benefit immediately obvious
3. **Easy Dismissal**: Allow users to close easily
4. **Mobile Consideration**: Test popup size on mobile
5. **One Per Session**: Don't show repeatedly to same user
6. **Fast Loading**: Pre-load images for instant display

## Integration Tips

- Use with analytics to track effectiveness
- A/B test different images and offers
- Consider user journey stage
- Respect user preferences (cookies)
- Test across different devices and browsers