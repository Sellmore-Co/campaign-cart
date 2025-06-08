# Upsells Guide

Complete guide to implementing post-purchase upsells to increase average order value.

## Overview

Upsells allow you to present additional offers to customers after they complete their initial purchase. This can significantly increase average order value and customer lifetime value.

## Upsell Flow

1. **Main Purchase** - Customer completes initial order
2. **Upsell Page** - Present additional offer
3. **Accept/Decline** - Customer chooses
4. **Next Upsell** - Optional additional offers
5. **Final Receipt** - Combined order summary

## Basic Upsell Implementation

### Upsell Page Setup

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Special Offer Just for You!</title>
  
  <meta name="os-api-key" content="YOUR_API_KEY">
  <meta name="os-page-type" content="upsell">
  <meta name="os-next-page" content="/receipt">
  
  <script src="https://rtc2.29next.com/campaign-cart/29next.min.js"></script>
</head>
<body>
  
  <div class="upsell-container">
    <h1>🎉 Congratulations on Your Purchase!</h1>
    <h2>Add This Exclusive Bonus for 50% Off</h2>
    
    <!-- Upsell Product -->
    <div class="upsell-product">
      <img src="bonus-product.jpg" alt="Bonus Product">
      <h3>Premium Bonus Kit</h3>
      <p>Enhance your results with our premium bonus materials</p>
      
      <div class="pricing">
        <span class="original-price">$59.99</span>
        <span class="upsell-price" data-os-package-price data-os-package-id="5">$29.99</span>
        <span class="savings">Save $30 (50% Off)</span>
      </div>
      
      <!-- Upsell Actions -->
      <button data-os-upsell="accept" data-os-package-id="5" class="accept-button">
        Yes! Add This to My Order
      </button>
      
      <button data-os-upsell="decline" data-os-next-url="/receipt" class="decline-button">
        No Thanks, Continue
      </button>
    </div>
    
  </div>
  
</body>
</html>
```

### Upsell Actions

```html
<!-- Accept upsell with package ID -->
<button data-os-upsell="accept" data-os-package-id="5">
  Yes! Add This to My Order
</button>

<!-- Accept upsell with profile ID -->
<button data-os-upsell="accept" data-os-profile-id="bonus-kit">
  Add Bonus Kit
</button>

<!-- Decline and redirect -->
<button data-os-upsell="decline" data-os-next-url="/receipt">
  No Thanks
</button>

<!-- Decline and go to next upsell -->
<button data-os-upsell="decline" data-os-next-url="/upsell2">
  Maybe Later
</button>
```

## Multi-Step Upsell Funnel

### Upsell 1 Page

```html
<meta name="os-page-type" content="upsell">
<meta name="os-next-page" content="/upsell2">

<div class="upsell-offer">
  <h2>Upgrade to Pro Version</h2>
  <button data-os-upsell="accept" data-os-package-id="10">
    Yes! Upgrade for $19.99
  </button>
  <button data-os-upsell="decline" data-os-next-url="/upsell2">
    No Thanks
  </button>
</div>
```

### Upsell 2 Page

```html
<meta name="os-page-type" content="upsell">
<meta name="os-next-page" content="/receipt">

<div class="upsell-offer">
  <h2>Last Chance: Express Shipping</h2>
  <button data-os-upsell="accept" data-os-package-id="11">
    Yes! Get Express Shipping
  </button>
  <button data-os-upsell="decline" data-os-next-url="/receipt">
    Continue to Receipt
  </button>
</div>
```

## Advanced Upsell Features

### Timer-Based Urgency

```html
<div class="urgent-offer">
  <h2>⏰ Limited Time Offer!</h2>
  <p>This exclusive deal expires in:</p>
  
  <div data-os-element="timer" 
       data-os-duration="600" 
       data-os-format="mm:ss"
       data-os-expiry-text="Offer Expired">
    <span data-os-element="timer-text" class="countdown">10:00</span>
  </div>
  
  <div class="upsell-product">
    <h3>Bonus Training Course</h3>
    <p>Limited time: 70% off regular price</p>
    
    <button data-os-upsell="accept" data-os-package-id="8">
      Claim This Deal Now
    </button>
  </div>
</div>
```

### Conditional Upsells

```html
<!-- Show different upsells based on purchase -->
<div data-os-upsell-section data-os-condition="purchased-starter">
  <h2>Perfect Add-on for Your Starter Kit</h2>
  <button data-os-upsell="accept" data-os-package-id="6">
    Add Advanced Guide
  </button>
</div>

<div data-os-upsell-section data-os-condition="purchased-pro">
  <h2>Exclusive Pro Member Bonus</h2>
  <button data-os-upsell="accept" data-os-package-id="7">
    Add VIP Support
  </button>
</div>
```

### Order Bump vs Upsell

```html
<!-- Order Bump (on checkout page) -->
<div class="order-bump">
  <input type="checkbox" data-os-action="toggle-item" data-os-package="4" data-os-upsell="true">
  <label>Add bonus materials for just $9.99</label>
</div>

