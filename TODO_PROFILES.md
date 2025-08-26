# Profile-Based Package Mapping System Proposal

## Executive Summary

The core need is to implement a **Package Mapping System** that allows swapping between different sets of package IDs dynamically. For example, having 10 regular-priced packages that can be swapped to 10 discounted package variants when a specific profile is activated. This is essentially a mapping system where `profile A` maps `package 1 → package 101`, `package 2 → package 102`, etc.

## Current System Analysis

### Existing Architecture
1. **Cart Store** (`cartStore.ts`): Manages cart state with items, totals, and enriched data
2. **Campaign Store** (`campaignStore.ts`): Loads and caches campaign/package data from API
3. **Config Store** (`configStore.ts`): Handles SDK configuration including discounts
4. **SDKInitializer**: Processes `forcePackageId` URL parameter on load
5. **NextCommerce API**: Provides programmatic cart manipulation methods

### Current `forcePackageId` Implementation
- Accepts format: `?forcePackageId=1:2,3:1` (packageId:quantity)
- Clears existing cart and adds specified packages
- Processed once during SDK initialization
- Limited to URL parameter only

## Proposed Package Mapping System

### Core Concept
The system allows defining **package mapping profiles** where each profile represents a different pricing tier or product variant set. When a profile is activated, ALL packages in the cart are automatically swapped to their mapped equivalents.

### Real-World Use Case
```
Regular Pricing (default profile):
- Package 1: Product A ($50)
- Package 2: Product B ($75)
- Package 3: Product C ($100)
... up to Package 10

Black Friday Profile (bf_2024):
- Package 101: Product A - BF Deal ($30)
- Package 102: Product B - BF Deal ($45)
- Package 103: Product C - BF Deal ($60)
... mapped for all 10 packages

VIP Member Profile (vip_tier):
- Package 201: Product A - VIP Price ($40)
- Package 202: Product B - VIP Price ($60)
- Package 203: Product C - VIP Price ($80)
... mapped for all 10 packages
```

### Configuration Structure

```javascript
window.nextConfig = {
  // ... existing config ...
  
  // Package mapping profiles
  profiles: {
    "default": {
      name: "Regular Pricing",
      // No mappings needed - uses original package IDs
    },
    
    "black_friday": {
      name: "Black Friday Deals",
      packageMappings: {
        // Original ID -> Black Friday variant ID
        1: 101,   // Product A -> Product A BF Deal
        2: 102,   // Product B -> Product B BF Deal
        3: 103,   // Product C -> Product C BF Deal
        4: 104,
        5: 105,
        6: 106,
        7: 107,
        8: 108,
        9: 109,
        10: 110
      }
    },
    
    "vip_member": {
      name: "VIP Member Pricing",
      packageMappings: {
        1: 201,   // Product A -> Product A VIP
        2: 202,   // Product B -> Product B VIP
        3: 203,   // Product C -> Product C VIP
        4: 204,
        5: 205,
        6: 206,
        7: 207,
        8: 208,
        9: 209,
        10: 210
      }
    },
    
    "3_pack_special": {
      name: "3-Pack Bundle Pricing",
      packageMappings: {
        // Map single items to 3-pack variants
        1: 301,   // 1x Product A -> 3x Product A Bundle
        2: 302,   // 1x Product B -> 3x Product B Bundle
        3: 303,   // 1x Product C -> 3x Product C Bundle
        // ... etc
      }
    }
  },
  
  // Simple profile settings
  defaultProfile: "default"
};
```

## Implementation Details

### 1. Package Mapping Logic

The core implementation will handle intelligent package swapping:

```typescript
// src/stores/profileStore.ts
interface PackageMappingProfile {
  name: string;
  packageMappings: Record<number, number>;  // originalId -> mappedId
}

interface ProfileState {
  activeProfile: string;
  originalCart: CartItem[];  // Store original cart before mapping
  mappingHistory: MappingEvent[];
}

interface ProfileActions {
  // Core mapping functions
  applyProfile(profileId: string): Promise<void>;
  swapPackages(mappings: Record<number, number>): Promise<void>;
  revertToOriginal(): Promise<void>;
  
  // Utility functions
  getMappedPackageId(originalId: number): number;
  getOriginalPackageId(mappedId: number): number | null;
  canMapPackage(packageId: number): boolean;
}
```

