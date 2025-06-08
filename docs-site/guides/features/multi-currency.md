# Multi-Currency Guide

Complete guide to implementing multi-currency support with automatic country detection and campaign switching.

## Overview

Campaign Cart's multi-currency system:
- Automatically detects user location
- Loads appropriate campaign for their country
- Translates package IDs between campaigns
- Displays correct currency formatting
- Maintains cart consistency across currencies

## Supported Currencies

| Country | Code | Currency | Symbol |
|---------|------|----------|---------|
| United States | US | USD | $ |
| Canada | CA | CAD | C$ |
| United Kingdom | GB | GBP | £ |
| European Union | EU | EUR | € |
| Australia | AU | AUD | A$ |

## Basic Setup

### 1. Configure Country-Specific Campaigns

Create separate campaigns in 29next for each country:
- Campaign US: Products priced in USD
- Campaign CA: Products priced in CAD
- Campaign GB: Products priced in GBP
- etc.

### 2. Set Up Country Detection

Campaign Cart uses a Cloudflare Worker at `/location` endpoint:

```javascript
// Automatic detection happens on initialization
window.osConfig = {
  apiKey: 'YOUR_API_KEY',
  campaignId: 'YOUR_DEFAULT_CAMPAIGN',
  enableCountryDetection: true // Default: true
};
```

### 3. Map Packages Between Campaigns

Use Product Profiles for automatic mapping:

```javascript
// In your configuration
window.osConfig = {
  productProfiles: {
    'starter-kit': {
      name: 'Starter Kit',
      campaigns: {
        'US': { packageId: 1, price: 29.99 },
        'CA': { packageId: 101, price: 39.99 },
        'GB': { packageId: 201, price: 24.99 },
        'EU': { packageId: 301, price: 27.99 },
        'AU': { packageId: 401, price: 44.99 }
      }
    }
  }
};
```

## Implementation

### Using Product Profiles (Recommended)

```html
<!-- Automatically uses correct package for user's country -->
<button data-os-action="toggle-item" data-os-profile="starter-kit">
  Add Starter Kit
</button>

<!-- Price updates based on country -->
<span data-os-profile-price data-os-profile-id="starter-kit">$29.99</span>
```

### Manual Package Mapping

```javascript
// Get current country
const country = window.twentyNineNext.getCountry();

// Map package IDs
const packageMap = {
  'US': { starter: 1, pro: 2, ultimate: 3 },
  'CA': { starter: 101, pro: 102, ultimate: 103 },
  'GB': { starter: 201, pro: 202, ultimate: 203 }
};

// Add correct package
const packageId = packageMap[country].starter;
window.twentyNineNext.addToCart(packageId);
```

## Testing Different Countries

### Force Country Parameter

```
https://yoursite.com?forceCountry=CA
https://yoursite.com?forceCountry=GB
https://yoursite.com?forceCountry=AU
```

### Programmatic Testing

```javascript
// Set country programmatically
window.twentyNineNext.setCountry('CA');

// Get current country
console.log(window.twentyNineNext.getCountry()); // "CA"

// Reset to auto-detection
window.twentyNineNext.setCountry(null);
```

## Currency Formatting

### Automatic Formatting

Campaign Cart automatically formats prices based on country:

```javascript
// US: $29.99
// CA: C$39.99
// GB: £24.99
// EU: €27.99
// AU: A$44.99
```

### Custom Formatting

```javascript
// Override currency display
window.osConfig = {
  currencyConfig: {
    'CA': {
      symbol: 'CAD $',
      position: 'before',
      decimals: 2,
      thousandsSeparator: ',',
      decimalSeparator: '.'
    }
  }
};

// Format manually
const formatted = window.twentyNineNext.formatCurrency(29.99);
```

## Handling Country Changes

### Listen for Country Changes

```javascript
document.addEventListener('country.changed', (event) => {
  console.log('Country changed to:', event.detail.country);
  console.log('New campaign:', event.detail.campaign);
  
  // Update UI elements
  updatePriceDisplays();
  updateCurrencySymbols();
});
```

### Maintain Cart Consistency

```javascript
// Cart items are automatically translated when country changes
document.addEventListener('country.changed', (event) => {
  // Cart items with profile IDs are automatically updated
  // Manual package IDs may need attention
  
  const cart = window.twentyNineNext.getCart();
  console.log('Cart after country change:', cart);
});
```

## Advanced Configuration

### Country-Specific Settings

```javascript
window.osConfig = {
  countryConfig: {
    'CA': {
      campaignId: 'campaign-ca',
      defaultProvince: 'ON',
      taxRate: 0.13,
      shippingMessage: 'Free shipping over C$50'
    },
    'GB': {
      campaignId: 'campaign-gb',
      defaultCounty: 'London',
      taxRate: 0.20,
      shippingMessage: 'Free UK delivery'
    }
  }
};
```

### Country Detection Fallbacks

```javascript
window.osConfig = {
  // Primary detection method
  enableCountryDetection: true,
  
  // Fallback to browser language
  detectFromLanguage: true,
  
  // Ultimate fallback
  defaultCountry: 'US',
  
  // Custom detection endpoint
  countryDetectionEndpoint: '/api/location'
};
```

## UI Considerations

### Country Selector

