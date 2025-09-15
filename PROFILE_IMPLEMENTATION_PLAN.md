# Profile-Based Package Mapping Implementation Plan

## Executive Summary

This document outlines the implementation plan for a **Profile-Based Package Mapping System** that enables dynamic swapping of package IDs across the entire SDK. The system will allow merchants to define multiple pricing profiles (e.g., regular, discounted, VIP) and seamlessly switch between them, automatically mapping all packages in use.

## System Architecture Overview

### Core Components

1. **ProfileStore** - New Zustand store for profile management
2. **ProfileMapper** - Utility class for package ID mapping logic
3. **ProfileManager** - Central manager for profile operations
4. **Enhanced Stores** - Modified cart/campaign stores with profile awareness
5. **Profile-Aware Enhancers** - Updated enhancers to respect active profiles

## Implementation Plan

### Phase 1: Core Infrastructure (Priority 1)

#### 1.1 Create ProfileStore (`src/stores/profileStore.ts`)

```typescript
interface ProfileMapping {
  [originalId: number]: number; // originalPackageId -> mappedPackageId
}

interface Profile {
  id: string;
  name: string;
  description?: string;
  packageMappings: ProfileMapping;
  reverseMapping?: ProfileMapping; // For efficient reverse lookups
  isActive?: boolean;
  priority?: number;
}

interface ProfileState {
  profiles: Map<string, Profile>;
  activeProfileId: string | null;
  previousProfileId: string | null;
  mappingHistory: MappingEvent[];
  originalCartSnapshot?: CartItem[]; // Snapshot before profile was applied
}

interface ProfileActions {
  // Profile Management
  registerProfile(profile: Profile): void;
  activateProfile(profileId: string, options?: { clearCart?: boolean }): Promise<void>;
  deactivateProfile(): Promise<void>;
  
  // Mapping Operations
  getMappedPackageId(originalId: number): number;
  getOriginalPackageId(mappedId: number): number | null;
  mapPackageIds(packageIds: number[]): number[];
  
  // Utility Methods
  getActiveProfile(): Profile | null;
  hasProfile(profileId: string): boolean;
  getProfileById(profileId: string): Profile | null;
  getAllProfiles(): Profile[];
  
  // Persistence
  saveToStorage(): void;
  loadFromStorage(): void;
}
```

#### 1.2 Create ProfileMapper Utility (`src/utils/profiles/ProfileMapper.ts`)

```typescript
export class ProfileMapper {
  private static instance: ProfileMapper;
  private logger = createLogger('ProfileMapper');
  
  /**
   * Maps a package ID based on the active profile
   */
  public mapPackageId(packageId: number, profileId?: string): number {
    const profileStore = useProfileStore.getState();
    const profile = profileId 
      ? profileStore.getProfileById(profileId)
      : profileStore.getActiveProfile();
    
    if (!profile || !profile.packageMappings[packageId]) {
      return packageId; // Return original if no mapping
    }
    
    const mappedId = profile.packageMappings[packageId];
    this.logger.debug(`Mapped package ${packageId} to ${mappedId} using profile ${profile.id}`);
    return mappedId;
  }
  
  /**
   * Batch map multiple package IDs
   */
  public mapPackageIds(packageIds: number[], profileId?: string): number[] {
    return packageIds.map(id => this.mapPackageId(id, profileId));
  }
  
  /**
   * Reverse lookup - get original package ID from mapped ID
   */
  public getOriginalPackageId(mappedId: number, profileId?: string): number | null {
    const profileStore = useProfileStore.getState();
    const profile = profileId 
      ? profileStore.getProfileById(profileId)
      : profileStore.getActiveProfile();
    
    if (!profile) return null;
    
    // Use reverse mapping if available for O(1) lookup
    if (profile.reverseMapping?.[mappedId]) {
      return profile.reverseMapping[mappedId];
    }
    
    // Fallback to linear search
    for (const [originalId, mapped] of Object.entries(profile.packageMappings)) {
      if (mapped === mappedId) {
        return parseInt(originalId, 10);
      }
    }
    
    return null;
  }
  
  /**
   * Check if a package ID can be mapped in the current profile
   */
  public canMapPackage(packageId: number, profileId?: string): boolean {
    const profileStore = useProfileStore.getState();
    const profile = profileId 
      ? profileStore.getProfileById(profileId)
      : profileStore.getActiveProfile();
    
    return profile ? packageId in profile.packageMappings : false;
  }
}
```

