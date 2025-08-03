# Advanced Customization Examples

Complex scenarios and edge cases with the Next Commerce JS SDK.

## Dynamic Bundle Builder

Build custom bundles with real-time pricing updates:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Build Your Custom Drone Bundle</title>
  
  <!-- SDK Configuration -->
  <meta name="next-api-key" content="your-api-key-here">
  <script src="https://campaign-cart-v2.pages.dev/loader.js"></script>
  
  <style>
    .bundle-builder {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 30px;
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }
    
    .category {
      background: white;
      padding: 20px;
      margin-bottom: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    
    .bundle-summary {
      background: white;
      padding: 20px;
      border-radius: 8px;
      position: sticky;
      top: 20px;
      height: fit-content;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    
    .option-card {
      display: flex;
      align-items: center;
      padding: 15px;
      border: 2px solid #ddd;
      border-radius: 8px;
      margin: 10px 0;
      cursor: pointer;
      transition: all 0.2s;
    }
    
    .option-card:hover {
      border-color: #007bff;
    }
    
    .option-card.selected {
      border-color: #28a745;
      background: #f0fff4;
    }
    
    .bundle-total {
      font-size: 32px;
      font-weight: bold;
      color: #333;
      text-align: center;
      margin: 20px 0;
    }
    
    .savings-indicator {
      background: #28a745;
      color: white;
      padding: 10px;
      border-radius: 8px;
      text-align: center;
      margin: 20px 0;
    }
  </style>
</head>
<body>
  <div class="bundle-builder">
    <div class="builder-options">
      <!-- Base Drone Selection -->
      <div class="category">
        <h2>1. Choose Your Drone</h2>
        <div data-next-cart-selector data-next-selector-id="drone" data-next-selection-mode="select">
          <div class="option-card" data-next-selector-card data-next-package-id="1">
            <img src="/drone-basic.jpg" width="80" style="margin-right: 20px;">
            <div style="flex: 1;">
              <h4>Drone Pro X Basic</h4>
              <p>Entry-level drone with HD camera</p>
            </div>
            <div class="price" data-next-display="package.price">$599</div>
          </div>
          
          <div class="option-card" data-next-selector-card data-next-package-id="2" data-next-selected="true">
            <img src="/drone-advanced.jpg" width="80" style="margin-right: 20px;">
            <div style="flex: 1;">
              <h4>Drone Pro X Advanced</h4>
              <p>4K camera with gimbal stabilization</p>
            </div>
            <div class="price" data-next-display="package.price">$899</div>
          </div>
          
          <div class="option-card" data-next-selector-card data-next-package-id="3">
            <img src="/drone-pro.jpg" width="80" style="margin-right: 20px;">
            <div style="flex: 1;">
              <h4>Drone Pro X Ultimate</h4>
              <p>8K camera, obstacle avoidance, 45min flight</p>
            </div>
            <div class="price" data-next-display="package.price">$1299</div>
          </div>
        </div>
      </div>
      
      <!-- Battery Options -->
      <div class="category">
        <h2>2. Extra Batteries</h2>
        <div data-next-cart-selector data-next-selector-id="batteries" data-next-selection-mode="select">
          <div class="option-card" data-next-selector-card data-next-package-id="10">
            <div style="flex: 1;">
              <h4>No Extra Batteries</h4>
              <p>Just the one that comes with drone</p>
            </div>
            <div class="price">$0</div>
          </div>
          
          <div class="option-card" data-next-selector-card data-next-package-id="11" data-next-selected="true">
            <div style="flex: 1;">
              <h4>+1 Extra Battery</h4>
              <p>Double your flight time</p>
            </div>
            <div class="price" data-next-display="package.price">$79</div>
          </div>
          
          <div class="option-card" data-next-selector-card data-next-package-id="12">
            <div style="flex: 1;">
              <h4>+2 Extra Batteries</h4>
              <p>Triple your flight time</p>
              <span class="savings-badge" data-next-show="package.hasSavings">
                Save <span data-next-display="package.savingsPercentage">10%</span>
              </span>
            </div>
            <div class="price" data-next-display="package.price">$149</div>
          </div>
        </div>
      </div>
      
      <!-- Accessories -->
      <div class="category">
        <h2>3. Select Accessories</h2>
        <div class="accessories-list">
          <div class="option-card" data-next-package-id="20">
            <input type="checkbox" data-next-toggle style="margin-right: 15px;">
            <div style="flex: 1;">
              <h4>Carrying Case</h4>
              <p>Professional hard-shell case</p>
            </div>
            <div class="price" data-next-display="package.price">$49</div>
          </div>
          
          <div class="option-card" data-next-package-id="21">
            <input type="checkbox" data-next-toggle style="margin-right: 15px;">
            <div style="flex: 1;">
              <h4>ND Filter Set</h4>
              <p>6 filters for perfect exposure</p>
            </div>
            <div class="price" data-next-display="package.price">$39</div>
          </div>
          
          <div class="option-card" data-next-package-id="22">
            <input type="checkbox" data-next-toggle style="margin-right: 15px;">
            <div style="flex: 1;">
              <h4>Extra Propellers</h4>
              <p>2 complete sets</p>
            </div>
            <div class="price" data-next-display="package.price">$29</div>
          </div>
          
          <div class="option-card" data-next-package-id="23">
            <input type="checkbox" data-next-toggle style="margin-right: 15px;">
            <div style="flex: 1;">
              <h4>Landing Pad</h4>
              <p>Professional takeoff/landing surface</p>
            </div>
            <div class="price" data-next-display="package.price">$19</div>
          </div>
        </div>
      </div>
      
      <!-- Protection Plan -->
      <div class="category">
        <h2>4. Protection Plan</h2>
        <div data-next-cart-selector data-next-selector-id="protection" data-next-selection-mode="select">
          <div class="option-card" data-next-selector-card data-next-package-id="30">
            <div style="flex: 1;">
              <h4>No Protection</h4>
              <p>Standard manufacturer warranty only</p>
            </div>
            <div class="price">$0</div>
          </div>
          
          <div class="option-card" data-next-selector-card data-next-package-id="31">
            <div style="flex: 1;">
              <h4>2-Year Protection</h4>
              <p>Covers accidents and defects</p>
            </div>
            <div class="price" data-next-display="package.price">$99</div>
          </div>
          
          <div class="option-card" data-next-selector-card data-next-package-id="32">
            <div style="flex: 1;">
              <h4>3-Year Protection + Care</h4>
              <p>Full coverage + annual maintenance</p>
            </div>
            <div class="price" data-next-display="package.price">$179</div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Bundle Summary -->
    <div class="bundle-summary">
      <h2>Your Bundle</h2>
      
      <!-- Selected Items -->
      <div class="selected-items">
        <div data-next-show="selection.drone.hasSelection">
          <strong data-next-display="selection.drone.name">Drone</strong>: 
          <span data-next-display="selection.drone.price">$0</span>
        </div>
        
        <div data-next-show="selection.batteries.packageId != 10">
          <strong data-next-display="selection.batteries.name">Batteries</strong>: 
          <span data-next-display="selection.batteries.price">$0</span>
        </div>
        
        <div data-next-show="cart.hasItem(20)">
          Carrying Case: $49
        </div>
        
        <div data-next-show="cart.hasItem(21)">
          ND Filter Set: $39
        </div>
        
        <div data-next-show="cart.hasItem(22)">
          Extra Propellers: $29
        </div>
        
        <div data-next-show="cart.hasItem(23)">
          Landing Pad: $19
        </div>
        
        <div data-next-show="selection.protection.packageId != 30">
          <strong data-next-display="selection.protection.name">Protection</strong>: 
          <span data-next-display="selection.protection.price">$0</span>
        </div>
      </div>
      
      <hr style="margin: 20px 0;">
      
      <!-- Dynamic Bundle Pricing -->
      <div class="bundle-total">
        Total: <span data-next-display="cart.total">$0</span>
      </div>
      
      <!-- Savings Display -->
      <div class="savings-indicator" data-next-show="cart.hasSavings">
        You're saving <span data-next-display="cart.totalSavingsAmount">$0</span>!
        That's <span data-next-display="cart.totalSavingsPercentage">0%</span> off retail.
      </div>
      
      <!-- Bundle Discount Tiers -->
      <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <h4>Bundle Discounts</h4>
        <div style="margin: 5px 0;">
          <span style="color: #666;">3+ items:</span> 5% off
          <span data-next-show="cart.itemCount >= 3" style="color: #28a745; float: right;">✓ Active</span>
        </div>
        <div style="margin: 5px 0;">
          <span style="color: #666;">5+ items:</span> 10% off
          <span data-next-show="cart.itemCount >= 5" style="color: #28a745; float: right;">✓ Active</span>
        </div>
        <div style="margin: 5px 0;">
          <span style="color: #666;">$1500+:</span> Extra 5% off
          <span data-next-show="cart.total >= 1500" style="color: #28a745; float: right;">✓ Active</span>
        </div>
      </div>
      
      <!-- Action Buttons -->
      <button class="checkout-button" style="width: 100%; padding: 15px; background: #28a745; color: white; border: none; border-radius: 8px; font-size: 18px; cursor: pointer;"
              onclick="addBundleToCart()">
        Add Complete Bundle to Cart
      </button>
      
      <button style="width: 100%; padding: 10px; background: transparent; color: #007bff; border: 1px solid #007bff; border-radius: 8px; margin-top: 10px; cursor: pointer;"
              onclick="saveBundleForLater()">
        Save Bundle for Later
      </button>
    </div>
  </div>
  
  <script>
    // Custom bundle logic
    function addBundleToCart() {
      // Add all selected items
      const droneId = document.querySelector('[data-next-selector-id="drone"] .next-selected')?.dataset.nextPackageId;
      const batteryId = document.querySelector('[data-next-selector-id="batteries"] .next-selected')?.dataset.nextPackageId;
      const protectionId = document.querySelector('[data-next-selector-id="protection"] .next-selected')?.dataset.nextPackageId;
      
      // This would normally use SDK methods
      console.log('Adding bundle:', { droneId, batteryId, protectionId });
      
      // Redirect to checkout
      window.location.href = '/checkout';
    }
    
    function saveBundleForLater() {
      // Save configuration to localStorage or user account
      const bundleConfig = {
        drone: document.querySelector('[data-next-selector-id="drone"] .next-selected')?.dataset.nextPackageId,
        batteries: document.querySelector('[data-next-selector-id="batteries"] .next-selected')?.dataset.nextPackageId,
        accessories: Array.from(document.querySelectorAll('.accessories-list .next-in-cart')).map(el => el.dataset.nextPackageId),
        protection: document.querySelector('[data-next-selector-id="protection"] .next-selected')?.dataset.nextPackageId
      };
      
      localStorage.setItem('savedBundle', JSON.stringify(bundleConfig));
      alert('Bundle saved! We'll email you a link to complete your purchase later.');
    }
    
    // Initialize
    window.addEventListener('next:initialized', function() {
      // Apply bundle discounts based on selections
      next.on('cart:updated', (data) => {
        // Custom discount logic would go here
        console.log('Bundle updated:', data);
      });
      
      // Track bundle building progress
      next.on('selection:changed', (data) => {
        console.log('Bundle selection changed:', data);
      });
    });
  </script>
</body>
</html>
```

## Multi-Currency Support

Handle different currencies and regional pricing:

```html
<!-- Currency Selector -->
<div class="currency-selector">
  <select onchange="changeCurrency(this.value)">
    <option value="USD">USD ($)</option>
    <option value="EUR">EUR (€)</option>
    <option value="GBP">GBP (£)</option>
    <option value="CAD">CAD ($)</option>
  </select>
</div>

<!-- Dynamic Currency Display -->
<div class="product-price">
  <span data-next-display="campaign.currency">$</span>
  <span data-next-display="package.price">99.99</span>
</div>

<script>
function changeCurrency(currency) {
  // This would typically reload the page with new currency
  // or update via API call
  window.location.href = `?currency=${currency}`;
}
</script>
```

## A/B Testing Implementation

Test different layouts and messaging:

```html
<script>
// A/B Test Configuration
const abTests = {
  buttonText: {
    control: 'Add to Cart',
    variant: 'Buy Now - Free Shipping'
  },
  urgency: {
    control: false,
    variant: true
  },
  socialProof: {
    control: 'none',
    variant: 'fomo'
  }
};

// Assign user to test groups
function getTestVariant(testName) {
  const stored = localStorage.getItem(`ab_${testName}`);
  if (stored) return stored;
  
  const variant = Math.random() > 0.5 ? 'variant' : 'control';
  localStorage.setItem(`ab_${testName}`, variant);
  return variant;
}

// Apply tests
window.addEventListener('next:initialized', function() {
  // Button text test
  const buttonVariant = getTestVariant('buttonText');
  document.querySelector('[data-next-action="add-to-cart"]').textContent = 
    abTests.buttonText[buttonVariant];
  
  // Urgency test
  if (getTestVariant('urgency') === 'variant') {
    document.querySelector('.urgency-message').style.display = 'block';
  }
  
  // Social proof test
  if (getTestVariant('socialProof') === 'variant') {
    next.fomo({ initialDelay: 3000 });
  }
  
  // Track conversions
  next.on('cart:item-added', (data) => {
    // Send test data to analytics
    trackABTestConversion({
      buttonText: buttonVariant,
      urgency: getTestVariant('urgency'),
      socialProof: getTestVariant('socialProof'),
      value: data.item.price
    });
  });
});
</script>
```

## Dynamic Pricing Rules

Implement complex pricing logic:

```html
<script>
// Quantity-based pricing tiers
const pricingTiers = {
  1: { price: 99.99, savings: 0 },
  3: { price: 89.99, savings: 10 },
  5: { price: 79.99, savings: 20 },
  10: { price: 69.99, savings: 30 }
};

// Time-based flash sales
function checkFlashSale() {
  const now = new Date();
  const hour = now.getHours();
  
  // Happy hour: 3-6 PM
  if (hour >= 15 && hour < 18) {
    return { active: true, discount: 15, message: 'Happy Hour Sale!' };
  }
  
  // Weekend special
  const day = now.getDay();
  if (day === 0 || day === 6) {
    return { active: true, discount: 10, message: 'Weekend Special!' };
  }
  
  return { active: false };
}

// Apply dynamic pricing
window.addEventListener('next:initialized', function() {
  const flashSale = checkFlashSale();
  
  if (flashSale.active) {
    // Show flash sale banner
    document.querySelector('.flash-sale-banner').style.display = 'block';
    document.querySelector('.flash-sale-message').textContent = flashSale.message;
    
    // Apply discount code automatically
    next.applyCoupon(`FLASH${flashSale.discount}`);
  }
  
  // Update pricing based on quantity selection
  next.on('selection:changed', (data) => {
    const qty = data.quantity || 1;
    const tier = Object.keys(pricingTiers)
      .reverse()
      .find(t => qty >= parseInt(t));
    
    if (tier) {
      console.log(`Applied tier ${tier} pricing:`, pricingTiers[tier]);
    }
  });
});
</script>
```

## Custom Validation

Add custom validation before checkout:

```html
<script>
// Custom validation rules
const validationRules = {
  minimumOrder: 50,
  requiredAccessories: ['protection'], // Must have protection plan
  restrictedCombinations: [
    { items: ['drone_basic', 'battery_pro'], message: 'Pro batteries not compatible with basic drone' }
  ]
};

// Validate cart before checkout
function validateCart() {
  const cartData = next.getCartData();
  const errors = [];
  
  // Minimum order value
  if (cartData.total < validationRules.minimumOrder) {
    errors.push(`Minimum order value is $${validationRules.minimumOrder}`);
  }
  
  // Required accessories
  validationRules.requiredAccessories.forEach(required => {
    const hasRequired = cartData.items.some(item => 
      item.name.toLowerCase().includes(required)
    );
    if (!hasRequired) {
      errors.push(`Please add a ${required} to your order`);
    }
  });
  
  // Restricted combinations
  // ... check logic here
  
  return errors;
}

// Apply validation
document.querySelector('.checkout-button').addEventListener('click', (e) => {
  const errors = validateCart();
  
  if (errors.length > 0) {
    e.preventDefault();
    alert('Please fix the following:\n\n' + errors.join('\n'));
  }
});
</script>
```

## Performance Optimization

Optimize for large catalogs:

```html
<!-- Lazy load images -->
<img data-src="/product-image.jpg" 
     class="lazy-load" 
     alt="Product">

<!-- Virtual scrolling for long lists -->
<div class="virtual-scroll-container" 
     data-total-items="1000" 
     data-visible-items="10">
  <!-- Only render visible items -->
</div>

<script>
// Intersection Observer for lazy loading
const imageObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const img = entry.target;
      img.src = img.dataset.src;
      img.classList.remove('lazy-load');
      imageObserver.unobserve(img);
    }
  });
});

document.querySelectorAll('.lazy-load').forEach(img => {
  imageObserver.observe(img);
});

// Debounce expensive operations
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Optimize selection changes
const optimizedSelectionHandler = debounce((data) => {
  // Expensive calculations here
  updateBundlePricing(data);
}, 300);

next.on('selection:changed', optimizedSelectionHandler);
</script>
```

These advanced examples demonstrate:
1. **Dynamic Bundle Building** - Complex multi-step configuration
2. **Multi-Currency Support** - Regional pricing
3. **A/B Testing** - Conversion optimization
4. **Dynamic Pricing** - Time and quantity-based rules
5. **Custom Validation** - Business logic enforcement
6. **Performance Optimization** - Large catalog handling