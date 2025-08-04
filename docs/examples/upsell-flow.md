# Complete Upsell Flow Example

Multi-page upsell sequence implementation demonstrating different upsell patterns.

## Page 1: First Upsell (Direct Offer)

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Special Offer - Extra Battery Pack</title>
  
  <!-- SDK Configuration -->
  <meta name="next-api-key" content="your-api-key-here">
  <meta name="next-page-type" content="upsell">
  <meta name="next-upsell-accept-url" content="/upsell-2">
  <meta name="next-upsell-decline-url" content="/upsell-2">
  
  <!-- SDK Script -->
  <script src="https://campaign-cart-v2.pages.dev/loader.js"></script>
  
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      margin: 0;
      padding: 0;
      background: #f5f5f5;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
    }
    
    .upsell-container {
      background: white;
      max-width: 600px;
      padding: 40px;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
      text-align: center;
    }
    
    .badge {
      background: #ffc107;
      color: #333;
      padding: 5px 15px;
      border-radius: 20px;
      display: inline-block;
      margin-bottom: 20px;
      font-weight: 500;
    }
    
    .product-image {
      width: 300px;
      height: auto;
      margin: 20px 0;
    }
    
    .price {
      font-size: 36px;
      font-weight: bold;
      color: #333;
      margin: 20px 0;
    }
    
    .original-price {
      text-decoration: line-through;
      color: #999;
      font-size: 24px;
      margin-right: 10px;
    }
    
    .savings {
      color: #28a745;
      font-size: 20px;
      margin: 10px 0;
    }
    
    .buttons {
      display: flex;
      gap: 15px;
      margin-top: 30px;
    }
    
    .btn {
      flex: 1;
      padding: 15px 30px;
      border: none;
      border-radius: 8px;
      font-size: 18px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
    }
    
    .btn-accept {
      background: #28a745;
      color: white;
    }
    
    .btn-accept:hover {
      background: #218838;
    }
    
    .btn-decline {
      background: #e0e0e0;
      color: #333;
    }
    
    .btn-decline:hover {
      background: #d0d0d0;
    }
    
    .timer {
      color: #dc3545;
      font-weight: 500;
      margin: 20px 0;
    }
  </style>
</head>
<body>
  <div class="upsell-container" data-next-upsell="offer" data-next-package-id="10">
    <span class="badge">LIMITED TIME OFFER</span>
    
    <h1>Wait! Don't Fly Without Extra Power!</h1>
    
    <img src="/images/battery-pack.jpg" alt="Extra Battery Pack" class="product-image">
    
    <p style="font-size: 18px;">Your Drone Pro X needs power to capture those amazing shots. Never miss a moment with our extra battery pack!</p>
    
    <div class="price">
      <span class="original-price" data-next-display="package.price_retail">$119</span>
      <span data-next-display="package.price">$79</span>
    </div>
    
    <p class="savings" data-next-show="package.hasSavings">
      Save <span data-next-display="package.savingsAmount">$40</span> 
      (<span data-next-display="package.savingsPercentage">33%</span> OFF)
    </p>
    
    <div class="timer">
      ⏰ Offer expires in: <span id="countdown">05:00</span>
    </div>
    
    <ul style="text-align: left; max-width: 400px; margin: 20px auto;">
      <li>Extra 30 minutes flight time</li>
      <li>Quick-swap design</li>
      <li>LED charge indicator</li>
      <li>1-year warranty included</li>
    </ul>
    
    <div class="buttons">
      <button class="btn btn-accept" data-next-upsell-action="add">
        Yes! Add to My Order
      </button>
      <button class="btn btn-decline" data-next-upsell-action="skip">
        No Thanks
      </button>
    </div>
    
    <p style="margin-top: 20px; opacity: 0.7; font-size: 14px;">
      This one-time offer won't be shown again
    </p>
  </div>
  
  <script>
    // Countdown timer
    let timeLeft = 300; // 5 minutes
    const countdown = document.getElementById('countdown');
    
    const timer = setInterval(() => {
      const minutes = Math.floor(timeLeft / 60);
      const seconds = timeLeft % 60;
      countdown.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
      
      if (timeLeft <= 0) {
        clearInterval(timer);
        // Auto-decline after timer expires
        document.querySelector('[data-next-upsell-action="skip"]').click();
      }
      timeLeft--;
    }, 1000);
  </script>
