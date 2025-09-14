# Next Commerce JS SDK Documentation

Welcome to the Next Commerce JS SDK documentation. This SDK enables developers to create e-commerce storefront experiences using HTML attributes, JavaScript, and CSS.

## Quick Start

```html
<!-- Load SDK -->
<script src="https://campaign-cart-v2.pages.dev/loader.js"></script>

<!-- Campaign API Key -->
<meta name="next-api-key" content="your-api-key-here">
```

## Features

- **Attribute-driven architecture** - Build cart functionality with HTML attributes
- **Cart management** - Add to cart, selectors, quantity controls
- **Profile-based pricing** - Dynamic package mapping for different pricing tiers
- **Post-purchase upsells** - Maximize order value with upsell flows
- **Dynamic content** - Display prices, totals, and product data
- **Conversion tools** - FOMO notifications and exit intent popups

## Documentation Structure

### Getting Started
- [Installation](getting-started/installation.md) - Setup and configuration
- [Configuration](getting-started/configuration.md) - Meta tags and options
- [Quick Start](getting-started/quick-start.md) - Basic examples
- [URL Parameters](getting-started/url-parameters.md) - forcePackageId and ref_id
- [Troubleshooting](getting-started/troubleshooting.md) - Common issues

### Core Features
- [Cart System](cart-system/overview.md) - Cart management and controls
  - [Selectors](cart-system/selectors.md) - Product selection patterns
  - [Buttons](cart-system/buttons.md) - Add to cart and toggle buttons
  - [Quantity Controls](cart-system/quantity-controls.md) - Managing quantities
  - [State Management](cart-system/state-management.md) - Cart state and persistence

- [Upsells](upsells/overview.md) - Post-purchase upsell flows
  - [Direct Upsells](upsells/direct-upsells.md) - Simple yes/no offers
  - [Selection Upsells](upsells/selection-upsells.md) - Multiple choice offers
  - [Quantity Upsells](upsells/quantity-upsells.md) - Quantity-based offers
  - [Configuration](upsells/configuration.md) - Advanced upsell settings

- [Attributes](attributes/overview.md) - Display and conditional attributes
  - [Campaign](attributes/campaign.md) - Campaign-level data
  - [Package](attributes/package.md) - Product information  
  - [Selection](attributes/selection.md) - Selected item data
  - [Cart](attributes/cart.md) - Shopping cart data
  - [Order](attributes/order.md) - Order details
  - [Conditionals](attributes/conditionals.md) - Show/hide logic
  - [Formatting](attributes/formatting.md) - Value formatting

- [Utilities](utilities/fomo.md) - FOMO and exit intent tools
  - [FOMO](utilities/fomo.md) - Social proof notifications
  - [Exit Intent](utilities/exit-intent.md) - Exit intent popups
  - [Loading States](utilities/loading-states.md) - Loading skeletons
  - [Analytics](utilities/analytics.md) - Event tracking
  - [Debugger](utilities/debugger.md) - Debug mode and overlay

### Reference
- [API Reference](api-reference/methods.md) - JavaScript methods and events
  - [Methods](api-reference/methods.md) - JavaScript API methods
  - [Events](api-reference/events.md) - SDK event system
  - [Data Attributes](api-reference/data-attributes.md) - Complete attribute reference
  - [CSS Classes](api-reference/css-classes.md) - Automatic CSS classes

- [Examples](examples/basic-product-page.md) - Complete implementations
  - [Basic Product Page](examples/basic-product-page.md) - Simple product page
  - [Checkout Page](examples/checkout-page.md) - Checkout implementation
  - [Upsell Flow](examples/upsell-flow.md) - Multi-step upsells
  - [Subscription Products](examples/subscription-products.md) - Recurring products
  - [Advanced Customization](examples/advanced-customization.md) - Complex scenarios

- [Guides](guides/best-practices.md) - Best practices and optimization
  - [Profiles](guides/profiles.md) - Dynamic package mapping system
  - [Migration](guides/migration.md) - Upgrading from older versions
  - [Best Practices](guides/best-practices.md) - Recommended patterns
  - [Performance](guides/performance.md) - Optimization tips
  - [Accessibility](guides/accessibility.md) - A11y considerations

## Browser Support

The SDK supports all modern browsers including Chrome, Firefox, Safari, and Edge.

## Quick Examples

### Add to Cart Button
```html
<button data-next-action="add-to-cart" 
        data-next-package-id="1"
        data-next-quantity="1">
  Add to Cart
</button>
```

### Product Selector
```html
<div data-next-cart-selector data-next-selection-mode="swap">
  <div data-next-selector-card data-next-package-id="1">Option 1</div>
  <div data-next-selector-card data-next-package-id="2">Option 2</div>
</div>
```

### Display Cart Total
```html
<span data-next-display="cart.total">$0.00</span>
```

### Conditional Display
```html
<div data-next-show="cart.hasItems">
  <button onclick="checkout()">Proceed to Checkout</button>
</div>
```

## Support

For issues or questions, visit our support documentation or contact our team.