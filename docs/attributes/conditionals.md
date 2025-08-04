# Conditional Display Attributes

Show/hide elements based on conditions. Works with cart, package, selection, and order data.

## Show/Hide Attributes

```html
<div data-next-show="cart.hasItems">Show when cart has items</div>
<div data-next-hide="cart.isEmpty">Hide when cart is empty</div>
<div data-next-show="package.hasSavings">Show when package has savings</div>
<div data-next-show="selection.{id}.hasSelection">Show when selector has selection</div>
```

## Comparison Conditions

```html
<div data-next-show="cart.total > 50">Show when cart total over $50</div>
<div data-next-show="cart.quantity >= 3">Show when 3+ items in cart</div>
<div data-next-show="package.qty == 1">Show for single-unit packages</div>
<div data-next-hide="selection.{id}.total < 20">Hide when selection under $20</div>
```

## Advanced Conditionals

```html
<div data-next-show="cart.savingsPercentage > 30">Show when savings over 30%</div>
<div data-next-show="package.isRecurring">Show for subscription products</div>
<div data-next-show="selection.{id}.isBundle">Show for multi-pack selections</div>
<div data-next-hide="order.hasUpsells">Hide when order has upsells</div>
```

## Boolean Properties

### Cart Booleans
- `cart.isEmpty` - Cart has no items
- `cart.hasItems` - Cart has items
- `cart.hasSavings` - Cart has any savings
- `cart.hasCoupon` - Discount code applied

### Package Booleans
- `package.hasSavings` - Package has savings
- `package.hasRetailPrice` - Has compare price
- `package.isBundle` - Multi-unit package
- `package.isRecurring` - Subscription product
- `package.isOneTime` - One-time purchase

### Order Booleans
- `order.exists` - Order was found
- `order.isRecent` - Placed < 15 min ago
- `order.supportsUpsells` - Can add items
- `order.isTest` - Test order

## Complex Examples

### Tiered Messaging

```html
<!-- Different messages based on cart value -->
<div class="shipping-message">
  <p data-next-show="cart.total < 50">
    Standard shipping: $9.99
  </p>
  <p data-next-show="cart.total >= 50 && cart.total < 100">
    Reduced shipping: $4.99
  </p>
  <p data-next-show="cart.total >= 100">
    ✓ FREE SHIPPING!
  </p>
</div>
```

### Progressive Disclosure

```html
<!-- Show more options as cart grows -->
<div class="cart-actions">
  <button data-next-show="cart.hasItems">Checkout</button>
  
  <button data-next-show="cart.quantity >= 3">
    Apply Bulk Discount
  </button>
  
  <div data-next-show="cart.total >= 200">
    <h4>VIP Options Available!</h4>
    <button>Upgrade to Priority</button>
  </div>
</div>
```

### Conditional Product Info

```html
<div class="product" data-next-package-id="5">
  <!-- Regular pricing -->
  <div data-next-hide="package.hasSavings">
    <span data-next-display="package.price">$99</span>
  </div>
  
  <!-- Sale pricing -->
  <div data-next-show="package.hasSavings">
    <span class="sale-price" data-next-display="package.price">$79</span>
    <span class="regular-price">
      <s data-next-display="package.price_retail">$99</s>
    </span>
    <span class="badge">
      Save <span data-next-display="package.savingsPercentage">20%</span>
    </span>
  </div>
  
  <!-- Subscription info -->
  <div data-next-show="package.isRecurring">
    <p>Auto-delivery every <span data-next-display="package.interval">month</span></p>
  </div>
</div>
```

### Smart Upsell Display

```html
<!-- Show relevant upsells based on cart -->
<div class="upsells">
  <!-- Show warranty if main product in cart -->
  <div data-next-show="cart.hasItem(2)" class="upsell">
    <h4>Protect Your Purchase</h4>
    <button data-next-toggle data-next-package-id="10">
      Add Protection Plan
    </button>
  </div>
  
  <!-- Show accessories for orders over $100 -->
  <div data-next-show="cart.total > 100" class="upsell">
    <h4>Complete Your Setup</h4>
    <button data-next-toggle data-next-package-id="11">
      Add Accessory Kit - 20% Off
    </button>
  </div>
</div>
```

## Function-Based Conditions

```html
<!-- Check for specific item -->
<div data-next-show="cart.hasItem(5)">
  Package 5 is in your cart!
</div>

<!-- Multiple conditions -->
<div data-next-show="cart.hasItems && cart.total > 50">
  You qualify for free gift!
</div>
```

## Best Practices

1. **Clear Logic**: Use simple, understandable conditions
2. **Fallbacks**: Always handle both states (show/hide)
3. **Performance**: Avoid complex calculations in conditions
4. **Testing**: Test all condition states
5. **Accessibility**: Don't hide critical information