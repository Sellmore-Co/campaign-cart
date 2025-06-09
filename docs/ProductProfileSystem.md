# Product Profile System (Simplified)

The Product Profile System provides a powerful abstraction layer for managing products programmatically with semantic names instead of package IDs.

## 🎯 Key Benefits

- **Easier programmatic cart operations**: `client.profiles.addToCart('discreet-packaging')`
- **Semantic naming**: Use meaningful names instead of package IDs
- **Multi-package profiles**: Bundle multiple packages into one profile
- **Rich metadata**: Categories, tags, descriptions for business logic
- **Seamless pricing**: Display profile prices anywhere on the page
- **Backward compatible**: Existing package system continues to work unchanged

## 🚀 Simple Configuration

Add product profiles to your `osConfig` using the simplified format:

```javascript
window.osConfig = {
  // Simplified Product Profiles (no country mappings!)
  productProfiles: {
    'lem': {
      name: 'LEM',
      packageId: '1',
      quantity: 1,
      description: 'Core product offering'
    },
    
    'discreet-packaging': {
      name: 'Discreet Packaging',
      packageId: '3',
      quantity: 1,
      description: 'Private shipping option'
    },
    
    'avo-upsell': {
      name: 'Avo Upsell',
      packageId: '11',
      quantity: 1,
      description: 'Premium upgrade option'
    },
    
    // Multi-package profile example
    'starter-bundle': {
      name: 'Starter Bundle',
      packages: [
        { packageId: '1', quantity: 1 },   // Main product
        { packageId: '3', quantity: 1 }    // Add-on
      ],
      description: 'Perfect starter combination',
      metadata: {
        category: 'bundles',
        featured: true,
        tags: ['popular', 'savings']
      }
    }
  }
}
```

## 💻 Programmatic Cart Operations

### Add Profile to Cart
```javascript
// Simple add to cart
await client.profiles.addToCart('discreet-packaging');

// Add with custom quantity
await client.profiles.addToCart('lem', { quantity: 2 });

// Mark as upsell
await client.profiles.addToCart('avo-upsell', { is_upsell: true });

// Check if operation was successful
const success = await client.profiles.addToCart('starter-bundle');
if (success) {
  console.log('Profile added successfully!');
}
```

### Remove Profile from Cart
```javascript
// Remove specific profile
await client.profiles.removeFromCart('discreet-packaging');

// Clear all profiles from cart
await client.profiles.clearProfilesFromCart();
```

### Check Cart Status
```javascript
// Check if profile is in cart
if (client.profiles.isInCart('lem')) {
  console.log('LEM is in cart');
}

// Get all profiles currently in cart
const cartProfiles = client.profiles.getCartProfiles();
console.log('Profiles in cart:', cartProfiles);
```

## 🏷️ Profile Management

### Get Profile Information
```javascript
// Get specific profile
const profile = client.profiles.getProfile('lem');
console.log(profile.name, profile.description);

// Get all profiles
const allProfiles = client.profiles.getProfiles();

// Get profiles by category
const bundles = client.profiles.getProfilesByCategory('bundles');
const addons = client.profiles.getProfilesByCategory('add-ons');

// Get featured profiles
const featured = client.profiles.getFeaturedProfiles();
```

### Profile Pricing
```javascript
// Get profile prices
const salePrice = client.profiles.getPrice('lem', 'total-sale');
const regularPrice = client.profiles.getPrice('lem', 'total-regular');
const savings = client.profiles.getPrice('lem', 'total-saving-amount');

// Get formatted price strings
const formattedPrice = client.profiles.getFormattedPrice('lem', 'total-sale');
const priceWithDecimals = client.profiles.getFormattedPrice('lem', 'total-sale', { 
  showDecimals: true 
});

console.log('Sale price:', formattedPrice);        // "$89"
console.log('With decimals:', priceWithDecimals);  // "$89.00"
```

## 🎨 Profile Pricing Display

Display profile prices anywhere on your page using data attributes:

### Basic Usage
```html
<!-- Display profile sale price -->
<span data-os-profile-price="total-sale" data-os-profile-id="lem">$89</span>

<!-- Display profile savings -->
<span data-os-profile-price="total-saving-percentage" data-os-profile-id="lem">20% OFF</span>
```

