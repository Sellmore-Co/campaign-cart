# Error Monitoring with Sentry

Campaign Cart SDKv v0.2.0 includes built-in support for Sentry error monitoring with full implementation of error-rules.md best practices.

## Features

- **Automatic Error Capture**: Global error handler catches all unhandled errors
- **Performance Monitoring**: Track SDK operations with `Sentry.startSpan`
- **API Call Instrumentation**: All API calls wrapped with performance spans
- **UI Action Tracking**: Button clicks and form submissions tracked
- **Structured Logging**: Full Sentry logger integration
- **Session Replay**: Record user sessions when errors occur (optional)
- **Custom Context**: Automatic SDK metadata attached to all errors
- **Lazy Loading**: Sentry only loads if configured (zero overhead when disabled)

## Configuration

### 1. Basic Setup

Add Sentry configuration to your `window.nextConfig`:

```javascript
window.nextConfig = {
  apiKey: "your-api-key",
  // ... other config
  
  monitoring: {
    sentry: {
      enabled: true,
      dsn: "https://YOUR_SENTRY_DSN@sentry.io/PROJECT_ID",
      environment: "production", // or "staging", "development"
      release: "campaign-cart@0.2.0" // Optional: your version
    }
  }
};
```

### 2. Advanced Configuration

```javascript
monitoring: {
  sentry: {
    enabled: true,
    dsn: "your-dsn",
    environment: "production",
    
    // Performance monitoring (0-1.0)
    tracesSampleRate: 0.1, // 10% of transactions
    
    // Session replay rates
    replaysSessionSampleRate: 0, // No general session recording
    replaysOnErrorSampleRate: 0.5, // 50% replay when errors occur
    
    // Custom error processing
    beforeSend: (event) => {
      // Filter out specific errors
      if (event.exception?.values?.[0]?.value?.includes('ResizeObserver')) {
        return null; // Don't send
      }
      
      // Add custom tags
      event.tags = {
        ...event.tags,
        merchant_tier: 'premium'
      };
      
      return event;
    }
  }
}
```

## What Gets Tracked

### Automatic Context

Every error includes:
- SDK version
- Page URL and type (checkout, upsell, etc.)
- Loaded enhancers
- Merchant ID (first 8 chars of API key)
- Debug mode status
- Browser info

### Performance Spans

1. **API Calls** (Automatic)
   ```javascript
   // Every API call is wrapped with:
   op: 'http.client'
   name: 'GET /api/v1/campaigns/'
   attributes: {
     'http.method': 'GET',
     'http.status_code': 200,
     'http.response.duration': 145.2,
     'http.request.body.size': 256,
     'http.response.body.size': 2048
   }
   ```

2. **UI Actions** (Automatic)
   ```javascript
   // Button clicks tracked with:
   op: 'ui.click'
   name: 'Action Button Click - add-to-cart'
   attributes: {
     'button.action': 'add-to-cart',
     'button.package_id': 123,
     'cart.current_total': 99.99,
     'cart.new_total': 149.99
   }
   ```

3. **Checkout Form** (Automatic)
   ```javascript
   // Form submission tracked with:
   op: 'ui.click'
   name: 'Checkout Form Submit'
   attributes: {
     'checkout.payment_method': 'credit-card',
     'cart.item_count': 3,
     'validation.passed': true,
     'payment.type': 'credit_card'
   }
   ```

### Error Types

1. **JavaScript Errors**
   ```javascript
   // Automatically captured
   throw new Error('Payment failed');
   ```

2. **Promise Rejections**
   ```javascript
   // Automatically captured
   Promise.reject('Network error');
   ```

3. **Console Errors**
   ```javascript
   // Automatically captured via consoleLoggingIntegration
   console.error('Critical error:', details);
   ```

### Manual Error Capture

```javascript
// Via global error handler
window.NextCommerce?.errorHandler?.captureMessage('Custom warning', 'warning');

// With additional context
window.NextCommerce?.errorHandler?.handleError(error, {
  user_action: 'checkout_submit',
  cart_value: 99.99
});

// Add breadcrumbs
window.NextCommerce?.errorHandler?.addBreadcrumb({
  message: 'User clicked checkout',
  category: 'user_action',
  level: 'info',
  data: { cart_items: 3 }
});
```

### Structured Logging (New!)

Following error-rules.md, the SDK now supports Sentry's structured logging:

```javascript
import { sentryLogger } from '@/utils/monitoring/sentryLogger';

// Basic logging
sentryLogger.trace("Starting database connection", { database: "users" });
sentryLogger.debug`Cache miss for user: ${userId}`;
sentryLogger.info("Updated profile", { profileId: 345 });
sentryLogger.warn("Rate limit reached for endpoint", {
  endpoint: "/api/results/",
  isEnterprise: false,
});
sentryLogger.error("Failed to process payment", {
  orderId: "order_123",
  amount: 99.99,
});
sentryLogger.fatal("Database connection pool exhausted", {
  database: "users",
  activeConnections: 100,
});

// Template literal logging with fmt
const userId = 123;
sentryLogger.debug(sentryLogger.fmt`Cache miss for user: ${userId}`);
```

