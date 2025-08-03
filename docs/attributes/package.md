# Package Attributes

Display package/product data with context awareness. These work within package context or with explicit package ID.

## Basic Package Properties

```html
<span data-next-display="package.name">Package name</span>
<span data-next-display="package.image">Package image URL</span>
<span data-next-display="package.qty">Number of units in package</span>
<span data-next-display="package.is_recurring">If package is recurring</span>
<span data-next-display="package.interval">Recurring interval frequency</span>
```

## Pricing Properties

```html
<span data-next-display="package.price">Per-unit price (formatted)</span>
<span data-next-display="package.price_total">Total package price (formatted)</span>
<span data-next-display="package.price_retail">Per-unit retail price (formatted)</span>
<span data-next-display="package.price_retail_total">Total retail price (formatted)</span>
<span data-next-display="package.unitPrice">Same as package.price (alias)</span>
<span data-next-display="package.packageTotal">Same as package.price_total (alias)</span>
```

## Calculated Fields

```html
<span data-next-display="package.savingsAmount">Total savings amount (formatted)</span>
<span data-next-display="package.savingsPercentage">Savings percentage (formatted)</span>
<span data-next-display="package.unitSavings">Per-unit savings amount</span>
<span data-next-display="package.unitSavingsPercentage">Per-unit savings percentage</span>
<span data-next-display="package.finalPrice">Unit price after discounts</span>
<span data-next-display="package.finalPriceTotal">Total price after discounts</span>
<span data-next-display="package.discountAmount">Amount saved from discount codes</span>
```

## Boolean Properties (for conditionals)

```html
<div data-next-show="package.hasSavings">This package has savings</div>
<div data-next-show="package.hasRetailPrice">This package has retail</div>
<div data-next-show="package.isBundle">This package is a bundle</div>
<div data-next-show="package.isRecurring">This package is a subscription</div>
<div data-next-show="package.isOneTime">This package is a one time order</div>
```

## Raw Values (unformatted)

```html
<span data-next-display="package.price.raw">Raw price value</span>
<span data-next-display="package.savingsAmount.raw">Raw savings amount</span>
<span data-next-display="package.savingsPercentage.raw">Raw savings percentage</span>
<span data-next-display="package.unitPrice.raw">Raw unit price</span>
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
    <span class="price" data-next-display="package.price">$0.00</span>
    <span class="retail" data-next-show="package.hasRetailPrice">
      <s data-next-display="package.price_retail">$0.00</s>
    </span>
  </div>
  
  <div class="savings" data-next-show="package.hasSavings">
    <span class="badge">
      Save <span data-next-display="package.savingsPercentage">0%</span>
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