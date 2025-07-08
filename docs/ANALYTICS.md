# Analytics Documentation

## Overview

The Campaign Cart SDK includes a powerful, provider-based analytics system that supports multiple analytics platforms simultaneously. The system automatically tracks ecommerce events and provides a unified API for custom tracking needs.

**Important:** The SDK does not inject any third-party analytics scripts. Users must load Google Tag Manager, Facebook Pixel, or other analytics scripts themselves. The SDK only dispatches events to existing analytics implementations.

## Architecture

### Provider Pattern

The analytics system uses a provider pattern that allows you to:
- Use multiple analytics providers simultaneously (GTM, Facebook Pixel, custom providers)
- Enable/disable providers without code changes
- Add custom providers by implementing the `AnalyticsProvider` interface
- Maintain consistent event formatting across providers

### Key Components

1. **AnalyticsManager** - Central orchestrator that manages all providers
2. **Analytics Providers** - Individual implementations for each platform (GTM, Facebook, etc.)
3. **Event Mappings** - Standardizes internal SDK events to analytics events
4. **Auto-tracking** - Automatically captures cart and checkout events
5. **Script Detection** - Checks for existing analytics implementations before dispatching events

## Configuration

Analytics is configured through the `window.nextConfig` object:

```javascript
window.nextConfig = {
  // Analytics configuration
  analytics: {
    // Enable/disable analytics globally
    enabled: true,
    
    // Tracking mode: 'auto' | 'manual' | 'disabled'
    mode: 'auto',  // Auto-tracking captures cart events automatically
    
    // Debug mode for analytics events
    debug: false,
    
    // Provider configurations
    providers: {
      // Google Tag Manager / GA4
      gtm: {
        enabled: true,
        settings: {
          containerId: 'GTM-XXXXXX',  // Used for event context, not script loading
          dataLayerName: 'dataLayer'  // Optional, defaults to 'dataLayer'
        }
      },
      
      // Facebook Pixel
      facebook: {
        enabled: true,
        settings: {
          pixelId: 'YOUR_PIXEL_ID',   // Used for event context
          testEventCode: 'TEST12345'  // Optional, for testing events
        }
      },
      
      // Custom provider
      custom: {
        enabled: false,
        settings: {
          endpoint: 'https://your-analytics.com/track',
          apiKey: 'your-api-key',
          batchSize: 10,  // Optional
          timeout: 5000   // Optional
        }
      }
    }
  }
};
```

## Setting Up Analytics Scripts

Before the SDK can send events, you must add the analytics scripts to your HTML:

### Google Tag Manager

```html
<!-- Google Tag Manager -->
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-XXXXXX');</script>
<!-- End Google Tag Manager -->
```

### Facebook Pixel

```html
<!-- Facebook Pixel Code -->
<script>
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window,document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', 'YOUR_PIXEL_ID');
fbq('track', 'PageView');
</script>
<!-- End Facebook Pixel Code -->
```

### Why External Script Loading?

1. **Security** - You maintain full control over third-party scripts
2. **Performance** - Load scripts when and how you prefer
3. **CSP Compliance** - Works with Content Security Policies
4. **No Conflicts** - Avoids duplicate script issues
5. **Trust** - SDKs that inject scripts are often viewed suspiciously

## Automatic Event Tracking

When `analytics.mode` is set to `'auto'`, the following events are automatically tracked:

### Cart Events
- `add_to_cart` - When items are added to cart (debounced to prevent duplicates during swap mode)
- `remove_from_cart` - When items are removed from cart
- `view_cart` - When cart is viewed

### Checkout Events
- `begin_checkout` - When checkout process starts
- `add_payment_info` - When payment information is added
- `add_shipping_info` - When shipping information is added

### Purchase Events
- `purchase` - When order is completed (queued before redirect)

### Upsell Events
- `viewed_upsell` - When upsell page is displayed (once per page)
- `accepted_upsell` - When upsell is accepted (queued before redirect)
- `skipped_upsell` - When upsell is declined

### Product Events
- `view_item` - Automatically fired when exactly 1 element with `data-next-package-id` is found on page
- `view_item_list` - Automatically fired when 2+ elements with `data-next-package-id` are found on page

### Page Tracking
- Upsell pages are automatically tracked by URL path when they contain `<meta name="next-page-type" content="upsell">`
- The order store maintains page-level tracking for comprehensive upsell journey analytics

## Manual Tracking

### Using the SDK

```javascript
// Wait for SDK to be ready
window.nextReady.push(function(next) {
  // Track view item (also fires automatically for single package pages)
  next.trackViewItem('123');
  
  // Track view item list (also fires automatically for 2+ package elements)
  next.trackViewItemList(['123', '456'], 'homepage', 'Featured Products');
  
  // Track add to cart (also triggered automatically)
  next.trackAddToCart('123', 2);
  
  // Track custom events
  next.trackCustomEvent('newsletter_signup', {
    location: 'footer',
    incentive: '10% off'
  });
  
  // Track page views
  next.trackPageView('Product Detail', {
    product_id: '123',
    category: 'Electronics'
  });
  
  // Identify users
  next.identifyUser('user_123', {
    email: 'user@example.com',
    plan: 'premium'
  });
});
```