#### 1.3 Create ProfileManager (`src/core/ProfileManager.ts`)

```typescript
export class ProfileManager {
  private static instance: ProfileManager;
  private logger = createLogger('ProfileManager');
  private eventBus = EventBus.getInstance();
  
  /**
   * Apply a profile to the current cart
   */
  public async applyProfile(profileId: string, options: ApplyProfileOptions = {}): Promise<void> {
    const { clearCart = false, preserveQuantities = true } = options;
    
    this.logger.info(`Applying profile: ${profileId}`, options);
    
    const profileStore = useProfileStore.getState();
    const cartStore = useCartStore.getState();
    const profile = profileStore.getProfileById(profileId);
    
    if (!profile) {
      throw new Error(`Profile ${profileId} not found`);
    }
    
    // Store current cart state
    const currentItems = [...cartStore.items];
    profileStore.setOriginalCartSnapshot(currentItems);
    
    // Clear cart if requested
    if (clearCart) {
      await cartStore.clear();
      profileStore.activateProfile(profileId);
      this.emitProfileEvent('profile:activated', { profileId, cleared: true });
      return;
    }
    
    // Map existing cart items
    const mappedItems = await this.mapCartItems(currentItems, profile, preserveQuantities);
    
    // Apply mapped items to cart
    await this.applyMappedItems(mappedItems, currentItems);
    
    // Activate profile in store
    profileStore.activateProfile(profileId);
    
    // Emit events
    this.emitProfileEvent('profile:applied', {
      profileId,
      previousProfileId: profileStore.previousProfileId,
      itemsSwapped: mappedItems.length,
      profile
    });
  }
  
  /**
   * Map cart items to new package IDs based on profile
   */
  private async mapCartItems(
    items: CartItem[], 
    profile: Profile, 
    preserveQuantities: boolean
  ): Promise<MappedCartItem[]> {
    const campaignStore = useCampaignStore.getState();
    const mappedItems: MappedCartItem[] = [];
    
    for (const item of items) {
      const mappedId = profile.packageMappings[item.packageId];
      
      if (!mappedId) {
        this.logger.warn(`No mapping found for package ${item.packageId} in profile ${profile.id}`);
        continue;
      }
      
      // Verify mapped package exists
      const mappedPackage = campaignStore.getPackage(mappedId);
      if (!mappedPackage) {
        this.logger.error(`Mapped package ${mappedId} not found in campaign data`);
        continue;
      }
      
      mappedItems.push({
        originalItem: item,
        mappedPackageId: mappedId,
        quantity: preserveQuantities ? item.quantity : 1,
        mappedPackage
      });
    }
    
    return mappedItems;
  }
  
  /**
   * Apply mapped items to cart (swap operation)
   */
  private async applyMappedItems(
    mappedItems: MappedCartItem[], 
    originalItems: CartItem[]
  ): Promise<void> {
    const cartStore = useCartStore.getState();
    
    // Clear current cart
    await cartStore.clear();
    
    // Add mapped items
    for (const mapped of mappedItems) {
      await cartStore.addItem({
        packageId: mapped.mappedPackageId,
        quantity: mapped.quantity,
        isUpsell: false,
        originalPackageId: mapped.originalItem.packageId // Track original
      });
    }
    
    this.logger.info(`Swapped ${mappedItems.length} items to new profile packages`);
  }
  
  /**
   * Revert to original packages (before profile was applied)
   */
  public async revertProfile(): Promise<void> {
    const profileStore = useProfileStore.getState();
    const cartStore = useCartStore.getState();
    const originalCart = profileStore.originalCartSnapshot;
    
    if (!originalCart) {
      this.logger.warn('No original cart snapshot to revert to');
      return;
    }
    
    // Clear current cart
    await cartStore.clear();
    
    // Restore original items
    for (const item of originalCart) {
      await cartStore.addItem({
        packageId: item.packageId,
        quantity: item.quantity,
        isUpsell: item.is_upsell || false
      });
    }
    
    // Deactivate profile
    profileStore.deactivateProfile();
    
    this.emitProfileEvent('profile:reverted', {
      itemsRestored: originalCart.length
    });
  }
}
```

