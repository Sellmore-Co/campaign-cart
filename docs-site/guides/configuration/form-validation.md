# Form Validation Guide

Complete guide to implementing client-side form validation for checkout forms.

## Overview

Campaign Cart includes built-in form validation that works with standard HTML5 validation attributes and provides enhanced validation for payment fields through Spreedly integration.

## Basic Form Structure

### Required Form Setup

```html
<form os-checkout="form">
  
  <!-- Customer Information -->
  <input type="text" 
         os-checkout-field="fname" 
         placeholder="First Name" 
         required
         minlength="2">
  
  <input type="email" 
         os-checkout-field="email" 
         placeholder="Email Address" 
         required>
  
  <!-- Address Fields -->
  <input type="text" 
         os-checkout-field="address1" 
         placeholder="Street Address" 
         required>
  
  <input type="text" 
         os-checkout-field="postal" 
         placeholder="ZIP Code" 
         required
         pattern="[0-9]{5}(-[0-9]{4})?">
  
  <!-- Payment Fields -->
  <input type="text" 
         os-checkout-field="cc-number" 
         placeholder="Card Number" 
         required>
  
  <input type="text" 
         os-checkout-field="cvv" 
         placeholder="CVV" 
         required
         pattern="[0-9]{3,4}">
  
  <button type="button" os-checkout-payment="combo">Complete Order</button>
  
</form>
```

## HTML5 Validation Attributes

### Standard Validation

```html
<!-- Required fields -->
<input type="text" os-checkout-field="fname" required>

<!-- Email validation -->
<input type="email" os-checkout-field="email" required>

<!-- Phone validation -->
<input type="tel" os-checkout-field="phone" 
       pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}" 
       placeholder="123-456-7890">

<!-- Text length validation -->
<input type="text" os-checkout-field="lname" 
       required 
       minlength="2" 
       maxlength="50">

<!-- Numeric validation -->
<input type="text" os-checkout-field="postal" 
       pattern="[0-9]{5}(-[0-9]{4})?" 
       title="Please enter a valid ZIP code">
```

### Custom Validation Patterns

```html
<!-- US ZIP Code -->
<input type="text" os-checkout-field="postal" 
       pattern="[0-9]{5}(-[0-9]{4})?" 
       title="Enter 5 digits or ZIP+4 format">

<!-- Canadian Postal Code -->
<input type="text" os-checkout-field="postal" 
       pattern="[A-Za-z][0-9][A-Za-z] [0-9][A-Za-z][0-9]" 
       title="Enter format: A1B 2C3">

<!-- Credit Card (basic) -->
<input type="text" os-checkout-field="cc-number" 
       pattern="[0-9]{13,19}" 
       title="Enter 13-19 digit card number">

<!-- CVV -->
<input type="text" os-checkout-field="cvv" 
       pattern="[0-9]{3,4}" 
       title="Enter 3 or 4 digit security code">

<!-- Expiration Month -->
<select os-checkout-field="cc-month" required>
  <option value="">Month</option>
  <option value="01">01</option>
  <option value="02">02</option>
  <!-- ... -->
</select>

<!-- Expiration Year -->
<select os-checkout-field="cc-year" required>
  <option value="">Year</option>
  <option value="2024">2024</option>
  <option value="2025">2025</option>
  <!-- ... -->
</select>
```

## Error Display and Styling

### CSS for Validation States

```css
/* Base field styling */
.form-input {
  border: 1px solid #ddd;
  padding: 12px;
  border-radius: 4px;
  transition: border-color 0.3s ease;
}

/* Focus state */
.form-input:focus {
  outline: none;
  border-color: #2ecc71;
  box-shadow: 0 0 0 2px rgba(46, 204, 113, 0.2);
}

/* Valid state */
.form-input:valid {
  border-color: #2ecc71;
}

/* Invalid state */
.form-input:invalid {
  border-color: #e74c3c;
}

/* Error state (custom class) */
.form-input.error {
  border-color: #e74c3c;
  background-color: #fdf2f2;
}

/* Error message styling */
.field-error {
  color: #e74c3c;
  font-size: 0.875rem;
  margin-top: 5px;
  display: none;
}

.field-error.show {
  display: block;
}

/* Required field indicators */
.field-label.required::after {
  content: " *";
  color: #e74c3c;
}

/* Validation icons */
.field-container {
  position: relative;
}

.field-container .validation-icon {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  display: none;
}

.field-container.valid .validation-icon.success {
  display: block;
  color: #2ecc71;
}

.field-container.error .validation-icon.error {
  display: block;
  color: #e74c3c;
}
```

