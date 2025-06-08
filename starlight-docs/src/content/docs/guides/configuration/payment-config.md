---
title: Payment Configuration Guide
description: Complete guide to configuring Spreedly payment processing for secure credit card handling
---

Complete guide to configuring Spreedly payment processing for secure credit card handling.

## Overview

Campaign Cart uses Spreedly for secure credit card processing through iframe fields. This provides PCI-compliant payment handling while allowing you to customize the appearance and behavior to match your site's design.

## Basic Setup

### HTML Structure

Your checkout form needs specific input fields with the correct attributes:

```html
<form os-checkout="form">
  
  <!-- Customer Information -->
  <input type="text" os-checkout-field="fname" placeholder="First Name" required>
  <input type="text" os-checkout-field="lname" placeholder="Last Name" required>
  <input type="email" os-checkout-field="email" placeholder="Email" required>
  <input type="tel" os-checkout-field="phone" placeholder="Phone" required>
  
  <!-- Address Information -->
  <input type="text" os-checkout-field="address1" placeholder="Address" required>
  <input type="text" os-checkout-field="city" placeholder="City" required>
  <select os-checkout-field="province" required>
    <option value="">Select State</option>
    <option value="CA">California</option>
    <option value="NY">New York</option>
    <!-- More states -->
  </select>
  <input type="text" os-checkout-field="postal" placeholder="ZIP Code" required>
  
  <!-- Payment Information (Spreedly Fields) -->
  <input type="text" id="cc-number" os-checkout-field="cc-number" placeholder="Card Number" required>
  <input type="text" id="cvv" os-checkout-field="cvv" placeholder="CVV" required>
  
  <!-- Expiration Date -->
  <select id="cc-month" os-checkout-field="cc-month" required>
    <option value="">Month</option>
    <option value="01">01 - January</option>
    <option value="02">02 - February</option>
    <!-- More months -->
  </select>
  
  <select id="cc-year" os-checkout-field="cc-year" required>
    <option value="">Year</option>
    <option value="2024">2024</option>
    <option value="2025">2025</option>
    <!-- More years -->
  </select>
  
  <!-- Cardholder Name -->
  <input type="text" id="cc-name" os-checkout-field="cc-name" placeholder="Name on Card" required>
  
  <!-- Checkout Button -->
  <button type="button" os-checkout-payment="combo">Complete Order</button>
  
</form>
```

### Required Field Attributes

| Field | Attribute | Description |
|-------|-----------|-------------|
| Card Number | `os-checkout-field="cc-number"` | Secure iframe field |
| CVV | `os-checkout-field="cvv"` | Secure iframe field |
| Expiration Month | `os-checkout-field="cc-month"` | Standard select field |
| Expiration Year | `os-checkout-field="cc-year"` | Standard select field |
| Cardholder Name | `os-checkout-field="cc-name"` | Standard input field |

## Spreedly Configuration

### Global Configuration

Configure Spreedly before loading Campaign Cart:

```html
<script>
window.osConfig = window.osConfig || {};
window.osConfig.spreedlyConfig = {
  // Field input types (controls mobile keyboard)
  fieldType: {
    number: 'tel',  // 'text', 'tel', 'number'
    cvv: 'tel'
  },
  
  // Card number formatting
  numberFormat: 'prettyFormat', // 'prettyFormat', 'plainFormat', 'maskedFormat'
  
  // Placeholder text
  placeholder: {
    number: 'Card Number',
    cvv: 'Security Code'
  },
  
  // Accessibility labels
  labels: {
    number: 'Credit Card Number',
    cvv: 'Card Verification Value'
  },
  
  // Tooltip text
  titles: {
    number: 'Enter your credit card number',
    cvv: 'Enter the 3 or 4 digit security code'
  },
  
  // Iframe styling
  styling: {
    number: 'color: #333; font-size: 16px; font-family: Arial, sans-serif; width: 100%; height: 100%; border: none; padding: 12px;',
    cvv: 'color: #333; font-size: 16px; font-family: Arial, sans-serif; width: 100%; height: 100%; border: none; padding: 12px;'
  },
  
  // Placeholder styling
  placeholder_styling: 'color: #999; font-style: italic;',
  
  // Required field indicators
  required: {
    number: true,
    cvv: true
  },
  
  // Browser autocomplete
  autocomplete: true
};
</script>

<!-- Load Campaign Cart after configuration -->
<script src="https://rtc2.29next.com/campaign-cart/29next.min.js"></script>
```

## Styling Payment Fields

### CSS Integration

