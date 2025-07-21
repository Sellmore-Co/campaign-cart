# NextCommerce SDK Attribute Reference

This document lists all available HTML attributes and display properties in the NextCommerce SDK.

## Display Attributes

### Core Display Attributes

| Attribute | Description | Example |
|-----------|-------------|---------|
| `data-next-display` | Specifies what data to display | `data-next-display="cart.total"` |
| `data-next-format` | Format type for the value | `data-next-format="currency"` |
| `data-hide-if-zero` | Hide element if value is 0 | `data-hide-if-zero="true"` |
| `data-hide-if-false` | Hide element if value is false | `data-hide-if-false="true"` |
| `data-divide-by` | Divide the value by a number | `data-divide-by="100"` |
| `data-multiply-by` | Multiply the value by a number | `data-multiply-by="1.2"` |

### Format Types
- `currency` - Format as currency ($99.99)
- `number` - Format with thousand separators (1,234)
- `percentage` - Format as percentage (25%)
- `boolean` - Format as Yes/No
- `date` - Format as date
- `auto` - Auto-detect format (default)

## Display Properties

### Cart Properties

```html
<!-- Totals (formatted by default) -->
<div data-next-display="cart.subtotal">$100.00</div>
<div data-next-display="cart.total">$112.99</div>
<div data-next-display="cart.shipping">$9.99</div>
<div data-next-display="cart.tax">$3.00</div>
<div data-next-display="cart.discounts">$10.00</div>
<div data-next-display="cart.savingsAmount">$20.00</div>
<div data-next-display="cart.savingsPercentage">15%</div>
<div data-next-display="cart.compareTotal">$132.99</div>

<!-- Quantities -->
<div data-next-display="cart.count">3</div>
<div data-next-display="cart.itemCount">3</div>
<div data-next-display="cart.quantity">5</div>

<!-- Booleans -->
<div data-next-display="cart.isEmpty">No</div>
<div data-next-display="cart.hasItems">Yes</div>
<div data-next-display="cart.hasSavings">Yes</div>

<!-- Raw values (unformatted) -->
<div data-next-display="cart.total.raw">112.99</div>
<div data-next-display="cart.subtotal.raw">100</div>
```

### Package Properties

```html
<!-- Basic properties -->
<div data-next-display="package.12.name">Product Name</div>
<div data-next-display="package.12.description">Description</div>
<div data-next-display="package.12.sku">SKU123</div>

<!-- Prices (auto-formatted as currency) -->
<div data-next-display="package.12.price">$65.00</div>
<div data-next-display="package.12.unitPrice">$65.00</div>
<div data-next-display="package.12.price_retail">$149.00</div>
<div data-next-display="package.12.price_total">$195.00</div>
<div data-next-display="package.12.price_retail_total">$447.00</div>
<div data-next-display="package.12.compareTotal">$149.00</div>
<div data-next-display="package.12.packageTotal">$195.00</div>

<!-- Discount-Adjusted Prices -->
<div data-next-display="package.12.discountedPrice">$55.00</div>
<div data-next-display="package.12.discountedPriceTotal">$165.00</div>
<div data-next-display="package.12.finalPrice">$55.00</div>
<div data-next-display="package.12.finalPriceTotal">$165.00</div>
<div data-next-display="package.12.discountAmount">$30.00</div>

<!-- Calculated values -->
<div data-next-display="package.12.savingsAmount">$84.00</div>
<div data-next-display="package.12.savingsPercentage">56%</div>

<!-- Quantities -->
<div data-next-display="package.12.qty">3</div>
<div data-next-display="package.12.unitsInPackage">3</div>

<!-- Booleans -->
<div data-next-display="package.12.hasSavings">Yes</div>
<div data-next-display="package.12.hasDiscount">Yes</div>
<div data-next-display="package.12.isBundle">Yes</div>
<div data-next-display="package.12.isRecurring">No</div>
```

#### Package Context Options

Package properties can be accessed in three ways:

1. **Specific Package ID**: `package.123.price`
2. **Package Context**: Inside element with `data-next-package-id="123"`
3. **Selection Context**: `selection.main-selector.price`

### Campaign Properties

```html
<div data-next-display="campaign.name">Summer Sale</div>
<div data-next-display="campaign.currency">USD</div>
<div data-next-display="campaign.language">en</div>
```

### Order Properties