### Phase 2: Integration with Existing Systems

#### 2.1 Enhance ConfigStore (`src/stores/configStore.ts`)

Add profile configuration support:

```typescript
interface ConfigState {
  // ... existing fields ...
  
  // Profile configuration
  profiles?: {
    [profileId: string]: {
      name: string;
      description?: string;
      packageMappings: Record<number, number>;
    };
  };
  defaultProfile?: string;
  activeProfile?: string;
}

// In loadFromWindow method, add:
if (window.nextConfig?.profiles) {
  updates.profiles = window.nextConfig.profiles;
  
  // Register profiles with ProfileStore
  const profileStore = useProfileStore.getState();
  Object.entries(window.nextConfig.profiles).forEach(([id, config]) => {
    profileStore.registerProfile({
      id,
      name: config.name,
      description: config.description,
      packageMappings: config.packageMappings
    });
  });
}
```

#### 2.2 Enhance SDKInitializer (`src/enhancers/core/SDKInitializer.ts`)

Add profile initialization:

```typescript
// Add new method
private static async processProfileParameter(): Promise<void> {
  const urlParams = new URLSearchParams(window.location.search);
  const profileParam = urlParams.get('profile') || 
                      urlParams.get('forceProfile') ||
                      urlParams.get('packageProfile');
  
  if (profileParam) {
    this.logger.info('Profile parameter detected:', profileParam);
    
    try {
      const profileManager = ProfileManager.getInstance();
      const clearCart = urlParams.get('forceProfile') !== null;
      
      await profileManager.applyProfile(profileParam, { clearCart });
      this.logger.info(`Profile "${profileParam}" applied successfully`);
    } catch (error) {
      this.logger.error('Failed to apply profile:', error);
    }
  }
  
  // Check for default profile in config
  const configStore = useConfigStore.getState();
  if (configStore.defaultProfile && !profileParam) {
    const profileManager = ProfileManager.getInstance();
    await profileManager.applyProfile(configStore.defaultProfile);
  }
}

// Call in initialize() after campaign data loads:
await this.processProfileParameter();
```

#### 2.3 Enhance CartStore (`src/stores/cartStore.ts`)

Add profile-aware methods:

```typescript
interface CartState {
  // ... existing fields ...
  activeProfileId?: string;
  originalPackageMapping?: Map<number, number>; // Track mappings
}

// Modify addItem to be profile-aware:
addItem: async (item: Partial<CartItem> & { isUpsell: boolean | undefined }) => {
  // Apply profile mapping if active
  const profileStore = useProfileStore.getState();
  const mappedPackageId = profileStore.getMappedPackageId(item.packageId ?? 0);
  
  // Use mapped package ID
  const finalPackageId = mappedPackageId || item.packageId;
  
  // ... rest of existing addItem logic with finalPackageId
}
```

### Phase 3: Enhancer Updates

#### 3.1 Update AddToCartEnhancer (`src/enhancers/cart/AddToCartEnhancer.ts`)

```typescript
private async handleAddToCart(): Promise<void> {
  let packageId = this.getPackageId();
  
  // Check for profile override attribute
  const profileOverride = this.getAttribute('data-next-profile');
  if (profileOverride) {
    const profileManager = ProfileManager.getInstance();
    await profileManager.applyProfile(profileOverride);
  }
  
  // Apply active profile mapping
  const profileStore = useProfileStore.getState();
  packageId = profileStore.getMappedPackageId(packageId);
  
  // Add mapped package to cart
  await this.addToCart(packageId);
}
```

#### 3.2 Update PackageSelectorEnhancer (`src/enhancers/cart/PackageSelectorEnhancer.ts`)

```typescript
private registerCard(cardElement: HTMLElement): void {
  const packageIdAttr = cardElement.getAttribute('data-next-package-id');
  let packageId = parseInt(packageIdAttr, 10);
  
  // Apply profile mapping to selector cards
  const profileStore = useProfileStore.getState();
  const mappedPackageId = profileStore.getMappedPackageId(packageId);
  
  // Check if we should use mapped or original
  const useProfileMapping = cardElement.getAttribute('data-next-use-profile') !== 'false';
  if (useProfileMapping && mappedPackageId !== packageId) {
    this.logger.debug(`Selector card package ${packageId} mapped to ${mappedPackageId}`);
    packageId = mappedPackageId;
  }
  
  // ... rest of existing logic
}
```

