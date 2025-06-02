# Country + Multi-Currency Implementation Plan

This document outlines the implementation plan for integrating the country worker system with multi-currency support to create a comprehensive international checkout experience.

## Overview

This implementation combines two major enhancements:
1. **Country Worker System** - Centralized country/state data with dynamic configuration
2. **Multi-Currency Support** - Dynamic currency handling based on country selection

## Architecture Overview

```
┌─────────────────────┐    ┌──────────────────────┐    ┌─────────────────────┐
│   Cloudflare        │    │   Campaign Cart      │    │   Backend API       │
│   Location Worker   │    │   Frontend           │    │   (29next)          │
├─────────────────────┤    ├──────────────────────┤    ├─────────────────────┤
│ • Country Data      │◄──►│ • AddressHandler     │◄──►│ • Currency Rates    │
│ • State/Province    │    │ • CurrencyManager    │    │ • Order Processing  │
│ • IP Detection      │    │ • StateManager       │    │ • Payment Gateway   │
│ • Country Config    │    │ • CartDisplayManager │    │ • Localization      │
└─────────────────────┘    └──────────────────────┘    └─────────────────────┘
```

## Core Components

### 1. Location Data System (Already Implemented)

**Cloudflare Worker Endpoints:**
- `/location` - Initial data (countries, detected country, states, config)
- `/countries/{code}/states` - Country-specific states and configuration

**Key Features:**
- IP-based country detection
- Country-specific field labels (State vs Province vs Region)
- Postcode validation patterns (numeric vs alphanumeric)
- State requirement configuration
- URL parameter override (`forceCountry`)

### 2. Currency Management System (To Be Implemented)

**New Components:**
- `CurrencyManager` - Handles currency detection, conversion, and display
- `CurrencyWorker` - Cloudflare worker for currency rates and country-currency mapping
- Enhanced `CartDisplayManager` - Dynamic currency symbols and formatting

**Currency Data Structure:**
```javascript
{
  country: "GB",
  currency: "GBP",
  symbol: "£",
  rates: {
    USD: 0.79,
    EUR: 0.85,
    GBP: 1.00
  },
  formatting: {
    decimal: ".",
    thousands: ",",
    precision: 2,
    format: "%s%v" // symbol + value
  }
}
```

## Implementation Phases

### Phase 1: Foundation (Country Worker Integration)
**Status: 🔄 TO BE IMPLEMENTED** (building from scratch on current main branch)

- [ ] Create Cloudflare Worker for location data
- [ ] Enhance AddressHandler with centralized location data
- [ ] Implement dynamic field validation based on country config
- [ ] Add location state management to StateManager
- [ ] Integrate phone input with country selection
- [ ] Add country-specific postcode validation
- [ ] Implement URL parameter support (forceCountry)

### Phase 2: Currency System Setup
**Status: ⏳ PENDING** (after Phase 1 completion)

#### 2.1 Currency Worker Development
- [ ] Create Cloudflare Worker for currency data
  - Currency rates from external API (e.g., ExchangeRate-API)
  - Country-to-currency mapping
  - Currency formatting rules
  - Caching strategy (1-hour cache for rates)

#### 2.2 CurrencyManager Implementation
- [ ] Create `src/managers/CurrencyManager.js`
  - Currency detection based on selected country
  - Rate fetching and caching
  - Currency conversion logic
  - Format currency for display

#### 2.3 Enhanced API Integration
- [ ] Extend `ApiClient.js` with currency endpoints
  - `getCurrencyData(countryCode)` method
  - `getCurrencyRates(baseCurrency)` method
  - Error handling and fallbacks

### Phase 3: Cart Integration
**Status: ⏳ PENDING**

#### 3.1 StateManager Enhancement
- [ ] Add currency state management
  - Current currency (code, symbol, rates)
  - Currency conversion state
  - Base vs display currency handling

#### 3.2 CartDisplayManager Updates
- [ ] Dynamic currency symbol display
- [ ] Real-time price conversion
- [ ] Currency format based on locale
- [ ] Compare pricing with currency consideration

