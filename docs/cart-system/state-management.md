# State Management

The Next Commerce JS SDK automatically manages cart state and synchronizes it across all elements.

## Automatic State Sync

All elements displaying cart data automatically update when the cart changes:

```html
<!-- All these update automatically -->
<span data-next-display="cart.total">$0.00</span>
<span data-next-display="cart.quantity">0</span>
<div data-next-show="cart.hasItems">Cart has items!</div>
```

## CSS State Classes

Elements automatically receive CSS classes based on state:

### Toggle Button States
```html
<button data-next-toggle data-next-package-id="5">
  <!-- Gets .next-in-cart class when item is in cart -->
  <!-- Gets .next-active class when toggled on -->
  Add Item
</button>
```

### Container States
```html
<div data-next-package-id="5">
  <!-- Container gets .next-in-cart when package is in cart -->
  <!-- All child elements can use this for styling -->
  <button data-next-toggle>Toggle</button>
  <span>Product Info</span>
</div>
```

### Selector States
```html
<div data-next-selector-card data-next-package-id="1">
  <!-- Gets .next-selected class when selected -->
  Package Option
</div>
```

## State-Based Styling

Use CSS to style based on state:

```css
/* Style selected cards */
.next-selected {
  border: 2px solid blue;
  background: #f0f0ff;
}

/* Style items in cart */
.next-in-cart {
  opacity: 0.6;
}

/* Style active toggle buttons */
button.next-active {
  background: green;
  color: white;
}
```

## Conditional Display

Show/hide elements based on cart state:

```html
<!-- Cart status -->
<div data-next-show="cart.isEmpty">Your cart is empty</div>
<div data-next-show="cart.hasItems">
  You have <span data-next-display="cart.quantity">0</span> items
</div>

<!-- Specific item checks -->
<div data-next-show="cart.hasItem(2)">Package 2 is in your cart</div>

<!-- Value-based conditions -->
<div data-next-show="cart.total > 100">Free shipping unlocked!</div>
```

## Events

Listen to state changes:

```javascript
// Cart updated
next.on('cart:updated', (data) => {
  console.log('Cart updated:', data);
});

// Item added
next.on('cart:item-added', (data) => {
  console.log('Item added:', data);
});

// Item removed
next.on('cart:item-removed', (data) => {
  console.log('Item removed:', data);
});
```

## State Persistence

TODO: Add information about:
- Cart persistence across page loads
- Session management
- Cart expiration
- Cross-tab synchronization

## Best Practices

1. **Use CSS Classes**: Style based on state classes for better UX
2. **Conditional Content**: Show relevant messages based on cart state
3. **Listen to Events**: Trigger analytics or custom logic on state changes
4. **Loading States**: Use data-next-await for initial loading