</body>
</html>
```

## Page 2: Second Upsell (Selection Pattern)

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Protect Your Investment</title>
  
  <!-- SDK Configuration -->
  <meta name="next-api-key" content="your-api-key-here">
  <meta name="next-page-type" content="upsell">
  <meta name="next-upsell-accept-url" content="/upsell-3">
  <meta name="next-upsell-decline-url" content="/upsell-3">
  
  <!-- SDK Script -->
  <script src="https://campaign-cart-v2.pages.dev/loader.js"></script>
  
  <style>
    /* Previous styles... */
    
    .protection-options {
      display: grid;
      gap: 15px;
      margin: 30px 0;
    }
    
    .protection-card {
      border: 2px solid #ddd;
      padding: 20px;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s;
      text-align: left;
    }
    
    .protection-card:hover {
      border-color: #007bff;
    }
    
    .protection-card.next-selected {
      border-color: #007bff;
      background: #e7f3ff;
    }
    
    .protection-card h3 {
      margin: 0 0 10px 0;
      color: #333;
    }
    
    .protection-price {
      font-size: 24px;
      font-weight: bold;
      color: #007bff;
      float: right;
    }
  </style>
</head>
<body>
  <div class="upsell-container">
    <div data-next-upsell-selector data-next-selector-id="protection">
      <h1>Protect Your New Drone</h1>
      <p style="font-size: 18px;">Accidents happen. Don't let them ruin your investment.</p>
      
      <div class="protection-options">
        <!-- Basic Protection -->
        <div class="protection-card" data-next-upsell-option data-next-package-id="20">
          <span class="protection-price" data-next-display="package.price">$99</span>
          <h3>Basic Protection</h3>
          <p>1 Year Coverage</p>
          <ul style="margin: 10px 0; padding-left: 20px;">
            <li>Manufacturing defects</li>
            <li>Technical support</li>
            <li>Free shipping on repairs</li>
          </ul>
        </div>
        
        <!-- Premium Protection -->
        <div class="protection-card" data-next-upsell-option data-next-package-id="21" data-next-selected="true">
          <span class="badge" style="position: absolute; top: -10px; right: 20px;">MOST POPULAR</span>
          <span class="protection-price" data-next-display="package.price">$149</span>
          <h3>Premium Protection</h3>
          <p>2 Years Coverage</p>
          <ul style="margin: 10px 0; padding-left: 20px;">
            <li>Everything in Basic</li>
            <li>Accidental damage coverage</li>
            <li>One free replacement</li>
            <li>Express replacement service</li>
          </ul>
        </div>
        
        <!-- Ultimate Protection -->
        <div class="protection-card" data-next-upsell-option data-next-package-id="22">
          <span class="protection-price" data-next-display="package.price">$199</span>
          <h3>Ultimate Protection</h3>
          <p>3 Years Coverage</p>
          <ul style="margin: 10px 0; padding-left: 20px;">
            <li>Everything in Premium</li>
            <li>Unlimited repairs</li>
            <li>Annual maintenance</li>
            <li>Priority support 24/7</li>
          </ul>
        </div>
      </div>
      
      <p style="font-size: 16px; color: #666;">
        Selected: <strong data-next-display="selection.protection.name">Premium Protection</strong>
      </p>
      
      <div class="buttons">
        <button class="btn btn-accept" data-next-upsell-action="add">
          Add Protection for <span data-next-display="selection.protection.price">$149</span>
        </button>
        <button class="btn btn-decline" data-next-upsell-action="skip">
          I'll Risk It
        </button>
      </div>
    </div>
  </div>
</body>
</html>
```

## Page 3: Final Upsell (Quantity Bundle)

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Stock Up on Accessories</title>
  
  <!-- SDK Configuration -->
  <meta name="next-api-key" content="your-api-key-here">
  <meta name="next-page-type" content="upsell">
  <meta name="next-upsell-accept-url" content="/receipt">
  <meta name="next-upsell-decline-url" content="/receipt">
  
  <!-- SDK Script -->
  <script src="https://campaign-cart-v2.pages.dev/loader.js"></script>
  
  <style>
    /* Previous styles... */
    
    .quantity-selector {
      display: flex;
      justify-content: center;
      gap: 20px;
      margin: 30px 0;
    }
    
    .quantity-card {
      border: 2px solid #ddd;
      padding: 20px 30px;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s;
    }
    
    .quantity-card:hover {
      border-color: #007bff;
      transform: translateY(-2px);
    }
    
    .quantity-card[data-selected="true"] {
      border-color: #28a745;
      background: #f0fff4;
    }
    
    .quantity-card h3 {
      margin: 0;
      font-size: 24px;
    }
    
    .unit-price {
      color: #666;
      font-size: 14px;
      margin-top: 5px;
    }
  </style>
