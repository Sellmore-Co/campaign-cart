# Currency System Documentation

The Currency System provides automatic currency detection, conversion, and display based on the user's country selection. It integrates seamlessly with the existing cart system to provide international customers with prices in their local currency.

## Overview

The Currency System consists of several components working together:

- **CurrencyManager** - Core currency logic and conversion
- **Currency Worker** - Cloudflare worker providing exchange rates and country-currency mapping
- **StateManager** - Currency state management
- **CartDisplayManager** - Dynamic currency display in cart
- **ApiClient** - Currency worker communication

## Configuration

### Basic Configuration

Enable and configure the currency system via `window.osConfig`:

```javascript
window.osConfig = {
  currencyConfig: {
    enabled: true,                    // Enable/disable currency system
    defaultCurrency: 'USD',           // Default currency
    supportedCurrencies: ['USD', 'EUR', 'GBP', 'CAD', 'AUD'], // Supported currencies
    autoSwitchOnCountryChange: true,  // Auto-switch currency when country changes
    showCurrencySelector: false,      // Show manual currency selector
    fallbackCurrency: 'USD',         // Fallback when conversion fails
    rateUpdateInterval: 3600000,      // Rate refresh interval (1 hour)
    conversionNotice: true,           // Show conversion notice to users
    workerUrl: 'https://cdn-currency.muddy-wind-c7ca.workers.dev' // Worker URL
  }
};
```

### URL Parameters

You can override currency settings via URL parameters:

```
?currency=GBP          # Force currency to GBP
?forceCountry=GB       # Force country (which may trigger currency change)
```

## Usage

### JavaScript API

#### Access Currency Manager

```javascript
// Wait for client to be ready
window.on29NextReady = window.on29NextReady || [];
window.on29NextReady.push((client) => {
  // Currency manager is available at client.currency
  if (client.currency.isEnabled()) {
    console.log('Currency system is enabled');
  }
});
```

#### Manual Currency Selection

```javascript
// Set currency manually
client.currency.setCurrency('EUR');

// Get current currency
const currentCurrency = client.currency.getCurrentCurrency();
console.log(currentCurrency); // { code: 'EUR', symbol: '€', name: 'Euro', source: 'api-call' }

// Get supported currencies
const supported = client.currency.getSupportedCurrencies();
console.log(supported); // ['USD', 'EUR', 'GBP', 'CAD', 'AUD']
```

#### Currency Conversion

```javascript
// Convert amounts
const convertedAmount = client.currency.convertPrice(100, 'USD', 'EUR');
console.log(convertedAmount); // ~85.00 (depending on exchange rates)

// Format currency for display
const formatted = client.currency.formatCurrency(100);
console.log(formatted); // "€100,00" or "$100.00" depending on selected currency
```

#### Exchange Rates

```javascript
// Get current exchange rates
const rates = client.currency.getCurrentRates();
console.log(rates);
// {
//   base: 'USD',
//   rates: { EUR: 0.85, GBP: 0.79, CAD: 1.25, AUD: 1.35 },
//   lastUpdated: '2025-01-02T10:30:00Z',
//   isFallback: false
// }

// Refresh exchange rates
await client.currency.refreshRates();
```

### HTML Attributes

#### Currency Display Elements

The system automatically updates elements with currency-specific data attributes:

```html
<!-- Currency symbol -->
<span data-os-currency="symbol">$</span>

<!-- Currency code -->
<span data-os-currency="code">USD</span>

<!-- Currency name -->
<span data-os-currency="name">US Dollar</span>
```

#### Currency Selector

Create a currency selector that users can interact with:

```html
<select data-os-currency-selector>
  <!-- Options will be populated automatically -->
</select>
```

#### Cart Display Integration

The cart display system automatically uses the selected currency:

```html
<!-- These will automatically show converted prices -->
<div data-os-cart-summary="grand-total">$0.00</div>
<div data-os-cart-summary="subtotal">$0.00</div>
<div data-os-cart-summary="line-sale">$0.00</div>
```

## Events

### Currency Change Event

Listen for currency changes:

```javascript
client.on('currency.changed', (data) => {
  console.log('Currency changed to:', data.currency);
  console.log('Current rates:', data.rates);
  
  // Update custom elements or perform other actions
  updateCustomPriceDisplays(data.currency);
});
```

### Country-Currency Integration

When the country system is also enabled, currency changes automatically based on country selection:

```javascript
client.on('location.country.changed', (data) => {
  console.log('Country changed, currency may update automatically');
});
```

## Currency Worker API

The currency system uses a Cloudflare Worker to provide exchange rates and country-currency mapping.

### Endpoints

#### Get Currency for Country

```
GET /currency/{countryCode}
```

Response:
```json
{
  "country": "GB",
  "currency": "GBP",
  "symbol": "£",
  "name": "British Pound",
  "formatting": {
    "decimal": ".",
    "thousands": ",",
    "precision": 2,
    "format": "%s%v"
  }
}
```

#### Get Exchange Rates

```
GET /rates/{baseCurrency}
```

Response:
```json
{
  "base": "USD",
  "rates": {
    "EUR": 0.85,
    "GBP": 0.79,
    "CAD": 1.25,
    "AUD": 1.35
  },
  "lastUpdated": "2025-01-02T10:30:00Z"
}
```

## Integration with Cart System

### Automatic Price Conversion

When currency changes, all cart prices are automatically converted and displayed:

1. **Cart Totals** - Subtotal, shipping, tax, and grand total
2. **Line Items** - Individual product prices
3. **Compare Prices** - Original/sale price comparisons
4. **Savings** - Discount amounts

### Multi-Currency Checkout

The system maintains price integrity during checkout:

1. **Rate Locking** - Exchange rates are locked when checkout begins
2. **Base Currency** - Orders are processed in the merchant's base currency
3. **Display Currency** - Customer sees prices in their selected currency
4. **Conversion Notice** - Customers are informed about currency conversion

## Fallback Behavior

### Worker Unavailable

When the currency worker is unavailable:

1. **Static Mapping** - Uses built-in country-to-currency mapping
2. **Fallback Rates** - Uses cached or static exchange rates
3. **Graceful Degradation** - System continues to work with basic functionality

### Unsupported Currency

When a detected currency is not supported:

1. **Fallback Currency** - Switches to configured fallback (usually USD)
2. **User Notice** - Optionally displays a notice to the user
3. **Manual Override** - User can still manually select from supported currencies

## Performance Considerations

### Caching Strategy

1. **Exchange Rates** - Cached for 1 hour by default
2. **Country Mapping** - Cached for 24 hours
3. **User Preference** - Stored in browser localStorage

### Optimization

1. **Debounced Updates** - Currency changes are debounced to prevent excessive updates
2. **Lazy Loading** - Currency data is fetched only when needed
3. **Minimal API Calls** - Efficient caching reduces API requests

## Error Handling

### Network Errors

```javascript
// Currency system handles network errors gracefully
client.on('currency.error', (error) => {
  console.warn('Currency error:', error.message);
  // System falls back to cached data or static rates
});
```

### Invalid Currencies

```javascript
// Attempting to set an unsupported currency
client.currency.setCurrency('INVALID'); // Falls back to fallback currency
```

## Best Practices

### Implementation

1. **Enable Gradually** - Start with a limited set of supported currencies
2. **Test Thoroughly** - Verify currency conversion accuracy
3. **Monitor Performance** - Watch for currency worker performance
4. **User Communication** - Clearly communicate currency conversion to users

### UX Considerations

1. **Clear Indication** - Show which currency is selected
2. **Conversion Notice** - Inform users about approximate conversions
3. **Preference Persistence** - Remember user's currency choice
4. **Easy Switching** - Provide obvious way to change currency

### Merchant Setup

1. **Configure Supported Currencies** - Only enable currencies you can process
2. **Set Appropriate Defaults** - Choose sensible default currency
3. **Monitor Exchange Rates** - Be aware of significant rate changes
4. **Test Payment Processing** - Ensure payment gateway supports multi-currency

## Troubleshooting

### Common Issues

**Currency not changing:**
- Check if currency is in `supportedCurrencies` list
- Verify currency worker is accessible
- Check browser console for errors

**Incorrect conversion rates:**
- Verify currency worker is returning fresh rates
- Check if fallback rates are being used
- Ensure rate refresh interval is appropriate

**Display formatting issues:**
- Check currency formatting configuration
- Verify selected currency has proper formatting rules
- Test with different locales

### Debug Mode

Enable debug logging to troubleshoot issues:

```javascript
const client = new TwentyNineNext({
  debug: true // Enables detailed currency logging
});
```

This will log detailed information about:
- Currency detection and changes
- Exchange rate fetching
- Price conversions
- Display updates