### 2. Smart Package Swapping Algorithm

```javascript
async function swapToProfile(profileId: string) {
  const profile = config.profiles[profileId];
  const currentCart = cartStore.getState().items;
  
  // Store original cart state
  profileStore.setOriginalCart(currentCart);
  
  // Map each item in cart
  const mappedCart = currentCart.map(item => {
    const mappedId = profile.packageMappings[item.packageId];
    
    if (mappedId) {
      return {
        ...item,
        packageId: mappedId,
        originalPackageId: item.packageId  // Track original
      };
    }
    
    // If no mapping exists, keep original or remove based on config
    return profile.strictMode ? null : item;
  }).filter(Boolean);
  
  // Clear cart and add mapped items
  await cartStore.clear();
  for (const item of mappedCart) {
    await cartStore.addItem(item);
  }
}
```

### 3. URL Parameter Support

```javascript
// Multiple formats supported
?profile=black_friday           // Activate specific profile
?forceProfile=vip_member        // Force profile (clears cart first)
?packageProfile=3_pack_special  // Alternative naming

// Combined with existing
?forcePackageId=1:2&profile=black_friday  
// First adds package 1 with qty 2, then applies BF mapping
```

### 4. JavaScript API

```javascript
// Profile switching
window.next.setProfile('black_friday');     // Apply profile to current cart
window.next.forceProfile('vip_member');     // Clear cart and apply profile
window.next.revertProfile();                // Go back to original packages

// Profile queries
window.next.getActiveProfile();             // Returns: "black_friday"
window.next.getMappedPackage(1);           // Returns: 101 (if BF active)
window.next.getOriginalPackage(101);       // Returns: 1

// Profile utilities
window.next.listProfiles();                // Get all configured profiles
window.next.hasProfile('vip_member');      // Check if profile exists

// Events
window.next.on('profile:applied', (data) => {
  console.log(`Profile ${data.profileId} applied`);
  console.log(`Swapped ${data.swappedCount} packages`);
});
```

### 5. Data Attribute Support

```html
<!-- Profile switcher buttons -->
<button data-next-profile="black_friday">Switch to Black Friday Deals</button>
<button data-next-profile="vip_member">Apply VIP Pricing</button>
<button data-next-profile="default">Regular Pricing</button>

<!-- Conditional display based on active profile -->
<div data-next-show-if-profile="black_friday">
  🎉 Black Friday prices active! Save up to 40%
</div>

<!-- Profile-aware displays -->
<span data-next-display="profile.name">Black Friday Deals</span>

<!-- Package-aware elements that auto-update with mapping -->
<button data-next-add-to-cart="1">
  Add to Cart
  <!-- Automatically uses package 101 if BF profile is active -->
</button>
```

### 6. Integration with Existing Systems

#### Cart Store Integration
```typescript
// Minimal changes to cartStore.ts
interface CartState {
  // ... existing state ...
  profileId?: string;           // Track active profile
  originalPackageIds?: Map<number, number>;  // Track mappings
}
```

#### SDKInitializer Enhancement
```typescript
// Add to SDKInitializer.ts
private static async processProfileParameter(): Promise<void> {
  const urlParams = new URLSearchParams(window.location.search);
  const profileId = urlParams.get('profile') || 
                    urlParams.get('forceProfile') ||
                    urlParams.get('packageProfile');
  
  if (profileId) {
    // Apply profile after campaign data loads
    await this.applyProfile(profileId);
  }
}
```

## Real-World Scenarios

### Scenario 1: Seasonal Promotions
A store has 10 products at regular price. During Black Friday, they want to swap ALL products to discounted variants:

```javascript
// Customer adds Package 1, 2, 3 to cart at regular prices
// Then applies Black Friday profile via URL or button click
// Cart automatically swaps to Package 101, 102, 103 (BF variants)

profiles: {
  "black_friday_2024": {
    packageMappings: {
      1: 101, 2: 102, 3: 103, 4: 104, 5: 105,
      6: 106, 7: 107, 8: 108, 9: 109, 10: 110
    }
  }
}
```