Since Spreedly uses iframes, style the container elements:

```css
/* Container styling */
.payment-field {
  position: relative;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
  transition: border-color 0.3s ease;
}

.payment-field:focus-within {
  border-color: #2ecc71;
  box-shadow: 0 0 0 2px rgba(46, 204, 113, 0.2);
}

/* Spreedly iframe containers */
#cc-number,
#cvv {
  border: none;
  padding: 0;
  background: transparent;
  width: 100%;
  height: 44px;
}

/* Error states */
.payment-field.error {
  border-color: #e74c3c;
  background-color: #fdf2f2;
}

.payment-field.error:focus-within {
  box-shadow: 0 0 0 2px rgba(231, 76, 60, 0.2);
}

/* Success states */
.payment-field.valid {
  border-color: #2ecc71;
}

/* Field labels */
.field-label {
  display: block;
  font-weight: bold;
  margin-bottom: 5px;
  color: #333;
}

.field-label.required::after {
  content: " *";
  color: #e74c3c;
}

/* Error messages */
.field-error {
  color: #e74c3c;
  font-size: 0.875rem;
  margin-top: 5px;
  display: none;
}

.field-error.show {
  display: block;
}
```

### Responsive Design

```css
/* Mobile optimization */
@media (max-width: 768px) {
  .payment-fields {
    display: block;
  }
  
  .payment-field {
    margin-bottom: 1rem;
  }
  
  /* Larger touch targets on mobile */
  #cc-number,
  #cvv {
    height: 50px;
  }
  
  /* Mobile keyboard optimization */
  #cc-number[type="tel"],
  #cvv[type="tel"] {
    font-size: 16px; /* Prevents zoom on iOS */
  }
}

/* Desktop layout */
@media (min-width: 769px) {
  .payment-row {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr;
    gap: 1rem;
    align-items: end;
  }
  
  .card-number-field {
    grid-column: 1;
  }
  
  .cvv-field {
    grid-column: 2;
  }
  
  .expiry-fields {
    grid-column: 3;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.5rem;
  }
}
```