### HTML Structure with Error Display

```html
<div class="field-container">
  <label class="field-label required">Email Address</label>
  <input type="email" 
         os-checkout-field="email" 
         class="form-input" 
         required>
  <div class="validation-icon success">✓</div>
  <div class="validation-icon error">✗</div>
  <div class="field-error"></div>
</div>
```

## JavaScript Validation Enhancement

### Custom Validation Rules

```javascript
// Enhanced form validation
document.addEventListener('DOMContentLoaded', () => {
  setupCustomValidation();
});

function setupCustomValidation() {
  const form = document.querySelector('[os-checkout="form"]');
  if (!form) return;
  
  // Real-time validation
  const fields = form.querySelectorAll('[os-checkout-field]');
  fields.forEach(field => {
    field.addEventListener('blur', () => validateField(field));
    field.addEventListener('input', () => clearFieldError(field));
  });
  
  // Custom validation rules
  const validators = {
    fname: validateName,
    lname: validateName,
    email: validateEmail,
    phone: validatePhone,
    postal: validatePostalCode,
    'cc-number': validateCardNumber,
    cvv: validateCVV
  };
  
  // Apply validators
  Object.keys(validators).forEach(fieldName => {
    const field = document.querySelector(`[os-checkout-field="${fieldName}"]`);
    if (field) {
      field.addEventListener('blur', () => {
        const isValid = validators[fieldName](field.value);
        updateFieldValidation(field, isValid);
      });
    }
  });
}

// Validation functions
function validateName(value) {
  const name = value.trim();
  if (name.length < 2) {
    return { valid: false, message: 'Name must be at least 2 characters' };
  }
  if (!/^[a-zA-Z\s\-']+$/.test(name)) {
    return { valid: false, message: 'Name contains invalid characters' };
  }
  return { valid: true };
}

function validateEmail(value) {
  const email = value.trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(email)) {
    return { valid: false, message: 'Please enter a valid email address' };
  }
  return { valid: true };
}

function validatePhone(value) {
  const phone = value.replace(/\D/g, ''); // Remove non-digits
  
  if (phone.length < 10) {
    return { valid: false, message: 'Phone number must be at least 10 digits' };
  }
  return { valid: true };
}

function validatePostalCode(value) {
  const postal = value.trim().toUpperCase();
  
  // US ZIP code
  const usZip = /^\d{5}(-\d{4})?$/;
  // Canadian postal code
  const caPostal = /^[A-Z]\d[A-Z] \d[A-Z]\d$/;
  
  if (usZip.test(postal) || caPostal.test(postal)) {
    return { valid: true };
  }
  
  return { valid: false, message: 'Please enter a valid postal code' };
}

function validateCardNumber(value) {
  const number = value.replace(/\s/g, '');
  
  // Basic length check
  if (number.length < 13 || number.length > 19) {
    return { valid: false, message: 'Card number must be 13-19 digits' };
  }
  
  // Luhn algorithm check
  if (!luhnCheck(number)) {
    return { valid: false, message: 'Invalid card number' };
  }
  
  return { valid: true };
}

function validateCVV(value) {
  const cvv = value.replace(/\D/g, '');
  
  if (cvv.length < 3 || cvv.length > 4) {
    return { valid: false, message: 'CVV must be 3 or 4 digits' };
  }
  
  return { valid: true };
}

// Luhn algorithm for card validation
function luhnCheck(number) {
  let sum = 0;
  let isEven = false;
  
  for (let i = number.length - 1; i >= 0; i--) {
    let digit = parseInt(number.charAt(i));
    
    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    
    sum += digit;
    isEven = !isEven;
  }
  
  return (sum % 10) === 0;
}

// Update field validation state
function updateFieldValidation(field, result) {
  const container = field.closest('.field-container');
  const errorElement = container?.querySelector('.field-error');
  
  if (result.valid) {
    field.classList.remove('error');
    field.classList.add('valid');
    container?.classList.remove('error');
    container?.classList.add('valid');
    
    if (errorElement) {
      errorElement.textContent = '';
      errorElement.classList.remove('show');
    }
  } else {
    field.classList.remove('valid');
    field.classList.add('error');
    container?.classList.remove('valid');
    container?.classList.add('error');
    
    if (errorElement) {
      errorElement.textContent = result.message;
      errorElement.classList.add('show');
    }
  }
}

function clearFieldError(field) {
  field.classList.remove('error');
  const container = field.closest('.field-container');
  const errorElement = container?.querySelector('.field-error');
  
  if (errorElement) {
    errorElement.classList.remove('show');
  }
}
```

