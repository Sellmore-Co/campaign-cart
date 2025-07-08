# Event Tracking Configuration

The EventManager component supports configuring which events are tracked by analytics platforms such as Google Tag Manager, Facebook Pixel, and Google Analytics 4.

## Basic Setup

To configure event tracking, add a script tag before loading the application scripts:

```html
<script>
  // Initialize required global objects
  window.dataLayer = window.dataLayer || [];
  window.osConfig = window.osConfig || {};
  
  // Configure disabled events here...
</script>

<!-- Load your application scripts after the configuration -->
<script src="/path/to/your/app.js" defer></script>
```

## Disabling Specific Events

You can disable specific events across all platforms or only for specific platforms:

```javascript
// Configure which events to disable (array format)
window.osConfig.disabledEvents = [
  'purchase',              // Disable all purchase events across all platforms
  'fbPixel:add_to_cart',   // Disable only Facebook Pixel add_to_cart events
  'gtm:begin_checkout'     // Disable only GTM begin_checkout events
];
```

### Alternative Object Format

You can also use an object format to more explicitly enable/disable events:

```javascript
window.osConfig.disabledEvents = {
  'purchase': true,           // Disable all purchase events
  'fbPixel:add_to_cart': true, // Disable FB Pixel add_to_cart
  'view_item': false          // Explicitly enable view_item (default is enabled)
};
```

## Disabling Entire Platforms

If you want to disable an entire platform:

```javascript
window.osConfig.disabledPlatforms = {
  'fbPixel': true,  // Disable all Facebook Pixel events
  'gtm': false,     // Keep Google Tag Manager enabled (default)
  'ga4': true       // Disable all Google Analytics 4 events
};
```

## Supported Event Names

The following event names are supported:

- `view_item_list` - Fired when a list of products is viewed
- `view_item` - Fired when a single product is viewed
- `add_to_cart` - Fired when a product is added to the cart
- `begin_checkout` - Fired when the checkout process begins
- `purchase` - Fired when a purchase is completed

## TODO: Event Implementation Status

- Facebook Pixel implementation for `begin_checkout` is currently missing. The EventManager needs to be updated to include this event in the Facebook Pixel switch statement.
- Need to verify if all events are properly disabled when using platform-specific disabling like `gtm:begin_checkout`.

## Supported Platforms

The following platforms are supported:

- `gtm` - Google Tag Manager
- `fbPixel` - Facebook Pixel
- `ga4` - Google Analytics 4

## Programmatically Controlling Events

You can also programmatically control events in your JavaScript code:

```javascript
// Disable a specific event
app.events.disableEvent('purchase');

// Disable a platform-specific event
app.events.disableEvent('fbPixel:add_to_cart');

// Re-enable an event
app.events.enableEvent('purchase');

// Get a list of all disabled events
const disabledEvents = app.events.getDisabledEvents();
``` 