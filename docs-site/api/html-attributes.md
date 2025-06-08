# HTML Attributes Reference

Campaign Cart uses data attributes to create interactive elements without writing JavaScript.

## Attribute Prefix

Campaign Cart attributes use `data-os-*` prefix for most functionality and `os-*` for checkout-specific elements.

## Cart Action Attributes

### Toggle Items (Add/Remove from Cart)

#### `data-os-action="toggle-item"`
Toggle item in cart with package or profile ID.

```html
<!-- Package-based toggle -->
<button data-os-action="toggle-item" data-os-package="1">
  Toggle Product
</button>

<!-- Profile-based toggle -->
<button data-os-action="toggle-item" data-os-profile="starter-kit">
  Toggle Starter Kit
</button>

<!-- With quantity -->
<button data-os-action="toggle-item" 
        data-os-package="1" 
        data-os-quantity="2">
  Add 2 Items
</button>

<!-- Mark as upsell -->
<button data-os-action="toggle-item" 
        data-os-package="1" 
        data-os-upsell="true">
  Add Upsell
</button>
```

## Cart Display Attributes

### Cart Summary

#### `data-os-cart="summary"`
Container for cart summary display.

```html
<div data-os-cart="summary">
  <!-- Cart content will be rendered here -->
</div>
```

### Cart Counters and Totals

#### `data-os-cart-count`
Display number of items in cart.

```html
<span data-os-cart-count>0</span>
```

#### `data-os-cart-total`
Display cart total amount.

```html
<span data-os-cart-total>$0.00</span>
```

### Detailed Cart Elements

#### `data-os-cart-summary="*"`
Specific cart summary elements:

```html
<!-- Line items container -->
<div data-os-cart-summary="line-display"></div>

<!-- Individual line item -->
<div data-os-cart-summary="line-item">
  <span data-os-cart-summary="line-title">Product Name</span>
  <span data-os-cart-summary="line-sale">$29.99</span>
  <span data-os-cart-summary="line-compare">$39.99</span>
  <button data-os-cart-summary="remove-line">Remove</button>
</div>

<!-- Subtotal and totals -->
<span data-os-cart-summary="subtotal">$0.00</span>
<span data-os-cart-summary="grand-total">$0.00</span>
<span data-os-cart-summary="savings-amount">$10.00</span>
<span data-os-cart-summary="currency-symbol">$</span>
```

## Checkout Attributes

### Main Checkout Button

#### `os-checkout-payment="combo"`
Primary checkout button.

```html
<button os-checkout-payment="combo">Proceed to Checkout</button>
```

### Express Checkout

#### Express Payment Buttons
```html
<button os-checkout-payment="paypal">PayPal</button>
<button os-checkout-payment="apple-pay">Apple Pay</button>
<button os-checkout-payment="google-pay">Google Pay</button>
```

### Checkout Form Fields

#### `os-checkout-field="*"`
Form field mapping:

```html
<!-- Customer information -->
<input os-checkout-field="fname" placeholder="First Name">
<input os-checkout-field="lname" placeholder="Last Name">
<input os-checkout-field="phone" placeholder="Phone">

<!-- Shipping address -->
<input os-checkout-field="address1" placeholder="Address">
<input os-checkout-field="city" placeholder="City">
<select os-checkout-field="province">
  <option value="CA">California</option>
</select>
<input os-checkout-field="postal" placeholder="ZIP Code">
<select os-checkout-field="country">
  <option value="US">United States</option>
</select>

<!-- Billing address (if different) -->
<input os-checkout-field="billing-fname" placeholder="Billing First Name">
<input os-checkout-field="billing-address1" placeholder="Billing Address">
<!-- ... other billing fields ... -->

<!-- Payment information -->
<select os-checkout-field="payment-method">
  <option value="credit_card">Credit Card</option>
</select>
```

## Product Selectors

### Selector Component

#### `data-os-component="selector"`
Create product selector groups.

```html
<div data-os-component="selector" 
     data-os-selection-mode="swap" 
     data-os-id="package-selector">
  
  <div data-os-element="card" 
       data-os-package="1" 
       data-os-selected="true">
    <h3>Package 1</h3>
    <span data-os-package-price data-os-package-id="1">$29.99</span>
  </div>
  
  <div data-os-element="card" 
       data-os-package="2">
    <h3>Package 2</h3>
    <span data-os-package-price data-os-package-id="2">$49.99</span>
  </div>
  
</div>
```