#### 3.3 CartManager Integration
- [ ] Currency-aware cart calculations
- [ ] Store prices in base currency
- [ ] Display prices in selected currency
- [ ] Handle currency switching

### Phase 4: Checkout Integration
**Status: ⏳ PENDING**

#### 4.1 Payment Processing
- [ ] Currency-aware payment handling
- [ ] Exchange rate locking at checkout
- [ ] Multi-currency payment gateway integration
- [ ] Order creation with currency data

#### 4.2 Form Enhancement
- [ ] Currency selector in checkout
- [ ] Automatic currency switching on country change
- [ ] Price update animations
- [ ] Currency disclaimer/notice

### Phase 5: User Experience
**Status: ⏳ PENDING**

#### 5.1 Smart Defaults
- [ ] Country detection → Currency detection
- [ ] Browser locale consideration
- [ ] Persistent currency preference
- [ ] Fallback logic for unsupported currencies

#### 5.2 Advanced Features
- [ ] Currency switching toggle
- [ ] Historical rate information
- [ ] Currency conversion tooltip
- [ ] Regional price differences display

## Technical Implementation Details

### Currency Worker API Design

```javascript
// GET /currency/{countryCode}
{
  "country": "GB",
  "currency": "GBP", 
  "symbol": "£",
  "rates": {
    "USD": 0.79,
    "EUR": 0.85,
    "GBP": 1.00
  },
  "formatting": {
    "decimal": ".",
    "thousands": ",", 
    "precision": 2,
    "format": "%s%v"
  }
}

// GET /rates/{baseCurrency}
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

### State Management Integration

```javascript
// Extended state structure
state: {
  location: {
    countries: [...],
    detectedCountryCode: "GB",
    // ... existing location state
  },
  currency: {
    detected: {
      code: "GBP",
      symbol: "£", 
      country: "GB"
    },
    selected: {
      code: "GBP",
      symbol: "£",
      country: "GB"
    },
    rates: {
      base: "USD",
      rates: { EUR: 0.85, GBP: 0.79 },
      lastUpdated: "2025-01-02T10:30:00Z"
    },
    formatting: {
      decimal: ".",
      thousands: ",",
      precision: 2
    }
  }
}
```

### CurrencyManager Implementation

```javascript
class CurrencyManager {
  constructor(app) {
    this.app = app;
    this.logger = app.logger.createModuleLogger('CURRENCY');
    
    // Subscribe to country changes
    app.state.subscribe('location.initialSelectedCountryCode', this.handleCountryChange.bind(this));
  }

  async handleCountryChange(countryCode) {
    const currencyData = await this.app.api.getCurrencyData(countryCode);
    this.app.state.setState('currency.detected', currencyData);
    this.updateCartDisplay();
  }

  convertPrice(amount, fromCurrency, toCurrency) {
    const rates = this.app.state.getState('currency.rates.rates');
    // Conversion logic
  }

