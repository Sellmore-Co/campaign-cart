# Next Campaign Cart SDK DataLayer Documentation

## Overview

The Next Campaign Cart SDK implements a comprehensive analytics datalayer system (`window.NextDataLayer`) that tracks e-commerce events, user interactions, and conversion data across the customer journey.

## DataLayer Initialization

The Next datalayer is initialized during SDK startup:

**Location**: `src/enhancers/core/SDKInitializer.ts:743`

```typescript
private static async initializeAnalytics(): Promise<void> {
    const { nextAnalytics } = await import('@/utils/analytics/index');
    await nextAnalytics.initialize();
}
```

The datalayer is exposed as a global array: `window.NextDataLayer[]`

## Event Structure

### Base DataLayerEvent Interface

Every event pushed to the datalayer follows this structure:

```typescript
interface DataLayerEvent {
    event: string;                    // Event name (e.g., "dl_add_to_cart")
    event_id?: string;                // Unique event identifier
    event_time?: string;              // ISO timestamp
    timestamp?: number;               // Unix timestamp
    event_category?: string;          // Category (e.g., "ecommerce", "user")
    event_label?: string;             // Descriptive label
    event_value?: number;             // Numeric value
    user_properties?: UserProperties; // User data
    ecommerce?: EcommerceData;       // E-commerce specific data
    attribution?: any;                // Attribution data from store
    _metadata?: EventMetadata;        // System metadata
    data?: any;                       // Additional data
    cart_total?: string | number;
    upsell?: UpsellData;             // Upsell-specific data
    order_id?: string;
    [key: string]: any;              // Additional flexible fields
}
```

## E-commerce Events

### Standard E-commerce Events

| Event Name | Description | Trigger Point |
|------------|-------------|---------------|
| `dl_view_item_list` | Products displayed in a list | Product listing pages |
| `dl_view_item` | Single product viewed | Product detail view |
| `dl_add_to_cart` | Item added to cart | Add to cart button click |
| `dl_remove_from_cart` | Item removed from cart | Remove from cart action |
| `dl_package_swapped` | Package swapped atomically | Package selection change |
| `dl_select_item` | Product clicked/selected | Product click in list |
| `dl_begin_checkout` | Checkout process started | Checkout initialization |
| `dl_view_cart` | Cart viewed | Cart page/modal open |
| `dl_add_shipping_info` | Shipping info added | Shipping form completion |
| `dl_add_payment_info` | Payment info added | Payment details entered |
| `dl_purchase` | Purchase completed | Order confirmation |

### Upsell Events

| Event Name | Description | Trigger Point |
|------------|-------------|---------------|
| `dl_viewed_upsell` | Upsell offer displayed | Upsell page load |
| `dl_accepted_upsell` | Upsell accepted | Accept upsell click |
| `dl_skipped_upsell` | Upsell declined | Skip/decline upsell |

## User Events

| Event Name | Description | Trigger Point |
|------------|-------------|---------------|
| `dl_user_data` | User data synchronization | Session start/update |
| `sign_up` | User registration | Account creation |
| `login` | User authentication | Login completion |
| `subscribe` | Newsletter/SMS subscription | Subscription form submit |
| `profile_update` | Profile information updated | Profile save |
| `email_verification` | Email verification status | Verification action |
| `password_reset` | Password reset flow | Reset request/completion |
| `user_consent` | GDPR/privacy consent | Consent form interaction |

## Data Structures

### Product/Item Data (EcommerceItem)

Products are sent in the `ecommerce.items[]` array:

```typescript
interface EcommerceItem {
    // Required fields
    item_id: string;           // Package/Product ID
    item_name: string;         // Product title

    // Product details
    item_brand?: string;       // Brand name
    item_category?: string;    // Campaign name (primary category)
    item_category2?: string;   // Secondary category
    item_category3?: string;   // Tertiary category
    item_category4?: string;   // Quaternary category
    item_category5?: string;   // Quinary category
    item_variant?: string;     // Product variant/profile
    item_image?: string;       // Product image URL
    item_sku?: string;         // Product SKU

    // Pricing
    price?: number;            // Unit price (including tax)
    quantity?: number;         // Quantity
    currency?: string;         // Currency code (e.g., "USD")
    discount?: number;         // Discount amount

    // Attribution
    affiliation?: string;      // Store/affiliate
    coupon?: string;          // Coupon code

    // List context
    index?: number;           // Position in list
    item_list_id?: string;    // List identifier
    item_list_name?: string;  // List name
}
```

