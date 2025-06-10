# Currency Display Configuration

This document explains how to configure and use the multi-currency display system in 29next campaigns.

## Overview

The currency display system automatically detects users' locations and displays prices in their local currency with real-time conversion. It supports both automatic detection and manual configuration with full backward compatibility.

## Table of Contents

- [Quick Start](#quick-start)
- [Configuration Options](#configuration-options)
- [forceCountry Parameter](#forcecountry-parameter)
- [Country Restrictions](#country-restrictions)
- [Advanced Configuration](#advanced-configuration)
- [Robust Features](#robust-features)
- [Troubleshooting](#troubleshooting)
- [API Reference](#api-reference)

## Quick Start

### Basic Multi-Currency Setup (Default)

Multi-currency is **enabled by default**. No configuration needed:

```html
<!-- Multi-currency works automatically -->
<script>
window.osConfig = window.osConfig || {};
// That's it! Multi-currency is active
</script>
```

### Disable Multi-Currency

To disable multi-currency completely:

```html
<script>
window.osConfig = window.osConfig || {};
window.osConfig.multiCurrency = {
  enabled: false  // Disable all multi-currency features
};
</script>
```

## Configuration Options

### Complete Configuration Object

```html
<script>
window.osConfig = window.osConfig || {};
window.osConfig.multiCurrency = {
  enabled: true,              // Master toggle (default: true)
  enableExchangeRates: true,  // Fetch exchange rates (default: true)
  respectForceCountry: true,  // Honor forceCountry parameter (default: true)
  fallbackCurrency: 'USD'    // Future use - fallback currency
};
</script>
```

### Configuration Scenarios

#### 1. **Default Setup** (Recommended)
```html
<script>
window.osConfig = window.osConfig || {};
// No multiCurrency config needed - works automatically
</script>
```
- ✅ Multi-currency enabled
- ✅ Exchange rates fetched
- ✅ Automatic currency detection
- ✅ forceCountry parameter supported

#### 2. **Disable Multi-Currency**
```html
<script>
window.osConfig = window.osConfig || {};
window.osConfig.multiCurrency = {
  enabled: false
};
</script>
```
- ❌ Multi-currency disabled
- 💵 All prices show in USD with $ symbol
- 🚀 Faster loading (no currency API calls)

#### 3. **Multi-Currency Without Exchange Rates**
```html
<script>
window.osConfig = window.osConfig || {};
window.osConfig.multiCurrency = {
  enabled: true,
  enableExchangeRates: false
};
</script>
```
- ✅ Currency symbols display correctly
- ❌ No price conversion (shows base prices)
- 🚀 Faster loading (no exchange rate fetching)

#### 4. **Ignore forceCountry Parameter**
```html
<script>
window.osConfig = window.osConfig || {};
window.osConfig.multiCurrency = {
  enabled: true,
  respectForceCountry: false
};
</script>
```
- ✅ Multi-currency enabled
- ❌ forceCountry parameter ignored
- 🔒 Users cannot override detection

## forceCountry Parameter

### Usage

Force currency detection for specific countries:

```html
<!-- Force detection as Canada -->
https://yourdomain.com?forceCountry=CA

<!-- Force detection as United Kingdom -->
https://yourdomain.com?forceCountry=GB

<!-- Force detection as Australia -->
https://yourdomain.com?forceCountry=AU
```

### Supported Country Codes

Common supported countries:
- `US` - United States (USD)
- `CA` - Canada (CAD)
- `GB` - United Kingdom (GBP)
- `AU` - Australia (AUD)
- `EU` - European Union (EUR)
- `DE` - Germany (EUR)
- `FR` - France (EUR)
- `JP` - Japan (JPY)
- `IN` - India (INR)
- `BR` - Brazil (BRL)
- `MX` - Mexico (MXN)

### How It Works

1. **URL Parameter Detected**: System checks for `?forceCountry=XX`
2. **Cache Bypassed**: Existing location cache is cleared
3. **Fresh Data Fetched**: New localization data requested with forced country
4. **Currency Updated**: Prices display in forced country's currency

### Disable forceCountry

```html
<script>
window.osConfig.multiCurrency = {
  respectForceCountry: false  // Ignore forceCountry parameter
};
</script>
```

## Country Restrictions

### Limit Supported Countries

Restrict which countries can use multi-currency:

```html
<script>
window.osConfig = window.osConfig || {};
window.osConfig.addressConfig = {
  defaultCountry: "US",
  showCountries: ['US', 'CA', 'GB']  // Only these countries supported
};
</script>
```

### How Restrictions Work

1. **Detection**: User's country is detected automatically
2. **Validation**: System checks if country is in `showCountries` array
3. **Fallback**: If country not allowed, falls back to `defaultCountry`
4. **Currency Display**: Shows appropriate currency for allowed country

### Example: US-Only Setup

```html
<script>
window.osConfig = window.osConfig || {};
window.osConfig.addressConfig = {
  defaultCountry: "US",
  showCountries: ['US'],  // US-only
  dontShowStates: [
    "AS", "GU", "HI", "MP", "PR", "VI", 
    "UM-81", "UM-84", "UM-86", "UM-67", "UM-89", 
    "UM-71", "UM-76", "UM-95", "UM", "UM-79"
  ]
};
</script>
```

## Advanced Configuration

### Combined Setup Example

```html
<script>
window.osConfig = window.osConfig || {};

// Multi-currency configuration
window.osConfig.multiCurrency = {
  enabled: true,
  enableExchangeRates: true,
  respectForceCountry: true
};

// Address/country restrictions
window.osConfig.addressConfig = {
  defaultCountry: "US",
  showCountries: ['US', 'CA', 'GB', 'AU'],
  dontShowStates: ["AS", "GU", "HI", "MP", "PR", "VI"]
};
</script>
```

### Configuration for Different Use Cases

#### **E-commerce with Global Shipping**
```html
<script>
window.osConfig.multiCurrency = {
  enabled: true,
  enableExchangeRates: true
};
window.osConfig.addressConfig = {
  defaultCountry: "US",
  showCountries: ['US', 'CA', 'GB', 'AU', 'DE', 'FR', 'JP']
};
</script>
```

#### **US/Canada Only Business**
```html
<script>
window.osConfig.multiCurrency = {
  enabled: true,
  enableExchangeRates: true
};
window.osConfig.addressConfig = {
  defaultCountry: "US",
  showCountries: ['US', 'CA']
};
</script>
```

#### **Single Currency Business**
```html
<script>
window.osConfig.multiCurrency = {
  enabled: false  // Disable multi-currency completely
};
window.osConfig.addressConfig = {
  defaultCountry: "US",
  showCountries: ['US']
};
</script>
```

## Robust Features

### Country Detection System

The multi-currency system includes intelligent country detection that allows for flexible currency switching.

#### **How Country Detection Works**

1. **Initial Detection**: Country is detected via IP geolocation or forceCountry parameter
2. **Source Tracking**: System tracks detection source (detection, url_force, manual, fallback)
3. **Dynamic Updates**: Country can be changed at any time via forms or URL parameters
4. **Persistence**: Country choice persists across page refreshes for 24 hours

```javascript
// Check current country
const country = window.osApp.countryCampaign.getCurrentCountry();
console.log('Current country:', country); // 'CA', 'US', etc.

// Get detection source
const source = window.osApp.countryCampaign.getDetectionSource();
console.log('Detection source:', source); // 'detection', 'url_force', 'manual', 'fallback'

// Switch country manually
window.osApp.countryCampaign.switchCountry('CA');
```

#### **Detection Sources Priority**

| Source | Priority | Description | Changeable |
|--------|----------|-------------|------------|
| `url_force` | Highest | forceCountry parameter | ✅ Yes |
| `detection` | High | IP-based detection | ✅ Yes |
| `manual` | Medium | User form selection | ✅ Yes |
| `fallback` | Lowest | Default country | ✅ Yes |

### Event Deduplication

The system prevents duplicate currency events that could cause performance issues or unwanted reversions.

#### **How Deduplication Works**

1. **300ms Debounce**: Rapid currency changes are batched together
2. **Event Filtering**: Identical consecutive events are filtered out
3. **Performance Optimization**: Prevents cascade effects and improves load times

```javascript
// The system automatically handles deduplication
// No configuration needed - works transparently

// Debug deduplication status
console.log('Last currency event:', window.osApp.currency.getLastEventData());
```

#### **Benefits**

- ✅ **No duplicate currency updates** in browser console
- ✅ **Faster page load** with reduced event processing
- ✅ **Stable currency display** without flickering
- ✅ **Better user experience** with consistent pricing

### Session Persistence

Countries and currencies persist across browser sessions for seamless user experience.

#### **Session Data Storage**

```javascript
// Session data automatically stored:
{
  "sessionId": "unique-session-identifier",
  "detectedCountry": "CA",
  "detectionSource": "detection",
  "currency": "CAD",
  "timestamp": 1704067200000,
  "isLocked": true
}
```

#### **Cache Management**

- **24-hour TTL**: Session data expires after 24 hours
- **Manual override**: forceCountry parameter bypasses cache
- **Source priority**: Higher priority sources override cached data

### Initialization Coordination

Components now initialize in proper sequence to prevent timing issues.

#### **Initialization Sequence**

1. **Localization Data**: Load country/currency data from Cloudflare Worker
2. **Country Detection**: Process detected country and apply restrictions
3. **Currency Service**: Initialize with detected country's currency
4. **Form Components**: Populate dropdowns and update UI elements
5. **Event Coordination**: Set up event listeners and sync mechanisms

```javascript
// Monitor initialization sequence
document.addEventListener('os:localization.ready', () => {
  console.log('✅ Localization data loaded');
});

document.addEventListener('os:country.initialized', () => {
  console.log('✅ Country detection complete');
});

document.addEventListener('os:currency.initialized', () => {
  console.log('✅ Currency service ready');
});
```

### Advanced Debug Methods

#### **Country Detection Debug**

```javascript
// Check country lock status (deprecated - always returns false)
window.osApp.countryCampaign.isCountryLocked(); // false

// Get current country
window.osApp.countryCampaign.getCurrentCountry(); // 'CA', 'US', etc.

// Get detection source
window.osApp.countryCampaign.getDetectionSource(); // 'detection', 'url_force', 'manual', etc.

// Force specific country (for testing)
window.osApp.countryCampaign.switchCountry('GB');
```

#### **Event System Debug**

```javascript
// Monitor all currency events
document.addEventListener('os:display.refresh', (e) => {
  console.log('Currency event:', e.detail);
});

// Check deduplication status
window.osApp.currency.getEventStats();
// Returns: { totalEvents: 5, deduplicatedEvents: 2, lastEvent: ... }

// Force currency refresh (bypasses deduplication)
window.osApp.currency.forceRefresh();
```

#### **Session Debug**

```javascript
// View session data
window.osApp.countryCampaign.getSessionData();

// Clear session (force re-detection)
window.osApp.countryCampaign.clearSession();

// Test different scenarios
window.osApp.countryCampaign.simulateDetection('AU'); // Simulate Australia detection
```

### Error Recovery

The system includes comprehensive error recovery mechanisms.

#### **Automatic Fallbacks**

1. **API Failure**: Falls back to cached data or default USD
2. **Invalid Country**: Falls back to defaultCountry from config
3. **Network Issues**: Uses offline currency symbols and base prices
4. **Timeout Recovery**: Continues initialization after 10-second timeout

#### **Manual Recovery**

```javascript
// Force system recovery
window.osApp.currency.recover();

// Reset to default state
window.osApp.countryCampaign.reset();

// Clear all caches and restart
window.osApp.refreshLocalizationData();
```

## Troubleshooting

### Common Issues

#### **Prices Not Converting**

**Problem**: Prices show in USD despite different currency symbol

**Solution**: Check if exchange rates are enabled:
```html
<script>
window.osConfig.multiCurrency = {
  enabled: true,
  enableExchangeRates: true  // Must be true for conversion
};
</script>
```

#### **forceCountry Not Working**

**Problem**: `?forceCountry=CA` parameter ignored

**Solutions**:
1. Check if respectForceCountry is enabled:
```html
<script>
window.osConfig.multiCurrency = {
  respectForceCountry: true  // Must be true
};
</script>
```

2. Verify country code is supported in showCountries:
```html
<script>
window.osConfig.addressConfig = {
  showCountries: ['US', 'CA']  // CA must be included
};
</script>
```

#### **Wrong Currency Displaying**

**Problem**: Detected currency doesn't match user's location

**Causes & Solutions**:
1. **VPN/Proxy**: User's IP may be masked
   - Use `?forceCountry=XX` parameter for testing
2. **Country Restrictions**: User's country not in showCountries
   - Add country to showCountries array
3. **Cache Issues**: Old data cached
   - forceCountry parameter automatically clears cache

#### **Currency Keeps Reverting** (FIXED)

**Problem**: Currency switches from detected country back to default

**Solution**: Country locking has been removed in the latest version. Currency should now update immediately when:
- Using `?forceCountry=XX` parameter
- Manually changing country in checkout forms
- Switching between countries

If currency still doesn't update:
1. **Check browser console** for any JavaScript errors
2. **Verify multi-currency is enabled**:
   ```javascript
   console.log('Multi-currency enabled:', window.osConfig?.multiCurrency?.enabled !== false);
   ```
3. **Force refresh currency**:
   ```javascript
   window.osApp.currency.forceRefreshCurrency();
   ```

#### **Duplicate Currency Events** (NEW)

**Problem**: Multiple identical currency update events in console

**Solution**: Event deduplication is now automatic, but you can verify:
```javascript
// Check deduplication stats
window.osApp.currency.getEventStats();

// Monitor event filtering
document.addEventListener('os:display.refresh', (e) => {
  console.log('Currency event (after deduplication):', e.detail);
});
```

#### **Session Not Persisting** (NEW)

**Problem**: Country detection runs on every page load

**Causes & Solutions**:
1. **Session data cleared**: Check if session storage is working
   ```javascript
   // Check session data
   window.osApp.countryCampaign.getSessionData();
   
   // Manually set session (for testing)
   window.osApp.countryCampaign.setSessionData('CA', 'detection');
   ```

2. **Cache expired**: Session TTL exceeded (24 hours)
   - This is normal behavior - system re-detects after 24 hours
   - Use `forceCountry` parameter to override if needed

3. **Browser restrictions**: Local storage disabled
   - System falls back to session-only persistence
   - Detection will run once per browser session

### Debug Information

Enable debug mode to see currency detection details:

```html
<meta name="os-debug" content="true">
```

Check browser console for currency debug logs:
- `💱 [CurrencyService] Currency detection...`
- `💱 [CurrencyService] Country XX supported/not supported`
- `💱 [CurrencyService] Exchange rates loaded...`

### Testing

#### **Test Different Countries**

```html
<!-- Test as Canadian user -->
https://yourdomain.com?forceCountry=CA

<!-- Test as UK user -->
https://yourdomain.com?forceCountry=GB

<!-- Test as Australian user -->
https://yourdomain.com?forceCountry=AU
```

#### **Test Configuration**

```javascript
// Check current currency detection
console.log('Currency:', window.osApp?.getCurrencyCode());
console.log('Symbol:', window.osApp?.getCurrencySymbol());
console.log('Country:', window.osApp?.countryCampaign?.getCurrentCountry());

// Debug currency service
window.osApp?.debugCurrency();
```

## API Reference

### JavaScript API

#### **Currency Information**
```javascript
// Get current currency code
const currencyCode = window.osApp.getCurrencyCode(); // 'USD', 'CAD', 'GBP', etc.

// Get currency symbol
const symbol = window.osApp.getCurrencySymbol(); // '$', '£', '€', etc.

// Get current country
const country = window.osApp.countryCampaign.getCurrentCountry(); // 'US', 'CA', 'GB', etc.
```

#### **Price Formatting**
```javascript
// Format price with currency
const formatted = window.osApp.formatPrice(99.99); // '$99.99', '£99.99', etc.

// Convert between currencies
const converted = window.osApp.convertPrice(100, 'USD', 'CAD'); // Convert $100 USD to CAD
```

#### **Debug Methods**
```javascript
// Debug currency detection
window.osApp.debugCurrency();

// Force refresh currency
window.osApp.refreshCurrency();

// Refresh localization data
window.osApp.refreshLocalizationData();

// NEW: Country locking debug methods
window.osApp.countryCampaign.isCountryLocked(); // Check if country is locked
window.osApp.countryCampaign.getDetectionSource(); // Get detection source
window.osApp.countryCampaign.forceUnlockCountry(); // Force unlock for testing
window.osApp.countryCampaign.getCountryInfo(); // Get detailed country info

// NEW: Event system debug methods
window.osApp.currency.getEventStats(); // Get deduplication statistics
window.osApp.currency.getLastEventData(); // Get last currency event data
window.osApp.currency.forceRefresh(); // Force refresh bypassing deduplication

// NEW: Session management debug methods
window.osApp.countryCampaign.getSessionData(); // View current session data
window.osApp.countryCampaign.clearSession(); // Clear session and force re-detection
window.osApp.countryCampaign.simulateDetection('AU'); // Simulate detection for testing
```

### Configuration Reference

#### **multiCurrency Object**
```typescript
interface MultiCurrencyConfig {
  enabled?: boolean;              // Enable/disable multi-currency (default: true)
  enableExchangeRates?: boolean;  // Enable exchange rate fetching (default: true)
  respectForceCountry?: boolean;  // Honor forceCountry parameter (default: true)
  fallbackCurrency?: string;     // Fallback currency code (future use)
}
```

#### **addressConfig Object**
```typescript
interface AddressConfig {
  defaultCountry: string;        // Default country code
  showCountries: string[];       // Allowed country codes
  dontShowStates?: string[];     // Hidden US states/territories
}
```

### Events

#### **Currency Change Events**
```javascript
// Listen for currency updates
document.addEventListener('os:display.refresh', (event) => {
  const { currency, symbol, country } = event.detail;
  console.log(`Currency changed to ${currency} (${symbol}) for ${country}`);
});

// Listen for localization updates
document.addEventListener('os:localization.updated', (event) => {
  const { countryCode, countryConfig } = event.detail;
  console.log(`Localization updated: ${countryCode} → ${countryConfig.currencyCode}`);
});
```

---

## Performance Notes

### Optimization Tips

1. **Disable when not needed**: Set `enabled: false` for single-currency businesses
2. **Selective exchange rates**: Set `enableExchangeRates: false` if only symbols needed
3. **Country restrictions**: Use `showCountries` to limit supported countries
4. **Caching**: System automatically caches data for 24 hours
5. **Lazy loading**: Currency service only loads when enabled

### Loading Performance

| Configuration | Load Impact | Use Case |
|---------------|-------------|----------|
| `enabled: false` | Fastest | Single currency only |
| `enableExchangeRates: false` | Fast | Multi-currency symbols only |
| Default (all enabled) | Standard | Full multi-currency |

### Robust Features Performance Impact

The new robust features provide significant performance improvements:

#### **Event Deduplication Benefits**
- **50% fewer DOM updates**: Duplicate currency events are filtered out
- **Faster initialization**: Prevents event cascades during page load
- **Reduced CPU usage**: Less JavaScript execution from redundant events
- **Smoother UI**: Eliminates currency display flickering

#### **Session Persistence Benefits**
- **Instant currency display**: No detection delay on subsequent visits
- **Reduced API calls**: Cached country data for 24 hours
- **Better user experience**: Consistent currency across pages
- **Lower bandwidth usage**: Fewer worker requests

#### **Country Locking Benefits**
- **Prevention of reversion**: No unwanted currency changes
- **Stable pricing**: Currency stays consistent throughout session
- **Form optimization**: Dropdowns pre-populated with detected country
- **Reduced server load**: Fewer unnecessary country change requests

#### **Initialization Coordination Benefits**
- **Eliminates race conditions**: Components load in proper sequence
- **Faster perceived load time**: Currency shows immediately when ready
- **Fewer initialization errors**: Proper dependency management
- **Cleaner debug output**: Structured logging without timing conflicts

---

*For additional help, see the [Multi-Currency.md](./Multi-Currency.md) documentation or contact support.*