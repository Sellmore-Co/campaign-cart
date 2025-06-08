# Campaign Cart Documentation

JavaScript SDK for connecting the 29next API to web pages. Works with Webflow, HTML, or any page builder.

## Documentation Structure

### 📚 Introduction
- [Overview](introduction/overview.md) - What Campaign Cart does
- [Getting Started](introduction/getting-started.md) - Quick setup
- [Core Concepts](introduction/core-concepts.md) - Key concepts

### 🛠️ Guides

#### Features
- [Shopping Cart](guides/features/shopping-cart.md) - Cart management
- [Multi-Currency](guides/features/multi-currency.md) - International support
- [Express Checkout](guides/features/express-checkout.md) - PayPal, Apple Pay, Google Pay
- [Product Profiles](guides/features/product-profiles.md) - Product management
- [Upsells](guides/features/upsells.md) - Post-purchase offers
- [Vouchers & Discounts](guides/features/vouchers.md) - Discount system
- [Receipt Page](guides/features/receipt.md) - Order confirmation
- [Timers](guides/features/timers.md) - Countdown timers
- [Selectors](guides/features/selectors.md) - Product selection

#### Configuration
- [Installation](guides/configuration/installation.md) - Setup methods
- [Basic Configuration](guides/configuration/basic-config.md) - Core settings
- [Advanced Configuration](guides/configuration/advanced-config.md) - All options
- [Events Configuration](guides/configuration/events.md) - Analytics setup

#### Advanced
- [Custom Events](guides/advanced/custom-events.md) - Event system
- [Campaign Overrides](guides/advanced/campaign-overrides.md) - Testing
- [Test Mode](guides/advanced/test-mode.md) - Development testing

### 📖 API Reference
- [JavaScript API](api/javascript-api.md) - Core methods
- [HTML Attributes](api/html-attributes.md) - Data attributes
- [Events Reference](api/events-reference.md) - All events
- [Configuration Options](api/configuration-options.md) - Config reference

### 💡 Examples
- [Basic Implementation](examples/basic-implementation.md)
- [Multi-Currency Setup](examples/multi-currency-setup.md)
- [Custom Checkout](examples/custom-checkout.md)
- [Analytics Integration](examples/analytics-integration.md)

### 📋 Reference
- [Glossary](reference/glossary.md) - Terms and definitions
- [Migration Guide](reference/migration-guide.md) - Version upgrades
- [Troubleshooting](reference/troubleshooting.md) - Common issues

## Quick Start

```html
<script src="https://rtc2.29next.com/campaign-cart/29next.min.js"></script>
<meta name="os-api-key" content="YOUR_API_KEY">
<button data-os-action="toggle-item" data-os-package="1">Add to Cart</button>
```

## Quick Links

- **Setup guide** → [Getting Started](introduction/getting-started.md)
- **API methods** → [JavaScript API](api/javascript-api.md)
- **Multi-currency** → [Multi-Currency Guide](guides/features/multi-currency.md)
- **Analytics** → [Events Configuration](guides/configuration/events.md)

## Version

Documentation for Campaign Cart v2.x