```html
<div data-next-display="order.refId">ORD-12345</div>
<div data-next-display="order.total">$199.99</div>
<div data-next-display="order.createdAt">2024-01-01</div>
<div data-next-display="order.paymentMethod">Credit Card</div>
<div data-next-display="order.supportsUpsells">Yes</div>
<div data-next-display="order.isTest">No</div>
```

### Selection Properties (for package selectors)

```html
<!-- Basic selection properties -->
<div data-next-display="selection.packageId">12</div>
<div data-next-display="selection.quantity">2</div>
<div data-next-display="selection.name">Selected Product</div>
<div data-next-display="selection.total">$130.00</div>
<div data-next-display="selection.savingsAmount">$168.00</div>
<div data-next-display="selection.unitPrice">$65.00</div>

<!-- Selection with discount properties -->
<div data-next-display="selection.main-selector.finalPrice">$24.99</div>
<div data-next-display="selection.main-selector.finalPriceTotal">$74.97</div>
<div data-next-display="selection.main-selector.discountAmount">$15.00</div>
<div data-next-display="selection.main-selector.hasDiscount">Yes</div>
<div data-next-display="selection.main-selector.appliedDiscountAmount">$5.00</div>
```

### Shipping Properties

```html
<div data-next-display="shipping.name">Standard Shipping</div>
<div data-next-display="shipping.cost">$9.99</div>
<div data-next-display="shipping.code">STANDARD</div>
<div data-next-display="shipping.isFree">No</div>
```

## Action Attributes

### Cart Actions

#### Add to Cart
```html
<button data-next-action="add-to-cart" 
        data-next-package-id="12"
        data-next-quantity="1"
        data-next-url="/checkout"
        data-next-clear-cart="true">
  Add to Cart
</button>

<!-- With selector -->
<button data-next-action="add-to-cart" 
        data-next-selector-id="product-selector">
  Add Selected
</button>
```

#### Remove from Cart
```html
<button data-next-action="remove-item" 
        data-next-package-id="12">
  Remove
</button>
```

#### Update Quantity
```html
<div data-next-quantity-control 
     data-next-package-id="12">
  <button data-next-quantity-action="decrease">-</button>
  <input type="number" value="1" />
  <button data-next-quantity-action="increase">+</button>
</div>
```

#### Cart Toggle
```html
<button data-next-action="toggle-cart">
  Open/Close Cart
</button>
```

#### Accept Upsell
```html
<button data-next-action="accept-upsell" 
        data-next-package-id="15"
        data-next-quantity="1"
        data-next-url="/thank-you">
  Accept Offer
</button>
```

### Package Selector
```html
<div data-next-package-selector 
     data-next-selector-id="main-selector"
     data-next-mode="single">
  
  <div data-next-package-option 
       data-next-package-id="12"
       data-next-quantity="1"
       data-next-pre-selected="true">
    Option 1
  </div>
  
  <div data-next-package-option 
       data-next-package-id="13">
    Option 2
  </div>
</div>
```

### Coupon
```html
<div data-next-coupon>
  <input type="text" data-next-coupon-input placeholder="Enter code" />
  <button data-next-coupon-apply>Apply</button>
  <button data-next-coupon-remove>Remove</button>
  <div data-next-coupon-message></div>
</div>
```

### Checkout Form
```html
<form data-next-checkout-form
      data-next-success-url="/thank-you"
      data-next-test-mode="true">
  <!-- Form fields auto-detected -->
</form>
```

### Upsell
```html
<!-- Direct upsell -->
<div data-next-upsell="offer" 
     data-next-package-id="20">
  <button data-next-upsell-action="add">Add to Order</button>
  <button data-next-upsell-action="skip">No Thanks</button>
</div>

<!-- Upsell selector -->
<div data-next-upsell-selector 
     data-next-selector-id="protection">
  <div data-next-upsell-option 
       data-next-package-id="21">
    1 Year Protection
  </div>
  <div data-next-upsell-option 
       data-next-package-id="22">
    2 Year Protection
  </div>
  <button data-next-upsell-action="add">Add Selected</button>
</div>
```

## UI Enhancement Attributes

### Accordion
```html
<div data-next-accordion 
     data-next-accordion-id="faq"
     data-next-multi="true">
  
  <div data-next-accordion-item>
    <div data-next-accordion-trigger>Question 1</div>
    <div data-next-accordion-content>Answer 1</div>
  </div>
</div>
```