```html
<select id="country-selector">
  <option value="US">United States (USD)</option>
  <option value="CA">Canada (CAD)</option>
  <option value="GB">United Kingdom (GBP)</option>
  <option value="EU">Europe (EUR)</option>
  <option value="AU">Australia (AUD)</option>
</select>

<script>
document.getElementById('country-selector').addEventListener('change', (e) => {
  window.twentyNineNext.setCountry(e.target.value);
});

// Set initial value
document.getElementById('country-selector').value = window.twentyNineNext.getCountry();
</script>
```

### Currency-Aware Displays

```html
<!-- Shows currency symbol based on country -->
<div class="price-display">
  <span data-os-cart-summary="currency-symbol">$</span>
  <span data-os-profile-price data-os-profile-id="starter-kit">29.99</span>
</div>

<!-- Conditional content based on country -->
<div data-os-in-cart="display" data-container="true">
  Free shipping in the United States!
</div>

<div data-os-in-cart="display" data-container="true">
  Free shipping in Canada over C$50!
</div>
```

## Performance Optimization

### Lazy Loading Campaigns

```javascript
window.osConfig = {
  // Only load campaign data when needed
  lazyLoadCampaigns: true,
  
  // Preload specific campaigns
  preloadCampaigns: ['US', 'CA'],
  
  // Cache campaign data
  cacheCampaignData: true,
  cacheExpiry: 86400 // 24 hours
};
```

### CDN Configuration

```javascript
// Use region-specific CDNs
window.osConfig = {
  cdnEndpoints: {
    'US': 'https://us-cdn.29next.com',
    'EU': 'https://eu-cdn.29next.com',
    'APAC': 'https://apac-cdn.29next.com'
  }
};
```

## Troubleshooting

### Country Detection Issues

```javascript
// Debug country detection
window.twentyNineNext.enableDebug();
console.log('Detected country:', window.twentyNineNext.getCountry());
console.log('Detection source:', window.twentyNineNext.getCountrySource());

// Manual override for testing
localStorage.setItem('29next_country_override', 'CA');
location.reload();
```

### Price Display Problems

```javascript
// Verify campaign data
const campaign = window.twentyNineNext.getCampaignData();
console.log('Current campaign:', campaign);
console.log('Currency:', campaign.currency);

// Check product mapping
const profile = await window.twentyNineNext.profiles.getProfile('starter-kit');
console.log('Profile mapping:', profile);
```

### Cart Translation Errors

```javascript
// Log cart translation
document.addEventListener('cart.translating', (e) => {
  console.log('Translating cart:', e.detail);
});

document.addEventListener('cart.translated', (e) => {
  console.log('Cart translated:', e.detail);
});
```

## Best Practices

1. **Always use Product Profiles** for multi-currency setups
2. **Test all supported countries** thoroughly
3. **Provide country selector** for user control
4. **Show prices clearly** with currency symbols
5. **Handle edge cases** (VPNs, travel, etc.)
6. **Cache campaign data** for performance
7. **Monitor detection accuracy** in analytics

## Example: Complete Multi-Currency Setup

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Multi-Currency Store</title>
  
  <!-- Campaign Cart Configuration -->
  <script>
  window.osConfig = {
    apiKey: 'YOUR_API_KEY',
    campaignId: 'campaign-us',
    enableCountryDetection: true,
    
    productProfiles: {
      'starter-kit': {
        name: 'Starter Kit',
        campaigns: {
          'US': { packageId: 1, price: 29.99 },
          'CA': { packageId: 101, price: 39.99 },
          'GB': { packageId: 201, price: 24.99 }
        }
      }
    },
    
    countryConfig: {
      'US': { campaignId: 'campaign-us' },
      'CA': { campaignId: 'campaign-ca' },
      'GB': { campaignId: 'campaign-gb' }
    }
  };
  </script>
  
  <script src="https://rtc2.29next.com/campaign-cart/29next.min.js"></script>
</head>
<body>
  <!-- Country Selector -->
  <select id="country-selector">
    <option value="US">🇺🇸 USD</option>
    <option value="CA">🇨🇦 CAD</option>
    <option value="GB">🇬🇧 GBP</option>
  </select>
  
  <!-- Product with automatic currency -->
  <div class="product">
    <h2>Starter Kit</h2>
    <p class="price" data-os-profile-price data-os-profile-id="starter-kit">$29.99</p>
    <button data-os-action="toggle-item" data-os-profile="starter-kit">
      Add to Cart
    </button>
  </div>
  
  <!-- Cart with currency -->
  <div class="cart">
    <h3>Cart Total</h3>
    <span data-os-cart-total>$0.00</span>
    <button os-checkout-payment="combo">Checkout</button>
  </div>
  
  <script>
  // Handle country changes
  document.getElementById('country-selector').addEventListener('change', (e) => {
    window.twentyNineNext.setCountry(e.target.value);
  });
  
  // Update selector on load
  window.twentyNineNext.onReady(() => {
    document.getElementById('country-selector').value = window.twentyNineNext.getCountry();
  });
  </script>
</body>
</html>
```

## Next Steps

- [Product Profiles Guide](product-profiles.md) - Essential for multi-currency
- [Configuration Guide](../configuration/advanced-config.md) - Country-specific settings
- [Testing Guide](../advanced/test-mode.md) - Test all currencies
- [Analytics Guide](../configuration/events.md) - Track by country