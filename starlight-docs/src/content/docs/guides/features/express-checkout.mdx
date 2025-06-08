# Express Checkout Guide

Complete guide to implementing PayPal, Apple Pay, and Google Pay express checkout options.

## Overview

Express checkout allows customers to bypass the traditional checkout form by using their stored payment methods from PayPal, Apple Pay, or Google Pay. This significantly reduces checkout friction and can improve conversion rates.

## Supported Payment Methods

- **PayPal Express Checkout** - Works on all browsers
- **Apple Pay** - Safari on iOS/macOS devices with Touch ID/Face ID
- **Google Pay** - Chrome and supported Android browsers

## Basic Implementation

### Express Checkout Buttons

```html
<!-- PayPal Express Checkout -->
<button os-checkout-payment="paypal">
  Pay with PayPal
</button>

<!-- Apple Pay (shows only on supported devices) -->
<button os-checkout-payment="apple-pay">
  Pay with Apple Pay
</button>

<!-- Google Pay (shows only on supported browsers) -->
<button os-checkout-payment="google-pay">
  Pay with Google Pay
</button>
```

### Express Checkout Container

```html
<!-- Container for all express checkout options -->
<div os-checkout-container="express-checkout">
  <h3>Express Checkout</h3>
  
  <button os-checkout-payment="paypal" class="paypal-button">
    <img src="paypal-logo.png" alt="PayPal">
    PayPal
  </button>
  
  <button os-checkout-payment="apple-pay" class="apple-pay-button">
    <img src="apple-pay-logo.png" alt="Apple Pay">
    Apple Pay
  </button>
  
  <button os-checkout-payment="google-pay" class="google-pay-button">
    <img src="google-pay-logo.png" alt="Google Pay">
    Google Pay
  </button>
  
  <div class="express-checkout-divider">
    <span>or</span>
  </div>
  
  <!-- Regular checkout form below -->
</div>
```

## PayPal Configuration

### Meta Tag Setup

```html
<meta name="os-paypal-client-id" content="YOUR_PAYPAL_CLIENT_ID">
```

### JavaScript Configuration

```javascript
window.osConfig = {
  paypal: {
    clientId: 'YOUR_PAYPAL_CLIENT_ID',
    environment: 'sandbox', // or 'production'
    currency: 'USD',
    intent: 'capture'
  }
};
```

### PayPal Button Styling

```css
.paypal-button {
  background: #0070ba;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 12px 24px;
  font-weight: bold;
  cursor: pointer;
  width: 100%;
  margin-bottom: 8px;
}

.paypal-button:hover {
  background: #005ea6;
}
```

## Apple Pay Configuration

### Requirements

Apple Pay requires:
- HTTPS connection
- Safari browser on iOS/macOS
- Device with Touch ID, Face ID, or Apple Watch
- Valid merchant identifier

### Configuration

```javascript
window.osConfig = {
  applePay: {
    merchantId: 'merchant.your.domain.com',
    merchantCapabilities: ['supports3DS'],
    supportedNetworks: ['visa', 'masterCard', 'amex'],
    countryCode: 'US',
    currencyCode: 'USD'
  }
};
```

### Apple Pay Button Styling

```css
.apple-pay-button {
  background: #000;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 12px 24px;
  cursor: pointer;
  width: 100%;
  margin-bottom: 8px;
  display: none; /* Hidden by default */
}

/* Show only on supported devices */
@supports (-webkit-appearance: -apple-pay-button) {
  .apple-pay-button {
    display: block;
    -webkit-appearance: -apple-pay-button;
    -apple-pay-button-style: black;
    -apple-pay-button-type: buy;
  }
}
```

## Google Pay Configuration

### Requirements

Google Pay requires:
- HTTPS connection
- Chrome browser or supported Android browsers
- Valid merchant ID

### Configuration

