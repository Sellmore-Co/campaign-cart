# Selection Display Enhancer - Attributes Reference

The `SelectionDisplayEnhancer` displays values based on the currently selected package in a selector. This enhancer provides real-time updates when users select different packages or quantities.

## Table of Contents

- [Core Display Attributes](#core-display-attributes)
- [Selector Targeting Methods](#selector-targeting-methods)
- [Available Properties](#available-properties)
- [Formatting & Conditional Attributes](#formatting--conditional-attributes)
- [Mathematical Expressions](#mathematical-expressions)
- [Complete Examples](#complete-examples)
- [Best Practices](#best-practices)

---

## Core Display Attributes

### Primary Display Attribute

```html
data-next-display="selection.{property}"
```

This is the main attribute that tells the enhancer what property to display from the selected package.

### Legacy Support

The enhancer also supports legacy attributes for backward compatibility:
- `data-selector-id` (fallback for `data-next-selector-id`)

---

## Selector Targeting Methods

There are three ways to associate a display element with a specific selector:

### 1. Automatic Detection (Recommended for elements inside selector)

```html
<div data-next-cart-selector data-next-selector-id="product-packages">
  <!-- Selector options here -->
  <div data-next-display="selection.total">$0.00</div>
  <div data-next-display="selection.savings">Save $0.00</div>
</div>
```

The enhancer automatically finds the parent selector and uses its selection.

### 2. Explicit Selector ID via Attribute

```html
<div data-next-display="selection.total" data-next-selector-id="product-packages">$0.00</div>
```

Use this when the display element is outside the selector but you want to reference a specific selector.

### 3. Embedded Selector ID in Display Path (Best for remote elements)

```html
<div data-next-display="selection.product-packages.total">$0.00</div>
<div data-next-display="selection.product-packages.compareTotal">$0.00</div>
```

This method embeds the selector ID directly in the display path, making it explicit which selector to watch.

---

## Available Properties

### Basic Selection Properties

| Property | Description | Example Output |
|----------|-------------|----------------|
| `hasSelection` | Boolean indicating if something is selected | `true`/`false` |
| `packageId` | ID of the selected package | `"123"` |
| `quantity` | Selected quantity | `2` |
| `name` | Selected package name | `"Premium Package"` |

### Core Pricing Properties

| Property | Aliases | Description | Example Output |
|----------|---------|-------------|----------------|
| `price` | - | Unit price of selected package | `$29.99` |
| `total` | `price_total` | Total price (price × quantity) | `$59.98` |
| `compareTotal` | `price_retail_total` | Compare/retail price total | `$79.98` |
| `savings` | `savingsAmount` | Amount saved vs. compare price | `$20.00` |
| `savingsPercentage` | - | Percentage saved | `25%` |
| `hasSavings` | - | Boolean if there are savings | `true`/`false` |

### Advanced Calculated Properties

| Property | Aliases | Description | Example Output |
|----------|---------|-------------|----------------|
| `unitPrice` | `pricePerUnit` | Price per individual unit | `$29.99` |
| `totalUnits` | `totalQuantity` | Total quantity selected | `2` |
| `monthlyPrice` | - | Monthly cost (for subscriptions) | `$9.99` |
| `yearlyPrice` | - | Yearly cost | `$119.88` |
| `pricePerDay` | - | Daily cost calculation | `$0.33` |
| `savingsPerUnit` | - | Savings amount per unit | `$10.00` |
| `discountAmount` | - | Discount amount (alias for savings) | `$20.00` |
| `isMultiPack` | `isBundle` | Boolean if quantity > 1 | `true`/`false` |
| `isSingleUnit` | - | Boolean if quantity = 1 | `true`/`false` |

### Custom Package Properties

You can also access any custom properties from your package data:

```html
<!-- Access custom package fields -->
<div data-next-display="selection.custom_field">Custom Value</div>
<div data-next-display="selection.description">Package description</div>
```

---

## Formatting & Conditional Attributes

Since `SelectionDisplayEnhancer` extends `BaseDisplayEnhancer`, it inherits powerful formatting and conditional display capabilities:

### Mathematical Transformations

```html
<!-- Divide the value -->
<div data-next-display="selection.total" data-next-divide-by="100">$0.60</div>

<!-- Multiply the value -->
<div data-next-display="selection.price" data-next-multiply-by="1.2">$35.99</div>
```

### Conditional Display

```html
<!-- Hide if value is zero -->
<div data-next-display="selection.savings" data-next-hide-if-zero="true">Save $0.00</div>

<!-- Hide if value is empty/null -->
<div data-next-display="selection.description" data-next-hide-if-empty="true">Description</div>

<!-- Show only if value is zero -->
<div data-next-display="selection.quantity" data-next-show-if-zero="true">Select quantity</div>

<!-- Hide if boolean is false -->
<div data-next-display="selection.hasSavings" data-next-hide-if-false="true">You're saving!</div>
```

### Custom Format Types

```html
<!-- Force specific formatting -->
<div data-next-display="selection.total" data-next-format="currency">$59.98</div>
<div data-next-display="selection.quantity" data-next-format="number">2</div>
<div data-next-display="selection.savingsPercentage" data-next-format="percentage">25%</div>
```

---

## Mathematical Expressions

You can use mathematical expressions directly in the property path:

### Supported Operators

- `+` Addition
- `-` Subtraction  
- `*` Multiplication
- `/` Division

### Examples

```html
<!-- Calculate 10% of total (tax) -->
<div data-next-display="selection.total*0.1">Tax: $6.00</div>

<!-- Add shipping fee -->
<div data-next-display="selection.total+9.99">Total with shipping: $69.97</div>

<!-- Calculate price after additional discount -->
<div data-next-display="selection.total-5">Final price: $54.98</div>

<!-- Calculate per-item cost including fees -->
<div data-next-display="selection.total+9.99/quantity">Per item with shipping: $34.99</div>
```

---

## Complete Examples

### Basic Product Display

```html
<div data-next-cart-selector data-next-selector-id="supplements">
  <!-- Selector options would be here -->
  
  <!-- Display selected package info -->
  <div class="selected-package-info">
    <h3 data-next-display="selection.name">Select a package</h3>
    <div class="price-display">
      <span class="current-price" data-next-display="selection.total">$0.00</span>
      <span class="compare-price" data-next-display="selection.compareTotal" 
            data-next-hide-if-zero="true">$0.00</span>
    </div>
    <div class="savings-badge" data-next-display="selection.hasSavings" 
         data-next-hide-if-false="true">
      Save <span data-next-display="selection.savingsPercentage">0</span>%
    </div>
  </div>
</div>
```

### Remote Display (Outside Selector)

```html
<!-- Selector is elsewhere on page -->
<div data-next-cart-selector data-next-selector-id="workout-gear">
  <!-- Selector options -->
</div>

<!-- Display elements in header/summary area -->
<div class="cart-summary">
  <div class="selected-item">
    <span data-next-display="selection.workout-gear.name">No selection</span>
    <span data-next-display="selection.workout-gear.total">$0.00</span>
  </div>
  
  <!-- Show savings only if there are any -->
  <div class="savings" data-next-display="selection.workout-gear.hasSavings" 
       data-next-hide-if-false="true">
    You save <span data-next-display="selection.workout-gear.savings">$0.00</span>!
  </div>
</div>
```

### Advanced Calculations

```html
<!-- Monthly subscription display -->
<div class="subscription-info">
  <div class="monthly-cost" data-next-display="selection.monthlyPrice">$0.00/month</div>
  <div class="daily-cost" data-next-display="selection.pricePerDay">$0.00/day</div>
  
  <!-- Custom calculations -->
  <div class="quarterly-cost" data-next-display="selection.monthlyPrice*3">$0.00/quarter</div>
  <div class="cost-per-serving" data-next-display="selection.total/30">$0.00/serving</div>
</div>
```

### Conditional Content Sections

```html
<!-- Show different content based on selection state -->
<div data-next-display="selection.hasSelection" data-next-hide-if-false="true">
  <h4>Your Selection:</h4>
  <p data-next-display="selection.name"></p>
  <p>Quantity: <span data-next-display="selection.quantity"></span></p>
  <p>Total: <span data-next-display="selection.total"></span></p>
</div>

<div data-next-display="selection.hasSelection" data-next-hide-if-true="true">
  <p>Please select a package to see pricing.</p>
</div>

<!-- Bundle-specific messaging -->
<div data-next-display="selection.isBundle" data-next-hide-if-false="true">
  <p>🎉 Bundle discount applied! You're getting a great deal.</p>
</div>
```

### E-commerce Product Page

```html
<div class="product-page">
  <!-- Product selector -->
  <div data-next-cart-selector data-next-selector-id="protein-powder">
    <!-- Package options would be here -->
  </div>
  
  <!-- Pricing section -->
  <div class="pricing-section">
    <div class="main-price">
      <span class="currency">$</span>
      <span class="amount" data-next-display="selection.total">0.00</span>
    </div>
    
    <div class="compare-price" data-next-display="selection.compareTotal" 
         data-next-hide-if-zero="true">
      <span class="label">Compare at:</span>
      <span class="price" data-next-display="selection.compareTotal">$0.00</span>
    </div>
    
    <div class="savings-highlight" data-next-display="selection.hasSavings" 
         data-next-hide-if-false="true">
      <span class="savings-text">You Save:</span>
      <span class="savings-amount" data-next-display="selection.savings">$0.00</span>
      <span class="savings-percent">(<span data-next-display="selection.savingsPercentage">0</span>% off)</span>
    </div>
  </div>
  
  <!-- Value propositions -->
  <div class="value-props">
    <div class="prop" data-next-display="selection.isBundle" data-next-hide-if-false="true">
      ✅ <span data-next-display="selection.quantity">1</span> Month Supply
    </div>
    <div class="prop">
      💰 Just <span data-next-display="selection.pricePerDay">$0.00</span> per day
    </div>
    <div class="prop" data-next-display="selection.hasSavings" data-next-hide-if-false="true">
      🎯 Save <span data-next-display="selection.savingsPerUnit">$0.00</span> per unit
    </div>
  </div>
</div>
```

---

## Best Practices

### 1. Use Semantic Property Names

```html
<!-- Good: Clear what the value represents -->
<div data-next-display="selection.total">$0.00</div>
<div data-next-display="selection.savingsPercentage">0%</div>

<!-- Avoid: Ambiguous property names -->
<div data-next-display="selection.value">$0.00</div>
```

### 2. Provide Fallback Content

```html
<!-- Good: Meaningful fallback text -->
<div data-next-display="selection.name">Select a package</div>
<div data-next-display="selection.total">$0.00</div>

<!-- Poor: No context when nothing is selected -->
<div data-next-display="selection.name"></div>
```

### 3. Use Conditional Display Appropriately

```html
<!-- Good: Hide savings when there are none -->
<div data-next-display="selection.savings" data-next-hide-if-zero="true">
  Save $0.00
</div>

<!-- Good: Show different content based on state -->
<div data-next-display="selection.hasSelection" data-next-hide-if-false="true">
  Your selection: <span data-next-display="selection.name"></span>
</div>
```

### 4. Leverage Mathematical Expressions

```html
<!-- Good: Calculate related values -->
<div data-next-display="selection.total*0.08">Tax: $0.00</div>
<div data-next-display="selection.total+shipping">Total with shipping: $0.00</div>

<!-- Good: Per-unit calculations -->
<div data-next-display="selection.total/quantity">Per item: $0.00</div>
```

### 5. Embedded Selector IDs for Remote Elements

```html
<!-- Good: Explicit selector reference for remote elements -->
<div class="sticky-summary">
  <span data-next-display="selection.main-products.total">$0.00</span>
</div>

<!-- Good: Multiple selectors on same page -->
<div data-next-display="selection.supplements.total">$0.00</div>
<div data-next-display="selection.accessories.total">$0.00</div>
```

---

## Event Integration

The SelectionDisplayEnhancer automatically listens for these events:

- `selector:selection-changed` - When a new package is selected
- `selector:item-selected` - Alternative event for item selection

These events are automatically fired by compatible selector enhancers, ensuring real-time updates across all display elements.

---

## Troubleshooting

### Common Issues

1. **Display not updating**: Ensure the selector ID matches between the selector and display elements
2. **Wrong values**: Check that the property name is spelled correctly and exists in your package data
3. **Formatting issues**: Use appropriate format types or mathematical expressions for calculations
4. **Hidden elements**: Check conditional display attributes that might be hiding content

### Debug Tips

- Use browser dev tools to check for console errors
- Verify that the selector enhancer is properly initialized
- Check that package data includes the properties you're trying to display
- Test with simple properties first (like `name` or `total`) before using complex calculations
``` 