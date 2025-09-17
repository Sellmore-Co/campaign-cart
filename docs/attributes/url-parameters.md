# URL Parameters

URL parameters provide a powerful way to control element visibility and behavior based on query string values. Parameters are captured when the SDK initializes and persist throughout the user's session.

## Overview

The URL parameter system allows you to:
- Control element visibility based on URL parameters
- Store parameters across the entire session (even when navigating between pages)
- Override stored parameters with new values from subsequent page loads
- Use parameters in conditional display logic

## How It Works

1. **Parameter Capture**: When the SDK initializes, all URL parameters are automatically captured and stored in sessionStorage
2. **Session Persistence**: Parameters remain available throughout the user's session, even when navigating to pages without those parameters
3. **Parameter Override**: If a user visits a new page with different parameter values, the new values override the stored ones
4. **Conditional Display**: Use `data-next-show` and `data-next-hide` attributes to show/hide elements based on parameter values

## Basic Usage

### Hiding Elements Based on Parameters

```html
<!-- Hide element when ?seen=n is in the URL -->
<div data-next-hide="param.seen == 'n'">
  As seen on TV section
</div>

<!-- Hide timer when ?timer=n -->
<div data-next-hide="param.timer == 'n'">
  <div data-next-timer="countdown">00:00:00</div>
</div>

<!-- Hide reviews when ?reviews=n -->
<div data-next-hide="param.reviews == 'n'">
  Customer testimonials...
</div>
```

### Showing Elements Based on Parameters

```html
<!-- Show message only when ?debug=true -->
<div data-next-show="param.debug == 'true'">
  Debug mode is enabled
</div>

<!-- Show alternate content when banner is disabled -->
<div data-next-show="param.banner == 'n'">
  Simple header without promotional banner
</div>
```

## Supported Conditions

### Equality Checks

```html
<!-- Exact match -->
<div data-next-show="param.mode == 'advanced'">
  Advanced options
</div>

<!-- Not equal -->
<div data-next-hide="param.theme != 'dark'">
  Dark theme styles
</div>
```

### Existence Checks

```html
<!-- Check if parameter exists (regardless of value) -->
<div data-next-show="param.preview">
  Preview mode active
</div>

<!-- Hide if parameter doesn't exist -->
<div data-next-hide="!param.authenticated">
  Login required message
</div>
```

### Numeric Comparisons

```html
<!-- Numeric comparisons -->
<div data-next-show="param.quantity > 5">
  Bulk discount available!
</div>

<div data-next-hide="param.age < 18">
  Age-restricted content
</div>
```

## Common Use Cases

### 1. Feature Flags

Control which features are visible to users:

```html
<!-- Exit intent popup -->
<div data-next-hide="param.exit == 'n'">
  <div data-next-exit-intent>
    Special offer before you leave!
  </div>
</div>

<!-- Loading animations -->
<div data-next-hide="param.loading == 'n'">
  <div class="loading-bar">Loading...</div>
</div>
```

### 2. A/B Testing

Show different variations based on parameters:

```html
<!-- Version A -->
<div data-next-show="param.variant == 'a'">
  <button>Buy Now</button>
</div>

<!-- Version B -->
<div data-next-show="param.variant == 'b'">
  <button>Get Started Today</button>
</div>
```

### 3. Development/Testing

Show debug information or test elements:

```html
<!-- Debug panel -->
<div data-next-show="param.debug == 'true'">
  <pre>Cart State: <span data-next-display="cart.debug"></span></pre>
</div>

<!-- Test mode indicators -->
<div data-next-show="param.test == 'true'" style="background: yellow; padding: 10px;">
  TEST MODE - Orders will not be processed
</div>
```

### 4. Marketing Campaigns

Customize content based on campaign parameters:

```html
<!-- Show campaign-specific banner -->
<div data-next-show="param.campaign == 'summer2024'">
  Summer Sale - 50% Off Everything!
</div>

<!-- Hide regular pricing for special offers -->
<div data-next-hide="param.special == 'vip'">
  Regular pricing section
</div>
<div data-next-show="param.special == 'vip'">
  VIP exclusive pricing!
</div>
```

## Advanced Features

### Combining with Other Conditions

URL parameters can be combined with other conditional logic:

