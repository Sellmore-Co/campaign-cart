# Configuration

Configure the Next Commerce JS SDK using meta tags in your HTML head.

## Configuration Options

| Meta Tag | Description | Values |
|-----------|-------------|---------|
| `next-api-key` | Your campaign API key | String |
| `next-next-url` | URL to redirect after order completion | URL path |
| `next-debug` | Enable debug mode | `true`/`false` |
| `next-page-type` | Current page type | `product`, `checkout`, `upsell`, `receipt` |
| `next-prevent-back-navigation` | Prevent browser back button | `true`/`false` |

## Basic Configuration

```html
<!-- Required: Campaign API Key -->
<meta name="next-api-key" content="your-api-key-here">
```

## Page Type Configuration

Set the page type to enable page-specific features:

```html
<!-- Product page -->
<meta name="next-page-type" content="product">

<!-- Checkout page -->
<meta name="next-page-type" content="checkout">

<!-- Upsell page -->
<meta name="next-page-type" content="upsell">

<!-- Receipt/confirmation page -->
<meta name="next-page-type" content="receipt">
```

## Upsell Configuration

Configure upsell flow URLs:

```html
<!-- Upsell URLs -->
<meta name="next-upsell-accept-url" content="/demo/receipt">
<meta name="next-upsell-decline-url" content="/demo/receipt">
```

## Debug Mode

Enable debug mode for development:

```html
<meta name="next-debug" content="true">
```

## Environment-Specific Configuration

TODO: Add information about environment-specific settings