</head>
<body>
  <div class="upsell-container" data-next-upsell="offer" data-next-package-id="30">
    <h1>Never Run Out of Propellers!</h1>
    <p style="font-size: 18px;">Professional pilots always keep extras. How many sets do you need?</p>
    
    <img src="/images/propeller-sets.jpg" alt="Propeller Sets" style="width: 400px; margin: 20px 0;">
    
    <div class="quantity-selector">
      <div class="quantity-card" data-next-upsell-quantity-toggle="1">
        <h3>1 Set</h3>
        <p class="price">$29</p>
        <p class="unit-price">$29 per set</p>
      </div>
      
      <div class="quantity-card" data-next-upsell-quantity-toggle="3" data-selected="true">
        <span class="badge">SAVE 20%</span>
        <h3>3 Sets</h3>
        <p class="price">$69</p>
        <p class="unit-price">$23 per set</p>
      </div>
      
      <div class="quantity-card" data-next-upsell-quantity-toggle="5">
        <span class="badge">BEST VALUE</span>
        <h3>5 Sets</h3>
        <p class="price">$99</p>
        <p class="unit-price">$19.80 per set</p>
      </div>
    </div>
    
    <p style="font-size: 20px;">
      Total: $<span data-next-upsell-quantity="display">3</span> × 
      <span id="pricePerUnit">23</span> = 
      <strong>$<span id="totalPrice">69</span></strong>
    </p>
    
    <div class="buttons">
      <button class="btn btn-accept" data-next-upsell-action="add">
        Add <span data-next-upsell-quantity="display">3</span> Sets to Order
      </button>
      <button class="btn btn-decline" data-next-upsell-action="skip">
        Complete Order Without
      </button>
    </div>
    
    <div style="margin-top: 30px; padding: 20px; background: #f8f9fa; border-radius: 8px;">
      <h3>Why Stock Up?</h3>
      <ul style="text-align: left;">
        <li>Propellers wear out with regular use</li>
        <li>Having spares means no downtime</li>
        <li>Bulk pricing saves you money</li>
        <li>Free shipping on all orders</li>
      </ul>
    </div>
  </div>
  
  <script>
    // Update pricing based on quantity selection
    document.querySelectorAll('[data-next-upsell-quantity-toggle]').forEach(card => {
      card.addEventListener('click', function() {
        const qty = parseInt(this.dataset.nextUpsellQuantityToggle);
        let price, unitPrice;
        
        if (qty === 1) {
          price = 29;
          unitPrice = 29;
        } else if (qty === 3) {
          price = 69;
          unitPrice = 23;
        } else if (qty === 5) {
          price = 99;
          unitPrice = 19.80;
        }
        
        document.getElementById('pricePerUnit').textContent = unitPrice.toFixed(2);
        document.getElementById('totalPrice').textContent = price;
      });
    });
  </script>
</body>
</html>
```

## Receipt Page (Final)

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Confirmation</title>
  
  <!-- SDK Configuration -->
  <meta name="next-api-key" content="your-api-key-here">
  <meta name="next-page-type" content="receipt">
  
  <!-- SDK Script -->
  <script src="https://campaign-cart-v2.pages.dev/loader.js"></script>
  
  <style>
    /* Receipt styles */
    .receipt-container {
      max-width: 600px;
      margin: 40px auto;
      background: white;
      padding: 40px;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
    }
    
    .success-icon {
      width: 80px;
      height: 80px;
      background: #28a745;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 20px;
      font-size: 40px;
      color: white;
    }
  </style>
</head>
<body style="background: #f5f5f5;">
  <div class="receipt-container">
    <div class="success-icon">✓</div>
    
    <h1 style="text-align: center;">Thank You for Your Order!</h1>
    
    <p style="text-align: center; font-size: 18px;">
      Order #<span data-next-display="order.number">12345</span> has been confirmed
    </p>
    
    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 30px 0;">
      <h3>Order Summary</h3>
      <p>Total: <strong data-next-display="order.total">$1,295.00</strong></p>
      <p>Items: <span data-next-display="order.itemCount">5</span></p>
    </div>
    
    <p>A confirmation email has been sent to <strong data-next-display="order.customer.email">customer@email.com</strong></p>
    
    <p>Your order will be shipped to:</p>
    <address data-next-display="order.shippingAddress.full">
      123 Main St<br>
      Anytown, ST 12345
    </address>
  </div>
</body>
</html>
```

## Key Features Demonstrated

1. **Multiple Upsell Types** - Direct, selection, and quantity patterns
2. **Progressive Flow** - Each page builds on previous purchases
3. **Urgency Elements** - Countdown timers and limited offers
4. **Value Communication** - Clear benefits and savings
5. **Mobile Responsive** - Works on all devices
6. **Easy Navigation** - Clear accept/decline options