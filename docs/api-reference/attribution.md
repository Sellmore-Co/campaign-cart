# Attribution API

The SDK provides comprehensive attribution tracking capabilities, including support for custom metadata that can be passed with orders.

## Simple API via window.next

The easiest way to manage attribution metadata is through the `window.next` object:

```javascript
// Add or update a single metadata field
window.next.addMetadata('campaign_id', 'SUMMER2025');
window.next.addMetadata('influencer_code', 'JANE123');

// Set multiple metadata fields at once
window.next.setMetadata({
  campaign_id: 'SUMMER2025',
  influencer_code: 'JANE123',
  test_variant: 'hero_b',
  source_platform: 'instagram'
});

// Get current metadata
const metadata = window.next.getMetadata();
console.log(metadata);

// Clear all custom metadata (preserves automatic fields)
window.next.clearMetadata();

// Set complete attribution data (including standard fields)
window.next.setAttribution({
  utm_source: 'instagram',
  utm_campaign: 'summer2025',
  affiliate: 'partner123',
  metadata: {
    custom_field: 'value'
  }
});

// Get current attribution that will be sent with orders
const attribution = window.next.getAttribution();
console.log(attribution);

// Debug attribution data in console
window.next.debugAttribution();
```

## Attribution Object Structure

When orders are created, the SDK sends attribution data in the following format:

```typescript
interface Attribution {
  affiliate?: string;
  funnel?: string;
  gclid?: string;
  metadata?: Record<string, any>;  // Custom metadata object
  subaffiliate1?: string;
  subaffiliate2?: string;
  subaffiliate3?: string;
  subaffiliate4?: string;
  subaffiliate5?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_medium?: string;
  utm_source?: string;
  utm_term?: string;
  everflow_transaction_id?: string;
}
```

## Accessing Attribution Store

The attribution store is available globally after SDK initialization:

```javascript
// Access via window object
window.NextAttributionStore

// Or via NextStores
const { useAttributionStore } = window.NextStores;
const attributionStore = useAttributionStore.getState();
```

## Methods

### updateAttribution(data)

Updates attribution data including custom metadata.

```javascript
window.NextAttributionStore.updateAttribution({
  affiliate: 'partner_123',
  utm_source: 'instagram',
  metadata: {
    custom_field: 'value',
    tracking_id: 'abc123'
  }
});
```

**Parameters:**
- `data` (Partial<AttributionState>): Object containing attribution fields to update

### getAttributionForApi()

Returns the current attribution data formatted for API submission.

```javascript
const attribution = window.NextAttributionStore.getAttributionForApi();
console.log(attribution);
// Output: { affiliate: '...', metadata: {...}, utm_source: '...', ... }
```

**Returns:** Attribution object ready for API

### setFunnelName(funnel)

Sets the funnel name for attribution tracking. Once set, it persists and cannot be overwritten.

```javascript
window.NextAttributionStore.setFunnelName('summer_sale_2025');
```

**Parameters:**
- `funnel` (string): The funnel identifier

### setEverflowClickId(evclid)

Sets the Everflow click ID for tracking.

```javascript
window.NextAttributionStore.setEverflowClickId('ef_click_12345');
```

**Parameters:**
- `evclid` (string): Everflow click identifier

### debug()

Outputs detailed attribution information to the console for debugging.

```javascript
window.NextAttributionStore.debug();
// Logs comprehensive attribution data to console
```

### clearPersistedFunnel()

Clears the persisted funnel name from storage.

```javascript
window.NextAttributionStore.clearPersistedFunnel();
```

## Custom Metadata

The `metadata` field accepts any custom properties you need to track with orders.

### Automatic Metadata Collection

The SDK automatically collects these metadata fields:

```javascript
{
  landing_page: string;      // Entry page URL
  referrer: string;          // Referring URL
  device: string;            // Device info
  device_type: 'mobile' | 'desktop';
  domain: string;            // Current domain
  timestamp: number;         // Visit timestamp
  conversion_timestamp?: number;
  
  // Facebook tracking (when available)
  fb_fbp?: string;
  fb_fbc?: string;
  fb_pixel_id?: string;
  fbclid?: string;
  
  // Everflow tracking (when available)
  everflow_transaction_id?: string;
  sg_evclid?: string;
}
```

