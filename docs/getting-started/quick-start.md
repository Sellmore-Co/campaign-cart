# Quick Start Guide

Get up and running with the Next Commerce JS SDK in 5 minutes.

## Step 1: Add the SDK

```html
<!DOCTYPE html>
<html>
<head>
  <!-- Campaign API Key -->
  <meta name="next-api-key" content="your-api-key-here">
  
  <!-- Load SDK -->
  <script src="https://campaign-cart-v2.pages.dev/loader.js"></script>
</head>
<body>
  <!-- Your content here -->
</body>
</html>
```

## Step 2: Add a Simple Product Selector

```html
<!-- Product selector with swap mode -->
<div data-next-cart-selector data-next-selection-mode="swap">
  <div data-next-selector-card data-next-package-id="1">
    <h3>Basic Package</h3>
    <span data-next-display="package.price">$99</span>
  </div>
  
  <div data-next-selector-card data-next-package-id="2" data-next-selected="true">
    <h3>Premium Package</h3>
    <span data-next-display="package.price">$199</span>
  </div>
</div>
```

## Step 3: Display Cart Information

```html
<!-- Cart summary -->
<div>
  <h4>Cart Summary</h4>
  <p>Items: <span data-next-display="cart.quantity">0</span></p>
  <p>Total: <span data-next-display="cart.total">$0.00</span></p>
</div>

<!-- Show message when cart is empty -->
<div data-next-show="cart.isEmpty">
  Your cart is empty
</div>
```

## Step 4: Add Direct Add to Cart Button

```html
<!-- Direct add to cart button -->
<button data-next-action="add-to-cart"
        data-next-package-id="3"
        data-next-quantity="1">
  Add to Cart
</button>

<!-- Add and redirect to checkout -->
<button data-next-action="add-to-cart"
        data-next-package-id="3"
        data-next-quantity="1"
        data-next-url="/checkout">
  Buy Now
</button>
```

## Complete Example

```html
<!DOCTYPE html>
<html>
<head>
  <meta name="next-api-key" content="your-api-key-here">
  <script src="https://campaign-cart-v2.pages.dev/loader.js"></script>
</head>
<body>
  <h1>Product Page</h1>
  
  <!-- Product selector -->
  <div data-next-cart-selector data-next-selection-mode="swap">
    <div data-next-selector-card data-next-package-id="1">
      <h3>1 Pack - <span data-next-display="package.price">$99</span></h3>
    </div>
    <div data-next-selector-card data-next-package-id="2" data-next-selected="true">
      <h3>3 Pack - <span data-next-display="package.price">$199</span></h3>
      <span data-next-display="package.savingsPercentage">Save 30%</span>
    </div>
  </div>
  
  <!-- Cart info -->
  <div>
    <p>Cart Total: <span data-next-display="cart.total">$0.00</span></p>
  </div>
</body>
</html>
```

## Next Steps

- Learn about [cart selectors](../cart-system/selectors.md)
- Add [toggle buttons](../cart-system/buttons.md)
- Implement [upsells](../upsells/overview.md)