#### 3.3 Update UpsellEnhancer (`src/enhancers/order/UpsellEnhancer.ts`)

```typescript
private async handleUpsellAction(action: string): Promise<void> {
  // Check for profile attribute
  const profileId = this.element.getAttribute('data-next-profile');
  if (profileId) {
    const profileManager = ProfileManager.getInstance();
    await profileManager.applyProfile(profileId, { clearCart: false });
  }
  
  // Get package ID and apply mapping
  let packageId = this.getPackageId();
  const profileStore = useProfileStore.getState();
  packageId = profileStore.getMappedPackageId(packageId);
  
  // ... rest of upsell logic
}
```

### Phase 4: Public API Extensions

#### 4.1 Extend NextCommerce API (`src/core/NextCommerce.ts`)

```typescript
export class NextCommerce {
  // ... existing methods ...
  
  // Profile methods
  public async setProfile(profileId: string, options?: { clearCart?: boolean }): Promise<void> {
    const profileManager = ProfileManager.getInstance();
    await profileManager.applyProfile(profileId, options);
  }
  
  public async revertProfile(): Promise<void> {
    const profileManager = ProfileManager.getInstance();
    await profileManager.revertProfile();
  }
  
  public getActiveProfile(): string | null {
    const profileStore = useProfileStore.getState();
    return profileStore.activeProfileId;
  }
  
  public getProfileInfo(profileId?: string): Profile | null {
    const profileStore = useProfileStore.getState();
    return profileId 
      ? profileStore.getProfileById(profileId)
      : profileStore.getActiveProfile();
  }
  
  public getMappedPackageId(originalId: number): number {
    const profileStore = useProfileStore.getState();
    return profileStore.getMappedPackageId(originalId);
  }
  
  public getOriginalPackageId(mappedId: number): number | null {
    const profileStore = useProfileStore.getState();
    return profileStore.getOriginalPackageId(mappedId);
  }
  
  public listProfiles(): string[] {
    const profileStore = useProfileStore.getState();
    return Array.from(profileStore.profiles.keys());
  }
  
  public hasProfile(profileId: string): boolean {
    const profileStore = useProfileStore.getState();
    return profileStore.hasProfile(profileId);
  }
}
```

### Phase 5: Data Attributes Support

#### 5.1 Create ProfileSwitcherEnhancer (`src/enhancers/profile/ProfileSwitcherEnhancer.ts`)

```typescript
export class ProfileSwitcherEnhancer extends BaseEnhancer {
  private profileId?: string;
  private clearCart: boolean = false;
  
  public async initialize(): Promise<void> {
    this.profileId = this.getAttribute('data-next-profile');
    this.clearCart = this.getAttribute('data-next-clear-cart') === 'true';
    
    if (!this.profileId) {
      this.logger.error('Profile ID is required for profile switcher');
      return;
    }
    
    // Handle click events
    this.element.addEventListener('click', this.handleClick.bind(this));
    
    // Update active state
    this.updateActiveState();
    
    // Listen for profile changes
    this.eventBus.on('profile:applied', this.updateActiveState.bind(this));
  }
  
  private async handleClick(event: Event): Promise<void> {
    event.preventDefault();
    
    const profileManager = ProfileManager.getInstance();
    await profileManager.applyProfile(this.profileId!, { 
      clearCart: this.clearCart 
    });
  }
  
  private updateActiveState(): void {
    const profileStore = useProfileStore.getState();
    const isActive = profileStore.activeProfileId === this.profileId;
    
    this.element.classList.toggle('next-profile-active', isActive);
    this.element.setAttribute('aria-pressed', String(isActive));
  }
}
```

#### 5.2 New Data Attributes

