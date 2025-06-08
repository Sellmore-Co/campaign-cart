# Selectors Guide

[← Product Profiles](product-profiles.md) | [Timers →](timers.md)

Complete guide to implementing product selectors for choosing between different packages, plans, or product variations.

## Overview

Campaign Cart's selector system enables users to choose between different product options in a swap-style interface. When a user selects an option, it automatically manages cart updates, applies shipping methods, and displays dynamic pricing with unit calculations.

Selectors work seamlessly with [Product Profiles](product-profiles.md) and [Multi-Currency](multi-currency.md) features.

## Basic Selector Implementation

### Simple Product Selector

```html
<div data-os-component="selector" 
     data-os-selection-mode="swap" 
     data-os-id="plan-selector">
  
  <!-- Option 1 - Pre-selected -->
  <div data-os-element="card" 
       data-os-package="1" 
       data-os-quantity="1" 
       data-os-selected="true">
    <h3 class="card-title">Basic Plan</h3>
    <div class="pb-quantity__price pb--current">$19.99 USD</div>
    <p>Perfect for individuals</p>
  </div>
  
  <!-- Option 2 -->
  <div data-os-element="card" 
       data-os-package="2" 
       data-os-quantity="1">
    <h3 class="card-title">Pro Plan</h3>
    <div class="pb-quantity__price pb--current">$39.99 USD</div>
    <p>Great for teams</p>
  </div>
  
</div>
```

