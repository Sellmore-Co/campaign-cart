# Getting Started

This guide will help you get Campaign Cart up and running in minutes.

## Prerequisites

- A 29next campaign with API access
- A website or landing page (Webflow, HTML, etc.)
- Basic HTML knowledge

## Quick Start

### Step 1: Include the Script

Add Campaign Cart to your HTML pages:

```html
<script src="https://rtc2.29next.com/campaign-cart/29next.min.js"></script>
```

### Step 2: Add Configuration

Add meta tags to your `<head>`:

```html
<!-- Required: Your campaign API key -->
<meta name="os-api-key" content="YOUR_API_KEY_HERE">

<!-- Required: Your campaign ID -->
<meta name="os-campaign-id" content="YOUR_CAMPAIGN_ID">

<!-- Optional: Default country -->
<meta name="os-default-country" content="US">
```

### Step 3: Create Your First Cart Element

Add a button to add products to cart:

```html
<!-- Add product to cart button -->
<button data-os-action="toggle-item" data-os-package="1">
  Add to Cart
</button>

<!-- Display cart count -->
<span data-os-cart-count>0</span>

<!-- Display cart total -->
<span data-os-cart-total>$0.00</span>
```

### Step 4: Add a Checkout Button

```html
<button os-checkout-payment="combo">
  Proceed to Checkout
</button>
```

That's it! Campaign Cart will automatically initialize and handle all interactions.

## Basic Example

Here's a complete minimal example:

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>My Store</title>
    
    <!-- Campaign Cart Configuration -->
    <meta name="os-api-key" content="YOUR_API_KEY">
    <meta name="os-campaign-id" content="YOUR_CAMPAIGN_ID">
    
    <!-- Include Campaign Cart -->
    <script src="https://rtc2.29next.com/campaign-cart/29next.min.js"></script>
</head>
<body>
    <h1>Welcome to My Store</h1>
    
    <!-- Product -->
    <div>
        <h2>Starter Kit</h2>
        <p>Price: <span data-os-package-price data-os-package-id="1">$0.00</span></p>
        <button data-os-action="toggle-item" data-os-package="1">Add to Cart</button>
    </div>
    
    <!-- Cart Summary -->
    <div>
        <h3>Cart (<span data-os-cart-count>0</span> items)</h3>
        <p>Total: <span data-os-cart-total>$0.00</span></p>
        <button os-checkout-payment="combo">Checkout</button>
    </div>
</body>
</html>
```

## Using Product Profiles (Recommended)

Instead of package IDs, use semantic product profiles:

```html
<!-- Add using product profile -->
<button data-os-action="toggle-item" data-os-profile="starter-kit">
  Add Starter Kit
</button>

<!-- Display profile price -->
<span data-os-profile-price data-os-profile-id="starter-kit">$0.00</span>
```

## Manual Initialization

For more control, initialize manually:

```html
<script>
window.osConfig = {
    apiKey: 'YOUR_API_KEY',
    campaignId: 'YOUR_CAMPAIGN_ID',
    defaultCountry: 'US',
    autoInit: false
};
</script>
<script src="https://rtc2.29next.com/campaign-cart/29next.min.js"></script>
<script>
// Initialize when ready
document.addEventListener('DOMContentLoaded', function() {
    window.twentyNineNext.init();
});
</script>
```

## What's Next?

- [Core Concepts](core-concepts.md) - Understand packages, profiles, and more
- [Shopping Cart Guide](../guides/features/shopping-cart.md) - Advanced cart features
- [Configuration Guide](../guides/configuration/basic-config.md) - All configuration options
- [Examples](../examples/basic-implementation.md) - More implementation examples

## Need Help?

- Check the [Troubleshooting Guide](../reference/troubleshooting.md)
- Review the [API Reference](../api/javascript-api.md)
- Contact support at support@29next.com