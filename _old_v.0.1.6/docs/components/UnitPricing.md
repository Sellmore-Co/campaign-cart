# Price Display for Selector Cards

The SelectorManager includes functionality to display pricing information in selector cards for both unit prices and total package prices. This is particularly useful for showing price breakdowns when selling packages with multiple units.

## Overview

The price display feature automatically calculates and displays:

- **Per-unit prices:**
  - Price per unit (sale price)
  - Original price per unit (regular price)
  - Savings per unit (amount)
  - Savings per unit (percentage)

- **Total package prices:**
  - Total package price (sale price)
  - Total original package price (regular price)
  - Total savings amount
  - Total savings percentage

- **Per-subunit prices** (using the divide-by feature):
  - Price per facial/item (when a unit contains multiple items)
  - Original price per facial/item
  - Savings per facial/item

## Benefits of Consistent Attribute Naming

This implementation uses a consistent naming pattern with the `data-card-price` attribute and follows these naming conventions:

- Unit price attributes start with `each-`: `each-sale`, `each-regular`
- Total price attributes start with `total-`: `total-sale`, `total-regular`
- Savings attributes use clear descriptors: `saving-amount`, `saving-percentage`, `total-saving-amount`, `total-saving-percentage`

This consistency makes it:
- Easier to implement in your HTML templates
- More maintainable as your needs evolve
- Simpler to understand for new developers
- Cleaner when inspecting the code

## Usage

To display pricing information in your selector cards, add elements with the appropriate data attributes:

```html
<div data-os-component="selector" data-os-selection-mode="swap" data-os-id="QS08">
  <div class="selector-cards">
    <div data-os-element="card" data-os-package="6" data-os-quantity="1">
      <div class="card-content">
        <div class="card-title">3 Month Supply</div>
        <div class="card-subtitle">
          <strong>3x The All-In-One Facial® Set</strong>
          <br>(12 Facials + 3 Brushes)
        </div>
        
        <!-- Total package price (what you pay today) -->
        <div class="price-row">
          <span class="label">Package price:</span>
          <span data-card-price="total-sale">$285.00</span>
          <span data-card-price="total-regular" class="strike">$354.00</span>
          <span data-card-price="total-saving-percentage" class="badge">20% OFF</span>
        </div>
        
        <!-- Price per set (month supply) -->
        <div class="price-row">
          <span class="label">Price per set:</span>
          <span data-card-price="each-sale">$95.00</span>
          <span class="unit-label">/set</span>
        </div>
        
        <!-- Price per facial (using divide-by) -->
        <div class="price-row">
          <span class="label">Price per facial:</span>
          <span data-card-price="each-sale" data-divide-by="4">$23.75</span>
          <span class="unit-label">/facial</span>
        </div>
      </div>
    </div>
  </div>
</div>
```

## Available Data Attributes

### Price Display Attributes

| Attribute | Description | Example Value |
|-----------|-------------|---------------|
| **Unit Pricing** | | |
| `data-card-price="each-sale"` | Price per unit (sale price) | $95.00 |
| `data-card-price="each-regular"` | Original price per unit (regular price) | $118.00 |
| `data-card-price="saving-amount"` | Amount saved per unit | $23.00 |
| `data-card-price="saving-percentage"` | Percentage saved per unit | 20% OFF |
| **Total Package Pricing** | | |
| `data-card-price="total-sale"` | Total package price (sale price) | $285.00 |
| `data-card-price="total-regular"` | Total original package price (regular price) | $354.00 |
| `data-card-price="total-saving-amount"` | Total amount saved | $69.00 |
| `data-card-price="total-saving-percentage"` | Total percentage saved | 20% OFF |

### Subunit Pricing with data-divide-by

Use the `data-divide-by` attribute with any price attribute to calculate price per subunit (e.g., per facial when a package contains multiple facials):

| Usage | Description | Example |
|-------|-------------|---------|
| `data-card-price="each-sale" data-divide-by="4"` | Divides the unit price by 4 | `<div data-card-price="each-sale" data-divide-by="4">$23.75</div>` |

This is useful when a package contains multiple units of the same product. For example, if a facial set contains 4 facials, you can show the price per facial by adding `data-divide-by="4"` to the price element.

## Optional Configuration Attributes

You can add additional attributes to control the behavior:

| Attribute | Description | Default |
|-----------|-------------|---------|
| `data-hide-if-zero="true"` | Hides the element if the value is 0 or negative | false |
| `data-container="true"` | When added to a parent element, this element will be hidden if a child with `data-hide-if-zero="true"` has a zero value | - |

## How It Works

1. The SelectorManager queries the campaign data for each package referenced in your selector cards
2. For each card, it calculates:
   - Total units (from the `qty` property in the campaign data)
   - Total package prices (from `price_total` and `price_retail_total` properties)
   - Unit prices (total price divided by total units)
   - Savings amounts and percentages
3. These values are inserted into elements with the appropriate data attributes
4. If a `data-divide-by` attribute is present, the price is further divided to show price per subunit