```html
<!-- Show only if parameter is set AND cart has items -->
<div data-next-show="param.upsell == 'true' && cart.hasItems">
  Special upsell offer for existing customers!
</div>

<!-- Different messages based on parameter and profile -->
<div data-next-show="param.member == 'gold' && profile.active == 'premium'">
  Gold + Premium member exclusive content
</div>
```

### Parameter Priority

When the same parameter appears multiple times:
1. URL parameters on the current page have highest priority
2. Previously stored session parameters are used as fallback
3. New parameter values override old ones

Example flow:
```
Page 1: ?banner=n&theme=dark
  → Stores: banner=n, theme=dark

Page 2: ?theme=light
  → Updates: theme=light
  → Keeps: banner=n

Page 3: (no parameters)
  → Uses stored: banner=n, theme=light
```

## JavaScript API

URL parameters can also be managed programmatically using the SDK's JavaScript API. This allows you to set, get, and clear parameters without modifying the URL.

For complete API documentation, see [URL Parameters API Reference](../api-reference/url-parameters.md).

### Quick Examples

```javascript
// Set parameters programmatically
next.setParam('banner', 'n');
next.setParams({ timer: 'n', reviews: 'n' });

// Check and get parameters
if (next.hasParam('debug')) {
  const debugValue = next.getParam('debug');
}

// Clear parameters
next.clearParam('timer');
```

## Debugging

### View Current Parameters

To debug stored parameters, open the browser console and run:

```javascript
// View all stored parameters (debug method)
nextDebug.stores.parameter().debug()

// Or using the SDK
const params = next.getAllParams();
console.log('Current parameters:', params);

// Check specific parameter
nextDebug.stores.parameter().getParam('seen')

// Check if parameter exists
nextDebug.stores.parameter().hasParam('timer')
```

### Common Issues

1. **Parameters not persisting**: Check that sessionStorage is not being cleared
2. **Wrong values**: Remember that URL parameters override stored values
3. **Case sensitivity**: Parameter names are case-sensitive (`param.Test` ≠ `param.test`)
4. **Webflow removes quotes**: Webflow may strip quotes from attribute values. Both formats work:
   - With quotes: `data-next-hide="param.timer == 'n'"`
   - Without quotes: `data-next-hide="param.timer==n"` (Webflow format)
   - The SDK automatically handles unquoted values for param comparisons

## Best Practices

1. **Use descriptive parameter names**: `hideReviews` is better than `hr`
2. **Be consistent with values**: Use 'true'/'false' or 'y'/'n' consistently
3. **Document your parameters**: Keep a list of all parameters your site uses
4. **Consider security**: Don't use parameters for sensitive features without proper validation
5. **Test thoroughly**: Test parameter behavior across page navigation

## Implementation Reference

The URL parameter system consists of three main components:

1. **Parameter Store** (`src/stores/parameterStore.ts`): Manages parameter storage and retrieval
2. **SDK Initializer** (`src/enhancers/core/SDKInitializer.ts`): Captures parameters on page load
3. **Conditional Display Enhancer** (`src/enhancers/display/ConditionalDisplayEnhancer.ts`): Evaluates parameter conditions

## Examples from parameters.md

Based on your requirements, here are the implemented examples:

```html
<!-- Block exit intent coupon -->
<div data-next-hide="param.exit == 'n'">
  <div data-next-exit-intent>Coupon popup content</div>
</div>

<!-- Block countdown timers -->
<div data-next-hide="param.timer == 'n'">
  <div data-next-timer>00:00:00</div>
</div>

<!-- Hide reviews/testimonials -->
<div data-next-hide="param.reviews == 'n'">
  Customer reviews section
</div>

<!-- Hide loading bars -->
<div data-next-hide="param.loading == 'n'">
  <div class="loading-animation">Loading...</div>
</div>

<!-- Remove promotional banners -->
<div data-next-hide="param.banner == 'n'">
  Promotional banner content
</div>

<!-- Hide "As seen on" section -->
<div data-next-hide="param.seen == 'n'">
  As seen on TV/Media logos
</div>
```

## Summary

URL parameters provide a flexible, session-persistent way to control element visibility and customize user experience without modifying code. They're perfect for testing, feature flags, marketing campaigns, and creating dynamic, personalized experiences.