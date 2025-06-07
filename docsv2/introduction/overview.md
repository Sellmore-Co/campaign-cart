# Overview

## What is Campaign Cart?

Campaign Cart is a powerful JavaScript library that connects 29next campaigns with Webflow funnels, providing a complete e-commerce solution with minimal setup. It handles everything from product display to post-purchase upsells.

## Key Features

### 🛒 Shopping Cart
- Real-time cart updates
- Persistent cart across pages
- Mobile-responsive displays
- Line item management

### 💱 Multi-Currency Support
- Automatic country detection
- Smart campaign switching
- Support for USD, CAD, GBP, EUR, AUD
- Currency-specific formatting

### 💳 Multiple Payment Methods
- Credit/Debit cards via Spreedly
- PayPal Express Checkout
- Apple Pay (on supported devices)
- Google Pay (on supported browsers)

### 📦 Product Management
- Semantic product profiles
- Legacy package support
- Bundle configurations
- Dynamic pricing display

### 📈 Advanced Features
- Post-purchase upsells
- Voucher/discount system
- Countdown timers
- Analytics integration
- A/B testing support

## How It Works

1. **Include the Script**: Add Campaign Cart to your pages
2. **Configure**: Set up via meta tags or JavaScript
3. **Add Attributes**: Use HTML data attributes to create interactive elements
4. **Automatic Integration**: Campaign Cart handles the rest

## Architecture

Campaign Cart uses a modular architecture:

```
┌─────────────────┐
│   HTML Page     │
│ (data-29-*)     │
└────────┬────────┘
         │
┌────────▼────────┐
│  Campaign Cart  │
│   JavaScript    │
└────────┬────────┘
         │
┌────────▼────────┐
│ 29next Campaign │
│      API        │
└─────────────────┘
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers

## Next Steps

- [Getting Started](getting-started.md) - Quick setup guide
- [Core Concepts](core-concepts.md) - Understanding the basics
- [Basic Configuration](../guides/configuration/basic-config.md) - Essential settings