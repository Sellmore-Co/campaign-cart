# Next URL Handling

This document describes the implementation and usage of the next URL handling mechanism in Campaign Cart, along with recent refactoring changes.

## Overview

The next URL feature allows for automatic redirection to subsequent pages in a sales funnel after order completion. The system follows a clear priority to determine where users should be redirected after payment.

## Implementation

### URL Priority

When determining the redirect URL after successful order completion, the system follows this priority:

1. `payment_complete_url` from API response (highest priority)
2. `os-next-page` meta tag value
3. `order_status_url` from API response (fallback)

### Meta Tag Implementation

Add the meta tag to your checkout page:

```html
<!-- Set next page for redirects after payment -->
<meta name="os-next-page" content="/upsell1">
```

The `content` attribute can use either:
- A relative path (e.g., `/upsell1`)
- An absolute URL (e.g., `https://yourdomain.com/upsell1`)

## Recent Refactoring

The handling of next URL logic was recently refactored to eliminate code duplication and improve maintainability.

### Key Changes

1. **Centralized URL Logic**: All next URL handling is now managed by the `ApiClient` class.
2. **Utility Method**: The `getNextPageUrlFromMeta(refId)` method was added to `ApiClient` to extract and format URLs from meta tags.
3. **Eliminated Duplications**: Removed redundant URL handling code from the `PaymentHandler` class.
4. **Removed Default Path**: Eliminated the default path (`/checkout/complete`) to ensure proper use of API-provided fallbacks.

### Before Refactoring

Previously, both `ApiClient.js` and `PaymentHandler.js` contained similar code for:
- Reading the `os-next-page` meta tag
- Converting relative paths to absolute URLs
- Adding reference IDs to the URL
- Fallback handling

### After Refactoring

The code now follows a cleaner architecture:

#### `ApiClient.js`

```javascript
// Utility method for getting next page URL from meta tag
getNextPageUrlFromMeta(refId = null) {
  const metaTag = document.querySelector('meta[name="os-next-page"]');
  if (!metaTag || !metaTag.content) {
    return null;
  }

  let nextUrl = metaTag.content;
  
  // If URL doesn't start with http or /, assume it's a relative path
  if (!nextUrl.startsWith('http') && !nextUrl.startsWith('/')) {
    nextUrl = `/${nextUrl}`;
  }
  
  // Create absolute URL if relative path
  if (!nextUrl.startsWith('http')) {
    nextUrl = `${window.location.origin}${nextUrl}`;
  }
  
  // Add ref_id as query parameter if provided
  if (refId) {
    const urlObj = new URL(nextUrl);
    urlObj.searchParams.append('ref_id', refId);
    nextUrl = urlObj.toString();
  }
  
  return nextUrl;
}

// Get next URL from order response
getNextUrlFromOrderResponse(orderData) {
  // First priority: payment_complete_url if available
  if (orderData && orderData.payment_complete_url) {
    this.debug('Using payment_complete_url for redirect');
    return orderData.payment_complete_url;
  }
  
  // Second priority: next page from meta tag
  const metaNextUrl = this.getNextPageUrlFromMeta(
    orderData && orderData.ref_id ? orderData.ref_id : null
  );
  
  if (metaNextUrl) {
    this.debug('Using os-next-page meta tag for redirect');
    return metaNextUrl;
  }
  
  // Final fallback: order_status_url
  if (orderData && orderData.order_status_url) {
    this.debug('Using order_status_url for redirect');
    return orderData.order_status_url;
  }
  
  this.warn('No redirect URL found! Falling back to order status URL');
  return orderData && orderData.order_status_url 
    ? orderData.order_status_url 
    : '/';
}
```

#### `PaymentHandler.js`

```javascript
// Format order data for submission
#formatOrderData(orderData = {}) {
  // Get success_url from ApiClient
  const successUrl = window.ApiClient 
    ? window.ApiClient.getNextPageUrlFromMeta(orderData.ref_id)
    : null;

  // Set success_url if available
  if (successUrl) {
    orderData.success_url = successUrl;
    this.debug('Setting success_url:', successUrl);
  }
  
  // Rest of the method...
}

// Get redirect URL after order completion
#getRedirectUrl(orderData) {
  // Use ApiClient to determine redirect URL
  if (window.ApiClient) {
    return window.ApiClient.getNextUrlFromOrderResponse(orderData);
  }
  
  // Fallback implementation if ApiClient not available...
}
```

## Benefits of the Refactoring

1. **Eliminated Duplication**: Removed duplicate code from multiple classes.
2. **Single Source of Truth**: All URL handling logic is centralized in `ApiClient`.
3. **Improved Maintainability**: Future changes to URL handling only need to be made in one place.
4. **Consistent Behavior**: All redirect logic follows the same priority rules.
5. **Proper Fallbacks**: Uses API-provided URLs when no meta tag is present.

## Usage Examples

### Basic Implementation

```html
<!-- Set next page for redirects after payment -->
<meta name="os-next-page" content="/upsell1">
```

### With Query Parameters

```html
<!-- Include query parameters -->
<meta name="os-next-page" content="/upsell1?discount=true">
```

### With Full URL

```html
<!-- Use absolute URL -->
<meta name="os-next-page" content="https://example.com/special-offer">
```

## Testing Next URL Handling

To test the next URL handling:

1. Add the `os-next-page` meta tag to your checkout page
2. Complete a test purchase
3. Verify you are redirected to the specified page
4. Check console logs for any warnings or errors

You can also manually test the URL generation in the browser console:

```javascript
// Test meta tag URL generation
window.ApiClient.getNextPageUrlFromMeta('12345');

// Test full redirect URL resolution with mock order data
window.ApiClient.getNextUrlFromOrderResponse({
  ref_id: '12345',
  payment_complete_url: null,
  order_status_url: 'https://example.com/order/12345'
});
```

## Troubleshooting

### Common Issues

- **Meta tag not detected**: Ensure the meta tag has the exact name `os-next-page`
- **URL not forming correctly**: Check for proper URL format in the meta tag content
- **Query parameters getting lost**: For complex URLs, use URL encoding
- **No redirection occurring**: Check browser console for errors 