## Complete Payment Form Example

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Secure Checkout</title>
  
  <meta name="os-api-key" content="YOUR_API_KEY">
  
  <!-- Spreedly Configuration -->
  <script>
  window.osConfig = window.osConfig || {};
  window.osConfig.spreedlyConfig = {
    fieldType: {
      number: 'tel',
      cvv: 'tel'
    },
    numberFormat: 'prettyFormat',
    placeholder: {
      number: '•••• •••• •••• ••••',
      cvv: '•••'
    },
    styling: {
      number: 'color: #333; font-size: 16px; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; width: 100%; height: 100%; border: none; padding: 12px; background: transparent;',
      cvv: 'color: #333; font-size: 16px; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; width: 100%; height: 100%; border: none; padding: 12px; background: transparent;'
    },
    placeholder_styling: 'color: #999;',
    required: {
      number: true,
      cvv: true
    },
    autocomplete: true
  };
  </script>
  
  <script src="https://rtc2.29next.com/campaign-cart/29next.min.js"></script>
  
  <style>
    .checkout-container { max-width: 600px; margin: 2rem auto; padding: 2rem; }
    .form-group { margin-bottom: 1.5rem; }
    .form-label { display: block; font-weight: bold; margin-bottom: 0.5rem; color: #333; }
    .form-label.required::after { content: " *"; color: #e74c3c; }
    .form-input { width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 4px; font-size: 16px; transition: border-color 0.3s ease; }
    .form-input:focus { outline: none; border-color: #2ecc71; box-shadow: 0 0 0 2px rgba(46, 204, 113, 0.2); }
    .payment-row { display: grid; grid-template-columns: 2fr 1fr; gap: 1rem; }
    .expiry-row { display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; }
    .checkout-button { width: 100%; padding: 15px; background: #2ecc71; color: white; border: none; border-radius: 4px; font-size: 18px; font-weight: bold; cursor: pointer; margin-top: 2rem; }
    .checkout-button:hover { background: #27ae60; }
    .payment-icons { display: flex; gap: 0.5rem; margin-top: 0.5rem; }
    .payment-icon { height: 24px; opacity: 0.7; }
    .security-note { font-size: 0.875rem; color: #666; margin-top: 1rem; text-align: center; }
  </style>
</head>
<body>
  
  <div class="checkout-container">
    
    <h1>Secure Checkout</h1>
    
    <form os-checkout="form">
      
      <!-- Customer Information -->
      <div class="form-group">
        <label class="form-label required">Name</label>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem;">
          <input type="text" os-checkout-field="fname" placeholder="First Name" class="form-input" required>
          <input type="text" os-checkout-field="lname" placeholder="Last Name" class="form-input" required>
        </div>
      </div>
      
      <div class="form-group">
        <label class="form-label required">Contact</label>
        <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 0.5rem;">
          <input type="email" os-checkout-field="email" placeholder="Email Address" class="form-input" required>
          <input type="tel" os-checkout-field="phone" placeholder="Phone" class="form-input" required>
        </div>
      </div>
      
      <!-- Address Information -->
      <div class="form-group">
        <label class="form-label required">Address</label>
        <input type="text" os-checkout-field="address1" placeholder="Street Address" class="form-input" required>
      </div>
      
      <div class="form-group">
        <div style="display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 0.5rem;">
          <input type="text" os-checkout-field="city" placeholder="City" class="form-input" required>
          <select os-checkout-field="province" class="form-input" required>
            <option value="">State</option>
            <option value="AL">Alabama</option>
            <option value="CA">California</option>
            <option value="FL">Florida</option>
            <option value="NY">New York</option>
            <option value="TX">Texas</option>
            <!-- Add all states -->
          </select>
          <input type="text" os-checkout-field="postal" placeholder="ZIP" class="form-input" required>
        </div>
      </div>
      
      <!-- Payment Information -->
      <div class="form-group">
        <label class="form-label required">Payment Information</label>
        
        <!-- Card Number -->
        <div style="margin-bottom: 1rem;">
          <input type="text" id="cc-number" os-checkout-field="cc-number" placeholder="Card Number" class="form-input" required>
          <div class="payment-icons">
            <img src="visa-icon.svg" alt="Visa" class="payment-icon">
            <img src="mastercard-icon.svg" alt="Mastercard" class="payment-icon">
            <img src="amex-icon.svg" alt="American Express" class="payment-icon">
            <img src="discover-icon.svg" alt="Discover" class="payment-icon">
          </div>
        </div>
        
        <!-- CVV and Expiry -->
        <div class="payment-row">
          <div>
            <label class="form-label required">Expiration Date</label>
            <div class="expiry-row">
              <select id="cc-month" os-checkout-field="cc-month" class="form-input" required>
                <option value="">Month</option>
                <option value="01">01</option>
                <option value="02">02</option>
                <option value="03">03</option>
                <option value="04">04</option>
                <option value="05">05</option>
                <option value="06">06</option>
                <option value="07">07</option>
                <option value="08">08</option>
                <option value="09">09</option>
                <option value="10">10</option>
                <option value="11">11</option>
                <option value="12">12</option>
              </select>
              <select id="cc-year" os-checkout-field="cc-year" class="form-input" required>
                <option value="">Year</option>
                <option value="2024">2024</option>
                <option value="2025">2025</option>
                <option value="2026">2026</option>
                <option value="2027">2027</option>
                <option value="2028">2028</option>
                <option value="2029">2029</option>
                <option value="2030">2030</option>
              </select>
            </div>
          </div>
          <div>
            <label class="form-label required">Security Code</label>
            <input type="text" id="cvv" os-checkout-field="cvv" placeholder="CVV" class="form-input" required>
          </div>
        </div>
        
        <!-- Cardholder Name -->
        <div style="margin-top: 1rem;">
          <input type="text" id="cc-name" os-checkout-field="cc-name" placeholder="Name on Card" class="form-input" required>
        </div>
        
      </div>
      
      <!-- Order Summary -->
      <div style="background: #f8f9fa; padding: 1rem; border-radius: 4px; margin: 1.5rem 0;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
          <span>Subtotal:</span>
          <span data-os-cart-subtotal>$0.00</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
          <span>Shipping:</span>
          <span data-os-cart-shipping>$0.00</span>
        </div>
        <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 1.1rem; border-top: 1px solid #ddd; padding-top: 0.5rem;">
          <span>Total:</span>
          <span data-os-cart-total>$0.00</span>
        </div>
      </div>
      
      <!-- Checkout Button -->
      <button type="button" os-checkout-payment="combo" class="checkout-button">
        Complete Secure Order
      </button>
      
      <div class="security-note">
        🔒 Your payment information is secured with 256-bit SSL encryption
      </div>
      
    </form>
    
  </div>
  
</body>
</html>
```

## Number Format Options

### Format Examples

```javascript
// Pretty format (default) - adds spaces
numberFormat: 'prettyFormat'
// Result: "4111 1111 1111 1111"

// Plain format - no formatting
numberFormat: 'plainFormat'  
// Result: "4111111111111111"

// Masked format - shows only last 4 digits
numberFormat: 'maskedFormat'
// Result: "••••••••••••1111"
```

## Error Handling

### Form Validation Events

```javascript
// Listen for Spreedly validation events
document.addEventListener('DOMContentLoaded', () => {
  // Payment field validation
  document.addEventListener('spreedly:validation', (e) => {
    const { field, isValid, errorMessage } = e.detail;
    
    const fieldElement = document.getElementById(field);
    const errorElement = fieldElement.parentNode.querySelector('.field-error');
    
    if (isValid) {
      fieldElement.classList.remove('error');
      fieldElement.classList.add('valid');
      if (errorElement) errorElement.style.display = 'none';
    } else {
      fieldElement.classList.add('error');
      fieldElement.classList.remove('valid');
      if (errorElement) {
        errorElement.textContent = errorMessage;
        errorElement.style.display = 'block';
      }
    }
  });
  
  // Payment token creation
  document.addEventListener('spreedly:token', (e) => {
    const { token, errors } = e.detail;
    
    if (errors && errors.length > 0) {
      console.error('Payment errors:', errors);
      // Show error message to user
      showPaymentError('Please check your payment information and try again.');
    } else {
      console.log('Payment token created:', token);
      // Continue with order processing
    }
  });
});

function showPaymentError(message) {
  // Display error message to user
  const errorDiv = document.createElement('div');
  errorDiv.className = 'payment-error';
  errorDiv.style.cssText = 'background: #f8d7da; color: #721c24; padding: 1rem; border-radius: 4px; margin: 1rem 0;';
  errorDiv.textContent = message;
  
  const form = document.querySelector('[os-checkout="form"]');
  form.insertBefore(errorDiv, form.firstChild);
  
  // Remove error after 5 seconds
  setTimeout(() => errorDiv.remove(), 5000);
}
```

## Security Features

### PCI Compliance

- Credit card data never touches your servers
- Spreedly handles all sensitive payment information
- iframe isolation prevents access to payment data
- Secure token-based processing

### Additional Security

```javascript
// Disable form submission during processing
document.addEventListener('checkout.processing', () => {
  const submitButton = document.querySelector('[os-checkout-payment="combo"]');
  submitButton.disabled = true;
  submitButton.textContent = 'Processing...';
});

// Re-enable form on completion or error
document.addEventListener('checkout.complete', () => {
  // Redirect handled automatically
});

document.addEventListener('checkout.error', () => {
  const submitButton = document.querySelector('[os-checkout-payment="combo"]');
  submitButton.disabled = false;
  submitButton.textContent = 'Complete Secure Order';
});
```

## Testing and Development

### Test Mode Configuration

```javascript
// Enable test mode
window.osConfig = window.osConfig || {};
window.osConfig.testMode = true;

// Test card numbers for development
// Visa: 4111111111111111
// Mastercard: 5555555555554444  
// American Express: 378282246310005
// Discover: 6011111111111117

// Use any future expiry date and any 3-4 digit CVV
```

## Troubleshooting

### Common Issues

```javascript
// Check if Spreedly is properly configured
console.log('Spreedly config:', window.osConfig?.spreedlyConfig);

// Verify required fields exist
const requiredFields = ['cc-number', 'cvv', 'cc-month', 'cc-year', 'cc-name'];
requiredFields.forEach(field => {
  const element = document.querySelector(`[os-checkout-field="${field}"]`);
  console.log(`${field}:`, element ? 'Found' : 'Missing');
});

// Check for iframe initialization
setTimeout(() => {
  const iframes = document.querySelectorAll('iframe[src*="spreedly"]');
  console.log('Spreedly iframes found:', iframes.length);
}, 2000);
```

## Best Practices

1. **Mobile optimization** - Use `tel` input type for better mobile keyboards
2. **Error handling** - Provide clear, helpful error messages
3. **Visual feedback** - Show validation states clearly
4. **Accessibility** - Include proper labels and ARIA attributes
5. **Security messaging** - Reassure customers about payment security
6. **Testing** - Test with various card types and scenarios
7. **Performance** - Load Spreedly configuration before Campaign Cart

## Next Steps

- [Express Checkout Guide](../features/express-checkout.md) - PayPal, Apple Pay, Google Pay
- [Form Validation Guide](form-validation.md) - Client-side validation
- [Checkout Events](../../api/events-reference.md) - Payment processing events