  formatCurrency(amount, currencyCode = null) {
    const currency = currencyCode || this.app.state.getState('currency.selected.code');
    const formatting = this.app.state.getState('currency.formatting');
    // Formatting logic
  }
}
```

## Configuration Options

### Merchant Configuration

```javascript
window.osConfig = {
  // Existing address config
  addressConfig: {
    defaultCountry: 'US',
    showCountries: ['US', 'CA', 'GB', 'AU'],
    // ... existing options
  },
  
  // New currency config
  currencyConfig: {
    enabled: true,
    defaultCurrency: 'USD',
    supportedCurrencies: ['USD', 'EUR', 'GBP', 'CAD', 'AUD'],
    autoSwitchOnCountryChange: true,
    showCurrencySelector: true,
    fallbackCurrency: 'USD',
    rateUpdateInterval: 3600000, // 1 hour
    conversionNotice: true
  }
};
```

### URL Parameters

```
?forceCountry=GB&forceCurrency=GBP
?currency=EUR
?showRates=true
```

## Error Handling & Fallbacks

### Currency System Fallbacks
1. **Worker Unavailable**: Fall back to static currency mapping
2. **Rate Fetch Failure**: Use cached rates or static fallback rates
3. **Unsupported Currency**: Fall back to USD or merchant default
4. **Network Issues**: Graceful degradation to single currency

### Integration Points
1. **Country Change**: Automatically suggest currency switch
2. **Currency Change**: Update all displayed prices
3. **Checkout**: Lock exchange rate for payment processing
4. **Error States**: Clear user communication about currency issues

## Testing Strategy

### Unit Tests
- Currency conversion accuracy
- Format currency function
- State management integration
- Error handling scenarios

### Integration Tests
- Country → Currency flow
- Cart price updates
- Checkout currency handling
- Worker API integration

### E2E Tests  
- Full checkout flow with currency switching
- Country detection → Currency detection
- Payment processing with different currencies
- Error scenario handling

## Performance Considerations

### Caching Strategy
- Currency rates: 1-hour cache
- Country-currency mapping: 24-hour cache
- Formatting rules: Cache until browser refresh

### Optimization
- Debounced currency updates
- Lazy-load currency data
- Minimize API calls during checkout
- Efficient state updates

## Migration Path

### From Current System
1. **Backward Compatibility**: Maintain existing single-currency support
2. **Progressive Enhancement**: Currency features activate only when configured
3. **Graceful Degradation**: Fall back to original behavior on errors
4. **Configuration-Driven**: Merchants opt-in to multi-currency

### Deployment Strategy
1. **Phase 1**: Deploy country worker integration (no breaking changes)
2. **Phase 2**: Deploy currency worker and manager (opt-in)
3. **Phase 3**: Enable for pilot merchants
4. **Phase 4**: General availability

## Security Considerations

### Data Protection
- No sensitive currency data stored locally
- Rate data validation to prevent manipulation
- HTTPS for all worker communications

### Rate Integrity
- Multiple rate source verification
- Rate change alerts for significant fluctuations
- Audit logging for currency operations

## Monitoring & Analytics

### Metrics to Track
- Currency detection accuracy
- Conversion rate by currency
- Checkout completion by currency
- Worker performance and errors
- Rate fetch success/failure rates

### Alerting
- Worker downtime
- Rate fetch failures
- Significant rate fluctuations
- High error rates in currency operations

## Success Criteria

### Technical
- [ ] 99.9% uptime for currency workers
- [ ] <200ms response time for currency operations
- [ ] <1% error rate in currency conversions
- [ ] Seamless integration with existing checkout flow

### Business
- [ ] Increased international conversion rates
- [ ] Reduced cart abandonment for international users
- [ ] Improved user experience metrics
- [ ] Merchant adoption of multi-currency features

---

## Implementation Roadmap

### Phase 1 - Country Worker Foundation (Week 1-2)
1. **Day 1-2**: Create Cloudflare Worker for location data
   - Set up worker with country/state data API
   - Implement IP-based country detection
   - Add caching strategy
2. **Day 3-4**: Enhance StateManager with location state
   - Add location state structure
   - Implement state management methods
3. **Day 5-7**: Update AddressHandler
   - Integrate with location worker
   - Add dynamic field updates
   - Implement country-specific validation
4. **Day 8-10**: Testing and refinement
   - End-to-end testing
   - Performance optimization
   - Error handling

### Phase 2 - Currency System (Week 3-4)
1. **Day 1-3**: Currency Worker and CurrencyManager
2. **Day 4-6**: Cart and display integration
3. **Day 7-10**: Testing and checkout integration

### Phase 3 - Full Integration (Week 5)
1. **Day 1-3**: Complete checkout flow testing
2. **Day 4-5**: Documentation and deployment preparation

## Next Immediate Steps

1. **Create location worker infrastructure**
2. **Update StateManager to support location state**
3. **Enhance AddressHandler to use centralized data**
4. **Add country-specific validation to FormValidator**
5. **Test the foundation before moving to currency features**

This implementation will transform the checkout experience for international customers while maintaining backward compatibility and providing merchants with powerful configuration options.