### Scenario 2: Membership Tiers
Different pricing for regular vs VIP members:

```javascript
profiles: {
  "vip_gold": {
    packageMappings: {
      // Regular products -> VIP Gold pricing
      1: 201, 2: 202, 3: 203, // ... etc
    }
  },
  "vip_platinum": {
    packageMappings: {
      // Regular products -> VIP Platinum pricing  
      1: 301, 2: 302, 3: 303, // ... etc
    }
  }
}
```

### Scenario 3: Quantity-Based Bundles
Swap single items to multi-pack variants:

```javascript
// User selects Package 1 (single item)
// Applies "3_pack" profile
// Package 1 swaps to Package 301 (3-pack bundle)

profiles: {
  "3_pack": {
    name: "3-Pack Bundle Deal",
    packageMappings: {
      1: 301,  // Single -> 3-pack
      2: 302,  // Single -> 3-pack
      3: 303,  // Single -> 3-pack
    }
  },
  "6_pack": {
    name: "6-Pack Mega Deal",
    packageMappings: {
      1: 601,  // Single -> 6-pack
      2: 602,  // Single -> 6-pack
      3: 603,  // Single -> 6-pack
    }
  }
}
```

## Enhancer Integration Requirements

### Critical Enhancers to Update

#### 1. UpsellEnhancer (`src/enhancers/order/UpsellEnhancer.ts`)
The upsell system needs profile awareness to handle different pricing tiers:

```javascript
// Add profile switching capability to upsells
class UpsellEnhancer {
  // New method to apply profile before adding upsell
  private async applyProfileForUpsell(profileId?: string): Promise<void> {
    if (profileId) {
      await window.next.setProfile(profileId);
    }
  }
  
  // Enhanced upsell action with profile support
  private async handleActionClick(event: Event): Promise<void> {
    const button = event.currentTarget as HTMLElement;
    const profileId = button.getAttribute('data-next-profile');
    
    // Apply profile before processing upsell
    if (profileId) {
      await this.applyProfileForUpsell(profileId);
    }
    
    // Continue with existing upsell logic...
  }
}

// Usage in HTML
<button data-next-upsell-action="add" data-next-profile="vip_member">
  Add VIP Upsell
</button>
```

#### 2. SimpleExitIntentEnhancer (`src/enhancers/behavior/SimpleExitIntentEnhancer.ts`)
Exit intent popups can trigger profile changes for special offers:

```javascript
// Enhanced setup options
exitIntent.setup({
  template: 'black-friday-popup',
  action: async () => {
    // Apply Black Friday profile when exit intent is triggered
    await window.next.setProfile('black_friday');
    
    // Optionally apply a coupon too
    await window.next.applyCoupon('EXIT10');
  }
});

// Template can include profile switcher
<template data-template="exit-intent">
  <div class="exit-offer">
    <h2>Wait! Get VIP Pricing</h2>
    <button data-exit-intent-action="apply-profile" data-profile="vip_member">
      Activate VIP Prices
    </button>
  </div>
</template>
```

#### 3. PackageSelectorEnhancer (`src/enhancers/cart/PackageSelectorEnhancer.ts`)
Package selectors need to respect active profiles:

```javascript
class PackageSelectorEnhancer {
  // Override package ID based on active profile
  private getMappedPackageId(originalId: number): number {
    const activeProfile = window.next.getActiveProfile();
    if (activeProfile) {
      return window.next.getMappedPackage(originalId) || originalId;
    }
    return originalId;
  }
  
  // Use mapped IDs when adding to cart
  private async handleSelection(packageId: number): Promise<void> {
    const mappedId = this.getMappedPackageId(packageId);
    await cartStore.addItem({ packageId: mappedId });
  }
}
```

#### 4. AddToCartEnhancer (`src/enhancers/cart/AddToCartEnhancer.ts`)
All add-to-cart actions need profile-aware package mapping:

