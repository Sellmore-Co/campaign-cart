# Quantity Controls

Manage product quantities in the cart with various control patterns.

## Direct Quantity in Buttons

Set quantity directly in add to cart buttons:

```html
<!-- Add specific quantity -->
<button data-next-action="add-to-cart"
        data-next-package-id="2"
        data-next-quantity="3">
  Add 3 to Cart
</button>
```

## Toggle with Quantity

Toggle buttons can specify quantity:

```html
<button data-next-toggle
        data-next-package-id="8"
        data-next-quantity="3">
  Add 3 Extra Batteries
</button>
```

## Container-Based Quantity

Specify quantity at the container level:

```html
<div class="product-container"
     data-next-package-id="9"
     data-next-quantity="2">
  <button data-next-toggle>Add 2 Pack Bundle</button>
</div>
```

## Quantity Sync Feature

Sync quantities between related products (e.g., warranties that match product quantity):

```html
<!-- Main product buttons -->
<button data-next-toggle data-next-package-id="2">Add 1 Drone</button>
<button data-next-toggle data-next-package-id="3" data-next-quantity="2">Add 2 Drones</button>
<button data-next-toggle data-next-package-id="4" data-next-quantity="3">Add 3 Drones</button>

<!-- Warranty syncs with drone quantity -->
<button data-next-toggle 
        data-next-package-id="10" 
        data-next-package-sync="2,3,4">
  Add Protection Plan (matches drone quantity)
</button>
```

## Quantity Display

Show current quantity in cart:

```html
<!-- Total quantity of all items -->
<span data-next-display="cart.quantity">0</span>

<!-- Quantity of specific item -->
<span data-next-display="cart.items[package-id-2].quantity">0</span>
```

## Quantity-Based Conditionals

Show/hide elements based on quantity:

```html
<!-- Show when cart has 3 or more items -->
<div data-next-show="cart.quantity >= 3">
  You qualify for bulk discount!
</div>

<!-- Show different messages based on quantity -->
<div data-next-show="cart.quantity == 1">Single item in cart</div>
<div data-next-show="cart.quantity > 1">Multiple items in cart</div>
```

## Best Practices

1. **Clear Labels**: Always indicate quantity in button text
2. **Visual Feedback**: Update button text when quantity changes
3. **Sync Related Items**: Use quantity sync for accessories/warranties
4. **Display Current Quantity**: Show users current cart quantities

## Advanced Patterns

TODO: Add information about:
- Quantity increment/decrement controls
- Input fields for quantity
- Maximum quantity limits
- Inventory-based restrictions