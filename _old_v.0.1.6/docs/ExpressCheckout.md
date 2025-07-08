# Express Checkout Implementation

This document describes how to implement express checkout options (PayPal, Apple Pay, Google Pay) in your 29next campaign funnel.

## Overview

Express checkout provides streamlined payment options that can increase conversion rates by reducing checkout friction. The implementation supports:

- PayPal Express Checkout
- Apple Pay (on supported devices)
- Google Pay (on supported browsers)

## Key Features

- Automatic device/browser capability detection
- Graceful fallback for unsupported payment methods
- Prevention of duplicate submissions
- Consistent error handling
- Automatic payment method hiding on unsupported devices

## Implementation

### 1. Add Required Meta Tags

Configure your checkout page with the necessary meta tags:

```html
<!-- Required: API Key -->
<meta name="os-api-key" content="YOUR_API_KEY">

<!-- Set next page for redirects after payment -->
<meta name="os-next-page" content="/upsell1">
```

### 2. Add Express Checkout Buttons

Add buttons with the following data attributes:

#### PayPal Button

```html
<button os-checkout-payment="paypal" class="express-checkout-btn paypal-btn">
  Pay with PayPal
</button>
```

#### Apple Pay Button (shown only on supported devices)

```html
<button os-checkout-payment="apple-pay" class="express-checkout-btn apple-pay-btn">
  <span>Apple Pay</span>
</button>
```

#### Google Pay Button (shown only on supported devices)

```html
<button os-checkout-payment="google-pay" class="express-checkout-btn google-pay-btn">
  <span>Google Pay</span>
</button>
```

### 3. Add Express Checkout Container (optional)

Wrap your express checkout buttons in a container to manage visibility:

```html
<div os-checkout-container="express-checkout" class="express-checkout-wrapper">
  <h3>Express Checkout</h3>
  <div class="express-checkout-buttons">
    <!-- PayPal button -->
    <button os-checkout-payment="paypal" class="express-checkout-btn">
      <img src="/images/paypal-logo.svg" alt="PayPal">
    </button>
    <!-- Apple Pay button -->
    <button os-checkout-payment="apple-pay" class="express-checkout-btn">
      <img src="/images/apple-pay-logo.svg" alt="Apple Pay">
    </button>
    <!-- Google Pay button -->
    <button os-checkout-payment="google-pay" class="express-checkout-btn">
      <img src="/images/google-pay-logo.svg" alt="Google Pay">
    </button>
  </div>
  <!-- Error container for express checkout -->
  <div os-checkout-element="express-payment-error"></div>
</div>
```

### 4. Add Styles for Express Checkout Buttons

```css
.express-checkout-wrapper {
  margin-bottom: 20px;
  padding: 15px;
  border: 1px solid #eee;
  border-radius: 5px;
}

.express-checkout-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.express-checkout-btn {
  flex: 1;
  min-width: 120px;
  padding: 10px 15px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.express-checkout-btn:hover {
  background-color: #f9f9f9;
}

.express-checkout-btn.processing {
  opacity: 0.7;
  pointer-events: none;
}

.payment-btn-spinner {
  display: inline-block;
  width: 20px;
  height: 20px;
}

.spinner {
  border: 2px solid rgba(0, 0, 0, 0.1);
  border-top: 2px solid #3498db;
  border-radius: 50%;
  width: 16px;
  height: 16px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
```

## How It Works

The express checkout functionality works in several stages:

1. **Device Detection**: On page load, the PaymentHandler detects which payment methods are supported by the user's device/browser
2. **Button Initialization**: Buttons for unsupported methods are automatically hidden
3. **Express Checkout Flow**:
   - User clicks an express checkout button
   - The button shows a loading spinner
   - The API is called with minimal order information (cart lines, shipping method)
   - The API returns a redirect URL to the payment provider
   - User is redirected to complete payment
   - After payment, user is redirected to the next page specified in meta tags

### Payment Failure Handling

If a payment fails at the payment provider (PayPal, Apple Pay, etc.), the user is redirected back to the checkout page with error parameters. An error message is displayed in a prominent banner at the top of the page.

## API Integration

Under the hood, express checkout calls use the `createOrder` API endpoint with a simplified payload containing:

- `lines`: Cart line items (package_id, quantity)
- `payment_detail.payment_method`: The payment method (paypal, apple_pay, google_pay)
- `attribution`: Attribution data from the cart
- `shipping_method`: The selected shipping method
- `success_url`: URL to redirect after successful payment (from meta tag)
- `payment_failed_url`: URL to redirect after failed payment (current page with error params)

## Events

Express checkout triggers the following events:

| Event Name | Description | Triggered When |
|------------|-------------|----------------|
| `express.checkout.started` | Express checkout flow initiated | After order creation, before redirect |
| `express.checkout.error` | Error during express checkout | When an error occurs during processing |

Listen for these events:

```javascript
window.on29NextReady.push(function(client) {
  client.on('express.checkout.started', function(data) {
    console.log('Express checkout started with method:', data.method);
    // Analytics tracking code here
  });
});
```

## Troubleshooting

### Payment Method Not Showing

- For Apple Pay: Make sure you're on an Apple device with Apple Pay set up
- For Google Pay: Make sure you're using Chrome and have Google Pay configured
- Check browser console for any detection errors

### Payment Failures

Check these common issues:

- Invalid API key
- Missing meta tags
- Network connectivity issues
- Payment method configuration issues

## Browser Compatibility

- **PayPal**: All major browsers
- **Apple Pay**: Safari on iOS and macOS with Apple Pay configured
- **Google Pay**: Chrome on Android and desktop with Google Pay configured 