# Standalone Package Pricing System

The Standalone Package Pricing system allows you to display pricing information for any package anywhere on your page using data attributes. This system is managed by the `DisplayManager` and provides comprehensive pricing display capabilities outside of selector cards.

## Key Features

- **Display package pricing anywhere**: Not limited to selector cards
- **Comprehensive pricing types**: Sale prices, regular prices, savings amounts, percentages
- **Multi-currency support**: Automatically updates with country changes
- **Unit and total pricing**: Show per-unit or total package pricing
- **Subunit pricing**: Divide prices by custom amounts (e.g., per facial, per item)
- **Flexible formatting**: Multiple display formats for percentages and prices
- **Conditional display**: Hide elements when values are zero

## Basic Usage

Add pricing elements to your HTML with the required attributes:

```html
<!-- Display the sale price for package ID "1" -->
<span data-os-package-price="total-sale" data-os-package-id="1">$95.00</span>

<!-- Display savings for package ID "3" -->
<span data-os-package-price="total-saving-percentage" data-os-package-id="3">20% OFF</span>
```

## Required Attributes

Every pricing element needs these two attributes:

| Attribute | Description | Example |
|-----------|-------------|---------|
| `data-os-package-price` | The type of price to display | `"total-sale"`, `"unit-regular"`, `"saving-percentage"` |
| `data-os-package-id` | The package ID (ref_id or id from campaign data) | `"1"`, `"product-123"` |

## Available Price Types

### Total Package Pricing

| Price Type | Description | Example Display |
|------------|-------------|-----------------|
| `total-sale` | Total package sale price | $285.00 |
| `total-regular` | Total package regular price | $354.00 |
| `total-saving-amount` | Total amount saved | $69.00 |
| `total-saving-percentage` | Total percentage saved | 20% OFF |

### Unit Pricing

| Price Type | Description | Example Display |
|------------|-------------|-----------------|
| `unit-sale` | Price per unit (sale) | $95.00 |
| `unit-regular` | Price per unit (regular) | $118.00 |
| `unit-saving-amount` | Amount saved per unit | $23.00 |
| `unit-saving-percentage` | Percentage saved per unit | 20% OFF |

### Aliases (for consistency with selector pricing)

| Price Type | Description | Equivalent To |
|------------|-------------|---------------|
| `each-sale` | Price per unit (sale) | `unit-sale` |
| `each-regular` | Price per unit (regular) | `unit-regular` |
| `saving-amount` | Amount saved per unit | `unit-saving-amount` |
| `saving-percentage` | Percentage saved per unit | `unit-saving-percentage` |

## Optional Configuration Attributes

### Subunit Pricing with `data-os-divide-by`

Divide the price by a custom amount to show per-subunit pricing:

```html
<!-- Show price per facial if package contains 4 facials -->
<span data-os-package-price="unit-sale" 
      data-os-package-id="1" 
      data-os-divide-by="4">$23.75</span>
```

### Formatting with `data-os-format`

Control how percentages are displayed:

| Format | Description | Example |
|--------|-------------|---------|
| `default` | Standard format | 20% OFF |
| `parenthesis` | Wrapped in parentheses | (20% OFF) |
| `simple` | Just the percentage | 20% |

```html
<span data-os-package-price="saving-percentage" 
      data-os-package-id="1" 
      data-os-format="parenthesis">(20% OFF)</span>
```

### Conditional Display with `data-os-hide-if-zero`

Hide elements when the value is zero or negative:

```html
<!-- This element will be hidden if there are no savings -->
<div data-os-package-price="saving-amount" 
     data-os-package-id="1" 
     data-os-hide-if-zero="true">$23.00</div>
```

### Decimal Display with `data-os-show-decimals`

Always show decimal places, even for whole dollar amounts:

```html
<!-- Without decimals (default) -->
<span data-os-package-price="total-sale" data-os-package-id="1">$89</span>

<!-- With decimals always shown -->
<span data-os-package-price="total-sale" 
      data-os-package-id="1" 
      data-os-show-decimals="true">$89.00</span>
```

**When to use:**
- **With decimals:** Professional pricing tables, detailed receipts, financial displays
- **Without decimals:** Marketing displays, big promotional prices, mobile-friendly layouts

### Container Hiding with `data-container`

Automatically hide a container when any child with `data-os-hide-if-zero="true"` is hidden:

```html
<div data-container="true">
  <span>You save: </span>
  <span data-os-package-price="saving-amount" 
        data-os-package-id="1" 
        data-os-hide-if-zero="true">$23.00</span>
</div>
```

## Complete Examples

### Product Card with Comprehensive Pricing

```html
<div class="product-card">
  <h3>3-Month Supply</h3>
  <p>The All-In-One Facial® Set (12 Facials + 3 Brushes)</p>
  
  <!-- Main price display -->
  <div class="price-main">
    <span class="price-current" 
          data-os-package-price="total-sale" 
          data-os-package-id="6">$285.00</span>
    <span class="price-original" 
          data-os-package-price="total-regular" 
          data-os-package-id="6">$354.00</span>
  </div>
  
  <!-- Savings badge -->
  <div class="savings-badge" data-container="true">
    <span>Save </span>
    <span data-os-package-price="total-saving-percentage" 
          data-os-package-id="6" 
          data-os-hide-if-zero="true">20% OFF</span>
  </div>
  
  <!-- Per-set pricing -->
  <div class="per-set-price">
    <span>Just </span>
    <span data-os-package-price="unit-sale" 
          data-os-package-id="6">$95.00</span>
    <span> per monthly set</span>
  </div>
  
  <!-- Per-facial pricing -->
  <div class="per-facial-price">
    <span>Only </span>
    <span data-os-package-price="unit-sale" 
          data-os-package-id="6" 
          data-os-divide-by="4">$23.75</span>
    <span> per facial</span>
  </div>
</div>
```

