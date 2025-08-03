# Attributes Overview

The Next Commerce JS SDK uses HTML data attributes to display dynamic content and control element visibility.

## Types of Attributes

### Display Attributes
Show dynamic data that updates automatically:
```html
<span data-next-display="cart.total">$0.00</span>
```

### Conditional Attributes
Show/hide elements based on conditions:
```html
<div data-next-show="cart.hasItems">Cart has items!</div>
```

### Action Attributes
Trigger actions like adding to cart:
```html
<button data-next-action="add-to-cart" data-next-package-id="1">
  Add to Cart
</button>
```

## Data Sources

Attributes can display data from:
- **Campaign** - Campaign-level information
- **Package** - Product/package details
- **Selection** - Currently selected items
- **Cart** - Shopping cart data
- **Order** - Order confirmation details

## Basic Examples

```html
<!-- Display price -->
<span data-next-display="package.price">$0.00</span>

<!-- Show when cart empty -->
<div data-next-show="cart.isEmpty">Your cart is empty</div>

<!-- Hide when no savings -->
<div data-next-hide="!package.hasSavings">
  Save <span data-next-display="package.savingsPercentage">0%</span>
</div>
```

## Context Awareness

Attributes work within context:

```html
<!-- Within a package context -->
<div data-next-package-id="5">
  <span data-next-display="package.name">Product Name</span>
  <span data-next-display="package.price">$0.00</span>
</div>

<!-- Or with explicit package reference -->
<span data-next-display="package[5].name">Product 5 Name</span>
```

## Learn More

- [Campaign Attributes](campaign.md) - Campaign-level data
- [Package Attributes](package.md) - Product information
- [Selection Attributes](selection.md) - Selected item data
- [Cart Attributes](cart.md) - Shopping cart data
- [Order Attributes](order.md) - Order details
- [Conditionals](conditionals.md) - Show/hide logic
- [Formatting](formatting.md) - Value formatting