# FOMO Popup Enhancer

The FOMO (Fear of Missing Out) Popup Enhancer displays social proof notifications showing recent customer purchases. This creates urgency and builds trust by showing real-time activity on your store.

## Overview

FOMO popups automatically cycle through recent "purchases" showing customer names, locations, and products. The enhancer handles all timing, animations, and mobile optimization automatically.

## Basic Usage

```javascript
// Start FOMO popups with defaults
next.fomo();

// Stop FOMO popups
next.stopFomo();
```

That's all you need! The enhancer includes default products and customer names to get started immediately.

## How It Works

### Display Behavior
- Shows small popup in bottom-left corner
- Smooth slide-in animation
- Auto-cycles through different customers/products
- Stops after set number on mobile to avoid annoyance

### Smart Defaults
- Pre-configured product examples
- Customer names for US, UK, CA, AU
- Auto-detects user's country based on timezone
- Mobile-optimized display limits

## API Reference

### `next.fomo(config)`

Starts the FOMO popup system with optional configuration.

#### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `config.items` | Array | Built-in items | Array of products to show |
| `config.customers` | Object | Built-in names | Customer names by country |
| `config.maxMobileShows` | number | 2 | Maximum popups on mobile |
| `config.displayDuration` | number | 5000 | How long to show each popup (ms) |
| `config.delayBetween` | number | 12000 | Delay between popups (ms) |
| `config.initialDelay` | number | 0 | Delay before first popup (ms) |

#### Item Structure
```javascript
{
  text: "Product Name - Special Offer",
  image: "https://example.com/product.jpg"
}
```

#### Customers Structure
```javascript
{
  US: ["Sarah from New York", "Mike from Los Angeles"],
  CA: ["Marie from Toronto", "Jean from Montreal"],
  GB: ["James from London", "Emma from Manchester"],
  AU: ["Olivia from Sydney", "Liam from Melbourne"]
}
```

### `next.stopFomo()`

Stops all FOMO popups and cleans up.

```javascript
// Stop popups
next.stopFomo();
```

## Events

### `fomo:shown`
Fired each time a FOMO popup is displayed.

```javascript
next.on('fomo:shown', (data) => {
  console.log('FOMO shown:', {
    customer: data.customer,  // "Sarah from New York"
    product: data.product,    // "Premium Bundle - Save 30%"
    image: data.image        // "https://example.com/bundle.jpg"
  });
});
```

## Configuration Examples

### 1. Basic Start/Stop
```javascript
// Start on page load
window.addEventListener('next:initialized', function() {
  next.fomo();
});

// Stop after 2 minutes
setTimeout(() => {
  next.stopFomo();
}, 120000);
```

### 2. Custom Products
```javascript
next.fomo({
  items: [
    {
      text: "Anti-Aging Serum - 30% Off",
      image: "https://cdn.store.com/serum.jpg"
    },
    {
      text: "Vitamin C Bundle",
      image: "https://cdn.store.com/vitamin-c.jpg"
    },
    {
      text: "Collagen Booster Kit",
      image: "https://cdn.store.com/collagen.jpg"
    }
  ]
});
```

### 3. Custom Timing
```javascript
next.fomo({
  initialDelay: 5000,      // Start after 5 seconds
  displayDuration: 3000,   // Show each for 3 seconds
  delayBetween: 20000,     // 20 seconds between popups
  maxMobileShows: 1        // Only show once on mobile
});
```

### 4. International Customers
```javascript
next.fomo({
  customers: {
    US: ["Jennifer from Miami", "Robert from Chicago", "Lisa from Houston"],
    CA: ["Sophie from Vancouver", "Alexandre from Quebec", "Isabelle from Ottawa"],
    GB: ["Charlotte from Birmingham", "Oliver from Edinburgh", "Amelia from Cardiff"],
    AU: ["Chloe from Perth", "Noah from Brisbane", "Mia from Adelaide"],
    // Add more countries as needed
    FR: ["Marie from Paris", "Pierre from Lyon", "Camille from Marseille"],
    DE: ["Emma from Berlin", "Leon from Munich", "Mia from Hamburg"]
  }
});
```

### 5. Campaign-Specific FOMO
```javascript
// Black Friday campaign
next.fomo({
  items: [
    {
      text: "Black Friday Mega Bundle - 70% Off",
      image: "https://example.com/bf-bundle.jpg"
    },
    {
      text: "Door Buster Deal - Limited Stock",
      image: "https://example.com/door-buster.jpg"
    }
  ],
  customers: {
    US: ["Holiday Shopper from NYC", "Sarah from California", "Deal Hunter from Texas"]
  },
  displayDuration: 4000,
  delayBetween: 8000  // More frequent during sales
});
```

## Best Practices

### 1. Product Images
- **Size**: 60x60px display size, provide 120x120px for retina
- **Format**: JPEG or WebP for photos, PNG for graphics
- **Optimization**: Compress images under 50KB each

