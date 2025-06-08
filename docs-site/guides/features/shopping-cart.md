# Shopping Cart Guide

Complete guide to implementing and customizing the shopping cart functionality.

## Overview

Campaign Cart provides a full-featured shopping cart that:
- Persists across page loads
- Syncs with the 29next API
- Updates in real-time
- Supports multiple display formats

## Basic Implementation

### Adding Items to Cart

#### Using Packages
```html
<!-- Toggle button (add/remove) -->
<button data-os-action="toggle-item" data-os-package="1">Add to Cart</button>

<!-- With quantity -->
<button data-os-action="toggle-item" data-os-package="1" data-os-quantity="2">
  Add 2 Units
</button>

<!-- With JavaScript -->
<script>
window.twentyNineNext.addToCart(1);
window.twentyNineNext.addToCart(1, 2); // Add 2 units
</script>
```

#### Using Product Profiles
```html
<!-- Toggle button -->
<button data-os-action="toggle-item" data-os-profile="starter-kit">
  Add Starter Kit
</button>

<!-- With JavaScript -->
<script>
window.twentyNineNext.profiles.addToCart('starter-kit');
</script>
```

### Displaying Cart Information

#### Cart Count
```html
<span data-os-cart-count>0</span>
```

#### Cart Total
```html
<span data-os-cart-total>$0.00</span>
```

#### Full Cart Display
```html
<div data-os-cart="summary">
  <!-- Cart items will be rendered here -->
</div>
```

## Advanced Cart Display

### Custom Cart Template

Create a custom cart display:

```html
<div id="custom-cart">
  <!-- Your custom template -->
</div>

<script>
document.addEventListener('cart.updated', (event) => {
  const cart = event.detail;
  const customCart = document.getElementById('custom-cart');
  
  customCart.innerHTML = cart.items.map(item => `
    <div class="cart-item">
      <img src="${item.image}" alt="${item.name}">
      <h4>${item.name}</h4>
      <p>${item.quantity} × ${item.formattedPrice}</p>
      <button onclick="window.twentyNineNext.removeFromCart(${item.id})">
        Remove
      </button>
    </div>
  `).join('');
});
</script>
```

### Mobile-Responsive Cart

```html
<div class="cart-container">
  <!-- Mobile view -->
  <div data-os-mobile-only class="mobile-cart">
    <div data-os-cart-count>0</div>
    <span data-os-cart-total>$0.00</span>
  </div>
  
  <!-- Desktop view -->
  <div data-os-desktop-only class="desktop-cart">
    <h3>Shopping Cart</h3>
    <div data-os-cart="summary"></div>
    <div class="cart-summary">
      <p>Items: <span data-os-cart-count>0</span></p>
      <p>Total: <span data-os-cart-total>$0.00</span></p>
    </div>
  </div>
</div>
```

## Cart Operations

### Managing Quantities

```javascript
// Update quantity
window.twentyNineNext.updateQuantity(packageId, newQuantity);

// Increment
const current = window.twentyNineNext.getCart().items.find(i => i.id === 1);
window.twentyNineNext.updateQuantity(1, current.quantity + 1);

// Decrement
window.twentyNineNext.updateQuantity(1, Math.max(0, current.quantity - 1));
```

### Bulk Operations

```javascript
// Add multiple items
async function addMultipleItems() {
  await window.twentyNineNext.addToCart(1);
  await window.twentyNineNext.addToCart(2);
  await window.twentyNineNext.profiles.addToCart('bonus-item');
}

// Clear and rebuild cart
function replaceCart(newItems) {
  window.twentyNineNext.clearCart();
  newItems.forEach(item => {
    window.twentyNineNext.addToCart(item.id, item.quantity);
  });
}
```

## Cart Persistence

### How It Works

1. **Local Storage**: Cart saved to browser storage
2. **API Sync**: Periodic sync with 29next API
3. **Cross-Device**: Login to sync across devices

### Managing Persistence

```javascript
// Force save to storage
window.twentyNineNext.saveCart();

// Force sync with API
window.twentyNineNext.syncCart();

// Clear local cart
window.twentyNineNext.clearCart();

// Clear all storage
window.twentyNineNext.storage.clear();
```

## Cart Events

### Available Events

```javascript
// Cart updated (any change)
document.addEventListener('cart.updated', (e) => {
  console.log('Cart updated:', e.detail);
});

// Item added
document.addEventListener('cart.item.added', (e) => {
  console.log('Added:', e.detail.item);
});

// Item removed
document.addEventListener('cart.item.removed', (e) => {
  console.log('Removed:', e.detail.item);
});

// Cart cleared
document.addEventListener('cart.cleared', (e) => {
  console.log('Cart cleared');
});
```

### Custom Cart Logic

```javascript
// Prevent adding more than 5 items
document.addEventListener('cart.item.adding', (e) => {
  const cart = window.twentyNineNext.getCart();
  if (cart.count >= 5) {
    e.preventDefault();
    alert('Maximum 5 items allowed');
  }
});

// Auto-apply voucher at threshold
document.addEventListener('cart.updated', (e) => {
  if (e.detail.total >= 100 && !window.twentyNineNext.getAppliedVoucher()) {
    window.twentyNineNext.applyVoucher('AUTO100');
  }
});
```

