# Product Profile System

The Product Profile System provides a powerful abstraction layer for managing products programmatically while maintaining full backward compatibility with the existing package system.

## 🎯 Key Benefits

- **Easier programmatic cart operations**: `client.profiles.addToCart('starter-kit')`
- **Country-aware mappings**: Automatically use correct packages per country
- **Multi-package profiles**: Bundle multiple packages into one profile
- **Rich metadata**: Categories, tags, descriptions for business logic
- **Seamless pricing**: Display profile prices anywhere on the page
- **Backward compatible**: Existing package system continues to work unchanged

## 🚀 Configuration

Add product profiles to your existing `osConfig`:

```javascript
window.osConfig = {
  // Existing functionality (unchanged)
  countryCampaigns: {
    campaignIds: {
      'US': 'your-us-campaign-id',
      'CA': 'your-ca-campaign-id'
    },
    packageMaps: {
      'US': { '12': '12' },
      'CA': { '12': '1' }
    }
  },
  
  // NEW: Product Profiles
  productProfiles: {
    'starter-kit': {
      name: 'Starter Facial Kit',
      description: 'Perfect for first-time users',
      campaignMappings: {
        'US': { packageId: '12', quantity: 1 },
        'CA': { packageId: '1', quantity: 1 },
        'GB': { packageId: '5', quantity: 1 }
      },
      metadata: {
        category: 'kits',
        featured: true,
        tags: ['beginner', 'popular'],
        displayOrder: 1
      }
    },
    
    'monthly-subscription': {
      name: 'Monthly Subscription',
      description: 'Auto-delivery every month',
      campaignMappings: {
        'US': { packageId: '6', quantity: 1 },
        'CA': { packageId: '3', quantity: 1 }
      },
      metadata: {
        category: 'subscriptions',
        recurring: true,
        tags: ['subscription', 'savings']
      }
    },
    
    // Multi-package profile example
    'ultimate-bundle': {
      name: 'Ultimate Bundle',
      description: 'Everything you need',
      campaignMappings: {
        'US': [
          { packageId: '12', quantity: 1 },  // Main product
          { packageId: '8', quantity: 2 }   // Add-on items
        ],
        'CA': [
          { packageId: '1', quantity: 1 },
          { packageId: '4', quantity: 2 }
        ]
      },
      metadata: {
        category: 'bundles',
        bestValue: true,
        tags: ['comprehensive', 'savings']
      }
    }
  }
}
```

## 💻 Programmatic Cart Operations

### Add Profile to Cart
```javascript
// Simple add to cart
await client.profiles.addToCart('starter-kit');

// Add with custom quantity
await client.profiles.addToCart('monthly-subscription', { quantity: 2 });

// Check if operation was successful
const success = await client.profiles.addToCart('ultimate-bundle');
if (success) {
  console.log('Profile added successfully!');
}
```

### Remove Profile from Cart
```javascript
// Remove specific profile
await client.profiles.removeFromCart('starter-kit');

// Clear all profiles from cart
await client.profiles.clearProfilesFromCart();
```

### Check Cart Status
```javascript
// Check if profile is in cart
if (client.profiles.isInCart('starter-kit')) {
  console.log('Starter kit is in cart');
}

// Get all profiles currently in cart
const cartProfiles = client.profiles.getCartProfiles();
console.log('Profiles in cart:', cartProfiles);
```

## 🏷️ Profile Management

### Get Profile Information
```javascript
// Get specific profile
const profile = client.profiles.getProfile('starter-kit');
console.log(profile.name, profile.description);

// Get all profiles
const allProfiles = client.profiles.getProfiles();

// Get profiles by category
const kits = client.profiles.getProfilesByCategory('kits');
const subscriptions = client.profiles.getProfilesByCategory('subscriptions');

// Get featured profiles
const featured = client.profiles.getFeaturedProfiles();
```

### Profile Pricing
```javascript
// Get profile prices
const salePrice = client.profiles.getPrice('starter-kit', 'total-sale');
const regularPrice = client.profiles.getPrice('starter-kit', 'total-regular');
const savings = client.profiles.getPrice('starter-kit', 'total-saving-amount');

// Get formatted price strings
const formattedPrice = client.profiles.getFormattedPrice('starter-kit', 'total-sale');
const priceWithDecimals = client.profiles.getFormattedPrice('starter-kit', 'total-sale', { 
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
<span data-os-profile-price="total-sale" data-os-profile-id="starter-kit">$89</span>

<!-- Display profile savings -->
<span data-os-profile-price="total-saving-percentage" data-os-profile-id="starter-kit">20% OFF</span>
```

### All Available Attributes
```html
<span data-os-profile-price="total-sale" 
      data-os-profile-id="starter-kit"
      data-os-show-decimals="true"
      data-os-hide-if-zero="true"
      data-os-format="default">$89.00</span>
```

### Supported Price Types
Same as package pricing:
- `total-sale`, `total-regular`, `total-saving-amount`, `total-saving-percentage`
- `unit-sale`, `unit-regular`, `unit-saving-amount`, `unit-saving-percentage`

### Profile Pricing Examples
```html
<div class="product-card">
  <h3 data-os-profile-name="starter-kit">Starter Facial Kit</h3>
  
  <!-- Main pricing -->
  <div class="price-display">
    <span class="current-price" 
          data-os-profile-price="total-sale" 
          data-os-profile-id="starter-kit">$89</span>
    <span class="original-price" 
          data-os-profile-price="total-regular" 
          data-os-profile-id="starter-kit">$118</span>
  </div>
  
  <!-- Savings badge -->
  <div class="savings" data-container="true">
    Save <span data-os-profile-price="total-saving-amount" 
               data-os-profile-id="starter-kit" 
               data-os-hide-if-zero="true">$29</span>
  </div>
  
  <!-- Per unit pricing for multi-item profiles -->
  <div class="per-item">
    Only <span data-os-profile-price="unit-sale" 
               data-os-profile-id="starter-kit" 
               data-os-divide-by="4">$22.25</span> per facial
  </div>
  
  <!-- Add to cart button -->
  <button onclick="addProfileToCart('starter-kit')">Add to Cart</button>
</div>
```

