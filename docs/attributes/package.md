# Package Attributes

Display package/product data with context awareness. These work within package context or with explicit package ID.

## Basic Package Properties

### Identifiers & Info
```html
<span data-next-display="package.ref_id">Package reference ID</span>
<span data-next-display="package.external_id">External package ID</span>
<span data-next-display="package.name">Package name</span>
<span data-next-display="package.image">Package image URL</span>
```

### Quantity & Units
```html
<span data-next-display="package.qty">Number of units in package</span>
<span data-next-display="package.unitsInPackage">Number of units (alias for qty)</span>
```

### Subscription Info
```html
<span data-next-display="package.is_recurring">If package is recurring</span>
<span data-next-display="package.interval">Recurring interval frequency</span>
<span data-next-display="package.interval_count">Recurring interval count</span>
```

## Pricing Properties

### Base Prices
```html
<span data-next-display="package.price">Per-unit price (formatted)</span>
<span data-next-display="package.price_total">Total package price (formatted)</span>
<span data-next-display="package.unitPrice">Same as package.price (alias)</span>
<span data-next-display="package.packageTotal">Same as package.price_total (alias)</span>
```

### Retail/Compare Prices
```html
<span data-next-display="package.price_retail">Per-unit retail price (formatted)</span>
<span data-next-display="package.price_retail_total">Total retail price (formatted)</span>
<span data-next-display="package.unitRetailPrice">Calculated unit retail price (formatted)</span>
<span data-next-display="package.comparePrice">Compare price (alias for price_retail_total)</span>
<span data-next-display="package.compareTotal">Compare total (alias for price_retail_total)</span>
```

### Recurring Pricing
```html
<span data-next-display="package.price_recurring">Recurring subscription price (formatted)</span>
<span data-next-display="package.price_recurring_total">Total recurring price (formatted)</span>
```

### Discount-Adjusted Prices
```html
<span data-next-display="package.discountedPrice">Unit price after cart discounts</span>
<span data-next-display="package.discountedPriceTotal">Total price after cart discounts</span>
<span data-next-display="package.finalPrice">Final unit price after all discounts</span>
<span data-next-display="package.finalPriceTotal">Final total price after all discounts</span>
```

## Savings & Discounts

### Package Savings (vs Retail Price)
```html
<span data-next-display="package.savingsAmount">Savings vs retail (formatted)</span>
<span data-next-display="package.savingsPercentage">Savings percentage vs retail (formatted)</span>
<span data-next-display="package.unitSavings">Per-unit savings vs retail</span>
<span data-next-display="package.unitSavingsPercentage">Per-unit savings percentage</span>
```

### Cart Discounts Applied
```html
<span data-next-display="package.discountAmount">Discount amount from cart codes</span>
<span data-next-display="package.totalSavingsAmount">Total savings (retail + discounts)</span>
<span data-next-display="package.totalSavingsPercentage">Total savings percentage</span>
<span data-next-display="package.totalSavingsWithDiscounts">Combined savings amount</span>
<span data-next-display="package.totalSavingsPercentageWithDiscounts">Combined savings percentage</span>
```

## Boolean Properties (for conditionals)

```html
<div data-next-show="package.hasSavings">This package has savings vs retail</div>
<div data-next-show="package.hasRetailPrice">This package has retail price</div>
<div data-next-show="package.hasDiscount">This package has cart discount applied</div>
<div data-next-show="package.hasTotalSavings">This package has any savings (retail or discount)</div>
<div data-next-show="package.isBundle">This package is a bundle</div>
<div data-next-show="package.isRecurring">This package is a subscription</div>
<div data-next-show="package.isOneTime">This package is a one time order</div>
```

## Raw Values (unformatted)

### Price Values
```html
<span data-next-display="package.price.raw">Raw price value</span>
<span data-next-display="package.price_total.raw">Raw total price</span>
<span data-next-display="package.price_retail.raw">Raw retail price</span>
<span data-next-display="package.price_retail_total.raw">Raw retail total</span>
<span data-next-display="package.unitPrice.raw">Raw unit price</span>
<span data-next-display="package.finalPrice.raw">Raw final price</span>
<span data-next-display="package.finalPriceTotal.raw">Raw final total</span>
```

### Savings Values
```html
<span data-next-display="package.savingsAmount.raw">Raw savings amount</span>
<span data-next-display="package.savingsPercentage.raw">Raw savings percentage</span>
<span data-next-display="package.discountAmount.raw">Raw discount amount</span>
<span data-next-display="package.totalSavingsAmount.raw">Raw total savings</span>
<span data-next-display="package.totalSavingsPercentage.raw">Raw total savings percentage</span>
```

## Context Usage

### Within Package Context

```html
<div data-next-package-id="5">
  <h3 data-next-display="package.name">Product Name</h3>
  <img data-next-display="package.image" src="" alt="">
  <p data-next-display="package.price">$0.00</p>
  <p data-next-show="package.hasSavings">
    Save <span data-next-display="package.savingsPercentage">0%</span>
  </p>
</div>
```

### Explicit Package Reference

```html
<!-- Reference specific package by ID -->
<span data-next-display="package[5].name">Package 5 Name</span>
<span data-next-display="package[5].price">Package 5 Price</span>
```

## Complete Product Card Example

```html
<div class="product-card" data-next-package-id="3">
  <img data-next-display="package.image" alt="" class="product-image">
  
  <h3 data-next-display="package.name">Product Name</h3>
  
  <div class="pricing">
    <!-- Show final price if discounts applied, otherwise regular price -->
    <span class="price" data-next-display="package.finalPriceTotal">$0.00</span>
    
    <!-- Show retail/compare price -->
    <span class="retail" data-next-show="package.hasRetailPrice">
      <s data-next-display="package.price_retail_total">$0.00</s>
    </span>
  </div>
  
  <!-- Show total savings including discounts -->
  <div class="savings" data-next-show="package.hasTotalSavings">
    <span class="badge">
      Save <span data-next-display="package.totalSavingsPercentage">0%</span>
      (<span data-next-display="package.totalSavingsAmount">$0.00</span>)
    </span>
  </div>
  
  <!-- Show if cart discount is applied -->
  <div class="discount-applied" data-next-show="package.hasDiscount">
    <span class="discount-badge">
      Discount Applied: <span data-next-display="package.discountAmount">$0.00</span>
    </span>
  </div>
  
  <div class="bundle-info" data-next-show="package.isBundle">
    <span data-next-display="package.qty">1</span> pack bundle
  </div>
  
  <div class="subscription" data-next-show="package.isRecurring">
    Delivered every <span data-next-display="package.interval">month</span>
  </div>
  
  <button data-next-action="add-to-cart" data-next-package-id="3">
    Add to Cart
  </button>
</div>
```

## Best Practices

1. **Use Context**: Wrap elements in package container for cleaner code
2. **Show Savings**: Always display savings when available
3. **Bundle Info**: Show quantity for multi-packs
4. **Subscription Details**: Display frequency for recurring items
5. **Fallback Values**: Include default text in spans