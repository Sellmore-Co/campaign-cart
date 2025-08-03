# FOMO Script

Create social proof with fake purchase notifications.

## Basic Usage

```javascript
// Wait for SDK to be fully initialized
window.addEventListener('next:initialized', function() {
  console.log('SDK initialized, starting FOMO popups...');
  
  // Simple usage - starts immediately with defaults
  next.fomo();
  
  // Optional: Listen to events for analytics
  next.on('fomo:shown', (data) => {
    console.log('FOMO shown:', data.customer, 'purchased', data.product);
  });
});
```

## Configuration Options

```javascript
next.fomo({
  initialDelay: 2000,      // Start after 2 seconds
  displayDuration: 5000,   // Show for 5 seconds
  delayBetween: 10000     // 10 seconds between popups
});
```

## Control Functions

```javascript
// Start FOMO notifications
function startFomo() {
  next.fomo({
    initialDelay: 2000,
    displayDuration: 5000,
    delayBetween: 10000
  });
}

// Stop FOMO notifications
function stopFomo() {
  next.stopFomo();
}
```

## Custom Configuration

```javascript
function customFomo() {
  next.fomo({
    items: [{
      text: "Premium Bundle - Save 30%",
      image: "https://example.com/premium-bundle.jpg"
    }, {
      text: "Starter Pack",
      image: "https://example.com/starter-pack.jpg"
    }],
    customers: {
      US: ["Sarah from Dallas", "Mike from Boston", "Lisa from Miami"],
      CA: ["Jean from Montreal", "Pierre from Quebec", "Marie from Toronto"]
    },
    maxMobileShows: 3,     // Show max 3 times on mobile
    displayDuration: 4000,
    delayBetween: 15000,
    initialDelay: 0        // Start immediately
  });
}
```

## Configuration Parameters

| Parameter | Description | Default |
|-----------|-------------|---------|
| `initialDelay` | Delay before first popup (ms) | 5000 |
| `displayDuration` | How long to show each popup (ms) | 5000 |
| `delayBetween` | Time between popups (ms) | 10000 |
| `maxMobileShows` | Max popups on mobile devices | 5 |
| `items` | Array of products to show | Campaign products |
| `customers` | Customer names by country | Default names |

## Events

Listen to FOMO events for analytics:

```javascript
// Popup shown
next.on('fomo:shown', (data) => {
  console.log('FOMO popup displayed');
  console.log('Customer:', data.customer);
  console.log('Product:', data.product);
  console.log('Image:', data.image);
});

// Popup clicked
next.on('fomo:clicked', (data) => {
  console.log('FOMO popup clicked');
});

// Popup closed
next.on('fomo:closed', (data) => {
  console.log('FOMO popup closed');
});
```

## Styling

The FOMO popup has default styles but can be customized:

```css
/* FOMO popup container */
.next-fomo-popup {
  position: fixed;
  bottom: 20px;
  left: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  padding: 15px;
  max-width: 300px;
  z-index: 9999;
}

/* Customize appearance */
.next-fomo-popup .customer-name {
  font-weight: bold;
  color: #333;
}

.next-fomo-popup .product-name {
  color: #666;
  margin-top: 5px;
}
```

## Best Practices

1. **Realistic Timing**: Use realistic delays between notifications
2. **Mobile Limits**: Limit popups on mobile devices
3. **Relevant Products**: Show products related to current page
4. **Geographic Match**: Use customer names from target regions
5. **Don't Overuse**: Balance social proof with user experience

## Integration Examples

### Start on Product Pages

```javascript
window.addEventListener('next:initialized', function() {
  // Only show FOMO on product pages
  const pageType = document.querySelector('meta[name="next-page-type"]')?.content;
  
  if (pageType === 'product') {
    next.fomo({
      initialDelay: 3000,
      displayDuration: 4000,
      delayBetween: 12000
    });
  }
});
```

### Dynamic Product Selection

```javascript
// Show FOMO for specific products based on current view
const currentProductId = document.querySelector('[data-next-package-id]')?.dataset.nextPackageId;

next.fomo({
  items: [{
    text: "Same product you're viewing",
    image: document.querySelector('[data-next-display="package.image"]')?.src
  }],
  initialDelay: 5000
});
```

### Stop on Checkout

```javascript
// Stop FOMO when user reaches checkout
if (window.location.pathname.includes('checkout')) {
  next.stopFomo();
}
```