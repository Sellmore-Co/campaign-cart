# Profile-Based Package Mapping System

The Profile System enables dynamic package ID swapping across your entire e-commerce implementation. This powerful feature allows you to maintain multiple pricing tiers, seasonal promotions, and customer-specific offers without duplicating your frontend code.

## Table of Contents

- [Overview](#overview)
- [Core Concepts](#core-concepts)
- [Configuration](#configuration)
- [Implementation Methods](#implementation-methods)
- [JavaScript API](#javascript-api)
- [HTML Data Attributes](#html-data-attributes)
- [URL Parameters](#url-parameters)
- [Real-World Examples](#real-world-examples)
- [Advanced Usage](#advanced-usage)
- [Performance Considerations](#performance-considerations)
- [Troubleshooting](#troubleshooting)

## Overview

The Profile System solves a common e-commerce challenge: how to efficiently manage different product variants (regular price, discounted, bundles) without complex conditional logic throughout your codebase. Instead of hardcoding package IDs, you define mapping profiles that automatically swap packages based on the active profile.

### Key Benefits

- **Dynamic Pricing**: Switch between pricing tiers instantly
- **Seasonal Promotions**: Activate holiday sales with a single profile change
- **A/B Testing**: Test different pricing strategies seamlessly
- **Membership Tiers**: Offer VIP pricing to premium customers
- **Bundle Management**: Convert single items to multi-packs automatically

## Core Concepts

### What is a Profile?

A profile is a named configuration that defines how package IDs should be mapped. When a profile is active, any reference to an original package ID is automatically translated to its mapped counterpart.

```javascript
// Profile Definition
{
  id: "black_friday",
  name: "Black Friday Sale",
  packageMappings: {
    1: 101,  // Package 1 → Package 101 (BF variant)
    2: 102,  // Package 2 → Package 102 (BF variant)
    // ... more mappings
  }
}
```

### How Mapping Works

1. **Original State**: Your site uses standard package IDs (1, 2, 3, etc.)
2. **Profile Activation**: User or system activates a profile
3. **Automatic Mapping**: All package operations use mapped IDs
4. **Transparent Integration**: Cart, checkout, and display components update automatically

## Configuration

### Basic Setup

Add profile configuration to your `window.nextConfig`:

```html
<script>
window.nextConfig = {
  apiKey: 'your-api-key',
  
  // Define your profiles
  profiles: {
    // Regular pricing (no mappings needed)
    "regular": {
      name: "Regular Pricing",
      description: "Standard retail prices"
    },
    
    // Discount profile
    "sale_20": {
      name: "20% Off Sale",
      description: "Limited time 20% discount",
      packageMappings: {
        1: 101,  // Regular Product A → Sale Product A
        2: 102,  // Regular Product B → Sale Product B
        3: 103,  // Regular Product C → Sale Product C
      }
    },
    
    // VIP member profile
    "vip": {
      name: "VIP Member Pricing",
      description: "Exclusive VIP discounts",
      packageMappings: {
        1: 201,  // Regular → VIP variant
        2: 202,
        3: 203,
      }
    }
  },
  
  // Optional: Set default profile
  defaultProfile: "regular"
};
</script>
```

### Grounded Sheets Example

For the Grounded Sheets product line with multiple variants:

```javascript
profiles: {
  // Exit intent discount
  "exit_10": {
    name: "Exit 10% Discount",
    packageMappings: {
      // Single quantity mappings
      1: 78,   // Twin Obsidian Grey → Exit 10% variant
      2: 79,   // Twin Chateau Ivory → Exit 10% variant
      3: 82,   // Double Obsidian Grey → Exit 10% variant
      4: 83,   // Double Chateau Ivory → Exit 10% variant
      5: 86,   // Queen Obsidian Grey → Exit 10% variant
      6: 90,   // King Obsidian Grey → Exit 10% variant
      7: 87,   // Queen Chateau Ivory → Exit 10% variant
      8: 91,   // King Chateau Ivory → Exit 10% variant
      // ... continue for all colors/sizes
    }
  },
  
  // Bundle profiles
  "2_pack": {
    name: "2-Pack Bundle",
    packageMappings: {
      1: 29,   // Twin Obsidian Grey → 2-pack
      2: 30,   // Twin Chateau Ivory → 2-pack
      3: 33,   // Double Obsidian Grey → 2-pack
      // ... all 2-pack mappings
    }
  },
  
  "3_pack": {
    name: "3-Pack Bundle",
    packageMappings: {
      1: 53,   // Twin Obsidian Grey → 3-pack
      2: 54,   // Twin Chateau Ivory → 3-pack
      3: 58,   // Double Obsidian Grey → 3-pack
      // ... all 3-pack mappings
    }
  }
}
```

## Implementation Methods

### Method 1: URL Parameters

The simplest way to activate profiles is through URL parameters:

```
// Apply profile (preserves cart)
https://example.com/checkout?profile=black_friday

// Force profile (clears cart first)
https://example.com/checkout?forceProfile=vip

// Alternative parameter name
https://example.com/checkout?packageProfile=sale_20
```

### Method 2: JavaScript API

Programmatic control via the `window.next` API:

```javascript
// Apply a profile
await window.next.setProfile('black_friday');

// Apply with options
await window.next.setProfile('vip', {
  clearCart: false,        // Keep existing cart items
  preserveQuantities: true  // Maintain item quantities
});

// Revert to no profile
await window.next.revertProfile();

// Check active profile
const currentProfile = window.next.getActiveProfile();
console.log(currentProfile); // "black_friday"

// Get mapped package ID
const mappedId = window.next.getMappedPackageId(1);
console.log(mappedId); // 101 (if black_friday is active)

// Get original package ID from mapped
const originalId = window.next.getOriginalPackageId(101);
console.log(originalId); // 1

// List all available profiles
const profiles = window.next.listProfiles();
console.log(profiles); // ["regular", "black_friday", "vip"]

// Check if profile exists
if (window.next.hasProfile('black_friday')) {
  // Profile is configured
}

// Get profile information
const profileInfo = window.next.getProfileInfo('black_friday');
console.log(profileInfo.name); // "Black Friday Sale"
```

### Method 3: HTML Data Attributes

#### Profile Switcher Button

```html
<!-- Simple profile switcher -->
<button data-next-profile="black_friday">
  Apply Black Friday Prices
</button>

<!-- With cart clearing -->
<button data-next-profile="vip" data-next-clear-cart="true">
  Switch to VIP Pricing (New Cart)
</button>

<!-- With quantity preservation control -->
<button 
  data-next-profile="3_pack" 
  data-next-preserve-quantities="false">
  Convert to 3-Pack Bundle
</button>

<!-- With visual states -->
<button 
  data-next-profile="sale_20"
  data-next-active-text="Sale Active ✓"
  data-next-inactive-text="Activate 20% Sale">
  Activate 20% Sale
</button>
```

#### Profile Selector Dropdown

```html
<!-- Manual dropdown -->
<select data-next-profile-selector>
  <option value="">Regular Pricing</option>
  <option value="black_friday">Black Friday Sale</option>
  <option value="vip">VIP Member</option>
  <option value="3_pack">3-Pack Bundle</option>
</select>

<!-- Auto-populated dropdown -->
<select 
  data-next-profile-selector 
  data-next-auto-populate="true"
  data-next-clear-cart="false">
</select>
```

#### Profile-Aware Add to Cart

```html
<!-- Add to cart with profile override -->
<button 
  data-next-action="add-to-cart"
  data-next-package-id="1"
  data-next-profile="black_friday">
  Add with Black Friday Price
</button>
```

#### Conditional Display

```html
<!-- Show only when specific profile is active -->
<div data-next-show-if-profile="black_friday">
  🎉 Black Friday prices are active! Save up to 40%!
</div>

<!-- Display profile information -->
<p>Current Pricing: <span data-next-display="profile.name">Regular</span></p>
<p>Profile ID: <span data-next-display="profile.id">none</span></p>
```

## Real-World Examples

### Example 1: Exit Intent Discount

```javascript
// In your exit intent handler
window.next.exitIntent({
  image: '/images/special-offer.jpg',
  action: async () => {
    // Apply exit discount profile
    await window.next.setProfile('exit_10');
    
    // Optionally apply a coupon too
    await window.next.applyCoupon('SAVE10');
    
    // Show success message
    alert('10% discount applied to your cart!');
  }
});
```

### Example 2: Membership Tier System

```javascript
// After user login
async function applyMembershipPricing(user) {
  if (user.membership === 'vip_gold') {
    await window.next.setProfile('vip_gold');
  } else if (user.membership === 'vip_silver') {
    await window.next.setProfile('vip_silver');
  }
  // Regular members use default pricing
}

// Check if user qualifies for special pricing
document.addEventListener('DOMContentLoaded', async () => {
  const user = await fetchUserData();
  if (user && user.membership) {
    applyMembershipPricing(user);
  }
});
```

### Example 3: Time-Based Promotions

```javascript
// Automatic profile activation based on time
function checkAndApplyPromotions() {
  const now = new Date();
  const hour = now.getHours();
  
  // Happy hour: 3-6 PM
  if (hour >= 15 && hour < 18) {
    window.next.setProfile('happy_hour');
  }
  // Flash sale: Midnight to 2 AM
  else if (hour >= 0 && hour < 2) {
    window.next.setProfile('flash_sale');
  }
  // Weekend special
  else if (now.getDay() === 0 || now.getDay() === 6) {
    window.next.setProfile('weekend_special');
  }
}

// Check every hour
setInterval(checkAndApplyPromotions, 3600000);
checkAndApplyPromotions(); // Initial check
```

### Example 4: Quantity-Based Bundle Conversion

```html
<!-- Bundle selector UI -->
<div class="bundle-options">
  <h3>Select Bundle Size:</h3>
  
  <label>
    <input type="radio" name="bundle" value="" checked>
    <span>Single Item</span>
  </label>
  
  <label>
    <input type="radio" name="bundle" value="2_pack">
    <span>2-Pack (Save 15%)</span>
  </label>
  
  <label>
    <input type="radio" name="bundle" value="3_pack">
    <span>3-Pack (Save 25%)</span>
  </label>
</div>

<script>
document.querySelectorAll('input[name="bundle"]').forEach(radio => {
  radio.addEventListener('change', async (e) => {
    const profile = e.target.value;
    
    if (profile) {
      await window.next.setProfile(profile);
    } else {
      await window.next.revertProfile();
    }
  });
});
</script>
```

### Example 5: A/B Testing

```javascript
// A/B test different pricing strategies
function initPricingExperiment() {
  // Get or generate user variant
  let variant = localStorage.getItem('pricing_variant');
  
  if (!variant) {
    // Randomly assign variant
    variant = Math.random() < 0.5 ? 'control' : 'test';
    localStorage.setItem('pricing_variant', variant);
  }
  
  // Apply corresponding profile
  if (variant === 'test') {
    window.next.setProfile('test_pricing');
    
    // Track with analytics
    window.next.trackCustomEvent('experiment_variant', {
      experiment: 'pricing_test',
      variant: 'test'
    });
  }
}

initPricingExperiment();
```

## Advanced Usage

### Profile Events

Listen to profile change events:

```javascript
// Listen for profile changes
window.next.on('profile:applied', (data) => {
  console.log(`Profile changed to: ${data.profileId}`);
  console.log(`Items swapped: ${data.itemsSwapped}`);
  
  // Update UI elements
  updatePricingBadges();
  showProfileNotification(data.profileId);
});

// Listen for profile revert
window.next.on('profile:reverted', (data) => {
  console.log(`Profile reverted, restored ${data.itemsRestored} items`);
});
```

### Custom Profile Registration

Register profiles dynamically at runtime:

```javascript
// Register a new profile programmatically
window.next.registerProfile({
  id: 'custom_sale',
  name: 'Custom Sale',
  description: 'Dynamically created sale',
  packageMappings: {
    1: 501,
    2: 502,
    3: 503
  }
});

// Now you can use it
await window.next.setProfile('custom_sale');
```

### Profile Validation

Check if mappings are valid before applying:

```javascript
async function validateAndApplyProfile(profileId) {
  const profile = window.next.getProfileInfo(profileId);
  
  if (!profile) {
    console.error('Profile not found');
    return false;
  }
  
  // Check if all mapped packages exist in campaign
  const campaign = window.next.getCampaignData();
  const invalidMappings = [];
  
  for (const [original, mapped] of Object.entries(profile.packageMappings)) {
    const packageExists = campaign.packages.some(p => p.ref_id === mapped);
    if (!packageExists) {
      invalidMappings.push({ original, mapped });
    }
  }
  
  if (invalidMappings.length > 0) {
    console.warn('Invalid mappings found:', invalidMappings);
    // Decide whether to proceed
  }
  
  await window.next.setProfile(profileId);
  return true;
}
```

### Combining with Coupons

Apply profiles and coupons together:

```javascript
async function applySpecialOffer(offerCode) {
  switch (offerCode) {
    case 'BLACKFRIDAY':
      await window.next.setProfile('black_friday');
      await window.next.applyCoupon('BF2024');
      break;
      
    case 'VIP_WELCOME':
      await window.next.setProfile('vip');
      await window.next.applyCoupon('WELCOME10');
      break;
      
    case 'BUNDLE_DEAL':
      await window.next.setProfile('3_pack');
      // No coupon needed, profile handles discount
      break;
  }
}
```

## Performance Considerations

### Mapping Efficiency

- **O(1) Lookups**: Profile mappings use hash maps for instant lookups
- **Reverse Mappings**: Automatically generated for bidirectional lookups
- **Caching**: Active profile cached in session storage
- **Lazy Loading**: Profile system only loads when needed

### Best Practices

1. **Predefine Profiles**: Configure all profiles at initialization
2. **Minimize Switches**: Avoid frequent profile changes
3. **Batch Operations**: Apply profiles before adding multiple items
4. **Use Default Profile**: Set a default to avoid null checks

### Memory Management

```javascript
// Profile data structure is optimized
{
  profiles: Map<string, Profile>,        // Efficient storage
  activeProfileId: string | null,        // Single reference
  reverseMapping: Map<number, number>,   // Pre-computed
  originalCartSnapshot: CartItem[]       // Only when needed
}
```

## Troubleshooting

### Common Issues

#### Profile Not Applying

```javascript
// Debug profile application
console.log('Active profile:', window.next.getActiveProfile());
console.log('Available profiles:', window.next.listProfiles());

// Check if profile exists
if (!window.next.hasProfile('my_profile')) {
  console.error('Profile not configured');
}

// Verify mappings
const profile = window.next.getProfileInfo('my_profile');
console.log('Mappings:', profile.packageMappings);
```

#### Cart Items Not Updating

```javascript
// Force cart recalculation after profile change
window.next.on('profile:applied', async () => {
  // Trigger cart UI update
  const cartStore = window.next.stores.cart.getState();
  await cartStore.calculateTotals();
  
  // Emit update event
  window.dispatchEvent(new CustomEvent('cart:updated'));
});
```

#### Package Not Found After Mapping

```javascript
// Validate mapped packages exist
async function checkMappedPackages(profileId) {
  const profile = window.next.getProfileInfo(profileId);
  const campaign = window.next.getCampaignData();
  
  for (const [original, mapped] of Object.entries(profile.packageMappings)) {
    const pkg = campaign.packages.find(p => p.ref_id === mapped);
    if (!pkg) {
      console.error(`Mapped package ${mapped} not found for original ${original}`);
    }
  }
}
```

### Debug Mode

Enable debug mode to see profile operations:

```javascript
// Enable debug mode
window.nextConfig.debug = true;

// Or via URL
?debugger=true&profile=black_friday

// Access debug utilities
window.nextDebug.attribution.debug();
window.nextDebug.getStats();
```

### Testing Profiles

```javascript
// Test profile switching
async function testProfiles() {
  const testCart = [
    { packageId: 1, quantity: 2 },
    { packageId: 2, quantity: 1 }
  ];
  
  // Clear and set up test cart
  await window.next.clearCart();
  for (const item of testCart) {
    await window.next.addItem(item);
  }
  
  console.log('Original cart:', window.next.getCartData());
  
  // Test each profile
  for (const profileId of window.next.listProfiles()) {
    await window.next.setProfile(profileId);
    console.log(`Profile ${profileId}:`, window.next.getCartData());
  }
  
  // Revert to original
  await window.next.revertProfile();
  console.log('Reverted cart:', window.next.getCartData());
}
```

## Migration Guide

### From Hardcoded Package IDs

Before:
```javascript
// Old approach - hardcoded variants
if (isBlackFriday) {
  addToCart(101); // Black Friday variant
} else {
  addToCart(1);   // Regular variant
}
```

After:
```javascript
// New approach - profile-based
if (isBlackFriday) {
  await window.next.setProfile('black_friday');
}
addToCart(1); // Always use base ID, profile handles mapping
```

### From Multiple Product Pages

Before:
```html
<!-- Regular pricing page -->
<button data-next-add-to-cart="1">Add to Cart</button>

<!-- Sale pricing page (duplicate) -->
<button data-next-add-to-cart="101">Add to Cart (Sale)</button>
```

After:
```html
<!-- Single page with profile switching -->
<button data-next-add-to-cart="1">Add to Cart</button>
<button data-next-profile="sale">Switch to Sale Prices</button>
```

## Summary

The Profile System provides a powerful, flexible way to manage package variations without code duplication. By defining simple mappings, you can instantly switch between different pricing strategies, seasonal promotions, and customer tiers while maintaining a clean, maintainable codebase.

Key takeaways:
- **Define once, use everywhere**: Profiles work across all SDK components
- **Zero frontend changes**: Existing package IDs automatically map
- **Performance optimized**: O(1) lookups with intelligent caching
- **Fully integrated**: Works with cart, checkout, analytics, and display systems
- **Developer friendly**: Simple API with comprehensive debugging tools