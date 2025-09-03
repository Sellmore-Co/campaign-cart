# Multi-Currency System Overview

The Campaign Cart SDK provides a sophisticated multi-currency system that automatically detects user location, determines appropriate currency, and seamlessly updates pricing across all components.

## Table of Contents
- [Architecture](#architecture)
- [Currency Detection Flow](#currency-detection-flow)
- [Key Components](#key-components)
- [Configuration](#configuration)
- [Currency Switching](#currency-switching)
- [Price Updates](#price-updates)
- [Display Formatting](#display-formatting)

## Architecture

The multi-currency system is built on several interconnected components:

```
┌─────────────────────────────────────────────────────────────┐
│                     User's Browser                           │
├─────────────────────────────────────────────────────────────┤
│  1. Location Detection (CDN API)                            │
│  2. Currency Determination (Priority System)                 │
│  3. Campaign Loading (with Currency)                        │
│  4. Price Updates & Display                                 │
└─────────────────────────────────────────────────────────────┘
```

## Currency Detection Flow

### 1. Initial Detection (SDKInitializer)

When the SDK initializes, it follows this priority order to determine currency:

1. **URL Parameter** (`?currency=XXX`) - Highest priority
2. **Session Storage** (`next_selected_currency`) - User's previous selection
3. **Country Detection** - Based on user's location/IP

```javascript
// Priority logic in SDKInitializer.ts
if (urlCurrency) {
  selectedCurrency = urlCurrency.toUpperCase();
  sessionStorage.setItem('next_selected_currency', selectedCurrency);
} else if (savedCurrency) {
  selectedCurrency = savedCurrency;
} else {
  selectedCurrency = detectedCurrency;
}
```

### 2. Country Detection Sources

The system determines the user's country through:

1. **URL Parameter** (`?country=XX`) - Force specific country
2. **Session Storage** (`next_selected_country`) - Saved preference
3. **IP-based Detection** - Via CDN Workers API

### 3. API Endpoints

- **Location Detection**: `https://cdn-countries.muddy-wind-c7ca.workers.dev/location`
- **Country Config**: `https://cdn-countries.muddy-wind-c7ca.workers.dev/countries/{COUNTRY_CODE}/states`
- **Campaign Data**: `https://campaigns.apps.29next.com/api/v1/campaigns/?currency={CURRENCY_CODE}`

## Key Components

### SDKInitializer (`src/enhancers/core/SDKInitializer.ts`)

Handles the initial currency detection and setup:

```typescript
private static async initializeLocationAndCurrency(): Promise<void> {
  // 1. Check for overrides (URL, session)
  // 2. Fetch location data
  // 3. Determine currency
  // 4. Store in ConfigStore
}
```

### CampaignStore (`src/stores/campaignStore.ts`)

Manages campaign data with per-currency caching:

```typescript
// Separate cache for each currency
const cacheKey = `next-campaign-cache_${currency}`;
// 10-minute TTL per currency
```

### CartStore (`src/stores/cartStore.ts`)

Updates prices when currency changes:

```typescript
refreshItemPrices: async () => {
  // Update package prices
  // Update shipping method prices
  // Recalculate totals
}
```

### CheckoutFormEnhancer (`src/enhancers/checkout/CheckoutFormEnhancer.ts`)

Handles country-based currency switching in checkout:

```typescript
private async handleCountryCurrencyChange(countryCode: string): Promise<void> {
  // Check if country has different currency
  // Reload campaign if needed
  // Update cart prices
}
```

## Configuration

### Window Configuration

```javascript
window.nextConfig = {
  apiKey: 'your-api-key',
  debug: false,
  
  // Currency behavior
  currencyBehavior: 'auto', // 'auto' | 'manual'
  
  // Address configuration
  addressConfig: {
    defaultCountry: 'US',
    showCountries: ['US', 'CA', 'GB', 'AU'],
    dontShowStates: ['AS', 'GU', 'PR']
  },
  
  // Google Maps for address autocomplete
  googleMapsConfig: {
    apiKey: 'your-google-maps-key',
    enableAutocomplete: true,
    region: 'US'
  }
};
```

### Meta Tag Configuration

```html
<!-- API Configuration -->
<meta name="next-api-key" content="your-api-key">
<meta name="next-debug" content="true">

<!-- Currency Behavior -->
<meta name="next-currency-behavior" content="auto">

<!-- Address Configuration -->
<meta name="next-address-default-country" content="US">
<meta name="next-address-show-countries" content="US,CA,GB,AU">
```

## Currency Switching

### User-Initiated Currency Change

Currency can be changed through:

1. **Country Selection in Checkout** - Automatically switches to country's currency
2. **Debug Currency Selector** - Manual currency selection (debug mode)
3. **URL Parameter** - Direct currency override

### Automatic Currency Switching

When a user changes their shipping country in checkout:

```typescript
// CheckoutFormEnhancer.ts
if (fieldName === 'country') {
  // Update state options
  await this.updateStateOptions(target.value, provinceField);
  
  // Auto-switch currency if different
  await this.handleCountryCurrencyChange(target.value, target);
}
```

### Deduplication

To prevent duplicate API calls when country changes trigger multiple events:

```typescript
// Deduplication with 500ms window
if (this.lastCurrencyChangeCountry === countryCode && 
    (now - this.lastCurrencyChangeTime) < 500) {
  return; // Skip duplicate
}
```

## Price Updates

### When Currency Changes

1. **Campaign Reload** - Fetches new prices from API
2. **Cart Update** - Updates all item prices
3. **Shipping Update** - Updates shipping method prices
4. **Display Refresh** - Updates all displayed prices

### Update Flow

```typescript
// cartStore.refreshItemPrices()
1. Get new campaign data with currency
2. Update each cart item with new prices
3. Update shipping method price
4. Recalculate totals
5. Update enriched items for display
```

## Display Formatting

### Currency Symbol Resolution

The system determines currency symbols through multiple sources:

```typescript
// Priority order in CartDisplayEnhancer
1. locationData.detectedCountryConfig.currencySymbol
2. campaign.currency (from API)
3. Intl.NumberFormat fallback
```

### Formatting Functions

```typescript
// Centralized formatting
formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}
```

## Caching Strategy

### Campaign Data Caching

- **Per-Currency Caching**: Each currency has its own cache entry
- **Cache Key**: `next-campaign-cache_${currency}`
- **TTL**: 10 minutes
- **Storage**: Session Storage

### Country Data Caching

- **Location Data**: Cached for 1 hour in localStorage
- **State Data**: Cached per country for 1 hour
- **Cache Key**: `next_country_states_${countryCode}`

## Error Handling

### Fallback Behavior

If currency detection fails:

1. Check for saved currency in session
2. Check for URL parameter
3. Default to USD

### Network Failures

- Location API timeout: 3 seconds
- Fallback to US/USD if detection fails
- Campaign data uses cached version if available

## Testing

### URL Parameters for Testing

```
# Force specific country
?country=GB

# Force specific currency
?currency=EUR

# Force both
?country=AU&currency=AUD

# Enable debug mode
?debugger=true
```

### Debug Mode Features

When debug mode is enabled:
- Currency selector in debug overlay
- Country selector for testing
- Detailed logging of currency changes
- Cache inspection tools

## Best Practices

1. **Always Handle Currency Changes**: Components should subscribe to currency changes
2. **Use Centralized Formatting**: Use the formatCurrency utility
3. **Cache Appropriately**: Respect TTLs for performance
4. **Test Multiple Currencies**: Verify pricing in all supported currencies
5. **Handle Edge Cases**: Account for currency switching during checkout

## Troubleshooting

### Common Issues

1. **Duplicate API Calls**
   - Check for multiple event listeners
   - Verify deduplication is working

2. **Wrong Currency Display**
   - Check priority order (URL > Session > Detection)
   - Verify campaign supports the currency

3. **Prices Not Updating**
   - Ensure refreshItemPrices is called
   - Check if shipping methods are updated

4. **Currency Symbol Issues**
   - Verify location data includes currencySymbol
   - Check Intl.NumberFormat support