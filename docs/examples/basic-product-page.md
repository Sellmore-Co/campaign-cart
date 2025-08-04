# Basic Product Page Example

Complete implementation of a product page with the Next Commerce JS SDK.

## Full HTML Example

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Product Page - Drone Pro X</title>
  
  <!-- SDK Configuration -->
  <meta name="next-api-key" content="your-api-key-here">
  <meta name="next-page-type" content="product">
  <meta name="next-debug" content="true">
  
  <!-- SDK Script -->
  <script src="https://campaign-cart-v2.pages.dev/loader.js"></script>
  
  <!-- Basic Styles -->
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }
    
    .product-container {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 40px;
      margin-top: 40px;
    }
    
    .product-image {
      width: 100%;
      height: auto;
      border-radius: 8px;
    }
    
    .package-selector {
      display: flex;
      flex-direction: column;
      gap: 10px;
      margin: 20px 0;
    }
    
    .package-card {
      border: 2px solid #ddd;
      padding: 15px;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    
    .package-card:hover {
      border-color: #007bff;
    }
    
    .package-card.next-selected {
      border-color: #007bff;
      background: #e7f3ff;
    }
    
    .price {
      font-size: 24px;
      font-weight: bold;
      color: #333;
    }
    
    .savings {
      color: #28a745;
      font-weight: 500;
    }
    
    .add-to-cart {
      background: #007bff;
      color: white;
      border: none;
      padding: 15px 30px;
      font-size: 18px;
      border-radius: 8px;
      cursor: pointer;
      width: 100%;
      margin-top: 20px;
    }
    
    .add-to-cart:hover {
      background: #0056b3;
    }
    
    .cart-summary {
      position: fixed;
      top: 20px;
      right: 20px;
      background: white;
      border: 1px solid #ddd;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    
    [data-next-await]::before {
      content: '';
      position: absolute;
      inset: 0;
      background: #f0f0f0;
      animation: pulse 1.5s infinite;
    }
    
    @keyframes pulse {
      0%, 100% { opacity: 0.6; }
      50% { opacity: 0.8; }
    }
  </style>
</head>
<body>
  <!-- Cart Summary -->
  <div class="cart-summary" data-next-await>
    <h3>Cart</h3>
    <p data-next-show="cart.isEmpty">Your cart is empty</p>
    <div data-next-show="cart.hasItems">
      <p>Items: <span data-next-display="cart.quantity">0</span></p>
      <p>Total: <span data-next-display="cart.total">$0.00</span></p>
      <a href="/checkout">Checkout</a>
    </div>
  </div>

  <!-- Product Page -->
  <div class="product-container">
    <!-- Product Images -->
    <div class="product-images">
      <img src="/images/drone-main.jpg" alt="Drone Pro X" class="product-image">
    </div>
    
    <!-- Product Info -->
    <div class="product-info">
      <h1>Drone Pro X - Professional Camera Drone</h1>
      
      <!-- Package Selector -->
      <div class="package-selector" data-next-cart-selector data-next-selection-mode="swap">
        <!-- Single Unit -->
        <div class="package-card" data-next-selector-card data-next-package-id="1">
          <h3>Single Drone</h3>
          <p class="price" data-next-display="package.price">$599</p>
          <p>Perfect for beginners</p>
        </div>
        
        <!-- Bundle Option -->
        <div class="package-card" data-next-selector-card data-next-package-id="2" data-next-selected="true">
          <h3>Pro Bundle (Most Popular)</h3>
          <p class="price" data-next-display="package.price">$899</p>
          <p class="savings" data-next-show="package.hasSavings">
            Save <span data-next-display="package.savingsPercentage">25%</span>
            (<span data-next-display="package.savingsAmount">$300</span>)
          </p>
          <ul>
            <li>1x Drone Pro X</li>
            <li>2x Extra Batteries</li>
            <li>Carrying Case</li>
            <li>Extra Propellers</li>
          </ul>
        </div>
        
        <!-- Ultimate Bundle -->
        <div class="package-card" data-next-selector-card data-next-package-id="3">
          <h3>Ultimate Bundle</h3>
          <p class="price" data-next-display="package.price">$1299</p>
          <p class="savings" data-next-show="package.hasSavings">
            Save <span data-next-display="package.savingsPercentage">35%</span>
            (<span data-next-display="package.savingsAmount">$700</span>)
          </p>
          <ul>
            <li>Everything in Pro Bundle</li>
            <li>Advanced Controller</li>
            <li>ND Filter Set</li>
            <li>1 Year Warranty</li>
          </ul>
        </div>
      </div>
      
      <!-- Add to Cart Button -->
      <button class="add-to-cart" data-next-action="add-to-cart" data-next-url="/checkout">
        Add to Cart - <span data-next-display="selection.main-product.price">$899</span>
      </button>
      
      <!-- Accessories -->
      <div class="accessories" style="margin-top: 40px;">
        <h3>Recommended Accessories</h3>
        
        <!-- Extra Battery Toggle -->
        <div style="margin: 10px 0; padding: 15px; border: 1px solid #ddd; border-radius: 8px;">
          <label style="display: flex; justify-content: space-between; align-items: center;">
            <span>Extra Battery Pack (+$79)</span>
            <button data-next-toggle 
                    data-next-package-id="10"
                    data-add-text="Add"
                    data-remove-text="✓ Added"
                    style="padding: 5px 15px;">
              Add
            </button>
          </label>
        </div>
        
        <!-- Protection Plan -->
        <div style="margin: 10px 0; padding: 15px; border: 1px solid #ddd; border-radius: 8px;">
          <label style="display: flex; justify-content: space-between; align-items: center;">
            <span>2-Year Protection Plan (+$99)</span>
            <button data-next-toggle 
                    data-next-package-id="11"
                    data-next-package-sync="1,2,3"
                    data-add-text="Add Protection"
                    data-remove-text="✓ Protected"
                    style="padding: 5px 15px;">
              Add Protection
            </button>
          </label>
        </div>
      </div>
    </div>
  </div>

  <!-- Initialize FOMO and Exit Intent -->
  <script>
    window.addEventListener('next:initialized', function() {
      // Start FOMO notifications
      next.fomo({
        initialDelay: 5000,
        displayDuration: 5000,
        delayBetween: 15000
      });
      
      // Setup exit intent
      next.exitIntent({
        image: '/images/special-offer.jpg',
        action: async () => {
          const result = await next.applyCoupon('SAVE10');
          if (result.success) {
            alert('10% discount applied!');
          }
        }
      });
      
      // Track events
      next.on('cart:item-added', (data) => {
        console.log('Item added to cart:', data);
      });
    });
  </script>
</body>
</html>
```

## Key Features Demonstrated

1. **Package Selector** - Swap mode for instant cart updates
2. **Dynamic Pricing** - Prices update based on selection
3. **Savings Display** - Show discounts conditionally
4. **Accessories** - Toggle buttons for add-ons
5. **Cart Summary** - Real-time cart display
6. **FOMO Notifications** - Social proof
7. **Exit Intent** - Recover abandoning visitors
8. **Loading States** - Skeleton loading

## Responsive Version

Add these styles for mobile:

```css
@media (max-width: 768px) {
  .product-container {
    grid-template-columns: 1fr;
  }
  
  .cart-summary {
    position: static;
    margin-bottom: 20px;
  }
  
  .package-card {
    font-size: 14px;
  }
  
  .add-to-cart {
    position: sticky;
    bottom: 20px;
    z-index: 100;
  }
}
```

## Analytics Integration

```javascript
// Add Google Analytics tracking
next.on('cart:item-added', (data) => {
  if (typeof gtag !== 'undefined') {
    gtag('event', 'add_to_cart', {
      currency: 'USD',
      value: data.item.price,
      items: [{
        item_id: data.item.packageId,
        item_name: data.item.name,
        price: data.item.price,
        quantity: data.item.quantity
      }]
    });
  }
});
```