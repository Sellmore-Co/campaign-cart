# Formatting Options

Control how values are displayed with formatting attributes.

## Format Types

```html
<span data-format="currency" data-next-display="package.price">Format as currency ($12.34)</span>
<span data-format="number" data-next-display="package.price">Format as number (1,234.56)</span>
```

## Conditional Hiding

```html
<span data-hide-if-zero="true" data-next-display="cart.shipping">Hide element if value is 0</span>
<span data-hide-if-false="true" data-next-display="package.isRecurring">Hide element if value is false</span>
<span data-hide-zero-cents="true" data-next-display="package.price">Hide cents if .00 (shows $199 instead of $199.00)</span>
```

## Mathematical Transformations

```html
<span data-multiply-by="2" data-next-display="package.price">Multiply value by 2</span>
<span data-divide-by="2" data-next-display="package.price">Divide value by 2</span>
```

## Complete Examples

### Currency Formatting

```html
<!-- Default currency format -->
<span data-next-display="package.price">$99.99</span>

<!-- Explicit currency format -->
<span data-format="currency" data-next-display="package.price.raw">$99.99</span>

<!-- Number format (no currency symbol) -->
<span data-format="number" data-next-display="package.price.raw">99.99</span>
```

### Conditional Display

```html
<!-- Hide shipping if free -->
<div class="shipping-cost" data-hide-if-zero="true">
  Shipping: <span data-next-display="cart.shipping">$0.00</span>
</div>

<!-- Hide element if boolean is false -->
<div class="subscription-info" data-hide-if-false="true" data-next-display="package.isRecurring">
  This is a subscription product
</div>
```

### Mathematical Operations

```html
<!-- Double the price -->
<span data-multiply-by="2" data-next-display="package.price">$199.98</span>

<!-- Half price -->
<span data-divide-by="2" data-next-display="package.price">$49.99</span>

<!-- Complex calculation -->
<div>
  10% deposit: $<span data-multiply-by="0.1" data-format="currency" data-next-display="cart.total.raw">9.99</span>
</div>
```

## Raw vs Formatted Values

```html
<!-- Formatted (with currency symbol) -->
<span data-next-display="package.price">$99.99</span>

<!-- Raw value (number only) -->
<span data-next-display="package.price.raw">99.99</span>

<!-- Use raw for calculations -->
<span data-next-display="package.price.raw * 2">199.98</span>
```

## Advanced Formatting

### Percentage Display

```html
<!-- Formatted percentage -->
<span data-next-display="package.savingsPercentage">30%</span>

<!-- Raw percentage value -->
<span data-next-display="package.savingsPercentage.raw">30</span>
```

### Conditional Formatting

```html
<!-- Show different format based on value -->
<div class="price-display">
  <span data-next-show="package.price < 100" data-next-display="package.price">
    $99.99
  </span>
  <span data-next-show="package.price >= 100">
    <strong data-next-display="package.price">$199.99</strong>
  </span>
</div>
```

### Custom Formatting with CSS

```html
<!-- Add CSS classes based on conditions -->
<span class="price" 
      data-next-display="package.price"
      data-next-class-sale="package.hasSavings"
      data-next-class-premium="package.price > 200">
  $99.99
</span>
```

## Best Practices

1. **Use Raw for Math**: Always use `.raw` values for calculations
2. **Hide Zeros**: Use `data-hide-if-zero` for optional values
3. **Format Consistently**: Use same format throughout page
4. **Test Edge Cases**: Check formatting with various values
5. **Accessibility**: Ensure formatted values are readable

## Common Patterns

### Price Range Display
```html
<span data-next-display="package.price">$99</span> - 
<span data-multiply-by="3" data-next-display="package.price">$297</span>
```

### Savings Calculator
```html
You save: $<span data-next-display="package.savingsAmount.raw">20</span>
(<span data-next-display="package.savingsPercentage">20%</span>)
```

### Dynamic Pricing
```html
Price per unit: $<span data-divide-by="{package.qty}" data-next-display="package.price_total.raw">33.33</span>
```