### Hero Section with Package Pricing

```html
<section class="hero">
  <h1>The All-In-One Facial® System</h1>
  
  <div class="hero-pricing">
    <!-- Main CTA price -->
    <div class="cta-price">
      <span class="cta-text">Starting at just</span>
      <span class="cta-amount" 
            data-os-package-price="unit-sale" 
            data-os-package-id="1" 
            data-os-divide-by="4">$29.50</span>
      <span class="cta-text">per facial</span>
    </div>
    
    <!-- Value proposition -->
    <div class="value-prop" data-container="true">
      <span>Save up to </span>
      <span data-os-package-price="total-saving-percentage" 
            data-os-package-id="6" 
            data-os-hide-if-zero="true">20%</span>
      <span> with our 3-month package</span>
    </div>
  </div>
</section>
```

### Comparison Table

```html
<table class="pricing-table">
  <thead>
    <tr>
      <th>Package</th>
      <th>Total Price</th>
      <th>Per Unit</th>
      <th>Savings</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>1-Month Supply</td>
      <td data-os-package-price="total-sale" data-os-package-id="1">$118.00</td>
      <td data-os-package-price="unit-sale" data-os-package-id="1">$118.00</td>
      <td>-</td>
    </tr>
    <tr>
      <td>2-Month Supply</td>
      <td data-os-package-price="total-sale" data-os-package-id="5">$198.00</td>
      <td data-os-package-price="unit-sale" data-os-package-id="5">$99.00</td>
      <td data-os-package-price="total-saving-percentage" data-os-package-id="5">16% OFF</td>
    </tr>
    <tr>
      <td>3-Month Supply</td>
      <td data-os-package-price="total-sale" data-os-package-id="6">$285.00</td>
      <td data-os-package-price="unit-sale" data-os-package-id="6">$95.00</td>
      <td data-os-package-price="total-saving-percentage" data-os-package-id="6">20% OFF</td>
    </tr>
  </tbody>
</table>
```

### Before/After Sections

```html
<div class="before-after">
  <div class="before">
    <h4>Regular Price</h4>
    <span class="big-price" 
          data-os-package-price="total-regular" 
          data-os-package-id="6">$354.00</span>
  </div>
  
  <div class="after">
    <h4>Your Price</h4>
    <span class="big-price" 
          data-os-package-price="total-sale" 
          data-os-package-id="6">$285.00</span>
    <small>You save 
      <span data-os-package-price="total-saving-amount" 
            data-os-package-id="6">$69.00</span>
    </small>
  </div>
</div>
```

## Multi-Currency Support

The pricing system automatically:

- Updates currency symbols when country changes
- Refreshes all prices when campaign data changes
- Supports USD ($), CAD (C$), GBP (£), EUR (€), and AUD (A$)

```html
<!-- This will show "$95.00" for US customers and "C$95.00" for Canadian customers -->
<span data-os-package-price="unit-sale" data-os-package-id="6">$95.00</span>
```

## Integration with Country Switching

When users switch countries (via the multi-currency system), all pricing elements automatically:

1. Update to show prices from the new country's campaign
2. Display the correct currency symbol
3. Refresh any package ID mappings

## CSS Styling

Style your pricing elements with CSS:

```css
/* Basic pricing styles */
[data-os-package-price] {
  font-weight: bold;
}

/* Sale prices */
[data-os-package-price*="sale"] {
  color: #e91e63;
  font-size: 1.2em;
}

/* Regular prices */
[data-os-package-price*="regular"] {
  text-decoration: line-through;
  color: #999;
}

/* Savings */
[data-os-package-price*="saving"] {
  color: #4caf50;
  font-weight: bold;
}

/* Hidden elements */
[data-os-package-price][style*="display: none"] {
  /* Ensure smooth hiding */
  opacity: 0;
  transition: opacity 0.3s ease;
}
```

## Manual Refresh

If you dynamically add pricing elements after page load, refresh the DisplayManager:

```javascript
window.on29NextReady.push(function(client) {
  // After adding new pricing elements
  client.display.refresh();
});
```

## Debug Mode

In debug mode, pricing elements will show additional information overlays to help with development and troubleshooting.

## Troubleshooting

### Common Issues

1. **Pricing not showing**: Ensure both `data-os-package-price` and `data-os-package-id` are set
2. **Wrong package ID**: Check that the package ID matches the `ref_id` or `id` in your campaign data
3. **Currency not updating**: Verify that campaign data includes currency information
4. **Elements not hiding**: Check that `data-os-hide-if-zero="true"` is properly set

### Debugging

Use browser dev tools to:
- Check if elements have the correct data attributes
- Verify campaign data includes the package you're referencing
- Look for DisplayManager logs in the console 