---
title: Overview
description: Introduction to Campaign Cart - A JavaScript SDK for e-commerce integration
---

## What is Campaign Cart?

A JavaScript SDK that connects the 29next API to web pages through HTML attributes. Works with Webflow, custom HTML, or any page builder.

## Features

### Shopping Cart
- Add/remove/update cart items
- Persistent cart across pages
- Real-time price calculations
- Mobile responsive

### Payments
- Credit cards via Spreedly
- PayPal Express
- Apple Pay (Safari)
- Google Pay (Chrome)

### Multi-Currency
- Auto-detect user country
- Switch campaigns by currency
- Supports USD, CAD, GBP, EUR, AUD
- Localized price formatting

### Products
- Package IDs (legacy)
- Product profiles (recommended)
- Bundle configurations
- Dynamic pricing

### Additional
- Post-purchase upsells
- Discount codes
- Countdown timers
- Analytics events
- A/B testing

## How it works

1. Include the script
2. Add meta tags for API keys
3. Use HTML attributes on buttons/elements
4. SDK handles API calls and interactions

## Architecture

```
HTML Page (data-os-* attributes)
         ↓
Campaign Cart JavaScript
         ↓
29next Campaign API
```

## Browser requirements

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Next Steps

- [Getting Started](getting-started.md) - Setup guide
- [Core Concepts](core-concepts.md) - Key concepts
- [Basic Configuration](../guides/configuration/basic-config.md) - Configuration options