```javascript
window.osConfig = {
  googlePay: {
    merchantId: 'YOUR_GOOGLE_MERCHANT_ID',
    merchantName: 'Your Store Name',
    environment: 'TEST', // or 'PRODUCTION'
    countryCode: 'US',
    currencyCode: 'USD',
    allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
    allowedCardNetworks: ['VISA', 'MASTERCARD', 'AMEX']
  }
};
```

### Google Pay Button Styling

```css
.google-pay-button {
  background: #4285f4;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 12px 24px;
  cursor: pointer;
  width: 100%;
  margin-bottom: 8px;
  display: none; /* Hidden by default */
}
```

## Device Detection and Progressive Enhancement

### Automatic Detection

Campaign Cart automatically detects device capabilities and shows appropriate buttons:

```javascript
// Campaign Cart automatically handles this
document.addEventListener('DOMContentLoaded', () => {
  // Apple Pay detection
  if (window.ApplePaySession && ApplePaySession.canMakePayments()) {
    document.querySelector('[os-checkout-payment="apple-pay"]').style.display = 'block';
  }
  
  // Google Pay detection
  if (window.google && window.google.payments) {
    document.querySelector('[os-checkout-payment="google-pay"]').style.display = 'block';
  }
});
```

### Custom Detection Logic

```javascript
// Check for Apple Pay support
function isApplePaySupported() {
  return window.ApplePaySession && 
         ApplePaySession.canMakePayments() &&
         /Safari/.test(navigator.userAgent);
}

// Check for Google Pay support
function isGooglePaySupported() {
  return window.google && 
         window.google.payments &&
         /Chrome|Android/.test(navigator.userAgent);
}

// Show appropriate buttons
if (isApplePaySupported()) {
  document.querySelector('.apple-pay-button').style.display = 'block';
}

if (isGooglePaySupported()) {
  document.querySelector('.google-pay-button').style.display = 'block';
}
```

