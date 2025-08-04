# CSS Classes

The Next Commerce JS SDK automatically applies CSS classes to elements based on their state.

## State Classes

### Cart Item States

#### .next-in-cart
Applied to elements when their package is in the cart:

```html
<!-- This button gets .next-in-cart when package 5 is in cart -->
<button data-next-toggle data-next-package-id="5" class="next-in-cart">
  Remove from Cart
</button>

<!-- Parent containers also get the class -->
<div data-next-package-id="5" class="product-card next-in-cart">
  <!-- All children can use this for styling -->
</div>
```

#### .next-active
Applied to toggle buttons when active:

```html
<button data-next-toggle data-next-package-id="5" class="next-active">
  ✓ Added
</button>
```

### Selection States

#### .next-selected
Applied to selected selector cards:

```html
<div data-next-selector-card data-next-package-id="2" class="next-selected">
  Selected Option
</div>
```

#### .next-selector-active
Applied to selector container when it has a selection:

```html
<div data-next-cart-selector class="next-selector-active">
  <!-- Has active selection -->
</div>
```

### Button States

#### .next-disabled
Applied to disabled action buttons:

```html
<!-- Disabled until selection made -->
<button data-next-action="add-to-cart" 
        data-next-selector-id="main" 
        class="next-disabled">
  Add to Cart
</button>
```

## Page States

### .next-display-ready
Applied to `<html>` when SDK is initialized:

```html
<html class="next-display-ready">
  <!-- SDK is loaded and ready -->
</html>
```

Usage:
```css
/* Hide content until ready */
html:not(.next-display-ready) [data-next-display] {
  visibility: hidden;
}
```

### .next-loading
Applied during data loading operations:

```html
<html class="next-loading">
  <!-- SDK is loading data -->
</html>
```

## Loading State Classes

Elements with `data-next-await` get special treatment:

```css
/* Before SDK ready */
html:not(.next-display-ready) [data-next-await] {
  /* Shows loading skeleton */
}

/* After SDK ready */
html.next-display-ready [data-next-await] {
  /* Normal display */
}
```

## Styling Examples

### Toggle Button States

```css
/* Default state */
button[data-next-toggle] {
  background: #007bff;
  color: white;
}

/* When item is in cart */
button[data-next-toggle].next-in-cart {
  background: #28a745;
}

/* Active state */
button[data-next-toggle].next-active {
  background: #dc3545;
}

/* Disabled state */
button.next-disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
```

### Product Card States

```css
/* Product card container */
.product-card {
  border: 1px solid #ddd;
  transition: all 0.3s ease;
}

/* When product is in cart */
.product-card.next-in-cart {
  border-color: #28a745;
  background: #f8fff9;
}

/* Style children based on parent state */
.product-card.next-in-cart .add-button {
  display: none;
}

.product-card.next-in-cart .remove-button {
  display: block;
}
```

### Selector Card States

```css
/* Selector cards */
[data-next-selector-card] {
  border: 2px solid #ddd;
  cursor: pointer;
  transition: all 0.2s ease;
}

/* Hover state */
[data-next-selector-card]:hover {
  border-color: #007bff;
}

/* Selected state */
[data-next-selector-card].next-selected {
  border-color: #007bff;
  background: #e7f3ff;
}

/* Selected indicator */
[data-next-selector-card].next-selected::after {
  content: '✓';
  position: absolute;
  top: 10px;
  right: 10px;
  color: #007bff;
}
```

### Loading States

```css
/* Loading skeleton animation */
[data-next-await]::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
}

@keyframes loading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* Hide skeleton when ready */
html.next-display-ready [data-next-await]::before {
  display: none;
}
```

## Advanced Patterns

### Multi-State Styling

```css
/* Combine multiple states */
.product-card.next-in-cart [data-next-toggle].next-active {
  background: #dc3545;
  color: white;
}

/* Different styles for different pages */
html[data-page-type="checkout"] .next-in-cart {
  /* Checkout-specific styles */
}
```

### Animation on State Change

```css
/* Animate when item added to cart */
@keyframes addedToCart {
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}

.product-card:not(.next-in-cart) {
  animation: none;
}

.product-card.next-in-cart {
  animation: addedToCart 0.3s ease;
}
```

### Responsive State Styling

```css
/* Mobile adjustments */
@media (max-width: 768px) {
  [data-next-selector-card].next-selected {
    border-width: 3px;
  }
  
  button[data-next-toggle].next-active {
    font-size: 14px;
    padding: 10px;
  }
}
```

## Best Practices

1. **Use CSS Classes**: Style based on SDK classes, not attributes
2. **Smooth Transitions**: Add transitions for state changes
3. **Clear Visual Feedback**: Make states obvious to users
4. **Accessibility**: Ensure state changes are perceivable
5. **Performance**: Use CSS transforms over layout changes

## Class Reference Table

| Class | Applied To | When |
|-------|------------|------|
| `.next-in-cart` | Elements with package ID | Package is in cart |
| `.next-active` | Toggle buttons | Toggle is active |
| `.next-selected` | Selector cards | Card is selected |
| `.next-selector-active` | Selector container | Has selection |
| `.next-disabled` | Action buttons | Action unavailable |
| `.next-display-ready` | `<html>` | SDK initialized |
| `.next-loading` | `<html>` | Loading data |