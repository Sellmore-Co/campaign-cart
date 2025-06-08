# Google Address Autocomplete Guide

Guide to implementing Google Maps address autocomplete for checkout forms.

## Overview

Campaign Cart includes built-in Google Maps address autocomplete that helps users quickly fill in shipping and billing addresses. This feature automatically detects when Google Maps API is available and enhances your checkout forms.

## Basic Setup

### HTML Structure

Your checkout form needs properly structured address fields:

```html
<form os-checkout="form">
  
  <!-- Shipping Address -->
  <div data-os-component="location">
    <h3>Shipping Address</h3>
    
    <input type="text" 
           os-checkout-field="address1" 
           placeholder="Start typing your address..." 
           autocomplete="street-address">
    
    <input type="text" 
           os-checkout-field="city" 
           placeholder="City" 
           autocomplete="address-level2">
    
    <select os-checkout-field="province" autocomplete="address-level1">
      <option value="">Select State</option>
      <option value="CA">California</option>
      <option value="NY">New York</option>
    </select>
    
    <input type="text" 
           os-checkout-field="postal" 
           placeholder="ZIP Code" 
           autocomplete="postal-code">
  </div>
  
  <!-- Billing Address (if different) -->
  <div data-os-component="location">
    <h3>Billing Address</h3>
    
    <input type="text" 
           os-checkout-field="billing-address1" 
           placeholder="Billing address..." 
           autocomplete="billing street-address">
    
    <input type="text" 
           os-checkout-field="billing-city" 
           placeholder="City" 
           autocomplete="billing address-level2">
    
    <select os-checkout-field="billing-province" autocomplete="billing address-level1">
      <option value="">Select State</option>
    </select>
    
    <input type="text" 
           os-checkout-field="billing-postal" 
           placeholder="ZIP Code" 
           autocomplete="billing postal-code">
  </div>
  
</form>
```

### Required Attributes

| Element | Attribute | Purpose |
|---------|-----------|---------|
| Location container | `data-os-component="location"` | Groups address fields |
| Address field | `os-checkout-field="address1"` | Main address autocomplete |
| City field | `os-checkout-field="city"` | Auto-filled city |
| State field | `os-checkout-field="province"` | Auto-filled state |
| ZIP field | `os-checkout-field="postal"` | Auto-filled postal code |

## Google Maps API Setup

### Include Google Maps Script

```html
<script async defer
  src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=places">
</script>
```

### Configuration Options

```javascript
// Disable autocomplete if needed
window.osConfig = window.osConfig || {};
window.osConfig.enableGoogleMapsAutocomplete = false; // Default: true

// Set default country for autocomplete
window.osConfig.defaultCountry = 'US'; // Default: 'US'
```

