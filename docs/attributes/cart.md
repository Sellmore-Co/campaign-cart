# Cart Attributes

Display cart totals, quantities, and calculated values. Updates automatically when cart changes.

## Cart Status Properties

```html
<span data-next-display="cart.isEmpty">Whether cart is empty</span>
<span data-next-display="cart.hasItems">Whether cart has items</span>
<span data-next-display="cart.itemCount">Number of different items</span>
<span data-next-display="cart.quantity">Total quantity of all items</span>
<span data-next-display="cart.count">Same as quantity (alias)</span>
<span data-next-display="cart.discountCode">Display the discount code</span>
<span data-next-display="cart.discountCodes">Display the discount codes</span>
<span data-next-display="cart.couponCount">Number of coupons applied</span>
```

## Cart Financial Totals

```html
<span data-next-display="cart.subtotal">Cart subtotal (formatted)</span>
<span data-next-display="cart.total">Cart total (formatted)</span>
<span data-next-display="cart.shipping">Shipping cost (formatted)</span>
<span data-next-display="cart.discounts">Discount amount (formatted)</span>
<span data-next-display="cart.savingsAmount">Total savings (formatted - exclude discounts)</span>
<span data-next-display="cart.savingsPercentage">Savings percentage (formatted - exclude discounts)</span>
<span data-next-display="cart.totalSavingsAmount">Total savings (formatted - include discounts)</span>
<span data-next-display="cart.totalSavingsPercentage">Total savings percentage (formatted - include discounts)</span>
<span data-next-display="cart.compareTotal">Compare-at total (formatted)</span>
```

## Cart Conditionals

```html
<div data-next-show="cart.isEmpty">Cart is empty</div>
<div data-next-show="cart.hasItems">Cart has items</div>
<div data-next-show="cart.hasItem(2)">Specific item in cart</div>
<div data-next-show="cart.total > 50">Cart total over $50</div>
<div data-next-show="cart.hasSavings">Cart has savings</div>
<div data-next-show="cart.hasCoupon">Cart has coupon applied</div>
```

## Complete Cart Summary Example

```html
<div class="cart-summary">
  <h3>Cart Summary</h3>
  
  <!-- Empty cart message -->
  <div data-next-show="cart.isEmpty" class="empty-cart">
    <p>Your cart is empty</p>
    <a href="/shop">Continue Shopping</a>
  </div>
  
  <!-- Cart with items -->
  <div data-next-show="cart.hasItems">
    <div class="cart-stats">
      <p>Items: <span data-next-display="cart.itemCount">0</span></p>
      <p>Quantity: <span data-next-display="cart.quantity">0</span></p>
    </div>
    
    <div class="cart-totals">
      <div class="line-item">
        <span>Subtotal:</span>
        <span data-next-display="cart.subtotal">$0.00</span>
      </div>
      
      <div class="line-item" data-next-show="cart.shipping > 0">
        <span>Shipping:</span>
        <span data-next-display="cart.shipping">$0.00</span>
      </div>
      
      <div class="line-item" data-next-show="cart.hasCoupon">
        <span>Discount (<span data-next-display="cart.discountCode">-</span>):</span>
        <span data-next-display="cart.discounts">-$0.00</span>
      </div>
      
      <div class="line-item total">
        <span>Total:</span>
        <span data-next-display="cart.total">$0.00</span>
      </div>
    </div>
    
    <div class="savings" data-next-show="cart.hasSavings">
      <p class="savings-message">
        You're saving <span data-next-display="cart.totalSavingsAmount">$0</span>
        (<span data-next-display="cart.totalSavingsPercentage">0%</span>)!
      </p>
    </div>
  </div>
</div>
```

## Free Shipping Threshold

```html
<div class="shipping-threshold">
  <div data-next-show="cart.total < 100">
    <p>Add $<span data-next-display="100 - cart.total.raw">0</span> more for free shipping!</p>
    <div class="progress-bar">
      <div class="progress" style="width: calc(100% * {cart.total.raw} / 100)"></div>
    </div>
  </div>
  
  <div data-next-show="cart.total >= 100">
    <p class="free-shipping">✓ You qualify for free shipping!</p>
  </div>
</div>
```

## Cart Items Renderer

The `data-next-cart-items` attribute dynamically renders cart items using customizable templates.

### Basic Usage

```html
<!-- Container for cart items -->
<div data-next-cart-items class="cart-items-list">
  <!-- Items will be rendered here -->
</div>
```

### Template Configuration

Templates can be specified in multiple ways (in priority order):

#### 1. Template by ID
```html
<!-- Define template -->
<template id="cart-item-template">
  <div class="cart-item" data-cart-item-id="{item.id}">
    <img src="{item.image}" alt="{item.name}">
    <h4>{item.name}</h4>
    <span>{item.quantity}x</span>
    <span>{item.unitPrice}</span>
  </div>
</template>

<!-- Reference template -->
<div data-next-cart-items 
     data-item-template-id="cart-item-template"
     class="cart-items-list">
</div>
```

#### 2. Template by CSS Selector
```html
<!-- Define template -->
<script type="text/x-template" id="custom-template">
  <div class="cart-item">
    <!-- template content -->
  </div>
</script>

<!-- Reference template -->
<div data-next-cart-items 
     data-item-template-selector="#custom-template"
     class="cart-items-list">
</div>
```

#### 3. Inline Template String
```html
<div data-next-cart-items 
     data-item-template='<div class="item">{item.name}: {item.quantity}x</div>'
     class="cart-items-list">
</div>
```