```html
<!-- Profile Switcher -->
<button data-next-profile="black_friday">
  Switch to Black Friday Deals
</button>

<!-- Profile Switcher with Cart Clear -->
<button data-next-profile="vip_member" data-next-clear-cart="true">
  Apply VIP Pricing (Clear Cart)
</button>

<!-- Add to Cart with Profile -->
<button data-next-add-to-cart="1" data-next-profile="discount_10">
  Add with 10% Discount
</button>

<!-- Conditional Display Based on Profile -->
<div data-next-show-if-profile="black_friday">
  🎉 Black Friday prices are active!
</div>

<!-- Profile Display -->
<span data-next-display="profile.name">Regular Pricing</span>
<span data-next-display="profile.id">default</span>

<!-- Profile-Aware Selector -->
<div data-next-package-selector data-next-use-profile="true">
  <!-- Selector cards will use mapped package IDs -->
</div>

<!-- Profile Dropdown -->
<select data-next-profile-selector>
  <option value="">Regular Pricing</option>
  <option value="black_friday">Black Friday</option>
  <option value="vip_member">VIP Member</option>
</select>
```

## Configuration Examples

### Example 1: Grounded Sheets Profile Configuration

Based on your `grounded-packages.ts` file:

```javascript
window.nextConfig = {
  apiKey: 'your-api-key',
  
  profiles: {
    // Regular pricing (default)
    "regular": {
      name: "Regular Pricing",
      // No mappings needed - uses original IDs (1-24)
    },
    
    // Exit 10% discount profile
    "exit_10": {
      name: "Exit 10% Discount",
      packageMappings: {
        // Single quantity mappings
        1: 78,   // Twin Obsidian Grey -> Exit 10% variant
        2: 79,   // Twin Chateau Ivory -> Exit 10% variant
        3: 82,   // Double Obsidian Grey -> Exit 10% variant
        4: 83,   // Double Chateau Ivory -> Exit 10% variant
        5: 86,   // Queen Obsidian Grey -> Exit 10% variant
        6: 90,   // King Obsidian Grey -> Exit 10% variant
        7: 87,   // Queen Chateau Ivory -> Exit 10% variant
        8: 91,   // King Chateau Ivory -> Exit 10% variant
        9: 80,   // Twin Scribe Blue -> Exit 10% variant
        10: 84,  // Double Scribe Blue -> Exit 10% variant
        11: 88,  // Queen Scribe Blue -> Exit 10% variant
        12: 92,  // King Scribe Blue -> Exit 10% variant
        13: 81,  // Twin Verdant Sage -> Exit 10% variant
        14: 85,  // Double Verdant Sage -> Exit 10% variant
        15: 89,  // Queen Verdant Sage -> Exit 10% variant
        16: 93,  // King Verdant Sage -> Exit 10% variant
        17: 74,  // Single Obsidian Grey -> Exit 10% variant
        18: 94,  // Cali King Obsidian Grey -> Exit 10% variant
        19: 75,  // Single Chateau Ivory -> Exit 10% variant
        20: 95,  // Cali King Chateau Ivory -> Exit 10% variant
        21: 76,  // Single Scribe Blue -> Exit 10% variant
        22: 96,  // Cali King Scribe Blue -> Exit 10% variant
        23: 77,  // Single Verdant Sage -> Exit 10% variant
        24: 97   // Cali King Verdant Sage -> Exit 10% variant
      }
    },
    
    // 2-pack profile
    "2_pack": {
      name: "2-Pack Bundle",
      packageMappings: {
        // Map single quantities to 2-pack variants
        1: 29,   // Twin Obsidian Grey -> 2-pack
        2: 30,   // Twin Chateau Ivory -> 2-pack
        3: 33,   // Double Obsidian Grey -> 2-pack
        4: 34,   // Double Chateau Ivory -> 2-pack
        5: 37,   // Queen Obsidian Grey -> 2-pack
        6: 41,   // King Obsidian Grey -> 2-pack
        7: 38,   // Queen Chateau Ivory -> 2-pack
        8: 42,   // King Chateau Ivory -> 2-pack
        // ... continue for all mappings
      }
    },
    
    // 3-pack profile
    "3_pack": {
      name: "3-Pack Bundle",
      packageMappings: {
        // Map single quantities to 3-pack variants
        1: 53,   // Twin Obsidian Grey -> 3-pack
        2: 54,   // Twin Chateau Ivory -> 3-pack
        3: 58,   // Double Obsidian Grey -> 3-pack
        4: 59,   // Double Chateau Ivory -> 3-pack
        5: 62,   // Queen Obsidian Grey -> 3-pack
        6: 66,   // King Obsidian Grey -> 3-pack
        // ... continue for all mappings
      }
    },
    
    // Exit 10% on 2-packs
    "exit_10_2pack": {
      name: "Exit 10% - 2 Pack Bundle",
      packageMappings: {
        // Map single to exit 10% 2-pack variants
        1: 102,  // Twin Obsidian Grey -> Exit 10% 2-pack
        2: 103,  // Twin Chateau Ivory -> Exit 10% 2-pack
        // ... continue for all mappings
      }
    }
  },
  
  // Set default profile (optional)
  defaultProfile: "regular"
};
```