### Direct Analytics Manager Access

For advanced use cases, you can access the analytics manager directly:

```javascript
import { analyticsManager } from '@/utils/analytics';

// Track a custom event
await analyticsManager.trackEvent('custom_event', {
  category: 'engagement',
  action: 'click',
  label: 'hero_cta'
});

// Get analytics status
const status = analyticsManager.getStatus();
console.log('Analytics providers:', status);

// Check if specific provider is active
const hasGTM = analyticsManager.hasProvider('gtm');
```

## Event Data Structure

### Ecommerce Events

All ecommerce events follow the GA4 enhanced ecommerce format:

```javascript
{
  event: 'add_to_cart',
  ecommerce: {
    currency: 'USD',
    value: 39.99,
    items: [{
      item_id: '123',
      item_name: 'Product Name',
      currency: 'USD',
      price: 19.99,
      quantity: 2,
      item_category: 'Campaign Name',
      item_variant: 'Size M',
      item_list_id: 'cart',
      item_list_name: 'Shopping Cart'
    }]
  }
}
```

### Custom Events

Custom events can have any structure:

```javascript
{
  event: 'newsletter_signup',
  event_category: 'engagement',
  event_label: 'footer_form',
  value: 1
}
```

## Debug Tools

### Analytics Panel

The debug overlay includes an Analytics panel that shows:
- Active providers and their status
- Recent events with full payloads
- Event statistics and performance metrics

Access it by adding `?debugger=true` to your URL.

### Console Debugging

```javascript
// In debug mode, access analytics through window.nextDebug
nextDebug.analytics.getStatus();
nextDebug.analytics.track('test_event', { test: true });
nextDebug.analytics.getProviders();
```

## Creating Custom Providers

Implement the `AnalyticsProvider` interface:

```typescript
import { AnalyticsProvider, AnalyticsEvent } from '@/utils/analytics/types';

export class MyCustomProvider implements AnalyticsProvider {
  name = 'mycustom';
  private initialized = false;

  async initialize(): Promise<void> {
    // Initialize your analytics library
    this.initialized = true;
  }

  async track(event: AnalyticsEvent): Promise<void> {
    // Send event to your analytics platform
    await fetch('https://my-analytics.com/track', {
      method: 'POST',
      body: JSON.stringify(event)
    });
  }

  async identify(userId: string, traits?: Record<string, any>): Promise<void> {
    // Identify user in your system
  }

  async page(name?: string, properties?: Record<string, any>): Promise<void> {
    // Track page view
  }

  async reset(): Promise<void> {
    // Clear user data
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  getStatus() {
    return {
      initialized: this.initialized,
      name: this.name
    };
  }
}
```

Register your provider:

```javascript
import { analyticsManager } from '@/utils/analytics';
import { MyCustomProvider } from './MyCustomProvider';

// Add provider during initialization
const provider = new MyCustomProvider();
analyticsManager.addProvider(provider);
```

## Best Practices

1. **Always enable auto-tracking** - Set `analytics.mode: 'auto'` to ensure all ecommerce events are captured
2. **Use standard event names** - Stick to GA4 event names for better cross-platform compatibility
3. **Include context** - Add meaningful properties to events for better analysis
4. **Test in debug mode** - Use `?debugger=true` to verify events are firing correctly
5. **Handle errors gracefully** - Analytics failures shouldn't break your application

## Troubleshooting

### Events not appearing in dataLayer

1. **Ensure GTM script is loaded** - Check that Google Tag Manager script is added to your HTML
2. Check that `analytics.mode: 'auto'` is set in configuration
3. Verify GTM provider is enabled
4. Use the debug overlay to see if events are being tracked
5. Check browser console for warnings about missing dataLayer
6. Verify `window.dataLayer` exists in browser console

### Facebook Pixel events not tracking

1. **Ensure Facebook Pixel script is loaded** - Check that Facebook Pixel script is added to your HTML
2. Verify `window.fbq` exists in browser console
3. Check that Facebook provider is enabled in configuration
4. Look for console warnings about missing fbq function
5. Ensure you've called `fbq('init', 'YOUR_PIXEL_ID')` in your script

### Custom provider not working

1. Ensure provider implements all required methods
2. Check that provider is initialized before tracking
3. Verify provider is added to analytics manager
4. Use try-catch blocks in provider methods

### Performance issues

1. Events are queued and batch processed
2. Providers run asynchronously to avoid blocking
3. Failed events are not retried indefinitely
4. Use sampling for high-volume events

## Migration from Legacy Tracking

If you're migrating from the old tracking system:

```javascript
// Old way (deprecated)
import { tracking } from '@/utils/tracking';
tracking.addToCart(123, 1);

// New way
window.next.trackAddToCart(123, 1);
// or
import { analyticsManager } from '@/utils/analytics';
await analyticsManager.trackAddToCart(123, 1);
```

The old tracking imports will show deprecation warnings but continue to work by delegating to the new analytics system.