### Timer
```html
<div data-next-timer 
     data-next-duration="600"
     data-next-action="redirect"
     data-next-url="/expired"
     data-next-persist="session">
  <span data-next-timer-minutes>10</span>:
  <span data-next-timer-seconds>00</span>
</div>
```

### Conditional Display
```html
<!-- Show/hide based on conditions -->
<div data-next-show-if="cart.hasItems">
  Cart has items!
</div>

<div data-next-hide-if="cart.isEmpty">
  Checkout button
</div>

<!-- Multiple conditions -->
<div data-next-show-if="cart.hasItems,cart.total>50">
  Free shipping available!
</div>
```

## Cart Display Enhancement
```html
<!-- Auto-updates with cart state -->
<div data-next-cart>
  <div data-next-cart-items>
    <!-- Cart items render here -->
  </div>
  <div data-next-cart-empty>
    Your cart is empty
  </div>
  <div data-next-cart-totals>
    <!-- Totals render here -->
  </div>
</div>
```

## Order Display Enhancement
```html
<div data-next-order-display>
  <div data-next-order-items>
    <!-- Order items render here -->
  </div>
  <div data-next-order-totals>
    <!-- Order totals render here -->
  </div>
</div>
```

## ProspectCart (Checkout Form Persistence)
```html
<form data-next-prospect-cart
      data-next-auto-save="true"
      data-next-save-delay="1000">
  <!-- Form data auto-saved -->
</form>
```

## Express Checkout
```html
<div data-next-express-checkout>
  <div data-next-express-paypal></div>
  <div data-next-express-apple-pay></div>
  <div data-next-express-google-pay></div>
</div>
```

## Notes

1. **Smart Formatting**: Price-related properties automatically format as currency
2. **Override Format**: Use `data-next-format` to override auto-detection
3. **Raw Values**: Append `.raw` to any property for unformatted values
4. **Package Context**: Package IDs can be inherited from parent elements
5. **Conditional Logic**: Use `data-next-show-if` and `data-next-hide-if` for visibility
6. **Event System**: All actions emit events you can listen to with `window.next.on()`
7. **Discount Calculations**: 
   - Discount properties update in real-time based on cart state
   - `finalPrice` and `discountedPrice` are synonyms
   - Package-specific discounts take precedence over order-level discounts
   - Fixed-amount order discounts are distributed proportionally

## Package Discount Display Examples

### Product Card with Discount
```html
<div class="product-card" data-next-package-id="123">
  <h3 data-next-display="package.name">Product Name</h3>
  
  <!-- Price display with discount -->
  <div class="pricing">
    <!-- Original price (struck through if discounted) -->
    <span class="original-price" data-next-show="package.hasDiscount">
      <s data-next-display="package.price_total">$89.97</s>
    </span>
    
    <!-- Final price after discounts -->
    <span class="final-price" data-next-display="package.finalPriceTotal">$74.97</span>
    
    <!-- Discount badge -->
    <span class="discount-badge" data-next-show="package.hasDiscount">
      Save <span data-next-display="package.discountAmount">$15.00</span>!
    </span>
  </div>
</div>
```

### Dynamic Pricing Display
```html
<div class="product-pricing" data-next-package-id="789">
  <!-- No discounts -->
  <div data-next-hide="package.hasDiscount">
    <span class="price" data-next-display="package.price_total">$89.97</span>
  </div>
  
  <!-- Has discounts -->
  <div data-next-show="package.hasDiscount">
    <span class="was-price">Was: <s data-next-display="package.price_total">$89.97</s></span>
    <span class="now-price">Now: <span data-next-display="package.finalPriceTotal">$74.97</span></span>
    <span class="savings">You Save: <span data-next-display="package.discountAmount">$15.00</span></span>
  </div>
</div>
```

## Quick Reference

```html
<!-- Display cart total -->
<span data-next-display="cart.total"></span>

<!-- Add to cart with redirect -->
<button data-next-action="add-to-cart" 
        data-next-package-id="12"
        data-next-url="/checkout">
  Buy Now
</button>

<!-- Package selector with display -->
<div data-next-package-selector data-next-selector-id="main">
  <div data-next-package-option data-next-package-id="12">
    <span data-next-display="package.12.name"></span>
    <span data-next-display="package.12.price"></span>
  </div>
</div>

<!-- Conditional free shipping message -->
<div data-next-show-if="cart.total>100">
  Free shipping on orders over $100!
</div>
```