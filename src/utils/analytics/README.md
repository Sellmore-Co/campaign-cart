# Next Analytics v2

A clean, Elevar-inspired analytics system for Next Campaign Cart SDK.

## Overview

This analytics system follows industry best practices established by Elevar, providing:
- Dedicated data layer (`window.NextDataLayer`)
- Event validation and debugging
- Standardized e-commerce event structure
- Automatic tracking capabilities
- Multi-provider support (GTM, Facebook Pixel, custom endpoints)

## Key Features

### 1. Dedicated Data Layer
```javascript
// All events flow through NextDataLayer
window.NextDataLayer = [
  { event: "dl_user_data", ... },
  { event: "dl_view_item", ... },
  { event: "dl_add_to_cart", ... }
];
```

### 2. Debug Mode
```javascript
// Enable debug mode
NextAnalytics.setDebugMode(true);

// Or via console
window.NextDataLayer.setDebugMode(true);
```

### 3. Event Validation
All events are validated against schemas ensuring data quality before sending to providers.

### 4. Transform Functions
```javascript
// Modify events before they're processed
window.NextDataLayerTransformFn = (event) => {
  if (event.event === 'dl_add_to_cart') {
    return { ...event, custom_field: 'value' };
  }
  return event;
};
```

## Standard Events

### User Events
- `dl_user_data` - Base event with user properties and cart contents
- `dl_sign_up` - User registration
- `dl_login` - User login
- `dl_subscribe` - Newsletter/SMS subscription

### E-commerce Events
- `dl_view_item_list` - Collection/category page views
- `dl_view_search_results` - Search results
- `dl_select_item` - Product clicks
- `dl_view_item` - Product detail views
- `dl_add_to_cart` - Add to cart
- `dl_remove_from_cart` - Remove from cart
- `dl_view_cart` - Cart page views
- `dl_begin_checkout` - Checkout initiation
- `dl_purchase` - Order completion

## Usage

### Basic Tracking
```javascript
import { nextAnalytics } from '@/utils/analytics/v2';

// Track add to cart
nextAnalytics.trackAddToCart('PRODUCT_ID', 1);

// Track purchase
nextAnalytics.trackPurchase({
  order: orderData,
  total: 99.99
});
```

### Manual Event Creation
```javascript
import { EcommerceEvents } from '@/utils/analytics/v2';

// Create and track custom event
const event = EcommerceEvents.createAddToCartEvent({
  packageId: '123',
  quantity: 2
});
nextAnalytics.track(event);
```

## Configuration

Analytics is configured via the main SDK config:

```javascript
{
  analytics: {
    enabled: true,
    mode: 'auto', // 'auto' | 'manual' | 'disabled'
    debug: false,
    providers: {
      gtm: {
        enabled: true,
        settings: {}
      },
      facebook: {
        enabled: true,
        settings: {
          pixelId: 'YOUR_PIXEL_ID'
        }
      }
    }
  }
}
```

## Automatic Tracking

When `mode: 'auto'`, the system automatically tracks:
- Page views and user data on route changes
- Product impressions (`dl_view_item_list`)
- Cart events via EventBus integration
- List attribution (tracks where products were viewed)

## Route Changes

For SPAs, notify the system of route changes:
```javascript
window.NextInvalidateContext();
```

## Testing

Use debug mode to validate events:
```javascript
NextAnalytics.setDebugMode(true);
```

Events will be logged to console with validation results.