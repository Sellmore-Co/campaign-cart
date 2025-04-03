# Campaign Cart Initialization and Configuration

This document explains the various ways to initialize and configure the Campaign Cart library in your application.

## Documentation Links

- [Cart Display System](./components/CartDisplay.md) - Documentation on cart display attributes and usage
- [Unit Pricing System](./components/UnitPricing.md) - Documentation on unit pricing for selector cards
- [Events System](./Events.md) - Documentation on events and their usage
- [Checkout System](./checkout/) - Checkout page documentation
- [Upsell System](./Upsell.md) - Documentation on implementing upsells

## Auto-Initialization

By default, the library will automatically initialize when the DOM is loaded. This behavior can be customized with configuration parameters.

### Meta Tags Configuration

The simplest way to configure the library is through meta tags in your HTML:

```html
<!-- Required parameters -->
<meta name="os-api-key" content="YOUR_API_KEY">

<!-- Optional parameters -->
<meta name="os-debug" content="true">

<!-- Disable auto-initialization if needed -->
<meta name="os-disable-auto-init" content="true">
```

## Manual Initialization

If you want more control over when the library initializes, you can disable auto-initialization and initialize it manually:

```html
<meta name="os-disable-auto-init" content="true">
```

```javascript
import { TwentyNineNext } from '@29next/campaign-cart';

// Initialize with configuration
const client = new TwentyNineNext({
  apiKey: 'YOUR_API_KEY',
  campaignId: 'YOUR_CAMPAIGN_ID',
  debug: true,
  autoInit: true, // Set to false if you want to call init() manually
  googleMapsApiKey: 'YOUR_MAPS_API_KEY'
  });

// Manually initialize if autoInit was set to false
// client.init();

// Register ready callbacks
client.onReady(() => {
  // Do something when the client is ready
  console.log('Client ready!');
});
```

## JavaScript Configuration

You can also configure various aspects of the library using the global `window.osConfig` object:

### UTM Transfer Configuration

```javascript
window.osConfig = window.osConfig || {};
window.osConfig.utmTransfer = {
  enabled: true,               // Enable/disable UTM parameter transfer
  applyToExternalLinks: false, // Apply to links outside your domain
  debug: true,                 // Enable debug logging for UTM transfer
  excludedDomains: ['example.com', 'test.org'], // Domains to exclude
  paramsToCopy: ['utm_source', 'utm_medium']    // Specific params to transfer (defaults to all UTM params)
};
```

### Address Configuration

```javascript
window.osConfig = window.osConfig || {};
window.osConfig.addressConfig = {
  defaultCountry: "US",                  // Default country for address forms
  showCountries: ['US', 'GB', 'AU', 'DE'], // Countries to show in dropdown
  dontShowStates: [                      // States to hide from dropdown
    "AS", "GU", "HI", "MP", "PR", "VI", 
    "UM-81", "UM-84", "UM-86", "UM-67", "UM-89", 
    "UM-71", "UM-76", "UM-95", "UM", "UM-79"
  ]
};
```

### Cart Display Configuration

```javascript
window.osConfig = window.osConfig || {};
window.osConfig.cartDisplay = {
  showSavings: true,           // Show savings amount in cart
  showRetailPrice: true,       // Show original price for discounted items
  animateQuantityChanges: true // Animate quantity changes in cart
};
```

### Google Maps Configuration

```javascript
window.osConfig = window.osConfig || {};
window.osConfig.googleMaps = {
  apiKey: 'YOUR_GOOGLE_MAPS_API_KEY',
  region: 'US',                // Bias results to this region
  enableAutocomplete: true     // Enable address autocomplete
};
```

## Event System

The library provides a comprehensive event system that allows you to listen for various events:

```javascript
// Using the client instance
client.on('cart.updated', (data) => {
  console.log('Cart updated:', data);
});

// Using the global push method (for auto-initialization)
window.on29NextReady = window.on29NextReady || [];
window.on29NextReady.push((client) => {
  client.on('checkout.started', (data) => {
    console.log('Checkout started:', data);
  });
});
```

## Advanced Configuration

For more advanced use cases, you can configure the library directly at runtime by accessing the global instance:

```javascript
window.on29NextReady = window.on29NextReady || [];
window.on29NextReady.push((client) => {
  // Configure specific components
  client.cart.setMaxQuantity(10);
  client.display.setDefaultAnimation('fade');
  
  // Listen for specific events
  client.on('payment.completed', (data) => {
    // Custom tracking or post-purchase actions
  });
});
```
