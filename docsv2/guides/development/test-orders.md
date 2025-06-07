# Test Orders Guide

Complete guide to testing checkout flows and order processing during development.

## Overview

Campaign Cart provides multiple testing modes to validate checkout functionality without processing real transactions. These testing modes help developers test different scenarios and validate form behavior.

## Testing Modes

### 1. Konami Code Test Mode

The Konami Code provides the fastest way to test order completion with predefined data.

#### Activation
Enter the Konami code sequence: **↑↑↓↓←→←→BA**

#### Behavior
- Bypasses all form validation
- Uses predefined test customer data
- Automatically fills test payment information
- Creates test order without real transaction
- Shows activation message with test data details

#### Test Data Used
```javascript
{
  user: {
    email: 'test@test.com',
    first_name: 'Test',
    last_name: 'Order'
  },
  shipping_address: {
    first_name: 'Test',
    last_name: 'Order',
    line1: 'Test Address 123',
    line4: 'Tempe',
    state: 'AZ',
    postcode: '85281',
    country: 'US',
    phone_number: '+14807581224'
  },
  billing_address: {
    // Same as shipping address
  }
}
```

#### Visual Indicator
- Progress indicator appears after 4 keystrokes: "Konami: 4/10"
- Success message overlay shows test data being used
- Automatically clears after order completion

### 2. URL Parameter Test Mode

Add `?test=true` to any checkout page URL for validation testing.

#### Activation
```
https://your-site.com/checkout?test=true
```

#### Behavior
- Validates all form fields normally
- Uses `test_card` token for payment processing
- Bypasses Spreedly payment validation
- Creates test order in system
- Maintains full checkout flow validation

### 3. Development Environment Testing

For consistent testing during development.

#### Configuration
```javascript
// Set global test mode
window.osConfig = window.osConfig || {};
window.osConfig.testMode = true;
```

#### Meta Tag Configuration
```html
<meta name="os-debug" content="true">
<meta name="os-test-mode" content="true">
```

## Test Card Numbers

Use these test card numbers for payment testing:

| Card Type | Number | CVV | Expiry |
|-----------|--------|-----|--------|
| Visa | `4111111111111111` | Any 3 digits | Any future date |
| Mastercard | `5555555555554444` | Any 3 digits | Any future date |
| American Express | `378282246310005` | Any 4 digits | Any future date |
| Discover | `6011111111111117` | Any 3 digits | Any future date |

## Complete Test Setup