## Performance Monitoring

When `tracesSampleRate` is set, Sentry tracks:

- SDK initialization time
- API request duration
- Enhancer loading time
- Checkout flow performance

Example transaction:
```javascript
// Automatically tracked operations
- sdk.initialize
- api.loadCampaign
- checkout.submitOrder
- analytics.track
```

## Session Replay

Session replay helps debug errors by recording user interactions:

```javascript
monitoring: {
  sentry: {
    enabled: true,
    dsn: "your-dsn",
    
    // Always record when errors occur
    replaysOnErrorSampleRate: 1.0,
    
    // Optionally record random sessions
    replaysSessionSampleRate: 0.01 // 1% of all sessions
  }
}
```

**Privacy**: Sensitive fields are automatically masked:
- Payment information (`[data-next-payment]`)
- CVV fields (`[data-next-cvv]`)
- Password inputs (`[type="password"]`)

## Best Practices

### 1. Environment-Specific Config

```javascript
const isDevelopment = window.location.hostname === 'localhost';

window.nextConfig = {
  monitoring: {
    sentry: {
      enabled: !isDevelopment, // Only in production
      dsn: "your-dsn",
      environment: isDevelopment ? 'development' : 'production',
      tracesSampleRate: isDevelopment ? 1.0 : 0.1
    }
  }
};
```

### 2. Filter Noisy Errors

```javascript
beforeSend: (event) => {
  const error = event.exception?.values?.[0];
  
  // Filter out known non-critical errors
  const ignoredErrors = [
    'ResizeObserver loop limit exceeded',
    'Non-Error promise rejection captured',
    'Network request failed'
  ];
  
  if (ignoredErrors.some(msg => error?.value?.includes(msg))) {
    return null;
  }
  
  return event;
}
```

### 3. Add Business Context

```javascript
// After SDK initialization
window.nextReady.push((sdk) => {
  // Set user context
  sdk.errorHandler?.setUserContext({
    merchant_id: 'MERCH123',
    plan: 'premium'
  });
  
  // Add custom tags
  sdk.errorHandler?.setTags({
    feature_flags: 'express_checkout,new_ui',
    ab_test: 'variant_b'
  });
});
```

## Testing

### 1. Test Error Capture

```javascript
// Open browser console and run:
window.NextCommerce?.errorHandler?.captureMessage('Test error from console', 'error');

// Or trigger an actual error:
throw new Error('Test error - please ignore');
```

### 2. Verify in Sentry Dashboard

1. Go to your Sentry project
2. Check "Issues" for the test error
3. Verify context data is attached
4. Check "Performance" for transactions

## Troubleshooting

### Sentry Not Initializing

1. Check browser console for errors
2. Verify DSN is correct
3. Ensure `enabled: true` is set

### Missing Context

```javascript
// Debug what's being sent
monitoring: {
  sentry: {
    beforeSend: (event) => {
      console.log('Sentry event:', event);
      return event;
    }
  }
}
```

### Performance Impact

- Sentry is lazy-loaded (doesn't block SDK init)
- Use lower sample rates in production
- Session replay has the highest overhead

## Security Notes

1. **Never log sensitive data** - The SDK automatically masks payment fields
2. **Use environment variables** for DSN in your build process
3. **Sanitize user data** in beforeSend if needed
4. **Review Sentry's data retention** policies

## Example: Full Production Config

```javascript
window.nextConfig = {
  apiKey: "your-campaign-cart-api-key",
  debug: false,
  
  // ... other config ...
  
  monitoring: {
    sentry: {
      enabled: true,
      dsn: "https://abc123@o4506714009419776.ingest.sentry.io/4506714009485312",
      environment: "production",
      release: "campaign-cart@0.2.0",
      
      // Low sample rate for production
      tracesSampleRate: 0.05, // 5% performance monitoring
      
      // Session replay only on errors
      replaysSessionSampleRate: 0,
      replaysOnErrorSampleRate: 0.25, // 25% of error sessions
      
      // Custom processing
      beforeSend: (event) => {
        // Add business context
        event.tags = {
          ...event.tags,
          checkout_flow: 'express',
          merchant_tier: 'premium'
        };
        
        // Filter noise
        if (event.exception?.values?.[0]?.value?.includes('ResizeObserver')) {
          return null;
        }
        
        return event;
      }
    }
  }
};
```

This configuration provides comprehensive error tracking while maintaining performance and privacy.