## 🌍 Country Integration

Profiles automatically adapt to the current country:

```javascript
// When country changes to CA:
// - Profile 'starter-kit' uses package '1' instead of '12'
// - Prices update to Canadian prices with C$ currency
// - All profile pricing displays refresh automatically

// Force country for testing
// ?forceCountry=CA
const currentCountry = client.countryCampaign.getCurrentCountry(); // "CA"
const mapping = client.profiles.getCurrentMapping('starter-kit');
console.log(mapping); // { packageId: '1', quantity: 1 }
```

## 📦 Multi-Package Profiles

Profiles can contain multiple packages:

```javascript
window.osConfig.productProfiles = {
  'mega-bundle': {
    name: 'Mega Bundle Deal',
    campaignMappings: {
      'US': [
        { packageId: '12', quantity: 1 },  // Main kit
        { packageId: '8', quantity: 2 },   // Refills
        { packageId: '15', quantity: 1 }   // Bonus item
      ]
    }
  }
};

// Adding to cart will add all 3 packages
await client.profiles.addToCart('mega-bundle');

// Pricing automatically calculates total of all packages
const totalPrice = client.profiles.getPrice('mega-bundle', 'total-sale');
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

## 🔄 Migration from Package System

### Before (Package System)
```javascript
// Manual cart operations
await client.cart.addToCart({
  id: '12',  // Hard-coded package ID
  name: 'Starter Kit',
  price: 89,
  quantity: 1,
  type: 'package'
});

// Country switching required manual package ID translation
const countryMaps = window.osConfig.countryCampaigns.packageMaps;
const currentCountry = client.countryCampaign.getCurrentCountry();
const translatedId = countryMaps[currentCountry]['12']; // Manual translation
```

### After (Profile System)
```javascript
// Simple profile operations
await client.profiles.addToCart('starter-kit');

// Automatic country handling
// Profile system automatically:
// - Detects current country
// - Maps to correct package ID
// - Uses correct campaign pricing
// - Handles currency display
```

### Backward Compatibility
```html
<!-- Existing package pricing (continues to work) -->
<span data-os-package-price="total-sale" data-os-package-id="12">$89</span>

<!-- New profile pricing (works alongside) -->
<span data-os-profile-price="total-sale" data-os-profile-id="starter-kit">$89</span>
```

## 🛠️ Advanced Use Cases

### Dynamic Profile Creation
```javascript
// Add profiles dynamically (for admin interfaces)
window.osConfig.productProfiles['limited-edition'] = {
  name: 'Limited Edition Set',
  campaignMappings: {
    'US': { packageId: '99', quantity: 1 }
  },
  metadata: {
    category: 'limited',
    featured: true,
    endDate: '2024-12-31'
  }
};

// Refresh profile manager to pick up changes
client.profiles.refresh(); // If we add this method
```

### Conditional Profile Display
```javascript
// Show profiles based on metadata
const availableProfiles = client.profiles.getProfiles().filter(profile => {
  const endDate = profile.metadata?.endDate;
  return !endDate || new Date(endDate) > new Date();
});

const featuredKits = client.profiles.getProfilesByCategory('kits')
  .filter(profile => profile.metadata?.featured);
```

### Custom Checkout Flows
```javascript
// Build custom checkout experiences
async function createCustomBundle() {
  // Clear existing cart
  await client.cart.clearCart();
  
  // Add multiple profiles
  await client.profiles.addToCart('starter-kit');
  await client.profiles.addToCart('monthly-subscription');
  
  // Get total price
  const cartProfiles = client.profiles.getCartProfiles();
  let totalPrice = 0;
  for (const profileId of cartProfiles) {
    totalPrice += client.profiles.getPrice(profileId, 'total-sale');
  }
  
  console.log(`Custom bundle total: $${totalPrice}`);
  
  // Proceed to checkout
  window.location.href = '/checkout';
}
```

## 🎯 Best Practices

### Profile Naming
- Use descriptive, kebab-case IDs: `starter-kit`, `monthly-subscription`
- Keep names business-friendly, not technical

### Campaign Mappings
- Always include fallback mappings for primary markets
- Test with `?forceCountry=XX` URL parameter
- Validate package IDs exist in target campaigns

### Metadata Usage
- Use `category` for filtering and organization
- Use `featured` for highlighting important products
- Use `tags` for flexible filtering and search
- Use `displayOrder` for sorting

### Error Handling
```javascript
// Always check operation success
const success = await client.profiles.addToCart('starter-kit');
if (!success) {
  console.error('Failed to add profile to cart');
  // Show user-friendly error message
}

// Validate profile exists before operations
const profile = client.profiles.getProfile('starter-kit');
if (!profile) {
  console.error('Profile not found');
  return;
}
```

## 🎉 Summary

The Product Profile System provides:

✅ **Backward Compatible**: Existing package system unchanged  
✅ **Powerful API**: Easy programmatic cart operations  
✅ **Country Aware**: Automatic package mapping per country  
✅ **Multi-Package**: Bundle multiple packages into profiles  
✅ **Rich Metadata**: Categories, tags, descriptions  
✅ **Pricing Display**: Show profile prices anywhere  
✅ **Event Driven**: Listen for profile cart changes  
✅ **Testing Support**: Force country via URL parameters  

This system makes it much easier to build dynamic product experiences while maintaining the flexibility and power of the underlying campaign system! 