### HTML Test Page

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Test Checkout</title>
  
  <!-- Test mode configuration -->
  <meta name="os-api-key" content="YOUR_TEST_API_KEY">
  <meta name="os-debug" content="true">
  
  <script>
  // Global test configuration
  window.osConfig = window.osConfig || {};
  window.osConfig.testMode = true;
  window.osConfig.debug = true;
  </script>
  
  <script src="https://rtc2.29next.com/campaign-cart/29next.min.js"></script>
  
  <style>
    .test-banner { background: #ff9800; color: white; padding: 1rem; text-align: center; font-weight: bold; }
    .test-instructions { background: #f0f0f0; padding: 1rem; margin: 1rem 0; border-radius: 4px; }
    .checkout-form { max-width: 600px; margin: 2rem auto; padding: 2rem; }
    .form-group { margin: 1rem 0; }
    .form-input { width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 4px; }
    .test-card-info { background: #e3f2fd; padding: 1rem; border-radius: 4px; margin: 1rem 0; }
    .konami-hint { position: fixed; bottom: 20px; right: 20px; background: #333; color: white; padding: 0.5rem; border-radius: 4px; font-family: monospace; font-size: 12px; }
  </style>
</head>
<body>
  
  <!-- Test mode banner -->
  <div class="test-banner">
    🧪 TEST MODE ACTIVE - No real transactions will be processed
  </div>
  
  <div class="checkout-form">
    
    <h1>Test Checkout</h1>
    
    <!-- Test instructions -->
    <div class="test-instructions">
      <h3>Testing Options:</h3>
      <ul>
        <li><strong>Konami Code:</strong> Press ↑↑↓↓←→←→BA for instant test order</li>
        <li><strong>Manual Testing:</strong> Fill form with test data below</li>
        <li><strong>URL Parameter:</strong> Add ?test=true to URL</li>
      </ul>
    </div>
    
    <!-- Test card information -->
    <div class="test-card-info">
      <h4>Test Card Numbers:</h4>
      <p><strong>Visa:</strong> 4111 1111 1111 1111</p>
      <p><strong>Mastercard:</strong> 5555 5555 5555 4444</p>
      <p><strong>Amex:</strong> 3782 822463 10005</p>
      <p>CVV: Any 3-4 digits | Expiry: Any future date</p>
    </div>
    
    <form os-checkout="form">
      
      <!-- Customer Information -->
      <div class="form-group">
        <h3>Customer Information</h3>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem;">
          <input type="text" os-checkout-field="fname" placeholder="First Name" class="form-input" value="Test">
          <input type="text" os-checkout-field="lname" placeholder="Last Name" class="form-input" value="Customer">
        </div>
      </div>
      
      <div class="form-group">
        <input type="email" os-checkout-field="email" placeholder="Email" class="form-input" value="test@example.com">
      </div>
      
      <div class="form-group">
        <input type="tel" os-checkout-field="phone" placeholder="Phone" class="form-input" value="555-123-4567">
      </div>
      
      <!-- Address Information -->
      <div class="form-group">
        <h3>Shipping Address</h3>
        <input type="text" os-checkout-field="address1" placeholder="Address" class="form-input" value="123 Test St">
      </div>
      
      <div class="form-group">
        <div style="display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 0.5rem;">
          <input type="text" os-checkout-field="city" placeholder="City" class="form-input" value="Test City">
          <select os-checkout-field="province" class="form-input">
            <option value="">State</option>
            <option value="CA" selected>California</option>
            <option value="NY">New York</option>
            <option value="TX">Texas</option>
          </select>
          <input type="text" os-checkout-field="postal" placeholder="ZIP" class="form-input" value="12345">
        </div>
      </div>
      
      <!-- Payment Information -->
      <div class="form-group">
        <h3>Payment Information</h3>
        <input type="text" os-checkout-field="cc-number" placeholder="Card Number" class="form-input">
      </div>
      
      <div class="form-group">
        <div style="display: grid; grid-template-columns: 1fr 1fr 2fr; gap: 0.5rem;">
          <select os-checkout-field="cc-month" class="form-input">
            <option value="">Month</option>
            <option value="12" selected>12</option>
          </select>
          <select os-checkout-field="cc-year" class="form-input">
            <option value="">Year</option>
            <option value="2025" selected>2025</option>
          </select>
          <input type="text" os-checkout-field="cvv" placeholder="CVV" class="form-input">
        </div>
      </div>
      
      <div class="form-group">
        <input type="text" os-checkout-field="cc-name" placeholder="Name on Card" class="form-input" value="Test Customer">
      </div>
      
      <!-- Order Summary -->
      <div style="background: #f8f9fa; padding: 1rem; border-radius: 4px; margin: 2rem 0;">
        <h4>Order Summary</h4>
        <div style="display: flex; justify-content: space-between;">
          <span>Total:</span>
          <span data-os-cart-total>$0.00</span>
        </div>
      </div>
      
      <!-- Checkout Button -->
      <button type="button" os-checkout-payment="combo" style="width: 100%; padding: 15px; background: #2ecc71; color: white; border: none; border-radius: 4px; font-size: 18px; cursor: pointer;">
        Complete Test Order
      </button>
      
    </form>
    
  </div>
  
  <!-- Konami code hint -->
  <div class="konami-hint">
    Konami: ↑↑↓↓←→←→BA
  </div>
  
  <script>
    // Test mode helpers
    console.log('Test mode active');
    
    // Listen for test events
    document.addEventListener('konami.activated', () => {
      console.log('Konami code activated!');
    });
    
    document.addEventListener('checkout.test', (e) => {
      console.log('Test checkout event:', e.detail);
    });
    
    // Auto-fill test card on button click
    function fillTestCard() {
      const cardField = document.querySelector('[os-checkout-field="cc-number"]');
      const cvvField = document.querySelector('[os-checkout-field="cvv"]');
      
      if (cardField) cardField.value = '4111111111111111';
      if (cvvField) cvvField.value = '123';
    }
    
    // Add test card button
    const testCardButton = document.createElement('button');
    testCardButton.textContent = 'Fill Test Card';
    testCardButton.onclick = fillTestCard;
    testCardButton.style.cssText = 'margin: 0.5rem 0; padding: 0.5rem 1rem; background: #2196f3; color: white; border: none; border-radius: 4px; cursor: pointer;';
    
    const paymentSection = document.querySelector('h3').nextElementSibling;
    paymentSection.appendChild(testCardButton);
  </script>
  
</body>
</html>
```

## JavaScript Testing Helpers

### Test Mode Detection

```javascript
// Check if any test mode is active
function isTestMode() {
  // Check URL parameter
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('test') === 'true') return true;
  
  // Check global config
  if (window.osConfig?.testMode === true) return true;
  
  // Check Konami code mode
  if (sessionStorage.getItem('konami_test_mode') === 'true') return true;
  
  return false;
}

// Test mode indicator
if (isTestMode()) {
  console.log('🧪 Test mode active');
  document.body.style.borderTop = '5px solid orange';
}
```

### Test Data Helpers

```javascript
// Generate test customer data
function generateTestCustomer() {
  return {
    fname: 'Test',
    lname: 'Customer',
    email: `test.${Date.now()}@example.com`,
    phone: '555-123-4567',
    address1: '123 Test Street',
    city: 'Test City',
    province: 'CA',
    postal: '12345'
  };
}

// Fill form with test data
function fillTestData() {
  const testData = generateTestCustomer();
  
  Object.keys(testData).forEach(field => {
    const element = document.querySelector(`[os-checkout-field="${field}"]`);
    if (element) {
      element.value = testData[field];
    }
  });
}

// Auto-fill test payment data
function fillTestPayment() {
  const testCards = {
    visa: '4111111111111111',
    mastercard: '5555555555554444',
    amex: '378282246310005',
    discover: '6011111111111117'
  };
  
  const fields = {
    'cc-number': testCards.visa,
    'cc-month': '12',
    'cc-year': '2025',
    'cvv': '123',
    'cc-name': 'Test Customer'
  };
  
  Object.keys(fields).forEach(field => {
    const element = document.querySelector(`[os-checkout-field="${field}"]`);
    if (element) {
      element.value = fields[field];
    }
  });
}
```

### Event Testing

```javascript
// Test event listeners
document.addEventListener('checkout.processing', (e) => {
  console.log('🔄 Checkout processing:', e.detail);
});

document.addEventListener('checkout.success', (e) => {
  console.log('✅ Checkout success:', e.detail);
});

document.addEventListener('checkout.error', (e) => {
  console.log('❌ Checkout error:', e.detail);
});

// Custom test events
document.addEventListener('test.order.created', (e) => {
  console.log('🧪 Test order created:', e.detail);
  
  // Custom test validation
  if (e.detail.order_id) {
    console.log('Order ID received:', e.detail.order_id);
  }
});
```

## Development Workflow

### 1. Setup Test Environment

```javascript
// Add to your development site
window.osConfig = window.osConfig || {};
window.osConfig.debug = true;
window.osConfig.testMode = true;

// Enable detailed logging
console.log('Campaign Cart test environment ready');
```

### 2. Quick Testing Checklist

- [ ] Form validation works correctly
- [ ] Payment fields accept test cards
- [ ] Konami code creates test order
- [ ] Error handling displays properly
- [ ] Success redirect works
- [ ] Cart totals calculate correctly
- [ ] Shipping methods apply
- [ ] Address autocomplete functions

### 3. Automated Testing

```javascript
// Basic checkout test
async function runCheckoutTest() {
  console.log('🧪 Running checkout test...');
  
  // Fill test data
  fillTestData();
  fillTestPayment();
  
  // Simulate checkout
  const checkoutButton = document.querySelector('[os-checkout-payment="combo"]');
  if (checkoutButton) {
    checkoutButton.click();
    console.log('✅ Checkout test initiated');
  }
}

// Run test on page load (development only)
if (isTestMode()) {
  setTimeout(runCheckoutTest, 2000);
}
```

## Troubleshooting

### Common Test Issues

```javascript
// Debug test mode detection
console.log('Test mode checks:', {
  urlParam: new URLSearchParams(window.location.search).get('test'),
  globalConfig: window.osConfig?.testMode,
  konamiMode: sessionStorage.getItem('konami_test_mode'),
  isActive: isTestMode()
});

// Debug form fields
const requiredFields = ['fname', 'lname', 'email', 'address1', 'city', 'province', 'postal'];
requiredFields.forEach(field => {
  const element = document.querySelector(`[os-checkout-field="${field}"]`);
  console.log(`${field}:`, element ? element.value || 'empty' : 'missing');
});

// Debug payment fields
const paymentFields = ['cc-number', 'cc-month', 'cc-year', 'cvv', 'cc-name'];
paymentFields.forEach(field => {
  const element = document.querySelector(`[os-checkout-field="${field}"]`);
  console.log(`${field}:`, element ? 'found' : 'missing');
});
```

### Reset Test State

```javascript
// Clear all test modes
function resetTestState() {
  sessionStorage.removeItem('konami_test_mode');
  window.osConfig.testMode = false;
  console.log('Test state cleared');
}

// Clear form data
function clearFormData() {
  const fields = document.querySelectorAll('[os-checkout-field]');
  fields.forEach(field => {
    if (field.tagName === 'SELECT') {
      field.selectedIndex = 0;
    } else {
      field.value = '';
    }
  });
}
```

## Best Practices

1. **Always use test API keys** in development
2. **Clear test data** between testing sessions  
3. **Test all card types** to verify payment processing
4. **Validate error scenarios** with invalid data
5. **Test mobile devices** for responsive behavior
6. **Check console logs** for debugging information
7. **Use URL parameters** for consistent test environments

## Next Steps

- [Payment Configuration](../configuration/payment-config.md) - Setup payment processors
- [Form Validation](../configuration/form-validation.md) - Custom validation rules
- [Debugging Guide](debugging.md) - Troubleshooting checkout issues