### Complete Example
```html
<div class="product-card">
  <h3>LEM Core Product</h3>
  
  <!-- Main pricing -->
  <div class="price-display">
    <span class="current-price" 
          data-os-profile-price="total-sale" 
          data-os-profile-id="lem">$89</span>
    <span class="original-price" 
          data-os-profile-price="total-regular" 
          data-os-profile-id="lem">$118</span>
  </div>
  
  <!-- Savings badge -->
  <div class="savings" data-container="true">
    Save <span data-os-profile-price="total-saving-amount" 
               data-os-profile-id="lem" 
               data-os-hide-if-zero="true">$29</span>
  </div>
  
  <!-- Toggle button -->
  <button data-os-action="toggle-item" 
          data-os-profile="lem">
    Add to Cart
  </button>
</div>
```

## 🎪 Event System

Listen for profile events:

```javascript
// Profile added to cart
document.addEventListener('os:profile.added', (event) => {
  const { profileId, profile } = event.detail;
  console.log(`Added ${profile.name} to cart`);
});

// Profile removed from cart
document.addEventListener('os:profile.removed', (event) => {
  const { profileId, itemsRemoved } = event.detail;
  console.log(`Removed profile ${profileId} (${itemsRemoved} items)`);
});
```

## 🔧 Toggle Integration

Profiles work seamlessly with the toggle system:

```html
<!-- Profile toggles (recommended) -->
<button data-os-action="toggle-item" 
        data-os-profile="discreet-packaging"
        data-os-upsell="true">
  Add Discreet Packaging
</button>

<!-- Package toggles (still works) -->
<button data-os-action="toggle-item" 
        data-os-package="3">
  Add Package 3
</button>
```

## 📊 Configuration Options

### Single Package Profile
```javascript
'profile-name': {
  name: 'Display Name',
  packageId: '1',              // Required: package ID
  quantity: 1,                 // Optional: default 1
  description: 'Description',  // Optional
  metadata: {                  // Optional
    category: 'category-name',
    featured: true,
    tags: ['tag1', 'tag2']
  }
}
```

### Multi-Package Profile
```javascript
'bundle-name': {
  name: 'Bundle Display Name',
  packages: [                  // Array of packages
    { packageId: '1', quantity: 1 },
    { packageId: '3', quantity: 2 }
  ],
  description: 'Bundle description',
  metadata: {
    category: 'bundles',
    featured: true
  }
}
```

### Metadata Options
```javascript
metadata: {
  category: 'bundles',         // For filtering: getProfilesByCategory()
  featured: true,              // For filtering: getFeaturedProfiles()
  tags: ['popular', 'new'],    // For custom filtering
  displayOrder: 1,             // For sorting
  hidden: false                // For hiding in lists
}
```


## 🎯 Best Practices

### Profile Naming
- Use descriptive, kebab-case IDs: `starter-kit`, `discreet-packaging`
- Keep names business-friendly, not technical
- Use semantic names that describe the purpose

### Error Handling
```javascript
// Always check operation success
const success = await client.profiles.addToCart('lem');
if (!success) {
  console.error('Failed to add profile to cart');
  // Show user-friendly error message
}

// Validate profile exists before operations
const profile = client.profiles.getProfile('lem');
if (!profile) {
  console.error('Profile not found');
  return;
}
```

### HTML Integration
```html
<!-- Use semantic profile names in HTML -->
<div data-os-profile="discreet-packaging" class="add-on-option">
  <input type="checkbox" data-os-action="toggle-item" data-os-profile="discreet-packaging">
  <label>Add Discreet Packaging (+<span data-os-profile-price="total-sale" data-os-profile-id="discreet-packaging">$5</span>)</label>
</div>
```

## 🎉 Summary

The Simplified Product Profile System provides:

✅ **No Country Complexity**: One package ID per profile  
✅ **Semantic Names**: Use meaningful names instead of IDs  
✅ **Easy Integration**: Drop-in replacement for package IDs  
✅ **Multi-Package Support**: Bundle multiple packages  
✅ **Rich Metadata**: Categories, tags, descriptions  
✅ **Pricing Display**: Show profile prices anywhere  
✅ **Event Driven**: Listen for profile cart changes  
✅ **Backward Compatible**: Works alongside existing package system  

This simplified system removes all the country mapping complexity while keeping the powerful semantic profile functionality! 