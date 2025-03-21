# Checkout Documentation

This directory contains documentation related to the checkout functionality of the 29next client library.

## Available Guides

- [Address Settings](./Settings.md) - Configure country and state/province dropdowns
- [Google Maps Autocomplete](./GoogleMapsAutocomplete.md) - Implement address autocomplete using Google Maps
- [Spreedly Integration](./Spreedlz.md) - Integrate with Spreedly for payment processing

## Checkout Features Overview

The 29next checkout system provides:

- Address validation and autocomplete
- Flexible payment processing
- Form validation
- Customizable UI components
- Mobile-responsive design
- Internationalization support

## Global Configuration

Most checkout features can be configured via the global `window.osConfig` object:

```javascript
window.osConfig = window.osConfig || {};

// Configure various aspects of checkout
window.osConfig.addressConfig = { /* address configuration */ };
window.osConfig.googleMaps = { /* Google Maps configuration */ };
window.osConfig.spreedlyConfig = { /* Spreedly configuration */ };
```

See individual documentation files for specific configuration options. 