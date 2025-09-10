# Amplitude Event Schema for 29Next Campaign Cart SDK

## Overview
Simplified event schema for tracking SDK health metrics and usage patterns in Amplitude.

## Core Properties (Included in ALL Events)
```javascript
{
  // Required
  "domain": "example.com",              // Domain where SDK is running
  "page_url": "https://...",            // Full page URL
  "page_path": "/checkout",             // URL path only
  "sdk_version": "0.2.0",               // SDK version
  "api_key_hash": "hash123",            // Hashed API key
  "session_id": "uuid",                 // Session identifier
  "timestamp": 1234567890,              // Unix timestamp
  
  // Optional (when available)
  "campaign_id": "camp_123",            // Campaign identifier
  "campaign_name": "Summer Sale",       // Campaign name
  "funnel_name": "checkout_flow",       // Funnel name from attribution
  "ref_id": "order_123"                 // Order reference ID if present
}
```

## Events

### 1. Page View Event

#### `page_view`
Track every page load with SDK present.

**Properties:**
- `page_type`: string - Page type detection
  - `'landing'` - Landing/home page
  - `'product'` - Product display page
  - `'cart'` - Cart page
  - `'checkout'` - Checkout page
  - `'upsell'` - Upsell page (has ref_id parameter)
  - `'thankyou'` - Order confirmation page
  - `'unknown'` - Could not determine type
- `has_ref_id`: boolean - Whether ref_id parameter is present
- `utm_source`: string | null
- `utm_medium`: string | null
- `utm_campaign`: string | null
- `referrer`: string | null
- `device_type`: string - 'desktop' | 'mobile' | 'tablet'
- `browser`: string - Browser name
- `os`: string - Operating system

### 2. SDK Health Events

#### `sdk_initialized`
Successfully initialized SDK (only send on success).

**Properties:**
- `initialization_time_ms`: number - Total time to initialize
- `campaign_load_time_ms`: number - Time to load campaign data
- `from_cache`: boolean - Whether campaign was loaded from cache
- `retry_attempts`: number - Number of retries needed (0 if first try)
- `elements_enhanced`: number - Number of DOM elements enhanced
- `debug_mode`: boolean - Whether debug mode is enabled
- `force_package_id`: string | null - If forcePackageId parameter used
- `force_shipping_id`: string | null - If forceShippingId parameter used

#### `sdk_initialization_failed`
SDK failed to initialize (critical error).

**Properties:**
- `error_message`: string - Error message
- `error_stage`: string - Where it failed
  - `'config_load'` - Configuration loading
  - `'campaign_load'` - Campaign data loading
  - `'dom_scan'` - DOM scanning/enhancement
  - `'attribution'` - Attribution initialization
- `retry_attempt`: number - Which attempt failed

### 3. Campaign Events

#### `campaign_loaded`
Campaign data successfully loaded.

**Properties:**
- `load_time_ms`: number - Time to load
- `from_cache`: boolean - Loaded from cache
- `cache_age_ms`: number | null - Age of cached data
- `package_count`: number - Number of packages
- `shipping_methods_count`: number - Number of shipping methods
- `currency`: string - Campaign currency

#### `campaign_load_failed`
Failed to load campaign data.

**Properties:**
- `error_type`: string - 'network' | 'auth' | 'timeout' | 'invalid_response'
- `status_code`: number | null - HTTP status if applicable
- `retry_count`: number - Number of retries attempted

### 4. Cart Events

#### `cart_loaded`
Cart hydrated from storage on page load.

**Properties:**
- `items_count`: number - Number of items restored
- `cart_value`: number - Total value restored
- `load_time_ms`: number - Time to hydrate
- `from_storage`: boolean - Whether cart was restored from storage

### 5. API Performance Events

#### `api_call`
Track ALL API calls (no sampling).

**Properties:**
- `endpoint`: string - API endpoint path
- `method`: string - HTTP method
- `status_code`: number - Response status
- `response_time_ms`: number - Response time
- `request_type`: string - 'campaign' | 'cart' | 'order' | 'upsell' | 'prospect_cart'
- `success`: boolean - Whether call succeeded
- `error_message`: string | null - Error message if failed
- `error_type`: string | null - Error classification if failed
  - `'network'` - Network/connection error
  - `'rate_limit'` - 429 rate limiting
  - `'auth'` - 401/403 authentication/authorization
  - `'server_error'` - 500+ server errors
  - `'client_error'` - 400-499 client errors
- `retry_after`: number | null - Seconds to retry (for rate limiting)

### 6. Checkout Events

#### `checkout_started`
Track when checkout process begins (page load or cart → checkout).

**Properties:**
- `cart_value`: number - Total cart value
- `items_count`: number - Number of items in cart
- `detected_country`: string - Auto-detected country code

#### `checkout_submitted`
Track when user clicks submit/complete order button.

**Properties:**
- `cart_value`: number - Order total
- `items_count`: number - Number of items
- `country`: string - Selected country
- `payment_method`: string - Payment method selected
- `time_on_page_ms`: number - Time from page load to submission

#### `checkout_validation_failed`
Track when checkout submission fails validation.

**Properties:**
- `validation_errors`: string[] - Fields that failed validation
- `error_count`: number - Number of fields with errors
- `first_error_field`: string - First field that failed
- `country`: string - Selected country
- `payment_method`: string - Payment method attempted

