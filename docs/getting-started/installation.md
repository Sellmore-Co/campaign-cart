# Installation

Add the Next Commerce JS SDK to your website with a simple script tag and configuration.

## Basic Installation

Add the SDK script and configuration to your HTML page:

```html
<!-- Load SDK -->
<script src="https://campaign-cart-v2.pages.dev/loader.js"></script>

<!-- Campaign API Key -->
<meta name="next-api-key" content="your-api-key-here">

<!-- Next URL After order complete (normally on checkout pages) -->
<meta name="next-next-url" content="/upsell">

<!-- Debug mode (optional) -->
<meta name="next-debug" content="true">

<!-- Page type (optional) -->
<meta name="next-page-type" content="product"> <!-- Can be product, checkout, upsell, receipt -->

<!-- Prevent Back navigation (normally on first upsell page) -->
<meta name="next-prevent-back-navigation" content="true">
```

## Installation Order

1. Add meta tags for configuration
2. Add the SDK script tag
3. SDK will auto-initialize when DOM is ready

## Verifying Installation

Check if the SDK is loaded:

```javascript
// Wait for SDK to be fully initialized
window.addEventListener('next:initialized', function() {
  console.log('SDK is ready');
});
```

## Next Steps

- Configure your [meta tags](configuration.md)
- Follow the [quick start guide](quick-start.md)
- Learn about [cart selectors](../cart-system/selectors.md)