<!-- Post-Purchase Upsell (on upsell page) -->
<div class="post-purchase-upsell">
  <button data-os-upsell="accept" data-os-package-id="5">
    Add Premium Upgrade
  </button>
</div>
```

## Upsell Configuration

### JavaScript Configuration

```javascript
window.osConfig = {
  upsells: {
    // Enable upsell tracking
    trackConversions: true,
    
    // Upsell-specific analytics
    analytics: {
      trackDeclines: true,
      trackTimingData: true
    },
    
    // Auto-redirect settings
    autoRedirect: {
      enabled: true,
      delay: 3000 // 3 seconds after acceptance
    },
    
    // A/B testing
    variations: {
      'upsell-1': ['version-a', 'version-b'],
      'upsell-2': ['standard', 'urgent']
    }
  }
};
```

### Meta Tag Configuration

```html
<!-- Required upsell page meta tags -->
<meta name="os-page-type" content="upsell">
<meta name="os-next-page" content="/receipt">

<!-- Optional: Specify upsell ID for tracking -->
<meta name="os-upsell-id" content="bonus-offer-1">

<!-- Optional: Set timeout for auto-decline -->
<meta name="os-upsell-timeout" content="300">
```

## Upsell Analytics and Events

### Tracking Upsell Performance

```javascript
// Upsell displayed
document.addEventListener('upsell.displayed', (e) => {
  const { upsellId, product } = e.detail;
  
  // Track with analytics
  gtag('event', 'upsell_displayed', {
    upsell_id: upsellId,
    product_name: product.name,
    product_price: product.price
  });
});

// Upsell accepted
document.addEventListener('upsell.accepted', (e) => {
  const { upsellId, product, revenue } = e.detail;
  
  gtag('event', 'upsell_accepted', {
    upsell_id: upsellId,
    product_name: product.name,
    revenue: revenue
  });
});

// Upsell declined
document.addEventListener('upsell.declined', (e) => {
  const { upsellId, product } = e.detail;
  
  gtag('event', 'upsell_declined', {
    upsell_id: upsellId,
    product_name: product.name
  });
});
```

### Custom Upsell Logic

```javascript
// Prevent multiple upsell acceptance
document.addEventListener('upsell.accepting', (e) => {
  if (window.upsellAlreadyAccepted) {
    e.preventDefault();
    alert('Upsell already added to your order');
  }
});

// Custom decline handling
document.addEventListener('upsell.declining', (e) => {
  const confirmed = confirm('Are you sure you want to pass on this exclusive offer?');
  if (!confirmed) {
    e.preventDefault();
  }
});
```

## Upsell Design Patterns

### High-Converting Upsell Page

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Exclusive One-Time Offer</title>
  
  <meta name="os-api-key" content="YOUR_API_KEY">
  <meta name="os-page-type" content="upsell">
  <meta name="os-next-page" content="/receipt">
  
  <script src="https://rtc2.29next.com/campaign-cart/29next.min.js"></script>
  
  <style>
    .upsell-page { max-width: 800px; margin: 0 auto; padding: 2rem; text-align: center; }
    .congrats { background: #2ecc71; color: white; padding: 1rem; border-radius: 8px; margin-bottom: 2rem; }
    .offer-box { border: 3px solid #e74c3c; padding: 2rem; border-radius: 15px; margin: 2rem 0; }
    .product-image { max-width: 300px; margin: 1rem 0; }
    .pricing { font-size: 2rem; margin: 1rem 0; }
    .original-price { text-decoration: line-through; color: #999; }
    .upsell-price { color: #e74c3c; font-weight: bold; }
    .accept-btn { background: #2ecc71; color: white; padding: 1rem 2rem; border: none; border-radius: 8px; font-size: 1.3rem; margin: 1rem; cursor: pointer; }
    .decline-btn { background: #95a5a6; color: white; padding: 0.5rem 1rem; border: none; border-radius: 4px; margin: 1rem; cursor: pointer; }
    .urgency { color: #e74c3c; font-weight: bold; }
  </style>
</head>
<body>
  
  <div class="upsell-page">
    
    <!-- Congratulations -->
    <div class="congrats">
      <h1>🎉 Thank You for Your Order!</h1>
      <p>Your order is confirmed and being processed</p>
    </div>
    
    <!-- Exclusive Offer -->
    <div class="offer-box">
      <h2>🚨 ONE-TIME EXCLUSIVE OFFER 🚨</h2>
      
      <img src="bonus-product.jpg" alt="Bonus Product" class="product-image">
      
      <h3>Advanced Training Masterclass</h3>
      <p>Take your results to the next level with our exclusive training course</p>
      
      <ul style="text-align: left; max-width: 400px; margin: 0 auto;">
        <li>✅ 5 hours of premium video content</li>
        <li>✅ Downloadable workbooks and templates</li>
        <li>✅ Lifetime access</li>
        <li>✅ 30-day money back guarantee</li>
      </ul>
      
      <div class="pricing">
        <span class="original-price">$97.00</span>
        <span class="upsell-price" data-os-package-price data-os-package-id="12">$47.00</span>
      </div>
      
      <p class="urgency">⏰ This offer is only available on this page!</p>
      
      <button data-os-upsell="accept" data-os-package-id="12" class="accept-btn">
        YES! Add This to My Order for $47
      </button>
      
      <br>
      
      <button data-os-upsell="decline" data-os-next-url="/receipt" class="decline-btn">
        No thanks, I'll pass on this exclusive offer
      </button>
      
    </div>
    
    <!-- Social Proof -->
    <div style="background: #f8f9fa; padding: 1rem; border-radius: 8px; margin-top: 2rem;">
      <p><strong>⭐⭐⭐⭐⭐ "This training changed everything for me!"</strong></p>
      <p><em>- Sarah M., Verified Customer</em></p>
    </div>
    
  </div>
  
</body>
</html>
```

