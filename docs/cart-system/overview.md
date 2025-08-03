# Cart System Overview

The Next Commerce JS SDK provides a flexible cart management system using HTML attributes.

## Core Concepts

### Cart Selectors
Interactive product selection components that allow users to choose products before adding to cart.

### Selection Modes
- **Swap Mode**: Clicking a card immediately replaces cart contents
- **Select Mode**: User selects first, then clicks a button to add

### Cart Actions
- Add to cart
- Remove from cart
- Toggle items
- Clear cart
- Update quantities

### State Management
The cart state is automatically synchronized across all elements displaying cart data.

## Key Features

1. **Attribute-Driven**: Build cart functionality using HTML attributes
2. **Real-time Updates**: Cart displays update automatically
3. **Flexible Controls**: Multiple ways to add/remove items
4. **State Classes**: CSS classes automatically applied based on cart state

## Basic Example

```html
<!-- Product selector -->
<div data-next-cart-selector data-next-selection-mode="swap">
  <div data-next-selector-card data-next-package-id="1">
    Product 1
  </div>
  <div data-next-selector-card data-next-package-id="2">
    Product 2
  </div>
</div>

<!-- Cart display -->
<div>
  Total: <span data-next-display="cart.total">$0.00</span>
</div>
```

## Learn More

- [Selectors](selectors.md) - Product selection patterns
- [Buttons](buttons.md) - Add to cart and toggle buttons
- [Quantity Controls](quantity-controls.md) - Managing quantities
- [State Management](state-management.md) - Cart state and persistence