## Complete Validation Example

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Form Validation Example</title>
  
  <meta name="os-api-key" content="YOUR_API_KEY">
  
  <script src="https://rtc2.29next.com/campaign-cart/29next.min.js"></script>
  
  <style>
    .checkout-container { max-width: 600px; margin: 2rem auto; padding: 2rem; }
    .field-container { margin: 1rem 0; position: relative; }
    .field-label { display: block; font-weight: bold; margin-bottom: 0.5rem; color: #333; }
    .field-label.required::after { content: " *"; color: #e74c3c; }
    .form-input { width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 4px; font-size: 16px; transition: all 0.3s ease; }
    .form-input:focus { outline: none; border-color: #2ecc71; box-shadow: 0 0 0 2px rgba(46, 204, 113, 0.2); }
    .form-input.valid { border-color: #2ecc71; background-color: #f8fff9; }
    .form-input.error { border-color: #e74c3c; background-color: #fdf2f2; }
    .field-error { color: #e74c3c; font-size: 0.875rem; margin-top: 5px; display: none; }
    .field-error.show { display: block; }
    .validation-icon { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); display: none; font-weight: bold; }
    .field-container.valid .validation-icon.success { display: block; color: #2ecc71; }
    .field-container.error .validation-icon.error { display: block; color: #e74c3c; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    .checkout-button { width: 100%; padding: 15px; background: #2ecc71; color: white; border: none; border-radius: 4px; font-size: 18px; cursor: pointer; margin-top: 2rem; transition: background-color 0.3s ease; }
    .checkout-button:hover { background: #27ae60; }
    .checkout-button:disabled { background: #95a5a6; cursor: not-allowed; }
  </style>
</head>
<body>
  
  <div class="checkout-container">
    
    <h1>Validated Checkout Form</h1>
    
    <form os-checkout="form" novalidate>
      
      <!-- Customer Information -->
      <div class="form-row">
        <div class="field-container">
          <label class="field-label required">First Name</label>
          <input type="text" 
                 os-checkout-field="fname" 
                 class="form-input" 
                 required 
                 minlength="2">
          <div class="validation-icon success">✓</div>
          <div class="validation-icon error">✗</div>
          <div class="field-error"></div>
        </div>
        
        <div class="field-container">
          <label class="field-label required">Last Name</label>
          <input type="text" 
                 os-checkout-field="lname" 
                 class="form-input" 
                 required 
                 minlength="2">
          <div class="validation-icon success">✓</div>
          <div class="validation-icon error">✗</div>
          <div class="field-error"></div>
        </div>
      </div>
      
      <div class="field-container">
        <label class="field-label required">Email Address</label>
        <input type="email" 
               os-checkout-field="email" 
               class="form-input" 
               required>
        <div class="validation-icon success">✓</div>
        <div class="validation-icon error">✗</div>
        <div class="field-error"></div>
      </div>
      
      <div class="field-container">
        <label class="field-label required">Phone Number</label>
        <input type="tel" 
               os-checkout-field="phone" 
               class="form-input" 
               placeholder="(555) 123-4567"
               required>
        <div class="validation-icon success">✓</div>
        <div class="validation-icon error">✗</div>
        <div class="field-error"></div>
      </div>
      
      <!-- Address Information -->
      <div class="field-container">
        <label class="field-label required">Street Address</label>
        <input type="text" 
               os-checkout-field="address1" 
               class="form-input" 
               required>
        <div class="validation-icon success">✓</div>
        <div class="validation-icon error">✗</div>
        <div class="field-error"></div>
      </div>
      
      <div class="form-row">
        <div class="field-container">
          <label class="field-label required">City</label>
          <input type="text" 
                 os-checkout-field="city" 
                 class="form-input" 
                 required>
          <div class="validation-icon success">✓</div>
          <div class="validation-icon error">✗</div>
          <div class="field-error"></div>
        </div>
        
        <div class="field-container">
          <label class="field-label required">ZIP Code</label>
          <input type="text" 
                 os-checkout-field="postal" 
                 class="form-input" 
                 placeholder="12345 or 12345-6789"
                 required>
          <div class="validation-icon success">✓</div>
          <div class="validation-icon error">✗</div>
          <div class="field-error"></div>
        </div>
      </div>
      
      <!-- Payment Information -->
      <div class="field-container">
        <label class="field-label required">Card Number</label>
        <input type="text" 
               os-checkout-field="cc-number" 
               class="form-input" 
               placeholder="1234 5678 9012 3456"
               required>
        <div class="validation-icon success">✓</div>
        <div class="validation-icon error">✗</div>
        <div class="field-error"></div>
      </div>
      
      <div class="form-row">
        <div class="field-container">
          <label class="field-label required">Expiration</label>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem;">
            <select os-checkout-field="cc-month" class="form-input" required>
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
            <select os-checkout-field="cc-year" class="form-input" required>
              <option value="">Year</option>
              <option value="2024">2024</option>
              <option value="2025">2025</option>
              <option value="2026">2026</option>
              <option value="2027">2027</option>
              <option value="2028">2028</option>
              <option value="2029">2029</option>
            </select>
          </div>
          <div class="field-error"></div>
        </div>
        
        <div class="field-container">
          <label class="field-label required">CVV</label>
          <input type="text" 
                 os-checkout-field="cvv" 
                 class="form-input" 
                 placeholder="123"
                 maxlength="4"
                 required>
          <div class="validation-icon success">✓</div>
          <div class="validation-icon error">✗</div>
          <div class="field-error"></div>
        </div>
      </div>
      
      <div class="field-container">
        <label class="field-label required">Name on Card</label>
        <input type="text" 
               os-checkout-field="cc-name" 
               class="form-input" 
               required>
        <div class="validation-icon success">✓</div>
        <div class="validation-icon error">✗</div>
        <div class="field-error"></div>
      </div>
      
      <!-- Order Summary -->
      <div style="background: #f8f9fa; padding: 1rem; border-radius: 4px; margin: 2rem 0;">
        <div style="display: flex; justify-content: space-between; font-weight: bold;">
          <span>Total:</span>
          <span data-os-cart-total>$0.00</span>
        </div>
      </div>
      
      <!-- Checkout Button -->
      <button type="button" 
              os-checkout-payment="combo" 
              class="checkout-button"
              id="checkout-button">
        Complete Order
      </button>
      
    </form>
    
  </div>
  
  <script>
    // Enhanced validation implementation
    document.addEventListener('DOMContentLoaded', () => {
      setupFormValidation();
    });
    
    function setupFormValidation() {
      const form = document.querySelector('[os-checkout="form"]');
      const checkoutButton = document.getElementById('checkout-button');
      
      if (!form) return;
      
      // Validation functions (included from above examples)
      const validators = {
        fname: (value) => validateName(value),
        lname: (value) => validateName(value),
        email: (value) => validateEmail(value),
        phone: (value) => validatePhone(value),
        postal: (value) => validatePostalCode(value),
        'cc-number': (value) => validateCardNumber(value),
        cvv: (value) => validateCVV(value)
      };
      
      // Setup field validation
      Object.keys(validators).forEach(fieldName => {
        const field = document.querySelector(`[os-checkout-field="${fieldName}"]`);
        if (field) {
          field.addEventListener('blur', () => validateAndUpdateField(field, validators[fieldName]));
          field.addEventListener('input', () => clearFieldError(field));
        }
      });
      
      // Form submission validation
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        if (validateAllFields()) {
          // Form is valid, proceed with checkout
          console.log('Form is valid, proceeding with checkout');
        } else {
          console.log('Form has errors, please correct them');
        }
      });
      
      // Real-time form state checking
      form.addEventListener('input', updateFormState);
      form.addEventListener('change', updateFormState);
      
      function updateFormState() {
        const isValid = validateAllFields(false); // Don't show errors
        checkoutButton.disabled = !isValid;
      }
    }
    
    function validateAndUpdateField(field, validator) {
      const result = validator(field.value);
      updateFieldValidation(field, result);
      return result.valid;
    }
    
    function validateAllFields(showErrors = true) {
      const form = document.querySelector('[os-checkout="form"]');
      const fields = form.querySelectorAll('[os-checkout-field]');
      let isValid = true;
      
      fields.forEach(field => {
        const fieldName = field.getAttribute('os-checkout-field');
        
        // Check if field is required and empty
        if (field.hasAttribute('required') && !field.value.trim()) {
          if (showErrors) {
            updateFieldValidation(field, { 
              valid: false, 
              message: 'This field is required' 
            });
          }
          isValid = false;
          return;
        }
        
        // Run custom validation if available
        const validators = {
          fname: validateName,
          lname: validateName,
          email: validateEmail,
          phone: validatePhone,
          postal: validatePostalCode,
          'cc-number': validateCardNumber,
          cvv: validateCVV
        };
        
        if (validators[fieldName] && field.value.trim()) {
          const result = validators[fieldName](field.value);
          if (showErrors) {
            updateFieldValidation(field, result);
          }
          if (!result.valid) {
            isValid = false;
          }
        }
      });
      
      return isValid;
    }
    
    // Include all validation functions from previous examples...
    // (validateName, validateEmail, etc.)
  </script>
  
</body>
</html>
```

## Event-Based Validation

### Custom Validation Events

```javascript
// Listen for validation events
document.addEventListener('field.validation', (e) => {
  const { field, isValid, message } = e.detail;
  console.log(`Field ${field.name}: ${isValid ? 'valid' : 'invalid'}`);
  
  if (!isValid) {
    console.log('Error:', message);
  }
});

// Trigger custom validation
function triggerFieldValidation(field, isValid, message = '') {
  const event = new CustomEvent('field.validation', {
    detail: { field, isValid, message }
  });
  document.dispatchEvent(event);
}

// Form-level validation event
document.addEventListener('form.validation', (e) => {
  const { isValid, errors } = e.detail;
  
  if (isValid) {
    console.log('Form is valid!');
  } else {
    console.log('Form errors:', errors);
  }
});
```

## Best Practices

1. **Progressive Enhancement** - Start with HTML5 validation, add JavaScript enhancements
2. **Real-time Feedback** - Validate on blur, clear errors on input
3. **Clear Error Messages** - Provide specific, actionable feedback
4. **Visual Consistency** - Use consistent styling for all validation states
5. **Accessibility** - Include ARIA attributes and screen reader support
6. **Mobile Optimization** - Ensure validation works well on touch devices
7. **Server Validation** - Always validate on the server side as well

## Troubleshooting

### Common Issues

```javascript
// Debug validation state
function debugValidation() {
  const form = document.querySelector('[os-checkout="form"]');
  const fields = form.querySelectorAll('[os-checkout-field]');
  
  console.log('Form validation debug:');
  fields.forEach(field => {
    const fieldName = field.getAttribute('os-checkout-field');
    const isRequired = field.hasAttribute('required');
    const hasValue = !!field.value.trim();
    const isValid = field.validity.valid;
    
    console.log(`${fieldName}: required=${isRequired}, hasValue=${hasValue}, valid=${isValid}`);
  });
}

// Check for validation errors
function checkValidationErrors() {
  const errorElements = document.querySelectorAll('.field-error.show');
  console.log(`Found ${errorElements.length} validation errors:`);
  
  errorElements.forEach(error => {
    console.log('Error:', error.textContent);
  });
}
```

## Next Steps

- [Payment Configuration](payment-config.md) - Secure payment validation
- [Google Autocomplete](google-autocomplete.md) - Address field enhancement
- [Test Orders](../development/test-orders.md) - Testing form validation