### Adding Custom Metadata

Add any custom tracking data your business requires:

```javascript
window.NextAttributionStore.updateAttribution({
  metadata: {
    // Marketing campaign data
    campaign_id: 'SUMMER2025',
    campaign_version: 'v2',
    creative_id: 'hero_banner_b',
    
    // Partner/Influencer tracking
    influencer_code: 'JANE123',
    partner_id: 'partner_456',
    commission_tier: 'gold',
    
    // Platform-specific IDs
    tiktok_click_id: 'ttc_abc123',
    pinterest_id: 'pin_xyz789',
    snapchat_id: 'snap_456',
    reddit_campaign: 'sponsored_post_789',
    
    // A/B testing
    test_group: 'variant_b',
    test_id: 'homepage_hero_test',
    
    // Geographic/Store data
    store_location: 'NYC_flagship',
    region: 'northeast',
    
    // Custom business logic
    customer_segment: 'vip',
    loyalty_tier: 'platinum',
    referral_program_id: 'friend_2025',
    
    // Nested objects are supported
    advanced_tracking: {
      session_id: 'sess_xyz',
      interaction_count: 5,
      time_on_site: 300
    }
  }
});
```

## Examples

### Example 1: E-commerce Platform Integration

```javascript
// Track marketplace attribution
function trackMarketplaceSource(marketplace, sellerId, listingId) {
  window.NextAttributionStore.updateAttribution({
    utm_source: marketplace,
    utm_medium: 'marketplace',
    affiliate: sellerId,
    metadata: {
      marketplace_name: marketplace,
      seller_id: sellerId,
      listing_id: listingId,
      marketplace_category: 'electronics',
      marketplace_rank: 5,
      fulfilled_by: 'merchant',
      prime_eligible: true,
      promotion_type: 'lightning_deal'
    }
  });
}

// Usage
trackMarketplaceSource('amazon', 'SELLER123', 'B08XYZ123');
```

### Example 2: Multi-Touch Attribution

```javascript
// Track multiple touchpoints in customer journey
function trackTouchpoint(touchpointData) {
  const currentMetadata = window.NextAttributionStore.getAttributionForApi().metadata || {};
  
  // Append to touchpoint history
  const touchpoints = currentMetadata.touchpoints || [];
  touchpoints.push({
    timestamp: Date.now(),
    channel: touchpointData.channel,
    action: touchpointData.action,
    value: touchpointData.value
  });
  
  window.NextAttributionStore.updateAttribution({
    metadata: {
      ...currentMetadata,
      touchpoints: touchpoints,
      last_touchpoint: touchpointData.channel,
      touchpoint_count: touchpoints.length,
      attribution_model: 'linear' // or 'first_touch', 'last_touch', etc.
    }
  });
}

// Track various touchpoints
trackTouchpoint({ channel: 'email', action: 'opened', value: 'welcome_series' });
trackTouchpoint({ channel: 'social', action: 'clicked', value: 'instagram_story' });
trackTouchpoint({ channel: 'search', action: 'clicked', value: 'brand_term' });
```

### Example 3: Retail & Offline Attribution

```javascript
// Bridge offline and online attribution
function trackOfflineAttribution(storeData) {
  window.NextAttributionStore.updateAttribution({
    utm_source: 'retail',
    utm_medium: 'in_store',
    utm_campaign: storeData.campaign || 'store_visit',
    metadata: {
      // Store information
      store_id: storeData.storeId,
      store_name: storeData.storeName,
      store_region: storeData.region,
      store_type: storeData.type, // 'flagship', 'outlet', 'pop_up'
      
      // Staff attribution
      associate_id: storeData.associateId,
      associate_name: storeData.associateName,
      department: storeData.department,
      
      // In-store journey
      kiosk_used: storeData.kioskUsed,
      qr_scanned: storeData.qrScanned,
      fitting_room_tech: storeData.fittingRoomTech,
      
      // Transaction bridging
      in_store_cart_id: storeData.cartId,
      pos_system: 'square',
      store_promo_code: storeData.promoCode,
      
      // Customer experience
      appointment_booked: storeData.appointmentBooked,
      personal_shopper: storeData.personalShopper,
      curbside_pickup: false,
      
      // Timing
      store_visit_timestamp: storeData.visitTime,
      offline_to_online_hours: storeData.hoursSinceVisit
    }
  });
}
```

