# Quantity Upsells

Let customers choose quantity before accepting the upsell.

## Quantity Controls Pattern

Simple quantity selector for bulk purchases:

```html
<!-- Quantity controls -->
<div data-next-upsell="offer" data-next-package-id="7">
  <h3>Add Extra Batteries?</h3>
  <p>Never run out of power during your flights</p>
  
  <div class="quantity-controls">
    <button data-next-upsell-quantity="decrease">-</button>
    <span data-next-upsell-quantity="display">1</span>
    <button data-next-upsell-quantity="increase">+</button>
  </div>
  
  <p>Price: <span data-next-display="package.price">$29.99</span> each</p>
  
  <button data-next-upsell-action="add">
    Add <span data-next-upsell-quantity="display">1</span> to Order
  </button>
  <button data-next-upsell-action="skip">
    No Thanks
  </button>
</div>
```

## Quantity Toggle Cards Pattern

Click to select quantity - perfect for bundles:

```html
<!-- Quantity toggle cards -->
<div data-next-upsell="offer" data-next-package-id="7">
  <h3>Stock Up & Save!</h3>
  <p>Choose your battery bundle:</p>
  
  <div class="quantity-cards">
    <div data-next-upsell-quantity-toggle="1" class="quantity-card">
      <h4>1 Pack</h4>
      <p>$29.99</p>
    </div>
    
    <div data-next-upsell-quantity-toggle="2" class="quantity-card">
      <h4>2 Pack</h4>
      <p>$49.99</p>
      <span class="badge">Save $10</span>
    </div>
    
    <div data-next-upsell-quantity-toggle="4" class="quantity-card">
      <h4>4 Pack</h4>
      <p>$89.99</p>
      <span class="badge">Best Value!</span>
    </div>
  </div>
  
  <button data-next-upsell-action="add">
    Add <span data-next-upsell-quantity="display">1</span> Pack to Order
  </button>
  <button data-next-upsell-action="skip">
    Continue Without
  </button>
</div>
```

## Advanced Quantity Display

Show dynamic pricing based on quantity:

```html
<div data-next-upsell="offer" data-next-package-id="8">
  <h3>Replacement Filters</h3>
  
  <div class="quantity-selector">
    <button data-next-upsell-quantity="decrease">-</button>
    <input type="text" data-next-upsell-quantity="display" readonly>
    <button data-next-upsell-quantity="increase">+</button>
  </div>
  
  <div class="pricing-display">
    <p>Unit Price: <span data-next-display="package.price">$9.99</span></p>
    <p>Total: $<span data-next-upsell-quantity="display">1</span> × 
       <span data-next-display="package.price.raw">9.99</span> = 
       $<span data-next-upsell-quantity="total">9.99</span>
    </p>
  </div>
  
  <button data-next-upsell-action="add">Add to Order</button>
</div>
```

## Quantity Attributes

### Controls
- `data-next-upsell-quantity="increase"` - Increment button
- `data-next-upsell-quantity="decrease"` - Decrement button
- `data-next-upsell-quantity="display"` - Shows current quantity

### Toggle Cards
- `data-next-upsell-quantity-toggle` - Set specific quantity on click
- Value is the quantity to set (e.g., "1", "2", "4")

## Styling Quantity Cards

```css
/* Style selected quantity card */
.quantity-card[data-selected="true"] {
  border: 2px solid #007bff;
  background: #f0f8ff;
}

/* Disable decrease at minimum */
button[data-next-upsell-quantity="decrease"]:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
```

## Best Practices

1. **Show Savings**: Highlight bulk discounts
2. **Display Total**: Show total price for quantity
3. **Preset Options**: Offer common quantities
4. **Visual Feedback**: Mark selected quantity
5. **Limits**: Set min/max quantity if needed

## Common Patterns

### Tiered Pricing
```html
<div data-next-upsell-quantity-toggle="1">
  1 for $10
</div>
<div data-next-upsell-quantity-toggle="3">
  3 for $25 (Save $5)
</div>
<div data-next-upsell-quantity-toggle="5">
  5 for $40 (Save $10)
</div>
```

### Subscription Quantities
```html
<div data-next-upsell-quantity-toggle="1">
  Monthly Supply - $29/mo
</div>
<div data-next-upsell-quantity-toggle="3">
  3 Month Supply - $79 (Save $8)
</div>
```