#### `checkout_completed`
Track successful order creation.

**Properties:**
- `order_ref_id`: string - Order reference ID
- `order_value`: number - Final order value
- `items_count`: number - Number of items
- `country`: string - Country
- `payment_method`: string - Payment method used
- `time_to_complete_ms`: number - Total time from start to completion

### 7. Upsell Events

#### `upsell_page_view`
Upsell page viewed (has ref_id).

**Properties:**
- `order_ref_id`: string - Order reference
- `upsell_package_ids`: number[] - Available upsell packages
- `order_value`: number - Original order value
- `upsells_completed`: string[] - Previously completed upsells

#### `upsell_action`
User interacted with upsell.

**Properties:**
- `action`: string - 'accepted' | 'declined'
- `package_id`: number - Upsell package
- `package_value`: number - Upsell value
- `order_ref_id`: string - Order reference
- `new_order_total`: number | null - New total if accepted

## Implementation Notes

### Tracking Strategy
- `page_view`: 100% - Critical for understanding usage
- `sdk_initialized`: 100% - Important health metric
- `sdk_initialization_failed`: 100% - Critical errors
- `campaign_loaded`: 100% - Key performance metric
- `campaign_load_failed`: 100% - Critical errors
- `api_call`: 100% - ALL API calls tracked for health & error monitoring
- `cart_loaded`: 100% - Important for session tracking
- `checkout_started`: 100% - Funnel entry point
- `checkout_submitted`: 100% - Conversion attempt
- `checkout_validation_failed`: 100% - Identifies form issues
- `checkout_completed`: 100% - Successful conversions
- `upsell_*`: 100% - Important revenue metrics

### Page Type Detection Logic
```javascript
function detectPageType(): string {
  const path = window.location.pathname;
  const hasRefId = new URLSearchParams(window.location.search).has('ref_id');
  
  if (hasRefId) return 'upsell';
  if (path.includes('checkout')) return 'checkout';
  if (path.includes('cart')) return 'cart';
  if (path.includes('product')) return 'product';
  if (path.includes('thank') || path.includes('confirm')) return 'thankyou';
  if (path === '/' || path.includes('home')) return 'landing';
  
  return 'unknown';
}
```

### Privacy & Security
- Hash all API keys using SHA-256
- Never send email addresses or personal information
- Sanitize URLs to remove sensitive parameters
- No payment information in any events

### Event Batching
- Batch every 30 seconds or 10 events
- Immediate send for critical events (failures, upsell actions)
- Maximum batch size: 100 events

## Example Implementation

```javascript
// On every page load
amplitude.track('page_view', {
  ...coreProperties,
  page_type: detectPageType(),
  has_ref_id: urlParams.has('ref_id'),
  utm_source: urlParams.get('utm_source'),
  device_type: getDeviceType(),
  browser: getBrowserName(),
  os: getOS()
});

// On SDK initialization success
amplitude.track('sdk_initialized', {
  ...coreProperties,
  initialization_time_ms: Date.now() - startTime,
  campaign_load_time_ms: campaignLoadTime,
  from_cache: campaignFromCache,
  retry_attempts: retryCount,
  elements_enhanced: enhancedCount,
  debug_mode: config.debug
});

// On API call (100% tracking - no sampling)
amplitude.track('api_call', {
  ...coreProperties,
  endpoint: '/api/v1/orders/',
  method: 'POST',
  status_code: 500,
  response_time_ms: 1234,
  request_type: 'order',
  success: false,
  error_message: 'Internal Server Error',
  error_type: 'server_error',
  retry_after: null
});

// On checkout start
amplitude.track('checkout_started', {
  ...coreProperties,
  cart_value: 299.99,
  items_count: 3,
  detected_country: 'US'
});

// When user clicks submit
amplitude.track('checkout_submitted', {
  ...coreProperties,
  cart_value: 299.99,
  items_count: 3,
  country: 'US',
  payment_method: 'credit_card',
  time_on_page_ms: 45000
});

// If validation fails
amplitude.track('checkout_validation_failed', {
  ...coreProperties,
  validation_errors: ['email', 'card_number', 'cvv'],
  error_count: 3,
  first_error_field: 'email',
  country: 'US',
  payment_method: 'credit_card'
});

// On successful order
amplitude.track('checkout_completed', {
  ...coreProperties,
  order_ref_id: 'ORD-123456',
  order_value: 299.99,
  items_count: 3,
  country: 'US',
  payment_method: 'credit_card',
  time_to_complete_ms: 52000
});
```

## Monitoring Dashboards

### 1. SDK Health Dashboard
- SDK initialization success rate
- Average initialization time by domain
- Campaign load success rate
- Campaign load time trends
- API error rate by endpoint
- API response times (p50, p95, p99)
- API errors by type (rate_limit, server_error, etc.)

### 2. Usage Dashboard
- Page views by type
- Unique domains using SDK
- API key usage distribution
- Cart interaction rates

### 3. Upsell Performance
- Upsell page conversion rate
- Average upsell value
- Upsell acceptance rate by package

## Alerts

### Critical
- SDK initialization success rate < 95%
- Campaign load success rate < 90%
- API response time > 5s (p95)

### Warning
- Initialization time > 3s (p50)
- Campaign load time > 2s (p50)
- Cart load time > 500ms (p50)