### E-commerce Data (EcommerceData)

```typescript
interface EcommerceData {
    // Transaction totals
    currency?: string;         // Currency code
    value?: number;           // Total value
    value_change?: number;    // Price difference (for swaps)

    // Items
    items?: EcommerceItem[];  // Product items
    items_removed?: EcommerceItem[]; // Items removed (for swaps)
    items_added?: EcommerceItem[];   // Items added (for swaps)

    // Transaction details
    transaction_id?: string;  // Order ID
    affiliation?: string;     // Store name
    tax?: number;            // Tax amount
    shipping?: number;       // Shipping cost
    coupon?: string;        // Coupon code
    discount?: number;      // Discount amount
}
```

### User Properties (UserProperties)

```typescript
interface UserProperties {
    // User identification
    visitor_type?: 'guest' | 'customer' | 'returning_customer';
    customer_id?: string;
    customer_email?: string;
    customer_phone?: string;

    // Name
    customer_first_name?: string;
    customer_last_name?: string;

    // Address
    customer_address_city?: string;
    customer_address_country?: string;
    customer_address_country_code?: string;
    customer_address_province?: string;
    customer_address_province_code?: string;
    customer_address_zip?: string;

    // Customer metrics
    customer_tags?: string[];
    customer_order_count?: number;
    customer_total_spent?: number;
}
```

## Product Data Population Logic

The SDK uses a hierarchical approach to populate product data:

### Field Resolution Order

1. **Package ID**
   - Primary: `item.packageId`
   - Fallback 1: `item.package_id`
   - Fallback 2: `item.id`

2. **Product Name**
   - Primary: `item.product?.title`
   - Fallback 1: `item.title`
   - Fallback 2: `item.product_title`
   - Fallback 3: `item.name`
   - Default: `"Package ${id}"`

3. **Price**
   - Primary: `item.price_incl_tax`
   - Fallback 1: `item.price.incl_tax.value` (for structured price objects)
   - Fallback 2: `item.price` (parsed if string)

4. **Variant**
   - Primary: `item.product_variant_name`
   - Fallback 1: `item.product?.variant?.name`
   - Fallback 2: `item.package_profile`
   - Fallback 3: `item.variant`

5. **Image URL**
   - Primary: Campaign package data lookup
   - Fallback 1: `item.image`
   - Fallback 2: `item.product?.image`
   - Fallback 3: `item.imageUrl`
   - Fallback 4: `item.image_url`

6. **Currency**
   - Primary: `campaign.currency` from campaign store
   - Default: `"USD"`

7. **Category**
   - Uses campaign name as primary category

## Event Enrichment

Every event is automatically enriched with contextual data:

### 1. User Properties
- Billing/shipping address information
- Email address
- Customer ID
- Visitor type (guest/customer/returning_customer)

### 2. Attribution Data
- UTM parameters (source, medium, campaign, term, content)
- Referrer URL
- Funnel name
- Click IDs (gclid, fbclid, evclid, etc.)
- Landing page

### 3. Session Information
- Session ID
- Event sequence number
- Session start time

### 4. Page Context
- Page URL
- Page title
- Viewport dimensions
- Screen resolution
- User agent string

### 5. Event Metadata
- Timestamp (Unix and ISO format)
- Debug mode flag
- SDK version
- Event source

## Analytics Providers

The datalayer supports multiple analytics providers:

### Supported Providers

1. **GTM Adapter**
   - Google Tag Manager integration
   - Pushes events to `window.dataLayer`