### 2. Customer Names
- Use realistic, diverse names
- Include city/region for authenticity
- Match your target market demographics

### 3. Timing Guidelines
- **Initial Delay**: 3-5 seconds gives users time to engage
- **Display Duration**: 3-5 seconds is optimal for reading
- **Delay Between**: 10-20 seconds prevents annoyance
- **Mobile Limits**: 1-3 maximum shows respects mobile users

### 4. Content Strategy
```javascript
// Match FOMO items to page content
const currentProduct = document.querySelector('[data-product-id]')?.dataset.productId;

if (currentProduct === 'serum') {
  next.fomo({
    items: [
      { text: "Serum + Moisturizer Bundle", image: "/bundle1.jpg" },
      { text: "Serum 3-Pack Special", image: "/bundle2.jpg" }
    ]
  });
}
```

## Styling Customization

While the enhancer provides default styles, you can override them:

```css
/* Custom FOMO popup styles */
.next-fomo-wrapper {
  bottom: 30px !important;  /* Adjust position */
  left: 30px !important;
}

.next-fomo-desc {
  font-family: 'Your Font', sans-serif !important;
}

.next-fomo-customer {
  color: #e91e63 !important;  /* Pink customer names */
}

.next-fomo-product {
  color: #2196f3 !important;  /* Blue product names */
}
```

## Performance Considerations

### 1. Image Preloading
```javascript
// Preload images before starting FOMO
const images = [
  'https://example.com/product1.jpg',
  'https://example.com/product2.jpg'
];

Promise.all(images.map(src => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = resolve;
    img.onerror = resolve;
    img.src = src;
  });
})).then(() => {
  // Start FOMO after images are loaded
  next.fomo({
    items: images.map((img, i) => ({
      text: `Product ${i + 1}`,
      image: img
    }))
  });
});
```

### 2. Conditional Loading
```javascript
// Only show FOMO on product pages
if (document.body.classList.contains('product-page')) {
  next.fomo();
}

// Disable on mobile if needed
if (window.innerWidth > 768) {
  next.fomo();
}
```

## Troubleshooting

### Popups Not Showing
1. Check if SDK is initialized: `window.next` should exist
2. Verify no JavaScript errors in console
3. Ensure `next.fomo()` is called after `next:initialized` event

### Images Not Loading
- Verify image URLs are accessible
- Check for CORS issues with external images
- Use absolute URLs for images

### Too Many/Few Popups
- Adjust `delayBetween` for frequency
- Change `maxMobileShows` for mobile
- Call `stopFomo()` when appropriate

## Complete Example

```html
<!DOCTYPE html>
<html>
<head>
  <script src="https://campaign-cart-v2.pages.dev/loader.js"></script>
</head>
<body>
  <h1>Our Best Sellers</h1>
  
  <button onclick="startFomo()">Start FOMO</button>
  <button onclick="stopFomo()">Stop FOMO</button>
  
  <script>
    // Initialize on page load
    window.addEventListener('next:initialized', function() {
      // Start FOMO with custom configuration
      next.fomo({
        items: [
          {
            text: "Vitamin C Serum - Bestseller",
            image: "https://example.com/serum.jpg"
          },
          {
            text: "Retinol Night Cream",
            image: "https://example.com/retinol.jpg"
          },
          {
            text: "Hydrating Face Mask Set",
            image: "https://example.com/masks.jpg"
          }
        ],
        customers: {
          US: ["Emma from LA", "Sophia from Miami", "Olivia from NYC"],
          CA: ["Isabella from Toronto", "Mia from Vancouver"],
          GB: ["Charlotte from London", "Amelia from Manchester"]
        },
        initialDelay: 3000,      // Start after 3 seconds
        displayDuration: 4000,   // Show for 4 seconds
        delayBetween: 15000,     // 15 seconds between
        maxMobileShows: 2        // Max 2 on mobile
      });
      
      // Track events
      next.on('fomo:shown', (data) => {
        console.log('FOMO popup shown:', data);
        
        // Send to analytics
        if (typeof gtag !== 'undefined') {
          gtag('event', 'fomo_displayed', {
            event_category: 'social_proof',
            event_label: data.product,
            customer_location: data.customer
          });
        }
      });
    });
    
    // Control functions
    function startFomo() {
      next.fomo({
        initialDelay: 0  // Start immediately
      });
    }
    
    function stopFomo() {
      next.stopFomo();
      console.log('FOMO stopped');
    }
    
    // Stop FOMO when user starts checkout
    document.addEventListener('next:checkout-started', function() {
      next.stopFomo();
    });
  </script>
</body>
</html>
```

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 11+
- Edge 79+
- Mobile Safari (iOS 11+)
- Chrome Mobile (Android 5+)

## Notes

- FOMO popups are automatically responsive
- Country detection is based on browser timezone
- Popups won't overlap with exit intent popups
- All animations use CSS for performance
- Memory is cleaned up when stopped