#### 4. Default: Inner HTML
```html
<div data-next-cart-items class="cart-items-list">
  <div class="cart-item">
    <span>{item.name}</span>
    <span>{item.quantity}</span>
  </div>
</div>
```

### Available Template Variables

#### Basic Item Properties
- `{item.id}` - Unique cart item identifier
- `{item.packageId}` - Package/product ID
- `{item.name}` - Product name
- `{item.title}` - Product title (alias for name)
- `{item.quantity}` - Quantity in cart
- `{item.image}` - Product image URL
- `{item.sku}` - Product SKU/external ID
- `{item.frequency}` - Purchase frequency (e.g., "One time", "Every month")

#### Pricing Variables
- `{item.price}` - Total package price
- `{item.unitPrice}` - Individual unit price
- `{item.comparePrice}` - Original package price (before discount)
- `{item.unitComparePrice}` - Original unit price
- `{item.lineTotal}` - Line total (price × quantity)
- `{item.lineCompare}` - Original line total
- `{item.recurringPrice}` - Recurring price (if subscription)

#### Savings Variables
- `{item.savingsAmount}` - Total savings amount
- `{item.unitSavings}` - Per-unit savings
- `{item.savingsPct}` - Savings percentage (e.g., "50%")
- `{item.packageSavings}` - Package-level savings
- `{item.packageSavingsPct}` - Package savings percentage

#### Package Details
- `{item.packagePrice}` - Base package price
- `{item.packagePriceTotal}` - Package total price
- `{item.packageRetailPrice}` - Package retail price
- `{item.packageRetailTotal}` - Package retail total
- `{item.packageQty}` - Quantity in package

#### Conditional Display Classes
- `{item.showCompare}` - "show" or "hide" based on savings
- `{item.showSavings}` - "show" or "hide" if has savings
- `{item.showRecurring}` - "show" or "hide" if recurring
- `{item.showUnitPrice}` - "show" or "hide" for multi-unit packages
- `{item.hasSavings}` - "true" or "false"
- `{item.isRecurring}` - "true" or "false"

#### Raw Values (unformatted)
- `{item.price.raw}` - Numeric price value
- `{item.unitPrice.raw}` - Numeric unit price
- `{item.lineTotal.raw}` - Numeric line total
- `{item.savingsAmount.raw}` - Numeric savings
- `{item.savingsPct.raw}` - Numeric percentage

### Complete Example

```html
<!-- Template definition -->
<template id="cart-item-template">
  <div class="cart-item" data-cart-item-id="{item.id}" data-package-id="{item.packageId}">
    <div class="cart-item__image-container">
      <img src="{item.image}" alt="{item.name}" class="cart-item__image">
      <div class="quantity-badge">{item.quantity}</div>
    </div>
    
    <div class="cart-item__details">
      <h4 class="cart-item__name">{item.name}</h4>
      <div class="cart-item__frequency">{item.frequency}</div>
      
      <div class="cart-item__pricing">
        <div class="price-current">{item.unitPrice}</div>
        <div class="price-compare {item.showCompare}">{item.unitComparePrice}</div>
        <div class="savings {item.showSavings}">
          Save {item.savingsAmount} ({item.savingsPct})
        </div>
      </div>
    </div>
    
    <div class="cart-item__quantity">
      <button data-next-quantity="decrease" data-package-id="{item.packageId}">-</button>
      <span>{item.quantity}</span>
      <button data-next-quantity="increase" data-package-id="{item.packageId}">+</button>
    </div>
    
    <div class="cart-item__total">
      <div class="line-total">{item.lineTotal}</div>
      <button data-next-remove-item data-package-id="{item.packageId}">Remove</button>
    </div>
  </div>
</template>

<!-- Cart items container -->
<div data-next-cart-items 
     data-item-template-id="cart-item-template"
     data-empty-template='<div class="empty">Your cart is empty</div>'
     class="cart-items-list">
</div>
```

### Additional Attributes

- `data-empty-template` - Template to show when cart is empty
- `data-title-map` - JSON object to map package IDs to custom titles

```html
<div data-next-cart-items
     data-item-template-id="cart-item-template"
     data-empty-template="<p>No items in cart</p>"
     data-title-map='{"2": "Premium Drone Package", "3": "Starter Kit"}'
     class="cart-items-list">
</div>
```

## Cart Item Details

```html
<!-- Check for specific items -->
<div data-next-show="cart.hasItem(5)">
  <p>Don't forget to add a warranty!</p>
</div>

<!-- Item-specific quantity -->
<p>Drones in cart: <span data-next-display="cart.items[2].quantity">0</span></p>
```

## Discount Display

```html
<div class="discount-info" data-next-show="cart.hasCoupon">
  <p>Applied discount: <span data-next-display="cart.discountCode">-</span></p>
  <p>You saved: <span data-next-display="cart.discounts">$0</span></p>
</div>
```

## Raw Values for Calculations

```html
<!-- Use raw values for math -->
<div data-next-show="cart.total.raw > 0">
  <p>10% tip would be: $<span data-next-display="cart.total.raw * 0.1">0</span></p>
</div>
```

## Best Practices

1. **Empty State**: Always handle empty cart scenario
2. **Real-time Updates**: Cart values update automatically
3. **Conditional Display**: Show relevant info based on cart state
4. **Savings Highlight**: Emphasize savings when present
5. **Threshold Messages**: Encourage higher order values