### Mobile-Optimized Upsell

```html
<div class="mobile-upsell">
  <div class="sticky-header">
    <h2>🎁 Special Bonus Offer</h2>
  </div>
  
  <div class="product-summary">
    <img src="mobile-product.jpg" alt="Product">
    <h3>Premium Add-on</h3>
    <p class="price" data-os-package-price data-os-package-id="9">$19.99</p>
  </div>
  
  <div class="sticky-footer">
    <button data-os-upsell="accept" data-os-package-id="9" class="mobile-accept">
      Add to Order
    </button>
    <button data-os-upsell="decline" data-os-next-url="/receipt" class="mobile-decline">
      Skip
    </button>
  </div>
</div>

<style>
@media (max-width: 768px) {
  .mobile-upsell { padding-bottom: 80px; }
  .sticky-footer { position: fixed; bottom: 0; left: 0; right: 0; background: white; padding: 1rem; box-shadow: 0 -2px 10px rgba(0,0,0,0.1); }
  .mobile-accept, .mobile-decline { width: 48%; display: inline-block; }
}
</style>
```

## Upsell Performance Optimization

### A/B Testing Upsells

```javascript
// A/B test different upsell versions
function loadUpsellVariation() {
  const variations = ['version-a', 'version-b'];
  const variation = variations[Math.floor(Math.random() * variations.length)];
  
  if (variation === 'version-a') {
    document.querySelector('.upsell-title').textContent = 'Limited Time Bonus!';
    document.querySelector('.accept-btn').textContent = 'Yes! Add This Bonus';
  } else {
    document.querySelector('.upsell-title').textContent = 'Exclusive Offer Just for You!';
    document.querySelector('.accept-btn').textContent = 'Claim This Deal Now';
  }
  
  // Track variation
  gtag('event', 'upsell_variation_shown', {
    variation: variation
  });
}
```

### Exit Intent Upsells

```javascript
// Show exit intent popup on upsell decline
let exitIntentShown = false;

document.addEventListener('mouseleave', (e) => {
  if (!exitIntentShown && e.clientY <= 0) {
    showExitIntentOffer();
    exitIntentShown = true;
  }
});

function showExitIntentOffer() {
  const popup = document.createElement('div');
  popup.innerHTML = `
    <div class="exit-intent-popup">
      <h3>Wait! Don't miss out on this deal!</h3>
      <p>Get an additional 20% off this exclusive offer</p>
      <button data-os-upsell="accept" data-os-package-id="13">
        OK, I'll Take It!
      </button>
      <button onclick="closeExitIntent()">
        No Thanks
      </button>
    </div>
  `;
  document.body.appendChild(popup);
}
```

## Best Practices

1. **Relevant offers** - Present products that complement the main purchase
2. **Clear value proposition** - Explain benefits and savings
3. **Limited time urgency** - Use timers and scarcity
4. **Simple choice** - Make accept/decline obvious
5. **Mobile optimized** - Ensure great mobile experience
6. **Social proof** - Include testimonials and reviews
7. **Track everything** - Monitor conversion rates and optimize

## Troubleshooting

### Upsell Not Displaying

```javascript
// Check if upsell page is properly configured
console.log('Page type:', document.querySelector('meta[name="os-page-type"]')?.content);
console.log('Next page:', document.querySelector('meta[name="os-next-page"]')?.content);

// Verify upsell elements exist
console.log('Accept buttons:', document.querySelectorAll('[data-os-upsell="accept"]').length);
console.log('Decline buttons:', document.querySelectorAll('[data-os-upsell="decline"]').length);
```

### Upsell Events Not Firing

```javascript
// Debug upsell event handling
document.addEventListener('upsell.displayed', (e) => {
  console.log('Upsell displayed:', e.detail);
});

document.addEventListener('upsell.accepted', (e) => {
  console.log('Upsell accepted:', e.detail);
});

document.addEventListener('upsell.declined', (e) => {
  console.log('Upsell declined:', e.detail);
});
```

## Next Steps

- [Receipt Guide](receipt.md) - Final order confirmation
- [Analytics Integration](../configuration/events.md) - Track upsell performance
- [A/B Testing Guide](../advanced/ab-testing.md) - Optimize upsell conversion
- [Mobile Optimization](../advanced/mobile-optimization.md) - Mobile upsell best practices