### Complete Selector Example

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Product Selector</title>
  
  <meta name="os-api-key" content="YOUR_API_KEY">
  
  <script src="https://rtc2.29next.com/campaign-cart/29next.min.js"></script>
  
  <style>
    .product-selector { max-width: 1000px; margin: 2rem auto; padding: 2rem; }
    .selector-container { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem; margin: 2rem 0; }
    .product-card { border: 2px solid #e1e8ed; border-radius: 12px; padding: 2rem; cursor: pointer; transition: all 0.3s ease; background: white; }
    .product-card:hover { border-color: #3498db; box-shadow: 0 4px 12px rgba(52, 152, 219, 0.15); }
    .product-card.os--selected { border-color: #2ecc71; background: #f8fff9; box-shadow: 0 4px 12px rgba(46, 204, 113, 0.2); }
    .product-card.os--active { transform: translateY(-2px); }
    .card-header { text-align: center; margin-bottom: 1.5rem; }
    .card-title { margin: 0 0 0.5rem 0; color: #2c3e50; }
    .card-price { font-size: 2rem; font-weight: bold; color: #2ecc71; margin: 0.5rem 0; }
    .card-features { list-style: none; padding: 0; margin: 1rem 0; }
    .card-features li { padding: 0.5rem 0; border-bottom: 1px solid #ecf0f1; }
    .card-features li:last-child { border-bottom: none; }
    .card-features li:before { content: "✓ "; color: #2ecc71; font-weight: bold; }
    .selected-indicator { background: #2ecc71; color: white; padding: 0.25rem 0.75rem; border-radius: 20px; font-size: 0.8rem; font-weight: bold; }
  </style>
</head>
<body>
  
  <div class="product-selector">
    
    <h1>Choose Your Plan</h1>
    <p>Select the perfect plan for your needs. You can upgrade or downgrade at any time.</p>
    
    <div data-os-component="selector" 
         data-os-selection-mode="swap" 
         data-os-id="subscription-plans">
      
      <div class="selector-container">
        
        <!-- Starter Plan -->
        <div data-os-element="card" 
             data-os-package="starter-plan" 
             data-os-quantity="1" 
             data-os-selected="true">
          
          <div class="card-header">
            <h3 class="card-title">Starter</h3>
            <div class="card-price">$9.99<span style="font-size: 1rem;">/month</span></div>
          </div>
          
          <ul class="card-features">
            <li>Up to 5 users</li>
            <li>10GB storage</li>
            <li>Basic support</li>
            <li>Mobile app access</li>
          </ul>
          
        </div>
        
        <!-- Professional Plan -->
        <div data-os-element="card" 
             data-os-package="pro-plan" 
             data-os-quantity="1">
          
          <div class="card-header">
            <h3 class="card-title">Professional</h3>
            <div class="card-price">$19.99<span style="font-size: 1rem;">/month</span></div>
            <div class="selected-indicator" style="display: none;">Most Popular</div>
          </div>
          
          <ul class="card-features">
            <li>Up to 25 users</li>
            <li>100GB storage</li>
            <li>Priority support</li>
            <li>Advanced analytics</li>
            <li>API access</li>
          </ul>
          
        </div>
        
        <!-- Enterprise Plan -->
        <div data-os-element="card" 
             data-os-package="enterprise-plan" 
             data-os-quantity="1">
          
          <div class="card-header">
            <h3 class="card-title">Enterprise</h3>
            <div class="card-price">$49.99<span style="font-size: 1rem;">/month</span></div>
          </div>
          
          <ul class="card-features">
            <li>Unlimited users</li>
            <li>1TB storage</li>
            <li>24/7 phone support</li>
            <li>Custom integrations</li>
            <li>Dedicated account manager</li>
          </ul>
          
        </div>
        
      </div>
    </div>
    
    <!-- Cart Summary -->
    <div style="text-align: center; margin-top: 2rem; padding: 1rem; background: #f8f9fa; border-radius: 8px;">
      <p><strong>Selected Plan Total: <span data-os-cart-total>$0.00</span></strong></p>
      <button os-checkout-payment="combo" style="background: #2ecc71; color: white; border: none; padding: 1rem 2rem; border-radius: 4px; font-size: 1.1rem; cursor: pointer;">
        Continue to Checkout
      </button>
    </div>
    
  </div>
  
</body>
</html>
```

## Selector Attributes

### Container Attributes

```html
<div data-os-component="selector" 
     data-os-selection-mode="swap" 
     data-os-id="unique-selector-id">
  <!-- Cards go here -->
</div>
```

| Attribute | Required | Description |
|-----------|----------|-------------|
| `data-os-component` | ✅ | Must be `"selector"` |
| `data-os-selection-mode` | ✅ | Must be `"swap"` (only mode supported) |
| `data-os-id` | ✅ | Unique identifier for this selector |

### Card Attributes

```html
<div data-os-element="card" 
     data-os-package="product-id" 
     data-os-quantity="1" 
     data-os-selected="true"
     data-os-shipping-id="express">
  <!-- Card content -->
</div>
```

| Attribute | Required | Description |
|-----------|----------|-------------|
| `data-os-element` | ✅ | Must be `"card"` |
| `data-os-package` | ✅ | Package/product ID |
| `data-os-quantity` | | Quantity to add (default: 1) |
| `data-os-selected` | | Pre-select this card (`"true"`) |
| `data-os-shipping-id` | | Shipping method to apply when selected |

## Dynamic Pricing with Unit Calculations

### Basic Price Display

```html
<div data-os-element="card" data-os-package="bundle-pack">
  
  <h3>Value Bundle</h3>
  
  <!-- Basic pricing -->
  <div class="pricing">
    <span class="current-price" data-card-price="total-sale">$79.99</span>
    <span class="original-price" data-card-price="total-regular">$99.99</span>
    <span class="savings" data-card-price="total-saving-amount">$20.00</span>
  </div>
  
  <!-- Unit pricing -->
  <div class="unit-pricing">
    <p>Per item: <span data-card-price="each-sale">$15.99</span></p>
    <p>Save: <span data-card-price="saving-percentage">20%</span> per item</p>
  </div>
  
</div>
```

### Advanced Unit Pricing with Custom Divisions

```html
<div data-os-element="card" data-os-package="facial-package">
  
  <h3>Facial Treatment Package</h3>
  <p>12 sessions included</p>
  
  <!-- Price per treatment (divide total by 12) -->
  <div class="per-treatment">
    <span>Per treatment: </span>
    <span data-card-price="total-sale" data-divide-by="12">$25.00</span>
  </div>
  
  <!-- Original price per treatment -->
  <div class="original-per-treatment">
    <span>Regular price per treatment: </span>
    <span data-card-price="total-regular" data-divide-by="12">$35.00</span>
  </div>
  
  <!-- Savings per treatment -->
  <div class="savings-per-treatment">
    <span>Save per treatment: </span>
    <span data-card-price="total-saving-amount" data-divide-by="12">$10.00</span>
  </div>
  
  <!-- Total package price -->
  <div class="package-total">
    <strong>Package Total: <span data-card-price="total-sale">$300.00</span></strong>
  </div>
  
</div>
```

## Price Display Attributes

### Available Price Types

| Attribute Value | Description | Example |
|-----------------|-------------|---------|
| `each-sale` | Sale price per unit | `$15.99` |
| `each-regular` | Regular price per unit | `$19.99` |
| `saving-amount` | Savings amount per unit | `$4.00` |
| `saving-percentage` | Savings percentage | `20%` |
| `total-sale` | Total sale price | `$79.99` |
| `total-regular` | Total regular price | `$99.99` |
| `total-saving-amount` | Total savings amount | `$20.00` |
| `total-saving-percentage` | Total savings percentage | `20%` |

### Price Modifiers

```html
<!-- Hide element if price is zero -->
<span data-card-price="saving-amount" data-hide-if-zero="true">$0.00</span>

<!-- Divide price by custom amount -->
<span data-card-price="total-sale" data-divide-by="6">$16.67</span>

<!-- Hide container if price is zero -->
<div data-container="true">
  <span>You save: </span>
  <span data-card-price="saving-amount" data-hide-if-zero="true">$5.00</span>
</div>
```

## CSS Classes and Styling

### Automatic CSS Classes

Campaign Cart automatically applies these classes:

- `.os--selected` - Applied to the currently selected card
- `.os--active` - Applied when the item is in the cart

### Complete Styling Example

```css
/* Card base styling */
[data-os-element="card"] {
  border: 2px solid #e1e8ed;
  border-radius: 8px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  background: white;
  position: relative;
}

/* Hover state */
[data-os-element="card"]:hover {
  border-color: #3498db;
  box-shadow: 0 4px 12px rgba(52, 152, 219, 0.15);
  transform: translateY(-2px);
}

/* Selected state */
[data-os-element="card"].os--selected {
  border-color: #2ecc71;
  background: linear-gradient(135deg, #f8fff9 0%, #e8f8f5 100%);
  box-shadow: 0 4px 16px rgba(46, 204, 113, 0.3);
}

/* Active in cart state */
[data-os-element="card"].os--active {
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
}

/* Selected indicator */
[data-os-element="card"].os--selected::after {
  content: "✓ Selected";
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: #2ecc71;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: bold;
}

/* Price styling */
[data-card-price] {
  font-weight: bold;
}

[data-card-price*="regular"] {
  text-decoration: line-through;
  color: #999;
}

[data-card-price*="sale"] {
  color: #2ecc71;
}

[data-card-price*="saving"] {
  color: #e74c3c;
}

/* Responsive grid */
.selector-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
}

@media (max-width: 768px) {
  .selector-container {
    grid-template-columns: 1fr;
  }
  
  [data-os-element="card"] {
    padding: 1rem;
  }
}
```

## Advanced Selector Examples

### Product Bundle Selector

```html
<div data-os-component="selector" 
     data-os-selection-mode="swap" 
     data-os-id="bundle-selector">
  
  <!-- Single Item -->
  <div data-os-element="card" data-os-package="single-item">
    <h3>Single Product</h3>
    <div class="pricing">
      <span data-card-price="total-sale">$29.99</span>
    </div>
    <p>Just one item</p>
  </div>
  
  <!-- 3-Pack Bundle -->
  <div data-os-element="card" data-os-package="3-pack" data-os-selected="true">
    <h3>3-Pack Bundle</h3>
    <div class="badge">Most Popular</div>
    <div class="pricing">
      <span data-card-price="total-sale">$79.99</span>
      <span data-card-price="total-regular">$89.97</span>
    </div>
    <div class="unit-pricing">
      <p>Per item: <span data-card-price="each-sale">$26.66</span></p>
      <p>Save: <span data-card-price="saving-percentage">11%</span></p>
    </div>
  </div>
  
  <!-- 6-Pack Bundle -->
  <div data-os-element="card" data-os-package="6-pack">
    <h3>6-Pack Bundle</h3>
    <div class="badge best-value">Best Value</div>
    <div class="pricing">
      <span data-card-price="total-sale">$149.99</span>
      <span data-card-price="total-regular">$179.94</span>
    </div>
    <div class="unit-pricing">
      <p>Per item: <span data-card-price="each-sale">$25.00</span></p>
      <p>Save: <span data-card-price="saving-percentage">17%</span></p>
    </div>
  </div>
  
</div>
```

### Subscription Plans with Shipping

```html
<div data-os-component="selector" 
     data-os-selection-mode="swap" 
     data-os-id="subscription-selector">
  
  <!-- Monthly Plan -->
  <div data-os-element="card" 
       data-os-package="monthly-plan" 
       data-os-shipping-id="standard">
    <h3>Monthly Subscription</h3>
    <div class="pricing">
      <span data-card-price="total-sale">$19.99</span>
      <small>/month</small>
    </div>
    <p>Standard shipping included</p>
  </div>
  
  <!-- Quarterly Plan -->
  <div data-os-element="card" 
       data-os-package="quarterly-plan" 
       data-os-shipping-id="express"
       data-os-selected="true">
    <h3>Quarterly Subscription</h3>
    <div class="pricing">
      <span data-card-price="total-sale">$54.99</span>
      <span data-card-price="total-regular">$59.97</span>
      <small>/3 months</small>
    </div>
    <div class="unit-pricing">
      <p>Per month: <span data-card-price="total-sale" data-divide-by="3">$18.33</span></p>
    </div>
    <p>Express shipping included</p>
  </div>
  
  <!-- Annual Plan -->
  <div data-os-element="card" 
       data-os-package="annual-plan" 
       data-os-shipping-id="priority">
    <h3>Annual Subscription</h3>
    <div class="pricing">
      <span data-card-price="total-sale">$199.99</span>
      <span data-card-price="total-regular">$239.88</span>
      <small>/year</small>
    </div>
    <div class="unit-pricing">
      <p>Per month: <span data-card-price="total-sale" data-divide-by="12">$16.67</span></p>
      <p>Save: <span data-card-price="saving-percentage">17%</span></p>
    </div>
    <p>Priority shipping included</p>
  </div>
  
</div>
```

## JavaScript Integration

### Listening to Selection Changes

```javascript
// Listen for cart updates when selections change
document.addEventListener('cart.updated', (e) => {
  const cart = e.detail.cart;
  console.log('Cart updated after selection:', cart);
  
  // Update UI based on selection
  updateSelectedPlanDisplay(cart);
});

function updateSelectedPlanDisplay(cart) {
  const selectedPlan = cart.items[0]; // Assuming single selection
  if (selectedPlan) {
    document.getElementById('selected-plan-name').textContent = selectedPlan.name;
    document.getElementById('selected-plan-price').textContent = `$${selectedPlan.price}`;
  }
}
```

### Programmatic Selection

```javascript
// Trigger card selection programmatically
function selectCard(cardElement) {
  // Simulate click on the card
  cardElement.click();
}

// Select by package ID
function selectByPackageId(packageId) {
  const card = document.querySelector(`[data-os-element="card"][data-os-package="${packageId}"]`);
  if (card) {
    card.click();
  }
}

// Example usage
selectByPackageId('pro-plan');
```

### Refreshing Selector Pricing

```javascript
// Refresh pricing after coupon application or country change
window.twentyNineNext.onReady(() => {
  // Refresh all selector pricing
  window.twentyNineNext.selector.refreshUnitPricing();
});

// Listen for country changes and refresh pricing
document.addEventListener('os:country.changed', (e) => {
  console.log('Country changed to:', e.detail.country);
  
  // Refresh selector pricing for new country
  setTimeout(() => {
    window.twentyNineNext.selector.refreshUnitPricing();
  }, 100);
});
```

## Multiple Selectors

### Independent Selectors

```html
<!-- Product Type Selector -->
<div data-os-component="selector" 
     data-os-selection-mode="swap" 
     data-os-id="product-type">
  
  <div data-os-element="card" data-os-package="shampoo" data-os-selected="true">
    <h3>Shampoo</h3>
    <span data-card-price="total-sale">$24.99</span>
  </div>
  
  <div data-os-element="card" data-os-package="conditioner">
    <h3>Conditioner</h3>
    <span data-card-price="total-sale">$26.99</span>
  </div>
  
</div>

<!-- Size Selector -->
<div data-os-component="selector" 
     data-os-selection-mode="swap" 
     data-os-id="size-selector">
  
  <div data-os-element="card" data-os-package="size-small" data-os-selected="true">
    <h3>8 oz</h3>
    <span data-card-price="total-sale">$19.99</span>
  </div>
  
  <div data-os-element="card" data-os-package="size-large">
    <h3>16 oz</h3>
    <span data-card-price="total-sale">$34.99</span>
    <div class="unit-pricing">
      Per oz: <span data-card-price="total-sale" data-divide-by="16">$2.19</span>
    </div>
  </div>
  
</div>
```

## Best Practices

1. **Clear visual hierarchy** - Make selected states obvious
2. **Consistent pricing format** - Use the same price display pattern
3. **Mobile optimization** - Ensure cards work well on small screens
4. **Loading states** - Show placeholders while pricing loads
5. **Accessibility** - Include proper ARIA labels and keyboard navigation
6. **Progressive enhancement** - Ensure basic functionality without JavaScript
7. **Performance** - Minimize DOM queries in price updates

## Troubleshooting

### Selector Not Working

```javascript
// Check if selector is properly initialized
const selectors = document.querySelectorAll('[data-os-component="selector"]');
console.log('Selectors found:', selectors.length);

// Check required attributes
selectors.forEach(selector => {
  console.log('Selector ID:', selector.getAttribute('data-os-id'));
  console.log('Selection Mode:', selector.getAttribute('data-os-selection-mode'));
  
  const cards = selector.querySelectorAll('[data-os-element="card"]');
  console.log('Cards in selector:', cards.length);
});
```

### Pricing Not Updating

```javascript
// Force refresh unit pricing
window.twentyNineNext.onReady(() => {
  window.twentyNineNext.selector.refreshUnitPricing();
});

// Check if campaign data is loaded
console.log('Campaign data:', window.twentyNineNext.getCampaignData());
```

### Selection Not Syncing with Cart

```javascript
// Check cart state
window.twentyNineNext.onReady(() => {
  const cart = window.twentyNineNext.cart.getState();
  console.log('Current cart:', cart);
  
  // Check if item is in cart
  const packageId = 'your-package-id';
  const inCart = window.twentyNineNext.cart.isItemInCart(packageId);
  console.log(`Package ${packageId} in cart:`, inCart);
});
```

## Related Features

### Core Features
- [Shopping Cart](shopping-cart.md) - Cart management with selectors
- [Product Profiles](product-profiles.md) - Use profiles with selectors
- [Multi-Currency](multi-currency.md) - International pricing in selectors
- [Timers](timers.md) - Add urgency to selection

### Configuration
- [Basic Configuration](../configuration/basic-config.md) - Selector display options
- [Advanced Configuration](../configuration/advanced-config.md) - Complex selector scenarios

### Developer Resources
- [JavaScript API](../../api/javascript-api.md#selector-methods) - Selector API methods
- [HTML Attributes](../../api/html-attributes.md#selectors) - Selector attributes reference
- [Events Reference](../../api/events-reference.md#selector-events) - Selector event tracking
- [Examples](../../examples/basic-implementation.md#product-selector-page) - Selector implementation examples