## Complete Example

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Checkout with Address Autocomplete</title>
  
  <meta name="os-api-key" content="YOUR_API_KEY">
  
  <!-- Google Maps API -->
  <script async defer
    src="https://maps.googleapis.com/maps/api/js?key=YOUR_GOOGLE_MAPS_KEY&libraries=places">
  </script>
  
  <script src="https://rtc2.29next.com/campaign-cart/29next.min.js"></script>
  
  <style>
    .checkout-form { max-width: 600px; margin: 2rem auto; padding: 2rem; }
    .location-section { margin: 2rem 0; padding: 1.5rem; border: 1px solid #ddd; border-radius: 8px; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin: 1rem 0; }
    .form-group { margin: 1rem 0; }
    .form-input { width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 4px; font-size: 16px; }
    .form-input:focus { outline: none; border-color: #2ecc71; }
    .checkout-button { width: 100%; padding: 15px; background: #2ecc71; color: white; border: none; border-radius: 4px; font-size: 18px; cursor: pointer; margin-top: 2rem; }
    
    /* Hidden location fields (shown when address is entered) */
    .cc-hidden { display: none; }
  </style>
</head>
<body>
  
  <div class="checkout-form">
    
    <h1>Checkout</h1>
    
    <form os-checkout="form">
      
      <!-- Customer Info -->
      <div class="form-row">
        <input type="text" os-checkout-field="fname" placeholder="First Name" class="form-input" required>
        <input type="text" os-checkout-field="lname" placeholder="Last Name" class="form-input" required>
      </div>
      
      <div class="form-group">
        <input type="email" os-checkout-field="email" placeholder="Email Address" class="form-input" required>
      </div>
      
      <!-- Shipping Address with Autocomplete -->
      <div data-os-component="location" class="location-section">
        <h3>Shipping Address</h3>
        
        <div class="form-group">
          <input type="text" 
                 os-checkout-field="address1" 
                 placeholder="Start typing your address..." 
                 class="form-input" 
                 autocomplete="street-address"
                 required>
        </div>
        
        <div class="form-row">
          <input type="text" 
                 os-checkout-field="city" 
                 placeholder="City" 
                 class="form-input" 
                 autocomplete="address-level2"
                 required>
          
          <select os-checkout-field="province" 
                  class="form-input" 
                  autocomplete="address-level1"
                  required>
            <option value="">Select State</option>
            <option value="AL">Alabama</option>
            <option value="CA">California</option>
            <option value="FL">Florida</option>
            <option value="NY">New York</option>
            <option value="TX">Texas</option>
          </select>
        </div>
        
        <div class="form-group">
          <input type="text" 
                 os-checkout-field="postal" 
                 placeholder="ZIP Code" 
                 class="form-input" 
                 autocomplete="postal-code"
                 required>
        </div>
      </div>
      
      <!-- Order Total -->
      <div style="background: #f8f9fa; padding: 1rem; border-radius: 4px;">
        <div style="display: flex; justify-content: space-between; font-weight: bold;">
          <span>Total:</span>
          <span data-os-cart-total>$0.00</span>
        </div>
      </div>
      
      <!-- Checkout Button -->
      <button type="button" os-checkout-payment="combo" class="checkout-button">
        Complete Order
      </button>
      
    </form>
    
  </div>
  
  <script>
    // Listen for address autocomplete events
    document.addEventListener('location-fields-shown', () => {
      console.log('Address fields populated by autocomplete');
    });
  </script>
  
</body>
</html>
```

## How It Works

1. **Auto-Detection**: Campaign Cart automatically detects Google Maps API
2. **Field Enhancement**: Address fields get autocomplete functionality
3. **Auto-Population**: City, state, and ZIP are filled automatically
4. **Field Visibility**: Location fields are shown after address selection
5. **Fallback**: Works normally without Google Maps API

## Customization

### Disable Autocomplete

```javascript
window.osConfig = window.osConfig || {};
window.osConfig.enableGoogleMapsAutocomplete = false;
```

### Country Restriction

```javascript
// Restrict autocomplete to specific country
window.osConfig.defaultCountry = 'CA'; // Canada only
```

### Custom Styling

```css
/* Style Google autocomplete dropdown */
.pac-container {
  border-radius: 4px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  border: 1px solid #ddd;
}

.pac-item {
  padding: 12px;
  border-bottom: 1px solid #eee;
}

.pac-item:hover {
  background-color: #f8f9fa;
}

.pac-item-selected {
  background-color: #e3f2fd;
}
```

## Events

### JavaScript Events

```javascript
// Address fields shown after autocomplete
document.addEventListener('location-fields-shown', (e) => {
  console.log('Address autocomplete completed');
  
  // Custom logic after address selection
  validateShippingZone();
});

// Manual field detection
document.addEventListener('DOMContentLoaded', () => {
  const addressField = document.querySelector('[os-checkout-field="address1"]');
  
  if (addressField) {
    addressField.addEventListener('change', () => {
      console.log('Address changed:', addressField.value);
    });
  }
});
```

## Fallback Behavior

When Google Maps API is not available:

- Address fields work as normal text inputs
- No autocomplete functionality
- All validation still works
- Form submission proceeds normally

## Troubleshooting

### Common Issues

```javascript
// Check if Google Maps API loaded
console.log('Google Maps available:', !!window.google?.maps?.places);

// Check configuration
console.log('Autocomplete enabled:', window.osConfig?.enableGoogleMapsAutocomplete !== false);

// Verify required elements
const locationContainers = document.querySelectorAll('[data-os-component="location"]');
console.log('Location containers found:', locationContainers.length);

const addressFields = document.querySelectorAll('[os-checkout-field="address1"]');
console.log('Address fields found:', addressFields.length);
```

### API Key Issues

1. Verify Google Maps API key is valid
2. Ensure Places API is enabled in Google Cloud Console
3. Check API key restrictions and quotas
4. Verify billing is set up for Google Cloud Project

### Field Mapping Issues

```javascript
// Debug field mapping
document.addEventListener('checkout.ready', () => {
  const fields = {
    address: document.querySelector('[os-checkout-field="address1"]'),
    city: document.querySelector('[os-checkout-field="city"]'),
    state: document.querySelector('[os-checkout-field="province"]'),
    zip: document.querySelector('[os-checkout-field="postal"]')
  };
  
  console.log('Address fields:', fields);
});
```

## Best Practices

1. **API Key Security** - Use domain restrictions for API keys
2. **Loading States** - Show loading indicators while API loads
3. **Error Handling** - Graceful fallback when API fails
4. **Mobile Optimization** - Test autocomplete on mobile devices
5. **Validation** - Validate addresses after autocomplete
6. **Privacy** - Inform users about Google Maps usage

## Next Steps

- [Payment Configuration](payment-config.md) - Credit card processing setup
- [Form Validation](form-validation.md) - Client-side validation
- [Checkout Events](../../api/events-reference.md) - Form submission events