### Example 2: Usage Scenarios

```javascript
// 1. Apply exit discount when user tries to leave
window.next.exitIntent({
  image: '/images/exit-offer.jpg',
  action: async () => {
    // Apply exit discount profile
    await window.next.setProfile('exit_10');
    
    // Optionally apply a coupon too
    await window.next.applyCoupon('SAVE10');
  }
});

// 2. Switch to bundle pricing
document.querySelector('#bundle-switcher').addEventListener('change', async (e) => {
  const profile = e.target.value; // '2_pack', '3_pack', etc.
  if (profile) {
    await window.next.setProfile(profile);
  } else {
    await window.next.revertProfile();
  }
});

// 3. URL-based profile activation
// ?profile=exit_10 - Apply exit discount profile
// ?forceProfile=3_pack - Clear cart and apply 3-pack profile

// 4. Check active profile
const activeProfile = window.next.getActiveProfile();
if (activeProfile === 'exit_10') {
  console.log('Exit discount is active!');
}

// 5. Get mapped package ID
const originalPackageId = 1; // Twin Obsidian Grey
const mappedId = window.next.getMappedPackageId(originalPackageId);
// Returns 78 if exit_10 profile is active
```

## Testing Strategy

### Unit Tests
- ProfileStore state management
- ProfileMapper mapping logic
- ProfileManager apply/revert operations
- Integration with existing stores

### Integration Tests
- URL parameter processing
- Cart item swapping
- Enhancer profile awareness
- Event emission and handling

### E2E Tests
- Profile switching user flows
- Cart preservation during profile changes
- Checkout with profile-mapped packages
- Profile persistence across sessions

## Migration Path

### Phase 1: Deploy Core (Week 1)
1. Deploy ProfileStore and ProfileMapper
2. Update ConfigStore to accept profile configurations
3. Test with manual API calls

### Phase 2: Integrate (Week 2)
1. Update SDKInitializer for URL parameters
2. Enhance CartStore with profile awareness
3. Update critical enhancers (AddToCart, PackageSelector)

### Phase 3: Expand (Week 3)
1. Add public API methods
2. Create ProfileSwitcherEnhancer
3. Update remaining enhancers
4. Add data attribute support

### Phase 4: Polish (Week 4)
1. Add analytics tracking
2. Implement profile persistence
3. Create debug utilities
4. Complete documentation

## Performance Considerations

1. **Mapping Caching**: Profile mappings are cached in memory
2. **Reverse Mapping**: Pre-compute reverse mappings for O(1) lookups
3. **Lazy Loading**: ProfileManager loaded only when profiles are used
4. **Event Debouncing**: Profile change events are debounced
5. **Storage Optimization**: Only active profile ID stored, not full mappings

## Security Considerations

1. **Profile Validation**: Verify mapped package IDs exist in campaign
2. **Rate Limiting**: Limit profile switches per session
3. **Input Sanitization**: Validate profile IDs from URL parameters
4. **Authorization**: Consider server-side validation for VIP profiles

## Monitoring & Analytics

Track these events:
- `profile:applied` - Profile activated
- `profile:reverted` - Profile deactivated
- `profile:mapping_failed` - Package mapping failed
- `profile:switch_attempted` - User tried to switch profiles

## Conclusion

This Profile-Based Package Mapping System provides a flexible, scalable solution for dynamic package swapping. It integrates seamlessly with the existing SDK architecture while maintaining backwards compatibility and providing clear migration paths for merchants.

The system is designed to handle real-world e-commerce scenarios like seasonal sales, membership tiers, and quantity-based bundles, making it immediately valuable for merchants looking to implement dynamic pricing strategies.