## Example: Package Tiers with Different Pricing Displays

Here's how you might implement pricing displays for different package tiers:

### 1-Month Supply (Package ID 1)
```html
<div data-os-element="card" data-os-package="1" data-os-quantity="1">
  <div class="card-content">
    <h3>1-Month Supply</h3>
    <p>(4 Facials + 1 Brush)</p>
    
    <!-- Total package price -->
    <div class="price-row">
      <span data-card-price="total-sale">$118.00</span>
    </div>
    
    <!-- Per facial price -->
    <div class="price-row">
      <span>Just </span>
      <span data-card-price="each-sale" data-divide-by="4">$29.50</span>
      <span> per facial</span>
    </div>
  </div>
</div>
```

### 2-Month Supply (Package ID 5)
```html
<div data-os-element="card" data-os-package="5" data-os-quantity="1">
  <div class="card-content">
    <h3>2-Month Supply</h3>
    <p>(8 Facials + 2 Brushes)</p>
    
    <!-- Total package price with savings -->
    <div class="price-row">
      <span data-card-price="total-regular" class="strike">$236.00</span>
      <span data-card-price="total-sale">$198.00</span>
      <span data-card-price="total-saving-percentage" class="badge">16% OFF</span>
    </div>
    
    <!-- Per set pricing -->
    <div class="price-row">
      <span>$</span><span data-card-price="each-sale">99.00</span>
      <span> per month</span>
    </div>
    
    <!-- Per facial price -->
    <div class="price-row">
      <span>Only </span>
      <span data-card-price="each-sale" data-divide-by="4">$24.75</span>
      <span> per facial</span>
    </div>
  </div>
</div>
```

### 3-Month Supply (Package ID 6)
```html
<div data-os-element="card" data-os-package="6" data-os-quantity="1">
  <div class="card-content">
    <h3>3-Month Supply (Best Value)</h3>
    <p>(12 Facials + 3 Brushes)</p>
    
    <!-- Total package price with savings -->
    <div class="price-row total">
      <span class="label">Total:</span>
      <span data-card-price="total-regular" class="strike">$354.00</span>
      <span data-card-price="total-sale">$285.00</span>
    </div>
    
    <!-- Total savings -->
    <div class="price-row savings">
      <span class="label">You save:</span>
      <span data-card-price="total-saving-amount">$69.00</span>
      <span class="percentage">(<span data-card-price="total-saving-percentage">20%</span>)</span>
    </div>
    
    <!-- Per set pricing -->
    <div class="price-row">
      <span>$</span><span data-card-price="each-sale">95.00</span>
      <span> per month</span>
    </div>
    
    <!-- Per facial price -->
    <div class="price-row">
      <span>Just </span>
      <span data-card-price="each-sale" data-divide-by="4">$23.75</span>
      <span> per facial</span>
      <span class="best-value-tag">(BEST VALUE)</span>
    </div>
  </div>
</div>
```

## Example: Full Implementation with Both Unit and Total Pricing

This example shows how to display both total package pricing and unit pricing for a 3-month supply package:

```html
<div data-os-component="selector" data-os-selection-mode="swap" data-os-id="product-selector">
  <div class="selector-cards">
    <div data-os-element="card" data-os-package="6" data-os-quantity="1">
      <div class="card-content">
        <div class="card-title">3 Month Supply</div>
        <div class="card-subtitle">
          <strong>3x The Product Set</strong> (12 facials total)
        </div>
        
        <!-- Total Package Price -->
        <div class="price-block total-price">
          <h4>Package Price</h4>
          <div class="price-row">
            <span data-card-price="total-regular" class="original-price">$354.00</span>
            <span data-card-price="total-sale" class="sale-price">$285.00</span>
            <span data-card-price="total-saving-percentage" class="savings-badge">20% OFF</span>
          </div>
          <div class="savings-row">
            <span>You save:</span>
            <span data-card-price="total-saving-amount">$69.00</span>
          </div>
        </div>
        
        <!-- Per Set Pricing -->
        <div class="price-block per-set">
          <h4>Price Per Monthly Set</h4>
          <div class="price-row">
            <span data-card-price="each-regular" class="original-price">$118.00</span>
            <span data-card-price="each-sale" class="sale-price">$95.00</span>
            <span class="unit-label">/set</span>
          </div>
        </div>
        
        <!-- Per Facial Pricing -->
        <div class="price-block per-facial">
          <h4>Price Per Facial</h4>
          <div class="price-row">
            <span data-card-price="each-regular" data-divide-by="4" class="original-price">$29.50</span>
            <span data-card-price="each-sale" data-divide-by="4" class="sale-price">$23.75</span>
            <span class="unit-label">/facial</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
```

## Advanced Usage

The pricing is calculated on page load. If you need to refresh the pricing (e.g., after changing campaign data), you can call:

```javascript
window.on29NextReady = window.on29NextReady || [];
window.on29NextReady.push(function(client) {
  // Refresh pricing
  client.selector.refreshUnitPricing();
});
``` 