## Cart Display Configuration

### Using osConfig

```javascript
window.osConfig = {
  cartDisplayConfig: {
    showImages: true,
    showQuantityControls: true,
    showRemoveButton: true,
    showSavings: true,
    emptyMessage: 'Your cart is empty',
    currency: {
      symbol: '$',
      position: 'before',
      decimals: 2
    }
  }
};
```

### CSS Customization

```css
/* Cart display container */
[data-os-cart="summary"] {
  max-height: 400px;
  overflow-y: auto;
}

/* Cart items */
.cart-item {
  display: flex;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #eee;
}

/* Cart total */
[data-os-cart-total] {
  font-size: 1.5rem;
  font-weight: bold;
  color: #2ecc71;
}

/* Empty cart message */
[data-os-cart="summary"]:empty::after {
  content: 'Your cart is empty';
  display: block;
  text-align: center;
  padding: 2rem;
  color: #999;
}
```

## Mini Cart Implementation

Create a hoverable mini cart:

```html
<div class="mini-cart-container">
  <button class="mini-cart-trigger">
    Cart (<span data-os-cart-count>0</span>)
  </button>
  
  <div class="mini-cart-dropdown" data-os-in-cart="display" data-container="true">
    <div data-os-cart="summary"></div>
    <div class="mini-cart-footer">
      <p>Total: <span data-os-cart-total>$0.00</span></p>
      <button os-checkout-payment="combo">Checkout</button>
    </div>
  </div>
</div>

<style>
.mini-cart-dropdown {
  display: none;
  position: absolute;
  background: white;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  width: 300px;
}

.mini-cart-container:hover .mini-cart-dropdown {
  display: block;
}
</style>
```

## Detailed Cart Summary Elements

Use specific cart summary attributes for fine control:

```html
<div data-os-cart="summary">
  <!-- Line items container -->
  <div data-os-cart-summary="line-display">
    <!-- Individual line items will be rendered here -->
    <div data-os-cart-summary="line-item">
      <span data-os-cart-summary="line-title">Product Name</span>
      <span data-os-cart-summary="line-sale">$29.99</span>
      <span data-os-cart-summary="line-compare">$39.99</span>
      <button data-os-cart-summary="remove-line">Remove</button>
    </div>
  </div>
  
  <!-- Savings display -->
  <div data-os-cart-summary="savings">
    <span data-os-cart-summary="savings-amount">$10.00</span>
    <span data-os-cart-summary="savings-percentage">25%</span>
  </div>
  
  <!-- Totals -->
  <div class="cart-totals">
    <p>Subtotal: <span data-os-cart-summary="subtotal">$0.00</span></p>
    <p>Discount: -<span data-os-cart-summary="discount-amount">$0.00</span></p>
    <p><strong>Total: <span data-os-cart-summary="grand-total">$0.00</span></strong></p>
  </div>
</div>
```

## Conditional Display

Show/hide elements based on cart state:

```html
<!-- Show when cart has items -->
<div data-os-in-cart="display" data-container="true">
  <h3>Your Items</h3>
  <div data-os-cart="summary"></div>
  <button os-checkout-payment="combo">Checkout</button>
</div>

<!-- Show when cart is empty -->
<div class="empty-cart-message" style="display: none;">
  <h3>Your cart is empty</h3>
  <p>Add some products to get started!</p>
</div>

<script>
document.addEventListener('cart.updated', (e) => {
  const emptyMessage = document.querySelector('.empty-cart-message');
  if (e.detail.count === 0) {
    emptyMessage.style.display = 'block';
  } else {
    emptyMessage.style.display = 'none';
  }
});
</script>
```

## Troubleshooting

### Cart Not Updating

1. Check console for errors
2. Verify API key and campaign ID
3. Ensure Campaign Cart is initialized
4. Check browser storage settings

### Items Not Persisting

```javascript
// Debug storage
console.log(window.twentyNineNext.storage.get('cart'));

// Force sync
window.twentyNineNext.syncCart();

// Check initialization
console.log(window.twentyNineNext.isInitialized());
```

### Performance Issues

```javascript
// Debounce cart updates
let updateTimeout;
document.addEventListener('cart.updated', (e) => {
  clearTimeout(updateTimeout);
  updateTimeout = setTimeout(() => {
    updateExpensiveUI(e.detail);
  }, 100);
});
```

## Best Practices

1. **Always show cart status** - Users should see their cart count/total
2. **Provide clear actions** - Add/remove buttons should be obvious
3. **Show savings** - Display discounts and savings clearly
4. **Mobile optimize** - Ensure cart works well on small screens
5. **Handle errors gracefully** - Show user-friendly error messages
6. **Use conditional display** - Show/hide relevant elements based on cart state

## Next Steps

- [Multi-Currency Guide](multi-currency.md) - International support
- [Product Profiles](../features/product-profiles.md) - Advanced product management
- [Configuration Guide](../configuration/basic-config.md) - Cart display options
- [Events Configuration](../configuration/events.md) - Track cart analytics