```javascript
class AddToCartEnhancer {
  private async handleAddToCart(): Promise<void> {
    let packageId = this.getPackageId();
    
    // Check for profile override on the button
    const profileOverride = this.element.getAttribute('data-next-profile');
    if (profileOverride) {
      await window.next.setProfile(profileOverride);
    }
    
    // Apply active profile mapping
    packageId = window.next.getMappedPackage(packageId) || packageId;
    
    // Add mapped package to cart
    await this.addToCart(packageId);
  }
}
```

#### 5. CartItemListEnhancer (`src/enhancers/cart/CartItemListEnhancer.ts`)
Cart displays need to show which profile is active:

```javascript
// Display active profile indicator
<div data-next-cart-items>
  <div data-next-display="profile.name" class="active-profile">
    Regular Pricing
  </div>
  <!-- Cart items here -->
</div>
```

### New Data Attributes for Enhancers

```html
<!-- Profile-aware buttons -->
<button data-next-add-to-cart="1" data-next-profile="black_friday">
  Add with Black Friday Price
</button>

<!-- Profile switcher in cart -->
<select data-next-profile-switcher>
  <option value="default">Regular Price</option>
  <option value="black_friday">Black Friday</option>
  <option value="vip_member">VIP Member</option>
</select>

<!-- Conditional display based on profile -->
<div data-next-show-if-profile="vip_member">
  You're getting VIP pricing!
</div>

<!-- Profile-specific upsells -->
<div data-next-upsell="offer" 
     data-next-package-id="101" 
     data-next-profile="3_pack">
  Upgrade to 3-Pack Bundle
</div>
```

### Event System Updates

```javascript
// New events for profile changes
window.next.on('profile:changed', (data) => {
  // Update UI elements
  // data.from: previous profile
  // data.to: new profile
  // data.swappedPackages: array of swapped package IDs
});

// Enhancers emit profile-related events
this.eventBus.emit('cart:profile-applied', {
  profileId: 'black_friday',
  affectedItems: 5
});
```

## Implementation Priority
1. **Core Mapping Engine**
   - Create profileStore with package mapping logic
   - Implement swap algorithm in cartStore
   - Add profile configuration to configStore

2. **URL Parameter Support**
   - Process `?profile=` parameter in SDKInitializer
   - Maintain backwards compatibility with `forcePackageId`

3. **Basic API**
   - `next.setProfile()`
   - `next.getActiveProfile()`
   - `next.getMappedPackage()`

### Phase 2: Enhanced Features (Week 3-4)
1. **Advanced Mapping**
   - Bidirectional mapping support
   - Profile persistence

2. **UI Integration**
   - Data attribute support
   - Profile switcher components
   - Visual indicators for active profile

3. **Persistence**
   - Session storage for profile state
   - Profile history tracking
   - Revert capabilities

### Phase 3: Production Ready (Week 5-6)
1. **Validation & Security**
   - Package availability checks
   - Rate limiting for profile switches

2. **Analytics Integration**
   - Track profile activations
   - Monitor conversion rates per profile
   - A/B testing support

3. **Documentation & Testing**
   - Comprehensive test suite
   - API documentation
   - Migration guide for merchants

## Key Technical Decisions

### 1. Storage Strategy
- **Session Storage**: Active profile and mapping state
- **Memory**: Profile definitions (loaded from config)
- **No Server State**: All profile logic client-side

### 2. Mapping Approach
- **One-to-One**: Each package maps to exactly one other package
- **Preserve Quantities**: Maintain cart quantities during swap
- **Track Origins**: Remember original packages for revert

### 3. Conflict Resolution
- **Profile Priority**: Profile mappings override manual additions
- **No Mixing**: Can't have both original and mapped versions
- **Clear Feedback**: User notifications on profile changes

## Conclusion

This Package Mapping System solves the core problem of swapping between different package sets (e.g., regular vs discounted variants) while maintaining a clean, extensible architecture. The system focuses on practical e-commerce scenarios like seasonal sales, membership tiers, and quantity-based bundles, making it immediately valuable for merchants.