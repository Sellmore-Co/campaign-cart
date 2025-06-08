# 29next Campaign Cart

A JavaScript SDK for connecting the 29next API to your page builder.

## Quick Setup

Add to any HTML page:

```html
<script src="https://rtc2.29next.com/campaign-cart/29next.min.js"></script>
<meta name="os-api-key" content="YOUR_API_KEY">
<meta name="os-campaign-id" content="YOUR_CAMPAIGN_ID">

<!-- Add products to cart -->
<button data-os-action="toggle-item" data-os-package="1">Add to Cart</button>

<!-- Show cart info -->
<span data-os-cart-count>0</span> items
<span data-os-cart-total>$0.00</span>

<!-- Checkout -->
<button os-checkout-payment="combo">Checkout</button>
```

That's it. Works with Webflow, HTML, or any page builder.

[View Live Demo →](/examples/basic-cart.html) | [Complete Setup →](/introduction/getting-started)

## What it handles

- Shopping cart with add/remove/update
- Multi-currency (USD, CAD, GBP, EUR, AUD)
- Checkout forms with validation
- PayPal, Apple Pay, Google Pay
- Post-purchase upsells
- Discount codes

## Architecture

Built with 16+ specialized managers:
- **CartManager** - Cart operations
- **CheckoutManager** - Checkout forms  
- **PaymentHandler** - Payment processing
- **CurrencyManager** - Multi-currency
- **EventManager** - Analytics integration

## Browser support

Chrome, Firefox, Safari, Edge (latest versions)

[Documentation →](/introduction/overview) | [Examples →](/examples/basic-implementation)