### Example 4: Content Attribution

```javascript
// Track content-driven conversions
function trackContentAttribution(contentData) {
  window.NextAttributionStore.updateAttribution({
    utm_source: contentData.platform,
    utm_medium: 'content',
    utm_campaign: contentData.campaign,
    utm_content: contentData.contentId,
    metadata: {
      // Content details
      content_type: contentData.type, // 'blog', 'video', 'podcast', 'webinar'
      content_id: contentData.contentId,
      content_title: contentData.title,
      content_author: contentData.author,
      content_category: contentData.category,
      publish_date: contentData.publishDate,
      
      // Engagement metrics
      read_time_seconds: contentData.readTime,
      scroll_depth: contentData.scrollDepth,
      video_watch_percentage: contentData.watchPercentage,
      
      // Content journey
      content_path: contentData.contentPath, // ['blog_1', 'video_2', 'product_page']
      content_touches: contentData.touches,
      
      // SEO/Discovery
      entry_keyword: contentData.keyword,
      discovery_method: contentData.discovery, // 'search', 'recommendation', 'social'
      
      // Monetization
      paywall_shown: contentData.paywallShown,
      subscription_prompt: contentData.subscriptionPrompt,
      native_ad_clicked: contentData.nativeAdClicked
    }
  });
}
```

## URL Parameter Auto-Collection

The SDK automatically collects attribution data from URL parameters on page load:

- UTM parameters: `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`
- Google Ads: `gclid`
- Facebook: `fbclid`
- Affiliate: `affiliate`, `subaffiliate1-5`
- Funnel: `funnel`
- Custom: Any parameter prefixed with `next_` is added to metadata

Example URL:
```
https://example.com/products?
  utm_source=instagram&
  utm_campaign=summer2025&
  affiliate=partner123&
  next_custom_id=xyz789&
  next_segment=vip
```

## Session Persistence

Attribution data persists throughout the user's session:

- **Session Storage**: Primary attribution data
- **Local Storage**: Funnel names and Everflow IDs
- **Duration**: Cleared when browser session ends

## Best Practices

1. **Initialize Early**: Set attribution data as soon as possible in the user journey
2. **Avoid PII**: Never include personally identifiable information (emails, names, etc.)
3. **Use Consistent Keys**: Establish naming conventions for metadata fields
4. **Validate Data**: Ensure metadata values are valid JSON types
5. **Document Fields**: Maintain documentation of custom metadata fields
6. **Test Integration**: Verify attribution data appears correctly in orders

## Debugging

```javascript
// Check current attribution state
window.NextAttributionStore.debug();

// Monitor attribution changes
const store = window.NextStores.useAttributionStore.getState();
const unsubscribe = window.NextStores.useAttributionStore.subscribe(
  (state) => console.log('Attribution updated:', state)
);

// View attribution that will be sent with order
console.log('API Attribution:', window.NextAttributionStore.getAttributionForApi());
```

## Common Issues

### Issue: Metadata not appearing in orders
**Solution**: Ensure you're calling `updateAttribution()` before order creation and that the metadata object contains valid JSON values.

### Issue: Funnel name not updating
**Solution**: Funnel names are write-once. Use `clearPersistedFunnel()` to reset if needed during development.

### Issue: Attribution data lost on page refresh
**Solution**: Attribution persists in session storage. If you need longer persistence, implement your own storage solution and restore on page load.