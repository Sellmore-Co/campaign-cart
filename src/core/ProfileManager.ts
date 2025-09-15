/**
 * ProfileManager - Central manager for profile operations
 */

import { createLogger } from '@/utils/logger';
import { EventBus } from '@/utils/events';
import { useProfileStore } from '@/stores/profileStore';
import { useCartStore } from '@/stores/cartStore';
import { useCampaignStore } from '@/stores/campaignStore';
import type { Profile } from '@/stores/profileStore';
import type { CartItem } from '@/types/global';
import type { Package } from '@/types/campaign';

export interface ApplyProfileOptions {
  clearCart?: boolean;
  preserveQuantities?: boolean;
  skipValidation?: boolean;
}

export interface MappedCartItem {
  originalItem: CartItem;
  mappedPackageId: number;
  quantity: number;
  mappedPackage?: Package;
  preserveUnmapped?: boolean;
}

export class ProfileManager {
  private static instance: ProfileManager;
  private logger = createLogger('ProfileManager');
  private eventBus = EventBus.getInstance();
  private profileOperationInProgress = false;
  private initialCartState: CartItem[] | null = null;

  private constructor() {
    // Capture initial cart state on first load
    this.captureInitialState();
  }

  public static getInstance(): ProfileManager {
    if (!ProfileManager.instance) {
      ProfileManager.instance = new ProfileManager();
    }
    return ProfileManager.instance;
  }

  /**
   * Capture the initial cart state before any profiles are applied
   */
  private captureInitialState(): void {
    const cartStore = useCartStore.getState();
    const profileStore = useProfileStore.getState();

    // Only capture if no profile is active (true initial state)
    if (!profileStore.activeProfileId || profileStore.activeProfileId === 'default' || profileStore.activeProfileId === 'regular') {
      this.initialCartState = [...cartStore.items];
      this.logger.debug('Captured initial cart state with items:', this.initialCartState.map(i => i.packageId));
    }
  }
  
  /**
   * Apply a profile to the current cart
   */
  public async applyProfile(profileId: string, options: ApplyProfileOptions = {}): Promise<void> {
    // Prevent concurrent profile operations
    if (this.profileOperationInProgress) {
      this.logger.warn('Profile operation already in progress, skipping');
      return;
    }

    this.profileOperationInProgress = true;

    try {
      const { clearCart = false, preserveQuantities = true, skipValidation = false } = options;

      this.logger.info(`Applying profile: ${profileId}`, options);

      const profileStore = useProfileStore.getState();
      const cartStore = useCartStore.getState();

      // Special handling for "default", "regular", or empty profile - just clear profile without mappings
      if (profileId === 'default' || profileId === 'regular' || !profileId) {
        // Check if already on default to avoid unnecessary operations
        if (!profileStore.activeProfileId || profileStore.activeProfileId === 'default' || profileStore.activeProfileId === 'regular') {
          this.logger.info('Already on default/regular profile, no action needed');
          this.profileOperationInProgress = false;
          return;
        }
        // Revert to original cart
        await this.revertProfile();
        this.profileOperationInProgress = false;
        return;
      }
    
    const profile = profileStore.getProfileById(profileId);
    
    if (!profile) {
      const error = `Profile "${profileId}" not found`;
      this.logger.error(error);
      throw new Error(error);
    }
    
    // Check if profile is already active
    if (profileStore.activeProfileId === profileId) {
      this.logger.info(`Profile "${profileId}" is already active`);
      return;
    }
    
    // Store current cart state before applying profile
    const currentItems = [...cartStore.items];
    
    // Clear cart if requested
    if (clearCart) {
      await cartStore.clear();
      profileStore.activateProfile(profileId);
      profileStore.clearOriginalCartSnapshot();
      
      this.eventBus.emit('profile:applied', {
        profileId,
        previousProfileId: profileStore.previousProfileId,
        cleared: true,
        itemsSwapped: 0,
        profile,
      });
      
      this.logger.info(`Profile "${profileId}" applied with cart cleared`);
      return;
    }
    
    // Store original cart for potential revert (only if we don't already have one)
    if (currentItems.length > 0 && !profileStore.originalCartSnapshot) {
      profileStore.setOriginalCartSnapshot(currentItems);
      this.logger.debug('Saved original cart snapshot before profile application');
    } else if (profileStore.originalCartSnapshot) {
      this.logger.debug('Keeping existing cart snapshot, not overwriting');
    }
    
    // Map existing cart items
    const mappedItems = await this.mapCartItems(currentItems, profile, preserveQuantities, skipValidation);
    
    if (mappedItems.length === 0 && currentItems.length > 0) {
      this.logger.warn('No items could be mapped to the new profile');
    }
    
    // Apply mapped items to cart
    await this.applyMappedItems(mappedItems, currentItems);
    
    // Activate profile in store
    profileStore.activateProfile(profileId);
    
    // Add to mapping history
    const event: any = {
      profileId,
      action: 'applied',
      itemsAffected: mappedItems.length,
    };
    if (profileStore.previousProfileId) {
      event.previousProfileId = profileStore.previousProfileId;
    }
    profileStore.addMappingEvent(event);
    
    // Emit events
    this.eventBus.emit('profile:applied', {
      profileId,
      previousProfileId: profileStore.previousProfileId,
      itemsSwapped: mappedItems.length,
      originalItems: currentItems.length,
      profile,
    });
    
    this.logger.info(`Profile "${profileId}" applied successfully, swapped ${mappedItems.length} items`);
    } finally {
      this.profileOperationInProgress = false;
    }
  }
  
