# Getting Started

[← Back to Overview](overview.md) | [Core Concepts →](core-concepts.md)

## Basic Setup

Add this to any HTML page:

```html
<!DOCTYPE html>
<html>
<head>
    <!-- API Configuration -->
    <meta name="os-api-key" content="YOUR_API_KEY">
    <meta name="os-campaign-id" content="YOUR_CAMPAIGN_ID">
    
    <!-- Include SDK -->
    <script src="https://rtc2.29next.com/campaign-cart/29next.min.js"></script>
</head>
<body>
    <!-- Product -->
    <button data-os-action="toggle-item" data-os-package="1">
        Add Starter Kit - $97
    </button>
    
    <!-- Cart Display -->
    <div>
        Cart: <span data-os-cart-count>0</span> items
        Total: <span data-os-cart-total>$0.00</span>
    </div>
    
    <!-- Checkout -->
    <button os-checkout-payment="combo">Checkout</button>
</body>
</html>
```

Replace `YOUR_API_KEY` and `YOUR_CAMPAIGN_ID` with your actual values.

## Using Product Profiles (Recommended)

Instead of package IDs, use semantic profiles:

```html
<!-- Better: semantic names -->
<button data-os-action="toggle-item" data-os-profile="starter-kit">
    Add Starter Kit
</button>

<!-- Auto-populate price from profile -->
<span data-os-profile-price data-os-profile-id="starter-kit">Loading...</span>
```

[Setup Product Profiles →](../guides/features/product-profiles.md)

## Manual Initialization

For more control:

```html
<script>
window.osConfig = {
    apiKey: 'YOUR_API_KEY',
    campaignId: 'YOUR_CAMPAIGN_ID',
    autoInit: false
};
</script>
<script src="https://rtc2.29next.com/campaign-cart/29next.min.js"></script>
<script>
// Initialize when ready
window.twentyNineNext.init();
</script>
```

## Configuration

The basic setup uses meta tags for the API key and campaign ID. For all other options, including JavaScript configuration and currency settings, see the [Basic Configuration Guide](../guides/configuration/basic-config.md).

## Configuration Options

Add these meta tags as needed:

```html
<!-- Currency/Location -->
<meta name="os-default-country" content="US">
<meta name="os-default-currency" content="USD">

<!-- Checkout Pages -->
<meta name="os-next-page" content="/thank-you">

<!-- Google Places API -->
<meta name="google-places-api-key" content="YOUR_GOOGLE_KEY">
```

## What's Next?

**Essential reading:**
- [Core Concepts](core-concepts.md) - Packages vs profiles, cart basics
- [Shopping Cart Guide](../guides/features/shopping-cart.md) - Cart features
- [HTML Attributes Reference](../api/html-attributes.md) - All data attributes

**Popular features:**
- [Multi-Currency](../guides/features/multi-currency.md) - International support
- [Express Checkout](../guides/features/express-checkout.md) - PayPal, Apple Pay
- [Discount Codes](../guides/features/vouchers.md) - Vouchers and discounts

**Examples:**
- [Live Cart Demo](../examples/basic-cart.html) - Interactive example
- [Checkout Form](../examples/checkout-form.html) - Complete checkout
- [More Examples](../examples/basic-implementation.md) - Additional patterns