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
}

export class ProfileManager {
  private static instance: ProfileManager;
  private logger = createLogger('ProfileManager');
  private eventBus = EventBus.getInstance();
  
  private constructor() {}
  
  public static getInstance(): ProfileManager {
    if (!ProfileManager.instance) {
      ProfileManager.instance = new ProfileManager();
    }
    return ProfileManager.instance;
  }
  
  /**
   * Apply a profile to the current cart
   */
  public async applyProfile(profileId: string, options: ApplyProfileOptions = {}): Promise<void> {
    const { clearCart = false, preserveQuantities = true, skipValidation = false } = options;
    
    this.logger.info(`Applying profile: ${profileId}`, options);
    
    const profileStore = useProfileStore.getState();
    const cartStore = useCartStore.getState();
    
    // Special handling for "default" profile - just clear profile without mappings
    if (profileId === 'default') {
      const previousProfileId = profileStore.activeProfileId;
      
      // If already on default, nothing to do
      if (!previousProfileId || previousProfileId === 'default') {
        this.logger.info('Already on default profile');
        return;
      }
      
      // Revert to original cart if we have a snapshot
      await this.revertProfile();
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
    
    // Store original cart for potential revert
    if (currentItems.length > 0) {
      profileStore.setOriginalCartSnapshot(currentItems);
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
        this.logger.debug(`No mapping found for package ${item.packageId} in profile ${profile.id}`);
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
    
    // Clear current cart
    await cartStore.clear();
    
    // Add mapped items
    for (const mapped of mappedItems) {
      try {
        await cartStore.addItem({
          packageId: mapped.mappedPackageId,
          quantity: mapped.quantity,
          isUpsell: false,
          // Store original package ID for reference
          originalPackageId: mapped.originalItem.packageId,
        } as any);
        
        this.logger.debug(`Added mapped package ${mapped.mappedPackageId} (was ${mapped.originalItem.packageId})`);
      } catch (error) {
        this.logger.error(`Failed to add mapped package ${mapped.mappedPackageId}:`, error);
      }
    }
    
    this.logger.info(`Applied ${mappedItems.length} mapped items to cart`);
  }
  
  /**
   * Revert to original packages (before profile was applied)
   */
  public async revertProfile(): Promise<void> {
    const profileStore = useProfileStore.getState();
    const cartStore = useCartStore.getState();
    const previousProfileId = profileStore.activeProfileId;
    const originalCart = profileStore.originalCartSnapshot;
    
    if (!originalCart || originalCart.length === 0) {
      this.logger.warn('No original cart snapshot to revert to');
      
      // Just deactivate the profile
      profileStore.deactivateProfile();
      
      this.eventBus.emit('profile:reverted', {
        previousProfileId,
        itemsRestored: 0,
      });
      
      return;
    }
    
    this.logger.info('Reverting to original cart state');
    
    // Clear current cart
    await cartStore.clear();
    
    // Restore original items
    let restoredCount = 0;
    for (const item of originalCart) {
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
    
    // Clear snapshot and deactivate profile
    profileStore.clearOriginalCartSnapshot();
    profileStore.deactivateProfile();
    
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