## Complete Express Checkout Implementation

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Express Checkout Example</title>
  
  <!-- Configuration -->
  <meta name="os-api-key" content="YOUR_API_KEY">
  <meta name="os-paypal-client-id" content="YOUR_PAYPAL_CLIENT_ID">
  
  <script>
  window.osConfig = {
    paypal: {
      clientId: 'YOUR_PAYPAL_CLIENT_ID',
      environment: 'sandbox'
    },
    applePay: {
      merchantId: 'merchant.your.domain.com',
      merchantCapabilities: ['supports3DS'],
      supportedNetworks: ['visa', 'masterCard', 'amex']
    },
    googlePay: {
      merchantId: 'YOUR_GOOGLE_MERCHANT_ID',
      environment: 'TEST'
    }
  };
  </script>
  
  <script src="https://rtc2.29next.com/campaign-cart/29next.min.js"></script>
  
  <style>
    .checkout-container { max-width: 500px; margin: 2rem auto; padding: 2rem; }
    .express-checkout { margin-bottom: 2rem; padding: 1rem; border: 1px solid #ddd; border-radius: 8px; }
    .express-button { width: 100%; padding: 12px; margin: 8px 0; border: none; border-radius: 4px; font-weight: bold; cursor: pointer; }
    .paypal-button { background: #0070ba; color: white; }
    .apple-pay-button { background: #000; color: white; display: none; }
    .google-pay-button { background: #4285f4; color: white; display: none; }
    .divider { text-align: center; margin: 1rem 0; }
    .regular-checkout { padding: 1rem; border: 1px solid #ddd; border-radius: 8px; }
  </style>
</head>
<body>
  <div class="checkout-container">
    
    <!-- Product Summary -->
    <div class="product-summary">
      <h2>Order Summary</h2>
      <div data-os-cart="summary"></div>
      <p><strong>Total: <span data-os-cart-total>$0.00</span></strong></p>
    </div>
    
    <!-- Express Checkout Options -->
    <div class="express-checkout" os-checkout-container="express-checkout">
      <h3>Express Checkout</h3>
      
      <button os-checkout-payment="paypal" class="express-button paypal-button">
        🛒 PayPal
      </button>
      
      <button os-checkout-payment="apple-pay" class="express-button apple-pay-button">
        📱 Apple Pay
      </button>
      
      <button os-checkout-payment="google-pay" class="express-button google-pay-button">
        🎯 Google Pay
      </button>
    </div>
    
    <div class="divider">
      <span>── or ──</span>
    </div>
    
    <!-- Regular Checkout Form -->
    <div class="regular-checkout">
      <h3>Checkout Form</h3>
      <form os-checkout="form">
        
        <!-- Customer Info -->
        <input os-checkout-field="fname" placeholder="First Name" required>
        <input os-checkout-field="lname" placeholder="Last Name" required>
        <input os-checkout-field="phone" placeholder="Phone" required>
        
        <!-- Address -->
        <input os-checkout-field="address1" placeholder="Address" required>
        <input os-checkout-field="city" placeholder="City" required>
        <select os-checkout-field="province" required>
          <option value="">Select State</option>
          <option value="CA">California</option>
          <option value="NY">New York</option>
        </select>
        <input os-checkout-field="postal" placeholder="ZIP Code" required>
        
        <!-- Payment -->
        <select os-checkout-field="payment-method">
          <option value="credit_card">Credit Card</option>
        </select>
        
        <!-- Checkout Button -->
        <button type="button" os-checkout-payment="combo" class="express-button">
          Complete Order
        </button>
        
      </form>
    </div>
    
  </div>
  
  <script>
    // Add some products to cart for demo
    document.addEventListener('DOMContentLoaded', () => {
      window.twentyNineNext.onReady(() => {
        window.twentyNineNext.addToCart(1); // Add demo product
      });
    });
    
    // Device-specific button display
    if (window.ApplePaySession && ApplePaySession.canMakePayments()) {
      document.querySelector('.apple-pay-button').style.display = 'block';
    }
    
    if (window.google && window.google.payments) {
      document.querySelector('.google-pay-button').style.display = 'block';
    }
  </script>
</body>
</html>
```

## Express Checkout Flow

### 1. PayPal Flow
1. User clicks PayPal button
2. PayPal popup opens
3. User logs in and approves payment
4. PayPal returns payment token
5. Order is completed automatically

### 2. Apple Pay Flow
1. User clicks Apple Pay button
2. Touch ID/Face ID authentication
3. Payment sheet appears
4. User confirms payment
5. Order is completed automatically

### 3. Google Pay Flow
1. User clicks Google Pay button
2. Google Pay sheet appears
3. User selects payment method
4. User confirms payment
5. Order is completed automatically

## Event Handling

```javascript
// Listen for express checkout events
document.addEventListener('express.checkout.started', (e) => {
  console.log('Express checkout started:', e.detail.method);
});

document.addEventListener('express.checkout.completed', (e) => {
  console.log('Express checkout completed:', e.detail);
});

document.addEventListener('express.checkout.failed', (e) => {
  console.error('Express checkout failed:', e.detail.error);
});
```

## Best Practices

1. **Show express options first** - Place above regular checkout form
2. **Progressive enhancement** - Hide unsupported methods
3. **Clear visual hierarchy** - Make express options prominent
4. **Fallback to regular checkout** - Always provide traditional form
5. **Test on actual devices** - Use real phones/tablets for testing
6. **Handle errors gracefully** - Provide clear error messages

## Troubleshooting

### PayPal Issues
- Verify client ID is correct
- Check PayPal developer dashboard
- Ensure HTTPS is enabled

### Apple Pay Issues
- Verify merchant ID registration
- Check device compatibility
- Ensure HTTPS and Safari browser

### Google Pay Issues
- Verify Google merchant registration
- Check browser compatibility
- Ensure HTTPS connection

## Next Steps

- [Payment Configuration](../configuration/payment-config.md) - Advanced payment setup
- [Testing Guide](../advanced/test-mode.md) - Test express checkout
- [Analytics Integration](../configuration/events.md) - Track express checkout usage