# Loading States

The SDK provides loading states for better UX.

## Basic Usage

Elements with `data-next-await` show loading skeleton:

```html
<!-- Elements with data-next-await show loading skeleton -->
<div data-next-await>
  <span data-next-display="package.name">Loading...</span>
</div>
```

## Loading Skeleton Styles

```css
/* Loading skeleton styles */
html:not(.next-display-ready) [data-next-await] {
  position: relative;
  overflow: hidden;
  border-color: transparent !important;
  box-shadow: none !important;
}

[data-next-await] * {
  opacity: 0;
  transition: opacity 0.2s ease;
}

[data-next-await]::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #e0e0e0;
  animation: pulse-gray 1.5s ease-in-out infinite;
  z-index: 1;
  pointer-events: none;
}

@keyframes pulse-gray {
  0%, 100% {
    background-color: #e0e0e0;
    opacity: 0.6;
  }
  50% {
    background-color: #f5f5f5;
    opacity: 0.8;
  }
}

html.next-display-ready [data-next-await] * {
  opacity: 1;
}

html.next-display-ready [data-next-await]::before {
  display: none;
}
```

## Implementation Examples

### Product Card with Loading State

```html
<div class="product-card" data-next-await>
  <img data-next-display="package.image" alt="" class="product-image">
  <h3 data-next-display="package.name">Loading...</h3>
  <p data-next-display="package.price">$0.00</p>
  <button data-next-action="add-to-cart" data-next-package-id="1">
    Add to Cart
  </button>
</div>
```

### Cart Summary with Loading

```html
<div class="cart-summary" data-next-await>
  <h3>Cart Summary</h3>
  <p>Items: <span data-next-display="cart.quantity">0</span></p>
  <p>Subtotal: <span data-next-display="cart.subtotal">$0.00</span></p>
  <p>Total: <span data-next-display="cart.total">$0.00</span></p>
</div>
```

### Multiple Loading Sections

```html
<!-- Product grid with loading states -->
<div class="product-grid">
  <div class="product" data-next-await data-next-package-id="1">
    <span data-next-display="package.name">Loading...</span>
    <span data-next-display="package.price">$0.00</span>
  </div>
  
  <div class="product" data-next-await data-next-package-id="2">
    <span data-next-display="package.name">Loading...</span>
    <span data-next-display="package.price">$0.00</span>
  </div>
  
  <div class="product" data-next-await data-next-package-id="3">
    <span data-next-display="package.name">Loading...</span>
    <span data-next-display="package.price">$0.00</span>
  </div>
</div>
```

## Custom Loading Styles

### Shimmer Effect

```css
[data-next-await]::before {
  background: linear-gradient(
    90deg,
    #f0f0f0 25%,
    #e0e0e0 50%,
    #f0f0f0 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}
```

### Custom Height Loading Blocks

```css
/* Text line loading */
[data-next-await] span {
  display: inline-block;
  min-height: 1em;
  min-width: 100px;
}

/* Button loading */
[data-next-await] button {
  min-height: 40px;
  min-width: 120px;
}

/* Image loading */
[data-next-await] img {
  min-height: 200px;
  background: #f0f0f0;
}
```

## Advanced Patterns

### Staggered Loading

```css
[data-next-await]:nth-child(1)::before {
  animation-delay: 0s;
}

[data-next-await]:nth-child(2)::before {
  animation-delay: 0.1s;
}

[data-next-await]:nth-child(3)::before {
  animation-delay: 0.2s;
}
```

### Loading State Classes

The SDK adds classes to track loading state:

```javascript
// Check if SDK is ready
if (document.documentElement.classList.contains('next-display-ready')) {
  console.log('SDK has loaded and initialized');
}

// Listen for ready state
window.addEventListener('next:initialized', function() {
  console.log('SDK is ready, loading states removed');
});
```

### Conditional Loading Display

```html
<!-- Show only during loading -->
<div class="loading-message" data-next-hide-when-ready>
  <p>Loading products...</p>
</div>

<!-- Show only after loading -->
<div class="loaded-content" data-next-show-when-ready>
  <p>All products loaded!</p>
</div>
```

## Best Practices

1. **Use Placeholder Text**: Include realistic placeholder content
2. **Match Layout**: Loading skeleton should match final layout
3. **Smooth Transitions**: Fade content in when loaded
4. **Set Min Heights**: Prevent layout shift during loading
5. **Mobile Optimization**: Test loading states on mobile

## Performance Tips

- Apply `data-next-await` only to elements that need it
- Use CSS containment to optimize repaints
- Consider lazy loading for below-fold content
- Preload critical assets

## Troubleshooting

### Loading State Stuck

If loading states don't clear:
1. Check browser console for errors
2. Verify API key is correct
3. Ensure SDK script is loading
4. Check network requests

### Flash of Content

To prevent flash of unstyled content:
```css
/* Hide content initially */
[data-next-display] {
  visibility: hidden;
}

/* Show when ready */
html.next-display-ready [data-next-display] {
  visibility: visible;
}
```