2. **Facebook Adapter**
   - Facebook Pixel integration
   - Requires pixel ID configuration

3. **RudderStack Adapter**
   - RudderStack CDP integration
   - Full event streaming support

4. **NextCampaign Adapter**
   - 29Next's internal analytics
   - Campaign performance tracking

5. **Custom Adapter**
   - Custom endpoint integration
   - Configurable HTTP endpoint

### Provider Configuration

Providers are configured in the SDK initialization:

```javascript
window.nextConfig = {
  analytics: {
    enabled: true,
    mode: 'auto', // or 'manual'
    providers: {
      gtm: { enabled: true },
      facebook: {
        enabled: true,
        settings: { pixelId: 'YOUR_PIXEL_ID' }
      },
      nextCampaign: { enabled: true },
      custom: {
        enabled: true,
        settings: { endpoint: 'https://your-endpoint.com' }
      }
    }
  }
}
```

## Event Transformation

The SDK supports custom event transformation via a global function:

```javascript
window.NextDataLayerTransformFn = function(event) {
  // Modify event
  event.custom_field = 'custom_value';

  // Return modified event (or null to filter out)
  return event;
}
```

## Debug Mode

Enable debug mode to log all events to console:

```javascript
// Via configuration
window.nextConfig = {
  analytics: { debug: true }
}

// Or programmatically
window.NextAnalytics.setDebugMode(true);
```

## Accessing the DataLayer

### Direct Access
```javascript
// Access raw datalayer array
const events = window.NextDataLayer;

// Get last event
const lastEvent = window.NextDataLayer[window.NextDataLayer.length - 1];
```

### Via Analytics Instance
```javascript
// Track custom event
window.NextAnalytics.track({
  event: 'custom_event',
  event_category: 'custom',
  custom_data: { foo: 'bar' }
});

// Get analytics status
const status = window.NextAnalytics.getStatus();
```

## Session Management

Sessions are managed automatically with:
- 30-minute timeout (configurable)
- Persistent session ID in localStorage
- Automatic session renewal on activity

## Performance Considerations

- Events are queued if analytics isn't initialized
- Lazy loading of analytics module (doesn't block SDK init)
- Batch processing support for providers
- Automatic retry logic for failed events
- Events preserved across page navigation (pending events handler)

## Privacy & Compliance

- Supports consent management via `user_consent` events
- Session storage for temporary data
- Local storage for persistent user properties
- URL parameter `?ignore=true` to disable tracking
- Respects DNT (Do Not Track) headers when configured

## Testing & Debugging

### View Events in Console
```javascript
// Enable verbose logging
window.NextAnalytics.setDebugMode(true);

// View all events
console.table(window.NextDataLayer);

// Monitor new events
const originalPush = window.NextDataLayer.push;
window.NextDataLayer.push = function(event) {
  console.log('New event:', event);
  return originalPush.call(this, event);
};
```

### Test Event Tracking
```javascript
// Test add to cart
window.NextAnalytics.trackAddToCart({
  packageId: 1,
  title: 'Test Product',
  price: 99.99,
  quantity: 1
});

// Test purchase
window.NextAnalytics.trackPurchase({
  order: {
    ref_id: 'TEST-001',
    total: 199.99,
    lines: [
      { package: 1, product_title: 'Test Product', price: 99.99 }
    ]
  }
});
```

## Common Integration Patterns

### Google Analytics 4 (via GTM)
Events are formatted to match GA4 e-commerce schema with:
- Standard event names (view_item, add_to_cart, purchase)
- Items array with GA4-compatible fields
- Currency and value at event level

### Facebook Pixel
Events are mapped to Facebook standard events:
- ViewContent → dl_view_item
- AddToCart → dl_add_to_cart
- InitiateCheckout → dl_begin_checkout
- Purchase → dl_purchase

### Custom Analytics
Use the transform function to adapt events for your analytics platform:
```javascript
window.NextDataLayerTransformFn = function(event) {
  // Transform to your schema
  return {
    ...event,
    your_field: event.ecommerce?.value
  };
};
```