  /**
   * Map cart items to new package IDs based on profile
   */
  private async mapCartItems(
    items: CartItem[],
    profile: Profile,
    preserveQuantities: boolean,
    skipValidation: boolean
  ): Promise<MappedCartItem[]> {
    const campaignStore = useCampaignStore.getState();
    const mappedItems: MappedCartItem[] = [];

    for (const item of items) {
      const mappedId = profile.packageMappings[item.packageId];

      if (mappedId === undefined) {
        // No mapping found - preserve the item as-is (for upsells, warranties, etc.)
        this.logger.debug(`No mapping found for package ${item.packageId} in profile ${profile.id}, preserving as-is`);
        mappedItems.push({
          originalItem: item,
          mappedPackageId: item.packageId, // Keep the same package ID
          quantity: preserveQuantities ? item.quantity : 1,
          preserveUnmapped: true, // Flag to indicate this item should be preserved unchanged
        });
        continue;
      }

      // Validate mapped package exists (unless skipped)
      if (!skipValidation) {
        const mappedPackage = campaignStore.getPackage(mappedId);
        if (!mappedPackage) {
          this.logger.warn(`Mapped package ${mappedId} not found in campaign data, skipping`);
          continue;
        }

        mappedItems.push({
          originalItem: item,
          mappedPackageId: mappedId,
          quantity: preserveQuantities ? item.quantity : 1,
          mappedPackage,
        });
      } else {
        mappedItems.push({
          originalItem: item,
          mappedPackageId: mappedId,
          quantity: preserveQuantities ? item.quantity : 1,
        });
      }
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

    // Prepare items for swapCart
    const swapItems: Array<{
      packageId: number;
      quantity: number;
      isUpsell?: boolean;
      originalPackageId?: number;
    }> = [];

    for (const mapped of mappedItems) {
      const isUnmapped = (mapped as any).preserveUnmapped === true;

      swapItems.push({
        packageId: mapped.mappedPackageId,
        quantity: mapped.quantity,
        isUpsell: mapped.originalItem.is_upsell || false,
        // Only store original package ID if it was actually mapped
        originalPackageId: isUnmapped ? undefined : mapped.originalItem.packageId,
      });

      if (isUnmapped) {
        this.logger.debug(`Will preserve unmapped package ${mapped.mappedPackageId}`);
      } else {
        this.logger.debug(`Will add mapped package ${mapped.mappedPackageId} (was ${mapped.originalItem.packageId})`);
      }
    }

    // Use swapCart to atomically replace all items with swapInProgress flag
    await cartStore.swapCart(swapItems as any);

    this.logger.info(`Applied ${mappedItems.length} items to cart (including preserved items)`);
  }
  
  /**
   * Revert to original packages (before profile was applied)
   */
  public async revertProfile(): Promise<void> {
    const profileStore = useProfileStore.getState();
    const cartStore = useCartStore.getState();
    const previousProfileId = profileStore.activeProfileId;

    // First try to use the initial cart state captured on page load
    let cartToRestore = this.initialCartState;

    // Fallback to profile store snapshot if no initial state
    if (!cartToRestore || cartToRestore.length === 0) {
      cartToRestore = profileStore.originalCartSnapshot || null;
    }

    if (!cartToRestore || cartToRestore.length === 0) {
      this.logger.warn('No cart state to revert to, attempting to reverse profile mappings');

      // If we have an active profile and cart items, try to reverse the mappings
      if (previousProfileId && previousProfileId !== 'default' && previousProfileId !== 'regular') {
        const currentItems = cartStore.items;
        if (currentItems.length > 0) {
          // Attempt to reverse map items using originalPackageId field
          const itemsToRestore = currentItems.map(item => {
            // If item has originalPackageId, use that (it was mapped)
            // Otherwise keep the current packageId (it wasn't mapped)
            const packageId = item.originalPackageId || item.packageId;
            return {
              packageId,
              quantity: item.quantity,
              isUpsell: item.is_upsell || false,
            };
          });

          this.logger.info('Attempting to reverse profile mappings for cart items');

          try {
            await cartStore.swapCart(itemsToRestore);
            profileStore.deactivateProfile();

            this.eventBus.emit('profile:reverted', {
              previousProfileId,
              itemsRestored: itemsToRestore.length,
            });

            this.logger.info(`Reversed profile mappings for ${itemsToRestore.length} items`);
            return;
          } catch (error) {
            this.logger.error('Failed to reverse profile mappings:', error);
          }
        }
      }

      // Just deactivate the profile if we can't reverse mappings
      profileStore.deactivateProfile();

      this.eventBus.emit('profile:reverted', {
        previousProfileId,
        itemsRestored: 0,
      });

      return;
    }

    this.logger.info('Reverting to original cart state');

    // CRITICAL: Deactivate profile FIRST before swapping cart
    // Otherwise swapCart will re-apply the profile mappings!
    profileStore.deactivateProfile();
    profileStore.clearOriginalCartSnapshot();

    // Use swapCart for atomic operation with proper flag management
    // When using initial state, items should already have the correct unmapped package IDs
    const itemsToRestore = cartToRestore.map(item => ({
      // If reverting from snapshot that may contain mapped items, check originalPackageId
      // But if using initial state, items are already unmapped
      packageId: item.originalPackageId || item.packageId,
      quantity: item.quantity,
      isUpsell: item.is_upsell || false,
    }));

    let restoredCount = 0;
    try {
      // Use swapCart which properly manages the swapInProgress flag
      await cartStore.swapCart(itemsToRestore);
      restoredCount = itemsToRestore.length;
    } catch (error) {
      this.logger.error('Failed to restore cart items:', error);
      // Fallback to individual restoration if swapCart fails
      await cartStore.clear();

      for (const item of cartToRestore) {
        try {
          await cartStore.addItem({
            packageId: item.packageId,
            quantity: item.quantity,
            isUpsell: item.is_upsell || false,
          });
          restoredCount++;
        } catch (error) {
          this.logger.error(`Failed to restore item ${item.packageId}:`, error);
        }
      }
    }

    // Add to history
    profileStore.addMappingEvent({
      profileId: previousProfileId || 'unknown',
      action: 'reverted',
      itemsAffected: restoredCount,
    });
    
    this.eventBus.emit('profile:reverted', {
      previousProfileId,
      itemsRestored: restoredCount,
    });
    
    this.logger.info(`Reverted profile, restored ${restoredCount} items`);
  }
  
  /**
   * Switch between profiles (convenience method)
   */
  public async switchProfile(
    fromProfileId: string | null, 
    toProfileId: string,
    options: ApplyProfileOptions = {}
  ): Promise<void> {
    if (fromProfileId) {
      const profileStore = useProfileStore.getState();
      if (profileStore.activeProfileId !== fromProfileId) {
        this.logger.warn(`Expected active profile "${fromProfileId}" but found "${profileStore.activeProfileId}"`);
      }
    }
    
    await this.applyProfile(toProfileId, options);
    
    const profileStore = useProfileStore.getState();
    const switchEvent: any = {
      profileId: toProfileId,
      action: 'switched',
      itemsAffected: useCartStore.getState().items.length,
    };
    if (fromProfileId) {
      switchEvent.previousProfileId = fromProfileId;
    }
    profileStore.addMappingEvent(switchEvent);
  }
  
  /**
   * Check if a profile can be applied
   */
  public canApplyProfile(profileId: string): boolean {
    const profileStore = useProfileStore.getState();
    const profile = profileStore.getProfileById(profileId);
    
    if (!profile) {
      return false;
    }
    
    // Could add more validation here (e.g., check campaign data)
    return true;
  }
  
  /**
   * Get profile application statistics
   */
  public getProfileStats(): {
    activeProfile: string | null;
    previousProfile: string | null;
    totalProfiles: number;
    historyLength: number;
    hasOriginalSnapshot: boolean;
  } {
    const profileStore = useProfileStore.getState();
    
    return {
      activeProfile: profileStore.activeProfileId,
      previousProfile: profileStore.previousProfileId,
      totalProfiles: profileStore.profiles.size,
      historyLength: profileStore.mappingHistory.length,
      hasOriginalSnapshot: !!profileStore.originalCartSnapshot,
    };
  }
  
  /**
   * Clear all profile data and revert to original state
   */
  public async clearAllProfiles(): Promise<void> {
    await this.revertProfile();
    
    const profileStore = useProfileStore.getState();
    profileStore.reset();
    
    this.logger.info('All profile data cleared');
  }
}