## Timer Attributes

### Timer Component

#### `data-os-element="timer"`
Create countdown timers.

```html
<div data-os-element="timer" 
     data-os-duration="3600" 
     data-os-format="hh:mm:ss"
     data-os-persistence-id="offer-timer">
  <span data-os-element="timer-text">01:00:00</span>
</div>

<!-- Timer with expiry text -->
<div data-os-element="timer" 
     data-os-duration="86400"
     data-os-expiry-text="Offer Expired!"
     data-os-replace-entire-content="true">
  23:59:59
</div>
```

## Price Display Attributes

### Package Pricing

#### `data-os-package-price`
Display package prices.

```html
<span data-os-package-price data-os-package-id="1">$29.99</span>

<!-- With formatting options -->
<span data-os-package-price 
      data-os-package-id="1"
      data-os-show-decimals="true"
      data-os-hide-if-zero="true">$29.99</span>

<!-- Subunit pricing (e.g., price per day) -->
<span data-os-package-price 
      data-os-package-id="1"
      data-os-divide-by="30">$1.00 per day</span>
```

### Profile Pricing

#### `data-os-profile-price`
Display profile prices.

```html
<span data-os-profile-price data-os-profile-id="starter-kit">$29.99</span>
```

## Conditional Display

### Show/Hide Based on Cart State

#### `data-os-in-cart="display"`
Conditional display based on cart contents.

```html
<!-- Show when cart has items -->
<div data-os-in-cart="display" data-container="true">
  <p>You have items in your cart!</p>
</div>

<!-- Hide when value is zero -->
<span data-hide-if-zero="true" data-os-package-price data-os-package-id="1">
  $0.00
</span>
```

## Upsell Attributes

### Upsell Actions

#### Upsell Accept/Decline
```html
<button data-os-upsell="accept" data-os-package-id="5">
  Yes, Add This!
</button>

<button data-os-upsell="decline" data-os-next-url="/receipt">
  No Thanks
</button>
```

## Receipt Attributes

### Receipt Data Display

#### `data-os-receipt="*"`
Display order information on receipt pages.

```html
<!-- Customer info -->
<span data-os-receipt="fname">John</span>
<span data-os-receipt="billing_fname">John Doe</span>

<!-- Addresses -->
<div data-os-receipt="billing_address">123 Main St</div>
<div data-os-receipt="shipping_address">123 Main St</div>

<!-- Order details -->
<span data-os-receipt="order_number">12345</span>
<div data-os-receipt="order-lines">
  <!-- Order line items rendered here -->
</div>
<span data-os-receipt="total">$29.99</span>
```

## Complete Working Example

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Campaign Cart Example</title>
  <meta name="os-api-key" content="YOUR_API_KEY">
  <script src="https://rtc2.29next.com/campaign-cart/29next.min.js"></script>
</head>
<body>
  
  <!-- Product selector -->
  <div data-os-component="selector" data-os-selection-mode="swap">
    <div data-os-element="card" data-os-package="1">
      <h3>Starter Kit</h3>
      <p>Price: <span data-os-package-price data-os-package-id="1">$29.99</span></p>
    </div>
    <div data-os-element="card" data-os-package="2">
      <h3>Pro Bundle</h3>
      <p>Price: <span data-os-package-price data-os-package-id="2">$49.99</span></p>
    </div>
  </div>
  
  <!-- Add to cart button -->
  <button data-os-action="toggle-item" data-os-package="1">
    Add to Cart
  </button>
  
  <!-- Cart summary -->
  <div data-os-in-cart="display" data-container="true">
    <h3>Your Cart</h3>
    <p>Items: <span data-os-cart-count>0</span></p>
    <p>Total: <span data-os-cart-total>$0.00</span></p>
    <div data-os-cart="summary"></div>
    <button os-checkout-payment="combo">Checkout</button>
  </div>
  
  <!-- Timer -->
  <div data-os-element="timer" data-os-duration="3600">
    <p>Offer expires in: <span data-os-element="timer-text">01:00:00</span></p>
  </div>
  
</body>
</html>
```