/**
 * Profile Store - Zustand store for profile-based package mapping
 */

import { create } from 'zustand';
import { subscribeWithSelector, persist } from 'zustand/middleware';
import { createLogger } from '@/utils/logger';
import { StorageManager } from '@/utils/storage';

// Use localStorage for profile persistence across page refreshes
const profileStorageManager = new StorageManager({ storage: localStorage });
import type { CartItem } from '@/types/global';

const logger = createLogger('ProfileStore');

export interface ProfileMapping {
  [originalId: number]: number; // originalPackageId -> mappedPackageId
}

export interface Profile {
  id: string;
  name: string;
  description?: string;
  packageMappings: ProfileMapping;
  reverseMapping?: ProfileMapping; // For efficient reverse lookups
  isActive?: boolean;
  priority?: number;
}

export interface MappingEvent {
  timestamp: number;
  profileId: string;
  action: 'applied' | 'reverted' | 'switched';
  itemsAffected: number;
  previousProfileId?: string;
}

export interface ProfileState {
  profiles: Map<string, Profile>;
  activeProfileId: string | null;
  previousProfileId: string | null;
  mappingHistory: MappingEvent[];
  originalCartSnapshot?: CartItem[]; // Snapshot before profile was applied
}

export interface ProfileActions {
  // Profile Management
  registerProfile(profile: Profile): void;
  activateProfile(profileId: string): void;
  deactivateProfile(): void;
  
  // Mapping Operations
  getMappedPackageId(originalId: number): number;
  getOriginalPackageId(mappedId: number): number | null;
  mapPackageIds(packageIds: number[]): number[];
  
  // Utility Methods
  getActiveProfile(): Profile | null;
  hasProfile(profileId: string): boolean;
  getProfileById(profileId: string): Profile | null;
  getAllProfiles(): Profile[];
  
  // Cart Snapshot
  setOriginalCartSnapshot(items: CartItem[]): void;
  clearOriginalCartSnapshot(): void;
  
  // History
  addMappingEvent(event: Omit<MappingEvent, 'timestamp'>): void;
  clearHistory(): void;
  
  // Reset
  reset(): void;
}

const initialState: ProfileState = {
  profiles: new Map(),
  activeProfileId: null,
  previousProfileId: null,
  mappingHistory: [],
  originalCartSnapshot: undefined,
};

export const useProfileStore = create<ProfileState & ProfileActions>()(
  persist(
    subscribeWithSelector((set, get) => ({
      ...initialState,

      registerProfile: (profile: Profile) => {
        set(state => {
          const profiles = new Map(state.profiles);
          
          // Generate reverse mapping for O(1) reverse lookups
          const reverseMapping: ProfileMapping = {};
          Object.entries(profile.packageMappings).forEach(([original, mapped]) => {
            reverseMapping[mapped] = parseInt(original, 10);
          });
          
          profiles.set(profile.id, {
            ...profile,
            reverseMapping,
          });
          
          logger.info(`Profile "${profile.id}" registered with ${Object.keys(profile.packageMappings).length} mappings`);
          
          return { profiles };
        });
      },

      activateProfile: (profileId: string) => {
        const state = get();
        
        if (!state.profiles.has(profileId)) {
          logger.error(`Cannot activate profile "${profileId}" - not found`);
          return;
        }
        
        set({
          previousProfileId: state.activeProfileId,
          activeProfileId: profileId,
        });
        
        logger.info(`Profile "${profileId}" activated`);
      },

      deactivateProfile: () => {
        const state = get();
        
        set({
          previousProfileId: state.activeProfileId,
          activeProfileId: null,
        });
        
        logger.info('Profile deactivated');
      },

      getMappedPackageId: (originalId: number): number => {
        const state = get();
        
        if (!state.activeProfileId) {
          return originalId; // No active profile, return original
        }
        
        const profile = state.profiles.get(state.activeProfileId);
        if (!profile) {
          return originalId;
        }
        
        const mappedId = profile.packageMappings[originalId];
        if (mappedId !== undefined) {
          logger.debug(`Mapped package ${originalId} -> ${mappedId} (profile: ${state.activeProfileId})`);
          return mappedId;
        }
        
        return originalId; // No mapping found, return original
      },

      getOriginalPackageId: (mappedId: number): number | null => {
        const state = get();
        
        if (!state.activeProfileId) {
          return null;
        }
        
        const profile = state.profiles.get(state.activeProfileId);
        if (!profile) {
          return null;
        }
        
        // Use reverse mapping for O(1) lookup
        if (profile.reverseMapping && profile.reverseMapping[mappedId] !== undefined) {
          return profile.reverseMapping[mappedId];
        }
        
        // Fallback to linear search if reverse mapping not available
        for (const [original, mapped] of Object.entries(profile.packageMappings)) {
          if (mapped === mappedId) {
            return parseInt(original, 10);
          }
        }
        
        return null;
      },

      mapPackageIds: (packageIds: number[]): number[] => {
        const getMappedId = get().getMappedPackageId;
        return packageIds.map(id => getMappedId(id));
      },

      getActiveProfile: (): Profile | null => {
        const state = get();
        
        if (!state.activeProfileId) {
          return null;
        }
        
        return state.profiles.get(state.activeProfileId) || null;
      },

      hasProfile: (profileId: string): boolean => {
        return get().profiles.has(profileId);
      },

      getProfileById: (profileId: string): Profile | null => {
        return get().profiles.get(profileId) || null;
      },

      getAllProfiles: (): Profile[] => {
        return Array.from(get().profiles.values());
      },

      setOriginalCartSnapshot: (items: CartItem[]) => {
        set({ originalCartSnapshot: [...items] });
        logger.debug(`Cart snapshot saved with ${items.length} items`);
      },

      clearOriginalCartSnapshot: () => {
        set({ originalCartSnapshot: undefined });
        logger.debug('Cart snapshot cleared');
      },

      addMappingEvent: (event: Omit<MappingEvent, 'timestamp'>) => {
        set(state => ({
          mappingHistory: [
            ...state.mappingHistory,
            {
              ...event,
              timestamp: Date.now(),
            },
          ].slice(-50), // Keep last 50 events
        }));
      },

      clearHistory: () => {
        set({ mappingHistory: [] });
      },

      reset: () => {
        set(initialState);
        logger.info('ProfileStore reset to initial state');
      },
    })),
    {
      name: 'next-profile-store',
      storage: {
        getItem: (name) => {
          const str = profileStorageManager.get(name);
          if (!str) return null;
          
          // Convert Map back from array
          const stored = JSON.parse(str as string);
          if (stored.state?.profiles) {
            stored.state.profiles = new Map(stored.state.profiles);
          }
          
          return stored;
        },
        setItem: (name, value) => {
          // Convert Map to array for serialization
          const toStore = { ...value };
          if (toStore.state?.profiles instanceof Map) {
            (toStore.state as any).profiles = Array.from(toStore.state.profiles.entries());
          }
          
          profileStorageManager.set(name, JSON.stringify(toStore));
        },
        removeItem: (name) => {
          profileStorageManager.remove(name);
        },
      },
    }
  )
);