/**
 * ProfileMapper - Utility class for package ID mapping operations
 */

import { createLogger } from '@/utils/logger';
import { useProfileStore } from '@/stores/profileStore';
import type { Profile } from '@/stores/profileStore';

export class ProfileMapper {
  private static instance: ProfileMapper;
  private logger = createLogger('ProfileMapper');
  
  private constructor() {}
  
  public static getInstance(): ProfileMapper {
    if (!ProfileMapper.instance) {
      ProfileMapper.instance = new ProfileMapper();
    }
    return ProfileMapper.instance;
  }
  
  /**
   * Maps a package ID based on the active profile or a specific profile
   */
  public mapPackageId(packageId: number, profileId?: string): number {
    if (!packageId || packageId <= 0) {
      return packageId;
    }
    
    const profileStore = useProfileStore.getState();
    const profile = profileId 
      ? profileStore.getProfileById(profileId)
      : profileStore.getActiveProfile();
    
    if (!profile || !profile.packageMappings) {
      return packageId; // Return original if no profile or mappings
    }
    
    const mappedId = profile.packageMappings[packageId];
    if (mappedId !== undefined && mappedId > 0) {
      this.logger.debug(`Mapped package ${packageId} -> ${mappedId} (profile: ${profile.id})`);
      return mappedId;
    }
    
    return packageId; // No mapping found, return original
  }
  
  /**
   * Batch map multiple package IDs
   */
  public mapPackageIds(packageIds: number[], profileId?: string): number[] {
    if (!packageIds || packageIds.length === 0) {
      return [];
    }
    
    return packageIds.map(id => this.mapPackageId(id, profileId));
  }
  
  /**
   * Reverse lookup - get original package ID from mapped ID
   */
  public getOriginalPackageId(mappedId: number, profileId?: string): number | null {
    if (!mappedId || mappedId <= 0) {
      return null;
    }
    
    const profileStore = useProfileStore.getState();
    const profile = profileId 
      ? profileStore.getProfileById(profileId)
      : profileStore.getActiveProfile();
    
    if (!profile) {
      return null;
    }
    
    // Use reverse mapping if available for O(1) lookup
    if (profile.reverseMapping && profile.reverseMapping[mappedId] !== undefined) {
      const originalId = profile.reverseMapping[mappedId];
      this.logger.debug(`Reverse mapped ${mappedId} -> ${originalId} (profile: ${profile.id})`);
      return originalId;
    }
    
    // Fallback to linear search
    for (const [original, mapped] of Object.entries(profile.packageMappings)) {
      if (mapped === mappedId) {
        const originalId = parseInt(original, 10);
        this.logger.debug(`Reverse mapped ${mappedId} -> ${originalId} (profile: ${profile.id}, linear search)`);
        return originalId;
      }
    }
    
    return null;
  }
  
  /**
   * Check if a package ID can be mapped in the current or specified profile
   */
  public canMapPackage(packageId: number, profileId?: string): boolean {
    if (!packageId || packageId <= 0) {
      return false;
    }
    
    const profileStore = useProfileStore.getState();
    const profile = profileId 
      ? profileStore.getProfileById(profileId)
      : profileStore.getActiveProfile();
    
    if (!profile || !profile.packageMappings) {
      return false;
    }
    
    return packageId in profile.packageMappings;
  }
  
  /**
   * Get all available mappings for a profile
   */
  public getProfileMappings(profileId?: string): Record<number, number> | null {
    const profileStore = useProfileStore.getState();
    const profile = profileId 
      ? profileStore.getProfileById(profileId)
      : profileStore.getActiveProfile();
    
    return profile?.packageMappings || null;
  }
  
  /**
   * Check if any profile is currently active
   */
  public hasActiveProfile(): boolean {
    const profileStore = useProfileStore.getState();
    return profileStore.activeProfileId !== null;
  }
  
  /**
   * Get the currently active profile ID
   */
  public getActiveProfileId(): string | null {
    const profileStore = useProfileStore.getState();
    return profileStore.activeProfileId;
  }
  
  /**
   * Map a cart item's package ID if a profile is active
   */
  public mapCartItem<T extends { packageId: number }>(item: T, profileId?: string): T {
    const mappedPackageId = this.mapPackageId(item.packageId, profileId);
    
    if (mappedPackageId !== item.packageId) {
      return {
        ...item,
        packageId: mappedPackageId,
        originalPackageId: item.packageId, // Preserve original for reference
      };
    }
    
    return item;
  }
  
  /**
   * Map multiple cart items
   */
  public mapCartItems<T extends { packageId: number }>(items: T[], profileId?: string): T[] {
    return items.map(item => this.mapCartItem(item, profileId));
  }
  
  /**
   * Get mapping statistics for debugging
   */
  public getMappingStats(profileId?: string): {
    profileId: string | null;
    totalMappings: number;
    activeMappings: number;
    hasReverseMapping: boolean;
  } | null {
    const profileStore = useProfileStore.getState();
    const profile = profileId 
      ? profileStore.getProfileById(profileId)
      : profileStore.getActiveProfile();
    
    if (!profile) {
      return null;
    }
    
    return {
      profileId: profile.id,
      totalMappings: Object.keys(profile.packageMappings).length,
      activeMappings: Object.keys(profile.packageMappings).filter(key => 
        profile.packageMappings[parseInt(key, 10)] !== undefined
      ).length,
      hasReverseMapping: !!profile.reverseMapping,
    };
  }
}