# Multi-Currency Support

The 29next client now supports automatic currency conversion based on the user's detected location. This feature allows you to keep your campaign prices in a single base currency while displaying them in the user's local currency.

## How It Works

1. **Country Detection**: The system automatically detects the user's country using IP geolocation
2. **Currency Detection**: Based on the detected country, the system determines the appropriate local currency
3. **Exchange Rates**: Live exchange rates are fetched from your Cloudflare Worker endpoint
4. **Price Conversion**: All prices are automatically converted from your base currency to the user's local currency
5. **Display**: Prices are formatted with the correct currency symbol and converted amount

## Configuration

### Cloudflare Worker Endpoints

The system uses your existing Cloudflare Worker with these endpoints:

- `/location` - Already used for country detection
- `/currencies/rates` - Exchange rates (already implemented)
- `/currencies/convert` - Direct conversion (already implemented)
- `/currencies/list` - Supported currencies (already implemented)

### API Response Format

Your `/currencies/rates` endpoint returns exchange rates in this format:

```json
{
  "base": "USD",
  "rates": {
    "EUR": 0.85,
    "GBP": 0.73,
    "JPY": 110.25,
    "CAD": 1.25,
    "AUD": 1.35
  },
  "timestamp": 1640995200000,
  "disclaimer": "Usage subject to terms...",
  "license": "Data from Open Exchange Rates..."
}
```

The system automatically converts this to internal `FROM_TO` format for caching and lookup.

## Campaign Setup

1. **Set Base Currency**: Configure your campaign with a single base currency (e.g., USD)
2. **Set Prices**: All product prices should be in your base currency
3. **Deploy**: The system will automatically handle conversion and display

## API Usage

### Automatic Price Formatting

```javascript
// Prices are automatically converted and formatted
const formattedPrice = os.formatPrice(29.99); // "$29.99" in US, "€25.49" in EU

// Skip conversion if needed
const originalPrice = os.formatPrice(29.99, 'USD', true); // Always "$29.99"
```

### Manual Currency Conversion

```javascript
// Convert specific amounts
const convertedAmount = os.convertPrice(29.99, 'USD', 'EUR'); // 25.49

// Get currency information
const userCurrency = os.getCurrencyCode(); // "EUR"
const baseCurrency = os.getBaseCurrencyCode(); // "USD"
const currencySymbol = os.getCurrencySymbol(); // "€"
```

### Advanced Usage

```javascript
// Format price in specific currency
const priceInGBP = os.formatPrice(29.99, 'GBP'); // "£22.49"

// Check if conversion is happening
const baseCurrency = os.getBaseCurrencyCode(); // "USD"
const userCurrency = os.getCurrencyCode(); // "EUR"
const isConverting = baseCurrency !== userCurrency; // true
```

## Caching

Your setup includes **multiple layers of caching** for optimal performance:

### Worker-Level Caching (Your Implementation)
- **Cron Updates**: Hourly automatic updates via cron triggers  
- **KV Storage**: 2-hour backup cache in Cloudflare KV
- **Edge Cache**: 1-hour cache at Cloudflare edge locations
- **Open Exchange Rates**: Fetched hourly, cached in worker

### Client-Level Caching (Our Implementation)
- **Exchange Rates**: Cached for 4 hours in browser
- **Country Detection**: Cached for 24 hours  
- **Automatic Refresh**: Rates refreshed when cache expires

This **multi-tier caching** means users get lightning-fast responses while minimizing API costs.

## Fallback Behavior

If exchange rates can't be fetched:
1. System uses cached rates (even if expired)
2. If no cache exists, displays prices in base currency
3. System continues to retry fetching rates in the background

## Supported Currencies

The system includes proper currency symbols for:

- **USD** - $ (US Dollar)
- **EUR** - € (Euro)
- **GBP** - £ (British Pound)
- **CAD** - C$ (Canadian Dollar)
- **AUD** - A$ (Australian Dollar)
- **JPY** - ¥ (Japanese Yen)
- **CHF** - CHF (Swiss Franc)
- **SEK** - kr (Swedish Krona)
- **NOK** - kr (Norwegian Krone)
- **DKK** - kr (Danish Krone)
- **PLN** - zł (Polish Zloty)
- **CZK** - Kč (Czech Koruna)
- **HUF** - Ft (Hungarian Forint)
- **BRL** - R$ (Brazilian Real)
- **MXN** - $ (Mexican Peso)
- **INR** - ₹ (Indian Rupee)
- **CNY** - ¥ (Chinese Yuan)
- **KRW** - ₩ (South Korean Won)
- **SGD** - S$ (Singapore Dollar)
- **NZD** - NZ$ (New Zealand Dollar)
- **ZAR** - R (South African Rand)

## Testing

### Force Specific Country

Add `?forceCountry=GB` to your URL to test different countries:

```
https://yoursite.com?forceCountry=GB  // Test UK/GBP
https://yoursite.com?forceCountry=DE  // Test Germany/EUR
https://yoursite.com?forceCountry=CA  // Test Canada/CAD
```

### Debug Information

Enable debug mode to see currency conversion logs:

```javascript
// Check cache status
console.log(os.currency.getCacheStatus());

// Refresh rates manually
os.currency.refresh();
```

## Implementation Notes

1. **Single Campaign**: Keep using your existing single campaign - no need to create multiple campaigns
2. **Base Prices**: All prices in your campaign should be in your base currency
3. **Automatic**: Conversion happens automatically when prices are displayed
4. **Performance**: Exchange rates are cached and fetched asynchronously
5. **Backwards Compatible**: Existing functionality remains unchanged

## Best Practices

1. **Choose Stable Base Currency**: Use a stable currency like USD or EUR as your base
2. **Round Prices**: Consider rounding converted prices to friendly numbers
3. **Test Thoroughly**: Test with different countries using the `forceCountry` parameter
4. **Monitor Rates**: Keep an eye on exchange rate freshness in your Cloudflare Worker
5. **Handle Errors**: Ensure your `/currency` endpoint has proper error handling

## Example Integration

```javascript
// Initialize and use
const os = new TwentyNineNext();

// All existing price formatting automatically includes conversion
document.querySelector('.product-price').textContent = os.formatPrice(29.99);

// Manual conversion for custom calculations
const shipping = os.convertPrice(5.99, 'USD', os.getCurrencyCode());
const total = os.convertPrice(29.99, 'USD', os.getCurrencyCode()) + shipping;
```

The multi-currency system is designed to work seamlessly with your existing setup while providing automatic localization for international customers. 